import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdventuresPage from "../AdventuresPage";
import type { Adventure } from "../../types";

const adventures: Adventure[] = [
  {
    id: "a1",
    name: "Beach Cabanna",
    costPerHead: 500,
    currency: "INR",
    image: "https://example.com/a1.jpeg",
    duration: 3,
    category: "Beaches",
  },
  {
    id: "a2",
    name: "Mount Sleephod",
    costPerHead: 900,
    currency: "INR",
    image: "https://example.com/a2.jpeg",
    duration: 15,
    category: "Hillside",
  },
];

function mockAdventures() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(adventures), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function renderPage(route = "/adventures?city=bengaluru") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/adventures" element={<AdventuresPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("<AdventuresPage />", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("requests adventures for the city in the query string", async () => {
    const fetchSpy = mockAdventures();
    renderPage();

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("?city=bengaluru"),
      undefined
    );
    // The city id is title-cased for display.
    expect(screen.getByText("Bengaluru")).toBeInTheDocument();
  });

  it("renders a card per adventure", async () => {
    mockAdventures();
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Beach Cabanna" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mount Sleephod" })
    ).toBeInTheDocument();
  });

  it("applies a duration filter and persists it to localStorage", async () => {
    mockAdventures();
    renderPage();

    await screen.findByRole("heading", { name: "Beach Cabanna" });

    await userEvent.selectOptions(
      screen.getByLabelText("Filter by duration"),
      "0-2"
    );

    // Neither adventure is under 2 hours.
    expect(
      screen.queryByRole("heading", { name: "Beach Cabanna" })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/No adventures match these filters/)).toBeInTheDocument();

    expect(JSON.parse(localStorage.getItem("filters")!)).toEqual({
      duration: "0-2",
      category: [],
    });
  });

  it("restores filters from localStorage on mount", async () => {
    localStorage.setItem(
      "filters",
      JSON.stringify({ duration: "", category: ["Hillside"] })
    );
    mockAdventures();
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Mount Sleephod" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Beach Cabanna" })
    ).not.toBeInTheDocument();
  });

  it("shows an error when adventures cannot be loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    renderPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

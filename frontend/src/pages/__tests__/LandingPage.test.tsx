import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "../LandingPage";
import { renderWithRouter } from "../../test/render";
import mockCitiesData from "../../test/fixtures/cities.json";

function mockCities() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(mockCitiesData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}

describe("<LandingPage />", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a tile per city once loaded", async () => {
    mockCities();
    renderWithRouter(<LandingPage />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: "Bengaluru" })
    ).toBeInTheDocument();
    expect(document.getElementById("data")!.children).toHaveLength(
      mockCitiesData.length
    );
  });

  it("filters the tiles as the visitor searches", async () => {
    mockCities();
    renderWithRouter(<LandingPage />);

    await screen.findByRole("heading", { name: "Bengaluru" });

    await userEvent.type(screen.getByLabelText("Search a city"), "beng");

    expect(
      screen.getByRole("heading", { name: "Bengaluru" })
    ).toBeInTheDocument();
    expect(document.getElementById("data")!.children).toHaveLength(1);
  });

  it("tells the visitor when nothing matches the search", async () => {
    mockCities();
    renderWithRouter(<LandingPage />);

    await screen.findByRole("heading", { name: "Bengaluru" });
    await userEvent.type(screen.getByLabelText("Search a city"), "zzzz");

    expect(screen.getByText(/No cities match/)).toBeInTheDocument();
  });

  it("shows an error when cities cannot be loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    renderWithRouter(<LandingPage />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

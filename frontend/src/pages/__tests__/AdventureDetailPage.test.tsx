import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdventureDetailPage from "../AdventureDetailPage";
import type { AdventureDetail } from "../../types";

const adventure: AdventureDetail = {
  id: "6298356896",
  name: "Grand Dinyardlodge",
  subtitle: "This is a mind-blowing adventure!",
  images: [
    "https://example.com/one.jpeg",
    "https://example.com/two.jpeg",
    "https://example.com/three.jpeg",
  ],
  content: "A random paragraph about the experience.",
  available: true,
  reserved: false,
  costPerHead: 1000,
};

function mockDetail(overrides: Partial<AdventureDetail> = {}) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ ...adventure, ...overrides }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/adventures/6298356896"]}>
      <Routes>
        <Route
          path="/adventures/:adventureId"
          element={<AdventureDetailPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("<AdventureDetailPage />", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state, then the adventure details", async () => {
    mockDetail();
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: adventure.name })
    ).toBeInTheDocument();
    expect(screen.getByText(adventure.subtitle)).toBeInTheDocument();
    expect(screen.getByText(adventure.content)).toBeInTheDocument();
  });

  it("renders one carousel slide per image, with the first one active", async () => {
    mockDetail();
    const { container } = renderPage();

    await screen.findByRole("heading", { name: adventure.name });

    expect(container.querySelectorAll(".carousel-item")).toHaveLength(
      adventure.images.length
    );
    expect(container.querySelectorAll(".carousel-item.active")).toHaveLength(1);
    expect(container.querySelectorAll(".carousel")).toHaveLength(1);
  });

  it("shows the reservation form when the adventure is available", async () => {
    mockDetail({ available: true });
    renderPage();

    await screen.findByRole("heading", { name: adventure.name });

    expect(screen.getByRole("button", { name: "Reserve" })).toBeInTheDocument();
    expect(screen.queryByText("Sold Out!")).not.toBeInTheDocument();
  });

  it("shows the sold-out panel when the adventure is unavailable", async () => {
    mockDetail({ available: false });
    renderPage();

    await screen.findByRole("heading", { name: adventure.name });

    expect(screen.getByText("Sold Out!")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reserve" })
    ).not.toBeInTheDocument();
  });

  it("shows the reserved banner only when already reserved", async () => {
    mockDetail({ reserved: true });
    const { container } = renderPage();

    await screen.findByRole("heading", { name: adventure.name });
    expect(container.querySelector("#reserved-banner")).toBeInTheDocument();
  });

  it("hides the reserved banner when not reserved", async () => {
    mockDetail({ reserved: false });
    const { container } = renderPage();

    await screen.findByRole("heading", { name: adventure.name });
    expect(container.querySelector("#reserved-banner")).not.toBeInTheDocument();
  });

  it("shows an error when the adventure cannot be loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    renderPage();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
    expect(screen.getByRole("link", { name: "Back to all cities" })).toBeInTheDocument();
  });
});

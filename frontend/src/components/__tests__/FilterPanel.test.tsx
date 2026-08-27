import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilterPanel from "../FilterPanel";
import { renderWithRouter } from "../../test/render";
import type { AdventureFacets, AdventureQuery } from "../../types";

const baseQuery: AdventureQuery = {
  city: "goa",
  q: "",
  category: [],
  sort: "recommended",
  page: 1,
};

const facets: AdventureFacets = {
  categories: [
    { value: "Beaches", count: 1 },
    { value: "Cycling", count: 4 },
    { value: "Hillside", count: 0 },
    { value: "Party", count: 2 },
  ],
  priceRange: { min: 800, max: 4700 },
};

function setup(query: Partial<AdventureQuery> = {}) {
  const update = vi.fn();
  const clearFilters = vi.fn();

  renderWithRouter(
    <FilterPanel
      query={{ ...baseQuery, ...query }}
      facets={facets}
      update={update}
      activeFilterCount={0}
      clearFilters={clearFilters}
    />
  );

  return { update, clearFilters };
}

describe("category filters", () => {
  it("shows a facet count beside each category", () => {
    setup();

    // The desktop sidebar and the mobile sheet trigger both render, but only
    // the sidebar's controls are in the tree until the sheet opens.
    expect(screen.getByText("Cycling")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("adds a category when its checkbox is ticked", async () => {
    const { update } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: "Cycling" }));

    expect(update).toHaveBeenCalledWith({ category: ["Cycling"] });
  });

  it("ticks via the label as well as the box", async () => {
    const { update } = setup();
    const user = userEvent.setup();

    // Regression: the checkbox used to be nested inside the label, so a click
    // was delivered twice and cancelled itself out.
    await user.click(screen.getByText("Cycling"));

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ category: ["Cycling"] });
  });

  it("removes a category that is already selected", async () => {
    const { update } = setup({ category: ["Cycling", "Party"] });
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: "Cycling" }));

    expect(update).toHaveBeenCalledWith({ category: ["Party"] });
  });

  it("reflects the selected categories as checked", () => {
    setup({ category: ["Party"] });

    expect(screen.getByRole("checkbox", { name: "Party" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Cycling" })).not.toBeChecked();
  });
});

describe("duration filters", () => {
  it("applies a band as a min/max pair", async () => {
    const { update } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "2 to 6 hours" }));

    expect(update).toHaveBeenCalledWith({ durationMin: 2, durationMax: 6 });
  });

  it("clears the band when the active one is clicked again", async () => {
    const { update } = setup({ durationMin: 2, durationMax: 6 });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "2 to 6 hours" }));

    expect(update).toHaveBeenCalledWith({
      durationMin: undefined,
      durationMax: undefined,
    });
  });

  it("marks the active band as pressed", () => {
    setup({ durationMin: 6, durationMax: 12 });

    expect(screen.getByRole("button", { name: "6 to 12 hours" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});

describe("price slider", () => {
  it("takes its bounds from the facets", () => {
    setup();

    expect(screen.getByText("₹800")).toBeInTheDocument();
    expect(screen.getByText("₹4,700")).toBeInTheDocument();
  });

  it("renders two labelled thumbs", () => {
    setup();

    expect(screen.getByRole("slider", { name: "Minimum price" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Maximum price" })).toBeInTheDocument();
  });

  it("stays settled when re-rendered with equal values", () => {
    // Regression: the slider's controlled value was rebuilt on every render, so
    // Radix re-synchronised endlessly and the page stopped responding.
    const { update } = setup({ priceMin: 1000, priceMax: 3000 });

    expect(screen.getByText("₹1,000")).toBeInTheDocument();
    expect(screen.getByText("₹3,000")).toBeInTheDocument();
    // Rendering alone must not write anything back to the URL.
    expect(update).not.toHaveBeenCalled();
  });
});

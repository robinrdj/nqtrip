import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAdventureQuery } from "../useAdventureQuery";

function wrapperFor(route: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
}

/** Exposes the hook and the resulting URL together, since the URL is the state. */
function renderQuery(route = "/adventures") {
  return renderHook(
    () => ({ ...useAdventureQuery(), location: useLocation() }),
    { wrapper: wrapperFor(route) }
  );
}

describe("reading from the URL", () => {
  it("parses every filter", () => {
    const { result } = renderQuery(
      "/adventures?city=goa&q=kayak&category=Beaches,Party&durationMin=2&durationMax=6&priceMin=500&priceMax=3000&sort=price-asc&page=3"
    );

    expect(result.current.query).toEqual({
      city: "goa",
      q: "kayak",
      category: ["Beaches", "Party"],
      durationMin: 2,
      durationMax: 6,
      priceMin: 500,
      priceMax: 3000,
      sort: "price-asc",
      page: 3,
    });
  });

  it("falls back to defaults when the URL is bare", () => {
    const { result } = renderQuery("/adventures");

    expect(result.current.query.sort).toBe("recommended");
    expect(result.current.query.page).toBe(1);
    expect(result.current.query.category).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("drops categories that are not real, so a hand-edited URL cannot 400", () => {
    const { result } = renderQuery("/adventures?category=Beaches,Skydiving");
    expect(result.current.query.category).toEqual(["Beaches"]);
  });

  it("ignores a sort value it does not recognise", () => {
    const { result } = renderQuery("/adventures?sort=cheapest-ish");
    expect(result.current.query.sort).toBe("recommended");
  });

  it("ignores non-numeric numbers", () => {
    const { result } = renderQuery("/adventures?priceMin=lots&page=abc");
    expect(result.current.query.priceMin).toBeUndefined();
    expect(result.current.query.page).toBe(1);
  });
});

describe("writing to the URL", () => {
  it("puts a filter change in the query string", () => {
    const { result } = renderQuery("/adventures?city=goa");

    act(() => result.current.update({ category: ["Party"] }));

    expect(result.current.location.search).toContain("category=Party");
    expect(result.current.location.search).toContain("city=goa");
  });

  it("resets to page 1 when a filter changes", () => {
    const { result } = renderQuery("/adventures?city=goa&page=4");

    act(() => result.current.update({ category: ["Party"] }));

    // Staying on page 4 of a narrower result set would strand the visitor on
    // an empty page.
    expect(result.current.query.page).toBe(1);
    expect(result.current.location.search).not.toContain("page=");
  });

  it("keeps the page when paging is what changed", () => {
    const { result } = renderQuery("/adventures?city=goa");

    act(() => result.current.update({ page: 2 }));

    expect(result.current.query.page).toBe(2);
  });

  it("omits defaults so the URL stays short and shareable", () => {
    const { result } = renderQuery("/adventures?city=goa&sort=price-asc&page=2");

    act(() => result.current.update({ sort: "recommended" }));

    expect(result.current.location.search).toBe("?city=goa");
  });

  it("clears filters but keeps the city", () => {
    const { result } = renderQuery(
      "/adventures?city=goa&category=Party&q=kayak&priceMin=500"
    );

    act(() => result.current.clearFilters());

    expect(result.current.location.search).toBe("?city=goa");
    expect(result.current.query.city).toBe("goa");
    expect(result.current.hasActiveFilters).toBe(false);
  });
});

describe("active filter count", () => {
  it("counts each category separately and each range once", () => {
    const { result } = renderQuery(
      "/adventures?category=Beaches,Party&durationMin=2&durationMax=6&q=kayak"
    );

    // Two categories + one duration range + one search term.
    expect(result.current.activeFilterCount).toBe(4);
  });

  it("does not count the city as a filter", () => {
    const { result } = renderQuery("/adventures?city=goa");
    expect(result.current.activeFilterCount).toBe(0);
  });
});

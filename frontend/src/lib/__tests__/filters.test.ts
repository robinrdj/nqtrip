import { describe, expect, it } from "vitest";
import { filterByCategory, filterByDuration, filterFunction } from "../filters";
import type { Adventure } from "../../types";

function adventure(overrides: Partial<Adventure>): Adventure {
  return {
    id: "3091807927",
    name: "East Phisphoe",
    costPerHead: 500,
    currency: "INR",
    image: "https://example.com/photo.jpeg",
    duration: 10,
    category: "Beaches",
    ...overrides,
  };
}

describe("filterByDuration()", () => {
  it("keeps adventures inside the range, inclusive of both bounds", () => {
    const inRange = adventure({ id: "a", duration: 10 });
    const outOfRange = adventure({ id: "b", duration: 15 });

    expect(filterByDuration([inRange, outOfRange], 6, 10)).toEqual([inRange]);
  });

  it("accepts string bounds, as they arrive from the select element", () => {
    const short = adventure({ id: "a", duration: 3 });
    const long = adventure({ id: "b", duration: 20 });

    // "6" and "10" must compare numerically, not lexicographically.
    expect(filterByDuration([short, long], "6", "10")).toEqual([]);
  });
});

describe("filterByCategory()", () => {
  it("filters by a single category", () => {
    const party = adventure({ id: "a", category: "Party" });
    const hillside = adventure({ id: "b", category: "Hillside" });

    expect(filterByCategory([party, hillside], ["Party"])).toEqual([party]);
  });

  it("filters by multiple categories", () => {
    const party = adventure({ id: "a", category: "Party" });
    const hillside = adventure({ id: "b", category: "Hillside" });
    const cycling = adventure({ id: "c", category: "Cycling" });

    expect(
      filterByCategory([party, hillside, cycling], ["Party", "Cycling"])
    ).toEqual([party, cycling]);
  });
});

describe("filterFunction()", () => {
  const beachesShort = adventure({
    id: "a",
    duration: 3,
    category: "Beaches",
  });
  const beachesLong = adventure({ id: "b", duration: 15, category: "Beaches" });
  const partyLong = adventure({ id: "c", duration: 15, category: "Party" });
  const all = [beachesShort, beachesLong, partyLong];

  it("returns the full list when no filters are set", () => {
    expect(filterFunction(all, { duration: "", category: [] })).toEqual(all);
  });

  it("filters by duration only", () => {
    expect(filterFunction(all, { duration: "12-20", category: [] })).toEqual([
      beachesLong,
      partyLong,
    ]);
  });

  it("filters by category only", () => {
    expect(
      filterFunction(all, { duration: "", category: ["Beaches"] })
    ).toEqual([beachesShort, beachesLong]);
  });

  it("filters by duration and category together", () => {
    expect(
      filterFunction(all, {
        duration: "12-20",
        category: ["Beaches", "Cycling"],
      })
    ).toEqual([beachesLong]);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getFiltersFromLocalStorage,
  readStoredFilters,
  saveFiltersToLocalStorage,
} from "../storage";

describe("filter persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("saves filters to localStorage as a string", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const filters = { duration: "12-20", category: ["Beaches", "Cycling"] };

    expect(saveFiltersToLocalStorage(filters)).toBe(true);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem).toHaveBeenCalledWith("filters", JSON.stringify(filters));
  });

  it("reads filters back as an object", () => {
    const filters = { duration: "12-20", category: ["Beaches", "Cycling"] };
    saveFiltersToLocalStorage(filters);

    const output = getFiltersFromLocalStorage();

    expect(typeof output).not.toEqual("string");
    expect(output).toEqual(filters);
  });

  it("returns null when nothing has been stored", () => {
    expect(getFiltersFromLocalStorage()).toBeNull();
  });

  it("returns null rather than throwing on malformed JSON", () => {
    localStorage.setItem("filters", "{not json");
    expect(getFiltersFromLocalStorage()).toBeNull();
  });

  it("repairs a stored value that is missing fields", () => {
    localStorage.setItem("filters", JSON.stringify({ duration: "2-6" }));
    expect(getFiltersFromLocalStorage()).toEqual({
      duration: "2-6",
      category: [],
    });
  });

  it("falls back to empty filters when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });

    expect(readStoredFilters()).toEqual({ duration: "", category: [] });
  });

  it("reports failure instead of throwing when a write is rejected", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(saveFiltersToLocalStorage({ duration: "", category: [] })).toBe(
      false
    );
  });
});

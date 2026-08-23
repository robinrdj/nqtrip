import { describe, expect, it } from "vitest";
import {
  addDays,
  formatAdventureDate,
  formatBookingTime,
  formatCurrency,
  toDateInputValue,
} from "../format";

// These run under TZ=Asia/Kolkata (set by the npm test script).
describe("formatAdventureDate()", () => {
  it("renders the adventure date as D/M/YYYY", () => {
    expect(formatAdventureDate("2020-11-05")).toBe("5/11/2020");
    expect(formatAdventureDate("2021-01-01")).toBe("1/1/2021");
  });
});

describe("formatBookingTime()", () => {
  it("renders the booking timestamp in long form with a 12-hour clock", () => {
    expect(
      formatBookingTime("Wed Nov 04 2020 21:32:31 GMT+0530 (India Standard Time)")
    ).toBe("4 November 2020, 9:32:31 pm");

    expect(
      formatBookingTime("Wed Nov 04 2020 20:30:59 GMT+0530 (India Standard Time)")
    ).toBe("4 November 2020, 8:30:59 pm");
  });

  it("pads minutes and renders midnight as 12 am", () => {
    expect(
      formatBookingTime("Wed Nov 04 2020 00:05:01 GMT+0530 (India Standard Time)")
    ).toBe("4 November 2020, 12:05:01 am");
  });
});

describe("formatCurrency()", () => {
  it("prefixes the amount with a rupee sign", () => {
    expect(formatCurrency(1234)).toBe("\u20B9 1234");
  });
});

describe("date input helpers", () => {
  it("formats a date as yyyy-mm-dd with zero padding", () => {
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateInputValue(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("adds days without mutating the original date", () => {
    const original = new Date(2026, 7, 23);
    const later = addDays(original, 1);

    expect(toDateInputValue(later)).toBe("2026-08-24");
    expect(toDateInputValue(original)).toBe("2026-08-23");
  });

  it("rolls over month and year boundaries", () => {
    expect(toDateInputValue(addDays(new Date(2026, 11, 31), 1))).toBe(
      "2027-01-01"
    );
  });
});

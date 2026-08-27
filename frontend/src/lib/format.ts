/**
 * Formatting helpers.
 *
 * Everything money- and date-shaped goes through here so the app is consistent,
 * and so the Indian digit grouping (1,20,000 rather than 120,000) is applied in
 * one place instead of being approximated per component.
 */

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DAY_MONTH_YEAR_LONG = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatCurrency(amount: number): string {
  return CURRENCY.format(amount);
}

/** e.g. "15 Jan 2027" */
export function formatDate(value: string | Date): string {
  return DAY_MONTH_YEAR.format(new Date(value));
}

/** e.g. "Friday, 15 January 2027" */
export function formatDateLong(value: string | Date): string {
  return DAY_MONTH_YEAR_LONG.format(new Date(value));
}

/**
 * Coarse relative time: "today", "in 3 days", "2 months ago".
 *
 * Deliberately rounded to whole days — a booking is a calendar day, so hours
 * and minutes would imply a precision the value does not carry.
 */
export function formatRelativeDay(value: string | Date): string {
  const target = new Date(value);
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const days = Math.round(
    (startOfDay(target) - startOfDay(new Date())) / 86_400_000
  );

  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(days) < 30) return formatter.format(days, "day");
  if (Math.abs(days) < 365) return formatter.format(Math.round(days / 30), "month");
  return formatter.format(Math.round(days / 365), "year");
}

/** Returns a new date `days` after `from`, leaving `from` untouched. */
export function addDays(from: Date, days: number): Date {
  const result = new Date(from);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formats a date as yyyy-mm-dd, the value format an <input type="date"> uses.
 *
 * Built from the local calendar fields rather than toISOString(), which would
 * convert to UTC first and hand back the previous day for anywhere east of
 * Greenwich.
 */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

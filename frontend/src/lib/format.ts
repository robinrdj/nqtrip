const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatCurrency(amount: number): string {
  return `\u20B9 ${amount}`;
}

/** Adventure date in en-IN form, e.g. "4/11/2020". */
export function formatAdventureDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN");
}

/** Booking timestamp, e.g. "4 November 2020, 9:32:31 pm". */
export function formatBookingTime(value: string): string {
  const time = new Date(value);

  const hours24 = time.getHours();
  const hours = hours24 % 12 || 12;
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "pm" : "am";

  const day = time.getDate();
  const month = MONTH_NAMES[time.getMonth()];
  const year = time.getFullYear();

  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${meridiem}`;
}

/** Returns a new date `days` after `from`, leaving `from` untouched. */
export function addDays(from: Date, days: number): Date {
  const result = new Date(from);
  result.setDate(result.getDate() + days);
  return result;
}

/** Formats a date as yyyy-mm-dd, the value format an <input type="date"> uses. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

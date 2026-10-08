import { expect, type Page } from "@playwright/test";

/** Where the setup project leaves the signed-in demo session. */
export const DEMO_STATE = "e2e/.auth/demo.json";

export const DEMO = { email: "demo@qtrip.dev", password: "Demo1234" };

/**
 * Opens a city's first bookable adventure and returns its URL.
 *
 * Reads the list from the API rather than hard-coding an id, so the suite
 * keeps working if the seed data changes - and skips anything sold out, since
 * a reused dev server keeps the bookings of earlier runs.
 */
export async function openBookableAdventure(page: Page, city = "goa"): Promise<string> {
  const response = await page.request.get(`/api/v1/adventures?city=${city}&limit=60`);
  expect(response.ok()).toBeTruthy();

  const { items } = (await response.json()) as {
    items: { id: string; name: string; seatsLeft: number }[];
  };
  const adventure = items.find((a) => a.seatsLeft >= 2);
  if (!adventure) throw new Error(`No adventure in ${city} has two seats left`);

  const url = `/adventures/${adventure.id}`;
  await page.goto(url);
  await expect(page.getByRole("heading", { level: 1, name: adventure.name })).toBeVisible();
  return url;
}

/**
 * Seats left, as the detail page currently shows them. Read from an attribute
 * on the stable wrapper, because while the number animates the old and new
 * values are both in the DOM.
 */
export async function seatsLeft(page: Page): Promise<number> {
  const value = await page.getByTestId("seats").getAttribute("data-seats-left");
  if (value === null) throw new Error("No seat count on the page");
  return Number(value);
}

/** A date a few days out, as the booking form's date input expects it. */
export function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { DEMO_STATE, daysFromToday, openBookableAdventure, seatsLeft } from "./fixtures";

test.use({ storageState: DEMO_STATE });

test("book, download the ticket, find it in My trips, then cancel", async ({ page }) => {
  await openBookableAdventure(page);
  const before = await seatsLeft(page);

  // --- Book -------------------------------------------------------------
  await page.getByLabel("Date").fill(daysFromToday(5));
  await page.getByLabel("How many people").fill("2");
  await page.getByRole("button", { name: "Reserve your spot" }).click();

  await expect(page.getByRole("heading", { name: "You are booked" })).toBeVisible();
  // The seat count on the page reflects the booking without a reload.
  await expect.poll(() => seatsLeft(page)).toBe(before - 2);

  // --- Ticket -----------------------------------------------------------
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download ticket" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^qtrip-ticket-QT-[0-9A-F]{8}\.pdf$/);
  const pdf = await readFile((await download.path())!);
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  const reference = /QT-[0-9A-F]{8}/.exec(download.suggestedFilename())![0];

  // --- My trips ---------------------------------------------------------
  await page.getByRole("link", { name: "View my trips" }).click();
  const trip = page.locator("article").filter({ hasText: reference });
  await expect(trip).toBeVisible();
  await expect(trip.getByText("Confirmed")).toBeVisible();

  // --- Cancel -----------------------------------------------------------
  await trip.getByRole("button", { name: "Cancel" }).click();
  await expect(trip.getByText("Cancelled", { exact: true })).toBeVisible();
  // A cancelled booking has no ticket.
  await expect(trip.getByRole("button", { name: "Ticket" })).toHaveCount(0);
});

test("the booking form rejects a past date with its own message", async ({ page }) => {
  await openBookableAdventure(page);

  await page.getByLabel("Date").fill(daysFromToday(-2));
  await page.getByRole("button", { name: "Reserve your spot" }).click();

  await expect(page.getByText(/past/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "You are booked" })).toHaveCount(0);
});

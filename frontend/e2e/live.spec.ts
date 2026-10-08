import { expect, test } from "@playwright/test";
import { DEMO_STATE, daysFromToday, openBookableAdventure, seatsLeft } from "./fixtures";

/**
 * Two separate browsers on the same adventure. One books; the other must see
 * the seat count drop and the viewer count change, without reloading.
 */
test("a booking in one browser updates the other in real time", async ({ browser }) => {
  const watcherContext = await browser.newContext();
  const bookerContext = await browser.newContext({ storageState: DEMO_STATE });

  try {
    const watcher = await watcherContext.newPage();
    const booker = await bookerContext.newPage();

    const url = await openBookableAdventure(watcher);
    await expect(watcher.getByText("Live", { exact: true })).toBeVisible();

    await booker.goto(url);
    // The watcher learns someone else has the page open.
    await expect(watcher.getByText("1 other person viewing now")).toBeVisible();

    const before = await seatsLeft(watcher);

    await booker.getByLabel("Date").fill(daysFromToday(7));
    await booker.getByLabel("How many people").fill("1");
    await booker.getByRole("button", { name: "Reserve your spot" }).click();
    await expect(booker.getByRole("heading", { name: "You are booked" })).toBeVisible();

    // Pushed over the event stream - the watcher never reloaded.
    await expect.poll(() => seatsLeft(watcher)).toBe(before - 1);

    await booker.close();
    /*
      Chromium pauses requestAnimationFrame in a background page, and the
      watcher went to the background when the booker's page opened. The count
      does update there, but its fade-out animation would not finish, leaving
      the outgoing text in the DOM. A person looking at the tab has it in front.
    */
    await watcher.bringToFront();
    await expect(watcher.getByText(/viewing now/)).toHaveCount(0);
  } finally {
    await watcherContext.close();
    await bookerContext.close();
  }
});

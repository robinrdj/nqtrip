import { expect, test } from "@playwright/test";

test.describe("browsing, signed out", () => {
  test("from a city tile to an adventure", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Goa/ }).first().click();

    await expect(page).toHaveURL(/\/adventures\?city=goa/);
    await expect(page.getByRole("heading", { level: 1, name: "Goa" })).toBeVisible();

    const firstCard = page.locator("article").first();
    const name = await firstCard.getByRole("heading").textContent();
    await firstCard.getByRole("link").first().click();

    await expect(page.getByRole("heading", { level: 1, name: name! })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to book" })).toBeVisible();
  });

  test("filters are kept in the URL and survive a reload", async ({ page }) => {
    await page.goto("/adventures?city=goa");
    await page.getByLabel("Sort by").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);

    await page.reload();
    await expect(page.getByLabel("Sort by")).toHaveValue("price-asc");
  });

  test("the map shows a price pin per adventure, and a pin leads to its page", async ({ page }) => {
    await page.goto("/adventures?city=goa");
    const countText = await page.getByText(/adventures? to choose from/).textContent();
    const total = Number(/\d+/.exec(countText ?? "")?.[0]);

    await page.getByRole("button", { name: "Map" }).click();
    await expect(page).toHaveURL(/view=map/);

    const pins = page.locator(".leaflet-marker-icon");
    await expect(pins).toHaveCount(total);
    // Tiles loaded from OpenStreetMap - the provider that needs no key. (A
    // keyed provider can answer with "API key required" images, which would
    // still count as loaded, so the source is what is asserted.)
    const tile = page.locator(".leaflet-tile-loaded").first();
    await expect(tile).toBeVisible();
    await expect(tile).toHaveAttribute("src", /^https:\/\/tile\.openstreetmap\.org\//);

    // The marker element itself is zero-sized (the pill is drawn by its child
    // span), so Playwright would not consider it visible. Click the pill, as a
    // person would.
    await pins.first().locator("span").click();
    const popupLink = page.locator(".leaflet-popup-content a");
    await expect(popupLink).toBeVisible();
    await popupLink.click();
    await expect(page).toHaveURL(/\/adventures\/[^?]+$/);
  });

  test("the detail page shows where the adventure is", async ({ page }) => {
    await page.goto("/adventures?city=goa");
    await page.locator("article").first().getByRole("link").first().click();

    await expect(page.getByRole("heading", { name: "Where you will be" })).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
  });

  test("a protected page sends you to sign in and back again", async ({ page }) => {
    await page.goto("/trips");
    await expect(page).toHaveURL(/\/login\?next=%2Ftrips/);

    /*
      Layout's page transition renders the new route inside the outgoing
      page's container for its 200ms fade-out, then mounts it again for real.
      Typing too early fills the copy that is about to be discarded. Waiting
      for the network to settle (500ms quiet) outlasts the transition.
    */
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Email").fill("demo@qtrip.dev");
    await page.getByLabel("Password").fill("Demo1234");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByRole("heading", { level: 1, name: "My trips" })).toBeVisible();
  });

  test("a forged ticket code is rejected", async ({ page }) => {
    await page.goto("/tickets/64b000000000000000000000?sig=not-a-real-signature");
    await expect(page.getByRole("heading", { name: "Not a valid ticket" })).toBeVisible();
  });
});

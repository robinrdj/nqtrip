import { expect, test } from "@playwright/test";

test("a new visitor can create an account and is signed straight in", async ({ page }) => {
  // Unique per run, since a reused dev server remembers earlier accounts.
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Playwright Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Passw0rdE2E");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText(email)).toBeVisible();
});

test("the Google button stays hidden when the server has no client id", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  // The dev server runs without GOOGLE_CLIENT_ID, so the page is unchanged.
  await expect(page.getByText("or with email")).toHaveCount(0);
});

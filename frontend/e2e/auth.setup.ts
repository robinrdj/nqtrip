import { expect, test as setup } from "@playwright/test";
import { DEMO, DEMO_STATE } from "./fixtures";

setup("sign in as the demo traveller", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Password").fill(DEMO.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  // Signed in: the header swaps "Sign in" for the account menu.
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();
  await page.context().storageState({ path: DEMO_STATE });
});

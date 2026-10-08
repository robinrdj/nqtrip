import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests: the real frontend against the real API, in a real browser.
 *
 * The API runs its in-memory dev server (a fresh, seeded MongoDB per start), so
 * the suite needs no database and cannot touch real data. It lives in its own
 * repo; QTRIP_BACKEND_DIR points at it, defaulting to where it sits on the
 * development machine. CI checks it out and sets the variable.
 *
 * Locally, already-running servers are reused - so `npm run e2e` works whether
 * or not you have `npm run dev` going.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const backendDir =
  process.env.QTRIP_BACKEND_DIR ?? path.resolve(here, "../../../qtripBackend/backend");

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  // Specs share one seeded database; running them in parallel would have them
  // racing for the same seats.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: "http://127.0.0.1:8081",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Pinned so dates in assertions mean the same day on every machine.
    timezoneId: "Asia/Kolkata",
    locale: "en-IN",
  },

  projects: [
    // Signs the demo account in once and saves the cookies, so each spec does
    // not spend a login (and a slot in the auth rate limit) getting started.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],

  webServer: [
    {
      command: "npx tsx src/dev-server.ts",
      cwd: backendDir,
      // One IP making hundreds of requests a minute is the suite, not an
      // attack. (The API ignores this outside development.)
      env: { DISABLE_RATE_LIMIT: "true" },
      url: "http://127.0.0.1:8082/health",
      reuseExistingServer: !isCI,
      // The first run downloads a mongod binary.
      timeout: 180_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      // An explicit IPv4 host: on Windows, Vite's default "localhost" can bind
      // only ::1, and the readiness check on 127.0.0.1 would never succeed.
      command: "npm run dev -- --host 127.0.0.1",
      cwd: here,
      url: "http://127.0.0.1:8081",
      reuseExistingServer: !isCI,
      timeout: 60_000,
      env: { PLAYWRIGHT: "1" },
    },
  ],
});

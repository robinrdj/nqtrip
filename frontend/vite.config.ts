/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8081,
    // Fail loudly if 8081 is taken instead of silently moving to the next free
    // port. Without this, starting the frontend twice puts the second copy on
    // 8082 — the API's port — and every /api call then loops back into the
    // frontend and returns HTML instead of data.
    strictPort: true,
    // Not when a machine is driving: CI and the Playwright suite start this
    // server themselves and have no use for a stray browser window.
    open: !process.env.CI && !process.env.PLAYWRIGHT,
    // Lets the browser talk to the API on the same origin in development, so
    // the auth cookies are first-party and no CORS preflight is involved.
    proxy: {
      // 127.0.0.1 rather than localhost: on Windows localhost resolves to ::1
      // first, so anything squatting on IPv6 port 8082 would shadow the API.
      "/api": { target: "http://127.0.0.1:8082", changeOrigin: true },
    },
  },
  preview: { port: 8081, strictPort: true },
  test: {
    globals: true,
    environment: "jsdom",
    // e2e/ holds Playwright specs, which run in a real browser, not jsdom.
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});

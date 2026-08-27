/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8081,
    open: true,
    // Lets the browser talk to the API on the same origin in development, so
    // the auth cookies are first-party and no CORS preflight is involved.
    proxy: {
      "/api": { target: "http://localhost:8082", changeOrigin: true },
    },
  },
  preview: { port: 8081 },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});

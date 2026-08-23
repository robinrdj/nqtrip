import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom has no layout engine, so scrollTo throws "Not implemented" and floods
// the output. The app calls it on every route change.
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

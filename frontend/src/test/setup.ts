import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom has no layout engine, so scrollTo throws "Not implemented" and floods
// the output. The app calls it on every route change.
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

// ThemeProvider reads the OS colour-scheme preference on mount, and Radix
// primitives query media too. jsdom ships no matchMedia at all.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Radix uses these for positioning and dismiss behaviour; jsdom implements
// neither, and their absence throws rather than degrading.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

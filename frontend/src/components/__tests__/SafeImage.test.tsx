import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SafeImage from "../SafeImage";
import { GRID_IMAGE } from "../../lib/images";

describe("<SafeImage />", () => {
  it("renders the image when a usable src is given", () => {
    render(<SafeImage src="https://example.com/a.jpg" alt="A city" sizing={GRID_IMAGE} />);

    expect(screen.getByRole("img", { name: "A city" })).toHaveAttribute(
      "src",
      "https://example.com/a.jpg"
    );
  });

  it("renders a labelled placeholder when src is null", () => {
    render(<SafeImage src={null} alt="A city" sizing={GRID_IMAGE} />);

    const fallback = screen.getByRole("img", { name: "A city" });
    expect(fallback.tagName).not.toBe("IMG");
    expect(fallback.querySelector(".image-fallback")).toBeInTheDocument();
  });

  it("renders a placeholder when src is an empty string", () => {
    render(<SafeImage src="   " alt="A city" sizing={GRID_IMAGE} />);

    expect(screen.getByRole("img", { name: "A city" }).tagName).not.toBe("IMG");
  });

  it("swaps in the placeholder when the image fails to load", () => {
    render(<SafeImage src="https://dead.example/x.jpg" alt="A city" sizing={GRID_IMAGE} />);

    const img = screen.getByRole("img", { name: "A city" });
    expect(img.tagName).toBe("IMG");

    fireEvent.error(img);

    expect(screen.getByRole("img", { name: "A city" }).tagName).not.toBe("IMG");
  });

  it("fades in an already-cached image whose onLoad fired before mount", () => {
    // jsdom never fires load events, so a complete image is the cached case.
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "complete"
    );
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 640,
    });

    try {
      render(
        <SafeImage src="https://example.com/cached.jpg" alt="A city" sizing={GRID_IMAGE} />
      );

      // Without the complete-check the image would stay at opacity 0 forever.
      expect(screen.getByRole("img", { name: "A city" })).toHaveClass("is-loaded");
    } finally {
      if (descriptor) {
        Object.defineProperty(HTMLImageElement.prototype, "complete", descriptor);
      }
    }
  });

  it("retries when the src changes after a failure", () => {
    const { rerender } = render(
      <SafeImage src="https://dead.example/x.jpg" alt="A city" sizing={GRID_IMAGE} />
    );

    fireEvent.error(screen.getByRole("img", { name: "A city" }));
    expect(screen.getByRole("img", { name: "A city" }).tagName).not.toBe("IMG");

    rerender(<SafeImage src="https://example.com/good.jpg" alt="A city" sizing={GRID_IMAGE} />);
    expect(screen.getByRole("img", { name: "A city" }).tagName).toBe("IMG");
  });
});

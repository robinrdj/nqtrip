import { describe, expect, it } from "vitest";
import { CAROUSEL_IMAGE, GRID_IMAGE, responsiveImage } from "../images";

// The size the seed data hard-codes: far larger than any box we render.
const SEED_URL =
  "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260";

describe("responsiveImage()", () => {
  it("shrinks an oversized Pexels URL to the largest size actually rendered", () => {
    const image = responsiveImage(SEED_URL, GRID_IMAGE);
    const params = new URL(image.src).searchParams;

    expect(params.get("w")).toBe("640");
    expect(params.get("h")).toBe("480");
  });

  it("drops the dpr multiplier, since widths are declared explicitly", () => {
    const image = responsiveImage(SEED_URL, GRID_IMAGE);
    expect(new URL(image.src).searchParams.get("dpr")).toBeNull();
  });

  it("offers every configured width in the srcset", () => {
    const image = responsiveImage(SEED_URL, GRID_IMAGE);

    expect(image.srcSet).toBeDefined();
    const entries = image.srcSet!.split(", ");
    expect(entries).toHaveLength(GRID_IMAGE.widths.length);

    GRID_IMAGE.widths.forEach((width) => {
      expect(image.srcSet).toContain(`${width}w`);
    });
  });

  it("keeps each srcset entry's dimensions consistent with the aspect ratio", () => {
    const image = responsiveImage(SEED_URL, CAROUSEL_IMAGE);

    image.srcSet!.split(", ").forEach((entry) => {
      const [url, descriptor] = entry.split(" ");
      const params = new URL(url).searchParams;
      const w = Number(params.get("w"));
      const h = Number(params.get("h"));

      expect(`${w}w`).toBe(descriptor);
      expect(h).toBe(Math.round(w * CAROUSEL_IMAGE.aspect));
    });
  });

  it("declares intrinsic dimensions so the box is reserved before loading", () => {
    const image = responsiveImage(SEED_URL, CAROUSEL_IMAGE);

    expect(image.width).toBe(1280);
    expect(image.height).toBe(720);
  });

  it("passes through a non-Pexels URL untouched, but still declares a box", () => {
    const other = "https://example.com/photo.jpg";
    const image = responsiveImage(other, GRID_IMAGE);

    expect(image.src).toBe(other);
    expect(image.srcSet).toBeUndefined();
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
  });

  it("does not throw on a malformed URL", () => {
    const image = responsiveImage("not a url", GRID_IMAGE);
    expect(image.src).toBe("not a url");
  });

  it("requests dramatically fewer pixels than the seed URL", () => {
    const seed = new URL(SEED_URL).searchParams;
    const seedPixels =
      Number(seed.get("w")) * Number(seed.get("h")) * Number(seed.get("dpr"));

    const image = responsiveImage(SEED_URL, GRID_IMAGE);
    const params = new URL(image.src).searchParams;
    const nowPixels = Number(params.get("w")) * Number(params.get("h"));

    expect(nowPixels).toBeLessThan(seedPixels / 5);
  });
});

/**
 * The seed data points at Pexels with hard-coded, oversized dimensions - city
 * tiles ask for 1260x750 at dpr=2 (an effective 2520px) to fill a ~300px box.
 * Pexels resizes on the fly from query params, so rewriting them to the size we
 * actually render cuts the payload dramatically.
 */

const PEXELS_HOST = "images.pexels.com";

export interface ImageSizing {
  /** Widths to offer the browser, in CSS pixels. */
  widths: number[];
  /** Height divided by width, e.g. 0.75 for 4:3. */
  aspect: number;
  /** The `sizes` attribute describing the rendered box. */
  sizes: string;
}

/** City tiles and adventure cards: a 4-up grid that collapses on smaller screens. */
export const GRID_IMAGE: ImageSizing = {
  widths: [320, 480, 640],
  aspect: 0.75,
  sizes:
    "(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33vw, 25vw",
};

/** The detail-page carousel: two thirds of the container on desktop. */
export const CAROUSEL_IMAGE: ImageSizing = {
  widths: [640, 960, 1280],
  aspect: 0.5625,
  sizes: "(max-width: 991px) 100vw, 66vw",
};

function isPexels(url: string): boolean {
  try {
    return new URL(url).hostname === PEXELS_HOST;
  } catch {
    return false;
  }
}

/** Rewrites a Pexels URL to request an exact size. */
function resize(url: string, width: number, height: number): string {
  const parsed = new URL(url);
  parsed.searchParams.set("auto", "compress");
  parsed.searchParams.set("cs", "tinysrgb");
  parsed.searchParams.set("w", String(width));
  parsed.searchParams.set("h", String(height));
  // dpr is folded into the explicit widths in the srcset, so drop it.
  parsed.searchParams.delete("dpr");
  return parsed.toString();
}

export interface ResponsiveImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  width: number;
  height: number;
}

/**
 * Builds src/srcSet/sizes plus intrinsic dimensions for an image.
 *
 * The width/height are what prevent layout shift while the image loads; they
 * describe the aspect ratio, not the rendered size.
 */
export function responsiveImage(
  url: string,
  sizing: ImageSizing
): ResponsiveImage {
  const widths = [...sizing.widths].sort((a, b) => a - b);
  const largest = widths[widths.length - 1];
  const heightFor = (w: number) => Math.round(w * sizing.aspect);

  if (!isPexels(url)) {
    // Unknown host: serve it as-is, but still declare the box.
    return { src: url, width: largest, height: heightFor(largest) };
  }

  return {
    src: resize(url, largest, heightFor(largest)),
    srcSet: widths
      .map((w) => `${resize(url, w, heightFor(w))} ${w}w`)
      .join(", "),
    sizes: sizing.sizes,
    width: largest,
    height: heightFor(largest),
  };
}

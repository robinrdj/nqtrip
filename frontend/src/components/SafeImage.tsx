import { useEffect, useRef, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { responsiveImage, type ImageSizing } from "../lib/images";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  /** Sizing profile used to request a right-sized image and reserve its box. */
  sizing: ImageSizing;
  className?: string;
  /** Set for the first meaningful image on a page so it is not deferred. */
  priority?: boolean;
}

/**
 * An <img> that reserves its space, shows a spinner while loading, and
 * degrades to a placeholder instead of a broken-image icon.
 *
 * The seed data contains null entries and hosts that no longer resolve, so
 * missing artwork is a normal case rather than a rendering glitch.
 */
export default function SafeImage({
  src,
  alt,
  sizing,
  className,
  priority = false,
}: SafeImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    "loading"
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // A new src deserves a fresh attempt.
  useEffect(() => {
    setStatus("loading");
  }, [src]);

  // A cached image finishes loading before React attaches onLoad, so the event
  // never fires and the fade-in would never run. Catch that case on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "failed");
    }
  }, [src]);

  const usable = typeof src === "string" && src.trim() !== "";
  const frameClass = ["img-frame", className].filter(Boolean).join(" ");

  if (!usable || status === "failed") {
    return (
      <span className={frameClass} role="img" aria-label={alt}>
        <span className="image-fallback">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-4.5-4.5L3 21" />
          </svg>
        </span>
      </span>
    );
  }

  const image = responsiveImage(src, sizing);

  return (
    <span className={frameClass}>
      {status === "loading" && (
        <span className="img-spinner" aria-hidden="true">
          <Spinner animation="border" variant="warning" size="sm" />
        </span>
      )}
      <img
        ref={imgRef}
        src={image.src}
        srcSet={image.srcSet}
        sizes={image.sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        className={status === "loaded" ? "is-loaded" : undefined}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
      />
    </span>
  );
}

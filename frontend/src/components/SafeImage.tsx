import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { responsiveImage, type ImageSizing } from "../lib/images";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  /** Sizing profile used to request a right-sized image and reserve its box. */
  sizing: ImageSizing;
  className?: string;
  imgClassName?: string;
  /** Set for the first meaningful image on a page so it is not deferred. */
  priority?: boolean;
}

/**
 * An <img> that reserves its space, shows a shimmer while loading, and degrades
 * to a placeholder instead of a broken-image icon.
 *
 * The seed data contains null entries and hosts that no longer resolve, so
 * missing artwork is a normal case rather than a rendering glitch.
 */
export default function SafeImage({
  src,
  alt,
  sizing,
  className,
  imgClassName,
  priority = false,
}: SafeImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");
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

  if (!usable || status === "failed") {
    return (
      <span
        className={cn(
          "grid place-items-center bg-surface-inset text-ink-muted",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="size-8" aria-hidden="true" />
      </span>
    );
  }

  const image = responsiveImage(src, sizing);

  return (
    <span className={cn("relative block overflow-hidden bg-surface-inset", className)}>
      {status === "loading" && (
        <span className="shimmer absolute inset-0 block" aria-hidden="true" />
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
        className={cn(
          "size-full object-cover transition-[opacity,filter,transform] duration-500 ease-out",
          // Blur-up: the image resolves from a soft blur rather than snapping in.
          status === "loaded" ? "opacity-100 blur-0" : "scale-105 opacity-0 blur-lg",
          imgClassName
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
      />
    </span>
  );
}

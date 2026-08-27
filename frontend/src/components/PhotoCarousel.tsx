import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "../lib/cn";
import { CAROUSEL_IMAGE } from "../lib/images";
import SafeImage from "./SafeImage";

interface PhotoCarouselProps {
  images: string[];
  alt: string;
}

export default function PhotoCarousel({ images, alt }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  // Which way the last move went, so the slide animates from the right side.
  const [direction, setDirection] = useState(0);

  const usable = images.filter((image) => typeof image === "string" && image !== "");
  const count = usable.length;

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      // Wrapping with a modulo keeps the arrows live at both ends rather than
      // dead-ending the visitor on the last photo.
      setIndex((current) => (current + delta + count) % count);
    },
    [count]
  );

  if (count === 0) {
    return (
      <SafeImage
        src={null}
        alt={alt}
        sizing={CAROUSEL_IMAGE}
        className="aspect-video w-full rounded-panel"
      />
    );
  }

  return (
    <div
      className="group relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Photos of ${alt}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
      tabIndex={0}
    >
      <div className="relative aspect-video overflow-hidden rounded-panel bg-surface-inset">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <SafeImage
              src={usable[index]}
              alt={`${alt} — photo ${index + 1} of ${count}`}
              sizing={CAROUSEL_IMAGE}
              priority={index === 0}
              className="size-full"
            />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {usable.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {usable.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={`Show photo ${i + 1}`}
              className={cn(
                "shrink-0 overflow-hidden rounded-lg border-2 transition",
                i === index ? "border-brand-600" : "border-transparent opacity-65 hover:opacity-100"
              )}
            >
              <SafeImage
                src={image}
                alt=""
                sizing={CAROUSEL_IMAGE}
                className="h-16 w-24"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

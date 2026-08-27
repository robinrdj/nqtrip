import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/cn";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
  /** Hides the numeric average, leaving just the stars. */
  starsOnly?: boolean;
}

/**
 * Read-only star rating.
 *
 * Partial stars are drawn by clipping a filled row over an empty one, so 4.3
 * looks like 4.3 rather than being rounded to a whole star.
 */
export function Rating({
  value,
  count,
  size = "sm",
  className,
  starsOnly = false,
}: RatingProps) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  const label =
    count === 0 || count === undefined
      ? `Rated ${value.toFixed(1)} out of 5`
      : `Rated ${value.toFixed(1)} out of 5 from ${count} ${count === 1 ? "review" : "reviews"}`;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={label}
    >
      <div className="relative inline-flex" aria-hidden="true">
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(starSize, "text-line-strong")} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className={cn(starSize, "shrink-0 fill-amber-400 text-amber-400")}
            />
          ))}
        </div>
      </div>

      {!starsOnly && (
        <span className="text-xs font-medium text-ink-soft tabular-nums">
          {value > 0 ? value.toFixed(1) : "New"}
          {count !== undefined && count > 0 && (
            <span className="ml-1 font-normal text-ink-muted">({count})</span>
          )}
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
}

/**
 * Interactive star picker.
 *
 * Implemented as real radio inputs so it is keyboard-operable and announced as
 * a labelled group; the stars are the visual layer over them.
 */
export function RatingInput({ value, onChange, error }: RatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <fieldset
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      <legend className="sr-only">Your rating</legend>

      {[1, 2, 3, 4, 5].map((star) => (
        <label
          key={star}
          className="cursor-pointer p-0.5"
          onMouseEnter={() => setHovered(star)}
        >
          <input
            type="radio"
            name="rating"
            value={star}
            checked={value === star}
            onChange={() => onChange(star)}
            className="sr-only"
          />
          <Star
            className={cn(
              "size-7 transition-transform duration-100",
              star <= shown
                ? "fill-amber-400 text-amber-400"
                : cn("text-line-strong", error && "text-red-400"),
              hovered === star && "scale-110"
            )}
          />
          <span className="sr-only">
            {star} {star === 1 ? "star" : "stars"}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

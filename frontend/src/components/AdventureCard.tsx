import { motion } from "framer-motion";
import { Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/format";
import { GRID_IMAGE } from "../lib/images";
import type { Adventure } from "../types";
import SafeImage from "./SafeImage";
import { Rating } from "./ui/Rating";

interface AdventureCardProps {
  adventure: Adventure;
  saved: boolean;
  onToggleSave: (id: string) => void;
  /** Position in the grid, used to stagger the entrance. */
  index?: number;
  priority?: boolean;
}

const CATEGORY_TINTS: Record<string, string> = {
  Beaches: "bg-sky-500/90",
  Cycling: "bg-emerald-500/90",
  Hillside: "bg-violet-500/90",
  Party: "bg-pink-500/90",
};

export default function AdventureCard({
  adventure,
  saved,
  onToggleSave,
  index = 0,
  priority = false,
}: AdventureCardProps) {
  const soldOut = adventure.seatsLeft <= 0;
  const nearlyGone = !soldOut && adventure.seatsLeft <= 3;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        // Cap the stagger so the last card in a long grid is not left waiting.
        delay: Math.min(index * 0.04, 0.32),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface-raised shadow-card transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative overflow-hidden">
        <SafeImage
          src={adventure.image}
          alt={adventure.name}
          sizing={GRID_IMAGE}
          priority={priority}
          className="aspect-[4/3] w-full"
          imgClassName="group-hover:scale-[1.04] duration-500"
        />

        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm",
            CATEGORY_TINTS[adventure.category] ?? "bg-slate-500/90"
          )}
        >
          {adventure.category}
        </span>

        <button
          type="button"
          onClick={() => onToggleSave(adventure.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${adventure.name} from your list` : `Save ${adventure.name} to your list`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55 active:scale-90"
        >
          <Heart
            className={cn("size-4.5 transition", saved && "fill-red-500 text-red-500")}
          />
        </button>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold text-slate-900">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-ink">
            {/*
              The whole card is the link target via this overlay, so the click
              area is the card without nesting the heart button inside an <a>.
            */}
            <Link to={`/adventures/${adventure.id}`} className="after:absolute after:inset-0">
              {adventure.name}
            </Link>
          </h3>
        </div>

        {adventure.subtitle && (
          <p className="line-clamp-2 text-sm text-ink-soft">{adventure.subtitle}</p>
        )}

        <Rating value={adventure.ratingAverage} count={adventure.ratingCount} />

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="text-lg font-semibold text-ink">
              {formatCurrency(adventure.costPerHead)}
            </span>
            <span className="text-sm text-ink-muted"> / person</span>
          </div>

          <span className="inline-flex items-center gap-1 text-sm text-ink-soft">
            <Clock className="size-3.5" aria-hidden="true" />
            {adventure.duration}h
          </span>
        </div>

        {nearlyGone && (
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Only {adventure.seatsLeft} {adventure.seatsLeft === 1 ? "seat" : "seats"} left
          </p>
        )}
      </div>
    </motion.article>
  );
}

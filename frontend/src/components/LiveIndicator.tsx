import { AnimatePresence, motion } from "framer-motion";
import { Eye } from "lucide-react";
import type { LiveState } from "../hooks/useLiveAdventure";

/**
 * "Live" dot plus how many other people are looking at this adventure.
 *
 * The count includes the visitor themselves, so it is only worth showing once
 * someone else is here too - "1 person viewing" would just be describing them.
 */
export default function LiveIndicator({ viewers, connected }: LiveState) {
  if (!connected) return null;

  const others = viewers === null ? 0 : viewers - 1;

  return (
    <span className="inline-flex items-center gap-3 text-sm">
      <span
        className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400"
        title="Seat availability updates live"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>

      <AnimatePresence mode="popLayout">
        {others > 0 && (
          <motion.span
            key={others}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="inline-flex items-center gap-1.5 text-ink-soft"
          >
            <Eye className="size-4" aria-hidden="true" />
            {others} {others === 1 ? "other person" : "others"} viewing now
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

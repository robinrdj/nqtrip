import { AlertTriangle, Compass, Inbox, SearchX, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                   */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("shimmer rounded-lg bg-surface-inset", className)}
      aria-hidden="true"
    />
  );
}

/**
 * Card placeholder.
 *
 * Its proportions match the real card, so the swap to loaded content does not
 * move anything on the page.
 */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface-raised">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty and error states                                                      */
/* -------------------------------------------------------------------------- */

interface StateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: "search" | "inbox" | "compass" | "warning" | "offline";
  className?: string;
}

const ICONS = {
  search: SearchX,
  inbox: Inbox,
  compass: Compass,
  warning: AlertTriangle,
  offline: WifiOff,
};

export function EmptyState({
  title,
  description,
  action,
  icon = "search",
  className,
}: StateProps) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-panel border border-dashed border-line-strong px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-surface-inset">
        <Icon className="size-6 text-ink-muted" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  /** Already human-readable — the API writes its messages for people. */
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  // A failed fetch while the browser reports no connection is worth naming as
  // such, rather than blaming the server for the visitor's tunnel.
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-panel border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/50 dark:bg-red-950/30",
        className
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-red-100 dark:bg-red-900/40">
        {offline ? (
          <WifiOff className="size-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        ) : (
          <AlertTriangle className="size-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-ink">
        {offline ? "You appear to be offline" : "That did not work"}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-soft">
        {offline
          ? "Check your connection, then try again."
          : message}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

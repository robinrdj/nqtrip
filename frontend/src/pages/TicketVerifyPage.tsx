import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BadgeCheck, CalendarDays, MapPin, ShieldX, Users, XCircle } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { Button } from "../components/ui/Button";
import { ErrorState, Skeleton } from "../components/ui/States";
import { useTicketCheck } from "../hooks/queries";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn } from "../lib/cn";
import { formatDateLong } from "../lib/format";

/**
 * Where a ticket's QR code lands.
 *
 * Public, because the person scanning is the guide at the meeting point, not
 * the ticket holder. The signature in the URL is what lets it look the booking
 * up; the page shows only what a check-in needs, and the guest's surname is
 * reduced to an initial by the API.
 */
export default function TicketVerifyPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [searchParams] = useSearchParams();
  const { data, isPending, error, refetch } = useTicketCheck(
    reservationId,
    searchParams.get("sig") ?? ""
  );

  useDocumentTitle("Ticket check");

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      {isPending && <Skeleton className="h-80 rounded-panel" />}

      {error && (
        <ErrorState
          message={error instanceof ApiError ? error.message : "We could not check this ticket."}
          onRetry={() => void refetch()}
        />
      )}

      {data && !data.valid && (
        <Verdict tone="bad" icon={ShieldX} title="Not a valid ticket">
          <p className="text-sm text-ink-soft">
            This code does not match any QTrip booking. It may have been copied
            incorrectly or altered.
          </p>
        </Verdict>
      )}

      {data?.valid && (
        <Verdict
          tone={data.status === "confirmed" ? "good" : "bad"}
          icon={data.status === "confirmed" ? BadgeCheck : XCircle}
          title={data.status === "confirmed" ? "Valid ticket" : "Booking cancelled"}
        >
          <p className="font-mono text-xs text-ink-muted">{data.reference}</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{data.adventureName}</h2>

          <dl className="mt-4 space-y-2 text-sm text-ink-soft">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden="true" />
              <dt className="sr-only">Date</dt>
              <dd>{formatDateLong(`${data.date}T00:00:00`)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4" aria-hidden="true" />
              <dt className="sr-only">Guests</dt>
              <dd>
                {data.persons} {data.persons === 1 ? "person" : "people"}, booked by{" "}
                <span className="font-medium text-ink">{data.guest}</span>
              </dd>
            </div>
            {data.city && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                <dt className="sr-only">City</dt>
                <dd className="capitalize">{data.city.replace(/-/g, " ")}</dd>
              </div>
            )}
          </dl>

          {data.status === "cancelled" && (
            <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
              This ticket should not be admitted.
            </p>
          )}
        </Verdict>
      )}

      <div className="mt-8 text-center">
        <Button variant="ghost" asChild>
          <Link to="/">Go to QTrip</Link>
        </Button>
      </div>
    </div>
  );
}

function Verdict({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "good" | "bad";
  icon: typeof BadgeCheck;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "overflow-hidden rounded-panel border bg-surface-raised shadow-card",
        tone === "good"
          ? "border-emerald-200 dark:border-emerald-900/50"
          : "border-red-200 dark:border-red-900/50"
      )}
    >
      <header
        className={cn(
          "flex items-center gap-3 px-6 py-5 text-white",
          tone === "good" ? "bg-emerald-600" : "bg-red-600"
        )}
      >
        <Icon className="size-7" aria-hidden="true" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <div className="px-6 py-5">{children}</div>
    </motion.section>
  );
}

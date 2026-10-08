import { motion } from "framer-motion";
import { CalendarDays, Download, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import WeatherBadge from "../components/WeatherBadge";
import {
  useCancelReservation,
  useDownloadTicket,
  useReservations,
} from "../hooks/queries";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn } from "../lib/cn";
import {
  bookingReference,
  formatCurrency,
  formatDateLong,
  formatRelativeDay,
} from "../lib/format";
import type { Reservation } from "../types";

function TripCard({ reservation, index }: { reservation: Reservation; index: number }) {
  const cancelReservation = useCancelReservation();
  const downloadTicket = useDownloadTicket();

  const cancelled = reservation.status === "cancelled";
  const past = new Date(reservation.date) < new Date() && !cancelled;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className={cn(
        "rounded-panel border border-line bg-surface-raised p-5",
        cancelled && "opacity-65"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink">
              <Link
                to={`/adventures/${reservation.adventure}`}
                className="transition hover:text-brand-600"
              >
                {reservation.adventureName}
              </Link>
            </h3>

            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                cancelled
                  ? "bg-surface-inset text-ink-muted"
                  : past
                    ? "bg-surface-inset text-ink-soft"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              )}
            >
              {cancelled ? "Cancelled" : past ? "Completed" : "Confirmed"}
            </span>
          </div>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              <dt className="sr-only">Date</dt>
              <dd>
                {formatDateLong(reservation.date)}
                {!cancelled && !past && (
                  <span className="text-ink-muted">
                    {" "}
                    ({formatRelativeDay(reservation.date)})
                  </span>
                )}
              </dd>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              <dt className="sr-only">Party size</dt>
              <dd>
                {reservation.persons} {reservation.persons === 1 ? "person" : "people"}
              </dd>
            </div>

            {reservation.city && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                <dt className="sr-only">City</dt>
                <dd className="capitalize">{reservation.city.replace(/-/g, " ")}</dd>
              </div>
            )}
          </dl>

          <p className="mt-2 text-sm text-ink-muted">
            Booked for {reservation.name}
            <span className="font-mono text-xs"> · {bookingReference(reservation.id)}</span>
          </p>

          {/*
            Only upcoming trips: the forecast covers the next 16 days, and a
            past trip's weather is of no use to anyone.
          */}
          {!cancelled && !past && (
            <WeatherBadge
              city={reservation.city}
              // Stored as UTC midnight of the booked day; the date part is the day.
              date={reservation.date.slice(0, 10)}
              className="mt-3"
            />
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-ink">
            {formatCurrency(reservation.price)}
          </p>

          {!cancelled && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              loading={downloadTicket.isPending}
              onClick={() => downloadTicket.mutate(reservation.id)}
            >
              <Download className="size-4" aria-hidden="true" />
              Ticket
            </Button>
          )}

          {/* Only a future, still-confirmed booking can be cancelled. */}
          {!cancelled && !past && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              loading={cancelReservation.isPending}
              onClick={() => cancelReservation.mutate(reservation.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function TripsPage() {
  const { data, isPending, error, refetch } = useReservations(true);

  useDocumentTitle("My trips");

  const items = data?.items ?? [];
  const upcoming = items.filter(
    (r) => r.status === "confirmed" && new Date(r.date) >= new Date()
  );
  const rest = items.filter((r) => !upcoming.includes(r));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">My trips</h1>
        <p className="mt-1 text-ink-soft">
          Everything you have booked, and everything you have been on.
        </p>
      </header>

      {isPending && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-panel" />
          ))}
        </div>
      )}

      {error && (
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "We could not load your trips."
          }
          onRetry={() => void refetch()}
        />
      )}

      {data && items.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No trips yet"
          description="Once you book an adventure, it will show up here."
          action={
            <Button asChild>
              <Link to="/">Find something to do</Link>
            </Button>
          }
        />
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Upcoming
          </h2>
          <div className="space-y-4">
            {upcoming.map((reservation, index) => (
              <TripCard key={reservation.id} reservation={reservation} index={index} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Past and cancelled
          </h2>
          <div className="space-y-4">
            {rest.map((reservation, index) => (
              <TripCard key={reservation.id} reservation={reservation} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

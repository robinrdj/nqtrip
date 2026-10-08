import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Download, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { useCreateReservation, useDownloadTicket } from "../hooks/queries";
import { addDays, formatCurrency, toDateInputValue } from "../lib/format";
import { bookingSchema, type BookingValues } from "../lib/schemas";
import { useAuth } from "../providers/AuthProvider";
import type { Adventure } from "../types";
import { Button } from "./ui/Button";
import { TextField } from "./ui/Field";
import WeatherBadge from "./WeatherBadge";

interface BookingFormProps {
  adventure: Adventure;
}

export default function BookingForm({ adventure }: BookingFormProps) {
  const { user, isAuthenticated } = useAuth();
  const createReservation = useCreateReservation();
  const downloadTicket = useDownloadTicket();
  const [confirmed, setConfirmed] = useState<{ id: string; total: number } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.name ?? "",
      date: toDateInputValue(addDays(new Date(), 1)),
      persons: 1,
    },
  });

  /**
   * `defaultValues` is captured on the first render, and the session usually
   * resolves after that — so without this the name field stays empty on a real
   * page load, and the form cannot pass validation.
   *
   * Skipped once the visitor has touched the form, so their own edit is never
   * overwritten.
   */
  useEffect(() => {
    if (user?.name && !isDirty) {
      reset((current) => ({ ...current, name: user.name }));
    }
  }, [user?.name, isDirty, reset]);

  const persons = Number(watch("persons")) || 0;
  const date = watch("date");
  const total = persons * adventure.costPerHead;
  const soldOut = adventure.seatsLeft <= 0;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { reservation } = await createReservation.mutateAsync({
        adventure: adventure.id,
        name: values.name,
        date: values.date,
        persons: values.persons,
      });
      setConfirmed({ id: reservation.id, total: reservation.price });
    } catch (err) {
      if (err instanceof ApiError) {
        // The API reports validation problems per field; attach them to the
        // inputs that caused them rather than showing one banner.
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if (field === "name" || field === "date" || field === "persons") {
            setError(field, { message });
          }
        }
        if (Object.keys(err.fieldErrors).length === 0) {
          setError("root", { message: err.message });
        }
      } else {
        setError("root", { message: "Something went wrong. Please try again." });
      }
    }
  });

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-panel border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600">
          <Check className="size-6 text-white" strokeWidth={3} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">You are booked</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {formatCurrency(confirmed.total)} for {adventure.name}.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            loading={downloadTicket.isPending}
            onClick={() => downloadTicket.mutate(confirmed.id)}
          >
            <Download className="size-4" aria-hidden="true" />
            Download ticket
          </Button>
          <Button variant="outline" asChild>
            <Link to="/trips">View my trips</Link>
          </Button>
          <Button variant="ghost" onClick={() => setConfirmed(null)}>
            Book again
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-panel border border-line bg-surface-raised p-6">
        <p className="text-2xl font-semibold text-ink">
          {formatCurrency(adventure.costPerHead)}
          <span className="text-base font-normal text-ink-muted"> / person</span>
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          Sign in to book a spot on this adventure.
        </p>
        <Button asChild className="mt-4 w-full">
          {/* Carries the current page so sign-in returns here, not to the home page. */}
          <Link to={`/login?next=${encodeURIComponent(`/adventures/${adventure.id}`)}`}>
            Sign in to book
          </Link>
        </Button>
        <p className="mt-3 text-center text-sm text-ink-muted">
          New here?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      /*
        The browser would otherwise block submission itself on constraints like
        the date input's `min`, before React Hook Form runs - so our own
        messages would never appear. Validation is ours; the HTML constraints
        stay as hints to the native pickers.
      */
      noValidate
      className="rounded-panel border border-line bg-surface-raised p-6"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-ink">
          {formatCurrency(adventure.costPerHead)}
          <span className="text-base font-normal text-ink-muted"> / person</span>
        </p>
        {!soldOut && adventure.seatsLeft <= 5 && (
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {adventure.seatsLeft} left
          </span>
        )}
      </div>

      <div className="mt-5 space-y-1">
        <TextField
          label="Name on the booking"
          placeholder="Your full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <TextField
          label="Date"
          type="date"
          min={toDateInputValue(new Date())}
          error={errors.date?.message}
          {...register("date")}
        />
        {/* Reserves no space until a forecast exists, so the form never jumps for nothing. */}
        <WeatherBadge city={adventure.city} date={date} className="-mt-1 mb-3" />

        <TextField
          label="How many people"
          type="number"
          min={1}
          max={Math.max(1, Math.min(20, adventure.seatsLeft))}
          error={errors.persons?.message}
          hint={
            adventure.seatsLeft > 0
              ? `${adventure.seatsLeft} seats available`
              : undefined
          }
          {...register("persons")}
        />
      </div>

      <AnimatePresence>
        {persons > 0 && (
          <motion.dl
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line pt-4 text-sm"
          >
            <div className="flex justify-between py-1 text-ink-soft">
              <dt>
                {formatCurrency(adventure.costPerHead)} × {persons}{" "}
                {persons === 1 ? "person" : "people"}
              </dt>
              <dd className="tabular-nums">{formatCurrency(total)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(total)}</dd>
            </div>
          </motion.dl>
        )}
      </AnimatePresence>

      {errors.root && (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-5 w-full"
        loading={isSubmitting}
        disabled={soldOut}
      >
        <CalendarDays className="size-4" aria-hidden="true" />
        {soldOut ? "Sold out" : "Reserve your spot"}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <Users className="size-3.5" aria-hidden="true" />
        You will not be charged now
      </p>
    </form>
  );
}

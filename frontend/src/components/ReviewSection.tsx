import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "../api/client";
import { useDeleteReview, useReviews, useSubmitReview } from "../hooks/queries";
import { formatRelativeDay } from "../lib/format";
import { reviewSchema, type ReviewValues } from "../lib/schemas";
import { useAuth } from "../providers/AuthProvider";
import { Button } from "./ui/Button";
import { TextAreaField, TextField } from "./ui/Field";
import { Rating, RatingInput } from "./ui/Rating";
import { Skeleton } from "./ui/States";

interface ReviewSectionProps {
  adventureId: string;
  ratingAverage: number;
  ratingCount: number;
}

/** Horizontal bars showing how the ratings are distributed, 5 down to 1. */
function Distribution({
  distribution,
  total,
}: {
  distribution: Record<string, number>;
  total: number;
}) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[String(star)] ?? 0;
        const percent = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 tabular-nums text-ink-muted">{star}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-amber-400"
              />
            </div>
            <span className="w-6 text-right tabular-nums text-ink-muted">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewForm({ adventureId }: { adventureId: string }) {
  const submitReview = useSubmitReview(adventureId);
  const [notAllowed, setNotAllowed] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: "", body: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitReview.mutateAsync(values);
      reset({ rating: 0, title: "", body: "" });
      setNotAllowed(null);
    } catch (err) {
      // 403 here means "you have not booked this", which is a rule worth
      // explaining rather than a failure worth retrying.
      if (err instanceof ApiError) setNotAllowed(err.message);
    }
  });

  if (notAllowed) {
    return (
      <div className="rounded-panel border border-line bg-surface-inset p-5 text-sm text-ink-soft">
        {notAllowed}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-panel border border-line bg-surface-raised p-5"
    >
      <h4 className="font-semibold text-ink">Write a review</h4>

      <div className="mt-3">
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <RatingInput
              value={field.value}
              onChange={field.onChange}
              error={Boolean(errors.rating)}
            />
          )}
        />
        <div className="min-h-5">
          {errors.rating && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errors.rating.message}
            </p>
          )}
        </div>
      </div>

      <TextField
        label="Title"
        placeholder="Sum it up in a few words"
        error={errors.title?.message}
        {...register("title")}
      />

      <TextAreaField
        label="Your review"
        placeholder="What was it actually like?"
        error={errors.body?.message}
        {...register("body")}
      />

      <Button type="submit" loading={isSubmitting} className="mt-1">
        Post review
      </Button>
    </form>
  );
}

export default function ReviewSection({
  adventureId,
  ratingAverage,
  ratingCount,
}: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { data, isPending } = useReviews(adventureId);
  const deleteReview = useDeleteReview(adventureId);

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">Reviews</h2>

      <div className="mt-5 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-5">
          <div className="rounded-panel border border-line bg-surface-raised p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-ink tabular-nums">
                {ratingCount > 0 ? ratingAverage.toFixed(1) : "—"}
              </span>
              <span className="text-sm text-ink-muted">out of 5</span>
            </div>

            <Rating
              value={ratingAverage}
              size="md"
              starsOnly
              className="mt-2"
            />

            <p className="mt-1 text-sm text-ink-muted">
              {ratingCount === 0
                ? "No reviews yet"
                : `${ratingCount} ${ratingCount === 1 ? "review" : "reviews"}`}
            </p>

            {data && ratingCount > 0 && (
              <div className="mt-4">
                <Distribution distribution={data.distribution} total={data.total} />
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <ReviewForm adventureId={adventureId} />
          ) : (
            <p className="text-sm text-ink-muted">
              Sign in and book this adventure to leave a review.
            </p>
          )}
        </div>

        <div>
          {isPending && (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-panel border border-line p-5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-4/5" />
                </div>
              ))}
            </div>
          )}

          {data && data.items.length === 0 && (
            <p className="rounded-panel border border-dashed border-line-strong p-8 text-center text-sm text-ink-muted">
              Nobody has reviewed this yet. If you have been, you can be the first.
            </p>
          )}

          <div className="space-y-4">
            {data?.items.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                className="rounded-panel border border-line bg-surface-raised p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                      {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {review.user?.name ?? "A traveller"}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatRelativeDay(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {user && review.user?.id === user.id && (
                    <button
                      type="button"
                      onClick={() => deleteReview.mutate(review.id)}
                      aria-label="Delete your review"
                      className="grid size-8 place-items-center rounded-lg text-ink-muted transition hover:bg-surface-inset hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <Rating value={review.rating} starsOnly className="mt-3" />

                {review.title && (
                  <h3 className="mt-2 font-medium text-ink">{review.title}</h3>
                )}
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {review.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

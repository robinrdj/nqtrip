import { Clock, Heart, MapPin, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import BookingForm from "../components/BookingForm";
import PhotoCarousel from "../components/PhotoCarousel";
import ReviewSection from "../components/ReviewSection";
import { Button } from "../components/ui/Button";
import { Rating } from "../components/ui/Rating";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useAdventure, useCities, useToggleWishlist } from "../hooks/queries";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn } from "../lib/cn";

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-4 w-1/3 max-w-xs" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <Skeleton className="aspect-video w-full rounded-panel" />
        <Skeleton className="h-80 rounded-panel" />
      </div>
    </div>
  );
}

export default function AdventureDetailPage() {
  const { adventureId } = useParams<{ adventureId: string }>();
  const { data, isPending, error, refetch } = useAdventure(adventureId);
  const { data: cities } = useCities();
  const toggleWishlist = useToggleWishlist();

  const adventure = data?.adventure;
  useDocumentTitle(adventure?.name ?? "Adventure");

  if (isPending) return <DetailSkeleton />;

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;

    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {notFound ? (
          <EmptyState
            icon="compass"
            title="We could not find that adventure"
            description="It may have been removed, or the link might be wrong."
            action={
              <Button variant="outline" asChild>
                <Link to="/">Browse cities</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "We could not load this adventure."
            }
            onRetry={() => void refetch()}
          />
        )}
      </div>
    );
  }

  if (!adventure) return null;

  const city = cities?.find((c) => c.id === adventure.city);
  const saved = data.saved;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {city && (
            <Link
              to={`/adventures?city=${encodeURIComponent(city.id)}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {city.city}
            </Link>
          )}

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {adventure.name}
          </h1>

          {adventure.subtitle && (
            <p className="mt-2 max-w-2xl text-lg text-pretty text-ink-soft">
              {adventure.subtitle}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            <Rating value={adventure.ratingAverage} count={adventure.ratingCount} />

            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {adventure.duration} hours
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              {adventure.seatsLeft > 0
                ? `${adventure.seatsLeft} of ${adventure.capacity} seats left`
                : "Fully booked"}
            </span>

            <span className="rounded-full bg-surface-inset px-2.5 py-1 text-xs font-medium">
              {adventure.category}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => toggleWishlist.mutate(adventure.id)}
          aria-pressed={saved}
        >
          <Heart className={cn("size-4", saved && "fill-red-500 text-red-500")} />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <PhotoCarousel images={adventure.images} alt={adventure.name} />

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-ink">About this adventure</h2>
            <p className="mt-3 leading-relaxed text-pretty text-ink-soft">
              {adventure.content}
            </p>
          </div>
        </div>

        {/*
          Sticks alongside the description on desktop so the price and the
          booking button stay reachable through a long page.
        */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm adventure={adventure} />
        </div>
      </div>

      <ReviewSection
        adventureId={adventure.id}
        ratingAverage={adventure.ratingAverage}
        ratingCount={adventure.ratingCount}
      />
    </div>
  );
}

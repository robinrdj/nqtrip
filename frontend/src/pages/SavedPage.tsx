import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import AdventureCard from "../components/AdventureCard";
import { Button } from "../components/ui/Button";
import { CardGridSkeleton, EmptyState, ErrorState } from "../components/ui/States";
import { useToggleWishlist, useWishlist } from "../hooks/queries";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function SavedPage() {
  const { data, isPending, error, refetch } = useWishlist(true);
  const toggleWishlist = useToggleWishlist();

  useDocumentTitle("Saved adventures");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Saved</h1>
        <p className="mt-1 text-ink-soft">
          Adventures you have kept for later.
        </p>
      </header>

      {isPending && <CardGridSkeleton count={4} />}

      {error && (
        <ErrorState
          message={
            error instanceof ApiError
              ? error.message
              : "We could not load your saved adventures."
          }
          onRetry={() => void refetch()}
        />
      )}

      {data && data.length === 0 && (
        <EmptyState
          icon="compass"
          title="Nothing saved yet"
          description="Tap the heart on any adventure and it will show up here."
          action={
            <Button asChild>
              <Link to="/">Start exploring</Link>
            </Button>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((adventure, index) => (
            <AdventureCard
              key={adventure.id}
              adventure={adventure}
              // Everything on this page is saved by definition.
              saved
              onToggleSave={(id) => toggleWishlist.mutate(id)}
              index={index}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/format";
import { ADVENTURE_CATEGORIES, type AdventureFacets, type AdventureQuery } from "../types";
import { Button } from "./ui/Button";

/** Preset duration bands, kept as the same buckets the original UI offered. */
const DURATION_BANDS = [
  { label: "Up to 2 hours", min: 0, max: 2 },
  { label: "2 to 6 hours", min: 2, max: 6 },
  { label: "6 to 12 hours", min: 6, max: 12 },
  { label: "12 hours and over", min: 12, max: 48 },
];

interface FilterControlsProps {
  query: AdventureQuery;
  facets?: AdventureFacets;
  update: (patch: Partial<AdventureQuery>) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function FilterControls({ query, facets, update }: FilterControlsProps) {
  const priceRange = facets?.priceRange;

  // The slider is a controlled component driven by local state so dragging is
  // smooth; the URL is only written on release (onValueCommit), which keeps a
  // drag from firing a request per pixel.
  const [priceDraft, setPriceDraft] = useState<[number, number] | null>(null);

  const [boundsMin, boundsMax] = priceRange
    ? [priceRange.min, priceRange.max]
    : [0, 5000];

  /*
    Memoised deliberately. Radix's Slider is controlled by this array, and it
    re-synchronises whenever the reference changes — so handing it a freshly
    built array on every render puts it in a render loop that pegs the main
    thread and makes the whole page stop responding to input.
  */
  const current = useMemo<[number, number]>(
    () => priceDraft ?? [query.priceMin ?? boundsMin, query.priceMax ?? boundsMax],
    [priceDraft, query.priceMin, query.priceMax, boundsMin, boundsMax]
  );

  // A new city changes the available price band, so drop a stale draft.
  useEffect(() => {
    setPriceDraft(null);
  }, [query.city, boundsMin, boundsMax]);

  const toggleCategory = (category: (typeof ADVENTURE_CATEGORIES)[number]) => {
    const next = query.category.includes(category)
      ? query.category.filter((c) => c !== category)
      : [...query.category, category];
    update({ category: next });
  };

  return (
    <div className="divide-y divide-line">
      <Section title="Category">
        <div className="space-y-2.5">
          {ADVENTURE_CATEGORIES.map((category) => {
            const facet = facets?.categories.find((c) => c.value === category);
            const count = facet?.count ?? 0;
            const checked = query.category.includes(category);

            const id = `category-${category}`;

            return (
              /*
                The label is a sibling with htmlFor, not a wrapper. Nesting the
                checkbox inside the label makes the click land twice — once on
                the control, once forwarded by the label — which toggles it
                straight back off. A <button> is a labelable element, so
                htmlFor still gives the text a clickable target.
              */
              <div
                key={category}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  // Greyed out, not hidden: knowing a category exists but has
                  // nothing in it is more useful than it vanishing.
                  count === 0 && !checked && "opacity-45"
                )}
              >
                <Checkbox.Root
                  id={id}
                  checked={checked}
                  onCheckedChange={() => toggleCategory(category)}
                  className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-md border border-line-strong bg-surface transition data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600"
                >
                  <Checkbox.Indicator>
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label htmlFor={id} className="flex-1 cursor-pointer text-ink-soft">
                  {category}
                </label>
                <span className="text-xs tabular-nums text-ink-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Duration">
        <div className="space-y-2">
          {DURATION_BANDS.map((band) => {
            const active =
              query.durationMin === band.min && query.durationMax === band.max;

            return (
              <button
                key={band.label}
                type="button"
                onClick={() =>
                  update(
                    active
                      ? { durationMin: undefined, durationMax: undefined }
                      : { durationMin: band.min, durationMax: band.max }
                  )
                }
                aria-pressed={active}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  active
                    ? "border-brand-600 bg-brand-50 font-medium text-brand-700 dark:bg-brand-600/15 dark:text-brand-300"
                    : "border-line text-ink-soft hover:border-line-strong hover:bg-surface-inset"
                )}
              >
                {band.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Price per person">
        <Slider.Root
          value={current}
          min={boundsMin}
          max={boundsMax}
          step={50}
          minStepsBetweenThumbs={1}
          onValueChange={(value) => setPriceDraft([value[0]!, value[1]!])}
          onValueCommit={(value) => {
            setPriceDraft(null);
            update({ priceMin: value[0], priceMax: value[1] });
          }}
          className="relative flex h-5 w-full touch-none items-center select-none"
          aria-label="Price range"
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-surface-inset">
            <Slider.Range className="absolute h-full rounded-full bg-brand-600" />
          </Slider.Track>
          {["Minimum price", "Maximum price"].map((label) => (
            <Slider.Thumb
              key={label}
              aria-label={label}
              className="block size-5 rounded-full border-2 border-brand-600 bg-surface shadow-sm transition hover:scale-110 focus-visible:ring-4 focus-visible:ring-brand-500/20"
            />
          ))}
        </Slider.Root>

        <div className="mt-3 flex items-center justify-between text-sm tabular-nums text-ink-soft">
          <span>{formatCurrency(current[0])}</span>
          <span>{formatCurrency(current[1])}</span>
        </div>
      </Section>
    </div>
  );
}

interface FilterPanelProps extends FilterControlsProps {
  activeFilterCount: number;
  clearFilters: () => void;
  resultCount?: number;
}

/**
 * Filters as a sidebar on desktop, and as a bottom sheet on smaller screens.
 *
 * The sheet is a Radix Dialog, so it traps focus, closes on Escape, and returns
 * focus to the trigger — behaviour that is easy to get wrong by hand and that
 * a filter panel genuinely needs, since it covers the results.
 */
export default function FilterPanel({
  query,
  facets,
  update,
  activeFilterCount,
  clearFilters,
  resultCount,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const clearButton = activeFilterCount > 0 && (
    <button
      type="button"
      onClick={clearFilters}
      className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
    >
      Clear all
    </button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-panel border border-line bg-surface-raised p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Filters</h2>
            {clearButton}
          </div>
          <FilterControls query={query} facets={facets} update={update} />
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 grid size-5 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-line bg-surface-raised data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom">
            {/* Grab handle, the affordance people expect on a sheet. */}
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line-strong" />

            <div className="flex items-center justify-between px-5 py-4">
              <Dialog.Title className="text-lg font-semibold text-ink">
                Filters
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="grid size-9 place-items-center rounded-xl text-ink-soft transition hover:bg-surface-inset"
                  aria-label="Close filters"
                >
                  <X className="size-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <FilterControls query={query} facets={facets} update={update} />
            </div>

            <div className="flex items-center gap-3 border-t border-line p-5">
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear all
                </Button>
              )}
              <Button onClick={() => setOpen(false)} className="flex-1">
                {resultCount === undefined
                  ? "Show results"
                  : `Show ${resultCount} ${resultCount === 1 ? "result" : "results"}`}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

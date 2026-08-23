/**
 * Skeletons are decorative, so they are hidden from assistive tech. A
 * visually-hidden live region carries the loading message instead.
 */
function LoadingAnnouncement({ label }: { label: string }) {
  return (
    <span className="visually-hidden" role="status">
      {label}
    </span>
  );
}

/** Placeholder grid shown while city tiles load. */
export function TileSkeletonGrid({
  count = 8,
  label = "Loading cities…",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <>
      <LoadingAnnouncement label={label} />
      <div className="row" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={i}>
            <div className="skeleton skeleton-tile" />
          </div>
        ))}
      </div>
    </>
  );
}

/** Placeholder grid shown while adventure cards load. */
export function CardSkeletonGrid({
  count = 8,
  label = "Loading adventures…",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <>
      <LoadingAnnouncement label={label} />
      <div className="row" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={i}>
            <div className="skeleton-card">
              <div className="skeleton skeleton-thumb" />
              <div className="skeleton-body">
                <div
                  className="skeleton skeleton-line"
                  style={{ width: "72%" }}
                />
                <div
                  className="skeleton skeleton-line"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

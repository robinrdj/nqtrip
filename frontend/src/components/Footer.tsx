import { Code2, MountainSnow } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-sunken">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
                <MountainSnow className="size-4" aria-hidden="true" />
              </span>
              <span className="font-semibold tracking-tight text-ink">
                <span className="text-brand-600">Q</span>Trip
              </span>
            </Link>
            <p className="mt-3 text-sm text-ink-soft">
              Find something worth doing, wherever you are going. Plan it, book
              it, go.
            </p>
          </div>

          <nav className="flex gap-12 text-sm">
            <div>
              <h4 className="font-medium text-ink">Explore</h4>
              <ul className="mt-3 space-y-2 text-ink-muted">
                <li>
                  <Link to="/" className="transition hover:text-ink">
                    All cities
                  </Link>
                </li>
                <li>
                  <Link to="/adventures" className="transition hover:text-ink">
                    All adventures
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-ink">Account</h4>
              <ul className="mt-3 space-y-2 text-ink-muted">
                <li>
                  <Link to="/trips" className="transition hover:text-ink">
                    My trips
                  </Link>
                </li>
                <li>
                  <Link to="/saved" className="transition hover:text-ink">
                    Saved
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} QTrip</span>
          <a
            href="https://github.com/robinrdj"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 transition hover:text-ink"
          >
            <Code2 className="size-4" aria-hidden="true" />
            Built by Robin Rajadurai
          </a>
        </div>
      </div>
    </footer>
  );
}

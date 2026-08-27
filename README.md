# QTrip

A travel adventure booking app: browse cities, filter adventures server-side,
book seats against real capacity, save favourites and leave reviews.

React 19-ready SPA in TypeScript (strict), backed by a TypeScript + MongoDB API.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS v4 + Radix UI primitives |
| Motion | Framer Motion |
| Data | TanStack Query |
| Forms | React Hook Form + Zod |
| Routing | React Router 7 |
| Build | Vite 6 |
| Tests | Vitest + React Testing Library |
| API | Express 5 + Mongoose 8 + MongoDB ([separate repo](../../qtripBackend/backend)) |

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev          # frontend on :8081
```

The frontend expects the API on `:8082`. In the backend repo:

```bash
npm run dev:memory   # API + a disposable in-memory MongoDB, seeded
```

That needs no connection string, so the whole app runs from a clean checkout.
Use `npm run dev` there instead to run against a real `MONGODB_URI`.

Vite proxies `/api` to `:8082`, so requests are same-origin in development and
the auth cookies stay first-party.

Sign in with `demo@qtrip.dev` / `Demo1234`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm test` | 73 tests |
| `npm run typecheck` | Type-check without emitting |
| `npm run build` | Type-check, then build to `frontend/dist/` |

## Routes

| Route | Page | |
| --- | --- | --- |
| `/` | Cities, with client-side search | |
| `/adventures?city=<id>` | Filter, search, sort, page | filters live in the URL |
| `/adventures/:id` | Detail, carousel, booking, reviews | |
| `/login`, `/register` | Auth | |
| `/trips` | Your bookings, with cancel | auth |
| `/saved` | Wishlist | auth |
| `/account` | Profile and theme | auth |

## How it fits together

```
frontend/src/
  api/client.ts        typed fetch wrappers; ApiError carries per-field detail
  providers/           AuthProvider (session), ThemeProvider (light/dark)
  hooks/queries.ts     every TanStack Query key, hook and mutation
  hooks/useAdventureQuery.ts   filter state, read from and written to the URL
  lib/schemas.ts       Zod schemas mirroring the backend's
  components/ui/       Button, Field, Rating, States (skeleton/empty/error)
  components/          cards, filters, carousel, booking form, reviews
  pages/               one component per route
  styles/app.css       Tailwind theme: tokens, dark palette, utilities
```

**Filter state lives in the URL, not localStorage.** A filtered view is a
shareable link, back and forward step through filter changes, and a reload
restores exactly what was on screen.

**Filtering happens in the database.** The list endpoint returns a page of
results plus facet counts, so the sidebar can show how many adventures each
category would add. Those counts deliberately ignore the category filter — 
otherwise ticking one box zeroes every other count.

**The theme is a token swap.** Components reference semantic tokens
(`--surface`, `--ink`, `--line`) rather than palette steps, so dark mode is one
block of redefinitions instead of a `dark:` variant on every element.

**Auth is cookie-based.** Tokens live in httpOnly cookies, so no script on the
page can read them. The client refreshes once on a 401 and replays the original
request; concurrent 401s share a single refresh rather than racing.

## Testing

```bash
npm test
```

73 tests over four layers:

- **API client** — URL building, error mapping, and the refresh-and-replay path
- **URL filter state** — parsing, writing, defaults, and rejecting hand-edited values
- **Components** — cards, filter panel, and the booking form against a mocked API
- **Pages** — loading, empty and error states, and server-side sorting

Two of these are regression tests for bugs found while building: a Radix
checkbox nested in its own `<label>` cancelled its own click, and a slider whose
controlled value was rebuilt each render put the page in a loop.

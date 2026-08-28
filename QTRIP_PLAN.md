# QTrip — Modernisation Plan & Handoff

**Purpose of this file:** if the Claude Code session working on this is lost,
hand this file to a new session. It carries the goal, the decisions already
made, what is built, what is blocked, and what comes next.

**Last updated:** 2026-08-28 (end of Phase 5)

---

## 1. The goal

Robin is rebuilding QTrip (originally a Crio.Do project) into a portfolio piece
for his resume. It must look and read like a real product, not a bootcamp
exercise — modern stack, modern UI, features that imply a working business.

Two repos, both on Windows:

| Repo | Path |
| --- | --- |
| Frontend | `C:\Users\robin\OneDrive\Desktop\Projects\qtrip\robinrajaduraij-ME_QTRIPDYNAMIC` |
| Backend | `C:\Users\robin\OneDrive\Desktop\Projects\qtripBackend\backend` |

The frontend repo's root `package.json` declares npm workspaces `backend` and
`frontend`, but the `backend` workspace directory does not exist there — the
backend lives in its own repo. Only `frontend/` is a real workspace.

---

## 2. Decisions already made (do not re-litigate)

Robin was asked and chose:

1. **Styling — migrate to Tailwind v4 + Radix primitives + Framer Motion.**
   Off react-bootstrap entirely. The existing `frontend/src/styles/styles.css`
   design tokens port to Tailwind `@theme` almost 1:1.
2. **Features — Auth + "My Trips", and Reviews/ratings/wishlist.**
   Explicitly **out of scope**: admin panel, Cloudinary image uploads.
3. **Backend — rewritten in place, legacy routes kept** as compatibility
   aliases so the deployed frontend never breaks mid-migration.

Also agreed: MongoDB Atlas (existing `Cluster0`, new database `qtrip`) rather
than a new cluster — a connection string cannot create a cluster anyway.

---

## 3. Status

### Phase 0 — Atlas setup — **BLOCKED ON ROBIN**

Atlas refuses the TLS handshake (`SSL alert number 80`), which is its standard
response for a non-allowlisted IP. DNS/SRV resolves fine, so the cluster exists
and the hostname is right.

**Robin must do, in the Atlas UI:**

1. **Network Access → Add IP Address** → `152.57.203.219` (his public IP at the
   time of writing — re-check it, it may have changed), or `0.0.0.0/0` for dev.
2. **Database Access → Edit user → rotate the password.** The original password
   was pasted into a chat log and must be considered burned. The new URI goes in
   `qtripBackend/backend/.env` as `MONGODB_URI` (`.env` is gitignored; there is
   a committed `.env.example`).

Then `npm run seed` populates Atlas and `npm run dev` runs against it.

**This blocks nothing.** `npm run dev:memory` boots the API against a disposable
in-memory MongoDB seeded from `db.json` — no connection string required.

### Phase 1 — Backend rewrite — **DONE**

Branch `feat/mongo-typescript-api`, two commits:

- `488e11d` Rewrite the API in TypeScript on MongoDB
- `1c8e1f0` Add an Atlas-free dev server, stop exposing tokenVersion

Express 5 · TypeScript strict · Mongoose 8 · Zod · JWT · Vitest + Supertest +
mongodb-memory-server. **76 tests pass.** Verified end-to-end over real HTTP,
not just through Supertest.

The old `server.js` and `random_data.js` were deleted (git history keeps them).
`db.json` is retained as the seed source — do not delete it.

### Phase 2 — Frontend data layer — **DONE**
### Phase 3 — Visual overhaul — **DONE**

TanStack Query replaced useAsync; React Hook Form + Zod (schemas mirrored from
the backend in `src/lib/schemas.ts`); AuthProvider + RequireAuth; filter state
moved from localStorage into the URL. Bootstrap removed entirely, replaced by
Tailwind v4 + Radix + Framer Motion, with a real dual-palette dark mode.

Auth, My Trips, Saved and Reviews UI were built alongside, since protected
routes are meaningless without somewhere to sign in — so most of Phase 4 landed
too. **73 frontend tests pass**; verified end-to-end in a browser (sign in,
filter, book, cancel).

Three real bugs were found and fixed by driving the app rather than by tests:
1. A Radix Checkbox nested inside its own `<label>` received the click twice
   and cancelled itself out. Now a sibling `htmlFor` label.
2. The price Slider's controlled `value` was a fresh array each render, so
   Radix re-synchronised in a loop and the whole page stopped responding.
   Now memoised — do not inline that array again.
3. Native form validation (`min` on the date input) blocked submit before
   React Hook Form ran, so Zod messages never appeared. Every form now sets
   `noValidate`.

### Phase 4 — remaining: nothing required (admin panel and Cloudinary were declined)
### Phase 5 — Ship — **DONE, except the deploy itself**

Built and committed:
- GitHub Actions in both repos (typecheck, test, build). The backend adds a
  job that runs the seed twice against a real MongoDB service container and
  asserts it is idempotent. The frontend adds a bundle-size budget (700KB).
- Two-stage Dockerfile + docker-compose (MongoDB + API, seeded on first run).
- `render.yaml` blueprint for the API; `netlify.toml` for the frontend, now
  proxying `/api` to the API so auth cookies stay first-party.
- Route-level code splitting: shared chunk 704KB -> 545KB.
- READMEs in both repos, with real screenshots in `docs/screenshots/` and a
  mermaid architecture diagram.

**Not done, and needs Robin:** the actual deploy. Pushing to Render/Netlify
needs his accounts, and it is his call when to publish. Before deploying:
1. Set the Netlify `/api/*` proxy target in `netlify.toml` to the real API URL
   (it currently points at `https://qtrip-api.onrender.com`, which is a guess).
2. Set `CORS_ORIGINS` on the API to the deployed frontend origin exactly —
   credentialed CORS cannot use a wildcard.
3. Run `npm run seed` once against the Atlas database.

**Docker was never built here** — Docker is not installed on this machine. The
Dockerfile and compose file are unverified by execution, though the commands
they run (npm ci, tsc, node dist/index.js, node dist/seed/seed.js) were each
verified outside Docker.

---

## 4. What the backend looks like now

```
qtripBackend/backend/
  src/
    app.ts              Express app: middleware order, route mounting
    index.ts            Production boot + graceful shutdown
    dev-server.ts       In-memory Mongo + seed + listen (npm run dev:memory)
    config/env.ts       Zod-validated env, parsed once at import
    db/connect.ts       Mongoose connection
    models/             City, Adventure, User, Reservation, Review, Wishlist
                        + plugins.ts (shared toJSON transform)
    schemas/            Zod request schemas — the API contract
    middleware/         auth, validate, error, rateLimit
    services/           Business logic; routes stay thin
    routes/             index, auth, adventures, reservations, legacy
    seed/seed.ts        db.json -> MongoDB, idempotent, importable
    docs/openapi.ts     Hand-written OpenAPI 3, served at /api/docs
    utils/              AppError, asyncHandler, tokens, params, escapeRegex
  tests/                6 suites: auth, adventures, reservations, reviews,
                        legacy, seed
  db.json               Legacy data, still the seed source
```

### Design decisions worth preserving

**Identifiers carry over from the old JSON.** Cities use their slug as `_id`
(`"bengaluru"`), adventures keep their legacy numeric-string id
(`"2447910730"`). Both models set `_id: false` with an explicit `_id: String`.
This keeps old bookmarks and the deployed frontend resolving, and makes the seed
idempotent. Users/Reservations/Reviews/Wishlist use normal ObjectIds.

**Adventures are one document.** The old API split each across `/adventures`
(card fields) and `/adventures/detail` (prose) — which is why the old detail
payload lacked `duration`, `category` and `image`. Merged here; the legacy
routes project out the subset each used to return.

**Capacity is real.** `capacity` + `booked` replace the one-way `reserved`
boolean. Booking is a single conditional `findOneAndUpdate` with an `$expr`
guard that only matches while enough seats remain and `$inc`s in the same
operation — atomic on one document, so no transaction is needed and it works on
a standalone mongod. If the reservation insert then fails, the seat claim is
rolled back. There is a test that fires five concurrent 2-person bookings at 5
seats and asserts exactly two succeed.

**Ratings are denormalised** onto the adventure and fully recomputed from the
review rows after every write, so they cannot drift.

**Facet counts deliberately ignore the category filter**, so ticking one
category does not zero out the counts on every other checkbox.

**Dates are calendar days pinned to UTC midnight.** A bug inherited from the
original stored booking dates at *local* midnight, so in UTC+5:30 a booking for
the 27th read back as the 26th. Reservation dates are now written as
`new Date(\`${input.date}T00:00:00.000Z\`)`, and the "not in the past" check
compares `YYYY-MM-DD` **strings** rather than Dates. Do not "simplify" either of
these back — there are regression tests.

### Security posture (already implemented)

- bcrypt cost 12; `passwordHash` is `select: false`.
- JWTs in httpOnly cookies (`SameSite=None; Secure` in production), with a
  bearer-header fallback so curl/Swagger/tests work.
- Refresh tokens carry `tokenVersion`; bumping it on the user invalidates every
  token in circulation without a revocation list.
- Login returns an identical error for wrong-password and unknown-account, so
  the form is not an account-enumeration oracle. There is a test for this.
- helmet, CORS allowlist (credentialed, so no wildcard), rate limits (tight on
  auth, moderate on writes, disabled under `NODE_ENV=test`).
- Reservations are owner-scoped. Reviews require a confirmed booking.
- Unexpected errors are logged server-side and answered generically, so stack
  traces and connection strings never reach a response body.
- `toJSON` strips `passwordHash` and `tokenVersion`.

### Deliberate behaviour change from the old API

`GET /reservations` used to return **every booking in the system to anyone**.
It now returns only the unowned rows from the original seed data, so the legacy
page still renders without exposing real customers. This is intentional.

### Backend commands

| Command | What |
| --- | --- |
| `npm run dev:memory` | **Use this while Atlas is blocked.** In-memory DB, auto-seeded |
| `npm run dev` | Watch mode against `MONGODB_URI` |
| `npm test` | 76 tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` / `seed:fresh` | Migrate `db.json` into Mongo |
| `npm run build` / `npm start` | Compile to `dist/`, run compiled |

Demo accounts created by the seed: `demo@qtrip.dev` / `Demo1234` (traveller),
`admin@qtrip.dev` / `Admin1234` (admin).

### API surface

`/api/v1` — full reference at `/api/docs`.

```
POST   /api/v1/auth/register | /login | /refresh | /logout
GET    /api/v1/auth/me            PATCH /api/v1/auth/me
POST   /api/v1/auth/change-password
GET    /api/v1/cities             GET /api/v1/cities/:id
GET    /api/v1/adventures         filter, search, sort, page, facets, savedIds
GET    /api/v1/adventures/:id     -> { adventure, saved }
GET    /api/v1/adventures/:id/reviews    POST (auth, must have booked)
DELETE /api/v1/reviews/:id
GET    /api/v1/reservations       POST /api/v1/reservations        (auth)
POST   /api/v1/reservations/:id/cancel                             (auth)
GET    /api/v1/wishlist           POST /api/v1/wishlist/:adventureId (toggle)
GET    /health                    GET /api/openapi.json
```

`GET /api/v1/adventures` query params: `city`, `q`, `category` (CSV),
`durationMin`, `durationMax`, `priceMin`, `priceMax`, `sort`
(`recommended|price-asc|price-desc|duration-asc|duration-desc|rating`), `page`,
`limit` (max 60).

**Legacy routes**, mounted at root, covered by `tests/legacy.test.ts` — keep
them byte-compatible: `GET /cities`, `GET /adventures?city=`,
`GET /adventures/detail?adventure=`, `POST /reservations/new`,
`GET /reservations`.

---

## 5. What the frontend looks like now (untouched so far)

Already reasonable: React 18 + TypeScript strict, Vite 6, React Router 7,
70 Vitest + RTL tests, hand-rolled design tokens, skeletons, and a `useAsync`
hook that discards superseded requests.

```
frontend/src/
  api/client.ts        typed fetch wrappers; throws ApiError
  components/          AdventureCard, CityTile, FilterBar, NavBar, Footer,
                       PhotoCarousel, ReservationForm, ReservationTable,
                       SafeImage, ScrollToTop, Skeleton, StatusMessage, Layout
  pages/               Landing, Adventures, AdventureDetail, Reservations
  hooks/               useAsync, useDocumentTitle
  lib/                 filters, format, images, storage
  types.ts             City, Adventure, AdventureDetail, Reservation, Filters
  styles/styles.css    924 lines of tokens + component CSS
```

Routes: `/`, `/adventures?city=<id>`, `/adventures/:adventureId`,
`/reservations`.

`frontend/src/config.ts` currently defaults `backendEndpoint` to
`https://nqtripbackend.onrender.com`, overridable via `VITE_BACKEND_ENDPOINT`.
**Point this at `http://localhost:8082` for local work.**

Deployed via `netlify.toml` (publishes `frontend/dist`, SPA redirect).

---

## 6. Remaining plan

### Phase 2 — Frontend data layer
- TanStack Query replacing `useAsync` (caching, retries, optimistic updates).
- react-hook-form + Zod, **sharing the backend's schemas** so a rule is written
  once. Consider a shared package or copying `src/schemas/*` — the backend
  schemas are deliberately written to be portable.
- `AuthProvider` + protected routes; token refresh on 401.
- Filter state synced to the **URL** (shareable links) rather than
  `localStorage`, and moved to server-side query params.
- Rewrite `api/client.ts` against `/api/v1`, keeping `ApiError`.

### Phase 3 — Visual overhaul (the resume payload)
- Tailwind v4 (`@theme` from the existing tokens) + Radix + Framer Motion;
  remove bootstrap / react-bootstrap.
- Real dark mode (dual palette, not an inverted filter).
- Reworked hero, gradient mesh, animated search with typeahead.
- Cards: blur-up image placeholders, hover lift, staggered entrance.
- Page transitions, skeleton→content crossfade, scroll reveal.
- Real empty/error/offline states.
- Mobile-first bottom-sheet filters.
- Accessibility: focus traps, ARIA, keyboard nav, `prefers-reduced-motion`.

### Phase 4 — Features
1. Auth — sign up / log in / profile
2. My Trips — own bookings, cancel, status badges
3. Wishlist — heart with optimistic toggle
4. Reviews & ratings — aggregate stars on cards, list + write form on detail
5. Booking flow — date picker, live seat availability, party size, price
   breakdown, confirmation screen

(Admin panel and Cloudinary were explicitly declined.)

### Phase 5 — Ship
- GitHub Actions CI: typecheck + test + build, both repos.
- Dockerfile + compose for local Mongo.
- Backend on Render/Railway, frontend on Netlify. Set `CORS_ORIGINS` to the
  deployed frontend origin, and remember cookies need `Secure`+`SameSite=None`
  cross-origin (already handled in `utils/tokens.ts`).
- Root README with screenshots/GIF and an architecture diagram.
- Seeded demo accounts so a recruiter can click straight in.

---

## 7. Working notes for whoever picks this up

- **Windows.** The Bash tool is Git Bash. Heredocs mangle backslashes — writing
  a regex like `/[.*+?^${}()|[\]\\]/g` through a `cat <<'EOF'` heredoc silently
  collapsed the escapes and broke the file. Use the Write tool for anything with
  regex or heavy escaping.
- Backend `package.json` has `"type": "module"`. Ad-hoc CommonJS scratch scripts
  need a `.cjs` extension.
- `mongodb-memory-server` downloads a mongod binary on first install — the
  initial `npm install` took several minutes. It is cached afterwards.
- Vitest resolved to v4 despite a `^3` range in the original install.
- `config/env.ts` validates on import, so **any** env var must be set before the
  first application import. `tests/setup.ts` sets a placeholder `MONGODB_URI` at
  module top level for exactly this reason; `dev-server.ts` uses dynamic imports
  for the same reason.
- Express 5 types `req.params` values as `string | string[]` — use
  `pathParam(req, "id")` from `utils/params.ts`, not a non-null assertion.
- Mongoose 8 deprecated `{ new: true }` on `findOneAndUpdate`; this codebase
  uses `{ returnDocument: "after" }`.
- Code style in this project: comments explain **why**, not what. Several
  non-obvious decisions are documented in-line — preserve those comments when
  editing nearby code.
- Robin asked for a plan and approval **before** building. Keep checking in at
  phase boundaries rather than doing everything silently.

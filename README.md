# QTrip

A travel adventure booking app: browse cities, filter adventures by duration and
category, and reserve a spot.

Built as a React single-page app in TypeScript, backed by a small Express REST API.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Routing | React Router 7 |
| Build | Vite 6 |
| Components | react-bootstrap 2 on Bootstrap 5 |
| Tests | Vitest 3 + React Testing Library |
| API | Express 4 + lowdb |

The repo is an npm workspace with two packages:

| Package | Path | What it is |
| --- | --- | --- |
| `@qtrip/frontend` | `frontend/` | React SPA |
| `@qtrip/backend` | `backend/` | REST API (data lives in `backend/db.json`) |

## Getting started

Requires Node 20 or newer.

```bash
npm install     # installs both workspaces from the repo root
npm run dev     # backend on :8082, frontend on :8081
```

`npm run dev` starts both servers together and opens http://localhost:8081.

### Other commands

| Command | What it does |
| --- | --- |
| `npm test` | Runs the Vitest suite (70 tests) |
| `npm run typecheck` | Type-checks without emitting |
| `npm run build` | Type-checks, then builds to `frontend/dist/` |
| `npm run preview` | Serves the production build |
| `npm run dev:backend` | Backend only, with file watching |
| `npm run dev:frontend` | Frontend only |

## Routes

| Route | Page |
| --- | --- |
| `/` | Cities, with client-side search |
| `/adventures?city=<id>` | Adventures in a city, with filters |
| `/adventures/:adventureId` | Adventure detail, photo carousel, booking form |
| `/reservations` | All reservations |

## Project layout

```
frontend/src/
  api/client.ts        typed fetch wrappers; throws ApiError on failure
  components/          presentational + form components
  pages/               one component per route
  hooks/useAsync.ts    loading/error/data state, ignores superseded requests
  lib/filters.ts       pure filtering logic
  lib/storage.ts       localStorage persistence for filters
  lib/format.ts        currency and date formatting
  types.ts             City, Adventure, AdventureDetail, Reservation, Filters
  styles/styles.css    design tokens and component styles
backend/
  server.js            Express app and routes
  db.json              lowdb data store
```

Filter state lives in `AdventuresPage` and is persisted to `localStorage` on
every change, so it survives a reload. `useAsync` discards results from
superseded requests, so a fast city change cannot leave stale data on screen.

## Pointing at a different backend

The client defaults to `http://localhost:8082`. Override it at build time:

```bash
VITE_BACKEND_ENDPOINT=https://api.example.com npm run build
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/cities` | All cities |
| GET | `/adventures?city=<id>` | Adventures in a city |
| GET | `/adventures/detail?adventure=<id>` | One adventure |
| POST | `/reservations/new` | Create a reservation |
| GET | `/reservations` | All reservations |

`POST /reservations/new` takes `{ name, date, person, adventure }` and responds
with `{ success: true }`.

## Testing

```bash
npm test
```

70 tests across four layers:

- **Pure logic** (`lib/`) — filtering, localStorage persistence, date/currency formatting
- **API client** — request shape, query params, POST body, error handling
- **Components** — rendering, links, form submission, user interaction
- **Pages** — loading, error and empty states against a mocked `fetch`

Tests run under `TZ=Asia/Kolkata`, since the booking timestamp format is
timezone-sensitive.

import { Suspense, lazy } from "react";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { Button } from "./components/ui/Button";
import { CardGridSkeleton, EmptyState } from "./components/ui/States";
import LandingPage from "./pages/LandingPage";

/*
  Routes are split so the first load carries the landing page and its shell,
  not the booking form, the review editor and every account screen as well.

  LandingPage is imported eagerly: it is the entry point for almost every
  visit, so deferring it would only add a round trip before the first paint.
*/
const AdventuresPage = lazy(() => import("./pages/AdventuresPage"));
const AdventureDetailPage = lazy(() => import("./pages/AdventureDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <EmptyState
        icon="compass"
        title="Page not found"
        description="That page does not exist, or it has moved."
        action={
          <Button asChild>
            <Link to="/">Back to all cities</Link>
          </Button>
        }
      />
    </div>
  );
}

/** Shown while a route chunk is fetched — shaped like the page it precedes. */
function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CardGridSkeleton count={4} />
    </div>
  );
}

/**
 * One Suspense boundary around every lazy route, rather than one per page.
 * A pathless layout route renders its children through an Outlet, so the
 * boundary sits above them all and the fallback is defined in a single place.
 */
function SuspendedRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Outlet />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />

        <Route element={<SuspendedRoutes />}>
          <Route path="/adventures" element={<AdventuresPage />} />
          <Route path="/adventures/:adventureId" element={<AdventureDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Everything below needs a session. */}
          <Route element={<RequireAuth />}>
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/account" element={<AccountPage />} />
            {/*
              The old bookings route. Bookings are owner-scoped now, so it lands
              on My Trips — inside the guard, or an anonymous visitor following
              an old link would get a page that immediately 401s.
            */}
            <Route path="/reservations" element={<TripsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

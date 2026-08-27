import { Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { Button } from "./components/ui/Button";
import { EmptyState } from "./components/ui/States";
import AccountPage from "./pages/AccountPage";
import AdventureDetailPage from "./pages/AdventureDetailPage";
import AdventuresPage from "./pages/AdventuresPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SavedPage from "./pages/SavedPage";
import TripsPage from "./pages/TripsPage";

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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
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
            on My Trips — inside the guard, or an anonymous visitor following an
            old link would get a page that immediately 401s.
          */}
          <Route path="/reservations" element={<TripsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

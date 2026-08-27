import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

/**
 * Gate for routes that need a signed-in visitor.
 *
 * The loading branch matters: without it, a page refresh would redirect to
 * /login before the "who am I" request comes back, bouncing an already
 * signed-in visitor out of the page they reloaded.
 */
export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center" aria-busy="true">
        <Loader2 className="size-6 animate-spin text-ink-muted" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Remember where they were going so sign-in can send them back.
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <Outlet />;
}

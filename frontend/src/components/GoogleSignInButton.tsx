import { useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";
import { useAuthProviders } from "../hooks/queries";
import { loadGoogleIdentity } from "../lib/googleIdentity";
import { useAuth } from "../providers/AuthProvider";
import { useTheme } from "../providers/ThemeProvider";
import type { User } from "../types";

interface GoogleSignInButtonProps {
  onSignedIn: (user: User) => void;
  /** "Sign up with" on the register page, "Continue with" elsewhere. */
  intent?: "signin" | "signup";
}

/**
 * Google's own button, rendered by Google Identity Services.
 *
 * Google requires its button to be drawn by its script (for branding and so
 * the credential flow runs in Google's origin), which is why this mounts into
 * an empty div instead of styling a button of our own.
 *
 * Renders nothing at all when the server has no Google client configured, so
 * the sign-in page looks exactly as it did before this feature existed.
 */
export default function GoogleSignInButton({
  onSignedIn,
  intent = "signin",
}: GoogleSignInButtonProps) {
  const { data: providers } = useAuthProviders();
  const { loginWithGoogle } = useAuth();
  const { resolved } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so a new callback identity does not re-render Google's
  // button (which would flicker it) on every parent render.
  // The same goes for loginWithGoogle, whose identity changes with its
  // mutation's state - including mid-sign-in.
  const onSignedInRef = useRef(onSignedIn);
  onSignedInRef.current = onSignedIn;
  const loginRef = useRef(loginWithGoogle);
  loginRef.current = loginWithGoogle;

  const clientId = providers?.google.enabled ? providers.google.clientId : null;

  useEffect(() => {
    if (!clientId || !container.current) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !container.current) return;

        google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: ({ credential }) => {
            setError(null);
            loginRef
              .current(credential)
              .then((user) => onSignedInRef.current(user))
              .catch((err: unknown) =>
                setError(
                  err instanceof ApiError
                    ? err.message
                    : "We could not sign you in with Google. Please try again."
                )
              );
          },
        });

        container.current.replaceChildren();
        google.accounts.id.renderButton(container.current, {
          type: "standard",
          theme: resolved === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: intent === "signup" ? "signup_with" : "continue_with",
          logo_alignment: "center",
          // GIS takes a fixed pixel width; match the form column.
          width: Math.min(400, container.current.offsetWidth || 400),
        });
      })
      .catch(() => {
        if (!cancelled) setError("Google sign-in is unavailable right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, resolved, intent]);

  if (!clientId) return null;

  return (
    // No bottom margin: the form that follows supplies its own top spacing.
    <div className="mt-8">
      {/* Google's iframe is ~44px tall; reserving it stops the form jumping. */}
      <div ref={container} className="flex min-h-11 justify-center" />
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}

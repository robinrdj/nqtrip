/**
 * Loads Google Identity Services, the script behind "Sign in with Google".
 *
 * Loaded on demand rather than from index.html: most visits never reach a
 * sign-in page, and deployments without GOOGLE_CLIENT_ID never need it at all.
 * The promise is shared, so two buttons on one page load it once.
 */

/** The small slice of the GIS API this app uses. */
export interface GoogleIdentity {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }): void;
      renderButton(
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "large" | "medium" | "small";
          text?: "signin_with" | "signup_with" | "continue_with" | "signin";
          shape?: "rectangular" | "pill" | "circle" | "square";
          width?: number;
          logo_alignment?: "left" | "center";
        }
      ): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const SCRIPT_URL = "https://accounts.google.com/gsi/client";

let loading: Promise<GoogleIdentity> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);

  loading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts?.id
        ? resolve(window.google)
        : reject(new Error("Google Identity Services did not initialise"));
    script.onerror = () => {
      // Let a later attempt try again, e.g. after the visitor's connection returns.
      loading = null;
      reject(new Error("Could not load Google Identity Services"));
    };
    document.head.append(script);
  });

  return loading;
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Browsers keep the scroll position across client-side navigations, which
 * lands you halfway down a freshly opened page. Reset it on every route change.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, search]);

  return null;
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Browsers keep the scroll position across client-side navigations, which lands
 * you halfway down a freshly opened page. Reset it on every route change.
 *
 * Deliberately keyed on `pathname` alone, not the query string: filter state
 * now lives in the URL, so reacting to `search` would yank the page back to the
 * top on every keystroke in the search box.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

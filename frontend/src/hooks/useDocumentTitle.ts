import { useEffect } from "react";

const BASE_TITLE = "QTrip";

/** Keeps the browser tab title in step with the current page. */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
  }, [title]);
}

import { vi } from "vitest";

type Route = { status?: number; body: unknown } | (() => Response);

/**
 * Stubs fetch with a table of URL fragments -> responses.
 *
 * The first fragment the URL contains wins, so list the more specific paths
 * first. Anything unmatched is a signed-out 401 for /auth/me and an empty 200
 * otherwise, which is what most components treat as "nothing to show".
 */
export function stubFetch(routes: [fragment: string, route: Route][]) {
  // `_init` is declared so tests can read the method and body a call was sent with.
  const fetchMock = vi.fn((input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input);
    const match = routes.find(([fragment]) => url.includes(fragment));

    if (match) {
      const route = match[1];
      if (typeof route === "function") return Promise.resolve(route());
      return Promise.resolve(Response.json(route.body, { status: route.status ?? 200 }));
    }

    if (url.includes("/auth/me")) {
      return Promise.resolve(
        Response.json({ error: { message: "Not signed in" } }, { status: 401 })
      );
    }
    return Promise.resolve(Response.json({}));
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Every URL the stub has been called with, in order. */
export function calledUrls(fetchMock: ReturnType<typeof stubFetch>): string[] {
  return fetchMock.mock.calls.map((call) => String(call[0]));
}

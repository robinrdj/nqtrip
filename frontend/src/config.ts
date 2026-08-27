/**
 * Backend base URL.
 *
 * Empty by default, which makes every request same-origin: in development Vite
 * proxies /api to localhost:8082, and in production the site is expected to be
 * served behind a proxy or rewrite that does the same.
 *
 * Same-origin matters more than it looks — the auth cookies are then
 * first-party, so they survive browsers that block third-party cookies. Set
 * VITE_BACKEND_ENDPOINT to point at a different host, and make sure that host
 * lists this origin in CORS_ORIGINS.
 */
export const backendEndpoint: string =
  import.meta.env.VITE_BACKEND_ENDPOINT ?? "";

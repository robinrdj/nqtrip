/**
 * Backend base URL.
 *
 * Defaults to the local API server started by `npm run dev`. Override for a
 * deployed build by setting VITE_BACKEND_ENDPOINT at build time.
 */
export const backendEndpoint: string =
  import.meta.env.VITE_BACKEND_ENDPOINT ?? "https://nqtripbackend.onrender.com";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../providers/AuthProvider";
import { ThemeProvider } from "../providers/ThemeProvider";

/**
 * A QueryClient configured for tests.
 *
 * Retries are off so a deliberately failing request surfaces its error on the
 * first attempt instead of after several seconds of backoff, and each test gets
 * a fresh client so nothing leaks between them through the cache.
 */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface Options extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  queryClient?: QueryClient;
  /** Skip AuthProvider for components that do not need a session. */
  withAuth?: boolean;
}

/** Renders a component inside the providers the app supplies at runtime. */
export function renderWithProviders(
  ui: ReactElement,
  { route = "/", queryClient, withAuth = true, ...options }: Options = {}
) {
  const client = queryClient ?? makeTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[route]}>
            {withAuth ? <AuthProvider>{children}</AuthProvider> : children}
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient: client };
}

/** Kept for components that only need routing context. */
export function renderWithRouter(
  ui: ReactElement,
  { route = "/", ...options }: RenderOptions & { route?: string } = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    ),
    ...options,
  });
}

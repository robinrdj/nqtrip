import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { ApiError } from "./api/client";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

import "./styles/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /*
        Retrying a 4xx is pointless — the request was wrong, and sending it
        twice more just delays the error the visitor needs to see. Network and
        5xx failures are worth one more attempt.
      */
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {/* AuthProvider is inside the router because signing out navigates. */}
          <AuthProvider>
            <App />
            <Toaster
              position="bottom-right"
              // Inherits the app's own surface tokens rather than shipping a
              // second, differently-themed palette.
              toastOptions={{
                style: {
                  background: "var(--surface-raised)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  /** True only while the initial "who am I" check is outstanding. */
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<User>;
  /** Exchanges a Google Identity Services credential for a session. */
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const currentUserKey = ["auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: currentUserKey,
    queryFn: async ({ signal }) => {
      try {
        const { user } = await api.fetchCurrentUser(signal);
        // React Query rejects an undefined result, so a malformed body would
        // throw here rather than simply meaning "nobody is signed in".
        return user ?? null;
      } catch (err) {
        // Not being signed in is the normal case for a first visit, not an
        // error worth retrying or surfacing.
        if (err instanceof ApiError && err.isUnauthorized) return null;
        throw err;
      }
    },
    // The session cookie is the source of truth; re-checking on every window
    // focus would fire a request each time the visitor switches tabs.
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data ?? null;

  /**
   * Anything cached under a signed-in identity has to go when the identity
   * changes — wishlist state, reservations, and the `saved` flags baked into
   * adventure responses would otherwise leak between accounts.
   */
  const resetIdentityScopedCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["reservations"] });
    queryClient.removeQueries({ queryKey: ["wishlist"] });
    queryClient.invalidateQueries({ queryKey: ["adventures"] });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: ({ user: next }) => {
      queryClient.setQueryData(currentUserKey, next);
      resetIdentityScopedCache();
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: ({ user: next }) => {
      queryClient.setQueryData(currentUserKey, next);
      resetIdentityScopedCache();
    },
  });

  const googleMutation = useMutation({
    mutationFn: api.loginWithGoogle,
    onSuccess: ({ user: next }) => {
      queryClient.setQueryData(currentUserKey, next);
      resetIdentityScopedCache();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      // Runs on failure too: if the server call did not go through, the local
      // session should still end rather than leaving a half-signed-out UI.
      queryClient.setQueryData(currentUserKey, null);
      resetIdentityScopedCache();
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: isPending,
      isAuthenticated: user !== null,
      login: async (input) => (await loginMutation.mutateAsync(input)).user,
      register: async (input) => (await registerMutation.mutateAsync(input)).user,
      loginWithGoogle: async (credential) =>
        (await googleMutation.mutateAsync(credential)).user,
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
    }),
    [user, isPending, loginMutation, registerMutation, googleMutation, logoutMutation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

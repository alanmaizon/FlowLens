import { createContext, type ReactNode, useContext, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { clearSession, getStoredSession, saveSession } from "@/lib/session";
import type { AuthResponse, AuthSession } from "@/lib/types";

type AuthenticationContextValue = {
  session: AuthSession | null;
  authenticate: (
    email: string,
    password: string,
    mode: "login" | "register",
    displayName?: string,
  ) => Promise<void>;
  logout: () => void;
};

const AuthenticationContext = createContext<AuthenticationContextValue | null>(null);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  async function authenticate(
    email: string,
    password: string,
    mode: "login" | "register",
    displayName?: string,
  ) {
    const url = mode === "register" ? "/auth/register" : "/auth/login";
    const payload =
      mode === "register" ? { email, password, display_name: displayName } : { email, password };
    const { data } = await apiClient.post<AuthResponse>(url, payload);
    const nextSession = { accessToken: data.access_token, user: data.user };
    saveSession(nextSession);
    setSession(nextSession);
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  return (
    <AuthenticationContext.Provider value={{ session, authenticate, logout }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error("useAuthentication must be used within AuthenticationProvider");
  }
  return context;
}

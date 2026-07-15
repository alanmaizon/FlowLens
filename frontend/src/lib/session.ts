import type { AuthSession } from "@/lib/types";

const sessionKey = "flowlens.session";

export function getStoredSession(): AuthSession | null {
  const rawSession = localStorage.getItem(sessionKey);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    localStorage.removeItem(sessionKey);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(sessionKey);
}

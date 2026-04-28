import type { SessionUser } from "../data/models";

const SESSION_KEY = "volunteer-connect-session";

export function saveSession(session: SessionUser, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  otherStorage.removeItem(SESSION_KEY);
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): SessionUser | null {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;

    if (
      typeof parsed.token !== "string" ||
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.isAdmin !== "boolean"
    ) {
      clearSession();
      return null;
    }

    return parsed as SessionUser;
  } catch {
    clearSession();
    return null;
  }
}

export function hasSession() {
  return getSession() !== null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

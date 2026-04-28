import type { SessionUser } from "../data/models";

const SESSION_KEY = "volunteer-connect-session";

export function saveSession(session: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): SessionUser | null {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function hasSession() {
  return getSession() !== null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

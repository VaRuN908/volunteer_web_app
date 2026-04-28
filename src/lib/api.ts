import type {
  AdminDashboard,
  AppContent,
  ConversationPreview,
  ManagedCommunity,
  SessionUser
} from "../data/models";
import { clearSession, getSession } from "./session";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

function buildHeaders(headers?: HeadersInit) {
  const session = getSession();
  return {
    "Content-Type": "application/json",
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(headers ?? {})
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: buildHeaders(options?.headers),
    ...options
  });

  const data = (await response.json()) as T & { error?: string };

  if (response.status === 401) {
    clearSession();
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export function loginUser(email: string, password: string, rememberMe: boolean) {
  return request<SessionUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe })
  });
}

export function signupUser(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  location: string;
  availability: string;
  skills: string[];
  rememberMe: boolean;
}) {
  return request<SessionUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function logoutUser() {
  return request<{ ok: boolean }>("/auth/logout", {
    method: "POST"
  });
}

export function getExploreContent() {
  return request<AppContent["explore"]>("/explore");
}

export function toggleSuggestedConnection(cardId: string) {
  return request<{ connectedCardIds: string[] }>("/explore/connect", {
    method: "POST",
    body: JSON.stringify({ cardId })
  });
}

export function getChatContent() {
  return request<AppContent["chat"]>("/chat");
}

export function sendMessage(conversationId: string, body: string) {
  return request<ConversationPreview>(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
}

export function getProfileContent() {
  return request<AppContent["profile"]>("/profile");
}

export function updateProfile(payload: Pick<AppContent["profile"], "name" | "role" | "about">) {
  return request<AppContent["profile"]>("/profile", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function getAdminDashboard() {
  return request<AdminDashboard>("/admin/dashboard");
}

export function createCommunity(payload: {
  name: string;
  location: string;
  description: string;
  focusRole: string;
}) {
  return request<ManagedCommunity>("/admin/communities", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createTask(payload: {
  communityId: string;
  title: string;
  needCategory: string;
  urgencyScore: number;
  description: string;
  location: string;
  eventDate: string;
  timeRange: string;
  skillsRequired: string[];
}) {
  return request<{ ok: boolean }>("/admin/tasks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function submitSurvey(payload: { communityId: string; rawText: string }) {
  return request<{
    ok: boolean;
    parsed?: { categories: string[]; keywords: string[]; urgency: number; summary: string };
  }>("/admin/surveys", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getSocketUrl() {
  const session = getSession();
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const base = import.meta.env.VITE_WS_BASE ?? `${protocol}://${window.location.host}/ws`;
  const token = session?.token ?? "";
  return `${base}?token=${encodeURIComponent(token)}`;
}

import type { AppContent, ConversationPreview, SessionUser } from "../data/models";

const API_BASE = "http://127.0.0.1:4176/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  const data = (await response.json()) as T & { error?: string };

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

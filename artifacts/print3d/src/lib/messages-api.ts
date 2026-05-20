import { supabase } from "@/lib/supabase";

const API_BASE_URL = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL)
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/+$/, "")
  : "";

function getLegacyAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const trimmedBase = API_BASE_URL.replace(/\/+$/, "");
  const url = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : trimmedBase
      ? `${trimmedBase}${trimmedBase.endsWith("/api") && normalizedPath.startsWith("/api") ? normalizedPath.slice(4) : normalizedPath}`
      : normalizedPath;

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || response.statusText || "Request failed.";
    throw new Error(errorMessage);
  }

  return data as T;
}

export type MessageThreadSummary = {
  id: number;
  counterpart: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    id: number;
    body: string;
    createdAt: string;
    senderId: number;
  } | null;
  unreadCount: number;
  updatedAt: string;
};

export type MessageThreadDetail = {
  id: number;
  counterpart: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  messages: Array<{
    id: number;
    body: string;
    senderId: number;
    isRead: boolean;
    createdAt: string;
  }>;
};

export async function listMessageThreads(search?: string): Promise<{ threads: MessageThreadSummary[] }> {
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = getLegacyAuthToken() || session?.access_token;
  if (!authToken) {
    return { threads: [] };
  }

  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await apiFetch<{ threads: MessageThreadSummary[] }>(`/api/messages/threads${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return { threads: data.threads || [] };
}

export async function getMessageThread(threadId: number): Promise<{ thread: MessageThreadDetail }> {
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = getLegacyAuthToken() || session?.access_token;
  if (!authToken) {
    throw new Error("Not authenticated");
  }

  const data = await apiFetch<{ thread: MessageThreadDetail }>(`/api/messages/threads/${threadId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return data;
}

export async function createMessageThread(participantId: number, message?: string): Promise<{ threadId: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = getLegacyAuthToken() || session?.access_token;
  if (!authToken) {
    throw new Error("Not authenticated");
  }

  const data = await apiFetch<{ threadId: number }>("/api/messages/threads", {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ participantId, message }),
  });

  return data;
}

export async function sendThreadMessage(threadId: number, body: string): Promise<{ message: { id: number; body: string; senderId: number; isRead: boolean; createdAt: string } }> {
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = getLegacyAuthToken() || session?.access_token;
  if (!authToken) {
    throw new Error("Not authenticated");
  }

  const data = await apiFetch<{ message: { id: number; body: string; senderId: number; isRead: boolean; createdAt: string } }>(
    `/api/messages/threads/${threadId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ body }),
    },
  );

  return data;
}

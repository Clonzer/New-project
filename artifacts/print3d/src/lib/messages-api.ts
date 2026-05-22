import { supabase } from "@/lib/supabase";
import { isExpressApiEnabled } from "@/lib/api-url";
import { withApiFetchOptions } from "@/lib/api-fetch";

const configuredApiBase = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL)
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/+$/, "")
  : "";

const API_BASE_URL = (() => {
  if (!configuredApiBase) return "";
  if (typeof window !== "undefined" && window.location.host !== new URL(configuredApiBase, window.location.origin).host) {
    if (configuredApiBase.startsWith("http://localhost") || configuredApiBase.startsWith("http://127.0.0.1") || configuredApiBase.startsWith("https://localhost") || configuredApiBase.startsWith("https://127.0.0.1")) {
      return window.location.origin.replace(/\/+$/, "");
    }
  }
  return configuredApiBase;
})();

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || localStorage.getItem("authToken");
}

function parseJsonBody<T>(text: string, response: Response): T {
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    throw new Error(
      "Messages API returned HTML instead of JSON. Remove VITE_API_URL on Cloudflare or set VITE_ENABLE_EXPRESS_API=false.",
    );
  }

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SyntaxError(`Messages API returned non-JSON (${response.status}).`);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const trimmedBase = API_BASE_URL.replace(/\/+$/, "");
  const url = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : trimmedBase
      ? `${trimmedBase}${trimmedBase.endsWith("/api") && normalizedPath.startsWith("/api") ? normalizedPath.slice(4) : normalizedPath}`
      : normalizedPath;

  const response = await fetch(url, withApiFetchOptions(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  }));

  const text = await response.text();
  const data = parseJsonBody<Record<string, unknown>>(text, response);

  if (!response.ok) {
    const errorMessage = (data?.message as string) || (data?.error as string) || response.statusText || "Request failed.";
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
  if (!isExpressApiEnabled()) {
    return { threads: [] };
  }

  const authToken = await getAuthToken();
  if (!authToken) {
    return { threads: [] };
  }

  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  try {
    const data = await apiFetch<{ threads: MessageThreadSummary[] }>(`/api/messages/threads${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return { threads: data.threads || [] };
  } catch (error) {
    console.warn("Messages API unavailable:", error);
    return { threads: [] };
  }
}

export async function getMessageThread(threadId: number): Promise<{ thread: MessageThreadDetail }> {
  if (!isExpressApiEnabled()) {
    throw new Error("Messaging requires the Express API (not available on Cloudflare-only hosting).");
  }

  const authToken = await getAuthToken();
  if (!authToken) {
    throw new Error("Not authenticated");
  }

  const data = await apiFetch<{ thread: MessageThreadDetail }>(`/api/messages/threads/${threadId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return data;
}

export async function createMessageThread(participantId: number, message?: string): Promise<{ threadId: number }> {
  if (!isExpressApiEnabled()) {
    throw new Error("Messaging requires the Express API (not available on Cloudflare-only hosting).");
  }

  const authToken = await getAuthToken();
  if (!authToken) {
    throw new Error("Not authenticated");
  }

  const data = await apiFetch<{ threadId: number }>("/api/messages/threads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ participantId, message }),
  });

  return data;
}

export async function sendThreadMessage(threadId: number, body: string): Promise<{ message: { id: number; body: string; senderId: number; isRead: boolean; createdAt: string } }> {
  if (!isExpressApiEnabled()) {
    throw new Error("Messaging requires the Express API (not available on Cloudflare-only hosting).");
  }

  const authToken = await getAuthToken();
  if (!authToken) {
    throw new Error("Not authenticated");
  }

  const data = await apiFetch<{ message: { id: number; body: string; senderId: number; isRead: boolean; createdAt: string } }>(
    `/api/messages/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ body }),
    },
  );

  return data;
}

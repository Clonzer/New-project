import { customFetch } from "@workspace/api-client-react";

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

export function listMessageThreads(search?: string) {
  const params = new URLSearchParams();
  if (search?.trim()) {
    params.set("search", search.trim());
  }
  const suffix = params.toString();
  return customFetch<{ threads: MessageThreadSummary[] }>(
    `/api/messages/threads${suffix ? `?${suffix}` : ""}`,
    { credentials: "include" },
  );
}

export function getMessageThread(threadId: number) {
  return customFetch<{ thread: MessageThreadDetail }>(`/api/messages/threads/${threadId}`, {
    credentials: "include",
  });
}

export function createMessageThread(participantId: number, message?: string) {
  return customFetch<{ threadId: number }>("/api/messages/threads", {
    method: "POST",
    body: JSON.stringify({ participantId, message }),
    credentials: "include",
  });
}

export function sendThreadMessage(threadId: number, body: string) {
  return customFetch<{
    message: {
      id: number;
      body: string;
      senderId: number;
      isRead: boolean;
      createdAt: string;
    };
  }>(`/api/messages/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
    credentials: "include",
  });
}

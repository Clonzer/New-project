import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useListUsers } from "@/lib/workspace-api-mock";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Search, Send } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createMessageThread,
  getMessageThread,
  listMessageThreads,
  sendThreadMessage,
  type MessageThreadDetail,
  type MessageThreadSummary,
} from "@/lib/messages-api";

function readRequestedThreadId() {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("threadId");
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatTimestamp(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function Messages() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: usersData } = useListUsers({ limit: 100 });
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(() => readRequestedThreadId());
  const [activeThread, setActiveThread] = useState<MessageThreadDetail | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingThreads(true);
    void listMessageThreads(search)
      .then((data) => {
        if (cancelled) return;
        setThreads(data.threads || []);
        setActiveThreadId((current) => current ?? readRequestedThreadId() ?? (data.threads && data.threads[0]?.id) ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingThreads(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (activeThreadId) {
      url.searchParams.set("threadId", String(activeThreadId));
    } else {
      url.searchParams.delete("threadId");
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) {
      setActiveThread(null);
      return;
    }

    let cancelled = false;
    setIsLoadingThread(true);
    void getMessageThread(activeThreadId)
      .then((data) => {
        if (cancelled) return;
        setActiveThread(data.thread);
        setThreads((current) =>
          current.map((thread) =>
            thread.id === activeThreadId ? { ...thread, unreadCount: 0 } : thread,
          ),
        );
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingThread(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeThreadId]);

  const contacts = useMemo(() => {
    const allUsers = usersData?.users ?? [];
    const synthixTeam = allUsers.find(u => u.id === 2); // Synthix team user
    const regularContacts = allUsers.filter(
      (candidate) =>
        candidate.id !== user?.id &&
        candidate.id !== 2 && // Exclude Synthix team from regular contacts
        !threads.some((thread) => thread.counterpart?.id === candidate.id),
    );

    // Always include Synthix team if not already in a thread
    const synthixInThread = threads.some(thread => thread.counterpart?.id === 2);
    const finalContacts = [...regularContacts];

    if (synthixTeam && !synthixInThread) {
      finalContacts.unshift(synthixTeam); // Add Synthix team at the top
    }

    return finalContacts;
  }, [threads, user?.id, usersData?.users]);

  const startConversation = async (participantId: number) => {
    try {
      const created = await createMessageThread(participantId);
      const next = await listMessageThreads(search);
      setThreads(next.threads);
      setActiveThreadId(created.threadId);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  // Handle URL parameters for contacting Synthix
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const contact = urlParams.get('contact');

    if (contact && user && usersData?.users) {
      // Find Synthix team user (ID: 2)
      const synthixUser = usersData.users.find(u => u.id === 2);
      if (synthixUser && !threads.some(t => t.counterpart?.id === synthixUser.id)) {
        // Start conversation with Synthix team
        startConversation(synthixUser.id);
      }
    }
  }, [location, user, usersData, threads]);

  const handleSendMessage = async () => {
    if (!activeThreadId || !newMessage.trim()) return;

    try {
      setIsSending(true);
      const body = newMessage.trim();
      const sent = await sendThreadMessage(activeThreadId, body);
      setNewMessage("");
      setActiveThread((current) =>
        current
          ? { ...current, messages: [...current.messages, sent.message] }
          : current,
      );
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThreadId
            ? {
                ...thread,
                lastMessage: {
                  id: sent.message.id,
                  body: sent.message.body,
                  createdAt: sent.message.createdAt,
                  senderId: sent.message.senderId,
                },
                updatedAt: sent.message.createdAt,
              }
            : thread,
        ),
      );
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-zinc-400">
          Please sign in to view messages.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" /> Messages
          </h1>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex h-[70vh]">
            <div className="w-80 border-r border-white/10 flex flex-col shrink-0">
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversations"
                    className="bg-black/30 border-white/10 text-white text-sm h-9 pl-9"
                  />
                </div>
              </div>

              <div className="flex-grow overflow-y-auto">
                {isLoadingThreads ? (
                  <div className="p-4 text-sm text-zinc-500">Loading conversations...</div>
                ) : threads.length ? (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`w-full text-left p-4 transition-colors border-b border-white/5 ${
                        activeThreadId === thread.id ? "bg-primary/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent p-0.5 shrink-0">
                          <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                            {thread.counterpart?.avatarUrl ? (
                              <img
                                src={thread.counterpart.avatarUrl}
                                alt={thread.counterpart.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-white text-sm font-medium truncate">
                              {thread.counterpart?.displayName ?? "Unknown user"}
                            </p>
                            <span className="text-[11px] text-zinc-500 shrink-0">
                              {formatTimestamp(thread.lastMessage?.createdAt ?? thread.updatedAt)}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-zinc-500 text-xs truncate">
                              {thread.lastMessage?.body ?? "No messages yet."}
                            </p>
                            {thread.unreadCount > 0 ? (
                              <span className="min-w-[18px] h-[18px] rounded-full bg-primary px-1 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                                {thread.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-zinc-500">No conversations yet.</div>
                )}
              </div>

              <div className="border-t border-white/10 p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Start a chat</p>
                <div className="space-y-2">
                  {contacts.slice(0, 4).map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => void startConversation(candidate.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-primary/40 hover:bg-primary/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{candidate.displayName}</p>
                        <p className="text-xs text-zinc-500">@{candidate.username}</p>
                      </div>
                      <Plus className="h-4 w-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-grow flex flex-col">
              {activeThread ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                        {activeThread.counterpart?.avatarUrl ? (
                          <img
                            src={activeThread.counterpart.avatarUrl}
                            alt={activeThread.counterpart.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {activeThread.counterpart?.displayName ?? "Conversation"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        @{activeThread.counterpart?.username ?? "unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {isLoadingThread ? (
                      <div className="text-sm text-zinc-500">Loading messages...</div>
                    ) : activeThread.messages.length ? (
                      activeThread.messages.map((message) => {
                        const mine = message.senderId === user.id;
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                mine
                                  ? "bg-gradient-to-r from-primary to-accent text-white rounded-br-sm"
                                  : "bg-white/10 text-zinc-200 rounded-bl-sm"
                              }`}
                            >
                              <p>{message.body}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  mine ? "text-white/60" : "text-zinc-500"
                                }`}
                              >
                                {formatTimestamp(message.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-zinc-500">No messages yet. Send the first one.</div>
                    )}
                  </div>

                  <div className="p-4 border-t border-white/10 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="bg-black/30 border-white/10 text-white flex-grow rounded-full"
                    />
                    <Button
                      onClick={() => void handleSendMessage()}
                      disabled={isSending || !newMessage.trim()}
                      className="rounded-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.4)] w-10 h-10 p-0 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    <MessageSquare className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                    <p className="text-white">Select a conversation or start a new one.</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Messages are stored in your database and ready for hosting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Router, type IRouter } from "express";
import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { messageThreadsTable, messagesTable, usersTable } from "@workspace/db/schema";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

function normalizeParticipantPair(userId: number, participantId: number) {
  return userId < participantId
    ? { participantAId: userId, participantBId: participantId }
    : { participantAId: participantId, participantBId: userId };
}

async function ensureThreadForParticipants(userId: number, participantId: number) {
  const pair = normalizeParticipantPair(userId, participantId);
  const [existing] = await db
    .select()
    .from(messageThreadsTable)
    .where(
      and(
        eq(messageThreadsTable.participantAId, pair.participantAId),
        eq(messageThreadsTable.participantBId, pair.participantBId),
      ),
    );

  if (existing) {
    return existing;
  }

  const [thread] = await db.insert(messageThreadsTable).values(pair).returning();
  return thread;
}

async function assertParticipant(threadId: number, userId: number) {
  const [thread] = await db.select().from(messageThreadsTable).where(eq(messageThreadsTable.id, threadId));
  if (!thread) {
    return { error: "not_found" as const };
  }
  if (thread.participantAId !== userId && thread.participantBId !== userId) {
    return { error: "forbidden" as const };
  }
  return { thread };
}

router.get("/messages/threads", requireAuth, async (req: AuthedRequest, res) => {
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const userId = req.auth!.userId;

  const threads = await db
    .select()
    .from(messageThreadsTable)
    .where(
      or(
        eq(messageThreadsTable.participantAId, userId),
        eq(messageThreadsTable.participantBId, userId),
      ),
    )
    .orderBy(desc(messageThreadsTable.lastMessageAt));

  const result = await Promise.all(
    threads.map(async (thread) => {
      const counterpartId =
        thread.participantAId === userId ? thread.participantBId : thread.participantAId;
      const [counterpart] = await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
          displayName: usersTable.displayName,
          avatarUrl: usersTable.avatarUrl,
        })
        .from(usersTable)
        .where(eq(usersTable.id, counterpartId));
      const [lastMessage] = await db
        .select({
          id: messagesTable.id,
          body: messagesTable.body,
          createdAt: messagesTable.createdAt,
          senderId: messagesTable.senderId,
        })
        .from(messagesTable)
        .where(eq(messagesTable.threadId, thread.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);
      const [unreadRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.threadId, thread.id),
            ne(messagesTable.senderId, userId),
            eq(messagesTable.isRead, false),
          ),
        );

      return {
        id: thread.id,
        counterpart,
        lastMessage,
        unreadCount: Number(unreadRow?.count ?? 0),
        updatedAt: thread.updatedAt,
      };
    }),
  );

  const filtered = search
    ? result.filter((thread) => {
        const haystack = `${thread.counterpart?.displayName ?? ""} ${thread.counterpart?.username ?? ""} ${thread.lastMessage?.body ?? ""}`.toLowerCase();
        return haystack.includes(search);
      })
    : result;

  res.json({ threads: filtered });
});

router.post("/messages/threads", requireAuth, async (req: AuthedRequest, res) => {
  const participantId = Number(req.body?.participantId);
  const openingMessage = String(req.body?.message ?? "").trim();
  const userId = req.auth!.userId;

  if (!Number.isFinite(participantId) || participantId <= 0 || participantId === userId) {
    res.status(400).json({ error: "validation_error", message: "Choose a valid participant." });
    return;
  }

  const [participant] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, participantId));
  if (!participant) {
    res.status(404).json({ error: "not_found", message: "The selected user does not exist." });
    return;
  }

  const thread = await ensureThreadForParticipants(userId, participantId);

  if (openingMessage) {
    const [message] = await db
      .insert(messagesTable)
      .values({
        threadId: thread.id,
        senderId: userId,
        body: openingMessage,
      })
      .returning();
    await db
      .update(messageThreadsTable)
      .set({ updatedAt: new Date(), lastMessageAt: message.createdAt })
      .where(eq(messageThreadsTable.id, thread.id));
  }

  res.status(201).json({ threadId: thread.id });
});

router.get("/messages/threads/:threadId", requireAuth, async (req: AuthedRequest, res) => {
  const threadId = Number(req.params.threadId);
  const membership = await assertParticipant(threadId, req.auth!.userId);
  if ("error" in membership) {
    res
      .status(membership.error === "not_found" ? 404 : 403)
      .json({ error: membership.error, message: "You cannot access this conversation." });
    return;
  }

  const counterpartId =
    membership.thread.participantAId === req.auth!.userId
      ? membership.thread.participantBId
      : membership.thread.participantAId;
  const [counterpart] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
    })
    .from(usersTable)
    .where(eq(usersTable.id, counterpartId));
  const messages = await db
    .select({
      id: messagesTable.id,
      body: messagesTable.body,
      senderId: messagesTable.senderId,
      isRead: messagesTable.isRead,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .where(eq(messagesTable.threadId, threadId))
    .orderBy(asc(messagesTable.createdAt));

  await db
    .update(messagesTable)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(messagesTable.threadId, threadId),
        ne(messagesTable.senderId, req.auth!.userId),
        eq(messagesTable.isRead, false),
      ),
    );

  res.json({
    thread: {
      id: membership.thread.id,
      counterpart,
      messages,
    },
  });
});

router.post("/messages/threads/:threadId/messages", requireAuth, async (req: AuthedRequest, res) => {
  const threadId = Number(req.params.threadId);
  const body = String(req.body?.body ?? "").trim();
  if (!body) {
    res.status(400).json({ error: "validation_error", message: "Message body is required." });
    return;
  }

  const membership = await assertParticipant(threadId, req.auth!.userId);
  if ("error" in membership) {
    res
      .status(membership.error === "not_found" ? 404 : 403)
      .json({ error: membership.error, message: "You cannot send messages in this conversation." });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      threadId,
      senderId: req.auth!.userId,
      body,
    })
    .returning();

  await db
    .update(messageThreadsTable)
    .set({ updatedAt: new Date(), lastMessageAt: message.createdAt })
    .where(eq(messageThreadsTable.id, threadId));

  res.status(201).json({ message });
});

export default router;

import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { notificationsTable, usersTable } from "@workspace/db/schema";
import { type AuthedRequest, requireAuth } from "../lib/auth";

export type NotificationType =
  | "order"
  | "order_update"
  | "contest_update"
  | "contest_winner"
  | "system"
  | "message";

export async function createNotification(options: {
  userId: number;
  actorId?: number | null;
  type: NotificationType;
  title: string;
  body: string;
  url?: string | null;
}) {
  const { userId, actorId = null, type, title, body, url = null } = options;
  const [notification] = await db
    .insert(notificationsTable)
    .values({
      userId,
      actorId,
      type,
      title,
      body,
      url,
    })
    .returning();
  return notification;
}

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req: AuthedRequest, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const userId = req.auth!.userId;

  const notifications = await db
    .select({
      id: notificationsTable.id,
      type: notificationsTable.type,
      title: notificationsTable.title,
      body: notificationsTable.body,
      url: notificationsTable.url,
      isRead: notificationsTable.isRead,
      createdAt: notificationsTable.createdAt,
      actorId: notificationsTable.actorId,
    })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ notifications });
});

router.get("/notifications/unread-count", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;
  const [countRow] = await db
    .select({ count: db.sql<number>`count(*)` })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
  res.json({ unreadCount: Number(countRow?.count ?? 0) });
});

router.post("/notifications/:notificationId/read", requireAuth, async (req: AuthedRequest, res) => {
  const notificationId = Number(req.params.notificationId);
  const userId = req.auth!.userId;

  const [notification] = await db
    .select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)));

  if (!notification) {
    res.status(404).json({ error: "not_found", message: "Notification not found" });
    return;
  }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, notificationId));

  res.json({ ok: true });
});

router.post("/notifications/mark-all-read", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
  res.json({ ok: true });
});

export default router;

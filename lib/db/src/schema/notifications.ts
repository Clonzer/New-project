import { boolean, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", [
  "order",
  "order_update",
  "contest_update",
  "contest_winner",
  "system",
  "message",
]);

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  actorId: integer("actor_id"),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  url: text("url"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

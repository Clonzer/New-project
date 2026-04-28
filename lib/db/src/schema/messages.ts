import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const messageThreadsTable = pgTable(
  "message_threads",
  {
    id: serial("id").primaryKey(),
    participantAId: integer("participant_a_id").notNull(),
    participantBId: integer("participant_b_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  },
  (table) => ({
    participantPairIdx: uniqueIndex("message_threads_participant_pair_idx").on(
      table.participantAId,
      table.participantBId,
    ),
  }),
);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  senderId: integer("sender_id").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

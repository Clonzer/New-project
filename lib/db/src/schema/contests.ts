import { pgTable, serial, text, integer, real, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contestStatusEnum = pgEnum("contest_status", ["active", "completed", "cancelled"]);
export const contestCategoryEnum = pgEnum("contest_category", ["sales", "design", "sustainability", "growth", "community"]);

export const contestsTable = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: contestCategoryEnum("category").notNull(),
  status: contestStatusEnum("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  rules: text("rules"),
  prizes: jsonb("prizes").notNull().default([]),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contestParticipantsTable = pgTable("contest_participants", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  userId: integer("user_id").notNull(),
  score: real("score").notNull().default(0),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const contestEntriesTable = pgTable("contest_entries", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  submissionData: jsonb("submission_data"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertContestSchema = createInsertSchema(contestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContestParticipantSchema = createInsertSchema(contestParticipantsTable).omit({ id: true, joinedAt: true });
export const insertContestEntrySchema = createInsertSchema(contestEntriesTable).omit({ id: true, submittedAt: true });

export type Contest = typeof contestsTable.$inferSelect;
export type InsertContest = z.infer<typeof insertContestSchema>;
export type ContestParticipant = typeof contestParticipantsTable.$inferSelect;
export type InsertContestParticipant = z.infer<typeof insertContestParticipantSchema>;
export type ContestEntry = typeof contestEntriesTable.$inferSelect;
export type InsertContestEntry = z.infer<typeof insertContestEntrySchema>;
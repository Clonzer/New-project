import { pgTable, serial, text, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const badgeTypeEnum = pgEnum("badge_type", ["achievement", "contest_winner", "sponsor", "top_rated", "fast_delivery", "quality_maker", "community_leader", "milestone"]);

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: badgeTypeEnum("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  awardedAt: timestamp("awarded_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: text("metadata").array().default([]), // Additional data like contest ID, achievement criteria, etc.
});

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({ id: true, awardedAt: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgesTable.$inferSelect;

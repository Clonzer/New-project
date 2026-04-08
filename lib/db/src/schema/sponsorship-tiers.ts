import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sponsorshipTiersTable = pgTable("sponsorship_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  priceUsd: real("price_usd").notNull(),
  billingPeriod: text("billing_period").notNull().default("monthly"),
  features: text("features").array().notNull().default([]),
  displayOrder: integer("display_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSponsorshipTierSchema = createInsertSchema(sponsorshipTiersTable).omit({ id: true, createdAt: true });
export type InsertSponsorshipTier = z.infer<typeof insertSponsorshipTierSchema>;
export type SponsorshipTier = typeof sponsorshipTiersTable.$inferSelect;
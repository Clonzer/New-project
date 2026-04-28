import { pgTable, serial, integer, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { sponsorshipTiersTable } from "./sponsorship-tiers";

export const sponsorshipTransactionsTable = pgTable("sponsorship_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  tierId: integer("tier_id").notNull().references(() => sponsorshipTiersTable.id),
  amountUsd: real("amount_usd").notNull(),
  status: text("status").notNull().default("pending"),
  stripeChargeId: text("stripe_charge_id"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSponsorshipTransactionSchema = createInsertSchema(sponsorshipTransactionsTable).omit({ id: true, createdAt: true, startedAt: true });
export type InsertSponsorshipTransaction = z.infer<typeof insertSponsorshipTransactionSchema>;
export type SponsorshipTransaction = typeof sponsorshipTransactionsTable.$inferSelect;
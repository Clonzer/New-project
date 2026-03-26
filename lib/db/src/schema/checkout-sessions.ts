import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const checkoutSessionStatusEnum = pgEnum("checkout_session_status", [
  "created",
  "completed",
  "expired",
  "failed",
]);

export const checkoutSessionsTable = pgTable("checkout_sessions", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  provider: text("provider").notNull().default("stripe"),
  providerSessionId: text("provider_session_id").notNull().unique(),
  status: checkoutSessionStatusEnum("status").notNull().default("created"),
  currency: text("currency").notNull().default("usd"),
  amountTotal: real("amount_total").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  payloadJson: text("payload_json").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

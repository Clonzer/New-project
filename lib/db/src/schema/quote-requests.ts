import { pgTable, serial, text, integer, real, timestamp, pgEnum, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteStatusEnum = pgEnum("quote_status", ["pending", "quoted", "accepted", "rejected", "expired"]);

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  budget: real("budget"),
  budgetType: text("budget_type").notNull().default("fixed"), // "fixed" or "hourly"
  files: text("files").array().default([]), // URLs to uploaded files
  requirements: jsonb("requirements").default({}), // Detailed requirements object
  quantity: integer("quantity").notNull().default(1),
  material: text("material"),
  dimensions: jsonb("dimensions"), // { length, width, height, unit }
  quality: text("quality"), // "draft", "standard", "high", "prototype"
  deadline: timestamp("deadline"),
  location: text("location"),
  shippingRequired: boolean("shipping_required").notNull().default(true),
  status: quoteStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quoteResponsesTable = pgTable("quote_responses", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  price: real("price").notNull(),
  estimatedDays: integer("estimated_days").notNull(),
  message: text("message"),
  files: text("files").array().default([]), // URLs to sample files or portfolio pieces
  availability: timestamp("availability"),
  status: quoteStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteResponseSchema = createInsertSchema(quoteResponsesTable).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type InsertQuoteResponse = z.infer<typeof insertQuoteResponseSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
export type QuoteResponse = typeof quoteResponsesTable.$inferSelect;

import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const portfolioTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PortfolioItem = typeof portfolioTable.$inferSelect;

import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  imageUrl: text("image_url"),
  basePrice: real("base_price").notNull(),
  shippingCost: real("shipping_cost").notNull().default(0),
  estimatedDaysMin: integer("estimated_days_min").notNull(),
  estimatedDaysMax: integer("estimated_days_max").notNull(),
  material: text("material"),
  color: text("color"),
  sponsoredUntil: timestamp("sponsored_until"),
  orderCount: integer("order_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

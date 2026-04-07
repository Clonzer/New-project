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
  // New fields
  productType: text("product_type").notNull().default("3d_printing"), // 3d_printing, woodworking, cnc, laser, digital, etc.
  equipmentUsed: integer("equipment_used").array().default([]), // Array of equipment IDs
  equipmentGroups: integer("equipment_groups").array().default([]), // Array of equipment group IDs
  isPrintOnDemand: boolean("is_print_on_demand").notNull().default(false),
  isDigitalProduct: boolean("is_digital_product").notNull().default(false),
  digitalFiles: text("digital_files").array().default([]), // Array of file URLs/keys
  stockType: text("stock_type").notNull().default("inventory"), // inventory, print_on_demand, digital
  orderCount: integer("order_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

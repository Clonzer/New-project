import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orderStatusEnum = pgEnum("order_status", ["pending", "accepted", "printing", "shipped", "delivered", "cancelled"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  listingId: integer("listing_id"),
  title: text("title").notNull(),
  fileUrl: text("file_url"),
  notes: text("notes"),
  material: text("material"),
  color: text("color"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  platformFee: real("platform_fee").notNull(),
  shippingCost: real("shipping_cost").notNull().default(0),
  totalPrice: real("total_price").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  shippingAddress: text("shipping_address").notNull(),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const equipmentGroupsTable = pgTable("equipment_groups", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // e.g., "3d_printer", "cnc", "laser", "woodworking", etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const equipmentTable = pgTable("equipment", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  groupId: integer("group_id").references(() => equipmentGroupsTable.id),
  name: text("name").notNull(),
  model: text("model"),
  manufacturer: text("manufacturer"),
  category: text("category").notNull(), // e.g., "3d_printer", "cnc", "laser", "woodworking", etc.
  specifications: jsonb("specifications"), // JSON object with specs like build volume, power, etc.
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: integer("purchase_price"), // in cents
  status: text("status").notNull().default("operational"), // operational, maintenance, out-of-service
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEquipmentGroupSchema = createInsertSchema(equipmentGroupsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEquipmentSchema = createInsertSchema(equipmentTable).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertEquipmentGroup = z.infer<typeof insertEquipmentGroupSchema>;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type EquipmentGroup = typeof equipmentGroupsTable.$inferSelect;
export type Equipment = typeof equipmentTable.$inferSelect;
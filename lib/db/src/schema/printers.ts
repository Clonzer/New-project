import { pgTable, serial, text, integer, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const printerTechnologyEnum = pgEnum("printer_technology", ["FDM", "SLA", "SLS", "MSLA", "MJF", "DMLS", "other"]);

export const equipmentCategoryEnum = pgEnum("equipment_category", [
  "printing_3d",
  "woodworking",
  "metalworking",
  "services",
  "other",
]);

export const printersTable = pgTable("printers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  equipmentCategory: equipmentCategoryEnum("equipment_category").notNull().default("printing_3d"),
  toolOrServiceType: text("tool_or_service_type"),
  name: text("name").notNull(),
  technology: printerTechnologyEnum("technology").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  buildVolume: text("build_volume"),
  materials: text("materials").array().notNull().default([]),
  layerResolutionMin: real("layer_resolution_min"),
  layerResolutionMax: real("layer_resolution_max"),
  pricePerHour: real("price_per_hour"),
  pricePerGram: real("price_per_gram"),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  imageUrl: text("image_url"),
  totalJobsCompleted: integer("total_jobs_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPrinterSchema = createInsertSchema(printersTable).omit({ id: true, createdAt: true });
export type InsertPrinter = z.infer<typeof insertPrinterSchema>;
export type Printer = typeof printersTable.$inferSelect;

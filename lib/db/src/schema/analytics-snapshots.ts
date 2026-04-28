import { pgTable, serial, text, integer, real, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analyticsPeriodEnum = pgEnum("analytics_period", ["daily", "weekly", "monthly", "yearly"]);

export const analyticsSnapshotsTable = pgTable("analytics_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  period: analyticsPeriodEnum("period").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Sales metrics
  totalOrders: integer("total_orders").notNull().default(0),
  totalRevenue: real("total_revenue").notNull().default(0),
  averageOrderValue: real("average_order_value").notNull().default(0),
  
  // Traffic metrics
  profileViews: integer("profile_views").notNull().default(0),
  listingViews: integer("listing_views").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  
  // Shop performance
  conversionRate: real("conversion_rate").notNull().default(0),
  responseRate: real("response_rate").notNull().default(0),
  averageResponseTime: real("average_response_time").notNull().default(0), // in hours
  
  // Top performing data
  topListings: jsonb("top_listings").default([]), // Array of { listingId, title, views, orders }
  topCategories: jsonb("top_categories").default([]), // Array of { category, count }
  
  // Growth metrics
  newFollowers: integer("new_followers").notNull().default(0),
  repeatCustomers: integer("repeat_customers").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnalyticsSnapshotSchema = createInsertSchema(analyticsSnapshotsTable).omit({ id: true, createdAt: true });
export type InsertAnalyticsSnapshot = z.infer<typeof insertAnalyticsSnapshotSchema>;
export type AnalyticsSnapshot = typeof analyticsSnapshotsTable.$inferSelect;

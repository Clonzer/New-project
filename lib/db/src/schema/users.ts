import { pgTable, serial, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "both"]);
export const shopModeEnum = pgEnum("shop_mode", ["catalog", "open", "both"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  countryCode: text("country_code"),
  languageCode: text("language_code"),
  currencyCode: text("currency_code"),
  role: userRoleEnum("role").notNull().default("buyer"),
  rating: real("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  location: text("location"),
  shopName: text("shop_name"),
  shopMode: shopModeEnum("shop_mode"),
  bannerUrl: text("banner_url"),
  websiteUrl: text("website_url"),
  instagramHandle: text("instagram_handle"),
  supportEmail: text("support_email"),
  shippingRegions: text("shipping_regions"),
  shippingPolicy: text("shipping_policy"),
  taxRate: real("tax_rate").default(0),
  processingDaysMin: integer("processing_days_min").default(1),
  processingDaysMax: integer("processing_days_max").default(7),
  returnPolicy: text("return_policy"),
  customOrderPolicy: text("custom_order_policy"),
  authProvider: text("auth_provider"),
  authProviderSubject: text("auth_provider_subject"),
  platformFeePercent: real("platform_fee_percent").default(10),
  defaultShippingCost: real("default_shipping_cost").default(0),
  totalPrints: integer("total_prints").notNull().default(0),
  totalOrders: integer("total_orders").notNull().default(0),
  /** bcrypt hash; never returned to clients */
  passwordHash: text("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at"),
  emailVerificationCodeHash: text("email_verification_code_hash"),
  emailVerificationExpiresAt: timestamp("email_verification_expires_at"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, joinedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

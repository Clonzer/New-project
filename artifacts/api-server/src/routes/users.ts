import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { portfolioTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody } from "@workspace/api-zod";
import { hash } from "bcryptjs";
import { type AuthedRequest, isOwnerEmail, requireAuth, requireSelf } from "../lib/auth";
import { sendEmailVerificationCode } from "../lib/email-verification";
import { isEmailDeliveryConfigured } from "../lib/mailer";

const router: IRouter = Router();

type UserRow = typeof usersTable.$inferSelect;

function publicUser(u: UserRow) {
  const {
    passwordHash: _p,
    emailVerificationCodeHash: _code,
    emailVerificationExpiresAt: _expires,
    authProviderSubject: _authSubject,
    passwordResetCodeHash: _resetCode,
    passwordResetExpiresAt: _resetExpiry,
    accountStatus: _accountStatus,
    ...rest
  } = u;
  return rest;
}

router.get("/users", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const role = req.query.role as string | undefined;

  let query = db.select().from(usersTable).$dynamic();
  if (role) {
    query = query.where(eq(usersTable.role, role as any));
  }

  const users = await query.limit(limit).offset(offset);
  const total = await db.$count(usersTable);
  res.json({ users: users.map(publicUser), total });
});

router.post("/users", async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data;
  const username = rest.username.trim();
  const displayName = rest.displayName.trim();
  const email = rest.email.trim().toLowerCase();
  const shopName = rest.shopName?.trim() || null;

  if (username.length < 3 || displayName.length < 2) {
    res.status(400).json({
      error: "validation_error",
      message: "Username and display name must contain real characters.",
    });
    return;
  }

  const passwordHash = await hash(password, 12);
  try {
    const [user] = await db
      .insert(usersTable)
      .values({
        ...rest,
        username,
        displayName,
        email,
        shopName,
        location: rest.location?.trim() || null,
        bio: rest.bio?.trim() || null,
        avatarUrl: rest.avatarUrl?.trim() || null,
        countryCode: rest.countryCode?.trim().toUpperCase() || null,
        languageCode: rest.languageCode?.trim() || null,
        currencyCode: rest.currencyCode?.trim().toUpperCase() || null,
        sellerTags: rest.sellerTags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
        sellingRegions: [],
        accountStatus: isOwnerEmail(email) ? "owner" : "member",
        planTier: "starter",
        passwordHash,
      })
      .returning();
    if (isEmailDeliveryConfigured()) {
      try {
        await sendEmailVerificationCode(user.id);
      } catch (error) {
        console.error("sendVerificationAfterSignup", { userId: user.id, error });
      }
    }
    res.status(201).json(publicUser(user));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause =
      e && typeof e === "object" && "cause" in e && e.cause && typeof e.cause === "object"
        ? (e.cause as Record<string, unknown>)
        : undefined;
    const code =
      e && typeof e === "object" && "code" in e && typeof (e as { code?: unknown }).code === "string"
        ? (e as { code: string }).code
        : typeof cause?.["code"] === "string"
          ? (cause["code"] as string)
          : undefined;
    const detail =
      e && typeof e === "object" && "detail" in e && typeof (e as { detail?: unknown }).detail === "string"
        ? (e as { detail: string }).detail
        : typeof cause?.["detail"] === "string"
          ? (cause["detail"] as string)
          : undefined;
    const constraint =
      typeof cause?.["constraint"] === "string" ? (cause["constraint"] as string) : undefined;
    if (/relation .*users.* does not exist|column .* does not exist/i.test(msg)) {
      res.status(503).json({
        error: "schema_not_ready",
        message: "Database schema is not ready yet. Redeploy after migrations complete.",
      });
      return;
    }
    if (code === "42P01" || code === "42703" || code === "42704") {
      res.status(503).json({
        error: "schema_not_ready",
        message: "Database schema is missing required account fields. Redeploy so migrations can finish.",
      });
      return;
    }
    if (code === "23502") {
      res.status(400).json({
        error: "validation_error",
        message: "Required account data is missing or the database schema is out of date.",
      });
      return;
    }
    if (/duplicate key|unique constraint/i.test(msg)) {
      if (/username/i.test(msg)) {
        res.status(409).json({ error: "conflict", message: "Username is already taken." });
        return;
      }
      if (/email/i.test(msg)) {
        res.status(409).json({ error: "conflict", message: "An account with this email already exists." });
        return;
      }
      res.status(409).json({ error: "conflict", message: "A user with these details already exists." });
      return;
    }
    if (code === "23505") {
      res.status(409).json({
        error: "conflict",
        message: detail?.includes("email") ? "An account with this email already exists." : "Username is already taken.",
      });
      return;
    }
    if (code === "23505") {
      if (constraint === "users_username_key" || detail?.includes("(username)=")) {
        res.status(409).json({ error: "conflict", message: "Username is already taken." });
        return;
      }
      if (constraint === "users_email_key" || detail?.includes("(email)=")) {
        res.status(409).json({ error: "conflict", message: "An account with this email already exists." });
        return;
      }
      res.status(409).json({
        error: "conflict",
        message: "An account with these details already exists.",
      });
      return;
    }
    console.error("createUser", { code, msg, detail, error: e });
    res.status(500).json({ error: "server_error", message: "Could not create account. Please try again." });
  }
});

router.get("/users/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }

  const { printersTable, listingsTable, reviewsTable } = await import("@workspace/db/schema");
  const printers = await db.select().from(printersTable).where(eq(printersTable.userId, userId));
  const listings = await db.select().from(listingsTable).where(eq(listingsTable.sellerId, userId)).limit(10);
  const recentReviews = await db.select().from(reviewsTable).where(eq(reviewsTable.revieweeId, userId)).limit(5);
  const portfolio = await db.select().from(portfolioTable).where(eq(portfolioTable.userId, userId));

  res.json({ ...publicUser(user), printers, listings, recentReviews, portfolio, sellerTags: user.sellerTags });
});

router.patch("/users/:userId", requireAuth, requireSelf("userId"), async (req: AuthedRequest, res) => {
  const userId = Number(req.params.userId);
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const normalized = {
    ...parsed.data,
    displayName: parsed.data.displayName?.trim(),
    bio: parsed.data.bio?.trim() || null,
    avatarUrl: parsed.data.avatarUrl?.trim() || null,
    countryCode: parsed.data.countryCode?.trim().toUpperCase() || null,
    languageCode: parsed.data.languageCode?.trim() || null,
    currencyCode: parsed.data.currencyCode?.trim().toUpperCase() || null,
    sellerTags: parsed.data.sellerTags?.map((tag) => tag.trim()).filter(Boolean) ?? undefined,
    sellingRegions: Array.isArray(parsed.data.sellingRegions)
      ? parsed.data.sellingRegions.map((region) => region.trim().toUpperCase()).filter(Boolean)
      : undefined,
    location: parsed.data.location?.trim() || null,
    shopName: parsed.data.shopName?.trim() || null,
    bannerUrl: parsed.data.bannerUrl?.trim() || null,
    shopAnnouncement: parsed.data.shopAnnouncement?.trim() || null,
    brandStory: parsed.data.brandStory?.trim() || null,
    websiteUrl: parsed.data.websiteUrl?.trim() || null,
    instagramHandle: parsed.data.instagramHandle?.trim() || null,
    supportEmail: parsed.data.supportEmail?.trim() || null,
    shippingRegions: parsed.data.shippingRegions?.trim() || null,
    shippingPolicy: parsed.data.shippingPolicy?.trim() || null,
    domesticShippingCost: parsed.data.domesticShippingCost,
    europeShippingCost: parsed.data.europeShippingCost,
    northAmericaShippingCost: parsed.data.northAmericaShippingCost,
    internationalShippingCost: parsed.data.internationalShippingCost,
    freeShippingThreshold: parsed.data.freeShippingThreshold,
    localPickupEnabled: parsed.data.localPickupEnabled,
    returnPolicy: parsed.data.returnPolicy?.trim() || null,
    customOrderPolicy: parsed.data.customOrderPolicy?.trim() || null,
  };
  const [user] = await db.update(usersTable).set(normalized).where(eq(usersTable.id, userId)).returning();
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }
  res.json(publicUser(user));
});

router.get("/users/:userId/portfolio", async (req, res) => {
  const userId = Number(req.params.userId);
  const portfolio = await db.select().from(portfolioTable).where(eq(portfolioTable.userId, userId));
  res.json({ portfolio });
});

router.post("/users/:userId/portfolio", requireAuth, requireSelf("userId"), async (req, res) => {
  const userId = Number(req.params.userId);
  const title = String(req.body?.title ?? "").trim();
  const imageUrl = String(req.body?.imageUrl ?? "").trim();
  const description = String(req.body?.description ?? "").trim() || null;
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
    : [];

  if (!title || !imageUrl) {
    res.status(400).json({ error: "validation_error", message: "Portfolio items need a title and image." });
    return;
  }

  try {
    const [item] = await db
      .insert(portfolioTable)
      .values({ userId, title, imageUrl, description, tags })
      .returning();

    res.status(201).json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/portfolio_items/i.test(message) || /relation .*portfolio_items.* does not exist/i.test(message)) {
      res.status(503).json({
        error: "schema_not_ready",
        message: "Portfolio storage is not ready yet. Redeploy so the latest database migrations can run.",
      });
      return;
    }
    console.error("createPortfolioItem", { userId, error });
    res.status(500).json({
      error: "server_error",
      message: "Could not add portfolio item. Try a smaller image or try again in a moment.",
    });
  }
});

router.delete("/users/:userId/portfolio/:portfolioId", requireAuth, requireSelf("userId"), async (req, res) => {
  const portfolioId = Number(req.params.portfolioId);
  const [deleted] = await db.delete(portfolioTable).where(eq(portfolioTable.id, portfolioId)).returning();
  if (!deleted) {
    res.status(404).json({ error: "not_found", message: "Portfolio item not found." });
    return;
  }
  res.json({ ok: true });
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody } from "@workspace/api-zod";
import { hash } from "bcryptjs";
import { type AuthedRequest, requireAuth, requireSelf } from "../lib/auth";
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

  res.json({ ...publicUser(user), printers, listings, recentReviews });
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
    location: parsed.data.location?.trim() || null,
    shopName: parsed.data.shopName?.trim() || null,
    bannerUrl: parsed.data.bannerUrl?.trim() || null,
    websiteUrl: parsed.data.websiteUrl?.trim() || null,
    instagramHandle: parsed.data.instagramHandle?.trim() || null,
    supportEmail: parsed.data.supportEmail?.trim() || null,
    shippingRegions: parsed.data.shippingRegions?.trim() || null,
    shippingPolicy: parsed.data.shippingPolicy?.trim() || null,
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

export default router;

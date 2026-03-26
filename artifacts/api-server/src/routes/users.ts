import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody } from "@workspace/api-zod";
import { hash } from "bcryptjs";
import { type AuthedRequest, requireAuth, requireSelf } from "../lib/auth";

const router: IRouter = Router();

type UserRow = typeof usersTable.$inferSelect;

function publicUser(u: UserRow) {
  const { passwordHash: _p, ...rest } = u;
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
  const email = rest.email.trim().toLowerCase();
  const passwordHash = await hash(password, 12);
  try {
    const [user] = await db
      .insert(usersTable)
      .values({ ...rest, email, passwordHash })
      .returning();
    res.status(201).json(publicUser(user));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
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
    console.error("createUser", e);
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
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, userId)).returning();
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }
  res.json(publicUser(user));
});

export default router;

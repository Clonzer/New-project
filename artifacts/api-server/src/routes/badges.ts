import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { badgesTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

// GET /badges - List badges with optional user filter
router.get("/badges", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const type = req.query.type as string | undefined;

  let query = db.select({
    id: badgesTable.id,
    userId: badgesTable.userId,
    type: badgesTable.type,
    name: badgesTable.name,
    description: badgesTable.description,
    iconUrl: badgesTable.iconUrl,
    awardedAt: badgesTable.awardedAt,
    expiresAt: badgesTable.expiresAt,
    isActive: badgesTable.isActive,
    metadata: badgesTable.metadata,
    user: {
      id: usersTable.id,
      displayName: usersTable.displayName,
      username: usersTable.username,
      avatarUrl: usersTable.avatarUrl,
    }
  })
  .from(badgesTable)
  .leftJoin(usersTable, eq(badgesTable.userId, usersTable.id))
  .$dynamic();

  if (userId) {
    query = query.where(eq(badgesTable.userId, userId));
  }
  if (type) {
    query = query.where(eq(badgesTable.type, type as any));
  }

  const badges = await query
    .where(eq(badgesTable.isActive, true))
    .orderBy(desc(badgesTable.awardedAt))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(badgesTable).where(eq(badgesTable.isActive, true));
  res.json({ badges, total });
});

// POST /badges - Create a new badge (admin only)
router.post("/badges", requireAuth, async (req: AuthedRequest, res) => {
  const { userId, type, name, description, iconUrl, expiresAt, metadata } = req.body;

  if (!userId || !type || !name) {
    res.status(400).json({ error: "missing_fields", message: "userId, type, and name are required" });
    return;
  }

  try {
    const [badge] = await db.insert(badgesTable).values({
      userId: Number(userId),
      type,
      name,
      description,
      iconUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      metadata: metadata || [],
    }).returning();

    res.status(201).json({ badge });
  } catch (error) {
    console.error("Error creating badge:", error);
    res.status(500).json({ error: "server_error", message: "Failed to create badge" });
  }
});

// GET /badges/user/:userId - Get badges for a specific user
router.get("/badges/user/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  
  if (isNaN(userId)) {
    res.status(400).json({ error: "invalid_user_id", message: "Invalid user ID" });
    return;
  }

  const badges = await db.select()
    .from(badgesTable)
    .where(and(
      eq(badgesTable.userId, userId),
      eq(badgesTable.isActive, true)
    ))
    .orderBy(desc(badgesTable.awardedAt));

  res.json({ badges });
});

export default router;

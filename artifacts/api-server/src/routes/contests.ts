import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contestsTable, contestParticipantsTable, contestEntriesTable } from "@workspace/db/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

// List contests
router.get("/", async (req, res) => {
  const status = req.query.status as string;
  const category = req.query.category as string;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  let whereClause = sql`true`;

  if (status) {
    whereClause = sql`${whereClause} AND ${contestsTable.status} = ${status}`;
  }

  if (category) {
    whereClause = sql`${whereClause} AND ${contestsTable.category} = ${category}`;
  }

  const contests = await db
    .select()
    .from(contestsTable)
    .where(whereClause)
    .orderBy(desc(contestsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(contestsTable)
    .where(whereClause);

  res.json({
    contests: contests.map(contest => ({
      id: contest.id,
      title: contest.title,
      description: contest.description,
      category: contest.category,
      status: contest.status,
      startDate: contest.startDate,
      endDate: contest.endDate,
      rules: contest.rules,
      prizes: contest.prizes,
      createdBy: contest.createdBy,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
    })),
    total: total[0].count,
  });
});

// Create contest (admin only)
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  // For now, allow any authenticated user to create contests
  // In production, this should check for admin/owner status

  const { title, description, category, endDate, rules, prizes } = req.body;

  if (!title || !description || !category || !endDate || !prizes) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" });
    return;
  }

  const [contest] = await db
    .insert(contestsTable)
    .values({
      title,
      description,
      category,
      endDate: new Date(endDate),
      rules,
      prizes,
      createdBy: req.user.id,
    })
    .returning();

  res.status(201).json({
    id: contest.id,
    title: contest.title,
    description: contest.description,
    category: contest.category,
    status: contest.status,
    startDate: contest.startDate,
    endDate: contest.endDate,
    rules: contest.rules,
    prizes: contest.prizes,
    createdBy: contest.createdBy,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
  });
});

// Get contest by ID
router.get("/:contestId", async (req, res) => {
  const contestId = parseInt(req.params.contestId);

  const [contest] = await db
    .select()
    .from(contestsTable)
    .where(eq(contestsTable.id, contestId));

  if (!contest) {
    res.status(404).json({ error: "not_found", message: "Contest not found" });
    return;
  }

  // Get participants
  const participants = await db
    .select()
    .from(contestParticipantsTable)
    .where(eq(contestParticipantsTable.contestId, contestId))
    .orderBy(desc(contestParticipantsTable.score));

  // Get entries
  const entries = await db
    .select()
    .from(contestEntriesTable)
    .where(eq(contestEntriesTable.contestId, contestId))
    .orderBy(desc(contestEntriesTable.submittedAt));

  res.json({
    id: contest.id,
    title: contest.title,
    description: contest.description,
    category: contest.category,
    status: contest.status,
    startDate: contest.startDate,
    endDate: contest.endDate,
    rules: contest.rules,
    prizes: contest.prizes,
    createdBy: contest.createdBy,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
    participants,
    entries,
    leaderboard: participants,
  });
});

// Join contest
router.post("/:contestId/join", requireAuth, async (req: AuthedRequest, res) => {
  const contestId = parseInt(req.params.contestId);

  const [contest] = await db
    .select()
    .from(contestsTable)
    .where(eq(contestsTable.id, contestId));

  if (!contest) {
    res.status(404).json({ error: "not_found", message: "Contest not found" });
    return;
  }

  if (contest.status !== "active") {
    res.status(400).json({ error: "validation_error", message: "Contest is not active" });
    return;
  }

  // Check if user is already participating
  const [existing] = await db
    .select()
    .from(contestParticipantsTable)
    .where(and(
      eq(contestParticipantsTable.contestId, contestId),
      eq(contestParticipantsTable.userId, req.user.id)
    ));

  if (existing) {
    res.status(400).json({ error: "validation_error", message: "Already participating in this contest" });
    return;
  }

  await db.insert(contestParticipantsTable).values({
    contestId,
    userId: req.user.id,
  });

  res.json({ message: "Successfully joined contest" });
});

// Submit contest entry
router.post("/:contestId/entries", requireAuth, async (req: AuthedRequest, res) => {
  const contestId = parseInt(req.params.contestId);
  const { title, description, imageUrl, submissionData } = req.body;

  const [contest] = await db
    .select()
    .from(contestsTable)
    .where(eq(contestsTable.id, contestId));

  if (!contest) {
    res.status(404).json({ error: "not_found", message: "Contest not found" });
    return;
  }

  if (contest.status !== "active") {
    res.status(400).json({ error: "validation_error", message: "Contest is not active" });
    return;
  }

  // Check if user is participating
  const [participant] = await db
    .select()
    .from(contestParticipantsTable)
    .where(and(
      eq(contestParticipantsTable.contestId, contestId),
      eq(contestParticipantsTable.userId, req.user.id)
    ));

  if (!participant) {
    res.status(400).json({ error: "validation_error", message: "Must join contest before submitting entry" });
    return;
  }

  // Check if user already submitted
  const [existing] = await db
    .select()
    .from(contestEntriesTable)
    .where(and(
      eq(contestEntriesTable.contestId, contestId),
      eq(contestEntriesTable.userId, req.user.id)
    ));

  if (existing) {
    res.status(400).json({ error: "validation_error", message: "Already submitted an entry for this contest" });
    return;
  }

  const [entry] = await db
    .insert(contestEntriesTable)
    .values({
      contestId,
      userId: req.user.id,
      title,
      description,
      imageUrl,
      submissionData,
    })
    .returning();

  res.status(201).json(entry);
});

export default router;
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateReviewBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichReview(review: typeof reviewsTable.$inferSelect) {
  const [reviewer] = await db.select({ displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl })
    .from(usersTable).where(eq(usersTable.id, review.reviewerId));
  const [reviewee] = await db.select({ displayName: usersTable.displayName })
    .from(usersTable).where(eq(usersTable.id, review.revieweeId));
  return {
    ...review,
    reviewerName: reviewer?.displayName ?? "Unknown",
    revieweeName: reviewee?.displayName ?? "Unknown",
    reviewerAvatarUrl: reviewer?.avatarUrl ?? null,
  };
}

router.get("/reviews", async (req, res) => {
  const revieweeId = req.query.revieweeId ? Number(req.query.revieweeId) : undefined;
  const reviewerId = req.query.reviewerId ? Number(req.query.reviewerId) : undefined;
  const orderId = req.query.orderId ? Number(req.query.orderId) : undefined;

  let query = db.select().from(reviewsTable).$dynamic();
  if (revieweeId) query = query.where(eq(reviewsTable.revieweeId, revieweeId));
  if (reviewerId) query = query.where(eq(reviewsTable.reviewerId, reviewerId));
  if (orderId) query = query.where(eq(reviewsTable.orderId, orderId));

  const rows = await query;
  const total = rows.length;
  const reviews = await Promise.all(rows.map(enrichReview));
  res.json({ reviews, total });
});

router.post("/reviews", async (req, res) => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const [review] = await db.insert(reviewsTable).values(parsed.data).returning();

  // Update reviewee's rating
  const allReviews = await db.select({ rating: reviewsTable.rating })
    .from(reviewsTable).where(eq(reviewsTable.revieweeId, parsed.data.revieweeId));
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db.update(usersTable)
    .set({ rating: parseFloat(avgRating.toFixed(2)), reviewCount: allReviews.length })
    .where(eq(usersTable.id, parsed.data.revieweeId));

  const enriched = await enrichReview(review);
  res.status(201).json(enriched);
});

export default router;

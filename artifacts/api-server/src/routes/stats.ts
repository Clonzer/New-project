import { Router } from "express";
import { db } from "../db";
import { usersTable, listingsTable, contestsTable, ordersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// Get cached stats for homepage
router.get("/", async (req, res) => {
  try {
    // Get total makers (sellers)
    const makersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(sql`${usersTable.role} IN ('seller', 'both')`);
    
    // Get total projects (listings)
    const projectsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listingsTable);
    
    // Get active contests
    const contestsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contestsTable)
      .where(sql`${contestsTable.status} = 'active'`);
    
    // Get average rating from reviews
    const reviewsResult = await db.execute(sql`
      SELECT AVG(rating)::numeric(3,1) as avg_rating 
      FROM reviews 
      WHERE rating IS NOT NULL
    `);
    
    // Get total orders
    const ordersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(sql`${ordersTable.status} IN ('completed', 'delivered')`);

    res.json({
      totalMakers: makersResult[0]?.count || 0,
      totalProjects: projectsResult[0]?.count || 0,
      activeContests: contestsResult[0]?.count || 0,
      averageRating: reviewsResult.rows[0]?.avg_rating ? parseFloat(reviewsResult.rows[0].avg_rating) : 0,
      totalOrders: ordersResult[0]?.count || 0,
      supportResponseTime: "< 2 hours"
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;

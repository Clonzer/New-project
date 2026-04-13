import { Router } from "express";
import { db } from "@workspace/db";
import { contestsTable, usersTable, listingsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { and, eq, lt, ne } from "drizzle-orm";

const router = Router();

// Update contest statuses based on current time
// This can be triggered via cron job or on page load
router.post("/contests", async (req, res) => {
  try {
    const now = new Date();
    
    // Update scheduled contests to active if start date has passed
    await db.execute(sql`
      UPDATE ${contestsTable}
      SET status = 'active'
      WHERE status = 'scheduled'
      AND ${contestsTable.startDate} <= ${now}
    `);
    
    // Update active contests to judging if end date has passed
    await db.execute(sql`
      UPDATE ${contestsTable}
      SET status = 'judging'
      WHERE status = 'active'
      AND ${contestsTable.endDate} <= ${now}
    `);
    
    // Get updated contests count
    const result = await db
      .select({ 
        active: sql<number>`count(CASE WHEN ${contestsTable.status} = 'active' THEN 1 END)::int`,
        scheduled: sql<number>`count(CASE WHEN ${contestsTable.status} = 'scheduled' THEN 1 END)::int`,
        judging: sql<number>`count(CASE WHEN ${contestsTable.status} = 'judging' THEN 1 END)::int`,
        completed: sql<number>`count(CASE WHEN ${contestsTable.status} = 'completed' THEN 1 END)::int`
      })
      .from(contestsTable);
    
    res.json({
      success: true,
      message: "Contest statuses updated",
      timestamp: now.toISOString(),
      counts: result[0]
    });
  } catch (error) {
    console.error("Failed to update contest statuses:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update contest statuses" 
    });
  }
});

// Health check for cron
router.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "cron-api"
  });
});

// Check and expire plans and sponsorships
router.get("/check-expirations", async (req, res) => {
  try {
    const now = new Date();

    // Expire plans - downgrade to starter if expired
    await db
      .update(usersTable)
      .set({ planTier: 'starter' })
      .where(and(
        lt(usersTable.plan_expires_at, now),
        ne(usersTable.planTier, 'starter')
      ));

    // Expire sponsorships
    await db
      .update(usersTable)
      .set({ isSponsored: false, sponsorship_type: null, sponsorship_expires_at: null })
      .where(lt(usersTable.sponsorship_expires_at, now));

    // Expire listing sponsorships
    await db
      .update(listingsTable)
      .set({ sponsoredUntil: null })
      .where(lt(listingsTable.sponsoredUntil, now));

    res.json({
      success: true,
      message: "Plan and sponsorship expirations checked",
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error("Failed to check expirations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check expirations"
    });
  }
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { contestsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

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

export default router;

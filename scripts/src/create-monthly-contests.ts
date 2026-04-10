import { db } from "@workspace/db";
import { contestsTable, contestParticipantsTable, ordersTable, usersTable } from "@workspace/db/schema";
import { eq, sql, desc, and, isNull } from "drizzle-orm";

const CONTEST_DURATION_DAYS = 30;
const synthixTeamId = 2; // Assuming a stable ID for the Synthix team user

async function closeEndedContests() {
  console.log("Checking for contests to close...");
  const now = new Date();

  const endedContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.status} = 'active' AND ${contestsTable.endDate} <= ${now}`);

  if (endedContests.length === 0) {
    console.log("No contests to close.");
    return;
  }

  for (const contest of endedContests) {
    console.log(`Closing contest: ${contest.title} (ID: ${contest.id})`);

    // 1. Determine Winners
    const winners = await db
      .select()
      .from(contestParticipantsTable)
      .where(eq(contestParticipantsTable.contestId, contest.id))
      .orderBy(desc(contestParticipantsTable.score))
      .limit(3);

    console.log(`Winners for contest ${contest.id}:`, winners.map(w => `User ${w.userId} with score ${w.score}`));

    // 2. Distribute Rewards (Placeholder)
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      const prize = contest.prizes[i]; // Assumes prizes array is ordered by position
      if (prize) {
        console.log(`Awarding prize to User ${winner.userId}: ${prize.description}`);
        // TODO: Implement actual reward logic (e.g., create a notification, update subscription)
        // This is where you'd create a Synthix account message/notification.
      }
    }

    // 3. Update Contest Status
    await db
      .update(contestsTable)
      .set({ status: "closed" })
      .where(eq(contestsTable.id, contest.id));

    console.log(`✅ Contest ${contest.id} has been closed and winners processed.`);
  }
}

async function ensureActiveContests() {
  console.log("Ensuring there are always 2 active contests...");
  const now = new Date();

  const activeContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.status} = 'active'`);

  console.log(`Found ${activeContests.length} active contests.`);

  if (activeContests.length >= 2) {
    console.log("✅ Already have enough active contests.");
    return;
  }

  const contestsToCreate = 2 - activeContests.length;
  console.log(`Need to create ${contestsToCreate} new contest(s).`);

  const contestTemplates = [
    { title: "Monthly Sales Leader", category: "sales", description: "Top sellers by total sales value this month.", rules: "...", prizes: [{ position: 1, description: "Gold Tier" }] },
    { title: "Customer Favorite", category: "growth", description: "Highest rated sellers with at least 10 reviews.", rules: "...", prizes: [{ position: 1, description: "Silver Tier" }] },
    { title: "Most Prints Completed", category: "production", description: "Sellers who complete the most print jobs.", rules: "...", prizes: [{ position: 1, description: "Bronze Tier" }] },
    { title: "Fastest Shipper", category: "logistics", description: "Quickest average time from order to shipment.", rules: "...", prizes: [{ position: 1, description: "Featured Shop" }] }
  ];

  const availableTemplates = contestTemplates.filter(t => 
    !activeContests.some(ac => ac.title === t.title)
  );

  const shuffledTemplates = availableTemplates.sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffledTemplates.slice(0, contestsToCreate);

  for (const template of selectedTemplates) {
    const endDate = new Date(now.getTime() + CONTEST_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const [contest] = await db
      .insert(contestsTable)
      .values({
        ...template,
        endDate,
        createdBy: synthixTeamId,
        status: "active",
      })
      .returning();

    console.log(`✅ Created contest: ${contest.title} (ID: ${contest.id}) - Ends: ${endDate.toISOString()}`);
  }
}

async function contestCycle() {
  console.log("\n--- Running Contest Cycle ---");
  try {
    await closeEndedContests();
    await ensureActiveContests();
    // updateContestScores can be integrated here if needed
  } catch (error) {
    console.error("Error during contest cycle:", error);
  }
  console.log("--- Contest Cycle Finished ---\n");
}

// Run the cycle every hour
const runInterval = 60 * 60 * 1000; // 1 hour
console.log(`Starting contest management script. Will run every ${runInterval / 1000 / 60} minutes.`);
setInterval(contestCycle, runInterval);

// Initial run
contestCycle();

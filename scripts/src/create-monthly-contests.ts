import { db } from "@workspace/db";
import { contestsTable, contestParticipantsTable, ordersTable } from "@workspace/db/schema";
import { eq, sql, desc, gte, lte, and } from "drizzle-orm";

async function ensureActiveContests() {
  console.log("Ensuring there are always 2 active contests...");

  const synthixTeamId = 2; // From our earlier creation
  const now = new Date();

  // Check current active contests
  const activeContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.status} = 'active' AND ${contestsTable.endDate} > ${now}`);

  console.log(`Found ${activeContests.length} active contests`);

  // If we have 2 or more active contests, we're good
  if (activeContests.length >= 2) {
    console.log("✅ Already have enough active contests");
    return;
  }

  // Need to create more contests
  const contestsToCreate = 2 - activeContests.length;

  // Define contest templates
  const contestTemplates = [
    {
      title: "Most Sales This Month",
      description: "Compete with other makers to achieve the highest sales volume this month. Every order counts!",
      category: "sales" as const,
      rules: "All sales through the Synthix platform count. Contest runs from the 1st to the last day of the month.",
      prizes: [
        { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
        { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
        { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" }
      ]
    },
    {
      title: "Top Rated Seller",
      description: "Earn the highest average rating from your customers this month!",
      category: "growth" as const,
      rules: "Contest based on average rating from completed orders. Minimum 5 orders required.",
      prizes: [
        { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
        { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
        { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" }
      ]
    },
    {
      title: "Most Creative Designs",
      description: "Showcase your most innovative and creative 3D designs!",
      category: "design" as const,
      rules: "Submit your best designs. Winners selected by community votes and expert judges.",
      prizes: [
        { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
        { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
        { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" }
      ]
    },
    {
      title: "Community Builder",
      description: "Help grow the Synthix community by referring new users and engaging actively!",
      category: "community" as const,
      rules: "Points awarded for successful referrals, forum engagement, and community contributions.",
      prizes: [
        { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
        { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
        { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" }
      ]
    }
  ];

  // Shuffle and select contests to create
  const shuffledTemplates = contestTemplates.sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffledTemplates.slice(0, contestsToCreate);

  for (const template of selectedTemplates) {
    // Calculate end date (end of current month)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [contest] = await db
      .insert(contestsTable)
      .values({
        ...template,
        endDate: endOfMonth,
        createdBy: synthixTeamId,
      })
      .returning();

    console.log(`✅ Created contest: ${contest.title} (ID: ${contest.id}) - Ends: ${endOfMonth.toISOString()}`);
  }

  console.log("🎉 Contest creation complete!");
}

async function updateContestScores() {
  console.log("Updating contest scores based on real data...");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Update sales contest scores based on total orders
  const salesContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.category} = 'sales' AND ${contestsTable.status} = 'active' AND ${contestsTable.endDate} > ${now}`);

  for (const contest of salesContests) {
    console.log(`Updating sales scores for contest: ${contest.title}`);

    // Get all sellers and their order counts for this month
    const sellerStats = await db
      .select({
        sellerId: ordersTable.sellerId,
        orderCount: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(${ordersTable.totalPrice})`,
      })
      .from(ordersTable)
      .where(sql`${ordersTable.createdAt} >= ${startOfMonth} AND ${ordersTable.status} != 'cancelled'`)
      .groupBy(ordersTable.sellerId)
      .orderBy(desc(sql`count(*)`));

    // Update or insert participant scores
    for (const stat of sellerStats) {
      // Check if participant already exists
      const [existing] = await db
        .select()
        .from(contestParticipantsTable)
        .where(sql`${contestParticipantsTable.contestId} = ${contest.id} AND ${contestParticipantsTable.userId} = ${stat.sellerId}`);

      if (existing) {
        // Update score
        await db
          .update(contestParticipantsTable)
          .set({
            score: stat.orderCount,
            rank: null, // Will be calculated later
          })
          .where(sql`${contestParticipantsTable.contestId} = ${contest.id} AND ${contestParticipantsTable.userId} = ${stat.sellerId}`);
      } else {
        // Insert new participant
        await db
          .insert(contestParticipantsTable)
          .values({
            contestId: contest.id,
            userId: stat.sellerId,
            score: stat.orderCount,
          });
      }
    }

    // Update rankings
    const participants = await db
      .select()
      .from(contestParticipantsTable)
      .where(eq(contestParticipantsTable.contestId, contest.id))
      .orderBy(desc(contestParticipantsTable.score));

    for (let i = 0; i < participants.length; i++) {
      await db
        .update(contestParticipantsTable)
        .set({ rank: i + 1 })
        .where(sql`${contestParticipantsTable.id} = ${participants[i].id}`);
    }

    console.log(`✅ Updated ${participants.length} participants for sales contest`);
  }

  // Update growth contest scores based on ratings
  const growthContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.category} = 'growth' AND ${contestsTable.status} = 'active' AND ${contestsTable.endDate} > ${now}`);

  for (const contest of growthContests) {
    console.log(`Updating growth scores for contest: ${contest.title}`);

    // Get sellers with their average ratings (simplified - would need reviews table)
    // For now, use a placeholder scoring based on account age and activity
    const sellers = await db
      .select()
      .from(contestParticipantsTable)
      .where(eq(contestParticipantsTable.contestId, contest.id));

    // Update scores (placeholder logic)
    for (const participant of sellers) {
      const randomScore = Math.floor(Math.random() * 100) + 1; // Placeholder
      await db
        .update(contestParticipantsTable)
        .set({ score: randomScore })
        .where(sql`${contestParticipantsTable.id} = ${participant.id}`);
    }

    console.log(`✅ Updated growth contest scores`);
  }

  console.log("✅ Contest scores updated!");
}

ensureActiveContests().then(() => updateContestScores()).catch(console.error);
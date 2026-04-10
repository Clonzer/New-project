import { db } from "@workspace/db";
import { contestsTable, contestParticipantsTable, notificationsTable, usersTable } from "@workspace/db/schema";
import { eq, lte, desc, sql } from "drizzle-orm";

async function processCompletedContests() {
  console.log("Processing completed contests...");

  const now = new Date();

  // Find contests that have ended
  const completedContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.endDate} <= ${now} AND ${contestsTable.status} = 'active'`);

  for (const contest of completedContests) {
    console.log(`Processing contest: ${contest.title}`);

    // Get participants ordered by score
    const participants = await db
      .select({
        userId: contestParticipantsTable.userId,
        score: contestParticipantsTable.score,
        username: usersTable.username,
        displayName: usersTable.displayName,
        email: usersTable.email,
      })
      .from(contestParticipantsTable)
      .innerJoin(usersTable, eq(contestParticipantsTable.userId, usersTable.id))
      .where(eq(contestParticipantsTable.contestId, contest.id))
      .orderBy(desc(contestParticipantsTable.score))
      .limit(3);

    if (participants.length === 0) {
      console.log(`No participants for contest: ${contest.title}`);
      continue;
    }

    // Update contest status to completed
    await db
      .update(contestsTable)
      .set({ status: "completed" })
      .where(eq(contestsTable.id, contest.id));

    // Send messages to winners (simulate messaging)
    const prizes = contest.prizes as any[];
    for (let i = 0; i < Math.min(participants.length, prizes.length); i++) {
      const winner = participants[i];
      const prize = prizes[i];

      console.log(`🏆 Winner ${i + 1}: ${winner.displayName} (${winner.email})`);
      console.log(`   Prize: ${prize.title} - ${prize.description}`);
      console.log(`   Score: ${winner.score}`);

      await db.insert(notificationsTable).values({
        userId: winner.userId,
        actorId: null,
        type: "contest_winner",
        title: `You placed #${i + 1} in ${contest.title}`,
        body: `Congratulations! You won ${prize.title} in the ${contest.title} contest. Prize: ${prize.description}`,
        url: "/contests",
      });
    }

    console.log(`✅ Contest "${contest.title}" completed with ${participants.length} participants\n`);
  }

  console.log("🎉 Contest processing complete!");
}

processCompletedContests().catch(console.error);
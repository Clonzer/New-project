import { db } from "@workspace/db";
import { contestsTable } from "@workspace/db/schema";

async function checkContests() {
  const contests = await db.select().from(contestsTable);
  console.log("Contests in database:");
  contests.forEach(contest => {
    console.log(`- ${contest.id}: ${contest.title} (${contest.category}) - ${contest.status}`);
  });
}

checkContests().catch(console.error);
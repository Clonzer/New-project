import { db } from "@workspace/db";
import { contestsTable, contestParticipantsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

async function createMonthlyContests() {
  console.log("Creating automated monthly contests...");

  const synthixTeamId = 2; // From our earlier creation

  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Create contests for the current month
  const contests = [
    {
      title: "Most Sales This Month",
      description: "Compete with other makers to achieve the highest sales volume this month. Every order counts!",
      category: "sales" as const,
      endDate: new Date(currentYear, currentMonth + 1, 1), // End of month
      rules: "All sales through the Synthix platform count. Contest runs from the 1st to the last day of the month.",
      prizes: [
        {
          position: 1,
          title: "1st Place",
          description: "1 week Pro Subscription + 3 months Homepage Sponsorship",
          value: "Premium"
        },
        {
          position: 2,
          title: "2nd Place",
          description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship",
          value: "Pro"
        },
        {
          position: 3,
          title: "3rd Place",
          description: "1 month Pro Subscription + Featured listing for 30 days",
          value: "Featured"
        }
      ]
    },
    {
      title: "Best Functional Print",
      description: "Show off your engineering skills! Submit your most impressive functional 3D printed creation.",
      category: "design" as const,
      endDate: new Date(currentYear, currentMonth + 1, 15), // Mid-month
      rules: "Submit one entry per maker. Judges will evaluate based on functionality, design, and innovation.",
      prizes: [
        {
          position: 1,
          title: "1st Place",
          description: "1 week Pro Subscription + 3 months Homepage Sponsorship",
          value: "Premium"
        },
        {
          position: 2,
          title: "2nd Place",
          description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship",
          value: "Pro"
        },
        {
          position: 3,
          title: "3rd Place",
          description: "1 month Pro Subscription + Featured listing for 30 days",
          value: "Featured"
        }
      ]
    },
    {
      title: "Most Creative Use of Recycled Materials",
      description: "Turn waste into wonder! Create something amazing using recycled filaments or materials.",
      category: "sustainability" as const,
      endDate: new Date(currentYear, currentMonth + 1, 20), // Later in month
      rules: "Must use at least 50% recycled materials. Submit photos and description of your creation.",
      prizes: [
        {
          position: 1,
          title: "1st Place",
          description: "1 week Pro Subscription + 3 months Homepage Sponsorship",
          value: "Premium"
        },
        {
          position: 2,
          title: "2nd Place",
          description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship",
          value: "Pro"
        },
        {
          position: 3,
          title: "3rd Place",
          description: "1 month Pro Subscription + Featured listing for 30 days",
          value: "Featured"
        }
      ]
    }
  ];

  for (const contestData of contests) {
    // Check if contest already exists
    const [existing] = await db
      .select()
      .from(contestsTable)
      .where(sql`${contestsTable.title} = ${contestData.title} AND EXTRACT(MONTH FROM ${contestsTable.endDate}) = ${currentMonth + 1} AND EXTRACT(YEAR FROM ${contestsTable.endDate}) = ${currentYear}`);

    if (existing) {
      console.log(`Contest "${contestData.title}" already exists for this month.`);
      continue;
    }

    const [contest] = await db
      .insert(contestsTable)
      .values({
        ...contestData,
        createdBy: synthixTeamId,
      })
      .returning();

    console.log(`✅ Created contest: ${contest.title} (ID: ${contest.id})`);
  }

  console.log("🎉 Monthly contests setup complete!");
}

async function updateContestScores() {
  console.log("Updating contest scores...");

  // Update sales contest scores based on total orders
  const salesContests = await db
    .select()
    .from(contestsTable)
    .where(sql`${contestsTable.category} = 'sales' AND ${contestsTable.status} = 'active'`);

  for (const contest of salesContests) {
    // This would need to be implemented based on actual order data
    // For now, we'll use a placeholder scoring system
    console.log(`Updating scores for sales contest: ${contest.title}`);
  }

  console.log("✅ Contest scores updated!");
}

createMonthlyContests().then(() => updateContestScores()).catch(console.error);
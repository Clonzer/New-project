import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { hash } from "bcryptjs";

async function createSynthixAccounts() {
  console.log("Creating Synthix brand accounts...");

  // Generate random password for Synthix Team
  const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  const passwordHash = await hash(randomPassword, 10);

  // Create Synthix brand account for messaging winners
  const [synthixBrand] = await db.insert(usersTable).values([
    {
      username: "synthix_brand",
      displayName: "Synthix Team",
      email: "winners@synthix.com",
      bio: "Official Synthix brand account for contest announcements and winner notifications. Bringing makers together through exciting challenges and rewards.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=synthix",
      role: "seller",
      location: "San Francisco, CA",
      shopName: "Synthix Contests",
      shopMode: "catalog",
      accountStatus: "partner",
      planTier: "enterprise",
      platformFeePercent: 0, // No fees for brand account
      totalPrints: 0,
      totalOrders: 0,
      rating: 5.0,
      reviewCount: 0,
    },
  ]).returning();

  // Create Synthix Team enterprise account
  const [synthixTeam] = await db.insert(usersTable).values([
    {
      username: "synthix_team",
      displayName: "Synthix Team",
      email: "team@synthix.com",
      bio: "Synthix platform administrators and contest organizers. Managing the marketplace and running monthly maker challenges.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=synthix-team",
      role: "both",
      location: "San Francisco, CA",
      accountStatus: "vip",
      planTier: "enterprise",
      passwordHash,
      totalPrints: 0,
      totalOrders: 0,
      rating: 5.0,
      reviewCount: 0,
    },
  ]).returning();

  console.log("✅ Synthix brand account created:");
  console.log(`   Username: synthix_brand`);
  console.log(`   Display Name: Synthix Team`);
  console.log(`   Email: winners@synthix.com`);
  console.log(`   User ID: ${synthixBrand.id}`);

  console.log("\n✅ Synthix Team enterprise account created:");
  console.log(`   Username: synthix_team`);
  console.log(`   Display Name: Synthix Team`);
  console.log(`   Email: team@synthix.com`);
  console.log(`   Password: ${randomPassword}`);
  console.log(`   User ID: ${synthixTeam.id}`);

  console.log("\n🎉 Synthix accounts setup complete!");
}

createSynthixAccounts().catch(console.error);
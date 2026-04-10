import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, printersTable, listingsTable, sponsorshipTiersTable, sponsorshipTransactionsTable } from "@workspace/db/schema";
import { desc, eq, or, sql, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/sellers", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const sellerFilter = or(eq(usersTable.role, "seller"), eq(usersTable.role, "both"));

  const sellers = await db.select().from(usersTable)
    .where(sellerFilter)
    .orderBy(
      desc(sql`case when ${usersTable.profileSponsoredUntil} is not null and ${usersTable.profileSponsoredUntil} > now() then 1 else 0 end`),
      desc(sql`coalesce(${usersTable.rating}, 0)`),
      desc(usersTable.reviewCount),
      desc(usersTable.totalPrints),
    )
    .limit(limit).offset(offset);

  const total = await db.$count(usersTable, sellerFilter);

  const enriched = await Promise.all(sellers.map(async (s) => {
    const printers = await db.select({ id: printersTable.id })
      .from(printersTable).where(eq(printersTable.userId, s.id));
    const listings = await db.select({ id: listingsTable.id })
      .from(listingsTable).where(eq(listingsTable.sellerId, s.id));
    return {
      id: s.id,
      username: s.username,
      displayName: s.displayName,
      shopName: s.shopName,
      bio: s.bio,
      avatarUrl: s.avatarUrl,
      bannerUrl: s.bannerUrl,
      rating: s.rating,
      reviewCount: s.reviewCount,
      location: s.location,
      emailVerifiedAt: s.emailVerifiedAt,
      shopMode: s.shopMode,
      sellerTags: s.sellerTags,
      profileSponsoredUntil: s.profileSponsoredUntil,
      totalPrints: s.totalPrints,
      printerCount: printers.length,
      listingCount: listings.length,
      joinedAt: s.joinedAt,
    };
  }));

  res.json({ sellers: enriched, total });
});

// Get available sponsorship tiers
router.get("/sellers/sponsorship-tiers", async (req, res) => {
  try {
    const tiers = await db.select()
      .from(sponsorshipTiersTable)
      .orderBy(sponsorshipTiersTable.displayOrder);

    res.json({ tiers });
  } catch (error) {
    console.error("Error fetching sponsorship tiers:", error);
    res.status(500).json({ error: "Failed to fetch sponsorship tiers" });
  }
});

// Get user's sponsorship status
router.get("/sellers/:id/sponsorship", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await db.select({
      id: usersTable.id,
      sponsorshipTier: usersTable.sponsorshipTier,
      sponsorshipExpiresAt: usersTable.sponsorshipExpiresAt,
      sponsoredUntil: usersTable.sponsoredUntil,
      featured: usersTable.featured,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

    if (!user.length) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get current tier details
    const currentTier = await db.select()
      .from(sponsorshipTiersTable)
      .where(eq(sponsorshipTiersTable.slug, user[0].sponsorshipTier))
      .limit(1);

    // Get recent transactions
    const transactions = await db.select()
      .from(sponsorshipTransactionsTable)
      .where(eq(sponsorshipTransactionsTable.userId, userId))
      .orderBy(desc(sponsorshipTransactionsTable.createdAt))
      .limit(5);

    res.json({
      sponsorship: {
        ...user[0],
        currentTier: currentTier[0] || null,
        transactions,
      }
    });
  } catch (error) {
    console.error("Error fetching user sponsorship:", error);
    res.status(500).json({ error: "Failed to fetch sponsorship status" });
  }
});

// Activate or update sponsorship tier
router.post("/sellers/:id/sponsorship", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { tierSlug, stripeToken } = req.body;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    if (!tierSlug) {
      res.status(400).json({ error: "Tier slug is required" });
      return;
    }

    // Get the requested tier
    const tier = await db.select()
      .from(sponsorshipTiersTable)
      .where(eq(sponsorshipTiersTable.slug, tierSlug))
      .limit(1);

    if (!tier.length) {
      res.status(404).json({ error: "Sponsorship tier not found" });
      return;
    }

    const selectedTier = tier[0];

    // For free tier, just update the user
    if (selectedTier.priceUsd === 0) {
      await db.update(usersTable)
        .set({
          sponsorshipTier: selectedTier.slug,
          sponsorshipExpiresAt: null,
          sponsoredUntil: null,
          featured: false,
        })
        .where(eq(usersTable.id, userId));

      res.json({
        success: true,
        message: "Sponsorship updated to free tier",
        tier: selectedTier
      });
      return;
    }

    // For paid tiers, we would normally process payment here
    // For now, we'll simulate successful payment processing
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Monthly billing

    // Update user sponsorship
    await db.update(usersTable)
      .set({
        sponsorshipTier: selectedTier.slug,
        sponsorshipExpiresAt: expiresAt,
        sponsoredUntil: expiresAt,
        featured: selectedTier.slug === 'featured' || selectedTier.slug === 'vip' || selectedTier.slug === 'partner',
      })
      .where(eq(usersTable.id, userId));

    // If this is a featured tier, ensure only one featured shop
    if (selectedTier.slug === 'featured' || selectedTier.slug === 'vip' || selectedTier.slug === 'partner') {
      // Remove featured status from other shops
      await db.update(usersTable)
        .set({ featured: false })
        .where(and(
          eq(usersTable.featured, true),
          sql`${usersTable.id} != ${userId}`
        ));
    }

    // Create transaction record
    await db.insert(sponsorshipTransactionsTable).values({
      userId,
      tierId: selectedTier.id,
      amountUsd: selectedTier.priceUsd,
      status: 'completed',
      stripeChargeId: stripeToken || `simulated_${Date.now()}`,
      expiresAt,
    });

    res.json({
      success: true,
      message: `Sponsorship activated for ${selectedTier.name} tier`,
      tier: selectedTier,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error("Error activating sponsorship:", error);
    res.status(500).json({ error: "Failed to activate sponsorship" });
  }
});

// Cancel sponsorship
router.delete("/sellers/:id/sponsorship", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    // Update user to free tier
    await db.update(usersTable)
      .set({
        sponsorshipTier: 'free',
        sponsorshipExpiresAt: null,
        sponsoredUntil: null,
        featured: false,
      })
      .where(eq(usersTable.id, userId));

    res.json({
      success: true,
      message: "Sponsorship cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling sponsorship:", error);
    res.status(500).json({ error: "Failed to cancel sponsorship" });
  }
});

export default router;

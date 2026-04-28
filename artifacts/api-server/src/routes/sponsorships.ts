import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, sponsorshipTiersTable, sponsorshipTransactionsTable } from "@workspace/db/schema";
import { eq, and, desc, gte, isNotNull } from "drizzle-orm";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

// GET /sponsorships/featured - Get featured/sponsored shops
router.get("/sponsorships/featured", async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const tier = req.query.tier as string | undefined; // gold, silver, premium

  let query = db.select({
    id: usersTable.id,
    displayName: usersTable.displayName,
    username: usersTable.username,
    avatarUrl: usersTable.avatarUrl,
    bannerUrl: usersTable.bannerUrl,
    shopName: usersTable.shopName,
    sellerTags: usersTable.sellerTags,
    rating: usersTable.rating,
    reviewCount: usersTable.reviewCount,
    totalOrders: usersTable.totalOrders,
    sponsorshipTier: usersTable.sponsorshipTier,
    sponsorshipExpiresAt: usersTable.sponsorshipExpiresAt,
    sponsoredUntil: usersTable.sponsoredUntil,
    featured: usersTable.featured,
  })
  .from(usersTable)
  .$dynamic();

  // Filter for sponsored users
  query = query.where(and(
    isNotNull(usersTable.sponsoredUntil),
    gte(usersTable.sponsoredUntil, new Date())
  ));

  if (tier) {
    query = query.where(eq(usersTable.sponsorshipTier, tier));
  }

  const sponsoredShops = await query
    .orderBy(desc(usersTable.sponsoredUntil))
    .limit(limit);

  // Transform to match frontend interface
  const transformedShops = sponsoredShops.map(shop => {
    const promotionLevel = shop.sponsorshipTier === 'premium' ? 10 : 
                          shop.sponsorshipTier === 'gold' ? 8 : 
                          shop.sponsorshipTier === 'silver' ? 5 : 3;

    return {
      id: shop.id.toString(),
      name: shop.shopName || shop.displayName,
      avatar: shop.avatarUrl || `https://api.pravatar.cc/150?u=${shop.username}`,
      banner: shop.bannerUrl || `https://images.unsplash.com/photo-${Math.random() * 1000000000}?w=800&h=400&fit=crop`,
      specialty: shop.sellerTags?.[0] || "3D Printing Services",
      views: shop.totalOrders * 25 + Math.floor(Math.random() * 1000), // Estimate views from orders
      tier: shop.sponsorshipTier || 'silver',
      promotionLevel,
      rating: shop.rating || 0,
      orderCount: shop.totalOrders || 0,
    };
  });

  res.json({ sponsoredShops: transformedShops });
});

// GET /sponsorships/tiers - Get available sponsorship tiers
router.get("/sponsorships/tiers", async (req, res) => {
  const tiers = await db.select()
    .from(sponsorshipTiersTable)
    .orderBy(sponsorshipTiersTable.displayOrder);

  res.json({ tiers });
});

// POST /sponsorships/purchase - Purchase a sponsorship (requires auth)
router.post("/sponsorships/purchase", requireAuth, async (req: AuthedRequest, res) => {
  const { tierId, paymentMethodId } = req.body;
  const userId = req.user!.id;

  if (!tierId) {
    res.status(400).json({ error: "missing_tier", message: "Sponsorship tier is required" });
    return;
  }

  try {
    // Get tier details
    const [tier] = await db.select()
      .from(sponsorshipTiersTable)
      .where(eq(sponsorshipTiersTable.id, tierId));

    if (!tier) {
      res.status(404).json({ error: "tier_not_found", message: "Sponsorship tier not found" });
      return;
    }

    // Calculate sponsorship period
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    // Update user's sponsorship
    await db.update(usersTable)
      .set({
        sponsorshipTier: tier.slug,
        sponsorshipExpiresAt: endDate,
        sponsoredUntil: endDate,
      })
      .where(eq(usersTable.id, userId));

    // Record transaction
    await db.insert(sponsorshipTransactionsTable).values({
      userId,
      tierId,
      amount: tier.priceUsd,
      currency: 'USD',
      status: 'completed',
      startDate,
      endDate,
    });

    res.status(201).json({ 
      message: "Sponsorship purchased successfully",
      tier: tier.slug,
      expiresAt: endDate
    });
  } catch (error) {
    console.error("Error purchasing sponsorship:", error);
    res.status(500).json({ error: "server_error", message: "Failed to purchase sponsorship" });
  }
});

export default router;

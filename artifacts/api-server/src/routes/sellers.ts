import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, printersTable, listingsTable } from "@workspace/db/schema";
import { desc, eq, or, sql } from "drizzle-orm";

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

export default router;

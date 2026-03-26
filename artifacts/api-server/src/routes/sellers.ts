import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, printersTable, listingsTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";

const router: IRouter = Router();

router.get("/sellers", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

  const sellers = await db.select().from(usersTable)
    .where(or(eq(usersTable.role, "seller"), eq(usersTable.role, "both")))
    .limit(limit).offset(offset);

  const total = sellers.length;

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
      rating: s.rating,
      reviewCount: s.reviewCount,
      location: s.location,
      shopMode: s.shopMode,
      totalPrints: s.totalPrints,
      printerCount: printers.length,
      listingCount: listings.length,
      joinedAt: s.joinedAt,
    };
  }));

  res.json({ sellers: enriched, total });
});

export default router;

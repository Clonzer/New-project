import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { listingsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateListingBody } from "@workspace/api-zod";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/listings", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const sellerId = req.query.sellerId ? Number(req.query.sellerId) : undefined;
  const category = req.query.category as string | undefined;

  let query = db.select().from(listingsTable).$dynamic();
  if (sellerId) query = query.where(eq(listingsTable.sellerId, sellerId));
  if (category) query = query.where(eq(listingsTable.category, category));

  const rows = await query.limit(limit).offset(offset);
  const total = await db.$count(listingsTable);

  const listings = await Promise.all(rows.map(async (l) => {
    const [seller] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, l.sellerId));
    return { ...l, sellerName: seller?.displayName ?? "Unknown" };
  }));

  res.json({ listings, total });
});

router.post("/listings", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  if (parsed.data.sellerId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot create listings for another seller." });
    return;
  }
  const [listing] = await db.insert(listingsTable).values({
    ...parsed.data,
    shippingCost: parsed.data.shippingCost != null ? parsed.data.shippingCost : 0,
  }).returning();
  const [seller] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, listing.sellerId));
  res.status(201).json({ ...listing, sellerName: seller?.displayName ?? "Unknown" });
});

router.get("/listings/:listingId", async (req, res) => {
  const listingId = Number(req.params.listingId);
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing) {
    res.status(404).json({ error: "not_found", message: "Listing not found" });
    return;
  }
  const [seller] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, listing.sellerId));
  res.json({ ...listing, sellerName: seller?.displayName ?? "Unknown" });
});

export default router;

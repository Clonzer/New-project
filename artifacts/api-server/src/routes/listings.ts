import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { listingsTable, usersTable } from "@workspace/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { CreateListingBody } from "@workspace/api-zod";
import { type AuthedRequest, requireAuth, requireVerifiedSeller } from "../lib/auth";

const router: IRouter = Router();

router.get("/listings", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const sellerId = req.query.sellerId ? Number(req.query.sellerId) : undefined;
  const category = req.query.category as string | undefined;
  const conditions = [eq(listingsTable.isActive, true)];
  if (sellerId) conditions.push(eq(listingsTable.sellerId, sellerId));
  if (category) conditions.push(eq(listingsTable.category, category));
  const whereClause = and(...conditions);

  let query = db.select().from(listingsTable).$dynamic();
  query = query.where(whereClause).orderBy(
    desc(sql`case when ${listingsTable.sponsoredUntil} is not null and ${listingsTable.sponsoredUntil} > now() then 1 else 0 end`),
    desc(listingsTable.orderCount),
    desc(listingsTable.createdAt),
  );

  const rows = await query.limit(limit).offset(offset);
  const total = await db.$count(listingsTable, whereClause);

  const listings = await Promise.all(rows.map(async (l) => {
    const [seller] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, l.sellerId));
    return { ...l, sellerName: seller?.displayName ?? "Unknown" };
  }));

  res.json({ listings, total });
});

router.post("/listings", requireAuth, requireVerifiedSeller, async (req: AuthedRequest, res) => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  if (parsed.data.sellerId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot create listings for another seller." });
    return;
  }
  if (!parsed.data.title.trim()) {
    res.status(400).json({ error: "validation_error", message: "Listing title is required." });
    return;
  }
  if (!Number.isFinite(parsed.data.basePrice) || parsed.data.basePrice <= 0) {
    res.status(400).json({ error: "validation_error", message: "Base price must be greater than zero." });
    return;
  }
  if (!Number.isFinite(parsed.data.estimatedDaysMin) || !Number.isFinite(parsed.data.estimatedDaysMax)) {
    res.status(400).json({ error: "validation_error", message: "Production lead times must be valid numbers." });
    return;
  }
  if (parsed.data.estimatedDaysMin > parsed.data.estimatedDaysMax) {
    res.status(400).json({ error: "validation_error", message: "Minimum lead time cannot be greater than maximum lead time." });
    return;
  }
  try {
    const [listing] = await db.insert(listingsTable).values({
      ...parsed.data,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      category: parsed.data.category.trim(),
      tags: parsed.data.tags.map((tag) => tag.trim()).filter(Boolean),
      imageUrl: parsed.data.imageUrl?.trim() || null,
      material: parsed.data.material?.trim() || null,
      color: parsed.data.color?.trim() || null,
      shippingCost: parsed.data.shippingCost != null ? parsed.data.shippingCost : 0,
    }).returning();
    const [seller] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, listing.sellerId));
    res.status(201).json({ ...listing, sellerName: seller?.displayName ?? "Unknown" });
  } catch (error) {
    console.error("createListing", error);
    res.status(500).json({ error: "server_error", message: "Could not create this listing. Check your seller verification and try again." });
  }
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

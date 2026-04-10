import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { type AuthedRequest, requireAuth } from "../lib/auth";
import { createNotification } from "./notifications";

const PLATFORM_FEE_PERCENT = 0.10;

const router: IRouter = Router();

async function enrichOrder(order: typeof ordersTable.$inferSelect) {
  const [buyer] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, order.buyerId));
  const [seller] = await db.select({ displayName: usersTable.displayName }).from(usersTable).where(eq(usersTable.id, order.sellerId));
  return {
    ...order,
    buyerName: buyer?.displayName ?? "Unknown",
    sellerName: seller?.displayName ?? "Unknown",
  };
}

router.get("/orders", requireAuth, async (req: AuthedRequest, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const buyerId = req.query.buyerId ? Number(req.query.buyerId) : undefined;
  const sellerId = req.query.sellerId ? Number(req.query.sellerId) : undefined;
  const status = req.query.status as string | undefined;

  if (buyerId && buyerId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot view another buyer's orders." });
    return;
  }
  if (sellerId && sellerId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot view another seller's orders." });
    return;
  }
  if (!buyerId && !sellerId) {
    res.status(400).json({ error: "validation_error", message: "Provide buyerId or sellerId for the current user." });
    return;
  }

  let query = db.select().from(ordersTable).$dynamic();
  if (buyerId) query = query.where(eq(ordersTable.buyerId, buyerId));
  if (sellerId) query = query.where(eq(ordersTable.sellerId, sellerId));
  if (status) query = query.where(eq(ordersTable.status, status as any));

  const rows = await query.limit(limit).offset(offset);
  const total = await db.$count(ordersTable);
  const orders = await Promise.all(rows.map(enrichOrder));
  res.json({ orders, total });
});

router.post("/orders", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  if (parsed.data.buyerId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot place orders for another buyer." });
    return;
  }
  const { unitPrice, quantity } = parsed.data;
  const shippingCost = parsed.data.shippingCost != null ? Number(parsed.data.shippingCost) : 0;
  const subtotal = unitPrice * quantity;
  const platformFee = parseFloat((subtotal * PLATFORM_FEE_PERCENT).toFixed(2));
  const totalPrice = parseFloat((subtotal + platformFee + shippingCost).toFixed(2));

  const [order] = await db.insert(ordersTable).values({
    ...parsed.data,
    shippingCost,
    platformFee,
    totalPrice,
  }).returning();

  await createNotification({
    userId: order.sellerId,
    actorId: order.buyerId,
    type: "order",
    title: "New order received",
    body: `A new order for ${order.title} was placed.`,
    url: `/dashboard?order=${order.id}`,
  });

  await createNotification({
    userId: order.buyerId,
    actorId: order.sellerId,
    type: "order_update",
    title: "Order placed successfully",
    body: `Your order for ${order.title} is now waiting on the seller.`,
    url: `/dashboard?order=${order.id}`,
  });

  const enriched = await enrichOrder(order);
  res.status(201).json(enriched);
});

router.get("/orders/:orderId", requireAuth, async (req: AuthedRequest, res) => {
  const orderId = Number(req.params.orderId);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }
  if (order.buyerId !== req.auth!.userId && order.sellerId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot access this order." });
    return;
  }
  const enriched = await enrichOrder(order);
  res.json(enriched);
});

router.patch("/orders/:orderId", requireAuth, async (req: AuthedRequest, res) => {
  const orderId = Number(req.params.orderId);
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  const nextStatus = parsed.data.status;
  const isSeller = existing.sellerId === req.auth!.userId;
  const isBuyer = existing.buyerId === req.auth!.userId;
  const allowedForSeller = new Set(["accepted", "printing", "shipped", "cancelled"]);

  if (isSeller) {
    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!seller?.emailVerifiedAt) {
      res.status(403).json({
        error: "email_verification_required",
        message: "Verify your email before managing seller orders.",
      });
      return;
    }
    if (!allowedForSeller.has(nextStatus)) {
      res.status(403).json({ error: "forbidden", message: "Sellers cannot apply that status transition." });
      return;
    }
  } else if (isBuyer) {
    if (nextStatus !== "delivered" && nextStatus !== "cancelled") {
      res.status(403).json({ error: "forbidden", message: "Buyers can only confirm delivery or cancel." });
      return;
    }
  } else {
    res.status(403).json({ error: "forbidden", message: "You cannot update this order." });
    return;
  }

  const [order] = await db.update(ordersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(ordersTable.id, orderId))
    .returning();
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  const notificationTarget = isSeller ? order.buyerId : order.sellerId;
  const notificationType = isSeller ? "order_update" : "order_update";
  const statusLabel = order.status === "delivered" ? "delivered" : order.status === "cancelled" ? "cancelled" : order.status;

  await createNotification({
    userId: notificationTarget,
    actorId: req.auth!.userId,
    type: notificationType,
    title: `Order ${statusLabel}`,
    body: `Order ${order.title} is now ${statusLabel}.`,
    url: `/dashboard?order=${order.id}`,
  });

  const enriched = await enrichOrder(order);
  res.json(enriched);
});

export default router;

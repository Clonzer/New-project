import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { equipmentTable, equipmentGroupsTable } from "@workspace/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

// List equipment groups for a seller
router.get("/equipment-groups", requireAuth, async (req: AuthedRequest, res) => {
  const groups = await db
    .select()
    .from(equipmentGroupsTable)
    .where(and(eq(equipmentGroupsTable.sellerId, req.auth!.userId), eq(equipmentGroupsTable.isActive, true)))
    .orderBy(desc(equipmentGroupsTable.createdAt));

  res.json({ groups });
});

// Create equipment group
router.post("/equipment-groups", requireAuth, async (req: AuthedRequest, res) => {
  const { name, description, category } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: "validation_error", message: "Name and category are required" });
    return;
  }

  const [group] = await db
    .insert(equipmentGroupsTable)
    .values({
      sellerId: req.auth!.userId,
      name,
      description,
      category,
    })
    .returning();

  res.status(201).json(group);
});

// Update equipment group
router.put("/equipment-groups/:groupId", requireAuth, async (req: AuthedRequest, res) => {
  const groupId = Number(req.params.groupId);
  const { name, description, category } = req.body;

  const [existing] = await db
    .select()
    .from(equipmentGroupsTable)
    .where(and(eq(equipmentGroupsTable.id, groupId), eq(equipmentGroupsTable.sellerId, req.auth!.userId)));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Equipment group not found" });
    return;
  }

  const [group] = await db
    .update(equipmentGroupsTable)
    .set({
      name,
      description,
      category,
      updatedAt: new Date(),
    })
    .where(eq(equipmentGroupsTable.id, groupId))
    .returning();

  res.json(group);
});

// Delete equipment group
router.delete("/equipment-groups/:groupId", requireAuth, async (req: AuthedRequest, res) => {
  const groupId = Number(req.params.groupId);

  const [existing] = await db
    .select()
    .from(equipmentGroupsTable)
    .where(and(eq(equipmentGroupsTable.id, groupId), eq(equipmentGroupsTable.sellerId, req.auth!.userId)));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Equipment group not found" });
    return;
  }

  await db
    .update(equipmentGroupsTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(equipmentGroupsTable.id, groupId));

  res.json({ success: true });
});

// List equipment for a seller
router.get("/equipment", requireAuth, async (req: AuthedRequest, res) => {
  const equipment = await db
    .select()
    .from(equipmentTable)
    .where(and(eq(equipmentTable.sellerId, req.auth!.userId), eq(equipmentTable.isActive, true)))
    .orderBy(desc(equipmentTable.createdAt));

  res.json({ equipment });
});

// Create equipment
router.post("/equipment", requireAuth, async (req: AuthedRequest, res) => {
  const { groupId, name, model, manufacturer, category, specifications, purchaseDate, purchasePrice } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: "validation_error", message: "Name and category are required" });
    return;
  }

  const [equipment] = await db
    .insert(equipmentTable)
    .values({
      sellerId: req.auth!.userId,
      groupId: groupId || null,
      name,
      model,
      manufacturer,
      category,
      specifications,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice || null,
    })
    .returning();

  res.status(201).json(equipment);
});

// Update equipment
router.put("/equipment/:equipmentId", requireAuth, async (req: AuthedRequest, res) => {
  const equipmentId = Number(req.params.equipmentId);
  const { groupId, name, model, manufacturer, category, specifications, purchaseDate, purchasePrice, status } = req.body;

  const [existing] = await db
    .select()
    .from(equipmentTable)
    .where(and(eq(equipmentTable.id, equipmentId), eq(equipmentTable.sellerId, req.auth!.userId)));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Equipment not found" });
    return;
  }

  const [equipment] = await db
    .update(equipmentTable)
    .set({
      groupId: groupId || null,
      name,
      model,
      manufacturer,
      category,
      specifications,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice || null,
      status,
      updatedAt: new Date(),
    })
    .where(eq(equipmentTable.id, equipmentId))
    .returning();

  res.json(equipment);
});

// Delete equipment
router.delete("/equipment/:equipmentId", requireAuth, async (req: AuthedRequest, res) => {
  const equipmentId = Number(req.params.equipmentId);

  const [existing] = await db
    .select()
    .from(equipmentTable)
    .where(and(eq(equipmentTable.id, equipmentId), eq(equipmentTable.sellerId, req.auth!.userId)));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Equipment not found" });
    return;
  }

  await db
    .update(equipmentTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(equipmentTable.id, equipmentId));

  res.json({ success: true });
});

export default router;
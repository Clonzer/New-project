import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { printersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreatePrinterBody, UpdatePrinterBody } from "@workspace/api-zod";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/printers", async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const technology = req.query.technology as string | undefined;

  let query = db.select().from(printersTable).$dynamic();
  if (userId) query = query.where(eq(printersTable.userId, userId));
  if (technology) query = query.where(eq(printersTable.technology, technology as any));

  const printers = await query.limit(limit).offset(offset);
  const total = await db.$count(printersTable);
  res.json({ printers, total });
});

router.post("/printers", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = CreatePrinterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  if (parsed.data.userId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot create equipment for another user." });
    return;
  }
  const { equipmentCategory, toolOrServiceType, ...rest } = parsed.data;
  const [printer] = await db.insert(printersTable).values({
    ...rest,
    equipmentCategory: equipmentCategory ?? "printing_3d",
    toolOrServiceType: toolOrServiceType ?? null,
  }).returning();
  res.status(201).json(printer);
});

router.get("/printers/:printerId", async (req, res) => {
  const printerId = Number(req.params.printerId);
  const [printer] = await db.select().from(printersTable).where(eq(printersTable.id, printerId));
  if (!printer) {
    res.status(404).json({ error: "not_found", message: "Printer not found" });
    return;
  }
  res.json(printer);
});

router.patch("/printers/:printerId", requireAuth, async (req: AuthedRequest, res) => {
  const printerId = Number(req.params.printerId);
  const parsed = UpdatePrinterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(printersTable).where(eq(printersTable.id, printerId));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Printer not found" });
    return;
  }
  if (existing.userId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot edit another user's equipment." });
    return;
  }
  const updateValues = {
    ...parsed.data,
    equipmentCategory: parsed.data.equipmentCategory ?? undefined,
    toolOrServiceType: parsed.data.toolOrServiceType ?? undefined,
  };
  const [printer] = await db.update(printersTable).set(updateValues).where(eq(printersTable.id, printerId)).returning();
  if (!printer) {
    res.status(404).json({ error: "not_found", message: "Printer not found" });
    return;
  }
  res.json(printer);
});

router.delete("/printers/:printerId", requireAuth, async (req: AuthedRequest, res) => {
  const printerId = Number(req.params.printerId);
  const [existing] = await db.select().from(printersTable).where(eq(printersTable.id, printerId));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Printer not found" });
    return;
  }
  if (existing.userId !== req.auth!.userId) {
    res.status(403).json({ error: "forbidden", message: "You cannot remove another user's equipment." });
    return;
  }
  await db.delete(printersTable).where(eq(printersTable.id, printerId));
  res.status(204).end();
});

export default router;

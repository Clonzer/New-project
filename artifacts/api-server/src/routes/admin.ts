import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireOwner, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/users", requireOwner, async (_req: AuthedRequest, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.joinedAt));
  res.json({
    users: users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      isOwner: user.accountStatus === "owner" || ["evanhuelin8@gmail.com", "evanhuelin@gmail.com"].includes(user.email.toLowerCase()),
      joinedAt: user.joinedAt,
    })),
  });
});

router.patch("/admin/users/:userId/status", requireOwner, async (req: AuthedRequest, res) => {
  const userId = Number(req.params.userId);
  const accountStatus = String(req.body?.accountStatus ?? "").trim().toLowerCase();
  const allowed = new Set(["member", "influencer", "featured", "partner", "vip"]);

  if (!allowed.has(accountStatus)) {
    res.status(400).json({ error: "validation_error", message: "Choose a valid internal account status." });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!existing) {
    res.status(404).json({ error: "not_found", message: "User not found." });
    return;
  }
  if (["evanhuelin8@gmail.com", "evanhuelin@gmail.com"].includes(existing.email.toLowerCase())) {
    res.status(400).json({ error: "validation_error", message: "Owner accounts stay locked as owner." });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ accountStatus })
    .where(eq(usersTable.id, userId))
    .returning();

  res.json({ user });
});

export default router;

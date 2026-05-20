import { Router } from "express";
import { hash } from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signAccessToken } from "../lib/auth";

const router = Router();

// Only enable these routes when explicitly allowed via env var
if (process.env["ENABLE_TEST_ROUTES"] === "1") {
  router.post("/_test/create-user", async (req, res) => {
    try {
      const email = String(req.body?.email ?? `test+${Date.now()}@example.com`).trim().toLowerCase();
      const password = String(req.body?.password ?? "password123");
      const role = req.body?.role === "seller" || req.body?.role === "both" ? req.body.role : "buyer";

      const username = (String(req.body?.username ?? "") || email.split("@")[0]).replace(/[^a-z0-9_-]+/gi, "_").slice(0, 32);
      const passwordHash = password ? await hash(password, 10) : null;

      // Upsert user by email
      let [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
      let user;
      if (existing) {
        [user] = await db
          .update(usersTable)
          .set({ passwordHash, role, username })
          .where(eq(usersTable.id, existing.id))
          .returning();
      } else {
        [user] = await db.insert(usersTable).values({
          username,
          email,
          displayName: username,
          passwordHash,
          role,
          emailVerifiedAt: new Date(),
        }).returning();
      }

      const token = signAccessToken({ id: user.id, email: user.email }, "7d");
      res.cookie("access_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
      res.json({ token, user });
    } catch (err) {
      console.error("testCreateUser", err);
      res.status(500).json({ error: "server_error", message: "Could not create test user." });
    }
  });
}

export default router;

import { Router, type IRouter } from "express";
import { compare, hash } from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { type AuthedRequest, getTokenFromRequest, requireAuth, signAccessToken, verifyAccessToken } from "../lib/auth";

const router: IRouter = Router();

const JWT_EXPIRES = process.env["JWT_EXPIRES_IN"] ?? "7d";

type UserRow = typeof usersTable.$inferSelect;

function publicUser(u: UserRow) {
  const { passwordHash: _p, ...rest } = u;
  return rest;
}

router.post("/auth/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    res.status(400).json({ error: "validation_error", message: "Email and password are required." });
    return;
  }

  const [row] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!row?.passwordHash) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password." });
    return;
  }

  const ok = await compare(password, row.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password." });
    return;
  }

  const token = signAccessToken({ id: row.id, email: row.email }, JWT_EXPIRES);

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ token, user: publicUser(row) });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res) => {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated." });
    return;
  }
  const payload = verifyAccessToken(raw);
  if (!payload) {
    res.status(401).json({ error: "unauthorized", message: "Session expired or invalid token." });
    return;
  }
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!row) {
    res.status(401).json({ error: "unauthorized", message: "User not found." });
    return;
  }
  res.json({ user: publicUser(row) });
});

router.post("/auth/password", requireAuth, async (req: AuthedRequest, res) => {
  const currentPassword = String(req.body?.currentPassword ?? "");
  const newPassword = String(req.body?.newPassword ?? "");

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({
      error: "validation_error",
      message: "Current password and a new password with at least 8 characters are required.",
    });
    return;
  }

  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
  if (!row?.passwordHash) {
    res.status(404).json({ error: "not_found", message: "User account not found." });
    return;
  }

  const matches = await compare(currentPassword, row.passwordHash);
  if (!matches) {
    res.status(401).json({ error: "unauthorized", message: "Current password is incorrect." });
    return;
  }

  const nextHash = await hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash: nextHash }).where(eq(usersTable.id, row.id));
  res.json({ ok: true });
});

export default router;

import { Router, type IRouter } from "express";
import { compare, hash } from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { type AuthedRequest, getTokenFromRequest, requireAuth, signAccessToken, verifyAccessToken } from "../lib/auth";
import { confirmEmailVerificationCode, sendEmailVerificationCode } from "../lib/email-verification";
import { isEmailDeliveryConfigured } from "../lib/mailer";

const router: IRouter = Router();

const JWT_EXPIRES = process.env["JWT_EXPIRES_IN"] ?? "7d";
const GOOGLE_CLIENT_ID = process.env["GOOGLE_CLIENT_ID"]?.trim() || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

type UserRow = typeof usersTable.$inferSelect;

function publicUser(u: UserRow) {
  const {
    passwordHash: _p,
    emailVerificationCodeHash: _code,
    emailVerificationExpiresAt: _expires,
    ...rest
  } = u;
  return rest;
}

async function createSession(res: Parameters<typeof router.post>[1] extends never ? never : any, row: UserRow) {
  const token = signAccessToken({ id: row.id, email: row.email }, JWT_EXPIRES);
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ token, user: publicUser(row) });
}

async function generateUniqueUsername(seed: string) {
  const normalized = seed.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "maker";
  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? normalized : `${normalized}_${Math.floor(100 + Math.random() * 900)}`;
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, candidate));
    if (!existing) return candidate;
  }
  return `maker_${Date.now().toString().slice(-6)}`;
}

router.post("/auth/login", async (req, res) => {
  try {
    const identifier = String(req.body?.email ?? req.body?.identifier ?? "").trim();
    const password = String(req.body?.password ?? "");
    if (!identifier || !password) {
      res.status(400).json({ error: "validation_error", message: "Email or username and password are required." });
      return;
    }

    const normalizedEmail = identifier.toLowerCase();
    const [row] = await db
      .select()
      .from(usersTable)
      .where(identifier.includes("@") ? eq(usersTable.email, normalizedEmail) : eq(usersTable.username, identifier));
    if (!row?.passwordHash) {
      res.status(401).json({ error: "unauthorized", message: "Invalid email, username, or password." });
      return;
    }

    let ok = false;
    if (row.passwordHash.startsWith("$2")) {
      ok = await compare(password, row.passwordHash);
    } else {
      ok = password === row.passwordHash;
      if (ok) {
        const upgradedHash = await hash(password, 12);
        await db.update(usersTable).set({ passwordHash: upgradedHash }).where(eq(usersTable.id, row.id));
        row.passwordHash = upgradedHash;
      }
    }
    if (!ok) {
      res.status(401).json({ error: "unauthorized", message: "Invalid email, username, or password." });
      return;
    }

    await createSession(res, row);
  } catch (error) {
    console.error("authLogin", error);
    res.status(500).json({ error: "server_error", message: "Could not sign in. Please try again." });
  }
});

router.post("/auth/google", async (req, res) => {
  try {
    if (!googleClient || !GOOGLE_CLIENT_ID) {
      res.status(503).json({
        error: "google_not_configured",
        message: "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID on Render first.",
      });
      return;
    }

    const credential = String(req.body?.credential ?? "").trim();
    const requestedRole = req.body?.role === "seller" || req.body?.role === "both" ? req.body.role : "buyer";
    const location = String(req.body?.location ?? "").trim() || null;
    if (!credential) {
      res.status(400).json({ error: "validation_error", message: "Google sign-in did not return a valid credential." });
      return;
    }

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload?.email?.trim().toLowerCase();
    const subject = payload?.sub?.trim();
    const displayName = payload?.name?.trim() || payload?.given_name?.trim() || "Google User";
    const avatarUrl = payload?.picture?.trim() || null;

    if (!email || !subject || !payload?.email_verified) {
      res.status(400).json({ error: "validation_error", message: "Your Google account must have a verified email address." });
      return;
    }

    let [row] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!row) {
      const username = await generateUniqueUsername(email.split("@")[0] || displayName);
      [row] = await db
        .insert(usersTable)
        .values({
          username,
          displayName,
          email,
          avatarUrl,
          role: requestedRole,
          location,
          emailVerifiedAt: new Date(),
          authProvider: "google",
          authProviderSubject: subject,
          shopName: requestedRole === "buyer" ? null : "",
          shopMode: requestedRole === "buyer" ? null : "both",
        })
        .returning();
    } else if (
      row.authProvider !== "google" ||
      row.authProviderSubject !== subject ||
      (row.role === "buyer" && requestedRole !== "buyer")
    ) {
      [row] = await db
        .update(usersTable)
        .set({
          authProvider: "google",
          authProviderSubject: subject,
          emailVerifiedAt: row.emailVerifiedAt ?? new Date(),
          avatarUrl: row.avatarUrl || avatarUrl,
          role: row.role === "buyer" && requestedRole !== "buyer" ? requestedRole : row.role,
          shopMode: row.role === "buyer" && requestedRole !== "buyer" ? "both" : row.shopMode,
        })
        .where(eq(usersTable.id, row.id))
        .returning();
    }

    await createSession(res, row);
  } catch (error) {
    console.error("authGoogle", error);
    res.status(500).json({ error: "server_error", message: "Could not complete Google sign-in. Please try again." });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.json({ ok: true });
});

router.post("/auth/verify-email/request", requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!isEmailDeliveryConfigured()) {
      res.status(503).json({
        error: "email_not_configured",
        message: "Email verification is not configured yet. Add the SMTP settings on Render first.",
      });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User account not found." });
      return;
    }
    if (user.emailVerifiedAt) {
      res.json({ ok: true, alreadyVerified: true, email: user.email });
      return;
    }

    const result = await sendEmailVerificationCode(user.id);
    res.json({ ok: true, email: result.email, expiresAt: result.expiresAt.toISOString() });
  } catch (error) {
    console.error("authRequestEmailVerification", error);
    res.status(500).json({ error: "server_error", message: "Could not send the verification code." });
  }
});

router.post("/auth/verify-email/confirm", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const code = String(req.body?.code ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
      res.status(400).json({ error: "validation_error", message: "Enter the 6-digit verification code from your email." });
      return;
    }

    const result = await confirmEmailVerificationCode(req.auth!.userId, code);
    if (!result.ok) {
      if (result.reason === "missing_code") {
        res.status(400).json({ error: "verification_missing", message: "Request a verification code before trying to confirm your email." });
        return;
      }
      if (result.reason === "expired") {
        res.status(400).json({ error: "verification_expired", message: "That verification code has expired. Request a new code and try again." });
        return;
      }
      res.status(400).json({ error: "verification_invalid", message: "That verification code is incorrect." });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User account not found." });
      return;
    }
    res.json({ ok: true, user: publicUser(user) });
  } catch (error) {
    console.error("authConfirmEmailVerification", error);
    res.status(500).json({ error: "server_error", message: "Could not verify that code. Please try again." });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("authMe", error);
    res.status(500).json({ error: "server_error", message: "Could not load the current session." });
  }
});

router.post("/auth/password", requireAuth, async (req: AuthedRequest, res) => {
  try {
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
  } catch (error) {
    console.error("authPassword", error);
    res.status(500).json({ error: "server_error", message: "Could not update the password." });
  }
});

export default router;

import type { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env["JWT_SECRET"]?.trim() || "dev-only-change-in-production";
const USING_FALLBACK_JWT_SECRET = JWT_SECRET === "dev-only-change-in-production";
const OWNER_EMAILS = new Set(["evanhuelin8@gmail.com", "evanhuelin@gmail.com"]);

if (USING_FALLBACK_JWT_SECRET) {
  console.warn("JWT_SECRET is missing or blank; using the built-in fallback secret. Set JWT_SECRET on Render.");
}

export type AuthClaims = {
  userId: number;
  email: string;
};

export type AuthedRequest = Request & {
  auth?: AuthClaims;
  authUser?: typeof usersTable.$inferSelect;
};

export function isOwnerEmail(email: string) {
  return OWNER_EMAILS.has(email.trim().toLowerCase());
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim() || null;
  }
  return null;
}

export function getTokenFromRequest(req: Request): string | null {
  return getBearerToken(req) || (req.cookies?.access_token as string | undefined) || null;
}

export function verifyAccessToken(token: string): AuthClaims | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;
    const userId = Number(decoded.sub);
    if (!Number.isFinite(userId) || userId <= 0) return null;
    const email = typeof decoded.email === "string" ? decoded.email : "";
    return { userId, email };
  } catch {
    return null;
  }
}

export function signAccessToken(user: { id: number; email: string }, expiresIn: string): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: expiresIn as SignOptions["expiresIn"] },
  );
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const raw = getTokenFromRequest(req);
  if (!raw) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required." });
    return;
  }
  const claims = verifyAccessToken(raw);
  if (!claims) {
    res.status(401).json({ error: "unauthorized", message: "Session expired or invalid token." });
    return;
  }
  req.auth = claims;
  next();
}

export async function requireVerifiedSeller(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth.userId));
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User account not found." });
    return;
  }

  req.authUser = user;

  if (user.role !== "seller" && user.role !== "both") {
    res.status(403).json({
      error: "seller_account_required",
      message: "Switch this account into seller mode before creating listings or equipment.",
    });
    return;
  }

  if (!user.emailVerifiedAt) {
    res.status(403).json({
      error: "email_verification_required",
      message: "Verify your email before creating listings, equipment, or other seller content.",
    });
    return;
  }

  next();
}

export async function requireOwner(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth.userId));
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User account not found." });
    return;
  }

  req.authUser = user;

  if (!isOwnerEmail(user.email)) {
    res.status(403).json({ error: "forbidden", message: "This admin panel is restricted to owner accounts." });
    return;
  }

  next();
}

export function requireSelf(paramKey = "userId") {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: "unauthorized", message: "Authentication required." });
      return;
    }
    const target = Number(req.params[paramKey] ?? req.body?.[paramKey] ?? req.query?.[paramKey]);
    if (!Number.isFinite(target) || target !== req.auth.userId) {
      res.status(403).json({ error: "forbidden", message: "You cannot access another user's account." });
      return;
    }
    next();
  };
}

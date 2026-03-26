import type { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev-only-change-in-production";

export type AuthClaims = {
  userId: number;
  email: string;
};

export type AuthedRequest = Request & {
  auth?: AuthClaims;
};

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

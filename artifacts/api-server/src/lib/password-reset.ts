import { compare, hash } from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { isEmailDeliveryConfigured, sendTransactionalEmail } from "./mailer";

const PASSWORD_RESET_TTL_MINUTES = 20;

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
}

export async function sendPasswordResetCode(email: string) {
  if (!isEmailDeliveryConfigured()) {
    throw new Error("Password reset email is not configured yet. Add SMTP settings on Render first.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));
  if (!user?.passwordHash) {
    return { ok: true };
  }

  const code = generateResetCode();
  const expiresAt = getExpiryDate();

  await db
    .update(usersTable)
    .set({
      passwordResetCodeHash: await hash(code, 10),
      passwordResetExpiresAt: expiresAt,
    })
    .where(eq(usersTable.id, user.id));

  await sendTransactionalEmail({
    to: user.email,
    subject: "Reset your Synthix password",
    text:
      `Your Synthix password reset code is ${code}. ` +
      `It expires at ${expiresAt.toUTCString()}.`,
    html:
      `<p>Your Synthix password reset code is:</p>` +
      `<p style="font-size:32px;font-weight:700;letter-spacing:0.2em;">${code}</p>` +
      `<p>This code expires at ${expiresAt.toUTCString()}.</p>`,
  });

  return { ok: true };
}

export async function confirmPasswordResetCode(email: string, code: string, newPassword: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));
  if (!user?.passwordResetCodeHash || !user.passwordResetExpiresAt) {
    return { ok: false, reason: "missing_code" as const };
  }
  if (user.passwordResetExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }

  const matches = await compare(code, user.passwordResetCodeHash);
  if (!matches) {
    return { ok: false, reason: "invalid_code" as const };
  }

  await db
    .update(usersTable)
    .set({
      passwordHash: await hash(newPassword, 12),
      passwordResetCodeHash: null,
      passwordResetExpiresAt: null,
    })
    .where(eq(usersTable.id, user.id));

  return { ok: true };
}

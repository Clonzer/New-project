import { compare, hash } from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { isEmailDeliveryConfigured, sendTransactionalEmail } from "./mailer";

const EMAIL_VERIFICATION_TTL_MINUTES = 15;

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getExpiryDate() {
  return new Date(Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000);
}

export async function issueEmailVerificationCode(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    throw new Error("User account not found.");
  }

  const code = generateVerificationCode();
  const codeHash = await hash(code, 10);
  const expiresAt = getExpiryDate();

  await db
    .update(usersTable)
    .set({
      emailVerificationCodeHash: codeHash,
      emailVerificationExpiresAt: expiresAt,
    })
    .where(eq(usersTable.id, userId));

  return { user, code, expiresAt };
}

export async function sendEmailVerificationCode(userId: number) {
  if (!isEmailDeliveryConfigured()) {
    throw new Error("Email verification is not configured yet. Add the SMTP settings on Render first.");
  }

  const { user, code, expiresAt } = await issueEmailVerificationCode(userId);

  await sendTransactionalEmail({
    to: user.email,
    subject: "Verify your Synthix account",
    text:
      `Your Synthix verification code is ${code}. ` +
      `It expires at ${expiresAt.toUTCString()}.`,
    html:
      `<p>Your Synthix verification code is:</p>` +
      `<p style="font-size:32px;font-weight:700;letter-spacing:0.2em;">${code}</p>` +
      `<p>This code expires at ${expiresAt.toUTCString()}.</p>`,
  });

  return { email: user.email, expiresAt };
}

export async function confirmEmailVerificationCode(userId: number, code: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    throw new Error("User account not found.");
  }
  if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
    return { ok: false, reason: "missing_code" as const };
  }
  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }

  const matches = await compare(code, user.emailVerificationCodeHash);
  if (!matches) {
    return { ok: false, reason: "invalid_code" as const };
  }

  const verifiedAt = new Date();
  await db
    .update(usersTable)
    .set({
      emailVerifiedAt: verifiedAt,
      emailVerificationCodeHash: null,
      emailVerificationExpiresAt: null,
    })
    .where(eq(usersTable.id, userId));

  return { ok: true, verifiedAt };
}

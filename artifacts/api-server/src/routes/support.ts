import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { messageThreadsTable, usersTable } from "@workspace/db/schema";
import { type AuthedRequest, isOwnerEmail, requireAuth } from "../lib/auth";
import { sendTransactionalEmail } from "../lib/mailer";

const router: IRouter = Router();

function normalizeParticipantPair(userId: number, participantId: number) {
  return userId < participantId
    ? { participantAId: userId, participantBId: participantId }
    : { participantAId: participantId, participantBId: userId };
}

async function getOwnerUser() {
  const owners = await db.select().from(usersTable);
  return owners.find((user) => isOwnerEmail(user.email)) ?? null;
}

router.post("/support/message-thread", requireAuth, async (req: AuthedRequest, res) => {
  const owner = await getOwnerUser();
  if (!owner) {
    res.status(503).json({
      error: "support_unavailable",
      message: "A SYNTHIX support account has not been created yet.",
    });
    return;
  }

  const pair = normalizeParticipantPair(req.auth!.userId, owner.id);
  const [existing] = await db
    .select()
    .from(messageThreadsTable)
    .where(
      and(
        eq(messageThreadsTable.participantAId, pair.participantAId),
        eq(messageThreadsTable.participantBId, pair.participantBId),
      ),
    );

  if (existing) {
    res.status(200).json({ threadId: existing.id });
    return;
  }

  const [thread] = await db.insert(messageThreadsTable).values(pair).returning();
  res.status(201).json({ threadId: thread.id });
});

router.post("/support/contact", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const subject = String(req.body?.subject ?? "").trim();
  const message = String(req.body?.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "validation_error", message: "Name, email, subject, and message are all required." });
    return;
  }

  const recipients = ["evanhuelin8@gmail.com", "evanhuelin@gmail.com"];
  const html = `
    <h2>SYNTHIX contact form</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br />")}</p>
  `;

  try {
    await Promise.all(
      recipients.map((to) =>
        sendTransactionalEmail({
          to,
          subject: `[SYNTHIX] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          html,
        }),
      ),
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("supportContact", error);
    res.status(503).json({
      error: "email_unavailable",
      message: "The contact form could not be sent. Configure SMTP settings on Render first.",
    });
  }
});

export default router;

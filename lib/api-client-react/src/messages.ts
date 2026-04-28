import { db } from "@workspace/db";
import { messagesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const SYNTHIX_USER_ID = 2; // The user ID for the "Synthix" system account

/**
 * Sends a message from the Synthix system to a user.
 *
 * @param userId - The ID of the user to receive the message.
 * @param content - The content of the message.
 * @returns The newly created message.
 */
export async function sendSynthixMessage(userId: number, content: string) {
  const [message] = await db
    .insert(messagesTable)
    .values({
      senderId: SYNTHIX_USER_ID,
      receiverId: userId,
      content,
      read: false,
    })
    .returning();

  return message;
}

/**
 * Creates a welcome message for a new user from the Synthix system.
 *
 * @param userId - The ID of the new user.
 * @param displayName - The display name of the new user.
 */
export async function sendWelcomeMessage(userId: number, displayName: string) {
  const welcomeContent = `Welcome to Synthix, ${displayName}! We're excited to have you on board. Explore the marketplace, connect with makers, and bring your ideas to life.`;
  await sendSynthixMessage(userId, welcomeContent);
}

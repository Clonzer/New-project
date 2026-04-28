import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";

// In a real app, this would be a stable ID from the database seed script.
const SYNTHIX_USER_ID = 2; 

/**
 * Sends a message from the Synthix system to a user.
 *
 * @param userId - The ID of the user to receive the message.
 * @param content - The content of the message.
 * @returns The newly created message.
 */
export async function sendSynthixMessage(userId: number, content: string) {
  try {
    const [message] = await db
      .insert(messagesTable)
      .values({
        senderId: SYNTHIX_USER_ID,
        receiverId: userId,
        content,
        read: false,
      })
      .returning();

    console.log(`Synthix message sent to user ${userId}`);
    return message;
  } catch (error) {
    console.error(`Failed to send Synthix message to user ${userId}`, error);
    // Optional: Add more robust error handling, e.g., retry logic or logging to a dedicated service.
  }
}

/**
 * Creates a welcome message for a new user from the Synthix system.
 *
 * @param userId - The ID of the new user.
 * @param displayName - The display name of the new user.
 */
export async function sendWelcomeMessage(userId: number, displayName: string) {
  const welcomeContent = `Welcome to Synthix, ${displayName}! We're excited to have you on board. Explore the marketplace, connect with makers, and bring your ideas to life. If you have any questions, feel free to reach out to our support team.`;
  await sendSynthixMessage(userId, welcomeContent);
}

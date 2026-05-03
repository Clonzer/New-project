import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable, teamMembersTable } from "@workspace/db/schema";
import { type AuthedRequest, requireAuth } from "../lib/auth";
import { createNotification } from "./notifications";

const router: IRouter = Router();

// Get team members for the current user (if team owner)
router.get("/team/members", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

    // Check if user is a team owner or member
    if (user.isTeamOwner) {
      // Get all team members for this owner
      const members = await db
        .select({
          member: teamMembersTable,
          user: {
            id: usersTable.id,
            displayName: usersTable.displayName,
            email: usersTable.email,
            avatarUrl: usersTable.avatarUrl,
          },
        })
        .from(teamMembersTable)
        .leftJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
        .where(eq(teamMembersTable.ownerId, userId));

      res.json({
        isOwner: true,
        seatCount: user.seatCount || 1,
        organizationName: user.organizationName,
        members: members.map(m => ({
          ...m.member,
          user: m.user,
        })),
      });
    } else if (user.teamOwnerId) {
      // This user is a team member - get team info
      const [owner] = await db
        .select({
          id: usersTable.id,
          displayName: usersTable.displayName,
          organizationName: usersTable.organizationName,
        })
        .from(usersTable)
        .where(eq(usersTable.id, user.teamOwnerId));

      const [memberRecord] = await db
        .select()
        .from(teamMembersTable)
        .where(and(
          eq(teamMembersTable.ownerId, user.teamOwnerId),
          eq(teamMembersTable.userId, userId)
        ));

      res.json({
        isOwner: false,
        teamOwner: owner,
        memberSince: memberRecord?.joinedAt,
        role: memberRecord?.role,
      });
    } else {
      res.json({ isOwner: false, members: [], seatCount: 1 });
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "server_error", message: "Could not fetch team members" });
  }
});

// Invite a team member (owner only)
router.post("/team/invite", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;
  const { email, role = "member" } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "validation_error", message: "Email is required" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!user || !user.isTeamOwner) {
      res.status(403).json({ error: "forbidden", message: "Only team owners can invite members" });
      return;
    }

    // Check current seat usage
    const [{ memberCount }] = await db
      .select({ memberCount: count() })
      .from(teamMembersTable)
      .where(eq(teamMembersTable.ownerId, userId));

    if (memberCount >= (user.seatCount || 1)) {
      res.status(400).json({
        error: "seat_limit_reached",
        message: "You've reached your seat limit. Upgrade to add more members.",
      });
      return;
    }

    // Check if user with this email already exists
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    // Check if already invited
    const [existingInvite] = await db
      .select()
      .from(teamMembersTable)
      .where(and(
        eq(teamMembersTable.ownerId, userId),
        eq(teamMembersTable.email, email.toLowerCase())
      ));

    if (existingInvite) {
      res.status(409).json({ error: "already_invited", message: "This email has already been invited" });
      return;
    }

    // Create invitation
    const [invitation] = await db
      .insert(teamMembersTable)
      .values({
        ownerId: userId,
        userId: existingUser?.id,
        email: email.toLowerCase(),
        role: role === "admin" ? "admin" : "member",
        status: "pending",
      })
      .returning();

    // TODO: Send invitation email

    res.status(201).json({
      message: "Invitation sent",
      invitation: {
        ...invitation,
        user: existingUser ? {
          id: existingUser.id,
          displayName: existingUser.displayName,
          email: existingUser.email,
          avatarUrl: existingUser.avatarUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error inviting team member:", error);
    res.status(500).json({ error: "server_error", message: "Could not send invitation" });
  }
});

// Remove a team member (owner only)
router.delete("/team/members/:memberId", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;
  const memberId = parseInt(req.params.memberId, 10);

  if (!memberId || isNaN(memberId)) {
    res.status(400).json({ error: "validation_error", message: "Invalid member ID" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!user || !user.isTeamOwner) {
      res.status(403).json({ error: "forbidden", message: "Only team owners can remove members" });
      return;
    }

    // Get the member record
    const [member] = await db
      .select()
      .from(teamMembersTable)
      .where(and(
        eq(teamMembersTable.id, memberId),
        eq(teamMembersTable.ownerId, userId)
      ));

    if (!member) {
      res.status(404).json({ error: "not_found", message: "Team member not found" });
      return;
    }

    // Cannot remove owner
    if (member.role === "owner") {
      res.status(400).json({ error: "cannot_remove_owner", message: "Cannot remove the team owner" });
      return;
    }

    // Remove the member
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, memberId));

    // If the user was active, update their team status
    if (member.userId && member.status === "active") {
      await db
        .update(usersTable)
        .set({ teamOwnerId: null })
        .where(eq(usersTable.id, member.userId));

      await createNotification({
        userId: member.userId,
        type: "system",
        title: "Removed from team",
        body: `You have been removed from ${user.organizationName || "the team"}`,
      });
    }

    res.json({ message: "Member removed" });
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({ error: "server_error", message: "Could not remove member" });
  }
});

// Accept team invitation (for invited users)
router.post("/team/accept-invite", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;
  const { invitationId } = req.body;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

    // Find invitation by ID or email
    let invitation;
    if (invitationId) {
      [invitation] = await db
        .select()
        .from(teamMembersTable)
        .where(eq(teamMembersTable.id, parseInt(invitationId, 10)));
    } else {
      // Find by email
      [invitation] = await db
        .select()
        .from(teamMembersTable)
        .where(and(
          eq(teamMembersTable.email, user.email.toLowerCase()),
          eq(teamMembersTable.status, "pending")
        ));
    }

    if (!invitation || invitation.status !== "pending") {
      res.status(404).json({ error: "not_found", message: "Invitation not found or already processed" });
      return;
    }

    // Get owner info
    const [owner] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, invitation.ownerId));

    if (!owner) {
      res.status(404).json({ error: "not_found", message: "Team owner not found" });
      return;
    }

    // Check seat limit
    const [{ memberCount }] = await db
      .select({ memberCount: count() })
      .from(teamMembersTable)
      .where(and(
        eq(teamMembersTable.ownerId, invitation.ownerId),
        eq(teamMembersTable.status, "active")
      ));

    if (memberCount >= (owner.seatCount || 1)) {
      res.status(400).json({
        error: "seat_limit_reached",
        message: "The team has reached its seat limit. Contact the owner to upgrade.",
      });
      return;
    }

    // Accept invitation
    await db
      .update(teamMembersTable)
      .set({
        userId: userId,
        status: "active",
        joinedAt: new Date(),
      })
      .where(eq(teamMembersTable.id, invitation.id));

    // Update user with team info
    await db
      .update(usersTable)
      .set({
        teamOwnerId: invitation.ownerId,
        planTier: "enterprise", // Give them enterprise features
      })
      .where(eq(usersTable.id, userId));

    // Notify owner
    await createNotification({
      userId: invitation.ownerId,
      type: "system",
      title: "Team member joined",
      body: `${user.displayName} has accepted your team invitation`,
    });

    res.json({ message: "Invitation accepted", team: { id: invitation.ownerId, name: owner.organizationName } });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "server_error", message: "Could not accept invitation" });
  }
});

// Update seat count (for upgrading seats on Enterprise)
router.patch("/team/seats", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.auth!.userId;
  const { seatCount } = req.body;

  if (!seatCount || seatCount < 1 || seatCount > 100) {
    res.status(400).json({ error: "validation_error", message: "Seat count must be between 1 and 100" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!user || !user.isTeamOwner || user.planTier !== "enterprise") {
      res.status(403).json({ error: "forbidden", message: "Only Enterprise team owners can update seats" });
      return;
    }

    // Update seat count
    await db
      .update(usersTable)
      .set({ seatCount })
      .where(eq(usersTable.id, userId));

    res.json({ message: "Seat count updated", seatCount });
  } catch (error) {
    console.error("Error updating seat count:", error);
    res.status(500).json({ error: "server_error", message: "Could not update seat count" });
  }
});

export default router;

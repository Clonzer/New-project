/**
 * XP Service - Handles awarding XP, tracking progress, and daily challenges
 */

import { supabase } from "./supabase";
import { XP_REWARDS, DAILY_CHALLENGES, getTodaysChallenge, calculateXpReward, canEarnXp, type XpRewardType } from "./xp-rewards";
import { calculateRank, RANKS } from "./rank-system";

export interface XpHistoryEntry {
  id: string;
  userId: string;
  rewardId: string;
  xpAmount: number;
  baseXp: number;
  bonusXp: number;
  streakMultiplier: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DailyProgress {
  userId: string;
  date: string;
  challengeId: string;
  current: number;
  target: number;
  completed: boolean;
  xpEarned: number;
}

export interface UserXpStats {
  totalXp: number;
  currentRankId: number;
  currentStreak: number;
  lastLoginDate: string | null;
  todayXp: number;
  weekXp: number;
  monthXp: number;
}

export interface XpAwardResult {
  success: boolean;
  xpAwarded: number;
  newTotalXp: number;
  rankUp?: {
    oldRank: number;
    newRank: number;
    rankName: string;
  };
  error?: string;
}

/**
 * Award XP to a user
 */
export async function awardXp(
  userId: string,
  rewardId: string,
  metadata?: Record<string, any>
): Promise<XpAwardResult> {
  try {
    // Get reward details
    const reward = XP_REWARDS.find((r) => r.id === rewardId);
    if (!reward) {
      return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Invalid reward ID" };
    }

    // Get user's current stats from users table (per rank system migration)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("total_xp, rank_id, login_streak, last_login_at, lifetime_pro")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return { success: false, xpAwarded: 0, newTotalXp: 0, error: "User not found" };
    }

    // Check if already earned (for one-time rewards)
    if (reward.type === "onetime") {
      const { data: existing } = await supabase
        .from("xp_history")
        .select("id")
        .eq("user_id", userId)
        .eq("reward_id", rewardId)
        .single();

      if (existing) {
        return { success: false, xpAwarded: 0, newTotalXp: userData.total_xp || 0, error: "Already earned" };
      }
    }

    // Check cooldowns and limits for repeatable rewards
    if (reward.type === "repeatable" || reward.type === "daily") {
      const today = new Date().toISOString().split("T")[0];
      const { data: todayEntries } = await supabase
        .from("xp_history")
        .select("xp_amount, created_at")
        .eq("user_id", userId)
        .eq("reward_id", rewardId)
        .gte("created_at", `${today}T00:00:00`);

      const earnedToday = todayEntries?.reduce((sum, e) => sum + (e.xp_amount || 0), 0) || 0;
      const entriesCount = todayEntries?.length || 0;

      const check = canEarnXp(
        rewardId,
        todayEntries && todayEntries.length > 0 ? new Date(todayEntries[todayEntries.length - 1].created_at) : null,
        entriesCount
      );

      if (!check.canEarn) {
        return { success: false, xpAwarded: 0, newTotalXp: userData.total_xp || 0, error: check.reason };
      }
    }

    // Calculate XP with bonuses
    const isWeekend = [0, 6].includes(new Date().getDay());
    const { baseXp, bonusXp, totalXp: xpAmount, streakMultiplier } = calculateXpReward(
      rewardId,
      userData.login_streak || 0,
      isWeekend
    );

    // Record XP history (optional - may fail if table doesn't exist yet)
    try {
      await supabase.from("xp_history").insert({
        user_id: userId,
        reward_id: rewardId,
        xp_amount: xpAmount,
        base_xp: baseXp,
        bonus_xp: bonusXp,
        streak_multiplier: streakMultiplier,
        metadata: metadata || {},
      });
    } catch (historyError) {
      console.error("Failed to record XP history:", historyError);
    }

    // Update user's total XP
    const newTotalXp = (userData.total_xp || 0) + xpAmount;
    const oldRank = calculateRank(userData.total_xp || 0);
    const newRank = calculateRank(newTotalXp);

    const updateData: any = {
      total_xp: newTotalXp,
    };

    // Check for rank up
    let rankUp = undefined;
    if (newRank.currentRank.id > oldRank.currentRank.id) {
      updateData.rank_id = newRank.currentRank.id;
      rankUp = {
        oldRank: oldRank.currentRank.id,
        newRank: newRank.currentRank.id,
        rankName: newRank.currentRank.name,
      };

      // If reached Legend rank, grant lifetime pro
      if (newRank.currentRank.id === 15) {
        updateData.plan_tier = "elite";
        updateData.lifetime_pro = true;
        updateData.lifetime_pro_granted_at = new Date().toISOString();
      }
    }

    const { error: updateError } = await supabase.from("users").update(updateData).eq("id", userId);

    if (updateError) {
      return { success: false, xpAwarded: 0, newTotalXp: userData.total_xp || 0, error: "Failed to update user" };
    }

    return {
      success: true,
      xpAwarded: xpAmount,
      newTotalXp,
      rankUp,
    };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Internal error" };
  }
}

/**
 * Get user's XP stats - always returns valid stats (defaults to 0 XP, rank 1 if error)
 */
export async function getUserXpStats(userId: string): Promise<UserXpStats> {
  // Default stats to return if anything fails
  const defaultStats: UserXpStats = {
    totalXp: 0,
    currentRankId: 1,
    currentStreak: 0,
    lastLoginDate: null,
    todayXp: 0,
    weekXp: 0,
    monthXp: 0,
  };

  try {
    const { data, error } = await supabase
      .from("users")
      .select("total_xp, rank_id, login_streak, last_login_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.warn("User XP data not found, using defaults:", error);
      return defaultStats;
    }

    // Calculate today's XP (with error handling for missing table)
    let todayXp = 0, weekXp = 0, monthXp = 0;
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: todayData } = await supabase
        .from("xp_history")
        .select("xp_amount")
        .eq("user_id", userId)
        .gte("created_at", `${today}T00:00:00`);
      todayXp = todayData?.reduce((sum, e) => sum + (e.xp_amount || 0), 0) || 0;

      // Calculate this week's XP
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { data: weekData } = await supabase
        .from("xp_history")
        .select("xp_amount")
        .eq("user_id", userId)
        .gte("created_at", weekStart.toISOString());
      weekXp = weekData?.reduce((sum, e) => sum + (e.xp_amount || 0), 0) || 0;

      // Calculate this month's XP
      const monthStart = new Date();
      monthStart.setDate(1);
      const { data: monthData } = await supabase
        .from("xp_history")
        .select("xp_amount")
        .eq("user_id", userId)
        .gte("created_at", monthStart.toISOString());
      monthXp = monthData?.reduce((sum, e) => sum + (e.xp_amount || 0), 0) || 0;
    } catch (xpError) {
      console.warn("XP history table may not exist, using defaults:", xpError);
    }

    return {
      totalXp: data.total_xp ?? 0,
      currentRankId: data.rank_id ?? 1,
      currentStreak: data.login_streak ?? 0,
      lastLoginDate: data.last_login_at,
      todayXp,
      weekXp,
      monthXp,
    };
  } catch (error) {
    console.error("Error getting XP stats:", error);
    return defaultStats;
  }
}

/**
 * Get XP history for a user
 */
export async function getXpHistory(userId: string, limit: number = 50): Promise<XpHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from("xp_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((entry) => ({
      id: entry.id,
      userId: entry.user_id,
      rewardId: entry.reward_id,
      xpAmount: entry.xp_amount,
      baseXp: entry.base_xp,
      bonusXp: entry.bonus_xp,
      streakMultiplier: entry.streak_multiplier,
      timestamp: entry.created_at,
      metadata: entry.metadata,
    }));
  } catch (error) {
    console.error("Error getting XP history:", error);
    return [];
  }
}

/**
 * Get or create daily challenge progress
 */
export async function getDailyChallengeProgress(userId: string): Promise<DailyProgress | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const challenge = getTodaysChallenge();

    // Check if progress exists
    const { data: existing, error } = await supabase
      .from("daily_challenge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    // If table doesn't exist or other error, return default progress
    if (error && (error.message?.includes('relation') || error.message?.includes('does not exist'))) {
      return {
        userId,
        date: today,
        challengeId: challenge.id,
        current: 0,
        target: challenge.requirement,
        completed: false,
        xpEarned: 0,
      };
    }

    if (existing) {
      return {
        userId: existing.user_id,
        date: existing.date,
        challengeId: existing.challenge_id,
        current: existing.current,
        target: existing.target,
        completed: existing.completed,
        xpEarned: existing.xp_earned,
      };
    }

    // Create new progress entry (may fail if table doesn't exist)
    const { data: created, error: createError } = await supabase
      .from("daily_challenge_progress")
      .insert({
        user_id: userId,
        date: today,
        challenge_id: challenge.id,
        target: challenge.requirement,
        current: 0,
        completed: false,
        xp_earned: 0,
      })
      .select()
      .single();

    if (createError || !created) {
      // Return default if creation failed
      return {
        userId,
        date: today,
        challengeId: challenge.id,
        current: 0,
        target: challenge.requirement,
        completed: false,
        xpEarned: 0,
      };
    }

    return {
      userId: created.user_id,
      date: created.date,
      challengeId: created.challenge_id,
      current: created.current,
      target: created.target,
      completed: created.completed,
      xpEarned: created.xp_earned,
    };
  } catch (error) {
    console.warn("Daily challenge progress table may not exist:", error);
    // Return default progress on error
    const today = new Date().toISOString().split("T")[0];
    const challenge = getTodaysChallenge();
    return {
      userId,
      date: today,
      challengeId: challenge.id,
      current: 0,
      target: challenge.requirement,
      completed: false,
      xpEarned: 0,
    };
  }
}

/**
 * Update daily challenge progress
 */
export async function updateDailyChallengeProgress(
  userId: string,
  taskType: string,
  increment: number = 1
): Promise<void> {
  try {
    const progress = await getDailyChallengeProgress(userId);
    if (!progress || progress.completed) return;

    const challenge = DAILY_CHALLENGES.find((c) => c.id === progress.challengeId);
    if (!challenge || challenge.taskType !== taskType) return;

    const newCurrent = progress.current + increment;
    const completed = newCurrent >= progress.target;

    let xpEarned = progress.xpEarned;
    if (completed && xpEarned === 0) {
      // Award XP for completing challenge
      await awardXp(userId, progress.challengeId, { challenge: true });
      xpEarned = challenge.xp;
    }

    await supabase
      .from("daily_challenge_progress")
      .update({
        current: newCurrent,
        completed,
        xp_earned: xpEarned,
      })
      .eq("user_id", userId)
      .eq("date", progress.date);
  } catch (error) {
    console.error("Error updating daily challenge:", error);
  }
}

/**
 * Track login and update streak
 */
export async function trackLogin(userId: string): Promise<{ streak: number; isNewDay: boolean }> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("last_login_at, login_streak, total_xp")
      .eq("id", userId)
      .single();

    if (error || !user) return { streak: 0, isNewDay: false };

    const now = new Date();
    const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;

    let newStreak = user.login_streak || 0;
    let isNewDay = false;

    if (lastLogin) {
      const daysSince = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince === 1) {
        // Consecutive day
        newStreak += 1;
        isNewDay = true;
      } else if (daysSince > 1) {
        // Streak broken
        newStreak = 1;
        isNewDay = true;
      }
    } else {
      newStreak = 1;
      isNewDay = true;
    }

    // Award streak milestone XP
    if (isNewDay && newStreak === 7) {
      await awardXp(userId, "login_streak_7");
    } else if (isNewDay && newStreak === 30) {
      await awardXp(userId, "login_streak_30");
    }

    await supabase
      .from("users")
      .update({
        last_login_at: now.toISOString(),
        login_streak: newStreak,
      })
      .eq("id", userId);

    return { streak: newStreak, isNewDay };
  } catch (error) {
    console.error("Error tracking login:", error);
    return { streak: 0, isNewDay: false };
  }
}

/**
 * Quick XP award helpers for common actions
 */
export const quickXpActions = {
  listingCreated: (userId: string, isDetailed: boolean = false) =>
    awardXp(userId, isDetailed ? "detailed_listing" : "create_listing"),

  saleCompleted: (userId: string, isQuick: boolean = false) =>
    awardXp(userId, isQuick ? "quick_delivery" : "sale_complete"),

  reviewReceived: (userId: string, stars: number) =>
    stars === 5 ? awardXp(userId, "five_star_review") : Promise.resolve({ success: false, xpAwarded: 0, newTotalXp: 0 }),

  reviewLeft: (userId: string) => awardXp(userId, "leave_review"),

  messageResponded: (userId: string, responseTimeMinutes: number) =>
    responseTimeMinutes <= 5 ? awardXp(userId, "quick_responder") : Promise.resolve({ success: false, xpAwarded: 0, newTotalXp: 0 }),

  questionAnswered: (userId: string) => awardXp(userId, "answer_question"),
};

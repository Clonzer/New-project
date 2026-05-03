/**
 * XP Rewards System - Synthix Marketplace
 * 
 * Features:
 * - One-time rewards for milestones
 * - Repeatable rewards with cooldowns
 * - Daily challenges with rotating tasks
 * - Timed events and bonuses
 * - Platform contribution rewards
 */

// XP Reward Categories
export type XpRewardType =
  | "onetime"    // One-time per user
  | "repeatable" // Can be earned multiple times with cooldown
  | "daily"      // Daily challenge
  | "weekly"     // Weekly challenge
  | "timed";     // Limited-time event

export interface XpReward {
  id: string;
  name: string;
  description: string;
  xp: number;
  type: XpRewardType;
  cooldownHours?: number; // For repeatable tasks
  maxPerDay?: number;     // Daily limit
  category: "selling" | "listing" | "social" | "platform" | "engagement" | "milestone";
  icon: string;
}

// All XP Rewards
export const XP_REWARDS: XpReward[] = [
  // === SELLING ACTIVITIES ===
  {
    id: "first_sale",
    name: "First Sale",
    description: "Complete your first order",
    xp: 100,
    type: "onetime",
    category: "selling",
    icon: "PartyPopper",
  },
  {
    id: "sale_complete",
    name: "Order Completed",
    description: "Complete an order successfully",
    xp: 25,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 50, // Max 50 sales per day for XP
    category: "selling",
    icon: "PackageCheck",
  },
  {
    id: "quick_delivery",
    name: "Quick Delivery",
    description: "Deliver within 24 hours of order",
    xp: 50,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "selling",
    icon: "Zap",
  },
  {
    id: "five_star_review",
    name: "5-Star Service",
    description: "Receive a 5-star review",
    xp: 75,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "selling",
    icon: "Star",
  },
  {
    id: "repeat_customer",
    name: "Repeat Customer",
    description: "Sell to a customer who bought before",
    xp: 40,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 15,
    category: "selling",
    icon: "Users",
  },
  {
    id: "bulk_order",
    name: "Bulk Order",
    description: "Sell 10+ items in a single order",
    xp: 150,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "selling",
    icon: "Boxes",
  },

  // === LISTING ACTIVITIES ===
  {
    id: "first_listing",
    name: "First Listing",
    description: "Create your first product listing",
    xp: 50,
    type: "onetime",
    category: "listing",
    icon: "PlusCircle",
  },
  {
    id: "create_listing",
    name: "New Listing",
    description: "Create a new product listing",
    xp: 15,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 30,
    category: "listing",
    icon: "Plus",
  },
  {
    id: "detailed_listing",
    name: "Detailed Listing",
    description: "Create a listing with 5+ images and detailed description",
    xp: 40,
    type: "repeatable",
    cooldownHours: 1,
    maxPerDay: 10,
    category: "listing",
    icon: "FileText",
  },
  {
    id: "category_diversity",
    name: "Category Explorer",
    description: "List in 5+ different categories",
    xp: 100,
    type: "onetime",
    category: "listing",
    icon: "LayoutGrid",
  },
  {
    id: "listing_streak",
    name: "Listing Streak",
    description: "Create a listing 7 days in a row",
    xp: 200,
    type: "onetime",
    category: "listing",
    icon: "Flame",
  },

  // === PLATFORM CONTRIBUTION ===
  {
    id: "bug_report",
    name: "Bug Hunter",
    description: "Report a verified bug",
    xp: 200,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 3,
    category: "platform",
    icon: "Bug",
  },
  {
    id: "feature_suggestion",
    name: "Innovator",
    description: "Suggest a feature that gets implemented",
    xp: 500,
    type: "onetime",
    category: "platform",
    icon: "Lightbulb",
  },
  {
    id: "help_article",
    name: "Community Teacher",
    description: "Write a help article/guide that gets approved",
    xp: 300,
    type: "repeatable",
    cooldownHours: 168, // Weekly
    maxPerDay: 1,
    category: "platform",
    icon: "BookOpen",
  },
  {
    id: "referral",
    name: "Ambassador",
    description: "Refer a new seller who makes 3+ sales",
    xp: 250,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "platform",
    icon: "Share2",
  },
  {
    id: "beta_tester",
    name: "Beta Tester",
    description: "Participate in beta testing and provide feedback",
    xp: 150,
    type: "repeatable",
    cooldownHours: 72,
    maxPerDay: 2,
    category: "platform",
    icon: "TestTube",
  },

  // === SOCIAL ENGAGEMENT ===
  {
    id: "leave_review",
    name: "Helpful Reviewer",
    description: "Leave a detailed review on a purchase",
    xp: 20,
    type: "repeatable",
    cooldownHours: 1,
    maxPerDay: 10,
    category: "social",
    icon: "MessageSquare",
  },
  {
    id: "helpful_review",
    name: "Community Voice",
    description: "Get 10+ helpful votes on your review",
    xp: 100,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "social",
    icon: "ThumbsUp",
  },
  {
    id: "answer_question",
    name: "Helper",
    description: "Answer another seller's question in forums",
    xp: 35,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "social",
    icon: "HelpCircle",
  },
  {
    id: "profile_complete",
    name: "Profile Perfectionist",
    description: "Complete your profile 100%",
    xp: 100,
    type: "onetime",
    category: "social",
    icon: "UserCheck",
  },
  {
    id: "verified_identity",
    name: "Trusted Member",
    description: "Complete identity verification",
    xp: 150,
    type: "onetime",
    category: "social",
    icon: "ShieldCheck",
  },

  // === ENGAGEMENT ===
  {
    id: "login_streak_7",
    name: "Weekly Streak",
    description: "Login 7 days in a row",
    xp: 100,
    type: "onetime",
    category: "engagement",
    icon: "CalendarCheck",
  },
  {
    id: "login_streak_30",
    name: "Monthly Dedication",
    description: "Login 30 days in a row",
    xp: 500,
    type: "onetime",
    category: "engagement",
    icon: "CalendarDays",
  },
  {
    id: "quick_responder",
    name: "Speed Demon",
    description: "Respond to messages within 5 minutes",
    xp: 15,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 30,
    category: "engagement",
    icon: "Clock",
  },

  // === MILESTONES ===
  {
    id: "first_1k_xp",
    name: "Rising Star",
    description: "Earn 1,000 total XP",
    xp: 0, // Just a milestone marker
    type: "onetime",
    category: "milestone",
    icon: "TrendingUp",
  },
  {
    id: "first_10k_sales",
    name: "10K Club",
    description: "Reach $10,000 in total sales",
    xp: 1000,
    type: "onetime",
    category: "milestone",
    icon: "DollarSign",
  },
  {
    id: "first_100_sales",
    name: "Century Seller",
    description: "Complete 100 orders",
    xp: 500,
    type: "onetime",
    category: "milestone",
    icon: "Award",
  },
];

// Daily Challenges - Rotate automatically
export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  xp: number;
  requirement: number;
  taskType: string;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily_listing",
    name: "Daily Creator",
    description: "Create 2 new listings today",
    xp: 50,
    requirement: 2,
    taskType: "create_listing",
  },
  {
    id: "daily_sale",
    name: "Daily Seller",
    description: "Complete 1 sale today",
    xp: 75,
    requirement: 1,
    taskType: "complete_sale",
  },
  {
    id: "daily_response",
    name: "Quick Responder",
    description: "Respond to 5 messages within 10 minutes",
    xp: 60,
    requirement: 5,
    taskType: "quick_response",
  },
  {
    id: "daily_share",
    name: "Social Butterfly",
    description: "Share 3 of your listings on social media",
    xp: 40,
    requirement: 3,
    taskType: "share_listing",
  },
  {
    id: "daily_review",
    name: "Community Reviewer",
    description: "Leave 2 helpful reviews",
    xp: 50,
    requirement: 2,
    taskType: "leave_review",
  },
  {
    id: "daily_deliver",
    name: "Speedy Delivery",
    description: "Deliver 3 orders within 24 hours",
    xp: 90,
    requirement: 3,
    taskType: "quick_delivery",
  },
  {
    id: "daily_update",
    name: "Fresh Stock",
    description: "Update 5 existing listings with new info/images",
    xp: 45,
    requirement: 5,
    taskType: "update_listing",
  },
];

// Weekly Challenges
export const WEEKLY_CHALLENGES: DailyChallenge[] = [
  {
    id: "weekly_sales",
    name: "Sales Champion",
    description: "Complete 10 sales this week",
    xp: 300,
    requirement: 10,
    taskType: "complete_sale",
  },
  {
    id: "weekly_listings",
    name: "Listing Spree",
    description: "Create 15 new listings this week",
    xp: 250,
    requirement: 15,
    taskType: "create_listing",
  },
  {
    id: "weekly_engagement",
    name: "Community Leader",
    description: "Answer 20 community questions",
    xp: 200,
    requirement: 20,
    taskType: "answer_question",
  },
  {
    id: "weekly_revenue",
    name: "Revenue Master",
    description: "Make $500 in sales this week",
    xp: 400,
    requirement: 500,
    taskType: "revenue_target",
  },
];

// Get today's daily challenge (rotates based on day of week + random factor)
export function getTodaysChallenge(): DailyChallenge {
  const dayOfWeek = new Date().getDay();
  const index = dayOfWeek % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

// Get this week's challenge
export function getWeeklyChallenge(): DailyChallenge {
  const weekOfYear = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const index = weekOfYear % WEEKLY_CHALLENGES.length;
  return WEEKLY_CHALLENGES[index];
}

// Calculate XP reward with potential bonuses
export function calculateXpReward(
  rewardId: string,
  currentStreak: number = 0,
  isWeekend: boolean = false
): { baseXp: number; bonusXp: number; totalXp: number; streakMultiplier: number } {
  const reward = XP_REWARDS.find((r) => r.id === rewardId);
  if (!reward) return { baseXp: 0, bonusXp: 0, totalXp: 0, streakMultiplier: 1 };

  let baseXp = reward.xp;
  let bonusXp = 0;
  let streakMultiplier = 1;

  // Streak bonus (up to 2x for 7+ day streaks)
  if (currentStreak >= 7) {
    streakMultiplier = 2.0;
  } else if (currentStreak >= 5) {
    streakMultiplier = 1.5;
  } else if (currentStreak >= 3) {
    streakMultiplier = 1.25;
  }

  // Weekend bonus (20% extra)
  if (isWeekend) {
    bonusXp += Math.round(baseXp * 0.2);
  }

  const totalXp = Math.round(baseXp * streakMultiplier) + bonusXp;

  return { baseXp, bonusXp, totalXp, streakMultiplier };
}

// Check if user can earn XP for a repeatable task
export function canEarnXp(
  rewardId: string,
  lastEarnedAt: Date | null,
  earnedToday: number,
  earnedThisWeek: number = 0
): { canEarn: boolean; reason?: string; cooldownRemaining?: number } {
  const reward = XP_REWARDS.find((r) => r.id === rewardId);
  if (!reward) return { canEarn: false, reason: "Invalid reward" };

  // Check daily limit
  if (reward.maxPerDay && earnedToday >= reward.maxPerDay) {
    return { canEarn: false, reason: `Daily limit reached (${reward.maxPerDay})` };
  }

  // Check cooldown
  if (reward.cooldownHours && lastEarnedAt) {
    const hoursSince = (Date.now() - lastEarnedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince < reward.cooldownHours) {
      const remaining = Math.ceil(reward.cooldownHours - hoursSince);
      return {
        canEarn: false,
        reason: `Cooldown: ${remaining}h remaining`,
        cooldownRemaining: remaining,
      };
    }
  }

  return { canEarn: true };
}

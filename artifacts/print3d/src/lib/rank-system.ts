// Rank System Configuration and Utilities
export interface Rank {
  id: number;
  name: string;
  minXp: number;
  maxXp: number;
  badgeColor: string;
  icon: string;
  benefits: string[];
}

export interface UserRankData {
  userId: string;
  currentXp: number;
  totalXp: number;
  rankId: number;
  rankName: string;
  nextRankXp: number;
  xpToNextRank: number;
  progressPercent: number;
}

// Define all ranks
export const RANKS: Rank[] = [
  {
    id: 1,
    name: "Novice Maker",
    minXp: 0,
    maxXp: 99,
    badgeColor: "from-zinc-500 to-zinc-600",
    icon: "🔰",
    benefits: ["Basic shop features"]
  },
  {
    id: 2,
    name: "Apprentice",
    minXp: 100,
    maxXp: 499,
    badgeColor: "from-green-500 to-emerald-600",
    icon: "🌱",
    benefits: ["Priority support", "Custom shop banner"]
  },
  {
    id: 3,
    name: "Craftsman",
    minXp: 500,
    maxXp: 1499,
    badgeColor: "from-blue-500 to-cyan-600",
    icon: "🔧",
    benefits: ["Featured in search", "Analytics dashboard"]
  },
  {
    id: 4,
    name: "Artisan",
    minXp: 1500,
    maxXp: 3999,
    badgeColor: "from-purple-500 to-violet-600",
    icon: "⚡",
    benefits: ["24h Silver Sponsorship (weekly)", "Early access to features"]
  },
  {
    id: 5,
    name: "Master Maker",
    minXp: 4000,
    maxXp: 9999,
    badgeColor: "from-yellow-500 to-amber-600",
    icon: "🏆",
    benefits: ["48h Gold Sponsorship (weekly)", "Verified badge", "Commission discounts"]
  },
  {
    id: 6,
    name: "Legend",
    minXp: 10000,
    maxXp: 24999,
    badgeColor: "from-pink-500 to-rose-600",
    icon: "👑",
    benefits: ["72h Premium Sponsorship (weekly)", "Priority listing placement", "Exclusive events"]
  },
  {
    id: 7,
    name: "Synthix Icon",
    minXp: 100000,
    maxXp: Infinity,
    badgeColor: "from-amber-300 via-yellow-500 to-amber-600",
    icon: "👑",
    benefits: ["Lifetime Pro Membership", "Hall of Fame", "Direct line to team", "Custom features", "0% Commission Forever"]
  }
];

// XP Rewards for various actions
export const XP_REWARDS = {
  // Store/Profile Actions
  COMPLETE_PROFILE: 25,
  ADD_FIRST_LISTING: 50,
  ADD_LISTING: 10,
  UPDATE_SHOP_BANNER: 5,
  
  // Order Actions
  RECEIVE_FIRST_ORDER: 100,
  SHIP_ORDER: 20,
  COMPLETE_ORDER: 30,
  RECEIVE_5_STAR_REVIEW: 50,
  RECEIVE_POSITIVE_REVIEW: 25,
  
  // Custom Order Actions
  ACCEPT_CUSTOM_REQUEST: 15,
  SUBMIT_QUOTE: 10,
  QUOTE_ACCEPTED: 40,
  COMPLETE_CUSTOM_ORDER: 60,
  
  // Engagement Actions
  RESPOND_TO_MESSAGE: 2,
  CONTEST_ENTRY: 75,
  CONTEST_WIN: 500,
  CONTEST_PLACE_2ND: 250,
  CONTEST_PLACE_3RD: 150,
  
  // Community Actions
  REFER_SELLER: 100,
  REFER_BUYER: 50,
  SHARE_ON_SOCIAL: 10,
  
  // Milestone Bonuses
  FIRST_100_SALES: 500,
  FIRST_500_SALES: 1000,
  FIRST_1000_SALES: 2500,
} as const;

export type XpAction = keyof typeof XP_REWARDS;

// Calculate user's rank based on XP
export function calculateRank(totalXp: number): { currentRank: Rank; nextRank: Rank | null; progress: number } {
  const currentRank = RANKS.findLast(r => totalXp >= r.minXp) || RANKS[0];
  const nextRank = RANKS.find(r => r.id === currentRank.id + 1) || null;
  
  let progress = 100;
  if (nextRank) {
    const xpInCurrentRank = totalXp - currentRank.minXp;
    const xpNeededForNext = nextRank.minXp - currentRank.minXp;
    progress = Math.min(100, Math.round((xpInCurrentRank / xpNeededForNext) * 100));
  }
  
  return { currentRank, nextRank, progress };
}

// Get XP needed for next rank
export function getXpToNextRank(totalXp: number): number {
  const { currentRank, nextRank } = calculateRank(totalXp);
  if (!nextRank) return 0;
  return nextRank.minXp - totalXp;
}

// Format XP number
export function formatXp(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Get rank badge styles
export function getRankBadgeStyles(rankId: number): {
  gradient: string;
  icon: string;
  name: string;
} {
  const rank = RANKS.find(r => r.id === rankId) || RANKS[0];
  return {
    gradient: rank.badgeColor,
    icon: rank.icon,
    name: rank.name
  };
}

// Check if user qualifies for sponsorship reward
export function checkSponsorshipReward(
  oldRank: number, 
  newRank: number
): { tier: "silver" | "gold" | "premium"; duration: number } | null {
  if (oldRank === newRank) return null;
  
  switch (newRank) {
    case 4: // Artisan
      return { tier: "silver", duration: 24 };
    case 5: // Master Maker
      return { tier: "gold", duration: 48 };
    case 6: // Legend
      return { tier: "premium", duration: 72 };
    default:
      return null;
  }
}

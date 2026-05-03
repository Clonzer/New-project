/**
 * Brand New Rank System - Synthix Marketplace
 * 
 * Features:
 * - 15 ranks with exponentially increasing XP requirements
 * - Final rank rewards Lifetime Pro Subscription
 * - Progress tracking with visual indicators
 * - Rank perks and benefits at each level
 */

export interface Rank {
  id: number;
  name: string;
  slug: string;
  minXp: number;
  maxXp: number;
  icon: string;
  color: string;
  gradient: string;
  badge: string;
  perks: string[];
  isLifetime?: boolean;
}

// 15 Ranks - Exponentially harder to achieve
// Last rank (Legend) grants Lifetime Pro Subscription
export const RANKS: Rank[] = [
  {
    id: 1,
    name: "Newcomer",
    slug: "newcomer",
    minXp: 0,
    maxXp: 99,
    icon: "Sprout",
    color: "#6b7280",
    gradient: "from-gray-400 to-gray-600",
    badge: "🌱",
    perks: ["Basic marketplace access", "3 free listings"],
  },
  {
    id: 2,
    name: "Explorer",
    slug: "explorer",
    minXp: 100,
    maxXp: 299,
    icon: "Compass",
    color: "#22c55e",
    gradient: "from-green-400 to-emerald-600",
    badge: "🧭",
    perks: ["5 free listings", "Access to basic analytics"],
  },
  {
    id: 3,
    name: "Artisan",
    slug: "artisan",
    minXp: 300,
    maxXp: 699,
    icon: "Hammer",
    color: "#3b82f6",
    gradient: "from-blue-400 to-blue-600",
    badge: "🔨",
    perks: ["8 free listings", "Priority support queue"],
  },
  {
    id: 4,
    name: "Craftsman",
    slug: "craftsman",
    minXp: 700,
    maxXp: 1499,
    icon: "Wrench",
    color: "#06b6d4",
    gradient: "from-cyan-400 to-cyan-600",
    badge: "⚒️",
    perks: ["12 free listings", "Custom shop banner"],
  },
  {
    id: 5,
    name: "Merchant",
    slug: "merchant",
    minXp: 1500,
    maxXp: 2999,
    icon: "Store",
    color: "#8b5cf6",
    gradient: "from-violet-400 to-violet-600",
    badge: "🏪",
    perks: ["15 free listings", "Featured in new sellers"],
  },
  {
    id: 6,
    name: "Trader",
    slug: "trader",
    minXp: 3000,
    maxXp: 5999,
    icon: "Handshake",
    color: "#f59e0b",
    gradient: "from-amber-400 to-orange-500",
    badge: "🤝",
    perks: ["20 free listings", "5% off sponsorships"],
  },
  {
    id: 7,
    name: "Specialist",
    slug: "specialist",
    minXp: 6000,
    maxXp: 11999,
    icon: "Star",
    color: "#ec4899",
    gradient: "from-pink-400 to-rose-500",
    badge: "⭐",
    perks: ["25 free listings", "Verified badge", "Priority search ranking"],
  },
  {
    id: 8,
    name: "Expert",
    slug: "expert",
    minXp: 12000,
    maxXp: 24999,
    icon: "Award",
    color: "#6366f1",
    gradient: "from-indigo-400 to-indigo-600",
    badge: "🏅",
    perks: ["30 free listings", "10% off sponsorships", "Early access features"],
  },
  {
    id: 9,
    name: "Professional",
    slug: "professional",
    minXp: 25000,
    maxXp: 49999,
    icon: "Briefcase",
    color: "#14b8a6",
    gradient: "from-teal-400 to-teal-600",
    badge: "💼",
    perks: ["40 free listings", "Custom URL", "Advanced analytics"],
  },
  {
    id: 10,
    name: "Master",
    slug: "master",
    minXp: 50000,
    maxXp: 99999,
    icon: "Crown",
    color: "#fbbf24",
    gradient: "from-amber-300 to-yellow-500",
    badge: "👑",
    perks: ["50 free listings", "15% off sponsorships", "Featured placement priority"],
  },
  {
    id: 11,
    name: "Grandmaster",
    slug: "grandmaster",
    minXp: 100000,
    maxXp: 199999,
    icon: "Gem",
    color: "#a855f7",
    gradient: "from-purple-400 to-fuchsia-500",
    badge: "💎",
    perks: ["75 free listings", "20% off sponsorships", "Dedicated support"],
  },
  {
    id: 12,
    name: "Elite",
    slug: "elite",
    minXp: 200000,
    maxXp: 399999,
    icon: "Trophy",
    color: "#dc2626",
    gradient: "from-red-400 to-red-600",
    badge: "🏆",
    perks: ["100 free listings", "25% off sponsorships", "Homepage feature guarantee"],
  },
  {
    id: 13,
    name: "Champion",
    slug: "champion",
    minXp: 400000,
    maxXp: 799999,
    icon: "Medal",
    color: "#0891b2",
    gradient: "from-cyan-500 to-blue-600",
    badge: "🥇",
    perks: ["150 free listings", "30% off sponsorships", "Exclusive beta access"],
  },
  {
    id: 14,
    name: "Titan",
    slug: "titan",
    minXp: 800000,
    maxXp: 1599999,
    icon: "Zap",
    color: "#7c3aed",
    gradient: "from-violet-500 to-purple-700",
    badge: "⚡",
    perks: ["200 free listings", "40% off sponsorships", "Partner program eligibility"],
  },
  {
    id: 15,
    name: "Legend",
    slug: "legend",
    minXp: 1600000,
    maxXp: Infinity,
    icon: "Crown",
    color: "#f59e0b",
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    badge: "👑",
    perks: [
      "UNLIMITED listings",
      "LIFETIME PRO SUBSCRIPTION (FREE)",
      "50% off all sponsorships",
      "Direct line to founders",
      "Custom features on request",
      "Legendary badge on all listings",
    ],
    isLifetime: true,
  },
];

// Calculate rank based on total XP
export function calculateRank(totalXp: number): {
  currentRank: Rank;
  nextRank: Rank | null;
  progress: number;
  xpToNext: number;
} {
  const currentRank = RANKS.find((rank, index) => {
    const nextRank = RANKS[index + 1];
    if (!nextRank) return totalXp >= rank.minXp;
    return totalXp >= rank.minXp && totalXp < nextRank.minXp;
  }) || RANKS[RANKS.length - 1];

  const nextRank = RANKS.find((rank) => rank.id === currentRank.id + 1) || null;

  let progress = 0;
  let xpToNext = 0;

  if (nextRank) {
    const xpInCurrentRank = totalXp - currentRank.minXp;
    const xpNeededForRank = nextRank.minXp - currentRank.minXp;
    progress = Math.min(100, Math.round((xpInCurrentRank / xpNeededForRank) * 100));
    xpToNext = nextRank.minXp - totalXp;
  } else {
    progress = 100;
    xpToNext = 0;
  }

  return { currentRank, nextRank, progress, xpToNext };
}

// Get rank by ID
export function getRankById(rankId: number): Rank | undefined {
  return RANKS.find((r) => r.id === rankId);
}

// Get rank by slug
export function getRankBySlug(slug: string): Rank | undefined {
  return RANKS.find((r) => r.slug === slug);
}

// Format large XP numbers
export function formatXp(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Get rank position (e.g., "Top 1%", "Top 10%")
export function getRankPosition(rankId: number): string {
  if (rankId >= 15) return "Top 0.1%";
  if (rankId >= 14) return "Top 0.5%";
  if (rankId >= 13) return "Top 1%";
  if (rankId >= 12) return "Top 2%";
  if (rankId >= 11) return "Top 5%";
  if (rankId >= 10) return "Top 10%";
  if (rankId >= 8) return "Top 25%";
  if (rankId >= 6) return "Top 50%";
  return "Getting Started";
}

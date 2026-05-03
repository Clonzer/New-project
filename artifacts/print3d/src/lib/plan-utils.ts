import type { User } from "./supabase";

export type PlanTier = "starter" | "pro" | "elite" | "enterprise";

export const PLAN_LIMITS = {
  starter: {
    maxListings: 3,
    platformFeePercent: 10,
    analytics: false,
    sponsorshipDiscount: 0,
    prioritySupport: false,
    customBranding: false,
    teamMembers: 1,
  },
  pro: {
    maxListings: 20,
    platformFeePercent: 7,
    analytics: true,
    sponsorshipDiscount: 13,
    prioritySupport: true,
    customBranding: true,
    teamMembers: 1,
  },
  elite: {
    maxListings: -1, // unlimited
    platformFeePercent: 5,
    analytics: true,
    sponsorshipDiscount: 17,
    prioritySupport: true,
    customBranding: true,
    teamMembers: 1,
  },
  enterprise: {
    maxListings: -1, // unlimited
    platformFeePercent: 3, // negotiated
    analytics: true,
    sponsorshipDiscount: 0, // No discount - Enterprise pays full price
    prioritySupport: true,
    customBranding: true,
    teamMembers: -1, // per-seat, dynamic
    perSeatPricing: {
      basePrice: 199,
      seatPrice: 49,
    },
  },
} as const;

export function getPlanLimits(tier: PlanTier | undefined) {
  return PLAN_LIMITS[tier || "starter"];
}

export function canCreateListing(
  user: User | null,
  currentListingCount: number
): { allowed: boolean; reason?: string; upgradePath?: string } {
  if (!user) {
    return {
      allowed: false,
      reason: "Please log in to create listings",
      upgradePath: "/login",
    };
  }

  const limits = getPlanLimits(user.planTier);

  // Unlimited listings
  if (limits.maxListings === -1) {
    return { allowed: true };
  }

  if (currentListingCount >= limits.maxListings) {
    const tier = user.planTier || "starter";
    return {
      allowed: false,
      reason: `You've reached your ${limits.maxListings} listing limit on the ${tier} plan. Upgrade to create more listings.`,
      upgradePath: "/pricing",
    };
  }

  return { allowed: true };
}

export function canAccessAnalytics(user: User | null): boolean {
  if (!user) return false;
  const limits = getPlanLimits(user.planTier);
  return limits.analytics;
}

export function getSponsorshipDiscount(user: User | null): number {
  if (!user) return 0;
  const limits = getPlanLimits(user.planTier);
  return limits.sponsorshipDiscount;
}

export function hasPrioritySupport(user: User | null): boolean {
  if (!user) return false;
  const limits = getPlanLimits(user.planTier);
  return limits.prioritySupport;
}

export function hasCustomBranding(user: User | null): boolean {
  if (!user) return false;
  const limits = getPlanLimits(user.planTier);
  return limits.customBranding;
}

export function getPlatformFeePercent(user: User | null): number {
  if (!user) return 10; // default 10%
  const limits = getPlanLimits(user.planTier);
  return limits.platformFeePercent;
}

export function getRemainingListings(
  user: User | null,
  currentListingCount: number
): number {
  if (!user) return 0;
  const limits = getPlanLimits(user.planTier);
  if (limits.maxListings === -1) return -1; // unlimited
  return Math.max(0, limits.maxListings - currentListingCount);
}

export function getPlanDisplayName(tier: PlanTier | undefined): string {
  const names: Record<PlanTier, string> = {
    starter: "Starter",
    pro: "Pro",
    elite: "Elite",
    enterprise: "Enterprise",
  };
  return names[tier || "starter"];
}

export function getNextPlan(tier: PlanTier | undefined): PlanTier | null {
  const progression: PlanTier[] = ["starter", "pro", "elite", "enterprise"];
  const currentIndex = progression.indexOf(tier || "starter");
  if (currentIndex === -1 || currentIndex >= progression.length - 1) {
    return null;
  }
  return progression[currentIndex + 1];
}

// Enterprise seat pricing helpers
export function calculateEnterprisePrice(seatCount: number): number {
  const limits = PLAN_LIMITS.enterprise;
  if (!limits.perSeatPricing) return 199;
  return limits.perSeatPricing.basePrice + (limits.perSeatPricing.seatPrice * seatCount);
}

export function getEnterpriseSeatPrice(): number {
  return PLAN_LIMITS.enterprise.perSeatPricing?.seatPrice || 49;
}

export function getEnterpriseBasePrice(): number {
  return PLAN_LIMITS.enterprise.perSeatPricing?.basePrice || 199;
}

export function canAddTeamMember(user: User | null, currentMemberCount: number): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: "Please log in to manage team" };
  }

  if (user.planTier !== "enterprise") {
    return { allowed: false, reason: "Enterprise plan required for team members" };
  }

  if (!user.isTeamOwner) {
    return { allowed: false, reason: "Only team owners can add members" };
  }

  const seatCount = user.seatCount || 1;
  if (currentMemberCount >= seatCount) {
    return { allowed: false, reason: `Seat limit reached (${seatCount} seats). Upgrade to add more.` };
  }

  return { allowed: true };
}

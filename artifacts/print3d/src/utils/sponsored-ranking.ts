export type SponsorTier = "premium" | "gold" | "silver" | null;

interface RankableItem {
  id: number | string;
  totalOrders?: number;
  totalPrints?: number;
  rating?: number;
  reviewCount?: number;
}

interface SponsoredItem extends RankableItem {
  sponsorTier?: SponsorTier;
  isSponsored?: boolean;
  promotionLevel?: number;
}

const TIER_WEIGHTS = {
  premium: 1000,
  gold: 500,
  silver: 200,
  null: 0,
};

const PROMOTION_MULTIPLIER = 100;

/**
 * Calculate a ranking score for an item based on sponsorship tier and performance metrics.
 * Higher score = higher placement in listings.
 */
export function calculateRankingScore(item: SponsoredItem): number {
  const tierWeight = TIER_WEIGHTS[item.sponsorTier || (item.isSponsored ? "silver" : null)] || 0;
  const promotionBonus = (item.promotionLevel || 0) * PROMOTION_MULTIPLIER;
  
  // Performance metrics (sales, reviews, rating)
  const orderScore = (item.totalOrders || item.totalPrints || 0) * 10;
  const reviewScore = (item.reviewCount || 0) * 5;
  const ratingScore = (item.rating || 0) * 20;
  
  return tierWeight + promotionBonus + orderScore + reviewScore + ratingScore;
}

/**
 * Sort items by ranking score (highest first), sprinkling sponsored items throughout.
 * Strategy: Place premium sponsors at top, then mix gold/silver with high-performing regular items.
 */
export function sortByRanking<T extends SponsoredItem>(items: T[]): T[] {
  return [...items].sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
}

/**
 * Interleave sponsored items with regular items for even distribution.
 * Premium sponsors get top spots, others are sprinkled every N items.
 */
export function sprinkleSponsoredItems<T extends SponsoredItem>(
  items: T[],
  options: {
    premiumInterval?: number;
    goldInterval?: number;
    silverInterval?: number;
  } = {}
): T[] {
  const { premiumInterval = 3, goldInterval = 6, silverInterval = 10 } = options;
  
  const sponsored = items.filter(i => i.isSponsored || i.sponsorTier);
  const regular = items.filter(i => !i.isSponsored && !i.sponsorTier);
  
  const premium = sponsored.filter(i => i.sponsorTier === "premium" || i.promotionLevel >= 8);
  const gold = sponsored.filter(i => i.sponsorTier === "gold" || (i.promotionLevel >= 5 && i.promotionLevel < 8));
  const silver = sponsored.filter(i => i.sponsorTier === "silver" || (i.promotionLevel >= 1 && i.promotionLevel < 5));
  
  const result: T[] = [];
  let regularIndex = 0;
  
  // Add premium sponsors at the very top (first 3 positions)
  premium.slice(0, 3).forEach(item => result.push(item));
  
  // Then interleave the rest
  let counter = 0;
  while (regularIndex < regular.length || gold.length > 0 || silver.length > 0) {
    // Add regular items
    for (let i = 0; i < premiumInterval && regularIndex < regular.length; i++) {
      result.push(regular[regularIndex++]);
      counter++;
    }
    
    // Sprinkle gold sponsor every goldInterval items
    if (counter % goldInterval === 0 && gold.length > 0) {
      result.push(gold.shift()!);
    }
    
    // Sprinkle silver sponsor every silverInterval items
    if (counter % silverInterval === 0 && silver.length > 0) {
      result.push(silver.shift()!);
    }
    
    // Safety break
    if (result.length > items.length * 2) break;
  }
  
  // Add any remaining items
  result.push(...regular.slice(regularIndex));
  result.push(...gold, ...silver);
  
  return result;
}

/**
 * Check if a seller/listing is sponsored and get their tier
 */
export function getSponsorshipInfo(
  itemId: number | string,
  sponsoredIds: Map<string | number, { tier: SponsorTier; level: number }>
): { isSponsored: boolean; tier: SponsorTier; level: number } {
  const info = sponsoredIds.get(itemId);
  return {
    isSponsored: !!info,
    tier: info?.tier || null,
    level: info?.level || 0,
  };
}

/**
 * Hook-style helper to enhance items with sponsorship data
 */
export function enhanceWithSponsorship<T extends { id: number | string }>(
  items: T[],
  sponsorMap: Map<string | number, { tier: SponsorTier; level: number }>
): Array<T & { isSponsored: boolean; sponsorTier: SponsorTier; promotionLevel: number }> {
  return items.map(item => {
    const sponsorInfo = sponsorMap.get(item.id);
    return {
      ...item,
      isSponsored: !!sponsorInfo,
      sponsorTier: sponsorInfo?.tier || null,
      promotionLevel: sponsorInfo?.level || 0,
    };
  });
}

import { Listing } from '@/lib/workspace-api-mock';

export interface SponsoredListing extends Listing {
  isSponsored: boolean;
  sponsorTier?: 'premium' | 'gold' | 'silver';
  sponsorLevel?: number; // 1-10 scale for placement priority
  views?: number;
  rating?: number;
  orders_count?: number;
}

export interface PlacementConfig {
  premiumInterval?: number; // Show premium every N listings
  goldInterval?: number; // Show gold every N listings  
  silverInterval?: number; // Show silver every N listings
  maxSponsoredPerBatch?: number; // Maximum sponsored items per batch
}

export const DEFAULT_PLACEMENT_CONFIG: PlacementConfig = {
  premiumInterval: 3,
  goldInterval: 5,
  silverInterval: 8,
  maxSponsoredPerBatch: 2
};

/**
 * Calculate placement score based on sponsorship tier and popularity metrics
 */
export function calculatePlacementScore(listing: SponsoredListing): number {
  const tierScores = {
    premium: 100,
    gold: 75,
    silver: 50,
    none: 0
  };

  const popularityScore = (listing.views || 0) * 0.1 + // Views weight
                          (listing.orders_count || 0) * 2 + // Orders weight
                          (listing.rating || 0) * 10; // Rating weight

  return tierScores[listing.sponsorTier || 'none'] + popularityScore + (listing.sponsorLevel || 0) * 5;
}

/**
 * Sort listings with sponsored items placed strategically
 */
export function sortListingsWithSponsorship<T extends SponsoredListing>(
  listings: T[],
  config: PlacementConfig = DEFAULT_PLACEMENT_CONFIG
): T[] {
  const sponsored = listings.filter(l => l.isSponsored);
  const regular = listings.filter(l => !l.isSponsored);

  // Sort both groups by placement score
  sponsored.sort((a, b) => calculatePlacementScore(b) - calculatePlacementScore(a));
  regular.sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0));

  // Interleave sponsored items strategically
  const result: T[] = [];
  let sponsoredIndex = 0;
  let regularIndex = 0;

  while (sponsoredIndex < sponsored.length || regularIndex < regular.length) {
    // Add premium if it's time
    if (sponsoredIndex < sponsored.length && sponsoredIndex % config.premiumInterval === 0) {
      result.push(sponsored[sponsoredIndex]);
      sponsoredIndex++;
    }
    // Add gold if it's time  
    else if (sponsoredIndex < sponsored.length && sponsoredIndex % config.goldInterval === 0) {
      result.push(sponsored[sponsoredIndex]);
      sponsoredIndex++;
    }
    // Add silver if it's time
    else if (sponsoredIndex < sponsored.length && sponsoredIndex % config.silverInterval === 0) {
      result.push(sponsored[sponsoredIndex]);
      sponsoredIndex++;
    }

    // Add regular items
    const regularBatchSize = Math.max(1, 3 - (sponsoredIndex % 4)); // 1-3 regular items between sponsored
    for (let i = 0; i < regularBatchSize && regularIndex < regular.length; i++) {
      result.push(regular[regularIndex]);
      regularIndex++;
    }

    // Add remaining regular items
    while (regularIndex < regular.length) {
      result.push(regular[regularIndex]);
      regularIndex++;
    }

    return result;
}

/**
 * Check if a listing should be promoted based on performance
 */
export function shouldPromoteListing(listing: any, threshold: number = 50): boolean {
  return ((listing as any).views || 0) >= threshold || 
         ((listing as any).orders_count || 0) >= threshold / 10 ||
         ((listing as any).rating || 0) >= 4.0;
}

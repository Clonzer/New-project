import type { Listing } from "@workspace/api-client-react";

export type ListingPriceInsight = {
  label: "Good deal" | "Fair price" | "Premium price";
  detail: string;
  tone: "good" | "fair" | "premium";
};

export function buildListingPriceInsights(listings: Listing[]) {
  const categoryBuckets = new Map<string, Listing[]>();

  for (const listing of listings) {
    const key = listing.category.trim().toLowerCase();
    const bucket = categoryBuckets.get(key) ?? [];
    bucket.push(listing);
    categoryBuckets.set(key, bucket);
  }

  const insights = new Map<number, ListingPriceInsight>();

  for (const listing of listings) {
    const comparableListings = categoryBuckets.get(listing.category.trim().toLowerCase()) ?? [];
    if (comparableListings.length < 3) continue;

    const average =
      comparableListings.reduce((sum, item) => sum + item.basePrice, 0) / comparableListings.length;

    if (!Number.isFinite(average) || average <= 0) continue;

    const delta = (listing.basePrice - average) / average;

    if (delta <= -0.12) {
      insights.set(listing.id, {
        label: "Good deal",
        detail: `${Math.round(Math.abs(delta) * 100)}% below similar ${listing.category.toLowerCase()} listings`,
        tone: "good",
      });
      continue;
    }

    if (delta >= 0.18) {
      insights.set(listing.id, {
        label: "Premium price",
        detail: `${Math.round(delta * 100)}% above similar ${listing.category.toLowerCase()} listings`,
        tone: "premium",
      });
      continue;
    }

    insights.set(listing.id, {
      label: "Fair price",
      detail: "In line with similar listings on Synthix",
      tone: "fair",
    });
  }

  return insights;
}

import type { Listing } from "@/lib/workspace-api-mock";

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

    const insight: ListingPriceInsight = {
      label: delta <= -0.12 ? "Good deal" : delta >= 0.18 ? "Premium price" : "Fair price",
      detail: delta <= -0.12
        ? `${Math.round(Math.abs(delta) * 100)}% below similar ${listing.category.toLowerCase()} listings`
        : delta >= 0.18
        ? `${Math.round(delta * 100)}% above similar ${listing.category.toLowerCase()} listings`
        : "In line with similar listings on Synthix",
      tone: delta <= -0.12 ? "good" : delta >= 0.18 ? "premium" : "fair",
    };

    insights.set(listing.id, insight);

    insights.set(listing.id, {
      label: "Fair price",
      detail: "In line with similar listings on Synthix",
      tone: "fair",
    });
  }

  return insights;
}

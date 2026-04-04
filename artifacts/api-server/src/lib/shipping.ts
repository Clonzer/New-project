const EUROPE = new Set([
  "GB", "IE", "FR", "DE", "ES", "IT", "NL", "BE", "PT", "SE", "NO", "DK", "FI",
  "PL", "CZ", "AT", "CH", "RO", "HU", "GR", "BG", "HR", "SK", "SI", "EE", "LV", "LT", "LU",
]);

const NORTH_AMERICA = new Set(["US", "CA", "MX"]);

export type ShippingProfileLike = {
  countryCode?: string | null;
  sellingRegions?: string[] | null;
  domesticShippingCost?: number | null;
  europeShippingCost?: number | null;
  northAmericaShippingCost?: number | null;
  internationalShippingCost?: number | null;
  freeShippingThreshold?: number | null;
  defaultShippingCost?: number | null;
};

function normalizeCountryCode(countryCode: string | null | undefined) {
  return countryCode?.trim().toUpperCase() || null;
}

export function determineShippingZone(sellerCountry: string | null | undefined, buyerCountry: string | null | undefined) {
  const seller = normalizeCountryCode(sellerCountry);
  const buyer = normalizeCountryCode(buyerCountry);
  if (!seller || !buyer) return "default";
  if (seller === buyer) return "domestic";
  if (EUROPE.has(seller) && EUROPE.has(buyer)) return "europe";
  if (NORTH_AMERICA.has(seller) && NORTH_AMERICA.has(buyer)) return "north_america";
  return "international";
}

export function canSellerShipToCountry(profile: ShippingProfileLike, buyerCountry: string | null | undefined) {
  const buyer = normalizeCountryCode(buyerCountry);
  if (!buyer) return true;
  const regions = (profile.sellingRegions ?? []).map((region) => region.trim().toUpperCase()).filter(Boolean);
  if (!regions.length || regions.includes("WORLDWIDE")) return true;
  return regions.includes(buyer);
}

export function getShippingEstimate(
  profile: ShippingProfileLike,
  buyerCountry: string | null | undefined,
  subtotal: number,
  listingShippingCost?: number | null,
) {
  const zone = determineShippingZone(profile.countryCode, buyerCountry);
  const freeThreshold = profile.freeShippingThreshold ?? null;
  if (freeThreshold != null && subtotal >= freeThreshold) {
    return { zone, cost: 0 };
  }

  const zoneCost =
    zone === "domestic"
      ? profile.domesticShippingCost
      : zone === "europe"
        ? profile.europeShippingCost
        : zone === "north_america"
          ? profile.northAmericaShippingCost
          : zone === "international"
            ? profile.internationalShippingCost
            : null;

  const cost = zoneCost ?? listingShippingCost ?? profile.defaultShippingCost ?? 0;
  return { zone, cost: Number(cost.toFixed(2)) };
}

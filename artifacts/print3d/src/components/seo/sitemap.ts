// Sitemap generation utility for Synthix marketplace
// This generates an XML sitemap for search engines

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

// Static pages that should always be in the sitemap
const staticPages: SitemapUrl[] = [
  { loc: "https://synthix.com", changefreq: "daily", priority: 1.0 },
  { loc: "https://synthix.com/about", changefreq: "monthly", priority: 0.8 },
  { loc: "https://synthix.com/contact", changefreq: "monthly", priority: 0.7 },
  { loc: "https://synthix.com/help", changefreq: "weekly", priority: 0.7 },
  { loc: "https://synthix.com/pricing", changefreq: "monthly", priority: 0.8 },
  { loc: "https://synthix.com/legal", changefreq: "monthly", priority: 0.5 },
  { loc: "https://synthix.com/listings", changefreq: "daily", priority: 0.9 },
  { loc: "https://synthix.com/discover", changefreq: "daily", priority: 0.9 },
  { loc: "https://synthix.com/explore", changefreq: "daily", priority: 0.9 },
  { loc: "https://synthix.com/contests", changefreq: "weekly", priority: 0.7 },
];

// Generate XML sitemap from URLs
function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
    ${url.priority ? `<priority>${url.priority}</priority>` : ""}
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Fetch all active vendor shops
async function fetchVendorShops(): Promise<SitemapUrl[]> {
  if (!supabaseUrl || !supabaseKey) return [];
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: shops, error } = await supabase
    .from("profiles")
    .select("id, storefront_name, updated_at, has_listings")
    .eq("has_listings", true)
    .order("updated_at", { ascending: false });
  
  if (error || !shops) return [];
  
  return shops.map((shop) => ({
    loc: `https://synthix.com/shop/${shop.id}`,
    lastmod: shop.updated_at ? new Date(shop.updated_at).toISOString().split("T")[0] : undefined,
    changefreq: "daily",
    priority: 0.8,
  }));
}

// Fetch all active product listings
async function fetchProductListings(): Promise<SitemapUrl[]> {
  if (!supabaseUrl || !supabaseKey) return [];
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, updated_at, availability, seller_id")
    .eq("availability", "available")
    .order("updated_at", { ascending: false });
  
  if (error || !listings) return [];
  
  return listings.map((listing) => ({
    loc: `https://synthix.com/listings/${listing.id}`,
    lastmod: listing.updated_at ? new Date(listing.updated_at).toISOString().split("T")[0] : undefined,
    changefreq: "daily",
    priority: 0.9,
  }));
}

// Fetch all equipment/printer listings
async function fetchEquipmentListings(): Promise<SitemapUrl[]> {
  if (!supabaseUrl || !supabaseKey) return [];
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: printers, error } = await supabase
    .from("printers")
    .select("id, name, updated_at, is_available")
    .eq("is_available", true)
    .order("updated_at", { ascending: false });
  
  if (error || !printers) return [];
  
  return printers.map((printer) => ({
    loc: `https://synthix.com/equipment/${printer.id}`,
    lastmod: printer.updated_at ? new Date(printer.updated_at).toISOString().split("T")[0] : undefined,
    changefreq: "weekly",
    priority: 0.7,
  }));
}

// Generate complete sitemap
export async function generateSitemap(): Promise<string> {
  const [shops, listings, equipment] = await Promise.all([
    fetchVendorShops(),
    fetchProductListings(),
    fetchEquipmentListings(),
  ]);
  
  const allUrls = [
    ...staticPages,
    ...shops,
    ...listings,
    ...equipment,
  ];
  
  return generateSitemapXML(allUrls);
}

// Generate robots.txt content
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Disallow private/dashboard pages
Disallow: /dashboard
Disallow: /admin
Disallow: /settings
Disallow: /messages
Disallow: /cart
Disallow: /checkout
Disallow: /order-flow
Disallow: /compare-shops
Disallow: /vendor-dashboard
Disallow: /create-listing
Disallow: /edit-listing
Disallow: /storefront-edit
Disallow: /custom-order-payment
Disallow: /service-order
Disallow: /product-order
Disallow: /sponsorship-purchase
Disallow: /login
Disallow: /register
Disallow: /notifications
Disallow: /analytics

# Disallow search/filter pages with parameters
Disallow: /search?*
Disallow: /listings?*
Disallow: /discover?*
Disallow: /explore?*

# Noindex empty or low-value pages
Noindex: /search
Noindex: /compare-shops

# Crawl-delay for rate limiting (optional)
Crawl-delay: 1

# Sitemap location
Sitemap: https://synthix.com/sitemap.xml
`;
}

// Generate category pages for sitemap
export const categoryPages: SitemapUrl[] = [
  { loc: "https://synthix.com/category/3d-printing", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/laser-cutting", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/woodworking", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/metalworking", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/cnc-machining", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/electronics", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/prototyping", changefreq: "daily", priority: 0.8 },
  { loc: "https://synthix.com/category/custom-fabrication", changefreq: "daily", priority: 0.8 },
];

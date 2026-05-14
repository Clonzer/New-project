import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, Package, Grid3x3, Sparkles, Zap, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { calculateSubtotal, FIXED_FEE_AMOUNT } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

// Transform listing data from snake_case (database) to camelCase (components)
function transformListing(listing: any) {
  return {
    ...listing,
    imageUrl: listing.images?.[0] || listing.image_url || listing.imageUrl,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    basePrice: (listing.price || listing.base_price || listing.basePrice || 0) + 1.62 + FIXED_FEE_AMOUNT,
    shippingCost: listing.shipping_cost || listing.shippingCost || 0,
    listingType: listing.listing_type || listing.listingType,
    sellerId: listing.seller_id || listing.sellerId,
    sellerName: listing.seller_name || listing.sellerName,
    estimatedDaysMin: listing.estimated_days_min || listing.estimatedDaysMin,
    estimatedDaysMax: listing.estimated_days_max || listing.estimatedDaysMax,
    tags: listing.tags || [],
    stockQuantity: listing.stock_quantity !== undefined ? listing.stock_quantity : listing.stock,
    trackStock: listing.track_stock !== undefined ? listing.track_stock : listing.track_stock,
  };
}

export default function ExploreModels() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "miniatures" | "functional" | "art" | "prototypes">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // Handle filter query parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(rawSearch);
    const q = params.get('q');
    if (q) setSearchTerm(q);
  }, [rawSearch]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoadingListings(true);
        const { data: listingsData, error: listingsError } = await supabase.from('listings').select('*');
        const { data: sellersData, error: sellersError } = await supabase.from('sellers').select('id, store_name, accepting_orders');

        if (listingsData && !listingsError && sellersData && !sellersError) {
          // Create maps of seller IDs to seller data
          const sellerMap = new Map(sellersData.map((s: any) => [s.id, s.store_name]));
          const acceptingOrdersMap = new Map(sellersData.map((s: any) => [s.id, s.accepting_orders]));

          // Transform listings with seller names
          const transformedListings = listingsData.map((listing: any) => {
            const transformed = transformListing(listing);
            transformed.sellerName = sellerMap.get(listing.seller_id) || 'Unknown Seller';
            transformed.sellerAcceptingOrders = acceptingOrdersMap.get(listing.seller_id);
            return transformed;
          });
          setListings(transformedListings);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter((l: any) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = (
      (l.title || '').toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q)
    );
    const matchesCategory = selectedCategory === "all" ||
      (selectedCategory === "miniatures" && l.tags?.includes("miniature")) ||
      (selectedCategory === "functional" && l.tags?.includes("functional")) ||
      (selectedCategory === "art" && l.tags?.includes("art")) ||
      (selectedCategory === "prototypes" && l.tags?.includes("prototype"));
    const matchesPrice = (l.basePrice || 0) >= priceRange[0] && (l.basePrice || 0) <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
      <Navbar />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {/* Sponsored Models Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9fe5ff]" />
                <h2 className="text-2xl font-display font-bold text-white">Sponsored Models</h2>
              </div>
            </div>
            {loadingListings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[340px] rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.slice(0, 8).map((listing: any) => (
                  <div key={listing.id} className="relative">
                    <ListingCard listing={listing} sellerAcceptingOrders={listing.sellerAcceptingOrders} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Sponsored
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                No models available yet
              </div>
            )}
          </section>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 text-center">
            Explore 3D Models
          </h1>
          <p className="text-xl text-zinc-400 mb-8 text-center">
            Discover amazing 3D printable models from our community
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 h-14 bg-zinc-900/50 border border-zinc-700 rounded-full text-lg focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="h-14 px-6 rounded-full glass-panel border border-white/10 flex items-center gap-2 text-white hover:bg-white/5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 max-w-4xl mx-auto">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Category</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Models" },
                    { value: "miniatures", label: "Miniatures" },
                    { value: "functional", label: "Functional Parts" },
                    { value: "art", label: "Art & Decor" },
                    { value: "prototypes", label: "Prototypes" },
                  ].map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setSelectedCategory(category.value as typeof selectedCategory)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedCategory === category.value
                          ? "border-primary/50 bg-primary/15 text-white"
                          : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Price Range</p>
                <div className="mt-3 flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-24 h-10 bg-zinc-900/50 border-zinc-700"
                  />
                  <span className="text-zinc-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-24 h-10 bg-zinc-900/50 border-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          <Tabs value="models" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-zinc-900 border border-zinc-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary" onClick={() => window.location.href='/explore-all'}>
                <Grid3x3 className="w-4 h-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="shops" className="data-[state=active]:bg-primary" onClick={() => window.location.href='/explore?filter=shops'}>
                <Store className="w-4 h-4 mr-2" />
                Shops
              </TabsTrigger>
              <TabsTrigger value="models" className="data-[state=active]:bg-primary">
                <Package className="w-4 h-4 mr-2" />
                Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="mt-8">
              {loadingListings ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-64 bg-zinc-800" />
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {filteredListings.map((listing: any) => (
                    <ListingCard key={listing.id} listing={listing} sellerAcceptingOrders={listing.sellerAcceptingOrders} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-400">No models found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { Footer } from "@/components/layout/Footer";
import { SellerCard } from "@/components/shared/SellerCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOMeta, MarketplaceStructuredData, StructuredData, generateBreadcrumbSchema } from "@/components/seo";
import { Search, Store, Package, Grid3x3, Star, MapPin, SlidersHorizontal, Sparkles, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { createClient } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const supabase = createClient(
  (globalThis as any).VITE_SUPABASE_URL || 'https://hegixxfxymvwlcenuewx.supabase.co',
  (globalThis as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4eGZ4eW12d2xjZW51ZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjM2NzQsImV4cCI6MjA5MTQzOTY3NH0.dsnhzsHb9H9WyL20rnKNA6inp6NE8WNE--Q2-JejKMs'
);

// Transform seller data from snake_case (database) to camelCase (components)
function transformSeller(seller: any) {
  return {
    ...seller,
    displayName: seller.store_name || seller.display_name || seller.displayName,
    shopName: seller.store_name || seller.shopName,
    avatarUrl: seller.avatar_url || seller.avatarUrl || seller.avatar || seller.profile_image_url,
    location: seller.location,
    rating: seller.rating || 0,
    reviewCount: seller.review_count || seller.reviewCount || 0,
    sellerTags: seller.seller_tags || seller.sellerTags || [],
    printerCount: seller.printer_count || seller.printerCount || 0,
    totalPrints: seller.total_prints || seller.totalPrints || 0,
    shopMode: seller.shop_mode || seller.shopMode || 'both',
    bio: seller.bio,
    user_id: seller.user_id || seller.userId || seller.id,
    accepting_orders: seller.accepting_orders !== false,
    store_setup_complete: seller.store_setup_complete === true,
  };
}
export default function Explore() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [sellers, setSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Handle filter query parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(rawSearch);
    const filter = params.get('filter');
    if (filter === 'shops') setSelectedFilter('shops');
  }, [rawSearch]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoadingSellers(true);
        const { data: sellersData, error: sellersError } = await supabase.from('sellers').select('*');

        if (sellersData && !sellersError) {
          const transformedSellers = sellersData.map((seller: any) => transformSeller(seller));
          setSellers(transformedSellers);
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
      } finally {
        setLoadingSellers(false);
      }
    };
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter((s: any) => {
    const q = (searchTerm || '').toLowerCase();
    return (
      (s.displayName || '').toLowerCase().includes(q) ||
      (s.bio || '').toLowerCase().includes(q) ||
      (s.sellerTags || []).some((tag: string) => tag.toLowerCase().includes(q))
    );
  });

  const sortedSellers = [...filteredSellers].sort((a, b) => {
    if (sortBy === "newest") return 0;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "prints") return (b.totalPrints || 0) - (a.totalPrints || 0);
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Featured Shops Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9fe5ff]" />
                <h2 className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-2xl font-display font-bold">Featured Shops</h2>
              </div>
            </div>
            {loadingSellers ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[340px] rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : sortedSellers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedSellers.slice(0, 8).map((seller: any) => (
                  <div key={seller.id} className="relative">
                    <SellerCard seller={seller} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Featured
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                No shops available yet
              </div>
            )}
          </section>

          <h1 className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-4xl md:text-5xl font-display font-bold mb-6 text-center">
            Explore Shops
          </h1>
          <p className="text-zinc-400 mb-8 text-center">
            Discover amazing 3D printing shops and makers
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 h-14 bg-zinc-800 border border-zinc-700 rounded-full text-lg focus:ring-2 focus:ring-pink-500/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="h-14 px-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center gap-2 text-white hover:bg-zinc-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-800 p-5 max-w-4xl mx-auto">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Sort By</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { value: "newest", label: "Newest" },
                    { value: "rating", label: "Highest Rated" },
                    { value: "prints", label: "Most Prints" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortBy(option.value)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        sortBy === option.value
                          ? "border-pink-500/50 bg-pink-500/20 text-white"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Tabs value="shops" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-zinc-900 border border-zinc-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-pink-500" onClick={() => window.location.href='/explore-all'}>
                <Grid3x3 className="w-4 h-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="shops" className="data-[state=active]:bg-pink-500">
                <Store className="w-4 h-4 mr-2" />
                Shops
              </TabsTrigger>
              <TabsTrigger value="models" className="data-[state=active]:bg-pink-500" onClick={() => window.location.href='/explore-models'}>
                <Package className="w-4 h-4 mr-2" />
                Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shops" className="mt-8">
              {loadingSellers ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 bg-zinc-800" />
                  ))}
                </div>
              ) : sortedSellers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedSellers.map((seller) => (
                    <SellerCard key={seller.id} seller={seller} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-400">No shops found</p>
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

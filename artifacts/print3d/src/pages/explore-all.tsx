import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SellerCard } from "@/components/shared/SellerCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, Package, Grid3x3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  (globalThis as any).VITE_SUPABASE_URL || 'https://hegixxfxymvwlcenuewx.supabase.co',
  (globalThis as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4eGZ4eW12d2xjZW51ZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjM2NzQsImV4cCI6MjA5MTQzOTY3NH0.dsnhzsHb9H9WyL20rnKNA6inp6NE8WNE--Q2-JejKMs'
);

// Transform seller data from snake_case (database) to camelCase (components)
function transformSeller(seller: any) {
  console.log('Raw seller data:', seller);
  const transformed = {
    ...seller,
    displayName: seller.store_name || seller.display_name || seller.displayName,
    shopName: seller.store_name || seller.shopName,
    avatarUrl: seller.avatar_url || seller.avatarUrl,
    location: seller.location,
    rating: seller.rating || 0,
    reviewCount: seller.review_count || seller.reviewCount || 0,
    sellerTags: seller.seller_tags || seller.sellerTags || [],
    printerCount: seller.printer_count || seller.printerCount || 0,
    totalPrints: seller.total_prints || seller.totalPrints || 0,
    shopMode: seller.shop_mode || seller.shopMode || 'both',
    bio: seller.bio,
  };
  console.log('Transformed seller data:', transformed);
  return transformed;
}

// Transform listing data from snake_case (database) to camelCase (components)
function transformListing(listing: any) {
  console.log('Raw listing data:', listing);
  const transformed = {
    ...listing,
    imageUrl: listing.images?.[0] || listing.image_url || listing.imageUrl,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    basePrice: listing.price || listing.base_price || listing.basePrice || 0,
    shippingCost: listing.shipping_cost || listing.shippingCost || 0,
    listingType: listing.listing_type || listing.listingType,
    sellerId: listing.seller_id || listing.sellerId,
    sellerName: listing.seller_name || listing.sellerName,
    estimatedDaysMin: listing.estimated_days_min || listing.estimatedDaysMin || 1,
    estimatedDaysMax: listing.estimated_days_max || listing.estimatedDaysMax || 7,
    tags: listing.tags || [],
    stockQuantity: listing.stock_quantity !== undefined ? listing.stock_quantity : listing.stock,
    trackStock: listing.track_stock !== undefined ? listing.track_stock : listing.track_stock,
  };
  console.log('Transformed listing data:', transformed);
  return transformed;
}

export default function ExploreAll() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "shops" | "models">("all");
  const [sellers, setSellers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    async function fetchSellers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .limit(50);
        if (data && !error) {
          setSellers(data.map(transformSeller));
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
        setSellers([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSellers();
  }, []);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoadingListings(true);
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .limit(12);
        if (data && !error) {
          setListings(data.map(transformListing));
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setListings([]);
      } finally {
        setLoadingListings(false);
      }
    }
    fetchListings();
  }, []);

  const filteredSellers = sellers.filter((s) => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (s.displayName || '').toLowerCase().includes(q) ||
      (s.shopName || '').toLowerCase().includes(q);
    return matchesSearch;
  });

  const filteredListings = listings.filter((l) => {
    const q = (searchTerm || '').toLowerCase();
    return (
      (l.title || '').toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
      <Navbar />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 text-center">
            The All in One Makers Marketplace
          </h1>
          <p className="text-xl text-zinc-400 mb-8 text-center">
            Discover top shops and amazing 3D models all in one place
          </p>
          <div className="relative max-w-2xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search shops and models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 h-14 bg-zinc-900/50 border border-zinc-700 rounded-full text-lg focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-zinc-900 border border-zinc-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary">
                <Grid3x3 className="w-4 h-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="shops" className="data-[state=active]:bg-primary">
                <Store className="w-4 h-4 mr-2" />
                Shops
              </TabsTrigger>
              <TabsTrigger value="models" className="data-[state=active]:bg-primary">
                <Package className="w-4 h-4 mr-2" />
                Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="space-y-12">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Store className="w-6 h-6 text-primary" />
                    Featured Shops
                  </h2>
                  {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 bg-zinc-800" />
                      ))}
                    </div>
                  ) : filteredSellers.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredSellers.slice(0, 6).map((seller) => (
                        <SellerCard key={seller.id} seller={seller} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Store className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                      <p className="text-zinc-400">No shops found</p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    Featured Models
                  </h2>
                  {loadingListings ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-64 bg-zinc-800" />
                      ))}
                    </div>
                  ) : filteredListings.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {filteredListings.slice(0, 8).map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                      <p className="text-zinc-400">No models found</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shops" className="mt-8">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 bg-zinc-800" />
                  ))}
                </div>
              ) : filteredSellers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSellers.map((seller) => (
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

            <TabsContent value="models" className="mt-8">
              {loadingListings ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-64 bg-zinc-800" />
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
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

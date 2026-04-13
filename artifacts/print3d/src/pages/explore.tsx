import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListSellers, useListListings } from "@/lib/workspace-api-mock";
import { SellerCard } from "@/components/shared/SellerCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Search, SlidersHorizontal, Sparkles, Store, Package, Zap, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { SHOP_TAG_OPTIONS } from "@/lib/shop-tags";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { BoostViewsModal } from "@/components/shared/BoostViewsModal";
import { NeonButton } from "@/components/ui/neon-button";
import { DynamicShopBanner } from "@/components/shop/DynamicShopBanner";
import { SponsoredShopsInjection } from "@/components/sections/SponsoredShopsInjection";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Explore() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMode, setSelectedMode] = useState<"all" | "catalog" | "open" | "both">("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [boostingShop, setBoostingShop] = useState<string>("");
  const { formatPrice } = useLocalePreferences();
  const { data, isLoading } = useListSellers({ limit: 50 });
  const { data: listingsData, isLoading: loadingListings } = useListListings({ limit: 12 });

  useEffect(() => {
    const qs = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
    const q = new URLSearchParams(qs).get("q");
    if (q) setSearchTerm(q);
  }, [rawSearch]);

  const filteredSellers = data?.sellers.filter((s) => {
    const q = searchTerm.toLowerCase();
    const allTags = (s as any).sellerTags ?? [];
    const matchesSearch =
      s.displayName.toLowerCase().includes(q) ||
      s.shopName?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q) ||
      allTags.some((tag: string) => tag.toLowerCase().includes(q));
    const matchesMode = selectedMode === "all" || !(s as any).shopMode || (s as any).shopMode === selectedMode;
    const matchesTag = selectedTag === "all" || allTags.length === 0 || allTags.includes(selectedTag);
    return matchesSearch && matchesMode && matchesTag;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Hero-like Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Explore All Makers
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Discover shops offering additive, woodworking, metal fab, services, and more — ready for your next project.
            </p>
          </div>
          {/* Featured Shops Carousel with Dynamic Banners */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#9fe5ff]" />
                <h2 className="text-2xl font-display font-bold text-white">Featured Shops</h2>
              </div>
            </div>
            
            {/* Dynamic Shop Banners for Top Performers */}
            <div className="mb-8">
              {data?.sellers.slice(0, 3).map((seller) => (
                <DynamicShopBanner
                  key={seller.id}
                  userId={seller.id}
                  shopName={seller.shopName || seller.displayName}
                  className="mb-4"
                />
              ))}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[280px] rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : data?.sellers.length ? (
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {data.sellers.slice(0, 8).map((seller) => (
                    <CarouselItem key={seller.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <SellerCard seller={seller} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
                <CarouselNext className="right-2 top-1/2 -translate-y-1/2 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
              </Carousel>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                No makers available yet
              </div>
            )}
          </section>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                placeholder="Search by name or location..."
                className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                  <Filter className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-700 w-64">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-zinc-400">Price Range</p>
                </div>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  Under $10
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  $10 - $50
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  $50 - $100
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  $100+
                </DropdownMenuItem>
                <div className="px-2 py-1.5 border-t border-zinc-700 mt-2">
                  <p className="text-xs font-semibold text-zinc-400">Location</p>
                </div>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  North America
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  Europe
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  Asia
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-800">
                  Worldwide
                </DropdownMenuItem>
                <div className="px-2 py-1.5 border-t border-zinc-700 mt-2">
                  <p className="text-xs font-semibold text-zinc-400">Shop Mode</p>
                </div>
                <DropdownMenuItem onClick={() => setSelectedMode("all")} className="text-white hover:bg-zinc-800">
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMode("catalog")} className="text-white hover:bg-zinc-800">
                  Catalog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMode("open")} className="text-white hover:bg-zinc-800">
                  Custom Jobs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMode("both")} className="text-white hover:bg-zinc-800">
                  Both
                </DropdownMenuItem>
                <div className="px-2 py-1.5 border-t border-zinc-700 mt-2">
                  <p className="text-xs font-semibold text-zinc-400">Verified Only</p>
                </div>
                <DropdownMenuItem onClick={() => setVerifiedOnly(!verifiedOnly)} className="text-white hover:bg-zinc-800">
                  {verifiedOnly ? "Show All" : "Verified Only"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 h-[280px]">
                  <Skeleton className="w-14 h-14 rounded-full bg-white/10 mb-4" />
                  <Skeleton className="h-6 w-3/4 bg-white/10 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-white/10 mb-6" />
                  <Skeleton className="h-16 w-full bg-white/10" />
                </div>
              ))
            ) : filteredSellers?.length === 0 ? (
              <div className="col-span-full py-24 text-center">
                <p className="text-zinc-500 text-lg">No makers found matching your criteria.</p>
              </div>
            ) : (
              filteredSellers?.map(seller => (
                <SellerCard key={seller.id} seller={seller} />
              ))
            )}
          </div>
        </div>
      </main>

      <BoostViewsModal
        isOpen={boostModalOpen}
        shopName={boostingShop}
        onClose={() => setBoostModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

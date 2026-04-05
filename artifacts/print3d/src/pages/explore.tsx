import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListSellers, useListListings } from "@workspace/api-client-react";
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
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { SHOP_TAG_OPTIONS } from "@/lib/shop-tags";
import { useLocalePreferences } from "@/lib/locale-preferences";

export default function Explore() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"all" | "catalog" | "open" | "both">("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
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
    const locationQuery = locationTerm.toLowerCase();
    const allTags = s.sellerTags ?? [];
    const matchesSearch =
      s.displayName.toLowerCase().includes(q) ||
      s.shopName?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q) ||
      allTags.some((tag) => tag.toLowerCase().includes(q));
    const matchesLocation = !locationQuery || s.location?.toLowerCase().includes(locationQuery);
    const matchesMode = selectedMode === "all" || s.shopMode === selectedMode;
    const matchesTag = selectedTag === "all" || allTags.includes(selectedTag);
    const matchesVerified = !verifiedOnly || !!s.emailVerifiedAt;
    return matchesSearch && matchesLocation && matchesMode && matchesTag && matchesVerified;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Featured Makers Carousel */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9fe5ff]" />
                <h2 className="text-2xl font-display font-bold text-white">Featured Makers</h2>
              </div>
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

          {/* Featured Products Carousel */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-display font-bold text-white">Featured Products</h2>
              </div>
            </div>
            
            {loadingListings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[340px] rounded-2xl bg-white/10" />
                ))}
              </div>
            ) : listingsData?.listings.length ? (
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {listingsData.listings.slice(0, 8).map((listing) => (
                    <CarouselItem key={listing.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <ListingCard listing={listing} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
                <CarouselNext className="right-2 top-1/2 -translate-y-1/2 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
              </Carousel>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                No products available yet
              </div>
            )}
          </section>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-glow">
              Explore All Makers
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl">
              Discover shops offering additive, woodworking, metal fab, services, and more — ready for your next project.
            </p>
          </div>

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
            <Input
              placeholder="Filter by location..."
              className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-zinc-500 md:w-64"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="h-12 px-6 rounded-xl glass-panel border border-white/10 flex items-center gap-2 text-white hover:bg-white/5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {showFilters ? (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Shop mode</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "catalog", label: "Catalog" },
                    { value: "open", label: "Custom Jobs" },
                    { value: "both", label: "Both" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setSelectedMode(mode.value as typeof selectedMode)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selectedMode === mode.value
                          ? "border-primary/50 bg-primary/15 text-white"
                          : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Trust</p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setVerifiedOnly((current) => !current)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      verifiedOnly
                        ? "border-emerald-400/40 bg-emerald-400/10 text-white"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {verifiedOnly ? "Verified shops only" : "Show all shops"}
                  </button>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Specialties</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTag("all")}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selectedTag === "all"
                        ? "border-accent/50 bg-accent/15 text-white"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                    }`}
                  >
                    All tags
                  </button>
                  {SHOP_TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        selectedTag === tag
                          ? "border-accent/50 bg-accent/15 text-white"
                          : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

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

      <Footer />
    </div>
  );
}

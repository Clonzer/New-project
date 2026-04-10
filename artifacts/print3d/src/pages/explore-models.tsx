import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Search, SlidersHorizontal, Sparkles, Package, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useLocalePreferences } from "@/lib/locale-preferences";

export default function ExploreModels() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "miniatures" | "functional" | "art" | "prototypes">("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const { formatPrice } = useLocalePreferences();
  const { data: listingsData, isLoading: loadingListings } = useListListings({ limit: 50 });

  useEffect(() => {
    const qs = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
    const q = new URLSearchParams(qs).get("q");
    if (q) setSearchTerm(q);
  }, [rawSearch]);

  const filteredListings = listingsData?.listings.filter((listing) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      listing.title.toLowerCase().includes(q) ||
      listing.description?.toLowerCase().includes(q) ||
      listing.tags?.some((tag) => tag.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === "all" ||
      (selectedCategory === "miniatures" && listing.tags?.includes("miniature")) ||
      (selectedCategory === "functional" && listing.tags?.includes("functional")) ||
      (selectedCategory === "art" && listing.tags?.includes("art")) ||
      (selectedCategory === "prototypes" && listing.tags?.includes("prototype"));
    const matchesMaterial = selectedMaterial === "all" || listing.material === selectedMaterial;
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesMaterial && matchesPrice;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Sponsored Models Carousel */}
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
            ) : listingsData?.listings.length ? (
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {listingsData.listings.slice(0, 8).map((listing) => (
                    <CarouselItem key={listing.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="relative">
                        <ListingCard listing={listing} />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Sponsored
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
                <CarouselNext className="right-2 top-1/2 -translate-y-1/2 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
              </Carousel>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                No sponsored models available yet
              </div>
            )}
          </section>

          {/* Search and Filter Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-glow">
              Explore 3D Models
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl">
              Discover amazing 3D models from our community of makers — from miniatures to functional parts.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                placeholder="Search models..."
                className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Material</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial("all")}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selectedMaterial === "all"
                        ? "border-accent/50 bg-accent/15 text-white"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                    }`}
                  >
                    All materials
                  </button>
                  {["PLA", "PETG", "ABS", "TPU", "Resin", "Nylon"].map((material) => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => setSelectedMaterial(material)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        selectedMaterial === material
                          ? "border-accent/50 bg-accent/15 text-white"
                          : "border-white/10 bg-black/20 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {material}
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
                    className="w-20 h-8 text-xs"
                  />
                  <span className="text-zinc-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingListings ? (
              Array(12).fill(0).map((_, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 h-[340px]">
                  <Skeleton className="w-full h-48 bg-white/10 mb-4 rounded-xl" />
                  <Skeleton className="h-6 w-3/4 bg-white/10 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-white/10 mb-4" />
                  <Skeleton className="h-16 w-full bg-white/10" />
                </div>
              ))
            ) : filteredListings?.length === 0 ? (
              <div className="col-span-full py-24 text-center">
                <p className="text-zinc-500 text-lg">No models found matching your criteria.</p>
              </div>
            ) : (
              filteredListings?.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
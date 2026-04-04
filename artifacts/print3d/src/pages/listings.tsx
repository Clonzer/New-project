import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { buildListingPriceInsights } from "@/lib/listing-pricing";

const CATEGORIES = ["All", "Mechanical", "Miniatures", "Cosplay", "Functional", "Art", "Jewelry", "Architecture"];

export default function Listings() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const { data, isLoading } = useListListings({ limit: 50 });

  useEffect(() => {
    const qs = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
    const q = new URLSearchParams(qs).get("q");
    if (q) setSearchTerm(q);
  }, [rawSearch]);

  const filteredListings = data?.listings.filter(l => {
    const maxPriceNumber = maxPrice.trim() ? parseFloat(maxPrice) : null;
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || l.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = maxPriceNumber == null || l.basePrice <= maxPriceNumber;
    return matchesSearch && matchesCategory && matchesPrice;
  });
  const priceInsights = filteredListings ? buildListingPriceInsights(filteredListings) : new Map();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-glow">
                Model Catalog
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl">
                Ready-to-print designs offered by our maker network.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Search models..."
                  className="pl-11 h-12 rounded-xl bg-white/5 border-white/10 text-white focus-visible:ring-accent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="h-12 px-4 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showFilters ? (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500">Max base price</label>
              <div className="mt-3 max-w-xs">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="e.g. 40"
                  className="h-11 rounded-xl bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>
          ) : null}

          {/* Category filter pills — actually filter now */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-primary"
                    : "glass-panel border border-white/10 text-zinc-300 hover:text-white hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl border border-white/5 h-[360px] overflow-hidden">
                  <Skeleton className="w-full h-44 bg-white/10 rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <Skeleton className="h-10 w-full bg-white/10 mt-4" />
                  </div>
                </div>
              ))
            ) : filteredListings?.length === 0 ? (
              <div className="col-span-full py-24 text-center">
                <p className="text-zinc-500 text-lg">No models found{selectedCategory !== "All" ? ` in "${selectedCategory}"` : ""}{searchTerm ? ` matching "${searchTerm}"` : ""}.</p>
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="mt-3 text-primary hover:text-white transition-colors text-sm underline"
                  >
                    Show all categories
                  </button>
                )}
              </div>
            ) : (
              filteredListings?.map(listing => (
                <ListingCard key={listing.id} listing={listing} priceInsight={priceInsights.get(listing.id)} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

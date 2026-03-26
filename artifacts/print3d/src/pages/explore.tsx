import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListSellers } from "@workspace/api-client-react";
import { SellerCard } from "@/components/shared/SellerCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";

export default function Explore() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useListSellers({ limit: 50 });

  useEffect(() => {
    const qs = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
    const q = new URLSearchParams(qs).get("q");
    if (q) setSearchTerm(q);
  }, [rawSearch]);

  const filteredSellers = data?.sellers.filter(s => 
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-glow">
              Explore Makers
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
            <button className="h-12 px-6 rounded-xl glass-panel border border-white/10 flex items-center gap-2 text-white hover:bg-white/5 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
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

      <Footer />
    </div>
  );
}

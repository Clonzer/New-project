import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SellerCard } from "@/components/shared/SellerCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Store, Package, Grid3x3, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { NeonButton } from "@/components/ui/neon-button";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  (globalThis as any).VITE_SUPABASE_URL || 'https://hegixxfxymvwlcenuewx.supabase.co',
  (globalThis as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4eGZ4eW12d2xjZW51ZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjM2NzQsImV4cCI6MjA5MTQzOTY3NH0.dsnhzsHb9H9WyL20rnKNA6inp6NE8WNE--Q2-JejKMs'
);

export default function ExploreAll() {
  const rawSearch = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "shops" | "models">("all");
  const [sellers, setSellers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    const qs = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
    const q = new URLSearchParams(qs).get("q");
    if (q) setSearchTerm(q);
  }, [rawSearch]);

  useEffect(() => {
    async function fetchSellers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .limit(50);
        if (data && !error) {
          setSellers(data);
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
          setListings(data);
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
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.display_name?.toLowerCase().includes(q) ||
      s.store_name?.toLowerCase().includes(q);
    return matchesSearch;
  });

  const filteredListings = listings.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20 py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
                The All in One Makers Marketplace
              </h1>
              <p className="text-xl text-zinc-400 mb-8">
                Discover top shops and amazing 3D models all in one place
              </p>
              <div className="relative max-w-2xl mx-auto flex gap-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search shops and models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 h-14 bg-zinc-900/50 border border-zinc-700 rounded-full text-lg focus:ring-2 focus:ring-primary/50"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-zinc-700 bg-zinc-900/50">
                      <Filter className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-zinc-700 w-64">
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-semibold text-zinc-400">Content Type</p>
                    </div>
                    <DropdownMenuItem onClick={() => setFilterType("all")} className="text-white hover:bg-zinc-800">
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("shops")} className="text-white hover:bg-zinc-800">
                      Shops Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("models")} className="text-white hover:bg-zinc-800">
                      Models Only
                    </DropdownMenuItem>
                    <div className="px-2 py-1.5 border-t border-zinc-700 mt-2">
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
                      <p className="text-xs font-semibold text-zinc-400">Tags</p>
                    </div>
                    <DropdownMenuItem className="text-white hover:bg-zinc-800">
                      Electronics
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-zinc-800">
                      Art & Decor
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-zinc-800">
                      Tools & Hardware
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-zinc-800">
                      Toys & Games
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-12">
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

            {/* All Tab */}
            <TabsContent value="all" className="mt-8">
              <div className="space-y-12">
                {/* Featured Shops */}
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
                      {filteredSellers.slice(0, 6).map((seller, index) => (
                        <motion.div
                          key={seller.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <SellerCard seller={seller} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Store className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                      <p className="text-zinc-400">No shops found</p>
                    </div>
                  )}
                </div>

                {/* Featured Models */}
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
                      {filteredListings.slice(0, 8).map((listing, index) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListingCard listing={listing} />
                        </motion.div>
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

            {/* Shops Tab */}
            <TabsContent value="shops" className="mt-8">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 bg-zinc-800" />
                  ))}
                </div>
              ) : filteredSellers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSellers.map((seller, index) => (
                    <motion.div
                      key={seller.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SellerCard seller={seller} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-400">No shops found</p>
                </div>
              )}
            </TabsContent>

            {/* Models Tab */}
            <TabsContent value="models" className="mt-8">
              {loadingListings ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-64 bg-zinc-800" />
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {filteredListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
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
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { useMemo } from "react";
import { useSearch, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useListSellers, useListListings } from "@/lib/workspace-api-mock";
import { SellerCard } from "@/components/shared/SellerCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

function parseQuery(search: string): string {
  const qs = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(qs).get("q")?.trim() ?? "";
}

// Transform seller data to ensure avatar field is properly mapped
function transformSeller(seller: any) {
  return {
    ...seller,
    avatarUrl: seller.avatar_url || seller.avatarUrl || seller.avatar || seller.profile_image_url,
  };
}

export default function SearchPage() {
  const search = useSearch();
  const q = parseQuery(search).toLowerCase();

  const { data: sellersData, isLoading: loadingSellers } = useListSellers({ limit: 80 });
  const { data: listingsData, isLoading: loadingListings } = useListListings({ limit: 80 });

  const sellers = useMemo(() => {
    const all = sellersData?.sellers ?? [];
    const transformed = all.map(transformSeller);
    if (!q) return transformed;
    return transformed.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        (s.shopName?.toLowerCase().includes(q) || false) ||
        (s.username?.toLowerCase().includes(q) || false) ||
        (s.location?.toLowerCase().includes(q) || false),
    );
  }, [sellersData, q]);

  const listings = useMemo(() => {
    const all = listingsData?.listings ?? [];
    if (!q) return all;
    return all.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.category?.toLowerCase().includes(q) || false) ||
        (l.tags?.some((t) => t.toLowerCase().includes(q)) || false) ||
        (l.sellerName?.toLowerCase().includes(q) || false),
    );
  }, [listingsData, q]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Search className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Search</h1>
              <p className="text-zinc-400 text-sm mt-1">
                {q ? `Results for “${parseQuery(search)}”` : "Enter a term in the header search and press Enter."}
              </p>
            </div>
          </div>

          <section className="mb-16">
            <h2 className="text-xl font-bold text-white mb-6">Shops & makers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loadingSellers ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 h-[280px]">
                      <Skeleton className="w-14 h-14 rounded-full bg-white/10 mb-4" />
                      <Skeleton className="h-6 w-3/4 bg-white/10 mb-2" />
                      <Skeleton className="h-4 w-1/2 bg-white/10" />
                    </div>
                  ))
              ) : sellers.length === 0 ? (
                <p className="text-zinc-500 col-span-full">No makers match this search.</p>
              ) : (
                sellers.map((seller) => <SellerCard key={seller.id} seller={seller} />)
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6">Catalog models</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loadingListings ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="glass-panel rounded-2xl border border-white/5 h-[360px] overflow-hidden">
                      <Skeleton className="w-full h-44 bg-white/10 rounded-none" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-6 w-3/4 bg-white/10" />
                        <Skeleton className="h-4 w-1/2 bg-white/10" />
                      </div>
                    </div>
                  ))
              ) : listings.length === 0 ? (
                <p className="text-zinc-500 col-span-full">No listings match this search.</p>
              ) : (
                listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
              )}
            </div>
          </section>

          {!q && (
            <p className="text-center text-zinc-500 mt-12 text-sm">
              Tip: try{" "}
              <Link href="/search?q=miniature" className="text-primary hover:underline">
                miniature
              </Link>{" "}
              or{" "}
              <Link href="/search?q=resin" className="text-primary hover:underline">
                resin
              </Link>
              .
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

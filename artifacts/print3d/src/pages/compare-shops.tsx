import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getComparedShops, SHOP_COMPARE_CHANGE_EVENT, toggleComparedShop, type ComparedShop } from "@/lib/shop-compare";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function CompareShops() {
  const [shops, setShops] = useState<ComparedShop[]>([]);

  useEffect(() => {
    const sync = () => setShops(getComparedShops());
    sync();
    window.addEventListener(SHOP_COMPARE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(SHOP_COMPARE_CHANGE_EVENT, sync);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-12 pb-24">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white">Compare shops</h1>
          <p className="mt-3 text-zinc-400">Pin shops while browsing, then compare ratings, modes, locations, and order history side by side.</p>
        </div>

        {shops.length === 0 ? (
          <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center text-zinc-400">
            No shops in compare yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {shops.map((shop) => (
              <div key={shop.id} className="glass-panel rounded-3xl border border-white/10 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">{shop.shopName || shop.displayName}</h2>
                    <p className="mt-1 text-zinc-500">{shop.location || "Location not set"}</p>
                  </div>
                  <Badge className="bg-white/10 text-zinc-200 border border-white/10 capitalize">{shop.shopMode || "unknown"}</Badge>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Rating</span><span className="text-white">{shop.rating?.toFixed(1) || "New"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Reviews</span><span className="text-white">{shop.reviewCount}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Shop mode</span><span className="text-white capitalize">{shop.shopMode || "Not set"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Completed jobs</span><span className="text-white">{shop.totalPrints}</span></div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Link href={`/shop/${shop.id}`} className="flex-1">
                    <Button className="w-full rounded-xl">View shop</Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => toggleComparedShop(shop)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

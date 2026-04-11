import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useGetUser, useListListings, useListPrinters, useListReviews } from "@/lib/workspace-api-mock";
import {
  Calendar,
  GitCompareArrows,
  Hammer,
  MapPin,
  MessageSquare,
  Printer as PrinterIcon,
  Star,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/shared/ListingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { categoryLabel } from "@/lib/equipment-catalog";
import { isComparedShop, SHOP_COMPARE_CHANGE_EVENT, toggleComparedShop } from "@/lib/shop-compare";
import { useToast } from "@/hooks/use-toast";
import { buildListingPriceInsights } from "@/lib/listing-pricing";

export default function Shop() {
  const params = useParams();
  const shopId = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const [isCompared, setIsCompared] = useState(false);

  const { data: user, isLoading: loadingUser } = useGetUser(shopId);
  const { data: printersData } = useListPrinters({ userId: shopId });
  const { data: listingsData } = useListListings({ sellerId: shopId });
  const { data: reviewsData } = useListReviews({ revieweeId: shopId });
  const priceInsights = listingsData?.listings ? buildListingPriceInsights(listingsData.listings) : new Map();

  useEffect(() => {
    const sync = () => setIsCompared(isComparedShop(shopId));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SHOP_COMPARE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SHOP_COMPARE_CHANGE_EVENT, sync);
    };
  }, [shopId]);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-12">
          <Skeleton className="h-64 w-full bg-white/5 rounded-3xl" />
        </main>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-white">Shop not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="glass-panel rounded-[2rem] p-8 md:p-12 mb-12 relative overflow-hidden border-t border-white/10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_rgba(139,92,246,0.3)] shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-4 border-background">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-display font-bold text-white">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                {user.bannerUrl ? (
                  <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-white/10">
                    <img
                      src={user.bannerUrl}
                      alt={`${user.shopName || user.displayName} banner`}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}

                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                  {user.shopName || user.displayName}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                  {user.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" /> {user.location}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-accent" /> Joined {format(new Date(user.joinedAt), "MMM yyyy")}
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-white border border-white/10">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {user.rating?.toFixed(1) || "New"} ({user.reviewCount})
                  </span>
                  {user.emailVerifiedAt ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      Verified maker
                    </span>
                  ) : null}
                  {user.planTier === "enterprise" ? (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      Enterprise
                    </span>
                  ) : null}
                </div>

                {user.shopAnnouncement ? (
                  <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white">
                    {user.shopAnnouncement}
                  </div>
                ) : null}

                <p className="text-zinc-300 max-w-2xl text-lg leading-relaxed">
                  {user.bio || "Fabrication, additive manufacturing, and custom work - message for details."}
                </p>

                {user.brandStory ? (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
                    {user.brandStory}
                  </p>
                ) : null}

                {user.sellerTags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.sellerTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Seller Badges */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {user.reviewCount >= 3 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Trusted Seller</span>
                    </div>
                  )}
                  {printersData?.printers && printersData.printers.length >= 3 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                      <PrinterIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Equipment Expert</span>
                    </div>
                  )}
                  {listingsData?.listings && listingsData.listings.length >= 10 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">Pro Catalog</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="w-full py-6 text-lg rounded-xl glass-panel text-white hover:bg-white/10 border-white/20 mb-3"
                  onClick={() => {
                    const added = toggleComparedShop({
                      id: user.id,
                      displayName: user.displayName,
                      shopName: user.shopName ?? null,
                      location: user.location ?? null,
                      rating: user.rating ?? null,
                      reviewCount: user.reviewCount,
                      shopMode: user.shopMode ?? null,
                      totalPrints: user.totalPrints,
                    });
                    toast({
                      title: added ? "Shop added to compare" : "Shop removed from compare",
                      description: added
                        ? "Open compare to review this shop against others."
                        : "This shop is no longer pinned for comparison.",
                    });
                  }}
                >
                  <GitCompareArrows className="w-5 h-5 mr-2" />
                  {isCompared ? "Remove from compare" : "Compare shop"}
                </Button>
                {user.shopMode === "open" || user.shopMode === "both" ? (
                  <Link href={`/order/new?sellerId=${user.id}`}>
                    <NeonButton className="w-full py-6 text-lg rounded-xl mb-3">Request custom work</NeonButton>
                  </Link>
                ) : null}
                <Link href="/messages">
                  <Button variant="outline" className="w-full py-6 text-lg rounded-xl glass-panel text-white hover:bg-white/10 border-white/20">
                    <MessageSquare className="w-5 h-5 mr-2" /> Contact seller
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Tabs defaultValue="models" className="w-full">
            <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl mb-8">
              <TabsTrigger value="models" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Catalog Models</TabsTrigger>
              <TabsTrigger value="printers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Equipment</TabsTrigger>
              <TabsTrigger value="portfolio" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="mt-0">
              {listingsData?.listings.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
                  <p className="text-zinc-500">This shop doesn't have any catalog models yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {listingsData?.listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} priceInsight={priceInsights.get(listing.id)} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="printers" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {printersData?.printers.map((printer) => (
                  <div key={printer.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex gap-6">
                    <div className="w-24 h-24 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                      {printer.imageUrl ? (
                        <img src={printer.imageUrl} alt={printer.name} className="w-full h-full object-cover rounded-xl" />
                      ) : printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory ? (
                        <PrinterIcon className="w-10 h-10 text-zinc-500" />
                      ) : (
                        <Hammer className="w-10 h-10 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-xl text-white">{printer.name}</h3>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          <Badge className="bg-white/10 text-zinc-200 border border-white/15">{categoryLabel(printer.equipmentCategory ?? "printing_3d")}</Badge>
                          <Badge className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30">
                            {printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory
                              ? printer.technology
                              : printer.toolOrServiceType || printer.technology}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mb-3">{printer.brand} {printer.model}</p>

                      <div className="space-y-1 text-sm text-zinc-300">
                        <p><span className="text-zinc-500">{printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory ? "Volume:" : "Capacity:"}</span> {printer.buildVolume || "-"}</p>
                        <p><span className="text-zinc-500">{printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory ? "Materials:" : "Capabilities:"}</span> {printer.materials.join(", ")}</p>
                        {printer.pricePerHour || printer.pricePerGram ? (
                          <p className="text-primary font-medium mt-2">
                            {[
                              printer.pricePerHour != null && `$${printer.pricePerHour}/hr`,
                              printer.pricePerGram != null && `$${printer.pricePerGram}/g`,
                            ].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {printersData?.printers.length === 0 ? (
                  <p className="text-zinc-500 col-span-full">No equipment listed publicly.</p>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-0">
              {user.portfolio?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {user.portfolio.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                      <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
                      <div className="p-5">
                        <h3 className="text-xl font-display font-bold text-white">{item.title}</h3>
                        {item.description ? <p className="mt-2 text-sm text-zinc-400">{item.description}</p> : null}
                        {item.tags?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-zinc-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
                  <p className="text-zinc-500">This shop has not published portfolio projects yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-4">
                {reviewsData?.reviews.map((review) => (
                  <div key={review.id} className="glass-panel p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                          {review.reviewerAvatarUrl ? (
                            <img src={review.reviewerAvatarUrl} alt={review.reviewerName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">
                              {review.reviewerName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{review.reviewerName}</p>
                          <p className="text-xs text-zinc-500">{format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className={`w-4 h-4 ${index < review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment ? <p className="text-zinc-300">{review.comment}</p> : null}
                  </div>
                ))}
                {reviewsData?.reviews.length === 0 ? <p className="text-zinc-500">No reviews yet.</p> : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { useListListings, useListPrinters, useListReviews, useCreateReview } from "@/lib/workspace-stub";
import { createClient } from "@supabase/supabase-js";
import {
  Calendar,
  CheckCircle2,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Music,
  Package,
  PenLine,
  Wrench,
  Star,
  X,
  GitCompareArrows,
  MessageSquare,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

const supabase = createClient(
  (globalThis as any).VITE_SUPABASE_URL || 'https://hegixxfxymvwlcenuewx.supabase.co',
  (globalThis as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4eGZ4eW12d2xjZW51ZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjM2NzQsImV4cCI6MjA5MTQzOTY3NH0.dsnhzsHb9H9WyL20rnKNA6inp6NE8WNE--Q2-JejKMs'
);
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
  const shopId = (params as any).id || "0";
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCompared, setIsCompared] = useState(false);
  const [seller, setSeller] = useState<any>(null);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const createReview = useCreateReview();

  const { data: printersData } = useListPrinters({ userId: shopId });
  const { data: listingsData } = useListListings({ sellerId: shopId });
  const { data: reviewsData } = useListReviews({ revieweeId: shopId });
  const priceInsights = listingsData?.listings ? buildListingPriceInsights(listingsData.listings) : new Map();

  useEffect(() => {
    async function fetchSeller() {
      try {
        setLoadingSeller(true);
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('id', shopId)
          .single();
        if (data && !error) {
          // Transform seller data to match expected format
          setSeller({
            ...data,
            displayName: data.store_name || data.display_name,
            shopName: data.store_name,
            avatarUrl: data.avatar_url,
            bannerUrl: data.hero_image_url,
            location: data.location,
            rating: data.rating || 0,
            reviewCount: data.review_count || 0,
            sellerTags: data.seller_tags || [],
            totalPrints: data.total_prints || 0,
            shopMode: data.shop_mode || 'both',
            bio: data.bio,
            joinedAt: data.created_at,
            emailVerifiedAt: data.is_verified ? data.created_at : null,
            shopAnnouncement: null,
            brandStory: null,
            portfolio: [],
            websiteUrl: null,
            instagramHandle: null,
            supportEmail: null,
            tiktokHandle: null,
            xHandle: null,
            planTier: null,
          });
        }
      } catch (err) {
        console.error('Error fetching seller:', err);
        setSeller(null);
      } finally {
        setLoadingSeller(false);
      }
    }
    fetchSeller();
  }, [shopId]);

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

  if (loadingSeller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-12">
          <Skeleton className="h-64 w-full bg-white/5 rounded-3xl" />
        </main>
      </div>
    );
  }

  if (!seller) {
    return <div className="min-h-screen flex items-center justify-center text-white">Shop not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-grow">
        {/* Full-width Banner */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          {seller.bannerUrl ? (
            <img
              src={seller.bannerUrl}
              alt={`${seller.shopName || seller.displayName} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        </div>

        {/* Profile Section - Overlapping Banner */}
        <div className="container mx-auto px-4 -mt-24 md:-mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_rgba(139,92,246,0.3)] shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-4 border-zinc-950">
                {seller.avatarUrl ? (
                  <img src={seller.avatarUrl} alt={seller.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-display font-bold text-white">
                    {seller.displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Shop Info */}
            <div className="flex-grow">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                {seller.shopName || seller.displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                {seller.location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" /> {seller.location}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-accent" /> Joined {format(new Date(seller.joinedAt), "MMM yyyy")}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-white border border-white/10">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {seller.rating?.toFixed(1) || "New"} ({seller.reviewCount})
                </span>
                {seller.emailVerifiedAt ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Verified maker
                  </span>
                ) : null}
                {seller.planTier === "enterprise" ? (
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    Enterprise
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex gap-3">
              <Button
                variant="outline"
                className="py-3 px-6 rounded-xl glass-panel text-white hover:bg-white/10 border-white/20"
                onClick={() => {
                  const added = toggleComparedShop({
                    id: seller.id,
                    displayName: seller.displayName,
                    shopName: seller.shopName ?? null,
                    location: seller.location ?? null,
                    rating: seller.rating ?? null,
                    reviewCount: seller.reviewCount,
                    shopMode: seller.shopMode ?? null,
                    totalPrints: seller.totalPrints,
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
                {isCompared ? "Remove" : "Compare"}
              </Button>
              {seller.shopMode === "open" || seller.shopMode === "both" ? (
                <Link href={`/order/new?sellerId=${seller.id}`}>
                  <NeonButton className="py-3 px-6 rounded-xl">Request Custom Work</NeonButton>
                </Link>
              ) : null}
              <Link href="/messages">
                <Button variant="outline" className="py-3 px-6 rounded-xl glass-panel text-white hover:bg-white/10 border-white/20">
                  <MessageSquare className="w-5 h-5 mr-2" /> Contact
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{listingsData?.listings?.length || 0}</div>
              <div className="text-sm text-zinc-400">Products</div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{printersData?.length || 0}</div>
              <div className="text-sm text-zinc-400">Equipment</div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{seller.reviewCount || 0}</div>
              <div className="text-sm text-zinc-400">Reviews</div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{seller.totalPrints || 0}</div>
              <div className="text-sm text-zinc-400">Orders</div>
            </div>
          </div>

          {/* Announcement */}
          {seller.shopAnnouncement ? (
            <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-4 text-sm text-white">
              {seller.shopAnnouncement}
            </div>
          ) : null}

          {/* Bio and Badges */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-8">
            <p className="text-zinc-300 text-lg leading-relaxed mb-4">
              {seller.bio || "Fabrication, additive manufacturing, and custom work - message for details."}
            </p>

            {seller.brandStory ? (
              <p className="text-sm leading-relaxed text-zinc-400 mb-4">
                {seller.brandStory}
              </p>
            ) : null}

            {seller.sellerTags?.length ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {seller.sellerTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Seller Badges */}
            <div className="flex flex-wrap gap-3">
              {seller.reviewCount >= 3 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Trusted Seller</span>
                </div>
              )}
              {printersData && printersData.length >= 3 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Equipment Expert</span>
                </div>
              )}
              {listingsData?.listings && listingsData.listings.length >= 10 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-4 py-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Pro Catalog</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-wrap gap-3 mb-8">
            {seller.websiteUrl && (
              <a
                href={seller.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-colors"
              >
                <Globe className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Website</span>
              </a>
            )}
            {seller.instagramHandle && (
              <a
                href={`https://instagram.com/${seller.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-colors"
              >
                <Instagram className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Instagram</span>
              </a>
            )}
            {seller.supportEmail && (
              <a
                href={`mailto:${seller.supportEmail}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-colors"
              >
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">Email</span>
              </a>
            )}
            {seller.tiktokHandle && (
              <a
                href={`https://tiktok.com/@${seller.tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-colors"
              >
                <Music className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">TikTok</span>
              </a>
            )}
            {seller.xHandle && (
              <a
                href={`https://x.com/${seller.xHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-300">X</span>
              </a>
            )}
          </div>
        </div>

        {/* Content Tabs - Full Width */}
        <div className="container mx-auto px-4 pb-24">
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl mb-8 w-full justify-start">
              <TabsTrigger value="models" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Products</TabsTrigger>
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
                {printersData?.map((printer) => (
                  <div key={printer.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex gap-6">
                    <div className="w-24 h-24 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                      {printer.imageUrl ? (
                        <img src={printer.imageUrl} alt={printer.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Wrench className="w-10 h-10 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-xl text-white">{printer.name}</h3>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          <Badge className="bg-white/10 text-zinc-200 border border-white/15">{categoryLabel(printer.equipmentCategory ?? "equipment")}</Badge>
                          <Badge className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30">
                            {printer.toolOrServiceType || printer.technology}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mb-3">{printer.brand} {printer.model}</p>

                      <div className="space-y-1 text-sm text-zinc-300">
                        <p><span className="text-zinc-500">Capacity:</span> {printer.buildVolume || "-"}</p>
                        <p><span className="text-zinc-500">Capabilities:</span> {printer.materials.join(", ")}</p>
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
                {printersData?.length === 0 ? (
                  <p className="text-zinc-500 col-span-full">No equipment listed publicly.</p>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-0">
              {seller.portfolio?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {seller.portfolio.map((item) => (
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
                {user && user.id !== shopId && (
                  <div className="flex justify-end mb-4">
                    <NeonButton glowColor="accent" onClick={() => setReviewDialogOpen(true)}>
                      <PenLine className="w-4 h-4" />
                      Write a Review
                    </NeonButton>
                  </div>
                )}
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

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Share your experience with {seller?.shopName || "this seller"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= reviewRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this seller..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="bg-black/30 border-white/10 text-white min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <NeonButton
                glowColor="accent"
                onClick={async () => {
                  if (!user) return;
                  try {
                    await createReview.mutateAsync({
                      revieweeId: shopId,
                      rating: reviewRating,
                      comment: reviewComment,
                    });
                    toast({
                      title: "Review submitted",
                      description: "Thank you for your feedback!",
                    });
                    setReviewDialogOpen(false);
                    setReviewRating(5);
                    setReviewComment("");
                  } catch (error) {
                    toast({
                      title: "Failed to submit review",
                      description: "Please try again later.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={createReview.isPending || !reviewComment.trim()}
              >
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </NeonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

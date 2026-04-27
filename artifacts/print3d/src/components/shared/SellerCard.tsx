import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Star, MapPin, Printer, Package, GitCompareArrows, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReportButton } from "@/components/shared/ReportButton";
import { isComparedShop, SHOP_COMPARE_CHANGE_EVENT, toggleComparedShop } from "@/lib/shop-compare";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Extended seller type that accepts both camelCase and snake_case
interface ExtendedSeller {
  id: string | number;
  displayName?: string;
  display_name?: string;
  username?: string;
  shopName?: string | null;
  store_name?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  shopMode?: 'catalog' | 'custom' | 'both';
  shop_mode?: 'catalog' | 'custom' | 'both';
  printerCount?: number;
  printer_count?: number;
  listingCount?: number;
  totalPrints?: number;
  total_prints?: number;
  reviewCount?: number;
  review_count?: number;
  rating?: number;
  sellerTags?: string[];
  seller_tags?: string[];
  user_id?: string | number;
  userId?: string | number;
}

export function SellerCard({ 
  seller, 
  isSponsored, 
  sponsorTier 
}: { 
  seller: ExtendedSeller; 
  isSponsored?: boolean;
  sponsorTier?: "premium" | "gold" | "silver";
}) {
  const tierStyles = {
    premium: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-300",
    gold: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-300",
    silver: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300",
  };
  const { toast } = useToast();
  const [isCompared, setIsCompared] = useState(() => isComparedShop(Number(seller.id)));
  const [fetchedAvatarUrl, setFetchedAvatarUrl] = useState<string | null>(null);

  // Fetch avatar directly from profiles if not provided
  useEffect(() => {
    const fetchAvatar = async () => {
      // If we already have an avatar, don't fetch
      const existingAvatar = seller.avatarUrl || seller.avatar_url;
      if (existingAvatar) {
        console.log('[SellerCard] Avatar already exists for seller:', seller.id, existingAvatar);
        return;
      }
      
      // Get user_id from seller data (could be user_id or userId or id)
      const userId = seller.user_id || seller.userId || seller.id;
      if (!userId) {
        console.log('[SellerCard] No userId found for seller:', seller.id);
        return;
      }

      try {
        console.log('[SellerCard] Fetching avatar for user:', userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.log('[SellerCard] Error fetching avatar:', error);
          return;
        }
        
        if (data?.avatar_url) {
          console.log('[SellerCard] Found avatar URL:', data.avatar_url);
          setFetchedAvatarUrl(data.avatar_url);
        } else {
          console.log('[SellerCard] No avatar_url in profile for user:', userId);
        }
      } catch (err) {
        console.log('[SellerCard] Exception fetching avatar:', err);
        // Silently fail - will show fallback initial
      }
    };

    fetchAvatar();
  }, [seller.avatarUrl, seller.avatar_url, seller.user_id, seller.userId, seller.id]);

  useEffect(() => {
    const sync = () => setIsCompared(isComparedShop(Number(seller.id)));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SHOP_COMPARE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SHOP_COMPARE_CHANGE_EVENT, sync);
    };
  }, [seller.id]);

  return (
    <div className="group block glass-panel p-6 rounded-2xl border border-white/5 hover:border-zinc-600/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(107,114,128,0.15)] relative overflow-hidden">
        {/* Glow effect behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 z-0" />
        
        <div className="relative z-10">
          {isSponsored && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className={cn("border font-semibold", tierStyles[sponsorTier || "silver"])}>
              <Sparkles className="w-3 h-3 mr-1" />
              Sponsored
            </Badge>
          </div>
        )}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-primary to-accent flex-shrink-0 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 overflow-hidden">
                  {(() => {
                    const avatarUrl = seller.avatarUrl || seller.avatar_url || fetchedAvatarUrl;
                    const displayName = seller.displayName || seller.display_name || 'Shop';
                    const initials = (seller.shopName || seller.store_name || seller.displayName || seller.display_name || 'S').charAt(0).toUpperCase();
                    
                    if (avatarUrl) {
                      return (
                        <img 
                          src={avatarUrl} 
                          alt={displayName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-xl font-bold font-display text-white">
                                  ${initials}
                                </div>
                              `;
                            }
                          }}
                        />
                      );
                    }
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 text-xl font-bold font-display text-white">
                        {initials}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-accent transition-colors">
                  {seller.shopName || seller.store_name || seller.displayName || seller.display_name || 'Unknown Shop'}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{seller.location || "Global"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-white">{seller.rating?.toFixed(1) || "New"}</span>
              </div>
              <span className="text-[10px] text-zinc-500">{seller.reviewCount || 0} reviews</span>
              <ReportButton
                itemType="profile"
                itemId={String(seller.id)}
                itemName={seller.shopName || seller.displayName}
                className="opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
          
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
            {seller.bio || "Fabrication, additive, and custom work — see shop for details."}
          </p>

          {(seller.sellerTags || seller.seller_tags)?.length ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {(seller.sellerTags || seller.seller_tags || []).slice(0, 3).map((tag: string) => (
                <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="mb-4 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary">
                New Shop
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                Open
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">{seller.printerCount || seller.printer_count || 0}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Equipment</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 text-accent">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">{seller.totalPrints || seller.total_prints || 0}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Orders</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            {seller.shopMode === "catalog" || seller.shopMode === "both" || seller.shop_mode === "catalog" || seller.shop_mode === "both" ? (
              <Badge variant="outline" className="text-xs bg-transparent border-primary/30 text-primary font-normal">Catalog</Badge>
            ) : null}
            {seller.shopMode === "custom" || seller.shopMode === "both" || seller.shop_mode === "custom" || seller.shop_mode === "both" ? (
              <Badge variant="outline" className="text-xs bg-transparent border-accent/30 text-accent font-normal">Custom Jobs</Badge>
            ) : null}
          </div>

          <div className="mt-5 flex gap-2">
            <Link href={`/shop/${seller.id}`} className="flex-1">
              <Button className="w-full rounded-xl">View shop</Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                const added = toggleComparedShop({
                  id: Number(seller.id),
                  displayName: seller.displayName || seller.display_name,
                  shopName: (seller.shopName || seller.store_name) ?? null,
                  location: seller.location ?? null,
                  rating: seller.rating ?? null,
                  reviewCount: seller.reviewCount || seller.review_count || 0,
                  shopMode: (seller.shopMode || seller.shop_mode) ?? null,
                  totalPrints: seller.totalPrints || seller.total_prints || 0,
                });
                toast({
                  title: added ? "Shop added to compare" : "Shop removed from compare",
                  description: added
                    ? "Open the compare page to review shops side by side."
                    : "This maker has been removed from your compare list.",
                });
              }}
            >
              <GitCompareArrows className="w-4 h-4" />
            </Button>
          </div>

          {isCompared ? (
            <p className="mt-3 text-xs text-accent">Pinned for comparison</p>
          ) : null}
        </div>
    </div>
  );
}

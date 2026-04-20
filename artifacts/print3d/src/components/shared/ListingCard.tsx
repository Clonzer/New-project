import { Listing } from "@/lib/workspace-api-mock";
import { Link, useLocation } from "wouter";
import { Box, Clock, ShoppingCart, AlertCircle, Trash2, Edit, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReportButton } from "@/components/shared/ReportButton";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/lib/cart-storage";
import type { ListingPriceInsight } from "@/lib/listing-pricing";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function ListingCard({
  listing,
  priceInsight,
  isOwner,
  onDelete,
  onEdit,
  isSponsored,
  sponsorTier,
}: {
  listing: Listing & { stockQuantity?: number; trackStock?: boolean };
  priceInsight?: ListingPriceInsight;
  isOwner?: boolean;
  onDelete?: (listingId: number) => void;
  onEdit?: (listing: Listing) => void;
  isSponsored?: boolean;
  sponsorTier?: "premium" | "gold" | "silver";
}) {
  const tierStyles = {
    premium: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-300",
    gold: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-300",
    silver: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300",
  };
  const { toast } = useToast();
  const { formatPrice } = useLocalePreferences();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const ship = listing.shippingCost ?? listing.shipping_cost ?? 0;
  const isOutOfStock = listing.trackStock && listing.stockQuantity === 0;
  const isLowStock = listing.trackStock && listing.stockQuantity && listing.stockQuantity <= 5 && listing.stockQuantity > 0;
  const isServiceListing = listing.listingType === "service" || listing.listing_type === "service";
  const priceInsightClassName =
    priceInsight?.tone === "good"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : priceInsight?.tone === "premium"
        ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
        : "bg-sky-500/15 text-sky-200 border-sky-500/30";

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <div className="group relative rounded-2xl overflow-hidden glass-panel border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:-translate-y-1 flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden bg-black/40">
        {listing.imageUrl || listing.image_url ? (
          <img 
            src={listing.imageUrl || listing.image_url} 
            alt={listing.title} 
            className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? "opacity-50" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:text-primary/40 transition-colors duration-500">
            <Box className="w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-300">Out of Stock</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isSponsored && (
            <Badge className={cn("border font-semibold", tierStyles[sponsorTier || "silver"])}>
              <Sparkles className="w-3 h-3 mr-1" />
              Sponsored
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-amber-500/20 border-amber-500/30 text-amber-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Low Stock
            </Badge>
          )}
          {!isOutOfStock && listing.trackStock && listing.stockQuantity !== undefined && (
            <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
              {listing.stockQuantity} in stock
            </Badge>
          )}
          {isOwner ? (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-red-500/50 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Delete this listing? This action cannot be undone.")) {
                      onDelete(listing.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <ReportButton
              itemType="listing"
              itemId={String(listing.id)}
              itemName={listing.title}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
            />
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/10">
            {listing.category || 'General'}
          </Badge>
          <div className="text-right">
            <p className="text-xs text-zinc-300">from</p>
            <p className="font-display font-bold text-lg text-primary text-glow-primary">
              {formatPrice(listing.basePrice || listing.base_price || 0)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-display font-semibold text-lg text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        <Link href={`/shop/${listing.sellerId || listing.seller_id}`} className="text-sm text-muted-foreground hover:text-accent transition-colors mb-4 line-clamp-1 block">
          by {listing.sellerName || listing.seller_name || 'Unknown Shop'}
        </Link>

        {priceInsight ? (
          <div className="mb-4 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <Badge className={priceInsightClassName}>{priceInsight.label}</Badge>
              <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Live market check</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">{priceInsight.detail}</p>
          </div>
        ) : null}
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. {listing.estimatedDaysMin || listing.estimated_days_min || 1}-{listing.estimatedDaysMax || listing.estimated_days_max || 7} days</span>
            {ship > 0 && (
              <span className="text-zinc-500">· +{formatPrice(ship)} ship</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {listing.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="mt-5 flex gap-2">
          {!isServiceListing && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isOutOfStock) {
                  toast({ variant: "destructive", title: "Out of stock", description: "This item is no longer available." });
                  return;
                }
                addToCart(listing.id, 1);
                toast({ title: "Added to cart", description: listing.title });
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isOutOfStock}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                isOutOfStock
                  ? "bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border-primary/30 hover:border-primary/50"
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Cart
            </button>
          )}
          {isServiceListing ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  toast({ variant: "destructive", title: "Login required", description: "Please login to request a job." });
                  setLocation("/login");
                  return;
                }
                setLocation(`/messages?userId=${listing.sellerId}&listingId=${listing.id}`);
              }}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 border bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/40 hover:to-primary/30 border-primary/30 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Request Job
            </button>
          ) : (
            <Link href={isOutOfStock ? "#" : `/order/new?listingId=${listing.id}`} onClick={(e) => {
              if (isOutOfStock) e.preventDefault();
            }} className="flex-1">
              <button
                type="button"
                disabled={isOutOfStock}
                className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 border ${
                  isOutOfStock
                    ? "bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/40 hover:to-primary/30 border-primary/30 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Order Print"}
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
    </Link>
  );
}

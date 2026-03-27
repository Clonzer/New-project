import { Listing } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Box, Clock, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/lib/cart-storage";
import type { ListingPriceInsight } from "@/lib/listing-pricing";

export function ListingCard({
  listing,
  priceInsight,
}: {
  listing: Listing;
  priceInsight?: ListingPriceInsight;
}) {
  const { toast } = useToast();
  const ship = listing.shippingCost ?? 0;
  const priceInsightClassName =
    priceInsight?.tone === "good"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : priceInsight?.tone === "premium"
        ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
        : "bg-sky-500/15 text-sky-200 border-sky-500/30";

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-panel border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden bg-black/40">
        {listing.imageUrl ? (
          <img 
            src={listing.imageUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:text-primary/40 transition-colors duration-500">
            <Box className="w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/10">
            {listing.category}
          </Badge>
          <div className="text-right">
            <p className="text-xs text-zinc-300">from</p>
            <p className="font-display font-bold text-lg text-primary text-glow-primary">
              ${listing.basePrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-display font-semibold text-lg text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        
        <Link href={`/shop/${listing.sellerId}`} className="text-sm text-muted-foreground hover:text-accent transition-colors mb-4 line-clamp-1 block">
          by {listing.sellerName}
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
            <span>Est. {listing.estimatedDaysMin}-{listing.estimatedDaysMax} days</span>
            {ship > 0 && (
              <span className="text-zinc-500">· +${ship.toFixed(2)} ship</span>
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
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(listing.id, 1);
              toast({ title: "Added to cart", description: listing.title });
            }}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/10 flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" /> Cart
          </button>
          <Link href={`/order/new?listingId=${listing.id}`} className="flex-1">
            <button type="button" className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-primary text-white text-sm font-medium transition-all duration-300 border border-white/10 hover:border-primary hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              Order Print
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

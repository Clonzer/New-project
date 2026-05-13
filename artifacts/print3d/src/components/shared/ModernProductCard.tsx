import { Listing } from "@/lib/workspace-api-mock";
import { Link, useLocation } from "wouter";
import { 
  Box, 
  Clock, 
  ShoppingCart, 
  AlertCircle, 
  Trash2, 
  Edit, 
  MessageSquare, 
  Sparkles, 
  Wrench, 
  XCircle,
  Star,
  Package,
  Truck,
  Heart,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReportButton } from "@/components/shared/ReportButton";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/lib/cart-storage";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { MiniRank } from "@/components/rank/RankBadge";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { calculateFees } from "@/components/shared/PricingCalculator";

interface ModernProductCardProps {
  listing: Listing & { 
    stockQuantity?: number; 
    trackStock?: boolean; 
    sellerRankId?: number;
    sellerRating?: number;
    sellerReviewCount?: number;
  };
  priceInsight?: any;
  isOwner?: boolean;
  onDelete?: (listingId: number) => void;
  onEdit?: (listing: Listing) => void;
  isSponsored?: boolean;
  sponsorTier?: "premium" | "gold" | "silver";
  equipmentStatus?: "operational" | "maintenance" | "out-of-service" | "busy";
  sellerAcceptingOrders?: boolean;
}

export function ModernProductCard({
  listing,
  priceInsight,
  isOwner,
  onDelete,
  onEdit,
  isSponsored,
  sponsorTier,
  equipmentStatus,
  sellerAcceptingOrders,
}: ModernProductCardProps) {
  const tierStyles = {
    premium: "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600",
    gold: "bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-yellow-600",
    silver: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-600",
  };

  const { toast } = useToast();
  const { formatPrice } = useLocalePreferences();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const flatFee = 1.00;
  const buyerPrice = (listing.basePrice || 0) + (listing.shippingCost || 0) + flatFee;
  
  const isOutOfStock = listing.trackStock && listing.stockQuantity === 0;
  const isLowStock = listing.trackStock && listing.stockQuantity && listing.stockQuantity <= 5 && listing.stockQuantity > 0;
  const isServiceListing = listing.listingType === "service";
  const isEquipmentDown = equipmentStatus && equipmentStatus !== "operational";

  const getEquipmentStatusBadge = () => {
    if (!equipmentStatus || equipmentStatus === "operational") return null;
    const statusConfig = {
      "maintenance": { label: "Maintenance", className: "bg-amber-100 text-amber-800 border-amber-200" },
      "out-of-service": { label: "Unavailable", className: "bg-red-100 text-red-800 border-red-200" },
      "busy": { label: "Busy", className: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    const config = statusConfig[equipmentStatus];
    return (
      <Badge className={cn("text-xs font-medium", config.className)}>
        <Wrench className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="relative bg-zinc-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-zinc-700 hover:border-zinc-600 group-hover:-translate-y-2">
        
        {/* Image Section with Overlay */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {listing.imageUrl ? (
            <img 
              src={listing.imageUrl} 
              alt={listing.title} 
              className={cn(
                "w-full h-full object-cover transition-transform duration-700",
                isOutOfStock ? "opacity-60 grayscale" : "group-hover:scale-110"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-gray-500 transition-colors">
              <Box className="w-16 h-16" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              {isSponsored && (
                <Badge className={cn("text-xs font-semibold shadow-md", tierStyles[sponsorTier || "silver"])}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Sponsored
                </Badge>
              )}
              {getEquipmentStatusBadge()}
            </div>
            
            <div className="flex gap-1">
              {isLowStock && (
                <Badge className="bg-orange-500 text-white text-xs font-medium shadow-md">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Low Stock
                </Badge>
              )}
              {!isOutOfStock && listing.trackStock && listing.stockQuantity !== undefined && (
                <Badge className="bg-green-500 text-white text-xs font-medium shadow-md">
                  {listing.stockQuantity} left
                </Badge>
              )}
            </div>
          </div>
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Out of Stock</p>
              </div>
            </div>
          )}

          {/* Action Buttons (shown on hover) */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isOwner ? (
              <div className="flex gap-1">
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 shadow-lg"
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
                className="bg-white/90 hover:bg-white shadow-lg"
              />
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-zinc-900/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-zinc-700">
              <p className="text-xs text-zinc-400 font-medium">from</p>
              <p className="text-lg font-bold text-white">
                {formatPrice(buyerPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-blue-400 transition-colors">
              {listing.title}
            </h3>
            
            {/* Seller Info */}
            <div className="flex items-center gap-2 mt-2">
              <Link 
                href={`/shop/${listing.sellerId || listing.id}`} 
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="font-medium">{listing.sellerName || 'Unknown Shop'}</span>
                {listing.sellerRankId && listing.sellerRankId > 1 && (
                  <MiniRank rankId={listing.sellerRankId} />
                )}
                {listing.sellerRating && typeof listing.sellerRating === 'number' && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-zinc-300">
                      {listing.sellerRating.toFixed(1)} ({listing.sellerReviewCount || 0})
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* Status Messages */}
          {sellerAcceptingOrders === false && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs text-red-700 font-medium flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Not accepting orders
              </p>
            </div>
          )}

          {/* Key Info */}
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{listing.estimatedDaysMin || 1}-{listing.estimatedDaysMax || 7} days</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>{listing.shippingCost > 0 ? `+$${listing.shippingCost}` : 'Free shipping'}</span>
            </div>
          </div>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full">
                  {tag}
                </span>
              ))}
              {listing.tags.length > 3 && (
                <span className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full">
                  +{listing.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!isServiceListing ? (
              <>
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
                  disabled={isOutOfStock}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5",
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg"
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                
                <FavoriteButton 
                  itemId={String(listing.id)}
                  itemType="product"
                  className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                />
              </>
            ) : (
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
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                Request Job
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

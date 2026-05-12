import { useEffect, useState } from "react";
import { Link } from "wouter";
import { 
  Star, 
  MapPin, 
  Printer, 
  Package, 
  GitCompareArrows, 
  Sparkles, 
  XCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReportButton } from "@/components/shared/ReportButton";
import { isComparedShop, SHOP_COMPARE_CHANGE_EVENT, toggleComparedShop } from "@/lib/shop-compare";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { MiniRank } from "@/components/rank/RankBadge";

interface ModernShopCardProps {
  seller: {
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
    accepting_orders?: boolean;
    rankId?: number;
    totalXp?: number;
    responseTime?: number;
    completionRate?: number;
  };
  isSponsored?: boolean;
  sponsorTier?: "premium" | "gold" | "silver";
}

export function ModernShopCard({ 
  seller, 
  isSponsored, 
  sponsorTier 
}: ModernShopCardProps) {
  const tierStyles = {
    premium: "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600",
    gold: "bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-yellow-600",
    silver: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-600",
  };

  const { toast } = useToast();
  const [isCompared, setIsCompared] = useState(() => isComparedShop(Number(seller.id)));
  const [fetchedAvatarUrl, setFetchedAvatarUrl] = useState<string | null>(null);
  
  // Common seller data
  const shopName = seller.shopName || seller.store_name || 'Unknown Shop';
  const displayName = seller.displayName || seller.display_name || shopName;

  // Fetch avatar if not provided
  useEffect(() => {
    const fetchAvatar = async () => {
      const existingAvatar = seller.avatarUrl || seller.avatar_url;
      if (existingAvatar) return;
      
      const userId = seller.user_id || seller.userId || seller.id;
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();
        
        if (!error && data?.avatar_url) {
          setFetchedAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        // Silently fail
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

  const getShopModeBadge = () => {
    const shopMode = seller.shopMode || seller.shop_mode;
    if (shopMode === "both") {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Catalog & Custom</Badge>;
    } else if (shopMode === "catalog") {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Catalog Only</Badge>;
    } else if (shopMode === "custom") {
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Custom Jobs</Badge>;
    }
    return null;
  };

  const getStatusIndicator = () => {
    if (seller.accepting_orders === false) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Not Accepting Orders</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Accepting Orders</span>
      </div>
    );
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 group-hover:-translate-y-2">
      
      {/* Header Section */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
        {/* Sponsored Badge */}
        {isSponsored && (
          <div className="absolute top-3 right-3 z-20">
            <Badge className={cn("text-xs font-semibold shadow-md", tierStyles[sponsorTier || "silver"])}>
              <Sparkles className="w-3 h-3 mr-1" />
              Sponsored
            </Badge>
          </div>
        )}

        {/* Avatar and Basic Info */}
        <div className="flex items-end gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden">
                {(() => {
                  const avatarUrl = seller.avatarUrl || seller.avatar_url || fetchedAvatarUrl;
                  const initials = shopName.charAt(0).toUpperCase();
                  
                  if (avatarUrl) {
                    return (
                      <img 
                        src={avatarUrl} 
                        alt={shopName} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                                ${initials}
                              </div>
                            `;
                          }
                        }}
                      />
                    );
                  }
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                      {initials}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center">
              {seller.accepting_orders === false ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <div className="flex-1 pb-2">
            <h3 className="font-bold text-xl text-white mb-1 group-hover:text-yellow-300 transition-colors">
              {shopName}
            </h3>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{seller.location || "Global"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Rating and Rank */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {seller.rankId && seller.rankId > 1 && (
              <MiniRank rankId={seller.rankId} />
            )}
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900">
                {seller.rating?.toFixed(1) || "New"}
              </span>
              <span className="text-sm text-gray-500">
                ({seller.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
          
          <ReportButton
            itemType="profile"
            itemId={String(seller.id)}
            itemName={shopName}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          {getStatusIndicator()}
          {getShopModeBadge()}
        </div>

        {/* Bio */}
        <p className="text-gray-600 text-sm line-clamp-2">
          {seller.bio || "Professional 3D printing and fabrication services. Quality work with fast turnaround times."}
        </p>

        {/* Tags */}
        {(seller.sellerTags || seller.seller_tags)?.length ? (
          <div className="flex flex-wrap gap-1">
            {(seller.sellerTags || seller.seller_tags || []).slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
            {(seller.sellerTags || seller.seller_tags || []).length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                +{(seller.sellerTags || seller.seller_tags || []).length - 3}
              </span>
            )}
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg">
              <Printer className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-bold text-gray-900">
              {seller.printerCount || seller.printer_count || 0}
            </p>
            <p className="text-xs text-gray-500">Equipment</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-bold text-gray-900">
              {seller.totalPrints || seller.total_prints || 0}
            </p>
            <p className="text-xs text-gray-500">Orders</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-bold text-gray-900">
              {seller.totalXp || 0}
            </p>
            <p className="text-xs text-gray-500">XP Points</p>
          </div>
        </div>

        {/* Performance Metrics */}
        {seller.responseTime || seller.completionRate ? (
          <div className="flex gap-4 text-sm">
            {seller.responseTime && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{seller.responseTime}h avg response</span>
              </div>
            )}
            {seller.completionRate && (
              <div className="flex items-center gap-1 text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>{seller.completionRate}% completion</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href={`/shop/${seller.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Visit Shop
            </Button>
          </Link>
          
          <Button
            type="button"
            variant="outline"
            className="rounded-lg border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
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

        {/* Compare Status */}
        {isCompared && (
          <div className="text-center">
            <p className="text-xs text-blue-600 font-medium">Pinned for comparison</p>
          </div>
        )}
      </div>
    </div>
  );
}

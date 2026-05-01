import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { SponsoredShopsSection } from "./SponsoredShopsSection";

interface SponsoredShop {
  id: string;
  userId: number;
  shopName: string;
  displayName: string;
  avatar: string;
  banner: string;
  specialty: string;
  views: number;
  tier: string;
  promotionLevel: number;
  sponsoredUntil: string;
  orderCount: number;
  averageRating: number;
  reviewCount: number;
}

interface SponsoredShopsInjectionProps {
  className?: string;
  maxShops?: number;
  showHeader?: boolean;
}

export function SponsoredShopsInjection({ 
  className = "", 
  maxShops = 4,
  showHeader = true 
}: SponsoredShopsInjectionProps) {
  const [sponsoredShops, setSponsoredShops] = useState<SponsoredShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsoredShops = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current date for checking active sponsorships
        const now = new Date().toISOString();

        // Fetch active sponsorships with shop data from Supabase
        const { data: sponsorships, error: sponsorshipError } = await supabase
          .from('sponsorships')
          .select(`
            id,
            user_id,
            tier,
            end_date,
            promotion_level,
            profiles:user_id (
              id,
              shop_name,
              display_name,
              avatar_url,
              banner_url,
              seller_tags,
              shop_announcement
            )
          `)
          .eq('is_active', true)
          .gte('end_date', now)
          .order('promotion_level', { ascending: false })
          .limit(maxShops);

        if (sponsorshipError) {
          throw sponsorshipError;
        }

        if (!sponsorships || sponsorships.length === 0) {
          setSponsoredShops([]);
          return;
        }

        // Get stats for each shop (order count, rating)
        const shopIds = sponsorships.map(s => s.user_id);
        
        const [{ data: orderStats }, { data: reviewStats }] = await Promise.all([
          supabase
            .from('orders')
            .select('seller_id', { count: 'exact' })
            .in('seller_id', shopIds)
            .eq('status', 'completed'),
          supabase
            .from('reviews')
            .select('seller_id, rating')
            .in('seller_id', shopIds)
        ]);

        // Calculate stats per shop
        const orderCounts: Record<string, number> = {};
        const ratings: Record<string, number[]> = {};
        
        // Count orders per seller
        // Note: This is simplified - in production you'd want a proper aggregation query
        
        // Calculate average ratings
        reviewStats?.forEach((review: any) => {
          if (!ratings[review.seller_id]) {
            ratings[review.seller_id] = [];
          }
          ratings[review.seller_id].push(review.rating);
        });

        // Transform data to match expected format
        const transformedShops: SponsoredShop[] = sponsorships.map((s: any) => {
          const profile = s.profiles || {};
          const shopRatings = ratings[s.user_id] || [];
          const avgRating = shopRatings.length > 0
            ? shopRatings.reduce((a: number, b: number) => a + b, 0) / shopRatings.length
            : 0;

          return {
            id: s.id,
            userId: s.user_id,
            shopName: profile.shop_name || profile.display_name || 'Unnamed Shop',
            displayName: profile.display_name || 'Unnamed Shop',
            avatar: profile.avatar_url || '',
            banner: profile.banner_url || '',
            specialty: profile.seller_tags?.[0] || profile.shop_announcement || 'Custom Manufacturing',
            views: 0, // Views not tracked yet
            tier: s.tier || 'basic',
            promotionLevel: s.promotion_level || 1,
            sponsoredUntil: s.end_date,
            orderCount: 0, // Simplified - would need proper count query
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: shopRatings.length
          };
        });

        setSponsoredShops(transformedShops);
      } catch (err) {
        console.error("Failed to fetch sponsored shops:", err);
        setError("Unable to load sponsored shops");
        setSponsoredShops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsoredShops();
  }, [maxShops]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse"></div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(maxShops)].map((_, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-xl p-4 animate-pulse">
              <div className="h-20 bg-zinc-700 rounded mb-3"></div>
              <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && sponsoredShops.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  if (sponsoredShops.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Makers</h2>
            <p className="text-zinc-400">Discover top-rated shops with active sponsorships</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">SPONSORED</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      
      <SponsoredShopsSection 
        sponsoredShops={sponsoredShops}
        compact={maxShops <= 2}
      />
    </motion.div>
  );
}

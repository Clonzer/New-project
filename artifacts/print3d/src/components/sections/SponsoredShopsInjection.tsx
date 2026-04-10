import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { customFetch } from "@workspace/api-client-react";
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

        // Fetch featured sponsored shops from API
        const response = await customFetch('/api/sponsorships/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch sponsored shops');
        }

        const data = await response.json();
        
        // Transform API data to match expected format
        const transformedShops: SponsoredShop[] = data.shops?.map((shop: any) => ({
          id: shop.id,
          userId: shop.userId,
          shopName: shop.shopName || shop.displayName,
          displayName: shop.displayName,
          avatar: shop.avatar || `https://api.pravatar.cc/150?u=${shop.userId}`,
          banner: shop.banner || `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop&auto=format`,
          specialty: shop.specialty || "Custom Manufacturing",
          views: shop.views || Math.floor(Math.random() * 50000) + 1000,
          tier: shop.tier || "premium",
          promotionLevel: shop.promotionLevel || 10,
          sponsoredUntil: shop.sponsoredUntil,
          orderCount: shop.orderCount || 0,
          averageRating: shop.averageRating || 0,
          reviewCount: shop.reviewCount || 0
        })) || [];

        // Sort by promotion level and limit results
        const sortedShops = transformedShops
          .sort((a, b) => b.promotionLevel - a.promotionLevel)
          .slice(0, maxShops);

        setSponsoredShops(sortedShops);
      } catch (err) {
        console.error("Failed to fetch sponsored shops:", err);
        setError("Unable to load sponsored shops");
        
        // Fallback to mock data if API fails
        const fallbackShops: SponsoredShop[] = [
          {
            id: "fallback-1",
            userId: 1,
            shopName: "Elite Makers Studio",
            displayName: "Elite Makers",
            avatar: "https://api.pravatar.cc/150?u=elite",
            banner: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop",
            specialty: "Premium Prototyping",
            views: 12500,
            tier: "premium",
            promotionLevel: 10,
            sponsoredUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            orderCount: 156,
            averageRating: 4.8,
            reviewCount: 89
          },
          {
            id: "fallback-2",
            userId: 2,
            shopName: "Precision Works",
            displayName: "Precision Works",
            avatar: "https://api.pravatar.cc/150?u=precision",
            banner: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
            specialty: "CNC Machining",
            views: 8900,
            tier: "gold",
            promotionLevel: 8,
            sponsoredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            orderCount: 98,
            averageRating: 4.9,
            reviewCount: 67
          }
        ].slice(0, maxShops);
        
        setSponsoredShops(fallbackShops);
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

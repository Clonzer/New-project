import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award, Zap, Users, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { customFetch } from "@/lib/workspace-api-mock";

interface ShopStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  responseRate: number;
  averageResponseTime: number;
  topCategories: string[];
  badges: string[];
}

interface DynamicShopBannerProps {
  userId: number;
  shopName: string;
  className?: string;
}

export function DynamicShopBanner({ userId, shopName, className = "" }: DynamicShopBannerProps) {
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopStats = async () => {
      try {
        // Fetch user stats including orders and reviews
        const userResponse = await customFetch(`/api/users/${userId}`);
        const userData = await userResponse.json();
        
        // Fetch orders count
        const ordersResponse = await customFetch(`/api/orders?sellerId=${userId}&limit=1000`);
        const ordersData = await ordersResponse.json();
        
        // Fetch reviews
        const reviewsResponse = await customFetch(`/api/reviews?sellerId=${userId}&limit=1000`);
        const reviewsData = await reviewsResponse.json();
        
        // Fetch badges
        const badgesResponse = await customFetch(`/api/badges/user/${userId}`);
        const badgesData = await badgesResponse.json();

        const totalOrders = ordersData.orders?.length || 0;
        const totalRevenue = ordersData.orders?.reduce((sum: number, order: any) => sum + order.totalPrice, 0) || 0;
        const reviews = reviewsData.reviews || [];
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
          : 0;
        const reviewCount = reviews.length;
        
        // Calculate response rate and time (mock for now, would come from messages table)
        const responseRate = Math.min(95, 70 + Math.floor(Math.random() * 25));
        const averageResponseTime = Math.max(1, Math.floor(Math.random() * 8) + 1);

        // Determine top categories from listings
        const listingsResponse = await customFetch(`/api/listings?sellerId=${userId}&limit=1000`);
        const listingsData = await listingsResponse.json();
        const categoryCounts: { [key: string]: number } = {};
        
        listingsData.listings?.forEach((listing: any) => {
          categoryCounts[listing.category] = (categoryCounts[listing.category] || 0) + 1;
        });
        
        const topCategories = Object.entries(categoryCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([category]) => category);

        // Generate badges based on performance
        const badges: string[] = badgesData.badges?.map((badge: any) => badge.name) || [];
        
        // Add performance-based badges
        if (totalOrders >= 100) badges.push("100+ Sold");
        if (totalOrders >= 500) badges.push("500+ Sold");
        if (totalOrders >= 1000) badges.push("1000+ Sold");
        if (averageRating >= 4.8) badges.push("Top Rated");
        if (averageRating >= 4.9) badges.push("Excellent");
        if (responseRate >= 90) badges.push("Quick Responder");
        if (averageResponseTime <= 2) badges.push("Lightning Fast");

        setStats({
          totalOrders,
          totalRevenue,
          averageRating,
          reviewCount,
          responseRate,
          averageResponseTime,
          topCategories,
          badges: badges.slice(0, 6) // Limit to 6 badges
        });
      } catch (error) {
        console.error("Failed to fetch shop stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopStats();
  }, [userId]);

  if (isLoading) {
    return (
      <div className={`bg-zinc-800/50 rounded-xl p-4 animate-pulse ${className}`}>
        <div className="h-4 bg-zinc-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-zinc-700 rounded w-24"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getBadgeIcon = (badge: string) => {
    if (badge.includes("Sold")) return Package;
    if (badge.includes("Rated") || badge.includes("Excellent")) return Star;
    if (badge.includes("Responder")) return Zap;
    if (badge.includes("Fast")) return TrendingUp;
    return Award;
  };

  const getBadgeColor = (badge: string) => {
    if (badge.includes("Sold")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (badge.includes("Rated") || badge.includes("Excellent")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (badge.includes("Responder") || badge.includes("Fast")) return "bg-green-500/20 text-green-400 border-green-500/30";
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-zinc-600/50 to-zinc-700/50 backdrop-blur-sm rounded-xl border border-zinc-600 p-6 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{shopName}</h3>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{stats.averageRating.toFixed(1)}</span>
              <span>({stats.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{stats.totalOrders} orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {stats.badges.map((badge, index) => {
          const Icon = getBadgeIcon(badge);
          return (
            <Badge
              key={index}
              variant="outline"
              className={`flex items-center gap-1 text-xs ${getBadgeColor(badge)}`}
            >
              <Icon className="w-3 h-3" />
              {badge}
            </Badge>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-zinc-500 mb-1">Response Rate</p>
          <p className="text-white font-semibold">{stats.responseRate}%</p>
        </div>
        <div>
          <p className="text-zinc-500 mb-1">Avg Response</p>
          <p className="text-white font-semibold">{stats.averageResponseTime}h</p>
        </div>
        <div>
          <p className="text-zinc-500 mb-1">Revenue</p>
          <p className="text-white font-semibold">${stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-zinc-500 mb-1">Top Categories</p>
          <div className="flex flex-wrap gap-1">
            {stats.topCategories.slice(0, 2).map((category, index) => (
              <span key={index} className="text-zinc-300 text-xs">
                {category}
                {index < Math.min(1, stats.topCategories.length - 1) && ","}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

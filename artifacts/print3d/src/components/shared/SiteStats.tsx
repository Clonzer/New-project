import { Users, Package, Star, Trophy, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function SiteStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('sellers').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true })
    ])
      .then(([sellersResult, listingsResult]) => {
        setStats({
          totalMakers: sellersResult.count || 0,
          projectsCompleted: listingsResult.count || 0,
          totalReviews: 15600,
          satisfactionRate: 98,
          monthlyGrowth: 24,
          avgResponseTime: 2.5
        });
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err as Error);
        // Fallback to mock data if Supabase fails
        setStats({
          totalMakers: 1250,
          projectsCompleted: 8900,
          totalReviews: 15600,
          satisfactionRate: 98,
          monthlyGrowth: 24,
          avgResponseTime: 2.5
        });
        setIsLoading(false);
      });
  }, []);

  const statsData = [
    {
      label: "Total Makers",
      value: stats?.totalMakers?.toLocaleString(),
      icon: Users,
      color: "from-cyan-400 to-emerald-400"
    },
    {
      label: "Projects Completed", 
      value: stats?.totalProjects?.toLocaleString(),
      icon: Package,
      color: "from-purple-400 to-pink-400"
    },
    {
      label: "Active Contests",
      value: stats?.activeContests?.toString(),
      icon: Trophy,
      color: "from-orange-400 to-red-400"
    },
    {
      label: "Average Rating",
      value: stats?.averageRating?.toFixed(1),
      icon: Star,
      color: "from-yellow-400 to-orange-400"
    }
  ];

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800 p-6">
          <CardContent className="p-0">
            <div className="text-center text-zinc-400 text-sm">
              Stats temporarily unavailable
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 -mt-12 relative z-10">
      <Card className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800 p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                ) : (
                  <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.value || "0"}
                  </div>
                )}
                <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {!isLoading && stats && (
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>{stats.totalOrders?.toLocaleString() || "0"} orders completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{stats.supportResponseTime || "0"} avg. response</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

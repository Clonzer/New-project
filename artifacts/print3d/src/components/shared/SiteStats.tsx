import { useQuery } from "@tanstack/react-query";
import { Users, Package, Star, Trophy, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock API calls - replace with actual API endpoints
const fetchSiteStats = async () => {
  // This would be replaced with actual API calls to your backend
  // For now, returning mock data that matches the requested stats
  return {
    totalMakers: 10487,
    totalProjects: 52348,
    activeContests: 3,
    averageRating: 4.9,
    totalOrders: 52189,
    supportResponseTime: "2 hours"
  };
};

export function SiteStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["siteStats"],
    queryFn: fetchSiteStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const statsData = [
    {
      label: "Total Makers",
      value: stats?.totalMakers.toLocaleString() || "10K+",
      icon: Users,
      color: "from-cyan-400 to-emerald-400"
    },
    {
      label: "Projects Completed", 
      value: stats?.totalProjects.toLocaleString() || "50K+",
      icon: Package,
      color: "from-purple-400 to-pink-400"
    },
    {
      label: "Active Contests",
      value: stats?.activeContests.toString() || "3",
      icon: Trophy,
      color: "from-orange-400 to-red-400"
    },
    {
      label: "Average Rating",
      value: stats?.averageRating.toFixed(1) || "4.9",
      icon: Star,
      color: "from-yellow-400 to-orange-400"
    }
  ];

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto -mt-16 relative z-20">
        <Card className="bg-white rounded-3xl shadow-xl border-0 p-8">
          <CardContent className="p-0">
            <div className="text-center text-red-600">
              Failed to load statistics. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto -mt-16 relative z-20">
      <Card className="bg-white rounded-3xl shadow-xl border-0 p-8">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                ) : (
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                )}
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {!isLoading && stats && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>{stats.totalOrders.toLocaleString()} orders completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{stats.supportResponseTime} avg. response time</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

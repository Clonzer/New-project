import { useState, useEffect } from "react";
import { TrendingUp, Package, Eye, Activity, DollarSign, Lock, Crown } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { NeonButton } from "@/components/ui/neon-button";
import { Link } from "wouter";

const COLORS = ["#9fe5ff", "#a78bfa", "#ec4899", "#f59e0b"];

interface AnalyticsProps {
  shopId?: string;
  timeRange?: "7d" | "30d" | "90d";
}

export function Analytics({ shopId, timeRange = "30d" }: AnalyticsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [shopId, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!shopId) return;

    try {
      setIsLoading(true);

      // Calculate date range
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch orders for the shop
      const { data: ordersData } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .eq("seller_id", shopId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Fetch listings with views
      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, price, views, created_at")
        .eq("seller_id", shopId)
        .gte("created_at", startDate.toISOString())
        .order("views", { ascending: false })
        .limit(10);

      // Group data by date
      const groupedData: any = {};
      const dateRange = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        groupedData[dateKey] = {
          date: dayName,
          revenue: 0,
          orders: 0,
          views: 0,
          conversion: 0,
        };
        dateRange.push(dateKey);
      }

      // Aggregate orders data
      ordersData?.forEach((order) => {
        const dateKey = order.created_at.split("T")[0];
        if (groupedData[dateKey]) {
          groupedData[dateKey].revenue += order.total_amount || 0;
          groupedData[dateKey].orders += 1;
        }
      });

      // Aggregate views data
      listingsData?.forEach((listing) => {
        const dateKey = listing.created_at.split("T")[0];
        if (groupedData[dateKey]) {
          groupedData[dateKey].views += listing.views || 0;
        }
      });

      // Calculate conversion rates
      Object.keys(groupedData).forEach((key) => {
        const day = groupedData[key];
        day.conversion = day.views > 0 ? ((day.orders / day.views) * 100).toFixed(1) : 0;
      });

      const formattedData = Object.values(groupedData);
      setAnalyticsData(formattedData);

      // Format top products data
      const formattedTopProducts = listingsData?.map((listing) => ({
        name: listing.title,
        value: listing.views || 0,
        revenue: listing.price || 0,
        orders: Math.floor(Math.random() * 10) + 1, // This would need to be calculated from actual orders
      })) || [];

      setTopProducts(formattedTopProducts);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has paid plan
  const hasPaidPlan = user?.plan_tier && user.plan_tier !== "none";

  // If user doesn't have paid plan, show locked state
  if (!hasPaidPlan) {
    return (
      <div className="space-y-8">
        <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Upgrade to View Analytics</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Get detailed insights into your store performance, revenue trends, and customer behavior with our Pro plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <NeonButton glowColor="primary" className="rounded-full">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Blurred preview of what's available */}
        <div className="opacity-30 pointer-events-none filter blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel rounded-2xl border border-white/10 p-6 h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl border border-white/10 p-6 h-80" />
            <div className="glass-panel rounded-2xl border border-white/10 p-6 h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl border border-white/10 p-6 animate-pulse">
              <div className="h-8 bg-white/10 rounded w-1/2 mb-4" />
              <div className="h-12 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl border border-white/10 p-6 h-80 animate-pulse" />
          <div className="glass-panel rounded-2xl border border-white/10 p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  const data = analyticsData.length > 0 ? analyticsData : generateFallbackData();
  const products = topProducts.length > 0 ? topProducts : generateFallbackProducts();

  const totalRevenue = data.reduce((sum: number, day: any) => sum + day.revenue, 0);
  const totalOrders = data.reduce((sum: number, day: any) => sum + day.orders, 0);
  const totalViews = data.reduce((sum: number, day: any) => sum + day.views, 0);
  const avgConversion = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : "0";

  function generateFallbackData() {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const fallbackData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      fallbackData.push({
        date: dayName,
        revenue: 0,
        orders: 0,
        views: 0,
        conversion: 0,
      });
    }
    return fallbackData;
  }

  function generateFallbackProducts() {
    return [
      { name: "No data yet", value: 0, revenue: 0, orders: 0 },
    ];
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, change: "from this period", Icon: DollarSign, color: "emerald" },
          { label: "Total Orders", value: totalOrders, change: "from this period", Icon: Package, color: "primary" },
          { label: "Shop Views", value: totalViews, change: "from this period", Icon: Eye, color: "blue" },
          { label: "Conversion Rate", value: `${avgConversion}%`, change: "from this period", Icon: Activity, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-400">{stat.label}</p>
              <stat.Icon className={`w-5 h-5 text-${stat.color === "primary" ? "primary" : stat.color}-400`} />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-xs text-zinc-400">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="date" stroke="#a1a1a1" style={{ fontSize: "12px" }} />
              <YAxis stroke="#a1a1a1" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #ffffff1a",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#a1a1a1" }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#9fe5ff"
                strokeWidth={2}
                dot={false}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Orders by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="date" stroke="#a1a1a1" style={{ fontSize: "12px" }} />
              <YAxis stroke="#a1a1a1" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #ffffff1a",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#a1a1a1" }} />
              <Bar dataKey="orders" fill="#a78bfa" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Views Chart */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Shop Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="date" stroke="#a1a1a1" style={{ fontSize: "12px" }} />
              <YAxis stroke="#a1a1a1" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #ffffff1a",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#a1a1a1" }} />
              <Area
                type="monotone"
                dataKey="views"
                fill="#3b82f6"
                stroke="#60a5fa"
                strokeWidth={2}
                name="Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products and Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
          <div className="space-y-3">
            {products.length > 0 && products[0].name !== "No data yet" ? products.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between pb-3 border-b border-white/5 last:pb-0 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: COLORS[index % COLORS.length] + "33", borderColor: COLORS[index % COLORS.length] + "80", borderWidth: "1px" }} />
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-zinc-500">{product.views} views</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">${product.revenue}</p>
              </div>
            )) : (
              <p className="text-sm text-zinc-400 text-center py-4">No product data available yet</p>
            )}
          </div>
        </div>

        {/* Conversion Rate Distribution */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-zinc-400">View-to-order Ratio</p>
                <p className="text-sm font-semibold text-white">{avgConversion}%</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full" style={{ width: `${Math.min(parseFloat(avgConversion), 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-zinc-400">Total Products</p>
                <p className="text-sm font-semibold text-white">{products.length}</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: `${Math.min(products.length * 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-zinc-400">Active Days</p>
                <p className="text-sm font-semibold text-white">{data.filter((d: any) => d.orders > 0 || d.views > 0).length}</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: `${Math.min((data.filter((d: any) => d.orders > 0 || d.views > 0).length / data.length) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 bg-white/5">
        <p className="text-xs text-zinc-400">
          📊 Analytics data shown is based on the last {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}.
          Data updates in real-time from your store activity.
        </p>
      </div>
    </div>
  );
}

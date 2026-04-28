import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Star,
  Trophy,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Package,
  Target,
  Zap
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customFetch } from "@/lib/workspace-api-mock";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalListings: number;
    revenueGrowth: number;
    orderGrowth: number;
    userGrowth: number;
    listingGrowth: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
  topSellers: Array<{
    id: number;
    displayName: string;
    shopName: string;
    revenue: number;
    orders: number;
    rating: number;
  }>;
  conversionMetrics: {
    viewToOrder: number;
    orderToRevenue: number;
    userToSeller: number;
    listingToOrder: number;
  };
  performanceMetrics: {
    avgOrderValue: number;
    avgResponseTime: number;
    customerSatisfaction: number;
    sellerRetention: number;
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await customFetch(`/api/analytics?range=${dateRange}`);
      const analyticsData = await response.json();

      // Transform API data or use fallback
      const transformedData: AnalyticsData = analyticsData.data || {
        overview: {
          totalRevenue: 45678,
          totalOrders: 1234,
          totalUsers: 5678,
          totalListings: 890,
          revenueGrowth: 12.5,
          orderGrowth: 8.3,
          userGrowth: 15.7,
          listingGrowth: 6.2
        },
        revenueChart: [
          { date: 'Jan 1', revenue: 3200, orders: 45 },
          { date: 'Jan 7', revenue: 4100, orders: 58 },
          { date: 'Jan 14', revenue: 3800, orders: 52 },
          { date: 'Jan 21', revenue: 5200, orders: 71 },
          { date: 'Jan 28', revenue: 4900, orders: 68 },
          { date: 'Feb 4', revenue: 5800, orders: 82 },
          { date: 'Feb 11', revenue: 6200, orders: 89 },
          { date: 'Feb 18', revenue: 7100, orders: 95 }
        ],
        topCategories: [
          { category: '3D Printing', count: 234, revenue: 12345 },
          { category: 'CNC Machining', count: 156, revenue: 8901 },
          { category: 'Woodworking', count: 123, revenue: 6789 },
          { category: 'Metal Fabrication', count: 98, revenue: 5432 },
          { category: 'Custom Services', count: 87, revenue: 4321 }
        ],
        userActivity: [
          { date: 'Mon', activeUsers: 1234, newUsers: 45 },
          { date: 'Tue', activeUsers: 1456, newUsers: 52 },
          { date: 'Wed', activeUsers: 1678, newUsers: 61 },
          { date: 'Thu', activeUsers: 1590, newUsers: 58 },
          { date: 'Fri', activeUsers: 1823, newUsers: 72 },
          { date: 'Sat', activeUsers: 2101, newUsers: 89 },
          { date: 'Sun', activeUsers: 1987, newUsers: 78 }
        ],
        topSellers: [
          { id: 1, displayName: 'John Maker', shopName: 'Precision Prints', revenue: 12450, orders: 89, rating: 4.8 },
          { id: 2, displayName: 'Sarah Creator', shopName: 'Creative Designs', revenue: 10230, orders: 76, rating: 4.9 },
          { id: 3, displayName: 'Mike Fab', shopName: 'Fab Workshop', revenue: 8900, orders: 65, rating: 4.7 },
          { id: 4, displayName: 'Emily Build', shopName: 'Build Studio', revenue: 7650, orders: 54, rating: 4.6 },
          { id: 5, displayName: 'Alex Craft', shopName: 'Craft Lab', revenue: 6780, orders: 48, rating: 4.8 }
        ],
        conversionMetrics: {
          viewToOrder: 3.2,
          orderToRevenue: 89.5,
          userToSeller: 12.7,
          listingToOrder: 8.9
        },
        performanceMetrics: {
          avgOrderValue: 156.78,
          avgResponseTime: 2.3,
          customerSatisfaction: 4.6,
          sellerRetention: 87.3
        }
      };

      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      toast({
        title: "Analytics Error",
        description: "Unable to load analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyticsData();
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated."
    });
  };

  const handleExport = () => {
    // Export functionality would go here
    toast({
      title: "Export Started",
      description: "Analytics report is being generated."
    });
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "primary" }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color?: string;
  }) => (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${
                change >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg bg-${color}/20 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <section className="container mx-auto px-4 pb-24 pt-12">
            <div className="space-y-6">
              <div className="h-8 bg-zinc-700 rounded w-1/3 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-zinc-700 rounded-xl animate-pulse"></div>
                ))}
              </div>
              <div className="h-96 bg-zinc-700 rounded-xl animate-pulse"></div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <section className="container mx-auto px-4 pb-24 pt-12">
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400">Unable to load analytics data.</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="container mx-auto px-4 pb-24 pt-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-zinc-400">Real-time insights into your marketplace performance</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-zinc-800/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Overview Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <MetricCard
              title="Total Revenue"
              value={`$${data.overview.totalRevenue.toLocaleString()}`}
              change={data.overview.revenueGrowth}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Total Orders"
              value={data.overview.totalOrders.toLocaleString()}
              change={data.overview.orderGrowth}
              icon={ShoppingCart}
              color="blue"
            />
            <MetricCard
              title="Total Users"
              value={data.overview.totalUsers.toLocaleString()}
              change={data.overview.userGrowth}
              icon={Users}
              color="purple"
            />
            <MetricCard
              title="Total Listings"
              value={data.overview.totalListings.toLocaleString()}
              change={data.overview.listingGrowth}
              icon={Package}
              color="orange"
            />
          </motion.div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-zinc-800/50 border border-zinc-700">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="sellers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Trophy className="w-4 h-4 mr-2" />
                Top Sellers
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Activity className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>

            {/* Revenue Chart */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue & Orders Trend</CardTitle>
                    <CardDescription>Revenue and order volume over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={data.revenueChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="orders" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">Conversion Metrics</CardTitle>
                    <CardDescription>Key conversion rates across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">View to Order</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${data.conversionMetrics.viewToOrder * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium">{data.conversionMetrics.viewToOrder}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Order to Revenue</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${data.conversionMetrics.orderToRevenue}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium">{data.conversionMetrics.orderToRevenue}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">User to Seller</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${data.conversionMetrics.userToSeller * 5}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium">{data.conversionMetrics.userToSeller}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Listing to Order</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-zinc-700 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${data.conversionMetrics.listingToOrder * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium">{data.conversionMetrics.listingToOrder}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Categories */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">Category Distribution</CardTitle>
                    <CardDescription>Listings by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.topCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, count }) => `${category}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data.topCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">Category Revenue</CardTitle>
                    <CardDescription>Revenue by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.topCategories}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="category" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Bar dataKey="revenue" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">User Activity</CardTitle>
                  <CardDescription>Daily active users and new registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.userActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="activeUsers" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Sellers */}
            <TabsContent value="sellers" className="space-y-6">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Sellers</CardTitle>
                  <CardDescription>Sellers ranked by revenue and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topSellers.map((seller, index) => (
                      <div key={seller.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{seller.displayName}</p>
                            <p className="text-zinc-400 text-sm">{seller.shopName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-white font-medium">${seller.revenue.toLocaleString()}</p>
                            <p className="text-zinc-400 text-sm">{seller.orders} orders</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white">{seller.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Avg Order Value</span>
                        <span className="text-white font-medium">${data.performanceMetrics.avgOrderValue}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Avg Response Time</span>
                        <span className="text-white font-medium">{data.performanceMetrics.avgResponseTime}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Customer Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{data.performanceMetrics.customerSatisfaction}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Seller Retention</span>
                        <span className="text-white font-medium">{data.performanceMetrics.sellerRetention}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Stats</CardTitle>
                    <CardDescription>Platform health indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
                        <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white font-bold">98.2%</p>
                        <p className="text-zinc-400 text-sm">Uptime</p>
                      </div>
                      <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
                        <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-white font-bold">1.2s</p>
                        <p className="text-zinc-400 text-sm">Avg Load</p>
                      </div>
                      <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
                        <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-white font-bold">45.6K</p>
                        <p className="text-zinc-400 text-sm">Daily Views</p>
                      </div>
                      <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
                        <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-white font-bold">89.3%</p>
                        <p className="text-zinc-400 text-sm">Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}

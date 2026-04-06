import { TrendingUp, Package, Eye, Activity, DollarSign } from "lucide-react";
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

// Mock data - replace with real API calls
const generateMockData = () => {
  const days = 30;
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    // Generate realistic-looking data with some randomness
    const baseRevenue = 150 + Math.random() * 200;
    const baseOrders = 3 + Math.floor(Math.random() * 5);
    const baseViews = 100 + Math.floor(Math.random() * 300);

    data.push({
      date: dayName,
      revenue: Math.round(baseRevenue),
      orders: baseOrders,
      views: baseViews,
      conversion: Math.round((baseOrders / (baseViews / 100)) * 10) / 10,
    });
  }
  return data;
};

const topProductsData = [
  { name: "Custom Lithophane", value: 2400, revenue: 1200, orders: 8 },
  { name: "Miniature Models", value: 1398, revenue: 850, orders: 5 },
  { name: "Functional Parts", value: 980, revenue: 680, orders: 4 },
  { name: "Art Prints", value: 390, revenue: 290, orders: 2 },
];

const COLORS = ["#9fe5ff", "#a78bfa", "#ec4899", "#f59e0b"];

interface AnalyticsProps {
  shopId?: string;
  timeRange?: "7d" | "30d" | "90d";
}

export function Analytics({ shopId, timeRange = "30d" }: AnalyticsProps) {
  const mockData = generateMockData();

  const stats = [
    {
      label: "Total Revenue",
      value: "$4,850",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      label: "Orders",
      value: "127",
      change: "+8.2%",
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Shop Views",
      value: "2,843",
      change: "+23.1%",
      icon: Eye,
      color: "text-blue-400",
    },
    {
      label: "Conversion",
      value: "4.5%",
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-purple-400",
    },
  ];

  const totalRevenue = mockData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = mockData.reduce((sum, day) => sum + day.orders, 0);
  const totalViews = mockData.reduce((sum, day) => sum + day.views, 0);
  const avgConversion = ((totalOrders / (totalViews / 100)) * 10).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue}`, change: "+12.5%", Icon: DollarSign, color: "emerald" },
          { label: "Total Orders", value: totalOrders, change: "+8.2%", Icon: Package, color: "primary" },
          { label: "Shop Views", value: totalViews, change: "+23.1%", Icon: Eye, color: "blue" },
          { label: "Conversion Rate", value: `${avgConversion}%`, change: "+1.2%", Icon: Activity, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-400">{stat.label}</p>
              <stat.Icon className={`w-5 h-5 text-${stat.color === "primary" ? "primary" : stat.color}-400`} />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-xs text-emerald-400">{stat.change} from last period</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
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
            <BarChart data={mockData}>
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
            <AreaChart data={mockData}>
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
            {topProductsData.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between pb-3 border-b border-white/5 last:pb-0 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: COLORS[index] + "33", borderColor: COLORS[index] + "80", borderWidth: "1px" }} />
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-zinc-500">{product.orders} orders</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white">${product.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Rate Distribution */}
        <div className="glass-panel rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-zinc-400">Click-to-view Ratio</p>
                <p className="text-sm font-semibold text-white">28.5%</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: "28.5%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-zinc-400">View-to-order Ratio</p>
                <p className="text-sm font-semibold text-white">4.5%</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full" style={{ width: "4.5%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-zinc-400">Repeat Customer Rate</p>
                <p className="text-sm font-semibold text-white">32%</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: "32%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div className="glass-panel rounded-2xl border border-white/10 p-4 bg-white/5">
        <p className="text-xs text-zinc-400">
          📊 Analytics data shown is based on the last {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}. 
          Data updates every hour.
        </p>
      </div>
    </div>
  );
}

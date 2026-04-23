import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListOrders } from "@/lib/workspace-stub";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Receipt, TrendingUp, TrendingDown, DollarSign, Calendar, Download, Plus } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  sellerName?: string;
  items?: { name: string; price: number; quantity: number }[];
}

export function Finance() {
  const { user } = useAuth();
  const { data: ordersData, isLoading } = useListOrders();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "methods">("overview");

  const orders: Order[] = ordersData || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const filteredOrders = orders.filter((order) => {
      if (timeRange === "all") return true;
      const orderDate = new Date(order.createdAt);
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      return orderDate >= subDays(now, days);
    });

    const totalSpent = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const completedOrders = filteredOrders.filter((o) => o.status === "completed" || o.status === "paid").length;
    const pendingOrders = filteredOrders.filter((o) => o.status === "pending" || o.status === "processing").length;
    const refundedAmount = filteredOrders
      .filter((o) => o.status === "refunded")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // This month
    const startOfThisMonth = startOfMonth(now);
    const thisMonthSpent = orders
      .filter((o) => new Date(o.createdAt) >= startOfThisMonth)
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Last month comparison
    const lastMonthStart = startOfMonth(subDays(startOfThisMonth, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);
    const lastMonthSpent = orders
      .filter((o) => {
        const date = new Date(o.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const monthlyChange = lastMonthSpent > 0 ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100 : 0;

    return {
      totalSpent,
      completedOrders,
      pendingOrders,
      refundedAmount,
      thisMonthSpent,
      monthlyChange,
      orderCount: filteredOrders.length,
    };
  }, [orders, timeRange]);

  // Chart data
  const chartData = useMemo(() => {
    const data: { date: string; amount: number; orders: number }[] = [];
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 30;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "MMM dd");
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return format(orderDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
      });
      const dayAmount = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      data.push({ date: dateStr, amount: dayAmount, orders: dayOrders.length });
    }

    return data;
  }, [orders, timeRange]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [orders]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      paid: { variant: "default", label: "Paid" },
      pending: { variant: "secondary", label: "Pending" },
      processing: { variant: "secondary", label: "Processing" },
      refunded: { variant: "destructive", label: "Refunded" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Finance Overview</h2>
          <p className="text-zinc-400">Track your spending and manage payments</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? "bg-primary text-white"
                  : "border-white/10 text-zinc-400 hover:text-white"
              }
            >
              {range === "all" ? "All Time" : range.replace("d", " Days")}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Spent</p>
                <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">This Month</p>
                <p className="text-2xl font-bold text-white">${stats.thisMonthSpent.toFixed(2)}</p>
                {stats.monthlyChange !== 0 && (
                  <p className={`text-xs ${stats.monthlyChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stats.monthlyChange > 0 ? "+" : ""}
                    {stats.monthlyChange.toFixed(1)}% from last month
                  </p>
                )}
              </div>
              <div className="p-3 rounded-full bg-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Completed Orders</p>
                <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Receipt className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Pending Payments</p>
                <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/20">
                <Wallet className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "transactions", label: "Transactions", icon: Receipt },
          { id: "methods", label: "Payment Methods", icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Chart */}
          <Card className="lg:col-span-2 bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Spending Trend
              </CardTitle>
              <CardDescription>Daily spending over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#a1a1aa" }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Financial Summary</CardTitle>
              <CardDescription>Breakdown of your spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-zinc-400">Total Orders</span>
                <span className="text-white font-medium">{stats.orderCount}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-zinc-400">Average Order</span>
                <span className="text-white font-medium">
                  ${stats.orderCount > 0 ? (stats.totalSpent / stats.orderCount).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-zinc-400">Completed</span>
                <span className="text-emerald-400 font-medium">{stats.completedOrders}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-zinc-400">Pending</span>
                <span className="text-amber-400 font-medium">{stats.pendingOrders}</span>
              </div>
              {stats.refundedAmount > 0 && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-zinc-400">Refunded</span>
                  <span className="text-rose-400 font-medium">-${stats.refundedAmount.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "transactions" && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription>Your order history and payments</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-white/10 text-zinc-400 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No transactions yet</p>
                <p className="text-sm text-zinc-500 mt-1">Your order history will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Seller</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-sm text-white font-mono">#{order.id.slice(-6)}</td>
                        <td className="py-3 px-4 text-sm text-zinc-400">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-300">{order.sellerName || "Unknown"}</td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4 text-sm text-white font-medium text-right">
                          ${order.total?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "methods" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your saved payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded" />
                  <div>
                    <p className="text-white font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-zinc-500">Expires 12/25</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                  Default
                </Badge>
              </div>

              <Button variant="outline" className="w-full border-white/10 text-zinc-400 hover:text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Wallet Balance
              </CardTitle>
              <CardDescription>Your available balance for purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-zinc-400 mb-2">Available Balance</p>
                <p className="text-4xl font-bold text-white">$0.00</p>
                <p className="text-sm text-zinc-500 mt-2">Wallet feature coming soon</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

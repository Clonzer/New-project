import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  ShoppingCart,
  MessageSquare,
  Bell,
  Wrench,
  BarChart3,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Target
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListListings, 
  useListPrinters,
  useGetOrders,
  useGetMessages,
  useGetNotifications,
  useListReviews
} from "@/lib/workspace-stub";

interface StatCard {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  badge?: string;
}

const DashboardOverview = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Fetch real data
  const { data: listings } = useListListings(user?.id ? { userId: user.id } : undefined);
  const { data: printers } = useListPrinters(user?.id ? { userId: user.id } : undefined);
  const { data: orders } = useGetOrders();
  const { data: messages } = useGetMessages();
  const { data: notifications } = useGetNotifications();
  const { data: reviews } = useListReviews({ revieweeId: user?.id });

  // Calculate real statistics
  const totalListings = listings?.listings?.length || 0;
  const activeListings = listings?.listings?.filter(l => l.isActive).length || 0;
  const totalPrinters = printers?.length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
  const unreadMessages = messages?.filter(m => !m.last_read_at).length || 0;
  const unreadNotifications = notifications?.filter(n => !n.read_at).length || 0;
  const totalReviews = reviews?.reviews?.length || 0;
  const avgRating = reviews?.reviews?.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / (totalReviews || 1) || 0;

  // Calculate revenue (mock for now, would need order items)
  const totalRevenue = completedOrders * 125.50; // Mock average order value
  const monthlyRevenue = totalRevenue * 0.4; // Mock monthly proportion

  // Calculate views (mock for now, would need analytics)
  const totalViews = totalListings * 248; // Mock average views per listing

  const stats: StatCard[] = [
    {
      title: "Total Listings",
      value: totalListings,
      icon: Package,
      color: "from-blue-600 to-cyan-600",
      change: activeListings > 0 ? `+${activeListings} active` : "No active listings",
      changeType: activeListings > 0 ? 'positive' : 'neutral',
      subtitle: `${activeListings} active`
    },
    {
      title: "Equipment",
      value: totalPrinters,
      icon: Wrench,
      color: "from-purple-600 to-pink-600",
      subtitle: "Registered tools"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "from-green-600 to-emerald-600",
      change: pendingOrders > 0 ? `${pendingOrders} pending` : "No pending orders",
      changeType: pendingOrders > 0 ? 'neutral' : 'positive',
      subtitle: `${completedOrders} completed`
    },
    {
      title: "Revenue",
      value: `$${monthlyRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: "from-orange-600 to-red-600",
      change: "+12% vs last month",
      changeType: 'positive',
      subtitle: "This month"
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "from-indigo-600 to-purple-600",
      change: "+24% vs last month",
      changeType: 'positive',
      subtitle: "All time"
    },
    {
      title: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      color: "from-yellow-600 to-orange-600",
      change: `Based on ${totalReviews} reviews`,
      changeType: 'neutral',
      subtitle: "⭐".repeat(Math.round(avgRating))
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: "Create Listing",
      description: "Add a new product to your shop",
      icon: Package,
      path: "/create-listing",
      color: "bg-blue-600/20 text-blue-300 border-blue-500/30"
    },
    {
      title: "Add Equipment",
      description: "Register a new printer or tool",
      icon: Wrench,
      path: "/dashboard/shop/equipment",
      color: "bg-purple-600/20 text-purple-300 border-purple-500/30"
    },
    {
      title: "View Orders",
      description: "Manage your orders and fulfillment",
      icon: ShoppingCart,
      path: "/dashboard/orders",
      color: "bg-green-600/20 text-green-300 border-green-500/30",
      badge: pendingOrders > 0 ? pendingOrders.toString() : undefined
    },
    {
      title: "Messages",
      description: "Customer communications",
      icon: MessageSquare,
      path: "/messages",
      color: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
      badge: unreadMessages > 0 ? unreadMessages.toString() : undefined
    }
  ];

  const recentOrders = orders?.slice(0, 5).map(order => ({
    id: order.id,
    customer: order.buyer_email || 'Customer',
    amount: `$${(order.total || 0).toFixed(2)}`,
    status: order.status || 'pending',
    date: new Date(order.created_at).toLocaleDateString(),
    type: order.buyer_id === user?.id ? 'purchase' : 'sale'
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30";
      case "processing": return "bg-blue-600/20 text-blue-300 border-blue-500/30";
      case "completed": return "bg-green-600/20 text-green-300 border-green-500/30";
      case "cancelled": return "bg-red-600/20 text-red-300 border-red-500/30";
      default: return "bg-zinc-600/20 text-zinc-300 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return Clock;
      case "processing": return AlertCircle;
      case "completed": return CheckCircle;
      case "cancelled": return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
              <p className="text-zinc-400">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                7 days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30d')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                30 days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('90d')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                90 days
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <Badge className={`${stat.changeType === 'positive' ? 'bg-green-600/20 text-green-300 border-green-500/30' : stat.changeType === 'negative' ? 'bg-red-600/20 text-red-300 border-red-500/30' : 'bg-zinc-600/20 text-zinc-300 border-zinc-500/30'}`}>
                    {stat.change}
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-zinc-400 text-sm">{stat.title}</p>
              {stat.subtitle && (
                <p className="text-zinc-500 text-xs mt-1">{stat.subtitle}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={action.title} href={action.path}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:bg-zinc-800/50 cursor-pointer ${action.color}`}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-white">{action.title}</p>
                          <p className="text-sm opacity-80">{action.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.badge && (
                          <Badge className="bg-red-600/20 text-red-300 border-red-500/30">
                            {action.badge}
                          </Badge>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Recent Orders
                  </div>
                  <Link href="/dashboard/orders">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg ${getStatusColor(order.status)} flex items-center justify-center`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-white font-medium">#{order.id}</p>
                              <p className="text-zinc-400 text-sm">{order.customer} • {order.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-white font-medium">{order.amount}</p>
                              <p className="text-zinc-400 text-sm">{order.date}</p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No orders yet</p>
                    <p className="text-zinc-500 text-sm mt-2">Your orders will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Charts Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sales Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Sales chart coming soon</p>
                  <p className="text-sm mt-2">Track your revenue over time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Listing Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Views and engagement chart coming soon</p>
                  <p className="text-sm mt-2">Monitor listing performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;

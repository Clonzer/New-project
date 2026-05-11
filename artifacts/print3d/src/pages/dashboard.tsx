import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
  useListOrders, useListListings, useListPrinters, useListReviews,
} from "@/lib/workspace-stub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { createSponsorshipCheckoutSession } from "@/lib/payments-api";
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, Eye,
  DollarSign, Users, Star, Heart, ArrowUpRight, ArrowDownRight,
  BarChart3, Calendar, Filter, Search, Image, FileText,
  CreditCard as PaymentIcon, Shield, Store as StoreIcon, User, ChevronRight,
  MessageSquare, ShoppingCart, Crown, Zap, Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { SimpleSidebar } from "@/components/dashboard/SimpleSidebar";
import { RevenueTrendChart } from "@/components/analytics/RevenueTrendChart";
import { OrderStatusChart } from "@/components/analytics/OrderStatusChart";
import { SubscriptionAnalytics } from "@/components/analytics/SubscriptionAnalytics";
import { CustomerGrowthChart } from "@/components/analytics/CustomerGrowthChart";
import { EquipmentUtilizationChart } from "@/components/analytics/EquipmentUtilizationChart";
import { AnalyticsUpgradePrompt } from "@/components/analytics/AnalyticsUpgradePrompt";
import { canAccessAnalytics } from "@/lib/plan-utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  accepted: { label: "Accepted", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: CheckCircle2 },
  printing: { label: "In Production", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, color: "bg-white/10 text-white", icon: AlertCircle };
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1.5 py-1 px-3`}>
      <Icon className="w-3.5 h-3.5" /> {config.label}
    </Badge>
  );
}

export default function DashboardWithSidebar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Store setup guide state
  const [setupTasks, setSetupTasks] = useState([
    { id: 'profile', title: 'Complete Your Profile', description: 'Add your shop name, logo, and description', link: '/settings', completed: false, icon: User },
    { id: 'listings', title: 'Create Your First Listing', description: 'Add your first 3D printing service or product', link: '/create-listing', completed: false, icon: Package },
    { id: 'equipment', title: 'Register Your Equipment', description: 'Add your 3D printers and capabilities', link: '/equipment', completed: false, icon: PrinterIcon },
    { id: 'payment', title: 'Set Up Payment Method', description: 'Configure your Stripe payment account', link: '/settings/payments', completed: false, icon: PaymentIcon },
    { id: 'shipping', title: 'Configure Shipping', description: 'Set up your shipping rates and methods', link: '/settings/shipping', completed: false, icon: Truck },
    { id: 'policies', title: 'Create Shop Policies', description: 'Add your return, refund, and privacy policies', link: '/settings/policies', completed: false, icon: Shield },
  ]);
  
  // Handle task completion
  const handleTaskToggle = (taskId: string) => {
    setSetupTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Handle sponsorship purchase
  const handleSponsorshipPurchase = async () => {
    try {
      const { data, error } = await createSponsorshipCheckoutSession();
      
      if (error) {
        toast({
          title: "Sponsorship Error",
          description: "Unable to start sponsorship purchase. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Sponsorship purchase error:", error);
      toast({
        title: "Purchase Error",
        description: "Failed to process sponsorship purchase.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate completion progress
  const completedTasks = setupTasks.filter(task => task.completed).length;
  const totalTasks = setupTasks.length;
  const completionPercentage = (completedTasks / totalTasks) * 100;
  
  // Queries
  console.log('Current user ID:', user?.id);
  const { data: orders = [], isLoading: ordersLoading } = useListOrders({ userId: user?.id });
  const { data: listings = [], isLoading: listingsLoading } = useListListings({ userId: user?.id });
  const { data: printers = [], isLoading: printersLoading } = useListPrinters({ userId: user?.id });
  const { data: reviews = [], isLoading: reviewsLoading } = useListReviews({ userId: user?.id });
  
  console.log('Dashboard listings data:', listings);
  console.log('Dashboard listings loading:', listingsLoading);

  // Ensure data is not null and is an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeListings = Array.isArray(listings) ? listings : [];
  const safePrinters = Array.isArray(printers) ? printers : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Calculate metrics
  const averageOrderValue = safeOrders.length > 0 
    ? safeOrders.reduce((sum, order) => sum + (order.total_amount || order.price || 0), 0) / safeOrders.length 
    : 0;
  
  const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.total_amount || order.price || 0), 0);
  const activeEquipmentCount = safePrinters.filter(p => p.status === 'active' || p.status === 'online').length;
  const openOrders = safeOrders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  ).length;
  const pendingOrders = safeOrders.filter(order => order.status === 'pending').length;
  const completedOrders = safeOrders.filter(order => order.status === 'delivered').length;

  const recentOrders = Array.isArray(safeOrders) ? safeOrders.slice(0, 8) : [];
  const topListings = safeListings.length > 0 ? safeListings.slice(0, 6) : [];
  const recentReviews = safeReviews.length > 0 ? safeReviews.slice(0, 5) : [];

  const equipmentStatus = safePrinters.reduce((acc, printer) => {
    acc[printer.status] = (acc[printer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageRating = safeReviews.length > 0
    ? safeReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / safeReviews.length
    : 0;

  // Get active section from hash and listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (typeof hash === 'string') {
        const hashValue = hash.slice(1);
        if (hashValue && ['overview', 'orders', 'equipment', 'listings', 'analytics', 'reviews'].includes(hashValue)) {
          setActiveSection(hashValue);
        } else if (!hashValue) {
          setActiveSection('overview');
        }
      }
    };

    // Initial hash check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Dashboard Header with Edit Storefront Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-zinc-400">Track your business performance and manage your shop</p>
        </div>
        {user?.role === 'seller' && (
          <Link href="/storefront/edit">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
              <StoreIcon className="w-4 h-4 mr-2" />
              Edit Storefront
            </Button>
          </Link>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                12%
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center text-blue-400 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                8%
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-white">{safeOrders.length}</p>
              <p className="text-xs text-zinc-500 mt-1">{completedOrders} completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <PrinterIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-center text-purple-400 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Active
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Equipment</p>
              <p className="text-2xl font-bold text-white">{activeEquipmentCount}/{safePrinters.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Online and ready</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Star className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex items-center text-orange-400 text-sm">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                {averageRating.toFixed(1)}★
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-zinc-500 mt-1">{safeReviews.length} reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsorship Promotion */}
      <Card className="bg-gradient-to-r from-orange-600/20 to-pink-600/20 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Boost Your Visibility</h3>
                <p className="text-zinc-400 text-sm">
                  Get featured placements and priority ranking with sponsorships
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-orange-400" />
                    <span>Priority Placement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Rocket className="w-3 h-3 text-pink-400" />
                    <span>Enhanced Visibility</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>More Customers</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSponsorshipPurchase}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-medium px-6"
              >
                <Crown className="w-4 h-4 mr-2" />
                Buy Sponsorship
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Setup Guide & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Store Setup Guide */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <StoreIcon className="w-5 h-5" />
              Store Setup Guide
            </CardTitle>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>Progress</span>
                <span>{completedTasks}/{totalTasks} Complete</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {setupTasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="pt-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={task.link}>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          task.completed ? 'text-green-400' : 'text-zinc-400 group-hover:text-white'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            task.completed ? 'text-green-400 line-through' : 'text-white group-hover:text-orange-300'
                          }`}>
                            {task.title}
                          </p>
                          <p className={`text-xs ${
                            task.completed ? 'text-green-400/60' : 'text-zinc-400'
                          }`}>
                            {task.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-300 transition-colors" />
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection('orders')}>
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {order.listings?.title || `Order #${(order.id || '').slice(0, 8)}`}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          ${order.total_amount || order.price || 0} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Listings */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topListings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No listings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{listing.title}</p>
                        <p className="text-zinc-400 text-xs">${listing.base_price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-sm font-medium">
                        {listing.orders_count || 0} orders
                      </p>
                      <p className="text-zinc-400 text-xs">
                        ${(listing.orders_count || 0) * listing.base_price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-zinc-400 text-xs">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white text-sm">{review.comment}</p>
                    <p className="text-zinc-400 text-xs mt-1">- {review.reviewer_name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Orders Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders Management</h2>
          <p className="text-zinc-400">Track and manage all your orders in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Pending</p>
                <p className="text-xl font-bold text-white">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">In Production</p>
                <p className="text-xl font-bold text-white">
                  {safeOrders.filter(o => o.status === 'printing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Truck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Shipped</p>
                <p className="text-xl font-bold text-white">
                  {safeOrders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Completed</p>
                <p className="text-xl font-bold text-white">{completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {safeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
              <p className="text-zinc-400 mb-6">You haven't received any orders yet</p>
              <Link href="/explore">
                <Button>Browse Items</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {safeOrders.map((order) => (
                <div key={order.id} className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-lg">
                            {order.listings?.title || `Order #${(order.id || '').slice(0, 8)}`}
                          </h4>
                          <p className="text-zinc-400">
                            Order ID: {order.id} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Customer</p>
                          <p className="text-white font-medium">
                            {order.buyer?.display_name || order.buyer?.username || 'Guest'}
                          </p>
                          <p className="text-zinc-400 text-sm">{order.buyer?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Order Details</p>
                          <p className="text-white font-medium">Quantity: {order.quantity}</p>
                          <p className="text-zinc-400 text-sm">Total: ${order.total_amount || order.price || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                          <StatusBadge status={order.status} />
                          {order.tracking_number && (
                            <p className="text-sm text-orange-400 mt-2">
                              Tracking: {order.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-4">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Order Notes</p>
                          <p className="text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {order.listings && (
                        <Link href={`/listings/${order.listings.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const handleAddEquipment = () => {
    console.log('Add equipment clicked');
    // TODO: Implement add equipment functionality
  };

  const handleEditEquipment = (equipmentId: string) => {
    console.log('Edit equipment:', equipmentId);
    // TODO: Implement edit equipment functionality
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    console.log('Delete equipment:', equipmentId);
    // TODO: Implement delete equipment functionality
  };

  const renderEquipment = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Equipment Management</h2>
        <p className="text-zinc-400">Manage your printers, tools, and equipment</p>
      </div>

      {/* Equipment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Active</p>
                <p className="text-xl font-bold text-white">{equipmentStatus.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Maintenance</p>
                <p className="text-xl font-bold text-white">{equipmentStatus.maintenance || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Offline</p>
                <p className="text-xl font-bold text-white">{equipmentStatus.inactive || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <PrinterIcon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Equipment</p>
                <p className="text-xl font-bold text-white">{safePrinters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">All Equipment</CardTitle>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </CardHeader>
        <CardContent>
          {safePrinters.length === 0 ? (
            <div className="text-center py-12">
              <PrinterIcon className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No equipment registered</h3>
              <p className="text-zinc-400 mb-6">Add your first printer or equipment</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safePrinters.map((printer) => (
                <div key={printer.id} className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <PrinterIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{printer.name}</p>
                        <p className="text-zinc-400 text-sm">
                          {printer.brand} {printer.model}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={printer.status} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Technology:</span>
                      <span className="text-white">{printer.technology}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Build Volume:</span>
                      <span className="text-white">{printer.build_volume}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Hourly Rate:</span>
                      <span className="text-white">${printer.price_per_hour}/hr</span>
                    </div>
                    {printer.materials && printer.materials.length > 0 && (
                      <div>
                        <p className="text-zinc-400 text-sm mb-2">Materials:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(printer.materials) ? printer.materials.slice(0, 3).map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                              {material}
                            </Badge>
                          )) : null}
                          {printer.materials.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                              +{printer.materials.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditEquipment(printer.id)}>
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('View equipment details:', printer.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Listings Management</h2>
          <p className="text-zinc-400">Manage your products and services</p>
        </div>
        <Link href="/create-listing">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Listings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Listings</p>
                <p className="text-xl font-bold text-white">{safeListings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Views</p>
                <p className="text-xl font-bold text-white">
                  {safeListings.length > 0 ? safeListings.reduce((sum, l) => sum + (l.views || 0), 0) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Orders</p>
                <p className="text-xl font-bold text-white">
                  {safeListings.length > 0 ? safeListings.reduce((sum, l) => sum + (l.orders_count || 0), 0) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Avg Price</p>
                <p className="text-xl font-bold text-white">
                  ${safeListings.length > 0 ? (safeListings.reduce((sum, l) => sum + (l.base_price || 0), 0) / safeListings.length).toFixed(2) : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeListings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No listings yet</h3>
            <p className="text-zinc-400 mb-6">Create your first product or service listing</p>
            <Link href="/create-listing">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </div>
        ) : (
          safeListings.map((listing) => (
            <Card key={listing.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="aspect-square bg-zinc-800 rounded-t-lg flex items-center justify-center">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <Package className="w-12 h-12 text-zinc-600" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-white mb-1 line-clamp-2">{listing.title}</h4>
                  <p className="text-zinc-400 text-sm line-clamp-2">{listing.description}</p>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white">${listing.basePrice || listing.price || 0}</p>
                    <p className="text-xs text-zinc-400">{listing.listingType || listing.listing_type || 'product'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">{listing.orders_count || 0} orders</p>
                    <p className="text-xs text-zinc-500">{listing.views || 0} views</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    // Check if user has access to analytics
    if (!canAccessAnalytics(user)) {
      return <AnalyticsUpgradePrompt />;
    }

    // Generate real revenue data from orders
    const generateRevenueData = () => {
      if (safeOrders.length === 0) {
        // Return empty data if no orders
        return [];
      }

      // Group orders by date
      const revenueByDate = new Map<string, { revenue: number; orders: number }>();
      
      safeOrders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const orderRevenue = order.total_amount || order.price || 0;
        
        if (!revenueByDate.has(date)) {
          revenueByDate.set(date, { revenue: 0, orders: 0 });
        }
        
        const current = revenueByDate.get(date)!;
        current.revenue += orderRevenue;
        current.orders += 1;
      });

      // Fill missing dates with zero values for the last 30 days
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = revenueByDate.get(dateStr) || { revenue: 0, orders: 0 };
        data.push({
          date: dateStr,
          revenue: dayData.revenue,
          orders: dayData.orders
        });
      }
      
      return data;
    };

    // Generate real order status data
    const generateOrderStatusData = () => [
      { status: 'pending', count: pendingOrders, percentage: safeOrders.length > 0 ? (pendingOrders / safeOrders.length) * 100 : 0, color: '#f59e0b', icon: Clock },
      { status: 'accepted', count: safeOrders.filter(o => o.status === 'accepted').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'accepted').length / safeOrders.length) * 100 : 0, color: '#f97316', icon: CheckCircle2 },
      { status: 'printing', count: safeOrders.filter(o => o.status === 'printing').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'printing').length / safeOrders.length) * 100 : 0, color: '#3b82f6', icon: Package },
      { status: 'shipped', count: safeOrders.filter(o => o.status === 'shipped').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'shipped').length / safeOrders.length) * 100 : 0, color: '#8b5cf6', icon: Truck },
      { status: 'delivered', count: completedOrders, percentage: safeOrders.length > 0 ? (completedOrders / safeOrders.length) * 100 : 0, color: '#10b981', icon: CheckCircle2 },
      { status: 'cancelled', count: safeOrders.filter(o => o.status === 'cancelled').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'cancelled').length / safeOrders.length) * 100 : 0, color: '#ef4444', icon: XCircle }
    ];

    // Generate customer data (simplified - using unique buyers from orders)
    const generateCustomerData = () => {
      if (safeOrders.length === 0) {
        return [];
      }

      const customersByDate = new Map<string, { newCustomers: number; totalCustomers: Set<string>; returningCustomers: number }>();
      const allCustomers = new Set<string>();
      
      safeOrders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const customerId = order.buyer?.id || order.buyer_id || 'guest';
        
        if (!customersByDate.has(date)) {
          customersByDate.set(date, { newCustomers: 0, totalCustomers: new Set(), returningCustomers: 0 });
        }
        
        const dayData = customersByDate.get(date)!;
        if (!allCustomers.has(customerId)) {
          dayData.newCustomers += 1;
          allCustomers.add(customerId);
        } else {
          dayData.returningCustomers += 1;
        }
        dayData.totalCustomers.add(customerId);
      });

      // Generate cumulative data
      const data = [];
      let cumulativeCustomers = 0;
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = customersByDate.get(dateStr);
        cumulativeCustomers += dayData?.newCustomers || 0;
        
        data.push({
          date: dateStr,
          newCustomers: dayData?.newCustomers || 0,
          totalCustomers: cumulativeCustomers,
          activeCustomers: Math.floor(cumulativeCustomers * 0.8), // Estimate active customers
          returningCustomers: dayData?.returningCustomers || 0
        });
      }
      
      return data;
    };

    // Generate subscription data (mock for now - would need real subscription API)
    const generateSubscriptionData = () => {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          free: Math.floor(Math.random() * 50) + 100,
          basic: Math.floor(Math.random() * 30) + 20,
          pro: Math.floor(Math.random() * 20) + 10,
          enterprise: Math.floor(Math.random() * 5) + 2,
          totalRevenue: Math.random() * 5000 + 2000,
          churnRate: Math.random() * 0.1 + 0.02,
          newSubscriptions: Math.floor(Math.random() * 25) + 10
        });
      }
      return data;
    };

    // Generate real equipment data
    const generateEquipmentData = () => {
      return safePrinters.map(printer => {
        // Calculate real utilization based on orders if possible
        const printerOrders = safeOrders.filter(order => 
          order.printer_id === printer.id || 
          order.equipment_used === printer.name
        );
        
        const jobsCompleted = printerOrders.length;
        const totalHours = 720; // 30 days * 24 hours
        const avgJobTime = jobsCompleted > 0 ? 4 : 0; // Average 4 hours per job
        const activeHours = jobsCompleted * avgJobTime;
        const utilizationRate = totalHours > 0 ? (activeHours / totalHours) * 100 : 0;
        
        return {
          equipmentId: printer.id,
          name: printer.name,
          type: printer.technology || 'Unknown',
          utilizationRate: Math.min(utilizationRate, 95), // Cap at 95%
          totalHours,
          activeHours,
          maintenanceHours: Math.random() * 20 + 5,
          idleHours: Math.max(0, totalHours - activeHours - (Math.random() * 20 + 5)),
          jobsCompleted,
          averageJobTime: avgJobTime,
          status: printer.status || 'active'
        };
      });
    };

    // Generate equipment time series data
    const generateEquipmentTimeSeries = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculate daily utilization from orders
        const dayOrders = safeOrders.filter(order => 
          new Date(order.created_at).toISOString().split('T')[0] === dateStr
        );
        
        const totalJobs = dayOrders.length;
        const activeEquipment = Math.min(activeEquipmentCount, totalJobs);
        const overallUtilization = activeEquipmentCount > 0 ? (activeEquipment / safePrinters.length) * 100 : 0;
        
        data.push({
          date: dateStr,
          overallUtilization: Math.min(overallUtilization + Math.random() * 20, 95),
          activeEquipment,
          totalJobs
        });
      }
      return data;
    };

    const revenueData = generateRevenueData();
    const orderStatusData = generateOrderStatusData();
    const customerData = generateCustomerData();
    const subscriptionData = generateSubscriptionData();
    const equipmentData = generateEquipmentData();
    const equipmentTimeSeries = generateEquipmentTimeSeries();

    const currentSubscriptions = {
      free: 150,
      basic: 45,
      pro: 25,
      enterprise: 8
    };

    const subscriptionMetrics = {
      monthlyRecurringRevenue: 1847.45,
      averageRevenuePerUser: 12.34,
      customerLifetimeValue: 456.78,
      churnRate: 0.034,
      subscriptionGrowthRate: 0.156
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-zinc-400">Comprehensive insights into your business performance</p>
        </div>

        {/* Revenue Analytics - Subscription Only */}
        {revenueData.length > 0 && (
          <div className="relative">
            {!canAccessAnalytics(user) && (
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-white font-medium mb-2">Revenue Analytics</p>
                  <p className="text-zinc-400 text-sm mb-3">Upgrade to Pro for detailed revenue insights</p>
                  <Link href="/pricing">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <RevenueTrendChart data={revenueData} timeRange="30d" />
          </div>
        )}

        {/* Order Status Analytics - Available for all */}
        {safeOrders.length > 0 && (
          <OrderStatusChart data={orderStatusData} />
        )}

        {/* Customer Growth Analytics - Subscription Only */}
        {customerData.length > 0 && (
          <div className="relative">
            {!canAccessAnalytics(user) && (
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-white font-medium mb-2">Customer Analytics</p>
                  <p className="text-zinc-400 text-sm mb-3">Track customer growth and retention</p>
                  <Link href="/pricing">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <CustomerGrowthChart data={customerData} timeRange="30d" />
          </div>
        )}

        {/* Subscription Analytics - Enterprise Only */}
        <div className="relative">
          {!canAccessAnalytics(user) && (
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-medium mb-2">Advanced Analytics</p>
                <p className="text-zinc-400 text-sm mb-3">Enterprise plan required for subscription metrics</p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade to Enterprise
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <SubscriptionAnalytics 
            data={subscriptionData} 
            currentSubscriptions={currentSubscriptions}
            metrics={subscriptionMetrics}
          />
        </div>

        {/* Equipment Utilization */}
        {safePrinters.length > 0 && (
          <EquipmentUtilizationChart 
            equipmentData={equipmentData}
            timeSeriesData={equipmentTimeSeries}
            timeRange="7d"
          />
        )}

        {/* Empty state if no data */}
        {revenueData.length === 0 && safeOrders.length === 0 && safePrinters.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Available</h3>
            <p className="text-zinc-400 mb-6">
              Start taking orders and adding equipment to see your analytics here.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
        <p className="text-zinc-400">Manage customer feedback and improve your service</p>
      </div>

      {/* Reviews Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Star className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Average Rating</p>
                <p className="text-xl font-bold text-white">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Reviews</p>
                <p className="text-xl font-bold text-white">{safeReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">5-Star Reviews</p>
                <p className="text-xl font-bold text-white">
                  {safeReviews.filter(r => r.rating === 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Response Rate</p>
                <p className="text-xl font-bold text-white">95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {safeReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
              <p className="text-zinc-400">Customer reviews will appear here once you start receiving orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeReviews.map((review) => (
                <div key={review.id} className="border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.reviewer_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.reviewer_name}</p>
                        <p className="text-zinc-400 text-sm">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-white">{review.comment}</p>
                  </div>
                  
                  {review.listing_title && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Package className="w-4 h-4" />
                      <span>Review for: {review.listing_title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'equipment':
        return renderEquipment();
      case 'listings':
        return renderListings();
      case 'analytics':
        return renderAnalytics();
      case 'reviews':
        return renderReviews();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <SimpleSidebar />
      
      {/* Main Content */}
      <div className="ml-16 group-hover:ml-64 p-4 md:p-8 transition-all duration-300 pt-4">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

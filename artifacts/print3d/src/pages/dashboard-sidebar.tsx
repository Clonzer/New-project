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
import { Link } from "wouter";
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, Eye,
  DollarSign, Users, Star, Heart, ArrowUpRight, ArrowDownRight,
  BarChart3, Calendar, Filter, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { SimpleSidebar } from "@/components/dashboard/SimpleSidebar";

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
  
  // Queries
  const { data: orders = [], isLoading: ordersLoading } = useListOrders({ userId: user?.id });
  const { data: listings = [], isLoading: listingsLoading } = useListListings({ userId: user?.id });
  const { data: printers = [], isLoading: printersLoading } = useListPrinters({ userId: user?.id });
  const { data: reviews = [], isLoading: reviewsLoading } = useListReviews({ userId: user?.id });

  // Ensure data is not null
  const safeOrders = orders || [];
  const safeListings = listings || [];
  const safePrinters = printers || [];
  const safeReviews = reviews || [];

  // Calculate metrics
  const averageOrderValue = safeOrders.length > 0 
    ? safeOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / safeOrders.length 
    : 0;
  
  const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const activeEquipmentCount = safePrinters.filter(p => p.status === 'active').length;
  const openOrders = safeOrders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  ).length;
  const pendingOrders = safeOrders.filter(order => order.status === 'pending').length;
  const completedOrders = safeOrders.filter(order => order.status === 'delivered').length;

  const recentOrders = safeOrders.slice(0, 8);
  const topListings = safeListings.slice(0, 6);
  const recentReviews = safeReviews.slice(0, 5);

  const equipmentStatus = safePrinters.reduce((acc, printer) => {
    acc[printer.status] = (acc[printer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageRating = safeReviews.length > 0
    ? safeReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / safeReviews.length
    : 0;

  // Get active section from hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ['overview', 'orders', 'equipment', 'listings', 'analytics', 'reviews'].includes(hash)) {
      setActiveSection(hash);
    }
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/create-listing">
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
            </Link>
            <Button className="w-full justify-start" variant="outline">
              <PrinterIcon className="w-4 h-4 mr-2" />
              Register Equipment
            </Button>
            <Link href="/settings">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Shop Settings
              </Button>
            </Link>
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
                          {order.listings?.title || `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          ${order.total_amount} • {new Date(order.created_at).toLocaleDateString()}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            {order.listings?.title || `Order #${order.id.slice(0, 8)}`}
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
                          <p className="text-zinc-400 text-sm">Total: ${order.total_amount}</p>
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
                        <h4 className="font-semibold text-white">{printer.name}</h4>
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
                          {printer.materials.slice(0, 3).map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                              {material}
                            </Badge>
                          ))}
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
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
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
                  {safeListings.reduce((sum, l) => sum + (l.views || 0), 0)}
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
                  {safeListings.reduce((sum, l) => sum + (l.orders_count || 0), 0)}
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
                  ${safeListings.length > 0 ? (safeListings.reduce((sum, l) => sum + l.base_price, 0) / safeListings.length).toFixed(2) : '0'}
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
                    <p className="text-lg font-bold text-white">${listing.base_price}</p>
                    <p className="text-xs text-zinc-400">{listing.listing_type}</p>
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

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <p className="text-zinc-400">Track your performance and gain insights</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Revenue</span>
                <span className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Average Order Value</span>
                <span className="text-xl font-bold text-white">${averageOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total Orders</span>
                <span className="text-xl font-bold text-white">{safeOrders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Completion Rate</span>
                <span className="text-xl font-bold text-white">
                  {safeOrders.length > 0 ? Math.round((completedOrders / safeOrders.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-400">Order Completion</span>
                  <span className="text-sm text-white">
                    {safeOrders.length > 0 ? Math.round((completedOrders / safeOrders.length) * 100) : 0}%
                  </span>
                </div>
                <Progress value={safeOrders.length > 0 ? (completedOrders / safeOrders.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-400">Equipment Utilization</span>
                  <span className="text-sm text-white">
                    {safePrinters.length > 0 ? Math.round((activeEquipmentCount / safePrinters.length) * 100) : 0}%
                  </span>
                </div>
                <Progress value={safePrinters.length > 0 ? (activeEquipmentCount / safePrinters.length) * 100 : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-400">Customer Satisfaction</span>
                  <span className="text-sm text-white">{averageRating.toFixed(1)}/5.0</span>
                </div>
                <Progress value={(averageRating / 5) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topListings.slice(0, 5).map((listing, index) => (
              <div key={listing.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{listing.title}</p>
                    <p className="text-zinc-400 text-sm">${listing.base_price} • {listing.orders_count || 0} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">
                    ${((listing.orders_count || 0) * listing.base_price).toFixed(2)}
                  </p>
                  <p className="text-zinc-400 text-xs">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
      <div className="ml-20 p-6">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

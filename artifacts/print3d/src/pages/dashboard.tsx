import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
  useListOrders, useListListings, useListPrinters,
} from "@/lib/workspace-stub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'equipment'>('overview');
  
  // Queries
  const { data: orders = [], isLoading: ordersLoading } = useListOrders({ userId: user?.id });
  const { data: listings = [], isLoading: listingsLoading } = useListListings({ userId: user?.id });
  const { data: printers = [], isLoading: printersLoading } = useListPrinters({ userId: user?.id });

  // Ensure data is not null
  const safeOrders = orders || [];
  const safeListings = listings || [];
  const safePrinters = printers || [];

  // Calculate metrics
  const averageOrderValue = safeOrders.length > 0 
    ? safeOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / safeOrders.length 
    : 0;
  
  const activeEquipmentCount = safePrinters.filter(p => p.status === 'active').length;
  const openOrders = safeOrders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  ).length;
  const pendingOrders = safeOrders.filter(order => order.status === 'pending').length;

  const recentOrders = safeOrders.slice(0, 5);

  const equipmentStatus = safePrinters.reduce((acc, printer) => {
    acc[printer.status] = (acc[printer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Manage your shop and track your business</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-xl w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'equipment', label: 'Equipment', icon: PrinterIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Avg Order Value</span>
                  </div>
                  <p className="text-2xl font-bold text-white">${averageOrderValue.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <PrinterIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Active Equipment</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{activeEquipmentCount}</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Package className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Catalog Items</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{safeListings.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Open Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{openOrders}</p>
                  {pendingOrders > 0 && (
                    <p className="text-xs text-yellow-400 mt-1">{pendingOrders} pending</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/create-listing">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
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

            {/* Recent Orders Preview */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                  <Eye className="w-4 h-4 mr-1" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-zinc-400 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
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
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Orders</CardTitle>
              <p className="text-zinc-400 text-sm">Manage your orders and track shipments</p>
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
                    <div key={order.id} className="border border-zinc-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">
                                {order.listings?.title || `Order #${order.id.slice(0, 8)}`}
                              </h4>
                              <p className="text-sm text-zinc-400">
                                Qty: {order.quantity} • Total: ${order.total_amount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusBadge status={order.status} />
                            <p className="text-sm text-zinc-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            {order.tracking_number && (
                              <p className="text-sm text-orange-400">
                                Tracking: {order.tracking_number}
                              </p>
                            )}
                          </div>
                        </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Equipment</CardTitle>
              <p className="text-zinc-400 text-sm">Manage your printers and equipment</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{equipmentStatus.active || 0}</p>
                  <p className="text-sm text-zinc-400">Active</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">{equipmentStatus.maintenance || 0}</p>
                  <p className="text-sm text-zinc-400">Maintenance</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{equipmentStatus.inactive || 0}</p>
                  <p className="text-sm text-zinc-400">Inactive</p>
                </div>
              </div>

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
                <div className="space-y-4">
                  {safePrinters.map((printer) => (
                    <div key={printer.id} className="border border-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <PrinterIcon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{printer.name}</h4>
                            <p className="text-sm text-zinc-400">
                              {printer.brand} {printer.model}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={printer.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

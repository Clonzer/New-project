import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Package, 
  TrendingUp, 
  Edit, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useGetOrders } from "@/lib/workspace-stub";

const OrdersAndSales = () => {
  const { user } = useAuth();
  const { data: orders } = useGetOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculate real order statistics
  const purchaseOrders = orders?.filter(o => o.buyer_id === user?.id) || [];
  const salesOrders = orders?.filter(o => o.seller_id === user?.id) || [];
  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const processingOrders = orders?.filter(o => o.status === 'processing') || [];
  const completedOrders = orders?.filter(o => o.status === 'completed') || [];
  const totalRevenue = salesOrders.reduce((acc, order) => acc + (order.total || 0), 0);
  const avgOrderValue = salesOrders.length > 0 ? totalRevenue / salesOrders.length : 0;

  const sections = [
    {
      id: "orders",
      title: "Purchase Orders",
      description: "Orders you've placed",
      icon: Package,
      path: "/dashboard/orders",
      count: purchaseOrders.length,
      color: "bg-blue-600/20 text-blue-300 border-blue-500/30",
      stats: {
        pending: pendingOrders.filter(o => o.buyer_id === user?.id).length,
        processing: processingOrders.filter(o => o.buyer_id === user?.id).length,
        completed: completedOrders.filter(o => o.buyer_id === user?.id).length
      }
    },
    {
      id: "sales",
      title: "Sales",
      description: "Orders you've fulfilled",
      icon: TrendingUp,
      path: "/dashboard/sales",
      count: salesOrders.length,
      color: "bg-green-600/20 text-green-300 border-green-500/30",
      stats: {
        revenue: `$${totalRevenue.toFixed(2)}`,
        orders: salesOrders.length,
        avgOrder: `$${avgOrderValue.toFixed(2)}`
      }
    },
    {
      id: "pending",
      title: "Pending Actions",
      description: "Orders requiring your attention",
      icon: Clock,
      path: "/dashboard/orders?filter=pending",
      count: pendingOrders.length,
      color: "bg-orange-600/20 text-orange-300 border-orange-500/30",
      stats: {
        pending: pendingOrders.length,
        processing: processingOrders.length,
        completed: completedOrders.length
      }
    }
  ];

  // Use real recent orders data
  const recentOrders = orders?.slice(0, 5).map(order => ({
    id: order.id,
    customer: order.buyer_email || (order.buyer_id === user?.id ? 'You' : 'Customer'),
    product: order.listing_title || 'Order Item',
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
      case "cancelled": return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pl-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Orders & Sales</h1>
          <p className="text-zinc-400">Manage your orders, track sales, and handle custom requests</p>
        </motion.div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="text-zinc-400 text-sm">{section.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {section.count}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(section.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-white font-medium text-sm">{value}</p>
                    <p className="text-zinc-500 text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>

              <Link href={section.path}>
                <a className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                  <span className="text-sm">Manage</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order, index) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg ${getStatusColor(order.status)} flex items-center justify-center`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.id}</p>
                      <p className="text-zinc-400 text-sm">{order.customer} • {order.product}</p>
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
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              View All Orders
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrdersAndSales;

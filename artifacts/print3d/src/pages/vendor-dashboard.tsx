import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Users, 
  TrendingUp, 
  Printer, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  BarChart3,
  ShoppingCart,
  Settings,
  ChevronDown,
  ChevronUp,
  Printer as PrinterIcon,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Box,
  Wrench,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  FileText,
  CreditCard,
  Calendar,
  DollarSign,
  Sparkles
} from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

// Types
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
  }[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shippingCost: number;
  createdAt: string;
  trackingNumber?: string;
}

interface Equipment {
  id: string;
  name: string;
  model: string;
  status: "operational" | "maintenance" | "out-of-service";
  lastMaintenance: string;
  nextMaintenance: string;
  totalPrints: number;
  uptime: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  maxStock: number;
  cost: number;
  supplier: string;
  lastRestocked: string;
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  conversionRate: number;
  avgOrderValue: number;
  topProducts: { name: string; sales: number; revenue: number }[];
  revenueByDay: { date: string; amount: number }[];
}

// Mock Data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street",
      city: "San Francisco",
      postalCode: "94102",
      country: "USA"
    },
    items: [
      { id: "1", name: "Custom Phone Stand", quantity: 2, price: 25.00, imageUrl: "https://placehold.co/100x100" },
      { id: "2", name: "Desk Organizer", quantity: 1, price: 45.00, imageUrl: "https://placehold.co/100x100" }
    ],
    status: "processing",
    total: 95.00,
    shippingCost: 12.00,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Avenue",
      city: "Austin",
      postalCode: "78701",
      country: "USA"
    },
    items: [
      { id: "3", name: "Architectural Model", quantity: 1, price: 150.00, imageUrl: "https://placehold.co/100x100" }
    ],
    status: "pending",
    total: 150.00,
    shippingCost: 18.00,
    createdAt: "2024-01-16"
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Mike Wilson",
      email: "mike@example.com",
      phone: "+1 (555) 456-7890",
      address: "789 Pine Road",
      city: "Portland",
      postalCode: "97201",
      country: "USA"
    },
    items: [
      { id: "4", name: "Prototype Part Set", quantity: 5, price: 35.00, imageUrl: "https://placehold.co/100x100" }
    ],
    status: "shipped",
    total: 175.00,
    shippingCost: 15.00,
    trackingNumber: "1Z999AA1234567890",
    createdAt: "2024-01-14"
  }
];

const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "Printer 01",
    model: "Prusa i3 MK3S+",
    status: "operational",
    lastMaintenance: "2024-01-01",
    nextMaintenance: "2024-02-01",
    totalPrints: 1250,
    uptime: 98.5
  },
  {
    id: "2",
    name: "Printer 02",
    model: "Bambu Lab X1C",
    status: "maintenance",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-01-17",
    totalPrints: 890,
    uptime: 95.2
  },
  {
    id: "3",
    name: "Resin Printer",
    model: "Anycubic Photon M3",
    status: "out-of-service",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-01-20",
    totalPrints: 450,
    uptime: 87.3
  }
];

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "PLA Filament - Black",
    sku: "FIL-PLA-BLK-001",
    stock: 15,
    minStock: 5,
    maxStock: 50,
    cost: 22.99,
    supplier: "Prusa Research",
    lastRestocked: "2024-01-10"
  },
  {
    id: "2",
    name: "PETG Filament - Clear",
    sku: "FIL-PETG-CLR-002",
    stock: 3,
    minStock: 5,
    maxStock: 40,
    cost: 24.99,
    supplier: "Prusa Research",
    lastRestocked: "2024-01-05"
  },
  {
    id: "3",
    name: "Resin - Standard Grey",
    sku: "RES-STD-GRY-001",
    stock: 8,
    minStock: 3,
    maxStock: 30,
    cost: 29.99,
    supplier: "Anycubic",
    lastRestocked: "2024-01-12"
  }
];

const mockAnalytics: Analytics = {
  totalRevenue: 45280,
  totalOrders: 156,
  totalViews: 8934,
  conversionRate: 1.74,
  avgOrderValue: 290,
  topProducts: [
    { name: "Custom Phone Stand", sales: 45, revenue: 1125 },
    { name: "Architectural Model", sales: 23, revenue: 3450 },
    { name: "Desk Organizer", sales: 38, revenue: 1710 }
  ],
  revenueByDay: [
    { date: "Mon", amount: 1200 },
    { date: "Tue", amount: 1800 },
    { date: "Wed", amount: 1400 },
    { date: "Thu", amount: 2200 },
    { date: "Fri", amount: 1900 },
    { date: "Sat", amount: 2800 },
    { date: "Sun", amount: 1600 }
  ]
};

type TabType = "orders" | "inventory" | "equipment" | "analytics" | "customers" | "sponsorship";

export function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [searchQuery, setSearchQuery] = useState("");

  const generateShippingLabel = (order: Order) => {
    // In real implementation, this would generate a PDF
    const labelData = {
      from: {
        name: "Your Shop Name",
        address: "Your Shop Address",
        city: "Your City",
        state: "ST",
        zip: "12345"
      },
      to: {
        name: order.customer.name,
        address: order.customer.address,
        city: order.customer.city,
        state: "ST",
        zip: order.customer.postalCode
      },
      weight: "2 lbs",
      tracking: order.trackingNumber || `1Z${Math.random().toString(36).substring(7).toUpperCase()}`,
      orderNumber: order.orderNumber
    };
    
    alert(`Shipping label generated for ${order.orderNumber}\n\nTracking: ${labelData.tracking}\n\nIn production, this would download a PDF.`);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    // In real implementation, this would update via API
    alert(`Order ${orderId} status updated to ${newStatus}`);
  };

  const updateStock = (itemId: string, delta: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, stock: Math.max(0, item.stock + delta) } : item
    ));
  };

  const updateEquipmentStatus = (equipmentId: string, newStatus: Equipment["status"]) => {
    setEquipment(prev => prev.map(eq => 
      eq.id === equipmentId ? { ...eq, status: newStatus } : eq
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "delivered":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "processing":
      case "maintenance":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "pending":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "out-of-service":
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "shipped":
        return "text-purple-400 bg-purple-400/10 border-purple-400/30";
      default:
        return "text-zinc-400 bg-zinc-400/10 border-zinc-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
      case "maintenance":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "out-of-service":
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "shipped":
        return <Package className="w-4 h-4" />;
      default:
        return <Box className="w-4 h-4" />;
    }
  };

  const filteredOrders = mockOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Vendor Dashboard</h1>
              <p className="text-zinc-400">Manage your shop, orders, and inventory</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-zinc-400 text-sm">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-400">${mockAnalytics.revenueByDay[6].amount.toLocaleString()}</p>
              </div>
              <NeonButton className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-full">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </NeonButton>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-zinc-900/30 border-b border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: "orders", label: "Orders", icon: ShoppingCart, count: mockOrders.filter(o => o.status === "pending").length },
              { id: "inventory", label: "Inventory", icon: Box, count: inventory.filter(i => i.stock <= i.minStock).length },
              { id: "equipment", label: "Equipment", icon: PrinterIcon, count: equipment.filter(e => e.status !== "operational").length },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "customers", label: "Customers", icon: Users },
              { id: "sponsorship", label: "Sponsorship", icon: Sparkles }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    tab.id === "orders" ? "bg-red-500/20 text-red-400" :
                    tab.id === "inventory" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-orange-500/20 text-orange-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: mockOrders.length, icon: ShoppingCart, color: "cyan" },
                  { label: "Pending", value: mockOrders.filter(o => o.status === "pending").length, icon: Clock, color: "yellow" },
                  { label: "Processing", value: mockOrders.filter(o => o.status === "processing").length, icon: Package, color: "blue" },
                  { label: "Shipped", value: mockOrders.filter(o => o.status === "shipped").length, icon: CheckCircle, color: "green" }
                ].map((stat, index) => (
                  <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                      </div>
                      <span className="text-zinc-400 text-sm">{stat.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Search & Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search orders by number or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
                  >
                    {/* Order Header */}
                    <div
                      className="p-6 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <Package className="w-6 h-6 text-zinc-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-white">{order.orderNumber}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm mt-1">{order.customer.name} • {order.items.length} items • ${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 text-sm">{order.createdAt}</span>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-5 h-5 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-zinc-800"
                        >
                          <div className="p-6 grid grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-400" />
                                Customer Information
                              </h4>
                              <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                    {order.customer.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{order.customer.name}</p>
                                    <p className="text-zinc-400 text-sm">{order.customer.email}</p>
                                  </div>
                                </div>
                                <div className="pt-3 border-t border-zinc-700 space-y-2">
                                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                    <Phone className="w-4 h-4" />
                                    {order.customer.phone}
                                  </div>
                                  <div className="flex items-start gap-2 text-zinc-400 text-sm">
                                    <MapPin className="w-4 h-4 mt-0.5" />
                                    <span>
                                      {order.customer.address}<br />
                                      {order.customer.city}, {order.customer.postalCode}<br />
                                      {order.customer.country}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping Label Button */}
                              <button
                                onClick={() => generateShippingLabel(order)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                              >
                                <PrinterIcon className="w-5 h-5" />
                                <span className="font-medium">Print Shipping Label</span>
                              </button>
                            </div>

                            {/* Order Items & Actions */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-white flex items-center gap-2">
                                <Box className="w-4 h-4 text-purple-400" />
                                Order Items
                              </h4>
                              <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                    <div className="flex-1">
                                      <p className="text-white text-sm font-medium">{item.name}</p>
                                      <p className="text-zinc-400 text-xs">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="text-white font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                                  </div>
                                ))}
                                <div className="pt-3 border-t border-zinc-700 flex justify-between">
                                  <span className="text-zinc-400">Shipping</span>
                                  <span className="text-white">${order.shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                  <span className="text-white">Total</span>
                                  <span className="text-green-400">${order.total.toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Status Actions */}
                              <div className="flex gap-2">
                                {order.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => updateOrderStatus(order.id, "processing")}
                                      className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                                    >
                                      Accept Order
                                    </button>
                                    <button
                                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                                      className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {order.status === "processing" && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "shipped")}
                                    className="w-full px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
                                  >
                                    Mark as Shipped
                                  </button>
                                )}
                                {order.status === "shipped" && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "delivered")}
                                    className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                                  >
                                    Mark as Delivered
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Total Items</p>
                  <p className="text-3xl font-bold text-white">{inventory.length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Low Stock</p>
                  <p className="text-3xl font-bold text-yellow-400">{inventory.filter(i => i.stock <= i.minStock).length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Inventory Value</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${inventory.reduce((acc, item) => acc + (item.stock * item.cost), 0).toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Item</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">SKU</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Stock Level</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Cost</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Supplier</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-zinc-500 text-sm">Last restocked: {item.lastRestocked}</p>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm text-zinc-400 bg-zinc-800 px-2 py-1 rounded">{item.sku}</code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              item.stock <= item.minStock ? "bg-red-500" :
                              item.stock >= item.maxStock ? "bg-green-500" :
                              "bg-yellow-500"
                            }`} />
                            <span className={`font-medium ${
                              item.stock <= item.minStock ? "text-red-400" :
                              item.stock >= item.maxStock ? "text-green-400" :
                              "text-yellow-400"
                            }`}>
                              {item.stock}
                            </span>
                            <span className="text-zinc-500 text-sm">/ {item.maxStock}</span>
                          </div>
                          <div className="w-24 h-1 bg-zinc-800 rounded-full mt-2">
                            <div 
                              className={`h-full rounded-full ${
                                item.stock <= item.minStock ? "bg-red-500" :
                                item.stock >= item.maxStock ? "bg-green-500" :
                                "bg-yellow-500"
                              }`}
                              style={{ width: `${(item.stock / item.maxStock) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">${item.cost.toFixed(2)}</p>
                          <p className="text-zinc-500 text-sm">${(item.stock * item.cost).toFixed(0)} total</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-300">{item.supplier}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStock(item.id, -1)}
                              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStock(item.id, 1)}
                              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Equipment Tab */}
          {activeTab === "equipment" && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Total Printers</p>
                  <p className="text-3xl font-bold text-white">{equipment.length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Operational</p>
                  <p className="text-3xl font-bold text-green-400">{equipment.filter(e => e.status === "operational").length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">In Maintenance</p>
                  <p className="text-3xl font-bold text-yellow-400">{equipment.filter(e => e.status === "maintenance").length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-400 text-sm mb-1">Out of Service</p>
                  <p className="text-3xl font-bold text-red-400">{equipment.filter(e => e.status === "out-of-service").length}</p>
                </div>
              </div>

              {/* Equipment Cards */}
              <div className="grid grid-cols-3 gap-4">
                {equipment.map((eq) => (
                  <div key={eq.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <PrinterIcon className="w-6 h-6 text-zinc-400" />
                      </div>
                      <select
                        value={eq.status}
                        onChange={(e) => updateEquipmentStatus(eq.id, e.target.value as Equipment["status"])}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(eq.status)} bg-transparent`}
                      >
                        <option value="operational" className="bg-zinc-900 text-green-400">Operational</option>
                        <option value="maintenance" className="bg-zinc-900 text-yellow-400">Maintenance</option>
                        <option value="out-of-service" className="bg-zinc-900 text-red-400">Out of Service</option>
                      </select>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{eq.name}</h3>
                    <p className="text-zinc-400 text-sm mb-4">{eq.model}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Total Prints</span>
                        <span className="text-white font-medium">{eq.totalPrints.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Uptime</span>
                        <span className="text-white font-medium">{eq.uptime}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Last Maintenance</span>
                        <span className="text-white font-medium">{eq.lastMaintenance}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Next Service</span>
                        <span className={`font-medium ${
                          new Date(eq.nextMaintenance) < new Date() ? "text-red-400" : "text-white"
                        }`}>
                          {eq.nextMaintenance}
                        </span>
                      </div>
                    </div>

                    <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                      <Wrench className="w-4 h-4" />
                      <span className="text-sm">Log Maintenance</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overview Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400 text-sm">Total Revenue</span>
                  </div>
                  <p className="text-3xl font-bold text-white">${mockAnalytics.totalRevenue.toLocaleString()}</p>
                  <p className="text-green-400 text-sm mt-1">+12.5% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 text-sm">Total Orders</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.totalOrders}</p>
                  <p className="text-green-400 text-sm mt-1">+8.3% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-pink-400" />
                    <span className="text-pink-400 text-sm">Shop Views</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.totalViews.toLocaleString()}</p>
                  <p className="text-green-400 text-sm mt-1">+23.1% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">Conversion Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{mockAnalytics.conversionRate}%</p>
                  <p className="text-zinc-400 text-sm mt-1">Industry avg: 2.1%</p>
                </div>
              </div>

              {/* Charts & Tables */}
              <div className="grid grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Revenue This Week</h3>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {mockAnalytics.revenueByDay.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${(day.amount / 3000) * 100}%` }}
                        />
                        <span className="text-zinc-500 text-xs">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Top Products</h3>
                  <div className="space-y-4">
                    {mockAnalytics.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-zinc-500 text-sm">{product.sales} sales</p>
                          </div>
                        </div>
                        <p className="text-green-400 font-semibold">${product.revenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Customer List */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Orders</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Total Spent</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {order.customer.name.charAt(0)}
                            </div>
                            <p className="text-white font-medium">{order.customer.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                              <Mail className="w-4 h-4" />
                              {order.customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                              <Phone className="w-4 h-4" />
                              {order.customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm">
                            {mockOrders.filter(o => o.customer.email === order.customer.email).length} orders
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {/* Sponsorship Tab */}
          {activeTab === "sponsorship" && (
            <motion.div
              key="sponsorship"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Sponsorship Program</h2>
                <p className="text-zinc-400 mb-6">Boost your visibility and reach more customers by sponsoring your shop.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Bronze</h3>
                    <p className="text-3xl font-bold text-cyan-400 mb-4">$50<span className="text-base text-zinc-400">/month</span></p>
                    <ul className="text-zinc-400 space-y-2 mb-6">
                      <li>Featured on category pages</li>
                      <li>Basic analytics</li>
                    </ul>
                    <NeonButton glowColor="cyan" className="w-full mt-auto">Select Bronze</NeonButton>
                  </div>
                  <div className="border-2 border-purple-500 rounded-xl p-6 flex flex-col items-center text-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                    <h3 className="text-xl font-semibold text-white mb-2">Gold</h3>
                    <p className="text-3xl font-bold text-purple-400 mb-4">$150<span className="text-base text-zinc-400">/month</span></p>
                    <ul className="text-zinc-400 space-y-2 mb-6">
                      <li>Homepage placement</li>
                      <li>Priority support</li>
                      <li>Advanced analytics</li>
                    </ul>
                    <NeonButton glowColor="purple" className="w-full mt-auto">Select Gold</NeonButton>
                  </div>
                  <div className="border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Silver</h3>
                    <p className="text-3xl font-bold text-yellow-400 mb-4">$100<span className="text-base text-zinc-400">/month</span></p>
                    <ul className="text-zinc-400 space-y-2 mb-6">
                      <li>Featured on homepage</li>
                      <li>Enhanced analytics</li>
                    </ul>
                    <NeonButton glowColor="yellow" className="w-full mt-auto">Select Silver</NeonButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

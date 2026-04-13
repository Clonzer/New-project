import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, Users, CheckCircle, XCircle, Crown, Eye, Ban, 
  Package, ShoppingCart, FileText, BarChart3, 
  DollarSign, TrendingUp, Flag, Plus, AlertTriangle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Admin email - only this user can access the admin panel
const ADMIN_EMAIL = "evanhuelin8@gmail.com";

// Mock data
const mockUsers = [
  { id: 1, displayName: "John Maker", email: "john@example.com", role: "SELLER", status: "active", isVerified: true, totalOrders: 145, rating: 4.8, joinDate: "2023-06-01", lastActive: "2024-04-12" },
  { id: 2, displayName: "Sarah Creator", email: "sarah@example.com", role: "SELLER", status: "active", isVerified: false, totalOrders: 89, rating: 4.9, joinDate: "2023-08-15", lastActive: "2024-04-11" },
  { id: 3, displayName: "Mike Designer", email: "mike@example.com", role: "USER", status: "suspended", isVerified: false, totalOrders: 12, rating: null, joinDate: "2024-01-20", lastActive: "2024-03-15" },
  { id: 4, displayName: "Alice Print", email: "alice@example.com", role: "SELLER", status: "banned", isVerified: true, totalOrders: 230, rating: 4.5, joinDate: "2023-05-10", lastActive: "2024-02-28" }
];

const mockOrders = [
  { id: "ORD-001", buyer: "Customer One", buyerEmail: "customer1@example.com", seller: "John Maker", listing: "Custom Mechanical Keyboard", price: 89.99, status: "completed", createdAt: "2024-04-10", completedAt: "2024-04-12" },
  { id: "ORD-002", buyer: "Customer Two", buyerEmail: "customer2@example.com", seller: "Sarah Creator", listing: "Dragon Figurine", price: 45.00, status: "pending", createdAt: "2024-04-13", completedAt: null },
  { id: "ORD-003", buyer: "Customer Three", buyerEmail: "customer3@example.com", seller: "John Maker", listing: "Phone Case", price: 25.00, status: "processing", createdAt: "2024-04-11", completedAt: null }
];

const mockReports = [
  { id: 1, type: "user", target: "Mike Designer", reporter: "Customer One", reason: "Scam - never delivered order", status: "pending", createdAt: "2024-04-10", priority: "high" },
  { id: 2, type: "listing", target: "Phone Stand", reporter: "Customer Two", reason: "Inappropriate content", status: "resolved", createdAt: "2024-04-08", priority: "medium" },
  { id: 3, type: "user", target: "Alice Print", reporter: "Customer Three", reason: "Harassment in messages", status: "investigating", createdAt: "2024-04-12", priority: "high" }
];

const siteStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalOrders: 3456,
  revenue: 128450,
  pendingReports: 8,
  pendingVerifications: 23
};

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "orders" | "reports" | "mock">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [users, setUsers] = useState(mockUsers);
  const [orders, setOrders] = useState(mockOrders);
  const [reports, setReports] = useState(mockReports);
  
  // Mock order form state
  const [mockBuyer, setMockBuyer] = useState("");
  const [mockSeller, setMockSeller] = useState("");
  const [mockListing, setMockListing] = useState("");
  const [mockPrice, setMockPrice] = useState("");
  const [mockStatus, setMockStatus] = useState("pending");

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
          <Card className="w-full max-w-md border-red-500/20">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Access Denied</CardTitle>
              <CardDescription className="text-zinc-400">
                You don't have permission to access the admin panel.
                <br />
                <span className="text-xs text-zinc-500 mt-2 block">
                  This area is restricted to administrators only.
                </span>
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast({ title: "Status Updated", description: `User status changed to ${newStatus}` });
  };

  const handleCreateMockOrder = () => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      buyer: mockBuyer,
      buyerEmail: `${mockBuyer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      seller: mockSeller,
      listing: mockListing,
      price: parseFloat(mockPrice),
      status: mockStatus,
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: mockStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    };
    setOrders(prev => [newOrder, ...prev]);
    setMockBuyer("");
    setMockSeller("");
    setMockListing("");
    setMockPrice("");
    setMockStatus("pending");
    toast({ title: "Mock Order Created", description: `Order ${newOrder.id} created successfully` });
  };

  const handleReportAction = (reportId: number, action: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action } : r));
    toast({ title: "Report Updated", description: `Report marked as ${action}` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-600', suspended: 'bg-yellow-600', banned: 'bg-red-600',
      pending: 'bg-blue-600', completed: 'bg-green-600', processing: 'bg-yellow-600',
      investigating: 'bg-orange-600', resolved: 'bg-green-600'
    };
    return colors[status] || 'bg-zinc-600';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-900 to-zinc-950">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              Admin Panel
            </h1>
            <p className="text-zinc-400">Welcome back, {user.email}. Manage users, orders, reports, and site settings.</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { icon: Users, label: "Users", value: siteStats.totalUsers, color: "text-white" },
              { icon: TrendingUp, label: "Active", value: siteStats.activeUsers, color: "text-green-500" },
              { icon: ShoppingCart, label: "Orders", value: siteStats.totalOrders, color: "text-blue-500" },
              { icon: DollarSign, label: "Revenue", value: `$${siteStats.revenue.toLocaleString()}`, color: "text-emerald-500" },
              { icon: Flag, label: "Reports", value: siteStats.pendingReports, color: "text-red-500" },
              { icon: CheckCircle, label: "Pending Verif.", value: siteStats.pendingVerifications, color: "text-yellow-500" }
            ].map((stat, i) => (
              <Card key={i} className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <stat.icon className="w-4 h-4" /> {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 bg-zinc-800/50 border border-zinc-700 p-2 rounded-lg">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "orders", label: "Orders", icon: ShoppingCart },
              { id: "reports", label: "Reports", icon: Flag },
              { id: "mock", label: "Mock Orders", icon: Plus },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-md ${activeTab === tab.id ? 'bg-primary' : ''}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Site Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                    <span className="text-zinc-400">New users today</span>
                    <span className="text-white font-semibold">+24</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                    <span className="text-zinc-400">Orders today</span>
                    <span className="text-white font-semibold">+156</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                    <span className="text-zinc-400">Revenue today</span>
                    <span className="text-emerald-400 font-semibold">$4,230</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Active sessions</span>
                    <span className="text-white font-semibold">342</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Requires Attention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <Flag className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{siteStats.pendingReports} pending reports</p>
                      <p className="text-zinc-400 text-sm">3 high priority</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => setActiveTab("reports")}>View</Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <CheckCircle className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{siteStats.pendingVerifications} pending verifications</p>
                      <p className="text-zinc-400 text-sm">Seller applications waiting</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-500" onClick={() => setActiveTab("users")}>Review</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-zinc-400">Manage user accounts and statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 flex-1"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-zinc-800/50 border-zinc-700">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{user.displayName}</div>
                            <div className="text-sm text-zinc-400">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-600">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                        </TableCell>
                        <TableCell className="text-zinc-300">{user.totalOrders}</TableCell>
                        <TableCell className="text-zinc-300">{user.rating || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select value={user.status} onValueChange={(v) => handleStatusChange(user.id, v)}>
                              <SelectTrigger className="w-32 bg-zinc-800 border-zinc-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspend</SelectItem>
                                <SelectItem value="banned">Ban</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="outline" className="border-zinc-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Order Management</CardTitle>
                <CardDescription className="text-zinc-400">View and manage all platform orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-white">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-white">{order.buyer}</div>
                            <div className="text-sm text-zinc-400">{order.buyerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-300">{order.seller}</TableCell>
                        <TableCell className="text-zinc-300">{order.listing}</TableCell>
                        <TableCell className="text-emerald-400">${order.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-zinc-400">{order.createdAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Reports & Moderation</CardTitle>
                <CardDescription className="text-zinc-400">Handle user reports and content moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="text-zinc-400">#{report.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-600 capitalize">{report.type}</Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">{report.target}</TableCell>
                        <TableCell className="text-zinc-300">{report.reporter}</TableCell>
                        <TableCell className="text-zinc-400 max-w-xs truncate">{report.reason}</TableCell>
                        <TableCell>
                          <Badge className={report.priority === 'high' ? 'bg-red-600' : 'bg-yellow-600'}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.status === "pending" && (
                              <>
                                <Button size="sm" onClick={() => handleReportAction(report.id, "investigating")} className="bg-yellow-600 hover:bg-yellow-700">
                                  <Eye className="w-4 h-4 mr-1" /> Investigate
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReportAction(report.id, "resolved")}>
                                  <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                                </Button>
                              </>
                            )}
                            {report.status === "investigating" && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleReportAction(report.id, "resolved")}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Mock Orders Tab */}
          {activeTab === "mock" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create Mock Order
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Create test orders for testing purposes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Buyer Name</label>
                    <Input 
                      placeholder="e.g., Test Customer" 
                      value={mockBuyer}
                      onChange={(e) => setMockBuyer(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Seller Name</label>
                    <Input 
                      placeholder="e.g., John Maker" 
                      value={mockSeller}
                      onChange={(e) => setMockSeller(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Listing Title</label>
                    <Input 
                      placeholder="e.g., 3D Printed Model" 
                      value={mockListing}
                      onChange={(e) => setMockListing(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Price ($)</label>
                    <Input 
                      type="number" 
                      placeholder="29.99" 
                      value={mockPrice}
                      onChange={(e) => setMockPrice(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Order Status</label>
                    <Select value={mockStatus} onValueChange={setMockStatus}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateMockOrder}
                    disabled={!mockBuyer || !mockSeller || !mockListing || !mockPrice}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Mock Order
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Recent Mock Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{order.id}</p>
                            <p className="text-zinc-400 text-sm">{order.listing}</p>
                            <p className="text-zinc-500 text-xs">{order.buyer} → {order.seller}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-semibold">${order.price.toFixed(2)}</p>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-zinc-400 text-center py-4">No mock orders created yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

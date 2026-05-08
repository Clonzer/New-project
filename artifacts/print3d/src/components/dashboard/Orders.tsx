import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createOrder, updateOrderStatus, cancelOrder } from "@/lib/workspace-stub";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle2 },
  printing: { label: "In Production", color: "bg-primary/10 text-primary border-primary/30", icon: Package },
  shipped: { label: "Shipped", color: "bg-accent/10 text-accent border-accent/30", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
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

export function Orders({ user }: { user: any }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [user, activeTab]);

  const fetchOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const column = activeTab === 'buying' ? 'buyer_id' : 'seller_id';
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            images
          ),
          buyer:profiles!orders_buyer_id_fkey (
            id,
            display_name,
            username
          ),
          seller:profiles!orders_seller_id_fkey (
            id,
            display_name,
            username
          )
        `)
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setError('Orders table not found. Please run the database migration.');
        } else {
          setError('Failed to load orders. Please try again.');
        }
        setOrders([]);
        return;
      }

      setOrders(data || []);
    } catch (e) {
      console.error('Error fetching orders:', e);
      setError('An unexpected error occurred. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        toast({
          title: "Order status updated",
          description: `Order status has been updated to ${newStatus}`,
        });
        fetchOrders(); // Refresh orders
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateOrderStatus(selectedOrder.id, 'shipped', trackingNumber.trim());
      
      if (result.success) {
        toast({
          title: "Tracking number added",
          description: "Order has been marked as shipped with tracking number",
        });
        setTrackingDialogOpen(false);
        setTrackingNumber("");
        setSelectedOrder(null);
        fetchOrders(); // Refresh orders
      } else {
        toast({
          title: "Error",
          description: "Failed to add tracking number. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsSubmitting(true);
    try {
      const result = await cancelOrder(orderId);
      
      if (result.success) {
        toast({
          title: "Order cancelled",
          description: "Order has been cancelled successfully",
        });
        fetchOrders(); // Refresh orders
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-zinc-400">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-8">
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">{error}</p>
          <Button onClick={() => fetchOrders()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-zinc-400">Manage your orders and track shipments</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('buying')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'buying'
                ? 'bg-primary text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Buying ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('selling')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'selling'
                ? 'bg-primary text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Selling ({orders.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/10 p-8">
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-zinc-400 mb-6">
              {activeTab === 'buying' 
                ? "You haven't placed any orders yet" 
                : "You haven't received any orders yet"
              }
            </p>
            <Link href="/explore">
              <Button>Browse Items</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass-panel border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {order.listings?.title || `Order #${order.id.slice(0, 8)}`}
                        </h4>
                        <p className="text-sm text-zinc-400">
                          {activeTab === 'buying' ? `From: ${order.seller?.display_name || order.seller?.username}` : `To: ${order.buyer?.display_name || order.buyer?.username}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Quantity</p>
                        <p className="text-white font-medium">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Total</p>
                        <p className="text-white font-medium">${order.total_amount}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <StatusBadge status={order.status} />
                      <p className="text-sm text-zinc-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.tracking_number && (
                        <p className="text-sm text-primary">
                          Tracking: {order.tracking_number}
                        </p>
                      )}
                    </div>

                    {order.notes && (
                      <div className="mb-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-zinc-300">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {order.listings && (
                      <Link href={`/listings/${order.listings.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    )}
                    
                    {activeTab === 'selling' && (
                      <>
                        {order.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'accepted')}
                              disabled={isSubmitting}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={isSubmitting}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {order.status === 'accepted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'printing')}
                            disabled={isSubmitting}
                          >
                            Start Production
                          </Button>
                        )}
                        
                        {order.status === 'printing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingDialogOpen(true);
                            }}
                            disabled={isSubmitting}
                          >
                            Add Tracking
                          </Button>
                        )}
                      </>
                    )}
                    
                    {order.status === 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="text-red-400"
                      >
                        Cancelled
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Tracking Number</DialogTitle>
            <DialogDescription>
              Add a tracking number for this order to mark it as shipped
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Tracking Number</label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setTrackingDialogOpen(false);
                  setTrackingNumber("");
                  setSelectedOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTracking}
                disabled={!trackingNumber.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add Tracking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

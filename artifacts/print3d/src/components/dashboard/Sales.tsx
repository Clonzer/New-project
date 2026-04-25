import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Package, TrendingUp, Clock, CheckCircle2, Printer as PrinterIcon, Truck, XCircle, AlertCircle, MapPin, ExternalLink, Route, CreditCard, Banknote } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; next?: string; nextLabel?: string }> = {
  pending:   { label: "Pending",   color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock,         next: "accepted",  nextLabel: "Accept Job" },
  accepted:  { label: "Accepted",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20",       icon: CheckCircle2,  next: "printing",  nextLabel: "Start production" },
  printing:  { label: "In production", color: "bg-primary/10 text-primary border-primary/30",    icon: PrinterIcon,   next: "shipped",   nextLabel: "Mark Shipped" },
  shipped:   { label: "Shipped",   color: "bg-accent/10 text-accent border-accent/30",             icon: Truck,         next: "delivered", nextLabel: "Mark Delivered" },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20",          icon: XCircle },
};

const TRACKING_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pre_transit: { label: "Label Created", color: "bg-slate-500/10 text-slate-400", icon: Package },
  in_transit: { label: "In Transit", color: "bg-blue-500/10 text-blue-400", icon: Route },
  out_for_delivery: { label: "Out for Delivery", color: "bg-amber-500/10 text-amber-400", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  exception: { label: "Exception", color: "bg-red-500/10 text-red-400", icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-white/10 text-white", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} flex items-center gap-1.5 py-1 px-3`}>
      <Icon className="w-3.5 h-3.5" /> {cfg.label}
    </Badge>
  );
}

export function Sales({ mySales, updatingOrderId, advanceStatus }) {
  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h2 className="text-xl font-bold text-white">Incoming Orders</h2>
        <p className="text-sm text-zinc-500 mt-1">Funds held in escrow · Released when carrier confirms delivery</p>
      </div>
      {!mySales?.orders.length ? (
        <div className="p-16 text-center">
          <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No orders yet. Share your shop to get started!</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {mySales.orders.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const sellerEarnings = order.totalPrice - order.platformFee;
            return (
              <div key={order.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                        <Package className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{order.title}</h3>
                        <p className="text-sm text-zinc-400">From: {order.buyerName} · Qty: {order.quantity} · #{order.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-zinc-500 self-center">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                      {order.notes && <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">"{order.notes}"</span>}
                      
                      {/* Tracking Status Badge */}
                      {order.trackingStatus && order.status === 'shipped' && (
                        <Badge variant="outline" className={`${TRACKING_STATUS_CONFIG[order.trackingStatus]?.color || 'bg-zinc-500/10 text-zinc-400'} flex items-center gap-1.5`}>
                          {(() => {
                            const TrackingIcon = TRACKING_STATUS_CONFIG[order.trackingStatus]?.icon || Package;
                            return <TrackingIcon className="w-3.5 h-3.5" />;
                          })()}
                          {TRACKING_STATUS_CONFIG[order.trackingStatus]?.label || order.trackingStatus}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Tracking Number Display */}
                    {order.trackingNumber && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Route className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-400">Tracking:</span>
                        <code className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-200 font-mono">{order.trackingNumber}</code>
                        <span className="text-zinc-500">({order.carrier})</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-xl font-display font-bold text-emerald-400">${sellerEarnings.toFixed(2)} <span className="text-sm font-normal text-zinc-500">yours</span></p>
                      <p className="text-xs text-zinc-600">${order.platformFee.toFixed(2)} fee · ${order.totalPrice.toFixed(2)} total</p>
                      
                      {/* Payment Status */}
                      {order.status === "delivered" ? (
                        <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-emerald-400">
                          <Banknote className="w-3.5 h-3.5" />
                          <span>✓ Payment released</span>
                        </div>
                      ) : order.status === "shipped" ? (
                        <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-blue-400">
                          <Truck className="w-3.5 h-3.5" />
                          <span>In transit · Payment on delivery</span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-yellow-500">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>⏳ Held in escrow</span>
                        </div>
                      )}
                    </div>
                    {cfg?.next && (
                      <NeonButton
                        glowColor={order.status === "printing" ? "accent" : "primary"}
                        className="rounded-full px-4 py-2 text-sm"
                        disabled={updatingOrderId === order.id}
                        onClick={() => advanceStatus(order.id, cfg.next!)}
                      >
                        {updatingOrderId === order.id ? "Updating..." : cfg.nextLabel}
                      </NeonButton>
                    )}
                    {order.status === "pending" && (
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs" onClick={() => advanceStatus(order.id, "cancelled")}>
                        Decline
                      </Button>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="text-xs border-white/10 text-zinc-300 hover:bg-white/5" onClick={() => window.print()}>
                        Print Label
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs border-white/10 text-zinc-300 hover:bg-white/5" onClick={() => alert(`Customer: ${order.buyerName}\nAddress: ${order.shippingAddress || 'Not provided'}`)}>
                        View Info
                      </Button>
                    </div>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-xs text-zinc-500">
                    <span className="text-zinc-600">Ship to:</span> {order.shippingAddress}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

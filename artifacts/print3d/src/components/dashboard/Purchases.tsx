import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Package, ArrowRight, Clock, CheckCircle2, Printer as PrinterIcon, Truck, XCircle, AlertCircle, ExternalLink, MapPin } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; next?: string; nextLabel?: string }> = {
  pending:   { label: "Pending",   color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock,         next: "accepted",  nextLabel: "Accept Job" },
  accepted:  { label: "Accepted",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20",       icon: CheckCircle2,  next: "printing",  nextLabel: "Start production" },
  printing:  { label: "In production", color: "bg-primary/10 text-primary border-primary/30",    icon: PrinterIcon,   next: "shipped",   nextLabel: "Mark Shipped" },
  shipped:   { label: "Shipped",   color: "bg-accent/10 text-accent border-accent/30",             icon: Truck,         next: "delivered", nextLabel: "Confirm Delivered" },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20",          icon: XCircle },
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

export function Purchases({ myPurchases, isSellerUser }) {
  return (
    <div>
      {!isSellerUser && (
        <div className="glass-panel rounded-3xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Buyer dashboard</h2>
              <p className="text-sm text-zinc-400 mt-1">Your account view is focused on orders and account settings only.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/settings">
                <NeonButton glowColor="primary">Open Settings</NeonButton>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Browse Makers</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Order History</h2>
          <Link href="/explore">
            <Button variant="ghost" className="text-accent hover:text-white text-sm gap-1">
              Browse Makers <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        {!myPurchases?.orders.length ? (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 mb-4">No orders yet.</p>
            <Link href="/explore"><NeonButton glowColor="primary">Browse makers</NeonButton></Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {myPurchases.orders.map(order => (
              <div key={order.id} className="p-6 hover:bg-white/5 transition-colors flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{order.title}</h3>
                    <p className="text-sm text-zinc-400 mb-2">#{order.id} · from {order.sellerName} · {format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <div className="text-left md:text-right space-y-2 shrink-0">
                  <p className="font-display font-bold text-xl text-primary">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">incl. ${order.platformFee.toFixed(2)} platform fee</p>
                  {order.trackingNumber && (
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Tracking: {order.trackingNumber}</p>
                      <a 
                        href={order.trackingUrl || `https://www.google.com/search?q=${order.trackingNumber}+tracking`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-primary transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        Track Package
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

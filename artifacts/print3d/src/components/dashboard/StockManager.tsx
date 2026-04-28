import { useState } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";

interface ListingWithStock {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  stockQuantity?: number;
  trackStock?: boolean;
  orderCount?: number;
}

interface StockManagerProps {
  listings: ListingWithStock[];
  onUpdateStock: (listingId: string, quantity: number) => Promise<void>;
  onToggleTracking: (listingId: string, enabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function StockManager({
  listings,
  onUpdateStock,
  onToggleTracking,
  isLoading = false,
}: StockManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleEditStock = (id: string, current: number | undefined) => {
    setEditingId(id);
    setEditValues({ [id]: String(current ?? 0) });
  };

  const handleSaveStock = async (id: string) => {
    const newValue = parseInt(editValues[id] || "0");
    await onUpdateStock(id, newValue);
    setEditingId(null);
  };

  const getStockStatus = (quantity: number | undefined) => {
    if (quantity === undefined || quantity === null) return "not-tracked";
    if (quantity <= 0) return "out-of-stock";
    if (quantity <= 5) return "low-stock";
    return "in-stock";
  };

  const getStockBadgeConfig = (status: string) => {
    const configs = {
      "in-stock": {
        label: "In Stock",
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        icon: CheckCircle2,
      },
      "low-stock": {
        label: "Low Stock",
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        icon: AlertTriangle,
      },
      "out-of-stock": {
        label: "Out of Stock",
        color: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: TrendingDown,
      },
      "not-tracked": {
        label: "Not Tracked",
        color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
        icon: Package,
      },
    };
    return configs[status as keyof typeof configs] || configs["not-tracked"];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Inventory Management</h3>
        <p className="text-zinc-400 text-sm">
          Track stock levels, receive low-stock alerts, and prevent overselling.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Listings", value: listings.length },
            { label: "Tracked", value: listings.filter(l => l.trackStock).length },
            { label: "In Stock", value: listings.filter(l => getStockStatus(l.stockQuantity) === "in-stock").length },
            { label: "Low Stock", value: listings.filter(l => getStockStatus(l.stockQuantity) === "low-stock").length },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg bg-white/5 p-3 border border-white/10">
              <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No listings yet. Create your first listing to manage inventory.</p>
          </div>
        ) : (
          listings.map((listing, idx) => {
            const status = getStockStatus(listing.stockQuantity);
            const config = getStockBadgeConfig(status);
            const Icon = config.icon;

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/7 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white line-clamp-1">{listing.title}</h4>
                      <Badge variant="outline" className="shrink-0 bg-white/5 border-white/10 text-zinc-400 text-xs">
                        {listing.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>${listing.basePrice.toFixed(2)} base price</span>
                      <span>•</span>
                      <span>{listing.orderCount !== undefined ? `${listing.orderCount} orders` : "0 orders"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {editingId === listing.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={editValues[listing.id] || 0}
                            onChange={(e) =>
                              setEditValues({ ...editValues, [listing.id]: e.target.value })
                            }
                            className="w-20 bg-white/10 border-white/20 text-white text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveStock(listing.id)}
                            disabled={isLoading}
                            className="px-2 py-1 rounded text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-lg font-display font-bold text-white">
                            {listing.stockQuantity !== undefined ? listing.stockQuantity : "—"}
                          </p>
                          <p className="text-xs text-zinc-500">units</p>
                        </div>
                      )}
                    </div>

                    <div className="w-px h-8 bg-white/10" />

                    <div className="flex items-center gap-2">
                      <Badge className={config.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditStock(listing.id, listing.stockQuantity)}
                          disabled={editingId !== null || isLoading}
                          className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit stock"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleTracking(listing.id, !listing.trackStock)}
                          disabled={isLoading}
                          className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={listing.trackStock ? "Disable tracking" : "Enable tracking"}
                        >
                          <svg className="w-4 h-4" fill={listing.trackStock ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Tip:</strong> Enable stock tracking to prevent customer orders when inventory runs out. Enable "Track Stock" next to each listing.
        </p>
      </div>
    </div>
  );
}

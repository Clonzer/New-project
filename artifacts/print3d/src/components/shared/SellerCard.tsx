import { SellerShop } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Star, MapPin, Printer, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SellerCard({ seller }: { seller: SellerShop }) {
  return (
    <Link href={`/shop/${seller.id}`}>
      <div className="group block glass-panel p-6 rounded-2xl border border-white/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Glow effect behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 z-0" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-primary to-accent flex-shrink-0 shadow-lg">
                <div className="w-full h-full rounded-full bg-card overflow-hidden">
                  {seller.avatarUrl ? (
                    <img src={seller.avatarUrl} alt={seller.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-lg font-bold font-display text-white">
                      {seller.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-accent transition-colors">
                  {seller.shopName || seller.displayName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{seller.location || "Global"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-white">{seller.rating?.toFixed(1) || "New"}</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1">{seller.reviewCount} reviews</span>
            </div>
          </div>
          
          <p className="text-sm text-zinc-400 line-clamp-2 mb-5 h-10">
            {seller.bio || "Fabrication, additive, and custom work — see shop for details."}
          </p>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">{seller.printerCount}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Equipment</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 text-accent">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">{seller.totalPrints}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Orders</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            {seller.shopMode === "catalog" || seller.shopMode === "both" ? (
              <Badge variant="outline" className="text-xs bg-transparent border-primary/30 text-primary font-normal">Catalog</Badge>
            ) : null}
            {seller.shopMode === "open" || seller.shopMode === "both" ? (
              <Badge variant="outline" className="text-xs bg-transparent border-accent/30 text-accent font-normal">Custom Jobs</Badge>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

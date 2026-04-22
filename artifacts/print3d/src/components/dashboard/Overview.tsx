import { useState } from "react";
import { Link, useLocation } from "wouter";
import { NeonButton } from "@/components/ui/neon-button";
import { PortfolioManager } from "./PortfolioManager";

export function Overview({ user, mySales, averageOrderValue, activeEquipmentCount, totalCatalogItems, setShowAddPrinter }) {
  const [, navigate] = useLocation();

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <h2 className="text-2xl font-bold text-white">Seller overview</h2>
            <p className="text-sm text-zinc-400 mt-1">A quick view of sales momentum, catalog health, and shop readiness.</p>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            {[
              { label: "Average order value", value: `$${averageOrderValue.toFixed(2)}` },
              { label: "Active equipment", value: activeEquipmentCount },
              { label: "Catalog listings", value: totalCatalogItems },
              { label: "Open sales pipeline", value: mySales?.orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800/30 to-zinc-900/20 p-4 hover:border-primary/30 transition-all duration-300">
                <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
                <p className="mt-2 text-2xl font-display font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <h2 className="text-2xl font-bold text-white">Quick actions</h2>
            <p className="text-sm text-zinc-400 mt-1">Shortcuts for the most common seller tasks.</p>
          </div>
          <div className="p-6 space-y-3">
            <button type="button" onClick={() => navigate("/create-listing")} className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent px-4 py-4 text-left transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:-translate-y-0.5">
              <p className="font-semibold text-white">Add a new catalog listing</p>
              <p className="mt-1 text-sm text-zinc-400">Publish a model or made-to-order product from your dashboard.</p>
            </button>
            <button type="button" onClick={() => setShowAddPrinter(true)} className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent px-4 py-4 text-left transition-all duration-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:-translate-y-0.5">
              <p className="font-semibold text-white">Register more equipment</p>
              <p className="mt-1 text-sm text-zinc-400">Add another machine, service, or workshop capability.</p>
            </button>
            <Link href="/settings" className="block rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent px-4 py-4 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:-translate-y-0.5">
              <p className="font-semibold text-white">Update shop settings</p>
              <p className="mt-1 text-sm text-zinc-400">Edit branding, shipping defaults, verification, and payments.</p>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <PortfolioManager userId={user.id} />
      </div>
    </div>
  )
}

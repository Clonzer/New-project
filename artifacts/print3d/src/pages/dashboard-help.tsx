import { Navbar } from "@/components/layout/Navbar";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Package, Store, DollarSign, Printer as PrinterIcon, Settings,
  TrendingUp, ShoppingBag, MessageSquare, Megaphone, Wallet, CreditCard,
  Briefcase, Hammer, Wrench, PenLine, Sparkles, ArrowRight, Home,
  ChevronRight, CheckCircle2, Clock, Truck, AlertCircle
} from "lucide-react";

export default function DashboardHelp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Dashboard Guide
            </h1>
            <p className="text-zinc-400 text-lg">
              Learn how to navigate and use your Synthix dashboard
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Home, label: "Overview", id: "overview" },
              { icon: Package, label: "Purchases", id: "purchases" },
              { icon: Store, label: "Sales", id: "sales" },
              { icon: Briefcase, label: "Marketplace", id: "marketplace" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="glass-panel p-4 rounded-xl border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-2 text-center"
              >
                <item.icon className="w-6 h-6 text-primary" />
                <span className="text-sm text-zinc-300">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Overview Section */}
            <section id="overview" className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white">Overview Tab</h2>
              </div>
              <p className="text-zinc-400 mb-6">
                Your dashboard home shows key metrics and recent activity at a glance.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Key Metrics</h3>
                    <p className="text-zinc-400 text-sm">View total sales, orders, revenue, and reviews</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Recent Activity</h3>
                    <p className="text-zinc-400 text-sm">See latest orders, quotes, and marketplace activity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Quick Actions</h3>
                    <p className="text-zinc-400 text-sm">Fast access to common tasks like adding listings</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Purchases Section */}
            <section id="purchases" className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Purchases Tab</h2>
              </div>
              <p className="text-zinc-400 mb-6">
                Manage all your orders as a buyer.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Order Status</h3>
                    <p className="text-zinc-400 text-sm">Track orders from confirmed to delivered</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Custom Orders</h3>
                    <p className="text-zinc-400 text-sm">View and manage your custom service requests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Leave Reviews</h3>
                    <p className="text-zinc-400 text-sm">Rate sellers after your order is delivered</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sales Section */}
            <section id="sales" className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Sales Tab</h2>
              </div>
              <p className="text-zinc-400 mb-6">
                Manage your orders as a seller.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Order Management</h3>
                    <p className="text-zinc-400 text-sm">View incoming orders and update their status</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Mark as Shipped</h3>
                    <p className="text-zinc-400 text-sm">Add tracking numbers when orders ship</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Custom Quote Requests</h3>
                    <p className="text-zinc-400 text-sm">Manage custom orders from buyers</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Marketplace Section */}
            <section id="marketplace" className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Service Marketplace</h2>
              </div>
              <p className="text-zinc-400 mb-6">
                Browse and quote on custom service requests.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Browse Requests</h3>
                    <p className="text-zinc-400 text-sm">Filter by material, price, and search keywords</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Submit Quotes</h3>
                    <p className="text-zinc-400 text-sm">Set your price, delivery time, and message buyers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Track Quote Status</h3>
                    <p className="text-zinc-400 text-sm">See if your quotes are pending, accepted, or rejected</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Listings Section */}
            <section id="listings" className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Listings Tab</h2>
              </div>
              <p className="text-zinc-400 mb-6">
                Manage your product listings.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Create Listings</h3>
                    <p className="text-zinc-400 text-sm">Add new products with photos, pricing, and descriptions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Edit & Delete</h3>
                    <p className="text-zinc-400 text-sm">Update or remove existing listings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Stock Management</h3>
                    <p className="text-zinc-400 text-sm">Track inventory and get low stock alerts</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Equipment Section */}
            <section id="equipment" className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <PrinterIcon className="w-6 h-6 text-cyan-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Equipment Tab</h2>
              </div>
              <p className="text-zinc-400 mb-6">
                Showcase your manufacturing equipment.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Add Equipment</h3>
                    <p className="text-zinc-400 text-sm">List 3D printers, CNC machines, and other tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Equipment Groups</h3>
                    <p className="text-zinc-400 text-sm">Organize equipment by category (3D printing, woodworking, etc.)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium">Build Trust</h3>
                    <p className="text-zinc-400 text-sm">Buyers can see your capabilities before ordering</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Other Tabs */}
            <section className="glass-panel rounded-2xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-500/20 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Other Tabs</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-medium mb-2">Reviews</h3>
                  <p className="text-zinc-400 text-sm">View and respond to customer reviews</p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Shipping Profiles</h3>
                  <p className="text-zinc-400 text-sm">Configure shipping options and rates</p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Analytics</h3>
                  <p className="text-zinc-400 text-sm">View detailed sales and performance metrics</p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Finance</h3>
                  <p className="text-zinc-400 text-sm">Track earnings, payouts, and payment methods</p>
                </div>
              </div>
            </section>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-12 text-center">
            <Link href="/dashboard">
              <button className="neon-button px-8 py-3 rounded-xl text-white font-medium flex items-center gap-2 mx-auto">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

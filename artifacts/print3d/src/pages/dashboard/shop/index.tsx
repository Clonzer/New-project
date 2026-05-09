import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Package, 
  Wrench, 
  BarChart3, 
  Plus, 
  TrendingUp, 
  Eye,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useListListings, useListPrinters } from "@/lib/workspace-stub";
import { getPlanLimits, canCreateListing } from "@/lib/plan-utils";

const ShopManagement = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: myListings } = useListListings(user?.id ? { sellerId: user.id } : undefined);
  const { data: equipment } = useListPrinters(user?.id ? { userId: user.id } : undefined);

  const listingCount = myListings?.listings?.length || 0;
  const equipmentCount = equipment?.length || 0;
  const createCheck = canCreateListing(user, listingCount);
  const limits = getPlanLimits(user?.planTier);

  // Calculate real stats from data
  const activeListings = myListings?.listings?.filter(l => l.isActive).length || 0;
  const totalViews = myListings?.listings?.reduce((acc, l) => acc + (l.views || 0), 0) || 0;
  const avgViewsPerListing = listingCount > 0 ? Math.round(totalViews / listingCount) : 0;

  const stats = [
    {
      title: "Total Listings",
      value: listingCount.toString(),
      icon: Package,
      color: "from-blue-600 to-cyan-600",
      change: activeListings > 0 ? `${activeListings} active` : "No active listings",
      changeType: activeListings > 0 ? "positive" : "neutral"
    },
    {
      title: "Equipment",
      value: equipmentCount.toString(),
      icon: Wrench,
      color: "from-purple-600 to-pink-600",
      change: equipmentCount > 0 ? "All registered" : "Add equipment",
      changeType: equipmentCount > 0 ? "positive" : "neutral"
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "from-green-600 to-emerald-600",
      change: listingCount > 0 ? `${avgViewsPerListing} avg/listing` : "No views yet",
      changeType: totalViews > 0 ? "positive" : "neutral"
    },
    {
      title: "Potential Revenue",
      value: `$${(listingCount * 150).toLocaleString()}`,
      icon: DollarSign,
      color: "from-orange-600 to-red-600",
      change: "Based on avg. listing price",
      changeType: "neutral"
    }
  ];

  const sections = [
    {
      id: "listings",
      title: "My Listings",
      description: "Manage your product catalog",
      icon: Package,
      path: "/dashboard/shop/listings",
      count: listingCount,
      color: "bg-blue-600/20 text-blue-300 border-blue-500/30",
      action: {
        label: "Add Listing",
        icon: Plus,
        path: "/create-listing",
        disabled: !createCheck.allowed,
        disabledReason: createCheck.reason
      }
    },
    {
      id: "equipment",
      title: "Equipment",
      description: "Manage your workshop tools",
      icon: Wrench,
      path: "/dashboard/shop/equipment",
      count: equipmentCount,
      color: "bg-purple-600/20 text-purple-300 border-purple-500/30",
      action: {
        label: "Add Equipment",
        icon: Plus,
        path: "#"
      }
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View performance insights",
      icon: BarChart3,
      path: "/dashboard/shop/analytics",
      count: null,
      color: "bg-green-600/20 text-green-300 border-green-500/30",
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pl-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Shop Management</h1>
          <p className="text-zinc-400">Manage your listings, equipment, and track performance</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={`${stat.changeType === 'positive' ? 'bg-green-600/20 text-green-300 border-green-500/30' : 'bg-red-600/20 text-red-300 border-red-500/30'}`}>
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-zinc-400 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {section.count !== null && (
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                    {section.count}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link href={section.path}>
                  <a className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <span className="text-sm">Manage</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>

                {section.action && (
                  <NeonButton
                    glowColor="primary"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => {
                      if (section.action?.disabled && section.action?.disabledReason) {
                        // Show toast or modal with reason
                        console.log(section.action.disabledReason);
                      } else {
                        window.location.href = section.action?.path || "#";
                      }
                    }}
                    disabled={section.action?.disabled}
                  >
                    <section.action.icon className="w-4 h-4 mr-2" />
                    {section.action.label}
                  </NeonButton>
                )}
              </div>

              {section.action?.disabled && section.action?.disabledReason && (
                <div className="mt-3 p-3 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm">{section.action.disabledReason}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/create-listing">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <Plus className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Create New Listing</p>
                  <p className="text-zinc-400 text-sm">Add a product to your shop</p>
                </div>
              </a>
            </Link>
            
            <Link href="/dashboard/shop/equipment">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <Wrench className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Register Equipment</p>
                  <p className="text-zinc-400 text-sm">Add tools to your workshop</p>
                </div>
              </a>
            </Link>
            
            <Link href="/dashboard/shop/analytics">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">View Analytics</p>
                  <p className="text-zinc-400 text-sm">Track your performance</p>
                </div>
              </a>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShopManagement;

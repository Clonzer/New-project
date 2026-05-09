import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Settings,
  ChevronRight,
  Wrench,
  BarChart3,
  Star,
  Heart,
  CreditCard,
  Truck,
  User,
  HelpCircle,
  Store
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  description: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: TrendingUp,
    description: "Dashboard summary and quick stats",
    path: "/dashboard"
  },
  {
    id: "orders",
    label: "Orders",
    icon: Package,
    description: "Manage your orders and shipments",
    path: "/dashboard#orders"
  },
  {
    id: "equipment",
    label: "Equipment",
    icon: Wrench,
    description: "Your printers and tools",
    path: "/dashboard#equipment"
  },
  {
    id: "listings",
    label: "Listings",
    icon: Store,
    description: "Your products and services",
    path: "/dashboard#listings"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Sales performance and insights",
    path: "/dashboard#analytics"
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    description: "Customer feedback and ratings",
    path: "/dashboard#reviews"
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Heart,
    description: "Saved items and shops",
    path: "/favorites"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Account and shop preferences",
    path: "/settings"
  }
];

export function SimpleSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/dashboard" || location.startsWith("/dashboard#");
    }
    return location === path || location.startsWith(path + "/");
  };

  return (
    <motion.div 
      className="fixed left-0 top-0 z-[60] bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 h-screen overflow-hidden"
      initial={{ width: "80px" }}
      whileHover={{ width: "320px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full pt-20 pb-4">
        {/* User Info */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.display_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white font-medium text-sm">
                {user?.display_name || user?.username || "User"}
              </p>
              <p className="text-zinc-400 text-xs">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 px-2 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.id} href={item.path}>
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                        : "hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      active ? "bg-orange-500/20" : "bg-zinc-700/50"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        active ? "text-orange-300" : "text-zinc-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-medium text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="border-t border-zinc-800 p-2">
          <Link href="/help">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer">
              <div className="p-2 rounded-lg bg-zinc-700/50">
                <HelpCircle className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium text-white">Help & Support</p>
                <p className="text-xs text-zinc-400">Get help and contact support</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

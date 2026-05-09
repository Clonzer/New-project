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
    label: "Dashboard Overview",
    icon: TrendingUp,
    description: "View your business metrics and quick stats",
    path: "/dashboard"
  },
  {
    id: "orders",
    label: "Order Management",
    icon: Package,
    description: "Track and manage all customer orders",
    path: "/dashboard#orders"
  },
  {
    id: "equipment",
    label: "Equipment & Tools",
    icon: Wrench,
    description: "Manage your printers and workshop equipment",
    path: "/dashboard#equipment"
  },
  {
    id: "listings",
    label: "Product Listings",
    icon: Store,
    description: "Create and manage your product catalog",
    path: "/dashboard#listings"
  },
  {
    id: "analytics",
    label: "Sales Analytics",
    icon: BarChart3,
    description: "Detailed performance insights and reports",
    path: "/dashboard#analytics"
  },
  {
    id: "reviews",
    label: "Customer Reviews",
    icon: Star,
    description: "Monitor customer feedback and ratings",
    path: "/dashboard#reviews"
  },
  {
    id: "favorites",
    label: "Saved Items",
    icon: Heart,
    description: "View your favorite products and shops",
    path: "/favorites"
  },
  {
    id: "settings",
    label: "Account Settings",
    icon: Settings,
    description: "Manage your profile and shop preferences",
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
      className="fixed left-0 top-0 z-[60] bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 h-screen"
      initial={{ width: "280px" }}
      animate={{ width: "280px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full pt-20 pb-4">
        {/* User Info */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover shadow-lg shadow-orange-500/25"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/25">
              {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-base truncate">
                {user?.displayName || user?.username || "User"}
              </p>
              <p className="text-zinc-400 text-sm truncate">
                {user?.email || "user@example.com"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 px-3 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.path.startsWith('/dashboard#')) {
                      // For dashboard sections, update hash
                      window.location.hash = item.path.replace('/dashboard#', '');
                      // Trigger a re-render
                      window.dispatchEvent(new HashChangeEvent("hashchange"));
                    } else {
                      // For other routes, use wouter navigation
                      window.location.href = item.path;
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-orange-600/20 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-500/10"
                      : "hover:bg-zinc-700/50 text-zinc-300 hover:text-white hover:shadow-md"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${
                    active ? "bg-orange-500/20 shadow-md shadow-orange-500/20" : "bg-zinc-700/50"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      active ? "text-orange-300" : "text-zinc-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="border-t border-zinc-800 p-3">
          <div 
            onClick={() => {
              window.location.href = '/help';
            }}
            className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-zinc-700/50">
              <HelpCircle className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Help & Support</p>
              <p className="text-xs text-zinc-400">Get help and contact support</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

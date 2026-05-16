import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Clock,
  Star,
  Eye,
  ShoppingCart,
  Settings,
  ChevronRight,
  Wrench,
  BarChart3,
  Heart,
  CreditCard,
  Truck,
  User,
  HelpCircle,
  Store,
  Menu,
  X
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
    id: "stripe-connect",
    label: "Stripe Connect",
    icon: CreditCard,
    description: "Manage payments and create products",
    path: "/dashboard#stripe-connect"
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
    path: "/dashboard#settings"
  }
];

export function SimpleSidebar() {
  const [location] = useLocation();
  const { user, refreshUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleMouseEnter = () => {
    // Don't interfere with touch state on mobile
    if (window.innerWidth >= 1024) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    // Don't interfere with touch state on mobile
    if (window.innerWidth >= 1024) {
      setIsExpanded(false);
    }
  };

  const handleTouchStart = () => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (path: string) => {
    const currentHash = window.location.hash.slice(1);
    
    if (path === "/dashboard") {
      return location === "/dashboard" && !currentHash;
    }
    
    if (path.startsWith("/dashboard#")) {
      const section = path.replace("/dashboard#", "");
      return currentHash === section;
    }
    
    return location === path || location.startsWith(path + "/");
  };

  return (
    <>
      {/* Sidebar - Now visible on all screen sizes */}
      <motion.div 
        className="fixed left-0 top-0 z-[50] bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 h-full overflow-hidden group"
        initial={{ width: "60px" }}
        whileHover={{ width: "260px" }}
        animate={{ width: isExpanded ? "260px" : "60px" }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          mass: 0.8
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        <div className="flex flex-col h-full pt-16 pb-2">
          {/* Mobile tap indicator */}
          <div className={`lg:hidden flex justify-center py-2 transition-opacity ${isExpanded ? 'opacity-0' : 'opacity-50'}`}>
            <div className="w-8 h-1 bg-zinc-600 rounded-full"></div>
          </div>
          
          {/* User Info */}
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover shadow-lg shadow-orange-500/25 flex-shrink-0"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex-shrink-0">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
              )}
              {/* Hidden fallback for when image fails to load */}
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex-shrink-0 hidden">
                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-white font-semibold text-sm truncate transition-opacity ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`}>
                  {user?.displayName || user?.username || "User"}
                </p>
                <p className={`text-zinc-400 text-xs truncate transition-opacity ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`}>
                  {user?.email || "user@example.com"}
                </p>
                <div className={`flex items-center gap-2 mt-1 transition-opacity ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 px-1 py-2">
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.path.startsWith('/dashboard#')) {
                        // For dashboard sections, update hash
                        const section = item.path.replace('/dashboard#', '');
                        window.location.hash = section;
                      } else {
                        // For other routes, use wouter navigation
                        window.location.href = item.path;
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                        : "hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      active ? "bg-orange-500/20" : "bg-zinc-700/50"
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        active ? "text-orange-300" : "text-zinc-400"
                      }`} />
                    </div>
                    {isExpanded && (
                      <div className="flex-1 min-w-0 ml-3">
                        <p className="text-sm font-semibold text-white truncate">
                          {item.label}
                        </p>
                        {hoveredItem === item.id && (
                          <p className="text-xs text-zinc-400 leading-relaxed opacity-100 animate-in fade-in slide-in-from-top-1 duration-200">
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                    {isExpanded && (
                      <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help Section */}
          <div className="border-t border-zinc-800 p-2">
            <div 
              onClick={() => {
                window.location.href = '/help';
              }}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-zinc-700/50 flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-zinc-400" />
              </div>
              {isExpanded && (
                <div className="flex-1 ml-3">
                  <p className="text-sm font-semibold text-white">Help & Support</p>
                  <p className="text-xs text-zinc-400">Get help and contact support</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

          </>
  );
}

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Store,
  Package,
  ShoppingCart,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Heart,
  CreditCard,
  Truck,
  Wrench,
  BarChart3,
  Star,
  HelpCircle,
  Plus,
  Edit,
  FileText
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  children?: {
    id: string;
    label: string;
    icon: any;
    path: string;
  }[];
  path?: string;
}

const navItems: NavItem[] = [
  {
    id: "shop",
    label: "Shop Management",
    icon: Store,
    children: [
      { id: "listings", label: "My Listings", icon: Package, path: "/dashboard/shop/listings" },
      { id: "equipment", label: "Equipment", icon: Wrench, path: "/dashboard/shop/equipment" },
      { id: "analytics", label: "Analytics", icon: BarChart3, path: "/dashboard/shop/analytics" },
    ]
  },
  {
    id: "orders",
    label: "Orders & Sales",
    icon: ShoppingCart,
    children: [
      { id: "orders", label: "Orders", icon: Package, path: "/dashboard/orders" },
      { id: "sales", label: "Sales", icon: TrendingUp, path: "/dashboard/sales" },
      { id: "custom-orders", label: "Custom Orders", icon: Edit, path: "/dashboard/custom-orders" },
    ]
  },
  {
    id: "customer",
    label: "Customer Activity",
    icon: User,
    children: [
      { id: "purchases", label: "Purchases", icon: ShoppingCart, path: "/dashboard/purchases" },
      { id: "reviews", label: "Reviews", icon: Star, path: "/dashboard/reviews" },
      { id: "favorites", label: "Favorites", icon: Heart, path: "/dashboard/favorites" },
    ]
  },
  {
    id: "account",
    label: "Account & Settings",
    icon: Settings,
    children: [
      { id: "payment-methods", label: "Payment Methods", icon: CreditCard, path: "/dashboard/payment-methods" },
      { id: "shipping-profiles", label: "Shipping Profiles", icon: Truck, path: "/dashboard/shipping-profiles" },
      { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
    ]
  }
];

export function DashboardSidebar() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <motion.div 
      className="fixed left-0 top-0 z-[60] bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 h-screen overflow-hidden"
      initial={{ width: "60px" }}
      whileHover={{ width: "280px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full pt-20 pb-4">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 px-2">
          {navItems.map((item) => {
            const isExpanded = expandedSections.includes(item.id);
            const Icon = item.icon;
            
            return (
              <div key={item.id} className="mb-2">
                <button
                  onClick={() => item.children ? toggleSection(item.id) : null}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    item.children
                      ? "hover:bg-zinc-700/50"
                      : isActive(item.path || "")
                      ? "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                      : "hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                  {item.children && (
                    <ChevronRight 
                      className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {item.children && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-4 mt-1 space-y-1"
                  >
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link key={child.id} href={child.path}>
                          <a
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                              isActive(child.path)
                                ? "bg-orange-600/10 text-orange-300 border-l-2 border-orange-500/30"
                                : "hover:bg-zinc-700/30 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <ChildIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm whitespace-nowrap">{child.label}</span>
                          </a>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-zinc-800 p-2">
          <Link href="/dashboard/help">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200">
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Help & Support
              </span>
            </a>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  TrendingUp,
  Settings,
  Package,
  CheckCircle2,
  Store,
  Briefcase,
  PenLine,
  Printer as PrinterIcon,
  Truck,
  Trophy,
  Wallet,
  CreditCard,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileDashboardNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSeller: boolean;
  isOwner: boolean;
  isBoth: boolean;
  dashboardView: "store" | "purchases";
  onViewChange?: (view: "store" | "purchases") => void;
}

const SELLER_TABS = [
  { value: "overview", label: "Overview", icon: TrendingUp },
  { value: "admin", label: "Admin", icon: Settings },
  { value: "purchases", label: "Orders", icon: Package },
  { value: "reviews", label: "Reviews", icon: CheckCircle2 },
  { value: "listings", label: "My Shop", icon: Store },
  { value: "marketplace", label: "Marketplace", icon: Briefcase },
  { value: "services", label: "Services", icon: PenLine },
  { value: "printers", label: "Equipment", icon: PrinterIcon },
  { value: "shipping", label: "Shipping", icon: Truck },
  { value: "analytics", label: "Analytics", icon: TrendingUp },
  { value: "rank", label: "Rank", icon: Trophy },
];

const BUYER_TABS = [
  { value: "purchases", label: "Orders", icon: Package },
  { value: "wallet", label: "Wallet", icon: Wallet },
  { value: "payment", label: "Payment", icon: CreditCard },
  { value: "reviews", label: "My Reviews", icon: CheckCircle2 },
  { value: "service-requests", label: "Custom Orders", icon: MessageSquare },
  { value: "sponsorship", label: "Sponsorship", icon: Sparkles },
];

export function MobileDashboardNav({
  activeTab,
  onTabChange,
  isSeller,
  isOwner,
  isBoth,
  dashboardView,
  onViewChange,
}: MobileDashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const tabs = isSeller ? SELLER_TABS : BUYER_TABS;
  const visibleTabs = tabs.filter((tab) => {
    if (tab.value === "admin" && !isOwner) return false;
    if (isBoth && dashboardView === "purchases") {
      return ["purchases", "wallet", "payment", "reviews", "service-requests", "sponsorship"].includes(tab.value);
    }
    if (isBoth && dashboardView === "store") {
      return !["wallet", "payment", "service-requests", "sponsorship"].includes(tab.value);
    }
    return true;
  });

  const activeTabLabel = visibleTabs.find((t) => t.value === activeTab)?.label || "Menu";
  const ActiveIcon = visibleTabs.find((t) => t.value === activeTab)?.icon || Menu;

  return (
    <div className="lg:hidden">
      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-between gap-2">
          {/* Active Tab Display */}
          <Button
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3 py-2 h-auto"
          >
            <ActiveIcon className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm">{activeTabLabel}</span>
            <Menu className="w-4 h-4 text-zinc-400 ml-1" />
          </Button>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            {isBoth && (
              <div className="flex bg-white/5 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange?.("store")}
                  className={`text-xs px-2 py-1 h-auto rounded-md ${
                    dashboardView === "store" ? "bg-primary/20 text-primary" : "text-zinc-400"
                  }`}
                >
                  Store
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange?.("purchases")}
                  className={`text-xs px-2 py-1 h-auto rounded-md ${
                    dashboardView === "purchases" ? "bg-primary/20 text-primary" : "text-zinc-400"
                  }`}
                >
                  Buy
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Dashboard Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tab Grid */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => {
                        onTabChange(tab.value);
                        setIsOpen(false);
                      }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary/20 border border-primary/50 text-white"
                          : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? "text-primary" : ""}`} />
                      <span className="text-xs font-medium text-center">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Padding for safe area */}
              <div className="h-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Desktop condensed tabs - shown on smaller desktop screens
export function CondensedDashboardTabs({
  activeTab,
  onTabChange,
  isSeller,
  isOwner,
  isBoth,
  dashboardView,
  onViewChange,
}: MobileDashboardNavProps) {
  const [showMore, setShowMore] = useState(false);

  const tabs = isSeller ? SELLER_TABS : BUYER_TABS;
  const visibleTabs = tabs.filter((tab) => {
    if (tab.value === "admin" && !isOwner) return false;
    if (isBoth && dashboardView === "purchases") {
      return ["purchases", "wallet", "payment", "reviews", "service-requests", "sponsorship"].includes(tab.value);
    }
    if (isBoth && dashboardView === "store") {
      return !["wallet", "payment", "service-requests", "sponsorship"].includes(tab.value);
    }
    return true;
  });

  const priorityTabs = visibleTabs.slice(0, 6);
  const moreTabs = visibleTabs.slice(6);

  return (
    <div className="hidden lg:flex xl:hidden items-center gap-2">
      {priorityTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        );
      })}

      {moreTabs.length > 0 && (
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <Menu className="w-4 h-4" />
            <span className="text-sm">More</span>
          </Button>

          {showMore && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 py-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      onTabChange(tab.value);
                      setShowMore(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive ? "bg-primary/20 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isBoth && (
        <div className="flex items-center gap-1 ml-4 border-l border-white/10 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange?.("store")}
            className={`text-xs px-3 py-1.5 h-auto rounded-lg ${
              dashboardView === "store" ? "bg-primary/20 text-primary" : "text-zinc-400"
            }`}
          >
            Store
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange?.("purchases")}
            className={`text-xs px-3 py-1.5 h-auto rounded-lg ${
              dashboardView === "purchases" ? "bg-primary/20 text-primary" : "text-zinc-400"
            }`}
          >
            Buy
          </Button>
        </div>
      )}
    </div>
  );
}

export default MobileDashboardNav;

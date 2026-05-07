import { Link, useLocation } from "wouter";
import { Search, Menu, ShoppingCart, User as UserIcon, X, Bell, MessageSquare, GitCompareArrows, Flag, HelpCircle, Mail, Crown, ChevronDown, Zap, Star, Rocket, DollarSign, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NeonButton } from "@/components/ui/neon-button";
import { cartItemCount, CART_CHANGE_EVENT } from "@/lib/cart-storage";
import { getComparedShops, SHOP_COMPARE_CHANGE_EVENT } from "@/lib/shop-compare";
import { listMessageThreads } from "@/lib/messages-api";
import { getUnreadNotificationsCount } from "@/lib/notifications-api";
import { VerifyEmailBanner } from "@/components/layout/VerifyEmailBanner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, refreshUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [comparedCount, setComparedCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const syncCart = () => setCartCount(cartItemCount());
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_CHANGE_EVENT, syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_CHANGE_EVENT, syncCart);
    };
  }, []);

  // Force navbar re-render when user data changes
  useEffect(() => {
    // This will trigger a re-render of the avatar display
  }, [user?.avatarUrl, user?.displayName]);

  useEffect(() => {
    const syncCompare = () => setComparedCount(getComparedShops().length);
    syncCompare();
    window.addEventListener("storage", syncCompare);
    window.addEventListener(SHOP_COMPARE_CHANGE_EVENT, syncCompare);
    return () => {
      window.removeEventListener("storage", syncCompare);
      window.removeEventListener(SHOP_COMPARE_CHANGE_EVENT, syncCompare);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setMessageCount(0);
      return;
    }

    void listMessageThreads()
      .then((result) => {
        setMessageCount(result.threads.reduce((sum, thread) => sum + thread.unreadCount, 0));
      })
      .catch(() => setMessageCount(0));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    void getUnreadNotificationsCount()
      .then((result) => setNotificationCount(result.unreadCount))
      .catch(() => setNotificationCount(0));
  }, [user]);

  const isActive = (path: string) => location === path;
  const isSeller = user?.role === "seller" || user?.role === "both";

  // Helper to get plan icon based on user's plan tier
  const getPlanIcon = () => {
    if (!user?.planTier || user.planTier === 'starter') return null;
    const tier = user.planTier;
    if (tier === 'pro') return <Star className="w-3.5 h-3.5 text-primary fill-primary" />;
    if (tier === 'elite') return <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />;
    if (tier === 'enterprise') return <Rocket className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />;
    return null;
  };

  const getPlanBadge = () => {
    if (!user?.planTier || user.planTier === 'starter') return null;
    const tier = user.planTier;
    const styles = {
      pro: 'border-primary/30 bg-primary/10 text-primary',
      elite: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300',
      enterprise: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
    };
    return (
      <span className={`rounded-full border ${styles[tier]} px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] flex items-center gap-1`}>
        {getPlanIcon()}
        {tier}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-xl backdrop-saturate-150 isolation-auto">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white group-hover:drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] transition-all duration-300">
              SYNTHIX
            </span>
            <span className="hidden sm:inline rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Beta
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/explore-all"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive("/explore-all")
                  ? "text-white bg-gradient-to-r from-primary/80 to-primary/60 border border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/discover"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive("/discover")
                  ? "text-white bg-gradient-to-r from-primary/80 to-primary/60 border border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Discover
            </Link>
            <Link
              href="/contests"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive("/contests")
                  ? "text-white bg-gradient-to-r from-primary/80 to-primary/60 border border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Contests
            </Link>
            <Link
              href="/explore"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive("/explore")
                  ? "text-white bg-gradient-to-r from-primary/80 to-primary/60 border border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/service-marketplace"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive("/service-marketplace")
                  ? "text-white bg-gradient-to-r from-primary/80 to-primary/60 border border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Custom Orders
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive("/pricing")
                  ? "text-white bg-gradient-to-r from-primary/80 to-primary/60 border border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden xl:flex relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={(e) => {
                const term = headerSearch.trim();
                if (e.key === "Enter" && term) {
                  setLocation(`/search?q=${encodeURIComponent(term)}`);
                  setHeaderSearch("");
                }
              }}
              className="pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 w-56 transition-all hover:bg-white/[0.05] hover:border-white/15"
            />
          </div>

          <Link href="/cart" className="sm:hidden">
            <Button variant="ghost" size="icon" className="rounded-full relative h-9 w-9">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Button>
          </Link>
          <Link href="/cart" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hidden sm:flex"
              >
                <Flag className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10 rounded-xl mt-2 w-64 z-[9999] p-2">
              <DropdownMenuItem asChild className="rounded-lg p-0 focus:bg-transparent">
                <Link href="/help" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">FAQ & Help Center</div>
                    <div className="text-xs text-zinc-400">Find answers to common questions</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg p-0 focus:bg-transparent mt-2">
                <Link href="/messages?contact=synthix" className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 transition-all duration-200 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Message Synthix</div>
                    <div className="text-xs text-zinc-400">Open support and pricing options</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg p-0 focus:bg-transparent mt-2">
                <Link href="/contact" className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/30 transition-all duration-200 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Contact form</div>
                    <div className="text-xs text-zinc-400">Send details to the support inbox</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {comparedCount > 0 ? (
            <Link href="/compare-shops">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex relative">
                <GitCompareArrows className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                  {comparedCount}
                </span>
              </Button>
            </Link>
          ) : null}

          {user ? (
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex relative">
                <MessageSquare className="w-5 h-5" />
                {messageCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          ) : null}

          {user ? (
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          ) : null}

          {/* Admin Link - Only for evanhuelin8@gmail.com */}
          {user?.email === "evanhuelin8@gmail.com" ? (
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex relative bg-amber-500/10 hover:bg-amber-500/20">
                <Crown className="w-5 h-5 text-amber-500" />
              </Button>
            </Link>
          ) : null}

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <div className="flex items-center gap-2 cursor-pointer p-1 pr-3 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent p-[2px]">
                    <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                      {(() => {
                        console.log('Navbar rendering user avatar:', {
                          avatarUrl: user.avatarUrl,
                          userId: user.id,
                          displayName: user.displayName
                        });
                        return user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-white text-sm">
                            {(user.displayName || user.username || "?").charAt(0).toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm font-medium">{user.displayName}</span>
                    {getPlanBadge()}
                    {user?.email === "evanhuelin8@gmail.com" ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                        Admin
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <Link href="/register">
              <Button className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] px-4 py-2 text-sm h-9 border border-cyan-400/30 hidden sm:flex">
                Join Now
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full h-9 w-9"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <VerifyEmailBanner />

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onKeyDown={(e) => {
                    const term = headerSearch.trim();
                    if (e.key === "Enter" && term) {
                      setLocation(`/search?q=${encodeURIComponent(term)}`);
                      setHeaderSearch("");
                      setMenuOpen(false);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>

              {/* Primary Links */}
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2">Main</p>
                {[
                  { path: "/explore-all", label: "Explore", icon: Search },
                  { path: "/discover", label: "Discover", icon: MessageSquare },
                  { path: "/contests", label: "Contests", icon: Crown },
                  { path: "/service-marketplace", label: "Custom Orders", icon: MessageSquare },
                ].map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/5 text-white font-medium transition-colors"
                  >
                    <route.icon className="w-5 h-5 text-zinc-400" />
                    {route.label}
                  </Link>
                ))}
              </div>

              {/* User Links */}
              {user && (
                <div className="space-y-1 mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2">Your Account</p>
                  {[
                    { path: "/dashboard", label: "Dashboard", icon: TrendingUp },
                    { path: "/messages", label: "Messages", icon: MessageSquare },
                    { path: "/notifications", label: "Notifications", icon: Bell },
                    { path: "/cart", label: "Cart", icon: ShoppingCart },
                    { path: "/settings", label: "Settings", icon: Settings },
                  ].map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/5 text-white font-medium transition-colors"
                    >
                      <route.icon className="w-5 h-5 text-zinc-400" />
                      {route.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Support */}
              <div className="space-y-1 mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2">Support</p>
                {[
                  { path: "/help", label: "Help Center", icon: HelpCircle },
                  { path: "/pricing", label: "Pricing", icon: DollarSign },
                ].map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/5 text-white font-medium transition-colors"
                  >
                    <route.icon className="w-5 h-5 text-zinc-400" />
                    {route.label}
                  </Link>
                ))}
              </div>

              {/* Auth Button */}
              {!user ? (
                <div className="mt-6">
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 py-3">
                      Join Now
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full rounded-xl mt-2 text-zinc-400 hover:text-white py-3">
                      Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    supabase.auth.signOut();
                    setMenuOpen(false);
                  }}
                  className="w-full rounded-xl mt-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-3"
                >
                  Sign Out
                </Button>
              )}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

import { Link, useLocation } from "wouter";
import { Search, Menu, ShoppingCart, User as UserIcon, X, Bell, MessageSquare, GitCompareArrows, Flag, HelpCircle, Mail, Crown, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [comparedCount, setComparedCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black">
      <div className="container mx-auto px-2 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-xl tracking-widest text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-300">
              SYNTHIX
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Beta
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative flex items-center gap-1 ${
                    isActive("/explore-all") || isActive("/explore") || isActive("/listings")
                      ? "text-white border border-primary bg-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.4)] ring-2 ring-primary/30"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Explore
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-700">
                <DropdownMenuItem asChild>
                  <Link href="/explore-all" className="cursor-pointer">
                    Explore All
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/explore" className="cursor-pointer">
                    Explore Shops
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/listings" className="cursor-pointer">
                    Model Catalog
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {[
              { path: "/discover", label: "Discover" },
              { path: "/contests", label: "Contests" },
              { path: "/pricing", label: "Pricing" },
              { path: "/about", label: "About" },
            ].map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                  isActive(route.path)
                    ? "text-white bg-primary/30 border border-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] ring-2 ring-primary/30"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search models, shops..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={(e) => {
                const term = headerSearch.trim();
                if (e.key === "Enter" && term) {
                  setLocation(`/search?q=${encodeURIComponent(term)}`);
                  setHeaderSearch("");
                }
              }}
              className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-64 transition-all"
            />
          </div>

          {!isSeller && (
            <Link href="/register" className="hidden sm:block">
              <Button className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] px-4 py-2 text-sm h-9 border border-cyan-400/30">
                Join Now
              </Button>
            </Link>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Button>
          </Link>

          <div className="relative hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setContactOpen((value) => !value)}
            >
              <Flag className="w-5 h-5" />
            </Button>

            <AnimatePresence>
              {contactOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 glass-panel border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                >
                  <div className="space-y-2">
                    <Link
                      href="/help"
                      onClick={() => setContactOpen(false)}
                      className="block w-full p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                            FAQ & Help Center
                          </div>
                          <div className="text-xs text-zinc-400">
                            Find answers to common questions
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/messages?contact=2"
                      onClick={() => setContactOpen(false)}
                      className="block w-full p-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                            Message Synthix
                          </div>
                          <div className="text-xs text-zinc-400">
                            Open support and pricing options
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setContactOpen(false)}
                      className="block w-full p-3 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                            Contact form
                          </div>
                          <div className="text-xs text-zinc-400">
                            Send details to the support inbox
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

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
                    <div className="w-full h-full rounded-full bg-card overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-full h-full p-1 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm font-medium">{user.displayName}</span>
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
            <Link href="/login">
              <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)] hidden sm:flex">
                Sign In
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <VerifyEmailBanner />

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {[
                { path: "/explore", label: "Explore Shops" },
                { path: "/listings", label: "Model Catalog" },
                { path: "/discover", label: "Discover" },
                { path: "/contests", label: "Contests" },
                { path: "/cart", label: "Cart" },
                { path: "/compare-shops", label: "Compare Shops" },
                { path: "/messages", label: "Messages" },
                { path: "/dashboard", label: "Dashboard" },
                { path: "/settings", label: "Settings" },
                { path: "/help", label: "Help" },
                { path: "/pricing", label: "Pricing & Support" },
              ].map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-white/5 text-white font-medium transition-colors"
                >
                  {route.label}
                </Link>
              ))}

              {!isSeller ? (
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full rounded-xl mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30">Join Now</Button>
                </Link>
              ) : null}

              {!user ? (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-white/5 text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
              ) : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

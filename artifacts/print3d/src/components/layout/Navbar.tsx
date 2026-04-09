import { Link, useLocation } from "wouter";
import { Search, Menu, ShoppingCart, User as UserIcon, X, Bell, GitCompareArrows } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NeonButton } from "@/components/ui/neon-button";
import { cartItemCount, CART_CHANGE_EVENT } from "@/lib/cart-storage";
import { getComparedShops, SHOP_COMPARE_CHANGE_EVENT } from "@/lib/shop-compare";
import { listMessageThreads } from "@/lib/messages-api";
import { VerifyEmailBanner } from "@/components/layout/VerifyEmailBanner";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [comparedCount, setComparedCount] = useState(0);
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
      setNotificationCount(0);
      return;
    }

    void listMessageThreads()
      .then((result) => {
        setNotificationCount(result.threads.reduce((sum, thread) => sum + thread.unreadCount, 0));
      })
      .catch(() => setNotificationCount(0));
  }, [user]);

  const isActive = (path: string) => location === path;
  const isSeller = user?.role === "seller" || user?.role === "both";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display font-extrabold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.8)] transition-all duration-300">
              SYNTHIX
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Beta
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { path: "/explore", label: "Explore Shops" },
              { path: "/listings", label: "Model Catalog" },
              { path: "/contests", label: "Contests" },
              { path: "/pricing", label: "Pricing" },
            ].map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                  isActive(route.path) ? "text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                {isActive(route.path) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-white/10 rounded-full z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
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
                const t = headerSearch.trim();
                if (e.key === "Enter" && t) {
                  setLocation(`/search?q=${encodeURIComponent(t)}`);
                  setHeaderSearch("");
                }
              }}
              className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-64 transition-all"
            />
          </div>

          {!isSeller && (
            <Link href="/register" className="hidden sm:block">
              <NeonButton glowColor="accent" className="rounded-full px-4 py-2 text-sm font-semibold h-9">
                Become a Seller
              </NeonButton>
            </Link>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Button>
          </Link>

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
                <Bell className="w-5 h-5" />
                {notificationCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                ) : null}
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
                    {user.isOwner ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                        Owner
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

          <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <VerifyEmailBanner />

      <AnimatePresence>
        {menuOpen && (
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
              { path: "/contests", label: "Contests" },
              { path: "/cart", label: "Cart" },
                { path: "/compare-shops", label: "Compare Shops" },
                { path: "/messages", label: "Messages" },
                { path: "/dashboard", label: "Dashboard" },
                { path: "/settings", label: "Settings" },
              ].map(r => (
                <Link key={r.path} href={r.path} onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-white/5 text-white font-medium transition-colors">
                  {r.label}
                </Link>
              ))}
              {!isSeller && (
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <NeonButton glowColor="accent" className="w-full rounded-xl mt-2">Become a Seller</NeonButton>
                </Link>
              )}
              {!user && (
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 rounded-xl hover:bg-white/5 text-white font-medium transition-colors">
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

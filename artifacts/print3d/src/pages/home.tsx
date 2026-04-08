import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Layers3, Package, ShieldCheck, Sparkles, Store, UserRound, Zap, Rocket, ShoppingCart, Clock } from "lucide-react";
import { useListListings, useListSellers, type Listing, type SellerShop } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { OnboardingTutorial } from "@/components/shared/OnboardingTutorial";
import { NeonButton } from "@/components/ui/neon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { useScrollFade } from "@/hooks/use-scroll-fade";

type HeroSlide =
  {
    kind: "listing" | "seller";
    id: string;
    href: string;
    eyebrow: string;
    title: string;
    description: string;
    imageUrl: string | null;
    badge: string;
    metaA: string;
    metaB: string;
    cta: string;
    storeName: string;
    storeHref: string;
    storeImageUrl: string | null;
    storeSummary: string;
    storeMeta: string;
  };

function formatCount(value: number | undefined) {
  return new Intl.NumberFormat("en-GB").format(value ?? 0);
}

function listingToSlide(listing: Listing, seller: SellerShop | undefined, formatPrice: (amountUsd: number) => string): HeroSlide {
  return {
    kind: "listing",
    id: `listing-${listing.id}`,
    href: `/order/new?listingId=${listing.id}`,
    eyebrow: "Featured Product",
    title: listing.title,
    description:
      listing.description?.trim() ||
      `Produced by ${listing.sellerName} with ${listing.material || "custom materials"} and ready to order.`,
    imageUrl: listing.imageUrl ?? null,
    badge: listing.category,
    metaA: `${formatPrice(listing.basePrice)} base`,
    metaB: `${listing.estimatedDaysMin}-${listing.estimatedDaysMax} day lead time`,
    cta: "Order this print",
    storeName: seller?.shopName || seller?.displayName || listing.sellerName,
    storeHref: `/shop/${seller?.id ?? listing.sellerId}`,
    storeImageUrl: seller?.avatarUrl ?? null,
    storeSummary:
      seller?.bio?.trim() ||
      `${listing.sellerName} is active on SYNTHIX with products and custom work ready to browse.`,
    storeMeta: seller ? `${formatCount(seller.printerCount)} machines • ${formatCount(seller.listingCount)} listings` : "Marketplace seller",
  };
}

function sellerToSlide(seller: SellerShop): HeroSlide {
  return {
    kind: "seller",
    id: `seller-${seller.id}`,
    href: `/shop/${seller.id}`,
    eyebrow: "Featured Maker",
    title: seller.shopName || seller.displayName,
    description:
      seller.bio?.trim() ||
      `${seller.displayName} is open for custom fabrication${seller.location ? ` in ${seller.location}` : ""}.`,
    imageUrl: seller.avatarUrl ?? null,
    badge: seller.shopMode === "both" ? "Catalog + Custom" : seller.shopMode === "catalog" ? "Catalog" : "Custom Jobs",
    metaA: `${formatCount(seller.printerCount)} machines`,
    metaB: `${formatCount(seller.totalPrints)} completed jobs`,
    cta: "View maker profile",
    storeName: seller.shopName || seller.displayName,
    storeHref: `/shop/${seller.id}`,
    storeImageUrl: seller.avatarUrl ?? null,
    storeSummary:
      seller.bio?.trim() ||
      `${seller.displayName} is active for marketplace orders and custom manufacturing requests.`,
    storeMeta: `${formatCount(seller.printerCount)} machines • ${formatCount(seller.listingCount)} listings`,
  };
}

export default function Home() { 
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);
  const { formatPrice } = useLocalePreferences();

  // Scroll fade hooks for different sections
  const heroFade = useScrollFade();
  const makersFade = useScrollFade();
  const productsFade = useScrollFade();
  const sponsoredFade = useScrollFade();

  const { data: sellersData, isLoading: loadingSellers } = useListSellers({ limit: 6 });
  const { data: listingsData, isLoading: loadingListings } = useListListings({ limit: 6 });

  const featuredSellers = sellersData?.sellers ?? [];
  const featuredListings = listingsData?.listings ?? [];
  const sponsoredSellers = useMemo(
    () => featuredSellers
      .filter((seller) => typeof (seller as any).sponsorshipLevel === "number" && (seller as any).sponsorshipLevel > 0)
      .sort((a, b) => ((b as any).sponsorshipLevel || 0) - ((a as any).sponsorshipLevel || 0))
      .slice(0, 1),
    [featuredSellers],
  );


  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      <Navbar />
      <OnboardingTutorial />

      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={(el) => {
            heroRef.current = el;
            if (heroFade.ref) heroFade.ref.current = el;
          }} 
          style={heroFade.style} 
          className="relative px-4 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background effects */}
          <div className="absolute inset-0">
            {/* Gradient background that fades to transparent at bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-transparent" />
            
            {/* Animated gradient orbs */}
            <motion.div
              className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-primary/20 rounded-full blur-3xl"
              animate={{
                y: [0, 40, 0],
                x: isHovered ? mousePosition.x * 20 - 10 : [0, 10, 0],
                opacity: [0.3, 0.5, 0.3],
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                scale: { duration: 0.3 },
              }}
            />
            <motion.div
              className="absolute -bottom-20 -right-20 sm:-bottom-40 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl"
              animate={{
                y: [0, -50, 0],
                x: isHovered ? -(mousePosition.x * 15 - 7.5) : [0, -15, 0],
                opacity: [0.2, 0.4, 0.2],
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                scale: { duration: 0.3 },
              }}
            />
            
            {/* Floating geometric shapes */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full"
              animate={{
                y: [0, -20, 0],
                x: isHovered ? mousePosition.x * 10 - 5 : 0,
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-3/4 right-1/3 w-1 h-8 bg-accent/20 rounded-full"
              animate={{
                y: [0, 15, 0],
                x: isHovered ? -(mousePosition.x * 8 - 4) : 0,
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary/20 rotate-45"
              animate={{
                rotate: [45, 135, 45],
                y: [0, -10, 0],
                x: isHovered ? mousePosition.x * 12 - 6 : 0,
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Radial overlay that fades at bottom */}
            <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,transparent_100%)" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-primary/50 bg-primary/10 mb-6 sm:mb-8"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">Next-gen maker platform</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black leading-[1.05] sm:leading-[1.1] tracking-tight mb-4 sm:mb-6 text-white"
              >
                Turn Your Ideas Into{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                  Reality
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4 sm:px-0"
              >
                Join makers worldwide. Sell custom prints, build your audience, and scale your making business on Synthix — the marketplace built for creators.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/register">
                    <NeonButton
                      glowColor="primary"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full flex items-center justify-center gap-2 group"
                    >
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      Start Selling Free
                    </NeonButton>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/listings">
                    <motion.button 
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full border-2 border-primary/50 text-white hover:bg-primary/10 hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm group"
                      whileHover={{ 
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                        borderColor: "rgb(59, 130, 246)"
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      Browse the Shop
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section ref={makersFade.ref} style={makersFade.style} className="py-20 border-y border-white/5 bg-gradient-to-b from-black to-black/80">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Featured makers</h2>
                <p className="mt-3 max-w-xl text-zinc-400">
                  Shops with real listings, equipment, and customer activity from the marketplace.
                </p>
              </div>
              <Link href="/explore" className="text-[#9fe5ff] hover:text-white flex items-center gap-1 font-semibold transition-colors">
                View all makers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loadingSellers
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="glass-panel p-6 rounded-2xl border border-white/5">
                      <Skeleton className="h-40 rounded-2xl bg-white/10" />
                    </div>
                  ))
                : featuredSellers.slice(0, 3).map((seller) => <SellerCard key={seller.id} seller={seller} />)}
            </div>
          </div>
        </section>

        <section ref={productsFade.ref} style={productsFade.style} className="py-20 container mx-auto px-4">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Featured products</h2>
              <p className="mt-3 max-w-xl text-zinc-400">
                Catalog listings surface here automatically from active marketplace inventory.
              </p>
            </div>
            <Link href="/listings" className="text-primary hover:text-white flex items-center gap-1 font-semibold transition-colors">
              Browse all products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingListings
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="glass-panel rounded-2xl border border-white/5 overflow-hidden h-[340px]">
                    <Skeleton className="w-full h-40 bg-white/10 rounded-none" />
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-5 w-3/4 bg-white/10" />
                      <Skeleton className="h-4 w-1/2 bg-white/10" />
                    </div>
                  </div>
                ))
              : featuredListings.slice(0, 3).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </section>

        <section ref={sponsoredFade.ref} style={sponsoredFade.style} className="py-20 border-y border-white/5 bg-gradient-to-br from-black/40 via-amber-500/8 to-black/60">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-200 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Sponsored shop
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold text-white">Featured sponsor spotlight</h2>
                <p className="mt-3 max-w-xl text-zinc-400">
                  Only one premium shop is highlighted at a time so the spotlight stays exclusive.
                </p>
              </div>
              <Link href="/explore?sponsored=true" className="text-amber-300 hover:text-white flex items-center gap-1 font-semibold transition-colors">
                View all sponsored <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loadingSellers
                ? Array.from({ length: 1 }).map((_, index) => (
                    <div key={index} className="glass-panel p-6 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                      <Skeleton className="h-40 rounded-2xl bg-white/10" />
                    </div>
                  ))
                : sponsoredSellers.map((seller) => (
                    <div key={seller.id} className="glass-panel p-6 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 relative overflow-hidden">
                      <div className="absolute top-4 right-4 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                        Sponsored
                      </div>
                      <SellerCard seller={seller} />
                    </div>
                  ))}
            </div>
            {!loadingSellers && sponsoredSellers.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
                <p className="text-zinc-500">No sponsored shops yet. Be the first to boost your visibility!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

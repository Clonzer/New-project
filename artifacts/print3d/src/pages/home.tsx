import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Layers3, Package, ShieldCheck, Sparkles, Store, UserRound, Zap, Rocket, ShoppingCart, Clock } from "lucide-react";
import { useListListings, useListSellers, type Listing, type SellerShop } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeaturedMakersMarquee } from "@/components/layout/AnimatedIntro";
import { OnboardingTutorial } from "@/components/shared/OnboardingTutorial";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { NeonButton } from "@/components/ui/neon-button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { SellerCard } from "@/components/shared/SellerCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalePreferences } from "@/lib/locale-preferences";

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
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { formatPrice } = useLocalePreferences();

  const { data: sellersData, isLoading: loadingSellers } = useListSellers({ limit: 6 });
  const { data: listingsData, isLoading: loadingListings } = useListListings({ limit: 6 });

  const featuredSellers = sellersData?.sellers ?? [];
  const featuredListings = listingsData?.listings ?? [];
  const sellersById = useMemo(() => new Map(featuredSellers.map((seller) => [seller.id, seller])), [featuredSellers]);
  const slides = useMemo(
    () => [
      ...featuredListings
        .slice()
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 4)
        .map((listing) => listingToSlide(listing, sellersById.get(listing.sellerId), formatPrice)),
      ...featuredSellers
        .slice()
        .sort((a, b) => (b.totalPrints + b.reviewCount) - (a.totalPrints + a.reviewCount))
        .slice(0, 3)
        .map(sellerToSlide),
    ],
    [featuredListings, featuredSellers, formatPrice, sellersById],
  );

  useEffect(() => {
    if (!carouselApi) return;
    const update = () => setActiveIndex(carouselApi.selectedScrollSnap());
    update();
    carouselApi.on("select", update);
    carouselApi.on("reInit", update);
    return () => {
      carouselApi.off("select", update);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      if (carouselApi.canScrollNext()) carouselApi.scrollNext();
      else carouselApi.scrollTo(0);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [carouselApi, slides.length]);

  const stats = [
    { label: "Live Makers", value: formatCount(sellersData?.total), icon: UserRound },
    { label: "Live Products", value: formatCount(listingsData?.total), icon: Package },
    { label: "Featured Makers", value: formatCount(featuredSellers.length), icon: Store },
    { label: "Featured Products", value: formatCount(featuredListings.length), icon: Layers3 },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      <Navbar />
      <OnboardingTutorial />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-950" />
            
            {/* Animated gradient orbs */}
            <motion.div
              className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
              animate={{
                y: [0, 40, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
              animate={{
                y: [0, -50, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
            
            {/* Radial overlay */}
            <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center mb-12"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/50 bg-primary/10 mb-8"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">Next-gen maker platform</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[1.1] tracking-tight mb-6 text-white"
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
                className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12"
              >
                Join makers worldwide. Sell custom prints, build your audience, and scale your making business on Synthix — the marketplace built for creators.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/register">
                  <NeonButton
                    glowColor="primary"
                    className="px-8 py-4 text-lg font-semibold rounded-full flex items-center gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    Start Selling Free
                  </NeonButton>
                </Link>
                <Link href="/listings">
                  <button className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-primary/50 text-white hover:bg-primary/10 hover:border-primary transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                    <ShoppingCart className="w-5 h-5" />
                    Browse the Shop
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Featured Makers Marquee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-20 pt-16 border-t border-white/10"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 text-center mb-8">
                Meet the makers building the future
              </p>
              <FeaturedMakersMarquee />
            </motion.div>
          </div>
        </section>
        
        <section className="relative pt-4 pb-16 md:pt-6 md:pb-24 overflow-hidden">
          <AnimatedGradientBg />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-8">
              {loadingSellers || loadingListings ? (
                <Skeleton className="mb-6 h-[24rem] rounded-[2rem] bg-white/10" />
              ) : slides.length ? (
                <div className="mb-6">
                  <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="w-full max-w-5xl mx-auto">
                    <CarouselContent>
                      {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/35">
                            <div className="grid min-h-[26rem] gap-0 lg:min-h-[30rem] lg:grid-cols-[0.95fr_1.05fr]">
                              <div className="flex flex-col justify-between border-b border-white/10 bg-[linear-gradient(155deg,rgba(12,18,31,0.95),rgba(8,12,20,0.82))] p-8 lg:border-b-0 lg:border-r lg:p-10">
                                <div>
                                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9fe5ff]">
                                    Marketplace showcase
                                  </span>
                                  <div className="mt-5 flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                      {slide.storeImageUrl ? (
                                        <img src={slide.storeImageUrl} alt={slide.storeName} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                                          {slide.storeName.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Store</p>
                                      <p className="text-2xl font-display font-bold text-white">{slide.storeName}</p>
                                      <p className="mt-1 text-sm text-zinc-400">{slide.storeMeta}</p>
                                    </div>
                                  </div>
                                  <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-300">{slide.storeSummary}</p>
                                </div>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                  <Link href={slide.storeHref}>
                                    <NeonButton glowColor="white" className="w-full rounded-full px-6 py-4 text-sm">
                                      Visit store
                                    </NeonButton>
                                  </Link>
                                  <Link href="/explore">
                                    <NeonButton glowColor="accent" className="w-full rounded-full px-6 py-4 text-sm">
                                      Explore marketplace
                                    </NeonButton>
                                  </Link>
                                </div>
                              </div>
                              <Link href={slide.href}>
                                <div className="group relative min-h-[26rem] cursor-pointer overflow-hidden lg:min-h-[30rem]">
                                  {slide.imageUrl ? (
                                    <img src={slide.imageUrl} alt={slide.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                  ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,204,255,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,255,179,0.18),transparent_35%),linear-gradient(135deg,rgba(24,24,27,1),rgba(9,9,11,0.92))]" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/15" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                  <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-10">
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                                        {slide.eyebrow}
                                      </span>
                                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                                        {slide.badge}
                                      </span>
                                    </div>
                                    <div className="max-w-2xl">
                                      <h2 className="text-3xl font-display font-bold leading-tight text-white md:text-5xl">{slide.title}</h2>
                                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-200 md:text-base">{slide.description}</p>
                                      <div className="mt-6 flex flex-wrap gap-3">
                                        {[slide.metaA, slide.metaB].map((meta) => (
                                          <div key={meta} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-zinc-100 backdrop-blur-md">
                                            {meta}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-black transition group-hover:bg-[#9fe5ff]">
                                        {slide.cta}
                                        <ChevronRight className="h-4 w-4" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 top-4 translate-y-0 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
                    <CarouselNext className="right-4 top-4 translate-y-0 border-white/15 bg-black/30 text-white hover:bg-white/20 hover:text-white disabled:opacity-40 backdrop-blur-sm" />
                  </Carousel>
                </div>
              ) : null}

              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#9fe5ff] backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Storefront marketplace
                </span>
                <h1 className="mt-6 text-5xl md:text-7xl font-display font-extrabold text-white leading-[0.95] tracking-tight">
                  Find a maker. Compare shops. Order with confidence.
                </h1>
                <p className="mt-5 max-w-2xl text-lg text-zinc-300 leading-relaxed">
                  A cleaner way to discover verified makers, browse ready-to-order products, and request custom work from one storefront.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/explore">
                    <NeonButton glowColor="primary" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                      Browse makers <ChevronRight className="w-5 h-5 ml-1" />
                    </NeonButton>
                  </Link>
                  <Link href="/listings">
                    <NeonButton glowColor="white" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                      Browse catalog
                    </NeonButton>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] items-start">
              <div className="glass-panel rounded-[2rem] border border-white/10 p-4 md:p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
                {loadingSellers || loadingListings ? (
                  <div className="grid gap-4">
                    <Skeleton className="h-[26rem] rounded-[1.5rem] bg-white/10" />
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 rounded-2xl bg-white/10" />
                      ))}
                    </div>
                  </div>
                ) : slides.length > 0 ? (
                  <>
                    <Carousel opts={{ loop: true }} className="w-full">
                      <CarouselContent>
                        {slides.map((slide) => (
                          <CarouselItem key={slide.id}>
                            <Link href={slide.href}>
                              <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40 min-h-[24rem] md:min-h-[28rem] cursor-pointer">
                                {slide.imageUrl ? (
                                  <img
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,204,255,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,255,179,0.18),transparent_35%),linear-gradient(135deg,rgba(24,24,27,1),rgba(9,9,11,0.92))]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/25" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                <div className="relative z-10 flex h-full flex-col justify-between p-7 md:p-10">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9fe5ff] backdrop-blur-md">
                                      {slide.eyebrow}
                                    </span>
                                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                                      {slide.badge}
                                    </span>
                                  </div>

                                  <div className="max-w-2xl">
                                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                                      {slide.title}
                                    </h2>
                                    <p className="mt-4 max-w-xl text-sm md:text-base text-zinc-200 leading-relaxed">
                                      {slide.description}
                                    </p>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                      {[slide.metaA, slide.metaB].map((meta) => (
                                        <div
                                          key={meta}
                                          className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-zinc-100 backdrop-blur-md"
                                        >
                                          {meta}
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-black transition group-hover:bg-[#9fe5ff]">
                                      {slide.cta}
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-4 top-4 translate-y-0 border-white/15 bg-black/50 text-white hover:bg-white hover:text-black disabled:opacity-40" />
                      <CarouselNext className="right-4 top-4 translate-y-0 border-white/15 bg-black/50 text-white hover:bg-white hover:text-black disabled:opacity-40" />
                    </Carousel>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {slides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            activeIndex === index
                              ? "border-[#9fe5ff]/60 bg-[#9fe5ff]/10 text-white"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <p className="text-[11px] uppercase tracking-[0.24em]">{slide.eyebrow}</p>
                          <p className="mt-1 line-clamp-1 text-sm font-semibold">{slide.title}</p>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-10 text-center text-zinc-400">
                    Add makers and listings to populate the live homepage carousel.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="glass-panel rounded-[1.75rem] border border-white/10 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{stat.label}</p>
                          <p className="mt-2 text-3xl font-display font-bold text-white">{stat.value}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#9fe5ff]">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <div className="rounded-[1.75rem] border border-emerald-400/15 bg-emerald-400/10 p-5 text-sm text-emerald-100">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Real marketplace counters
                  </div>
                  <p className="mt-2 leading-relaxed text-emerald-50/85">
                    Seller and product totals are verified against live marketplace records and update as new shops and listings go live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-y border-white/5 bg-black/30">
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

        <section className="py-20 container mx-auto px-4">
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

        <section className="py-20 border-y border-white/5 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-200 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Sponsored shops
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold text-white">Premium maker spotlight</h2>
                <p className="mt-3 max-w-xl text-zinc-400">
                  Featured shops that invest in premium visibility to showcase their expertise and products.
                </p>
              </div>
              <Link href="/explore?sponsored=true" className="text-amber-300 hover:text-white flex items-center gap-1 font-semibold transition-colors">
                View all sponsored <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loadingSellers
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="glass-panel p-6 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                      <Skeleton className="h-40 rounded-2xl bg-white/10" />
                    </div>
                  ))
                : featuredSellers
                    .filter(seller => seller.sponsorshipLevel && seller.sponsorshipLevel > 0) // Assuming sponsorshipLevel field
                    .sort((a, b) => (b.sponsorshipLevel || 0) - (a.sponsorshipLevel || 0)) // Higher sponsorship first
                    .slice(0, 3)
                    .map((seller) => (
                      <div key={seller.id} className="glass-panel p-6 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 relative overflow-hidden">
                        <div className="absolute top-4 right-4 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                          Sponsored
                        </div>
                        <SellerCard seller={seller} />
                      </div>
                    ))}
            </div>
            {featuredSellers.filter(seller => seller.sponsorshipLevel && seller.sponsorshipLevel > 0).length === 0 && (
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

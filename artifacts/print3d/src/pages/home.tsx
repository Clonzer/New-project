import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Layers3, Package, ShieldCheck, Sparkles, Store, UserRound } from "lucide-react";
import { useListListings, useListSellers, type Listing, type SellerShop } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
  | {
      kind: "listing";
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
    }
  | {
      kind: "seller";
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
    };

function formatCount(value: number | undefined) {
  return new Intl.NumberFormat("en-GB").format(value ?? 0);
}

function listingToSlide(listing: Listing, formatPrice: (amountUsd: number) => string): HeroSlide {
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
  const slides = useMemo(
    () => [...featuredListings.slice(0, 3).map((listing) => listingToSlide(listing, formatPrice)), ...featuredSellers.slice(0, 3).map(sellerToSlide)],
    [featuredListings, featuredSellers, formatPrice],
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

      <main className="flex-grow">
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
          <AnimatedGradientBg />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#9fe5ff] backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  Storefront marketplace
                </span>
                <h1 className="mt-6 text-5xl md:text-7xl font-display font-extrabold text-white leading-[0.95] tracking-tight">
                  One store for custom manufacturing, maker shops, and ready-to-order products.
                </h1>
                <p className="mt-5 max-w-xl text-lg text-zinc-300 leading-relaxed">
                  SYNTHIX is built as a real production marketplace: buyers can discover trusted makers, compare shops,
                  order listed products, and request custom fabrication from the same storefront.
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

              <div className="relative min-h-[22rem]">
                <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(159,229,255,0.18),transparent_32%),linear-gradient(145deg,rgba(13,17,23,0.92),rgba(3,7,18,0.8))] shadow-[0_30px_120px_rgba(0,0,0,0.45)]" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute left-6 right-6 top-6 rounded-[1.5rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-zinc-500">
                    <span>Marketplace pulse</span>
                    <span>Live</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    {stats.slice(0, 4).map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.08 }}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
                            <Icon className="w-4 h-4 text-[#9fe5ff]" />
                          </div>
                          <p className="mt-3 text-2xl font-display font-bold text-white">{stat.value}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute bottom-8 left-10 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100"
                >
                  Verified sellers updated live
                </motion.div>
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="absolute bottom-20 right-10 max-w-[16rem] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-zinc-200 backdrop-blur-lg"
                >
                  Compare shops, inspect specialties, and move from inspiration to checkout in one place.
                </motion.div>
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
                    <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="w-full">
                      <CarouselContent>
                        {slides.map((slide) => (
                          <CarouselItem key={slide.id}>
                            <Link href={slide.href}>
                              <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40 min-h-[28rem] md:min-h-[32rem] cursor-pointer">
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
      </main>

      <Footer />
    </div>
  );
}

import { useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Cpu, Layers, Zap, Rocket, Shield, TrendingUp } from "lucide-react";
import { useListSellers, useListListings } from "@workspace/api-client-react";
import { SellerCard } from "@/components/shared/SellerCard";
import { ListingCard } from "@/components/shared/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [0.35, 0]);
  const blob1Y = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const gradientProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const { data: sellersData, isLoading: loadingSellers } = useListSellers({ limit: 4 });
  const { data: listingsData, isLoading: loadingListings } = useListListings({ limit: 4 });

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-32 pb-24 md:pt-52 md:pb-40 overflow-hidden min-h-[90vh] flex items-center">

          {/* Animated aurora gradient background */}
          <AnimatedGradientBg />

          {/* Parallax scroll layer on top of gradient */}
          <motion.div
            style={{ y: blob1Y }}
            className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none z-[1]"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-[100px]" />
          </motion.div>
          <motion.div
            style={{ y: blob2Y }}
            className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none z-[1]"
          >
            <div className="w-full h-full rounded-full bg-accent/10 blur-[80px]" />
          </motion.div>

          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-[2] pointer-events-none" />

          {/* Hero content with scroll fade/parallax */}
          <motion.div
            style={{ y: heroTextY, opacity: heroOpacity }}
            className="container mx-auto px-4 relative z-[3]"
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <span className="inline-block py-1 px-4 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-sm">
                  The Next Evolution of Manufacturing
                </span>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white leading-tight mb-6 tracking-tight">
                  Materialize the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent animate-gradient-x filter drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                    Impossible
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Connect with fabrication shops worldwide — additive, woodworking, metal, and more. From prototypes to production, order custom work securely through SYNTHIX Print.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/explore">
                    <NeonButton glowColor="primary" className="w-full sm:w-auto px-10 py-6 text-lg rounded-full">
                      Browse makers <ChevronRight className="w-5 h-5 ml-1" />
                    </NeonButton>
                  </Link>
                  <Link href="/listings">
                    <NeonButton glowColor="white" className="w-full sm:w-auto px-10 py-6 text-lg rounded-full">
                      Browse Models
                    </NeonButton>
                  </Link>
                </div>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-20 flex flex-col items-center gap-2"
              >
                <span className="text-xs text-zinc-600 uppercase tracking-widest">Scroll to explore</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1"
                >
                  <div className="w-1 h-2 bg-white/40 rounded-full" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Stats bar */}
        <section className="py-8 border-y border-white/5 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "500+", label: "Active Makers" },
                { value: "10K+", label: "Orders fulfilled" },
                { value: "50+", label: "Materials" },
                { value: "4.9★", label: "Avg. Rating" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-2xl md:text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{stat.value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 relative border-b border-white/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">How It Works</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">Secure, escrow-based payments — your money is safe until your order ships.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Layers className="w-8 h-8 text-primary" />, title: "1. Upload & configure", desc: "Send models, drawings, or specs — or buy from the catalog. Agree on materials, finish, and timeline with your seller." },
                { icon: <Cpu className="w-8 h-8 text-accent" />, title: "2. Secure checkout", desc: "Pay securely through SYNTHIX Print. Your payment is held in escrow until the seller ships your order." },
                { icon: <Rocket className="w-8 h-8 text-purple-400" />, title: "3. Track & receive", desc: "Real-time status from production to shipping. Funds are only released to the seller upon shipment." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="glass-panel p-8 rounded-3xl relative group hover:border-primary/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-12 border-b border-white/5 bg-black/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { icon: <Shield className="w-5 h-5 text-emerald-400" />, label: "Escrow Protection" },
                { icon: <TrendingUp className="w-5 h-5 text-primary" />, label: "10% Platform Fee" },
                { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: "Fast Turnaround" },
                { icon: <Rocket className="w-5 h-5 text-accent" />, label: "Tracked Shipping" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Sellers */}
        <section className="py-24 container mx-auto px-4 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex items-end justify-between mb-12 relative z-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Elite Makers</h2>
              <p className="text-zinc-400 max-w-xl">Partner with our highest-rated printing professionals.</p>
            </div>
            <Link href="/explore" className="text-accent hover:text-white flex items-center gap-1 font-semibold transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {loadingSellers ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="w-14 h-14 rounded-full bg-white/10" />
                    <div className="space-y-2 flex-1 pt-2">
                      <Skeleton className="h-4 w-3/4 bg-white/10" />
                      <Skeleton className="h-3 w-1/2 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full bg-white/10 mb-4" />
                  <Skeleton className="h-16 w-full bg-white/10" />
                </div>
              ))
            ) : (
              sellersData?.sellers.map(seller => (
                <SellerCard key={seller.id} seller={seller} />
              ))
            )}
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-24 bg-black/40 border-t border-white/5 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Catalog listings</h2>
                <p className="text-zinc-400 max-w-xl">Ready-made designs and products from top creators — including 3D-printable models and more.</p>
              </div>
              <Link href="/listings" className="text-primary hover:text-white flex items-center gap-1 font-semibold transition-colors">
                Browse Catalog <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingListings ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="glass-panel rounded-2xl border border-white/5 overflow-hidden h-[340px]">
                    <Skeleton className="w-full h-40 bg-white/10 rounded-none" />
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-5 w-3/4 bg-white/10" />
                      <Skeleton className="h-4 w-1/2 bg-white/10" />
                      <Skeleton className="h-10 w-full bg-white/10 mt-6" />
                    </div>
                  </div>
                ))
              ) : (
                listingsData?.listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* CTA — Become a Seller */}
        <section className="py-32 container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden border-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-gradient-x" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <Zap className="w-14 h-14 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Run a shop or studio?</h2>
              <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
                List printers, tools, and services buyers actually need. Join our network of makers and start accepting jobs today. Keep 90% of every sale.
              </p>
              <Link href="/register">
                <NeonButton glowColor="accent" className="px-12 py-6 text-lg rounded-full">
                  Become a Seller — It's Free
                </NeonButton>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

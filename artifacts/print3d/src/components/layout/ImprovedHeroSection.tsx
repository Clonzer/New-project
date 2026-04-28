import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";

export function ImprovedHeroSection() {
  return (
    <section className="relative pt-0 pb-20 md:pb-32 overflow-hidden">
      <AnimatedGradientBg />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 right-[5%] w-96 h-96 bg-gradient-to-l from-accent/20 to-transparent rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6 backdrop-blur-md"
          >
            <Zap className="w-4 h-4" />
            Join 10,000+ Makers & Creators
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-extrabold text-white leading-[1.1] tracking-tight mb-6"
          >
            Turn Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Ideas Into Reality
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            The premium marketplace for custom 3D printing, maker services, and innovative fabrication. Connect with verified makers or start selling your creations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/register">
              <NeonButton glowColor="primary" className="px-8 py-4 text-base rounded-full flex items-center gap-2 group">
                Start Selling Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NeonButton>
            </Link>
            <Link href="/explore">
              <button className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/40 transition-all duration-300 flex items-center gap-2 group">
                Browse the Shop
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">Trusted by makers worldwide</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {[
                { label: "Makers", value: "10K+" },
                { label: "Products", value: "50K+" },
                { label: "Verified Shops", value: "2.5K" },
                { label: "Orders Completed", value: "100K+" },
                { label: "Avg Rating", value: "4.9/5" },
                { label: "24/7 Support", value: "Yes" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="text-center"
                >
                  <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-600 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

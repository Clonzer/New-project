import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { NeonButton } from "@/components/ui/neon-button";
import { OnboardingTutorial } from "@/components/shared/OnboardingTutorial";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      <Navbar />
      <OnboardingTutorial />

      <main className="flex-grow">
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <AnimatedGradientBg />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-3xl text-center mx-auto"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#9fe5ff] backdrop-blur-sm shadow-[0_0_30px_rgba(159,229,255,0.12)]">
                <Sparkles className="w-4 h-4" />
                Storefront marketplace
              </span>
              <h1 className="mt-6 text-5xl md:text-7xl font-display font-extrabold text-white leading-[0.95] tracking-tight">
                Synthix: Your 3D Printing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Marketplace</span>
              </h1>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-zinc-300 leading-relaxed">
                Welcome to Synthix, the easiest way to find verified makers, buy ready-to-ship products, and order custom prints.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
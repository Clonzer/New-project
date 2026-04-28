import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Sparkles, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NeonButton } from "@/components/ui/neon-button";

export function AnimatedIntro() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.15),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-400 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>3D Print Marketplace</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white leading-[0.95] tracking-tight mb-6">
            Find a maker.<br />
            Compare shops.<br />
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Order with confidence.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A cleaner way to discover verified makers, browse ready-to-order products, and request custom work from one storefront.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <NeonButton glowColor="primary" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                  Get Started <ArrowRight className="w-5 h-5 ml-1" />
                </NeonButton>
              </Link>
              <Link href="/explore">
                <NeonButton glowColor="accent" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                  Browse Makers
                </NeonButton>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore">
                <NeonButton glowColor="primary" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                  Explore Marketplace <ArrowRight className="w-5 h-5 ml-1" />
                </NeonButton>
              </Link>
              <Link href="/listings">
                <NeonButton glowColor="accent" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                  Browse Products
                </NeonButton>
              </Link>
            </div>
          )}
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-2xl font-display font-bold text-white">Verified Makers</p>
              <p className="text-sm text-zinc-400 mt-1">Real equipment, real reviews</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-2xl font-display font-bold text-white">Secure Payments</p>
              <p className="text-sm text-zinc-400 mt-1">Protected transactions</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-2xl font-display font-bold text-white">Custom Jobs</p>
              <p className="text-sm text-zinc-400 mt-1">Request unique designs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

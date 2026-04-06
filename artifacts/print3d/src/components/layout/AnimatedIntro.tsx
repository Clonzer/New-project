import { Shield, Users, TrendingUp, Sparkles, Package, ArrowRight } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

export function AnimatedIntro() {
  // Temporary placeholder - we'll add real auth later
  const isLoggedIn = false;

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-medium text-white/80">New Maker Marketplace</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-white mb-6">
          Turn Your Ideas<br />
          Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Reality</span>
        </h1>

        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
          The marketplace for 3D printers, makers, and creators.<br />
          Sell your prints. Connect with buyers. Build your brand.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <NeonButton size="lg" asChild>
            <a href="/register">Start Selling Free</a>
          </NeonButton>
          
          <NeonButton variant="outline" size="lg" asChild>
            <a href="/shop">Browse the Shop</a>
          </NeonButton>
        </div>

        <div className="mt-16 flex justify-center gap-8 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Secure Payments
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Growing Community
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Real Earnings
          </div>
        </div>
      </div>
    </div>
  );
}
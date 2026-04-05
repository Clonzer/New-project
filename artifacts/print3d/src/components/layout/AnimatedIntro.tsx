import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Shield, Users, TrendingUp, Sparkles, Package } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

export function AnimatedIntro() {
  const [hoveredSide, setHoveredSide] = useState<"makers" | "buyers" | null>(null);

  // Create subtle floating dots
  const floatingDots = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    size: Math.random() * 4 + 2, // 2-6px
    x: Math.random() * 100, // 0-100% horizontal
    y: Math.random() * 100, // 0-100% vertical
    duration: Math.random() * 10 + 15, // 15-25s duration
    delay: Math.random() * 5, // 0-5s delay
    opacity: Math.random() * 0.3 + 0.1 // 0.1-0.4 opacity
  }));

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9fe5ff]/5 via-transparent to-[#00ffb3]/5" />
      
      {/* Subtle floating dots */}
      {floatingDots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-white/20"
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            opacity: dot.opacity,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative h-[32rem] md:h-[40rem]">
          
          {/* Left Side - Makers (Dark Background) */}
          <motion.div 
            className="absolute left-0 top-0 w-1/2 h-full bg-black/40 backdrop-blur-sm rounded-l-3xl border-l border-t border-b border-white/10"
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredSide("makers")}
            onHoverEnd={() => setHoveredSide(null)}
          >
            <div className="p-8 md:p-12 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#9fe5ff] to-[#00ffb3] rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Makers</h2>
                </div>
                
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">Build Your Shop & Earn</h3>
                <p className="text-zinc-300 mb-8 max-w-md">
                  Turn your creativity into income. Set up your free shop, showcase your designs, and connect with buyers worldwide.
                </p>
              </div>
              
              {hoveredSide === "makers" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Link href="/register">
                    <NeonButton className="w-full bg-gradient-to-r from-[#9fe5ff] to-[#00ffb3] text-black font-semibold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform">
                      Start Selling Free
                    </NeonButton>
                  </Link>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <Shield className="w-6 h-6 text-[#9fe5ff] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">Protected</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <Users className="w-6 h-6 text-[#00ffb3] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">Community</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <TrendingUp className="w-6 h-6 text-[#9fe5ff] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">Growing</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Side - Buyers (Lighter Background) */}
          <motion.div 
            className="absolute right-0 top-0 w-1/2 h-full bg-white/10 backdrop-blur-sm rounded-r-3xl border-r border-t border-b border-white/10"
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredSide("buyers")}
            onHoverEnd={() => setHoveredSide(null)}
          >
            <div className="p-8 md:p-12 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00ffb3] to-[#9fe5ff] rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-black" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Buyers</h2>
                </div>
                
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">Discover Unique Creations</h3>
                <p className="text-zinc-300 mb-8 max-w-md">
                  Explore one-of-a-kind 3D prints from talented makers. Find unique pieces that express your style.
                </p>
              </div>
              
              {hoveredSide === "buyers" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Link href="/explore">
                    <NeonButton className="w-full bg-gradient-to-r from-[#00ffb3] to-[#9fe5ff] text-black font-semibold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform">
                      Browse Unique Prints
                    </NeonButton>
                  </Link>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-black/20 rounded-xl p-3 border border-white/20">
                      <Shield className="w-6 h-6 text-[#00ffb3] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">Secure</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-white/20">
                      <Users className="w-6 h-6 text-[#9fe5ff] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">Real Stories</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-white/20">
                      <TrendingUp className="w-6 h-6 text-[#00ffb3] mx-auto mb-2" />
                      <p className="text-white text-xs font-medium">Personal</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Center Unified Headline */}
          <motion.div 
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Where Makers and Makers-at-Heart Connect
              </h1>
              <p className="text-zinc-300 text-sm md:text-base max-w-md">
                A marketplace built for creators who love to make and those who love to discover
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

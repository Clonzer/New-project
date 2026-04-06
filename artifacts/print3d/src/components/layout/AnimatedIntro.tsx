import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Users, TrendingUp, Sparkles, Package, ArrowRight } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
//import { useAuth } from "@workspace/api-client-react";

export function AnimatedIntro() {
  const { user } = useAuth();
  
  // Don't show hero if user is signed in
  if (user) {
    return null;
  }

  // Create subtle floating dots
  const floatingDots = Array.from({ length: 25 }, (_, index) => ({
    id: index,
    size: Math.random() * 3 + 1, // 1-4px
    x: Math.random() * 100, // 0-100% horizontal
    y: Math.random() * 100, // 0-100% vertical
    duration: Math.random() * 8 + 12, // 12-20s duration
    delay: Math.random() * 3, // 0-3s delay
    opacity: Math.random() * 0.2 + 0.05 // 0.05-0.25 opacity
  }));

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background gradient matching site */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
      
      {/* Subtle floating dots */}
      {floatingDots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-white/30"
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            opacity: dot.opacity,
          }}
          animate={{
            x: [0, Math.random() * 30 - 15, 0],
            y: [0, Math.random() * 30 - 15, 0],
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
      
      <div className="relative flex h-[85vh]">
        
        {/* Left Side - Makers (White Background) */}
        <motion.div 
          className="w-1/2 h-full bg-white flex items-center justify-center relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-display font-bold text-black mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Makers
            </motion.h2>
            
            <motion.h3 
              className="text-2xl md:text-3xl font-semibold text-black mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Build Your Shop & Earn
            </motion.h3>
            
            <motion.p 
              className="text-gray-600 mb-8 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Turn your creativity into income. Set up your free shop, showcase your designs, and connect with buyers worldwide.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-8"
            >
              <Link href="/register?role=seller">
                <NeonButton className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-full text-lg hover:scale-105 transition-all duration-300 shadow-lg">
                  Start Selling Free
                </NeonButton>
              </Link>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Shield className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-gray-700 text-sm font-medium">Protected</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Users className="w-6 h-6 text-pink-500" />
                  </div>
                  <p className="text-gray-700 text-sm font-medium">Community</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-gray-700 text-sm font-medium">Growing</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Buyers (Black Background) */}
        <motion.div 
          className="w-1/2 h-full bg-black flex items-center justify-center relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-md mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Buyers
            </motion.h2>
            
            <motion.h3 
              className="text-2xl md:text-3xl font-semibold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Discover Unique Creations
            </motion.h3>
            
            <motion.p 
              className="text-gray-300 mb-8 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Explore one-of-a-kind creations from talented makers. Find unique pieces that express your style.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-8"
            >
              <Link href="/register?role=buyer">
                <NeonButton className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-4 px-8 rounded-full text-lg hover:scale-105 transition-all duration-300 shadow-lg">
                  Create Buyer Account
                </NeonButton>
              </Link>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Shield className="w-6 h-6 text-pink-500" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Secure</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Real Stories</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
                    <TrendingUp className="w-6 h-6 text-pink-500" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Personal</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

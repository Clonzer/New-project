import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListSellers, type SellerShop } from "@workspace/api-client-react";
import { ChevronRight, Sparkles } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface FloatingProfileProps {
  seller: SellerShop;
  index: number;
  onClick: (seller: SellerShop) => void;
}

function FloatingProfile({ seller, index, onClick }: FloatingProfileProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ 
        x: -50 - (index * 20), 
        y: Math.random() * 100 - 50,
        opacity: 0 
      }}
      animate={{ 
        x: [0, 10, -5, 0],
        y: [0, -8, 5, 0],
        opacity: 1 
      }}
      transition={{ 
        duration: 4 + index * 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: index * 0.3
      }}
      whileHover={{ 
        scale: 1.15,
        x: 20,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute cursor-pointer"
      style={{
        top: `${20 + (index * 15)}%`,
        left: `${5 + (index * 8)}%`,
        zIndex: isHovered ? 50 : 10 + index
      }}
      onClick={() => onClick(seller)}
    >
      <motion.div
        className={`relative rounded-full border-2 transition-all duration-300 ${
          isHovered 
            ? 'border-[#9fe5ff] shadow-[0_0_30px_rgba(159,229,255,0.6)]' 
            : 'border-white/20 bg-white/10'
        }`}
        animate={isHovered ? {
          boxShadow: [
            '0 0 20px rgba(159,229,255,0.4)',
            '0 0 40px rgba(159,229,255,0.8)',
            '0 0 20px rgba(159,229,255,0.4)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-black/30">
          {seller.avatarUrl ? (
            <img 
              src={seller.avatarUrl} 
              alt={seller.displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
              {seller.displayName?.charAt(0) || seller.shopName?.charAt(0) || '?'}
            </div>
          )}
        </div>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 border border-white/20 rounded-lg px-3 py-2 whitespace-nowrap z-50"
          >
            <p className="text-white text-xs font-medium">{seller.displayName || seller.shopName}</p>
            <p className="text-zinc-400 text-xs">{seller.location || 'Global'}</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function AnimatedIntro() {
  const [selectedSeller, setSelectedSeller] = useState<SellerShop | null>(null);
  const { data: sellersData, isLoading } = useListSellers({ limit: 8 });
  const sellers = sellersData?.sellers.slice(0, 6) || [];

  return (
    <>
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9fe5ff]/10 via-transparent to-[#00ffb3]/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            {/* Left side with floating profiles and text */}
            <div className="relative h-96 md:h-[28rem]">
              {/* Floating profile pictures */}
              {isLoading ? (
                <div className="absolute inset-0">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton 
                      key={index} 
                      className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full"
                      style={{
                        top: `${20 + (index * 15)}%`,
                        left: `${5 + (index * 8)}%`
                      }}
                    />
                  ))}
                </div>
              ) : (
                sellers.map((seller, index) => (
                  <FloatingProfile
                    key={seller.id}
                    seller={seller}
                    index={index}
                    onClick={setSelectedSeller}
                  />
                ))
              )}

              {/* Explore Now text */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute bottom-0 left-0 right-0 text-center lg:text-left"
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                  Explore Now
                </h2>
                <p className="text-zinc-300 mb-6 max-w-md">
                  Discover talented makers and innovative products from our community of creators
                </p>
                <Link href="/explore">
                  <NeonButton glowColor="primary" className="rounded-full px-8 py-4">
                    Start exploring <ChevronRight className="w-5 h-5 ml-2" />
                  </NeonButton>
                </Link>
              </motion.div>
            </div>

            {/* Right side with preview carousel */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="glass-panel rounded-[2rem] border border-white/10 p-1">
                  <div className="bg-black/40 rounded-[1.8rem] p-8 md:p-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-[#9fe5ff]" />
                      <span className="text-[#9fe5ff] text-sm font-semibold uppercase tracking-[0.2em]">
                        Featured Creators
                      </span>
                    </div>
                    
                    {isLoading ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <Skeleton key={index} className="h-24 rounded-xl bg-white/10" />
                        ))}
                      </div>
                    ) : sellers.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {sellers.slice(0, 4).map((seller, index) => (
                          <motion.div
                            key={seller.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => setSelectedSeller(seller)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-black/30 border border-white/10">
                                {seller.avatarUrl ? (
                                  <img src={seller.avatarUrl} alt={seller.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                    {seller.displayName?.charAt(0) || '?'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">
                                  {seller.displayName || seller.shopName}
                                </p>
                                <p className="text-zinc-400 text-xs truncate">
                                  {seller.location || 'Global'} • {seller.printerCount} machines
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-center py-8">
                        No makers available yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Decorative elements */}
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-[#9fe5ff] to-[#00ffb3] rounded-full blur-xl opacity-60"
                />
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#00ffb3] to-[#9fe5ff] rounded-full blur-xl opacity-40"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller detail dialog */}
      <Dialog open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
        <DialogContent className="bg-black/90 border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {selectedSeller?.displayName || selectedSeller?.shopName}
            </DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-black/30 border border-white/10">
                  {selectedSeller.avatarUrl ? (
                    <img src={selectedSeller.avatarUrl} alt={selectedSeller.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedSeller.displayName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-zinc-300 text-sm">{selectedSeller.location || 'Global'}</p>
                  <p className="text-[#9fe5ff] text-sm font-medium">
                    {selectedSeller.printerCount} machines • {selectedSeller.listingCount} listings
                  </p>
                </div>
              </div>
              
              {selectedSeller.bio && (
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {selectedSeller.bio}
                </p>
              )}
              
              <div className="flex gap-3 pt-2">
                <Link href={`/shop/${selectedSeller.id}`} onClick={() => setSelectedSeller(null)}>
                  <NeonButton glowColor="primary" className="flex-1 rounded-full">
                    Visit Shop
                  </NeonButton>
                </Link>
                <Link href="/explore" onClick={() => setSelectedSeller(null)}>
                  <NeonButton glowColor="white" className="flex-1 rounded-full">
                    Explore More
                  </NeonButton>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

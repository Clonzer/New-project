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
        x: 200 + (index * 30), 
        y: (index * 15) - 20,
        opacity: 0 
      }}
      animate={{ 
        x: [-250, -950],
        y: [(index * 15) - 20, (index * 15) - 18],
        opacity: [0, 0.8, 1, 0.6, 0]
      }}
      transition={{ 
        duration: 12 + (index * 0.5),
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        delay: index * 1.2
      }}
      whileHover={{ 
        scale: 1.15,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute cursor-pointer"
      style={{
        top: `${15 + (index * 15)}%`,
        right: `${8 + (index * 2)}%`,
        zIndex: isHovered ? 50 : 20 + index
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
        } : {
          scale: [1, 1.02, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
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
            className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-black/90 border border-white/20 rounded-xl p-4 whitespace-nowrap z-50 w-64"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-black/30 border border-white/10">
                  {seller.avatarUrl ? (
                    <img src={seller.avatarUrl} alt={seller.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {seller.displayName?.charAt(0) || seller.shopName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{seller.displayName || seller.shopName}</h3>
                  <p className="text-zinc-400 text-sm">{seller.location || 'Global'}</p>
                </div>
              </div>
              <div className="text-zinc-300 text-sm">
                <p>{seller.shopAnnouncement || 'Welcome to my shop!'}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-xs">{seller.sellerTags?.[0] || 'Creator'}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function EmptyDot({ index }: { index: number }) {
  // Calculate position with more spacing to prevent overlap
  const row = Math.floor(index / 2); // Only 2 per row for more spacing
  const col = index % 2;
  const baseDelay = index * 1.2;
  
  // Various sizes and colors for visual variety
  const sizes = [
    "w-12 h-12 md:w-16 md:h-16",
    "w-14 h-14 md:w-18 md:h-18", 
    "w-10 h-10 md:w-14 md:h-14",
    "w-16 h-16 md:w-20 md:h-20",
    "w-8 h-8 md:w-12 md:h-12"
  ];
  
  const colors = [
    "border-white/20 bg-white/5",
    "border-cyan-400/30 bg-cyan-400/10",
    "border-purple-400/30 bg-purple-400/10",
    "border-pink-400/30 bg-pink-400/10",
    "border-blue-400/30 bg-blue-400/10"
  ];
  
  const sizeClass = sizes[index % sizes.length];
  const colorClass = colors[index % colors.length];
  
  return (
    <motion.div
      initial={{ 
        x: 180 + (col * 40), 
        y: (row * 18) - 35,
        opacity: 0 
      }}
      animate={{ 
        x: [-250, -1000],
        y: [(row * 18) - 35, (row * 18) - 32],
        opacity: [0, 0.6, 0.8, 0.4, 0]
      }}
      transition={{ 
        duration: 12 + (index * 0.6),
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        delay: baseDelay
      }}
      className="absolute"
      style={{
        top: `${8 + (row * 18)}%`,
        right: `${1 + (col * 4)}%`,
        zIndex: 3 + index
      }}
    >
      <motion.div
        className={`rounded-full border-2 ${sizeClass} ${colorClass}`}
        animate={{
          scale: [1, 1.04, 1],
          rotate: [0, 4, -4, 0]
        }}
        transition={{
          duration: 5 + (index * 0.4),
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
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
        {/* Background gradient matching section below */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9fe5ff]/5 via-transparent to-[#00ffb3]/5" />
        
        <div className="container mx-auto px-4 relative z-10">
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

            {/* Empty dots for future users - conveyor belt effect */}
            {Array.from({ length: 15 }).map((_, index) => (
              <EmptyDot key={`dot-${index}`} index={index} />
            ))}

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

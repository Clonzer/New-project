import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, ArrowRight, Star, MapPin } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

interface Maker {
  id: string;
  username: string;
  avatar: string;
  specialty: string;
  bio: string;
  location: string;
  heroImage: string;
}

const featuredMakers: Maker[] = [
  {
    id: "1",
    username: "@evanhuelin",
    avatar: "https://api.pravatar.cc/150?u=evanhuelin",
    specialty: "Architectural Models",
    bio: "Creating stunning architectural models and prototypes for architects and designers worldwide.",
    location: "San Francisco, CA",
    heroImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=600&fit=crop"
  },
  {
    id: "2", 
    username: "@makerforge",
    avatar: "https://api.pravatar.cc/150?u=makerforge",
    specialty: "Custom Prototypes",
    bio: "Specializing in rapid prototyping and custom mechanical parts for startups and inventors.",
    location: "Austin, TX",
    heroImage: "https://images.unsplash.com/photo-1581091226825-a6a3125c1f4b?w=1920&h=600&fit=crop"
  },
  {
    id: "3",
    username: "@printbydesign", 
    avatar: "https://api.pravatar.cc/150?u=printbydesign",
    specialty: "Artistic Sculptures",
    bio: "Transforming digital art into physical sculptures through advanced printing techniques.",
    location: "Portland, OR",
    heroImage: "https://images.unsplash.com/photo-1563211553215-b3d6e2c05a9a?w=1920&h=600&fit=crop"
  }
];

export function FeaturedMakersMarquee() {
  const [selectedMaker, setSelectedMaker] = useState<Maker | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Create array with real makers and placeholder dots
  const marqueeItems = [
    ...featuredMakers.map((maker) => ({ type: "maker", data: maker })),
    ...Array.from({ length: 8 }, (_, i) => ({ type: "placeholder", id: `placeholder-${i}` }))
  ];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          animation: marquee 30s linear infinite;
        }
        .marquee.paused {
          animation-play-state: paused;
        }
      `}</style>

      <section className="relative w-full bg-zinc-950 py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
        
        <div className="relative z-10 container mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Featured Makers
            </h2>
            <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 text-sm font-medium tracking-wide">
                Early Community
              </span>
            </div>
          </div>

          {/* Marquee Container */}
          <div 
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className={`flex gap-4 marquee ${isPaused ? 'paused' : ''}`}>
              {/* First set */}
              {marqueeItems.map((item, index) => (
                <div key={`first-${item.type === 'maker' ? item.data.id : item.id}`} className="flex-shrink-0">
                  {item.type === 'maker' ? (
                    <motion.div
                      whileHover={{ 
                        scale: 1.05, 
                        rotate: 1,
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
                      }}
                      onClick={() => setSelectedMaker(item.data)}
                      className="w-52 h-72 bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800/50 p-6 cursor-pointer transition-all duration-300 hover:border-cyan-500/50 group"
                    >
                      <div className="flex flex-col h-full">
                        {/* Avatar */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-zinc-700 group-hover:border-cyan-500/50 transition-colors">
                          <img 
                            src={item.data.avatar} 
                            alt={item.data.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 text-center">
                          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                            {item.data.username}
                          </h3>
                          <p className="text-zinc-400 text-sm leading-relaxed">
                            {item.data.specialty}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ opacity: 0.5 }}
                      className="w-52 h-72 bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-zinc-800/30 flex items-center justify-center opacity-35"
                    >
                      <div className="text-center">
                        <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-600 text-xs font-medium">Join Our Community</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {marqueeItems.map((item, index) => (
                <div key={`second-${item.type === 'maker' ? item.data.id : item.id}`} className="flex-shrink-0">
                  {item.type === 'maker' ? (
                    <motion.div
                      whileHover={{ 
                        scale: 1.05, 
                        rotate: 1,
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
                      }}
                      onClick={() => setSelectedMaker(item.data)}
                      className="w-52 h-72 bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800/50 p-6 cursor-pointer transition-all duration-300 hover:border-cyan-500/50 group"
                    >
                      <div className="flex flex-col h-full">
                        {/* Avatar */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-zinc-700 group-hover:border-cyan-500/50 transition-colors">
                          <img 
                            src={item.data.avatar} 
                            alt={item.data.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 text-center">
                          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                            {item.data.username}
                          </h3>
                          <p className="text-zinc-400 text-sm leading-relaxed">
                            {item.data.specialty}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ opacity: 0.5 }}
                      className="w-52 h-72 bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-zinc-800/30 flex items-center justify-center opacity-35"
                    >
                      <div className="text-center">
                        <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-600 text-xs font-medium">Join Our Community</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {selectedMaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
            onClick={() => setSelectedMaker(null)}
          >
            <div className="relative h-full w-full">
              {/* Hero Background */}
              <div className="absolute inset-0">
                <img 
                  src={selectedMaker.heroImage}
                  alt={selectedMaker.username}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" />
              </div>

              {/* Content */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full flex items-center justify-center px-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-4xl w-full text-center">
                  {/* Avatar */}
                  <div className="w-32 h-32 mx-auto mb-8 rounded-3xl overflow-hidden border-4 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                    <img 
                      src={selectedMaker.avatar}
                      alt={selectedMaker.username}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Username */}
                  <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                    {selectedMaker.username}
                  </h1>

                  {/* Specialty */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <p className="text-cyan-400 text-xl font-medium">
                      {selectedMaker.specialty}
                    </p>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    <p className="text-zinc-400 text-lg">
                      {selectedMaker.location}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-zinc-300 text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
                    {selectedMaker.bio}
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <NeonButton
                      onClick={() => setSelectedMaker(null)}
                      className="bg-zinc-800/80 backdrop-blur-sm text-white px-8 py-4 rounded-full border border-zinc-700 hover:bg-zinc-700/80 transition-all"
                    >
                      Close
                    </NeonButton>
                    <NeonButton
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
                    >
                      View Full Profile
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </NeonButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

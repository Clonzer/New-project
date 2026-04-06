import { useState } from "react";
import { Users } from "lucide-react";

type Maker = {
  id: number;
  username: string;
  avatar: string;
  specialty: string;
  isReal: boolean;
};

export function FeaturedMakersMarquee() {
  const [selectedMaker, setSelectedMaker] = useState<Maker | null>(null);

  const makers: Maker[] = [
    { 
      id: 1, 
      username: "evanhuelin", 
      avatar: "https://i.pravatar.cc/150?u=evan", 
      specialty: "3D Printing & Design", 
      isReal: true 
    },
    { 
      id: 2, 
      username: "makerforge", 
      avatar: "https://i.pravatar.cc/150?u=forge", 
      specialty: "Mechanical Parts", 
      isReal: true 
    },
    { 
      id: 3, 
      username: "printbydesign", 
      avatar: "https://i.pravatar.cc/150?u=print", 
      specialty: "Custom Props", 
      isReal: true 
    },
    // Placeholder dots (same visual size as real profiles)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: 100 + i,
      username: "",
      avatar: "",
      specialty: "",
      isReal: false,
    })),
  ];

  return (
    <>
      <div className="py-20 bg-zinc-950 border-t border-b border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Join the maker community
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Connect with verified makers, browse custom products, and bring your ideas to life through professional fabrication.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="flex animate-marquee">
            {makers.map((maker) => (
              <div
                key={maker.id}
                className="flex-shrink-0 w-64 mx-4 cursor-pointer group"
                onClick={() => maker.isReal && setSelectedMaker(maker)}
              >
                {maker.isReal ? (
                  <>
                    <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                      <img 
                        src={maker.avatar} 
                        alt={maker.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-white font-semibold">@{maker.username}</p>
                      <p className="text-cyan-400 text-sm">{maker.specialty}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full aspect-square rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                      <Users className="w-10 h-10 text-white/30" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedMaker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <img 
                src={selectedMaker.avatar} 
                alt={selectedMaker.username}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white">@{selectedMaker.username}</h3>
              <p className="text-cyan-400">{selectedMaker.specialty}</p>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-primary hover:bg-primary/80 text-white rounded-xl py-3 font-semibold">
                View Full Profile
              </button>
              <button 
                onClick={() => setSelectedMaker(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const AnimatedIntro = FeaturedMakersMarquee;

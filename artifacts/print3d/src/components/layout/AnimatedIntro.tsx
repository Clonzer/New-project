import { useState } from "react";
import { Users, Sparkles } from "lucide-react";

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
      avatar: "https://i.pravatar.cc/300?u=evan",
      specialty: "3D Printing & Design",
      isReal: true,
    },
    {
      id: 2,
      username: "makerforge",
      avatar: "https://i.pravatar.cc/300?u=forge",
      specialty: "Mechanical Parts",
      isReal: true,
    },
    {
      id: 3,
      username: "printbydesign",
      avatar: "https://i.pravatar.cc/300?u=print",
      specialty: "Custom Props & Art",
      isReal: true,
    },
    // Placeholder dots (same size as real cards)
    ...Array.from({ length: 14 }, (_, i) => ({
      id: 100 + i,
      username: "",
      avatar: "",
      specialty: "",
      isReal: false,
    })),
  ];

  return (
    <div className="py-24 bg-zinc-950 border-t border-b border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="uppercase tracking-[3px] text-sm font-medium text-white/60">
            EARLY COMMUNITY
          </span>
        </div>

        <h2 className="text-5xl font-bold text-white tracking-tighter mb-3">
          Featured Makers
        </h2>
        <p className="text-xl text-white/60 max-w-2xl">
          Join the first wave of creators building on Synthix
        </p>
      </div>

      {/* Tight Conveyor Scroll */}
      <div className="relative">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {makers.concat(makers).map((maker, index) => (
            <div
              key={`${maker.id}-${index}`}
              onClick={() => maker.isReal && setSelectedMaker(maker)}
              className={`group relative flex-shrink-0 w-56 h-72 rounded-3xl overflow-hidden transition-all duration-300
                ${maker.isReal 
                  ? 'hover:scale-105 hover:-rotate-[1deg] cursor-pointer shadow-2xl ring-1 ring-white/10 hover:ring-cyan-400/50' 
                  : 'cursor-default opacity-40 hover:opacity-60'}`}
            >
              {maker.isReal ? (
                <>
                  <img
                    src={maker.avatar}
                    alt={maker.username}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-6">
                    <p className="text-white font-semibold text-lg">@{maker.username}</p>
                    <p className="text-cyan-400 text-sm mt-1 line-clamp-1">{maker.specialty}</p>
                  </div>
                </>
              ) : (
                // Placeholder Dot
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center border border-white/10">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white/30" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Premium Popup Banner */}
      {selectedMaker && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedMaker(null)}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80">
              <img
                src={selectedMaker.avatar}
                alt={selectedMaker.username}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>

            <div className="p-8">
              <h3 className="text-4xl font-bold text-white">@{selectedMaker.username}</h3>
              <p className="text-cyan-400 text-xl mt-2">{selectedMaker.specialty}</p>

              <div className="mt-8 text-white/70 text-[15px] leading-relaxed">
                One of the early pioneers on Synthix. Known for exceptional quality and creative 3D prints.
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setSelectedMaker(null)}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-medium transition"
                >
                  Close
                </button>
                <button className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-2xl transition">
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
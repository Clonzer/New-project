import { useState } from "react";
import { X, Zap, TrendingUp } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export interface BoostViewsModalProps {
  isOpen: boolean;
  shopName: string;
  onClose: () => void;
}

export function BoostViewsModal({ isOpen, shopName, onClose }: BoostViewsModalProps) {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<"week" | "month" | "quarter">("month");
  const [isProcessing, setIsProcessing] = useState(false);

  const boostTiers = [
    { id: "week", label: "1 Week", price: 29, views: "~500 extra views", color: "from-blue-600 to-cyan-600" },
    { id: "month", label: "1 Month", price: 79, views: "~2,500 extra views", color: "from-purple-600 to-blue-600", highlight: true },
    { id: "quarter", label: "3 Months", price: 199, views: "~10,000 extra views", color: "from-amber-600 to-orange-600" },
  ];

  const handleBoost = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing - in real app, would connect to Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Boost activated!",
        description: `Your shop will get enhanced visibility for ${selectedTier === "week" ? "1 week" : selectedTier === "month" ? "1 month" : "3 months"}.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Boost failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-display font-bold text-white">Boost Your Shop</h2>
          </div>
          <p className="text-sm text-zinc-400">Get enhanced visibility and attract more buyers to {shopName}.</p>
        </div>

        <div className="space-y-3 mb-8">
          {boostTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id as typeof selectedTier)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                selectedTier === tier.id
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white">{tier.label}</p>
                <p className="text-lg font-bold text-primary">${tier.price}</p>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {tier.views}
              </p>
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400 mb-3">What's included:</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Featured placement in "Sponsored Shops"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Enhanced search visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Shop analytics for the boost period</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleBoost}
          disabled={isProcessing}
          className="w-full mb-3"
        >
          <NeonButton
            glowColor="primary"
            className="w-full rounded-full py-3 font-semibold"
          >
            {isProcessing ? "Processing..." : `Boost for $${boostTiers.find(t => t.id === selectedTier)?.price}`}
          </NeonButton>
        </button>

        <button
          onClick={onClose}
          className="w-full rounded-full border border-white/10 py-3 text-white font-semibold hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

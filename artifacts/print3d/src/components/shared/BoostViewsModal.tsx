import { useState } from "react";
import { X, Zap, TrendingUp, Crown, Star, Sparkles, Check } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface BoostViewsModalProps {
  isOpen: boolean;
  shopName: string;
  onClose: () => void;
}

type PlacementTier = "premium" | "gold" | "silver";
type DurationTier = "week" | "month" | "quarter";

export function BoostViewsModal({ isOpen, shopName, onClose }: BoostViewsModalProps) {
  const { toast } = useToast();
  const [placementTier, setPlacementTier] = useState<PlacementTier>("gold");
  const [duration, setDuration] = useState<DurationTier>("month");
  const [isProcessing, setIsProcessing] = useState(false);

  const placementTiers = [
    {
      id: "premium" as const,
      name: "Premium Placement",
      icon: Crown,
      price: { week: 99, month: 299, quarter: 799 },
      frequency: "Top 3 spots always",
      reach: "50,000+ views",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/50",
      features: [
        "Always visible in top 3 results",
        "Featured on homepage carousel",
        "Priority in all category pages",
        "Social media promotion",
        "Email blast to 10k+ users",
        "Analytics dashboard",
      ],
    },
    {
      id: "gold" as const,
      name: "Gold Placement",
      icon: Star,
      price: { week: 49, month: 149, quarter: 399 },
      frequency: "Every 6 items",
      reach: "15,000 views",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/50",
      features: [
        "Appears every 6th item in listings",
        "Featured in Popular Shops carousel",
        "Enhanced search ranking",
        "Newsletter mention",
        "Analytics dashboard",
      ],
    },
    {
      id: "silver" as const,
      name: "Silver Placement",
      icon: Sparkles,
      price: { week: 19, month: 59, quarter: 149 },
      frequency: "Every 10 items",
      reach: "5,000 views",
      color: "from-cyan-400 to-blue-500",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/50",
      features: [
        "Appears every 10th item in listings",
        "Sponsored badge on profile",
        "Basic analytics",
        "Standard support",
      ],
    },
  ];

  const durationLabels = {
    week: "7 days",
    month: "30 days",
    quarter: "90 days",
  };

  const currentTier = placementTiers.find(t => t.id === placementTier)!;
  const currentPrice = currentTier.price[duration];

  const handleBoost = async () => {
    setIsProcessing(true);
    try {
      // In production, this would create a Stripe checkout session
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "🚀 Boost activated!",
        description: `${currentTier.name} active for ${durationLabels[duration]}. Your shop will appear ${currentTier.frequency.toLowerCase()}.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again or contact support.",
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
            <h2 className="text-2xl font-display font-bold text-white">Promote {shopName}</h2>
          </div>
          <p className="text-sm text-zinc-400">Pay for higher placement and more frequent visibility across the platform.</p>
        </div>

        {/* Placement Tier Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Placement Tier</p>
          {placementTiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = placementTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setPlacementTier(tier.id)}
                className={cn(
                  "w-full rounded-2xl border-2 p-4 text-left transition-all",
                  isSelected
                    ? tier.borderColor + " " + tier.bgColor
                    : "border-white/10 bg-white/5 hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-zinc-400")} />
                    <p className={cn("font-semibold", isSelected ? "text-white" : "text-zinc-300")}>
                      {tier.name}
                    </p>
                  </div>
                  <p className={cn("text-lg font-bold", isSelected ? "text-white" : "text-zinc-400")}>
                    ${tier.price[duration]}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={cn(isSelected ? "text-white/80" : "text-zinc-500")}>
                    {tier.frequency}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className={cn(isSelected ? "text-white/80" : "text-zinc-500")}>
                    {tier.reach}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Duration</p>
          <div className="grid grid-cols-3 gap-2">
            {(["week", "month", "quarter"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "py-2 px-3 rounded-xl text-sm font-medium transition-all",
                  duration === d
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20"
                )}
              >
                {durationLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            What's included with {currentTier.name}
          </p>
          <ul className="space-y-2">
            {currentTier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <Check className={cn("w-4 h-4 mt-0.5 shrink-0", currentTier.id === "premium" ? "text-purple-400" : currentTier.id === "gold" ? "text-yellow-400" : "text-cyan-400")} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Summary */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-300">Total for {durationLabels[duration]}</span>
            <span className="text-2xl font-bold text-white">${currentPrice}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Your shop will appear {currentTier.frequency.toLowerCase()} across all listings
          </p>
        </div>

        <button
          onClick={handleBoost}
          disabled={isProcessing}
          className="w-full mb-3"
        >
          <NeonButton
            glowColor={currentTier.id === "premium" ? "accent" : currentTier.id === "gold" ? "primary" : "white"}
            className="w-full rounded-full py-3 font-semibold"
          >
            {isProcessing ? "Processing..." : `Pay $${currentPrice} & Boost Now`}
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

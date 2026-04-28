import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SponsorshipTier {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: string[];
}

const TIERS: SponsorshipTier[] = [
  {
    id: "1",
    name: "Free",
    slug: "free",
    description: "Get started with basic marketplace access",
    price: 0,
    billingPeriod: "free",
    features: [
      "Basic shop profile",
      "List up to 5 products",
      "Standard support",
    ],
  },
  {
    id: "2",
    name: "Featured",
    slug: "featured",
    description: "Premium visibility with advanced features",
    price: 49.99,
    billingPeriod: "monthly",
    features: [
      "Featured on homepage",
      "List unlimited products",
      "Priority support",
      "Shop analytics",
    ],
  },
  {
    id: "3",
    name: "VIP Partner",
    slug: "vip",
    description: "Maximum visibility and dedicated support",
    price: 99.99,
    billingPeriod: "monthly",
    features: [
      "VIP featured placement",
      "Sponsored sections",
      "Dedicated account manager",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  {
    id: "4",
    name: "Partner",
    slug: "partner",
    description: "Strategic partnership opportunities",
    price: 199.99,
    billingPeriod: "monthly",
    features: [
      "Partner program",
      "Co-marketing opportunities",
      "Revenue share options",
      "Premium 24/7 support",
    ],
  },
];

interface SponsorshipTierSelectorProps {
  currentTier?: string;
  onSelectTier: (tier: string) => Promise<void>;
  isLoading?: boolean;
}

export function SponsorshipTierSelector({
  currentTier = "free",
  onSelectTier,
  isLoading = false,
}: SponsorshipTierSelectorProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);

  const getTierIcon = (slug: string) => {
    const icons = {
      free: Sparkles,
      featured: Sparkles,
      vip: Crown,
      partner: Zap,
    };
    return icons[slug as keyof typeof icons] || Sparkles;
  };

  const handleSelectTier = async (tierId: string) => {
    const tier = TIERS.find(t => t.id === tierId);
    if (!tier) return;

    if (tier.price > 0) {
      setConfirmDialog(tierId);
    } else {
      setSelectedTier(tierId);
      await onSelectTier(tier.slug);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!confirmDialog) return;
    const tier = TIERS.find(t => t.id === confirmDialog);
    if (!tier) return;

    setSelectedTier(confirmDialog);
    await onSelectTier(tier.slug);
    setConfirmDialog(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Choose Your Sponsorship Tier</h3>
        <p className="text-zinc-400 text-sm">
          Upgrade your visibility and unlock powerful features to grow your maker business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier, idx) => {
          const Icon = getTierIcon(tier.slug);
          const isSelected = selectedTier === tier.id;
          const isCurrent = currentTier === tier.slug;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                isSelected
                  ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              } ${isCurrent ? "ring-2 ring-emerald-500/50" : ""}`}
            >
              {isCurrent && (
                <Badge
                  className="absolute top-4 right-4 bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                  variant="outline"
                >
                  Current
                </Badge>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-white/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-lg">{tier.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{tier.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-white">
                    {tier.price === 0 ? "Free" : `$${tier.price}`}
                  </span>
                  {tier.billingPeriod !== "free" && (
                    <span className="text-xs text-zinc-400">/{tier.billingPeriod}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier(tier.id)}
                disabled={isLoading || isCurrent}
                className={`w-full py-2.5 rounded-lg font-medium transition-all text-sm ${
                  isCurrent
                    ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 cursor-default"
                    : isSelected
                      ? "bg-primary text-black border border-primary"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                {isCurrent ? "Current Plan" : isSelected ? "Selected" : "Select Plan"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={open => !open && setConfirmDialog(null)}>
        <DialogContent className="bg-zinc-950 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Subscription</DialogTitle>
          </DialogHeader>

          {confirmDialog && TIERS.find(t => t.id === confirmDialog) && (
            <div className="space-y-6 py-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-zinc-400 mb-2">You're upgrading to:</p>
                <p className="text-2xl font-bold text-white mb-3">
                  {TIERS.find(t => t.id === confirmDialog)?.name}
                </p>
                <p className="text-lg">
                  <span className="font-display font-bold text-white">
                    ${TIERS.find(t => t.id === confirmDialog)?.price}
                  </span>
                  <span className="text-zinc-400">/month</span>
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  Your subscription will renew automatically. You can cancel anytime from your account settings. Read our{" "}
                  <a href="/terms" className="underline hover:no-underline">
                    subscription terms
                  </a>
                  .
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <NeonButton
                  glowColor="primary"
                  onClick={handleConfirmUpgrade}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Processing..." : "Confirm & Subscribe"}
                </NeonButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

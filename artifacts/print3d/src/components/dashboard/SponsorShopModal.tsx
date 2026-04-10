import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Crown, Zap, BarChart3, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SponsorShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string;
  onConfirm: (tier: string) => Promise<void>;
}

export function SponsorShopModal({ open, onOpenChange, shopName, onConfirm }: SponsorShopModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const tiers = [
    {
      id: "featured",
      name: "Featured",
      price: 49.99,
      period: "month",
      description: "Premium visibility and features",
      features: [
        "Featured on homepage",
        "List unlimited products",
        "Priority support",
        "Shop analytics",
      ],
      icon: Zap,
      highlight: false,
    },
    {
      id: "vip",
      name: "VIP Partner",
      price: 99.99,
      period: "month",
      description: "Maximum visibility and priority support",
      features: [
        "VIP featured placement",
        "Sponsored sections",
        "Dedicated account manager",
        "Advanced analytics",
        "Custom branding",
      ],
      icon: Crown,
      highlight: true,
    },
    {
      id: "partner",
      name: "Partner",
      price: 199.99,
      period: "month",
      description: "Strategic partnership tier",
      features: [
        "Partner program",
        "Co-marketing opportunities",
        "Revenue share opportunities",
        "Premium support",
      ],
      icon: BarChart3,
      highlight: false,
    },
  ];

  const handleConfirm = async () => {
    if (!selectedTier) {
      toast({
        title: "Please select a tier",
        description: "Choose a sponsorship tier to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(selectedTier);
      toast({
        title: "Sponsorship activated!",
        description: `Your shop is now sponsored with the ${tiers.find(t => t.id === selectedTier)?.name} tier.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to activate sponsorship",
        description: error?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Sponsor Your Shop
          </DialogTitle>
          <DialogDescription>
            Boost visibility for <span className="font-semibold text-white">{shopName}</span>. Choose a sponsorship tier to get featured placement and exclusive features.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {tiers.map((tier) => {
            const TierIcon = tier.icon;
            const isSelected = selectedTier === tier.id;

            return (
              <Card
                key={tier.id}
                className={`Glass cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/50 bg-primary/10"
                    : "border-white/10 hover:border-white/20 bg-black/40"
                } ${tier.highlight ? "md:ring-2 md:ring-amber-400/30" : ""}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TierIcon className="w-4 h-4 text-amber-400" />
                        {tier.name}
                      </CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                    </div>
                    {tier.highlight && (
                      <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mt-4">
                    ${tier.price}
                    <span className="text-sm font-normal text-zinc-400 ml-1">/ {tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isSelected && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/20 border border-primary/50 flex items-center gap-2 text-primary text-sm font-medium">
                      <Check className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="space-y-2 mb-4">
            <h4 className="font-semibold text-white text-sm">What's included?</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Automatic featured placement based on your tier</li>
              <li>• Priority support from our team</li>
              <li>• Shop analytics dashboard</li>
              <li>• Monthly billing with flexible cancellation</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <NeonButton
            glowColor="primary"
            disabled={!selectedTier || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? "Processing..." : "Activate Sponsorship"}
          </NeonButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

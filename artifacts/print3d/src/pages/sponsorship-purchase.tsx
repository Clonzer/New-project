import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createSponsorshipCheckoutSession } from "@/lib/payments-api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  Trophy,
  Star,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Crown,
  TrendingUp,
  Settings,
  Palette,
  Type
} from "lucide-react";

const SPONSORSHIP_TIERS = [
  {
    id: "featured",
    name: "Featured",
    description: "Boost your visibility across the platform",
    price: 19.99,
    duration: "month",
    features: [
      "Featured badge on profile",
      "Priority in search results",
      "Homepage spotlight",
      "Analytics dashboard",
      "Custom promotional message"
    ],
    customizable: [
      { id: "badge_color", label: "Badge Color", type: "color", options: ["amber", "purple", "cyan", "emerald"] },
      { id: "promo_message", label: "Promotional Message", type: "text", maxLength: 50, placeholder: "e.g., Top Rated Maker" }
    ],
    icon: Star,
    color: "from-primary to-accent"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Maximum exposure with custom branding",
    price: 49.99,
    duration: "month",
    popular: true,
    features: [
      "Everything in Featured",
      "Animated profile banner",
      "Highlighted listings",
      "Priority support",
      "Custom brand colors",
      "Verified maker badge"
    ],
    customizable: [
      { id: "brand_color", label: "Primary Brand Color", type: "color", options: ["all"] },
      { id: "banner_text", label: "Banner Headline", type: "text", maxLength: 40, placeholder: "e.g., Custom 3D Prints" },
      { id: "show_reviews", label: "Display Review Count", type: "toggle", default: true },
      { id: "highlight_listings", label: "Highlight Top Listings", type: "number", min: 1, max: 5, default: 3 }
    ],
    icon: Crown,
    color: "from-amber-400 via-yellow-400 to-amber-500"
  }
];

export default function SponsorshipPurchase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customOptions, setCustomOptions] = useState<Record<string, any>>({
    badge_color: "amber",
    promo_message: "",
    brand_color: "#8b5cf6",
    banner_text: "",
    show_reviews: true,
    highlight_listings: 3,
  });

  const handlePurchase = async (tierId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase sponsorship.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedTier(tierId);

      const tier = SPONSORSHIP_TIERS.find(t => t.id === tierId);
      const result = await createSponsorshipCheckoutSession({
        sponsorshipType: tierId as "featured" | "premium",
        quantity: 1,
        successPath: "/dashboard?success=true",
        cancelPath: "/sponsorship/purchase?cancelled=true",
        metadata: {
          tierId,
          customizations: customOptions
        }
      });

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: getApiErrorMessage(error),
        variant: "destructive"
      });
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-6">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Trophy className="w-4 h-4" />
                Boost Your Visibility
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Sponsorship Plans
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Increase your visibility and reach more customers with our sponsorship packages. 
                Stand out from the crowd and grow your 3D printing business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {SPONSORSHIP_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`h-full bg-zinc-900/50 border-zinc-800 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
                      tier.popular ? 'border-primary/50 ring-1 ring-primary/20' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center mb-4`}>
                        <tier.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {tier.popular && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary text-xs font-medium px-3 py-1 mb-2 w-fit">
                          <Zap className="w-3 h-3" />
                          Most Popular
                        </div>
                      )}
                      
                      <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                      <CardDescription className="text-zinc-400">
                        {tier.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">${tier.price}</span>
                        <span className="text-zinc-500">/{tier.duration}</span>
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-zinc-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Customization Options */}
                      {tier.customizable && tier.customizable.length > 0 && (
                        <div className="border-t border-white/10 pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Settings className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-300">Customize</span>
                          </div>
                          <div className="space-y-3">
                            {tier.customizable.map((option) => (
                              <div key={option.id} className="space-y-1.5">
                                <label className="text-xs text-zinc-500">{option.label}</label>
                                {option.type === "color" && (
                                  <div className="flex gap-2">
                                    {(option.options?.includes("all") ? ["amber", "purple", "cyan", "emerald", "pink", "blue"] : option.options)?.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() => setCustomOptions(prev => ({ ...prev, [option.id]: color }))}
                                        className={`w-6 h-6 rounded-full bg-${color}-500 ${customOptions[option.id] === color ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                )}
                                {option.type === "text" && (
                                  <div className="flex items-center gap-2">
                                    <Type className="w-4 h-4 text-zinc-500" />
                                    <Input
                                      value={customOptions[option.id] || ""}
                                      onChange={(e) => setCustomOptions(prev => ({ ...prev, [option.id]: e.target.value }))}
                                      placeholder={option.placeholder}
                                      maxLength={option.maxLength}
                                      className="h-8 text-sm bg-black/30 border-white/10 text-white"
                                    />
                                  </div>
                                )}
                                {option.type === "toggle" && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">{option.label}</span>
                                    <Switch
                                      checked={customOptions[option.id] ?? option.default}
                                      onCheckedChange={(checked) => setCustomOptions(prev => ({ ...prev, [option.id]: checked }))}
                                    />
                                  </div>
                                )}
                                {option.type === "number" && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={option.min}
                                      max={option.max}
                                      value={customOptions[option.id] || option.default}
                                      onChange={(e) => setCustomOptions(prev => ({ ...prev, [option.id]: parseInt(e.target.value) || option.default }))}
                                      className="h-8 w-20 text-sm bg-black/30 border-white/10 text-white"
                                    />
                                    <span className="text-xs text-zinc-500">listings</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handlePurchase(tier.id)}
                        disabled={isProcessing}
                        className={`w-full ${
                          tier.popular 
                            ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                      >
                        {isProcessing && selectedTier === tier.id ? (
                          "Processing..."
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-zinc-900/30 border-y border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white text-center mb-12">
                Why Sponsor Your <span className="text-primary">Business</span>?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: TrendingUp,
                    title: "Increase Visibility",
                    description: "Get your profile and products in front of thousands of potential customers actively looking for 3D printing services."
                  },
                  {
                    icon: Star,
                    title: "Build Trust",
                    description: "Sponsored badges and featured placements signal quality and professionalism to buyers."
                  },
                  {
                    icon: Zap,
                    title: "Faster Growth",
                    description: "Sellers with sponsorships see an average of 3x more inquiries and orders."
                  },
                  {
                    icon: Crown,
                    title: "Premium Positioning",
                    description: "Appear at the top of search results and category pages, ahead of non-sponsored listings."
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-zinc-400 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white text-center mb-12">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    q: "How quickly will my sponsorship take effect?",
                    a: "Sponsorships are activated immediately after payment. Your badges and featured placements will appear within minutes."
                  },
                  {
                    q: "Can I cancel my sponsorship?",
                    a: "Yes, you can cancel anytime. Your sponsorship benefits will continue until the end of your current billing period."
                  },
                  {
                    q: "How do I track my sponsorship performance?",
                    a: "You'll have access to a dedicated analytics dashboard showing impressions, clicks, and conversion metrics."
                  },
                  {
                    q: "What's the difference between profile and product sponsorship?",
                    a: "Profile sponsorship promotes your entire shop and brand, while product sponsorship highlights specific items in your catalog."
                  },
                  {
                    q: "What's the difference between profile and product sponsorship?",
                    a: "Profile sponsorship promotes your entire shop and brand, while product sponsorship highlights specific items in your catalog."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6"
                  >
                    <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                    <p className="text-zinc-400 text-sm">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

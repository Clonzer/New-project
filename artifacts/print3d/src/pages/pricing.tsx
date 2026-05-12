import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Megaphone, Package, Rocket, Star, Users, X, Zap, Sparkles, Shield, ArrowRight, Tag } from "lucide-react";
import { getSponsorshipDiscount, PLAN_LIMITS, calculateEnterprisePrice, getEnterpriseBasePrice, getEnterpriseSeatPrice } from "@/lib/plan-utils";
import { useListListings } from "@/lib/workspace-api-mock";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { createSponsorshipCheckoutSession } from "@/lib/payments-api";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    iconColor: "text-zinc-300",
    price: { monthly: 0, yearly: 0 },
    platformFee: 10,
    badge: null,
    highlight: false,
    description: "A strong free base for new shops getting their first products and quotes live.",
    features: [
      { text: "3 catalog listings included", included: true },
      { text: "Custom request inbox", included: true },
      { text: "Shop messaging", included: true },
      { text: "Portfolio and reviews", included: true },
      { text: "Basic storefront customization", included: true },
      { text: "Sponsored placement discounts", included: false },
      { text: "Analytics and conversion insights", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free",
    glow: "white" as const,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    iconColor: "text-primary",
    price: { monthly: 19, yearly: 15 },
    platformFee: 7,
    badge: "Most Popular",
    highlight: true,
    description: "For sellers who want lower fees, stronger visibility, and better shop operations.",
    features: [
      { text: "20 catalog listings included", included: true },
      { text: "Priority quote requests", included: true },
      { text: "Advanced storefront customization", included: true },
      { text: "Performance analytics", included: true },
      { text: "Launch support for promotions", included: true },
      { text: "10% off sponsorships", included: true },
      { text: "Priority support", included: true },
      { text: "Managed enterprise onboarding", included: false },
    ],
    cta: "Upgrade to Pro",
    glow: "primary" as const,
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    iconColor: "text-yellow-400",
    price: { monthly: 49, yearly: 39 },
    platformFee: 5,
    badge: "Seller Growth",
    highlight: false,
    description: "For shops running real volume and needing more merchandising and launch tooling.",
    features: [
      { text: "Unlimited listings", included: true },
      { text: "Homepage merchandising consideration", included: true },
      { text: "Deeper analytics and trend tracking", included: true },
      { text: "Priority quote routing", included: true },
      { text: "Custom shop branding controls", included: true },
      { text: "20% off sponsorships", included: true },
      { text: "Fast-track support", included: true },
      { text: "Managed enterprise onboarding", included: false },
    ],
    cta: "Upgrade to Elite",
    glow: "accent" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Rocket,
    iconColor: "text-cyan-300",
    price: { monthly: 0, yearly: 0 },
    platformFee: 3,
    badge: "Per-Seat",
    highlight: false,
    description: "Per-seat plan for teams. Base fee + per member pricing. Perfect for studios and multi-person shops.",
    features: [
      { text: "Unlimited listings", included: true },
      { text: "3% platform fee", included: true },
      { text: "Team member management", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support and escalation", included: true },
      { text: "Custom branding", included: true },
      { text: "White-glove rollout", included: true },
    ],
    cta: "Buy Now",
    glow: "primary" as const,
  },
] as const;

// Animated background with gradient orbs
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-zinc-950" />
    </div>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [yearly, setYearly] = useState(false);
  const [isStartingProfileSponsor, setIsStartingProfileSponsor] = useState(false);
  const [isStartingListingSponsor, setIsStartingListingSponsor] = useState(false);
  const [isStartingHomepageFeatured, setIsStartingHomepageFeatured] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [profileDuration, setProfileDuration] = useState<7 | 14 | 30>(14);
  const [listingDuration, setListingDuration] = useState<7 | 14 | 30>(14);
  const [bundleDuration, setBundleDuration] = useState<7 | 14 | 30>(14);
  const [enterpriseSeats, setEnterpriseSeats] = useState<number>(5);
  const isSeller = user?.role === "seller" || user?.role === "both";
  const { data: ownListingsData } = useListListings();
  const [activeTab, setActiveTab] = useState<"plans" | "sponsorships">("plans");

  useEffect(() => {
    if (!selectedListingId && ownListingsData?.listings?.length) {
      setSelectedListingId(ownListingsData.listings[0].id);
    }
  }, [ownListingsData?.listings, selectedListingId]);

  // Handle hash changes for tab switching
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "sponsorships" || hash === "plans") {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Handle successful sponsorship checkout with auto-apply
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sponsorship = params.get("sponsorship");

    if (checkout === "success" && sponsorship) {
      // Auto-apply the sponsorship
      toast({
        title: "Sponsorship activated!",
        description: "Your sponsorship is now active and will be automatically applied.",
      });

      // Clear the URL parameters
      params.delete("checkout");
      params.delete("sponsorship");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `/pricing?${next}#sponsorships` : "/pricing#sponsorships");

      // Switch to sponsorships tab
      setActiveTab("sponsorships");
    }
  }, [toast]);

  const plans = useMemo(
    () =>
      PLANS.map((plan) => ({
        ...plan,
        activePrice: yearly ? plan.price.yearly : plan.price.monthly,
      })),
    [yearly],
  );

  const startPlanCheckout = (planId: string, seats?: number) => {
    if (!user) {
      setLocation("/register");
      return;
    }
    if (planId === "starter") {
      setLocation("/settings?section=payment");
      return;
    }
    const seatParam = planId === "enterprise" && seats ? `&seats=${seats}` : "";
    window.location.href = `/api/payments/checkout-session?plan=${planId}&billing=${yearly ? "yearly" : "monthly"}${seatParam}&successPath=/dashboard?checkout=success&plan=${planId}`;
  };

  const startProfileSponsorship = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    setIsStartingProfileSponsor(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "profile",
        duration: profileDuration,
        successPath: `/pricing?checkout=success&sponsorship=profile`,
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingProfileSponsor(false);
    }
  };

  const startListingSponsorship = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    if (!selectedListingId) {
      toast({ title: "No listing selected", description: "Please select a listing to sponsor." });
      return;
    }
    setIsStartingListingSponsor(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "listing",
        listingId: selectedListingId,
        duration: listingDuration,
        successPath: `/pricing?checkout=success&sponsorship=listing`,
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingListingSponsor(false);
    }
  };

  const startHomepageFeatured = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    if (!selectedListingId) {
      toast({ title: "No listing selected", description: "Please select a listing to sponsor." });
      return;
    }
    setIsStartingHomepageFeatured(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "homepage_featured",
        listingId: selectedListingId,
        duration: bundleDuration,
        successPath: "/pricing?checkout=success&sponsorship=homepage_featured",
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingHomepageFeatured(false);
    }
  };

  return (
    <>
      <SEOMeta
        title="Pricing & Plans | Synthix Marketplace Fees"
        description="Transparent pricing for vendors on Synthix. View our commission rates, listing fees, and sponsorship options. Start selling your 3D printing services today."
        canonical="https://synthix.com/pricing"
        type="website"
        keywords={["synthix pricing", "marketplace fees", "vendor fees", "3D printing business", "commission rates"]}
      />
      <MarketplaceStructuredData />

      <div className="min-h-screen flex flex-col bg-zinc-950">
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-28 pb-12">
            <div className="container mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }} 
                className="text-center max-w-3xl mx-auto"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Grow your{" "}
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                      Shop
                    </span>
                  </h2>
                  <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Plans shape your long-term seller tooling. Sponsorships are the fast lane for short-term visibility.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Tab Navigation */}
          <section className="pb-10">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
                  <button
                    onClick={() => {
                      setActiveTab("plans");
                      window.location.hash = "plans";
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTab === "plans" 
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Plans
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("sponsorships");
                      window.location.hash = "sponsorships";
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTab === "sponsorships" 
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Sponsorships
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Plans Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "plans" && (
              <motion.section
                key="plans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-20"
              >
                <div className="container mx-auto px-4">
                  {/* Billing Toggle */}
                  <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
                      <button
                        onClick={() => setYearly(false)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          !yearly 
                            ? "bg-zinc-800 text-white shadow-sm" 
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setYearly(true)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          yearly 
                            ? "bg-zinc-800 text-white shadow-sm" 
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Yearly
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                          Save 20%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Pricing Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => {
                      const Icon = plan.icon;
                      const isEnterprise = plan.id === "enterprise";

                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          whileHover={{ y: -8, transition: { duration: 0.2 } }}
                          className={`relative flex flex-col rounded-2xl border backdrop-blur-sm overflow-hidden ${
                            plan.highlight 
                              ? "border-violet-500/50 bg-gradient-to-b from-violet-950/40 to-zinc-950/80 shadow-2xl shadow-violet-500/20" 
                              : "border-white/10 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-900/60"
                          }`}
                        >
                          {/* Badge */}
                          {plan.badge && (
                            <div className="absolute top-0 left-0 right-0 flex justify-center">
                              <div className={`px-4 py-1 rounded-b-lg text-xs font-bold ${
                                plan.highlight 
                                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" 
                                  : "bg-zinc-800 text-zinc-300 border-x border-b border-white/10"
                              }`}>
                                {plan.badge}
                              </div>
                            </div>
                          )}

                          <div className="p-6 flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4 pt-2">
                              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                                plan.highlight 
                                  ? "border-violet-500/30 bg-violet-500/10" 
                                  : "border-white/10 bg-zinc-800/50"
                              }`}>
                                <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                              {isEnterprise ? (
                                <div className="space-y-2">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">
                                      ${calculateEnterprisePrice(enterpriseSeats)}
                                    </span>
                                    <span className="text-sm text-zinc-500">/mo</span>
                                  </div>
                                  <p className="text-xs text-zinc-400">
                                    Base ${getEnterpriseBasePrice()} + {enterpriseSeats} seats × ${getEnterpriseSeatPrice()}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-4xl font-bold text-white">
                                    {plan.activePrice === 0 ? "Free" : `$${plan.activePrice}`}
                                  </span>
                                  {plan.activePrice > 0 && (
                                    <span className="text-sm text-zinc-500">/{yearly ? "mo" : "mo"}</span>
                                  )}
                                </div>
                              )}
                              {yearly && plan.activePrice > 0 && !isEnterprise && (
                                <p className="text-xs text-emerald-400 mt-1">
                                  Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                                </p>
                              )}
                            </div>

                            {/* Platform Fee Badge */}
                            <div className={`inline-flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold mb-4 ${
                              plan.highlight
                                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                                : "bg-zinc-800/50 text-zinc-300 border border-white/10"
                            }`}>
                              <Shield className="w-4 h-4" />
                              <span>{plan.platformFee}%</span>
                              <span className="text-zinc-500 font-normal">fee</span>
                            </div>

                            {/* Enterprise Seat Selector */}
                            {isEnterprise && (
                              <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                <label className="block text-xs text-cyan-300 font-medium mb-2 uppercase tracking-wider">
                                  Team Size (Seats)
                                </label>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => setEnterpriseSeats(Math.max(1, enterpriseSeats - 1))}
                                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={enterpriseSeats}
                                    onChange={(e) => setEnterpriseSeats(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                    className="w-16 text-center bg-black/30 border border-white/10 rounded-lg py-1.5 text-white font-semibold"
                                  />
                                  <button
                                    onClick={() => setEnterpriseSeats(Math.min(100, enterpriseSeats + 1))}
                                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                  Includes you + {enterpriseSeats - 1} team members
                                </p>
                              </div>
                            )}

                            {/* Description */}
                            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                              {plan.description}
                            </p>

                            {/* Features */}
                            <ul className="flex-1 space-y-2.5 mb-6">
                              {plan.features.map((feature) => (
                                <li key={feature.text} className={`flex items-start gap-2.5 text-sm ${
                                  feature.included ? "text-zinc-300" : "text-zinc-600"
                                }`}>
                                  {feature.included ? (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 shrink-0 mt-0">
                                      <Check className="h-3 w-3 text-emerald-400" />
                                    </div>
                                  ) : (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 shrink-0 mt-0">
                                      <X className="h-3 w-3 text-zinc-600" />
                                    </div>
                                  )}
                                  <span className={feature.included ? "" : "line-through"}>
                                    {feature.text}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                              onClick={() => startPlanCheckout(plan.id, isEnterprise ? enterpriseSeats : undefined)}
                              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                plan.highlight
                                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                                  : isEnterprise
                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20"
                              }`}
                            >
                              <span className="flex items-center justify-center gap-2">
                                {plan.cta}
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Sponsorships Tab - Simplified */}
            {activeTab === "sponsorships" && (
              <motion.section
                key="sponsorships"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-20"
              >
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto">
                    {/* Simple Header */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-10"
                    >
                      <h2 className="text-3xl font-bold text-white mb-3">Boost Your Visibility</h2>
                      <p className="text-zinc-400 max-w-lg mx-auto">
                        One-click sponsorships that activate instantly. No setup required.
                      </p>
                    </motion.div>

                    {/* Simple 3-Option Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Profile Boost */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-sm p-6 hover:border-violet-400/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
                            <Users className="h-6 w-6 text-violet-400" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">Profile Boost</h3>
                        <p className="text-sm text-zinc-400 mb-4">Get featured across the marketplace</p>

                        {/* Duration Selector */}
                        <div className="mb-3">
                          <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                            {[7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => setProfileDuration(days as 7 | 14 | 30)}
                                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                  profileDuration === days
                                    ? "bg-violet-500/30 text-violet-300"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                {days}d
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic Price */}
                        {(() => {
                          const prices = { 7: 19, 14: 29, 30: 59 };
                          return (
                            <div className="mb-4">
                              <span className="text-4xl font-bold text-white">${prices[profileDuration]}</span>
                              <span className="text-zinc-500 text-sm"> / {profileDuration} days</span>
                            </div>
                          );
                        })()}

                        <ul className="space-y-2 mb-6 text-sm text-zinc-300">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-violet-400" />
                            Featured shop placement
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-violet-400" />
                            Priority in discovery
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-violet-400" />
                            Auto-activates instantly
                          </li>
                        </ul>

                        <button
                          onClick={() => void startProfileSponsorship()}
                          disabled={isStartingProfileSponsor}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingProfileSponsor ? "Starting..." : `Boost for ${profileDuration} Days`}
                        </button>
                      </motion.div>

                      {/* Product Boost */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-6 hover:border-cyan-400/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                            <Package className="h-6 w-6 text-cyan-400" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">Product Boost</h3>
                        <p className="text-sm text-zinc-400 mb-4">Push one listing to the top</p>

                        {/* Duration Selector */}
                        <div className="mb-3">
                          <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                            {[7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => setListingDuration(days as 7 | 14 | 30)}
                                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                  listingDuration === days
                                    ? "bg-cyan-500/30 text-cyan-300"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                {days}d
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic Price */}
                        {(() => {
                          const prices = { 7: 12, 14: 19, 30: 39 };
                          return (
                            <div className="mb-3">
                              <span className="text-4xl font-bold text-white">${prices[listingDuration]}</span>
                              <span className="text-zinc-500 text-sm"> / {listingDuration} days</span>
                            </div>
                          );
                        })()}

                        {/* Listing Selector */}
                        <div className="mb-4">
                          <select
                            value={selectedListingId ?? ""}
                            onChange={(e) => setSelectedListingId(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          >
                            {!ownListingsData?.listings?.length ? (
                              <option value="">No listings</option>
                            ) : (
                              ownListingsData.listings.map((listing) => (
                                <option key={listing.id} value={listing.id}>
                                  {listing.title}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <ul className="space-y-2 mb-6 text-sm text-zinc-300">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-cyan-400" />
                            Top search results
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-cyan-400" />
                            Featured in catalog
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-cyan-400" />
                            Auto-activates instantly
                          </li>
                        </ul>

                        <button
                          onClick={() => void startListingSponsorship()}
                          disabled={isStartingListingSponsor || !ownListingsData?.listings?.length}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingListingSponsor ? "Starting..." : `Boost for ${listingDuration} Days`}
                        </button>
                      </motion.div>

                      {/* Premium Bundle */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-6 hover:border-yellow-400/50 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                          Best Value
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                            <Star className="h-6 w-6 text-yellow-400" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">Premium Bundle</h3>
                        <p className="text-sm text-zinc-400 mb-4">Profile + Product + Homepage</p>

                        {/* Duration Selector */}
                        <div className="mb-3">
                          <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                            {[7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => setBundleDuration(days as 7 | 14 | 30)}
                                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                  bundleDuration === days
                                    ? "bg-yellow-500/30 text-yellow-300"
                                    : "text-zinc-500 hover:text-zinc-300"
                                }`}
                              >
                                {days}d
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic Price */}
                        {(() => {
                          const prices = { 7: 49, 14: 79, 30: 149 };
                          const savings = { 7: 22, 14: 38, 30: 78 };
                          return (
                            <div className="mb-3">
                              <span className="text-4xl font-bold text-white">${prices[bundleDuration]}</span>
                              <span className="text-zinc-500 text-sm"> / {bundleDuration} days</span>
                              <div className="text-xs text-emerald-400 mt-1">Save ${savings[bundleDuration]}</div>
                            </div>
                          );
                        })()}

                        {/* Listing Selector */}
                        <div className="mb-4">
                          <select
                            value={selectedListingId ?? ""}
                            onChange={(e) => setSelectedListingId(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                          >
                            {!ownListingsData?.listings?.length ? (
                              <option value="">Select listing</option>
                            ) : (
                              ownListingsData.listings.map((listing) => (
                                <option key={listing.id} value={listing.id}>
                                  {listing.title}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <ul className="space-y-2 mb-6 text-sm text-zinc-300">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-yellow-400" />
                            Homepage featured spot
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-yellow-400" />
                            Profile + Product boost
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-yellow-400" />
                            Maximum visibility
                          </li>
                        </ul>

                        <button
                          onClick={() => void startHomepageFeatured()}
                          disabled={isStartingHomepageFeatured || !ownListingsData?.listings?.length}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingHomepageFeatured ? "Starting..." : `Get Premium (${bundleDuration} Days)`}
                        </button>
                      </motion.div>
                    </div>

                    {/* Auto-activation Note */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 text-center"
                    >
                      <div className="inline-flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-full border border-white/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                        All boosts auto-activate after payment — no setup needed
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </main>

        <Footer />
      </div>
    </>
  );
}

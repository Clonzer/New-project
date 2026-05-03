import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Megaphone, Package, Rocket, Star, Users, X, Zap, Sparkles, Shield, ArrowRight, Tag } from "lucide-react";
import { getSponsorshipDiscount, PLAN_LIMITS } from "@/lib/plan-utils";
import { useListListings } from "@/lib/workspace-api-mock";
import { Navbar } from "@/components/layout/Navbar";
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
    platformFee: 0,
    badge: "Custom",
    highlight: false,
    description: "Custom commercial setup for studios, teams, and partners that need more than a normal seller plan.",
    features: [
      { text: "Custom commercial terms", included: true },
      { text: "Negotiated fees", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "Merchandising and launch planning", included: true },
      { text: "Procurement or managed workflows", included: true },
      { text: "Priority support and escalation", included: true },
      { text: "Account assignment by owner", included: true },
      { text: "White-glove rollout", included: true },
    ],
    cta: "Learn More",
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
  const [isStartingProfileMonthlySponsor, setIsStartingProfileMonthlySponsor] = useState(false);
  const [isStartingListingMonthlySponsor, setIsStartingListingMonthlySponsor] = useState(false);
  const [isStartingHomepageFeatured, setIsStartingHomepageFeatured] = useState(false);
  const [isStartingSearchPriority, setIsStartingSearchPriority] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [profileDuration, setProfileDuration] = useState<7 | 14 | 30>(14);
  const [listingDuration, setListingDuration] = useState<7 | 14 | 30>(14);
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

  const startPlanCheckout = (planId: string) => {
    if (!user) {
      setLocation("/register");
      return;
    }
    if (planId === "starter") {
      setLocation("/settings?section=payment");
      return;
    }
    window.location.href = `/api/payments/stripe/checkout?plan=${planId}&billing=${yearly ? "yearly" : "monthly"}&successPath=/dashboard?checkout=success&plan=${planId}`;
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
        successPath: `/pricing?checkout=success&sponsorship=profile&duration=${profileDuration}`,
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
        successPath: `/pricing?checkout=success&sponsorship=listing&duration=${listingDuration}`,
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingListingSponsor(false);
    }
  };

  const startProfileMonthlySponsorship = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    setIsStartingProfileMonthlySponsor(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "profile_monthly",
        successPath: "/pricing?checkout=success&sponsorship=profile_monthly",
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingProfileMonthlySponsor(false);
    }
  };

  const startListingMonthlySponsorship = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    if (!selectedListingId) {
      toast({ title: "No listing selected", description: "Please select a listing to sponsor." });
      return;
    }
    setIsStartingListingMonthlySponsor(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "listing_monthly",
        listingId: selectedListingId,
        successPath: "/pricing?checkout=success&sponsorship=listing_monthly",
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingListingMonthlySponsor(false);
    }
  };

  const startHomepageFeatured = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    setIsStartingHomepageFeatured(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "homepage_featured",
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

  const startSearchPriority = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }
    setIsStartingSearchPriority(true);
    try {
      const session = await createSponsorshipCheckoutSession({
        sponsorshipType: "search_priority",
        successPath: "/pricing?checkout=success&sponsorship=search_priority",
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingSearchPriority(false);
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

      <div className="min-h-screen flex flex-col bg-black">
        <AnimatedBackground />
        <Navbar />
        
        <main className="flex-1 relative z-10">
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-6"
                >
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-violet-300">Pricing & Plans</span>
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                  Grow your{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Shop
                  </span>
                </h1>
                
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                  Plans shape your long-term seller tooling. Sponsorships are the fast lane for short-term visibility.
                </p>
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
                              <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">
                                  {isEnterprise ? "Custom" : plan.activePrice === 0 ? "Free" : `$${plan.activePrice}`}
                                </span>
                                {!isEnterprise && plan.activePrice > 0 && (
                                  <span className="text-sm text-zinc-500">/{yearly ? "mo" : "mo"}</span>
                                )}
                              </div>
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
                              <span>{isEnterprise ? "Custom" : `${plan.platformFee}%`}</span>
                              <span className="text-zinc-500 font-normal">{isEnterprise ? "terms" : "fee"}</span>
                            </div>

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
                            {isEnterprise ? (
                              <Link href="/help" className="block">
                                <button className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20">
                                  <span className="flex items-center justify-center gap-2">
                                    {plan.cta}
                                    <ArrowRight className="w-4 h-4" />
                                  </span>
                                </button>
                              </Link>
                            ) : (
                              <button 
                                onClick={() => startPlanCheckout(plan.id)}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                  plan.highlight 
                                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25" 
                                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-white/20"
                                }`}
                              >
                                <span className="flex items-center justify-center gap-2">
                                  {plan.cta}
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Sponsorships Tab */}
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
                    {/* Header Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-8 mb-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                          <Megaphone className="h-7 w-7 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white">Sponsorships</h2>
                          <p className="text-sm text-zinc-400 mt-1">
                            Pay through Stripe and activate marketplace boosts automatically.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                          <Sparkles className="w-4 h-4" />
                          <span>Instant activation</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sponsorship Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Profile Sponsorship */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6 hover:border-violet-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
                            <Users className="h-5 w-5 text-violet-400" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Profile Sponsorship
                          </p>
                        </div>

                        {/* Duration Selector */}
                        <div className="mb-4">
                          <label className="block text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">
                            Select Duration
                          </label>
                          <div className="flex gap-2">
                            {[7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => setProfileDuration(days as 7 | 14 | 30)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                  profileDuration === days
                                    ? "bg-violet-500/20 border border-violet-500/50 text-violet-300"
                                    : "bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                                }`}
                              >
                                {days} days
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price with discount */}
                        {(() => {
                          const discount = getSponsorshipDiscount(user);
                          const basePrice = profileDuration === 7 ? 19 : profileDuration === 14 ? 39 : 79;
                          const discountedPrice = Math.round(basePrice * (1 - discount / 100));
                          return (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-lg text-zinc-500 line-through">${basePrice}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {discount}% off
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">/ {profileDuration} days</span>
                              {discount > 0 && (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  {user?.planTier} plan discount applied
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                          Boost your shop on seller-focused surfaces, featured maker carousels, and support-led recommendations.
                        </p>

                        <ul className="space-y-3 mb-6">
                          {[
                            "Prioritized shop placements",
                            "Better discovery during campaigns",
                            "Renewable without losing time",
                          ].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                                <Check className="h-3 w-3 text-emerald-400" />
                              </div>
                              {item}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => void startProfileSponsorship()}
                          disabled={isStartingProfileSponsor}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingProfileSponsor ? "Starting checkout..." : `Sponsor Profile (${profileDuration} Days)`}
                        </button>
                      </motion.div>

                      {/* Product Sponsorship */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6 hover:border-cyan-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                            <Package className="h-5 w-5 text-cyan-400" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Product Sponsorship
                          </p>
                        </div>

                        {/* Duration Selector */}
                        <div className="mb-4">
                          <label className="block text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">
                            Select Duration
                          </label>
                          <div className="flex gap-2">
                            {[7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => setListingDuration(days as 7 | 14 | 30)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                  listingDuration === days
                                    ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
                                    : "bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                                }`}
                              >
                                {days} days
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price with discount */}
                        {(() => {
                          const discount = getSponsorshipDiscount(user);
                          const basePrice = listingDuration === 7 ? 12 : listingDuration === 14 ? 24 : 49;
                          const discountedPrice = Math.round(basePrice * (1 - discount / 100));
                          return (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-lg text-zinc-500 line-through">${basePrice}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {discount}% off
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">/ {listingDuration} days</span>
                              {discount > 0 && (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  {user?.planTier} plan discount applied
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                          Push one listing harder across product-focused placements and featured catalog surfaces.
                        </p>

                        <div className="mb-4">
                          <label className="block text-sm text-zinc-400 font-medium mb-2">
                            Choose a listing
                          </label>
                          <select
                            value={selectedListingId ?? ""}
                            onChange={(e) => setSelectedListingId(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                          >
                            {!ownListingsData?.listings?.length ? (
                              <option value="">No listings available</option>
                            ) : (
                              ownListingsData.listings.map((listing) => (
                                <option key={listing.id} value={listing.id}>
                                  {listing.title}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <button
                          onClick={() => void startListingSponsorship()}
                          disabled={isStartingListingSponsor || !ownListingsData?.listings?.length}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingListingSponsor ? "Starting checkout..." : `Sponsor Product (${listingDuration} Days)`}
                        </button>
                      </motion.div>

                      {/* Profile Sponsorship - Monthly */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6 hover:border-pink-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 border border-pink-500/30">
                            <Users className="h-5 w-5 text-pink-400" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Profile Sponsorship - Monthly
                          </p>
                        </div>
                        
                        {/* Price with discount */}
                        {(() => {
                          const discount = getSponsorshipDiscount(user);
                          const originalPrice = 79;
                          const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
                          return (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-lg text-zinc-500 line-through">${originalPrice}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {discount}% off
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">/ 30 days</span>
                              {discount > 0 && (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  {user?.planTier} plan discount applied
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                          Extended 30-day profile boost for maximum visibility across all seller surfaces.
                        </p>
                        
                        <ul className="space-y-3 mb-6">
                          {[
                            "30 days of premium placement",
                            "Featured in maker carousels",
                            "Better campaign visibility",
                            "Best value for longer campaigns",
                          ].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20">
                                <Check className="h-3 w-3 text-pink-400" />
                              </div>
                              {item}
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          onClick={() => void startProfileMonthlySponsorship()}
                          disabled={isStartingProfileMonthlySponsor}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingProfileMonthlySponsor ? "Starting checkout..." : "Sponsor Profile (30 Days)"}
                        </button>
                      </motion.div>

                      {/* Product Sponsorship - Monthly */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6 hover:border-amber-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                            <Package className="h-5 w-5 text-amber-400" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Product Sponsorship - Monthly
                          </p>
                        </div>
                        
                        {/* Price with discount */}
                        {(() => {
                          const discount = getSponsorshipDiscount(user);
                          const originalPrice = 49;
                          const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
                          return (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-lg text-zinc-500 line-through">${originalPrice}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {discount}% off
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">/ 30 days</span>
                              {discount > 0 && (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  {user?.planTier} plan discount applied
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                          Extended 30-day product boost for sustained marketplace visibility.
                        </p>
                        
                        <div className="mb-4">
                          <label className="block text-sm text-zinc-400 font-medium mb-2">
                            Choose a listing
                          </label>
                          <select
                            value={selectedListingId ?? ""}
                            onChange={(e) => setSelectedListingId(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                          >
                            {!ownListingsData?.listings?.length ? (
                              <option value="">No listings available</option>
                            ) : (
                              ownListingsData.listings.map((listing) => (
                                <option key={listing.id} value={listing.id}>
                                  {listing.title}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        
                        <button
                          onClick={() => void startListingMonthlySponsorship()}
                          disabled={isStartingListingMonthlySponsor || !ownListingsData?.listings?.length}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingListingMonthlySponsor ? "Starting checkout..." : "Sponsor Product (30 Days)"}
                        </button>
                      </motion.div>

                      {/* Homepage Featured */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-6 hover:border-yellow-400/50 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-bl-xl">
                          Premium
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                            <Star className="h-5 w-5 text-yellow-400" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Homepage Featured
                          </p>
                        </div>
                        
                        {/* Price with discount */}
                        {(() => {
                          const discount = getSponsorshipDiscount(user);
                          const originalPrice = 99;
                          const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
                          return (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-lg text-zinc-500 line-through">${originalPrice}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {discount}% off
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">/ 7 days</span>
                              {discount > 0 && (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  {user?.planTier} plan discount applied
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                          Premium placement on the homepage carousel. Maximum visibility for high-impact campaigns.
                        </p>
                        
                        <ul className="space-y-3 mb-6">
                          {[
                            "Homepage carousel placement",
                            "Highest visibility on site",
                            "Premium positioning",
                            "Limited spots available",
                          ].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20">
                                <Check className="h-3 w-3 text-yellow-400" />
                              </div>
                              {item}
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          onClick={() => void startHomepageFeatured()}
                          disabled={isStartingHomepageFeatured}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingHomepageFeatured ? "Starting checkout..." : "Get Featured"}
                        </button>
                      </motion.div>

                      {/* Search Priority */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6 hover:border-green-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
                            <Zap className="h-5 w-5 text-green-400" />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                            Search Priority Boost
                          </p>
                        </div>
                        
                        {/* Price with discount */}
                        {(() => {
                          const discount = getSponsorshipDiscount(user);
                          const originalPrice = 29;
                          const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
                          return (
                            <div className="mb-4">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                                {discount > 0 && (
                                  <>
                                    <span className="text-lg text-zinc-500 line-through">${originalPrice}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {discount}% off
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">/ 14 days</span>
                              {discount > 0 && (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  {user?.planTier} plan discount applied
                                </p>
                              )}
                            </div>
                          );
                        })()}

                        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                          Boost your listings to the top of search results. Be seen first when buyers search.
                        </p>
                        
                        <ul className="space-y-3 mb-6">
                          {[
                            "Priority search ranking",
                            "Appear above non-sponsored listings",
                            "14 days of boosted visibility",
                            "Works for all your listings",
                          ].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                                <Check className="h-3 w-3 text-green-400" />
                              </div>
                              {item}
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          onClick={() => void startSearchPriority()}
                          disabled={isStartingSearchPriority}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingSearchPriority ? "Starting checkout..." : "Boost Search Rank"}
                        </button>
                      </motion.div>
                    </div>
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

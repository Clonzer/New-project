import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Crown, Megaphone, Rocket, Star, X, Zap, Users, Package, CheckCircle, Award, Sparkles, Shield, ArrowRight } from "lucide-react";
import { useListListings } from "@/lib/workspace-api-mock";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { Button } from "@/components/ui/button";
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

const FAQS = [
  {
    q: "How do profile and product sponsorships work?",
    a: "Profile sponsorship boosts your shop across seller-focused placements for 14 days. Product sponsorship boosts one listing across product-focused placements for 14 days. Both are paid through Stripe and activate automatically after successful payment.",
  },
  {
    q: "How do paid plans help beyond lower fees?",
    a: "Paid tiers unlock stronger shop customization, better analytics, faster support, and discounted promotional placements so sellers can grow both their storefront and catalog visibility.",
  },
  {
    q: "Can owners give someone enterprise features manually?",
    a: "Yes. Owner accounts can assign plan tiers, including enterprise, from the private admin panel. Enterprise can also be paired with custom onboarding and negotiated support.",
  },
  {
    q: "What do I need configured before payments and support emails work live?",
    a: "Stripe requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET, while email forms require SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM on Render.",
  },
  {
    q: "Do I need a paid plan?",
    a: "No. You can browse, message, compare shops, and place orders without subscribing. Paid plans are for sellers who want enhanced features.",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isStartingProfileSponsor, setIsStartingProfileSponsor] = useState(false);
  const [isStartingListingSponsor, setIsStartingListingSponsor] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const isSeller = user?.role === "seller" || user?.role === "both";
  const { data: ownListingsData } = useListListings();

  useEffect(() => {
    if (!selectedListingId && ownListingsData?.listings?.length) {
      setSelectedListingId(ownListingsData.listings[0].id);
    }
  }, [ownListingsData?.listings, selectedListingId]);

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
        successPath: "/dashboard?checkout=success&sponsorship=profile",
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
        successPath: "/dashboard?checkout=success&sponsorship=listing",
        cancelPath: "/pricing?checkout=cancelled",
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingListingSponsor(false);
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

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
        <Navbar />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-20 pb-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.2),transparent_50%)]" />
            <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-10 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
            
            <div className="container mx-auto px-4 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Pricing & Plans</span>
                </span>
                <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
                  Grow your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-primary to-cyan-400">Shop</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                  Plans shape your long-term seller tooling. Sponsorships are the fast lane for short-term visibility.
                </p>
              </motion.div>
              
              {/* Stats Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
                {[
                  { label: "Active Sellers", value: "2,500+", icon: Users },
                  { label: "Products Listed", value: "50K+", icon: Package },
                  { label: "Total Orders", value: "100K+", icon: CheckCircle },
                  { label: "Commission Paid", value: "$2M+", icon: Award },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                  >
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-zinc-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

        <section className="container mx-auto px-4 pb-16 relative z-20">
          <div className="mx-auto max-w-6xl mb-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-800/80 px-2 py-1.5 backdrop-blur-sm">
              <button
                onClick={() => setYearly(false)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${!yearly ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${yearly ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const isEnterprise = plan.id === "enterprise";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileHover={{ y: -5 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className={`relative flex flex-col rounded-3xl border p-8 overflow-hidden group ${
                    plan.highlight 
                      ? "bg-gradient-to-br from-primary/20 via-zinc-800 to-accent/20 border-primary/40 shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.4)]" 
                      : "bg-zinc-800 border-white/10 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                  }`}
                >
                  {plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black px-4 py-1 text-xs font-bold text-white">
                      {plan.badge}
                    </div>
                  ) : null}
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent shadow-lg`}>
                      <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-white">{plan.name}</h2>
                      {plan.badge && (
                        <span className="text-xs font-medium text-primary">{plan.badge}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-display font-extrabold text-white tracking-tight">
                        {isEnterprise ? "Custom" : plan.activePrice === 0 ? "Free" : `$${plan.activePrice}`}
                      </span>
                      {!isEnterprise && plan.activePrice > 0 ? (
                        <span className="text-sm text-zinc-500">/{yearly ? "mo billed yearly" : "mo"}</span>
                      ) : null}
                    </div>
                    {yearly && plan.activePrice > 0 && !isEnterprise && (
                      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                      </p>
                    )}
                  </div>

                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-primary/10">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-base font-extrabold">{isEnterprise ? "Custom" : `${plan.platformFee}%`}</span>
                    <span className="text-zinc-300">{isEnterprise ? "terms" : "platform fee"}</span>
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-zinc-400">{plan.description}</p>

                  <ul className="mb-6 flex-grow space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className={`flex items-start gap-3 text-sm ${feature.included ? "text-zinc-200" : "text-zinc-600"}`}>
                        {feature.included ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 shrink-0 mt-0">
                            <Check className="h-3 w-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 shrink-0 mt-0">
                            <X className="h-3 w-3 text-zinc-600" />
                          </div>
                        )}
                        <span className={feature.included ? "" : "line-through"}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.highlight && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                  )}

                  <div className="mt-auto pt-4 border-t border-white/5">
                    {isEnterprise ? (
                      <Link href="/help" className="w-full block">
                        <NeonButton glowColor={plan.glow} className="w-full rounded-xl py-3 font-semibold group">
                          <span className="flex items-center justify-center gap-2">
                            {plan.cta}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </NeonButton>
                      </Link>
                    ) : (
                      <NeonButton glowColor={plan.glow} onClick={() => startPlanCheckout(plan.id)} className="w-full rounded-xl py-3 font-semibold group">
                        <span className="flex items-center justify-center gap-2">
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </NeonButton>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Sponsorships Section */}
        <section className="container mx-auto px-4 pb-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-primary/5 p-8 md:p-10 relative overflow-hidden"
            >
              {/* Background glow effects */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/20">
                  <Megaphone className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Sponsorships</h2>
                  <p className="text-sm text-zinc-400 mt-1">Pay through Stripe and activate marketplace boosts automatically.</p>
                </div>
                <div className="md:ml-auto flex items-center gap-2 text-sm text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant activation</span>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 relative z-10">
                {/* Profile Sponsorship */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/60 p-6 md:p-8 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                      <Users className="h-5 w-5 text-violet-400" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Profile sponsorship</p>
                  </div>
                  <h3 className="text-3xl font-display font-bold text-white">$39 <span className="text-lg text-zinc-500 font-normal">/ 14 days</span></h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Boost your shop on seller-focused surfaces, featured maker carousels, and support-led recommendations.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-zinc-300">
                    <li className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      Prioritized shop placements
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      Better discovery during campaigns
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      Renewable without losing time
                    </li>
                  </ul>
                  <NeonButton glowColor="primary" onClick={() => void startProfileSponsorship()} className="mt-6 w-full rounded-xl py-3.5">
                    {isStartingProfileSponsor ? "Starting checkout..." : "Sponsor my profile"}
                  </NeonButton>
                </motion.div>

                {/* Product Sponsorship */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/60 p-6 md:p-8 backdrop-blur-sm hover:border-accent/30 transition-all duration-300 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-accent/20 border border-cyan-500/30">
                      <Package className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Product sponsorship</p>
                  </div>
                  <h3 className="text-3xl font-display font-bold text-white">$24 <span className="text-lg text-zinc-500 font-normal">/ 14 days</span></h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Push one listing harder across product-focused placements and featured catalog surfaces.
                  </p>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm text-zinc-400 font-medium">Choose a listing</label>
                    <select
                      value={selectedListingId ?? ""}
                      onChange={(event) => setSelectedListingId(Number(event.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    >
                      {!ownListingsData?.listings?.length ? (
                        <option value="">No listings available</option>
                      ) : (
                        ownListingsData.listings.map((listing) => (
                          <option key={listing.id} value={listing.id}>{listing.title}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <NeonButton glowColor="accent" onClick={() => void startListingSponsorship()} className="mt-6 w-full rounded-xl py-3.5">
                    {isStartingListingSponsor ? "Starting checkout..." : "Sponsor this product"}
                  </NeonButton>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-3xl px-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 text-center text-3xl md:text-4xl font-display font-bold text-white">Frequently asked</h2>
            <p className="text-center text-zinc-400 mb-10">Everything you need to know about our pricing</p>
            <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${openFaq === index ? 'border-primary/30 bg-gradient-to-br from-white/10 to-white/5 shadow-lg shadow-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className={`pr-4 font-medium transition-colors ${openFaq === index ? 'text-primary' : 'text-white'}`}>{faq.q}</span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${openFaq === index ? 'bg-primary/20' : 'bg-white/5'}`}>
                      {openFaq === index ? <ChevronUp className="h-4 w-4 shrink-0 text-primary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/5"
                      >
                        <div className="px-6 pb-5 pt-4 text-sm leading-relaxed text-zinc-400">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Crown, Megaphone, Rocket, Star, X, Zap, Users, Package, CheckCircle, Award } from "lucide-react";
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
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className={`relative flex flex-col rounded-3xl border p-8 ${
                    plan.highlight ? "scale-[1.01] border-primary/40 bg-zinc-800 shadow-[0_0_40px_rgba(139,92,246,0.18)]" : "bg-zinc-800 border-white/10"
                  }`}
                >
                  {plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black px-4 py-1 text-xs font-bold text-white">
                      {plan.badge}
                    </div>
                  ) : null}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">{plan.name}</h2>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-display font-extrabold text-white">
                      {isEnterprise ? "Custom" : plan.activePrice === 0 ? "Free" : `$${plan.activePrice}`}
                    </span>
                    {!isEnterprise && plan.activePrice > 0 ? (
                      <span className="ml-1 text-sm text-zinc-500">/{yearly ? "mo billed yearly" : "mo"}</span>
                    ) : null}
                  </div>

                  <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-zinc-200">
                    <span className="text-lg font-extrabold">{isEnterprise ? "Custom" : `${plan.platformFee}%`}</span>
                    <span>{isEnterprise ? "terms" : "platform fee"}</span>
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-zinc-400">{plan.description}</p>

                  <ul className="mb-8 flex-grow space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className={`flex items-start gap-2.5 text-sm ${feature.included ? "text-zinc-300" : "text-zinc-600"}`}>
                        {feature.included ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />}
                        {feature.text}
                      </li>
                    ))}
                  </ul>

                  {isEnterprise ? (
                    <Link href="/help" className="w-full">
                      <NeonButton glowColor={plan.glow} className="w-full rounded-2xl py-3 font-semibold">
                        {plan.cta}
                      </NeonButton>
                    </Link>
                  ) : (
                    <NeonButton glowColor={plan.glow} onClick={() => startPlanCheckout(plan.id)} className="w-full rounded-2xl py-3 font-semibold">
                      {plan.cta}
                    </NeonButton>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Sponsorships Section */}
        <section className="container mx-auto px-4 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-primary/10 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Sponsorships</h2>
                  <p className="text-sm text-zinc-400">Pay through Stripe and activate marketplace boosts automatically.</p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Profile sponsorship</p>
                  <h3 className="mt-2 text-2xl font-display font-bold text-white">$39 / 14 days</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Boost your shop on seller-focused surfaces, featured maker carousels, and support-led recommendations.
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> Prioritized shop placements</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> Better discovery during campaign windows</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /> Renewable without losing existing time</li>
                  </ul>
                  <NeonButton glowColor="primary" onClick={() => void startProfileSponsorship()} className="mt-6 w-full rounded-2xl py-3">
                    {isStartingProfileSponsor ? "Starting checkout..." : "Sponsor my profile"}
                  </NeonButton>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Product sponsorship</p>
                  <h3 className="mt-2 text-2xl font-display font-bold text-white">$24 / 14 days</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Push one listing harder across product-focused placements and featured catalog surfaces.
                  </p>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm text-zinc-400">Choose a listing</label>
                    <select
                      value={selectedListingId ?? ""}
                      onChange={(event) => setSelectedListingId(Number(event.target.value))}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  <NeonButton glowColor="accent" onClick={() => void startListingSponsorship()} className="mt-6 w-full rounded-2xl py-3">
                    {isStartingListingSponsor ? "Starting checkout..." : "Sponsor this product"}
                  </NeonButton>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-3xl px-4 pb-24">
          <h2 className="mb-10 text-center text-3xl font-display font-bold text-white">Frequently asked</h2>
          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div key={faq.q} className="glass-panel overflow-hidden rounded-2xl border border-white/10">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/5"
                >
                  <span className="pr-4 font-medium text-white">{faq.q}</span>
                  {openFaq === index ? <ChevronUp className="h-4 w-4 shrink-0 text-primary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />}
                </button>
                {openFaq === index ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-white/5 px-6 pb-4 pt-3 text-sm leading-relaxed text-zinc-400">
                    {faq.a}
                  </motion.div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
}

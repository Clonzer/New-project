import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Crown, Mail, Megaphone, MessageSquare, Rocket, Star, X, Zap } from "lucide-react";
import { useListListings } from "@/lib/workspace-api-mock";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { createSponsorshipCheckoutSession } from "@/lib/payments-api";
import { customFetch } from "@/lib/workspace-api-mock";
import { ensureSupportThread, submitSupportContactForm } from "@/lib/support-api";

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
    badge: "Contact Us",
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
    cta: "Contact Us",
    glow: "primary" as const,
  },
] as const;

const FAQS = [
  {
    q: "How do profile and product sponsorships work?",
    a: "Profile sponsorship boosts your shop across seller-focused placements for 14 days. Product sponsorship boosts one listing across product-focused placements for 14 days. Both are paid through Stripe and activate automatically after successful payment.",
  },
  {
    q: "Can I message Synthix directly from the site?",
    a: "Yes. The pricing page has an in-app message action that opens a real support thread in the site messenger, so you can ask about plans, sponsorships, or setup without leaving the platform.",
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
    q: "Do buyers need a paid plan?",
    a: "No. Buyers can browse, message, compare shops, and place orders without subscribing. Pricing is seller-focused.",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.displayName ?? "",
    email: user?.email ?? "",
    subject: "Enterprise plan and sponsorships",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isOpeningSupport, setIsOpeningSupport] = useState(false);
  const [isStartingProfileSponsor, setIsStartingProfileSponsor] = useState(false);
  const [isStartingListingSponsor, setIsStartingListingSponsor] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const isSeller = user?.role === "seller" || user?.role === "both";
  const { data: ownListingsData } = useListListings({ sellerId: user?.id, limit: 100 });

  useEffect(() => {
    if (!user) return;
    setContactForm((current) => ({
      ...current,
      name: current.name || user.displayName,
      email: current.email || user.email,
    }));
  }, [user]);

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

  const openSupportMessenger = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }

    try {
      setIsOpeningSupport(true);
      const result = await ensureSupportThread();
      setLocation(`/messages?threadId=${result.threadId}`);
    } catch (error) {
      toast({
        title: "Could not open support chat",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsOpeningSupport(false);
    }
  };

  const submitContact = async () => {
    try {
      setIsSubmittingContact(true);
      await submitSupportContactForm(contactForm);
      setContactForm((current) => ({ ...current, message: "" }));
      setShowEnterpriseForm(false);
      toast({
        title: "Contact form sent",
        description: "Your message was sent to the SYNTHIX inbox email addresses.",
      });
    } catch (error) {
      toast({
        title: "Contact form failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const startPlanCheckout = (planId: string) => {
    if (!user) {
      setLocation("/register");
      return;
    }
    if (planId === "starter") {
      setLocation("/settings?section=payment");
      return;
    }
    window.location.href = `/api/payments/stripe/checkout?plan=${planId}&billing=${yearly ? "yearly" : "monthly"}`;
  };

  const startProfileSponsorship = async () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to purchase sponsorships." });
      return;
    }

    setIsStartingProfileSponsor(true);
    try {
      // Get sponsorship tiers from API
      const tiersResponse = await customFetch('/api/sponsorships/tiers');
      const { tiers } = await tiersResponse.json();
      const profileTier = tiers.find((t: any) => t.slug === 'profile-sponsorship') || tiers[0];
      
      if (!profileTier) {
        throw new Error('Profile sponsorship tier not found');
      }

      // Create sponsorship purchase
      const purchaseResponse = await customFetch('/api/sponsorships/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: profileTier.id,
          paymentMethodId: 'temp' // Will be replaced with Stripe integration
        })
      });

      if (purchaseResponse.ok) {
        const result = await purchaseResponse.json();
        toast({ 
          title: "Sponsorship Activated!", 
          description: `Your profile sponsorship is active until ${new Date(result.expiresAt).toLocaleDateString()}` 
        });
      } else {
        throw new Error('Failed to purchase sponsorship');
      }
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
      // Get sponsorship tiers from API
      const tiersResponse = await customFetch('/api/sponsorships/tiers');
      const { tiers } = await tiersResponse.json();
      const productTier = tiers.find((t: any) => t.slug === 'product-sponsorship') || tiers[0];
      
      if (!productTier) {
        throw new Error('Product sponsorship tier not found');
      }

      // Create sponsorship purchase
      const purchaseResponse = await customFetch('/api/sponsorships/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: productTier.id,
          paymentMethodId: 'temp', // Will be replaced with Stripe integration
          listingId: selectedListingId
        })
      });

      if (purchaseResponse.ok) {
        const result = await purchaseResponse.json();
        toast({ 
          title: "Product Sponsorship Activated!", 
          description: `Your product sponsorship is active until ${new Date(result.expiresAt).toLocaleDateString()}` 
        });
      } else {
        throw new Error('Failed to purchase sponsorship');
      }
    } catch (err) {
      toast({ title: "Could not purchase sponsorship", description: getApiErrorMessage(err) });
    } finally {
      setIsStartingListingSponsor(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden pb-16 pt-24 text-center">
          <AnimatedGradientBg />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold text-primary backdrop-blur-sm">
                Pricing, promotion, and support
              </span>
              <h1 className="mt-6 text-5xl font-display font-extrabold tracking-tight text-white md:text-6xl">
                Grow a shop, promote a listing, and talk to Synthix without leaving the site.
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-lg text-zinc-400">
                Plans shape your long-term seller tooling. Sponsorships are the fast lane for short-term visibility.
                Both now have real support actions behind them instead of dead-end buttons.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
                <button
                  onClick={() => setYearly(false)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${!yearly ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${yearly ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}
                >
                  Yearly
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
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
                  className={`glass-panel relative flex flex-col rounded-3xl border p-8 ${
                    plan.highlight ? "scale-[1.01] border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(139,92,246,0.18)]" : "border-white/10"
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
                    <button type="button" onClick={() => setShowEnterpriseForm(true)} className="w-full">
                      <NeonButton glowColor={plan.glow} className="w-full rounded-2xl py-3 font-semibold">
                        {plan.cta}
                      </NeonButton>
                    </button>
                  ) : (
                    <button type="button" onClick={() => startPlanCheckout(plan.id)} className="w-full">
                      <NeonButton glowColor={plan.glow} className="w-full rounded-2xl py-3 font-semibold">
                        {plan.cta}
                      </NeonButton>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-primary/10 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Sponsorships</h2>
                  <p className="text-sm text-zinc-400">Pay through Stripe and activate marketplace boosts automatically.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
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
                  <button type="button" onClick={() => void startProfileSponsorship()} className="mt-6 w-full">
                    <NeonButton glowColor="primary" className="w-full rounded-2xl py-3">
                      {isStartingProfileSponsor ? "Starting checkout..." : "Sponsor my profile"}
                    </NeonButton>
                  </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
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
                  <button type="button" onClick={() => void startListingSponsorship()} className="mt-6 w-full">
                    <NeonButton glowColor="accent" className="w-full rounded-2xl py-3">
                      {isStartingListingSponsor ? "Starting checkout..." : "Sponsor this product"}
                    </NeonButton>
                  </button>
                </div>
              </div>

              {!isSeller ? (
                <p className="mt-5 text-sm text-zinc-500">
                  Sponsorships are seller tools. Buyer accounts can still message support from this page.
                </p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-400/10 p-7">
              <h2 className="text-2xl font-display font-bold text-white">Talk to Synthix</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-200">
                One path stays on-platform in the site messenger. The other sends a proper contact form to your inbox email addresses.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => void openSupportMessenger()}>
                  <NeonButton glowColor="primary" className="w-full rounded-2xl py-3">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {isOpeningSupport ? "Opening..." : "Message Synthix"}
                  </NeonButton>
                </button>
                <button type="button" onClick={() => setShowEnterpriseForm(true)}>
                  <NeonButton glowColor="white" className="w-full rounded-2xl py-3">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact form
                  </NeonButton>
                </button>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-200">
                <p className="font-semibold text-white">Enterprise sellers get:</p>
                <ul className="mt-3 space-y-2">
                  <li>Dedicated onboarding and rollout support.</li>
                  <li>Negotiated commercial terms and fees.</li>
                  <li>Priority promotional planning and merchandising help.</li>
                  <li>Owner-assigned enterprise features inside the product.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {showEnterpriseForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">Enterprise Contact</h3>
                  <p className="text-sm text-zinc-400 mt-1">Tell us about your business needs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEnterpriseForm(false)}
                  className="text-zinc-400 hover:text-white transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div id="contact-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={contactForm.name}
                    onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  />
                  <Input
                    value={contactForm.email}
                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Input
                  value={contactForm.subject}
                  onChange={(event) => setContactForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Subject"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                />
                <Textarea
                  value={contactForm.message}
                  onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Tell us about your enterprise needs, expected volume, and timeline..."
                  rows={6}
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 resize-none"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  onClick={() => void submitContact()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isSubmittingContact ? "Sending..." : "Send inquiry"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowEnterpriseForm(false)}
                  variant="outline"
                  className="px-6 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}

        <section className="container mx-auto max-w-3xl px-4 py-20">
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
  );
}

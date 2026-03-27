import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { motion } from "framer-motion";
import { Check, X, Zap, Star, Crown, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    iconColor: "text-zinc-400",
    price: { monthly: 0, yearly: 0 },
    platformFee: 10,
    highlight: false,
    badge: null,
    description: "Perfect for hobbyists and new sellers testing the platform.",
    features: [
      { text: "10% platform fee per sale", included: true },
      { text: "3 free catalog listings", included: true },
      { text: "Open job orders", included: true },
      { text: "Basic order management", included: true },
      { text: "Buyer/seller messaging", included: true },
      { text: "Reduced platform fee", included: false },
      { text: "Priority support", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Featured shop placement", included: true },
      { text: "Custom shop branding", included: false },
    ],
    cta: "Get Started Free",
    ctaGlow: "white" as const,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    iconColor: "text-primary",
    price: { monthly: 19, yearly: 15 },
    platformFee: 7,
    highlight: true,
    badge: "Most Popular",
    description: "For active sellers ready to grow their fabrication or services business.",
    features: [
      { text: "7% platform fee per sale", included: true },
      { text: "20 free catalog listings", included: true },
      { text: "Open job orders", included: true },
      { text: "Advanced order management", included: true },
      { text: "Buyer/seller messaging", included: true },
      { text: "3% reduced platform fee", included: true },
      { text: "Priority support", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Featured shop placement", included: true },
      { text: "Custom shop branding", included: false },
    ],
    cta: "Start Pro Trial",
    ctaGlow: "primary" as const,
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    iconColor: "text-yellow-400",
    price: { monthly: 49, yearly: 39 },
    platformFee: 5,
    highlight: false,
    badge: "Best Value",
    description: "For professional shops and high-volume sellers.",
    features: [
      { text: "5% platform fee per sale", included: true },
      { text: "Unlimited catalog listings", included: true },
      { text: "Open job orders", included: true },
      { text: "Advanced order management", included: true },
      { text: "Buyer/seller messaging", included: true },
      { text: "5% reduced platform fee", included: true },
      { text: "Dedicated support", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Featured shop placement", included: true },
      { text: "Custom shop branding", included: true },
    ],
    cta: "Go Elite",
    ctaGlow: "accent" as const,
  },
];

const FAQS = [
  {
    q: "How does the platform fee work?",
    a: "When a buyer places an order, their payment is held in escrow by SYNTHIX. When you mark the order as shipped, we release your earnings minus the platform fee. For example, on a $100 order with a Pro plan (7% fee), you receive $93.",
  },
  {
    q: "What counts as a 'free listing'?",
    a: "Each model you add to your catalog shop counts as one listing. Open-job orders (custom file uploads from buyers) don't count toward your listing limit. Listings beyond your plan's free allowance are $0.99/month each.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades take effect at the end of your current billing period.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Pro comes with a 14-day free trial — no credit card required. Elite plans include a 7-day trial.",
  },
  {
    q: "Are there transaction limits?",
    a: "No transaction limits on any plan. The platform fee applies to every order regardless of size, but there's no cap on how much you can sell.",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative pt-28 pb-16 text-center overflow-hidden">
          <AnimatedGradientBg />
          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-4 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-semibold mb-6 backdrop-blur-sm">
                Simple, transparent pricing
              </span>
              <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white mb-5 tracking-tight">
                Grow your shop,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">keep more of every sale</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8">
                Upgrade your plan to unlock lower platform fees, more catalog listings, and priority support.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-1.5">
                <button
                  onClick={() => setYearly(false)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!yearly ? "bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]" : "text-zinc-400 hover:text-white"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${yearly ? "bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]" : "text-zinc-400 hover:text-white"}`}
                >
                  Yearly
                  <span className="text-[10px] bg-accent/20 text-accent border border-accent/30 px-1.5 py-0.5 rounded-full font-bold">-20%</span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-24 container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto -mt-4">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon;
              const price = yearly ? plan.price.yearly : plan.price.monthly;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative glass-panel rounded-3xl border p-8 flex flex-col transition-all duration-300 ${
                    plan.highlight
                      ? "border-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.2)] scale-[1.02] bg-primary/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full ${
                      plan.highlight ? "bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlight ? "bg-primary/20 border border-primary/30" : "bg-white/5 border border-white/10"}`}>
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">{plan.name}</h2>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-display font-extrabold text-white">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-zinc-500 text-sm ml-1">/{yearly ? "mo (billed yearly)" : "mo"}</span>
                    )}
                  </div>

                  <div className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 px-3 py-1 rounded-full w-fit ${
                    plan.id === "starter" ? "bg-zinc-800 text-zinc-300"
                    : plan.id === "pro" ? "bg-primary/15 text-primary border border-primary/25"
                    : "bg-accent/15 text-accent border border-accent/25"
                  }`}>
                    <span className="text-lg font-extrabold">{plan.platformFee}%</span>
                    <span>platform fee</span>
                  </div>

                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{plan.description}</p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className={`flex items-start gap-2.5 text-sm ${f.included ? "text-zinc-300" : "text-zinc-600"}`}>
                        {f.included
                          ? <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          : <X className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                        }
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.id === "starter" ? "/register" : "/register"}>
                    <NeonButton glowColor={plan.ctaGlow} className="w-full rounded-2xl py-3 font-semibold">
                      {plan.cta}
                    </NeonButton>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Fee savings calculator */}
        <section className="py-16 border-y border-white/5 bg-black/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-display font-bold text-white mb-4">How much do you save?</h2>
              <p className="text-zinc-400 mb-10">Based on $5,000 monthly sales revenue</p>

              <div className="grid grid-cols-3 gap-4">
                {PLANS.map((plan) => {
                  const monthlyRevenue = 5000;
                  const fee = (monthlyRevenue * plan.platformFee) / 100;
                  const earnings = monthlyRevenue - fee;
                  const savings = ((10 - plan.platformFee) / 100) * monthlyRevenue;
                  return (
                    <div
                      key={plan.id}
                      className={`glass-panel rounded-2xl p-6 border ${plan.highlight ? "border-primary/40" : "border-white/10"}`}
                    >
                      <p className="text-sm text-zinc-500 mb-1">{plan.name}</p>
                      <p className="text-2xl font-display font-bold text-white">${earnings.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500 mb-3">you keep</p>
                      {savings > 0 && (
                        <p className="text-sm text-emerald-400 font-semibold">+${savings.toLocaleString()} saved</p>
                      )}
                      <p className="text-xs text-zinc-600 mt-1">${fee.toLocaleString()} platform fee</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-20 container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-display font-bold text-white text-center mb-10">Full feature comparison</h2>
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-6 py-4 text-zinc-400 font-medium">Feature</th>
                    <th className="text-center px-4 py-4 text-zinc-300 font-semibold">Starter</th>
                    <th className="text-center px-4 py-4 text-primary font-semibold">Pro</th>
                    <th className="text-center px-4 py-4 text-accent font-semibold">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["Platform fee", "10%", "7%", "5%"],
                    ["Catalog listings", "3 free", "20 free", "Unlimited"],
                    ["Open job orders", "✓", "✓", "✓"],
                    ["Order management", "Basic", "Advanced", "Advanced"],
                    ["Buyer messaging", "✓", "✓", "✓"],
                    ["Analytics", "—", "✓", "✓"],
                    ["Priority support", "—", "✓", "Dedicated"],
                    ["Featured placement", "✓", "✓", "✓"],
                    ["Custom branding", "—", "—", "✓"],
                    ["Additional listings", "$0.99/ea", "$0.99/ea", "Included"],
                  ].map(([feature, starter, pro, elite], i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-zinc-300">{feature}</td>
                      <td className="px-4 py-4 text-center text-zinc-400">{starter}</td>
                      <td className="px-4 py-4 text-center text-primary font-medium">{pro}</td>
                      <td className="px-4 py-4 text-center text-accent font-medium">{elite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="py-16 pb-24 container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-display font-bold text-white text-center mb-10">Frequently asked</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-white pr-4">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed border-t border-white/5"
                    >
                      <p className="pt-3">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-24 container mx-auto px-4">
          <div className="glass-panel rounded-[3rem] p-12 md:p-20 text-center border border-primary/20 relative overflow-hidden max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-gradient-x" />
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Ready to maximize your earnings?</h2>
              <p className="text-zinc-300 mb-8 max-w-lg mx-auto">Join thousands of makers who've upgraded their SYNTHIX experience.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <NeonButton glowColor="primary" className="px-8 py-4 rounded-full text-base">Start Pro Trial — Free 14 Days</NeonButton>
                </Link>
                <Link href="/explore">
                  <NeonButton glowColor="white" className="px-8 py-4 rounded-full text-base">Explore as Buyer</NeonButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

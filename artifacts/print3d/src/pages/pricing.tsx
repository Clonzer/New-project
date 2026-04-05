import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Crown, Star, X, Zap, Mail, Phone, Building, Users, Shield, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ENTERPRISE_CONTACT = "mailto:evanhuelin8@gmail.com?subject=SYNTHIX%20Enterprise%20Inquiry";

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
    description: "A solid launch plan for new makers and smaller shops.",
    features: [
      { text: "10% platform fee", included: true },
      { text: "3 catalog listings included", included: true },
      { text: "Custom requests", included: true },
      { text: "Shop messaging", included: true },
      { text: "Portfolio and reviews", included: true },
      { text: "Advanced analytics", included: false },
      { text: "Enterprise onboarding", included: false },
    ],
    cta: "Get Started",
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
    description: "For active sellers ready to grow with lower fees and better tooling.",
    features: [
      { text: "7% platform fee", included: true },
      { text: "20 catalog listings included", included: true },
      { text: "Custom requests", included: true },
      { text: "Shop messaging", included: true },
      { text: "Portfolio and reviews", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Enterprise onboarding", included: false },
    ],
    cta: "Start Pro",
    glow: "primary" as const,
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    iconColor: "text-yellow-400",
    price: { monthly: 49, yearly: 39 },
    platformFee: 5,
    badge: "Best Value",
    highlight: false,
    description: "For established shops running serious order volume and stronger branding.",
    features: [
      { text: "5% platform fee", included: true },
      { text: "Unlimited listings", included: true },
      { text: "Custom requests", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Branding controls", included: true },
      { text: "Enterprise onboarding", included: false },
    ],
    cta: "Go Elite",
    glow: "accent" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    iconColor: "text-cyan-300",
    price: { monthly: 0, yearly: 0 },
    platformFee: 0,
    badge: "Contact Us",
    highlight: false,
    description: "Managed terms for high-value partners who need custom rollout, support, and commercial setup.",
    features: [
      { text: "Custom commercial terms", included: true },
      { text: "Negotiated fees", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "Managed enterprise status", included: true },
      { text: "Priority support", included: true },
      { text: "Branding consultation", included: true },
      { text: "Procurement workflows", included: true },
    ],
    cta: "Contact Us",
    glow: "primary" as const,
  },
];

const FAQS = [
  {
    q: "How do account tiers work?",
    a: "Starter, Pro, and Elite can be self-serve. Enterprise is assigned manually for accounts that need custom commercial terms or rollout support.",
  },
  {
    q: "Can owners give someone enterprise features?",
    a: "Yes. Owner accounts can assign plan tiers, including enterprise, from the private admin panel.",
  },
  {
    q: "Do buyers need a paid plan?",
    a: "No. Pricing is aimed at sellers. Buyer accounts can browse and order without a subscription.",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: ""
  });
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden pb-16 pt-28 text-center">
          <AnimatedGradientBg />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold text-primary backdrop-blur-sm">
                Seller pricing
              </span>
              <h1 className="mt-6 text-5xl font-display font-extrabold tracking-tight text-white md:text-6xl">
                Pick the seller tier that fits your shop.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
                Lower fees, better tooling, and a clear enterprise path when you need more than a standard seller account.
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

        <section className="container mx-auto px-4 pb-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const isEnterprise = plan.id === "enterprise";
              const price = yearly ? plan.price.yearly : plan.price.monthly;

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
                      {isEnterprise ? "Custom" : price === 0 ? "Free" : `$${price}`}
                    </span>
                    {!isEnterprise && price > 0 ? (
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
                    <a href={ENTERPRISE_CONTACT}>
                      <NeonButton glowColor={plan.glow} className="w-full rounded-2xl py-3 font-semibold">
                        {plan.cta}
                      </NeonButton>
                    </a>
                  ) : (
                    <Link href="/register">
                      <NeonButton glowColor={plan.glow} className="w-full rounded-2xl py-3 font-semibold">
                        {plan.cta}
                      </NeonButton>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-white/5 bg-black/30 py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">Enterprise sellers get a human setup path.</h2>
                    <p className="text-zinc-400">Custom solutions for high-value partners</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white">Dedicated Onboarding</h3>
                      <p className="text-sm text-zinc-400">Personalized setup and migration support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white">Custom Terms</h3>
                      <p className="text-sm text-zinc-400">Negotiated fees and commercial agreements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white">Priority Support</h3>
                      <p className="text-sm text-zinc-400">24/7 dedicated account management</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-panel rounded-3xl border border-white/10 p-8"
              >
                <h3 className="text-xl font-display font-bold text-white mb-6">Contact Enterprise Team</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Smith"
                      className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-2">Company Name *</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Acme Corporation"
                      className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@acme.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-2">How can we help? *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us about your enterprise needs, expected volume, and timeline..."
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 resize-none"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!formData.name || !formData.company || !formData.email || !formData.message) {
                        toast({
                          title: "Missing required fields",
                          description: "Please fill in all required fields marked with *",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      const subject = encodeURIComponent(`SYNTHIX Enterprise Inquiry - ${formData.company}`);
                      const body = encodeURIComponent(
                        `Name: ${formData.name}\nCompany: ${formData.company}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`
                      );
                      window.location.href = `mailto:evanhuelin8@gmail.com?subject=${subject}&body=${body}`;
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-2xl px-4 py-20">
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

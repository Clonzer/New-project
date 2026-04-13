import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createSponsorshipCheckoutSession } from "@/lib/payments-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { 
  Trophy, 
  Star, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Crown,
  TrendingUp
} from "lucide-react";

const SPONSORSHIP_TIERS = [
  {
    id: "profile-sponsorship",
    name: "Profile Boost",
    description: "Get featured on the homepage and in search results",
    price: 9.99,
    duration: "month",
    features: [
      "Featured profile badge",
      "Priority search ranking",
      "Homepage visibility",
      "Analytics dashboard"
    ],
    icon: Star,
    color: "from-amber-400 to-orange-500"
  },
  {
    id: "product-sponsorship",
    name: "Product Spotlight",
    description: "Highlight your best products across the platform",
    price: 19.99,
    duration: "month",
    features: [
      "Sponsored product badges",
      "Category page features",
      "Related product placement",
      "Click analytics"
    ],
    icon: Sparkles,
    color: "from-purple-400 to-pink-500"
  },
  {
    id: "premium-bundle",
    name: "Premium Bundle",
    description: "Complete visibility package for maximum exposure",
    price: 29.99,
    duration: "month",
    popular: true,
    features: [
      "Everything in Profile Boost",
      "Everything in Product Spotlight",
      "Exclusive promotional placement",
      "Priority support",
      "Custom branding options"
    ],
    icon: Crown,
    color: "from-cyan-400 to-emerald-500"
  }
];

export default function SponsorshipPurchase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

      // Map tier ID to sponsorship type
      const sponsorshipType = tierId === "product-sponsorship" ? "listing" : "profile";

      const result = await createSponsorshipCheckoutSession({
        sponsorshipType,
        quantity: 1,
        successPath: "/dashboard?success=true",
        cancelPath: "/sponsorship/purchase?cancelled=true"
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
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
          
          <div className="container mx-auto px-4 relative z-10">
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
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                      
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-zinc-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
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

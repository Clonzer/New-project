import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Star, TrendingUp, Zap, Crown, ExternalLink, Check } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";

interface SponsoredShop {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  specialty: string;
  views: number;
  tier: "premium" | "gold" | "silver";
  promotionLevel: number; // 1-10 scale
}

// Sample sponsored shops data
const sponsoredShops: SponsoredShop[] = [
  {
    id: "1",
    name: "Elite Makers Studio",
    avatar: "https://api.pravatar.cc/150?u=elite",
    banner: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop",
    specialty: "Premium Prototyping",
    views: 12500,
    tier: "premium",
    promotionLevel: 10
  },
  {
    id: "2",
    name: "ProForge Labs",
    avatar: "https://api.pravatar.cc/150?u=proforge",
    banner: "https://images.unsplash.com/photo-1581091226825-a6a3125c1f4b?w=800&h=400&fit=crop",
    specialty: "Custom Engineering",
    views: 8900,
    tier: "gold",
    promotionLevel: 8
  },
  {
    id: "3",
    name: "TechCraft Designs",
    avatar: "https://api.pravatar.cc/150?u=techcraft",
    banner: "https://images.unsplash.com/photo-1563211553215-b3d6e2c05a9a?w=800&h=400&fit=crop",
    specialty: "Artistic Models",
    views: 6200,
    tier: "gold",
    promotionLevel: 7
  },
  {
    id: "4",
    name: "RapidWorks",
    avatar: "https://api.pravatar.cc/150?u=rapid",
    banner: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop",
    specialty: "Fast Prototyping",
    views: 4100,
    tier: "silver",
    promotionLevel: 5
  },
  {
    id: "5",
    name: "PrintMasters",
    avatar: "https://api.pravatar.cc/150?u=printmaster",
    banner: "https://images.unsplash.com/photo-1558350057-e2395e537a02?w=800&h=400&fit=crop",
    specialty: "Industrial Parts",
    views: 3400,
    tier: "silver",
    promotionLevel: 4
  }
];

const tierConfig = {
  premium: {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    icon: Crown,
    label: "Premium Partner",
    cardSize: "col-span-2 row-span-2",
    badge: "text-purple-400"
  },
  gold: {
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    icon: Star,
    label: "Gold Sponsor",
    cardSize: "col-span-1 row-span-2",
    badge: "text-yellow-400"
  },
  silver: {
    color: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
    icon: Zap,
    label: "Silver Partner",
    cardSize: "col-span-1 row-span-1",
    badge: "text-cyan-400"
  }
};

export function SponsoredShopsSection() {
  const [showPricingModal, setShowPricingModal] = useState(false);

  const pricingTiers = [
    {
      name: "Silver",
      price: "$49/month",
      reach: "5,000 views",
      features: [
        "Featured on homepage",
        "Basic analytics",
        "Standard support",
        "Community badge"
      ],
      color: "cyan"
    },
    {
      name: "Gold",
      price: "$149/month",
      reach: "15,000 views",
      features: [
        "Premium placement",
        "Advanced analytics",
        "Priority support",
        "Gold badge",
        "Newsletter feature"
      ],
      color: "yellow",
      popular: true
    },
    {
      name: "Premium",
      price: "$399/month",
      reach: "50,000+ views",
      features: [
        "Top placement always",
        "Full analytics suite",
        "Dedicated manager",
        "Premium badge",
        "Social media promo",
        "Email blast to users"
      ],
      color: "purple"
    }
  ];

  return (
    <section className="relative w-full bg-zinc-950 py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,50,255,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                Sponsored Shops
              </h2>
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                <span className="text-yellow-400 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Featured Partners
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-lg">
              Top-rated makers promoting their shops to grow their business
            </p>
          </div>
          <NeonButton
            onClick={() => setShowPricingModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full"
          >
            <Star className="w-4 h-4 mr-2" />
            Promote Your Shop
          </NeonButton>
        </div>

        {/* Sponsored Shops Grid */}
        <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
          {sponsoredShops.map((shop, index) => {
            const config = tierConfig[shop.tier];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`${config.cardSize} relative group cursor-pointer`}
              >
                <Link href={`/shop/${shop.id}`}>
                  <div className={`relative h-full rounded-2xl overflow-hidden border ${config.borderColor} bg-zinc-900/50 backdrop-blur-sm`}>
                    {/* Banner Image */}
                    <div className="absolute inset-0">
                      <img
                        src={shop.banner}
                        alt={shop.name}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className={`px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center gap-2`}>
                          <Icon className={`w-4 h-4 ${config.badge}`} />
                          <span className={`text-xs font-semibold ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          <span>{shop.views.toLocaleString()} views</span>
                        </div>
                      </div>

                      <div className="flex items-end gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20">
                          <img
                            src={shop.avatar}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {shop.name}
                          </h3>
                          <p className="text-zinc-400 text-sm">
                            {shop.specialty}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${config.color} opacity-10`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-3xl border border-zinc-700 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      Promote Your Shop
                    </h3>
                    <p className="text-zinc-400">
                      Choose a plan that fits your goals. More visibility = more orders.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPricingModal(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {pricingTiers.map((tier, index) => (
                    <motion.div
                      key={tier.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-6 rounded-2xl border ${
                        tier.popular
                          ? "border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent"
                          : "border-zinc-700 bg-zinc-800/50"
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 rounded-full text-black text-sm font-semibold">
                          Most Popular
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h4 className="text-2xl font-bold text-white mb-2">
                          {tier.name}
                        </h4>
                        <p className="text-3xl font-bold text-white mb-1">
                          {tier.price}
                        </p>
                        <p className="text-zinc-400 text-sm">
                          Up to {tier.reach}
                        </p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-zinc-300">
                            <Check className={`w-5 h-5 ${
                              tier.color === "yellow" ? "text-yellow-500" :
                              tier.color === "purple" ? "text-purple-500" :
                              "text-cyan-500"
                            }`} />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <NeonButton
                        className={`w-full py-3 rounded-full font-semibold ${
                          tier.popular
                            ? "bg-yellow-500 text-black hover:bg-yellow-400"
                            : tier.color === "purple"
                            ? "bg-purple-500 text-white hover:bg-purple-400"
                            : "bg-cyan-500 text-white hover:bg-cyan-400"
                        }`}
                      >
                        Get Started
                      </NeonButton>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                  <p className="text-center text-zinc-400 text-sm">
                    💡 <span className="text-white font-medium">Pro tip:</span> Gold tier shops see an average of 
                    <span className="text-yellow-400 font-semibold"> 340% more orders</span> than non-sponsored shops.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

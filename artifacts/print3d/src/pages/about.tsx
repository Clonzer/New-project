import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Rocket, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Heart, 
  Target, 
  Lightbulb,
  CheckCircle,
  Award,
  ArrowRight,
  Check,
  Package,
  Printer,
  Cpu,
  Layers,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";

export default function About() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Rocket,
      title: "Fast & Reliable",
      description: "Lightning-fast order processing with real-time tracking updates",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Industry-standard encryption and fraud protection",
      color: "from-green-500 to-emerald-400"
    },
    {
      icon: Users,
      title: "Verified Makers",
      description: "All sellers are vetted and verified for quality",
      color: "from-purple-500 to-violet-400"
    },
    {
      icon: Zap,
      title: "Instant Quotes",
      description: "Get pricing estimates in seconds, not hours",
      color: "from-yellow-500 to-orange-400"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with makers and customers worldwide",
      color: "from-pink-500 to-rose-400"
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Built by makers, for makers with love",
      color: "from-red-500 to-pink-400"
    }
  ];

  return (
    <>
      <SEOMeta
        title="About Synthix | 3D Printing & Laser Cutting Marketplace"
        description="Learn about Synthix, the premier marketplace connecting makers with customers seeking 3D printing, laser cutting, and custom fabrication services."
        canonical="https://synthix.com/about"
        type="article"
        keywords={["about synthix", "3D printing marketplace", "maker marketplace", "custom fabrication", "laser cutting services"]}
      />
      <MarketplaceStructuredData />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.12),transparent_50%)]" />
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-700" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6 backdrop-blur-sm"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">The Future of Making</span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-4">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-primary to-cyan-400">Synthix</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
                Where creators meet makers. Turn your digital dreams into physical reality.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  Our Mission
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  To democratize manufacturing by connecting creators with skilled makers worldwide. 
                  We believe everyone should have access to the tools and talent needed to bring their 
                  ideas to reality, regardless of their location or resources.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  From 3D printing to laser cutting, CNC machining to custom fabrication — 
                  if you can dream it, our makers can build it.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Printer, label: "3D Printing", color: "from-violet-500 to-purple-500" },
                  { icon: Cpu, label: "CNC Machining", color: "from-cyan-500 to-blue-500" },
                  { icon: Layers, label: "Laser Cutting", color: "from-emerald-500 to-teal-500" },
                  { icon: Wrench, label: "Custom Fab", color: "from-orange-500 to-amber-500" },
                ].map((item, idx) => (
                  <motion.div 
                    key={item.label} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-5 text-center transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-white font-medium">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
            >
              How the <span className="text-primary">Marketplace</span> Works
            </motion.h2>

            <div className="max-w-6xl mx-auto space-y-16">
              {/* For Customers */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card border-white/[0.08] hover:border-primary/30 rounded-3xl p-8 md:p-12 transition-all group"
              >
                <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  For Customers
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Browse & Discover</h4>
                        <p className="text-zinc-400 text-sm">Explore thousands of 3D models, compare shops, and find the perfect maker for your project.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Place an Order</h4>
                        <p className="text-zinc-400 text-sm">Select your model, customize materials and settings, and place your order with secure payments.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Track Production</h4>
                        <p className="text-zinc-400 text-sm">Get real-time updates as your order moves through printing, quality check, and shipping.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Receive & Review</h4>
                        <p className="text-zinc-400 text-sm">Get your delivery, inspect the quality, and leave a review to help others.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* For Makers */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card border-white/[0.08] hover:border-accent/30 rounded-3xl p-8 md:p-12 transition-all group"
              >
                <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  For Makers
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Register Your Shop</h4>
                        <p className="text-zinc-400 text-sm">Create your maker profile, list your equipment, and set your pricing and availability.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">List Your Models</h4>
                        <p className="text-zinc-400 text-sm">Upload your 3D designs, set pricing, and add detailed descriptions and images.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Receive Orders</h4>
                        <p className="text-zinc-400 text-sm">Get notified of new orders, communicate with customers, and manage production schedules.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Grow Your Business</h4>
                        <p className="text-zinc-400 text-sm">Build your reputation, earn certifications, and unlock premium features and sponsorships.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Features */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
            >
              Why Choose <span className="text-primary">Synthix</span>?
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all ${
                      activeFeature === index
                        ? `bg-gradient-to-br ${feature.color} shadow-lg shadow-${feature.color.split('-')[1]}-500/20`
                        : 'bg-zinc-900/50 border border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <feature.icon className={`w-8 h-8 mb-3 ${activeFeature === index ? 'text-white' : 'text-primary'}`} />
                    <h3 className={`text-lg font-bold mb-2 ${activeFeature === index ? 'text-white' : 'text-white'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${activeFeature === index ? 'text-white/90' : 'text-zinc-400'}`}>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Feature Display */}
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className={`p-8 rounded-3xl bg-gradient-to-br ${features[activeFeature].color} shadow-2xl`}>
                  {React.createElement(features[activeFeature].icon, { className: "w-16 h-16 text-white mb-6" })}
                  <h3 className="text-3xl font-bold text-white mb-4">{features[activeFeature].title}</h3>
                  <p className="text-xl text-white/90">{features[activeFeature].description}</p>
                  <div className="mt-6 flex items-center gap-2 text-white/80">
                    <CheckCircle className="w-5 h-5" />
                    <span>Available to all users</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center relative"
            >
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-3xl" />
              
              <div className="relative glass-card border-white/[0.08] hover:border-primary/30 rounded-3xl p-12 transition-all">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30"
                >
                  <Lightbulb className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                  Ready to Join the Revolution?
                </h2>
                <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                  Whether you're a maker looking to showcase your skills or a customer 
                  with a vision, Synthix is your platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/explore-all">
                    <Button size="lg" variant="gradient" className="h-14 px-10 rounded-xl group">
                      Explore Now
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl border-2">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}

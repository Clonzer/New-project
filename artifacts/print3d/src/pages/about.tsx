import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 animate-gradient" />
          
          <motion.div
            style={{ opacity, scale }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Synthix</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto">
                Empowering creators to bring their ideas to life through the power of community and technology
              </p>
            </motion.div>
          </motion.div>

        </section>

        {/* Mission Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <Target className="w-10 h-10 text-primary" />
                Our Mission
              </h2>
              <p className="text-xl text-zinc-400 leading-relaxed">
                To democratize manufacturing by connecting creators with skilled makers worldwide. 
                We believe everyone should have access to the tools and talent needed to bring their 
                ideas to reality, regardless of their location or resources.
              </p>
            </motion.div>
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
                className="bg-zinc-900/50 border border-zinc-700 rounded-3xl p-8 md:p-12"
              >
                <h3 className="text-2xl font-bold text-white mb-6">For Customers</h3>
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
                className="bg-zinc-900/50 border border-zinc-700 rounded-3xl p-8 md:p-12"
              >
                <h3 className="text-2xl font-bold text-white mb-6">For Makers</h3>
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
              className="max-w-4xl mx-auto text-center bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-zinc-700 rounded-3xl p-12"
            >
              <Lightbulb className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Join the Revolution?
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Whether you're a maker looking to showcase your skills or a customer 
                with a vision, Synthix is your platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore-all">
                  <Button size="lg" className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold">
                    Explore Now
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-zinc-600 text-white hover:bg-zinc-800">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

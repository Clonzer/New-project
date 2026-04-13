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
  ArrowRight,
  CheckCircle,
  Star
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

  const stats = [
    { value: "10K+", label: "Active Makers" },
    { value: "50K+", label: "Orders Delivered" },
    { value: "99%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" }
  ];

  const timeline = [
    {
      year: "2024",
      title: "Launch",
      description: "Synthix launches as a platform connecting 3D printing enthusiasts"
    },
    {
      year: "2025",
      title: "Growth",
      description: "Reached 10,000+ verified makers and expanded to global markets"
    },
    {
      year: "2026",
      title: "Innovation",
      description: "Introduced AI-powered matching and automated contest system"
    },
    {
      year: "Future",
      title: "Vision",
      description: "Building the future of decentralized manufacturing"
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
              <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8">
                Empowering creators to bring their ideas to life through the power of community and technology
              </p>
              <Link href="/explore-all">
                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 left-10 w-20 h-20 bg-violet-500/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl"
          />
        </section>

        {/* Stats Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-zinc-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
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

        {/* Timeline */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
            >
              Our <span className="text-primary">Journey</span>
            </motion.h2>

            <div className="max-w-4xl mx-auto">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`flex items-center gap-8 mb-12 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
                >
                  <div className="flex-1">
                    <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-6">
                      <div className="text-3xl font-bold text-primary mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-zinc-400">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1" />
                </motion.div>
              ))}
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

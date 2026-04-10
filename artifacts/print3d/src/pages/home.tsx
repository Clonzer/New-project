import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Sparkles, 
  Users, 
  Package, 
  Star, 
  TrendingUp,
  Shield,
  Clock,
  Award,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { NeonButton } from "@/components/ui/neon-button";
import { OnboardingTutorial } from "@/components/shared/OnboardingTutorial";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteStats } from "@/components/shared/SiteStats";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      <Navbar />
      <OnboardingTutorial />

      <main className="flex-grow">
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <AnimatedGradientBg />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-3xl text-center mx-auto"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#9fe5ff] backdrop-blur-sm shadow-[0_0_30px_rgba(159,229,255,0.12)]">
                <Sparkles className="w-4 h-4" />
                Storefront marketplace
              </span>
              <h1 className="mt-6 text-5xl md:text-7xl font-display font-extrabold text-white leading-[0.95] tracking-tight">
                Synthix: Your 3D Printing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Marketplace</span>
              </h1>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-zinc-300 leading-relaxed">
                Welcome to Synthix, the easiest way to find verified makers, buy ready-to-ship products, and order custom prints.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <NeonButton glowColor="primary" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                    Browse makers <ChevronRight className="w-5 h-5 ml-1" />
                  </NeonButton>
                </Link>
                <Link href="/listings">
                  <NeonButton glowColor="white" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                    Browse catalog
                  </NeonButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Hero Analytics Overlay */}
        <SiteStats />

        {/* Stats Section */}
        <section className="py-20 bg-zinc-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">10K+</span>
                </div>
                <p className="text-zinc-400">Active Makers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">50K+</span>
                </div>
                <p className="text-zinc-400">Products Sold</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">4.9</span>
                </div>
                <p className="text-zinc-400">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">24/7</span>
                </div>
                <p className="text-zinc-400">Support</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-zinc-800/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Synthix</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                The most trusted platform for 3D printing services and products
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Verified Makers",
                  description: "All makers are thoroughly vetted for quality and reliability"
                },
                {
                  icon: Clock,
                  title: "Fast Delivery",
                  description: "Quick turnaround times with real-time tracking"
                },
                {
                  icon: Award,
                  title: "Quality Guarantee",
                  description: "100% satisfaction guarantee on all products and services"
                },
                {
                  icon: Users,
                  title: "Community Driven",
                  description: "Join thousands of satisfied customers and talented makers"
                },
                {
                  icon: Zap,
                  title: "Instant Quotes",
                  description: "Get pricing instantly for custom projects"
                },
                {
                  icon: Star,
                  title: "Top Rated",
                  description: "Highest rated 3D printing marketplace"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700 h-full">
                    <CardHeader>
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-zinc-400">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-zinc-800/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Customers Say</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Real reviews from real customers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Product Designer",
                  content: "Synthix has completely transformed how I prototype my designs. The quality is exceptional and the turnaround time is incredible.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=sarah"
                },
                {
                  name: "Mike Chen",
                  role: "Engineer",
                  content: "As an engineer, I need precision and reliability. Synthix delivers both. The custom parts I ordered were perfect.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=mike"
                },
                {
                  name: "Emily Davis",
                  role: "Artist",
                  content: "The artistic possibilities are endless! I've created stunning pieces that wouldn't be possible with traditional methods.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=emily"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700 h-full">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-zinc-300 mb-6">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold">{testimonial.name}</p>
                          <p className="text-zinc-400 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-cyan-900/20 to-emerald-900/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Creating?</span>
              </h2>
              <p className="text-xl text-zinc-300 mb-8">
                Join thousands of makers and customers who trust Synthix for their 3D printing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-listing">
                  <NeonButton glowColor="primary" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                    Start Selling <ArrowRight className="w-5 h-5 ml-2" />
                  </NeonButton>
                </Link>
                <Link href="/explore">
                  <NeonButton glowColor="white" className="w-full sm:w-auto px-8 py-5 text-base rounded-full">
                    Browse Products
                  </NeonButton>
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
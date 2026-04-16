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
  CheckCircle,
  Printer,
  Search,
  CreditCard,
  Truck,
  MessageCircle,
  Heart,
  Gem,
  Wrench,
  Lightbulb,
  Palette,
  Boxes,
  Quote
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { NeonButton } from "@/components/ui/neon-button";
// import { OnboardingTutorial } from "@/components/shared/OnboardingTutorial";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { SiteStats } from "@/components/shared/SiteStats";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Hero gradient applied to entire page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#050510]" />
        <div className="absolute top-[-20%] left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full opacity-40 blur-[100px] bg-gradient-to-br from-[#7c3aed] via-[#4f46e5] to-transparent animate-aurora-1" />
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full opacity-30 blur-[90px] bg-gradient-to-bl from-[#06b6d4] via-[#0891b2] to-transparent animate-aurora-2" />
        <div className="absolute bottom-[0%] left-[20%] w-[60vw] h-[40vw] max-w-[700px] max-h-[500px] rounded-full opacity-25 blur-[110px] bg-gradient-to-tr from-[#a855f7] via-[#7c3aed] to-transparent animate-aurora-3" />
        <div className="absolute top-[40%] left-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-20 blur-[80px] bg-gradient-to-r from-[#06b6d4] to-transparent animate-aurora-4" />
        <div className="absolute inset-0 opacity-[0.03] bg-noise" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
      </div>
      <Navbar />
      {/* <OnboardingTutorial /> */}

      <main className="flex-grow relative z-10">
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
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
        {/* <SiteStats /> */}

        {/* Section 2: Features */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-zinc-800 text-white border-zinc-700">
                <Sparkles className="w-3 h-3 mr-1" /> Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Synthix</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                The most trusted platform for 3D printing services and products
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Verified Makers",
                  description: "All makers are thoroughly vetted for quality and reliability",
                  color: "from-emerald-400 to-cyan-400"
                },
                {
                  icon: Clock,
                  title: "Fast Delivery",
                  description: "Quick turnaround times with real-time tracking",
                  color: "from-blue-400 to-indigo-400"
                },
                {
                  icon: Award,
                  title: "Quality Guarantee",
                  description: "100% satisfaction guarantee on all products and services",
                  color: "from-amber-400 to-orange-400"
                },
                {
                  icon: Users,
                  title: "Community Driven",
                  description: "Join thousands of satisfied customers and talented makers",
                  color: "from-purple-400 to-pink-400"
                },
                {
                  icon: Zap,
                  title: "Instant Quotes",
                  description: "Get pricing instantly for custom projects",
                  color: "from-yellow-400 to-red-400"
                },
                {
                  icon: Gem,
                  title: "Premium Materials",
                  description: "Access to high-quality filaments and resins",
                  color: "from-rose-400 to-pink-400"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-300 h-full group overflow-hidden">
                    <CardHeader>
                      <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-base">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: How It Works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-zinc-800 text-white border-zinc-700">
                <Boxes className="w-3 h-3 mr-1" /> Simple Process
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Works</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Get your 3D prints in three simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  icon: Search,
                  title: "Browse & Discover",
                  description: "Explore thousands of designs or find a maker for your custom project",
                  color: "from-cyan-400 to-blue-500"
                },
                {
                  step: "02",
                  icon: CreditCard,
                  title: "Order & Pay",
                  description: "Secure checkout with buyer protection and multiple payment options",
                  color: "from-purple-400 to-pink-500"
                },
                {
                  step: "03",
                  icon: Truck,
                  title: "Receive & Enjoy",
                  description: "Fast shipping with tracking. Get your prints delivered to your door",
                  color: "from-emerald-400 to-green-500"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -20 : index === 2 ? 20 : 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <Card className="bg-black/30 border-zinc-800 hover:border-zinc-700 hover:bg-black/40 transition-all duration-300 h-full relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${item.color}`} />
                    <CardHeader className="pt-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                        <span className={`text-5xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent opacity-20`}>
                          {item.step}
                        </span>
                      </div>
                      <CardTitle className="text-white text-2xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-lg leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Categories */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-zinc-800 text-white border-zinc-700">
                <Palette className="w-3 h-3 mr-1" /> Browse by Category
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Categories</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Find exactly what you need across our diverse range of 3D printing categories
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Printer, title: "Prototyping", items: "2,500+ items", color: "from-cyan-400 to-blue-500" },
                { icon: Wrench, title: "Functional Parts", items: "1,800+ items", color: "from-emerald-400 to-green-500" },
                { icon: Heart, title: "Miniatures", items: "3,200+ items", color: "from-pink-400 to-rose-500" },
                { icon: Lightbulb, title: "Cosplay Props", items: "950+ items", color: "from-amber-400 to-orange-500" },
                { icon: Package, title: "Home Decor", items: "1,500+ items", color: "from-purple-400 to-violet-500" },
                { icon: Boxes, title: "Jewelry", items: "800+ items", color: "from-yellow-400 to-amber-500" },
                { icon: Zap, title: "Tech Accessories", items: "1,200+ items", color: "from-indigo-400 to-blue-500" },
                { icon: MessageCircle, title: "Custom Orders", items: "Custom quotes", color: "from-teal-400 to-emerald-500" }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Link href="/listings">
                    <Card className="bg-black/40 border-zinc-800 hover:border-zinc-700 hover:bg-black/60 transition-all duration-300 cursor-pointer group overflow-hidden h-full">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors">{category.title}</h3>
                          <p className="text-zinc-400 text-sm">{category.items}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Testimonials */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-zinc-700 text-white border-zinc-600">
                <Star className="w-3 h-3 mr-1 fill-current" /> Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Customers Say</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Real reviews from real customers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Product Designer",
                  content: "Synthix has completely transformed how I prototype my designs. The quality is exceptional and the turnaround time is incredible.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=sarah",
                  color: "from-cyan-400 to-blue-500"
                },
                {
                  name: "Mike Chen",
                  role: "Engineer",
                  content: "As an engineer, I need precision and reliability. Synthix delivers both. The custom parts I ordered were perfect.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=mike",
                  color: "from-purple-400 to-pink-500"
                },
                {
                  name: "Emily Davis",
                  role: "Artist",
                  content: "The artistic possibilities are endless! I've created stunning pieces that wouldn't be possible with traditional methods.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=emily",
                  color: "from-emerald-400 to-green-500"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="bg-black/30 border-zinc-800 hover:border-zinc-700 hover:bg-black/40 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-xl flex items-center justify-center mb-4`}>
                        <Quote className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-zinc-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-zinc-700 to-zinc-600 text-zinc-200 font-semibold">
                            {testimonial.name[0]}
                          </AvatarFallback>
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

        {/* Section 6: CTA - Gradient Background */}
        <section className="py-24 bg-gradient-to-br from-cyan-600 via-blue-700 to-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white mb-6">
                <Sparkles className="w-4 h-4" />
                Join 10,000+ creators today
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to Start <span className="text-yellow-300">Creating?</span>
              </h2>
              <p className="text-xl text-white/80 mb-10">
                Join thousands of makers and customers who trust Synthix for their 3D printing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-listing">
                  <Button size="lg" className="bg-white text-cyan-700 hover:bg-zinc-100 font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all">
                    Start Selling <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-full backdrop-blur-sm">
                    Browse Products
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

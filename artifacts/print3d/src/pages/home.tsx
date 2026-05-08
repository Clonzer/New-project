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
  Quote,
  Eye,
  Activity,
  Rocket,
  Target,
  Crown,
  Flame,
  Globe
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { NeonButton } from "@/components/ui/neon-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteStats } from "@/components/shared/SiteStats";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";

export default function Home() {
  return (
    <>
      <SEOMeta
        title="Synthix | 3D Printing & Laser Cutting Marketplace for Makers"
        description="Connect with skilled makers for custom 3D printing, laser cutting, and fabrication services. Browse thousands of products, services, and equipment rentals from verified vendors."
        canonical="https://synthix.com"
        image="https://synthix.com/og-image.jpg"
        type="website"
        keywords={[
          "3D printing marketplace",
          "laser cutting services",
          "custom fabrication",
          "3D printing service",
          "maker marketplace",
          "3D printed products",
          "CNC machining",
          "woodworking services",
          "prototyping services",
        ]}
      />
      <MarketplaceStructuredData />
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Enhanced Hero gradient with more dynamic effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
        
        {/* Animated floating orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, -100, 100, 0],
            y: [0, -100, 100, -100, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-[20%] left-[15%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full opacity-20 blur-[150px] bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600"
        />
        
        <motion.div 
          animate={{ 
            x: [0, -80, 80, -80, 0],
            y: [0, 80, -80, 80, 0],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-[10%] right-[15%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full opacity-15 blur-[120px] bg-gradient-to-bl from-cyan-400 via-teal-500 to-emerald-600"
        />
        
        <motion.div 
          animate={{ 
            x: [60, -60, -60, 60, 0],
            y: [-60, 60, -60, 60, 0],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-[20%] left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full opacity-25 blur-[100px] bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600"
        />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 0.8, 1.1, 1],
            rotate: [0, 180, 360, 180, 0],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-[35%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-20 blur-[80px] bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
        />
        
        {/* Enhanced noise and grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-noise" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ 
          backgroundImage: `linear-gradient(rgba(236,72,153,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(45deg, rgba(168,85,247,0.3) 1px, transparent 1px)`, 
          backgroundSize: "80px 80px", 
          animation: "grid 20s linear infinite" 
        }} />
        
        {/* Particle effects */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 3) * 15}%`,
            }}
          />
        ))}
      </div>
      <Navbar />

      <main className="flex-grow relative z-10">
        <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl text-center mx-auto"
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-orange-600/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md shadow-lg shadow-orange-500/25"
              >
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span className="bg-gradient-to-r from-orange-300 to-orange-400 bg-clip-text text-transparent">Storefront marketplace</span>
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-8 text-5xl md:text-7xl lg:text-9xl font-display font-black text-white leading-[0.95] tracking-tight"
              >
                <span className="relative inline-block">
                  <motion.span 
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%"], 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
                    style={{ backgroundSize: "200% 100%" }}
                  >
                    Your 3D Printing Marketplace
                  </motion.span>
                  <span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent opacity-90">Marketplace</span>
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 max-w-3xl mx-auto text-xl md:text-2xl text-zinc-300 leading-relaxed font-medium"
              >
                Connect with verified makers, buy ready-to-ship products, and order custom prints. 
                <motion.span 
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent font-bold"
                >
                  The easiest way to bring your ideas to life.
                </motion.span>
              </motion.p>
              <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link href="/explore">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto px-14 h-18 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 group border-0 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      <span className="relative flex items-center gap-3">
                        <motion.span 
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          Browse makers 
                        </motion.span>
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-3" />
                      </span>
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Link href="/listings">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto px-14 h-18 text-lg font-bold rounded-2xl border-2 border-orange-500/50 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400 hover:text-orange-200 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-500/20 to-orange-500/20 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      <span className="relative z-10">Browse catalog</span>
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Hero Analytics Overlay */}
        <SiteStats />

        {/* Section: Explore All Buttons */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge variant="glass" className="mb-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Discover
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Explore <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Everything</span><span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Everything</span></span>
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
                Browse all shops and models in one place
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link href="/explore-all?filter=shops">
                  <Card className="bg-gradient-to-br from-pink-600/30 via-purple-600/30 to-indigo-600/30 border-pink-500/40 hover:border-pink-400/60 hover:from-pink-600/40 hover:via-purple-600/40 hover:to-indigo-600/40 transition-all duration-300 cursor-pointer group overflow-hidden h-full shadow-xl shadow-pink-500/20 hover:shadow-pink-500/30">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-pink-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3">Explore All Shops</h3>
                      <p className="text-zinc-200 mb-6 text-lg font-medium">Discover verified makers and their equipment</p>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-7 rounded-2xl text-lg group-hover:shadow-2xl group-hover:shadow-orange-500/30 transition-all border-0">
                        Browse Shops <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link href="/explore-all?filter=models">
                  <Card className="bg-gradient-to-br from-cyan-600/30 via-teal-600/30 to-emerald-600/30 border-cyan-500/40 hover:border-cyan-400/60 hover:from-cyan-600/40 hover:via-teal-600/40 hover:to-emerald-600/40 transition-all duration-300 cursor-pointer group overflow-hidden h-full shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Package className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3">Explore All Models</h3>
                      <p className="text-zinc-200 mb-6 text-lg font-medium">Find ready-to-ship products and custom listings</p>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold py-7 rounded-2xl text-lg group-hover:shadow-2xl group-hover:shadow-cyan-500/30 transition-all border-0">
                        Browse Models <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 2: Enhanced Features with Stats */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-orange-800/10 to-transparent opacity-30" />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300 backdrop-blur-md">
                <Crown className="w-3 h-3 mr-1" /> Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Why Choose <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Synthix</span><span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Synthix</span></span>
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
                The most trusted platform for 3D printing services and products
              </p>
              
              {/* Live Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mt-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {[
                  { number: "10,000+", label: "Active Makers", icon: Users, color: "from-emerald-400 via-teal-400 to-cyan-400" },
                  { number: "50,000+", label: "Products Listed", icon: Package, color: "from-purple-400 via-pink-400 to-rose-400" },
                  { number: "99.9%", label: "Success Rate", icon: CheckCircle, color: "from-amber-400 via-orange-400 to-red-400" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-xl backdrop-blur-md`}>
                      <stat.icon className="w-8 h-8 mx-auto text-white mb-2" />
                      <div className="text-3xl font-black text-white">{stat.number}</div>
                      <div className="text-sm text-zinc-200">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Verified Makers",
                  description: "All makers are thoroughly vetted for quality and reliability",
                  color: "from-emerald-400 via-teal-400 to-cyan-400",
                  badge: "100% Verified"
                },
                {
                  icon: Clock,
                  title: "Lightning Fast",
                  description: "Average 48-hour delivery with real-time tracking",
                  color: "from-blue-400 via-indigo-400 to-purple-400",
                  badge: "Express Delivery"
                },
                {
                  icon: Award,
                  title: "Quality Guarantee",
                  description: "100% satisfaction guarantee with free revisions",
                  color: "from-amber-400 via-orange-400 to-red-400",
                  badge: "Risk-Free"
                },
                {
                  icon: Users,
                  title: "Community Driven",
                  description: "Join 50,000+ satisfied customers and talented makers",
                  color: "from-purple-400 via-pink-400 to-rose-400",
                  badge: "5-Star Rated"
                },
                {
                  icon: Zap,
                  title: "Instant Quotes",
                  description: "Get pricing instantly for custom projects",
                  color: "from-yellow-400 via-amber-400 to-orange-400",
                  badge: "AI-Powered"
                },
                {
                  icon: Gem,
                  title: "Premium Materials",
                  description: "Access to industry-leading filaments and resins",
                  color: "from-rose-400 via-pink-400 to-purple-400",
                  badge: "Pro Grade"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <Card className="bg-black/40 border-white/10 hover:border-pink-500/50 hover:bg-black/60 transition-all duration-300 h-full group overflow-hidden shadow-2xl backdrop-blur-sm relative">
                    {feature.badge && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          {feature.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative`}>
                        <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <feature.icon className="w-10 h-10 text-white relative z-10" />
                      </div>
                      <CardTitle className="text-white text-2xl font-black">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 text-lg leading-relaxed font-medium">
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
              <Badge className="mb-4 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/30 text-pink-300 backdrop-blur-md">
                <Boxes className="w-3 h-3 mr-1" /> Simple Process
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                How It <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Works</span><span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Works</span></span>
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
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
                  color: "from-pink-400 via-purple-400 to-indigo-400"
                },
                {
                  step: "02",
                  icon: CreditCard,
                  title: "Order & Pay",
                  description: "Secure checkout with buyer protection and multiple payment options",
                  color: "from-cyan-400 via-teal-400 to-emerald-400"
                },
                {
                  step: "03",
                  icon: Truck,
                  title: "Receive & Enjoy",
                  description: "Fast shipping with tracking. Get your prints delivered to your door",
                  color: "from-amber-400 via-orange-400 to-red-400"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -20 : index === 2 ? 20 : 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <Card className="bg-black/40 border-zinc-800 hover:border-pink-500/50 hover:bg-black/60 transition-all duration-300 h-full relative overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${item.color}`} />
                    <CardHeader className="pt-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <item.icon className="w-10 h-10 text-white" />
                        </div>
                        <span className={`text-6xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent opacity-20`}>
                          {item.step}
                        </span>
                      </div>
                      <CardTitle className="text-white text-2xl font-black">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 text-lg leading-relaxed font-medium">{item.description}</p>
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
              <Badge className="mb-4 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/30 text-pink-300 backdrop-blur-md">
                <Palette className="w-3 h-3 mr-1" /> Browse by Category
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Popular <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Categories</span><span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Categories</span></span>
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
                Find exactly what you need across our diverse range of 3D printing categories
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Printer, title: "Prototyping", items: "2,500+ items", color: "from-pink-400 via-purple-400 to-indigo-400" },
                { icon: Wrench, title: "Functional Parts", items: "1,800+ items", color: "from-cyan-400 via-teal-400 to-emerald-400" },
                { icon: Heart, title: "Miniatures", items: "3,200+ items", color: "from-rose-400 via-pink-400 to-purple-400" },
                { icon: Lightbulb, title: "Cosplay Props", items: "950+ items", color: "from-amber-400 via-orange-400 to-red-400" },
                { icon: Package, title: "Home Decor", items: "1,500+ items", color: "from-purple-400 via-violet-400 to-indigo-400" },
                { icon: Boxes, title: "Jewelry", items: "800+ items", color: "from-yellow-400 via-amber-400 to-orange-400" },
                { icon: Zap, title: "Tech Accessories", items: "1,200+ items", color: "from-indigo-400 via-blue-400 to-cyan-400" },
                { icon: MessageCircle, title: "Custom Orders", items: "Custom quotes", color: "from-teal-400 via-emerald-400 to-green-400" }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Link href="/listings">
                    <Card className="bg-black/40 border-zinc-800 hover:border-pink-500/50 hover:bg-black/60 transition-all duration-300 cursor-pointer group overflow-hidden h-full shadow-xl backdrop-blur-sm">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
                          <category.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl group-hover:text-pink-400 transition-colors">{category.title}</h3>
                          <p className="text-zinc-300 text-sm font-medium">{category.items}</p>
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
              <Badge className="mb-4 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/30 text-pink-300 backdrop-blur-md">
                <Star className="w-3 h-3 mr-1 fill-current" /> Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                What Our <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Customers Say</span><span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Customers Say</span></span>
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
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
                  color: "from-pink-400 via-purple-400 to-indigo-400"
                },
                {
                  name: "Mike Chen",
                  role: "Engineer",
                  content: "As an engineer, I need precision and reliability. Synthix delivers both. The custom parts I ordered were perfect.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=mike",
                  color: "from-cyan-400 via-teal-400 to-emerald-400"
                },
                {
                  name: "Emily Davis",
                  role: "Artist",
                  content: "The artistic possibilities are endless! I've created stunning pieces that wouldn't be possible with traditional methods.",
                  rating: 5,
                  avatar: "https://api.pravatar.cc/150?u=emily",
                  color: "from-amber-400 via-orange-400 to-red-400"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="bg-black/40 border-zinc-800 hover:border-pink-500/50 hover:bg-black/60 transition-all duration-300 h-full shadow-2xl backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${testimonial.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                        <Quote className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-zinc-200 mb-8 leading-relaxed text-lg font-medium">"{testimonial.content}"</p>
                      <div className="flex items-center gap-4 pt-6 border-t border-zinc-700">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-zinc-700 to-zinc-600 text-zinc-200 font-bold text-lg">
                            {testimonial.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-bold text-lg">{testimonial.name}</p>
                          <p className="text-zinc-300 text-sm font-medium">{testimonial.role}</p>
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
        <section className="py-24 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="absolute top-[-20%] left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full opacity-20 blur-[100px] bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 animate-pulse" />
          <div className="absolute bottom-[-20%] right-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full opacity-20 blur-[80px] bg-gradient-to-tr from-cyan-400 via-teal-500 to-emerald-600 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-bold text-white mb-8 shadow-xl border border-white/20">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">Join 10,000+ creators today</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                Ready to Start <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Creating?</span><span className="relative bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">Creating?</span></span>
              </h2>
              <p className="text-2xl text-white/90 mb-12 font-medium">
                Join thousands of makers and customers who trust Synthix for their 3D printing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/create-listing">
                  <Button size="lg" className="bg-white text-purple-700 hover:bg-zinc-100 font-black px-12 py-8 text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group border-0">
                    <span className="flex items-center gap-3">
                      Start Selling 
                      <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                    </span>
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/15 hover:border-white/60 font-black px-12 py-8 text-xl rounded-full backdrop-blur-md transition-all duration-300">
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
    </>
  );
}

import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  Package, 
  Star, 
  TrendingUp,
  Shield,
  Zap,
  Rocket,
  Target,
  Crown,
  Flame,
  Globe,
  Play,
  ChevronDown,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";

export default function Landing() {
  return (
    <>
      <SEOMeta
        title="Synthix | The Ultimate 3D Printing & Laser Cutting Marketplace"
        description="Connect with skilled makers, browse thousands of products, and bring your ideas to life. The most trusted platform for 3D printing, laser cutting, and custom fabrication services."
        canonical="https://synthix.com"
        image="https://synthix.com/og-image.jpg"
        type="website"
        keywords={[
          "3D printing marketplace",
          "laser cutting services", 
          "custom fabrication",
          "maker marketplace",
          "3D printing service",
          "custom orders",
          "3D printed products",
          "CNC machining",
          "prototyping services",
        ]}
      />
      <MarketplaceStructuredData />
      
      <div className="min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Enhanced Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
            
            {/* Floating Orbs */}
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
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl text-center mx-auto"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/20 to-purple-600/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md shadow-lg shadow-pink-500/25 mb-6"
              >
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Storefront marketplace</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.95] tracking-tight mb-6"
              >
                Your 3D Printing{" "}
                <span className="relative">
                  <motion.span 
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%"], 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
                    style={{ backgroundSize: "200% 100%" }}
                  >
                    Marketplace
                  </motion.span>
                  <span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Marketplace</span>
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-2xl mx-auto text-xl md:text-2xl text-zinc-300 leading-relaxed font-medium mb-8"
              >
                Connect with verified makers, buy ready-to-ship products, and order custom prints. 
                <motion.span 
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-bold"
                >
                  The easiest way to bring your ideas to life.
                </motion.span>
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Link href="/explore">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto px-12 h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 group border-0"
                    >
                      <span className="flex items-center gap-3">
                        Browse makers 
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <Link href="/listings">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto px-12 h-16 text-lg font-bold rounded-2xl border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 hover:text-purple-200 backdrop-blur-sm transition-all duration-300"
                    >
                      Browse catalog
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { number: "10,000+", label: "Active Makers", icon: Users, color: "from-emerald-400 via-teal-400 to-cyan-400" },
                { number: "50,000+", label: "Products Listed", icon: Package, color: "from-purple-400 via-pink-400 to-rose-400" },
                { number: "99.9%", label: "Success Rate", icon: CheckCircle, color: "from-amber-400 via-orange-400 to-red-400" },
                { number: "24/7", label: "Support", icon: Shield, color: "from-blue-400 via-indigo-400 to-purple-400" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-xl backdrop-blur-md`}>
                    <stat.icon className="w-8 h-8 mx-auto text-white mb-3" />
                    <div className="text-3xl font-black text-white">{stat.number}</div>
                    <div className="text-sm text-zinc-200">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/30 text-pink-300 backdrop-blur-md">
                <Crown className="w-3 h-3 mr-1" /> Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Why Choose <span className="relative"><span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent blur-xl animate-pulse opacity-70">Synthix</span><span className="relative bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Synthix</span></span>
              </h2>
              <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
                The most trusted platform for 3D printing services and products
              </p>
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
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Average 48-hour delivery with real-time tracking",
                  color: "from-blue-400 via-indigo-400 to-purple-400",
                  badge: "Express Delivery"
                },
                {
                  icon: Star,
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
                  icon: Target,
                  title: "Instant Quotes",
                  description: "Get pricing instantly for custom projects",
                  color: "from-yellow-400 via-amber-400 to-orange-400",
                  badge: "AI-Powered"
                },
                {
                  icon: Globe,
                  title: "Global Network",
                  description: "Access to makers worldwide with local pickup options",
                  color: "from-rose-400 via-pink-400 to-purple-400",
                  badge: "Worldwide"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="bg-black/40 border-white/10 hover:border-pink-500/50 hover:bg-black/60 transition-all duration-300 h-full group overflow-hidden shadow-2xl backdrop-blur-sm rounded-2xl relative">
                    {feature.badge && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          {feature.badge}
                        </Badge>
                      </div>
                    )}
                    <div className="p-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative`}>
                        <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <feature.icon className="w-8 h-8 text-white relative z-10" />
                      </div>
                      <h3 className="text-white text-2xl font-black mb-3">{feature.title}</h3>
                      <p className="text-zinc-300 text-lg leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
                <Rocket className="w-5 h-5 text-yellow-300" />
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
                  <NeonButton 
                    glowColor="primary" 
                    className="py-4 px-12 rounded-2xl text-lg font-black"
                  >
                    Start Selling <ArrowRight className="w-5 h-5 ml-2" />
                  </NeonButton>
                </Link>
                <Link href="/explore">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/40 text-white hover:bg-white/15 hover:border-white/60 font-black px-12 py-4 rounded-2xl text-lg backdrop-blur-md transition-all duration-300"
                  >
                    Browse Products
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

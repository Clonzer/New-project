import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Package, 
  Star, 
  Users, 
  TrendingUp,
  Clock,
  MapPin,
  Heart,
  MessageSquare,
  Eye,
  ChevronRight,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Award
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { useListListings, useListUsers } from "@/lib/workspace-stub";

export default function Landing() {
  const listings = useListListings();
  const users = useListUsers();

  return (
    <>
      <SEOMeta
        title="Synthix | 3D Printing & Laser Cutting Marketplace"
        description="Browse thousands of 3D printed products and services from verified makers. Order custom prints or buy ready-to-ship items."
        canonical="https://synthix.com"
        image="https://synthix.com/og-image.jpg"
        type="website"
        keywords={[
          "3D printing marketplace",
          "laser cutting services", 
          "custom fabrication",
          "3D printed products",
          "maker marketplace",
          "3D printing service",
          "custom orders",
          "CNC machining",
        ]}
      />
      <MarketplaceStructuredData />
      
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <main className="flex-grow">
          {/* Marketplace Header */}
          <section className="bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 border-b border-zinc-800">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  3D Printing <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Marketplace</span>
                </h1>
                <p className="text-xl text-zinc-300 mb-8">
                  Connect with verified makers and browse thousands of products
                </p>
                
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search for products, services, or makers..."
                      className="w-full pl-12 pr-32 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                    <Link href="/search">
                      <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-all">
                        Search
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/explore-all">
                    <Badge className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors">
                      Browse All
                    </Badge>
                  </Link>
                  <Link href="/listings">
                    <Badge className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors">
                      Products
                    </Badge>
                  </Link>
                  <Link href="/service-marketplace">
                    <Badge className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors">
                      Services
                    </Badge>
                  </Link>
                  <Link href="/discover">
                    <Badge className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors">
                      Makers
                    </Badge>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Browse Categories</h2>
                <Link href="/explore-all">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    View All <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: "3D Printing", icon: "🖨️", count: listings.data?.listings?.filter(l => l.category === "3D Printing").length || "0", color: "from-blue-500 to-cyan-500" },
                  { name: "Laser Cutting", icon: "⚡", count: listings.data?.listings?.filter(l => l.category === "Laser Cutting").length || "0", color: "from-pink-500 to-purple-500" },
                  { name: "CNC", icon: "⚙️", count: listings.data?.listings?.filter(l => l.category === "CNC").length || "0", color: "from-orange-500 to-red-500" },
                  { name: "Prototyping", icon: "🔬", count: listings.data?.listings?.filter(l => l.category === "Prototyping").length || "0", color: "from-green-500 to-teal-500" },
                  { name: "Jewelry", icon: "💎", count: listings.data?.listings?.filter(l => l.category === "Jewelry").length || "0", color: "from-amber-500 to-yellow-500" },
                  { name: "Art", icon: "🎨", count: listings.data?.listings?.filter(l => l.category === "Art").length || "0", color: "from-purple-500 to-pink-500" }
                ].map((category, index) => (
                  <Link key={index} href={`/explore?category=${category.name.toLowerCase()}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all cursor-pointer group"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-3 text-2xl group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                      <p className="text-zinc-400 text-sm">{category.count} items</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-16 bg-zinc-900/50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Featured Products</h2>
                <Link href="/listings">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    View All <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.data?.listings?.slice(0, 8).map((listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: listings.data?.listings?.indexOf(listing) * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                        {listing.imageUrl && (
                          <img 
                            src={listing.imageUrl} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {listing.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-pink-500 text-white text-xs">Featured</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2 line-clamp-1">{listing.title}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="text-zinc-300 text-sm">{listing.rating || "4.8"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-400 text-sm">{listing.views || "234"}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold">${listing.basePrice || "29.99"}</span>
                          <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Top Makers */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Top Makers</h2>
                <Link href="/discover">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    View All <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {users.data?.users?.slice(0, 4).map((user, index) => (
                  <Link key={user.id} href={`/shop/${user.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold flex items-center gap-2">
                              {user.displayName || user.name || `User ${index + 1}`}
                              {user.isVerified && (
                                <Shield className="w-4 h-4 text-emerald-400" />
                              )}
                            </h3>
                            <p className="text-zinc-400 text-sm">{user.role || 'Maker'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-white font-bold">{user.rating || "4.8"}</div>
                          <div className="text-zinc-400 text-xs">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold">{user.orders || "156"}</div>
                          <div className="text-zinc-400 text-xs">Orders</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold">98%</div>
                          <div className="text-zinc-400 text-xs">Success</div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                        Visit Shop
                      </Button>
                    </motion.div>
                  </Link>
                ))}
                      </div>
                      
                      <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                        Visit Shop
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16 bg-zinc-900/50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Custom Services</h2>
                <Link href="/service-marketplace">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    View All <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "3D Printing", desc: "High-quality prints in various materials", price: "From $15", icon: "🖨️" },
                  { title: "Laser Cutting", desc: "Precise cuts on wood, acrylic, metal", price: "From $25", icon: "⚡" },
                  { title: "CNC Machining", desc: "Professional metal and plastic parts", price: "From $50", icon: "⚙️" },
                  { title: "3D Scanning", desc: "Digitize physical objects", price: "From $30", icon: "📷" },
                  { title: "Design Services", desc: "Custom 3D modeling and design", price: "From $40/hour", icon: "🎨" },
                  { title: "Assembly", desc: "Professional product assembly", price: "From $20/hour", icon: "🔧" }
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{service.icon}</div>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                        {service.price}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{service.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4">{service.desc}</p>
                    <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                      Get Quote
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

                  </main>

        <Footer />
      </div>
    </>
  );
}

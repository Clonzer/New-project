import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, 
  Star, 
  Users, 
  Eye,
  ChevronRight,
  Shield,
  Package,
  Crown
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { useListListings, useListUsers } from "@/lib/workspace-stub";

export default function Landing() {
  const listings = useListListings();
  const users = useListUsers();

  // Combine and mix listings and users
  const marketplaceItems = [
    ...(listings.data?.listings?.slice(0, 6).map(listing => ({
      ...listing,
      type: 'product',
      title: listing.title,
      subtitle: `$${listing.basePrice || '29.99'}`,
      image: listing.imageUrl,
      rating: listing.rating || "4.8",
      views: listing.views || "234",
      link: `/listings/${listing.id}`
    })) || []),
    ...(users.data?.users?.slice(0, 6).map((user, index) => ({
      ...user,
      type: 'maker',
      title: user.displayName || user.name || `User ${index + 1}`,
      subtitle: user.role || 'Maker',
      rating: user.rating || "4.8",
      orders: user.orders || "156",
      link: `/shop/${user.id}`
    })) || [])
  ].sort(() => Math.random() - 0.5).slice(0, 8); // Shuffle and limit to 8 items

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
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                  3D Printing <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Marketplace</span>
                </h1>
              </div>
                
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search products, services, or makers..."
                      className="w-full pl-14 pr-36 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-400 text-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                    <Link href="/search">
                      <Button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-all text-lg">
                        Search
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
          </section>

          {/* Categories Section */}
          <section className="py-12 bg-zinc-900/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Browse <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Categories</span>
                </h2>
                <p className="text-zinc-400">Find exactly what you're looking for</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: "3D Printing", icon: "🖨️", color: "from-blue-500 to-cyan-500" },
                  { name: "Laser Cutting", icon: "⚡", color: "from-yellow-500 to-orange-500" },
                  { name: "CNC Machining", icon: "⚙️", color: "from-purple-500 to-pink-500" },
                  { name: "3D Scanning", icon: "📷", color: "from-green-500 to-emerald-500" },
                  { name: "Design Services", icon: "🎨", color: "from-pink-500 to-rose-500" },
                  { name: "Assembly", icon: "🔧", color: "from-indigo-500 to-blue-500" }
                ].map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <div className={`bg-gradient-to-br ${category.color} p-6 rounded-2xl border border-zinc-800/50 shadow-lg hover:shadow-xl transition-all duration-300`}>
                      <div className="text-3xl mb-3">{category.icon}</div>
                      <h3 className="text-white font-semibold text-sm">{category.name}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="py-16 bg-zinc-950">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Featured <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Products</span>
                </h2>
                <p className="text-zinc-400">Handpicked items from our top makers</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {marketplaceItems.slice(0, 6).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Link href={item.link}>
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all duration-300">
                        <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-16 h-16 text-zinc-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                              <p className="text-zinc-400 text-sm">{item.subtitle}</p>
                            </div>
                            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                              {item.type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-white text-sm font-medium">{item.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-400 text-sm">{item.views}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-pink-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Sponsored Products Section */}
          <section className="py-16 bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">
                    Sponsored <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">Products</span>
                  </h2>
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-zinc-400">Premium items from verified sellers</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketplaceItems.slice(6, 10).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group"
                  >
                    <Link href={item.link}>
                      <div className="relative bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-yellow-500/30 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300">
                        {/* Sponsored Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                            <Crown className="w-3 h-3 mr-1" />
                            Sponsored
                          </Badge>
                        </div>
                        <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-zinc-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{item.title}</h3>
                          <p className="text-zinc-400 text-xs mb-3">{item.subtitle}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-white text-xs font-medium">{item.rating}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-yellow-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
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

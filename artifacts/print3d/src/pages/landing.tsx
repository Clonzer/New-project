import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, 
  Star, 
  Users, 
  Eye,
  ChevronRight,
  Shield,
  Package
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
                <p className="text-2xl text-zinc-300 mb-12">
                  Discover products and makers in one place
                </p>
                
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
            </div>
          </section>

          {/* Mixed Marketplace */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Trending in Marketplace</h2>
                <p className="text-zinc-400 text-lg">Discover popular products and talented makers</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {marketplaceItems.map((item, index) => (
                  <Link key={item.id} to={item.link}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer h-full"
                    >
                      {item.type === 'product' ? (
                        <>
                          <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-pink-500 text-white text-xs">Product</Badge>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-white font-semibold mb-2 line-clamp-1">{item.title}</h3>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-zinc-300 text-sm">{item.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-zinc-400" />
                                <span className="text-zinc-400 text-sm">{item.views}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white font-bold text-lg">{item.subtitle}</span>
                              <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                                View
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Users className="w-8 h-8 text-white" />
                            </div>
                            <Badge className="bg-purple-500 text-white text-xs">Maker</Badge>
                          </div>
                          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                            {item.title}
                            {item.isVerified && (
                              <Shield className="w-4 h-4 text-emerald-400" />
                            )}
                          </h3>
                          <p className="text-zinc-400 text-sm mb-4">{item.subtitle}</p>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-white font-bold">{item.rating}</div>
                              <div className="text-zinc-400 text-xs">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-bold">{item.orders}</div>
                              <div className="text-zinc-400 text-xs">Orders</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-bold">98%</div>
                              <div className="text-zinc-400 text-xs">Success</div>
                            </div>
                          </div>
                          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white mt-auto">
                            Visit Shop
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link href="/explore-all">
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg">
                    Explore Full Marketplace <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

                  </main>

        <Footer />
      </div>
    </>
  );
}

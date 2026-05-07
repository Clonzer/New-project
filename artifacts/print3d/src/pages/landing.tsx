import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Search, 
  Star, 
  Users, 
  Eye,
  ChevronRight,
  Shield,
  Package,
  Crown,
  TrendingUp,
  Zap,
  Award,
  Sparkles
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { useListListings, useListUsers } from "@/lib/workspace-stub";

export default function Landing() {
  const listings = useListListings();
  const users = useListUsers();
  const [filterType, setFilterType] = useState("all");

  // Debug logging
  console.log("Listings data:", listings.data);
  console.log("Users data:", users.data);
  console.log("Listings loading:", listings.isLoading);
  console.log("Users loading:", users.isLoading);

  // Combine and mix listings and users from real database
  const marketplaceItems = [
    // Real listings
    ...(listings.data?.listings?.slice(0, 6).map(listing => ({
      ...listing,
      type: "product",
      title: listing.title,
      subtitle: `$${listing.basePrice}`,
      image: listing.imageUrl,
      rating: listing.rating || "4.8",
      views: listing.views || "0",
      sellerName: listing.sellerName,
      link: `/listings/${listing.id}`
    })) || []),
    
    // Real users (sellers)
    ...(users.data?.users?.slice(0, 6).map((user, index) => ({
      ...user,
      type: "maker",
      title: user.displayName || user.name || `User ${index + 1}`,
      subtitle: user.role || "Maker",
      rating: user.rating || "4.8",
      orders: user.orders || "0",
      link: `/shop/${user.id}`
    })) || [])
  ].sort(() => Math.random() - 0.5).slice(0, 8); // Shuffle and limit to 8 items

  console.log("Marketplace items count:", marketplaceItems.length);

  // Filter items based on type
  const filteredItems = marketplaceItems.filter(item => {
    if (filterType === "shops") return item.type === "maker";
    if (filterType === "models") return item.type === "product";
    return true; // Show all (both products and shops)
  });

  console.log("Filter type:", filterType);
  console.log("Filtered items count:", filteredItems.length);

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
          {/* Featured Carousel Section */}
          <section className="relative overflow-hidden">
            <div className="container mx-auto px-4 py-12">
              {/* Featured Products Carousel */}
              <div className="mb-12">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6">
                      <Sparkles className="w-6 h-6" />
                      <span className="text-lg font-bold">Featured Products & Top Shops</span>
                    </div>
                  </motion.div>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className="flex gap-6 overflow-hidden">
                      {/* Featured Products */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                            Trending Products
                          </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Placeholder for featured products */}
                          {[1, 2, 3].map((item) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: item * 0.1 }}
                              whileHover={{ y: -5, scale: 1.05 }}
                              className="group"
                            >
                              <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                                <div className="w-16 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg mb-4 flex items-center justify-center">
                                  <Package className="w-12 h-12 text-purple-400" />
                                  <h3 className="text-white font-bold text-lg mb-2">Featured Product {item}</h3>
                                  <p className="text-zinc-300 text-sm">Premium 3D Printed Item</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Featured Shops */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                          <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                            Top Rated Shops
                          </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map((item) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: item * 0.1 }}
                              whileHover={{ y: -5, scale: 1.05 }}
                              className="group"
                            >
                              <div className="bg-gradient-to-br from-pink-600/20 via-orange-600/20 to-red-600/20 rounded-xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
                                <div className="w-16 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg mb-4 flex items-center justify-center">
                                  <Crown className="w-12 h-12 text-orange-400" />
                                  <h3 className="text-white font-bold text-lg mb-2">Featured Shop {item}</h3>
                                  <p className="text-zinc-300 text-sm">Verified Professional Service</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="absolute left-4 top-1/2 z-10">
                      <button className="bg-zinc-900/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute right-4 top-1/2 z-10">
                      <button className="bg-zinc-900/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="bg-zinc-950">
            <div className="container mx-auto px-4 pt-8 pb-16">
              {/* Featured Section */}
              <div className="mb-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-bold">Featured This Week</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Trending Designs & Top Rated Shops
                    </h2>
                  </motion.div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                      <span className="text-zinc-400 text-sm font-medium">Type:</span>
                      <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Items</option>
                        <option value="shops">Shops Only</option>
                        <option value="models">Products Only</option>
                      </select>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                      <span className="text-zinc-400 text-sm font-medium">Category:</span>
                      <select className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer">
                        <option value="all">All Categories</option>
                        <option value="3d-printing">3D Printing</option>
                        <option value="laser-cutting">Laser Cutting</option>
                        <option value="cnc-machining">CNC Machining</option>
                        <option value="3d-scanning">3D Scanning</option>
                        <option value="design-services">Design Services</option>
                        <option value="assembly">Assembly</option>
                      </select>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                      <span className="text-zinc-400 text-sm font-medium">Sort:</span>
                      <select className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer">
                        <option value="recent">Most Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                      <span className="text-zinc-400 text-sm font-medium">Price Range:</span>
                      <select className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer">
                        <option value="all">All Prices</option>
                        <option value="0-25">$0 - $25</option>
                        <option value="25-50">$25 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-200">$100 - $200</option>
                        <option value="200+">$200+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid - First Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {filteredItems.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Link href={item.link}>
                      <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-pink-500/50 transition-all duration-300 h-full ${item.type === "maker" ? "md:col-span-2" : ""}`}>
                        <div className={`bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden ${item.type === "maker" ? "md:aspect-[3/2]" : "aspect-[3/2]"}`}>
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
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-base mb-1 line-clamp-1">{item.title}</h3>
                              <p className="text-zinc-400 text-xs">{item.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                  {item.type}
                                </Badge>
                                {item.sellerName && (
                                  <span className="text-zinc-400 text-xs">by {item.sellerName}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-white text-xs font-medium">{item.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-zinc-400" />
                                <span className="text-zinc-400 text-xs">{item.views}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Products Grid - Remaining Items */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.slice(4).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Link href={item.link}>
                      <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-pink-500/50 transition-all duration-300 h-full ${item.type === "maker" ? "md:col-span-2" : ""}`}>
                        <div className={`bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden ${item.type === "maker" ? "md:aspect-[3/2]" : "aspect-[3/2]"}`}>
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
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-base mb-1 line-clamp-1">{item.title}</h3>
                              <p className="text-zinc-400 text-xs">{item.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                  {item.type}
                                </Badge>
                                {item.sellerName && (
                                  <span className="text-zinc-400 text-xs">by {item.sellerName}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-white text-xs font-medium">{item.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-zinc-400" />
                                <span className="text-zinc-400 text-xs">{item.views}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-400 transition-colors" />
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

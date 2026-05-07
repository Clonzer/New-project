import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Debug logging
  console.log("Listings data:", listings.data);
  console.log("Users data:", users.data);
  console.log("Listings loading:", listings.isLoading);
  console.log("Users loading:", users.isLoading);

  // Combine and mix listings and users from real database
  const marketplaceItems = [
    // Real listings
    ...(listings.data?.listings?.slice(0, 8).map(listing => ({
      ...listing,
      type: "product",
      title: listing.title,
      subtitle: `$${listing.price || listing.basePrice}`,
      image: listing.images?.[0] || listing.imageUrl || `https://picsum.photos/seed/${listing.id}/400/400.jpg`,
      rating: listing.rating || "4.8",
      views: listing.views?.toString() || "0",
      sellerName: listing.sellerName || "Professional Maker",
      link: `/listings/${listing.id}`
    })) || []),
    
    // Real users (sellers)
    ...(users.data?.users?.slice(0, 4).map((user, index) => ({
      ...user,
      type: "maker",
      title: user.displayName || user.name || `Maker ${index + 1}`,
      subtitle: user.role || "Professional Seller",
      rating: user.rating || "4.9",
      views: user.orders?.toString() || "0",
      image: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.id}`,
      link: `/shop/${user.id}`
    })) || [])
  ].sort(() => Math.random() - 0.5); // Shuffle all items

  console.log("Marketplace items count:", marketplaceItems.length);

  // Filter items based on type
  const filteredItems = marketplaceItems.filter(item => {
    if (filterType === "shops") return item.type === "maker";
    if (filterType === "models") return item.type === "product";
    return true; // Show all (both products and shops)
  });

  console.log("Filter type:", filterType);
  console.log("Filtered items count:", filteredItems.length);

  // Auto-rotate carousel every 4 seconds
  useEffect(() => {
    if (filteredItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex((prev) => (prev + 1) % filteredItems.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [filteredItems.length]);

  // Get current carousel item
  const currentCarouselItem = filteredItems[currentCarouselIndex];

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
          {/* Hero Carousel Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="container mx-auto px-4 py-4">
              {/* Hero Header */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    Discover Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">3D Creations</span>
                  </h1>
                  <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
                    Browse thousands of 3D printed products, laser cutting services, and custom fabrication from verified makers
                  </p>
                </motion.div>
              </div>

                {/* Hero Content with Text and Carousel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left Side - About Maker Marketplace */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-left"
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Your Gateway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Digital Manufacturing</span>
                    </h2>
                    <p className="text-zinc-300 text-lg mb-6">
                      Connect with skilled makers and access cutting-edge fabrication services. From 3D printing to laser cutting, bring your ideas to life with verified professionals.
                    </p>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Quality Products</h3>
                          <p className="text-zinc-400 text-sm">Professional-grade 3D prints and fabrications</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Verified Makers</h3>
                          <p className="text-zinc-400 text-sm">Trusted professionals with proven expertise</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Fast Delivery</h3>
                          <p className="text-zinc-400 text-sm">Quick turnaround times on all orders</p>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold">
                      Explore Marketplace
                    </Button>
                  </motion.div>

                  {/* Right Side - Carousel with Previews */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative"
                  >
                    <div className="relative">
                      {/* Previous Card Preview */}
                      {filteredItems.length > 1 && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 opacity-40 scale-75 transition-all duration-300">
                          {(() => {
                            const prevIndex = (currentCarouselIndex - 1 + filteredItems.length) % filteredItems.length;
                            const prevItem = filteredItems[prevIndex];
                            return prevItem ? (
                              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-3 border border-zinc-700 w-32">
                                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg overflow-hidden aspect-[4/3] mb-2">
                                  {prevItem.image ? (
                                    <img 
                                      src={prevItem.image} 
                                      alt={prevItem.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 text-zinc-600" />
                                    </div>
                                  )}
                                </div>
                                <h4 className="text-white text-xs font-medium truncate">{prevItem.title}</h4>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {/* Main Carousel */}
                      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 mx-8">
                        <div className="relative w-full h-80 flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/20 blur-2xl rounded-full w-64 h-64 opacity-40"></div>
                          
                          {currentCarouselItem && (
                            <motion.div
                              key={currentCarouselItem.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.5 }}
                              whileHover={{ scale: 1.05 }}
                              className="relative z-20 w-full max-w-md"
                            >
                              <Link href={currentCarouselItem.link}>
                                <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-2xl">
                                  <div className="bg-zinc-900 rounded-xl overflow-hidden">
                                    {currentCarouselItem.type === "maker" ? (
                                      // Seller Card Design
                                      <div className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-800 flex-shrink-0">
                                            {currentCarouselItem.image ? (
                                              <img 
                                                src={currentCarouselItem.image} 
                                                alt={currentCarouselItem.title}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-zinc-600" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <h3 className="text-white font-bold text-sm mb-1">{currentCarouselItem.title}</h3>
                                            <p className="text-zinc-300 text-xs">{currentCarouselItem.subtitle}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                              <span className="text-white text-xs font-medium">{currentCarouselItem.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Eye className="w-3 h-3 text-zinc-400" />
                                              <span className="text-zinc-400 text-xs">{currentCarouselItem.views}</span>
                                            </div>
                                          </div>
                                          <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                                            Seller
                                          </Badge>
                                        </div>
                                      </div>
                                    ) : (
                                      // Product Card Design
                                      <div>
                                        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden aspect-[16/9]">
                                          {currentCarouselItem.image ? (
                                            <img 
                                              src={currentCarouselItem.image} 
                                              alt={currentCarouselItem.title}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <Package className="w-8 h-8 text-zinc-600" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-4">
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                              <h3 className="text-white font-bold text-sm mb-1">{currentCarouselItem.title}</h3>
                                              <p className="text-zinc-300 text-xs mb-2">{currentCarouselItem.subtitle}</p>
                                              <div className="flex items-center gap-2">
                                                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                                                  Product
                                                </Badge>
                                                {currentCarouselItem.sellerName && (
                                                  <span className="text-zinc-400 text-xs">by {currentCarouselItem.sellerName}</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span className="text-white text-xs font-medium">{currentCarouselItem.rating}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Eye className="w-3 h-3 text-zinc-400" />
                                                <span className="text-zinc-400 text-xs">{currentCarouselItem.views}</span>
                                              </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-400 transition-colors" />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          )}
                        </div>

                        {/* Navigation Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex gap-2">
                            {filteredItems.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentCarouselIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  index === currentCarouselIndex ? 'bg-white w-8' : 'bg-zinc-700 hover:bg-zinc-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Manual Navigation Arrows */}
                        <button
                          onClick={() => setCurrentCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 hover:bg-zinc-700/80 text-white p-2 rounded-full transition-colors z-30"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button
                          onClick={() => setCurrentCarouselIndex((prev) => (prev + 1) % filteredItems.length)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 hover:bg-zinc-700/80 text-white p-2 rounded-full transition-colors z-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Next Card Preview */}
                      {filteredItems.length > 1 && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 opacity-40 scale-75 transition-all duration-300">
                          {(() => {
                            const nextIndex = (currentCarouselIndex + 1) % filteredItems.length;
                            const nextItem = filteredItems[nextIndex];
                            return nextItem ? (
                              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-3 border border-zinc-700 w-32">
                                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg overflow-hidden aspect-[4/3] mb-2">
                                  {nextItem.image ? (
                                    <img 
                                      src={nextItem.image} 
                                      alt={nextItem.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 text-zinc-600" />
                                    </div>
                                  )}
                                </div>
                                <h4 className="text-white text-xs font-medium truncate">{nextItem.title}</h4>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="bg-zinc-950 pt-0">
            <div className="container mx-auto px-4 pt-2 pb-16">
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

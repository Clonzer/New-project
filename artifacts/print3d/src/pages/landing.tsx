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
  const [filterType, setFilterType] = useState("all");

  // Debug logging
  console.log('Listings data:', listings.data);
  console.log('Users data:', users.data);
  console.log('Listings loading:', listings.isLoading);
  console.log('Users loading:', users.isLoading);

  // Combine and mix listings and users from real database
  const marketplaceItems = [
    // Real listings
    ...(listings.data?.listings?.slice(0, 6).map(listing => ({
      ...listing,
      type: 'product',
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
      type: 'maker',
      title: user.displayName || user.name || `User ${index + 1}`,
      subtitle: user.role || 'Maker',
      rating: user.rating || "4.8",
      orders: user.orders || "0",
      link: `/shop/${user.id}`
    })) || [])
  ].sort(() => Math.random() - 0.5).slice(0, 8); // Shuffle and limit to 8 items

  console.log('Marketplace items count:', marketplaceItems.length);

  // Filter items based on type
  const filteredItems = marketplaceItems.filter(item => {
    if (filterType === "shops") return item.type === "maker";
    if (filterType === "models") return item.type === "product";
    return true; // Show all (both products and shops)
  });

  console.log('Filter type:', filterType);
  console.log('Filtered items count:', filteredItems.length);

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
          {/* Featured Products Section */}
          <section className="bg-zinc-950">
            <div className="container mx-auto px-4 pt-8 pb-16">
              {/* Filter Selector */}
              <div className="flex justify-end mb-8">
                <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
                  <span className="text-zinc-400 text-sm">Show:</span>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="shops">Shops Only</option>
                    <option value="models">Models Only</option>
                  </select>
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
                      <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-pink-500/50 transition-all duration-300 h-full ${item.type === 'maker' ? 'md:col-span-2' : ''}`}>
                        <div className={`bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden ${item.type === 'maker' ? 'md:aspect-[2/1]' : 'aspect-[4/3]'}`}>
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

              {/* Categories */}
              <div className="mb-6">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { name: "3D Printing", color: "from-blue-500 to-cyan-500" },
                    { name: "Laser Cutting", color: "from-yellow-500 to-orange-500" },
                    { name: "CNC Machining", color: "from-purple-500 to-pink-500" },
                    { name: "3D Scanning", color: "from-green-500 to-emerald-500" },
                    { name: "Design Services", color: "from-pink-500 to-rose-500" },
                    { name: "Assembly", color: "from-indigo-500 to-blue-500" }
                  ].map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="group cursor-pointer"
                    >
                      <Link href={`/explore?category=${category.name.toLowerCase().replace(' ', '-')}`}>
                        <div className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg hover:border-pink-500/50 transition-all duration-300">
                          <h3 className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent font-semibold text-xs`}>
                            {category.name}
                          </h3>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
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
                      <div className={`bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-pink-500/50 transition-all duration-300 h-full ${item.type === 'maker' ? 'md:col-span-2' : ''}`}>
                        <div className={`bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden ${item.type === 'maker' ? 'md:aspect-[2/1]' : 'aspect-[4/3]'}`}>
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

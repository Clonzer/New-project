import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Search, 
  Star, 
  Users, 
  Eye,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Shield,
  Package,
  Crown,
  TrendingUp,
  Zap,
  Award,
  Sparkles,
  Filter,
  Grid3x3,
  DollarSign,
  ArrowUpDown,
  Home,
  Info,
  Mail,
  Phone,
  Settings,
  HelpCircle,
  FileText,
  MessageSquare,
  Wrench,
  Cpu,
  Palette,
  Scissors,
  Hammer,
  Brush,
  Camera,
  Music,
  Gamepad2,
  Car,
  Heart,
  Bone,
  Building,
  Factory,
  Truck,
  ShoppingBag,
  Gift,
  Tag
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      image: listing.images?.[0] || listing.imageUrl,
      rating: listing.rating || "4.8",
      views: listing.views?.toString() || "0",
      sellerName: listing.sellerName,
      tags: listing.tags || [],
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
      image: user.avatarUrl,
      banner: user.bannerUrl,
      tags: user.tags || [],
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
          {/* Hero Section */}
          <section className="bg-zinc-950">
            <div className="container mx-auto pl-12 pr-4 py-4">
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="bg-zinc-950 pt-0">
            <div className="container mx-auto pl-12 pr-4 pt-2 pb-16">
              {/* Featured Section */}
              <div className="mb-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold">Featured This Week</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Trending Designs & Top Rated Shops
                      </h2>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Collapsible Filter Sidebar */}
              <div className="mb-6 relative">
                {/* Vertical Icon Toggle Bar */}
                <motion.div 
                  className="fixed left-0 top-20 z-50 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-r-lg p-2"
                  onMouseEnter={() => setIsSidebarOpen(true)}
                  initial={{ width: "40px", height: "auto" }}
                  whileHover={{ width: "200px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex flex-col gap-2 overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto">
                    {/* Filter button - opens full sidebar */}
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-1 transition-colors"
                      onMouseEnter={() => setIsSidebarOpen(true)}
                    >
                      <Filter className="w-5 h-5 text-zinc-300 min-w-[20px]" />
                      <span className="text-white text-sm whitespace-nowrap">Filters</span>
                    </div>
                    
                    {/* Direct filter options */}
                    <div 
                      className={`flex items-center gap-2 cursor-pointer rounded p-1 transition-colors ${
                        filterType === "all" ? "bg-pink-600 text-white" : "hover:bg-zinc-700"
                      }`}
                      onClick={() => setFilterType("all")}
                    >
                      <Grid3x3 className="w-5 h-5 min-w-[20px]" />
                      <span className="text-sm whitespace-nowrap">All</span>
                    </div>
                    
                    <div 
                      className={`flex items-center gap-2 cursor-pointer rounded p-1 transition-colors ${
                        filterType === "shops" ? "bg-pink-600 text-white" : "hover:bg-zinc-700"
                      }`}
                      onClick={() => setFilterType("shops")}
                    >
                      <Users className="w-5 h-5 min-w-[20px]" />
                      <span className="text-sm whitespace-nowrap">Shops</span>
                    </div>
                    
                    <div 
                      className={`flex items-center gap-2 cursor-pointer rounded p-1 transition-colors ${
                        filterType === "models" ? "bg-pink-600 text-white" : "hover:bg-zinc-700"
                      }`}
                      onClick={() => setFilterType("models")}
                    >
                      <Package className="w-5 h-5 min-w-[20px]" />
                      <span className="text-sm whitespace-nowrap">Items</span>
                    </div>
                    
                    {/* Category shortcuts */}
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-1 transition-colors">
                      <Package className="w-5 h-5 text-zinc-300 min-w-[20px]" />
                      <span className="text-white text-sm whitespace-nowrap">3D Print</span>
                    </div>
                    
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-1 transition-colors">
                      <Zap className="w-5 h-5 text-zinc-300 min-w-[20px]" />
                      <span className="text-white text-sm whitespace-nowrap">Laser</span>
                    </div>
                    
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-1 transition-colors">
                      <Wrench className="w-5 h-5 text-zinc-300 min-w-[20px]" />
                      <span className="text-white text-sm whitespace-nowrap">CNC</span>
                    </div>
                    
                    {/* Navigation */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-1 transition-colors">
                      <Home className="w-5 h-5 text-zinc-300 min-w-[20px]" />
                      <span className="text-white text-sm whitespace-nowrap">Home</span>
                    </Link>
                  </div>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                  initial={false}
                  animate={{ x: isSidebarOpen ? 0 : -320 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onMouseLeave={() => setIsSidebarOpen(false)}
                  className="fixed left-0 top-0 h-full w-80 bg-zinc-900 border-r border-zinc-800 z-45 overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                      </h3>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Navigation Section */}
                    <div className="space-y-4">
                      {/* Navigation Links */}
                      <div className="grid grid-cols-3 gap-3">
                        <Link href="/" className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                          <Home className="w-5 h-5 text-zinc-300" />
                          <span className="text-xs text-zinc-400">Home</span>
                        </Link>
                        <Link href="/about" className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                          <Info className="w-5 h-5 text-zinc-300" />
                          <span className="text-xs text-zinc-400">About</span>
                        </Link>
                        <Link href="/contact" className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                          <Mail className="w-5 h-5 text-zinc-300" />
                          <span className="text-xs text-zinc-400">Contact</span>
                        </Link>
                        <Link href="/pricing" className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                          <DollarSign className="w-5 h-5 text-zinc-300" />
                          <span className="text-xs text-zinc-400">Pricing</span>
                        </Link>
                        <Link href="/help" className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                          <HelpCircle className="w-5 h-5 text-zinc-300" />
                          <span className="text-xs text-zinc-400">Help</span>
                        </Link>
                        <Link href="/blog" className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                          <FileText className="w-5 h-5 text-zinc-300" />
                          <span className="text-xs text-zinc-400">Blog</span>
                        </Link>
                      </div>

                      {/* Filter Icons Only */}
                      <div className="border-t border-zinc-800 pt-4">
                        <h4 className="text-white font-medium mb-3 text-sm">Quick Filters</h4>
                        <div className="grid grid-cols-4 gap-3">
                          <button
                            onClick={() => setFilterType("all")}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                              filterType === "all" ? "bg-pink-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            <Grid3x3 className="w-5 h-5" />
                            <span className="text-xs">All</span>
                          </button>
                          <button
                            onClick={() => setFilterType("shops")}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                              filterType === "shops" ? "bg-pink-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            <Users className="w-5 h-5" />
                            <span className="text-xs">Shops</span>
                          </button>
                          <button
                            onClick={() => setFilterType("models")}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                              filterType === "models" ? "bg-pink-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            <Package className="w-5 h-5" />
                            <span className="text-xs">Items</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="text-xs">More</span>
                          </button>
                        </div>
                      </div>

                      {/* Category Icons */}
                      <div className="border-t border-zinc-800 pt-4">
                        <h4 className="text-white font-medium mb-3 text-sm">Categories</h4>
                        <div className="grid grid-cols-4 gap-3">
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Package className="w-5 h-5" />
                            <span className="text-xs">3D Print</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Zap className="w-5 h-5" />
                            <span className="text-xs">Laser</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Wrench className="w-5 h-5" />
                            <span className="text-xs">CNC</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Eye className="w-5 h-5" />
                            <span className="text-xs">3D Scan</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Cpu className="w-5 h-5" />
                            <span className="text-xs">Electronics</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Palette className="w-5 h-5" />
                            <span className="text-xs">Design</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Hammer className="w-5 h-5" />
                            <span className="text-xs">Tools</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Brush className="w-5 h-5" />
                            <span className="text-xs">Art</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Camera className="w-5 h-5" />
                            <span className="text-xs">Photo</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Music className="w-5 h-5" />
                            <span className="text-xs">Audio</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Gamepad2 className="w-5 h-5" />
                            <span className="text-xs">Gaming</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Car className="w-5 h-5" />
                            <span className="text-xs">Auto</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Heart className="w-5 h-5" />
                            <span className="text-xs">Medical</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Bone className="w-5 h-5" />
                            <span className="text-xs">Dental</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Building className="w-5 h-5" />
                            <span className="text-xs">Arch</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            <Factory className="w-5 h-5" />
                            <span className="text-xs">Industrial</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Overlay */}
                {isSidebarOpen && (
                  <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}
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
                          {item.type === "maker" ? (
                            // Maker card with banner and avatar
                            <>
                              {item.banner ? (
                                <img 
                                  src={item.banner} 
                                  alt={`${item.title} banner`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent" />
                              {item.image && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                                    <img 
                                      src={item.image} 
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded">
                                    <span className="text-white text-xs font-medium">{item.title}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            // Product card
                            <>
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
                            </>
                          )}
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
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {item.tags.slice(0, 2).map((tag, tagIndex) => (
                                      <span key={tagIndex} className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
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
                          {item.type === "maker" ? (
                            // Maker card with banner and avatar
                            <>
                              {item.banner ? (
                                <img 
                                  src={item.banner} 
                                  alt={`${item.title} banner`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent" />
                              {item.image && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                                    <img 
                                      src={item.image} 
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded">
                                    <span className="text-white text-xs font-medium">{item.title}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            // Product card
                            <>
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
                            </>
                          )}
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
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {item.tags.slice(0, 2).map((tag, tagIndex) => (
                                      <span key={tagIndex} className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
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

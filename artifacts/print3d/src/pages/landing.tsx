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
  ShoppingCart,
  Clock,
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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);
  const [favoritesDropdownOpen, setFavoritesDropdownOpen] = useState(false);

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

  // Filter items based on type, category, and price
  const filteredItems = marketplaceItems.filter(item => {
    // Type filter
    if (filterType === "shops") return item.type === "maker";
    if (filterType === "models") return item.type === "product";
    
    // Category filter
    if (selectedCategory !== "all") {
      const itemCategory = item.category || item.tags?.[0]?.toLowerCase() || "";
      if (!itemCategory.includes(selectedCategory.replace("-", ""))) {
        return false;
      }
    }
    
    // Price filter
    if (minPrice || maxPrice) {
      const itemPrice = parseFloat(item.price || item.hourlyRate || "0");
      if (minPrice && itemPrice < parseFloat(minPrice)) return false;
      if (maxPrice && itemPrice > parseFloat(maxPrice)) return false;
    }
    
    return true; // "all" shows everything
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
            <div className="container mx-auto pl-20 pr-4 py-4">
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="bg-zinc-950 pt-0">
            <div className="container mx-auto pl-20 pr-4 pt-2 pb-16">
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

              {/* Enhanced Vertical Icon Bar */}
              <div className="mb-6 relative">
                <motion.div 
                  className="fixed left-0 top-0 z-[60] bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 p-2 group"
                  initial={{ width: "48px", height: "100vh" }}
                  whileHover={{ width: "220px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex flex-col gap-3 h-full pt-8 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 group-hover:scrollbar-thumb-zinc-500">
                    {/* Top spacing to ensure scrolling */}
                    <div className="h-8"></div>
                    
                    {/* Filter button */}
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                      onClick={() => console.log("Open advanced filters")}
                    >
                      <Filter className="w-5 h-5 text-zinc-300 flex-shrink-0" />
                      <span className="text-white text-sm whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Filters</span>
                    </div>
                    
                    {/* Price Range Dropdown */}
                    <div className="relative">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                        onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
                      >
                        <DollarSign className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Price Range</span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200 transform ${priceDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {priceDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg z-50 w-48">
                          <div className="text-white text-sm font-medium mb-2">Price Range</div>
                          <div className="space-y-1">
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                !minPrice && !maxPrice ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice(""); setMaxPrice(""); setPriceDropdownOpen(false);}}
                            >
                              <DollarSign className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">All Prices</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "0" && maxPrice === "25" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("0"); setMaxPrice("25"); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$0 - $25</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "25" && maxPrice === "50" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("25"); setMaxPrice("50"); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$25 - $50</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "50" && maxPrice === "100" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("50"); setMaxPrice("100"); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$50 - $100</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "100" && !maxPrice ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("100"); setMaxPrice(""); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$100+</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Main Filters */}
                    <div className="flex flex-col gap-2">
                      <div 
                        className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                          filterType === "all" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700"
                        }`}
                        onClick={() => setFilterType("all")}
                      >
                        <Grid3x3 className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">All</span>
                      </div>
                      
                      <div 
                        className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                          filterType === "shops" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700"
                        }`}
                        onClick={() => setFilterType("shops")}
                      >
                        <Users className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Shops</span>
                      </div>
                      
                      <div 
                        className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                          filterType === "models" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700"
                        }`}
                        onClick={() => setFilterType("models")}
                      >
                        <Package className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Items</span>
                      </div>
                    </div>

                    {/* Categories Dropdown */}
                    <div className="relative">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      >
                        <Grid3x3 className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Categories</span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200 transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {categoryDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg z-50 w-48">
                          <div className="text-white text-sm font-medium mb-2">Categories</div>
                          <div className="space-y-1">
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "3d-print" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("3d-print"); setCategoryDropdownOpen(false);}}
                            >
                              <Package className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">3D Printing</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "laser" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("laser"); setCategoryDropdownOpen(false);}}
                            >
                              <Zap className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Laser Cutting</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "cnc" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("cnc"); setCategoryDropdownOpen(false);}}
                            >
                              <Wrench className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">CNC Machining</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "electronics" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("electronics"); setCategoryDropdownOpen(false);}}
                            >
                              <Cpu className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Electronics</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "design" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("design"); setCategoryDropdownOpen(false);}}
                            >
                              <Palette className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Design Services</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "tools" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("tools"); setCategoryDropdownOpen(false);}}
                            >
                              <Hammer className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Tools & Equipment</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "art" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("art"); setCategoryDropdownOpen(false);}}
                            >
                              <Brush className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Art & Crafts</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "automotive" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("automotive"); setCategoryDropdownOpen(false);}}
                            >
                              <Car className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Automotive</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                selectedCategory === "medical" ? "bg-pink-600/20 text-pink-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setSelectedCategory("medical"); setCategoryDropdownOpen(false);}}
                            >
                              <Heart className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">Medical</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Store Functions */}
                    <div className="flex flex-col gap-2">
                      {/* My Orders Dropdown */}
                      <div className="relative">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                          onClick={() => setOrdersDropdownOpen(!ordersDropdownOpen)}
                        >
                          <Package className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">My Orders</span>
                          <ChevronDown className={`w-3 h-3 text-zinc-400 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200 transform ${ordersDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {ordersDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg z-50 w-48">
                            <div className="text-white text-sm font-medium mb-2">My Orders</div>
                            <div className="space-y-1">
                              <div 
                                className="flex items-center gap-2 cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 text-zinc-300"
                                onClick={() => {setOrdersDropdownOpen(false); console.log("View Active Orders");}}
                              >
                                <ShoppingBag className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">Active Orders</span>
                              </div>
                              
                              <div 
                                className="flex items-center gap-2 cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 text-zinc-300"
                                onClick={() => {setOrdersDropdownOpen(false); console.log("View Completed Orders");}}
                              >
                                <Package className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">Completed</span>
                              </div>
                              
                              <div 
                                className="flex items-center gap-2 cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 text-zinc-300"
                                onClick={() => {setOrdersDropdownOpen(false); console.log("View Order History");}}
                              >
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">History</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Favorites Dropdown */}
                      <div className="relative">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                          onClick={() => setFavoritesDropdownOpen(!favoritesDropdownOpen)}
                        >
                          <Heart className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Favorites</span>
                          <ChevronDown className={`w-3 h-3 text-zinc-400 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200 transform ${favoritesDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {favoritesDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg z-50 w-48">
                            <div className="text-white text-sm font-medium mb-2">Favorites</div>
                            <div className="space-y-1">
                              <div 
                                className="flex items-center gap-2 cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 text-zinc-300"
                                onClick={() => {setFavoritesDropdownOpen(false); console.log("View Favorite Items");}}
                              >
                                <Heart className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">Favorite Items</span>
                              </div>
                              
                              <div 
                                className="flex items-center gap-2 cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 text-zinc-300"
                                onClick={() => {setFavoritesDropdownOpen(false); console.log("View Favorite Shops");}}
                              >
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">Favorite Shops</span>
                              </div>
                              
                              <div 
                                className="flex items-center gap-2 cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 text-zinc-300"
                                onClick={() => {setFavoritesDropdownOpen(false); console.log("View Saved Searches");}}
                              >
                                <Search className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs">Saved Searches</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Bottom spacing to ensure scrolling */}
                    <div className="h-8"></div>
                  </div>
                </motion.div>
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

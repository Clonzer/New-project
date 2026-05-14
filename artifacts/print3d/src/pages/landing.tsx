import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ModernProductCard } from "@/components/shared/ModernProductCard";
import { ModernShopCard } from "@/components/shared/ModernShopCard";
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
  const { isAuthenticated } = useAuth();

  // Helper function to navigate with auth check
  const navigateWithAuth = (path: string) => {
    if (isAuthenticated) {
      window.location.href = path;
    } else {
      window.location.href = '/register';
    }
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Debug logging
  console.log("Listings data:", listings.data);
  console.log("Users data:", users.data);
  console.log("Listings loading:", listings.isLoading);
  console.log("Users loading:", users.isLoading);

  // Transform listings for ModernProductCard
  const transformedListings = Array.isArray(listings.data?.listings) 
    ? listings.data.listings.map(listing => ({
        ...listing,
        sellerRating: listing.rating,
        sellerReviewCount: listing.reviewCount,
        sellerAcceptingOrders: listing.accepting_orders
      }))
    : [];

  // Transform users for ModernShopCard  
  const transformedUsers = Array.isArray(users.data?.users)
    ? users.data.users.map(user => ({
        ...user,
        displayName: user.displayName || user.store_name,
        shopName: user.store_name,
        avatarUrl: user.avatar_url || user.avatarUrl,
        accepting_orders: user.accepting_orders
      }))
    : [];

  console.log("Marketplace items count:", transformedListings.length + transformedUsers.length);

  // Filter items based on type
  const showProducts = filterType === "all" || filterType === "models";
  const showShops = filterType === "all" || filterType === "shops";
  
  const filteredProducts = showProducts ? transformedListings : [];
  const filteredShops = showShops ? transformedUsers : [];

  console.log("Filter type:", filterType);
  console.log("Filtered items count:", filteredProducts.length + filteredShops.length);

  
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
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-full mb-6">
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
                  ref={sidebarRef}
                  className="fixed left-0 top-0 z-[60] bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 p-2 group"
                  initial={{ width: "48px", height: "100vh" }}
                  whileHover={{ width: "220px" }}
                  onHoverStart={() => setIsSidebarExpanded(true)}
                  onHoverEnd={() => {
                    setIsSidebarExpanded(false);
                    setPriceDropdownOpen(false);
                    setCategoryDropdownOpen(false);
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex flex-col gap-3 h-full pt-8 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 group-hover:scrollbar-thumb-zinc-500">
                    {/* Top spacing to ensure scrolling */}
                    <div className="h-8"></div>
                    
                    {/* Filter button */}
                    <div className="relative group/item">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                        onClick={() => console.log("Open advanced filters")}
                      >
                        <div className="relative">
                          <Filter className="w-5 h-5 text-zinc-300 flex-shrink-0" />
                          {isSidebarExpanded && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              Filters
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-zinc-800"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-white text-sm whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Filters</span>
                      </div>
                    </div>
                    
                    {/* Price Range Dropdown */}
                    <div className="relative">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 rounded p-2 transition-colors"
                        onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
                      >
                        <div className="relative">
                          <DollarSign className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          {isSidebarExpanded && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              Price Range
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-zinc-800"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Price Range</span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200 transform ${priceDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {priceDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg z-50 w-48">
                          <div className="text-white text-sm font-medium mb-2">Price Range</div>
                          <div className="space-y-1">
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                !minPrice && !maxPrice ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice(""); setMaxPrice(""); setPriceDropdownOpen(false);}}
                            >
                              <DollarSign className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">All Prices</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "0" && maxPrice === "25" ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("0"); setMaxPrice("25"); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$0 - $25</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "25" && maxPrice === "50" ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("25"); setMaxPrice("50"); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$25 - $50</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "50" && maxPrice === "100" ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("50"); setMaxPrice("100"); setPriceDropdownOpen(false);}}
                            >
                              <Tag className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$50 - $100</span>
                            </div>
                            
                            <div 
                              className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                                minPrice === "100" && !maxPrice ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700 text-zinc-300"
                              }`}
                              onClick={() => {setMinPrice("100"); setMaxPrice(""); setPriceDropdownOpen(false);}}
                            >
                              <DollarSign className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs">$100+</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Items */}
                    <div className="relative group/item">
                      <div 
                        className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                          filterType === "all" ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700"
                        }`}
                        onClick={() => setFilterType("all")}
                      >
                        <div className="relative">
                          <Grid3x3 className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          {isSidebarExpanded && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              All Items
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-zinc-800"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">All</span>
                      </div>
                    </div>
                       
                    <div className="relative group/item">
                      <div 
                        className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                          filterType === "shops" ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700"
                        }`}
                        onClick={() => setFilterType("shops")}
                      >
                        <div className="relative">
                          <Users className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          {isSidebarExpanded && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              Shops
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-zinc-800"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Shops</span>
                      </div>
                    </div>
                       
                    <div className="relative group/item">
                      <div 
                        className={`flex items-center gap-2 cursor-pointer rounded p-2 transition-colors ${
                          filterType === "models" ? "bg-orange-600/20 text-orange-300" : "hover:bg-zinc-700"
                        }`}
                        onClick={() => setFilterType("models")}
                      >
                        <div className="relative">
                          <Package className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          {isSidebarExpanded && (
                            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              Items
                              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-zinc-800"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-white text-xs whitespace-nowrap w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-200">Items</span>
                      </div>
                    </div>

                    {/* Bottom spacing to ensure scrolling */}
                    <div className="h-8"></div>
                  </div>
                </motion.div>
              </div>

              {/* Products and Shops Grid */}
              <div className="space-y-8">
                {/* Products Section */}
                {filteredProducts.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Featured Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((listing, index) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -10 }}
                        >
                          <ModernProductCard 
                            listing={listing}
                            sellerAcceptingOrders={listing.accepting_orders}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shops Section */}
                {filteredShops.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Top Shops</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredShops.map((shop, index) => (
                        <motion.div
                          key={shop.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -10 }}
                        >
                          <ModernShopCard seller={shop} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

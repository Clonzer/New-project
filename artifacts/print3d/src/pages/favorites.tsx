import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Search, Filter, Star, Store, Package, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Favorites() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "shops" | "products" | "services">("all");

  // Mock data for favorites
  const mockFavorites = [
    {
      id: 1,
      type: "shop",
      name: "Precision Prints",
      description: "High-quality 3D printing and prototyping services",
      rating: 4.8,
      reviews: 127,
      image: "/api/placeholder/200/200",
      owner: "John Smith",
      specialties: ["FDM", "SLA", "Resin"]
    },
    {
      id: 2,
      type: "product",
      name: "Mechanical Keyboard Case",
      description: "Custom ergonomic keyboard case with integrated wrist rest",
      rating: 4.9,
      reviews: 89,
      image: "/api/placeholder/200/200",
      shop: "Tech Accessories Co",
      price: "$45.99"
    },
    {
      id: 3,
      type: "service",
      name: "Rapid Prototyping",
      description: "Fast turnaround prototyping for startups and makers",
      rating: 4.7,
      reviews: 203,
      image: "/api/placeholder/200/200",
      provider: "QuickFab Studio",
      deliveryTime: "2-3 days"
    },
    {
      id: 4,
      type: "shop",
      name: "Artisan Creations",
      description: "Handcrafted 3D printed art and decorative items",
      rating: 4.9,
      reviews: 156,
      image: "/api/placeholder/200/200",
      owner: "Sarah Johnson",
      specialties: ["Art", "Decor", "Custom"]
    }
  ];

  const filteredFavorites = mockFavorites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "shop": return <Store className="w-4 h-4" />;
      case "product": return <Package className="w-4 h-4" />;
      case "service": return <Star className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "shop": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "product": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "service": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Favorites</h1>
              <p className="text-zinc-400">Your saved shops, products, and services</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              />
            </div>
            <div className="flex gap-2">
              {["all", "shops", "products", "services"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  onClick={() => setFilterType(type as any)}
                  className={`capitalize ${
                    filterType === type
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1 capitalize">{item.type}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-lg text-white group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </CardTitle>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-zinc-400 mb-4 line-clamp-2">
                    {item.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-white font-medium">{item.rating}</span>
                      <span className="text-sm text-zinc-500">({item.reviews})</span>
                    </div>
                    {item.price && (
                      <span className="text-lg font-bold text-orange-400">{item.price}</span>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    {item.owner && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <User className="w-4 h-4" />
                        <span>{item.owner}</span>
                      </div>
                    )}
                    {item.shop && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Store className="w-4 h-4" />
                        <span>{item.shop}</span>
                      </div>
                    )}
                    {item.provider && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Star className="w-4 h-4" />
                        <span>{item.provider}</span>
                      </div>
                    )}
                    {item.specialties && (
                      <div className="flex flex-wrap gap-1">
                        {item.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {item.deliveryTime && (
                      <div className="text-sm text-orange-400">
                        🚀 {item.deliveryTime}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                      View Details
                    </Button>
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFavorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
            <p className="text-zinc-400 mb-6">
              {searchQuery || filterType !== "all"
                ? "No favorites match your search criteria"
                : "Start adding shops, products, and services to your favorites"}
            </p>
            {!searchQuery && filterType === "all" && (
              <Button className="bg-orange-600 hover:bg-orange-700">
                Browse Marketplace
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Search, Filter, Star, Store, Package, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimpleSidebar } from "@/components/dashboard/SimpleSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getUserFavorites, removeFromFavorites, FavoriteWithDetails } from "@/lib/favorites-api";
import { Link } from "wouter";

export default function Favorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "shop" | "product" | "service">("all");
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Fetch favorites on component mount
  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user?.id]);

  const fetchFavorites = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await getUserFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId: string, itemType: 'shop' | 'product' | 'service') => {
    if (!user?.id) return;

    try {
      setIsRemoving(itemId);
      await removeFromFavorites(user.id, itemId, itemType);
      
      // Update local state
      setFavorites(prev => prev.filter(fav => 
        !(fav.item_id === itemId && fav.item_type === itemType)
      ));

      toast({
        title: "Removed from Favorites",
        description: "Item has been removed from your favorites."
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.item_type === filterType;
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
    <div className="min-h-screen bg-zinc-950">
      <SimpleSidebar />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-20 group-hover:lg:ml-72 p-4 md:p-8 transition-all duration-300 pt-20 lg:pt-4">
        <div className="max-w-7xl mx-auto">
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
              {["all", "shop", "product", "service"].map((type) => (
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && (
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
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                            {getTypeIcon(item.item_type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getTypeColor(item.item_type)}`}>
                            {getTypeIcon(item.item_type)}
                            <span className="ml-1 capitalize">{item.item_type}</span>
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
                      onClick={() => handleRemoveFavorite(item.item_id, item.item_type)}
                      disabled={isRemoving === item.item_id}
                    >
                      {isRemoving === item.item_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Heart className="w-4 h-4 fill-current" />
                      )}
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
                      <span className="text-sm text-white font-medium">{item.rating?.toFixed(1) || 'N/A'}</span>
                      <span className="text-sm text-zinc-500">({item.review_count || 0})</span>
                    </div>
                    {item.price && (
                      <span className="text-lg font-bold text-orange-400">${item.price}</span>
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
                    {item.delivery_time && (
                      <div className="text-sm text-orange-400">
                        🚀 {item.delivery_time}
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
        )}

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
              <Link href="/service-marketplace">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Browse Marketplace
                </Button>
              </Link>
            )}
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Store, Package, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toggleFavorite, removeFavorite, useGetFavorites } from "@/lib/workspace-stub";

export function Favorites() {
  const { user } = useAuth();
  const { data: favorites, isLoading, error, refetch } = useGetFavorites();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'items' | 'shops'>('items');

  // Filter favorites by type
  const itemFavorites = favorites?.filter(fav => fav.favorite_type === 'item') || [];
  const shopFavorites = favorites?.filter(fav => fav.favorite_type === 'shop') || [];

  const handleToggleFavorite = async (itemId: string, favoriteType: 'item' | 'shop') => {
    if (!user?.id) return;

    const result = await toggleFavorite(user.id, itemId, favoriteType);
    
    if (result.success) {
      toast({
        title: result.action === 'added' ? "Added to favorites" : "Removed from favorites",
        description: result.action === 'added' 
          ? "Item has been added to your favorites" 
          : "Item has been removed from your favorites",
      });
      refetch(); // Refresh the favorites list
    } else {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    const result = await removeFavorite(favoriteId);
    
    if (result.success) {
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites",
      });
      refetch(); // Refresh the favorites list
    } else {
      toast({
        title: "Error",
        description: "Failed to remove favorite. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-zinc-400">Loading favorites...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-8">
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">Failed to load favorites</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-8">
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
          <p className="text-zinc-400 mb-6">Start adding items and shops to your favorites to see them here</p>
          <Link href="/explore">
            <Button>Browse Items</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-primary text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Items ({itemFavorites.length})
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'shops'
              ? 'bg-primary text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Store className="w-4 h-4 inline mr-2" />
          Shops ({shopFavorites.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'items' ? (
        <div className="grid gap-4">
          {itemFavorites.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-400">No favorited items yet</p>
            </div>
          ) : (
            itemFavorites.map((favorite) => (
              <Card key={favorite.id} className="glass-panel border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Item #{favorite.item_id?.slice(0, 8)}</h4>
                          <p className="text-sm text-zinc-400">Added {new Date(favorite.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/listings/${favorite.item_id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {shopFavorites.length === 0 ? (
            <div className="text-center py-8">
              <Store className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-400">No favorited shops yet</p>
            </div>
          ) : (
            shopFavorites.map((favorite) => (
              <Card key={favorite.id} className="glass-panel border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Shop #{favorite.shop_id?.slice(0, 8)}</h4>
                          <p className="text-sm text-zinc-400">Added {new Date(favorite.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/shops/${favorite.shop_id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

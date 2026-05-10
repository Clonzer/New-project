import { supabase } from "@/lib/supabase";

export interface FavoriteItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'shop' | 'product' | 'service';
  created_at: string;
  updated_at: string;
}

export interface FavoriteWithDetails extends FavoriteItem {
  // Unified display properties
  name: string;
  description: string;
  image?: string;
  rating?: number;
  review_count?: number;
  
  // Shop-specific properties
  owner?: string;
  specialties?: string[];
  
  // Product/Service properties
  price?: number;
  shop?: string;
  provider?: string;
  delivery_time?: string;
}

// Get all favorites for a user with details
export async function getUserFavorites(userId: string): Promise<FavoriteWithDetails[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      shops:shop_id (
        id,
        shop_name,
        description,
        banner_url,
        owner:users!shops_owner_id_fkey (
          display_name
        ),
        reviews!shop_id (
          rating
        )
      ),
      listings:item_id (
        id,
        title,
        description,
        base_price,
        images,
        shop:shops!listings_shop_id_fkey (
          shop_name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }

  // Transform the data to a consistent format
  return data?.map(favorite => {
    if (favorite.item_type === 'shop' && favorite.shops) {
      const shop = favorite.shops;
      const avgRating = shop.reviews?.length > 0 
        ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length 
        : 0;

      return {
        ...favorite,
        name: shop.shop_name,
        description: shop.description,
        image: shop.banner_url,
        owner: shop.owner?.display_name,
        rating: avgRating,
        review_count: shop.reviews?.length || 0,
        specialties: [] // Would need to be populated from shop data
      };
    } else if (favorite.item_type === 'product' && favorite.listings) {
      const listing = favorite.listings;
      return {
        ...favorite,
        name: listing.title,
        description: listing.description,
        image: listing.images?.[0],
        price: listing.base_price,
        shop: listing.shop?.shop_name
      };
    } else if (favorite.item_type === 'service' && favorite.listings) {
      const listing = favorite.listings;
      return {
        ...favorite,
        name: listing.title,
        description: listing.description,
        image: listing.images?.[0],
        price: listing.base_price,
        provider: listing.shop?.shop_name,
        delivery_time: "2-3 days" // Would need to be populated from service data
      };
    }
    return favorite;
  }) || [];
}

// Add an item to favorites
export async function addToFavorites(userId: string, itemId: string, itemType: 'shop' | 'product' | 'service'): Promise<FavoriteItem> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }

  return data;
}

// Remove an item from favorites
export async function removeFromFavorites(userId: string, itemId: string, itemType: 'shop' | 'product' | 'service'): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType);

  if (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

// Check if an item is in user's favorites
export async function isFavorite(userId: string, itemId: string, itemType: 'shop' | 'product' | 'service'): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error checking favorite status:', error);
    throw error;
  }

  return !!data;
}

// Toggle favorite status
export async function toggleFavorite(userId: string, itemId: string, itemType: 'shop' | 'product' | 'service'): Promise<{ isFavorite: boolean; action: 'added' | 'removed' }> {
  const currentlyFavorite = await isFavorite(userId, itemId, itemType);
  
  if (currentlyFavorite) {
    await removeFromFavorites(userId, itemId, itemType);
    return { isFavorite: false, action: 'removed' };
  } else {
    await addToFavorites(userId, itemId, itemType);
    return { isFavorite: true, action: 'added' };
  }
}

// Get favorites count by type
export async function getFavoritesCount(userId: string): Promise<{ total: number; shops: number; products: number; services: number }> {
  const { data, error } = await supabase
    .from('favorites')
    .select('item_type')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching favorites count:', error);
    throw error;
  }

  const counts = {
    total: data?.length || 0,
    shops: data?.filter(f => f.item_type === 'shop').length || 0,
    products: data?.filter(f => f.item_type === 'product').length || 0,
    services: data?.filter(f => f.item_type === 'service').length || 0
  };

  return counts;
}

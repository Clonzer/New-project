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
  // First get the basic favorites data
  const { data: favorites, error: favoritesError } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (favoritesError) {
    console.error('Error fetching favorites:', favoritesError);
    throw favoritesError;
  }

  if (!favorites || favorites.length === 0) {
    return [];
  }

  // Transform the data to a consistent format by fetching details separately
  const favoritesWithDetails: FavoriteWithDetails[] = [];

  for (const favorite of favorites) {
    try {
      if (favorite.item_type === 'shop') {
        // Fetch shop data from users table
        const { data: shopData, error: shopError } = await supabase
          .from('users')
          .select(`
            id,
            display_name,
            shop_name,
            description,
            banner_url,
            avatar_url
          `)
          .eq('id', favorite.item_id)
          .single();

        if (shopError) {
          console.error('Error fetching shop details:', shopError);
          continue;
        }

        // Fetch reviews for this shop
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('shop_id', favorite.item_id);

        const avgRating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        favoritesWithDetails.push({
          ...favorite,
          name: shopData.shop_name || shopData.display_name,
          description: shopData.description || '',
          image: shopData.banner_url || shopData.avatar_url,
          owner: shopData.display_name,
          rating: avgRating,
          review_count: reviews?.length || 0,
          specialties: [] // Would need to be populated from shop data
        });

      } else if (favorite.item_type === 'product' || favorite.item_type === 'service') {
        // Fetch listing data
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select(`
            id,
            title,
            description,
            price,
            images,
            seller_id,
            listing_type
          `)
          .eq('id', favorite.item_id)
          .single();

        if (listingError) {
          console.error('Error fetching listing details:', listingError);
          continue;
        }

        // Fetch seller info
        const { data: sellerData, error: sellerError } = await supabase
          .from('users')
          .select('shop_name, display_name')
          .eq('id', listingData.seller_id)
          .single();

        if (sellerError) {
          console.error('Error fetching seller details:', sellerError);
          continue;
        }

        const baseItem = {
          ...favorite,
          name: listingData.title,
          description: listingData.description,
          image: listingData.images?.[0],
          price: listingData.price,
        };

        if (favorite.item_type === 'product') {
          favoritesWithDetails.push({
            ...baseItem,
            shop: sellerData.shop_name || sellerData.display_name
          });
        } else {
          favoritesWithDetails.push({
            ...baseItem,
            provider: sellerData.shop_name || sellerData.display_name,
            delivery_time: "2-3 days" // Would need to be populated from service data
          });
        }
      }
    } catch (error) {
      console.error('Error processing favorite item:', favorite, error);
      continue;
    }
  }

  return favoritesWithDetails;
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
    .maybeSingle();

  if (error) {
    // 406 happens when .single() is used with 0 rows; maybeSingle avoids that.
    if (error.code === 'PGRST116') {
      return false;
    }
    console.error('Error checking favorite status:', error);
    return false;
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

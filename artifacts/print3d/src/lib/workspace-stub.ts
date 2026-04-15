// Stub for @workspace/api-client-react compatibility
// This allows the app to run while we migrate to Supabase

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

// Error class for API errors
export class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export type User = {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  name?: string;
  avatar?: string;
  isVerified: boolean;
  stripeConnectAccountId?: string;
  stripeConnectEnabled?: boolean;
  isSponsored?: boolean;
  planTier?: 'none' | 'basic' | 'pro' | 'enterprise';
};

// Storage helpers for auth tokens
export function setStoredAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem('access_token');
}

export async function customFetch<T>(url: string, options?: RequestInit & { skipAuth?: boolean }): Promise<T> {
  // For now, return mock data or use Supabase
  // This is a temporary stub to get the app running
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Export hooks that the old API provided
export function useListings() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

// Base mutation return type with all required properties
type MutationReturn<T = any> = {
  mutate: (vars?: T) => Promise<void>;
  mutateAsync: (vars?: T) => Promise<any>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
};

export function useCreateListing(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = vars;
      
      // Check if seller exists, create if not
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', data.sellerId)
        .single();
      
      let sellerId = seller?.id;
      
      if (!seller || sellerError) {
        // Create seller record
        const { data: newSeller, error: createError } = await supabase
          .from('sellers')
          .insert({
            user_id: data.sellerId,
            store_name: 'My Shop',
            rating: 0,
            total_orders: 0,
            is_verified: false,
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating seller:', createError);
          throw createError;
        }
        
        sellerId = newSeller.id;
      }
      
      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          title: data.title,
          description: data.description || null,
          price: data.basePrice,
          category: data.category,
          stock: data.stock || null,
          images: data.images || [],
          listing_type: data.listingType || 'product',
          service_category: data.serviceCategory || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Listing insert error:', insertError);
        throw insertError;
      }

      return { success: true };
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: async (vars?: any) => { await mutateAsync(vars).catch(() => {}); },
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useUpdateListing(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useDeleteListing(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreatePrinter(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = vars;
      console.log('Creating printer with data:', data);

      const { error: insertError } = await supabase
        .from('printers')
        .insert({
          user_id: data.userId,
          equipment_category: data.equipmentCategory,
          tool_or_service_type: data.toolOrServiceType,
          name: data.name,
          brand: data.brand,
          model: data.model,
          technology: data.technology,
          materials: data.materials,
          build_volume: data.buildVolume,
          price_per_hour: data.pricePerHour,
          price_per_gram: data.pricePerGram,
          description: data.description,
        });

      if (insertError) {
        console.error('Printer insert error:', insertError);
        throw insertError;
      }

      console.log('Printer created successfully');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: async (vars?: any) => { await mutateAsync(vars).catch(() => {}); },
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useDeletePrinter(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { printerId } = vars;
      console.log('Deleting printer:', printerId);

      const { error: deleteError } = await supabase
        .from('printers')
        .delete()
        .eq('id', printerId);

      if (deleteError) {
        console.error('Printer delete error:', deleteError);
        throw deleteError;
      }

      console.log('Printer deleted successfully');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      console.error('Printer deletion failed:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useUpdateUser(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { userId, data } = vars;
      console.log('Updating profile for userId:', userId);
      console.log('Update data:', data);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          bio: data.bio,
          location: data.location,
          avatar_url: data.avatarUrl,
          shop_name: data.shopName,
          shop_mode: data.shopMode,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      return { success: true };
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: async (vars?: any) => { await mutateAsync(vars).catch(() => {}); },
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useListUsers() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListListings(options?: { limit?: number; offset?: number; sellerId?: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (options?.sellerId) {
          // Filter by seller's user_id by joining with sellers table
          const { data: seller } = await supabase
            .from('sellers')
            .select('id')
            .eq('user_id', options.sellerId)
            .single();
          
          if (seller) {
            query = query.eq('seller_id', seller.id);
          }
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const result = await query;
        if (result.error) throw result.error;
        setData({ listings: result.data || [] });
      } catch (err) {
        setError(err as Error);
        setData({ listings: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, [options?.limit, options?.offset, options?.sellerId]);

  return { data, isLoading, error };
}

export function useListSellers(options?: { limit?: number; offset?: number }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await supabase
          .from('users')
          .select('*')
          .in('role', ['seller', 'both'])
          .order('created_at', { ascending: false });
        if (result.error) throw result.error;
        setData({ sellers: result.data || [] });
      } catch (err) {
        setError(err as Error);
        setData({ sellers: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellers();
  }, [options?.limit, options?.offset]);

  return { data, isLoading, error };
}

export function useGetUser(userId?: string | number) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (result.error) throw result.error;
        setData(result.data);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  return { data, isLoading, error };
}

export function useGetListing() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetCart() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetOrders() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListOrders() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetMessages() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetNotifications() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetPrinters() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListReviews(options?: { revieweeId?: string | number }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (options?.revieweeId) {
          query = query.eq('reviewee_id', options.revieweeId);
        }

        const result = await query;
        if (result.error) throw result.error;
        setData({ reviews: result.data || [] });
      } catch (err) {
        setError(err as Error);
        setData({ reviews: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [options?.revieweeId]);

  return { data, isLoading, error };
}

export function useListPrinters(options?: { userId?: string | number }) {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrinters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        setData([]);
        return;
      }

      const { data: printers, error: fetchError } = await supabase
        .from('printers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setData(printers || []);
    } catch (e) {
      const err = e as Error;
      setError(err);
      console.error('Error fetching printers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  return { data, isLoading, error, refetch: fetchPrinters };
}

export function useGetPortfolio() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetReviews() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetFavorites() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetShop() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

// Mutations
export function useAddToCart(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useRemoveFromCart(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreateOrder(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useSendMessage(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreateReview(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreateEquipmentGroup(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = vars;
      console.log('Creating equipment group with data:', data);

      const { data: { user } } = await supabase.auth.getUser();
      console.log('User ID:', user?.id);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error: insertError } = await supabase
        .from('equipment_groups')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          category: data.category,
        });

      if (insertError) {
        console.error('Equipment group insert error:', insertError);
        throw insertError;
      }

      console.log('Equipment group created successfully');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      console.error('Equipment group creation failed:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useDeleteEquipmentGroup(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { groupId } = vars;
      console.log('Deleting equipment group:', groupId);

      const { error: deleteError } = await supabase
        .from('equipment_groups')
        .delete()
        .eq('id', groupId);

      if (deleteError) {
        console.error('Equipment group delete error:', deleteError);
        throw deleteError;
      }

      console.log('Equipment group deleted successfully');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      console.error('Equipment group deletion failed:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useListEquipmentGroups() {
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: groups, error: fetchError } = await supabase
        .from('equipment_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return groups || [];
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching equipment groups:', err);
      return [];
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['equipment-groups'],
    queryFn: fetchGroups,
  });

  return { data, isLoading, error, refetch };
}

export function useListShippingProfiles() {
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = async () => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, domestic_shipping_cost, europe_shipping_cost, north_america_shipping_cost, international_shipping_cost, free_shipping_threshold, selling_regions')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!profiles) return [];

      // Convert user profile data to shipping profile format
      return [{
        id: profiles.id,
        name: 'Default Shipping Profile',
        domesticCost: profiles.domestic_shipping_cost || 5.99,
        europeCost: profiles.europe_shipping_cost || 12.99,
        northAmericaCost: profiles.north_america_shipping_cost || 8.99,
        internationalCost: profiles.international_shipping_cost || 19.99,
        freeShippingThreshold: profiles.free_shipping_threshold || 50,
        shippingRegions: profiles.selling_regions || ['US'],
      }];
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching shipping profiles:', err);
      return [];
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['shipping-profiles'],
    queryFn: fetchProfiles,
  });

  return { data, isLoading, error, refetch };
}

export function useUpdateEquipmentGroup(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { groupId, data } = vars;
      console.log('Updating equipment group:', groupId, data);

      const { error: updateError } = await supabase
        .from('equipment_groups')
        .update({
          name: data.name,
          description: data.description,
          category: data.category,
        })
        .eq('id', groupId);

      if (updateError) {
        console.error('Equipment group update error:', updateError);
        throw updateError;
      }

      console.log('Equipment group updated successfully');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      console.error('Equipment group update failed:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useUpdatePrinter(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { printerId, data } = vars;
      console.log('Updating printer:', printerId, data);

      const { error: updateError } = await supabase
        .from('printers')
        .update({
          name: data.name,
          brand: data.brand,
          model: data.model,
          technology: data.technology,
          materials: data.materials,
          build_volume: data.buildVolume,
          price_per_hour: data.pricePerHour,
          price_per_gram: data.pricePerGram,
          description: data.description,
          is_active: data.isActive,
          equipment_group_id: data.equipmentGroupId,
        })
        .eq('id', printerId);

      if (updateError) {
        console.error('Printer update error:', updateError);
        throw updateError;
      }

      console.log('Printer updated successfully');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      console.error('Printer update failed:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useGetPrinter() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListSponsoredShops() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useCreateSponsoredShop(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateListingStatus(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdatePrinterStatus(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateOrderStatus(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCancelOrder(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useMarkOrderShipped(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useMarkOrderDelivered(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useListEquipment() {
  const [error, setError] = useState<Error | null>(null);

  const fetchEquipment = async () => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: equipment, error: fetchError } = await supabase
        .from('printers')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      return equipment || [];
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching equipment:', err);
      return [];
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
  });

  return { data, isLoading, error, refetch };
}

export function useGetEquipment() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useCreateEquipment(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateEquipment(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useDeleteEquipment(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export type CreateUserRequestRole = 'buyer' | 'seller' | 'both';

// Query key helpers for React Query
export function getGetListingQueryKey(listingId: string | number) {
  return ['listings', listingId];
}

export function getGetUserQueryKey(userId: string | number) {
  return ['users', userId];
}

export function getListListingsQueryKey() {
  return ['listings'];
}

export function getListUsersQueryKey() {
  return ['users'];
}

export function getListOrdersQueryKey() {
  return ['orders'];
}

export function getListPrintersQueryKey() {
  return ['printers'];
}

export function getGetPrinterQueryKey(printerId: string | number) {
  return ['printers', printerId];
}

export function getGetOrdersQueryKey() {
  return ['orders'];
}

export function getListPortfolioQueryKey(userId: string | number) {
  return ['portfolio', userId];
}

export function getListReviewsQueryKey(userId: string | number) {
  return ['reviews', userId];
}

export function getGetCartQueryKey() {
  return ['cart'];
}

export function getGetMessagesQueryKey() {
  return ['messages'];
}

export function getGetNotificationsQueryKey() {
  return ['notifications'];
}

export function getListContestsQueryKey() {
  return ['contests'];
}

export function getGetContestQueryKey(contestId: string) {
  return ['contests', contestId];
}

export function getListContestEntriesQueryKey(contestId: string) {
  return ['contests', contestId, 'entries'];
}

// Contest hooks
export function useListContests() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContests() {
      try {
        setIsLoading(true);
        const { contests } = await import('./contest-api').then(m => m.listContests());
        setData(contests);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContests();
  }, []);

  return { data, isLoading, error };
}

export function useGetContest(contestId: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContest() {
      try {
        setIsLoading(true);
        const { contest } = await import('./contest-api').then(m => m.getContest(contestId));
        setData(contest);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    }
    if (contestId) fetchContest();
  }, [contestId]);

  return { data, isLoading, error };
}

export function useListContestEntries(contestId: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setIsLoading(true);
        const { entries } = await import('./contest-api').then(m => m.listContestEntries(contestId));
        setData(entries);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    }
    if (contestId) fetchEntries();
  }, [contestId]);

  return { data, isLoading, error };
}

export function useCreateContestEntry(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await import('./contest-api').then(m => m.createContestEntry(vars));
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useVoteForEntry(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await import('./contest-api').then(m => m.voteForEntry(vars.entryId, vars.userId));
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}

export function useCreateContest(): MutationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (vars: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await import('./contest-api').then(m => m.createContest(vars));
    } catch (e) {
      const err = e as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate: (vars: any) => mutateAsync(vars),
    mutateAsync,
    isLoading,
    isPending: isLoading,
    error,
  };
}


import { supabase } from './supabase';

export async function listSellers(options: { limit?: number; offset?: number } = {}) {
  const { limit = 10, offset = 0 } = options;
  
  const { data, error, count } = await supabase
    .from('sellers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  
  return {
    sellers: data || [],
    total: count || 0,
  };
}

export async function getSeller(id: string) {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return { seller: data };
}

export async function createSeller(data: {
  user_id: string;
  store_name: string;
  specialty?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  hero_image_url?: string;
}) {
  const { data: seller, error } = await supabase
    .from('sellers')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  
  return { seller };
}

export async function listListings(options: { 
  limit?: number; 
  offset?: number; 
  seller_id?: string 
} = {}) {
  const { limit = 10, offset = 0, seller_id } = options;
  
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  
  if (seller_id) {
    query = query.eq('seller_id', seller_id);
  }
  
  const { data, error, count } = await query.range(offset, offset + limit - 1);
  
  if (error) throw error;
  
  return {
    listings: data || [],
    total: count || 0,
  };
}

export async function getListing(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return { listing: data };
}

export async function createListing(data: {
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  stock?: number;
}) {
  const { data: listing, error } = await supabase
    .from('listings')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  
  return { listing };
}

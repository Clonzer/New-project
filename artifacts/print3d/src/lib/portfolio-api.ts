import { supabase } from "./supabase";

export type PortfolioItem = {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  imageUrl: string;
  tags: string[];
  createdAt: string;
};

export async function listPortfolio(userId: number): Promise<{ portfolio: PortfolioItem[] }> {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return { portfolio: data || [] };
}

export async function createPortfolioItem(
  userId: number,
  input: { title: string; description?: string | null; imageUrl: string; tags?: string[] },
): Promise<{ item: PortfolioItem }> {
  const { data, error } = await supabase
    .from('portfolio')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      image_url: input.imageUrl,
      tags: input.tags || [],
    })
    .select()
    .single();
  
  if (error) throw error;
  return { item: data };
}

export async function deletePortfolioItem(userId: number, portfolioId: number): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('portfolio')
    .delete()
    .eq('id', portfolioId)
    .eq('user_id', userId);
  
  if (error) throw error;
  return { success: true };
}

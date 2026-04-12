import { supabase } from './supabase';

export type Contest = {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  category: string;
  prize_pool: number;
  entry_fee: number;
  max_entries: number;
  voting_starts_at: string;
  voting_ends_at: string;
  winner_announced_at: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ContestEntry = {
  id: string;
  contest_id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string;
  project_url: string | null;
  votes_count: number;
  created_at: string;
  updated_at: string;
};

export type ContestVote = {
  id: string;
  contest_entry_id: string;
  user_id: string;
  created_at: string;
};

export type ContestWinner = {
  id: string;
  contest_id: string;
  contest_entry_id: string;
  user_id: string;
  rank: number;
  prize_amount: number | null;
  announced_at: string;
};

export async function listContests() {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    contests: data || [],
    total: data?.length || 0,
  };
}

export async function getContest(id: string) {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return { contest: data };
}

export async function listContestEntries(contestId: string) {
  const { data, error } = await supabase
    .from('contest_entries')
    .select('*')
    .eq('contest_id', contestId)
    .order('votes_count', { ascending: false });

  if (error) throw error;

  return {
    entries: data || [],
    total: data?.length || 0,
  };
}

export async function getContestEntry(entryId: string) {
  const { data, error } = await supabase
    .from('contest_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (error) throw error;

  return { entry: data };
}

export async function createContestEntry(entry: {
  contest_id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url: string;
  project_url?: string;
}) {
  const { data, error } = await supabase
    .from('contest_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;

  return { entry: data };
}

export async function updateContestEntry(entryId: string, updates: {
  title?: string;
  description?: string;
  image_url?: string;
  project_url?: string;
}) {
  const { data, error } = await supabase
    .from('contest_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;

  return { entry: data };
}

export async function deleteContestEntry(entryId: string) {
  const { error } = await supabase
    .from('contest_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;

  return { success: true };
}

export async function voteForEntry(entryId: string, userId: string) {
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('contest_votes')
    .select('*')
    .eq('contest_entry_id', entryId)
    .eq('user_id', userId)
    .single();

  if (existingVote) {
    throw new Error('You have already voted for this entry');
  }

  // Add vote
  const { error: voteError } = await supabase
    .from('contest_votes')
    .insert({
      contest_entry_id: entryId,
      user_id: userId,
    });

  if (voteError) throw voteError;

  // Increment vote count
  const { data, error } = await supabase.rpc('increment_votes_count', {
    entry_id: entryId,
  });

  if (error) throw error;

  return { success: true };
}

export async function removeVote(entryId: string, userId: string) {
  const { error } = await supabase
    .from('contest_votes')
    .delete()
    .eq('contest_entry_id', entryId)
    .eq('user_id', userId);

  if (error) throw error;

  // Decrement vote count
  const { data, error } = await supabase.rpc('decrement_votes_count', {
    entry_id: entryId,
  });

  if (error) throw error;

  return { success: true };
}

export async function getUserVoteForEntry(entryId: string, userId: string) {
  const { data, error } = await supabase
    .from('contest_votes')
    .select('*')
    .eq('contest_entry_id', entryId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return { vote: data || null };
}

export async function createContest(contest: {
  title: string;
  description?: string;
  theme: string;
  category: string;
  prize_pool: number;
  entry_fee?: number;
  max_entries?: number;
  voting_starts_at: string;
  voting_ends_at: string;
  is_featured?: boolean;
}) {
  const { data, error } = await supabase
    .from('contests')
    .insert(contest)
    .select()
    .single();

  if (error) throw error;

  return { contest: data };
}

export async function updateContest(contestId: string, updates: {
  title?: string;
  description?: string;
  theme?: string;
  category?: string;
  prize_pool?: number;
  entry_fee?: number;
  max_entries?: number;
  voting_starts_at?: string;
  voting_ends_at?: string;
  is_active?: boolean;
  is_featured?: boolean;
}) {
  const { data, error } = await supabase
    .from('contests')
    .update(updates)
    .eq('id', contestId)
    .select()
    .single();

  if (error) throw error;

  return { contest: data };
}

export async function deleteContest(contestId: string) {
  const { error } = await supabase
    .from('contests')
    .delete()
    .eq('id', contestId);

  if (error) throw error;

  return { success: true };
}

export async function announceContestWinner(contestId: string, entryId: string, rank: number, prizeAmount?: number) {
  const { data: entry } = await supabase
    .from('contest_entries')
    .select('user_id')
    .eq('id', entryId)
    .single();

  if (!entry) throw new Error('Entry not found');

  const { data, error } = await supabase
    .from('contest_winners')
    .insert({
      contest_id: contestId,
      contest_entry_id: entryId,
      user_id: entry.user_id,
      rank,
      prize_amount: prizeAmount || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Update contest with winner announcement time
  await supabase
    .from('contests')
    .update({ winner_announced_at: new Date().toISOString() })
    .eq('id', contestId);

  return { winner: data };
}

export async function getContestWinners(contestId: string) {
  const { data, error } = await supabase
    .from('contest_winners')
    .select('*, contest_entries(*), profiles(*)')
    .eq('contest_id', contestId)
    .order('rank', { ascending: true });

  if (error) throw error;

  return { winners: data || [] };
}

export async function getActiveContests() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('is_active', true)
    .gte('voting_starts_at', now)
    .order('voting_starts_at', { ascending: true });

  if (error) throw error;

  return { contests: data || [] };
}

export async function getVotingContests() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('is_active', true)
    .lte('voting_starts_at', now)
    .gte('voting_ends_at', now)
    .order('voting_ends_at', { ascending: true });

  if (error) throw error;

  return { contests: data || [] };
}

export async function getEndedContests() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .lt('voting_ends_at', now)
    .order('voting_ends_at', { ascending: false });

  if (error) throw error;

  return { contests: data || [] };
}


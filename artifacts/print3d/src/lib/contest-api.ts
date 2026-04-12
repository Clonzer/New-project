import { supabase } from './supabase';

export type Contest = {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  category: string;
  maxParticipants: number;
  currentParticipants: number;
  rules: string[];
  imageUrl?: string;
};

export type ContestEntry = {
  id: string;
  contestId: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  votes: number;
  createdAt: string;
};

export async function listContests() {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .order('start_date', { ascending: true });

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
    .order('votes', { ascending: false });

  if (error) throw error;

  return {
    entries: data || [],
    total: data?.length || 0,
  };
}

export async function createContestEntry(entry: {
  contestId: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
}) {
  const { data, error } = await supabase
    .from('contest_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;

  return { entry: data };
}

export async function voteForEntry(entryId: string) {
  // First get current votes
  const { data: current } = await supabase
    .from('contest_entries')
    .select('votes')
    .eq('id', entryId)
    .single();

  if (!current) throw new Error('Entry not found');

  // Then increment
  const { data, error } = await supabase
    .from('contest_entries')
    .update({ votes: (current.votes || 0) + 1 })
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;

  return { entry: data };
}

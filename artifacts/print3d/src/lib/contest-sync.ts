import { supabase } from './supabase';
import { announceContestWinner, getEndedContests, getVotingContests } from './contest-api';

/**
 * Auto-contest configuration
 */
const AUTO_CONTEST_CONFIG = {
  // Contest themes that rotate automatically
  themes: [
    { name: "Sci-Fi Models", category: "printing_3d", prize_pool: 500, entry_fee: 0 },
    { name: "Functional Parts", category: "printing_3d", prize_pool: 750, entry_fee: 0 },
    { name: "Artistic Sculptures", category: "printing_3d", prize_pool: 1000, entry_fee: 5 },
    { name: "Miniatures & Figures", category: "printing_3d", prize_pool: 400, entry_fee: 0 },
    { name: "Cosplay Props", category: "printing_3d", prize_pool: 600, entry_fee: 0 },
    { name: "Custom Tools", category: "woodworking", prize_pool: 800, entry_fee: 0 },
    { name: "Metalwork Masterpieces", category: "metalwork", prize_pool: 1200, entry_fee: 10 },
    { name: "Design Innovation", category: "design", prize_pool: 1500, entry_fee: 0 },
  ],
  
  // Contest duration in days
  entryDuration: 7, // days to submit entries
  votingDuration: 7, // days to vote
  
  // Max entries per contest
  maxEntries: 100,
};

/**
 * Create an auto-generated contest
 */
export async function createAutoContest(themeIndex: number = 0) {
  const theme = AUTO_CONTEST_CONFIG.themes[themeIndex % AUTO_CONTEST_CONFIG.themes.length];
  const now = new Date();
  const votingStarts = new Date(now.getTime() + AUTO_CONTEST_CONFIG.entryDuration * 24 * 60 * 60 * 1000);
  const votingEnds = new Date(votingStarts.getTime() + AUTO_CONTEST_CONFIG.votingDuration * 24 * 60 * 60 * 1000);

  try {
    const { data, error } = await supabase
      .from('contests')
      .insert({
        title: `${theme.name} Contest`,
        description: `Showcase your best ${theme.name.toLowerCase()}! Win prizes and get featured on our platform.`,
        theme: theme.name,
        category: theme.category,
        prize_pool: theme.prize_pool,
        entry_fee: theme.entry_fee,
        max_entries: AUTO_CONTEST_CONFIG.maxEntries,
        voting_starts_at: votingStarts.toISOString(),
        voting_ends_at: votingEnds.toISOString(),
        is_active: true,
        is_featured: true,
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Auto-contest created:', data);
    return { success: true, contest: data };
  } catch (error) {
    console.error('Failed to create auto-contest:', error);
    return { success: false, error };
  }
}

/**
 * Select winners for an ended contest
 */
export async function selectContestWinners(contestId: string) {
  try {
    // Get all entries for the contest, sorted by votes
    const { data: entries, error } = await supabase
      .from('contest_entries')
      .select('*')
      .eq('contest_id', contestId)
      .order('votes_count', { ascending: false });

    if (error) throw error;
    if (!entries || entries.length === 0) {
      console.log('No entries for contest:', contestId);
      return { success: true, message: 'No entries to judge' };
    }

    // Get contest details for prize pool
    const { data: contest } = await supabase
      .from('contests')
      .select('prize_pool')
      .eq('id', contestId)
      .single();

    const prizePool = contest?.prize_pool || 0;

    // Award prizes to top 3 entries
    const prizes = [
      { rank: 1, percentage: 0.5 },  // 50% of prize pool
      { rank: 2, percentage: 0.3 },  // 30% of prize pool
      { rank: 3, percentage: 0.2 },  // 20% of prize pool
    ];

    for (let i = 0; i < Math.min(entries.length, prizes.length); i++) {
      const entry = entries[i];
      const prize = prizes[i];
      const prizeAmount = prizePool * prize.percentage;

      await announceContestWinner(contestId, entry.id, prize.rank, prizeAmount);
    }

    console.log('Winners selected for contest:', contestId);
    return { success: true, winnersCount: Math.min(entries.length, prizes.length) };
  } catch (error) {
    console.error('Failed to select contest winners:', error);
    return { success: false, error };
  }
}

/**
 * Main auto-contest sync function
 * This should be called by a cron job or scheduled task
 */
export async function syncContestStatuses(): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Check if we need to create a new contest
    // Look for active contests that haven't started voting yet
    const { data: upcomingContests, error: upcomingError } = await supabase
      .from('contests')
      .select('*')
      .eq('is_active', true)
      .gte('voting_starts_at', nowIso)
      .order('voting_starts_at', { ascending: true });

    if (upcomingError) throw upcomingError;

    // If no upcoming contests, create one
    if (!upcomingContests || upcomingContests.length === 0) {
      const themeIndex = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000)); // Rotate themes weekly
      await createAutoContest(themeIndex);
    }

    // 2. Check for contests that have ended voting
    const { data: endedContests, error: endedError } = await supabase
      .from('contests')
      .select('*')
      .eq('is_active', true)
      .lt('voting_ends_at', nowIso)
      .is('winner_announced_at', null);

    if (endedError) throw endedError;

    // Select winners for ended contests
    if (endedContests && endedContests.length > 0) {
      for (const contest of endedContests) {
        await selectContestWinners(contest.id);
      }
    }

    console.log('Contest sync completed successfully');
    return { success: true, message: 'Contest sync completed' };
  } catch (error) {
    console.error('Contest sync failed:', error);
    return { success: false, message: 'Contest sync failed' };
  }
}

/**
 * Hook to sync contests on mount
 * Usage: useSyncContestsOnMount() in your layout or page component
 */
export function useSyncContestsOnMount() {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback or setTimeout to not block initial render
    const scheduleSync = () => {
      syncContestStatuses().then((result) => {
        console.log('Contest sync on mount:', result);
      });
    };
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(scheduleSync, { timeout: 2000 });
    } else {
      setTimeout(scheduleSync, 1000);
    }
  }
}

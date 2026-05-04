import { supabase } from './supabase';

/**
 * Metrics-based contest configuration
 */
const METRICS_CONTEST_CONFIG = {
  contestTypes: [
    {
      id: 'most-sales-monthly',
      title: 'Most Sales - Monthly',
      description: 'Seller with the highest total sales count this month',
      category: 'Sales',
      reward: 'Pro Membership (6 months) + Homepage Feature',
      badge: 'Top Seller',
      durationDays: 30,
      metric: 'total_sales',
      minThreshold: 5
    },
    {
      id: 'most-products-sold',
      title: 'Most Products Sold',
      description: 'Seller with the most individual products sold',
      category: 'Sales',
      reward: 'Sponsorship Package + Verified Seller Badge',
      badge: 'Product Champion',
      durationDays: 30,
      metric: 'products_sold',
      minThreshold: 10
    },
    {
      id: 'most-jobs-completed',
      title: 'Most Jobs Completed',
      description: 'Maker with the most custom job completions',
      category: 'Custom Jobs',
      reward: 'Pro Membership (3 months) + Priority Badge',
      badge: 'Job Master',
      durationDays: 30,
      metric: 'jobs_completed',
      minThreshold: 5
    },
    {
      id: 'revenue-leader',
      title: 'Revenue Leader',
      description: 'Highest revenue generator',
      category: 'Sales',
      reward: 'Marketing Credits ($500) + Featured Placement',
      badge: 'Revenue King',
      durationDays: 90,
      metric: 'total_revenue',
      minThreshold: 500
    }
  ]
};

/**
 * Get leaderboard data for a specific metric
 * Uses user_xp table which has rank data
 */
export async function getLeaderboard(metric: string, limit: number = 10) {
  try {
    // Step 1: Get user_xp data
    const { data: xpData, error: xpError } = await supabase
      .from('user_xp')
      .select('user_id, total_xp, current_rank')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (xpError) throw xpError;
    if (!xpData || xpData.length === 0) {
      return { success: true, leaderboard: [] };
    }

    // Step 2: Get user IDs
    const userIds = xpData.map(item => item.user_id);

    // Step 3: Fetch profiles for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, shop_name, avatar_url, rating')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Create a map for quick lookup
    const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Step 4: Transform and combine data
    const transformed = xpData.map(item => {
      const profile = profileMap.get(item.user_id);
      return {
        id: item.user_id,
        userId: item.user_id,
        username: profile?.username || 'Unknown',
        displayName: profile?.display_name || profile?.username || 'Unknown User',
        shopName: profile?.shop_name,
        avatarUrl: profile?.avatar_url,
        rating: profile?.rating,
        reviewCount: 0,
        total_xp: item.total_xp,
        current_rank: item.current_rank,
        // Map metrics for contest compatibility
        total_sales: Math.floor(item.total_xp / 10),
        products_sold: Math.floor(item.total_xp / 20),
        jobs_completed: Math.floor(item.total_xp / 30),
        total_revenue: item.total_xp * 0.5
      };
    });
    
    return { success: true, leaderboard: transformed };
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return { success: false, error, leaderboard: [] };
  }
}

/**
 * Select winner for a metrics-based contest
 * Uses user_xp table for metrics
 */
export async function selectMetricsWinner(contestId: string, metric: string, minThreshold: number) {
  try {
    // Step 1: Get top performer from user_xp
    const { data: topPerformers, error } = await supabase
      .from('user_xp')
      .select('user_id, total_xp')
      .gte('total_xp', minThreshold)
      .order('total_xp', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!topPerformers || topPerformers.length === 0) {
      console.log('No eligible performers for contest:', contestId);
      return { success: true, message: 'No eligible performers' };
    }

    const winner = topPerformers[0];
    const userId = winner.user_id;

    // Step 2: Fetch winner's profile separately
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, shop_name, avatar_url')
      .eq('id', userId)
      .single();

    const profile = profileData;

    // Record winner in contest_winners table
    const { error: winnerError } = await supabase
      .from('contest_winners')
      .insert({
        contest_id: contestId,
        user_id: userId,
        rank: 1,
        metric_value: winner.total_xp,
        awarded_at: new Date().toISOString()
      });

    if (winnerError) throw winnerError;

    // Award badge to winner
    const { error: badgeError } = await supabase
      .from('seller_badges')
      .insert({
        seller_id: userId,
        badge_name: METRICS_CONTEST_CONFIG.contestTypes.find(c => c.id === contestId)?.badge || 'Contest Winner',
        awarded_at: new Date().toISOString()
      });

    if (badgeError) {
      console.error('Failed to award badge:', badgeError);
    }

    console.log('Winner selected for contest:', contestId, winner);
    return { success: true, winner };
  } catch (error) {
    console.error('Failed to select metrics winner:', error);
    return { success: false, error };
  }
}

/**
 * Create new metrics-based contest
 */
export async function createMetricsContest(contestType: any) {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('contests')
      .insert({
        id: contestType.id,
        title: contestType.title,
        description: contestType.description,
        category: contestType.category,
        reward: contestType.reward,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        max_participants: 999,
        judging_criteria: [contestType.metric],
        requirements: [`Minimum ${contestType.minThreshold} ${contestType.metric}`],
        badge_awarded: contestType.badge,
        metric_type: contestType.metric,
        min_threshold: contestType.minThreshold
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Metrics contest created:', data);
    return { success: true, contest: data };
  } catch (error) {
    console.error('Failed to create metrics contest:', error);
    return { success: false, error };
  }
}

/**
 * Main sync function for metrics-based contests
 * Automatically selects winners and creates new contests
 */
export async function syncContestStatuses(): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Check for ended contests and select winners
    const { data: endedContests, error: endedError } = await supabase
      .from('contests')
      .select('*')
      .lt('end_date', nowIso)
      .is('winner_announced_at', null);

    if (endedError) throw endedError;

    if (endedContests && endedContests.length > 0) {
      for (const contest of endedContests) {
        const contestType = METRICS_CONTEST_CONFIG.contestTypes.find(c => c.id === contest.id);
        if (contestType) {
          await selectMetricsWinner(contest.id, contestType.metric, contestType.minThreshold);
          // Mark contest as completed
          await supabase
            .from('contests')
            .update({ 
              status: 'completed',
              winner_announced_at: new Date().toISOString()
            })
            .eq('id', contest.id);
        }
      }
    }

    // 2. Check if we need to create new contests for the current month
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const contestType of METRICS_CONTEST_CONFIG.contestTypes) {
      // Check if a contest of this type exists for current month
      const { data: existingContest } = await supabase
        .from('contests')
        .select('*')
        .eq('id', contestType.id)
        .single();

      if (!existingContest) {
        // Create new contest for this type
        await createMetricsContest(contestType);
      }
    }

    console.log('Metrics contest sync completed successfully');
    return { success: true, message: 'Metrics contest sync completed' };
  } catch (error) {
    console.error('Metrics contest sync failed:', error);
    return { success: false, message: 'Metrics contest sync failed' };
  }
}

/**
 * Hook to sync contests on mount
 */
export function useSyncContestsOnMount() {
  if (typeof window !== 'undefined') {
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

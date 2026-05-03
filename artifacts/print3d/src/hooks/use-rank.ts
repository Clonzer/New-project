"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import {
  getUserXpStats,
  getXpHistory,
  getDailyChallengeProgress,
  awardXp,
  trackLogin,
  quickXpActions,
  type UserXpStats,
  type XpHistoryEntry,
  type DailyProgress,
  type XpAwardResult,
} from "@/lib/xp-service";
import { calculateRank } from "@/lib/rank-system";

interface UseRankReturn {
  // Stats
  stats: UserXpStats | null;
  rankInfo: ReturnType<typeof calculateRank> | null;
  history: XpHistoryEntry[];
  dailyChallenge: DailyProgress | null;

  // Loading states
  loading: boolean;
  refreshing: boolean;

  // Actions
  refresh: () => Promise<void>;
  awardXp: (rewardId: string, metadata?: Record<string, any>) => Promise<XpAwardResult>;
  trackLogin: () => Promise<{ streak: number; isNewDay: boolean }>;

  // Quick actions
  actions: {
    listingCreated: (isDetailed?: boolean) => Promise<XpAwardResult>;
    saleCompleted: (isQuick?: boolean) => Promise<XpAwardResult>;
    reviewReceived: (stars: number) => Promise<XpAwardResult>;
    reviewLeft: () => Promise<XpAwardResult>;
    messageResponded: (responseTimeMinutes: number) => Promise<XpAwardResult>;
    questionAnswered: () => Promise<XpAwardResult>;
  };
}

export function useRank(): UseRankReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserXpStats | null>(null);
  const [history, setHistory] = useState<XpHistoryEntry[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.id;

  const loadData = useCallback(async (showLoading = false) => {
    if (!userId) {
      setStats(null);
      setHistory([]);
      setDailyChallenge(null);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setRefreshing(true);

    try {
      const [xpStats, xpHistory, challenge] = await Promise.all([
        getUserXpStats(userId),
        getXpHistory(userId, 20),
        getDailyChallengeProgress(userId),
      ]);

      setStats(xpStats);
      setHistory(xpHistory);
      setDailyChallenge(challenge);
    } catch (error) {
      console.error("Error loading rank data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  // Award XP wrapper
  const awardXpWrapper = useCallback(
    async (rewardId: string, metadata?: Record<string, any>) => {
      if (!userId) {
        return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
      }
      const result = await awardXp(userId, rewardId, metadata);
      if (result.success) {
        await refresh();
      }
      return result;
    },
    [userId, refresh]
  );

  // Track login wrapper
  const trackLoginWrapper = useCallback(async () => {
    if (!userId) return { streak: 0, isNewDay: false };
    const result = await trackLogin(userId);
    if (result.isNewDay) {
      await refresh();
    }
    return result;
  }, [userId, refresh]);

  // Quick actions
  const actions = {
    listingCreated: useCallback(
      async (isDetailed = false) => {
        if (!userId) return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
        const result = await quickXpActions.listingCreated(userId, isDetailed);
        if (result.success) await refresh();
        return result;
      },
      [userId, refresh]
    ),

    saleCompleted: useCallback(
      async (isQuick = false) => {
        if (!userId) return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
        const result = await quickXpActions.saleCompleted(userId, isQuick);
        if (result.success) await refresh();
        return result;
      },
      [userId, refresh]
    ),

    reviewReceived: useCallback(
      async (stars: number) => {
        if (!userId) return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
        const result = await quickXpActions.reviewReceived(userId, stars);
        if (result.success) await refresh();
        return result;
      },
      [userId, refresh]
    ),

    reviewLeft: useCallback(async () => {
      if (!userId) return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
      const result = await quickXpActions.reviewLeft(userId);
      if (result.success) await refresh();
      return result;
    }, [userId, refresh]),

    messageResponded: useCallback(
      async (responseTimeMinutes: number) => {
        if (!userId) return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
        const result = await quickXpActions.messageResponded(userId, responseTimeMinutes);
        if (result.success) await refresh();
        return result;
      },
      [userId, refresh]
    ),

    questionAnswered: useCallback(async () => {
      if (!userId) return { success: false, xpAwarded: 0, newTotalXp: 0, error: "Not logged in" };
      const result = await quickXpActions.questionAnswered(userId);
      if (result.success) await refresh();
      return result;
    }, [userId, refresh]),
  };

  const rankInfo = stats ? calculateRank(stats.totalXp) : null;

  return {
    stats,
    rankInfo,
    history,
    dailyChallenge,
    loading,
    refreshing,
    refresh,
    awardXp: awardXpWrapper,
    trackLogin: trackLoginWrapper,
    actions,
  };
}

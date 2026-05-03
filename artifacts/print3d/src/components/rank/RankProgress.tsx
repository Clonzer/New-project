"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateRank, formatXp, getRankById, RANKS } from "@/lib/rank-system";
import { getTodaysChallenge, DAILY_CHALLENGES, type DailyChallenge } from "@/lib/xp-rewards";
import { getUserXpStats, getDailyChallengeProgress, type UserXpStats, type DailyProgress } from "@/lib/xp-service";
import { RankBadge, RankIcon } from "./RankBadge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Zap,
  Star,
} from "lucide-react";

interface RankProgressProps {
  userId: string;
}

export function RankProgress({ userId }: RankProgressProps) {
  const [stats, setStats] = useState<UserXpStats | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);
    const [xpStats, challenge] = await Promise.all([
      getUserXpStats(userId),
      getDailyChallengeProgress(userId),
    ]);
    setStats(xpStats);
    setDailyProgress(challenge);
    setLoading(false);
  }

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-1/3" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
            <div className="h-20 bg-zinc-800 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const rankInfo = calculateRank(stats.totalXp);
  const { currentRank, nextRank, progress, xpToNext } = rankInfo;
  const todaysChallenge = getTodaysChallenge();

  return (
    <div className="space-y-6">
      {/* Main Rank Card */}
      <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border-zinc-800 overflow-hidden relative">
        {/* Background glow */}
        <div
          className={cn(
            "absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl",
            "bg-gradient-to-br",
            currentRank.gradient
          )}
        />

        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Rank Icon */}
            <div className="relative">
              <RankIcon rankId={currentRank.id} size="lg" />
              {stats.currentStreak > 0 && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {stats.currentStreak}
                </div>
              )}
            </div>

            {/* Rank Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <RankBadge rankId={currentRank.id} showTooltip={false} />
                <span className="text-zinc-500 text-sm">
                  Rank {currentRank.id} of {RANKS.length}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">
                {currentRank.name}
              </h3>

              {nextRank ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      {formatXp(stats.totalXp)} / {formatXp(nextRank.minXp)} XP
                    </span>
                    <span className="text-zinc-300">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-zinc-800" />
                  <p className="text-sm text-zinc-500">
                    {formatXp(xpToNext)} XP needed for{" "}
                    <span className="text-primary font-medium">{nextRank.name}</span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Maximum Rank Achieved!</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-3 min-w-[140px]">
              <StatBox
                icon={Zap}
                label="Today's XP"
                value={stats.todayXp}
                color="text-yellow-400"
              />
              <StatBox
                icon={TrendingUp}
                label="This Week"
                value={stats.weekXp}
                color="text-green-400"
              />
              <StatBox
                icon={Star}
                label="Total XP"
                value={stats.totalXp}
                color="text-primary"
              />
            </div>
          </div>

          {/* Perks */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-sm font-semibold text-zinc-300 mb-3">Current Perks:</p>
            <div className="flex flex-wrap gap-2">
              {currentRank.perks.map((perk, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenge */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg text-white">Daily Challenge</CardTitle>
            </div>
            <span className="text-xs text-zinc-500">
              Resets in {getTimeUntilReset()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                {todaysChallenge.name}
              </h4>
              <p className="text-sm text-zinc-400">
                {todaysChallenge.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {dailyProgress?.current || 0}
                  <span className="text-zinc-500 text-lg">
                    /{todaysChallenge.requirement}
                  </span>
                </p>
                <p className="text-xs text-zinc-500">{todaysChallenge.xp} XP reward</p>
              </div>

              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  dailyProgress?.completed
                    ? "bg-green-500/20 text-green-400"
                    : "bg-zinc-800 text-zinc-400"
                )}
              >
                {dailyProgress?.completed ? (
                  <Trophy className="w-8 h-8" />
                ) : (
                  <Target className="w-8 h-8" />
                )}
              </div>
            </div>
          </div>

          {dailyProgress && !dailyProgress.completed && (
            <div className="mt-4">
              <Progress
                value={(dailyProgress.current / dailyProgress.target) * 100}
                className="h-2 bg-zinc-800"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          icon={Flame}
          label="Login Streak"
          value={`${stats.currentStreak} days`}
          color="orange"
        />
        <QuickStat
          icon={Trophy}
          label="Rank Position"
          value={getRankPosition(stats.currentRankId)}
          color="amber"
        />
        <QuickStat
          icon={Calendar}
          label="Monthly XP"
          value={formatXp(stats.monthXp)}
          color="blue"
        />
        <QuickStat
          icon={Zap}
          label="Next Perk"
          value={nextRank ? nextRank.perks[0] : "Max Rank!"}
          color="green"
          truncate
        />
      </div>

      {/* Lifetime Pro Banner (for Legend rank) */}
      {currentRank.isLifetime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/30 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-amber-400">Lifetime Pro Subscription Active!</h4>
              <p className="text-sm text-amber-300/80">
                As a Legend rank member, you enjoy unlimited listings and all Pro features forever.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Helper components
function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={cn("w-4 h-4", color)} />
      <span className="text-zinc-400">{label}:</span>
      <span className="text-white font-semibold">{formatXp(value)}</span>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  truncate = false,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  color: string;
  truncate?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    orange: "bg-orange-500/20 text-orange-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colorClasses[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className={cn("text-sm font-semibold text-white", truncate && "truncate")}>{value}</p>
    </div>
  );
}

function getTimeUntilReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

function getRankPosition(rankId: number): string {
  if (rankId >= 15) return "Top 0.1%";
  if (rankId >= 14) return "Top 0.5%";
  if (rankId >= 13) return "Top 1%";
  if (rankId >= 12) return "Top 2%";
  if (rankId >= 11) return "Top 5%";
  if (rankId >= 10) return "Top 10%";
  if (rankId >= 8) return "Top 25%";
  if (rankId >= 6) return "Top 50%";
  return "Getting Started";
}

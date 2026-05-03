"use client";

import { cn } from "@/lib/utils";
import { getRankById, calculateRank, formatXp, type Rank } from "@/lib/rank-system";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sprout,
  Compass,
  Hammer,
  Wrench,
  Store,
  Handshake,
  Star,
  Award,
  Briefcase,
  Crown,
  Gem,
  Trophy,
  Medal,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Sprout,
  Compass,
  Hammer,
  Wrench,
  Store,
  Handshake,
  Star,
  Award,
  Briefcase,
  Crown,
  Gem,
  Trophy,
  Medal,
  Zap,
};

interface RankBadgeProps {
  rankId: number;
  totalXp?: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
}

export function RankBadge({
  rankId,
  totalXp,
  showProgress = false,
  size = "md",
  className,
  showTooltip = true,
}: RankBadgeProps) {
  const rank = getRankById(rankId);
  if (!rank) return null;

  const Icon = ICON_MAP[rank.icon] || Sprout;
  const rankInfo = totalXp ? calculateRank(totalXp) : null;

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
    xl: "text-lg px-5 py-2.5 gap-2.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        "bg-gradient-to-r",
        rank.gradient,
        "border-white/20 shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], "text-white")} />
      <span className="text-white">{rank.name}</span>
      {showProgress && rankInfo && rankInfo.nextRank && (
        <span className="text-white/80 text-xs ml-1">
          ({formatXp(rankInfo.xpToNext)} to {rankInfo.nextRank.name})
        </span>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  rank.gradient
                )}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">{rank.name}</p>
                <p className="text-xs text-zinc-400">Rank {rank.id} of 15</p>
              </div>
            </div>

            {rankInfo && rankInfo.nextRank && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Progress to {rankInfo.nextRank.name}</span>
                  <span className="text-zinc-300">{rankInfo.progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      "bg-gradient-to-r",
                      rank.gradient
                    )}
                    style={{ width: `${rankInfo.progress}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  {formatXp(rankInfo.xpToNext)} XP needed
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-700">
              <p className="text-xs font-semibold text-zinc-300 mb-1">Perks:</p>
              <ul className="text-xs text-zinc-400 space-y-0.5">
                {rank.perks.slice(0, 3).map((perk, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {rank.isLifetime && (
              <div className="pt-2 border-t border-zinc-700">
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Lifetime Pro Subscription Included!
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Mini rank indicator for cards and lists
interface MiniRankProps {
  rankId: number;
  className?: string;
}

export function MiniRank({ rankId, className }: MiniRankProps) {
  const rank = getRankById(rankId);
  if (!rank || rankId <= 1) return null;

  const Icon = ICON_MAP[rank.icon] || Sprout;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center",
              "w-6 h-6 rounded-full",
              "bg-gradient-to-br",
              rank.gradient,
              "border border-white/20 shadow-sm",
              className
            )}
          >
            <Icon className="w-3 h-3 text-white" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-semibold">{rank.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Rank icon only (for storefronts)
interface RankIconProps {
  rankId: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RankIcon({ rankId, size = "md", className }: RankIconProps) {
  const rank = getRankById(rankId);
  if (!rank) return null;

  const Icon = ICON_MAP[rank.icon] || Sprout;

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl",
        "bg-gradient-to-br",
        rank.gradient,
        "border border-white/20 shadow-lg",
        sizes[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], "text-white")} />
    </div>
  );
}

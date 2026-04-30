import { cn } from "@/lib/utils";
import { getRankBadgeStyles, formatXp, calculateRank } from "@/lib/rank-system";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Award } from "lucide-react";

interface RankBadgeProps {
  rankId: number;
  totalXp?: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RankBadge({ 
  rankId, 
  totalXp, 
  showProgress = false,
  size = "md",
  className 
}: RankBadgeProps) {
  const { gradient, icon, name } = getRankBadgeStyles(rankId);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };
  
  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };
  
  const progress = totalXp ? calculateRank(totalXp) : null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1.5", className)}>
            <span 
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full font-semibold text-white",
                "bg-gradient-to-r shadow-lg shadow-black/20",
                sizeClasses[size],
                gradient
              )}
            >
              <span className={iconSizes[size]}>{icon}</span>
              <span className="uppercase tracking-wider">{name}</span>
            </span>
            
            {showProgress && progress && progress.nextRank && (
              <div className="flex flex-col gap-1 min-w-[100px]">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{formatXp(totalXp!)} XP</span>
                  <span>{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-1.5" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="bottom" className="max-w-xs p-4 bg-zinc-900 border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-bold text-white">{name}</p>
                <p className="text-xs text-zinc-400">Rank {rankId} of 7</p>
              </div>
            </div>
            
            {progress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Progress to next rank</span>
                  <span className="text-primary">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>
            )}
            
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">
                Earn XP by completing orders, getting reviews, and participating in contests.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Rank progress card for dashboard/profile
interface RankProgressCardProps {
  totalXp: number;
  weeklyXp?: number;
  className?: string;
}

export function RankProgressCard({ totalXp, weeklyXp = 0, className }: RankProgressCardProps) {
  const { currentRank, nextRank, progress } = calculateRank(totalXp);
  const { icon, name } = currentRank;
  
  return (
    <div className={cn("glass-panel rounded-2xl p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
            "bg-gradient-to-br shadow-lg",
            currentRank.badgeColor
          )}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{name}</h3>
            <p className="text-sm text-zinc-400">Current Rank</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatXp(totalXp)}</p>
          <p className="text-xs text-zinc-400">Total XP</p>
        </div>
      </div>
      
      {nextRank && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Progress to {nextRank.name}</span>
            <span className="text-primary font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} size="md" />
          <p className="text-xs text-zinc-500">
            {formatXp(nextRank.minXp - totalXp)} XP needed for next rank
          </p>
        </div>
      )}
      
      {weeklyXp > 0 && (
        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-zinc-300">
            <span className="text-green-400 font-semibold">+{formatXp(weeklyXp)}</span> XP earned this week
          </span>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-white/5 rounded-xl">
        <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
          <Award className="w-3 h-3" />
          Current Benefits
        </p>
        <ul className="space-y-1">
          {currentRank.benefits.map((benefit, idx) => (
            <li key={idx} className="text-xs text-zinc-300 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Mini rank indicator for cards
interface MiniRankProps {
  rankId: number;
  className?: string;
}

export function MiniRank({ rankId, className }: MiniRankProps) {
  const { gradient, icon } = getRankBadgeStyles(rankId);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-sm",
              "bg-gradient-to-r shadow-md",
              gradient,
              className
            )}
          >
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-semibold">{getRankBadgeStyles(rankId).name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { RankBadge, RankProgressCard } from "@/components/shared/RankBadge";
import { RANKS, formatXp } from "@/lib/rank-system";
import { getUserXpStats, getXpHistory, XpLogEntry } from "@/lib/xp-tracker";
import { 
  Trophy, TrendingUp, Award, Clock, Star, 
  Package, MessageSquare, Palette, Gift, Zap,
  Lock, CheckCircle2, ChevronRight, Target, Crown, Medal
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function UserRankPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [xpStats, setXpStats] = useState<{
    totalXp: number;
    currentRank: number;
    weeklyXp: number;
    monthlyXp: number;
  } | null>(null);
  const [xpHistory, setXpHistory] = useState<XpLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?.id) {
      loadRankData();
    }
  }, [user?.id]);

  const loadRankData = async () => {
    setLoading(true);
    try {
      const [stats, history] = await Promise.all([
        getUserXpStats(user!.id),
        getXpHistory(user!.id, 20)
      ]);
      
      setXpStats(stats);
      setXpHistory(history);
    } catch (error) {
      console.error("Failed to load rank data:", error);
      toast({
        title: "Error loading rank data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!xpStats) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Start Your Journey</h3>
          <p className="text-zinc-400 text-sm">
            Complete your profile and start selling to earn XP and climb the ranks!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rank Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Rank</h2>
          <p className="text-zinc-400">Earn XP to unlock rewards and climb the leaderboard</p>
        </div>
        <RankBadge 
          rankId={xpStats.currentRank} 
          totalXp={xpStats.totalXp}
          showProgress
          size="lg"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ranks">All Ranks</TabsTrigger>
          <TabsTrigger value="history">XP History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <RankProgressCard 
            totalXp={xpStats.totalXp} 
            weeklyXp={xpStats.weeklyXp}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Trophy} 
              label="Total XP" 
              value={formatXp(xpStats.totalXp)}
              color="text-yellow-400"
            />
            <StatCard 
              icon={TrendingUp} 
              label="This Week" 
              value={`+${formatXp(xpStats.weeklyXp)}`}
              color="text-green-400"
            />
            <StatCard 
              icon={Clock} 
              label="This Month" 
              value={`+${formatXp(xpStats.monthlyXp)}`}
              color="text-blue-400"
            />
            <StatCard 
              icon={Award} 
              label="Current Rank" 
              value={`#${xpStats.currentRank}`}
              color="text-purple-400"
            />
          </div>

          {/* How to Earn XP */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                How to Earn XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <XpMethod icon={Package} title="Complete Orders" xp="20-60 XP" />
                <XpMethod icon={Star} title="Get 5-Star Reviews" xp="50 XP" />
                <XpMethod icon={MessageSquare} title="Respond to Messages" xp="2 XP" />
                <XpMethod icon={Palette} title="Enter Contests" xp="75 XP" />
                <XpMethod icon={Gift} title="Refer Sellers" xp="100 XP" />
                <XpMethod icon={Trophy} title="Win Contests" xp="500 XP" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranks">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {RANKS.map((rank, index) => {
              const isCurrentRank = rank.id === xpStats.currentRank;
              const isUnlocked = rank.id <= xpStats.currentRank;
              const isNextRank = rank.id === xpStats.currentRank + 1;
              const isLocked = rank.id > xpStats.currentRank;

              // Calculate progress for current rank
              const currentRankData = RANKS.find(r => r.id === xpStats.currentRank);
              const nextRankData = RANKS.find(r => r.id === xpStats.currentRank + 1);
              const progress = nextRankData
                ? Math.min(100, Math.round(((xpStats.totalXp - (currentRankData?.minXp || 0)) / ((nextRankData?.minXp || 1) - (currentRankData?.minXp || 0))) * 100))
                : 100;
              const xpToNext = nextRankData ? nextRankData.minXp - xpStats.totalXp : 0;

              return (
                <motion.div
                  key={rank.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-4 rounded-xl border transition-all
                    ${isCurrentRank
                      ? `bg-gradient-to-r ${rank.badgeColor.replace('from-', '').replace('to-', '')} bg-opacity-20 border-white/40 shadow-lg`
                      : isUnlocked
                        ? 'bg-zinc-900/50 border-zinc-700 hover:border-zinc-600'
                        : 'bg-zinc-950/30 border-zinc-800 opacity-60'
                    }
                  `}
                >
                  {/* Current Rank Badge */}
                  {isCurrentRank && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Locked Indicator */}
                  {isLocked && (
                    <div className="absolute top-3 right-3 text-zinc-600">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Rank Icon */}
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                      ${isCurrentRank
                        ? `bg-gradient-to-br ${rank.badgeColor} shadow-lg`
                        : isUnlocked
                          ? `bg-gradient-to-br ${rank.badgeColor} opacity-80`
                          : 'bg-zinc-800 text-zinc-500 grayscale'
                      }
                    `}>
                      {rank.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Rank Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-lg">{rank.name}</span>
                        {isCurrentRank && (
                          <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full font-medium">
                            Current
                          </span>
                        )}
                        {isNextRank && !isCurrentRank && (
                          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                            Next
                          </span>
                        )}
                      </div>

                      {/* XP Range */}
                      <div className="text-sm text-zinc-400 mb-2 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {formatXp(rank.minXp)} - {rank.maxXp === Infinity ? '∞' : formatXp(rank.maxXp)} XP
                      </div>

                      {/* Benefits */}
                      <div className="flex flex-wrap gap-1.5">
                        {rank.benefits.slice(0, 3).map((benefit, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded-md ${
                              isCurrentRank || isUnlocked
                                ? 'bg-white/10 text-zinc-300 border border-white/5'
                                : 'bg-zinc-900/50 text-zinc-500'
                            }`}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>

                      {/* Progress Bar for Current Rank */}
                      {isCurrentRank && nextRankData && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-400">Progress to {nextRankData.name}</span>
                            <span className="text-primary font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-zinc-800" />
                          <p className="text-xs text-zinc-500">
                            {formatXp(xpToNext)} XP needed
                          </p>
                        </div>
                      )}

                      {/* Lock Message for Locked Ranks */}
                      {isLocked && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                          <Lock className="w-3 h-3" />
                          <span>Unlock at {formatXp(rank.minXp)} XP</span>
                        </div>
                      )}
                    </div>

                    {/* Rank Number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isCurrentRank
                        ? 'bg-white text-black'
                        : isUnlocked
                          ? 'bg-zinc-700 text-zinc-300'
                          : 'bg-zinc-800 text-zinc-600'
                    }`}>
                      {rank.id}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < RANKS.length - 1 && (
                    <div className={`absolute left-8 -bottom-3 w-0.5 h-5 ${
                      isUnlocked && rank.id < xpStats.currentRank
                        ? 'bg-gradient-to-b from-primary/50 to-transparent'
                        : 'bg-zinc-800'
                    }`} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {entry.description}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-green-400 font-semibold">
                            +{entry.xpAmount} XP
                          </span>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  color: string;
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// XP Method Component
function XpMethod({ 
  icon: Icon, 
  title, 
  xp 
}: { 
  icon: React.ElementType; 
  title: string; 
  xp: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{title}</p>
      </div>
      <span className="text-xs text-green-400 font-medium">{xp}</span>
    </div>
  );
}

import { cn } from "@/lib/utils";

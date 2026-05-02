import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, TrendingUp, Award, Clock, Star, Target, Crown, Medal,
  Package, MessageSquare, Palette, Gift, Zap, Sparkles, ChevronRight,
  Lock, CheckCircle2, TrendingUp as TrendingUpIcon, ShoppingCart,
  Printer, Heart, Users, ArrowRight
} from "lucide-react";
import { getRankProgress, RANKS, type XpHistoryEntry, type XpReward } from "@/lib/rank-system";
import { Progress } from "@/components/ui/progress";

interface UserRankPanelProps {
  totalXp: number;
  xpHistory?: XpHistoryEntry[];
}

const XP_REWARDS: XpReward[] = [
  { action: "Complete Order", xp: 50, icon: "package", description: "Finish a customer order" },
  { action: "5-Star Review", xp: 25, icon: "star", description: "Get a perfect rating" },
  { action: "Quick Delivery", xp: 20, icon: "zap", description: "Deliver within 24h" },
  { action: "Custom Design", xp: 100, icon: "palette", description: "Create custom model" },
  { action: "Refer Friend", xp: 75, icon: "gift", description: "Friend makes first order" },
  { action: "Help Forum", xp: 15, icon: "message", description: "Answer community question" },
];

const XP_TASKS = [
  { id: 1, task: "Complete 3 Orders", xp: 150, progress: 1, total: 3, icon: ShoppingCart },
  { id: 2, task: "Get 5-Star Review", xp: 25, progress: 0, total: 1, icon: Star },
  { id: 3, task: "Upload Portfolio Item", xp: 30, progress: 0, total: 1, icon: Palette },
  { id: 4, task: "Refer a Friend", xp: 75, progress: 0, total: 1, icon: Gift },
  { id: 5, task: "Quick Delivery (24h)", xp: 20, progress: 0, total: 1, icon: Zap },
];

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
          {/* Main Rank Card with Large Icon & Animated Progress */}
          <Card className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border-white/10 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentRank.badgeColor} opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                {/* Large Rank Icon */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentRank.badgeColor} flex items-center justify-center text-4xl shadow-lg shadow-black/30 flex-shrink-0`}
                >
                  {currentRank.icon}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{currentRank.name}</h3>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                      Rank {currentRank.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{formatXp(xpStats.totalXp)} XP Total</p>
                  
                  {/* Animated Progress Bar */}
                  {nextRank && (
                    <div className="space-y-2">
                      <div className="text-xs text-zinc-400 mb-1">Progress to {nextRank.name}</div>
                      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentRank.badgeColor} rounded-full`}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold text-sm">{progress}%</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">{formatXp(xpToNext)} XP to next</span>
                        </div>
                        <span className="text-zinc-500">{formatXp(xpStats.totalXp)} total</span>
                      </div>
                    </div>
                  )}

                  {/* View Rank Details Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 bg-white/5"
                    onClick={() => setActiveTab("ranks")}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    View Rank Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Tasks to Earn XP */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Next Tasks to Rank Up
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Complete these to earn XP and reach {nextRank?.name || "next rank"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {XP_TASKS.slice(0, 4).map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <task.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{task.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                          style={{ width: `${(task.progress / task.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{task.progress}/{task.total}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 font-semibold text-sm">
                    <Sparkles className="w-4 h-4" />
                    +{task.xp} XP
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats - 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Clock}
              label="Weekly"
              value={`+${formatXp(xpStats.weeklyXp)}`}
              color="text-green-400"
            />
            <StatCard
              icon={TrendingUpIcon}
              label="Monthly"
              value={`+${formatXp(xpStats.monthlyXp)}`}
              color="text-blue-400"
            />
            <StatCard
              icon={Trophy}
              label="Total"
              value={formatXp(xpStats.totalXp)}
              color="text-yellow-400"
            />
          </div>

          {/* XP Rewards Overview */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                XP Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {XP_REWARDS.slice(0, 6).map((method) => (
                  <div key={method.action} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs">
                    {method.icon === "package" && <Package className="w-3 h-3 text-zinc-400" />}
                    {method.icon === "star" && <Star className="w-3 h-3 text-yellow-400" />}
                    {method.icon === "zap" && <Zap className="w-3 h-3 text-blue-400" />}
                    {method.icon === "palette" && <Palette className="w-3 h-3 text-purple-400" />}
                    {method.icon === "gift" && <Gift className="w-3 h-3 text-pink-400" />}
                    {method.icon === "message" && <MessageSquare className="w-3 h-3 text-green-400" />}
                    <span className="text-zinc-300 flex-1 truncate">{method.action}</span>
                    <span className="text-green-400 font-semibold">+{method.xp}</span>
                  </div>
                ))}
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
          <Card className="bg-zinc-900/30 border-white/10">
            <CardContent className="p-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {xpHistory.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 text-zinc-500"
                      >
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No XP history yet</p>
                        <p className="text-xs mt-1">Complete activities to earn XP!</p>
                      </motion.div>
                    ) : (
                      xpHistory.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
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

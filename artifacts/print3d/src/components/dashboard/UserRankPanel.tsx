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
  Package, MessageSquare, Palette, Gift, Zap
} from "lucide-react";

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
          <div className="space-y-3">
            {RANKS.map((rank, index) => {
              const isCurrentRank = rank.id === xpStats.currentRank;
              const isUnlocked = rank.id <= xpStats.currentRank;
              const isNextRank = rank.id === xpStats.currentRank + 1;
              
              return (
                <motion.div
                  key={rank.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-4 rounded-xl border transition-all
                    ${isCurrentRank 
                      ? 'bg-primary/10 border-primary/50' 
                      : isUnlocked 
                        ? 'bg-zinc-900/30 border-zinc-800' 
                        : 'bg-zinc-950/50 border-zinc-900 opacity-60'
                    }
                  `}
                >
                  {isCurrentRank && (
                    <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                      Current Rank
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-xl
                      bg-gradient-to-br ${rank.badgeColor}
                    `}>
                      {rank.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white">{rank.name}</h4>
                        <span className="text-xs text-zinc-400">
                          {formatXp(rank.minXp)} - {rank.maxXp === Infinity ? '∞' : formatXp(rank.maxXp)} XP
                        </span>
                      </div>
                      
                      <ul className="space-y-1">
                        {rank.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-primary" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {isNextRank && (
                      <div className="text-xs text-primary font-medium">
                        Next
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Recent XP Gains</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {xpHistory.length === 0 ? (
                      <p className="text-center text-zinc-500 py-8">
                        No XP history yet. Start completing actions to earn XP!
                      </p>
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

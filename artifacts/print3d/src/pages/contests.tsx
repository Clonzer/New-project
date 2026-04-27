import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Award, 
  Sparkles, 
  Trophy, 
  Users, 
  Clock, 
  Star,
  CheckCircle,
  AlertCircle,
  Medal,
  Calendar,
  Upload,
  Eye,
  Crown,
  TrendingUp,
  Target,
  Flame,
  Gem
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta, MarketplaceStructuredData, StructuredData, generateBreadcrumbSchema } from "@/components/seo";
import { NeonButton } from "@/components/ui/neon-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { listContests, listContestEntries, voteForEntry, getVotingContests, getEndedContests, getActiveContests } from "@/lib/contest-api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useListContests, useListContestEntries, useVoteForEntry } from "@/lib/workspace-stub";
import { getLeaderboard } from "@/lib/contest-sync";
import { supabase } from "@/lib/supabase";

interface Contest {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: string;
  status: "upcoming" | "active" | "judging" | "completed";
  startDate: string;
  endDate: string;
  maxParticipants: number;
  judgingCriteria: string[];
  requirements: string[];
  badgeAwarded?: string;
}

interface ContestEntry {
  id: string;
  contestId: string;
  userId: number;
  title: string;
  description: string;
  images: string[];
  files: string[];
  submittedAt: string;
  votes: number;
  averageScore: number;
  status: "submitted" | "reviewing" | "approved" | "rejected" | "winner";
  user: {
    id: number;
    displayName: string;
    avatar?: string;
    avatar_url?: string;
    avatarUrl?: string;
    shopName?: string;
  };
}

export default function Contests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("active");
  const [contests, setContests] = useState<Contest[]>([]);
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("total_sales");

  // Real stats from Supabase
  const [contestStats, setContestStats] = useState({
    activeContests: 0,
    totalEntries: 0,
    totalWinners: 0,
    totalSponsors: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchContestsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch contests from Supabase
        const contestsResult = await listContests();
        
        // Transform data or use fallback
        // Generate sales-based contests with random active contest
        const generateSalesContests = (): Contest[] => {
          const now = new Date();
          const salesContests = [
            {
              id: "most-sales-monthly",
              title: "Most Sales - Monthly",
              description: "Seller with the highest total sales count this month wins Pro Membership and homepage feature",
              category: "Sales",
              reward: "6 Months Pro Plan + Homepage Sponsorship",
              status: "active" as const,
              startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
              endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
              maxParticipants: 999,
              judgingCriteria: ["Total Sales Count", "Revenue Generated", "Customer Satisfaction"],
              requirements: ["Minimum 5 sales", "4.0+ star rating"],
              badgeAwarded: "Top Seller"
            },
            {
              id: "most-products-sold",
              title: "Most Products Sold",
              description: "Seller with the most individual products sold wins sponsorship package",
              category: "Sales",
              reward: "3 Months Pro Plan + Verified Badge + Sponsorship",
              status: "active" as const,
              startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
              endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
              maxParticipants: 999,
              judgingCriteria: ["Products Sold Count", "Variety of Products", "Repeat Customers"],
              requirements: ["Minimum 10 products sold", "Active listings"],
              badgeAwarded: "Product Champion"
            },
            {
              id: "most-jobs-completed",
              title: "Most Jobs Completed",
              description: "Maker with the most custom job completions wins Pro Membership",
              category: "Custom Jobs",
              reward: "3 Months Pro Plan + Priority Placement Badge",
              status: "active" as const,
              startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
              endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
              maxParticipants: 500,
              judgingCriteria: ["Jobs Completed Count", "On-Time Delivery", "Customer Rating"],
              requirements: ["Minimum 5 jobs completed", "4.5+ star rating"],
              badgeAwarded: "Job Master"
            },
            {
              id: "revenue-leader",
              title: "Revenue Leader",
              description: "Highest revenue generator this quarter wins premium placement",
              category: "Sales",
              reward: "12 Months Pro Plan + Featured Homepage Spot",
              status: "upcoming" as const,
              startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
              endDate: new Date(now.getFullYear(), now.getMonth() + 4, 0).toISOString(),
              maxParticipants: 999,
              judgingCriteria: ["Total Revenue", "Average Order Value", "Growth Rate"],
              requirements: ["Minimum $500 revenue", "Active shop"],
              badgeAwarded: "Revenue King"
            },
            {
              id: "fastest-growing",
              title: "Fastest Growing Shop",
              description: "Shop with highest growth rate wins Pro Membership",
              category: "Growth",
              reward: "6 Months Pro Plan + Rising Star Badge",
              status: "upcoming" as const,
              startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000).toISOString(),
              maxParticipants: 300,
              judgingCriteria: ["Growth Percentage", "New Customers", "Order Volume Increase"],
              requirements: ["Minimum 30 days active", "10+ orders"],
              badgeAwarded: "Rising Star"
            },
            {
              id: "customer-favorite",
              title: "Customer Favorite",
              description: "Highest rated shop by customers wins verified seller badge",
              category: "Customer Service",
              reward: "Verified Badge + 3 Months Pro Plan + Sponsorship",
              status: "upcoming" as const,
              startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(now.getTime() + 44 * 24 * 60 * 60 * 1000).toISOString(),
              maxParticipants: 500,
              judgingCriteria: ["Average Rating", "Review Count", "Response Time"],
              requirements: ["Minimum 10 reviews", "4.8+ average rating"],
              badgeAwarded: "Customer Favorite"
            }
          ];

          // Ensure at least one contest is always active (random selection)
          const activeContests = salesContests.filter(c => c.status === "active");
          if (activeContests.length === 0 && salesContests.length > 0) {
            const randomIndex = Math.floor(Math.random() * salesContests.length);
            salesContests[randomIndex].status = "active";
          }

          return salesContests;
        };

        const transformedContests: Contest[] = contestsResult.contests?.length > 0
          ? contestsResult.contests.map((c: any) => ({
              id: c.id,
              title: c.title,
              description: c.description,
              category: c.category,
              reward: c.prize,
              status: c.status,
              startDate: c.start_date,
              endDate: c.end_date,
              maxParticipants: c.max_participants,
              judgingCriteria: c.rules || [],
              requirements: c.rules || [],
              badgeAwarded: c.badge_awarded
            }))
          : generateSalesContests();

        // Use mock entries for now
        const transformedEntries: ContestEntry[] = [
              {
                id: "1",
                contestId: "1",
                userId: 1,
                title: "Mechanical Keyboard Case",
                description: "Custom 3D printed mechanical keyboard case with integrated RGB lighting",
                images: ["https://images.unsplash.com/photo-1598628469345-be0a2a2e5463?w=400&h=300&fit=crop"],
                files: [],
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                votes: 23,
                averageScore: 4.7,
                status: "approved",
                user: {
                  id: 1,
                  displayName: "John Maker",
                  avatar_url: "https://api.pravatar.cc/150?u=john",
                  shopName: "Maker's Workshop"
                }
              },
              {
                id: "2",
                contestId: "1", 
                userId: 2,
                title: "Articulated Dragon",
                description: "Fully articulated dragon model with 3D printed joints and detailed scales",
                images: ["https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop"],
                files: [],
                submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                votes: 18,
                averageScore: 4.5,
                status: "approved",
                user: {
                  id: 2,
                  displayName: "Sarah Creator",
                  avatar_url: "https://api.pravatar.cc/150?u=sarah",
                  shopName: "Creative Designs"
                }
              }
            ];

        setContests(transformedContests);
        setEntries(transformedEntries);

        // Fetch leaderboard data
        const leaderboardResult = await getLeaderboard(selectedMetric, 10);
        if (leaderboardResult.success) {
          setLeaderboard(leaderboardResult.leaderboard);
        }

        // Fetch real contest stats
        const [contestsCount, entriesCount] = await Promise.all([
          supabase.from('contests').select('*', { count: 'exact', head: true }),
          supabase.from('contest_entries').select('*', { count: 'exact', head: true })
        ]);

        setContestStats({
          activeContests: contestsCount.count || 0,
          totalEntries: entriesCount.count || 0,
          totalWinners: Math.floor((entriesCount.count || 0) * 0.1), // Estimate 10% of entries are winners
          totalSponsors: 12 // Hardcoded for now - would come from sponsors table
        });
      } catch (error) {
        console.error("Failed to fetch contests data:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingStats(false);
      }
    };

    fetchContestsData();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboardResult = await getLeaderboard(selectedMetric, 10);
      if (leaderboardResult.success) {
        setLeaderboard(leaderboardResult.leaderboard);
      }
    };
    fetchLeaderboard();
  }, [selectedMetric]);

  const getStatusColor = (status: Contest["status"]) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "judging": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "upcoming": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status: Contest["status"]) => {
    switch (status) {
      case "active": return <Target className="w-4 h-4" />;
      case "judging": return <Clock className="w-4 h-4" />;
      case "completed": return <Award className="w-4 h-4" />;
      case "upcoming": return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleEnterContest = (contestId: string) => {
    if (!user) {
      setLocation("/login");
      return;
    }
    toast({
      title: "Contest Entry",
      description: "You have entered this contest. Upload your entry in the contest details.",
      variant: "default",
    });
  };

  const handleVote = async (entryId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to vote for contest entries.",
        variant: "destructive"
      });
      return;
    }

    try {
      await voteForEntry(entryId, user.id);
      setEntries(prev => prev.map(entry =>
        entry.id === entryId
          ? { ...entry, votes: entry.votes + 1 }
          : entry
      ));
      toast({
        title: "Vote Recorded",
        description: "Your vote has been successfully recorded."
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "Unable to record your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredContests = contests.filter(contest => {
    switch (activeTab) {
      case "active": return contest.status === "active";
      case "completed": return contest.status === "completed" || contest.status === "judging";
      case "upcoming": return contest.status === "upcoming";
      default: return true;
    }
  });

  const getWinnerEntries = () => {
    return entries.filter(entry => entry.status === "winner");
  };

  const canonicalUrl = "https://synthix.com/contests";
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://synthix.com" },
    { name: "Contests", url: canonicalUrl },
  ]);

  return (
    <>
      <SEOMeta
        title="Maker Contests & Design Challenges | Synthix"
        description="Join exciting 3D printing and design contests. Showcase your skills, win prizes, and get featured in the Synthix maker community."
        canonical={canonicalUrl}
        type="website"
        keywords={["3D printing contest", "design challenge", "maker competition", "3D model contest", "synthix contests"]}
      />
      <StructuredData schema={[breadcrumbSchema]} />
      <MarketplaceStructuredData />
      
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.2),transparent_50%)]" />
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-10 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Compete & Win</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
                Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-primary to-cyan-400">Contests</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Compete with makers worldwide, showcase your skills, and win exclusive rewards.
              </p>
            </motion.div>
            
            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
              {[/* eslint-disable @typescript-eslint/no-use-before-define */
                { label: "Active Contests", value: isLoadingStats ? "..." : contestStats.activeContests.toString(), icon: Target },
                { label: "Sponsorships", value: isLoadingStats ? "..." : contestStats.totalSponsors.toString(), icon: Award },
                { label: "Entries", value: isLoadingStats ? "..." : contestStats.totalEntries.toLocaleString(), icon: Users },
                { label: "Winners", value: isLoadingStats ? "..." : contestStats.totalWinners.toString(), icon: Trophy },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          {/* Header */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Performance Contests
              </h1>
              <Target className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Compete with makers worldwide, showcase your skills, and win exclusive rewards including sponsored features and special badges.
            </p>
          </motion.div> */}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-900/80 border border-white/10 p-1.5 rounded-2xl">
              <TabsTrigger
                value="active"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all"
              >
                <Target className="w-4 h-4 mr-2" />
                Active
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all"
              >
                <Award className="w-4 h-4 mr-2" />
                Winners
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming
              </TabsTrigger>
            </TabsList>

            {/* Active Contests Tab */}
            <TabsContent value="active" className="mt-8">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-white/10 animate-pulse overflow-hidden">
                      <div className="h-52 bg-zinc-800 rounded-t-xl"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
                        <div className="h-3 bg-zinc-800 rounded w-full"></div>
                        <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
                        <div className="pt-4 border-t border-zinc-800">
                          <div className="h-10 bg-zinc-800 rounded-lg"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredContests.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredContests.map((contest, index) => (
                    <motion.div
                      key={contest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="group bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border-white/10 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/10">
                        <div className="relative">
                          <div className="h-52 bg-gradient-to-br from-primary/40 via-purple-500/30 to-accent/40 relative overflow-hidden">
                            {/* Animated mesh background */}
                            <div className="absolute inset-0 opacity-30">
                              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.4),transparent_50%)]"></div>
                              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.4),transparent_50%)]"></div>
                              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-20"></div>
                            </div>
                            {/* Floating decorative elements */}
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute top-4 left-4"
                            >
                              <Trophy className="w-8 h-8 text-white/40" />
                            </motion.div>
                            <motion.div
                              animate={{ y: [0, 8, 0] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                              className="absolute bottom-4 right-4"
                            >
                              <Sparkles className="w-6 h-6 text-white/40" />
                            </motion.div>
                            {/* Contest badge */}
                            <div className="relative z-10 flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 shadow-xl">
                                  <span className="text-3xl font-display font-bold text-white">
                                    {contest.title.split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-xs text-white/70 uppercase tracking-widest font-medium">
                                  {contest.category}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge className={`absolute top-4 right-4 ${getStatusColor(contest.status)} border-0 shadow-lg`}>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(contest.status)}
                              <span className="capitalize font-medium">{contest.status}</span>
                            </div>
                          </Badge>
                        </div>

                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-4">
                              <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">{contest.title}</h3>
                              <Badge variant="secondary" className="text-xs bg-white/5 text-zinc-400 border-0">
                                {contest.category}
                              </Badge>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-primary">{contest.reward}</div>
                              <div className="text-xs text-zinc-500">Prize</div>
                            </div>
                          </div>

                          <p className="text-sm text-zinc-400 mb-4 line-clamp-2 leading-relaxed">{contest.description}</p>

                          {/* Progress bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-zinc-500">Time Remaining</span>
                              <span className="text-white font-medium">
                                {Math.max(0, Math.ceil((new Date(contest.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                              </span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, Math.min(100, ((Date.now() - new Date(contest.startDate).getTime()) / (new Date(contest.endDate).getTime() - new Date(contest.startDate).getTime())) * 100))}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex -space-x-2">
                              {leaderboard.slice(0, 4).map((seller, i) => {
                                const avatarUrl = seller.avatar_url || seller.avatarUrl || seller.avatar;
                                const initials = (seller.displayName || seller.shopName || "S").charAt(0).toUpperCase();
                                return (
                                  <Avatar key={seller.id} className="w-7 h-7 border-2 border-zinc-900">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs font-semibold">{initials}</AvatarFallback>
                                  </Avatar>
                                );
                              })}
                              {leaderboard.length > 4 && (
                                <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-500">
                                  +{leaderboard.length - 4}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500">{leaderboard.length} participants</span>
                          </div>

                          <Link href={`/contests/${contest.id}`} className="block">
                            <Button
                              variant="outline"
                              className="w-full bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-all group/btn"
                            >
                              <Eye className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110" />
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-4"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 mb-6">
                    <Target className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Contests</h3>
                  <p className="text-zinc-400 max-w-md mx-auto">There are no active contests at the moment. Check the upcoming tab to see what's coming next!</p>
                </motion.div>
              )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-8">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Performance Leaderboard</h2>
                    <p className="text-zinc-400">Track seller performance across key metrics</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "total_sales", label: "Most Sales", icon: Trophy },
                      { key: "products_sold", label: "Products", icon: Award },
                      { key: "jobs_completed", label: "Jobs", icon: CheckCircle },
                      { key: "total_revenue", label: "Revenue", icon: Gem },
                    ].map(({ key, label, icon: Icon }) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMetric(key)}
                        className={`rounded-xl border-white/10 transition-all ${
                          selectedMetric === key
                            ? "bg-gradient-to-r from-primary to-primary/80 text-white border-primary shadow-lg shadow-primary/25"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mr-1.5" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-white/10 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                      {leaderboard.length > 0 ? (
                        leaderboard.map((seller, index) => (
                          <motion.div
                            key={seller.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-all group ${index < 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''}`}
                          >
                            {/* Rank Badge */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/20' :
                              index === 1 ? 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-black shadow-lg' :
                              index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg' :
                              'bg-zinc-800 text-zinc-400 border border-white/10'
                            }`}>
                              {index < 3 ? <Crown className="w-4 h-4" /> : index + 1}
                            </div>

                            {/* Avatar */}
                            <Avatar className={`w-12 h-12 border-2 ${index < 3 ? 'border-yellow-500/30' : 'border-white/10'}`}>
                              <AvatarImage src={seller.avatar_url || seller.avatarUrl || seller.avatar} />
                              <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold text-lg">
                                {(seller.displayName || seller.shopName || "S").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                              <p className="font-semibold text-white truncate group-hover:text-primary transition-colors">{seller.displayName || seller.shopName}</p>
                              <p className="text-sm text-zinc-500">{seller.shopName || "Shop"}</p>
                            </div>

                            {/* Stats */}
                            <div className="text-right">
                              <p className="font-bold text-white text-lg">{seller[selectedMetric] || 0}</p>
                              <p className="text-xs text-zinc-500 capitalize">{selectedMetric.replace(/_/g, " ")}</p>
                            </div>

                            {/* Trend indicator */}
                            {index === 0 && (
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Flame className="w-5 h-5" />
                              </div>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-16 px-4">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 mb-6">
                            <TrendingUp className="w-10 h-10 text-zinc-600" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Leaderboard Empty</h3>
                          <p className="text-zinc-400 max-w-md mx-auto">No data available yet. Start competing to climb the ranks!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Winners Tab */}
            <TabsContent value="completed" className="mt-8">
              <div className="space-y-8">
                {getWinnerEntries().length > 0 ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8 px-4 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-xl shadow-yellow-500/20">
                        <Crown className="w-8 h-8 text-black" />
                      </div>
                      <h2 className="text-3xl font-display font-bold text-white mb-2">Contest Winners</h2>
                      <p className="text-zinc-400 max-w-lg mx-auto">Celebrating the best makers and their incredible creations. These champions have earned their place at the top!</p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {getWinnerEntries().map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card className="group bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border-yellow-500/20 hover:border-yellow-500/40 transition-all overflow-hidden shadow-xl">
                            {/* Winner Banner */}
                            <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400" />

                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                    index === 1 ? 'bg-gradient-to-br from-zinc-300 to-zinc-400' :
                                    'bg-gradient-to-br from-amber-600 to-amber-700'
                                  }`}>
                                    <Crown className={`w-6 h-6 ${index === 0 ? 'text-black' : index === 1 ? 'text-black' : 'text-white'}`} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white truncate max-w-[150px]">{entry.title}</h3>
                                    <p className="text-sm text-yellow-400 font-medium">Winner #{index + 1}</p>
                                  </div>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                  <Star className="w-3 h-3 mr-1" />
                                  {entry.averageScore.toFixed(1)}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
                                <Avatar className="w-10 h-10 border-2 border-yellow-500/30">
                                  <AvatarImage src={entry.user.avatar_url || entry.user.avatarUrl || entry.user.avatar} />
                                  <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold">
                                    {(entry.user.displayName || "?").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{entry.user.displayName}</p>
                                  <p className="text-xs text-zinc-500">{entry.user.shopName}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 rounded-xl bg-white/5">
                                  <p className="text-2xl font-bold text-white">{entry.votes}</p>
                                  <p className="text-xs text-zinc-500">Total Votes</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-white/5">
                                  <p className="text-2xl font-bold text-primary">{entry.averageScore.toFixed(1)}</p>
                                  <p className="text-xs text-zinc-500">Avg Score</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 px-4"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 mb-6">
                      <Award className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Winners Yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto">Contests are still ongoing. Check back soon to see the champions!</p>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            {/* Upcoming Tab */}
            <TabsContent value="upcoming" className="mt-8">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-white/10 animate-pulse overflow-hidden">
                      <div className="h-32 bg-zinc-800 rounded-t-xl"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-5 bg-zinc-800 rounded w-3/4"></div>
                        <div className="h-3 bg-zinc-800 rounded w-full"></div>
                        <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredContests.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredContests.map((contest, index) => (
                    <motion.div
                      key={contest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="group bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border-white/10 hover:border-primary/30 transition-all overflow-hidden shadow-xl">
                        <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.2),transparent_50%)]"></div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-4 right-4 opacity-20"
                          >
                            <Sparkles className="w-12 h-12 text-primary" />
                          </motion.div>
                          <div className="absolute bottom-4 left-4">
                            <Badge className="bg-zinc-800/80 text-zinc-300 border-white/10">
                              <Calendar className="w-3 h-3 mr-1" />
                              Coming Soon
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{contest.title}</h3>
                          <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{contest.description}</p>

                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500 flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Starts in
                              </span>
                              <span className="text-white font-medium">
                                {Math.ceil((new Date(contest.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Reward</span>
                              <span className="text-primary font-semibold">{contest.reward}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Participants</span>
                              <span className="text-white">Up to {contest.maxParticipants}</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-all group/btn"
                            onClick={() => setSelectedContest(contest)}
                          >
                            <AlertCircle className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110" />
                            Get Notified
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-4"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 mb-6">
                    <Calendar className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Upcoming Contests</h3>
                  <p className="text-zinc-400 max-w-md mx-auto">Stay tuned! New contests are being planned. Check the active tab to join current competitions.</p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          {/* Contest Detail Modal */}
          <AnimatePresence>
            {selectedContest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedContest(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedContest.title}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedContest(null)}>
                      ×
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-zinc-400">{selectedContest.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Reward</h3>
                      <p className="text-primary font-bold">{selectedContest.reward}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Judging Criteria</h3>
                      <ul className="space-y-2">
                        {selectedContest.judgingCriteria.map((criteria, index) => (
                          <li key={index} className="flex items-center gap-2 text-zinc-300">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-zinc-400 text-sm">Start Date</p>
                        <p className="text-white">{new Date(selectedContest.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">End Date</p>
                        <p className="text-white">{new Date(selectedContest.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {selectedContest.status === "active" && (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/600"
                        onClick={() => {
                          handleEnterContest(selectedContest.id);
                          setSelectedContest(null);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Enter This Contest
                      </Button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      <Footer />
    </div>
    </>
  );
}

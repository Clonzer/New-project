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
  Target,
  Calendar,
  Upload,
  Eye,
  Crown
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listContests, listContestEntries, voteForEntry, getVotingContests, getEndedContests, getActiveContests } from "@/lib/contest-api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useListContests, useListContestEntries, useVoteForEntry } from "@/lib/workspace-stub";

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
    avatar: string;
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
              reward: "Pro Membership (6 months) + Homepage Feature",
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
              reward: "Sponsorship Package + Verified Seller Badge",
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
              reward: "Pro Membership (3 months) + Priority Badge",
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
              description: "Highest revenue generator this quarter wins marketing credits",
              category: "Sales",
              reward: "Marketing Credits ($500) + Featured Placement",
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
              reward: "Pro Membership (3 months) + Growth Badge",
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
              reward: "Verified Seller Badge + Priority Placement",
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
                  avatar: "https://api.pravatar.cc/150?u=john",
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
                  avatar: "https://api.pravatar.cc/150?u=sarah",
                  shopName: "Creative Designs"
                }
              }
            ];

        setContests(transformedContests);
        setEntries(transformedEntries);
      } catch (error) {
        console.error("Failed to fetch contests data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContestsData();
  }, []);

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
      case "completed": return <Trophy className="w-4 h-4" />;
      case "upcoming": return <Calendar className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleEnterContest = (contestId: string) => {
    if (!user) {
      setLocation("/login");
      return;
    }
    setLocation(`/contests/${contestId}/enter`);
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
      await voteForEntry(entryId);
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
    return entries
      .filter(entry => entry.status === "winner")
      .sort((a, b) => b.averageScore - a.averageScore);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="container mx-auto px-4 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Design Contests
              </h1>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Compete with makers worldwide, showcase your skills, and win exclusive rewards including sponsored features and special badges.
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-800/50 border border-zinc-700">
              <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Active Contests
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Trophy className="w-4 h-4 mr-2" />
                Winners
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming
              </TabsTrigger>
            </TabsList>

            {/* Active Contests Tab */}
            <TabsContent value="active" className="mt-8">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
                      <div className="h-48 bg-zinc-700 rounded-t-lg"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                        <div className="h-3 bg-zinc-700 rounded w-full"></div>
                        <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
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
                    >
                      <Card className="bg-zinc-800/50 border-zinc-700 hover:border-primary/50 transition-all overflow-hidden">
                        <div className="relative">
                          <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <Trophy className="w-16 h-16 text-primary/40" />
                          </div>
                          <Badge className={`absolute top-4 right-4 ${getStatusColor(contest.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(contest.status)}
                              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                            </div>
                          </Badge>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {contest.category}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{contest.reward}</div>
                              <div className="text-xs text-zinc-400">Prize Pool</div>
                            </div>
                          </div>

                          <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{contest.description}</p>

                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Reward</span>
                              <span className="text-white">{contest.reward}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Ends in</span>
                              <span className="text-white">
                                {Math.ceil((new Date(contest.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setSelectedContest(contest)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-400">No active contests at the moment.</p>
                  <p className="text-zinc-500 text-sm mt-2">Check back soon for new opportunities!</p>
                </div>
              )}
            </TabsContent>

            {/* Winners Tab */}
            <TabsContent value="completed" className="mt-8">
              <div className="space-y-8">
                {getWinnerEntries().length > 0 ? (
                  <>
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-white mb-2">Contest Winners</h2>
                      <p className="text-zinc-400">Celebrating the best makers and their incredible creations</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {getWinnerEntries().map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/30">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white">{entry.title}</h3>
                                    <p className="text-sm text-zinc-400">Winner</p>
                                  </div>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                  #{index + 1}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 mb-4">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={entry.user.avatar} />
                                  <AvatarFallback>{entry.user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-white">{entry.user.displayName}</p>
                                  <p className="text-xs text-zinc-400">{entry.user.shopName}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-zinc-400">Score</p>
                                  <p className="text-white font-bold">{entry.averageScore.toFixed(1)}/5.0</p>
                                </div>
                                <div>
                                  <p className="text-zinc-400">Votes</p>
                                  <p className="text-white font-bold">{entry.votes}</p>
                                </div>
                              </div>

                              {entry.images.length > 0 && (
                                <div className="mt-4">
                                  <img 
                                    src={entry.images[0]} 
                                    alt={entry.title}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400">No contests have been completed yet.</p>
                    <p className="text-zinc-500 text-sm mt-2">Be the first to win an upcoming contest!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Upcoming Tab */}
            <TabsContent value="upcoming" className="mt-8">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                        <div className="h-3 bg-zinc-700 rounded w-full"></div>
                        <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
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
                    >
                      <Card className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold text-white">{contest.title}</h3>
                          </div>

                          <p className="text-sm text-zinc-400 mb-4">{contest.description}</p>

                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Starts in</span>
                              <span className="text-white">
                                {Math.ceil((new Date(contest.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Reward</span>
                              <span className="text-primary font-bold">{contest.reward}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Max Participants</span>
                              <span className="text-white">{contest.maxParticipants}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-white">Requirements:</p>
                            <ul className="text-sm text-zinc-400 space-y-1">
                              {contest.requirements.map((req, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={() => setSelectedContest(contest)}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Get Notified
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-400">No upcoming contests scheduled.</p>
                  <p className="text-zinc-500 text-sm mt-2">Check back later for new announcements!</p>
                </div>
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

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Requirements</h3>
                      <ul className="space-y-2">
                        {selectedContest.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-zinc-300">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            {req}
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
  );
}

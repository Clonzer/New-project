import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar, 
  Award, 
  Target, 
  Crown,
  TrendingUp,
  Star,
  Medal,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  Upload,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
// Mock contest data - replace with real API when available
const mockContest: Contest = {
  id: "1",
  title: "Summer Design Challenge 2024",
  description: "Create stunning 3D printed designs for summer! Show us your best outdoor gear, beach accessories, or garden decor. Winners will be featured on our homepage and receive exclusive badges.",
  category: "Design",
  reward: "$500 + Featured Badge",
  status: "active",
  startDate: "2024-06-01",
  endDate: "2024-08-31",
  maxParticipants: 100,
  judgingCriteria: ["Creativity", "Print Quality", "Functionality", "Presentation"],
  requirements: ["Must be original design", "Include STL files", "Provide photos of printed object"],
  badgeAwarded: "summer-champion-2024"
};

const mockEntries: ContestEntry[] = [
  {
    id: "entry-1",
    contestId: "1",
    userId: 101,
    title: "Beach Phone Holder",
    description: "A stylish phone holder perfect for beach days. Features sand-resistant design and adjustable angle.",
    images: [],
    files: [],
    submittedAt: "2024-06-15T10:30:00Z",
    votes: 42,
    averageScore: 4.5,
    status: "submitted",
    user: {
      id: 101,
      displayName: "DesignPro",
      avatar_url: "",
      shopName: "Design Studio"
    }
  },
  {
    id: "entry-2",
    contestId: "1",
    userId: 102,
    title: "Garden Planter Collection",
    description: "Modular planters with built-in drainage. Stackable design for vertical gardens.",
    images: [],
    files: [],
    submittedAt: "2024-06-20T14:15:00Z",
    votes: 38,
    averageScore: 4.8,
    status: "reviewing",
    user: {
      id: 102,
      displayName: "GreenThumb3D",
      avatar_url: "",
      shopName: "Garden Prints"
    }
  }
];

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

export default function ContestDetail() {
  const { contestId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contest, setContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const fetchContestData = async () => {
      try {
        setIsLoading(true);

        // Fetch real contest data from API
        if (contestId) {
          const contestResult = await getContestById(contestId);
          if (contestResult.success && contestResult.contest) {
            const c = contestResult.contest;
            setContest({
              id: c.id,
              title: c.title,
              description: c.description,
              category: c.category,
              reward: c.prize,
              status: c.status,
              startDate: c.start_date,
              endDate: c.end_date,
              maxParticipants: c.max_participants,
              judgingCriteria: c.rules || ["Quality", "Creativity", "Technical Skill"],
              requirements: c.rules || [],
              badgeAwarded: c.badge_awarded
            });

            // Fetch contest entries
            const entriesResult = await listContestEntries(c.id);
            if (entriesResult.success && entriesResult.entries) {
              const transformedEntries: ContestEntry[] = entriesResult.entries.map((e: any) => ({
                id: e.id,
                contestId: e.contest_id,
                userId: e.user_id,
                title: e.title,
                description: e.description,
                images: e.images || [],
                files: e.files || [],
                submittedAt: e.submitted_at,
                votes: e.votes || 0,
                averageScore: e.average_score || 0,
                status: e.status,
                user: {
                  id: e.user?.id || e.user_id,
                  displayName: e.user?.display_name || "Unknown",
                  avatar: e.user?.avatar_url || e.user?.avatar,
                  shopName: e.user?.shop_name || e.user?.shopName
                }
              }));
              setEntries(transformedEntries.sort((a, b) => b.votes - a.votes));

              // Check if current user has entered
              if (user) {
                setHasEntered(transformedEntries.some(e => e.userId === user.id));
              }
            } else {
              setEntries([]);
            }
          } else {
            setContest(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contest data:", error);
        toast({
          title: "Error loading contest",
          description: "Failed to load contest data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContestData();
  }, [contestId, user, toast]);

  const handleEnterContest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enter the contest.",
        variant: "destructive",
      });
      return;
    }

    if (hasEntered) {
      toast({
        title: "Already entered",
        description: "You have already entered this contest.",
        variant: "destructive",
      });
      return;
    }

    // Mock enter contest - replace with real API when available
    toast({
      title: "Contest entered!",
      description: "You have successfully entered the contest. Good luck!",
    });
    setHasEntered(true);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white">Loading contest...</div>
        </main>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white">Contest not found</div>
        </main>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(contest.startDate);
  const endDate = new Date(contest.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/contests">
              <Button variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Contests
              </Button>
            </Link>
          </div>

          {/* Contest Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="glass-panel rounded-3xl border border-white/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getStatusColor(contest.status)}>
                      {getStatusIcon(contest.status)}
                      <span className="ml-2 capitalize">{contest.status}</span>
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-zinc-300">
                      {contest.category}
                    </Badge>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                    {contest.title}
                  </h1>

                  <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                    {contest.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Starts: {startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>Ends: {endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{entries.length} participants</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">Contest Progress</span>
                      <span className="text-white">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-zinc-500 mt-1">
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Contest ended"}
                    </div>
                  </div>
                </div>

                {/* Reward Card */}
                <div className="w-full md:w-80 shrink-0">
                  <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-primary/30 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold text-white">Reward</h3>
                    </div>
                    <p className="text-zinc-300 mb-4">{contest.reward}</p>
                    {contest.badgeAwarded && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Medal className="w-4 h-4 text-yellow-400" />
                        <span>Badge: {contest.badgeAwarded}</span>
                      </div>
                    )}
                  </div>

                  {/* Enter Contest Button */}
                  <div className="mt-6">
                    {contest.status === "active" ? (
                      hasEntered ? (
                        <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          You've Entered
                        </Button>
                      ) : (
                        <NeonButton
                          glowColor="primary"
                          onClick={handleEnterContest}
                          className="w-full rounded-xl"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Enter Contest
                        </NeonButton>
                      )
                    ) : (
                      <Button className="w-full rounded-xl bg-zinc-700 text-zinc-400" disabled>
                        {contest.status === "completed" ? "Contest Ended" : "Contest Not Started"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contest Rules & Requirements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="glass-panel border-white/10 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Contest Rules & Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Judging Criteria</h4>
                    <ul className="space-y-2">
                      {contest.judgingCriteria.map((criterion, index) => (
                        <li key={index} className="flex items-start gap-2 text-zinc-300">
                          <Star className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {contest.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2 text-zinc-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Participation</h4>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{entries.length} / {contest.maxParticipants} participants</span>
                    </div>
                    <Progress value={(entries.length / contest.maxParticipants) * 100} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-panel border-white/10 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Top performers in this contest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entries.slice(0, 5).map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-sm">
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={entry.user.avatar_url || entry.user.avatarUrl || entry.user.avatar} alt={entry.user.displayName} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold">
                            {(entry.user.displayName || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium text-white truncate">{entry.user.displayName}</p>
                          <p className="text-xs text-zinc-500">{entry.user.shopName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{entry.votes}</p>
                          <p className="text-xs text-zinc-500">votes</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {entries.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5 w-full">
                        View All {entries.length} Participants
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Participating Users Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Participating Users
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="glass-panel border-white/10 bg-zinc-900/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative">
                      <div className="aspect-video rounded-t-lg overflow-hidden">
                        <img 
                          src={entry.images[0]} 
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                        <Eye className="w-3 h-3 text-white" />
                        <span className="text-xs text-white">{entry.votes}</span>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={entry.user.avatar_url || entry.user.avatarUrl || entry.user.avatar} alt={entry.user.displayName} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold text-sm">
                            {(entry.user.displayName || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{entry.user.displayName}</p>
                          <p className="text-xs text-zinc-500">{entry.user.shopName}</p>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1 truncate">{entry.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{entry.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-white">{entry.averageScore.toFixed(1)}</span>
                        </div>
                        <Link href={`/shop/${entry.user.id}`}>
                          <Button size="sm" variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5 text-xs">
                            View Shop
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

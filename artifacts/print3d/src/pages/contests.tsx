import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Clock,
  Users,
  Star,
  Crown,
  Medal,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Target,
  Wrench,
  Recycle,
  TrendingUp,
  Heart,
  Cog
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useListContests } from "@workspace/api-client-react";

interface ContestParticipant {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  entry?: {
    title: string;
    image: string;
    description: string;
  };
}

interface Contest {
  id: number;
  title: string;
  description: string;
  category: "sales" | "design" | "sustainability" | "growth" | "community";
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  rules?: string | null;
  prizes: any[]; // Generic prizes structure
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // UI-specific fields
  icon: React.ComponentType<{ className?: string }>;
  participants: number;
  leaderboard: ContestParticipant[];
  difficulty: "Easy" | "Medium" | "Hard";
  isActive: boolean;
}

interface PastContest {
  id: string;
  title: string;
  endDate: Date;
  participants: number;
  winner: ContestParticipant;
  prize: string;
}

// Helper function to get icon based on category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "sales": return TrendingUp;
    case "design": return Cog;
    case "sustainability": return Recycle;
    case "growth": return Zap;
    case "community": return Heart;
    default: return Target;
  }
};

// Helper function to get difficulty based on category
const getDifficulty = (category: string): "Easy" | "Medium" | "Hard" => {
  switch (category) {
    case "sales": return "Medium";
    case "design": return "Hard";
    case "sustainability": return "Medium";
    case "growth": return "Easy";
    case "community": return "Easy";
    default: return "Medium";
  }
};

// Transform API contest data to UI contest data
const transformContestData = (apiContest: any): Contest => {
  return {
    ...apiContest,
    icon: getCategoryIcon(apiContest.category),
    participants: 0, // This would need to be fetched separately or added to API
    leaderboard: [], // This would need to be fetched separately or added to API
    difficulty: getDifficulty(apiContest.category),
    isActive: apiContest.status === "active",
  };
};

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4 text-primary" />
      <span className="font-mono">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}

function ContestCard({ contest }: { contest: Contest }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400 bg-green-400/10";
      case "Medium": return "text-yellow-400 bg-yellow-400/10";
      case "Hard": return "text-red-400 bg-red-400/10";
      default: return "text-zinc-400 bg-zinc-400/10";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-zinc-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const endDate = new Date(contest.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl border border-primary/20 bg-primary/5 p-6 hover:border-primary/40 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <contest.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{contest.title}</h3>
            <p className="text-sm text-zinc-400">{contest.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getDifficultyColor(contest.difficulty)} border-0`}>
            {contest.difficulty}
          </Badge>
          <Badge variant="outline" className="border-zinc-600 text-zinc-300">
            {contest.category}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Leaderboard */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Current Leaderboard
          </h4>
          <div className="space-y-2">
            {contest.leaderboard.length > 0 ? contest.leaderboard.map((participant, index) => (
              <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  {getPositionIcon(index + 1)}
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.username} className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{participant.username.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-white font-medium">{participant.username}</span>
                </div>
                <span className="text-primary font-bold">{participant.score}</span>
              </div>
            )) : (
              <div className="p-3 rounded-lg bg-white/5 text-center text-zinc-400">
                No participants yet
              </div>
            )}
          </div>
        </div>

        {/* Prizes */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Prizes
          </h4>
          <div className="space-y-2">
            {contest.prizes && contest.prizes.length > 0 ? contest.prizes.slice(0, 3).map((prize, index) => (
              <div key={index} className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{index + 1}st Place</span>
                  <span className="text-primary font-bold">Prize</span>
                </div>
                <p className="text-xs text-zinc-400">{typeof prize === 'string' ? prize : 'Contest prize'}</p>
              </div>
            )) : (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">1st Place</span>
                  <span className="text-primary font-bold">TBD</span>
                </div>
                <p className="text-xs text-zinc-400">Prizes to be announced</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="w-4 h-4" />
            {contest.participants} participants
          </div>
          <CountdownTimer endDate={endDate} />
        </div>
        <NeonButton glowColor="primary" className="px-6">
          {contest.category === "sales" || contest.category === "growth" ? "Join Challenge" : "Submit Entry"}
        </NeonButton>
      </div>
    </motion.div>
  );
}

export default function Contests() {
  const { data: contestsData, isLoading, error } = useListContests({ status: "active" });
  const { data: pastContestsData } = useListContests({ status: "completed" });

  const activeContests = contestsData?.contests.map(transformContestData) || [];
  const pastContests = pastContestsData?.contests.map(contest => ({
    id: contest.id.toString(),
    title: contest.title,
    endDate: new Date(contest.endDate),
    participants: 0, // Would need separate API call
    winner: {
      id: "winner-1", // Would need separate API call for winners
      username: "Winner",
      score: 0,
      entry: {
        title: "Winning Entry",
        description: "Description of winning entry"
      }
    },
    prize: contest.prizes?.[0]?.title || "Prize"
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-12 pb-24">
          <div className="container mx-auto px-4 text-center">
            <div className="text-white">Loading contests...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-12 pb-24">
          <div className="container mx-auto px-4 text-center">
            <div className="text-red-400">Error loading contests: {error.message}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">Contests & Challenges</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 text-glow">
                Compete. Create. Conquer.
              </h1>
              <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
                Join exciting challenges, showcase your skills, and win amazing prizes.
                From sales competitions to creative design challenges, there's something for every maker.
              </p>
            </motion.div>
          </div>

          {/* Active Contests */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-display font-bold text-white">Active Challenges</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          </section>

          {/* Past Contests */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-display font-bold text-white">Past Winners</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {pastContests.map((contest) => (
                <AccordionItem
                  key={contest.id}
                  value={contest.id}
                  className="glass-panel rounded-2xl border border-white/10 bg-white/5"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-primary/20">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white">{contest.title}</h3>
                          <p className="text-sm text-zinc-400">
                            {contest.participants} participants • Ended {contest.endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">{contest.winner.username}</p>
                        <p className="text-xs text-zinc-400">Winner</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="border-t border-white/10 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Winning Entry</h4>
                          <div className="space-y-3">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <div className="text-center">
                                <Trophy className="w-12 h-12 text-primary mx-auto mb-2" />
                                <p className="text-primary font-medium">Winner</p>
                              </div>
                            </div>
                            <h5 className="text-white font-medium">{contest.winner.entry?.title}</h5>
                            <p className="text-sm text-zinc-400">{contest.winner.entry?.description}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Prize Won</h4>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                            <div className="flex items-center gap-3 mb-2">
                              <Crown className="w-5 h-5 text-yellow-400" />
                              <span className="text-white font-medium">1st Place</span>
                            </div>
                            <p className="text-sm text-zinc-400">{contest.prize}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Call to Action */}
          <section className="mt-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl border border-primary/20 bg-primary/5 p-8 max-w-2xl mx-auto"
            >
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h3>
              <p className="text-zinc-400 mb-6">
                Join the Synthix community challenges and showcase your skills.
                Win prizes, gain recognition, and grow your maker business.
              </p>
              <NeonButton glowColor="primary" size="lg">
                View All Challenges
              </NeonButton>
            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
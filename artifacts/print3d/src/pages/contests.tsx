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
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  endDate: Date;
  participants: number;
  leaderboard: ContestParticipant[];
  prizes: {
    position: number;
    title: string;
    description: string;
    value: string;
  }[];
  category: string;
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

// Sample contest data - replace with real API data when backend is ready
const activeContests: Contest[] = [
  {
    id: "most-sales-month",
    title: "Most Sales This Month",
    description: "Compete with other makers to achieve the highest sales volume this month. Every order counts!",
    icon: TrendingUp,
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    participants: 247,
    category: "Sales",
    difficulty: "Medium",
    isActive: true,
    leaderboard: [
      { id: "1", username: "MakerMaster", score: 1247 },
      { id: "2", username: "PrintQueen", score: 1189 },
      { id: "3", username: "ProtoBuilder", score: 1056 },
    ],
    prizes: [
      { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
      { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
      { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" },
    ]
  },
  {
    id: "best-functional-print",
    title: "Best Functional Print",
    description: "Show off your engineering skills! Submit your most impressive functional 3D printed creation.",
    icon: Cog,
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
    participants: 89,
    category: "Design",
    difficulty: "Hard",
    isActive: true,
    leaderboard: [
      { id: "4", username: "EngiPrint", score: 4.8 },
      { id: "5", username: "MechMaker", score: 4.7 },
      { id: "6", username: "FuncFab", score: 4.6 },
    ],
    prizes: [
      { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
      { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
      { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" },
    ]
  },
  {
    id: "recycled-materials",
    title: "Most Creative Use of Recycled Materials",
    description: "Turn waste into wonder! Create something amazing using recycled filaments or materials.",
    icon: Recycle,
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
    participants: 156,
    category: "Sustainability",
    difficulty: "Medium",
    isActive: true,
    leaderboard: [
      { id: "7", username: "EcoPrint", score: 4.9 },
      { id: "8", username: "GreenMaker", score: 4.8 },
      { id: "9", username: "RecycleArt", score: 4.7 },
    ],
    prizes: [
      { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
      { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
      { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" },
    ]
  },
  {
    id: "fastest-growing",
    title: "Fastest Growing Maker",
    description: "Show explosive growth! Compete based on your shop's growth rate over the past month.",
    icon: Zap,
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    participants: 312,
    category: "Growth",
    difficulty: "Easy",
    isActive: true,
    leaderboard: [
      { id: "10", username: "GrowthHacker", score: 156 },
      { id: "11", username: "ScaleMaker", score: 142 },
      { id: "12", username: "BoomPrint", score: 138 },
    ],
    prizes: [
      { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
      { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
      { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" },
    ]
  },
  {
    id: "mechanical-design",
    title: "Best Mechanical Design",
    description: "Demonstrate your mechanical engineering prowess with complex moving parts and mechanisms.",
    icon: Wrench,
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    participants: 67,
    category: "Engineering",
    difficulty: "Hard",
    isActive: true,
    leaderboard: [
      { id: "13", username: "MechEng", score: 4.9 },
      { id: "14", username: "GearHead", score: 4.8 },
      { id: "15", username: "PrecisionPrint", score: 4.7 },
    ],
    prizes: [
      { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
      { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
      { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" },
    ]
  },
  {
    id: "community-choice",
    title: "Community Choice Award",
    description: "Let the community decide! Submit your best work and let fellow makers vote for the winner.",
    icon: Heart,
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    participants: 203,
    category: "Community",
    difficulty: "Easy",
    isActive: true,
    leaderboard: [
      { id: "16", username: "CommunityFav", score: 892 },
      { id: "17", username: "PeopleChoice", score: 756 },
      { id: "18", username: "CrowdPick", score: 643 },
    ],
    prizes: [
      { position: 1, title: "1st Place", description: "1 week Pro Subscription + 3 months Homepage Sponsorship", value: "Premium" },
      { position: 2, title: "2nd Place", description: "2 weeks Pro Subscription + 1 month Homepage Sponsorship", value: "Pro" },
      { position: 3, title: "3rd Place", description: "1 month Pro Subscription + Featured listing for 30 days", value: "Featured" },
    ]
  }
];

// Sample past contest data - replace with real API data when backend is ready
const pastContests: PastContest[] = [
  {
    id: "past-1",
    title: "Best Miniature Print",
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    participants: 145,
    winner: {
      id: "19",
      username: "MiniMaster",
      score: 4.9,
      entry: {
        title: "Detailed Dragon Figurine",
        description: "A highly detailed 28mm dragon miniature with intricate scales and poseable wings."
      }
    },
    prize: "1 week Pro Subscription + 3 months Homepage Sponsorship"
  },
  {
    id: "past-2",
    title: "Most Innovative Design",
    endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    participants: 98,
    winner: {
      id: "20",
      username: "InnovatorX",
      score: 4.8,
      entry: {
        title: "Modular Storage System",
        description: "A customizable storage solution that can be assembled in multiple configurations."
      }
    },
    prize: "2 weeks Pro Subscription + 1 month Homepage Sponsorship"
  }
];

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
            {contest.leaderboard.map((participant, index) => (
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
            ))}
          </div>
        </div>

        {/* Prizes */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Prizes
          </h4>
          <div className="space-y-2">
            {contest.prizes.map((prize) => (
              <div key={prize.position} className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{prize.title}</span>
                  <span className="text-primary font-bold">{prize.value}</span>
                </div>
                <p className="text-xs text-zinc-400">{prize.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="w-4 h-4" />
            {contest.participants} participants
          </div>
          <CountdownTimer endDate={contest.endDate} />
        </div>
        <NeonButton glowColor="primary" className="px-6">
          {contest.category === "Sales" || contest.category === "Growth" ? "Join Challenge" : "Submit Entry"}
        </NeonButton>
      </div>
    </motion.div>
  );
}

export default function Contests() {
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
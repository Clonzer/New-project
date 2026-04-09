import { motion } from "framer-motion";
import { ArrowRight, Award, Sparkles, Trophy } from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";

const CONTESTS = [
  {
    title: "Featured Build of the Week",
    description: "Show off a finished project, get featured on the homepage, and earn a sponsored storefront boost.",
    reward: "Homepage feature + 14-day profile sponsorship",
    status: "Open soon",
  },
  {
    title: "Best Functional Print",
    description: "A marketplace-style challenge focused on products people can actually buy and use.",
    reward: "Catalog placement + seller spotlight",
    status: "Planned",
  },
  {
    title: "Custom Fabrication Showcase",
    description: "Highlight service-led work like metal, wood, finishing, or design-to-manufacture projects.",
    reward: "Custom request boost + featured reel slot",
    status: "Planned",
  },
];

export default function Contests() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-20 pb-16">
          <AnimatedGradientBg />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-[2rem] border border-white/10 bg-black/35 p-8 md:p-12"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Contests and community drops
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl md:text-6xl font-display font-extrabold text-white leading-[0.95]">
                Marketplace contests are landing without breaking the rest of the app.
              </h1>
              <p className="mt-5 max-w-2xl text-zinc-300 text-lg leading-relaxed">
                This page now exists as a real route, so clicking contests no longer dumps users onto a broken screen.
                We can use it to run featured builds, seller spotlights, and launch campaigns as the marketplace grows.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/pricing">
                  <NeonButton glowColor="primary" className="rounded-full px-7 py-4">
                    View sponsorships
                  </NeonButton>
                </Link>
                <Link href="/explore">
                  <NeonButton glowColor="white" className="rounded-full px-7 py-4">
                    Browse makers <ArrowRight className="ml-2 h-4 w-4" />
                  </NeonButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {CONTESTS.map((contest, index) => (
              <motion.div
                key={contest.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-cyan-200">
                  {index === 0 ? <Trophy className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                </div>
                <h2 className="mt-5 text-2xl font-display font-bold text-white">{contest.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{contest.description}</p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
                  <p className="font-semibold text-white">Reward</p>
                  <p className="mt-1">{contest.reward}</p>
                </div>
                <div className="mt-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  {contest.status}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

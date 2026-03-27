import { useEffect, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const search = useSearch();

  const redirect = useMemo(() => {
    const q = search.startsWith("?") ? search.slice(1) : search;
    const params = new URLSearchParams(q);
    return params.get("redirect") || "/dashboard";
  }, [search]);

  useEffect(() => {
    if (!isLoading && user) setLocation(redirect);
  }, [isLoading, user, redirect, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-zinc-400">Loading…</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      <AnimatedGradientBg />
      <Navbar />

      <main className="flex-grow flex items-start justify-center p-4 pt-16 relative z-10">
        <div className="w-full max-w-lg">
          <div className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10">
            <h1 className="text-3xl font-display font-bold text-white mb-2 text-center">Sign in</h1>
            <p className="text-zinc-400 text-sm text-center mb-8">
              Use your email or username and your password.
            </p>

            <LoginForm
              onSuccess={() => {
                toast({ title: "Welcome back", description: "Signed in successfully." });
                setLocation(redirect);
              }}
            />

            <p className="text-center text-zinc-500 text-sm pt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:text-white transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

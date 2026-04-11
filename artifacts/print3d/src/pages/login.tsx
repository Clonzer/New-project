import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { useAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isLoading, login } = useAuth();
  const search = useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = useMemo(() => {
    const q = search.startsWith("?") ? search.slice(1) : search;
    const params = new URLSearchParams(q);
    return params.get("redirect") || "/dashboard";
  }, [search]);

  useEffect(() => {
    if (!isLoading && user) setLocation(redirect);
  }, [isLoading, user, redirect, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await login(email, password);
    
    if (error) {
      toast({ 
        title: "Login failed", 
        description: error.message,
        variant: "destructive" 
      });
    } else {
      toast({ title: "Welcome back", description: "Signed in successfully." });
      setLocation(redirect);
    }
    
    setIsSubmitting(false);
  };

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
              Use your email and password to sign in.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

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

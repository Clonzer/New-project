import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
<<<<<<< HEAD
import { useAuth } from "@/contexts/supabase-auth-context";
=======
import { useAuth } from "@/hooks/use-auth";
import type { CreateUserRequestRole } from "@/lib/workspace-api-mock";
>>>>>>> f23ccc891fc883c7ee5fd37ec108a9b403670264

type Role = 'buyer' | 'seller' | 'both' | 'admin';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading || user) return;
    const path =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    setLocation(`/login?redirect=${encodeURIComponent(path)}`);
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400 bg-background">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  if (roles?.length && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white bg-background px-4">
        <p className="text-xl font-semibold text-center">Access denied</p>
        <p className="text-zinc-400 text-sm text-center max-w-md">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}

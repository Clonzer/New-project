import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/supabase-auth-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import ShopManagement from "./dashboard/shop";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardSidebar />
      <main className="pl-20">
        {children}
      </main>
    </div>
  );
}

export default function Dashboard() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-zinc-400 mb-6">Please log in to access the dashboard.</p>
          <Link href="/login">
            <a className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors">
              Go to Login
            </a>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Handle routing for authenticated users
  if (location === "/dashboard" || location === "/dashboard/") {
    window.location.href = "/dashboard/shop";
    return null;
  }

  return (
    <DashboardLayout>
      <ShopManagement />
    </DashboardLayout>
  );
}

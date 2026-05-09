import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/supabase-auth-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "./dashboard/overview";
import ShopManagement from "./dashboard/shop";
import OrdersAndSales from "./dashboard/orders";
import CustomerActivity from "./dashboard/customer";
import AccountSettings from "./dashboard/account";

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

  // Show overview for dashboard root

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
          <a 
            href="/login" 
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </DashboardLayout>
    );
  }

  // Route based on location
  if (location === "/dashboard" || location === "/dashboard/") {
    return (
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    );
  } else if (location.startsWith("/dashboard/shop")) {
    return (
      <DashboardLayout>
        <ShopManagement />
      </DashboardLayout>
    );
  } else if (location.startsWith("/dashboard/orders")) {
    return (
      <DashboardLayout>
        <OrdersAndSales />
      </DashboardLayout>
    );
  } else if (location.startsWith("/dashboard/customer")) {
    return (
      <DashboardLayout>
        <CustomerActivity />
      </DashboardLayout>
    );
  } else if (location.startsWith("/dashboard/account")) {
    return (
      <DashboardLayout>
        <AccountSettings />
      </DashboardLayout>
    );
  }

  // Default fallback for any dashboard route
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}

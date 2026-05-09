import { useEffect } from "react";
import { useLocation } from "wouter";
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

  // Simple routing test
  const renderContent = () => {
    console.log("Dashboard test location:", location);
    
    if (location === "/dashboard" || location === "/dashboard/") {
      console.log("Redirecting to shop management");
      window.location.href = "/dashboard/shop";
    } else if (location.startsWith("/dashboard/shop")) {
      return <ShopManagement />;
    } else {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Dashboard Route: {location}</h1>
          <p className="text-zinc-400">This is a test page to verify routing is working.</p>
          <p className="text-zinc-400">Current location: {location}</p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}

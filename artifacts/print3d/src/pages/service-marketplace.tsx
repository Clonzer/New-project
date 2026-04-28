import { Navbar } from "@/components/layout/Navbar";
import { ServiceRequestMarketplace } from "@/components/dashboard/ServiceRequestMarketplace";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Package, Briefcase } from "lucide-react";

export default function ServiceMarketplace() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center glass-panel p-12 rounded-3xl">
            <Package className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
            <p className="text-zinc-400">Please sign in to access the service marketplace.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Navbar />
      
      <main className="flex-grow pt-10 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Header */}
            <div className="glass-panel rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                    Service Marketplace
                  </h1>
                  <p className="text-zinc-400">
                    Browse custom job requests and submit quotes to buyers
                  </p>
                </div>
              </div>
            </div>

            {/* Marketplace Component */}
            <ServiceRequestMarketplace />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

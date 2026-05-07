import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, 
  Star, 
  Users, 
  Eye,
  ChevronRight,
  Shield,
  Package
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { useListListings, useListUsers } from "@/lib/workspace-stub";

export default function Landing() {
  const listings = useListListings();
  const users = useListUsers();

  // Combine and mix listings and users
  const marketplaceItems = [
    ...(listings.data?.listings?.slice(0, 6).map(listing => ({
      ...listing,
      type: 'product',
      title: listing.title,
      subtitle: `$${listing.basePrice || '29.99'}`,
      image: listing.imageUrl,
      rating: listing.rating || "4.8",
      views: listing.views || "234",
      link: `/listings/${listing.id}`
    })) || []),
    ...(users.data?.users?.slice(0, 6).map((user, index) => ({
      ...user,
      type: 'maker',
      title: user.displayName || user.name || `User ${index + 1}`,
      subtitle: user.role || 'Maker',
      rating: user.rating || "4.8",
      orders: user.orders || "156",
      link: `/shop/${user.id}`
    })) || [])
  ].sort(() => Math.random() - 0.5).slice(0, 8); // Shuffle and limit to 8 items

  return (
    <>
      <SEOMeta
        title="Synthix | 3D Printing & Laser Cutting Marketplace"
        description="Browse thousands of 3D printed products and services from verified makers. Order custom prints or buy ready-to-ship items."
        canonical="https://synthix.com"
        image="https://synthix.com/og-image.jpg"
        type="website"
        keywords={[
          "3D printing marketplace",
          "laser cutting services", 
          "custom fabrication",
          "3D printed products",
          "maker marketplace",
          "3D printing service",
          "custom orders",
          "CNC machining",
        ]}
      />
      <MarketplaceStructuredData />
      
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <main className="flex-grow">
          {/* Marketplace Header */}
          <section className="bg-gradient-to-br from-zinc-900 via-purple-900/20 to-zinc-900 border-b border-zinc-800">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                  3D Printing <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Marketplace</span>
                </h1>
              </div>
                
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search products, services, or makers..."
                      className="w-full pl-14 pr-36 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-400 text-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                    <Link href="/search">
                      <Button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-all text-lg">
                        Search
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

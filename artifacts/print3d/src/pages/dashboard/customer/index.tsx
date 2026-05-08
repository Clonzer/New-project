import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useListListings } from "@/lib/workspace-stub";

const CustomerActivity = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const sections = [
    {
      id: "purchases",
      title: "Purchases",
      description: "View your order history and track purchases",
      icon: ShoppingCart,
      path: "/dashboard/purchases",
      count: 12,
      color: "bg-blue-600/20 text-blue-300 border-blue-500/30",
      stats: {
        total: "$1,234",
        orders: 12,
        pending: 2
      }
    },
    {
      id: "reviews",
      title: "Reviews",
      description: "Manage your product reviews and ratings",
      icon: Star,
      path: "/dashboard/reviews",
      count: 8,
      color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
      stats: {
        average: "4.8",
        given: 5,
        received: 3
      }
    },
    {
      id: "favorites",
      title: "Favorites",
      description: "View and manage your favorite items and shops",
      icon: Heart,
      path: "/dashboard/favorites",
      count: 24,
      color: "bg-red-600/20 text-red-300 border-red-500/30",
      stats: {
        items: 18,
        shops: 6,
        recent: 3
      }
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "purchase",
      title: "Custom 3D Print",
      seller: "PrintMaster Pro",
      amount: "$45.00",
      date: "2024-01-15",
      status: "delivered"
    },
    {
      id: 2,
      type: "review",
      title: "Laser Cut Sign",
      seller: "Precision Cuts",
      rating: 5,
      date: "2024-01-14",
      status: "completed"
    },
    {
      id: 3,
      type: "favorite",
      title: "CNC Machined Part",
      seller: "MetalWorks",
      date: "2024-01-13",
      status: "saved"
    },
    {
      id: 4,
      type: "purchase",
      title: "3D Printed Figure",
      seller: "Miniature Factory",
      amount: "$28.00",
      date: "2024-01-12",
      status: "processing"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase": return ShoppingCart;
      case "review": return Star;
      case "favorite": return Heart;
      default: return MessageSquare;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "purchase": return "bg-blue-600/20 text-blue-300 border-blue-500/30";
      case "review": return "bg-yellow-600/20 text-yellow-300 border-yellow-500/30";
      case "favorite": return "bg-red-600/20 text-red-300 border-red-500/30";
      default: return "bg-zinc-600/20 text-zinc-300 border-zinc-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pl-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Customer Activity</h1>
          <p className="text-zinc-400">Track your purchases, reviews, and favorites</p>
        </motion.div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="text-zinc-400 text-sm">{section.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {section.count}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(section.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-white font-medium text-sm">{value}</p>
                    <p className="text-zinc-500 text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>

              <Link href={section.path}>
                <a className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                  <span className="text-sm">Manage</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="favorite">Favorites</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-zinc-400 text-sm">{activity.seller}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-white font-medium">{activity.amount}</p>
                      )}
                      {activity.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white">{activity.rating}</span>
                        </div>
                      )}
                      <p className="text-zinc-400 text-sm">{activity.date}</p>
                    </div>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              View All Activity
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/purchases">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Track Orders</p>
                  <p className="text-zinc-400 text-sm">View purchase history</p>
                </div>
              </a>
            </Link>
            
            <Link href="/dashboard/reviews">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Write Reviews</p>
                  <p className="text-zinc-400 text-sm">Share your experience</p>
                </div>
              </a>
            </Link>
            
            <Link href="/dashboard/favorites">
              <a className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <Heart className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-white font-medium">Browse Favorites</p>
                  <p className="text-zinc-400 text-sm">View saved items</p>
                </div>
              </a>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerActivity;

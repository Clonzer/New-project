import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useListUsers, useListListings } from "@/lib/workspace-api-mock";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { SEOMeta, StructuredData, generateBreadcrumbSchema, MarketplaceStructuredData } from "@/components/seo";
import { Heart, MessageCircle, Share, User, Search, Plus, Star, Smile, ThumbsUp, Laugh, Angry, Loader2, ExternalLink, MessageSquare, Sparkles, TrendingUp, Tag, ChevronRight, Store, Package } from "lucide-react";
import { formatPrice } from "@/lib/locale-preferences";
import { cn } from "@/lib/utils";
import { sortByRanking, enhanceWithSponsorship, type SponsorTier } from "@/utils/sponsored-ranking";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCard } from "@/components/shared/ListingCard";

interface Comment {
  id: number;
  userId: number;
  user: {
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

// Helper component for user profile links
function UserAvatarLink({ userId, avatarUrl, displayName, size = "md" }: { userId: number; avatarUrl?: string; displayName: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };
  const ringClasses = { sm: "p-[1px]", md: "p-[2px]", lg: "p-[2px]" };
  
  return (
    <Link href={`/shop/${userId}`}>
      <div className={`${sizeClasses[size]} ${ringClasses[size]} rounded-full bg-gradient-to-br from-primary to-accent cursor-pointer hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all`}>
        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-1/2 h-1/2 text-zinc-500" />
          )}
        </div>
      </div>
    </Link>
  );
}

// Sample posts data
const SAMPLE_POSTS = [
  {
    id: 1,
    userId: 1,
    user: { displayName: "Alex Johnson", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex" },
    content: "Just finished printing this amazing dragon model! The details are incredible. Used PrusaSlicer with 0.15mm layer height. What do you think?",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop",
    likes: 42,
    comments: 8,
    createdAt: "2 hours ago",
    tags: ["#3DPrinting", "#Dragon", "#Fantasy"]
  },
  {
    id: 2,
    userId: 2,
    user: { displayName: "Sarah Chen", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" },
    content: "Working on a new cosplay prop commission. The client wanted something lightweight but durable, so I'm using PLA with specific infill patterns.",
    likes: 28,
    comments: 12,
    createdAt: "4 hours ago",
    tags: ["#Cosplay", "#Commission", "#Props"]
  },
  {
    id: 3,
    userId: 3,
    user: { displayName: "Mike Rodriguez", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike" },
    content: "Check out my new print farm setup! 6 printers running 24/7 to fulfill orders. Looking to expand soon if demand keeps up.",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop",
    likes: 156,
    comments: 34,
    createdAt: "6 hours ago",
    tags: ["#PrintFarm", "#Business", "#Entrepreneur"]
  }
];

// Trending tags
const TRENDING_TAGS = ["#3DPrinting", "#Miniatures", "#Cosplay", "#Prototyping", "#Custom", "#Art"];

function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "projects" | "people">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { data: listingsData, isLoading: isLoadingListings } = useListListings();
  const { toast } = useToast();

  // Filter listings
  const filteredListings = useMemo(() => {
    if (!listingsData?.listings) return [];
    let listings = listingsData.listings;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      listings = listings.filter((l: any) =>
        l.title?.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query) ||
        l.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    return sortByRanking(enhanceWithSponsorship(listings, 0.15), { quality: 1, views: 0.8, sales: 1.2, age: 0.5 });
  }, [listingsData, searchQuery]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    let users = usersData.users;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter((u: any) =>
        u.displayName?.toLowerCase().includes(query) ||
        u.shopName?.toLowerCase().includes(query) ||
        u.bio?.toLowerCase().includes(query)
      );
    }
    return users;
  }, [usersData, searchQuery]);

  const handleTabChange = (tab: "feed" | "projects" | "people") => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SEOMeta
        title="Discover | Print3D"
        description="Discover amazing 3D printing projects, connect with talented makers, and explore trending models."
      />
      <StructuredData type="WebPage" data={generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Discover", url: "/discover" }
      ])} />
      <MarketplaceStructuredData />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Discover</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Explore the Community
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 max-w-2xl mx-auto"
            >
              Discover amazing 3D printing projects, connect with talented makers, and find inspiration.
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search posts, models, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border-white/10 rounded-2xl text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => handleTabChange("feed")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "feed"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-105 ring-2 ring-white/50"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Feed
            </button>
            <button
              onClick={() => handleTabChange("projects")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "projects"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-105 ring-2 ring-white/50"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Projects
            </button>
            <button
              onClick={() => handleTabChange("people")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "people"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg scale-105 ring-2 ring-white/50"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              People
            </button>
          </div>

          {/* Content */}
          {activeTab === "feed" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <Card className="glass-card border-white/[0.08] rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <UserAvatarLink
                        userId={user?.id || 0}
                        avatarUrl={user?.avatarUrl}
                        displayName={user?.displayName || "Guest"}
                        size="md"
                      />
                      <div className="flex-1">
                        <Textarea
                          placeholder="Share your latest 3D printing creation..."
                          className="min-h-[80px] bg-zinc-900/50 border-white/10 rounded-xl text-white placeholder:text-zinc-500 resize-none focus:border-primary focus:ring-primary/20"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                              <Plus className="w-4 h-4 mr-1" />
                              Image
                            </Button>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                              <Tag className="w-4 h-4 mr-1" />
                              Tag
                            </Button>
                          </div>
                          <NeonButton size="sm">Post</NeonButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {SAMPLE_POSTS.map((post) => (
                    <Card key={post.id} className="glass-card border-white/[0.08] rounded-3xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <UserAvatarLink
                            userId={post.userId}
                            avatarUrl={post.user.avatarUrl}
                            displayName={post.user.displayName}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-white">{post.user.displayName}</p>
                            <p className="text-xs text-zinc-500">{post.createdAt}</p>
                          </div>
                        </div>
                        <p className="text-zinc-300 mb-4">{post.content}</p>
                        {post.imageUrl && (
                          <div className="rounded-2xl overflow-hidden mb-4">
                            <img src={post.imageUrl} alt="Post" className="w-full h-64 object-cover" />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags?.map((tag) => (
                            <span key={tag} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                          <button className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                          <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                            <Share className="w-5 h-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Featured Models */}
                <Card className="glass-card border-white/[0.08] rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Featured Models
                      </h2>
                      <Link href="/explore">
                        <button className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                          View All <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {isLoadingListings ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex items-center gap-3">
                              <div className="w-12 h-12 bg-zinc-800/50 rounded-lg" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
                                <div className="h-3 bg-zinc-800/50 rounded w-1/4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredListings.slice(0, 5).map((listing: any, idx: number) => (
                        <Link key={listing.id} href={`/listings/${listing.id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                              <img
                                src={listing.imageUrl || "/placeholder.svg"}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate">{listing.title}</p>
                              <p className="text-primary text-xs font-semibold">
                                ${typeof listing.basePrice === 'number' ? listing.basePrice.toFixed(2) : (listing.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Tags */}
                <Card className="glass-card border-white/[0.08] rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Trending Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_TAGS.map((tag) => (
                        <Button
                          key={tag}
                          variant="secondary"
                          size="sm"
                          className="rounded-full text-xs text-zinc-300 hover:bg-primary/20 hover:text-white"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Shops */}
                <Card className="glass-card border-white/[0.08] rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" />
                        Featured Shops
                      </h2>
                      <Link href="/explore?filter=shops">
                        <button className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                          View All <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {isLoadingUsers ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-zinc-800/50 rounded-xl" />
                            </div>
                          ))}
                        </div>
                      ) : usersData?.users?.filter((u: any) => u.role === "seller" || u.role === "both").slice(0, 5).map((seller: any, idx: number) => (
                        <Link key={seller.id} href={`/shops/${seller.id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <UserAvatarLink
                              userId={seller.id}
                              avatarUrl={seller.avatarUrl}
                              displayName={seller.displayName}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate">{seller.displayName}</p>
                              <p className="text-zinc-500 text-xs">{seller.shopName || "Shop"}</p>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-display font-bold text-white mb-4">Projects</h2>
                <p className="text-zinc-400">Browse amazing 3D printing projects from our community.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingListings ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-64 bg-zinc-800/50 rounded-2xl" />
                    </div>
                  ))
                ) : filteredListings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "people" && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-display font-bold text-white mb-4">People</h2>
                <p className="text-zinc-400">Connect with talented makers and creators.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingUsers ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-48 bg-zinc-800/50 rounded-2xl" />
                    </div>
                  ))
                ) : filteredUsers.map((user: any) => (
                  <Link key={user.id} href={`/shops/${user.id}`}>
                    <Card className="glass-card border-white/[0.08] rounded-3xl overflow-hidden hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <UserAvatarLink
                            userId={user.id}
                            avatarUrl={user.avatarUrl}
                            displayName={user.displayName}
                            size="lg"
                          />
                          <div>
                            <h3 className="font-semibold text-white">{user.displayName}</h3>
                            <p className="text-zinc-500 text-sm">{user.shopName || "Maker"}</p>
                            <Badge variant="secondary" className="mt-1">
                              {user.role || "user"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface Reaction {
  emoji: string;
  count: number;
  users: number[];
}

interface Post {
  id: number;
  userId: number;
  user: {
    displayName: string;
    avatarUrl?: string;
    sellerTags?: string[];
  };
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  reactions: Reaction[];
  userReaction?: string;
}

const defaultDiscoverPosts: Post[] = [];
const DISCOVER_POSTS_STORAGE_KEY = "discover-posts-v2";
const LEGACY_DISCOVER_POSTS_STORAGE_KEY = "discover-posts";

const isDemoDiscoverPost = (post: Post) => {
  const demoNames = new Set(["Nova Maker", "CircuitCraft"]);
  const unsplashUrl = /images\.unsplash\.com/;

  return (
    demoNames.has(post.user.displayName) ||
    unsplashUrl.test(post.user.avatarUrl || "") ||
    unsplashUrl.test(post.imageUrl || "") ||
    !post.content.trim()
  );
};

const trackEvent = (event: string, payload: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  if ((window as any).analytics?.track) {
    (window as any).analytics.track(event, payload);
  }

  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({ event, ...payload });
  } else {
    (window as any).dataLayer = [{ event, ...payload }];
  }

  console.debug("[analytics]", event, payload);
};

export default function Discover() {
  const canonicalUrl = "https://synthix.com/discover";
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://synthix.com" },
    { name: "Discover", url: canonicalUrl },
  ]);

  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window === "undefined") {
      return defaultDiscoverPosts;
    }

    const savedPosts = localStorage.getItem(DISCOVER_POSTS_STORAGE_KEY);
    if (savedPosts) {
      try {
        const parsed: Post[] = JSON.parse(savedPosts);
        return parsed.filter((post) => !isDemoDiscoverPost(post));
      } catch {
        localStorage.removeItem(DISCOVER_POSTS_STORAGE_KEY);
        return defaultDiscoverPosts;
      }
    }

    const legacyPosts = localStorage.getItem(LEGACY_DISCOVER_POSTS_STORAGE_KEY);
    if (legacyPosts) {
      try {
        const parsed: Post[] = JSON.parse(legacyPosts);
        const filtered = parsed.filter((post) => !isDemoDiscoverPost(post));
        localStorage.setItem(DISCOVER_POSTS_STORAGE_KEY, JSON.stringify(filtered));
        localStorage.removeItem(LEGACY_DISCOVER_POSTS_STORAGE_KEY);
        return filtered;
      } catch {
        localStorage.removeItem(LEGACY_DISCOVER_POSTS_STORAGE_KEY);
      }
    }

    return defaultDiscoverPosts;
  });
  const [newPost, setNewPost] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "projects" | "people" | "trending">("feed");
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  const emojis = [
    { emoji: "👍", name: "thumbs up", icon: ThumbsUp },
    { emoji: "❤️", name: "heart", icon: Heart },
    { emoji: "😂", name: "laugh", icon: Laugh },
    { emoji: "😡", name: "angry", icon: Angry },
    { emoji: "😮", name: "surprised", icon: Smile },
  ];

  // Load posts from localStorage
  // useEffect(() => {
  //   const savedPosts = localStorage.getItem('discover-posts');
  //   if (savedPosts) {
  //     setPosts(JSON.parse(savedPosts));
  //   }
  // }, []);

  const savePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    if (typeof window !== "undefined") {
      localStorage.setItem(DISCOVER_POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPosts = localStorage.getItem(DISCOVER_POSTS_STORAGE_KEY);
    if (savedPosts) {
      try {
        const parsed: Post[] = JSON.parse(savedPosts);
        const filteredPosts = parsed.filter((post) => !isDemoDiscoverPost(post));
        setPosts(filteredPosts);
        if (filteredPosts.length !== parsed.length) {
          localStorage.setItem(DISCOVER_POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
        }
      } catch {
        localStorage.removeItem(DISCOVER_POSTS_STORAGE_KEY);
        setPosts(defaultDiscoverPosts);
      }
    } else {
      // Clear any legacy demo posts
      const legacyPosts = localStorage.getItem(LEGACY_DISCOVER_POSTS_STORAGE_KEY);
      if (legacyPosts) {
        try {
          const parsed: Post[] = JSON.parse(legacyPosts);
          const filtered = parsed.filter((post) => !isDemoDiscoverPost(post));
          if (filtered.length > 0) {
            localStorage.setItem(DISCOVER_POSTS_STORAGE_KEY, JSON.stringify(filtered));
            setPosts(filtered);
          }
          localStorage.removeItem(LEGACY_DISCOVER_POSTS_STORAGE_KEY);
        } catch {
          localStorage.removeItem(LEGACY_DISCOVER_POSTS_STORAGE_KEY);
        }
      }
    }
    trackEvent("discover_page_view", { page: "discover" });
  }, []);

  const handleTabChange = (tab: "feed" | "projects" | "people" | "trending") => {
    setActiveTab(tab);
    trackEvent("discover_tab_change", { tab });
  };

  const handleLike = (postId: number) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    );
    savePosts(updatedPosts);
    trackEvent("discover_like", { postId });
  };

  const handleReaction = (postId: number, emoji: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id !== postId) return post;

      const userId = user?.id || 0;
      const reactionIndex = post.reactions.findIndex(r => r.emoji === emoji);
      let reactions = [...post.reactions];

      if (reactionIndex >= 0) {
        const existingReaction = reactions[reactionIndex];
        const userHasReacted = existingReaction.users.includes(userId);

        if (userHasReacted) {
          reactions = reactions
            .map((reaction, index) =>
              index === reactionIndex
                ? { ...reaction, users: reaction.users.filter(id => id !== userId), count: reaction.count - 1 }
                : reaction
            )
            .filter(reaction => reaction.count > 0);
        } else {
          reactions[reactionIndex] = {
            ...existingReaction,
            users: [...existingReaction.users, userId],
            count: existingReaction.count + 1,
          };
        }
      } else {
        reactions.push({ emoji, count: 1, users: [userId] });
      }

      const userReaction = reactions.find(reaction => reaction.users.includes(userId))?.emoji;
      return { ...post, reactions, userReaction };
    });

    savePosts(updatedPosts);
    setShowEmojiPicker(null);
    trackEvent("discover_reaction", { postId, emoji });
  };

  const handleComment = (postId: number) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: user?.id || 0,
      user: { displayName: user?.displayName || "You", avatarUrl: user?.avatarUrl ?? undefined },
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    );
    savePosts(updatedPosts);
    setNewComment("");
    setCommentingPostId(null);
    toast({ title: "Comment added!", description: "Your comment has been posted." });
    trackEvent("discover_comment", { postId });
  };

  const handleShare = (post: Post) => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/discover` : "/discover";
    const shareText = `Check out this post by ${post.user.displayName}: "${post.content.substring(0, 100)}..."`;
    const nav = typeof navigator !== "undefined" ? navigator : null;

    if (nav && "share" in nav) {
      nav.share({
        title: "Synthix Post",
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        if (nav && "clipboard" in nav) {
          (nav as any).clipboard.writeText(`${shareText} ${shareUrl}`);
          toast({ title: "Link copied!", description: "Post link copied to clipboard." });
        } else {
          toast({ title: "Share unavailable", description: "This browser does not support sharing." });
        }
      });
    } else if (nav && "clipboard" in nav) {
      (nav as any).clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link copied!", description: "Post link copied to clipboard." });
    } else {
      toast({ title: "Share unavailable", description: "This browser does not support sharing." });
    }

    trackEvent("discover_share", { postId: post.id });
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;

    try {
      setIsUploading(true);
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      // Upload image to Supabase if selected
      if (newImage && user?.id) {
        const fileName = `post-${Date.now()}-${newImage.name}`;
        const filePath = `discover/${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('discover-media')
          .upload(filePath, newImage, { cacheControl: '3600', upsert: false });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('discover-media')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrlData.publicUrl;
        } else {
          console.error('Image upload error:', uploadError);
        }
      }

      // Upload video to Supabase if selected
      if (newVideo && user?.id) {
        const fileName = `post-${Date.now()}-${newVideo.name}`;
        const filePath = `discover/${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('discover-media')
          .upload(filePath, newVideo, { cacheControl: '3600', upsert: false });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('discover-media')
            .getPublicUrl(uploadData.path);
          videoUrl = publicUrlData.publicUrl;
        } else {
          console.error('Video upload error:', uploadError);
        }
      }

      const post: Post = {
        id: Date.now(),
        userId: user?.id || 0,
        user: { displayName: user?.displayName || "You", avatarUrl: user?.avatarUrl ?? undefined },
        title: newPostTitle.trim() || undefined,
        content: newPost,
        imageUrl,
        videoUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        reactions: [],
      };

      const updatedPosts = [post, ...posts];
      savePosts(updatedPosts);

      // Clear states
      setNewPost("");
      setNewPostTitle("");
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setNewImage(null);
      setNewVideo(null);
      setImagePreview(null);
      setVideoPreview(null);

      toast({ title: "Post created!", description: "Your post has been shared." });
      trackEvent("discover_post", { postId: post.id });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image selection with preview
  const handleImageSelect = (file: File | null) => {
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setNewImage(null);
      setImagePreview(null);
    }
  };

  // Handle video selection with preview
  const handleVideoSelect = (file: File | null) => {
    if (file) {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setNewVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setNewVideo(null);
      setVideoPreview(null);
    }
  };

  // Remove selected media
  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setNewImage(null);
    setImagePreview(null);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setNewVideo(null);
    setVideoPreview(null);
  };

  // Fetch real users from Supabase with avatars
  const [usersData, setUsersData] = useState<{ users: any[] }>({ users: [] });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [listingsData, setListingsData] = useState<{ listings: any[] }>({ listings: [] });
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, role")
        .limit(50);

      if (error) {
        console.error("Error fetching users:", error);
        setIsLoadingUsers(false);
        return;
      }

      const users = profiles?.map((profile: any) => ({
        id: profile.id,
        displayName: profile.display_name || "User",
        avatarUrl: profile.avatar_url,
        role: profile.role,
        isVerified: profile.role === "seller" || profile.role === "both",
      })) || [];

      setUsersData({ users });
      setIsLoadingUsers(false);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoadingListings(true);
        const { data: listings, error } = await supabase
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("Error fetching listings:", error);
          setListingsData({ listings: [] });
          return;
        }

        // Transform snake_case to camelCase for consistency
        const transformedListings = (listings || []).map((listing: any) => ({
          ...listing,
          imageUrl: listing.image_url || listing.imageUrl || listing.images?.[0] || null,
          sellerId: listing.seller_id || listing.sellerId,
          sellerName: listing.seller_name || listing.sellerName,
          basePrice: listing.base_price || listing.basePrice || listing.price,
        }));

        setListingsData({ listings: transformedListings });
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setListingsData({ listings: [] });
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchListings();
  }, []);

  // Mock sponsored listings for Projects tab
  const sponsoredProjectIds = useMemo(() => {
    const ids = new Map<number, { tier: SponsorTier; level: number }>();
    if (listingsData?.listings) {
      // Premium sponsors
      if (listingsData.listings[0]) ids.set(listingsData.listings[0].id, { tier: "premium", level: 10 });
      if (listingsData.listings[2]) ids.set(listingsData.listings[2].id, { tier: "gold", level: 7 });
      // Silver sponsors
      if (listingsData.listings[4]) ids.set(listingsData.listings[4].id, { tier: "silver", level: 3 });
    }
    return ids;
  }, [listingsData?.listings]);

  const tierStyles = {
    premium: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-300",
    gold: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-300",
    silver: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <SEOMeta
        title="Discover Top Makers & 3D Printing Services | Synthix"
        description="Browse skilled makers offering 3D printing, laser cutting, and custom fabrication services. Find the perfect vendor for your project needs."
        canonical={canonicalUrl}
        type="website"
        keywords={["discover makers", "3D printing services", "laser cutting", "custom fabrication", "vendor marketplace"]}
      />
      <StructuredData schema={[breadcrumbSchema]} />
      <MarketplaceStructuredData />
      
      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Hero Banner with Featured Products */}
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/30 via-black to-cyan-900/30 p-8 md:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.15),transparent_50%)]" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-sm font-semibold text-primary uppercase tracking-[0.15em]">Discover</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
                      Explore Amazing Creations
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-xl">
                      Connect with talented makers, discover stunning 3D prints, and find the perfect creator for your next project.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleTabChange("feed")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "feed"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-105 ring-2 ring-white/50"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Feed
                </button>
                <button
                  onClick={() => handleTabChange("projects")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "projects"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-105 ring-2 ring-white/50"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => handleTabChange("people")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "people"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-105 ring-2 ring-white/50"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  People
                </button>
              </div>
            </div>

            {activeTab === "feed" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Create Post */}
                  <div className="glass-panel rounded-3xl border border-white/10 p-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 p-[2px] rounded-full bg-gradient-to-br from-primary to-accent">
                        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-white text-sm">
                              {user?.displayName?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <Input
                          placeholder="Post title (optional)"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          className="mb-3 bg-black/20 border-white/10"
                        />
                        <Textarea
                          placeholder="Share your latest project or idea..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[100px] bg-black/20 border-white/10"
                        />

                        {/* Image/Video Preview */}
                        {(imagePreview || videoPreview) && (
                          <div className="mt-4 space-y-3">
                            {imagePreview && (
                              <div className="relative inline-block">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-h-48 rounded-lg border border-white/10"
                                />
                                <button
                                  onClick={handleRemoveImage}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            {videoPreview && (
                              <div className="relative inline-block">
                                <video
                                  src={videoPreview}
                                  controls
                                  className="max-h-48 rounded-lg border border-white/10"
                                />
                                <button
                                  onClick={handleRemoveVideo}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                  title="Remove video"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-white text-sm">
                            {user?.displayName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <Input
                        placeholder="Post title (optional)"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="mb-3 bg-black/20 border-white/10"
                      />
                      <Textarea
                        placeholder="Share your latest project or idea..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px] bg-black/20 border-white/10"
                      />

                      {/* Image/Video Preview */}
                      {(imagePreview || videoPreview) && (
                        <div className="mt-4 space-y-3">
                          {imagePreview && (
                            <div className="relative inline-block">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-48 rounded-lg border border-white/10"
                              />
                              <button
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          {videoPreview && (
                            <div className="relative inline-block">
                              <video
                                src={videoPreview}
                                controls
                                className="max-h-48 rounded-lg border border-white/10"
                              />
                              <button
                                onClick={handleRemoveVideo}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                title="Remove video"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2 items-center">
                          {!imagePreview && (
                            <Button variant="outline" size="sm" asChild disabled={isUploading}>
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Image
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                                  disabled={isUploading}
                                />
                              </label>
                            </Button>
                          )}
                          {!videoPreview && (
                            <Button variant="outline" size="sm" asChild disabled={isUploading}>
                              <label htmlFor="video-upload" className="cursor-pointer">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Video
                                <input
                                  id="video-upload"
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => handleVideoSelect(e.target.files?.[0] || null)}
                                  disabled={isUploading}
                                />
                              </label>
                            </Button>
                          )}
                          {isUploading && (
                            <span className="text-sm text-primary animate-pulse">Uploading...</span>
                          )}
                        </div>
                        <NeonButton onClick={handlePost} disabled={!newPost.trim() || isUploading}>
                          {isUploading ? "Uploading..." : "Post"}
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel rounded-3xl border border-white/10 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <UserAvatarLink 
                            userId={post.user.userId} 
                            avatarUrl={post.user.avatarUrl} 
                            displayName={post.user.displayName}
                            size="md"
                          />
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <UserNameLink 
                                userId={post.userId} 
                                displayName={post.user.displayName}
                                className="font-bold text-white"
                              />
                              {post.user.sellerTags && post.user.sellerTags.length > 0 && (
                                <div className="flex gap-1">
                                  {post.user.sellerTags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs border-white/20 text-zinc-300">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <span className="text-sm text-zinc-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {post.title && (
                              <h4 className="text-lg font-semibold text-white mb-2">{post.title}</h4>
                            )}
                            <p className="text-zinc-300 mb-4">{post.content}</p>
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt="Post image"
                                className="rounded-xl w-full max-h-96 object-cover mb-4"
                              />
                            )}
                            {post.videoUrl && (
                              <video
                                src={post.videoUrl}
                                controls
                                className="rounded-xl w-full max-h-96 mb-4"
                              />
                            )}

                            {/* Reactions */}
                            {post.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.reactions.map((reaction) => (
                                  <Button
                                    key={reaction.emoji}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReaction(post.id, reaction.emoji)}
                                    className={`text-xs px-2 py-1 h-auto ${
                                      reaction.users.includes(user?.id || 0) ? "bg-primary/20 text-primary" : "text-zinc-400"
                                    }`}
                                  >
                                    {reaction.emoji} {reaction.count}
                                  </Button>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Popover open={showEmojiPicker === post.id} onOpenChange={(open) => setShowEmojiPicker(open ? post.id : null)}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-zinc-400 hover:text-primary"
                                    >
                                      <Smile className="w-4 h-4 mr-2" />
                                      React
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-2" align="start">
                                    <div className="flex gap-1">
                                      {emojis.map((emoji) => (
                                        <Button
                                          key={emoji.emoji}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleReaction(post.id, emoji.emoji)}
                                          className="p-2 hover:bg-primary/20"
                                        >
                                          {emoji.emoji}
                                        </Button>
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                                  className="text-zinc-400 hover:text-primary"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  {post.comments.length}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(post)}
                                  className="text-zinc-400 hover:text-primary"
                                >
                                  <Share className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                className="text-zinc-400 hover:text-red-400"
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                {post.likes}
                              </Button>
                            </div>

                            {/* Comments Section */}
                            <AnimatePresence>
                              {commentingPostId === post.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-white/10"
                                >
                                  <div className="space-y-3">
                                    {post.comments.map((comment) => (
                                      <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 p-[1px] rounded-full bg-gradient-to-br from-primary to-accent">
                                          <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                                            {comment.user.avatarUrl ? (
                                              <img src={comment.user.avatarUrl} alt={comment.user.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                              <span className="font-bold text-white text-xs">
                                                {comment.user.displayName.charAt(0).toUpperCase()}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                              <UserNameLink 
                                                userId={comment.userId} 
                                                displayName={comment.user.displayName}
                                                className="text-sm font-medium text-white"
                                              />
                                              <span className="text-xs text-zinc-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="text-sm text-zinc-300">{comment.content}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    <div className="flex gap-3">
                                      <div className="w-8 h-8 p-[1px] rounded-full bg-gradient-to-br from-primary to-accent">
                                        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                                          {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="font-bold text-white text-xs">
                                              {user?.displayName?.charAt(0).toUpperCase()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-1 flex gap-2">
                                        <Input
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          placeholder="Write a comment..."
                                          className="bg-black/20 border-white/10 text-white flex-1"
                                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                        />
                                        <Button
                                          onClick={() => handleComment(post.id)}
                                          disabled={!newComment.trim()}
                                          size="sm"
                                        >
                                          Post
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {posts.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                      <p className="text-zinc-400">Be the first to share something amazing!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "trending" && (
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">🔥 Trending on Synthix</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Top Sellers This Week</h3>
                        <p className="text-sm text-zinc-400">See who's dominating the marketplace</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Hot Categories</h3>
                        <p className="text-sm text-zinc-400">Miniatures and cosplay are trending</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💡</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">New Features</h3>
                        <p className="text-sm text-zinc-400">Discover the latest Synthix updates</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">📈 Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {["#3DPrinting", "#Miniatures", "#Cosplay", "#Prototyping", "#Custom", "#Art", "#Functional", "#Gaming"].map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/20 text-zinc-300 hover:bg-primary/20 hover:text-white hover:border-primary/50"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      placeholder="Search projects..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-black/20 border-white/10"
                    />
                  </div>
                </div>

                {isLoadingListings ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-xl bg-zinc-800/50 h-48" />
                    ))}
                  </div>
                ) : !listingsData?.listings?.length ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                    <p className="text-zinc-400">Try adjusting your search terms or check back later for new projects.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {listingsData.listings
                      .filter(listing => listing.title?.toLowerCase().includes(search.toLowerCase()) ||
                                         listing.description?.toLowerCase().includes(search.toLowerCase()))
                      .map((listing) => (
                        <ListingCard 
                          key={listing.id} 
                          listing={listing} 
                          isSponsored={!!sponsoredProjectIds.get(listing.id)}
                          sponsorTier={sponsoredProjectIds.get(listing.id)?.tier}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "people" && (
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      placeholder="Search people..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-black/20 border-white/10"
                    />
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="glass-panel rounded-3xl border border-white/10 p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                        <div className="flex gap-1 mb-4">
                          {[...Array(3)].map((_, j) => (
                            <Skeleton key={j} className="h-6 w-16" />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-9 flex-1" />
                          <Skeleton className="h-9 flex-1" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : usersError ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Failed to load makers</h3>
                    <p className="text-zinc-400">Please try refreshing the page.</p>
                  </div>
                ) : !usersData?.users?.filter((u: { role: string; }) => u.role === "seller" || u.role === "both")?.length ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No makers found</h3>
                    <p className="text-zinc-400">Check back later to discover talented makers in the community.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {usersData?.users
                      ?.filter((u: { role: string; }) => u.role === "seller" || u.role === "both")
                      ?.filter((u: { displayName: string; bio?: string; sellerTags?: string[]; }) => u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
                                  (u.bio?.toLowerCase().includes(search.toLowerCase()) || false) ||
                                  (u.sellerTags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) || false))
                      .map((person) => (
                        <motion.div
                          key={person.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-panel rounded-3xl border border-white/10 p-6 hover:border-primary/30 transition-colors group"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <UserAvatarLink 
                                userId={person.id} 
                                avatarUrl={person.avatarUrl} 
                                displayName={person.displayName}
                                size="lg"
                              />
                              {person.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <Star className="w-3 h-3 text-white fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/shop/${person.id}`}>
                                <h3 className="font-bold text-white truncate hover:text-primary transition-colors cursor-pointer">{person.displayName}</h3>
                              </Link>
                              <p className="text-zinc-400 text-sm truncate">{person.bio?.slice(0, 50) || "3D printing enthusiast"}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {person.rating !== undefined && person.rating !== null && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs text-zinc-500">{person.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {person.totalOrders && (
                                  <span className="text-xs text-zinc-500">{person.totalOrders} orders</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {person.sellerTags && person.sellerTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {person.sellerTags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs border-white/20 text-zinc-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 hover:bg-primary/20" asChild>
                              <a href={`/shop/${person.id}`}>View Shop</a>
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 hover:bg-primary/20" asChild>
                              <a href={`/messages?contact=${person.id}`}>Message</a>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>

          )}

          {activeTab === "projects" && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Featured Sellers */}
                <div className="glass-card border-white/[0.08] rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      Featured Shops
                    </h2>
                    <Link href="/explore?filter=shops">
                      <button className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {isLoadingUsers ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-zinc-800/50 rounded-xl" />
                          </div>
                        ))}
                      </div>
                    ) : !usersData?.users?.filter((u: any) => u.role === "seller" || u.role === "both")?.length ? (
                      <div className="text-center py-6">
                        <Store className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                        <p className="text-zinc-500 text-sm">No shops yet</p>
                      </div>
                    ) : (
                      usersData?.users
                        ?.filter((u: any) => u.role === "seller" || u.role === "both")
                        ?.slice(0, 5)
                        .map((seller: any, idx: number) => (
                          <Link key={seller.id} href={`/shops/${seller.id}`}>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={seller.avatar_url} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                  <Store className="w-5 h-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate group-hover:text-primary transition-colors">
                                  {seller.displayName || seller.username || "Unnamed Shop"}
                                </p>
                                <p className="text-zinc-500 text-xs truncate">
                                  {seller.sellerTags?.[0] || "3D Printing"}
                                </p>
                              </div>
                            </motion.div>
                          </Link>
                        ))
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href="/explore?filter=shops">
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:border-primary/30">
                        View All Shops
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Featured Models */}
                <div className="glass-card border-white/[0.08] rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Featured Models
                    </h2>
                    <Link href="/explore?filter=models">
                      <button className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                  {isLoadingListings ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                          <div className="w-12 h-12 bg-zinc-800/50 rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <div className="h-4 bg-zinc-800/50 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-zinc-800/50 rounded w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !listingsData?.listings?.length ? (
                    <div className="text-center py-6">
                      <Package className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                      <p className="text-zinc-500 text-sm">No models yet</p>
                      <p className="text-zinc-600 text-xs mt-1">Be the first to list a model!</p>
                    </div>
                  ) : (
                    listingsData.listings
                      .slice(0, 5)
                      .map((listing, idx) => (
                        <Link key={listing.id} href={`/listings/${listing.id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                              <img
                                src={listing.imageUrl || "/placeholder.svg"}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate group-hover:text-primary transition-colors">
                                {listing.title}
                              </p>
                              <p className="text-primary text-xs font-semibold">
                                ${typeof listing.basePrice === 'number' ? listing.basePrice.toFixed(2) : (listing.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      ))
                  )}
                  <div className="mt-4">
                    <Link href="/listings">
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:border-primary/30">
                        View All Models
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="glass-card border-white/[0.08] rounded-3xl p-6">
                  <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Trending Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {["#3DPrinting", "#Miniatures", "#Cosplay", "#Prototyping", "#Custom", "#Art"].map((tag) => (
                      <Button
                        key={tag}
                        variant="secondary"
                        size="sm"
                        className="rounded-full text-xs text-zinc-300 hover:bg-primary/20 hover:text-white"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-display font-bold text-white mb-4">Projects</h2>
              <p className="text-zinc-400">Browse amazing 3D printing projects from our community.</p>
            </div>
          </div>
        )}

        {activeTab === "people" && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-display font-bold text-white mb-4">People</h2>
              <p className="text-zinc-400">Connect with talented makers and creators.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </main>

  <Footer />
</div>
);
}

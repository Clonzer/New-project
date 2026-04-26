import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useListUsers, useListListings } from "@/lib/workspace-api-mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { SEOMeta, StructuredData, generateBreadcrumbSchema, MarketplaceStructuredData } from "@/components/seo";
import { Heart, MessageCircle, Share, User, Search, Plus, Star, Smile, ThumbsUp, Laugh, Angry, Loader2, ExternalLink, MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortByRanking, enhanceWithSponsorship, type SponsorTier } from "@/utils/sponsored-ranking";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const fallbackClasses = { sm: "text-xs", md: "", lg: "text-lg" };
  
  return (
    <Link href={`/shop/${userId}`}>
      <Avatar className={`${sizeClasses[size]} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}>
        <AvatarImage src={avatarUrl ?? undefined} />
        <AvatarFallback className={fallbackClasses[size]}>{displayName.charAt(0)}</AvatarFallback>
      </Avatar>
    </Link>
  );
}

function UserNameLink({ userId, displayName, className = "" }: { userId: number; displayName: string; className?: string }) {
  return (
    <Link href={`/shop/${userId}`}>
      <span className={`hover:text-primary transition-colors cursor-pointer ${className}`}>
        {displayName}
      </span>
    </Link>
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
  const [newComment, setNewComment] = useState("");
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
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      // Upload image if selected
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          imageUrl = result.url;
        }
      }

      // Upload video if selected
      if (newVideo) {
        const formData = new FormData();
        formData.append("file", newVideo);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          videoUrl = result.url;
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
      setNewPost("");
      setNewPostTitle("");
      setNewImage(null);
      setNewVideo(null);
      toast({ title: "Post created!", description: "Your post has been shared." });
      trackEvent("discover_post", { postId: post.id });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };

  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useListUsers({ limit: 50 });
  const { data: listingsData, isLoading: isLoadingListings, error: listingsError } = useListListings({ limit: 50 });

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">

              {/* Tabs */}
              <div className="flex gap-2 mb-8 bg-black/60 border border-white/10 p-2 rounded-2xl w-fit">
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
                  onClick={() => handleTabChange("trending")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === "trending"
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-105 ring-2 ring-white/50"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Trending
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
                  People
                </button>
              </div>

            {activeTab === "feed" && (
              <div className="space-y-6">
                {/* Create Post */}
                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
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
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Image
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                              />
                            </label>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor="video-upload" className="cursor-pointer">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Video
                              <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => setNewVideo(e.target.files?.[0] || null)}
                              />
                            </label>
                          </Button>
                          {newImage && <span className="text-sm text-green-400">Image selected</span>}
                          {newVideo && <span className="text-sm text-green-400">Video selected</span>}
                        </div>
                        <NeonButton onClick={handlePost} disabled={!newPost.trim()}>
                          Post
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
                            userId={post.userId} 
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
                                        <UserAvatarLink 
                                          userId={comment.userId} 
                                          avatarUrl={comment.user.avatarUrl} 
                                          displayName={comment.user.displayName}
                                          size="sm"
                                        />
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
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatarUrl ?? undefined} />
                                        <AvatarFallback className="text-xs">{user?.displayName?.charAt(0)}</AvatarFallback>
                                      </Avatar>
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
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/20 border-white/20 text-zinc-300">
                        {tag}
                      </Badge>
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
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                        <Skeleton className="w-full h-48" />
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : listingsError ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Failed to load projects</h3>
                    <p className="text-zinc-400">Please try refreshing the page.</p>
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
                      .map((listing) => {
                        const sponsorInfo = sponsoredProjectIds.get(listing.id);
                        return (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-panel rounded-3xl border border-white/10 p-6 hover:border-primary/30 transition-colors group"
                        >
                          <div className="relative mb-4">
                            {listing.imageUrl || listing.image_url ? (
                              <img
                                src={listing.imageUrl || listing.image_url}
                                alt={listing.title}
                                className="w-full h-48 object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 mx-auto mb-2 bg-white/5 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-zinc-500 text-sm">No image available</p>
                                </div>
                              </div>
                            )}
                            {sponsorInfo && (
                              <div className="absolute top-2 left-2">
                                <Badge className={cn("border font-semibold", tierStyles[sponsorInfo.tier || "silver"])}>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Sponsored
                                </Badge>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" className="bg-black/50 hover:bg-black/70">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-bold text-white mb-2 line-clamp-2">{listing.title}</h3>
                          <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{listing.description || ""}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-primary/20">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              View Details
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
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
                              <Link href={`/shop/${person.id}`}>
                                <Avatar className="w-16 h-16 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                                  <AvatarImage src={person.avatarUrl ?? undefined} />
                                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                                    {person.displayName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
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
            </div>

            {/* Right Column - Featured Models */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Featured Models
                  </h2>
                  <div className="space-y-4">
                    {listingsData?.listings?.slice(0, 5).map((listing) => (
                      <Link key={listing.id} href={`/listings/${listing.id}`}>
                        <div className="group cursor-pointer">
                          <div className="relative mb-2">
                            {listing.imageUrl || listing.image_url ? (
                              <img
                                src={listing.imageUrl || listing.image_url}
                                alt={listing.title}
                                className="w-full h-32 object-cover rounded-xl group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-1 bg-white/5 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
                          <p className="text-zinc-500 text-xs line-clamp-2">{listing.description || ""}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link href="/listings">
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                        View All Models
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Trending Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {["#3DPrinting", "#Miniatures", "#Cosplay", "#Prototyping", "#Custom", "#Art"].map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/20 border-white/20 text-zinc-300 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

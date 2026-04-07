import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useListUsers, useListListings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, User, Search, Plus, Star, Smile, ThumbsUp, Laugh, Angry } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  };
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  reactions: Reaction[];
  userReaction?: string;
}

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "projects" | "people" | "trending">("feed");
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  const emojis = [
    { emoji: "👍", name: "thumbs up", icon: ThumbsUp },
    { emoji: "❤️", name: "heart", icon: Heart },
    { emoji: "😂", name: "laugh", icon: Laugh },
    { emoji: "", name: "angry", icon: Angry },
    { emoji: "😮", name: "surprised", icon: Smile },
  ];

  // Load posts from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('discover-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  const savePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('discover-posts', JSON.stringify(updatedPosts));
  };

  const handleLike = (postId: number) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    );
    savePosts(updatedPosts);
  };

  const handleReaction = (postId: number, emoji: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const existingReaction = post.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(user?.id || 0)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(id => id !== (user?.id || 0));
            existingReaction.count--;
            if (existingReaction.count === 0) {
              post.reactions = post.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            // Add reaction
            existingReaction.users.push(user?.id || 0);
            existingReaction.count++;
          }
        } else {
          // New reaction
          post.reactions.push({
            emoji,
            count: 1,
            users: [user?.id || 0]
          });
        }
        post.userReaction = post.reactions.find(r => r.users.includes(user?.id || 0))?.emoji;
      }
      return post;
    });
    savePosts(updatedPosts);
    setShowEmojiPicker(null);
  };

  const handleComment = (postId: number) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: user?.id || 0,
      user: { displayName: user?.displayName || "You", avatarUrl: user?.avatarUrl },
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
  };

  const handleShare = (post: Post) => {
    const shareUrl = `${window.location.origin}/discover`;
    const shareText = `Check out this post by ${post.user.displayName}: "${post.content.substring(0, 100)}..."`;

    if (navigator.share) {
      navigator.share({
        title: 'Synthix Post',
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link copied!", description: "Post link copied to clipboard." });
    }
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now(),
      userId: user?.id || 0,
      user: { displayName: user?.displayName || "You", avatarUrl: user?.avatarUrl },
      content: newPost,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      reactions: [],
    };
    const updatedPosts = [post, ...posts];
    savePosts(updatedPosts);
    setNewPost("");
    toast({ title: "Post created!", description: "Your post has been shared." });
  };

  const { data: usersData } = useListUsers({ limit: 50 });
  const { data: listingsData } = useListListings({ limit: 50 });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-display font-bold text-white mb-8">Discover</h1>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-black/40 border border-white/5 p-1 rounded-xl w-fit">
              <Button
                variant={activeTab === "feed" ? "default" : "ghost"}
                onClick={() => setActiveTab("feed")}
                className="rounded-lg"
              >
                Feed
              </Button>
              <Button
                variant={activeTab === "trending" ? "default" : "ghost"}
                onClick={() => setActiveTab("trending")}
                className="rounded-lg"
              >
                Trending
              </Button>
              <Button
                variant={activeTab === "projects" ? "default" : "ghost"}
                onClick={() => setActiveTab("projects")}
                className="rounded-lg"
              >
                Projects
              </Button>
              <Button
                variant={activeTab === "people" ? "default" : "ghost"}
                onClick={() => setActiveTab("people")}
                className="rounded-lg"
              >
                People
              </Button>
            </div>

            {activeTab === "feed" && (
              <div className="space-y-6">
                {/* Create Post */}
                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <Textarea
                        placeholder="Share your latest project or idea..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px] bg-black/20 border-white/10"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Image
                          </Button>
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
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={post.user.avatarUrl} />
                            <AvatarFallback>{post.user.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-white">{post.user.displayName}</h3>
                              <span className="text-sm text-zinc-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-zinc-300 mb-4">{post.content}</p>
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt="Post image"
                                className="rounded-xl w-full max-h-96 object-cover mb-4"
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
                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-primary">
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
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={comment.user.avatarUrl} />
                                          <AvatarFallback className="text-xs">{comment.user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="bg-black/20 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm font-medium text-white">{comment.user.displayName}</span>
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
                                        <AvatarImage src={user?.avatarUrl} />
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {listingsData?.listings
                    .filter(listing => listing.title.toLowerCase().includes(search.toLowerCase()) ||
                                       listing.description?.toLowerCase().includes(search.toLowerCase()))
                    .map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel rounded-3xl border border-white/10 p-6 hover:border-primary/30 transition-colors"
                      >
                        <img
                          src={listing.imageUrls?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"}
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-xl mb-4"
                        />
                        <h3 className="font-bold text-white mb-2 line-clamp-2">{listing.title}</h3>
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{listing.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            ${listing.price}
                          </Badge>
                          <Button variant="outline" size="sm" className="hover:bg-primary/20">
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                </div>
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {usersData?.users
                    .filter(u => u.role === "seller" || u.role === "both")
                    .filter(u => u.displayName.toLowerCase().includes(search.toLowerCase()) ||
                                u.bio?.toLowerCase().includes(search.toLowerCase()) ||
                                u.sellerTags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
                    .map((person) => (
                      <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel rounded-3xl border border-white/10 p-6 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={person.avatarUrl} />
                            <AvatarFallback className="bg-primary/20 text-primary text-lg">
                              {person.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{person.displayName}</h3>
                            <p className="text-zinc-400 text-sm truncate">{person.bio?.slice(0, 50) || "3D printing enthusiast"}</p>
                            {person.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-zinc-500">{person.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {person.sellerTags && person.sellerTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {person.sellerTags.slice(0, 3).map((tag) => (
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
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
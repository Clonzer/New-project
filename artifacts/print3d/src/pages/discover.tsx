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
import { Heart, MessageCircle, Share, User, Search, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";

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
  comments: number;
  isLiked: boolean;
}

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "projects" | "people">("feed");

  // Mock data with localStorage persistence
  useEffect(() => {
    const savedPosts = localStorage.getItem('discover-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      const initialPosts = [
        {
          id: 1,
          userId: 1,
          user: { displayName: "Alice Maker", avatarUrl: "" },
          content: "Just finished this amazing custom miniatures set! Check it out in my shop.",
          imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
          createdAt: new Date().toISOString(),
          likes: 12,
          comments: 3,
          isLiked: false,
        },
        {
          id: 2,
          userId: 2,
          user: { displayName: "Bob Printer", avatarUrl: "" },
          content: "New project: 3D printed chess set with LED lights. Who's interested?",
          createdAt: new Date().toISOString(),
          likes: 8,
          comments: 1,
          isLiked: true,
        },
      ];
      setPosts(initialPosts);
      localStorage.setItem('discover-posts', JSON.stringify(initialPosts));
    }
  }, []);

  const handleLike = (postId: number) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.likes + (post.isLiked ? -1 : 1) }
        : post
    );
    setPosts(updatedPosts);
    localStorage.setItem('discover-posts', JSON.stringify(updatedPosts));
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
      comments: 0,
      isLiked: false,
    };
    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('discover-posts', JSON.stringify(updatedPosts));
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
                            <div className="flex items-center gap-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                className={post.isLiked ? "text-red-400" : "text-zinc-400"}
                              >
                                <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-zinc-400">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-zinc-400">
                                <Share className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
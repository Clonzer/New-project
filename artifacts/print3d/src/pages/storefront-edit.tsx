import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeonButton } from "@/components/ui/neon-button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/lib/workspace-stub";
import { getApiErrorMessage, getApiErrorMessageWithSupport } from "@/lib/api-error";
import {
  ArrowLeft,
  Store,
  Eye,
  Save,
  Image as ImageIcon,
  Palette,
  Tag,
  Globe,
  Instagram,
  Mail,
  CheckCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Camera,
  Upload,
  X
} from "lucide-react";
import { SHOP_TAG_OPTIONS } from "@/lib/shop-tags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Shop Preview Component
function ShopPreview({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      {/* Banner Preview */}
      <div 
        className="h-40 rounded-2xl bg-cover bg-center relative"
        style={{ 
          backgroundImage: form.bannerUrl 
            ? `url(${form.bannerUrl})` 
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-white">
            {form.shopName || "Your Shop Name"}
          </h2>
          <p className="text-zinc-300 text-sm">
            {form.location || "Location not set"}
          </p>
        </div>
      </div>

      {/* Profile & Info */}
      <div className="flex gap-4">
        <div 
          className="w-20 h-20 rounded-2xl bg-cover bg-center border-2 border-white/10 flex-shrink-0"
          style={{ 
            backgroundImage: form.avatarUrl 
              ? `url(${form.avatarUrl})` 
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
          }}
        >
          {!form.avatarUrl && (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">
            {form.displayName || "Your Name"}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-2">
            {form.bio || "Your shop bio will appear here..."}
          </p>
        </div>
      </div>

      {/* Tags */}
      {form.sellerTags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {form.sellerTags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Announcement */}
      {form.shopAnnouncement && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {form.shopAnnouncement}
          </p>
        </div>
      )}

      {/* Brand Story */}
      {form.brandStory && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="font-medium text-white mb-2">Our Story</h4>
          <p className="text-sm text-zinc-400">{form.brandStory}</p>
        </div>
      )}

      {/* Social Links */}
      <div className="flex gap-3">
        {form.websiteUrl && (
          <a 
            href={form.websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Globe className="w-5 h-5 text-zinc-400" />
          </a>
        )}
        {form.instagramHandle && (
          <a 
            href={`https://instagram.com/${form.instagramHandle}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Instagram className="w-5 h-5 text-zinc-400" />
          </a>
        )}
        {form.supportEmail && (
          <a 
            href={`mailto:${form.supportEmail}`}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Mail className="w-5 h-5 text-zinc-400" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function StorefrontEdit() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const updateUser = useUpdateUser();

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [customTag, setCustomTag] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const [form, setForm] = useState({
    shopName: "",
    displayName: "",
    bio: "",
    location: "",
    avatarUrl: "",
    bannerUrl: "",
    shopAnnouncement: "",
    brandStory: "",
    websiteUrl: "",
    instagramHandle: "",
    supportEmail: "",
    sellerTags: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setForm({
        shopName: user.shopName || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        avatarUrl: user.avatarUrl || "",
        bannerUrl: user.bannerUrl || "",
        shopAnnouncement: user.shopAnnouncement || "",
        brandStory: user.brandStory || "",
        websiteUrl: user.websiteUrl || "",
        instagramHandle: user.instagramHandle || "",
        supportEmail: user.supportEmail || "",
        sellerTags: user.sellerTags || [],
      });
    }
  }, [user]);

  const handleChange = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        handleChange("avatarUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
        handleChange("bannerUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    handleChange("avatarUrl", "");
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    handleChange("bannerUrl", "");
  };

  const addTag = (tag: string) => {
    if (tag && !form.sellerTags.includes(tag)) {
      handleChange("sellerTags", [...form.sellerTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleChange("sellerTags", form.sellerTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await updateUser.mutateAsync({
        userId: user.id,
        data: form,
      });
      await refreshUser();
      toast({
        title: "Storefront updated!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: getApiErrorMessageWithSupport(error, "saving your storefront"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const viewLiveShop = () => {
    if (user?.id) {
      setLocation(`/shop/${user.id}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">Please sign in to edit your storefront.</p>
            <Link href="/login">
              <NeonButton>Sign In</NeonButton>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                  <Store className="w-8 h-8 text-primary" />
                  Edit Storefront
                </h1>
                <p className="text-zinc-400">Customize your shop appearance and branding</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={viewLiveShop}
                className="rounded-full border-white/10 hover:bg-white/5"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live Shop
              </Button>
              <NeonButton 
                glowColor="primary" 
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </NeonButton>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl mb-6">
                  <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Palette className="w-4 h-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="tags" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Tag className="w-4 h-4 mr-2" />
                    Tags
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      Shop Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Shop Name</label>
                        <Input
                          value={form.shopName}
                          onChange={e => handleChange("shopName", e.target.value)}
                          placeholder="e.g., Maker's Paradise"
                          className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Display Name</label>
                        <Input
                          value={form.displayName}
                          onChange={e => handleChange("displayName", e.target.value)}
                          placeholder="Your name"
                          className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Bio</label>
                      <Textarea
                        value={form.bio}
                        onChange={e => handleChange("bio", e.target.value)}
                        placeholder="Tell customers about yourself and your work..."
                        rows={3}
                        className="bg-black/30 border-white/10 text-white rounded-xl resize-none"
                      />
                      <p className="text-xs text-zinc-500">
                        {form.bio.length}/500 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Location</label>
                      <Input
                        value={form.location}
                        onChange={e => handleChange("location", e.target.value)}
                        placeholder="e.g., London, UK"
                        className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Shop Announcement</label>
                      <Input
                        value={form.shopAnnouncement}
                        onChange={e => handleChange("shopAnnouncement", e.target.value)}
                        placeholder="e.g., Summer sale: 20% off all prints!"
                        className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                      />
                      <p className="text-xs text-zinc-500">
                        This appears as a highlighted banner on your shop page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Brand Story</label>
                      <Textarea
                        value={form.brandStory}
                        onChange={e => handleChange("brandStory", e.target.value)}
                        placeholder="Share your journey, values, and what makes your shop unique..."
                        rows={4}
                        className="bg-black/30 border-white/10 text-white rounded-xl resize-none"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-6 mt-0">
                  <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      Visual Branding
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Avatar</label>
                        <div className="space-y-3">
                          {avatarPreview || form.avatarUrl ? (
                            <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-white/10">
                              <img
                                src={avatarPreview || form.avatarUrl}
                                alt="Avatar preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-square max-w-[200px] mx-auto rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                              <span className="text-sm text-zinc-400">Upload avatar</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                          {!avatarPreview && !form.avatarUrl && (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                            />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">Square image recommended (400x400px)</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Banner</label>
                        <div className="space-y-3">
                          {bannerPreview || form.bannerUrl ? (
                            <div className="relative w-full aspect-[3/1] max-w-[300px] mx-auto rounded-2xl overflow-hidden border border-white/10">
                              <img
                                src={bannerPreview || form.bannerUrl}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveBanner}
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-[3/1] max-w-[300px] mx-auto rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                              <span className="text-sm text-zinc-400">Upload banner</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                          {!bannerPreview && !form.bannerUrl && (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerUpload}
                              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                            />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">Wide banner image (1200x400px)</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-200">
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        Tip: Use high-quality images that represent your brand. Your banner appears at the top of your shop page.
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Social & Contact
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Website URL</label>
                        <Input
                          value={form.websiteUrl}
                          onChange={e => handleChange("websiteUrl", e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Instagram Handle</label>
                        <Input
                          value={form.instagramHandle}
                          onChange={e => handleChange("instagramHandle", e.target.value)}
                          placeholder="yourhandle (without @)"
                          className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Support Email</label>
                        <Input
                          value={form.supportEmail}
                          onChange={e => handleChange("supportEmail", e.target.value)}
                          placeholder="support@yourshop.com"
                          className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tags" className="space-y-6 mt-0">
                  <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary" />
                      Shop Tags
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Tags help customers find your shop when browsing. Select up to 5 tags that best describe what you offer.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {SHOP_TAG_OPTIONS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => 
                            form.sellerTags.includes(tag) 
                              ? removeTag(tag) 
                              : form.sellerTags.length < 5 && addTag(tag)
                          }
                          disabled={!form.sellerTags.includes(tag) && form.sellerTags.length >= 5}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            form.sellerTags.includes(tag)
                              ? "bg-primary text-white"
                              : form.sellerTags.length >= 5
                              ? "bg-white/5 text-zinc-600 cursor-not-allowed"
                              : "bg-white/10 text-zinc-300 hover:bg-white/20"
                          }`}
                        >
                          {form.sellerTags.includes(tag) && (
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                          )}
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={customTag}
                        onChange={e => setCustomTag(e.target.value)}
                        placeholder="Add custom tag..."
                        className="bg-black/30 border-white/10 text-white h-11 rounded-xl flex-1"
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(customTag);
                            setCustomTag("");
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addTag(customTag);
                          setCustomTag("");
                        }}
                        disabled={!customTag || form.sellerTags.length >= 5}
                        className="rounded-xl"
                      >
                        Add
                      </Button>
                    </div>

                    <p className="text-xs text-zinc-500">
                      {form.sellerTags.length}/5 tags selected
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Live Preview</span>
                </div>
                <div className="glass-panel rounded-2xl border border-white/10 p-6">
                  <ShopPreview form={form} />
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  This is how your shop will appear to customers
                </p>

                {user?.id && (
                  <>
                    <div className="flex items-center gap-2 text-zinc-400 mb-2 mt-6">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Your Actual Shop Page</span>
                    </div>
                    <div className="glass-panel rounded-2xl border border-white/10 p-4">
                      <Link href={`/shop/${user.id}`} target="_blank">
                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/5">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Your Shop in New Tab
                        </Button>
                      </Link>
                      <p className="text-xs text-zinc-500 text-center mt-2">
                        View your live shop page as customers see it
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

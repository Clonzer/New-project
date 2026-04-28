import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  MapPin,
  Tag,
  Info,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { NeonButton } from "@/components/ui/neon-button";

const SHOP_TAGS = [
  "3D Printing", "Laser Cutting", "CNC Machining", "Woodworking",
  "Metalworking", "Resin Casting", "Mold Making", "Prototyping",
  "Jewelry Making", "Custom Fabrication", "Rapid Prototyping",
  "Product Design", "Engineering", "Architecture", "Art & Design"
];

interface StoreSetupWizardProps {
  onComplete?: () => void;
}

export function StoreSetupWizard({ onComplete }: StoreSetupWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form data
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [shopMode, setShopMode] = useState<"catalog" | "open" | "both">("both");
  
  // Check if user already has a seller record
  useEffect(() => {
    const checkExistingSeller = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          // Pre-fill existing data
          setStoreName(data.store_name || "");
          setStoreDescription(data.description || "");
          setLocation(data.location || "");
          setSelectedTags(data.seller_tags || []);
          setAvatarUrl(data.avatar_url || "");
          setBannerUrl(data.hero_image_url || "");
          setShopMode(data.shop_mode || "both");
        }
      } catch (err) {
        // No existing seller record, that's fine
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingSeller();
  }, [user?.id]);
  
  const totalSteps = 4;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to set up a store",
        variant: "destructive"
      });
      return;
    }
    
    if (!storeName.trim()) {
      toast({
        title: "Store name required",
        description: "Please enter a name for your store",
        variant: "destructive"
      });
      setStep(1);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create or update seller record
      const { error } = await supabase
        .from('sellers')
        .upsert({
          user_id: user.id,
          store_name: storeName.trim(),
          description: storeDescription.trim(),
          location: location.trim() || null,
          seller_tags: selectedTags,
          avatar_url: avatarUrl || null,
          hero_image_url: bannerUrl || null,
          shop_mode: shopMode,
          store_setup_complete: true,
          accepting_orders: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      // Update user's role to seller or both
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: "both",
          location: location.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) {
        console.error("Failed to update profile role:", profileError);
      }
      
      toast({
        title: "Store created successfully!",
        description: "Your store is now live on Synthix"
      });
      
      onComplete?.();
    } catch (error: any) {
      console.error("Failed to create store:", error);
      toast({
        title: "Failed to create store",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Name Your Store</h3>
              <p className="text-zinc-400">Choose a name that represents your brand</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Store Name *</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g., Jane's 3D Prints"
                  className="bg-black/30 border-white/10 text-white h-12 rounded-xl mt-2"
                />
              </div>
              
              <div>
                <Label className="text-zinc-300">Store Description</Label>
                <Textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Tell customers about your shop, your expertise, and what you offer..."
                  className="bg-black/30 border-white/10 text-white rounded-xl mt-2 min-h-[120px]"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  This will appear on your store page
                </p>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Where Are You Located?</h3>
              <p className="text-zinc-400">Help customers find local makers</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="bg-black/30 border-white/10 text-white h-12 rounded-xl mt-2"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  City and state/country (optional but recommended)
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-300">
                      Your location helps customers find makers in their area for faster shipping and local pickup options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">What Services Do You Offer?</h3>
              <p className="text-zinc-400">Select tags that describe your capabilities</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {SHOP_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-primary/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div>
              <Label className="text-zinc-300">Shop Mode</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { value: "catalog", label: "Catalog Only", desc: "Fixed products" },
                  { value: "open", label: "Custom Work", desc: "Quote requests" },
                  { value: "both", label: "Both", desc: "Products + Quotes" }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setShopMode(mode.value as any)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      shopMode === mode.value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="font-medium text-white">{mode.label}</p>
                    <p className="text-xs text-zinc-500">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Add Photos (Optional)</h3>
              <p className="text-zinc-400">Make your store stand out with images</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Store Avatar URL</Label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black/30 border-white/10 text-white h-12 rounded-xl mt-2"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Your logo or profile picture
                </p>
              </div>
              
              <div>
                <Label className="text-zinc-300">Banner Image URL</Label>
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black/30 border-white/10 text-white h-12 rounded-xl mt-2"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  A wide banner image for your store page (optional)
                </p>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-300">
                    <span className="font-medium text-white">Almost done!</span> Click "Launch Store" to make your store live on Synthix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-zinc-400 mt-4">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Set Up Your Store
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Complete these steps to start selling on Synthix
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i + 1 === step
                    ? 'bg-primary w-6'
                    : i + 1 < step
                    ? 'bg-primary/50'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {step < totalSteps ? (
          <NeonButton onClick={handleNext} glowColor="primary">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </NeonButton>
        ) : (
          <NeonButton 
            onClick={handleSubmit} 
            glowColor="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Launch Store
              </>
            )}
          </NeonButton>
        )}
      </div>
    </div>
  );
}

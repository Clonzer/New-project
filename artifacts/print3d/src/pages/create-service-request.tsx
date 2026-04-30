import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Upload, 
  DollarSign, 
  Package, 
  FileText, 
  CheckCircle2,
  Check,
  ArrowLeft,
  Loader2,
  Globe,
  ShoppingBag,
  X,
  Sparkles,
  Clock,
  MessageSquare,
  Users
} from "lucide-react";

const MATERIALS = [
  "PLA", "ABS", "PETG", "TPU", "Nylon", "Resin", 
  "PLA+", "ASA", "PC", "PVA", "HIPS", "Metal",
  "Wood", "Steel", "Aluminum", "Brass", "Copper",
  "Acrylic", "Carbon Fiber", "Other"
];

const COLORS = [
  "Any", "Black", "White", "Gray", "Red", "Blue", "Green", 
  "Yellow", "Orange", "Purple", "Pink", "Brown", "Clear/Transparent"
];

export default function CreateServiceRequest() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    material: "PLA",
    color: "Any",
    quantity: 1,
    proposedPrice: "",
    notes: "",
    fileUrl: "",
  });

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('custom-orders-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('custom-orders-tutorial-seen', 'true');
  };

  const tutorialSteps = [
    {
      icon: <Briefcase className="w-12 h-12 text-primary" />,
      title: "What are Custom Orders?",
      description: "Custom Orders let you request personalized 3D printing services from makers on Synthix. Describe what you need, and makers will compete with quotes to fulfill your request."
    },
    {
      icon: <Users className="w-12 h-12 text-accent" />,
      title: "How it Works",
      description: "1. Post your request with details and budget\n2. Makers submit quotes with pricing and timeline\n3. Review quotes and choose the best maker\n4. Pay securely and track your order"
    },
    {
      icon: <Clock className="w-12 h-12 text-emerald-400" />,
      title: "Timeline",
      description: "Most requests receive quotes within 24-48 hours. You can communicate with makers directly through our messaging system to clarify details before accepting a quote."
    },
    {
      icon: <Sparkles className="w-12 h-12 text-amber-400" />,
      title: "Tips for Success",
      description: "• Be specific about dimensions and materials\n• Include reference images if possible\n• Set a realistic budget range\n• Respond quickly to maker questions"
    }
  ];

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create marketplace request (seller_id is null for public requests)
      const { error } = await supabase.from('custom_order_requests').insert({
        buyer_id: user.id,
        seller_id: null, // null = marketplace request
        title: formData.title,
        description: formData.description,
        material: formData.material,
        color: formData.color,
        quantity: formData.quantity,
        proposed_price: parseFloat(formData.proposedPrice) || 0,
        notes: formData.notes,
        file_url: formData.fileUrl,
        status: 'pending'
      });

      if (error) throw error;

      toast({ 
        title: "Request posted!", 
        description: "Your service request is now live on the marketplace. Makers can now submit quotes." 
      });

      setLocation("/dashboard?tab=purchases");
    } catch (error) {
      console.error('Error posting request:', error);
      toast({ title: "Failed to post request", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
      return;
    }

    if (!user?.id) {
      toast({ title: "Authentication required", description: "Please sign in to upload files", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.id}/${fileName}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('custom-order-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        toast({ 
          title: "Upload failed", 
          description: error.message || "Please try again or contact support",
          variant: "destructive" 
        });
        return;
      }

      setFormData(prev => ({ ...prev, fileUrl: data.path }));
      toast({ title: "File uploaded successfully", description: file.name });
    } catch (err) {
      console.error("Upload exception:", err);
      toast({ 
        title: "Upload failed", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setLocation("/service-marketplace")}
                className="flex items-center gap-2 text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Quote Requests
              </button>
              
              <Link 
                href="/service-marketplace"
                className="flex items-center gap-2 text-zinc-400 hover:text-white ml-auto"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Marketplace
              </Link>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Post a Service Request</h1>
                <p className="text-zinc-400">Describe your project and get quotes from makers</p>
              </div>
            </div>
          </motion.div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    i < step ? 'bg-primary text-white' :
                    i === step ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25' :
                    'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}>
                    {i < step ? <Check className="w-5 h-5" /> : i}
                  </div>
                  <span className={`text-sm font-medium ${
                    i === step ? 'text-white' : 'text-zinc-500'
                  }`}>
                    {i === 1 ? 'Details' : i === 2 ? 'Budget' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={(step / 3) * 100} size="sm" />
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-2xl border border-white/10 p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Project Details
              </h2>
              
              <div>
                <label className="text-sm text-zinc-300 block mb-2">Project Title</label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Custom 3D Printed Robot Parts"
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300 block mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you need, dimensions, requirements, etc."
                  className="bg-black/30 border-white/10 text-white min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-300 block mb-2">Material</label>
                  <Select value={formData.material} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
                    <SelectTrigger className="w-full bg-black/30 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-2">Color</label>
                  <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger className="w-full bg-black/30 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-300 block mb-2">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="bg-black/30 border-white/10 text-white w-32"
                />
              </div>

              <div className="flex justify-end">
                <NeonButton 
                  onClick={() => setStep(2)}
                  disabled={!formData.title}
                  glowColor="primary"
                >
                  Continue <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </NeonButton>
              </div>
            </motion.div>
          )}

          {/* Step 2: Budget & Files */}
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-2xl border border-white/10 p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget & Files
              </h2>
              
              <div>
                <label className="text-sm text-zinc-300 block mb-2">Your Budget (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    type="number"
                    value={formData.proposedPrice}
                    onChange={e => setFormData(prev => ({ ...prev, proposedPrice: e.target.value }))}
                    placeholder="What you're willing to pay"
                    className="pl-10 bg-black/30 border-white/10 text-white"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">This helps makers understand your budget range</p>
              </div>

              <div>
                <label className="text-sm text-zinc-300 block mb-2">Additional Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Timeline, special requirements, shipping preferences, etc."
                  className="bg-black/30 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300 block mb-2">Upload Files (Optional)</label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading ? 'border-primary/50 bg-primary/5' : 'border-white/20 hover:border-primary/50'}`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
                      <p className="text-primary mb-2">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                      <p className="text-zinc-400 mb-2">Drag files here or click to upload</p>
                      <p className="text-xs text-zinc-500 mb-4">STL, OBJ, 3MF, or images (max 10MB)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    accept=".stl,.obj,.3mf,.png,.jpg,.jpeg,.pdf"
                    className="hidden" 
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="border-white/10" asChild disabled={uploading}>
                      <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    </Button>
                  </label>
                  {formData.fileUrl && !uploading && (
                    <p className="text-sm text-emerald-400 mt-3 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> File uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="border-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <NeonButton 
                  onClick={() => setStep(3)}
                  disabled={!formData.proposedPrice}
                  glowColor="primary"
                >
                  Review & Post <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </NeonButton>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-2xl border border-white/10 p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Review & Post
              </h2>
              
              <div className="space-y-4 bg-black/30 rounded-xl p-6">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-zinc-400">Project</span>
                  <span className="text-white font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-zinc-400">Material</span>
                  <span className="text-white">{formData.material} • {formData.color}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-zinc-400">Quantity</span>
                  <span className="text-white">{formData.quantity}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-zinc-400">Budget</span>
                  <span className="text-white font-semibold">${formData.proposedPrice}</span>
                </div>
                {formData.description && (
                  <div className="pt-2">
                    <span className="text-zinc-400 block mb-1">Description</span>
                    <p className="text-white text-sm">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Public Marketplace Listing</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">
                  Your request will be visible to all makers on the platform. They can submit quotes for your review.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="border-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <NeonButton 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  glowColor="accent"
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Post to Marketplace
                    </>
                  )}
                </NeonButton>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-3xl border border-white/10 p-8 max-w-lg w-full relative"
            >
              <button
                onClick={closeTutorial}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">Welcome to Custom Orders</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {tutorialSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        i === tutorialStep ? 'bg-primary' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <motion.div
                key={tutorialStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center mb-8"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {tutorialSteps[tutorialStep].icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {tutorialSteps[tutorialStep].title}
                </h3>
                <p className="text-zinc-400 whitespace-pre-line">
                  {tutorialSteps[tutorialStep].description}
                </p>
              </motion.div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                  disabled={tutorialStep === 0}
                  className="text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {tutorialStep < tutorialSteps.length - 1 ? (
                  <NeonButton
                    onClick={() => setTutorialStep(tutorialStep + 1)}
                    glowColor="primary"
                  >
                    Next
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </NeonButton>
                ) : (
                  <NeonButton
                    onClick={closeTutorial}
                    glowColor="accent"
                  >
                    Get Started
                    <Sparkles className="w-4 h-4 ml-2" />
                  </NeonButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
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
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Upload, 
  DollarSign, 
  Package, 
  FileText, 
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Globe,
  ShoppingBag
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('custom-order-files')
      .upload(fileName, file);

    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      return;
    }

    setFormData(prev => ({ ...prev, fileUrl: data.path }));
    toast({ title: "File uploaded" });
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
                onClick={() => setLocation("/dashboard")}
                className="flex items-center gap-2 text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
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
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-primary' : 'bg-white/10'}`} />
            ))}
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
                  <select
                    value={formData.material}
                    onChange={e => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                  >
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-2">Color</label>
                  <select
                    value={formData.color}
                    onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white"
                  >
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
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
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                  <p className="text-zinc-400 mb-2">Drag files here or click to upload</p>
                  <p className="text-xs text-zinc-500 mb-4">STL, OBJ, 3MF, or images</p>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    accept=".stl,.obj,.3mf,.png,.jpg,.jpeg,.pdf"
                    className="hidden" 
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="border-white/10" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  {formData.fileUrl && (
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
    </div>
  );
}

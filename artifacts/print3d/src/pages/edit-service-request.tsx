import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { ColorPicker } from "@/components/shared/ColorPicker";
import { Progress } from "@/components/ui/progress";
import { NeonButton } from "@/components/ui/neon-button";
import { 
  ArrowLeft, 
  FileText, 
  DollarSign, 
  Check, 
  Package,
  Loader2,
  AlertCircle,
  Trash2,
  Image,
  Box,
  FileIcon,
  CheckCircle2
} from "lucide-react";

const MATERIALS = ["PLA", "ABS", "PETG", "TPU", "Resin", "Nylon", "Carbon Fiber", "Other"];

export default function EditServiceRequest() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    material: "PLA",
    color: "#ffffff",
    quantity: 1,
    proposedPrice: "",
    notes: "",
    fileUrl: "",
    fileName: "",
    fileType: "",
    status: ""
  });

  // Load existing request data
  useEffect(() => {
    const loadRequest = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("custom_order_requests")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data.requester_id !== user?.id) {
          toast({
            title: "Unauthorized",
            description: "You can only edit your own service requests",
            variant: "destructive"
          });
          setLocation("/service-marketplace");
          return;
        }

        if (data.status !== "pending") {
          toast({
            title: "Cannot Edit",
            description: "This request cannot be edited because it already has quotes or has been processed",
            variant: "destructive"
          });
          setLocation("/dashboard");
          return;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          material: data.material || "PLA",
          color: data.color || "#ffffff",
          quantity: data.quantity || 1,
          proposedPrice: data.proposed_price?.toString() || "",
          notes: data.notes || "",
          fileUrl: data.file_url || "",
          fileName: data.file_name || "",
          fileType: data.file_type || "",
          status: data.status
        });

        if (data.file_url) {
          setFilePreview(data.file_url);
        }
      } catch (error) {
        console.error("Error loading request:", error);
        toast({
          title: "Error",
          description: "Failed to load service request",
          variant: "destructive"
        });
        setLocation("/service-marketplace");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadRequest();
    }
  }, [id, user, authLoading]);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('custom-order-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('custom-order-files')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        fileUrl: publicUrl,
        fileName: file.name,
        fileType: file.type
      }));

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully"
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (formData.fileUrl) {
      try {
        // Extract file path from URL
        const url = new URL(formData.fileUrl);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('custom-order-files') + 1).join('/');
        
        if (filePath) {
          await supabase.storage.from('custom-order-files').remove([filePath]);
        }
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }

    setFormData(prev => ({ ...prev, fileUrl: "", fileName: "", fileType: "" }));
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("custom_order_requests")
        .update({
          title: formData.title,
          description: formData.description,
          material: formData.material,
          color: formData.color,
          quantity: formData.quantity,
          proposed_price: parseFloat(formData.proposedPrice) || 0,
          notes: formData.notes,
          file_url: formData.fileUrl,
          file_name: formData.fileName,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("requester_id", user?.id);

      if (error) throw error;

      toast({
        title: "Request updated!",
        description: "Your service request has been updated successfully",
      });

      setLocation("/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update service request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service request? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    try {
      // Delete file if exists
      if (formData.fileUrl) {
        const url = new URL(formData.fileUrl);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('custom-order-files') + 1).join('/');
        
        if (filePath) {
          await supabase.storage.from('custom-order-files').remove([filePath]);
        }
      }

      // Delete request
      const { error } = await supabase
        .from("custom_order_requests")
        .delete()
        .eq("id", id)
        .eq("requester_id", user?.id);

      if (error) throw error;

      toast({
        title: "Request deleted",
        description: "Your service request has been deleted",
      });

      setLocation("/dashboard");
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Service Request</h1>
              <p className="text-zinc-400">Update your project details</p>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2].map(i => (
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
                  {i === 1 ? 'Details' : 'Review'}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(step / 2) * 100} size="sm" />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-2xl border border-white/10 p-8 space-y-6 max-w-2xl"
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
                <ColorPicker
                  value={formData.color}
                  onChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                />
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

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Request
              </Button>
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
            className="glass-panel rounded-2xl border border-white/10 p-8 space-y-6 max-w-2xl"
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
              
              {/* File Preview Card */}
              {formData.fileUrl && !uploading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden mb-4"
                >
                  <div className="flex">
                    {/* Preview/Image Section */}
                    <div className="w-32 h-32 bg-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="File preview"
                          className="w-full h-full object-cover"
                        />
                      ) : formData.fileType?.startsWith('image/') ? (
                        <Image className="w-10 h-10 text-zinc-500" />
                      ) : ['.stl', '.obj', '.3mf'].some(ext => formData.fileName?.toLowerCase().endsWith(ext)) ? (
                        <Box className="w-10 h-10 text-zinc-500" />
                      ) : (
                        <FileIcon className="w-10 h-10 text-zinc-500" />
                      )}
                    </div>
                    
                    {/* File Info Section */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-white font-medium truncate">{formData.fileName}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {formData.fileType?.startsWith('image/') ? 'Image' : 
                           ['.stl', '.obj', '.3mf'].some(ext => formData.fileName?.toLowerCase().endsWith(ext)) ? '3D Model' : 
                           'Document'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={handleRemoveFile}
                      className="p-4 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* File Upload Input */}
              {!formData.fileUrl && (
                <div className="flex items-center justify-center w-full">
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploading 
                      ? 'border-zinc-700 bg-zinc-900/50' 
                      : 'border-zinc-700 hover:border-primary/50 hover:bg-zinc-900/50'
                  }`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                      ) : (
                        <Package className="w-8 h-8 text-zinc-500 mb-2" />
                      )}
                      <p className="text-sm text-zinc-400">
                        {uploading ? 'Uploading...' : 'Click to upload STL, images, or documents'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Max file size: 50MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".stl,.obj,.3mf,image/*,.pdf,.doc,.docx"
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Title:</span>
                  <span className="text-white">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Material:</span>
                  <span className="text-white">{formData.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Quantity:</span>
                  <span className="text-white">{formData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Budget:</span>
                  <span className="text-white">${formData.proposedPrice || '0'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <NeonButton 
                onClick={handleSave}
                disabled={saving}
                glowColor="primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </NeonButton>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}

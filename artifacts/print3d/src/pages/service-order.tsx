import { useEffect, useRef, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Box, Upload, ArrowLeft, FileText, DollarSign, MapPin } from "lucide-react";

const SERVICE_CATEGORIES = [
  "Woodworking",
  "Steel Work",
  "Metalworking",
  "CNC Services",
  "Welding",
  "Fabrication",
  "Custom Design",
  "3D Modeling",
  "CAD Design",
  "Laser Cutting",
  "Waterjet Cutting",
  "Powder Coating",
  "Finishing",
  "Assembly",
  "Prototyping",
  "Consulting",
  "Other"
];

const MATERIALS = [
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "Wood",
  "Metal",
  "Steel",
  "Aluminum",
  "Acrylic",
  "Resin",
  "Carbon Fiber",
  "Other"
];

const serviceOrderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide more details about your request"),
  serviceCategory: z.string().min(1, "Service category required"),
  material: z.string().min(1, "Material preference required"),
  quantity: z.coerce.number().min(1).max(100),
  shippingAddress: z.string().min(10, "Please provide a complete shipping address"),
  proposedPrice: z.coerce.number().min(1, "Please propose a budget"),
});

type ServiceOrderFormValues = z.infer<typeof serviceOrderSchema>;

export default function ServiceOrder() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const sellerId = searchParams.get("sellerId");

  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      serviceCategory: "",
      material: "",
      quantity: 1,
      shippingAddress: "",
      proposedPrice: 50,
    },
  });

  useEffect(() => {
    if (sellerId) {
      fetchSellerInfo();
    }
  }, [sellerId]);

  const fetchSellerInfo = async () => {
    if (!sellerId) return;
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (error) throw error;
      setSelectedSeller(data);
    } catch (error) {
      console.error('Error fetching seller info:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ServiceOrderFormValues) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a service request.",
        variant: "destructive",
      });
      return;
    }

    if (!sellerId) {
      toast({
        title: "Seller required",
        description: "Please select a seller to request services from.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload file if provided
      let fileUrl = null;
      if (fileDataUrl) {
        const fileName = `${Date.now()}-${uploadedFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('custom-order-files')
          .upload(fileName, fileDataUrl as any);

        if (uploadError) throw uploadError;
        fileUrl = uploadData.path;
      }

      // Create custom order request
      const { error: insertError } = await supabase
        .from('custom_order_requests')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          title: data.title,
          notes: data.description,
          material: data.material,
          color: "Custom",
          quantity: data.quantity,
          file_url: fileUrl,
          shipping_address: data.shippingAddress,
          proposed_price: data.proposedPrice,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Create notification for seller
      await supabase
        .from('notifications')
        .insert({
          user_id: sellerId,
          type: 'custom_order_request',
          title: 'New custom order request',
          body: `${user.displayName || 'A buyer'} has requested a custom service: "${data.title}"`,
          url: `/dashboard?tab=services`,
          is_read: false,
          created_at: new Date().toISOString(),
        });

      toast({
        title: "Request submitted",
        description: "Your service request has been sent to the seller.",
      });

      setLocation("/dashboard?tab=purchases");
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast({
        title: "Submission failed",
        description: "Could not submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation(-1)}
              className="text-zinc-400 hover:text-white hover:bg-white/5 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">Request Custom Service</h1>
            <p className="text-zinc-400">
              {selectedSeller
                ? `Request custom services from ${selectedSeller.store_name || selectedSeller.display_name || 'seller'}`
                : "Describe your custom service request and get quotes from sellers"}
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Project Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Custom CNC machined aluminum bracket"
                          className="bg-black/30 border-white/10 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Service Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/30 border-white/10 text-white">
                            <SelectValue placeholder="Select a service category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          {SERVICE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-white">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project in detail, including dimensions, specifications, and any special requirements..."
                          className="bg-black/30 border-white/10 text-white min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Material</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/30 border-white/10 text-white">
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-white/10">
                            {MATERIALS.map((mat) => (
                              <SelectItem key={mat} value={mat} className="text-white">
                                {mat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            className="bg-black/30 border-white/10 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Shipping Address
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your complete shipping address..."
                          className="bg-black/30 border-white/10 text-white min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Proposed Budget ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="Your proposed budget"
                          className="bg-black/30 border-white/10 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel className="text-white mb-2 block">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Attach Files (Optional)
                  </FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".stl,.obj,.step,.iges,.dwg,.dxf,.pdf,.jpg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-white/10 text-zinc-300 hover:bg-white/5"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {uploadedFileName || "Upload design files, specs, or reference images"}
                  </Button>
                </div>

                <div className="pt-4">
                  <NeonButton
                    glowColor="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Service Request"}
                  </NeonButton>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}

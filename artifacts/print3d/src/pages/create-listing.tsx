import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  Plus,
  Minus,
  AlertCircle,
  Info
} from "lucide-react";
import { useCreateListing } from "@/lib/workspace-api-mock";
import { useListEquipment, useListEquipmentGroups, useListShippingProfiles } from "@/lib/workspace-stub";
import type { Equipment, EquipmentGroup } from "@/lib/workspace-api-mock";
import { useAuth } from "@/hooks/use-auth";

const PRODUCT_TYPES = [
  { value: "3d_printing", label: "3D Printing", description: "Physical 3D printed objects" },
  { value: "woodworking", label: "Woodworking", description: "Wood-crafted items" },
  { value: "cnc", label: "CNC Machining", description: "Computer numerical control machining" },
  { value: "laser", label: "Laser Cutting", description: "Laser cut designs" },
  { value: "digital", label: "Digital Files", description: "Digital designs and files" },
  { value: "other", label: "Other", description: "Custom product type" },
];

const STOCK_TYPES = [
  { value: "inventory", label: "Inventory", description: "Pre-made items in stock" },
  { value: "print_on_demand", label: "Print on Demand", description: "Made when ordered" },
  { value: "digital", label: "Digital Download", description: "Instant digital delivery" },
];

const CATEGORIES = [
  "Mechanical", "Miniatures", "Cosplay", "Functional", "Art", "Jewelry", "Architecture",
  "Tools", "Home & Garden", "Toys & Games", "Wearables", "Prototypes", "Education",
  "Home Decor", "Gadgets", "Automotive", "Electronics", "Fashion", "Gaming",
  "Replacement Parts", "Figures", "Models", "Props", "Signage", "Fixtures", "Custom", "Other"
];

const SERVICE_CATEGORIES = [
  "Woodworking", "Steel Work", "Metalworking", "CNC Services", "Welding", "Fabrication",
  "Custom Design", "3D Modeling", "CAD Design", "Laser Cutting", "Waterjet Cutting",
  "Powder Coating", "Finishing", "Assembly", "Prototyping", "Consulting", "Other"
];

const TAGS = [
  "3D Printable", "Articulated", "Flexible", "Painted", "Unpainted", "Assembled", "Kit", "Customizable",
  "Large Format", "Small Scale", "Detailed", "Simple", "Complex", "Rugged", "Delicate", "Waterproof",
  "Heat Resistant", "Food Safe", "Biodegradable", "Recycled", "Premium", "Budget", "Quick Ship",
  "Made to Order", "Ready to Ship", "Limited Edition", "Exclusive", "Best Seller", "New",
  "On Sale", "Gift", "Collectible", "Display", "Functional", "Decorative", "Educational",
  "Gaming", "Cosplay", "Prop", "Replacement", "Upgrade", "Accessory", "Part", "Assembly",
  "Tool", "Holder", "Stand", "Mount", "Bracket", "Case", "Cover", "Protector", "Adapter",
  "Connector", "Joint", "Hinge", "Latch", "Clip", "Clamp", "Fastener", "Screw", "Nut", "Bolt"
];

interface UploadedFile {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

interface ListingFormData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  productType: string;
  customCategory: string;
  customProductType: string;
  tags: string[];

  // Product Details
  material: string;
  color: string;
  basePrice: string;
  shippingProfileId: string;
  estimatedDaysMin: string;
  estimatedDaysMax: string;

  // Stock & Production
  stockType: string;
  isPrintOnDemand: boolean;
  isDigitalProduct: boolean;

  // Equipment
  equipmentUsed: number[];
  equipmentGroups: number[];

  // Digital Files
  digitalFiles: UploadedFile[];

  // Images
  imageUrl: string;
}

const initialFormData: ListingFormData = {
  title: "",
  description: "",
  category: "",
  productType: "3d_printing",
  customCategory: "",
  customProductType: "",
  tags: [],
  material: "",
  color: "",
  basePrice: "",
  shippingProfileId: "",
  estimatedDaysMin: "",
  estimatedDaysMax: "",
  stockType: "inventory",
  isPrintOnDemand: false,
  isDigitalProduct: false,
  equipmentUsed: [],
  equipmentGroups: [],
  digitalFiles: [] as UploadedFile[],
  mediaFiles: [] as { type: 'image' | 'video'; url: string; file?: File }[],
};

export default function CreateListing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const createListingMutation = useCreateListing();

  // Equipment data
  const { data: equipmentData, isLoading: loadingEquipment } = useListEquipment();
  const { data: equipmentGroupsData, isLoading: loadingEquipmentGroups } = useListEquipmentGroups();
  const { data: shippingProfilesData, isLoading: loadingShippingProfiles } = useListShippingProfiles();

  const availableEquipment = Array.isArray(equipmentData) ? equipmentData : [];
  const availableEquipmentGroups = Array.isArray(equipmentGroupsData) ? equipmentGroupsData : [];
  const availableShippingProfiles = Array.isArray(shippingProfilesData) ? shippingProfilesData : [];

  const totalSteps = 5;

  const STEPS = [
    { id: 1, title: "Product Details", description: "Basic information about your listing" },
    { id: 2, title: "Pricing", description: "Set your price and material options" },
    { id: 3, title: "Shipping & Production", description: "Shipping costs and production time" },
    { id: 4, title: "Equipment", description: "Select equipment used for this listing" },
    { id: 5, title: "Images", description: "Upload product images" },
  ];

  const updateFormData = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData("tags", formData.tags.filter(tag => tag !== tagToRemove));
  };

  const toggleEquipment = (equipmentId: string | number) => {
    const currentEquipment = formData.equipmentUsed;
    const isSelected = currentEquipment.includes(equipmentId as any);

    if (isSelected) {
      updateFormData("equipmentUsed", currentEquipment.filter(id => id !== equipmentId));
    } else {
      updateFormData("equipmentUsed", [...currentEquipment, equipmentId]);
    }
  };

  const toggleEquipmentGroup = (groupId: string | number) => {
    const currentGroups = formData.equipmentGroups;
    const isSelected = currentGroups.includes(groupId as any);

    if (isSelected) {
      updateFormData("equipmentGroups", currentGroups.filter(id => id !== groupId));
    } else {
      updateFormData("equipmentGroups", [...currentGroups, groupId]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (formData.tags.length === 0) newErrors.tags = "At least one tag is required";
        break;
      case 2:
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
          newErrors.basePrice = "Valid price is required";
        }
        break;
      case 3:
        if (!formData.estimatedDaysMin || parseInt(formData.estimatedDaysMin) < 1) {
          newErrors.estimatedDaysMin = "Minimum days is required";
        }
        if (!formData.estimatedDaysMax || parseInt(formData.estimatedDaysMax) < 1) {
          newErrors.estimatedDaysMax = "Maximum days is required";
        }
        if (formData.estimatedDaysMin && formData.estimatedDaysMax && parseInt(formData.estimatedDaysMax) < parseInt(formData.estimatedDaysMin)) {
          newErrors.estimatedDaysMax = "Maximum days must be greater than minimum";
        }
        break;
      case 4:
        // Equipment validation - optional
        break;
      case 5:
        if (formData.mediaFiles.length === 0) newErrors.mediaFiles = "At least one image or video is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formDataUpload,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        uploadedFiles.push(result);

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      updateFormData("digitalFiles", [...formData.digitalFiles, ...uploadedFiles]);
    } catch (error) {
      console.error("File upload error:", error);
      // TODO: Show error toast
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formDataUpload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      updateFormData("imageUrl", result.url);
    } catch (error) {
      console.error("Image upload error:", error);
      // TODO: Show error toast
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeDigitalFile = (index: number) => {
    const newFiles = formData.digitalFiles.filter((_, i) => i !== index);
    updateFormData("digitalFiles", newFiles);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !user) return;

    try {
      await createListingMutation.mutateAsync({
        data: {
          sellerId: user.id,
          title: formData.title,
          description: formData.description,
          basePrice: parseFloat(formData.basePrice),
          shippingCost: formData.shippingProfileId ? 0 : null,
          estimatedDaysMin: parseInt(formData.estimatedDaysMin),
          estimatedDaysMax: parseInt(formData.estimatedDaysMax),
          material: formData.material,
          category: formData.category,
          tags: formData.tags,
          stock: formData.stockType === 'inventory' ? 10 : null,
          images: formData.mediaFiles.map(m => m.url),
          listingType: formData.productType,
          serviceCategory: formData.isDigitalProduct ? formData.category : null,
          equipmentUsed: formData.equipmentUsed,
          equipmentGroups: formData.equipmentGroups,
        }
      });
      navigate("/dashboard?tab=listings");
    } catch (error) {
      console.error("Failed to create listing:", error);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i + 1 <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            {i + 1 <= currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-colors ${
                i + 1 < currentStep ? "bg-primary" : "bg-zinc-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
              <div>
                <Label htmlFor="title" className="text-white flex items-center gap-2">
                  Title <span className="text-red-400">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border border-zinc-600">
                      <p className="text-sm">A clear, descriptive title helps buyers find your listing</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Enter a compelling title for your listing"
                  className="mt-1 bg-zinc-800 border-zinc-700"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-white flex items-center gap-2">
                  Description <span className="text-red-400">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border border-zinc-600">
                      <p className="text-sm">Detailed description of your product including features, dimensions, and materials</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category" className="text-white flex items-center gap-2">
                  Category <span className="text-red-400">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border border-zinc-600">
                      <p className="text-sm">Select the category that best describes your product</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60 overflow-y-auto">
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.category === "Other" && (
                  <Input
                    value={formData.customCategory}
                    onChange={(e) => updateFormData("customCategory", e.target.value)}
                    placeholder="Enter custom category"
                    className="mt-2 bg-zinc-800 border-zinc-700"
                  />
                )}
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="productType" className="text-white flex items-center gap-2">
                  Product Type <span className="text-red-400">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border border-zinc-600">
                      <p className="text-sm">The type of product you are listing</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={formData.productType} onValueChange={(value) => updateFormData("productType", value)}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60 overflow-y-auto">
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-zinc-400">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.productType === "other" && (
                  <Input
                    value={formData.customProductType}
                    onChange={(e) => updateFormData("customProductType", e.target.value)}
                    placeholder="Enter custom product type"
                    className="mt-2 bg-zinc-800 border-zinc-700"
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="text-white flex items-center gap-2">
                Tags <span className="text-red-400">*</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-800 border border-zinc-600">
                    <p className="text-sm">Add relevant tags to help buyers discover your listing</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-zinc-400">(Press Enter to add)</span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tags..."
                  className="flex-1 bg-zinc-800 border-zinc-700"
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-400"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="basePrice" className="text-white flex items-center gap-2">
                    Base Price ($) <span className="text-red-400">*</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border border-zinc-600">
                        <p className="text-sm">The base price for your product before any shipping or additional fees</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => updateFormData("basePrice", e.target.value)}
                    placeholder="0.00"
                    className="mt-1 bg-zinc-800 border-zinc-700"
                  />
                  {errors.basePrice && <p className="text-red-400 text-sm mt-1">{errors.basePrice}</p>}
                </div>

                <div>
                  <Label htmlFor="material" className="text-white flex items-center gap-2">
                    Material <span className="text-xs text-zinc-400">(optional)</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border border-zinc-600">
                        <p className="text-sm">Primary material used for this product (e.g., PLA, ABS, Wood)</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => updateFormData("material", e.target.value)}
                    placeholder="PLA, ABS, Wood, etc."
                    className="mt-1 bg-zinc-800 border-zinc-700"
                  />
                </div>

                <div>
                  <Label htmlFor="color" className="text-white flex items-center gap-2">
                    Color <span className="text-xs text-zinc-400">(optional)</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border border-zinc-600">
                        <p className="text-sm">Primary color or finish of the product</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateFormData("color", e.target.value)}
                    placeholder="Black, White, Natural, etc."
                    className="mt-1 bg-zinc-800 border-zinc-700"
                  />
                </div>

              <div>
                <Label htmlFor="stockType" className="text-white flex items-center gap-2">
                  Stock Type <span className="text-red-400">*</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border border-zinc-600">
                      <p className="text-sm">How this product is fulfilled - from inventory, made to order, or digital download</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={formData.stockType} onValueChange={(value) => updateFormData("stockType", value)}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select stock type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60 overflow-y-auto">
                    {STOCK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-zinc-400">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white flex items-center gap-2">
                    Shipping Profile <span className="text-xs text-zinc-400">(optional)</span>
                  </Label>
                  <p className="text-xs text-zinc-400 mt-1 mb-3">Select a shipping profile to apply predefined shipping rates and regions</p>
                  {loadingShippingProfiles ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-zinc-700/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : availableShippingProfiles.length > 0 ? (
                    <div className="space-y-2">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.shippingProfileId === ""
                            ? "bg-primary/30 border-primary ring-2 ring-primary/50"
                            : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                        }`}
                        onClick={() => updateFormData("shippingProfileId", "")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {formData.shippingProfileId === "" && <Check className="w-5 h-5 text-primary" />}
                            <span className={`text-white ${formData.shippingProfileId === "" ? "font-semibold" : ""}`}>No shipping profile</span>
                          </div>
                          {formData.shippingProfileId === "" && <div className="text-xs text-primary font-medium">Selected</div>}
                        </div>
                      </div>
                      {availableShippingProfiles.map((profile: any) => (
                        <div
                          key={profile.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.shippingProfileId === profile.id
                              ? "bg-primary/30 border-primary ring-2 ring-primary/50"
                              : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                          }`}
                          onClick={() => updateFormData("shippingProfileId", profile.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {formData.shippingProfileId === profile.id && <Check className="w-5 h-5 text-primary" />}
                              <div>
                                <span className={`text-white ${formData.shippingProfileId === profile.id ? "font-semibold" : ""}`}>{profile.name}</span>
                                <div className="text-xs text-zinc-400 mt-1">
                                  Domestic: ${profile.domesticCost} | International: ${profile.internationalCost}
                                </div>
                              </div>
                            </div>
                            {formData.shippingProfileId === profile.id && <div className="text-xs text-primary font-medium">Selected</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-sm">No shipping profiles configured. Configure shipping profiles in the Shipping Profiles tab.</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">Configure shipping profiles in the Shipping Profiles tab</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="estimatedDaysMin" className="text-white flex items-center gap-2">
                      Min Production Days <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="estimatedDaysMin"
                      type="number"
                      min="1"
                      value={formData.estimatedDaysMin}
                      onChange={(e) => updateFormData("estimatedDaysMin", e.target.value)}
                      placeholder="1"
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                    {errors.estimatedDaysMin && <p className="text-red-400 text-sm mt-1">{errors.estimatedDaysMin}</p>}
                  </div>

                  <div>
                    <Label htmlFor="estimatedDaysMax" className="text-white flex items-center gap-2">
                      Max Production Days <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="estimatedDaysMax"
                      type="number"
                      min="1"
                      value={formData.estimatedDaysMax}
                      onChange={(e) => updateFormData("estimatedDaysMax", e.target.value)}
                      placeholder="3"
                      className="mt-1 bg-zinc-800 border-zinc-700"
                    />
                    {errors.estimatedDaysMax && <p className="text-red-400 text-sm mt-1">{errors.estimatedDaysMax}</p>}
                  </div>
                </div>
              </div>
            </div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Info className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Equipment Information</h3>
              <p className="text-zinc-400">
                Specify which equipment was used to create this product.
                This helps buyers understand your capabilities and process.
              </p>
            </div>

            {/* Equipment Groups */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Equipment Groups</CardTitle>
                <CardDescription>
                  Select equipment groups that were involved in production
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEquipmentGroups ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-zinc-700/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : availableEquipmentGroups.length > 0 ? (
                  <div className="space-y-2">
                    {availableEquipmentGroups.map((group: EquipmentGroup) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={formData.equipmentGroups.includes(group.id as any)}
                          onCheckedChange={() => toggleEquipmentGroup(group.id as any)}
                          className="border-zinc-600"
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="text-sm text-zinc-300 cursor-pointer flex-1"
                        >
                          <div className="font-medium text-white">{group.name}</div>
                          <div className="text-xs text-zinc-400">{group.equipment?.length || 0} items</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm">
                    No equipment groups available. Create equipment groups first to organize your equipment.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Individual Equipment */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Specific Equipment Used</CardTitle>
                <CardDescription>
                  Select specific equipment that was used in the production of this item
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEquipment ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-zinc-700/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : availableEquipment.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableEquipment.map((equipment: Equipment) => (
                      <div key={equipment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${equipment.id}`}
                          checked={formData.equipmentUsed.includes(equipment.id as any)}
                          onCheckedChange={() => toggleEquipment(equipment.id as any)}
                          className="border-zinc-600"
                        />
                        <Label
                          htmlFor={`equipment-${equipment.id}`}
                          className="text-sm text-zinc-300 cursor-pointer flex-1"
                        >
                          <div className="font-medium text-white">{equipment.name}</div>
                          <div className="text-xs text-zinc-400">
                            {equipment.type} • {equipment.status}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm">
                    No equipment available. Add equipment to your profile first to associate it with listings.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-white flex items-center gap-2">
                Product Images & Videos <span className="text-red-400">*</span>
              </Label>
              <p className="text-xs text-zinc-400 mt-1 mb-3">
                Upload multiple images and videos of your product
              </p>

              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const type = file.type.startsWith('video/') ? 'video' : 'image';
                      const newMedia = { type, url: reader.result as string, file };
                      updateFormData("mediaFiles", [...formData.mediaFiles, newMedia]);
                    };
                    reader.readAsDataURL(file);
                  });
                }}
                disabled={isUploadingImage}
                className="hidden"
                id="media-upload"
              />
              <Label
                htmlFor="media-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-600 border-dashed rounded-lg cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-800/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-zinc-400" />
                  <p className="text-sm text-zinc-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG, GIF, MP4, WebM up to 10MB each</p>
                </div>
              </Label>

              {errors.mediaFiles && <p className="text-red-400 text-sm mt-1">{errors.mediaFiles}</p>}

              {formData.mediaFiles.length > 0 && (
                <div className="border border-zinc-700 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-white">Uploaded Media ({formData.mediaFiles.length})</Label>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => updateFormData("mediaFiles", [])}
                      className="h-8"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.mediaFiles.map((media, index) => (
                      <div key={index} className="relative group">
                        {media.type === 'video' ? (
                          <video
                            src={media.url}
                            controls
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updated = formData.mediaFiles.filter((_, i) => i !== index);
                            updateFormData("mediaFiles", updated);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                          {media.type === 'video' ? 'Video' : 'Image'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {formData.isDigitalProduct && (
              <div>
                <Label className="text-white flex items-center gap-2">
                  Digital Files <span className="text-xs text-zinc-400">(upload files for download)</span>
                </Label>
                <p className="text-xs text-zinc-400 mt-1 mb-2">
                  Upload STL, OBJ, 3MF, or other design files that buyers can download
                </p>

                {/* File Upload */}
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept=".stl,.obj,.3mf,.ply,.gcode,.png,.jpg,.jpeg,.gif,.pdf,.zip,.rar,.7z,.dxf,.svg"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    disabled={isUploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isUploading
                        ? "border-zinc-600 bg-zinc-800"
                        : "border-zinc-600 hover:border-primary hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                      <p className="text-sm text-zinc-400">
                        {isUploading ? "Uploading..." : "Click to upload files"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        STL, OBJ, 3MF, PLY, GCODE, images, PDFs, archives (max 100MB each)
                      </p>
                    </div>
                  </Label>
                  {isUploading && (
                    <div className="mt-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-xs text-zinc-400 mt-1">
                        Uploading... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Files List */}
                {formData.digitalFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Uploaded Files:</Label>
                    {formData.digitalFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
                            <Upload className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{file.originalName}</p>
                            <p className="text-xs text-zinc-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.mimetype}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeDigitalFile(index)}
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="text-zinc-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-glow">
              Create New Listing
            </h1>
            <p className="text-xl text-zinc-400">
              Fill out the information below to create your product listing
            </p>
          </div>

          {renderStepIndicator()}

          <Card className="bg-zinc-900/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">
                Step {currentStep} of {totalSteps}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Basic product information"}
                {currentStep === 2 && "Pricing and material options"}
                {currentStep === 3 && "Shipping & Production"}
                {currentStep === 4 && "Equipment selection"}
                {currentStep === 5 && "Images and final details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>
              </TooltipProvider>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <NeonButton onClick={nextStep} glowColor="primary">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </NeonButton>
            ) : (
              <NeonButton
                onClick={handleSubmit}
                glowColor="primary"
                disabled={createListingMutation.isPending}
              >
                {createListingMutation.isPending ? "Creating..." : "Create Listing"}
              </NeonButton>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

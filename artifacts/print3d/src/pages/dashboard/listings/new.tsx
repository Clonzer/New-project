import { useState } from "react";
import { useRouter } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  Plus,
  Minus,
  AlertCircle,
  Info,
  Package,
  MessageSquare,
  Clock,
  DollarSign,
  FileText,
  Settings,
  Eye
} from "lucide-react";
import { useCreateListing, useCreateQuoteRequest } from "@workspace/api-client-react";
import { useListEquipment, useListEquipmentGroups } from "@workspace/api-client-react";
import type { Equipment, EquipmentGroup } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const PRODUCT_TYPES = [
  { value: "3d_printing", label: "3D Printing", description: "Physical 3D printed objects" },
  { value: "woodworking", label: "Woodworking", description: "Wood-crafted items" },
  { value: "cnc", label: "CNC Machining", description: "Computer numerical control machining" },
  { value: "laser", label: "Laser Cutting", description: "Laser cut designs" },
  { value: "digital", label: "Digital Files", description: "Digital designs and files" },
];

const STOCK_TYPES = [
  { value: "inventory", label: "Inventory", description: "Pre-made items in stock" },
  { value: "print_on_demand", label: "Print on Demand", description: "Made when ordered" },
  { value: "digital", label: "Digital Download", description: "Instant digital delivery" },
];

const CATEGORIES = [
  "Mechanical", "Miniatures", "Cosplay", "Functional", "Art", "Jewelry", "Architecture",
  "Tools", "Home & Garden", "Toys & Games", "Wearables", "Prototypes", "Education"
];

const MATERIALS = [
  "PLA", "ABS", "PETG", "Resin", "Wood", "Metal", "Carbon Fiber", "Flexible",
  "Acrylic", "Plywood", "MDF", "Other"
];

interface ListingFormData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  tags: string[];
  productType: string;
  
  // Product Specific
  stockType: string;
  basePrice: number;
  shippingCost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  material: string;
  color: string;
  quantity: number;
  isDigitalProduct: boolean;
  digitalFiles: string[];
  
  // Equipment
  equipmentUsed: number[];
  equipmentGroups: number[];
  
  // Files
  images: string[];
  
  // Service (Quote Request) Specific
  budgetType: string;
  budget: number;
  dimensions: { length: number; width: number; height: number; unit: string };
  quality: string;
  deadline: string;
  location: string;
  shippingRequired: boolean;
  requirements: string;
}

const initialFormData: ListingFormData = {
  title: "",
  description: "",
  category: "",
  tags: [],
  productType: "3d_printing",
  stockType: "inventory",
  basePrice: 0,
  shippingCost: 0,
  estimatedDaysMin: 1,
  estimatedDaysMax: 7,
  material: "",
  color: "",
  quantity: 1,
  isDigitalProduct: false,
  digitalFiles: [],
  equipmentUsed: [],
  equipmentGroups: [],
  images: [],
  budgetType: "fixed",
  budget: 0,
  dimensions: { length: 0, width: 0, height: 0, unit: "mm" },
  quality: "standard",
  deadline: "",
  location: "",
  shippingRequired: true,
  requirements: "",
};

export default function NewListingWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [listingType, setListingType] = useState<"product" | "service" | null>(null);
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createListingMutation = useCreateListing();
  const createQuoteRequestMutation = useCreateQuoteRequest();
  const { data: equipmentData } = useListEquipment();
  const { data: equipmentGroupsData } = useListEquipmentGroups();

  const steps = listingType === "product" 
    ? ["Type Selection", "Basic Info", "Pricing & Timeline", "Equipment", "Files", "Review"]
    : ["Type Selection", "Basic Info", "Requirements", "Pricing & Timeline", "Review"];

  const totalSteps = steps.length;

  const updateFormData = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      updateFormData("tags", [...formData.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFormData("tags", formData.tags.filter(t => t !== tag));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Type Selection
        return listingType !== null;
      case 1: // Basic Info
        return formData.title.trim() !== "" && 
               formData.description.trim() !== "" && 
               formData.category !== "";
      case 2: // Pricing & Timeline (Product) or Requirements (Service)
        if (listingType === "product") {
          return formData.basePrice > 0 && 
                 formData.estimatedDaysMin > 0 && 
                 formData.estimatedDaysMax >= formData.estimatedDaysMin;
        } else {
          return formData.requirements.trim() !== "";
        }
      case 3: // Equipment (Product) or Pricing & Timeline (Service)
        if (listingType === "product") {
          return true; // Equipment is optional
        } else {
          return formData.budget > 0;
        }
      case 4: // Files (Product) or Review (Service)
        return true; // Files are optional
      case 5: // Review (Product only)
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !listingType) return;

    setIsSubmitting(true);
    try {
      if (listingType === "product") {
        await createListingMutation.mutateAsync({
          sellerId: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          basePrice: formData.basePrice,
          shippingCost: formData.shippingCost,
          estimatedDaysMin: formData.estimatedDaysMin,
          estimatedDaysMax: formData.estimatedDaysMax,
          material: formData.material,
          color: formData.color,
          productType: formData.productType,
          stockType: formData.stockType,
          isDigitalProduct: formData.isDigitalProduct,
          digitalFiles: formData.digitalFiles,
          equipmentUsed: formData.equipmentUsed,
          equipmentGroups: formData.equipmentGroups,
        });
      } else {
        await createQuoteRequestMutation.mutateAsync({
          buyerId: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          budget: formData.budget,
          budgetType: formData.budgetType,
          quantity: formData.quantity,
          material: formData.material,
          dimensions: formData.dimensions,
          quality: formData.quality,
          deadline: formData.deadline ? new Date(formData.deadline) : null,
          location: formData.location,
          shippingRequired: formData.shippingRequired,
          requirements: formData.requirements,
        });
      }

      toast({
        title: listingType === "product" ? "Listing Created!" : "Quote Request Posted!",
        description: listingType === "product" 
          ? "Your product listing is now live and available to buyers."
          : "Your quote request has been posted and sellers will be able to respond."
      });

      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">What would you like to create?</h2>
              <p className="text-zinc-400">Choose between selling a product or requesting a custom service quote.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card 
                className={`border-2 cursor-pointer transition-all ${
                  listingType === "product" 
                    ? "border-primary bg-primary/5" 
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
                onClick={() => setListingType("product")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-white">Product Listing</CardTitle>
                      <CardDescription>Sell physical or digital products</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Fixed pricing
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Inventory management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Instant ordering
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className={`border-2 cursor-pointer transition-all ${
                  listingType === "service" 
                    ? "border-primary bg-primary/5" 
                    : "border-zinc-700 hover:border-zinc-600"
                }`}
                onClick={() => setListingType("service")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-white">Service Request</CardTitle>
                      <CardDescription>Request custom quotes from makers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Custom requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Multiple quotes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Negotiable pricing
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
              <p className="text-zinc-400">Tell us about your {listingType === "product" ? "product" : "service request"}.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Enter a descriptive title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Provide detailed description..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {listingType === "product" && (
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Select value={formData.productType} onValueChange={(value) => updateFormData("productType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-zinc-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Tags</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                    if (input) {
                      addTag(input.value);
                      input.value = "";
                    }
                  }}>Add</Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        if (listingType === "product") {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Pricing & Timeline</h2>
                <p className="text-zinc-400">Set your pricing and production timeline.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="stockType">Stock Type</Label>
                  <Select value={formData.stockType} onValueChange={(value) => updateFormData("stockType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select stock type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-zinc-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => updateFormData("quantity", parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="basePrice">Base Price ($) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => updateFormData("basePrice", parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={(e) => updateFormData("shippingCost", parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDaysMin">Min Production Days *</Label>
                  <Input
                    id="estimatedDaysMin"
                    type="number"
                    min="1"
                    value={formData.estimatedDaysMin}
                    onChange={(e) => updateFormData("estimatedDaysMin", parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDaysMax">Max Production Days *</Label>
                  <Input
                    id="estimatedDaysMax"
                    type="number"
                    min="1"
                    value={formData.estimatedDaysMax}
                    onChange={(e) => updateFormData("estimatedDaysMax", parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Select value={formData.material} onValueChange={(value) => updateFormData("material", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIALS.map(material => (
                        <SelectItem key={material} value={material}>{material}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateFormData("color", e.target.value)}
                    placeholder="e.g., Black, White, Custom"
                    className="mt-1"
                  />
                </div>
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Service Requirements</h2>
                <p className="text-zinc-400">Describe what you need made and your specific requirements.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="requirements">Detailed Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => updateFormData("requirements", e.target.value)}
                    placeholder="Describe exactly what you need, including specifications, tolerances, finish requirements, etc."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="material">Preferred Material</Label>
                    <Select value={formData.material} onValueChange={(value) => updateFormData("material", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIALS.map(material => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quality">Quality Level</Label>
                    <Select value={formData.quality} onValueChange={(value) => updateFormData("quality", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft/Prototype</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Dimensions</Label>
                  <div className="mt-1 grid gap-2 grid-cols-5">
                    <Input
                      placeholder="Length"
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) => updateFormData("dimensions", { ...formData.dimensions, length: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Width"
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) => updateFormData("dimensions", { ...formData.dimensions, width: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      placeholder="Height"
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) => updateFormData("dimensions", { ...formData.dimensions, height: parseFloat(e.target.value) || 0 })}
                    />
                    <Select value={formData.dimensions.unit} onValueChange={(value) => updateFormData("dimensions", { ...formData.dimensions, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => updateFormData("deadline", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateFormData("location", e.target.value)}
                      placeholder="City, Country"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shippingRequired"
                    checked={formData.shippingRequired}
                    onCheckedChange={(checked) => updateFormData("shippingRequired", checked)}
                  />
                  <Label htmlFor="shippingRequired">Shipping required</Label>
                </div>
              </div>
            </motion.div>
          );
        }

      case 3:
        if (listingType === "product") {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Equipment</h2>
                <p className="text-zinc-400">Select the equipment you'll use for production.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Available Equipment</Label>
                  <div className="mt-2 grid gap-2">
                    {equipmentData?.equipment?.map(equipment => (
                      <div key={equipment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`equipment-${equipment.id}`}
                          checked={formData.equipmentUsed.includes(equipment.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("equipmentUsed", [...formData.equipmentUsed, equipment.id]);
                            } else {
                              updateFormData("equipmentUsed", formData.equipmentUsed.filter(id => id !== equipment.id));
                            }
                          }}
                        />
                        <Label htmlFor={`equipment-${equipment.id}`} className="text-sm">
                          {equipment.name} - {equipment.type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Equipment Groups</Label>
                  <div className="mt-2 grid gap-2">
                    {equipmentGroupsData?.equipmentGroups?.map(group => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={formData.equipmentGroups.includes(group.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("equipmentGroups", [...formData.equipmentGroups, group.id]);
                            } else {
                              updateFormData("equipmentGroups", formData.equipmentGroups.filter(id => id !== group.id));
                            }
                          }}
                        />
                        <Label htmlFor={`group-${group.id}`} className="text-sm">
                          {group.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Budget & Timeline</h2>
                <p className="text-zinc-400">Set your budget preferences and timeline.</p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="budgetType">Budget Type</Label>
                    <Select value={formData.budgetType} onValueChange={(value) => updateFormData("budgetType", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select budget type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget ($) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => updateFormData("budget", parseFloat(e.target.value) || 0)}
                      placeholder={formData.budgetType === "hourly" ? "Per hour" : "Total budget"}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => updateFormData("quantity", parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
              </div>
            </motion.div>
          );
        }

      case 4:
        if (listingType === "product") {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Files & Images</h2>
                <p className="text-zinc-400">Upload product images and digital files.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Product Images</Label>
                  <div className="mt-2 border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">Drag and drop images here, or click to browse</p>
                    <Button variant="outline">Select Images</Button>
                  </div>
                </div>

                {formData.stockType === "digital" && (
                  <div>
                    <Label>Digital Files</Label>
                    <div className="mt-2 border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-400 mb-2">Upload digital files for download</p>
                      <Button variant="outline">Select Files</Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Review Your Request</h2>
                <p className="text-zinc-400">Review your service request before posting.</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Request Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-zinc-400">Title</Label>
                    <p className="text-white">{formData.title}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm text-zinc-400">Description</Label>
                    <p className="text-white whitespace-pre-wrap">{formData.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm text-zinc-400">Requirements</Label>
                    <p className="text-white whitespace-pre-wrap">{formData.requirements}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-zinc-400">Budget</Label>
                      <p className="text-white">${formData.budget} {formData.budgetType === "hourly" ? "/hour" : ""}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-zinc-400">Quantity</Label>
                      <p className="text-white">{formData.quantity}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-zinc-400">Category</Label>
                      <p className="text-white">{formData.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-zinc-400">Material</Label>
                      <p className="text-white">{formData.material || "Any"}</p>
                    </div>
                  </div>

                  {formData.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm text-zinc-400">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        }

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Review Your Listing</h2>
              <p className="text-zinc-400">Review your product listing before publishing.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Listing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-zinc-400">Title</Label>
                  <p className="text-white">{formData.title}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm text-zinc-400">Description</Label>
                  <p className="text-white whitespace-pre-wrap">{formData.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-sm text-zinc-400">Base Price</Label>
                    <p className="text-white">${formData.basePrice}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-400">Shipping</Label>
                    <p className="text-white">${formData.shippingCost}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-400">Total</Label>
                    <p className="text-white font-bold">${formData.basePrice + formData.shippingCost}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-zinc-400">Production Time</Label>
                    <p className="text-white">{formData.estimatedDaysMin} - {formData.estimatedDaysMax} days</p>
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-400">Stock Type</Label>
                    <p className="text-white">{formData.stockType}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-400">Category</Label>
                    <p className="text-white">{formData.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-400">Material</Label>
                    <p className="text-white">{formData.material || "Any"}</p>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm text-zinc-400">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">Create New Listing</h1>
              <span className="text-sm text-zinc-400">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-xs ${
                    index <= currentStep ? "text-primary" : "text-zinc-600"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <div key={currentStep}>
              {renderStep()}
            </div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps - 1 ? (
              <NeonButton
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
                className="px-8"
              >
                {isSubmitting ? "Creating..." : listingType === "product" ? "Publish Listing" : "Post Request"}
                <Check className="w-4 h-4 ml-2" />
              </NeonButton>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

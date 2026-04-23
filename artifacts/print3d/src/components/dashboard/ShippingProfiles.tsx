import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/lib/workspace-stub";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Truck, Globe, Package, MapPin, Plus, Trash2, X, Clock, Store, Weight, RotateCcw, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Major shipping providers database
const SHIPPING_PROVIDERS = [
  { id: "fedex", name: "FedEx", logo: "📦", services: ["Express", "Ground", "International"] },
  { id: "ups", name: "UPS", logo: "🚚", services: ["Next Day Air", "Ground", "Worldwide"] },
  { id: "dhl", name: "DHL", logo: "✈️", services: ["Express", "eCommerce", "Parcel"] },
  { id: "usps", name: "USPS", logo: "📮", services: ["Priority", "First Class", "Media Mail"] },
  { id: "royal_mail", name: "Royal Mail", logo: "📮", services: ["Tracked", "Special Delivery"] },
  { id: "dpd", name: "DPD", logo: "📦", services: ["Classic", "Express"] },
  { id: "hermes", name: "Hermes/Evri", logo: "📦", services: ["Standard", "Next Day"] },
  { id: "gls", name: "GLS", logo: "🚛", services: ["BusinessParcel", "Express"] },
  { id: "tnt", name: "TNT", logo: "🚚", services: ["Express", "Economy"] },
  { id: "amazon", name: "Amazon Logistics", logo: "📦", services: ["Prime", "Standard"] },
  { id: "ontrac", name: "OnTrac", logo: "🚚", services: ["Ground", "Overnight"] },
  { id: "lasership", name: "LaserShip", logo: "🚛", services: ["Standard", "Express"] },
  { id: "aramex", name: "Aramex", logo: "✈️", services: ["Express", "Domestic"] },
  { id: "sf_express", name: "SF Express", logo: "📦", services: ["Standard", "Economy"] },
  { id: "australia_post", name: "Australia Post", logo: "📮", services: ["Express", "Parcel"] },
  { id: "canada_post", name: "Canada Post", logo: "📮", services: ["Priority", "Xpresspost"] },
];

const COUNTRY_OPTIONS = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "MA", name: "Morocco" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TR", name: "Turkey" },
  { code: "RU", name: "Russia" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "GR", name: "Greece" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "LU", name: "Luxembourg" },
  { code: "UA", name: "Ukraine" },
  { code: "IL", name: "Israel" },
];

interface ShippingProvider {
  id: string;
  name: string;
  logo: string;
  services: string[];
  enabled: boolean;
  trackingUrl?: string;
  apiKey?: string;
}

interface ShippingProfile {
  id: string;
  name: string;
  domesticCost: number;
  europeCost: number;
  northAmericaCost: number;
  internationalCost: number;
  freeShippingThreshold: number;
  enabled: boolean;
  shippingRegions: string[];
  // Shipping providers
  shippingProviders: ShippingProvider[];
  // Additional shipping options
  processingTime: string;
  localPickupEnabled: boolean;
  localPickupAddress: string;
  returnsAccepted: boolean;
  returnPeriod: number;
  returnShippingPaidBy: "buyer" | "seller";
  handlingTime: number;
  defaultWeight: number;
  defaultDimensions: { length: number; width: number; height: number };
  insuranceRequired: boolean;
  signatureRequired: boolean;
}

export function ShippingProfiles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const [profiles, setProfiles] = useState<ShippingProfile[]>([
    {
      id: "default",
      name: "Standard Shipping",
      domesticCost: user?.domesticShippingCost || 5.99,
      europeCost: user?.europeShippingCost || 12.99,
      northAmericaCost: user?.northAmericaShippingCost || 8.99,
      internationalCost: user?.internationalShippingCost || 19.99,
      freeShippingThreshold: user?.freeShippingThreshold || 50,
      enabled: true,
      shippingRegions: user?.sellingRegions || ["US", "CA", "GB"],
      shippingProviders: [
        { id: "fedex", name: "FedEx", logo: "📦", services: ["Ground", "Express"], enabled: true },
        { id: "ups", name: "UPS", logo: "🚚", services: ["Ground"], enabled: true },
      ],
      processingTime: "3-5",
      localPickupEnabled: false,
      localPickupAddress: "",
      returnsAccepted: true,
      returnPeriod: 30,
      returnShippingPaidBy: "buyer",
      handlingTime: 1,
      defaultWeight: 1,
      defaultDimensions: { length: 10, width: 8, height: 6 },
      insuranceRequired: false,
      signatureRequired: false,
    },
  ]);
  const [providerSearchQuery, setProviderSearchQuery] = useState("");
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ShippingProfile | null>(null);

  const handleSave = async () => {
    if (!user) return;

    try {
      const defaultProfile = profiles.find((p) => p.id === "default");
      if (defaultProfile) {
        await updateUser.mutateAsync({
          userId: user.id,
          data: {
            domesticShippingCost: defaultProfile.domesticCost,
            europeShippingCost: defaultProfile.europeCost,
            northAmericaShippingCost: defaultProfile.northAmericaCost,
            internationalShippingCost: defaultProfile.internationalCost,
            freeShippingThreshold: defaultProfile.freeShippingThreshold,
            defaultShippingCost: defaultProfile.domesticCost,
            localPickupEnabled: true,
            sellingRegions: defaultProfile.shippingRegions,
          },
        });
        toast({
          title: "Shipping profiles updated",
          description: "Your shipping settings have been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Could not update shipping profiles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddProfile = () => {
    const newProfile: ShippingProfile = {
      id: Date.now().toString(),
      name: "New Shipping Profile",
      domesticCost: 5.99,
      europeCost: 12.99,
      northAmericaCost: 8.99,
      internationalCost: 19.99,
      freeShippingThreshold: 50,
      enabled: true,
      shippingRegions: ["US", "CA"],
      shippingProviders: [],
      // Default values for new options
      processingTime: "3-5",
      localPickupEnabled: false,
      localPickupAddress: "",
      returnsAccepted: true,
      returnPeriod: 30,
      returnShippingPaidBy: "buyer",
      handlingTime: 1,
      defaultWeight: 1,
      defaultDimensions: { length: 10, width: 8, height: 6 },
      insuranceRequired: false,
      signatureRequired: false,
    };
    setProfiles([...profiles, newProfile]);
    setEditingProfile(newProfile);
    setIsEditing(true);
  };

  const addProviderToProfile = (providerId: string) => {
    if (!editingProfile) return;
    
    const provider = SHIPPING_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;
    
    // Check if already added
    if (editingProfile.shippingProviders.some(p => p.id === providerId)) {
      toast({
        title: "Provider already added",
        description: `${provider.name} is already in this profile.`,
        variant: "destructive",
      });
      return;
    }
    
    const newProvider: ShippingProvider = {
      ...provider,
      enabled: true,
    };
    
    handleUpdateProfile("shippingProviders", [...editingProfile.shippingProviders, newProvider]);
    setIsAddingProvider(false);
    setProviderSearchQuery("");
    
    toast({
      title: "Provider added",
      description: `${provider.name} has been added to this shipping profile.`,
    });
  };

  const removeProviderFromProfile = (providerId: string) => {
    if (!editingProfile) return;
    
    handleUpdateProfile(
      "shippingProviders", 
      editingProfile.shippingProviders.filter(p => p.id !== providerId)
    );
    
    toast({
      title: "Provider removed",
      description: "Shipping provider has been removed from this profile.",
    });
  };

  const toggleProvider = (providerId: string) => {
    if (!editingProfile) return;
    
    const updatedProviders = editingProfile.shippingProviders.map(p => 
      p.id === providerId ? { ...p, enabled: !p.enabled } : p
    );
    
    handleUpdateProfile("shippingProviders", updatedProviders);
  };

  const handleDeleteProfile = (id: string) => {
    if (id === "default") {
      toast({
        title: "Cannot delete default profile",
        description: "The default shipping profile cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setProfiles(profiles.filter((p) => p.id !== id));
  };

  const handleEditProfile = (profile: ShippingProfile) => {
    setEditingProfile(profile);
    setIsEditing(true);
  };

  const handleUpdateProfile = (field: keyof ShippingProfile, value: any) => {
    if (editingProfile) {
      setEditingProfile({ ...editingProfile, [field]: value });
    }
  };

  const handleSaveProfile = () => {
    if (editingProfile) {
      setProfiles(profiles.map((p) => (p.id === editingProfile.id ? editingProfile : p)));
      setIsEditing(false);
      setEditingProfile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Shipping Profiles</h2>
          <p className="text-zinc-400">Manage shipping costs by region and configure your shipping preferences.</p>
        </div>
        <Button onClick={handleAddProfile} className="bg-primary hover:bg-primary/600">
          <Plus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{profile.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.enabled}
                    onCheckedChange={(checked) => {
                      setProfiles(profiles.map((p) => (p.id === profile.id ? { ...p, enabled: checked } : p)));
                    }}
                  />
                  {profile.id !== "default" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="text-zinc-400">
                {profile.id === "default" ? "Default shipping profile" : "Custom shipping profile"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Domestic:</span>
                  <span className="text-white font-semibold">${profile.domesticCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Europe:</span>
                  <span className="text-white font-semibold">${profile.europeCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">North America:</span>
                  <span className="text-white font-semibold">${profile.northAmericaCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">International:</span>
                  <span className="text-white font-semibold">${profile.internationalCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Free Shipping Threshold:</span>
                  <span className="text-white font-semibold">${profile.freeShippingThreshold.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Shipping to:</span>
                  <span className="text-white font-semibold">{profile.shippingRegions.length} regions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Processing:</span>
                  <span className="text-white font-semibold">{profile.processingTime || "3-5"} days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Weight className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-400">Default Weight:</span>
                  <span className="text-white font-semibold">{profile.defaultWeight || 1} kg</span>
                </div>
                {profile.localPickupEnabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Local pickup enabled</span>
                  </div>
                )}
                {profile.returnsAccepted !== false && (
                  <div className="flex items-center gap-2 text-sm">
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Returns: {profile.returnPeriod || 30} days</span>
                  </div>
                )}
                {(profile.insuranceRequired || profile.signatureRequired) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">
                      {profile.insuranceRequired && "Insurance"}
                      {profile.insuranceRequired && profile.signatureRequired && " + "}
                      {profile.signatureRequired && "Signature"}
                    </span>
                  </div>
                )}
                {/* Shipping Providers Display */}
                {profile.shippingProviders && profile.shippingProviders.length > 0 && (
                  <div className="pt-2 border-t border-white/10 mt-2">
                    <p className="text-xs text-zinc-500 mb-2">Shipping Providers:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.shippingProviders
                        .filter(p => p.enabled)
                        .map(provider => (
                          <span 
                            key={provider.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-xs text-white"
                          >
                            <span>{provider.logo}</span>
                            <span>{provider.name}</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleEditProfile(profile)}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditing && editingProfile !== null} onOpenChange={setIsEditing}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfile?.id === "default" ? "Edit" : "Create"} Shipping Profile</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Configure all shipping options for this profile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Profile Information
              </h3>
              <div>
                <label className="text-sm text-zinc-300 block mb-1.5">Profile Name</label>
                <Input
                  value={editingProfile?.name || ""}
                  onChange={(e) => handleUpdateProfile("name", e.target.value)}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Shipping Costs */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Shipping Costs by Region
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Domestic Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProfile?.domesticCost || 0}
                    onChange={(e) => handleUpdateProfile("domesticCost", parseFloat(e.target.value))}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Europe Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProfile?.europeCost || 0}
                    onChange={(e) => handleUpdateProfile("europeCost", parseFloat(e.target.value))}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">North America Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProfile?.northAmericaCost || 0}
                    onChange={(e) => handleUpdateProfile("northAmericaCost", parseFloat(e.target.value))}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">International Cost ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProfile?.internationalCost || 0}
                    onChange={(e) => handleUpdateProfile("internationalCost", parseFloat(e.target.value))}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1.5">Free Shipping Threshold ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingProfile?.freeShippingThreshold || 0}
                  onChange={(e) => handleUpdateProfile("freeShippingThreshold", parseFloat(e.target.value))}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Shipping Regions */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Shipping Regions
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingProfile) {
                      handleUpdateProfile("shippingRegions", editingProfile.shippingRegions.includes("WORLDWIDE") ? [] : ["WORLDWIDE"]);
                    }
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    editingProfile?.shippingRegions.includes("WORLDWIDE")
                      ? "border-emerald-400/50 bg-emerald-400/15 text-white"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  Worldwide
                </button>
                {COUNTRY_OPTIONS.map((option) => {
                  const selected = editingProfile?.shippingRegions.includes(option.code);
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => {
                        if (editingProfile) {
                          handleUpdateProfile(
                            "shippingRegions",
                            editingProfile.shippingRegions.includes("WORLDWIDE")
                              ? [option.code]
                              : selected
                                ? editingProfile.shippingRegions.filter((value) => value !== option.code)
                                : [...editingProfile.shippingRegions, option.code]
                          );
                        }
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        selected
                          ? "border-primary/50 bg-primary/15 text-white"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {option.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Processing & Handling */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Processing & Handling
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Processing Time</label>
                  <select
                    value={editingProfile?.processingTime || "3-5"}
                    onChange={(e) => handleUpdateProfile("processingTime", e.target.value)}
                    className="w-full bg-black/30 border border-white/10 text-white rounded-lg h-10 px-3"
                  >
                    <option value="1">1 business day</option>
                    <option value="1-2">1-2 business days</option>
                    <option value="2-3">2-3 business days</option>
                    <option value="3-5">3-5 business days</option>
                    <option value="5-7">5-7 business days</option>
                    <option value="7-10">7-10 business days</option>
                    <option value="10-14">10-14 business days</option>
                    <option value="14+">2-3 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Handling Time (days)</label>
                  <Input
                    type="number"
                    min={0}
                    max={14}
                    value={editingProfile?.handlingTime || 1}
                    onChange={(e) => handleUpdateProfile("handlingTime", parseInt(e.target.value))}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Package Defaults */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Weight className="w-4 h-4 text-primary" />
                Default Package Settings
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingProfile?.defaultWeight || 1}
                    onChange={(e) => handleUpdateProfile("defaultWeight", parseFloat(e.target.value))}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Length (cm)</label>
                  <Input
                    type="number"
                    value={editingProfile?.defaultDimensions?.length || 10}
                    onChange={(e) => handleUpdateProfile("defaultDimensions", { ...editingProfile?.defaultDimensions, length: parseFloat(e.target.value) })}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Width (cm)</label>
                  <Input
                    type="number"
                    value={editingProfile?.defaultDimensions?.width || 8}
                    onChange={(e) => handleUpdateProfile("defaultDimensions", { ...editingProfile?.defaultDimensions, width: parseFloat(e.target.value) })}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Height (cm)</label>
                  <Input
                    type="number"
                    value={editingProfile?.defaultDimensions?.height || 6}
                    onChange={(e) => handleUpdateProfile("defaultDimensions", { ...editingProfile?.defaultDimensions, height: parseFloat(e.target.value) })}
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Providers */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Shipping Providers
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingProvider(true)}
                  className="border-white/10 text-zinc-400 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Provider
                </Button>
              </div>

              {/* Current Providers */}
              {editingProfile?.shippingProviders && editingProfile.shippingProviders.length > 0 ? (
                <div className="space-y-2">
                  {editingProfile.shippingProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        provider.enabled 
                          ? "border-white/10 bg-white/5" 
                          : "border-white/5 bg-white/[0.02] opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{provider.logo}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{provider.name}</p>
                          <p className="text-xs text-zinc-500">
                            {provider.services.slice(0, 2).join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={provider.enabled}
                          onCheckedChange={() => toggleProvider(provider.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProviderFromProfile(provider.id)}
                          className="text-red-400 hover:text-red-300 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No shipping providers added. Click "Add Provider" to select carriers.
                </p>
              )}

              {/* Provider Search / Selector */}
              {isAddingProvider && (
                <div className="space-y-3 p-4 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Select a shipping provider</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsAddingProvider(false);
                        setProviderSearchQuery("");
                      }}
                      className="text-zinc-400 hover:text-white h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Search providers..."
                    value={providerSearchQuery}
                    onChange={(e) => setProviderSearchQuery(e.target.value)}
                    className="bg-black/50 border-white/10 text-white"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {SHIPPING_PROVIDERS.filter(
                      (p) =>
                        !editingProfile?.shippingProviders.some((ep) => ep.id === p.id) &&
                        (providerSearchQuery === "" ||
                          p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()))
                    ).map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => addProviderToProfile(provider.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left"
                      >
                        <span className="text-2xl">{provider.logo}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{provider.name}</p>
                          <p className="text-xs text-zinc-500">
                            {provider.services.join(", ")}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-zinc-400" />
                      </button>
                    ))}
                    {SHIPPING_PROVIDERS.filter(
                      (p) =>
                        !editingProfile?.shippingProviders.some((ep) => ep.id === p.id) &&
                        (providerSearchQuery === "" ||
                          p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()))
                    ).length === 0 && (
                      <p className="text-sm text-zinc-500 text-center py-4">
                        {providerSearchQuery 
                          ? "No providers match your search" 
                          : "All available providers have been added"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Local Pickup */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                Local Pickup
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-300">Enable local pickup</span>
                <Switch
                  checked={editingProfile?.localPickupEnabled || false}
                  onCheckedChange={(checked) => handleUpdateProfile("localPickupEnabled", checked)}
                />
              </div>
              {editingProfile?.localPickupEnabled && (
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Pickup Address</label>
                  <Input
                    value={editingProfile?.localPickupAddress || ""}
                    onChange={(e) => handleUpdateProfile("localPickupAddress", e.target.value)}
                    placeholder="123 Main St, City, Country"
                    className="bg-black/30 border-white/10 text-white"
                  />
                </div>
              )}
            </div>

            {/* Shipping Options */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Shipping Options
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
                  <span className="text-sm text-zinc-300">Require insurance</span>
                  <input
                    type="checkbox"
                    checked={editingProfile?.insuranceRequired || false}
                    onChange={(e) => handleUpdateProfile("insuranceRequired", e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-black/30 text-primary"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
                  <span className="text-sm text-zinc-300">Require signature on delivery</span>
                  <input
                    type="checkbox"
                    checked={editingProfile?.signatureRequired || false}
                    onChange={(e) => handleUpdateProfile("signatureRequired", e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-black/30 text-primary"
                  />
                </label>
              </div>
            </div>

            {/* Returns */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                Return Policy
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-300">Accept returns</span>
                <Switch
                  checked={editingProfile?.returnsAccepted !== false}
                  onCheckedChange={(checked) => handleUpdateProfile("returnsAccepted", checked)}
                />
              </div>
              {editingProfile?.returnsAccepted !== false && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-300 block mb-1.5">Return Period (days)</label>
                    <Input
                      type="number"
                      min={7}
                      max={90}
                      value={editingProfile?.returnPeriod || 30}
                      onChange={(e) => handleUpdateProfile("returnPeriod", parseInt(e.target.value))}
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-300 block mb-1.5">Return shipping paid by</label>
                    <select
                      value={editingProfile?.returnShippingPaidBy || "buyer"}
                      onChange={(e) => handleUpdateProfile("returnShippingPaidBy", e.target.value)}
                      className="w-full bg-black/30 border border-white/10 text-white rounded-lg h-10 px-3"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <NeonButton glowColor="primary" onClick={handleSaveProfile}>
                Save Profile
              </NeonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <NeonButton glowColor="primary" onClick={handleSave} disabled={updateUser.isPending}>
          {updateUser.isPending ? "Saving..." : "Save Changes"}
        </NeonButton>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/lib/workspace-stub";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Truck, Globe, Package, MapPin, Plus, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
];

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
    },
  ]);
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
    };
    setProfiles([...profiles, newProfile]);
    setEditingProfile(newProfile);
    setIsEditing(true);
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
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shipping Profile</DialogTitle>
            <DialogDescription className="text-zinc-400">Configure shipping costs and regions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Profile Name</label>
              <Input
                value={editingProfile?.name || ""}
                onChange={(e) => handleUpdateProfile("name", e.target.value)}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
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
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Shipping Regions</label>
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
            <div className="flex gap-3">
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

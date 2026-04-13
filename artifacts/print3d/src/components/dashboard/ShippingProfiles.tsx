import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/lib/workspace-stub";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { Truck, Globe, Package, MapPin, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ShippingProfile {
  id: string;
  name: string;
  domesticCost: number;
  europeCost: number;
  northAmericaCost: number;
  internationalCost: number;
  freeShippingThreshold: number;
  enabled: boolean;
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

      {isEditing && editingProfile && (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Edit Shipping Profile</CardTitle>
            <CardDescription className="text-zinc-400">Configure shipping costs for different regions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Profile Name</label>
              <Input
                value={editingProfile.name}
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
                  value={editingProfile.domesticCost}
                  onChange={(e) => handleUpdateProfile("domesticCost", parseFloat(e.target.value))}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1.5">Europe Cost ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingProfile.europeCost}
                  onChange={(e) => handleUpdateProfile("europeCost", parseFloat(e.target.value))}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1.5">North America Cost ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingProfile.northAmericaCost}
                  onChange={(e) => handleUpdateProfile("northAmericaCost", parseFloat(e.target.value))}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 block mb-1.5">International Cost ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingProfile.internationalCost}
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
                value={editingProfile.freeShippingThreshold}
                onChange={(e) => handleUpdateProfile("freeShippingThreshold", parseFloat(e.target.value))}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <NeonButton glowColor="primary" onClick={handleSaveProfile}>
                Save Profile
              </NeonButton>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <NeonButton glowColor="primary" onClick={handleSave} disabled={updateUser.isPending}>
          {updateUser.isPending ? "Saving..." : "Save Changes"}
        </NeonButton>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUpdateUser } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authChangePassword } from "@/lib/auth-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { getPaymentConfig } from "@/lib/payments-api";
import { Bell, ChevronRight, CreditCard, Shield, Store, User } from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "shop", label: "Shop Settings", icon: Store },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const [activeSection, setActiveSection] = useState("profile");
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    bio: user?.bio ?? "",
    location: user?.location ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    shopName: user?.shopName ?? "",
    shopMode: user?.shopMode ?? "open",
    defaultShippingCost: user?.defaultShippingCost != null ? String(user.defaultShippingCost) : "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      location: user.location ?? "",
      avatarUrl: user.avatarUrl ?? "",
      shopName: user.shopName ?? "",
      shopMode: user.shopMode ?? "open",
      defaultShippingCost: user.defaultShippingCost != null ? String(user.defaultShippingCost) : "",
    });
  }, [user]);

  useEffect(() => {
    getPaymentConfig()
      .then((result) => setPaymentEnabled(result.checkoutEnabled))
      .catch(() => setPaymentEnabled(false));
  }, []);

  const isSeller = useMemo(() => user?.role === "seller" || user?.role === "both", [user?.role]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const shipping = form.defaultShippingCost.trim() === "" ? null : parseFloat(form.defaultShippingCost);
      await updateUser.mutateAsync({
        userId: user.id,
        data: {
          displayName: form.displayName.trim(),
          bio: form.bio.trim() || null,
          location: form.location.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
          shopName: form.shopName.trim() || null,
          shopMode: form.shopMode,
          defaultShippingCost: shipping != null && Number.isFinite(shipping) ? shipping : null,
        },
      });
      await refreshUser();
      toast({ title: "Settings saved", description: "Your account details were updated." });
    } catch (error) {
      toast({
        title: "Save failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const updatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Enter the same new password twice.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await authChangePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated", description: "Use the new password next time you sign in." });
    } catch (error) {
      toast({
        title: "Password update failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-10 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-display font-bold text-white mb-8">Settings</h1>

          <div className="flex gap-8 flex-col md:flex-row">
            <aside className="md:w-56 shrink-0">
              <nav className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                {SECTIONS.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? "bg-primary/20 text-primary border-l-2 border-primary"
                          : "text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                      } ${index !== 0 ? "border-t border-white/5" : ""}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="flex-grow">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="glass-panel rounded-2xl border border-white/10 p-8"
              >
                {activeSection === "profile" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Profile Information</h2>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                        <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                          {form.avatarUrl ? (
                            <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                              {user?.displayName?.charAt(0) ?? "?"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Profile picture URL</p>
                        <Input
                          value={form.avatarUrl}
                          onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                          placeholder="https://..."
                          className="bg-black/30 border-white/10 text-white w-72"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Display Name</label>
                      <Input
                        value={form.displayName}
                        onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                        placeholder="Your name"
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Location</label>
                      <Input
                        value={form.location}
                        onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                        placeholder="City, Country"
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                        placeholder="Tell buyers and sellers about yourself..."
                        rows={4}
                        className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <NeonButton glowColor="primary" onClick={handleSave} disabled={updateUser.isPending}>
                        {updateUser.isPending ? "Saving..." : "Save Changes"}
                      </NeonButton>
                    </div>
                  </div>
                )}

                {activeSection === "shop" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Shop Settings</h2>
                    {!isSeller ? (
                      <p className="text-zinc-400">Upgrade your account to seller mode during registration to manage a shop.</p>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1.5">Shop Name</label>
                          <Input
                            value={form.shopName}
                            onChange={(event) => setForm((current) => ({ ...current, shopName: event.target.value }))}
                            placeholder="Your Shop Name"
                            className="bg-black/30 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1.5">Default shipping for custom jobs ($)</label>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            value={form.defaultShippingCost}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, defaultShippingCost: event.target.value }))
                            }
                            placeholder="e.g. 8.00"
                            className="bg-black/30 border-white/10 text-white"
                          />
                          <p className="text-xs text-zinc-500 mt-1">This is charged once for custom jobs without a listing.</p>
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">Shop Mode</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { value: "catalog", label: "Catalog Only", desc: "Only print listed models" },
                              { value: "open", label: "Open Jobs", desc: "Accept uploaded custom work" },
                              { value: "both", label: "Both", desc: "Run listings and custom jobs" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  setForm((current) => ({
                                    ...current,
                                    shopMode: option.value as "catalog" | "open" | "both",
                                  }))
                                }
                                className={`p-4 rounded-xl border text-left transition-all ${
                                  form.shopMode === option.value
                                    ? "border-primary/50 bg-primary/10 text-white"
                                    : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                                }`}
                              >
                                <p className="font-medium text-sm">{option.label}</p>
                                <p className="text-xs mt-1 opacity-70">{option.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <NeonButton glowColor="primary" onClick={handleSave} disabled={updateUser.isPending}>
                            {updateUser.isPending ? "Saving..." : "Save Shop Settings"}
                          </NeonButton>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeSection === "payment" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Payments</h2>
                    <div
                      className={`p-4 rounded-xl text-sm border ${
                        paymentEnabled
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      <p className="font-medium mb-1">
                        {paymentEnabled ? "Stripe checkout is live" : "Stripe checkout is not configured yet"}
                      </p>
                      <p>
                        {paymentEnabled
                          ? "Buyers will be redirected to Stripe for secure payment before orders are created."
                          : "Add the Stripe environment variables on Render to enable live checkout."}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-300 space-y-2">
                      <p>Provider: Stripe Checkout</p>
                      <p>Buyer payments are captured before an order enters the seller workflow.</p>
                      <p>Platform fee: 10% of each order subtotal.</p>
                    </div>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                    <p className="text-zinc-400">
                      Notification preferences are still local UI state. The production backend work in this pass focused on account security, checkout, and deployment.
                    </p>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Security</h2>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Current Password</label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                        }
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">New Password</label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                        }
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Confirm New Password</label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                        }
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex justify-end">
                      <NeonButton glowColor="primary" onClick={() => void updatePassword()} disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </NeonButton>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

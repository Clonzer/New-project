import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUpdateUser } from "@/lib/workspace-stub";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authChangePassword, authConfirmEmailVerification, authRequestEmailVerification } from "@/lib/auth-api";
import { getApiErrorMessage, getApiErrorMessageWithSupport } from "@/lib/api-error";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  countryCodeToFlag,
  persistLocalePreferences,
  useLocalePreferences,
} from "@/lib/locale-preferences";
import { getPaymentConfig } from "@/lib/payments-api";
import { SHOP_TAG_OPTIONS } from "@/lib/shop-tags";
import { Bell, ChevronRight, CreditCard, Eye, FileText, MessageSquareText, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfilePreviewModal } from "@/components/shared/ProfilePreviewModal";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "policies", label: "Policies", icon: FileText },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "feedback", label: "Feedback", icon: MessageSquareText },
  { id: "accounts", label: "Accounts", icon: User },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState("profile");
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [isConfirmingVerification, setIsConfirmingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [customTagDraft, setCustomTagDraft] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState({
    newOrders: true,
    customRequests: true,
    messages: true,
    reviews: true,
    promotions: false,
    accountUpdates: true,
  });
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
    countryCode: user?.countryCode ?? "GB",
    languageCode: user?.languageCode ?? "en-GB",
    currencyCode: user?.currencyCode ?? "GBP",
    sellerTags: user?.sellerTags ?? [],
    shopName: user?.shopName ?? "",
    bannerUrl: user?.bannerUrl ?? "",
    shopAnnouncement: user?.shopAnnouncement ?? "",
    brandStory: user?.brandStory ?? "",
    websiteUrl: user?.websiteUrl ?? "",
    instagramHandle: user?.instagramHandle ?? "",
    supportEmail: user?.supportEmail ?? "",
    tiktokHandle: user?.tiktokHandle ?? "",
    xHandle: user?.xHandle ?? "",
    shopMode: user?.shopMode ?? "open",
    defaultShippingCost: user?.defaultShippingCost != null ? String(user.defaultShippingCost) : "",
    shippingRegions: user?.shippingRegions ?? "",
    sellingRegions: user?.sellingRegions ?? [],
    shippingPolicy: user?.shippingPolicy ?? "",
    domesticShippingCost: user?.domesticShippingCost != null ? String(user.domesticShippingCost) : "",
    europeShippingCost: user?.europeShippingCost != null ? String(user.europeShippingCost) : "",
    northAmericaShippingCost: user?.northAmericaShippingCost != null ? String(user.northAmericaShippingCost) : "",
    internationalShippingCost: user?.internationalShippingCost != null ? String(user.internationalShippingCost) : "",
    freeShippingThreshold: user?.freeShippingThreshold != null ? String(user.freeShippingThreshold) : "",
    localPickupEnabled: !!user?.localPickupEnabled,
    taxRate: user?.taxRate != null ? String(user.taxRate) : "",
    processingDaysMin: user?.processingDaysMin != null ? String(user.processingDaysMin) : "1",
    processingDaysMax: user?.processingDaysMax != null ? String(user.processingDaysMax) : "7",
    returnPolicy: user?.returnPolicy ?? "",
    customOrderPolicy: user?.customOrderPolicy ?? "",
    // Color customization
    primaryColor: user?.primaryColor ?? "#8b5cf6",
    accentColor: user?.accentColor ?? "#06b6d4",
    backgroundColor: user?.backgroundColor ?? "#09090b",
    textColor: user?.textColor ?? "#ffffff",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      location: user.location ?? "",
      avatarUrl: user.avatarUrl ?? "",
      countryCode: user.countryCode ?? "GB",
      languageCode: user.languageCode ?? "en-GB",
      currencyCode: user.currencyCode ?? "GBP",
      sellerTags: user.sellerTags ?? [],
      shopName: user.shopName ?? "",
      bannerUrl: user.bannerUrl ?? "",
      shopAnnouncement: user.shopAnnouncement ?? "",
      brandStory: user.brandStory ?? "",
      websiteUrl: user.websiteUrl ?? "",
      instagramHandle: user.instagramHandle ?? "",
      supportEmail: user.supportEmail ?? "",
      tiktokHandle: (user as any).tiktokHandle ?? "",
      xHandle: (user as any).xHandle ?? "",
      shopMode: user.shopMode ?? "open",
      defaultShippingCost: user.defaultShippingCost != null ? String(user.defaultShippingCost) : "",
      shippingRegions: user.shippingRegions ?? "",
      sellingRegions: user.sellingRegions ?? [],
      shippingPolicy: user.shippingPolicy ?? "",
      domesticShippingCost: user.domesticShippingCost != null ? String(user.domesticShippingCost) : "",
      europeShippingCost: user.europeShippingCost != null ? String(user.europeShippingCost) : "",
      northAmericaShippingCost: user.northAmericaShippingCost != null ? String(user.northAmericaShippingCost) : "",
      internationalShippingCost: user.internationalShippingCost != null ? String(user.internationalShippingCost) : "",
      freeShippingThreshold: user.freeShippingThreshold != null ? String(user.freeShippingThreshold) : "",
      localPickupEnabled: !!user.localPickupEnabled,
      taxRate: user.taxRate != null ? String(user.taxRate) : "",
      processingDaysMin: user.processingDaysMin != null ? String(user.processingDaysMin) : "1",
      processingDaysMax: user.processingDaysMax != null ? String(user.processingDaysMax) : "7",
      returnPolicy: user.returnPolicy ?? "",
      customOrderPolicy: user.customOrderPolicy ?? "",
      // Color customization
      primaryColor: (user as any).primaryColor ?? "#8b5cf6",
      accentColor: (user as any).accentColor ?? "#06b6d4",
      backgroundColor: (user as any).backgroundColor ?? "#09090b",
      textColor: (user as any).textColor ?? "#ffffff",
    });
  }, [user]);

  useEffect(() => {
    getPaymentConfig()
      .then((result) => setPaymentEnabled(result.checkoutEnabled))
      .catch(() => setPaymentEnabled(false));
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const section = searchParams.get('section');
    if (section && SECTIONS.some(s => s.id === section)) {
      setActiveSection(section);
    }
  }, [location]);

  const isSeller = useMemo(() => user?.role === "seller" || user?.role === "both", [user?.role]);
  const isVerified = !!user?.emailVerifiedAt;
  const planTier = user?.planTier ?? "starter";
  const { fxSource, fxUpdatedAt } = useLocalePreferences();
  const appOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-synthix-domain.onrender.com";

  const handleSave = async () => {
    if (!user) return;
    try {
      const shipping = form.defaultShippingCost.trim() === "" ? null : parseFloat(form.defaultShippingCost);
      const domesticShippingCost = form.domesticShippingCost.trim() === "" ? null : parseFloat(form.domesticShippingCost);
      const europeShippingCost = form.europeShippingCost.trim() === "" ? null : parseFloat(form.europeShippingCost);
      const northAmericaShippingCost = form.northAmericaShippingCost.trim() === "" ? null : parseFloat(form.northAmericaShippingCost);
      const internationalShippingCost = form.internationalShippingCost.trim() === "" ? null : parseFloat(form.internationalShippingCost);
      const freeShippingThreshold = form.freeShippingThreshold.trim() === "" ? null : parseFloat(form.freeShippingThreshold);
      const taxRate = form.taxRate.trim() === "" ? null : parseFloat(form.taxRate);
      const processingDaysMin = form.processingDaysMin.trim() === "" ? null : parseInt(form.processingDaysMin, 10);
      const processingDaysMax = form.processingDaysMax.trim() === "" ? null : parseInt(form.processingDaysMax, 10);
      await updateUser.mutateAsync({
        userId: user.id,
        data: {
          displayName: form.displayName.trim(),
          bio: form.bio.trim() || null,
          location: form.location.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
          countryCode: form.countryCode.trim() || null,
          languageCode: form.languageCode.trim() || null,
          currencyCode: form.currencyCode.trim() || null,
          sellerTags: form.sellerTags,
          shopName: form.shopName.trim() || null,
          bannerUrl: form.bannerUrl.trim() || null,
          shopAnnouncement: form.shopAnnouncement.trim() || null,
          brandStory: form.brandStory.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
          instagramHandle: form.instagramHandle.trim() || null,
          supportEmail: form.supportEmail.trim() || null,
          tiktokHandle: form.tiktokHandle.trim() || null,
          xHandle: form.xHandle.trim() || null,
          shopMode: form.shopMode,
          defaultShippingCost: shipping != null && Number.isFinite(shipping) ? shipping : null,
          shippingRegions: form.shippingRegions.trim() || null,
          sellingRegions: form.sellingRegions,
          shippingPolicy: form.shippingPolicy.trim() || null,
          domesticShippingCost: domesticShippingCost != null && Number.isFinite(domesticShippingCost) ? domesticShippingCost : null,
          europeShippingCost: europeShippingCost != null && Number.isFinite(europeShippingCost) ? europeShippingCost : null,
          northAmericaShippingCost: northAmericaShippingCost != null && Number.isFinite(northAmericaShippingCost) ? northAmericaShippingCost : null,
          internationalShippingCost: internationalShippingCost != null && Number.isFinite(internationalShippingCost) ? internationalShippingCost : null,
          freeShippingThreshold: freeShippingThreshold != null && Number.isFinite(freeShippingThreshold) ? freeShippingThreshold : null,
          localPickupEnabled: form.localPickupEnabled,
          taxRate: taxRate != null && Number.isFinite(taxRate) ? taxRate : null,
          processingDaysMin: processingDaysMin != null && Number.isFinite(processingDaysMin) ? processingDaysMin : null,
          processingDaysMax: processingDaysMax != null && Number.isFinite(processingDaysMax) ? processingDaysMax : null,
          returnPolicy: form.returnPolicy.trim() || null,
          customOrderPolicy: form.customOrderPolicy.trim() || null,
          // Color customization
          primaryColor: form.primaryColor,
          accentColor: form.accentColor,
          backgroundColor: form.backgroundColor,
          textColor: form.textColor,
        },
      });
      persistLocalePreferences({
        countryCode: form.countryCode,
        languageCode: form.languageCode,
        currencyCode: form.currencyCode,
      });
      await refreshUser();
      toast({ title: "Settings saved", description: "Your account details were updated." });
    } catch (error) {
      toast({
        title: "Save failed",
        description: getApiErrorMessageWithSupport(error, "saving your settings"),
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
        description: getApiErrorMessageWithSupport(error, "updating your password"),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      setIsRequestingVerification(true);
      const result = await authRequestEmailVerification();
      toast({
        title: result.alreadyVerified ? "Email already verified" : "Verification code sent",
        description: result.alreadyVerified
          ? "This account is already verified."
          : `A 6-digit code was sent to ${result.email ?? "your email address"}.`,
      });
      await refreshUser();
    } catch (error) {
      toast({
        title: "Could not send verification code",
        description: getApiErrorMessageWithSupport(error, "sending email verification"),
        variant: "destructive",
      });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const confirmVerificationCode = async () => {
    try {
      setIsConfirmingVerification(true);
      await authConfirmEmailVerification(verificationCode.trim());
      setVerificationCode("");
      await refreshUser();
      toast({ title: "Email verified", description: "Seller features are now fully enabled for this account." });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: getApiErrorMessageWithSupport(error, "verifying your email"),
        variant: "destructive",
      });
    } finally {
      setIsConfirmingVerification(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-10 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-display font-bold text-white mb-8">Settings</h1>

          <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="shrink-0">
              <nav className="glass-panel sticky top-24 rounded-2xl border border-white/10 overflow-hidden">
                {SECTIONS.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-primary/30 to-primary/10 text-white border-l-4 border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                          : "text-zinc-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
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

            <div className="min-w-0">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="glass-panel min-h-[42rem] rounded-2xl border border-white/10 p-8 lg:p-10"
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
                        <p className="text-sm text-zinc-400 mb-1">Profile picture</p>
                        <Input
                          type="file"
                          accept="image/*"
                          className="mb-3 bg-black/30 border-white/10 text-white w-72 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-xs file:text-white"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (file.size > 6 * 1024 * 1024) {
                              toast({ title: "Image too large", description: "Use an image under 6MB.", variant: "destructive" });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setForm((current) => ({
                                ...current,
                                avatarUrl: typeof reader.result === "string" ? reader.result : current.avatarUrl,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <Input
                          value={form.avatarUrl}
                          onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                          placeholder="https://..."
                          className="bg-black/30 border-white/10 text-white w-72"
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                          Upload an image directly or paste a hosted image URL.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">Country</label>
                        <Select
                          value={form.countryCode}
                          onValueChange={(value) => {
                            const nextCountry = COUNTRY_OPTIONS.find((option) => option.code === value);
                            setForm((current) => ({
                              ...current,
                              countryCode: value,
                              currencyCode: nextCountry?.defaultCurrency ?? current.currencyCode,
                              languageCode: nextCountry?.defaultLanguage ?? current.languageCode,
                            }));
                          }}
                        >
                          <SelectTrigger className="w-full bg-black/60 border-white/10 text-white">
                            <SelectValue>
                              {countryCodeToFlag(form.countryCode)} {COUNTRY_OPTIONS.find(o => o.code === form.countryCode)?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((option) => (
                              <SelectItem key={option.code} value={option.code}>
                                {countryCodeToFlag(option.code)} {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">Language</label>
                        <select
                          value={form.languageCode}
                          onChange={(event) => setForm((current) => ({ ...current, languageCode: event.target.value }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">Currency</label>
                        <select
                          value={form.currencyCode}
                          onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value }))}
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {CURRENCY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.code} - {option.label}
                            </option>
                          ))}
                        </select>
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
                        placeholder="Tell the community about yourself..."
                        rows={4}
                        className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button 
                        onClick={() => setShowProfilePreview(true)}
                        className="px-6 py-2 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Preview Profile
                      </Button>
                      <NeonButton glowColor="primary" onClick={handleSave} disabled={updateUser.isPending}>
                        {updateUser.isPending ? "Saving..." : "Save Changes"}
                      </NeonButton>
                    </div>
                  </div>
                )}

                {activeSection === "payment" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Payments</h2>
                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-5 text-sm text-cyan-100">
                      <p className="font-semibold text-white">Current plan: {planTier}</p>
                      <p className="mt-1 text-cyan-50/80">
                        Owner accounts can upgrade users into `pro`, `elite`, or `enterprise` from the private admin panel.
                      </p>
                    </div>
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
                          ? "Users will be redirected to Stripe for secure payment before orders are created."
                          : "Add the Stripe environment variables on Render to enable live checkout."}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-300 space-y-2">
                      <p>Provider: Stripe Checkout</p>
                      <p>Payments are captured before an order enters the seller workflow.</p>
                      <p>Platform fee: 10% of each order subtotal.</p>
                      <p>FX pricing: {fxSource === "live" ? "Live exchange rates" : "Fallback exchange rates"}{fxUpdatedAt && fxUpdatedAt !== "static" ? ` (updated ${fxUpdatedAt})` : ""}</p>
                    </div>
                    {planTier === "enterprise" ? (
                      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-sm text-zinc-200">
                        <p className="font-semibold text-white">Enterprise seller tooling enabled</p>
                        <p className="mt-2">
                          This account can be treated as a managed enterprise seller for custom onboarding, negotiated fees, and direct support.
                        </p>
                      </div>
                    ) : null}
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Render setup checklist</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
                        {[
                          "DATABASE_URL",
                          "JWT_SECRET",
                          "STRIPE_SECRET_KEY",
                          "STRIPE_WEBHOOK_SECRET",
                          "GOOGLE_CLIENT_ID",
                          "VITE_GOOGLE_CLIENT_ID",
                          "SMTP_HOST",
                          "SMTP_PORT",
                          "SMTP_USER",
                          "SMTP_PASS",
                          "SMTP_FROM",
                        ].map((item) => (
                          <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs">
                            {item}
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-zinc-400">
                        Stripe webhook URL: <span className="text-zinc-200">{appOrigin}/api/payments/stripe/webhook</span>
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        In Stripe, subscribe the webhook to <span className="text-zinc-200">checkout.session.completed</span> and <span className="text-zinc-200">checkout.session.expired</span>.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                    <p className="text-sm text-zinc-400">Choose which notifications you want to receive in your dashboard.</p>
                    <div className="space-y-3">
                      {[
                        { key: "newOrders" as const, label: "New orders", desc: "Get notified when you receive a new order" },
                        { key: "customRequests" as const, label: "Custom requests", desc: "Alerts when someone submits a custom work quote request" },
                        { key: "messages" as const, label: "Messages", desc: "Notifications for unread buyer messages" },
                        { key: "reviews" as const, label: "Reviews", desc: "Alerts when you receive a new review" },
                        { key: "promotions" as const, label: "Promotions & tips", desc: "Marketing and platform feature announcements" },
                        { key: "accountUpdates" as const, label: "Account updates", desc: "Security and billing notifications" },
                      ].map(({ key, label, desc }) => (
                        <button
                          key={key}
                          onClick={() => setNotificationPreferences(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`w-full rounded-2xl border p-4 text-left transition-all ${
                            notificationPreferences[key]
                              ? "border-primary/50 bg-primary/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${notificationPreferences[key] ? "text-white" : "text-zinc-300"}`}>
                                {label}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">{desc}</p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                                notificationPreferences[key]
                                  ? "border-primary bg-primary"
                                  : "border-white/20 bg-transparent"
                              }`}
                            >
                              {notificationPreferences[key] && <span className="text-black text-sm">✓</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                      <p>💡 <strong>Note:</strong> Email notifications can be configured separately from in-dashboard notifications. All preferences are saved automatically.</p>
                    </div>
                  </div>
                )}

                {activeSection === "feedback" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Send Us Feedback</h2>
                      <p className="text-sm text-zinc-400 mt-1">Help us improve by sharing your thoughts, bug reports, and feature requests.</p>
                    </div>
                    
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-zinc-300 mb-3"><strong>What would be helpful:</strong></p>
                      <ul className="space-y-1 text-sm text-zinc-400">
                        <li>• Features that would make your workflow easier</li>
                        <li>• Bugs or issues you've encountered</li>
                        <li>• Parts of the platform that feel confusing</li>
                        <li>• Things you're using that work well</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Your feedback</label>
                      <textarea
                        value={feedbackMessage}
                        onChange={(event) => setFeedbackMessage(event.target.value)}
                        rows={6}
                        placeholder="Tell us what's on your mind... Be as specific as you can!"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        onClick={() => {
                          setFeedbackMessage("");
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        className="bg-primary hover:bg-primary/90 text-white font-semibold"
                        onClick={() => {
                          if (!feedbackMessage.trim()) {
                            toast({
                              title: "Feedback is empty",
                              description: "Please share your thoughts before submitting.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // Send feedback via email
                          const subject = encodeURIComponent(`SYNTHIX Feedback from ${user?.displayName || "User"}`);
                          const body = encodeURIComponent(
                            `Feedback from: ${user?.displayName || "Anonymous"}\nEmail: ${user?.email || "N/A"}\n\nMessage:\n${feedbackMessage}`
                          );
                          window.location.href = `mailto:feedback@synthix.local?subject=${subject}&body=${body}`;
                          
                          // Reset form
                          setFeedbackMessage("");
                          toast({
                            title: "Thanks for your feedback!",
                            description: "Your message has been sent. We appreciate your input.",
                          });
                        }}
                      >
                        Send Feedback
                      </Button>
                    </div>

                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-sm text-emerald-200">
                        ✓ <strong>All feedback is valuable.</strong> Even a one-line suggestion helps us prioritize what matters most to our community.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "accounts" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Accounts</h2>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-white">Current Account</p>
                        <div className="mt-3 p-4 rounded-xl bg-primary/10 border border-primary/25">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold">{user?.displayName || "User"}</p>
                              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                            </div>
                            <div className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                              Active
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm font-medium text-white mb-3">Quick Actions</p>
                        <div className="space-y-3">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm text-zinc-400 mb-2">
                              Multiple account support allows you to switch between different seller accounts without logging out. This is useful if you manage multiple shops or businesses.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <Eye className="w-3 h-3" />
                              <span>Coming soon: Add and switch between accounts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Security</h2>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-white">Email verification</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {isVerified
                            ? "This account is verified."
                            : "You can verify your email to unlock additional features, but it's not required to create listings."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isVerified
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-yellow-500/15 text-yellow-200"
                          }`}
                        >
                          {isVerified ? "Verified" : "Not verified"}
                        </div>
                        {!isVerified ? (
                          <NeonButton
                            glowColor="primary"
                            onClick={() => void sendVerificationCode()}
                            disabled={isRequestingVerification}
                          >
                            {isRequestingVerification ? "Sending..." : "Send verification code"}
                          </NeonButton>
                        ) : null}
                      </div>
                      {!isVerified ? (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Input
                            value={verificationCode}
                            onChange={(event) => setVerificationCode(event.target.value)}
                            placeholder="Enter verification code or email"
                            className="bg-black/30 border-white/10 text-white flex-1"
                          />
                          <NeonButton
                            glowColor="primary"
                            onClick={() => void confirmVerificationCode()}
                            disabled={isConfirmingVerification}
                          >
                            {isConfirmingVerification ? "Verifying..." : "Verify email"}
                          </NeonButton>
                        </div>
                      ) : null}
                    </div>
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
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Sign out on this device</p>
                        <p className="mt-1 text-sm text-zinc-400">Logout has been moved into settings to keep the main header focused on browsing and orders.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                        onClick={() => void logout()}
                      >
                        Log out
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <ProfilePreviewModal
        isOpen={showProfilePreview}
        onOpenChange={setShowProfilePreview}
        user={user ? { ...user, ...form } : null}
      />
    </div>
  );
}

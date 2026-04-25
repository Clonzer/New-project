import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/supabase-auth-context";
import type { User } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, ChevronRight, ChevronLeft,
  Printer as PrinterIcon, Cpu, Layers, Package,
  Hammer, Wrench, PenLine, Sparkles, Plus, ArrowLeft, ArrowRight,
  UserPlus, Zap, LogIn,
} from "lucide-react";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/shared/Logo";
import {
  EQUIPMENT_CATEGORY_CHOICES,
  brandsForCategory,
  catalogItemsForCategoryAndBrand,
  catalogItemsForCategory,
  categoryLabel,
  type EquipmentCategoryId,
  type CatalogEquipmentItem,
} from "@/lib/equipment-catalog";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCreatePrinter, useUpdateUser } from "@/lib/workspace-stub";

function RegCategoryIcon({ cat }: { cat: EquipmentCategoryId }) {
  const cls = "w-5 h-5 text-white";
  if (cat === "printing_3d") return <PrinterIcon className={cls} />;
  if (cat === "woodworking") return <Hammer className={cls} />;
  if (cat === "metalworking") return <Wrench className={cls} />;
  if (cat === "services") return <PenLine className={cls} />;
  return <Sparkles className={cls} />;
}

const shopSchema = z.object({
  shopName: z.string().min(2, "Shop name is required"),
  bio: z.string().min(10, "Tell buyers a bit about yourself"),
  shopMode: z.enum(["catalog", "open", "both"]),
});

const printerDetailSchema = z.object({
  pricePerHour: z.coerce.number().min(0).optional(),
  pricePerGram: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  customBrand: z.string().optional(),
  customModel: z.string().optional(),
  customTechnology: z.string().optional(),
  customMaterials: z.string().optional(),
  customBuildVolume: z.string().optional(),
  customToolType: z.string().optional(),
});

type ShopValues = z.infer<typeof shopSchema>;
type PrinterValues = z.infer<typeof printerDetailSchema>;

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < step ? "w-8 bg-primary" : i === step ? "w-8 bg-primary/60" : "w-4 bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  /** 'choice' = select login/signup, 'signup' = account form, 'shop' = shop setup, 'equipment' = equipment selection */
  const [authMode, setAuthMode] = useState<'choice' | 'signup' | 'login' | 'shop' | 'equipment'>('signup');
  const [step, setStep] = useState(0);
  const [equipCategory, setEquipCategory] = useState<EquipmentCategoryId | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<CatalogEquipmentItem | null>(null);
  const [savedUser, setSavedUser] = useState<User | null>(null);

  const createPrinter = useCreatePrinter();
  const updateUser = useUpdateUser();

  const shopForm = useForm<ShopValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: { shopName: "", bio: "", shopMode: "both" },
  });

  const printerForm = useForm<PrinterValues>({
    resolver: zodResolver(printerDetailSchema),
    defaultValues: { pricePerHour: undefined, pricePerGram: undefined, description: "" },
  });

  const onAccountCreated = async (user: User) => {
    if (user.role === "buyer") {
      toast({ title: "Welcome! 🎉", description: "Your account is ready." });
      setLocation("/dashboard");
      return;
    }
    setSavedUser(user);
    setStep(1);
  };

  const submitShop = async (data: ShopValues) => {
    if (!savedUser) return;
    try {
      await updateUser.mutateAsync({
        userId: savedUser.id,
        data: {
          shopName: data.shopName,
          bio: data.bio,
          shopMode: data.shopMode,
        },
      });
      setStep(2);
    } catch (e) {
      toast({ title: "Could not save shop", description: getApiErrorMessage(e), variant: "destructive" });
    }
  };

  const submitPrinter = async (data: PrinterValues) => {
    if (!savedUser || !selectedPrinter) {
      setLocation("/dashboard");
      return;
    }

    const isOther = Boolean(selectedPrinter.isOther);
    const is3d = selectedPrinter.category === "printing_3d";
    const allowsHourlyRate = is3d || selectedPrinter.allowsHourlyRate !== false;
    if (isOther && !is3d && !(data.customToolType || "").trim()) {
      toast({ title: "Describe your equipment", description: "Add a short tool or service type.", variant: "destructive" });
      return;
    }
    const materials = isOther
      ? (data.customMaterials || "").split(",").map((m) => m.trim()).filter(Boolean)
      : [...selectedPrinter.materials];
    const toolOrServiceTypeVal = isOther
      ? (is3d ? null : (data.customToolType || "").trim() || null)
      : (selectedPrinter.toolOrServiceType ?? null);

    try {
      await createPrinter.mutateAsync({
        data: {
          userId: savedUser.id,
          equipmentCategory: selectedPrinter.category,
          toolOrServiceType: toolOrServiceTypeVal,
          name: isOther
            ? `${data.customBrand ?? ""} ${data.customModel ?? ""}`.trim() || (is3d ? "My 3D printer" : "My equipment")
            : `${selectedPrinter.brand} ${selectedPrinter.model}`.trim(),
          brand: isOther ? data.customBrand ?? "Other" : selectedPrinter.brand,
          model: isOther ? data.customModel ?? "" : selectedPrinter.model,
          technology: (is3d && isOther ? data.customTechnology ?? "FDM" : selectedPrinter.technology) as "FDM" | "SLA" | "SLS" | "MSLA" | "MJF" | "DMLS" | "other",
          materials,
          buildVolume: isOther ? data.customBuildVolume ?? null : selectedPrinter.buildVolume || null,
          pricePerHour: allowsHourlyRate ? data.pricePerHour ?? null : null,
          pricePerGram: is3d ? data.pricePerGram ?? null : null,
          description: data.description ?? null,
        },
      });
      toast({ title: "Shop ready! 🚀", description: "Your equipment is listed and your shop is live." });
    } catch (e) {
      toast({ title: "Equipment step failed", description: getApiErrorMessage(e), variant: "destructive" });
    }
    setLocation("/dashboard");
  };

  const skipPrinter = () => setLocation("/dashboard");

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.15),transparent)]" />
      
      {/* Animated Gradient - Bottom Right */}
      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(236,72,153,0.4) 50%, rgba(99,102,241,0.4) 100%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
      <motion.div
        className="absolute -bottom-48 -right-48 w-[32rem] h-[32rem] rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          <AnimatePresence mode="wait">

            {authMode === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg mx-auto"
              >
                {/* Logo/Brand */}
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-6"
                  >
                    <Zap className="w-10 h-10 text-primary" />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-5xl font-display font-bold text-white mb-3"
                  >
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Synthix</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-lg"
                  >
                    The future of 3D printing marketplace
                  </motion.p>
                </div>

                {/* Cards Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="grid gap-4"
                >
                  {/* Sign Up Card */}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 group-hover:border-cyan-400/50 transition-colors">
                        <UserPlus className="h-7 w-7 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                          Create Account
                        </h3>
                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                          Join thousands of makers and buyers. Set up your shop or start ordering today.
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>

                  {/* Login Card */}
                  <button
                    onClick={() => setLocation("/login")}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 text-left transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20 group-hover:border-white/40 group-hover:bg-white/15 transition-colors">
                        <LogIn className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          Sign In
                        </h3>
                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                          Welcome back! Access your dashboard, orders, and messages.
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  </button>
                </motion.div>

                {/* Footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-8 text-center text-sm text-zinc-500"
                >
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="text-zinc-400 hover:text-white underline underline-offset-2">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-zinc-400 hover:text-white underline underline-offset-2">
                    Privacy Policy
                  </Link>
                </motion.p>
              </motion.div>
            )}

            {authMode === 'signup' && step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl border border-white/10 bg-zinc-900/80 p-12 md:p-16"
              >
                <h1 className="text-4xl font-display font-bold text-white mb-2 text-center">Create account</h1>
                <p className="text-zinc-400 text-base text-center mb-6">
                  Join Synthix to start buying or selling
                </p>
                
                {/* Login toggle button */}
                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuthMode('login')}
                    className="border-white/20 text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Already have an account? Log in
                  </Button>
                </div>
                
                <RegistrationForm onRegistered={onAccountCreated} />
              </motion.div>
            )}

            {/* Login Mode */}
            {authMode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-3xl border border-white/10 bg-zinc-900/80 p-12 md:p-16"
              >
                <h1 className="text-4xl font-display font-bold text-white mb-2 text-center">Welcome back</h1>
                <p className="text-zinc-400 text-base text-center mb-6">
                  Sign in to your Synthix account
                </p>
                
                {/* Sign up toggle button */}
                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuthMode('signup')}
                    className="border-white/20 text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    New here? Create an account
                  </Button>
                </div>
                
                <LoginForm />
              </motion.div>
            )}

            {authMode === 'signup' && step === 1 && savedUser && savedUser.role === "both" && (
              <motion.div
                key="step-shop"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="rounded-3xl border border-white/10 bg-zinc-900/80 p-12 md:p-16"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Set up your shop</h2>
                    <p className="text-zinc-400 text-sm">Step 2 of 3 — This is what buyers see on your profile.</p>
                  </div>
                </div>

                <Form {...shopForm}>
                  <form onSubmit={shopForm.handleSubmit(submitShop)} className="space-y-5">
                    <FormField control={shopForm.control} name="shopName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Shop Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Jane's Workshop" className="bg-black/30 border-white/10 text-white h-12 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={shopForm.control} name="bio" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">About Your Shop</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Additive, woodworking, metal, design services — what you offer and your experience..."
                            rows={4}
                            className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div>
                      <p className="text-sm text-zinc-300 mb-3 font-medium">Shop Mode</p>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { value: "catalog" as const, label: "Catalog Only", icon: <Package className="w-4 h-4" />, desc: "Pre-listed models" },
                          { value: "open" as const, label: "Custom Jobs", icon: <Layers className="w-4 h-4" />, desc: "Any file uploads" },
                          { value: "both" as const, label: "Both", icon: <Cpu className="w-4 h-4" />, desc: "All order types" },
                        ]).map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => shopForm.setValue("shopMode", opt.value)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              shopForm.watch("shopMode") === opt.value
                                ? "border-primary bg-primary/15 text-white"
                                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <div className="flex justify-center mb-1">{opt.icon}</div>
                            <p className="text-xs font-medium">{opt.label}</p>
                            <p className="text-[10px] opacity-60 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setLocation("/dashboard")} className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm">
                        <ChevronLeft className="w-4 h-4" /> Skip for now
                      </button>
                      <NeonButton type="submit" glowColor="primary" className="flex-grow rounded-xl py-3" disabled={updateUser.isPending}>
                        {updateUser.isPending ? "Saving…" : "Next — add equipment"} <ChevronRight className="w-4 h-4 ml-1 inline" />
                      </NeonButton>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {authMode === 'signup' && step === 2 && savedUser && (
              <motion.div
                key="step-printer"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-12 md:p-16 mb-5">
                  <h2 className="text-xl font-bold text-white mb-1">Register your equipment</h2>
                  <p className="text-zinc-400 text-sm mb-2">Step 3 of 3 — 3D printing is one category; add shop tools, metal fab, or services too.</p>
                  <p className="text-zinc-500 text-xs mb-6">You can add more machines anytime from the dashboard.</p>

                  <AnimatePresence mode="wait">
                    {!equipCategory ? (
                      <motion.div key="reg-cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="text-zinc-400 text-sm mb-4">Choose a category first.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {EQUIPMENT_CATEGORY_CHOICES.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setEquipCategory(c.id);
                                setSelectedBrand(null);
                              }}
                              className="group glass-panel rounded-2xl border border-white/10 p-4 text-left hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                            >
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <RegCategoryIcon cat={c.id} />
                              </div>
                              <p className="text-white font-semibold text-sm">{c.title}</p>
                              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{c.blurb}</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : !selectedBrand ? (
                      <motion.div key="reg-brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedBrand(null)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> {categoryLabel(equipCategory)} brands
                        </button>
                        <p className="text-zinc-400 text-sm mb-4">{categoryLabel(equipCategory)} - choose a brand first.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {brandsForCategory(equipCategory).map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => setSelectedBrand(brand)}
                              className="group glass-panel rounded-2xl border border-white/10 p-4 text-left hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                            >
                              <p className="text-white font-semibold text-sm">{brand}</p>
                              <p className="text-zinc-500 text-xs mt-1">
                                {catalogItemsForCategoryAndBrand(equipCategory, brand).length} models
                              </p>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setSelectedBrand("Other")}
                            className="group glass-panel rounded-2xl border border-dashed border-zinc-600 p-4 text-left hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                          >
                            <p className="text-white font-semibold text-sm">Other / Custom</p>
                            <p className="text-zinc-500 text-xs mt-1">Add your own brand</p>
                          </button>
                        </div>
                      </motion.div>
                    ) : selectedBrand === "Other" ? (
                      <motion.div key="reg-custom-brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedBrand(null)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> {categoryLabel(equipCategory)} brands
                        </button>
                        <p className="text-zinc-400 text-sm mb-4">Enter your custom brand details.</p>
                        <div className="space-y-4">
                          <FormField
                            control={printerForm.control}
                            name="customBrand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300">Brand Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g. Creality, Prusa, Custom"
                                    className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={printerForm.control}
                            name="customModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300">Model Name *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g. Ender 3, MK3S"
                                    className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {equipCategory === "printing_3d" && (
                            <FormField
                              control={printerForm.control}
                              name="customTechnology"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300">Technology</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || "FDM"}>
                                    <FormControl>
                                      <SelectTrigger className="bg-black/30 border-white/10 text-white h-11 rounded-xl">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-black/90 border-white/10">
                                      <SelectItem value="FDM">FDM (Fused Deposition Modeling)</SelectItem>
                                      <SelectItem value="SLA">SLA (Stereolithography)</SelectItem>
                                      <SelectItem value="SLS">SLS (Selective Laser Sintering)</SelectItem>
                                      <SelectItem value="DLP">DLP (Digital Light Processing)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const brand = printerForm.getValues("customBrand");
                            const model = printerForm.getValues("customModel");
                            if (!brand || !model) {
                              toast({ title: "Required fields", description: "Brand and model name are required.", variant: "destructive" });
                              return;
                            }
                            setSelectedPrinter({
                              id: "custom",
                              category: equipCategory,
                              brand,
                              model,
                              technology: equipCategory === "printing_3d" ? (printerForm.getValues("customTechnology") || "FDM") : undefined,
                              materials: [],
                              buildVolume: null,
                              gradient: "from-zinc-600 to-zinc-800",
                              isOther: true,
                              allowsHourlyRate: true,
                            } as any);
                          }}
                          className="w-full mt-6 bg-primary text-white hover:bg-primary/90 rounded-xl"
                        >
                          Continue
                        </Button>
                      </motion.div>
                    ) : !selectedPrinter ? (
                      <motion.div key="reg-pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <button
                          type="button"
                          onClick={() => setEquipCategory(null)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> All categories
                        </button>
                        <p className="text-zinc-400 text-sm mb-4">{categoryLabel(equipCategory)} — pick a common setup or Other.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {catalogItemsForCategoryAndBrand(equipCategory, selectedBrand).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPrinter(p)}
                              className="group glass-panel rounded-2xl border border-white/10 p-4 text-left hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                            >
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                {p.category === "printing_3d" ? <PrinterIcon className="w-5 h-5 text-white" /> : <Wrench className="w-5 h-5 text-white" />}
                              </div>
                              <p className="text-white font-semibold text-sm leading-tight">{p.brand}</p>
                              <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{p.model || "Custom"}</p>
                              <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                p.category === "printing_3d" && p.technology === "FDM" ? "bg-blue-500/15 text-blue-400"
                                : p.category === "printing_3d" && p.technology === "SLA" ? "bg-orange-500/15 text-orange-400"
                                : p.category === "printing_3d" ? "bg-purple-500/15 text-purple-400"
                                : "bg-white/10 text-zinc-300"
                              }`}>
                                {p.category === "printing_3d" ? p.technology : (p.toolOrServiceType || "Shop")}
                              </span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              printerForm.setValue("customBrand", selectedBrand === "Other" ? "" : selectedBrand);
                              setSelectedPrinter({
                                id: "custom",
                                category: equipCategory,
                                brand: selectedBrand === "Other" ? "" : selectedBrand,
                                model: "",
                                technology: equipCategory === "printing_3d" ? "FDM" : undefined,
                                materials: [],
                                buildVolume: null,
                                gradient: "from-zinc-600 to-zinc-800",
                                isOther: true,
                                allowsHourlyRate: true,
                              } as any);
                            }}
                            className="group glass-panel rounded-2xl border border-dashed border-zinc-600 p-4 text-left hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <Plus className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-white font-semibold text-sm leading-tight">Other / Custom</p>
                            <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">Add your own model</p>
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="reg-details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        <button
                          type="button"
                          onClick={() => { setSelectedPrinter(null); printerForm.reset(); }}
                          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Change model
                        </button>

                        <div className="flex items-center gap-3 mb-6 p-4 bg-primary/10 border border-primary/25 rounded-2xl">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPrinter.gradient} flex items-center justify-center shrink-0`}>
                            {selectedPrinter.category === "printing_3d" ? <PrinterIcon className="w-6 h-6 text-white" /> : <Hammer className="w-6 h-6 text-white" />}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">{categoryLabel(selectedPrinter.category)}</p>
                            <p className="text-white font-bold">{selectedPrinter.brand} {selectedPrinter.model || "Custom"}</p>
                            <p className="text-xs text-zinc-400">
                              {selectedPrinter.category === "printing_3d"
                                ? `${selectedPrinter.technology} · ${selectedPrinter.buildVolume || "Custom"}`
                                : (selectedPrinter.buildVolume || "Capacity on request")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setSelectedPrinter(null); printerForm.reset(); }}
                            className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-white/5 shrink-0"
                          >
                            Change
                          </button>
                        </div>

                        <Form {...printerForm}>
                          <form onSubmit={printerForm.handleSubmit(submitPrinter)} className="space-y-5">
                            {selectedPrinter.isOther && (
                              <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-sm text-zinc-400 font-medium">
                                  {selectedPrinter.category === "printing_3d" ? "Printer details" : "Equipment details"}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField control={printerForm.control} name="customBrand" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-zinc-300 text-xs">Brand / maker</FormLabel>
                                      <FormControl><Input placeholder="e.g. DeWalt, Creality" className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                    </FormItem>
                                  )} />
                                  <FormField control={printerForm.control} name="customModel" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-zinc-300 text-xs">Model / name</FormLabel>
                                      <FormControl><Input placeholder="Model or service title" className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                    </FormItem>
                                  )} />
                                  {selectedPrinter.category === "printing_3d" && (
                                    <>
                                      <FormField control={printerForm.control} name="customTechnology" render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-zinc-300 text-xs">Process</FormLabel>
                                          <FormControl><Input placeholder="FDM, SLA, MSLA..." className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                      <FormField control={printerForm.control} name="customBuildVolume" render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-zinc-300 text-xs">Build volume</FormLabel>
                                          <FormControl><Input placeholder="e.g. 300×300×400 mm" className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                    </>
                                  )}
                                  {selectedPrinter.category !== "printing_3d" && (
                                    <>
                                      <FormField control={printerForm.control} name="customToolType" render={({ field }) => (
                                        <FormItem className="col-span-2">
                                          <FormLabel className="text-zinc-300 text-xs">Tool or service type *</FormLabel>
                                          <FormControl><Input placeholder="e.g. CNC router, TIG welding, laser cutting" className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                      <FormField control={printerForm.control} name="customBuildVolume" render={({ field }) => (
                                        <FormItem className="col-span-2">
                                          <FormLabel className="text-zinc-300 text-xs">Work area / capacity</FormLabel>
                                          <FormControl><Input placeholder="Table size, travel, tonnage, etc." className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                    </>
                                  )}
                                </div>
                                <FormField control={printerForm.control} name="customMaterials" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-zinc-300 text-xs">
                                      {selectedPrinter.category === "printing_3d" ? "Materials (comma-separated)" : "Materials / capabilities (comma-separated)"}
                                    </FormLabel>
                                    <FormControl><Input placeholder={selectedPrinter.category === "printing_3d" ? "PLA, PETG, resin..." : "Steel, hardwood, acrylic..."} className="bg-black/30 border-white/10 text-white h-10 rounded-xl text-sm" {...field} /></FormControl>
                                  </FormItem>
                                )} />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              {(selectedPrinter.category === "printing_3d" || selectedPrinter.allowsHourlyRate !== false) && (
                                <FormField control={printerForm.control} name="pricePerHour" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-zinc-300">Hourly rate ($)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="e.g. 45" className="bg-black/30 border-white/10 text-white h-12 rounded-xl" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              )}
                              {selectedPrinter.category === "printing_3d" && (
                                <FormField control={printerForm.control} name="pricePerGram" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-zinc-300">Price per gram ($) <span className="text-zinc-600">3D only</span></FormLabel>
                                    <FormControl><Input type="number" step="0.001" placeholder="e.g. 0.05" className="bg-black/30 border-white/10 text-white h-12 rounded-xl" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              )}
                            </div>

                            <FormField control={printerForm.control} name="description" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300">Notes <span className="text-zinc-600">(optional)</span></FormLabel>
                                <FormControl>
                                  <textarea
                                    placeholder="Lead times, certifications, what buyers should know..."
                                    rows={3}
                                    className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )} />

                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => { setStep(1); setEquipCategory(null); setSelectedPrinter(null); printerForm.reset(); }}
                                className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm"
                              >
                                <ChevronLeft className="w-4 h-4" /> Back
                              </button>
                              <NeonButton type="submit" glowColor="primary" className="flex-grow rounded-xl py-3" disabled={createPrinter.isPending}>
                                {createPrinter.isPending ? "Registering..." : "Complete setup 🎉"}
                              </NeonButton>
                            </div>
                          </form>
                        </Form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!selectedPrinter && (
                    <button type="button" onClick={skipPrinter} className="w-full mt-4 text-center text-zinc-500 hover:text-zinc-300 transition-colors text-sm py-2">
                      Skip for now — add equipment later in the dashboard
                    </button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-center text-zinc-600 text-xs mt-6">
            By joining, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-zinc-400">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-zinc-400">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

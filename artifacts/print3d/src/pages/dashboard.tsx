import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import {
  useListOrders, useListListings, useListPrinters, useUpdateOrderStatus,
  useCreatePrinter, useUpdatePrinter, useDeletePrinter, useCreateListing,
  useListReviews, getListOrdersQueryKey, getListListingsQueryKey, getListPrintersQueryKey, getListReviewsQueryKey,
  useListEquipmentGroups, useCreateEquipmentGroup, useUpdateEquipmentGroup, useDeleteEquipmentGroup,
  useDeleteListing,
} from "@/lib/workspace-stub";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp, DollarSign,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, ArrowRight, ChevronLeft,
  Hammer, Wrench, PenLine, Sparkles, Trophy, Info, Edit, Trash2, Store,
  ShoppingBag, MessageSquare, Megaphone, Wallet, CreditCard, Receipt,
} from "lucide-react";
import {
  EQUIPMENT_CATEGORY_CHOICES,
  brandsForCategory,
  catalogItemsForCategoryAndBrand,
  categoryLabel,
  type EquipmentCategoryId,
  type CatalogEquipmentItem,
} from "@/lib/equipment-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getApiErrorMessage, getApiErrorMessageWithSupport } from "@/lib/api-error";
import { OwnerAdminPanel } from "@/components/dashboard/OwnerAdminPanel";
import { Analytics } from "@/components/dashboard/Analytics";
import { Overview } from "@/components/dashboard/Overview";
import { Purchases } from "@/components/dashboard/Purchases";
import { Reviews } from "@/components/dashboard/Reviews";
import { Sales } from "@/components/dashboard/Sales";
import { Listings } from "@/components/dashboard/Listings";
import { Equipment } from "@/components/dashboard/Equipment";
import { ShippingProfiles } from "@/components/dashboard/ShippingProfiles";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { SponsoredShopsInjection } from "@/components/sections/SponsoredShopsInjection";
import CustomOrders from "@/components/dashboard/CustomOrders";
import BuyerCustomOrders from "@/components/dashboard/BuyerCustomOrders";

function EquipmentCategoryIcon({ cat }: { cat: EquipmentCategoryId }) {
  const cls = "w-5 h-5 text-white";
  if (cat === "printing_3d") return <PrinterIcon className={cls} />;
  if (cat === "woodworking") return <Hammer className={cls} />;
  if (cat === "metalworking") return <Wrench className={cls} />;
  if (cat === "services") return <PenLine className={cls} />;
  return <Sparkles className={cls} />;
}

const CATEGORIES = ["Mechanical", "Miniatures", "Cosplay", "Functional", "Art", "Jewelry", "Architecture", "Toys", "Tools", "Home Decor", "Gadgets", "Automotive", "Electronics", "Fashion", "Gaming", "Education", "Prototypes", "Replacement Parts", "Figures", "Models", "Props", "Signage", "Fixtures", "Custom", "Other"];

const SERVICE_CATEGORIES = ["Woodworking", "Steel Work", "Metalworking", "CNC Services", "Welding", "Fabrication", "Custom Design", "3D Modeling", "CAD Design", "Laser Cutting", "Waterjet Cutting", "Powder Coating", "Finishing", "Assembly", "Prototyping", "Consulting", "Other"];

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

// ─── Register equipment dialog (multi-category) ─────────────────────────────
function RegisterPrinterDialog({ open, onClose, userId, onSuccess }: {
  open: boolean; onClose: () => void; userId: string; onSuccess: () => void;
}) {
  const { toast } = useToast();
  const createPrinter = useCreatePrinter();
  const [equipCategory, setEquipCategory] = useState<EquipmentCategoryId | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selected, setSelected] = useState<CatalogEquipmentItem | null>(null);
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerGram, setPricePerGram] = useState("");
  const [description, setDescription] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customTech, setCustomTech] = useState("");
  const [customMaterials, setCustomMaterials] = useState("");
  const [customVolume, setCustomVolume] = useState("");
  const [customToolType, setCustomToolType] = useState("");

  const reset = () => {
    setEquipCategory(null); setSelectedBrand(null); setSelected(null); setPricePerHour(""); setPricePerGram(""); setDescription("");
    setCustomBrand(""); setCustomModel(""); setCustomTech(""); setCustomMaterials(""); setCustomVolume("");
    setCustomToolType("");
  };

  const handleClose = () => { reset(); onClose(); };

  const is3d = selected?.category === "printing_3d";
  const isOther = Boolean(selected?.isOther);
  const allowsHourlyRate = is3d || selected?.allowsHourlyRate !== false;

  const handleSubmit = async () => {
    if (!selected) return;
    if (isOther && !is3d && !customToolType.trim()) {
      toast({ title: "Add a short name", description: "Describe the tool, machine, or service type.", variant: "destructive" });
      return;
    }
    const materials = isOther
      ? customMaterials.split(",").map(m => m.trim()).filter(Boolean)
      : [...selected.materials];
    const toolOrServiceTypeVal = isOther
      ? (is3d ? null : customToolType.trim() || null)
      : (selected.toolOrServiceType ?? null);
    try {
      await createPrinter.mutateAsync({
        data: {
          userId,
          equipmentCategory: selected.category,
          toolOrServiceType: toolOrServiceTypeVal,
          name: isOther
            ? `${customBrand} ${customModel}`.trim() || (is3d ? "My 3D printer" : "My equipment")
            : `${selected.brand} ${selected.model}`.trim(),
          brand: isOther ? customBrand || "Other" : selected.brand,
          model: isOther ? customModel || "" : selected.model,
          technology: (is3d && isOther ? customTech || "FDM" : selected.technology) as any,
          materials,
          buildVolume: isOther ? customVolume || null : selected.buildVolume || null,
          pricePerHour: allowsHourlyRate && pricePerHour ? parseFloat(pricePerHour) : null,
          pricePerGram: is3d && pricePerGram ? parseFloat(pricePerGram) : null,
          description: description || null,
        },
      });
      toast({ title: "Equipment registered!", description: "Buyers can see this on your shop." });
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast({ title: "Failed to register equipment", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Add equipment</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm font-normal pt-1">3D printers, shop tools, metal fab, design services — list what you actually run.</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!equipCategory ? (
            <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-zinc-400 text-sm mb-4">Choose a category first.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EQUIPMENT_CATEGORY_CHOICES.map(c => (
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
                      <EquipmentCategoryIcon cat={c.id} />
                    </div>
                    <p className="text-white font-semibold text-sm">{c.title}</p>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{c.blurb}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : !selectedBrand ? (
            <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button type="button" variant="ghost" onClick={() => setSelectedBrand(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 mb-4 -ml-2">
                <ChevronLeft className="w-4 h-4" /> Back to categories
              </Button>
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
            <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button type="button" variant="ghost" onClick={() => setSelectedBrand(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 mb-4 -ml-2">
                <ChevronLeft className="w-4 h-4" /> Back to brands
              </Button>
              <p className="text-zinc-400 text-sm mb-4">Enter your custom brand details.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Brand Name *</label>
                  <Input value={customBrand} onChange={e => setCustomBrand(e.target.value)} placeholder="e.g. Creality, Prusa, Custom" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm text-zinc-300 block mb-1.5">Model Name *</label>
                  <Input value={customModel} onChange={e => setCustomModel(e.target.value)} placeholder="e.g. Ender 3, MK3S" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
                </div>
                {is3d && (
                  <div>
                    <label className="text-sm text-zinc-300 block mb-1.5">Technology</label>
                    <Select value={customTech || "FDM"} onValueChange={setCustomTech}>
                      <SelectTrigger className="bg-black/30 border-white/10 text-white h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10">
                        <SelectItem value="FDM">FDM (Fused Deposition Modeling)</SelectItem>
                        <SelectItem value="SLA">SLA (Stereolithography)</SelectItem>
                        <SelectItem value="SLS">SLS (Selective Laser Sintering)</SelectItem>
                        <SelectItem value="DLP">DLP (Digital Light Processing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => {
                  if (!customBrand.trim() || !customModel.trim()) {
                    toast({ title: "Required fields", description: "Brand and model name are required.", variant: "destructive" });
                    return;
                  }
                  setSelected({
                    id: "custom",
                    category: equipCategory,
                    brand: customBrand,
                    model: customModel,
                    technology: is3d ? (customTech as any) || "FDM" : undefined,
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
          ) : !selected ? (
            <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button type="button" variant="ghost" onClick={() => setEquipCategory(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 mb-4 -ml-2">
                <ChevronLeft className="w-4 h-4" /> Back to all categories
              </Button>
              <p className="text-zinc-400 text-sm mb-4">{categoryLabel(equipCategory)} — pick a common setup or Other.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {catalogItemsForCategoryAndBrand(equipCategory, selectedBrand).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p)}
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
                    setCustomBrand(selectedBrand === "Other" ? customBrand : selectedBrand);
                    setSelected({
                      id: "custom",
                      category: equipCategory,
                      brand: selectedBrand === "Other" ? customBrand : selectedBrand,
                      model: "",
                      technology: is3d ? "FDM" : undefined,
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
            <motion.div key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Button type="button" variant="ghost" onClick={() => setSelected(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5 mb-4 -ml-2">
                <ChevronLeft className="w-4 h-4" /> Change model
              </Button>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/25 mb-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selected.gradient} flex items-center justify-center shrink-0`}>
                  {selected.category === "printing_3d" ? <PrinterIcon className="w-6 h-6 text-white" /> : <Hammer className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{categoryLabel(selected.category)}</p>
                  <p className="text-white font-bold">{selected.brand} {selected.model || "Custom"}</p>
                  <p className="text-xs text-zinc-400">
                    {is3d ? `${selected.technology} · ${selected.buildVolume || "Custom"}` : (selected.buildVolume || "Capacity on request")}
                  </p>
                </div>
              </div>

              {isOther && (
                <div className="space-y-3 mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-zinc-400 font-medium mb-2">{is3d ? "Printer details" : "Equipment details"}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Brand / maker</label>
                      <Input value={customBrand} onChange={e => setCustomBrand(e.target.value)} placeholder="e.g. DeWalt" className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Model / name</label>
                      <Input value={customModel} onChange={e => setCustomModel(e.target.value)} placeholder="e.g. Model or service title" className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                    </div>
                    {is3d && (
                      <>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Process</label>
                          <Input value={customTech} onChange={e => setCustomTech(e.target.value)} placeholder="FDM, SLA, MSLA..." className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Build volume</label>
                          <Input value={customVolume} onChange={e => setCustomVolume(e.target.value)} placeholder="300×300×400 mm" className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                        </div>
                      </>
                    )}
                    {!is3d && (
                      <>
                        <div className="col-span-2">
                          <label className="text-xs text-zinc-400 block mb-1">Tool or service type *</label>
                          <Input value={customToolType} onChange={e => setCustomToolType(e.target.value)} placeholder="e.g. CNC router, TIG welding, laser cutting" className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-zinc-400 block mb-1">Work area / capacity</label>
                          <Input value={customVolume} onChange={e => setCustomVolume(e.target.value)} placeholder="Table size, travel, tonnage, etc." className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">{is3d ? "Materials (comma-separated)" : "Materials / capabilities (comma-separated)"}</label>
                    <Input value={customMaterials} onChange={e => setCustomMaterials(e.target.value)} placeholder={is3d ? "PLA, PETG, aluminum..." : "Steel, hardwood, acrylic..."} className="bg-black/30 border-white/10 text-white h-10 text-sm rounded-xl" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {allowsHourlyRate && (
                  <div>
                    <label className="text-sm text-zinc-300 block mb-1.5">Hourly rate ($)</label>
                    <Input type="number" step="0.01" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} placeholder="e.g. 45" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
                  </div>
                )}
                {is3d && (
                  <div>
                    <label className="text-sm text-zinc-300 block mb-1.5">Price per gram ($) <span className="text-zinc-600">3D only</span></label>
                    <Input type="number" step="0.001" value={pricePerGram} onChange={e => setPricePerGram(e.target.value)} placeholder="e.g. 0.05" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label className="text-sm text-zinc-300 block mb-1.5">Notes (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Certifications, lead times, what buyers should know..."
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                />
              </div>

              <NeonButton
                glowColor="primary"
                className="w-full rounded-xl py-3"
                onClick={handleSubmit}
                disabled={createPrinter.isPending}
              >
                {createPrinter.isPending ? "Saving..." : "Save equipment"}
              </NeonButton>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function EditPrinterDialog({ open, onClose, printer, onSuccess }: {
  open: boolean; onClose: () => void; printer: any; onSuccess: () => void;
}) {
  const { toast } = useToast();
  const updatePrinter = useUpdatePrinter();
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerGram, setPricePerGram] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");

  useEffect(() => {
    if (printer) {
      setPricePerHour(printer.price_per_hour?.toString() || "");
      setPricePerGram(printer.price_per_gram?.toString() || "");
      setDescription(printer.description || "");
      setMaterials(Array.isArray(printer.materials) ? printer.materials.join(", ") : printer.materials || "");
    }
  }, [printer]);

  const handleSubmit = async () => {
    if (!printer) return;
    try {
      await updatePrinter.mutateAsync({
        printerId: printer.id,
        data: {
          pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
          pricePerGram: pricePerGram ? parseFloat(pricePerGram) : null,
          description: description || null,
          materials: materials ? materials.split(",").map(m => m.trim()).filter(Boolean) : null,
        },
      });
      toast({ title: "Equipment updated!", description: "Your changes have been saved." });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Update error:', error);
      toast({ title: "Failed to update equipment", variant: "destructive" });
    }
  };

  const is3d = printer?.equipment_category === "printing_3d";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Equipment</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm font-normal pt-1">
            {printer?.name} - {printer?.brand} {printer?.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Hourly rate ($)</label>
              <Input type="number" step="0.01" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} placeholder="e.g. 45" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
            </div>
            {is3d && (
              <div>
                <label className="text-sm text-zinc-300 block mb-1.5">Price per gram ($)</label>
                <Input type="number" step="0.001" value={pricePerGram} onChange={e => setPricePerGram(e.target.value)} placeholder="e.g. 0.05" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Materials (comma-separated)</label>
            <Input value={materials} onChange={e => setMaterials(e.target.value)} placeholder="PLA, PETG, aluminum..." className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          </div>

          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Notes (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Certifications, lead times, what buyers should know..."
              rows={3}
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
            />
          </div>

          <NeonButton
            glowColor="primary"
            className="w-full rounded-xl py-3"
            onClick={handleSubmit}
            disabled={updatePrinter.isPending}
          >
            {updatePrinter.isPending ? "Saving..." : "Save changes"}
          </NeonButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Listing Dialog ───────────────────────────────────────────────────────
function AddListingDialog({ open, onClose, sellerId, onSuccess }: {
  open: boolean; onClose: () => void; sellerId: number; onSuccess: () => void;
}) {
  const { toast } = useToast();
  const createListing = useCreateListing();
  const [form, setForm] = useState({
    title: "", category: "Functional", imageUrl: "", basePrice: "", shippingCost: "",
    estimatedDaysMin: "3", estimatedDaysMax: "7", material: "", description: "", tags: "", stock: "",
    listingType: "product", serviceCategory: "", serviceType: "",
  });

  const handleChange = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.basePrice) {
      toast({ title: "Title and price are required", variant: "destructive" }); return;
    }
    try {
      const ship = form.shippingCost.trim() === "" ? 0 : parseFloat(form.shippingCost);
      await createListing.mutateAsync({
        data: {
          sellerId,
          title: form.title,
          description: form.description || null,
          category: form.category,
          tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
          imageUrl: form.imageUrl || null,
          basePrice: parseFloat(form.basePrice),
          shippingCost: Number.isFinite(ship) ? ship : 0,
          estimatedDaysMin: parseInt(form.estimatedDaysMin),
          estimatedDaysMax: parseInt(form.estimatedDaysMax),
          material: form.material || null,
          color: null,
          listingType: form.listingType,
          serviceCategory: form.serviceCategory || null,
          serviceType: form.serviceType || null,
        },
      });
      toast({ title: "Listing added!", description: "Your model is now live in the catalog." });
      onClose();
      onSuccess();
    } catch (error) {
      toast({ title: "Failed to create listing", description: getApiErrorMessageWithSupport(error, "creating your listing"), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Add Catalog Listing</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">Create a new catalog listing for your shop.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Listing Type</label>
            <div className="flex gap-2">
              <button onClick={() => handleChange("listingType", "product")} className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${form.listingType === "product" ? "bg-primary text-white border border-primary" : "glass-panel border border-white/10 text-zinc-400 hover:text-white"}`}>
                Product
              </button>
              <button onClick={() => handleChange("listingType", "service")} className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${form.listingType === "service" ? "bg-primary text-white border border-primary" : "glass-panel border border-white/10 text-zinc-400 hover:text-white"}`}>
                Service
              </button>
            </div>
          </div>
          {form.listingType === "service" && (
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Service Category</label>
              <div className="flex flex-wrap gap-2">
                {["Woodworking", "Steel Work", "Metalworking", "CNC Services", "Welding", "Fabrication", "Custom Design", "Other"].map(cat => (
                  <button key={cat} onClick={() => handleChange("serviceCategory", cat)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${form.serviceCategory === cat ? "bg-primary text-white border border-primary" : "glass-panel border border-white/10 text-zinc-400 hover:text-white"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Title *</label>
            <Input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="e.g. Articulated Dragon" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleChange("category", cat)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${form.category === cat ? "bg-primary text-white border border-primary" : "glass-panel border border-white/10 text-zinc-400 hover:text-white"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Base Price ($) *</label>
              <Input type="number" step="0.01" value={form.basePrice} onChange={e => handleChange("basePrice", e.target.value)} placeholder="e.g. 24.99" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Stock Quantity</label>
              <Input type="number" value={form.stock} onChange={e => handleChange("stock", e.target.value)} placeholder="e.g. 10" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Shipping ($)</label>
            <div className="flex gap-2">
              <Input type="number" step="0.01" value={form.shippingCost} onChange={e => handleChange("shippingCost", e.target.value)} placeholder="e.g. 5.99" className="bg-black/30 border-white/10 text-white h-11 rounded-xl flex-1" />
              <Button type="button" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Use Profile
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Configure shipping profiles in the Shipping Profiles tab</p>
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Primary Material</label>
            <Input value={form.material} onChange={e => handleChange("material", e.target.value)} placeholder="PLA, PETG..." className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Est. Days Min</label>
              <Input type="number" value={form.estimatedDaysMin} onChange={e => handleChange("estimatedDaysMin", e.target.value)} className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-1.5">Est. Days Max</label>
              <Input type="number" value={form.estimatedDaysMax} onChange={e => handleChange("estimatedDaysMax", e.target.value)} className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Listing image</label>
            <Input
              type="file"
              accept="image/*"
              className="bg-black/30 border-white/10 text-white h-11 rounded-xl text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-xs file:text-white"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => handleChange("imageUrl", typeof r.result === "string" ? r.result : "");
                r.readAsDataURL(f);
              }}
            />
            {form.imageUrl && form.imageUrl.startsWith("data:") && (
              <p className="text-xs text-emerald-400 mt-1">Image attached (uploaded)</p>
            )}
            <label className="text-sm text-zinc-500 block mt-3 mb-1">Or paste image URL</label>
            <Input value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={e => handleChange("imageUrl", e.target.value)} placeholder="https://..." className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Tags (comma-separated)</label>
            <Input value={form.tags} onChange={e => handleChange("tags", e.target.value)} placeholder="dragon, articulated, flexible..." className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Describe the model, print settings, etc."
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
            />
          </div>
          <NeonButton glowColor="primary" className="w-full rounded-xl py-3" onClick={handleSubmit} disabled={createListing.isPending}>
            {createListing.isPending ? "Creating..." : "Add to Catalog"}
          </NeonButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Equipment Group Dialog ──────────────────────────────────────────────────
function EquipmentGroupDialog({ 
  open, 
  onClose, 
  onSubmit, 
  initialData 
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; category: string }) => void;
  initialData?: any;
}) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "printing_3d"
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.category) return;
    onSubmit(form);
  };

  const reset = () => {
    setForm({
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "printing_3d"
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {initialData ? "Edit Equipment Group" : "Create Equipment Group"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            {initialData ? "Update the equipment group details." : "Organize your equipment into groups for better product transparency."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Group Name *</label>
            <Input 
              value={form.name} 
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Professional FDM Printers"
              className="bg-black/30 border-white/10 text-white h-11 rounded-xl" 
            />
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Category *</label>
            <Select value={form.category} onValueChange={value => setForm(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-black/30 border-white/10 text-white h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="printing_3d">3D Printing</SelectItem>
                <SelectItem value="woodworking">Woodworking</SelectItem>
                <SelectItem value="metalworking">Metalworking</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-zinc-300 block mb-1.5">Description (Optional)</label>
            <Textarea 
              value={form.description} 
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this group contains..."
              className="bg-black/30 border-white/10 text-white rounded-xl min-h-[80px]" 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 border-white/10 text-zinc-300 hover:bg-white/5">
              Cancel
            </Button>
            <NeonButton 
              glowColor="primary" 
              onClick={handleSubmit} 
              disabled={!form.name.trim() || !form.category}
              className="flex-1 rounded-xl"
            >
              {initialData ? "Update Group" : "Create Group"}
            </NeonButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [togglingPrinterId, setTogglingPrinterId] = useState<number | null>(null);
  const [deletingPrinterId, setDeletingPrinterId] = useState<string | null>(null);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [showAddEquipmentGroup, setShowAddEquipmentGroup] = useState(false);
  const [editingEquipmentGroup, setEditingEquipmentGroup] = useState<any>(null);
  const [editingPrinter, setEditingPrinter] = useState<any>(null);
  const [defaultTab, setDefaultTab] = useState("overview");
  const [dashboardView, setDashboardView] = useState<"purchases" | "store">("purchases");
  const [acceptingOrders, setAcceptingOrders] = useState(true);

  // Helper function to check if user is a seller
  function isSeller(role?: string) { return role === "seller" || role === "both"; }
  const isSellerUser = isSeller(user?.role);

  // Fetch accepting orders status from database
  useEffect(() => {
    const fetchAcceptingStatus = async () => {
      if (!user?.id || !isSellerUser) return;
      
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('accepting_orders')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setAcceptingOrders(data.accepting_orders !== false);
        }
      } catch {
        // Default to true if fetch fails
        setAcceptingOrders(true);
      }
    };
    
    fetchAcceptingStatus();
  }, [user?.id, isSellerUser]);

  // Save accepting orders status to database
  const toggleAcceptingOrders = async () => {
    const newValue = !acceptingOrders;
    setAcceptingOrders(newValue);
    
    if (user?.id) {
      try {
        await supabase
          .from('sellers')
          .update({ accepting_orders: newValue, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        
        toast({
          title: newValue ? "Now Accepting Orders" : "Not Accepting Orders",
          description: newValue 
            ? "Your shop is now visible and customers can place orders."
            : "Your shop and products are now hidden from browse/search.",
        });
      } catch {
        // Silent fail - UI already updated
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const plan = params.get("plan");
    const sponsorship = params.get("sponsorship");
    const savedTab = localStorage.getItem('dashboardTab');
    const viewParam = params.get("view") as "purchases" | "store" | null;

    if (viewParam) {
      setDashboardView(viewParam);
    }

    if (savedTab) {
      setDefaultTab(savedTab);
      localStorage.removeItem('dashboardTab');
    } else {
      setDefaultTab("overview");
    }

    if (checkout === "success") {
      if (plan) {
        // Auto-apply plan tier
        toast({
          title: "Plan upgraded successfully!",
          description: `Your account has been upgraded to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`,
        });
      } else if (sponsorship) {
        // Auto-apply sponsorship
        toast({
          title: "Sponsorship activated!",
          description: "Your sponsorship is now active and will expire automatically.",
        });
      } else {
        toast({
          title: "Payment received",
          description: "Your order will appear here as soon as Stripe confirms the checkout webhook.",
        });
      }
      params.delete("checkout");
      params.delete("plan");
      params.delete("sponsorship");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `/dashboard?${next}` : "/dashboard");
    }
  }, [toast]);

  const purchaseParams = { buyerId: user?.id };
  const salesParams = { sellerId: user?.id };
  const listingParams = { sellerId: user?.id, userId: user?.id };
  const printerParams = { userId: user?.id };
  const writtenReviewParams = { reviewerId: user?.id };
  const receivedReviewParams = { revieweeId: user?.id };
  const { data: myPurchases, refetch: refetchPurchases } = useListOrders(purchaseParams, {
    query: { enabled: !!user, queryKey: getListOrdersQueryKey(purchaseParams) },
  });
  const { data: mySales, refetch: refetchSales } = useListOrders(salesParams, {
    query: { enabled: !!user && isSeller(user?.role), queryKey: getListOrdersQueryKey(salesParams) },
  });
  const { data: myListings, refetch: refetchListings } = useListListings(listingParams, {
    query: { enabled: !!user && isSeller(user?.role), queryKey: getListListingsQueryKey(listingParams) },
  });
  const { data: myPrinters, refetch: refetchPrinters } = useListPrinters(printerParams, {
    query: { enabled: !!user && isSeller(user?.role), queryKey: getListPrintersQueryKey(printerParams) },
  });
  const { data: myEquipmentGroups, refetch: refetchEquipmentGroups } = useListEquipmentGroups({
    query: { enabled: !!user && isSeller(user?.role) },
  });
  const { data: myReviews } = useListReviews(writtenReviewParams, {
    query: { enabled: !!user, queryKey: getListReviewsQueryKey(writtenReviewParams) },
  });
  const { data: reviewsReceived } = useListReviews(receivedReviewParams, {
    query: { enabled: !!user && isSeller(user?.role), queryKey: getListReviewsQueryKey(receivedReviewParams) },
  });

  const updateStatus = useUpdateOrderStatus();
  const updatePrinter = useUpdatePrinter();
  const deletePrinter = useDeletePrinter();
  const createEquipmentGroup = useCreateEquipmentGroup();
  const updateEquipmentGroup = useUpdateEquipmentGroup();
  const deleteEquipmentGroup = useDeleteEquipmentGroup();
  const deleteListing = useDeleteListing();

  const advanceStatus = async (orderId: number, nextStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateStatus.mutateAsync({ orderId, data: { status: nextStatus as any } });
      toast({ title: "Order updated!", description: `Status changed to ${nextStatus}.` });
      refetchSales(); refetchPurchases();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const removePrinter = async (printerId: number) => {
    setDeletingPrinterId(printerId);
    try {
      await deletePrinter.mutateAsync({ printerId });
      toast({ title: "Equipment removed", description: "This item is no longer on your shop." });
      refetchPrinters();
    } catch {
      toast({ title: "Could not remove printer", variant: "destructive" });
    } finally {
      setDeletingPrinterId(null);
    }
  };

  const togglePrinter = async (printerId: string, currentActive: boolean) => {
    setTogglingPrinterId(printerId);
    try {
      await updatePrinter.mutateAsync({ printerId, data: { isActive: !currentActive } });
      toast({ title: !currentActive ? "Equipment activated!" : "Equipment hidden", description: !currentActive ? "Buyers can see this on your shop." : "This item is hidden from your public shop." });
      refetchPrinters();
    } catch {
      toast({ title: "Failed to update printer", variant: "destructive" });
    } finally {
      setTogglingPrinterId(null);
    }
  };

  const handleUpdateEquipmentStatus = async (printerId: string, status: string) => {
    try {
      await updatePrinter.mutateAsync({ printerId, data: { equipmentStatus: status } });
      toast({ title: "Equipment status updated", description: `Equipment marked as ${status}` });
      refetchPrinters();
    } catch {
      toast({ title: "Failed to update equipment status", variant: "destructive" });
    }
  };

  const handleCreateEquipmentGroup = async (data: { name: string; description?: string; category: string }) => {
    try {
      await createEquipmentGroup.mutateAsync({ data });
      toast({ title: "Equipment group created!", description: "You can now assign equipment to this group." });
      refetchEquipmentGroups();
      setShowAddEquipmentGroup(false);
    } catch (error) {
      toast({ title: "Failed to create equipment group", variant: "destructive" });
    }
  };

  const handleUpdateEquipmentGroup = async (groupId: number, data: { name: string; description?: string; category: string }) => {
    try {
      await updateEquipmentGroup.mutateAsync({ groupId, data });
      toast({ title: "Equipment group updated!", description: "Changes have been saved." });
      refetchEquipmentGroups();
      setEditingEquipmentGroup(null);
    } catch (error) {
      toast({ title: "Failed to update equipment group", variant: "destructive" });
    }
  };

  const handleDeleteEquipmentGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this equipment group? Equipment assigned to it will be unassigned.")) return;
    try {
      await deleteEquipmentGroup.mutateAsync({ groupId });
      toast({ title: "Equipment group deleted!", description: "Equipment has been unassigned." });
      refetchEquipmentGroups();
    } catch (error) {
      toast({ title: "Failed to delete equipment group", variant: "destructive" });
    }
  };

  const handleAssignToGroup = async (printerId: string, groupId: string | null) => {
    try {
      await updatePrinter.mutateAsync({ printerId, data: { equipmentGroupId: groupId } });
      refetchPrinters();
    } catch (error) {
      toast({ title: "Failed to assign to group", variant: "destructive" });
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    try {
      await deleteListing.mutateAsync({ listingId });
      toast({ title: "Listing deleted!", description: "Your listing has been removed from the catalog." });
      refetchListings();
    } catch (error) {
      toast({ title: "Failed to delete listing", variant: "destructive" });
    }
  };

  const totalRevenue = (mySales?.orders ?? []).filter(o => o.status === "delivered" || o.status === "shipped").reduce((sum, o) => sum + (o.totalPrice - o.platformFee), 0);
  const pendingRevenue = (mySales?.orders ?? []).filter(o => o.status === "pending" || o.status === "accepted" || o.status === "printing").reduce((sum, o) => sum + (o.totalPrice - o.platformFee), 0);
  const totalFeesPaid = (mySales?.orders ?? []).reduce((sum, o) => sum + o.platformFee, 0);
  const averageOrderValue = (mySales?.orders ?? []).length ? totalRevenue / (mySales?.orders ?? []).length : 0;
  const activeEquipmentCount = myPrinters?.filter((printer) => printer.is_active).length ?? 0;
  const totalCatalogItems = myListings?.listings.length ?? 0;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center glass-panel p-12 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
            <p className="text-zinc-400 mb-6">Please sign in to access your dashboard.</p>
            <Link href="/login"><NeonButton glowColor="primary">Sign In</NeonButton></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Dialogs */}
      <RegisterPrinterDialog
        open={showAddPrinter}
        onClose={() => setShowAddPrinter(false)}
        userId={user.id}
        onSuccess={refetchPrinters}
      />
      <EditPrinterDialog
        open={!!editingPrinter}
        onClose={() => setEditingPrinter(null)}
        printer={editingPrinter}
        onSuccess={refetchPrinters}
      />
      <EquipmentGroupDialog
        open={showAddEquipmentGroup}
        onClose={() => setShowAddEquipmentGroup(false)}
        onSubmit={handleCreateEquipmentGroup}
      />
      <EquipmentGroupDialog
        open={!!editingEquipmentGroup}
        onClose={() => setEditingEquipmentGroup(null)}
        onSubmit={(data) => handleUpdateEquipmentGroup(editingEquipmentGroup.id, data)}
        initialData={editingEquipmentGroup}
      />

      {/* Dashboard Tour - Spotlight highlight tutorial */}
      <DashboardTour />

      <main className="flex-grow pt-10 pb-24">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-1">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                  {user.isOwner ? (
                    <span className="ml-3 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 align-middle text-xs uppercase tracking-[0.22em] text-amber-200">
                      Owner
                    </span>
                  ) : null}
                </h1>
                <p className="text-zinc-400 capitalize">{user.role} account · {user.location || "Location not set"}</p>
              </div>

              {/* Accepting Orders Toggle for Sellers */}
              {isSellerUser && (user?.role !== "both" || dashboardView === "store") && (
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-4 py-2">
                  <span className="text-sm text-zinc-400">Accepting Orders</span>
                  <Switch
                    checked={acceptingOrders}
                    onCheckedChange={toggleAcceptingOrders}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                  <span className={`text-xs font-medium ${acceptingOrders ? "text-emerald-400" : "text-zinc-500"}`}>
                    {acceptingOrders ? "Open" : "Closed"}
                  </span>
                </div>
              )}

              {/* View Toggle for users with both roles */}
              {user?.role === "both" && (
                <div className="flex items-center bg-black/60 border border-white/10 rounded-full p-1">
                  <button
                    onClick={() => setDashboardView("purchases")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      dashboardView === "purchases"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    My Purchases
                  </button>
                  <button
                    onClick={() => setDashboardView("store")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      dashboardView === "store"
                        ? "bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    My Store
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {!isSellerUser && (
                <Link href="/register">
                  <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)] px-5">Join Now</Button>
                </Link>
              )}
              {isSellerUser && (
                <>
                  <Link href="/storefront/edit">
                    <Button variant="outline" className="glass-panel text-white border-primary/30 hover:bg-primary/10 hover:border-primary/50 rounded-full">
                      <Store className="w-4 h-4 mr-2 text-primary" /> Edit Storefront
                    </Button>
                  </Link>
                  <Link href="/sponsorship/purchase">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-full px-6 py-2">
                      <Trophy className="w-4 h-4 mr-2" />
                      Buy Sponsorship
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/settings">
                <Button variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5 rounded-full">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem(`synthix-dashboard-tour-${user?.id}`);
                  window.location.reload();
                }}
                className="glass-panel text-white border-primary/30 hover:bg-primary/10 hover:border-primary/50 rounded-full"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" /> Start Tour
              </Button>
            </div>
          </div>

          {/* Seller Stats - hidden when in purchases view for both role users */}
          {isSellerUser && (user?.role !== "both" || dashboardView === "store") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Released Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-300", panel: "bg-emerald-500/8 border-emerald-400/15" },
                { label: "Pending Revenue",  value: `$${pendingRevenue.toFixed(2)}`, icon: Clock, color: "text-yellow-300", panel: "bg-yellow-500/8 border-yellow-400/15" },
                { label: "Total Sales",      value: (mySales?.orders?.length ?? 0), icon: TrendingUp, color: "text-sky-300", panel: "bg-sky-500/8 border-sky-400/15" },
                { label: "Platform Fees",    value: `$${totalFeesPaid.toFixed(2)}`, icon: Package, color: "text-zinc-200", panel: "bg-white/5 border-white/10" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`rounded-2xl border p-5 backdrop-blur-xl shadow-none ${stat.panel}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          <Tabs defaultValue={user?.role === "both" ? (dashboardView === "purchases" ? "purchases" : "overview") : defaultTab} className="w-full">
            <TabsList className="bg-black/60 border border-white/10 p-2 rounded-2xl mb-8 flex flex-wrap h-auto w-full gap-2">
              {/* Seller tabs - shown when NOT in purchases view (regular sellers or store view for both) */}
              {isSellerUser && (user?.role !== "both" || dashboardView === "store") && (
                <TabsTrigger value="overview" data-tour="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
              )}
              {user.isOwner && (user?.role !== "both" || dashboardView === "store") ? (
                <TabsTrigger value="admin" data-tour="admin" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              ) : null}

              {/* Purchases tab - shown for all, or when in purchases view for both role */}
              {(!isSellerUser || user?.role !== "both" || dashboardView === "purchases") && (
                <TabsTrigger value="purchases" data-tour="orders" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                  <Package className="w-4 h-4 mr-2" />
                  Orders
                </TabsTrigger>
              )}

              {/* Seller tabs - shown when NOT in purchases view */}
              {isSellerUser && (user?.role !== "both" || dashboardView === "store") && (
                <TabsTrigger value="reviews" data-tour="reviews" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  My Reviews
                </TabsTrigger>
              )}
              {isSellerUser && (user?.role !== "both" || dashboardView === "store") && (
                <>
                  <TabsTrigger value="listings" data-tour="shop" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <Store className="w-4 h-4 mr-2" />
                    My Shop
                  </TabsTrigger>
                  <TabsTrigger value="services" data-tour="services" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <PenLine className="w-4 h-4 mr-2" />
                    Services & Custom Orders
                  </TabsTrigger>
                  <TabsTrigger value="printers" data-tour="printers" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    My Equipment
                  </TabsTrigger>
                  <TabsTrigger value="shipping" data-tour="shipping" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <Truck className="w-4 h-4 mr-2" />
                    Shipping Profiles
                  </TabsTrigger>
                  <TabsTrigger value="analytics" data-tour="analytics" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </>
              )}

              {/* Buyer tabs - shown when in purchases view */}
              {(!isSellerUser || user?.role === "both") && dashboardView === "purchases" && (
                <>
                  <TabsTrigger value="messages" data-tour="messages" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="promotions" data-tour="promotions" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <Megaphone className="w-4 h-4 mr-2" />
                    Promotions
                  </TabsTrigger>
                  <TabsTrigger value="wallet" data-tour="wallet" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </TabsTrigger>
                  <TabsTrigger value="transactions" data-tour="transactions" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="payments" data-tour="payments" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.5)] data-[state=active]:scale-105 data-[state=active]:ring-2 data-[state=active]:ring-white/50 px-6 py-3 font-semibold text-sm transition-all duration-200">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Methods
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {isSellerUser && (
              <TabsContent value="overview" className="mt-0">
                <Overview 
                  user={user}
                  mySales={mySales}
                  averageOrderValue={averageOrderValue}
                  activeEquipmentCount={activeEquipmentCount}
                  totalCatalogItems={totalCatalogItems}
                  setShowAddPrinter={setShowAddPrinter}
                />
              </TabsContent>
            )}

            {user.isOwner ? (
              <TabsContent value="admin" className="mt-0">
                <OwnerAdminPanel />
              </TabsContent>
            ) : null}

            <TabsContent value="purchases" className="mt-0">
              <Purchases myPurchases={myPurchases} isSellerUser={isSellerUser} />
              <div className="mt-8">
                <BuyerCustomOrders user={user} />
              </div>
              {isSellerUser && (
                <div className="mt-8">
                  <Sales mySales={mySales} updatingOrderId={updatingOrderId} advanceStatus={advanceStatus} />
                </div>
              )}
            </TabsContent>

            {isSellerUser && (
              <TabsContent value="reviews" className="mt-0">
                <Reviews myReviews={myReviews} reviewsReceived={reviewsReceived} />
              </TabsContent>
            )}

            {isSellerUser && (
              <TabsContent value="listings" className="mt-0">
                <Listings
                  myListings={myListings}
                  handleDeleteListing={handleDeleteListing}
                />
              </TabsContent>
            )}

            {isSellerUser && (
              <TabsContent value="services" className="mt-0">
                <CustomOrders user={user} />
              </TabsContent>
            )}

            {isSellerUser && (
              <TabsContent value="printers" className="mt-0">
                <Equipment
                  myEquipmentGroups={myEquipmentGroups}
                  myPrinters={myPrinters}
                  setShowAddEquipmentGroup={setShowAddEquipmentGroup}
                  setEditingEquipmentGroup={setEditingEquipmentGroup}
                  handleDeleteEquipmentGroup={handleDeleteEquipmentGroup}
                  setShowAddPrinter={setShowAddPrinter}
                  setEditingPrinter={setEditingPrinter}
                  handleAssignToGroup={handleAssignToGroup}
                  togglingPrinterId={togglingPrinterId}
                  togglePrinter={togglePrinter}
                  deletingPrinterId={deletingPrinterId}
                  removePrinter={removePrinter}
                  handleUpdateEquipmentStatus={handleUpdateEquipmentStatus}
                />
              </TabsContent>
            )}

            {isSellerUser && (
              <TabsContent value="shipping" className="mt-0">
                <ShippingProfiles />
              </TabsContent>
            )}

            {/* Buyer tabs - shown when in purchases view */}
            {(!isSellerUser || user?.role === "both") && dashboardView === "purchases" && (
              <>
                <TabsContent value="messages" className="mt-0">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Messages
                      </h2>
                      <p className="text-zinc-400 mt-1">Your conversations with sellers</p>
                    </div>
                    <div className="p-6">
                      <p className="text-zinc-500">No messages yet.</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Wallet Tab */}
                <TabsContent value="wallet" className="mt-0">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-semibold text-white">Wallet & Balance</h2>
                      <p className="text-zinc-400 mt-1">View your available balance and earnings</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-6 rounded-2xl border border-emerald-500/20">
                          <p className="text-sm text-emerald-400 mb-1">Available Balance</p>
                          <p className="text-3xl font-bold text-white">$0.00</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                          <p className="text-sm text-zinc-400 mb-1">Pending Earnings</p>
                          <p className="text-3xl font-bold text-white">$0.00</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                          <p className="text-sm text-zinc-400 mb-1">Total Earnings</p>
                          <p className="text-3xl font-bold text-white">$0.00</p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Payout Settings</h3>
                        <p className="text-zinc-400">Connect your bank account to receive payouts automatically every week.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="mt-0">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-semibold text-white">Transaction History</h2>
                      <p className="text-zinc-400 mt-1">View all your sales, purchases, and payouts</p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {(mySales?.orders?.length ?? 0) > 0 ? (
                          mySales.orders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.type === 'sale' ? 'bg-emerald-500/20' : 'bg-zinc-700'}`}>
                                  {order.type === 'sale' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <Package className="w-5 h-5 text-zinc-400" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Order #{order.id}</p>
                                  <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <p className={`text-sm font-medium ${order.type === 'sale' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                {order.type === 'sale' ? '+' : '-'}${(order.totalPrice - order.platformFee).toFixed(2)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-400">No transactions yet</p>
                            <p className="text-sm text-zinc-500 mt-2">Your sales and purchases will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Payment Methods Tab */}
                <TabsContent value="payments" className="mt-0">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
                      <p className="text-zinc-400 mt-1">Manage your cards and payout accounts</p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-gradient-to-r from-zinc-600 to-zinc-700 rounded-md flex items-center justify-center">
                              <CreditCard className="w-6 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Visa ending in 4242</p>
                              <p className="text-xs text-zinc-500">Expires 12/25</p>
                            </div>
                          </div>
                          <button className="text-sm text-zinc-400 hover:text-white transition-colors">Edit</button>
                        </div>
                        <button className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-zinc-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}

            {/* Promotions Tab */}
            {isSellerUser && (
              <TabsContent value="promotions" className="mt-0">
                <div className="space-y-8">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-primary" />
                        Promotions & Marketing
                      </h2>
                      <p className="text-sm text-zinc-500 mt-1">Manage your sponsorships and promotional campaigns.</p>
                    </div>
                    <div className="p-6">
                      <SponsoredShopsInjection 
                        maxShops={3} 
                        showHeader={false}
                        className="mb-6"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/sponsorship/purchase">
                          <div className="glass-panel rounded-2xl border border-white/10 p-6 hover:border-primary/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Buy Sponsorship</h3>
                                <p className="text-xs text-zinc-400">Get featured on homepage</p>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-500">Increase your shop visibility with sponsored placements.</p>
                          </div>
                        </Link>
                        <Link href="/contests">
                          <div className="glass-panel rounded-2xl border border-white/10 p-6 hover:border-primary/30 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">Join Contests</h3>
                                <p className="text-xs text-zinc-400">Win prizes and badges</p>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-500">Participate in contests to win rewards and gain recognition.</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Finance Tab */}
            {isSellerUser && (
              <TabsContent value="finance" className="mt-0">
                <div className="space-y-8">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Financial Overview
                      </h2>
                      <p className="text-sm text-zinc-500 mt-1">Track your earnings, payments, and transaction history.</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="glass-panel rounded-2xl border border-white/10 p-5 bg-emerald-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm text-zinc-400">Total Revenue</span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-400">${totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="glass-panel rounded-2xl border border-white/10 p-5 bg-yellow-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-zinc-400">Pending</span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-400">${pendingRevenue.toFixed(2)}</p>
                        </div>
                        <div className="glass-panel rounded-2xl border border-white/10 p-5 bg-red-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="w-5 h-5 text-red-400" />
                            <span className="text-sm text-zinc-400">Fees Paid</span>
                          </div>
                          <p className="text-2xl font-bold text-red-400">${totalFeesPaid.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          Recent Transactions
                        </h3>
                        {mySales?.orders && mySales.orders.length > 0 ? (
                          <div className="space-y-3">
                            {mySales.orders.slice(0, 5).map((order) => (
                              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Order #{order.id}</p>
                                    <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-emerald-400">+${(order.totalPrice - order.platformFee).toFixed(2)}</p>
                                  <p className="text-xs text-zinc-500">Fee: ${order.platformFee.toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Receipt className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400">No transactions yet</p>
                            <p className="text-sm text-zinc-500 mt-1">Your sales will appear here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

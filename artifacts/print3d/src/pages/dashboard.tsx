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
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp, DollarSign,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, ArrowRight, ChevronLeft,
  Hammer, Wrench, PenLine, Sparkles, Trophy, Info, Edit, Trash2, Store,
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
import { getApiErrorMessage } from "@/lib/api-error";
import { OwnerAdminPanel } from "@/components/dashboard/OwnerAdminPanel";
import { Tutorial } from "@/components/shared/Tutorial";
import { Analytics } from "@/components/dashboard/Analytics";
import { Overview } from "@/components/dashboard/Overview";
import { Purchases } from "@/components/dashboard/Purchases";
import { Reviews } from "@/components/dashboard/Reviews";
import { Sales } from "@/components/dashboard/Sales";
import { Listings } from "@/components/dashboard/Listings";
import { Equipment } from "@/components/dashboard/Equipment";
import { SponsoredShopsInjection } from "@/components/sections/SponsoredShopsInjection";

function EquipmentCategoryIcon({ cat }: { cat: EquipmentCategoryId }) {
  const cls = "w-5 h-5 text-white";
  if (cat === "printing_3d") return <PrinterIcon className={cls} />;
  if (cat === "woodworking") return <Hammer className={cls} />;
  if (cat === "metalworking") return <Wrench className={cls} />;
  if (cat === "services") return <PenLine className={cls} />;
  return <Sparkles className={cls} />;
}

const CATEGORIES = ["Mechanical", "Miniatures", "Cosplay", "Functional", "Art", "Jewelry", "Architecture", "Toys", "Tools"];

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
              <button type="button" onClick={() => setSelectedBrand(null)} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors">
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
              </div>
            </motion.div>
          ) : !selected ? (
            <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button type="button" onClick={() => setEquipCategory(null)} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> All categories
              </button>
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
              </div>
            </motion.div>
          ) : (
            <motion.div key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Change model
              </button>

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
        },
      });
      toast({ title: "Listing added!", description: "Your model is now live in the catalog." });
      onClose();
      onSuccess();
    } catch (error) {
      toast({ title: "Failed to create listing", description: getApiErrorMessage(error), variant: "destructive" });
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
            <Input type="number" step="0.01" value={form.shippingCost} onChange={e => handleChange("shippingCost", e.target.value)} placeholder="e.g. 5.99" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
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
  const [showAddListing, setShowAddListing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAddEquipmentGroup, setShowAddEquipmentGroup] = useState(false);
  const [editingEquipmentGroup, setEditingEquipmentGroup] = useState<any>(null);
  const [editingPrinter, setEditingPrinter] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({
        title: "Payment received",
        description: "Your order will appear here as soon as Stripe confirms the checkout webhook.",
      });
      params.delete("checkout");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `/dashboard?${next}` : "/dashboard");
    }
  }, [toast]);

  const purchaseParams = { buyerId: user?.id };
  const salesParams = { sellerId: user?.id };
  const listingParams = { sellerId: user?.id };
  const printerParams = { userId: user?.id };
  const writtenReviewParams = { reviewerId: user?.id };
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

  const updateStatus = useUpdateOrderStatus();
  const updatePrinter = useUpdatePrinter();
  const deletePrinter = useDeletePrinter();
  const createEquipmentGroup = useCreateEquipmentGroup();
  const updateEquipmentGroup = useUpdateEquipmentGroup();
  const deleteEquipmentGroup = useDeleteEquipmentGroup();
  const deleteListing = useDeleteListing();

  function isSeller(role?: string) { return role === "seller" || role === "both"; }
  const isSellerUser = isSeller(user?.role);

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

  const totalRevenue = mySales?.orders.filter(o => o.status === "delivered" || o.status === "shipped").reduce((sum, o) => sum + (o.totalPrice - o.platformFee), 0) ?? 0;
  const pendingRevenue = mySales?.orders.filter(o => o.status === "pending" || o.status === "accepted" || o.status === "printing").reduce((sum, o) => sum + (o.totalPrice - o.platformFee), 0) ?? 0;
  const totalFeesPaid = mySales?.orders.reduce((sum, o) => sum + o.platformFee, 0) ?? 0;
  const averageOrderValue = mySales?.orders.length ? totalRevenue / mySales.orders.length : 0;
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

  // Tutorial steps
  const buyerTutorialSteps = [
    {
      title: "Welcome to SYNTHIX!",
      description: "Your gateway to custom 3D prints and maker services. Let's get you started with the basics."
    },
    {
      title: "Browse Makers & Products",
      description: "Explore our marketplace of verified makers. Use the search and filters to find exactly what you need."
    },
    {
      title: "Place Orders",
      description: "Found something you like? Add it to cart and checkout securely. Funds are held in escrow until delivery."
    },
    {
      title: "Track Your Orders",
      description: "Monitor your order status in the 'My Orders' tab. Leave reviews once your order is complete."
    }
  ];

  const sellerTutorialSteps = [
    {
      title: "Welcome Seller!",
      description: "Ready to start selling your 3D prints and services? Let's set up your shop."
    },
    {
      title: "Add Your Equipment",
      description: "Register your 3D printers, CNC machines, or other equipment in the 'My Equipment' tab."
    },
    {
      title: "Create Listings",
      description: "Add products to your catalog in the 'My Listings' tab. Include photos, descriptions, and pricing."
    },
    {
      title: "Manage Orders",
      description: "Track incoming orders in the 'Manage Sales' tab. Update statuses and communicate with buyers."
    },
    {
      title: "View Analytics",
      description: "Check your shop performance in the 'Analytics' tab to optimize your business."
    }
  ];

  // Show tutorial on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(`tutorial-${user.id}`);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [user.id]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem(`tutorial-${user.id}`, 'true');
  };

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
      <AddListingDialog
        open={showAddListing}
        onClose={() => setShowAddListing(false)}
        sellerId={user.id}
        onSuccess={refetchListings}
      />

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
            </div>
            <div className="flex gap-3 flex-wrap">
              {!isSellerUser && (
                <Link href="/register">
                  <NeonButton glowColor="accent" className="rounded-full px-5">Join Now</NeonButton>
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
            </div>
          </div>

          {/* Seller Stats */}
          {isSellerUser && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Released Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-300", panel: "bg-emerald-500/8 border-emerald-400/15" },
                { label: "Pending Revenue",  value: `$${pendingRevenue.toFixed(2)}`, icon: Clock, color: "text-yellow-300", panel: "bg-yellow-500/8 border-yellow-400/15" },
                { label: "Total Sales",      value: mySales?.total ?? 0, icon: TrendingUp, color: "text-sky-300", panel: "bg-sky-500/8 border-sky-400/15" },
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

          <Tabs defaultValue={isSellerUser ? "overview" : "purchases"} className="w-full">
            <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl mb-8 flex flex-wrap h-auto w-fit gap-1">
              {isSellerUser && (
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">Overview</TabsTrigger>
              )}
              {user.isOwner ? (
                <TabsTrigger value="admin" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">Admin</TabsTrigger>
              ) : null}
              <TabsTrigger value="purchases" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">My Orders</TabsTrigger>
              {isSellerUser && (
                <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">My Reviews</TabsTrigger>
              )}
              {isSellerUser && (
                <>
                  <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">Manage Sales</TabsTrigger>
                  <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">My Listings</TabsTrigger>
                  <TabsTrigger value="printers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">My Equipment</TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">Analytics</TabsTrigger>
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
                  setShowAddListing={setShowAddListing}
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
            </TabsContent>

            {isSellerUser && (
              <TabsContent value="reviews" className="mt-0">
                <Reviews myReviews={myReviews} />
              </TabsContent>
            )}

            {isSellerUser && (
              <TabsContent value="sales" className="mt-0">
                <Sales mySales={mySales} updatingOrderId={updatingOrderId} advanceStatus={advanceStatus} />
              </TabsContent>
            )}

            {isSellerUser && (
              <TabsContent value="listings" className="mt-0">
                <Listings 
                  myListings={myListings} 
                  showAddListing={showAddListing} 
                  setShowAddListing={setShowAddListing} 
                  handleDeleteListing={handleDeleteListing} 
                />
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
                />
              </TabsContent>
            )}
            
            {isSellerUser && (
              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-8">
                  {/* Performance Metrics */}
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
                      <p className="text-sm text-zinc-500 mt-1">Track your shop's performance and growth metrics.</p>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-2">{mySales?.orders.length ?? 0}</div>
                          <div className="text-sm text-zinc-500">Total Orders</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-400 mb-2">${totalRevenue.toFixed(2)}</div>
                          <div className="text-sm text-zinc-500">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-sky-400 mb-2">{averageOrderValue > 0 ? `$${averageOrderValue.toFixed(2)}` : 'N/A'}</div>
                          <div className="text-sm text-zinc-500">Avg Order Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-400 mb-2">{myListings?.listings.length ?? 0}</div>
                          <div className="text-sm text-zinc-500">Active Listings</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Badges */}
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white">Seller Achievements</h2>
                      <p className="text-sm text-zinc-500 mt-1">Badges earned based on your shop performance.</p>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-4">
                        {/* Rising Star Badge */}
                        {(mySales?.orders.length ?? 0) >= 5 && (
                          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-yellow-400">Rising Star</div>
                              <div className="text-xs text-zinc-400">5+ orders completed</div>
                            </div>
                          </div>
                        )}

                        {/* Trusted Seller Badge */}
                        {(myReviews?.reviews?.length ?? 0) >= 3 && (
                          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-emerald-400">Trusted Seller</div>
                              <div className="text-xs text-zinc-400">3+ positive reviews</div>
                            </div>
                          </div>
                        )}

                        {/* Equipment Expert Badge */}
                        {(myPrinters?.printers?.length ?? 0) >= 3 && (
                          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                              <PrinterIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-blue-400">Equipment Expert</div>
                              <div className="text-xs text-zinc-400">3+ registered machines</div>
                            </div>
                          </div>
                        )}

                        {/* Top Earner Badge */}
                        {totalRevenue >= 500 && (
                          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-purple-400">Top Earner</div>
                              <div className="text-xs text-zinc-400">$500+ in revenue</div>
                            </div>
                          </div>
                        )}

                        {/* No badges yet */}
                        {((mySales?.orders.length ?? 0) < 5 && (myReviews?.reviews?.length ?? 0) < 3 && (myPrinters?.printers?.length ?? 0) < 3 && totalRevenue < 500) && (
                          <div className="text-center py-8 w-full">
                            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-500">Complete more orders and build your reputation to earn badges!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Growth Insights */}
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white">Growth Insights</h2>
                      <p className="text-sm text-zinc-500 mt-1">Tips to improve your shop performance.</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {myListings?.listings.length === 0 && (
                        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-blue-400">Add Your First Listing</div>
                            <div className="text-sm text-zinc-400">Start selling by creating your first product listing in the 'My Listings' tab.</div>
                          </div>
                        </div>
                      )}
                      {(myPrinters?.printers?.length ?? 0) === 0 && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-yellow-400">Register Equipment</div>
                            <div className="text-sm text-zinc-400">Add your equipment to build buyer trust and showcase your capabilities.</div>
                          </div>
                        </div>
                      )}
                      {(mySales?.orders.length ?? 0) > 0 && (myReviews?.reviews?.length ?? 0) === 0 && (
                        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-green-400">Request Reviews</div>
                            <div className="text-sm text-zinc-400">Ask satisfied customers to leave reviews to build your reputation.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analytics Charts */}
                  <Analytics shopId={user?.id} timeRange="30d" />

                  {/* Sponsored Shops Section */}
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white">Sponsor Your Shop</h2>
                      <p className="text-sm text-zinc-500 mt-1">Boost your visibility and reach more customers with sponsored placements.</p>
                    </div>
                    <div className="p-6">
                      <SponsoredShopsInjection 
                        maxShops={3} 
                        showHeader={false}
                        className="mb-4"
                      />
                      <div className="text-center">
                        <Link href="/pricing">
                          <NeonButton glowColor="primary" className="rounded-full px-6">
                            View Sponsorship Plans
                          </NeonButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Tutorial
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        steps={isSellerUser ? sellerTutorialSteps : buyerTutorialSteps}
        userType={isSellerUser ? "seller" : "buyer"}
      />
    </div>
  );
}

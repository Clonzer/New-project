import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import {
  useListOrders, useListListings, useListPrinters, useUpdateOrderStatus,
  useCreatePrinter, useUpdatePrinter, useDeletePrinter, useCreateListing,
  useListReviews, getListOrdersQueryKey, getListListingsQueryKey, getListPrintersQueryKey, getListReviewsQueryKey,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp, DollarSign,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, ArrowRight, ChevronLeft,
  Hammer, Wrench, PenLine, Sparkles,
} from "lucide-react";
import {
  EQUIPMENT_CATEGORY_CHOICES,
  brandsForCategory,
  catalogItemsForCategoryAndBrand,
  catalogItemsForCategory,
  categoryLabel,
  type EquipmentCategoryId,
  type CatalogEquipmentItem,
} from "@/lib/equipment-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { NeonButton } from "@/components/ui/neon-button";
import { ListingCard } from "@/components/shared/ListingCard";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { PortfolioManager } from "@/components/dashboard/PortfolioManager";
import { OwnerAdminPanel } from "@/components/dashboard/OwnerAdminPanel";
import { Tutorial } from "@/components/shared/Tutorial";

function EquipmentCategoryIcon({ cat }: { cat: EquipmentCategoryId }) {
  const cls = "w-5 h-5 text-white";
  if (cat === "printing_3d") return <PrinterIcon className={cls} />;
  if (cat === "woodworking") return <Hammer className={cls} />;
  if (cat === "metalworking") return <Wrench className={cls} />;
  if (cat === "services") return <PenLine className={cls} />;
  return <Sparkles className={cls} />;
}

const CATEGORIES = ["Mechanical", "Miniatures", "Cosplay", "Functional", "Art", "Jewelry", "Architecture", "Toys", "Tools"];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; next?: string; nextLabel?: string }> = {
  pending:   { label: "Pending",   color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock,         next: "accepted",  nextLabel: "Accept Job" },
  accepted:  { label: "Accepted",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20",       icon: CheckCircle2,  next: "printing",  nextLabel: "Start production" },
  printing:  { label: "In production", color: "bg-primary/10 text-primary border-primary/30",    icon: PrinterIcon,   next: "shipped",   nextLabel: "Mark Shipped" },
  shipped:   { label: "Shipped",   color: "bg-accent/10 text-accent border-accent/30",             icon: Truck,         next: "delivered", nextLabel: "Confirm Delivered" },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20",          icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-white/10 text-white", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} flex items-center gap-1.5 py-1 px-3`}>
      <Icon className="w-3.5 h-3.5" /> {cfg.label}
    </Badge>
  );
}

// ─── Register equipment dialog (multi-category) ─────────────────────────────
function RegisterPrinterDialog({ open, onClose, userId, onSuccess }: {
  open: boolean; onClose: () => void; userId: number; onSuccess: () => void;
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
    } catch {
      toast({ title: "Failed to register equipment", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Add equipment</DialogTitle>
          <p className="text-zinc-500 text-sm font-normal pt-1">3D printers, shop tools, metal fab, design services — list what you actually run.</p>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [togglingPrinterId, setTogglingPrinterId] = useState<number | null>(null);
  const [deletingPrinterId, setDeletingPrinterId] = useState<number | null>(null);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [showAddListing, setShowAddListing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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
  const { data: myReviews } = useListReviews(writtenReviewParams, {
    query: { enabled: !!user, queryKey: getListReviewsQueryKey(writtenReviewParams) },
  });

  const updateStatus = useUpdateOrderStatus();
  const updatePrinter = useUpdatePrinter();
  const deletePrinter = useDeletePrinter();

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

  const togglePrinter = async (printerId: number, currentActive: boolean) => {
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

  const totalRevenue = mySales?.orders.filter(o => o.status === "delivered" || o.status === "shipped").reduce((sum, o) => sum + (o.totalPrice - o.platformFee), 0) ?? 0;
  const pendingRevenue = mySales?.orders.filter(o => o.status === "pending" || o.status === "accepted" || o.status === "printing").reduce((sum, o) => sum + (o.totalPrice - o.platformFee), 0) ?? 0;
  const totalFeesPaid = mySales?.orders.reduce((sum, o) => sum + o.platformFee, 0) ?? 0;
  const averageOrderValue = mySales?.orders.length ? totalRevenue / mySales.orders.length : 0;
  const activeEquipmentCount = myPrinters?.printers.filter((printer) => printer.isActive).length ?? 0;
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
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user.displayName}</span>
                {user.isOwner ? (
                  <span className="ml-3 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 align-middle text-xs uppercase tracking-[0.22em] text-amber-200">
                    Owner
                  </span>
                ) : null}
              </h1>
              <p className="text-zinc-400 capitalize">{user.role} account · {user.location || "Location not set"}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {!isSellerUser && (
                <Link href="/register">
                  <NeonButton glowColor="accent" className="rounded-full px-5">Become a Seller</NeonButton>
                </Link>
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
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-5">My Reviews</TabsTrigger>
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
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white">Seller overview</h2>
                      <p className="text-sm text-zinc-500 mt-1">A quick view of sales momentum, catalog health, and shop readiness.</p>
                    </div>
                    <div className="grid gap-4 p-6 md:grid-cols-2">
                      {[
                        { label: "Average order value", value: `$${averageOrderValue.toFixed(2)}` },
                        { label: "Active equipment", value: activeEquipmentCount },
                        { label: "Catalog listings", value: totalCatalogItems },
                        { label: "Open sales pipeline", value: mySales?.orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length ?? 0 },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
                          <p className="mt-2 text-2xl font-display font-bold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                      <h2 className="text-xl font-bold text-white">Quick actions</h2>
                      <p className="text-sm text-zinc-500 mt-1">Shortcuts for the most common seller tasks.</p>
                    </div>
                    <div className="p-6 space-y-3">
                      <button type="button" onClick={() => setShowAddListing(true)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-primary/40 hover:bg-primary/10">
                        <p className="font-semibold text-white">Add a new catalog listing</p>
                        <p className="mt-1 text-sm text-zinc-400">Publish a model or made-to-order product from your dashboard.</p>
                      </button>
                      <button type="button" onClick={() => setShowAddPrinter(true)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-accent/40 hover:bg-accent/10">
                        <p className="font-semibold text-white">Register more equipment</p>
                        <p className="mt-1 text-sm text-zinc-400">Add another machine, service, or workshop capability.</p>
                      </button>
                      <Link href="/settings" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/20 hover:bg-white/10">
                        <p className="font-semibold text-white">Update shop settings</p>
                        <p className="mt-1 text-sm text-zinc-400">Edit branding, shipping defaults, verification, and payments.</p>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <PortfolioManager userId={user.id} />
                </div>
              </TabsContent>
            )}

            {user.isOwner ? (
              <TabsContent value="admin" className="mt-0">
                <OwnerAdminPanel />
              </TabsContent>
            ) : null}

            {/* ── Buyer Orders ── */}
            <TabsContent value="purchases" className="mt-0">
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Order History</h2>
                  <Link href="/explore">
                    <Button variant="ghost" className="text-accent hover:text-white text-sm gap-1">
                      Browse Makers <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                {!myPurchases?.orders.length ? (
                  <div className="p-16 text-center">
                    <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-4">No orders yet.</p>
                    <Link href="/explore"><NeonButton glowColor="primary">Browse makers</NeonButton></Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {myPurchases.orders.map(order => (
                      <div key={order.id} className="p-6 hover:bg-white/5 transition-colors flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{order.title}</h3>
                            <p className="text-sm text-zinc-400 mb-2">#{order.id} · from {order.sellerName} · {format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                        <div className="text-left md:text-right space-y-1 shrink-0">
                          <p className="font-display font-bold text-xl text-primary">${order.totalPrice.toFixed(2)}</p>
                          <p className="text-xs text-zinc-500">incl. ${order.platformFee.toFixed(2)} platform fee</p>
                          {order.trackingNumber && <p className="text-xs text-accent">Tracking: {order.trackingNumber}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <h2 className="text-xl font-bold text-white">Reviews you've left</h2>
                  <p className="text-sm text-zinc-500 mt-1">A history of the feedback you have submitted after completed orders.</p>
                </div>
                {!myReviews?.reviews.length ? (
                  <div className="p-16 text-center">
                    <CheckCircle2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No reviews submitted yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {myReviews.reviews.map((review) => (
                      <div key={review.id} className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-white">{review.revieweeName}</p>
                            <p className="text-sm text-zinc-500">Order #{review.orderId} · {format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                          </div>
                          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-sm text-yellow-300">
                            {review.rating}/5
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                          {review.comment?.trim() || "No written comment was included with this rating."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Seller Sales ── */}
            {isSellerUser && (
              <TabsContent value="sales" className="mt-0">
                <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white">Incoming Orders</h2>
                    <p className="text-sm text-zinc-500 mt-1">Funds held in escrow · Released to you when you mark order as Shipped</p>
                  </div>
                  {!mySales?.orders.length ? (
                    <div className="p-16 text-center">
                      <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500">No orders yet. Share your shop to get started!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {mySales.orders.map(order => {
                        const cfg = STATUS_CONFIG[order.status];
                        const sellerEarnings = order.totalPrice - order.platformFee;
                        return (
                          <div key={order.id} className="p-6 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex-grow">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                    <Package className="w-5 h-5 text-accent" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-white">{order.title}</h3>
                                    <p className="text-sm text-zinc-400">From: {order.buyerName} · Qty: {order.quantity} · #{order.id}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  <StatusBadge status={order.status} />
                                  <span className="text-xs text-zinc-500 self-center">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                                  {order.notes && <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">"{order.notes}"</span>}
                                </div>
                              </div>
                              <div className="shrink-0 flex flex-col items-end gap-3">
                                <div className="text-right">
                                  <p className="text-xl font-display font-bold text-emerald-400">${sellerEarnings.toFixed(2)} <span className="text-sm font-normal text-zinc-500">yours</span></p>
                                  <p className="text-xs text-zinc-600">${order.platformFee.toFixed(2)} fee · ${order.totalPrice.toFixed(2)} total</p>
                                  {order.status === "shipped" || order.status === "delivered" ? (
                                    <p className="text-xs text-emerald-500 mt-1">✓ Funds released</p>
                                  ) : (
                                    <p className="text-xs text-yellow-600 mt-1">⏳ Held in escrow</p>
                                  )}
                                </div>
                                {cfg?.next && (
                                  <NeonButton
                                    glowColor={order.status === "printing" ? "accent" : "primary"}
                                    className="rounded-full px-4 py-2 text-sm"
                                    disabled={updatingOrderId === order.id}
                                    onClick={() => advanceStatus(order.id, cfg.next!)}
                                  >
                                    {updatingOrderId === order.id ? "Updating..." : cfg.nextLabel}
                                  </NeonButton>
                                )}
                                {order.status === "pending" && (
                                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs" onClick={() => advanceStatus(order.id, "cancelled")}>
                                    Decline
                                  </Button>
                                )}
                                <div className="flex gap-2 mt-2">
                                  <Button variant="outline" size="sm" className="text-xs border-white/10 text-zinc-300 hover:bg-white/5" onClick={() => window.print()}>
                                    Print Label
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-xs border-white/10 text-zinc-300 hover:bg-white/5" onClick={() => alert(`Customer: ${order.buyerName}\nAddress: ${order.shippingAddress || 'Not provided'}`)}>
                                    View Info
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {order.shippingAddress && (
                              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-zinc-500">
                                <span className="text-zinc-600">Ship to:</span> {order.shippingAddress}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* ── Listings ── */}
            {isSellerUser && (
              <TabsContent value="listings" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">My Catalog Listings</h2>
                  <NeonButton glowColor="primary" className="rounded-full px-5" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Listing
                  </NeonButton>
                </div>
                {!myListings?.listings.length ? (
                  <div className="glass-panel p-16 rounded-3xl text-center">
                    <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-4">No listings yet. Add models to your catalog.</p>
                    <NeonButton glowColor="primary" onClick={() => setShowAddListing(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Your First Listing
                    </NeonButton>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {myListings.listings.map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {/* ── Printers ── */}
            {isSellerUser && (
              <TabsContent value="printers" className="mt-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Registered Equipment</h2>
                  <NeonButton glowColor="accent" className="rounded-full px-5" onClick={() => setShowAddPrinter(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add equipment
                  </NeonButton>
                </div>
                {!myPrinters?.printers.length ? (
                  <div className="glass-panel p-16 rounded-3xl text-center">
                    <PrinterIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-4">No equipment listed yet.</p>
                    <NeonButton glowColor="accent" onClick={() => setShowAddPrinter(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add your first equipment
                    </NeonButton>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myPrinters.printers.map(printer => (
                      <div key={printer.id} className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <PrinterIcon className="w-6 h-6 text-zinc-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{printer.name}</h3>
                              <p className="text-sm text-zinc-400">{printer.brand} {printer.model}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge variant={printer.isActive ? "default" : "secondary"} className={printer.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"}>
                              {printer.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <select
                              className="text-xs bg-black/30 border border-white/10 text-zinc-300 rounded px-2 py-1"
                              defaultValue="operational"
                            >
                              <option value="operational">Operational</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="out-of-service">Out of Service</option>
                              <option value="busy">Busy</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-zinc-300 mb-4">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Category</span>
                            <span className="text-zinc-200 font-medium">{categoryLabel(printer.equipmentCategory ?? "printing_3d")}</span>
                          </div>
                          {printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory ? (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Process</span>
                              <span className="text-accent font-medium">{printer.technology}</span>
                            </div>
                          ) : printer.toolOrServiceType ? (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Type</span>
                              <span className="text-accent font-medium">{printer.toolOrServiceType}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Process</span>
                              <span className="text-accent font-medium">{printer.technology}</span>
                            </div>
                          )}
                          {printer.buildVolume && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">{printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory ? "Build volume" : "Capacity"}</span>
                              <span>{printer.buildVolume}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-zinc-500">{printer.equipmentCategory === "printing_3d" || !printer.equipmentCategory ? "Materials" : "Capabilities"}</span>
                            <span className="text-right max-w-[60%] line-clamp-1">{printer.materials.join(", ")}</span>
                          </div>
                          {printer.pricePerHour && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Rate</span>
                              <span className="text-primary font-medium">${printer.pricePerHour}/hr{printer.pricePerGram ? ` · $${printer.pricePerGram}/g` : ""}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Jobs Completed</span>
                            <span className="text-white font-bold">{printer.totalJobsCompleted}</span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-end gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs ${printer.isActive ? "text-red-400 hover:text-red-300 hover:bg-red-400/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"}`}
                            disabled={togglingPrinterId === printer.id}
                            onClick={() => togglePrinter(printer.id, printer.isActive)}
                          >
                            {togglingPrinterId === printer.id ? "Updating..." : printer.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                            disabled={deletingPrinterId === printer.id}
                            onClick={() => removePrinter(printer.id)}
                          >
                            {deletingPrinterId === printer.id ? "Removing..." : "Remove"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

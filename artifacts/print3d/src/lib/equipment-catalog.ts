// ─── Shared equipment picker data (dashboard + register) ────────────────────

export type EquipmentCategoryId =
  | "printing_3d"
  | "woodworking"
  | "metalworking"
  | "services"
  | "other";

export type CatalogEquipmentItem = {
  id: string;
  category: EquipmentCategoryId;
  brand: string;
  model: string;
  technology: "FDM" | "SLA" | "SLS" | "MSLA" | "MJF" | "DMLS" | "other";
  materials: string[];
  buildVolume: string;
  gradient: string;
  toolOrServiceType?: string | null;
  /**
   * When false, this item is listed as capability only (no hourly/material rates).
   * Use for hand tools like drills/drivers where pricing is typically project-based.
   */
  allowsHourlyRate?: boolean;
  isOther?: boolean;
};

export const EQUIPMENT_CATEGORY_CHOICES: {
  id: EquipmentCategoryId;
  title: string;
  blurb: string;
  gradient: string;
}[] = [
  {
    id: "printing_3d",
    title: "3D printing",
    blurb: "FDM, resin, powder & industrial additive",
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    id: "woodworking",
    title: "Woodworking",
    blurb: "Shop tools, CNC timber, joinery",
    gradient: "from-amber-600 to-orange-600",
  },
  {
    id: "metalworking",
    title: "Metal fabrication",
    blurb: "Welding, cutting, mills & lathes",
    gradient: "from-slate-500 to-zinc-600",
  },
  {
    id: "services",
    title: "Design & services",
    blurb: "CAD, laser, finishing, graphics",
    gradient: "from-cyan-600 to-blue-600",
  },
  {
    id: "other",
    title: "Other",
    blurb: "Anything not listed — describe your setup",
    gradient: "from-zinc-700 to-zinc-500",
  },
];

const PRINTING_3D: CatalogEquipmentItem[] = [
  { id: "bambu-x1c", category: "printing_3d", brand: "Bambu Lab", model: "X1 Carbon", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA", "PC"], gradient: "from-blue-600 to-cyan-500", buildVolume: "256×256×256 mm" },
  { id: "bambu-p1s", category: "printing_3d", brand: "Bambu Lab", model: "P1S", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA"], gradient: "from-indigo-600 to-blue-400", buildVolume: "256×256×256 mm" },
  { id: "bambu-a1-mini", category: "printing_3d", brand: "Bambu Lab", model: "A1 Mini", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-emerald-500 to-teal-400", buildVolume: "180×180×180 mm" },
  { id: "prusa-mk4", category: "printing_3d", brand: "Prusa", model: "MK4", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "Flex"], gradient: "from-orange-500 to-red-500", buildVolume: "250×210×220 mm" },
  { id: "ender-3-v3", category: "printing_3d", brand: "Creality", model: "Ender 3 V3 SE", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-zinc-500 to-zinc-400", buildVolume: "220×220×250 mm" },
  { id: "creality-k1-max", category: "printing_3d", brand: "Creality", model: "K1 Max", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA"], gradient: "from-slate-600 to-zinc-500", buildVolume: "300×300×300 mm" },
  { id: "ultimaker-s7", category: "printing_3d", brand: "Ultimaker", model: "S7", technology: "FDM", materials: ["PLA", "ABS", "Nylon", "PC", "TPU", "PVA", "CPE"], gradient: "from-sky-500 to-blue-600", buildVolume: "330×240×300 mm" },
  { id: "raise3d-pro3", category: "printing_3d", brand: "Raise3D", model: "Pro3", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "PA", "PC", "TPU", "PVA"], gradient: "from-zinc-700 to-zinc-600", buildVolume: "300×300×300 mm" },
  { id: "formlabs-form3", category: "printing_3d", brand: "Formlabs", model: "Form 3+", technology: "SLA", materials: ["Standard Resin", "Engineering Resin", "Flexible Resin", "Dental Resin"], gradient: "from-orange-400 to-amber-400", buildVolume: "145×145×185 mm" },
  { id: "anycubic-photon", category: "printing_3d", brand: "Anycubic", model: "Photon Mono X6Ks", technology: "MSLA", materials: ["Standard Resin", "ABS-Like Resin", "Water Washable Resin"], gradient: "from-red-500 to-orange-500", buildVolume: "195×120×200 mm" },
  { id: "elegoo-saturn", category: "printing_3d", brand: "Elegoo", model: "Saturn 3 Ultra", technology: "MSLA", materials: ["Standard Resin", "ABS-Like Resin", "Plant-Based Resin"], gradient: "from-purple-600 to-violet-500", buildVolume: "218×123×260 mm" },
  { id: "markforged-x7", category: "printing_3d", brand: "Markforged", model: "X7", technology: "FDM", materials: ["Onyx", "Carbon fiber", "Fiberglass", "HSHT"], gradient: "from-stone-600 to-stone-500", buildVolume: "330×270×200 mm" },
  { id: "stratasys-f370", category: "printing_3d", brand: "Stratasys", model: "F370", technology: "FDM", materials: ["ABS", "ASA", "PLA", "TPU", "PC"], gradient: "from-blue-800 to-indigo-700", buildVolume: "355×254×355 mm" },
  { id: "3d-other", category: "printing_3d", brand: "Other", model: "", technology: "FDM", materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const WOODWORKING: CatalogEquipmentItem[] = [
  { id: "dewalt-dwe7491", category: "woodworking", brand: "DeWalt", model: "DWE7491 Jobsite Table Saw", technology: "other", toolOrServiceType: "Table saw", materials: ["Dimensional lumber", "Plywood", "MDF"], gradient: "from-yellow-600 to-amber-700", buildVolume: "32½\" rip" },
  { id: "makita-ls1219l", category: "woodworking", brand: "Makita", model: "LS1219L Miter Saw", technology: "other", toolOrServiceType: "Miter saw", materials: ["Trim", "Framing lumber", "Moldings"], gradient: "from-teal-600 to-cyan-700", buildVolume: "12\" blade" },
  { id: "bosch-gts1031", category: "woodworking", brand: "Bosch", model: "GTS1031 Portable Table Saw", technology: "other", toolOrServiceType: "Table saw", materials: ["Sheet goods", "Hardwood"], gradient: "from-blue-700 to-slate-700", buildVolume: "18\" rip" },
  { id: "sawstop-pcs", category: "woodworking", brand: "SawStop", model: "Professional Cabinet Saw", technology: "other", toolOrServiceType: "Cabinet table saw", materials: ["Cabinet-grade plywood", "Solid wood"], gradient: "from-green-700 to-emerald-800", buildVolume: "36\" fence" },
  { id: "festool-ts55", category: "woodworking", brand: "Festool", model: "TS 55 REQ Track Saw", technology: "other", toolOrServiceType: "Track saw", materials: ["Sheet goods", "Panels"], gradient: "from-green-600 to-lime-600", buildVolume: "55 mm cut depth" },
  { id: "jet-jjp12", category: "woodworking", brand: "Jet", model: "JJP-12 Jointer/Planer", technology: "other", toolOrServiceType: "Jointer / planer", materials: ["Rough lumber", "S4S stock"], gradient: "from-amber-700 to-yellow-800", buildVolume: "12\" width" },
  { id: "grizzly-g0777", category: "woodworking", brand: "Grizzly", model: "G0777 Wood Lathe", technology: "other", toolOrServiceType: "Wood lathe", materials: ["Bowls", "Spindles", "Turnings"], gradient: "from-orange-700 to-red-800", buildVolume: "16\" swing" },
  { id: "shapeoko-5", category: "woodworking", brand: "Carbide 3D", model: "Shapeoko 5 Pro", technology: "other", toolOrServiceType: "CNC router (wood)", materials: ["Hardwood", "Plywood", "MDF", "Aluminum light"], gradient: "from-rose-600 to-orange-600", buildVolume: "4'×4' configurable" },
  { id: "onefinity", category: "woodworking", brand: "Onefinity", model: "Woodworker X-50", technology: "other", toolOrServiceType: "CNC router (wood)", materials: ["Hardwood", "Plywood", "Acrylic"], gradient: "from-fuchsia-600 to-purple-700", buildVolume: "32\"×32\" typical" },
  { id: "milwaukee-m18-drill", category: "woodworking", brand: "Milwaukee", model: "M18 Fuel Drill/Driver", technology: "other", toolOrServiceType: "Cordless drill/driver", materials: ["Assembly", "Hardware install", "Pilot holes"], gradient: "from-red-600 to-rose-700", buildVolume: "Hand tool", allowsHourlyRate: false },
  { id: "dewalt-xr-impact", category: "woodworking", brand: "DeWalt", model: "20V MAX XR Impact Driver", technology: "other", toolOrServiceType: "Impact driver", materials: ["Fasteners", "Construction screws", "Lag bolts"], gradient: "from-amber-700 to-yellow-900", buildVolume: "Hand tool", allowsHourlyRate: false },
  { id: "wood-other", category: "woodworking", brand: "Other", model: "", technology: "other", toolOrServiceType: null, materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const METALWORKING: CatalogEquipmentItem[] = [
  { id: "lincoln-square-225", category: "metalworking", brand: "Lincoln Electric", model: "Square Wave 200 TIG", technology: "other", toolOrServiceType: "TIG welder", materials: ["Steel", "Stainless", "Aluminum"], gradient: "from-red-700 to-red-900", buildVolume: "200 A class" },
  { id: "miller-211", category: "metalworking", brand: "Miller", model: "Millermatic 211 MIG", technology: "other", toolOrServiceType: "MIG welder", materials: ["Mild steel", "Stainless", "Aluminum spool"], gradient: "from-slate-700 to-slate-900", buildVolume: "230 A" },
  { id: "hypertherm-45", category: "metalworking", brand: "Hypertherm", model: "Powermax45 XP", technology: "other", toolOrServiceType: "Plasma cutter", materials: ["Mild steel", "Stainless", "Aluminum"], gradient: "from-orange-600 to-red-700", buildVolume: "5/8\" steel rated" },
  { id: "haas-vf2", category: "metalworking", brand: "Haas", model: "VF-2SS", technology: "other", toolOrServiceType: "CNC vertical mill", materials: ["Aluminum", "Steel", "Brass"], gradient: "from-zinc-600 to-neutral-800", buildVolume: "30\"×16\"×20\" travel" },
  { id: "tormach-440", category: "metalworking", brand: "Tormach", model: "PCNC 440", technology: "other", toolOrServiceType: "CNC mill", materials: ["Aluminum", "Steel", "Plastics"], gradient: "from-blue-800 to-slate-900", buildVolume: "10\"×6.25\"×10\"" },
  { id: "bridgeport", category: "metalworking", brand: "Bridgeport-style", model: "Knee Mill", technology: "other", toolOrServiceType: "Manual mill", materials: ["Tool steel", "Aluminum", "Prototypes"], gradient: "from-stone-500 to-stone-700", buildVolume: "9\"×49\" table typical" },
  { id: "jet-bd920", category: "metalworking", brand: "Jet", model: "BD-920W Metal Lathe", technology: "other", toolOrServiceType: "Metal lathe", materials: ["Shafts", "Bushings", "Small parts"], gradient: "from-neutral-600 to-zinc-800", buildVolume: "9\" swing" },
  { id: "baileigh-tube", category: "metalworking", brand: "Baileigh", model: "RDB-125 Tube Bender", technology: "other", toolOrServiceType: "Tube / pipe bender", materials: ["Round tube", "Square tube"], gradient: "from-amber-800 to-yellow-900", buildVolume: "1½\" capacity" },
  { id: "jet-jdp-17", category: "metalworking", brand: "Jet", model: "JDP-17 Drill Press", technology: "other", toolOrServiceType: "Drill press", materials: ["Hole drilling", "Deburr prep", "Fixtures"], gradient: "from-slate-600 to-zinc-700", buildVolume: "17\" class", allowsHourlyRate: false },
  { id: "metal-other", category: "metalworking", brand: "Other", model: "", technology: "other", toolOrServiceType: null, materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const SERVICES: CatalogEquipmentItem[] = [
  { id: "svc-cad", category: "services", brand: "Service", model: "CAD & 3D modeling", technology: "other", toolOrServiceType: "Design / CAD", materials: ["Fusion 360", "SolidWorks", "STEP exports"], gradient: "from-indigo-600 to-violet-600", buildVolume: "Remote / files" },
  { id: "svc-laser", category: "services", brand: "Service", model: "CO₂ laser cutting", technology: "other", toolOrServiceType: "Laser cutting", materials: ["Acrylic", "Wood", "Leather", "Marking metal"], gradient: "from-pink-600 to-rose-700", buildVolume: "Up to 24\"×36\" typical" },
  { id: "svc-waterjet", category: "services", brand: "Service", model: "Waterjet cutting", technology: "other", toolOrServiceType: "Waterjet", materials: ["Steel", "Aluminum", "Stone", "Glass"], gradient: "from-cyan-700 to-blue-800", buildVolume: "Omnidirectional 2D" },
  { id: "svc-powder", category: "services", brand: "Service", model: "Powder coating", technology: "other", toolOrServiceType: "Powder coating", materials: ["Metal parts", "Bike frames", "Automotive"], gradient: "from-violet-700 to-purple-900", buildVolume: "Batch oven" },
  { id: "svc-sandblast", category: "services", brand: "Service", model: "Sandblasting / finishing", technology: "other", toolOrServiceType: "Surface prep", materials: ["Metal", "Glass", "Restoration"], gradient: "from-stone-600 to-stone-800", buildVolume: "Cabinet or booth" },
  { id: "svc-vinyl", category: "services", brand: "Service", model: "Vinyl & graphics", technology: "other", toolOrServiceType: "Vinyl / decals", materials: ["Vehicle wrap", "Signage", "Apparel heat transfer"], gradient: "from-fuchsia-600 to-pink-700", buildVolume: "Wide-format printer" },
  { id: "svc-other", category: "services", brand: "Other", model: "", technology: "other", toolOrServiceType: null, materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const OTHER_ONLY: CatalogEquipmentItem[] = [
  { id: "global-other", category: "other", brand: "Custom", model: "Describe your equipment", technology: "other", toolOrServiceType: null, materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

export const EQUIPMENT_CATALOG: CatalogEquipmentItem[] = [
  ...PRINTING_3D,
  ...WOODWORKING,
  ...METALWORKING,
  ...SERVICES,
  ...OTHER_ONLY,
];

export function catalogItemsForCategory(cat: EquipmentCategoryId): CatalogEquipmentItem[] {
  return EQUIPMENT_CATALOG.filter((e) => e.category === cat);
}

export function categoryLabel(cat: EquipmentCategoryId): string {
  const c = EQUIPMENT_CATEGORY_CHOICES.find((x) => x.id === cat);
  return c?.title ?? cat;
}

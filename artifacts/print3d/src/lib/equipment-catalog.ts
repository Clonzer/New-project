// Shared equipment picker data used across seller onboarding and dashboard flows.

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
    blurb: "FDM, resin, powder and industrial additive",
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    id: "woodworking",
    title: "Woodworking",
    blurb: "Shop tools, CNC timber and joinery",
    gradient: "from-amber-600 to-orange-600",
  },
  {
    id: "metalworking",
    title: "Metal fabrication",
    blurb: "Welding, cutting, mills and lathes",
    gradient: "from-slate-500 to-zinc-600",
  },
  {
    id: "services",
    title: "Design and services",
    blurb: "CAD, laser, finishing and graphics",
    gradient: "from-cyan-600 to-blue-600",
  },
  {
    id: "other",
    title: "Other",
    blurb: "Anything not listed, describe your setup",
    gradient: "from-zinc-700 to-zinc-500",
  },
];

const PRINTING_3D: CatalogEquipmentItem[] = [
  // Bambu Lab FDM
  { id: "bambu-x1c", category: "printing_3d", brand: "Bambu Lab", model: "X1 Carbon", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA", "PC"], gradient: "from-blue-600 to-cyan-500", buildVolume: "256x256x256 mm" },
  { id: "bambu-p1s", category: "printing_3d", brand: "Bambu Lab", model: "P1S", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA"], gradient: "from-indigo-600 to-blue-400", buildVolume: "256x256x256 mm" },
  { id: "bambu-p1", category: "printing_3d", brand: "Bambu Lab", model: "P1", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-blue-700 to-indigo-600", buildVolume: "256x256x256 mm" },
  { id: "bambu-a1-mini", category: "printing_3d", brand: "Bambu Lab", model: "A1 Mini", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-emerald-500 to-teal-400", buildVolume: "180x180x180 mm" },
  { id: "bambu-a1", category: "printing_3d", brand: "Bambu Lab", model: "A1", technology: "FDM", materials: ["PLA", "PETG", "TPU", "PA"], gradient: "from-teal-500 to-emerald-500", buildVolume: "256x256x256 mm" },
  { id: "bambu-h2d", category: "printing_3d", brand: "Bambu Lab", model: "H2D", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA", "PC", "High-temp composites"], gradient: "from-cyan-500 to-sky-500", buildVolume: "350x320x325 mm" },
  
  // Prusa FDM
  { id: "prusa-mk4", category: "printing_3d", brand: "Prusa", model: "MK4", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "Flex"], gradient: "from-orange-500 to-red-500", buildVolume: "250x210x220 mm" },
  { id: "prusa-mk3s-plus", category: "printing_3d", brand: "Prusa", model: "MK3S+", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "Flex"], gradient: "from-orange-600 to-red-600", buildVolume: "250x210x210 mm" },
  { id: "prusa-mini-plus", category: "printing_3d", brand: "Prusa", model: "MINI+", technology: "FDM", materials: ["PLA", "PETG", "FLEX"], gradient: "from-amber-600 to-orange-600", buildVolume: "180x180x180 mm" },
  { id: "prusa-core-one", category: "printing_3d", brand: "Prusa", model: "CORE One", technology: "FDM", materials: ["PLA", "PETG", "Flex", "PVA", "PC", "PP", "CPE", "PVB", "ABS", "ASA", "PA"], gradient: "from-orange-600 to-amber-600", buildVolume: "250x220x270 mm" },
  { id: "prusa-xl", category: "printing_3d", brand: "Prusa", model: "XL", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "Flex", "PVA", "PC"], gradient: "from-amber-500 to-orange-500", buildVolume: "360x360x360 mm" },
  { id: "prusa-core-xy", category: "printing_3d", brand: "Prusa", model: "CORE XY", technology: "FDM", materials: ["PLA", "PETG", "ASA", "PA"], gradient: "from-yellow-600 to-amber-700", buildVolume: "384x355x350 mm" },
  
  // Creality FDM
  { id: "creality-ender-3", category: "printing_3d", brand: "Creality", model: "Ender 3", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-gray-500 to-zinc-500", buildVolume: "220x220x250 mm" },
  { id: "creality-ender-3-v2", category: "printing_3d", brand: "Creality", model: "Ender 3 V2", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-zinc-500 to-slate-500", buildVolume: "220x220x250 mm" },
  { id: "creality-ender-3-v3", category: "printing_3d", brand: "Creality", model: "Ender 3 V3", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-slate-500 to-gray-600", buildVolume: "220x220x250 mm" },
  { id: "creality-ender-3-v3-se", category: "printing_3d", brand: "Creality", model: "Ender 3 V3 SE", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-zinc-500 to-zinc-400", buildVolume: "220x220x250 mm" },
  { id: "creality-ender-5", category: "printing_3d", brand: "Creality", model: "Ender 5", technology: "FDM", materials: ["PLA", "PETG", "ABS", "TPU"], gradient: "from-emerald-600 to-teal-600", buildVolume: "220x220x300 mm" },
  { id: "creality-k1", category: "printing_3d", brand: "Creality", model: "K1", technology: "FDM", materials: ["PLA", "PETG", "ABS", "PA"], gradient: "from-sky-600 to-blue-600", buildVolume: "300x300x400 mm" },
  { id: "creality-k1-max", category: "printing_3d", brand: "Creality", model: "K1 Max", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "TPU", "PA"], gradient: "from-slate-600 to-zinc-500", buildVolume: "300x300x300 mm" },
  { id: "creality-k2-plus", category: "printing_3d", brand: "Creality", model: "K2 Plus Combo", technology: "FDM", materials: ["PLA", "ABS", "PETG", "PA-CF", "PLA-CF", "PET", "ASA", "PPA-CF"], gradient: "from-neutral-700 to-slate-500", buildVolume: "350x350x350 mm" },
  { id: "creality-cr10", category: "printing_3d", brand: "Creality", model: "CR-10", technology: "FDM", materials: ["PLA", "ABS", "PETG"], gradient: "from-red-700 to-orange-700", buildVolume: "300x300x400 mm" },
  
  // Qidi
  { id: "qidi-plus4", category: "printing_3d", brand: "QIDI", model: "Plus4", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "PA", "PC"], gradient: "from-blue-500 to-indigo-500", buildVolume: "305x305x280 mm" },
  { id: "qidi-i-fast", category: "printing_3d", brand: "QIDI", model: "i-Fast", technology: "FDM", materials: ["PLA", "PETG", "ABS"], gradient: "from-indigo-500 to-purple-500", buildVolume: "250x250x250 mm" },
  
  // Flashforge
  { id: "flashforge-ad5x", category: "printing_3d", brand: "Flashforge", model: "Adventurer 5X", technology: "FDM", materials: ["PLA", "PETG", "TPU", "ABS"], gradient: "from-sky-500 to-cyan-500", buildVolume: "220x220x220 mm" },
  { id: "flashforge-ad5", category: "printing_3d", brand: "Flashforge", model: "Adventurer 5", technology: "FDM", materials: ["PLA", "TPU"], gradient: "from-cyan-500 to-blue-500", buildVolume: "220x220x220 mm" },
  
  // Voron
  { id: "voron-24", category: "printing_3d", brand: "Voron", model: "2.4", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "PA"], gradient: "from-pink-500 to-rose-500", buildVolume: "350x350x350 mm" },
  { id: "voron-trident", category: "printing_3d", brand: "Voron", model: "Trident", technology: "FDM", materials: ["PLA", "PETG", "ABS"], gradient: "from-rose-500 to-pink-600", buildVolume: "250x250x250 mm" },
  
  // Ultimaker
  { id: "ultimaker-s5", category: "printing_3d", brand: "Ultimaker", model: "S5", technology: "FDM", materials: ["Ultimaker materials", "Thermoplastics"], gradient: "from-blue-700 to-indigo-600", buildVolume: "330x240x300 mm" },
  { id: "ultimaker-s7", category: "printing_3d", brand: "Ultimaker", model: "S7", technology: "FDM", materials: ["PLA", "ABS", "Nylon", "PC", "TPU", "PVA", "CPE"], gradient: "from-sky-500 to-blue-600", buildVolume: "330x240x300 mm" },
  { id: "ultimaker-3", category: "printing_3d", brand: "Ultimaker", model: "Ultimaker 3", technology: "FDM", materials: ["PLA", "ABS", "Nylon"], gradient: "from-indigo-600 to-blue-500", buildVolume: "215x215x200 mm" },
  
  // Raise3D
  { id: "raise3d-pro3", category: "printing_3d", brand: "Raise3D", model: "Pro3", technology: "FDM", materials: ["PLA", "PETG", "ABS", "ASA", "PA", "PC", "TPU", "PVA"], gradient: "from-zinc-700 to-zinc-600", buildVolume: "300x300x300 mm" },
  { id: "raise3d-pro3-hs", category: "printing_3d", brand: "Raise3D", model: "Pro3 HS", technology: "FDM", materials: ["PLA", "ABS", "ASA", "PETG", "PA", "PC", "TPU", "Composite filaments"], gradient: "from-slate-800 to-zinc-700", buildVolume: "300x300x300 mm" },
  
  // Formlabs - Resin/Powder
  { id: "formlabs-form3", category: "printing_3d", brand: "Formlabs", model: "Form 3+", technology: "SLA", materials: ["Standard Resin", "Engineering Resin", "Flexible Resin", "Dental Resin"], gradient: "from-orange-400 to-amber-400", buildVolume: "145x145x185 mm" },
  { id: "formlabs-form3-l", category: "printing_3d", brand: "Formlabs", model: "Form 3L", technology: "SLA", materials: ["Standard Resin", "Engineering Resin", "Flexible Resin"], gradient: "from-amber-400 to-yellow-400", buildVolume: "337.5x212.5x200 mm" },
  { id: "formlabs-form4", category: "printing_3d", brand: "Formlabs", model: "Form 4", technology: "MSLA", materials: ["Standard Resin", "Engineering Resin", "Flexible Resin", "Biocompatible Resin", "Third-party OMM resins"], gradient: "from-amber-500 to-yellow-400", buildVolume: "200x125x210 mm" },
  { id: "formlabs-form4l", category: "printing_3d", brand: "Formlabs", model: "Form 4L", technology: "MSLA", materials: ["Standard Resin", "Engineering Resin", "Flexible Resin", "Large-format production resin"], gradient: "from-yellow-500 to-orange-500", buildVolume: "353x196x350 mm" },
  { id: "formlabs-fuse1", category: "printing_3d", brand: "Formlabs", model: "Fuse 1+ 30W", technology: "SLS", materials: ["Nylon 12", "Nylon 11", "TPU", "Composite powder"], gradient: "from-neutral-600 to-stone-600", buildVolume: "165x165x300 mm" },
  
  // Formlabs Stereo lithography
  { id: "formlabs-form2", category: "printing_3d", brand: "Formlabs", model: "Form 2", technology: "SLA", materials: ["Resin", "Surgical Guide resin"], gradient: "from-orange-300 to-amber-300", buildVolume: "145x145x175 mm" },
  
  // Anycubic - Resin
  { id: "anycubic-photon-mono-x6ks", category: "printing_3d", brand: "Anycubic", model: "Photon Mono X6Ks", technology: "MSLA", materials: ["Standard Resin", "ABS-Like Resin", "Water Washable Resin"], gradient: "from-red-500 to-orange-500", buildVolume: "195x120x200 mm" },
  { id: "anycubic-photon-m3-plus", category: "printing_3d", brand: "Anycubic", model: "Photon M3 Plus", technology: "MSLA", materials: ["Standard Resin", "Engineering Resin"], gradient: "from-orange-600 to-red-500", buildVolume: "192x120x200 mm" },
  { id: "anycubic-photon-m4", category: "printing_3d", brand: "Anycubic", model: "Photon M4", technology: "MSLA", materials: ["Standard Resin", "ABS-Like"], gradient: "from-red-600 to-orange-600", buildVolume: "218x123x220 mm" },
  
  // Anycubic - FDM
  { id: "anycubic-kobra-3", category: "printing_3d", brand: "Anycubic", model: "Kobra 3 Combo", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-rose-500 to-red-500", buildVolume: "250x250x260 mm" },
  { id: "anycubic-kobra-3-max", category: "printing_3d", brand: "Anycubic", model: "Kobra 3 Max", technology: "FDM", materials: ["PLA", "PETG", "ABS"], gradient: "from-red-500 to-pink-500", buildVolume: "430x430x450 mm" },
  
  // Anycubic - Other Resin
  { id: "anycubic-m7-pro", category: "printing_3d", brand: "Anycubic", model: "Photon Mono M7 Pro", technology: "MSLA", materials: ["Standard Resin", "ABS-Like Resin", "Tough Resin", "Water Washable Resin"], gradient: "from-red-600 to-pink-600", buildVolume: "223x126x230 mm" },
  
  // Elegoo - Resin
  { id: "elegoo-saturn-3-ultra", category: "printing_3d", brand: "Elegoo", model: "Saturn 3 Ultra", technology: "MSLA", materials: ["Standard Resin", "ABS-Like Resin", "Plant-Based Resin"], gradient: "from-purple-600 to-violet-500", buildVolume: "218x123x260 mm" },
  { id: "elegoo-saturn-4-ultra", category: "printing_3d", brand: "Elegoo", model: "Saturn 4 Ultra", technology: "MSLA", materials: ["Standard Resin", "ABS-Like Resin", "Plant-Based Resin", "Tough Resin"], gradient: "from-fuchsia-600 to-violet-600", buildVolume: "218.88x122.88x220 mm" },
  { id: "elegoo-saturn", category: "printing_3d", brand: "Elegoo", model: "Saturn", technology: "MSLA", materials: ["Standard Resin"], gradient: "from-purple-700 to-indigo-700", buildVolume: "218x123x185 mm" },
  { id: "elegoo-neptune-4", category: "printing_3d", brand: "Elegoo", model: "Neptune 4", technology: "FDM", materials: ["PLA", "PETG", "TPU"], gradient: "from-blue-600 to-cyan-600", buildVolume: "220x220x250 mm" },
  
  // Markforged
  { id: "markforged-x7", category: "printing_3d", brand: "Markforged", model: "X7", technology: "FDM", materials: ["Onyx", "Carbon fiber", "Fiberglass", "HSHT"], gradient: "from-stone-600 to-stone-500", buildVolume: "330x270x200 mm" },
  { id: "markforged-fx20", category: "printing_3d", brand: "Markforged", model: "FX20", technology: "FDM", materials: ["Onyx", "Carbon fiber", "Fiberglass"], gradient: "from-neutral-700 to-stone-600", buildVolume: "300x167x200 mm" },
  
  // Stratasys
  { id: "stratasys-f370", category: "printing_3d", brand: "Stratasys", model: "F370", technology: "FDM", materials: ["ABS", "ASA", "PLA", "TPU", "PC"], gradient: "from-blue-800 to-indigo-700", buildVolume: "355x254x355 mm" },
  { id: "stratasys-f170-f270", category: "printing_3d", brand: "Stratasys", model: "F170 / F270", technology: "FDM", materials: ["ABS", "ASA"], gradient: "from-indigo-800 to-blue-800", buildVolume: "254x254x254 mm / 254x254x305 mm" },
  { id: "stratasys-j7", category: "printing_3d", brand: "Stratasys", model: "J7", technology: "MJF", materials: ["Full color sandstone"], gradient: "from-amber-800 to-orange-800", buildVolume: "127x80x72 mm" },
  
  // HP Jet Fusion
  { id: "hp-mjf-4200", category: "printing_3d", brand: "HP", model: "Jet Fusion 4200", technology: "MJF", materials: ["PA 12", "PA 11", "TPA"], gradient: "from-blue-700 to-cyan-700", buildVolume: "380x284x380 mm" },
  { id: "hp-mjf-580-color", category: "printing_3d", brand: "HP", model: "Jet Fusion 580 Color", technology: "MJF", materials: ["PA 12", "PA 11 GF", "TPU"], gradient: "from-cyan-600 to-sky-700", buildVolume: "302.4x191.04x381 mm" },
  
  // EOS - Industrial Powder/Laser
  { id: "eos-m290", category: "printing_3d", brand: "EOS", model: "M 290", technology: "DMLS", materials: ["Stainless steel", "Tool steel", "Aluminum", "Nickel alloys", "Titanium"], gradient: "from-slate-700 to-gray-700", buildVolume: "250x250x325 mm" },
  { id: "eos-m300", category: "printing_3d", brand: "EOS", model: "M 300", technology: "DMLS", materials: ["Steel", "Titanium", "Aluminum"], gradient: "from-gray-700 to-slate-800", buildVolume: "300x300x400 mm" },
  { id: "eos-p500", category: "printing_3d", brand: "EOS", model: "P 500", technology: "SLS", materials: ["Nylon 12", "Nylon 11"], gradient: "from-stone-600 to-zinc-700", buildVolume: "300x300x400 mm" },
  
  // 3D Systems / Sinterit (SLS)
  { id: "sinterit-lisa-x", category: "printing_3d", brand: "Sinterit", model: "LISA X", technology: "SLS", materials: ["PA 12", "TPU"], gradient: "from-fuchsia-700 to-rose-700", buildVolume: "300x300x150 mm" },
  
  // Other popular brands
  { id: "anycubic-mega-x", category: "printing_3d", brand: "Anycubic", model: "MEGA X", technology: "FDM", materials: ["PLA", "ABS", "PETG"], gradient: "from-orange-700 to-rose-700", buildVolume: "300x300x305 mm" },
  { id: "peopoly-phenom-rsv", category: "printing_3d", brand: "Peopoly", model: "Phenom RSV", technology: "SLA", materials: ["Resin"], gradient: "from-indigo-600 to-purple-600", buildVolume: "192x120x200 mm" },
  { id: "3d-other", category: "printing_3d", brand: "Other", model: "", technology: "FDM", materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const WOODWORKING: CatalogEquipmentItem[] = [
  { id: "dewalt-dwe7491", category: "woodworking", brand: "DeWalt", model: "DWE7491 Jobsite Table Saw", technology: "other", toolOrServiceType: "Table saw", materials: ["Dimensional lumber", "Plywood", "MDF"], gradient: "from-yellow-600 to-amber-700", buildVolume: "32.5 in rip" },
  { id: "makita-ls1219l", category: "woodworking", brand: "Makita", model: "LS1219L Miter Saw", technology: "other", toolOrServiceType: "Miter saw", materials: ["Trim", "Framing lumber", "Moldings"], gradient: "from-teal-600 to-cyan-700", buildVolume: "12 in blade" },
  { id: "bosch-gts1031", category: "woodworking", brand: "Bosch", model: "GTS1031 Portable Table Saw", technology: "other", toolOrServiceType: "Table saw", materials: ["Sheet goods", "Hardwood"], gradient: "from-blue-700 to-slate-700", buildVolume: "18 in rip" },
  { id: "sawstop-pcs", category: "woodworking", brand: "SawStop", model: "Professional Cabinet Saw", technology: "other", toolOrServiceType: "Cabinet table saw", materials: ["Cabinet-grade plywood", "Solid wood"], gradient: "from-green-700 to-emerald-800", buildVolume: "36 in fence" },
  { id: "festool-ts55", category: "woodworking", brand: "Festool", model: "TS 55 REQ Track Saw", technology: "other", toolOrServiceType: "Track saw", materials: ["Sheet goods", "Panels"], gradient: "from-green-600 to-lime-600", buildVolume: "55 mm cut depth" },
  { id: "festool-df700", category: "woodworking", brand: "Festool", model: "DOMINO XL DF 700", technology: "other", toolOrServiceType: "Joiner / mortiser", materials: ["Hardwood", "Sheet goods", "Joinery"], gradient: "from-lime-600 to-green-700", buildVolume: "8-14 mm cutters" },
  { id: "jet-jjp12", category: "woodworking", brand: "Jet", model: "JJP-12 Jointer/Planer", technology: "other", toolOrServiceType: "Jointer / planer", materials: ["Rough lumber", "S4S stock"], gradient: "from-amber-700 to-yellow-800", buildVolume: "12 in width" },
  { id: "grizzly-g0777", category: "woodworking", brand: "Grizzly", model: "G0777 Wood Lathe", technology: "other", toolOrServiceType: "Wood lathe", materials: ["Bowls", "Spindles", "Turnings"], gradient: "from-orange-700 to-red-800", buildVolume: "16 in swing" },
  { id: "shapeoko-5", category: "woodworking", brand: "Carbide 3D", model: "Shapeoko 5 Pro", technology: "other", toolOrServiceType: "CNC router (wood)", materials: ["Hardwood", "Plywood", "MDF", "Aluminum light"], gradient: "from-rose-600 to-orange-600", buildVolume: "4 ft x 4 ft configurable" },
  { id: "onefinity", category: "woodworking", brand: "Onefinity", model: "Woodworker X-50", technology: "other", toolOrServiceType: "CNC router (wood)", materials: ["Hardwood", "Plywood", "Acrylic"], gradient: "from-fuchsia-600 to-purple-700", buildVolume: "32 in x 32 in typical" },
  { id: "laguna-swift", category: "woodworking", brand: "Laguna", model: "Swift CNC", technology: "other", toolOrServiceType: "CNC router (wood)", materials: ["Hardwood", "Plywood", "Composites"], gradient: "from-orange-600 to-amber-600", buildVolume: "4 ft x 8 ft typical" },
  { id: "shaper-origin", category: "woodworking", brand: "Shaper", model: "Origin", technology: "other", toolOrServiceType: "Handheld CNC router", materials: ["Hardwood", "Plywood", "Laminates"], gradient: "from-violet-600 to-indigo-600", buildVolume: "Portable / work-area driven" },
  { id: "powermatic-pm2000", category: "woodworking", brand: "Powermatic", model: "PM2000 Table Saw", technology: "other", toolOrServiceType: "Cabinet table saw", materials: ["Hardwood", "Plywood", "Panels"], gradient: "from-yellow-700 to-orange-700", buildVolume: "50 in fence" },
  { id: "milwaukee-m18-drill", category: "woodworking", brand: "Milwaukee", model: "M18 Fuel Drill/Driver", technology: "other", toolOrServiceType: "Cordless drill/driver", materials: ["Assembly", "Hardware install", "Pilot holes"], gradient: "from-red-600 to-rose-700", buildVolume: "Hand tool", allowsHourlyRate: false },
  { id: "dewalt-xr-impact", category: "woodworking", brand: "DeWalt", model: "20V MAX XR Impact Driver", technology: "other", toolOrServiceType: "Impact driver", materials: ["Fasteners", "Construction screws", "Lag bolts"], gradient: "from-amber-700 to-yellow-900", buildVolume: "Hand tool", allowsHourlyRate: false },
  { id: "wood-other", category: "woodworking", brand: "Other", model: "", technology: "other", toolOrServiceType: null, materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const METALWORKING: CatalogEquipmentItem[] = [
  { id: "lincoln-square-225", category: "metalworking", brand: "Lincoln Electric", model: "Square Wave 200 TIG", technology: "other", toolOrServiceType: "TIG welder", materials: ["Steel", "Stainless", "Aluminum"], gradient: "from-red-700 to-red-900", buildVolume: "200 A class" },
  { id: "miller-211", category: "metalworking", brand: "Miller", model: "Millermatic 211 MIG", technology: "other", toolOrServiceType: "MIG welder", materials: ["Mild steel", "Stainless", "Aluminum spool"], gradient: "from-slate-700 to-slate-900", buildVolume: "230 A" },
  { id: "hypertherm-45", category: "metalworking", brand: "Hypertherm", model: "Powermax45 XP", technology: "other", toolOrServiceType: "Plasma cutter", materials: ["Mild steel", "Stainless", "Aluminum"], gradient: "from-orange-600 to-red-700", buildVolume: "5/8 in steel rated" },
  { id: "haas-vf2", category: "metalworking", brand: "Haas", model: "VF-2SS", technology: "other", toolOrServiceType: "CNC vertical mill", materials: ["Aluminum", "Steel", "Brass"], gradient: "from-zinc-600 to-neutral-800", buildVolume: "30 in x 16 in x 20 in travel" },
  { id: "tormach-440", category: "metalworking", brand: "Tormach", model: "PCNC 440", technology: "other", toolOrServiceType: "CNC mill", materials: ["Aluminum", "Steel", "Plastics"], gradient: "from-blue-800 to-slate-900", buildVolume: "10 in x 6.25 in x 10 in" },
  { id: "tormach-8l", category: "metalworking", brand: "Tormach", model: "8L Lathe", technology: "other", toolOrServiceType: "CNC lathe", materials: ["Aluminum", "Steel", "Brass"], gradient: "from-sky-800 to-blue-900", buildVolume: "8 in chuck class" },
  { id: "bridgeport", category: "metalworking", brand: "Bridgeport-style", model: "Knee Mill", technology: "other", toolOrServiceType: "Manual mill", materials: ["Tool steel", "Aluminum", "Prototypes"], gradient: "from-stone-500 to-stone-700", buildVolume: "9 in x 49 in table typical" },
  { id: "jet-bd920", category: "metalworking", brand: "Jet", model: "BD-920W Metal Lathe", technology: "other", toolOrServiceType: "Metal lathe", materials: ["Shafts", "Bushings", "Small parts"], gradient: "from-neutral-600 to-zinc-800", buildVolume: "9 in swing" },
  { id: "baileigh-tube", category: "metalworking", brand: "Baileigh", model: "RDB-125 Tube Bender", technology: "other", toolOrServiceType: "Tube / pipe bender", materials: ["Round tube", "Square tube"], gradient: "from-amber-800 to-yellow-900", buildVolume: "1.5 in capacity" },
  { id: "omax-waterjet", category: "metalworking", brand: "OMAX", model: "Waterjet System", technology: "other", toolOrServiceType: "Waterjet cutting", materials: ["Steel", "Aluminum", "Titanium", "Stone"], gradient: "from-cyan-800 to-blue-900", buildVolume: "Sheet-based cutting bed" },
  { id: "langmuir-mr1", category: "metalworking", brand: "Langmuir", model: "MR-1", technology: "other", toolOrServiceType: "CNC mill", materials: ["Aluminum", "Steel", "Brass"], gradient: "from-slate-800 to-gray-800", buildVolume: "16 in x 12 in x 9 in" },
  { id: "langmuir-crossfire", category: "metalworking", brand: "Langmuir", model: "CrossFire Pro", technology: "other", toolOrServiceType: "CNC plasma table", materials: ["Steel", "Stainless", "Aluminum"], gradient: "from-orange-700 to-red-800", buildVolume: "Water table format" },
  { id: "jet-jdp-17", category: "metalworking", brand: "Jet", model: "JDP-17 Drill Press", technology: "other", toolOrServiceType: "Drill press", materials: ["Hole drilling", "Deburr prep", "Fixtures"], gradient: "from-slate-600 to-zinc-700", buildVolume: "17 in class", allowsHourlyRate: false },
  { id: "metal-other", category: "metalworking", brand: "Other", model: "", technology: "other", toolOrServiceType: null, materials: [], gradient: "from-zinc-700 to-zinc-600", buildVolume: "", isOther: true },
];

const SERVICES: CatalogEquipmentItem[] = [
  { id: "svc-cad", category: "services", brand: "Service", model: "CAD and 3D modeling", technology: "other", toolOrServiceType: "Design / CAD", materials: ["Fusion 360", "SolidWorks", "STEP exports"], gradient: "from-indigo-600 to-violet-600", buildVolume: "Remote / files" },
  { id: "svc-laser", category: "services", brand: "Service", model: "CO2 laser cutting", technology: "other", toolOrServiceType: "Laser cutting", materials: ["Acrylic", "Wood", "Leather", "Marking metal"], gradient: "from-pink-600 to-rose-700", buildVolume: "Up to 24 in x 36 in typical" },
  { id: "svc-fiber-laser", category: "services", brand: "Service", model: "Fiber laser marking", technology: "other", toolOrServiceType: "Laser marking", materials: ["Stainless steel", "Aluminum", "Coated metals", "Plastics"], gradient: "from-sky-700 to-indigo-700", buildVolume: "Desktop to benchtop" },
  { id: "svc-waterjet", category: "services", brand: "Service", model: "Waterjet cutting", technology: "other", toolOrServiceType: "Waterjet", materials: ["Steel", "Aluminum", "Stone", "Glass"], gradient: "from-cyan-700 to-blue-800", buildVolume: "Omnidirectional 2D" },
  { id: "svc-powder", category: "services", brand: "Service", model: "Powder coating", technology: "other", toolOrServiceType: "Powder coating", materials: ["Metal parts", "Bike frames", "Automotive"], gradient: "from-violet-700 to-purple-900", buildVolume: "Batch oven" },
  { id: "svc-sandblast", category: "services", brand: "Service", model: "Sandblasting / finishing", technology: "other", toolOrServiceType: "Surface prep", materials: ["Metal", "Glass", "Restoration"], gradient: "from-stone-600 to-stone-800", buildVolume: "Cabinet or booth" },
  { id: "svc-vinyl", category: "services", brand: "Service", model: "Vinyl and graphics", technology: "other", toolOrServiceType: "Vinyl / decals", materials: ["Vehicle wrap", "Signage", "Apparel heat transfer"], gradient: "from-fuchsia-600 to-pink-700", buildVolume: "Wide-format printer" },
  { id: "svc-urethane", category: "services", brand: "Service", model: "Vacuum casting / urethane", technology: "other", toolOrServiceType: "Casting", materials: ["PU resin", "Silicone mold workflows"], gradient: "from-teal-700 to-cyan-700", buildVolume: "Batch production" },
  { id: "svc-finishing-premium", category: "services", brand: "Service", model: "Paint, dye and premium finishing", technology: "other", toolOrServiceType: "Finishing", materials: ["3D prints", "Wood", "Metal", "Props"], gradient: "from-purple-700 to-fuchsia-700", buildVolume: "Project based" },
  { id: "svc-scan", category: "services", brand: "Service", model: "3D scanning", technology: "other", toolOrServiceType: "Scanning", materials: ["Reverse engineering", "Reference capture", "Inspection"], gradient: "from-cyan-600 to-sky-700", buildVolume: "Object scanning" },
  { id: "svc-cad-cam", category: "services", brand: "Service", model: "CAD/CAM programming", technology: "other", toolOrServiceType: "CAM programming", materials: ["Toolpaths", "Fixtures", "Manufacturing prep"], gradient: "from-indigo-700 to-violet-700", buildVolume: "Digital workflow" },
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
  return EQUIPMENT_CATALOG.filter((item) => item.category === cat);
}

export function brandsForCategory(cat: EquipmentCategoryId): string[] {
  return Array.from(new Set(catalogItemsForCategory(cat).map((item) => item.brand)));
}

export function catalogItemsForCategoryAndBrand(cat: EquipmentCategoryId, brand: string): CatalogEquipmentItem[] {
  return catalogItemsForCategory(cat).filter((item) => item.brand === brand);
}

export function categoryLabel(cat: EquipmentCategoryId): string {
  const category = EQUIPMENT_CATEGORY_CHOICES.find((choice) => choice.id === cat);
  return category?.title ?? cat;
}

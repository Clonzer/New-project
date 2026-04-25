import { useMemo } from "react";
import { Calculator, CreditCard, Package, Truck, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface FeeBreakdown {
  basePrice: number;
  labelFee: number;
  stripeFee: number;
  shippingCost: number;
  totalFees: number;
  buyerPrice: number;
  sellerEarnings: number;
  platformFee: number;
}

interface PricingCalculatorProps {
  basePrice: number;
  shippingCost?: number;
  carrier?: string;
  showDetails?: boolean;
}

// Label fees by carrier (per shipment)
const CARRIER_LABEL_FEES: Record<string, number> = {
  // US Carriers - FREE through Shippo
  usps: 0.00,
  ups: 0.00,
  fedex: 0.00,
  
  // UK/EU Carriers - mostly FREE
  evri: 0.00,        // Evri UK
  inpost: 0.00,      // InPost EU
  dpd: 0.00,         // DPD EU
  royalmail: 0.00,   // Royal Mail UK
  parcelforce: 0.00, // Parcelforce UK
  hermes: 0.00,      // Hermes EU
  
  // Asia Pacific
  auspost: 0.00,     // Australia Post
  sfexpress: 0.05,    // SF Express ~$0.05
  japanpost: 0.00,    // Japan Post
  aramex: 0.05,       // Aramex ~$0.05
  
  // Other
  canadapost: 0.00,   // Canada Post
  
  // International
  dhl: 0.05,         // DHL Express
  
  // Custom - user pays
  custom: 0.00,
  default: 0.05,
};

export function calculateFees(basePrice: number, shippingCost: number = 0, carrier: string = "default"): FeeBreakdown {
  const labelFee = CARRIER_LABEL_FEES[carrier.toLowerCase()] ?? CARRIER_LABEL_FEES.default;
  const stripePercentage = 0.029; // 2.9%
  const stripeFixed = 0.30;       // $0.30
  const platformFeePercentage = 0.05; // 5% platform fee
  
  // Subtotal before fees
  const subtotal = basePrice + shippingCost;
  
  // Calculate fees on the total
  const stripeFee = (subtotal * stripePercentage) + stripeFixed;
  const platformFee = subtotal * platformFeePercentage;
  const totalFees = labelFee + stripeFee + platformFee;
  
  // What buyer pays (base + shipping + fees)
  const buyerPrice = subtotal + totalFees;
  
  // What seller earns (base - platform fee - label fee)
  // Stripe fee is paid by buyer but processed through platform
  const sellerEarnings = basePrice - platformFee - labelFee;
  
  return {
    basePrice,
    labelFee,
    stripeFee,
    shippingCost,
    totalFees,
    buyerPrice,
    sellerEarnings,
    platformFee,
  };
}

interface BuyerPriceDisplayProps {
  basePrice: number;
  shippingCost?: number;
  carrier?: string;
}

export function BuyerPriceDisplay({
  basePrice,
  shippingCost = 0,
  carrier = "default"
}: BuyerPriceDisplayProps) {
  const fees = useMemo(() => calculateFees(basePrice, shippingCost, carrier), [basePrice, shippingCost, carrier]);
  const carrierName = carrier.charAt(0).toUpperCase() + carrier.slice(1);
  
  // Shipping includes: actual shipping + label fee + platform fee + stripe fee
  const totalShipping = shippingCost + fees.labelFee + fees.platformFee + fees.stripeFee;
  const totalPrice = basePrice + totalShipping;
  
  return (
    <TooltipProvider>
      <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4 space-y-3">
        <div className="space-y-2 text-sm">
          {/* Product Price */}
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Product</span>
            <span className="text-white font-medium">${basePrice.toFixed(2)}</span>
          </div>
          
          {/* Shipping (includes all fees) */}
          <div className="flex justify-between items-center">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors cursor-help">
                <span>Shipping & Fees</span>
                <Info className="w-3 h-3" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>Includes shipping, label fee, payment processing, and platform fee</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-white">+${totalShipping.toFixed(2)}</span>
          </div>
          
          {/* Carrier Info */}
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Ships via {carrierName}
          </div>
          
          <div className="border-t border-white/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 font-medium">Total</span>
              <span className="text-xl font-bold text-white">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function PricingCalculator({ 
  basePrice, 
  shippingCost = 0, 
  carrier = "default",
  showDetails = true 
}: PricingCalculatorProps) {
  const fees = useMemo(() => calculateFees(basePrice, shippingCost, carrier), [basePrice, shippingCost, carrier]);
  
  const carrierName = carrier.charAt(0).toUpperCase() + carrier.slice(1);
  const carrierFee = CARRIER_LABEL_FEES[carrier.toLowerCase()] ?? CARRIER_LABEL_FEES.default;
  
  return (
    <TooltipProvider>
      <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <Calculator className="w-4 h-4 text-primary" />
          <span>Price Breakdown</span>
        </div>
        
        {showDetails && (
          <div className="space-y-2 text-sm">
            {/* Base Price */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Your Price</span>
              <span className="text-white font-medium">${basePrice.toFixed(2)}</span>
            </div>
            
            {/* Shipping */}
            {shippingCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Shipping ({carrierName})</span>
                <span className="text-white">+${shippingCost.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-white/10 pt-2 space-y-2">
              {/* Label Fee */}
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help">
                    <Package className="w-3.5 h-3.5" />
                    <span>Label Fee ({carrierName})</span>
                    <Info className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Carrier label generation fee. USPS/UPS/FedEx typically free, DHL ~$0.05</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-zinc-500">
                  {fees.labelFee === 0 ? "FREE" : `$${fees.labelFee.toFixed(2)}`}
                </span>
              </div>
              
              {/* Stripe Fee */}
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Processing</span>
                    <Info className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Stripe fee: 2.9% + $0.30 per transaction</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-zinc-500">${fees.stripeFee.toFixed(2)}</span>
              </div>
              
              {/* Platform Fee */}
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Platform Fee (5%)</span>
                    <Info className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Platform fee to maintain marketplace infrastructure</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-zinc-500">${fees.platformFee.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Total */}
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-300">Buyer Pays</span>
                <span className="text-lg font-bold text-white">${fees.buyerPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                <span className="text-emerald-400 font-medium">You Earn</span>
                <span className="text-lg font-bold text-emerald-400">${fees.sellerEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        {!showDetails && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-zinc-400 text-sm">Buyer pays</p>
              <p className="text-xl font-bold text-white">${fees.buyerPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 text-sm">You earn</p>
              <p className="text-xl font-bold text-emerald-400">${fees.sellerEarnings.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

interface CarrierSelectorProps { 
  value: string; 
  onChange: (carrier: string) => void;
  customCarrier?: string;
  onCustomCarrierChange?: (value: string) => void;
  allowCustom?: boolean;
}

export function CarrierSelector({ 
  value, 
  onChange,
  customCarrier,
  onCustomCarrierChange,
  allowCustom = true
}: CarrierSelectorProps) {
  const carriers = [
    // US Carriers
    { id: "usps", name: "USPS", fee: "FREE", time: "2-5 days", region: "US" },
    { id: "ups", name: "UPS", fee: "FREE", time: "1-5 days", region: "US" },
    { id: "fedex", name: "FedEx", fee: "FREE", time: "1-5 days", region: "US" },
    { id: "dhl", name: "DHL Express", fee: "$0.05", time: "2-6 days", region: "Global" },
    
    // UK/EU Carriers
    { id: "evri", name: "Evri (UK)", fee: "FREE", time: "2-4 days", region: "UK" },
    { id: "inpost", name: "InPost (EU)", fee: "FREE", time: "2-5 days", region: "EU" },
    { id: "dpd", name: "DPD (EU)", fee: "FREE", time: "1-3 days", region: "EU" },
    { id: "royalmail", name: "Royal Mail (UK)", fee: "FREE", time: "1-4 days", region: "UK" },
    { id: "parcelforce", name: "Parcelforce (UK)", fee: "FREE", time: "1-3 days", region: "UK" },
    { id: "hermes", name: "Hermes (EU)", fee: "FREE", time: "3-5 days", region: "EU" },
    
    // Asia Pacific
    { id: "auspost", name: "Australia Post", fee: "FREE", time: "2-6 days", region: "AU" },
    { id: "sfexpress", name: "SF Express", fee: "$0.05", time: "3-7 days", region: "Asia" },
    { id: "japanpost", name: "Japan Post", fee: "FREE", time: "5-10 days", region: "JP" },
    { id: "aramex", name: "Aramex (Middle East)", fee: "$0.05", time: "3-7 days", region: "ME" },
    
    // Other
    { id: "canadapost", name: "Canada Post", fee: "FREE", time: "2-6 days", region: "CA" },
  ];
  
  const isCustom = !carriers.some(c => c.id === value) && value !== "";
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
        {carriers.map((carrier) => (
          <button
            key={carrier.id}
            type="button"
            onClick={() => onChange(carrier.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              value === carrier.id
                ? "border-primary bg-primary/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white text-sm">{carrier.name}</span>
              <span className={`text-xs ${carrier.fee === "FREE" ? "text-emerald-400" : "text-amber-400"}`}>
                {carrier.fee}
              </span>
            </div>
            <span className="text-xs text-zinc-500">{carrier.time}</span>
          </button>
        ))}
      </div>
      
      {allowCustom && (
        <div className="border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => onChange("custom")}
            className={`w-full p-3 rounded-lg border text-left transition-all mb-2 ${
              isCustom || value === "custom"
                ? "border-primary bg-primary/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">Custom Carrier</span>
              <span className="text-xs text-zinc-400">Other</span>
            </div>
          </button>
          
          {(isCustom || value === "custom") && onCustomCarrierChange && (
            <input
              type="text"
              value={customCarrier || ""}
              onChange={(e) => onCustomCarrierChange(e.target.value)}
              placeholder="Enter carrier name (e.g. Local Courier)"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
            />
          )}
        </div>
      )}
    </div>
  );
}

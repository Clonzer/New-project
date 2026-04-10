import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Download, Printer as PrinterIcon, Package, MapPin, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShippingLabelModalProps {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    customer: {
      name: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    items: Array<{ name: string; quantity: number }>;
    total: number;
  };
}

export function ShippingLabelModal({ open, onClose, order }: ShippingLabelModalProps) {
  const [carrier, setCarrier] = useState("usps");
  const [weight, setWeight] = useState("0.5");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLabel = async () => {
    setIsGenerating(true);
    // Simulate label generation
    setTimeout(() => {
      setTrackingNumber(`${carrier.toUpperCase()}-${Date.now()}`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleDownloadLabel = () => {
    // In production, this would fetch a PDF from the backend
    const labelContent = `
SHIPPING LABEL
=============
Order: ${order.orderNumber}
Tracking: ${trackingNumber}

TO:
${order.customer.name}
${order.customer.address}
${order.customer.city}, ${order.customer.postalCode}
${order.customer.country}

ITEM(S):
${order.items.map(item => `- ${item.name} (Qty: ${item.quantity})`).join("\n")}

Weight: ${weight} lbs
Carrier: ${carrier.toUpperCase()}
Generated: ${new Date().toLocaleString()}
    `;
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(labelContent));
    element.setAttribute("download", `label-${order.orderNumber}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Generate Shipping Label
          </DialogTitle>
          <p className="text-zinc-500 text-sm font-normal pt-1">Order {order.orderNumber}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipient Info */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ship to Address
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">{order.customer.name}</p>
              <p className="text-zinc-400">{order.customer.address}</p>
              <p className="text-zinc-400">{order.customer.city}, {order.customer.postalCode}</p>
              <p className="text-zinc-400">{order.customer.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items in this shipment
            </h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                  <span className="text-zinc-300">{item.name}</span>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-400">
                    Qty: {item.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                <Scale className="w-3 h-3 inline mr-1" />
                Weight (lbs)
              </label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
                Carrier
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="usps">USPS</option>
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
                <option value="dhl">DHL</option>
              </select>
            </div>
          </div>

          {/* Tracking Info */}
          {trackingNumber && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="text-xs uppercase tracking-widest text-emerald-300 mb-2">Tracking Number</p>
              <p className="text-lg font-mono font-bold text-white mb-3">{trackingNumber}</p>
              <p className="text-xs text-emerald-200">Label generated successfully. Ready to download and print.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!trackingNumber ? (
              <NeonButton
                glowColor="primary"
                onClick={handleGenerateLabel}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? "Generating..." : "Generate Label"}
              </NeonButton>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDownloadLabel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-medium transition-all"
                >
                  <PrinterIcon className="w-4 h-4" />
                  Print Label
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

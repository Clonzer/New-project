import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/lib/payments-api";
import { getApiErrorMessageWithSupport } from "@/lib/api-error";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { canSellerShipToCountry, getShippingEstimate } from "@/lib/shipping-profile";
import { useGetListing, useGetUser, getGetListingQueryKey, getGetUserQueryKey } from "@/lib/workspace-api-mock";
import { 
  Box, 
  ShieldCheck, 
  Palette, 
  Ruler, 
  Layers, 
  Package, 
  Truck,
  Check,
  ChevronRight 
} from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  type: "color" | "size" | "material" | "quantity" | "custom";
  values: OptionValue[];
  required: boolean;
}

interface OptionValue {
  id: string;
  label: string;
  priceModifier?: number;
  image?: string;
}

export default function ProductOrder() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const listingId = searchParams.get("listingId");
  const sellerId = searchParams.get("sellerId");

  const { user } = useAuth();
  const { formatPrice, countryCode } = useLocalePreferences();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listing } = useGetListing(parseInt(listingId || "0", 10), {
    query: { enabled: !!listingId, queryKey: getGetListingQueryKey(parseInt(listingId || "0", 10)) },
  });
  const { data: seller } = useGetUser(parseInt(sellerId || listing?.sellerId?.toString() || "0", 10), {
    query: {
      enabled: !!sellerId || !!listing,
      queryKey: getGetUserQueryKey(parseInt(sellerId || listing?.sellerId?.toString() || "0", 10)),
    },
  });

  // Mock product options - in production, these would come from the listing
  const productOptions: ProductOption[] = [
    {
      id: "color",
      name: "Color",
      type: "color",
      required: true,
      values: [
        { id: "white", label: "White", priceModifier: 0 },
        { id: "black", label: "Black", priceModifier: 0 },
        { id: "red", label: "Red", priceModifier: 2 },
        { id: "blue", label: "Blue", priceModifier: 2 },
        { id: "green", label: "Green", priceModifier: 2 },
        { id: "yellow", label: "Yellow", priceModifier: 2 },
        { id: "purple", label: "Purple", priceModifier: 3 },
        { id: "orange", label: "Orange", priceModifier: 3 },
      ]
    },
    {
      id: "size",
      name: "Size",
      type: "size",
      required: true,
      values: [
        { id: "small", label: "Small (50mm)", priceModifier: -5 },
        { id: "medium", label: "Medium (100mm)", priceModifier: 0 },
        { id: "large", label: "Large (150mm)", priceModifier: 10 },
        { id: "xlarge", label: "X-Large (200mm)", priceModifier: 20 },
      ]
    },
    {
      id: "material",
      name: "Material",
      type: "material",
      required: true,
      values: [
        { id: "pla", label: "PLA (Standard)", priceModifier: 0 },
        { id: "petg", label: "PETG (Durable)", priceModifier: 5 },
        { id: "abs", label: "ABS (Strong)", priceModifier: 8 },
        { id: "tpu", label: "TPU (Flexible)", priceModifier: 12 },
        { id: "carbon", label: "Carbon Fiber Composite", priceModifier: 25 },
      ]
    },
    {
      id: "layer_height",
      name: "Layer Height",
      type: "custom",
      required: false,
      values: [
        { id: "standard", label: "Standard (0.2mm)", priceModifier: 0 },
        { id: "fine", label: "Fine (0.12mm)", priceModifier: 5 },
        { id: "ultra", label: "Ultra (0.08mm)", priceModifier: 10 },
      ]
    }
  ];

  // Calculate price based on selected options
  const calculatePrice = () => {
    let basePrice = listing?.basePrice || 50;
    let modifier = 0;

    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = productOptions.find(o => o.id === optionId);
      const value = option?.values.find(v => v.id === valueId);
      if (value?.priceModifier) {
        modifier += value.priceModifier;
      }
    });

    return (basePrice + modifier) * quantity;
  };

  const subtotal = calculatePrice();
  const shippingEstimate = seller
    ? getShippingEstimate(seller, countryCode, subtotal, listing?.shippingCost)
    : { zone: "default", cost: 0 };
  const lineShipping = listing?.shippingCost && listing.shippingCost > 0
    ? listing.shippingCost * quantity
    : shippingEstimate.cost;
  const platformFee = subtotal * 0.1;
  const total = subtotal + platformFee + lineShipping;

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionId]: valueId }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue to payment.",
        variant: "destructive",
      });
      return;
    }
    if (!seller) {
      toast({ title: "Seller unavailable", description: "This seller could not be loaded.", variant: "destructive" });
      return;
    }
    if (!canSellerShipToCountry(seller, countryCode)) {
      toast({
        title: "Seller does not ship to your region",
        description: "Update your country in settings or choose a seller that ships to your location.",
        variant: "destructive",
      });
      return;
    }

    // Check required options
    const requiredOptions = productOptions.filter(o => o.required);
    const missingOptions = requiredOptions.filter(o => !selectedOptions[o.id]);
    if (missingOptions.length > 0) {
      toast({
        title: "Please select all required options",
        description: `Missing: ${missingOptions.map(o => o.name).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress.trim()) {
      toast({
        title: "Shipping address required",
        description: "Please provide your shipping address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const session = await createCheckoutSession({
        shippingAddress,
        successPath: "/dashboard?checkout=success",
        cancelPath: `/product-order?listingId=${listingId}&checkout=cancelled`,
        items: [
          {
            listingId: listing!.id,
            quantity,
            notes: notes || null,
            options: selectedOptions,
          },
        ],
      });
      window.location.href = session.url;
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: getApiErrorMessageWithSupport(error, "processing your order"),
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      toast({
        title: "Checkout cancelled",
        description: "Your order details are still here if you want to try again.",
      });
      params.delete("checkout");
      const query = params.toString();
      setLocation(query ? `/product-order?${query}` : `/product-order?listingId=${listingId}`, { replace: true });
    }
  }, [setLocation, toast, listingId]);

  if (!listingId) {
    return <div className="text-white p-12 text-center">Invalid order request.</div>;
  }

  const getOptionIcon = (type: ProductOption["type"]) => {
    switch (type) {
      case "color": return Palette;
      case "size": return Ruler;
      case "material": return Layers;
      default: return Box;
    }
  };

  const getColorForValue = (valueId: string) => {
    const colors: Record<string, string> = {
      white: "#ffffff",
      black: "#000000",
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#22c55e",
      yellow: "#eab308",
      purple: "#a855f7",
      orange: "#f97316",
    };
    return colors[valueId] || "#6b7280";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Configure Your Order</h1>
            <p className="text-zinc-400 mt-2">Select your preferred options and proceed to checkout.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Product Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Preview */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10">
                <div className="flex gap-6">
                  {listing?.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-48 h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center">
                      <Package className="w-16 h-16 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-white mb-2">{listing?.title}</h2>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{listing?.description}</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-zinc-400">Secure checkout powered by Stripe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Options */}
              <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Select Options</h3>
                
                {productOptions.map((option) => {
                  const Icon = getOptionIcon(option.type);
                  const selectedValue = selectedOptions[option.id];
                  
                  return (
                    <div key={option.id} className="mb-8 last:mb-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h4 className="text-white font-medium">
                          {option.name}
                          {option.required && <span className="text-red-400 ml-1">*</span>}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {option.values.map((value) => {
                          const isSelected = selectedValue === value.id;
                          const isColorOption = option.type === "color";
                          
                          return (
                            <button
                              key={value.id}
                              type="button"
                              onClick={() => handleOptionSelect(option.id, value.id)}
                              className={`
                                relative p-4 rounded-xl border-2 transition-all
                                ${isSelected 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                                }
                              `}
                            >
                              {isColorOption && (
                                <div 
                                  className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-white/20"
                                  style={{ backgroundColor: getColorForValue(value.id) }}
                                />
                              )}
                              <div className="text-center">
                                <p className="text-sm text-white font-medium">{value.label}</p>
                                {value.priceModifier !== undefined && value.priceModifier !== 0 && (
                                  <p className={`text-xs ${value.priceModifier > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {value.priceModifier > 0 ? '+' : ''}{formatPrice(value.priceModifier)}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <Check className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Quantity */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-primary" />
                    <h4 className="text-white font-medium">Quantity</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="border-white/10 text-white hover:bg-white/5"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      className="w-24 text-center bg-black/20 border-white/10 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setQuantity(Math.min(100, quantity + 1))}
                      className="border-white/10 text-white hover:bg-white/5"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Box className="w-5 h-5 text-primary" />
                    <h4 className="text-white font-medium">Additional Notes (Optional)</h4>
                  </div>
                  <Textarea
                    placeholder="Any special requests or instructions for the seller..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] bg-black/20 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Platform Fee (10%)</span>
                      <span className="text-white">{formatPrice(platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Shipping</span>
                      <span className="text-white">{formatPrice(lineShipping)}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-primary" />
                      <h4 className="text-white font-medium">Shipping Address</h4>
                    </div>
                    <Textarea
                      placeholder="Enter your shipping address..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="min-h-[80px] bg-black/20 border-white/10 text-white"
                    />
                  </div>

                  <NeonButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full"
                    glowColor="primary"
                  >
                    {isSubmitting ? "Processing..." : "Proceed to Checkout"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </NeonButton>

                  <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Your payment is secure and encrypted</span>
                  </div>
                </div>

                {/* Seller Info */}
                {seller && (
                  <div className="glass-panel p-6 rounded-[2rem] border border-white/10">
                    <h4 className="text-white font-medium mb-4">Sold by</h4>
                    <div className="flex items-center gap-3">
                      {seller.avatarUrl ? (
                        <img
                          src={seller.avatarUrl}
                          alt={seller.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {seller.displayName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{seller.displayName}</p>
                        {seller.rating && (
                          <div className="flex items-center gap-1 text-sm text-zinc-400">
                            <span>★ {seller.rating.toFixed(1)}</span>
                            <span>({seller.reviewCount || 0} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

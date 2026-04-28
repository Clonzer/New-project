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
  ShieldCheck, 
  Package, 
  Truck,
  ChevronRight,
  CreditCard
} from "lucide-react";

export default function ProductOrder() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const listingId = searchParams.get("listingId");
  const sellerId = searchParams.get("sellerId");

  const { user } = useAuth();
  const { formatPrice, countryCode } = useLocalePreferences();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
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

  // Calculate price
  const basePrice = listing?.basePrice || 0;
  const subtotal = basePrice * quantity;
  const shippingEstimate = seller
    ? getShippingEstimate(seller, countryCode, subtotal, listing?.shippingCost)
    : { zone: "default", cost: 0 };
  const lineShipping = listing?.shippingCost && listing.shippingCost > 0
    ? listing.shippingCost * quantity
    : shippingEstimate.cost;
  const platformFee = subtotal * 0.1;
  const total = subtotal + platformFee + lineShipping;

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white flex items-center justify-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              Payment
            </h1>
            <p className="text-zinc-400 mt-2">Complete your purchase securely with Stripe.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Info */}
            <div className="space-y-6">
              {/* Product Preview */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex gap-4">
                  {listing?.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center">
                      <Package className="w-12 h-12 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold text-white mb-1">{listing?.title}</h2>
                    <p className="text-zinc-400 text-sm mb-2 line-clamp-2">{listing?.description}</p>
                    <p className="text-primary font-bold">{formatPrice(listing?.basePrice || 0)} each</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
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
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Notes for Seller (Optional)</h3>
                <Textarea
                  placeholder="Any special delivery instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] bg-black/20 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div>
              <div className="sticky top-24 space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
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
                      placeholder="Enter your complete shipping address..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="min-h-[100px] bg-black/20 border-white/10 text-white"
                    />
                  </div>

                  <NeonButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full"
                    glowColor="primary"
                  >
                    {isSubmitting ? "Processing..." : "Pay Now"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </NeonButton>

                  <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                </div>

                {/* Seller Info */}
                {seller && (
                  <div className="glass-panel p-6 rounded-2xl border border-white/10">
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

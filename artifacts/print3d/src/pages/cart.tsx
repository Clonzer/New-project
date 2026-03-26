import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useListListings } from "@workspace/api-client-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  clearCart,
  readCart,
  removeFromCart,
  setLineQuantity,
  type CartLine,
  writeCart,
} from "@/lib/cart-storage";
import { createCheckoutSession } from "@/lib/payments-api";
import { Box, ShoppingBag, Trash2 } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [lines, setLines] = useState<CartLine[]>(() => readCart());
  const [shippingAddress, setShippingAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setLines(readCart());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "cancelled") {
      toast({
        title: "Checkout cancelled",
        description: "Your cart is still available. Update anything you need and try again.",
      });
      params.delete("checkout");
      const next = params.toString();
      setLocation(next ? `/cart?${next}` : "/cart", { replace: true });
    }
  }, [location, setLocation, toast]);

  const syncLines = (next: CartLine[]) => {
    setLines(next);
    writeCart(next);
  };

  const { data: listingsData } = useListListings({ limit: 200 });

  const rows = useMemo(() => {
    if (!listingsData?.listings) return [];
    return lines
      .map((line) => {
        const listing = listingsData.listings.find((candidate) => candidate.id === line.listingId);
        return listing ? { line, listing } : null;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [lines, listingsData]);

  const missingIds = useMemo(() => {
    if (!listingsData?.listings) return [];
    const ids = new Set(listingsData.listings.map((listing) => listing.id));
    return lines.filter((line) => !ids.has(line.listingId)).map((line) => line.listingId);
  }, [lines, listingsData]);

  const subtotal = rows.reduce((sum, { line, listing }) => sum + listing.basePrice * line.quantity, 0);
  const shippingTotal = rows.reduce(
    (sum, { line, listing }) => sum + (listing.shippingCost ?? 0) * line.quantity,
    0,
  );
  const platformFee = subtotal * 0.1;
  const grandTotal = subtotal + shippingTotal + platformFee;

  const checkout = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Log in before starting payment.",
        variant: "destructive",
      });
      return;
    }
    if (!rows.length) return;
    if (shippingAddress.trim().length < 10) {
      toast({
        title: "Shipping address required",
        description: "Enter the full delivery address before checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      const session = await createCheckoutSession({
        shippingAddress,
        successPath: "/dashboard?checkout=success",
        cancelPath: "/cart?checkout=cancelled",
        items: rows.map(({ line, listing }) => ({
          listingId: listing.id,
          quantity: line.quantity,
        })),
      });
      window.location.href = session.url;
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Your Cart</h1>
          <p className="text-zinc-400 mb-10">Review catalog items and pay securely with Stripe checkout.</p>

          {!lines.length ? (
            <div className="glass-panel rounded-3xl border border-white/10 p-16 text-center">
              <ShoppingBag className="w-14 h-14 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 mb-6">Your cart is empty.</p>
              <Link href="/listings">
                <NeonButton glowColor="primary">Browse catalog</NeonButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {missingIds.length > 0 && (
                  <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-200">
                    Some listings are no longer available (IDs: {missingIds.join(", ")}). Remove them before checkout.
                  </div>
                )}
                {rows.map(({ line, listing }) => (
                  <div
                    key={listing.id}
                    className="glass-panel rounded-2xl border border-white/10 p-4 flex gap-4"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/40 shrink-0">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-white truncate">{listing.title}</p>
                      <p className="text-xs text-zinc-500 mb-2">by {listing.sellerName}</p>
                      <p className="text-sm text-zinc-400">
                        ${listing.basePrice.toFixed(2)} each - shipping ${(listing.shippingCost ?? 0).toFixed(2)} / unit
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-zinc-500">Qty</span>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          className="w-20 h-9 bg-black/30 border-white/10 text-white"
                          value={line.quantity}
                          onChange={(event) => {
                            const quantity = parseInt(event.target.value, 10);
                            if (!Number.isFinite(quantity)) return;
                            setLineQuantity(listing.id, quantity);
                            syncLines(readCart());
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => {
                            removeFromCart(listing.id);
                            syncLines(readCart());
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-panel rounded-3xl border border-white/10 p-6 h-fit sticky top-24">
                <h2 className="font-display font-bold text-lg text-white mb-4">Summary</h2>
                <div className="space-y-2 text-sm text-zinc-300 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shippingTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (10%)</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10 mb-6">
                  <span>Total</span>
                  <span className="text-primary">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-zinc-400 mb-2">Shipping address</label>
                  <Textarea
                    rows={4}
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="Full name, street, city, postcode, country"
                    className="bg-black/30 border-white/10 text-white resize-none"
                  />
                </div>
                <NeonButton
                  glowColor="primary"
                  className="w-full rounded-xl py-3"
                  disabled={!rows.length || isCheckingOut}
                  onClick={() => void checkout()}
                >
                  {isCheckingOut ? "Redirecting to payment..." : "Checkout"}
                </NeonButton>
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-zinc-500 hover:text-white"
                  onClick={() => {
                    clearCart();
                    syncLines([]);
                  }}
                >
                  Clear cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

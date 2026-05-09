import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useListListings } from "@/lib/workspace-api-mock";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, getApiErrorMessageWithSupport } from "@/lib/api-error";
import {
  clearCart,
  readCart,
  removeFromCart,
  setLineQuantity,
  type CartLine,
  writeCart,
  CART_CHANGE_EVENT,
} from "@/lib/cart-storage";
import { createCheckoutSession } from "@/lib/payments-api";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { Box, ShoppingBag, Trash2, ArrowRight, Package, CreditCard, Truck, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { user } = useAuth();
  const { formatPrice } = useLocalePreferences();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [lines, setLines] = useState<CartLine[]>(() => readCart());
  const [shippingAddress, setShippingAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Sync cart when items are added from other pages
  useEffect(() => {
    const syncCart = () => setLines(readCart());
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_CHANGE_EVENT, syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_CHANGE_EVENT, syncCart);
    };
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
        description: getApiErrorMessageWithSupport(error, "processing your order"),
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Your Cart</h1>
            <p className="text-zinc-400 text-lg">Review items and checkout securely</p>
          </motion.div>

          {!lines.length ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800 p-16 text-center">
                <CardContent className="pt-0">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
                  <p className="text-zinc-500 mb-8">Start browsing our catalog to find amazing 3D models</p>
                  <Link href="/listings">
                    <Button size="lg" className="rounded-xl group bg-orange-600 hover:bg-orange-700">
                      Browse catalog
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              <div className="lg:col-span-2 space-y-4">
                {missingIds.length > 0 && (
                  <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-200">
                    Some listings are no longer available (IDs: {missingIds.join(", ")}). Remove them before checkout.
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                {rows.map(({ line, listing }, index) => (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 p-4 transition-all">
                      <CardContent className="pt-0">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-800 shrink-0 mx-auto sm:mx-0">
                            {listing.imageUrl ? (
                              <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Box className="w-8 h-8 text-zinc-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0 text-center sm:text-left">
                            <p className="font-semibold text-white truncate">{listing.title}</p>
                            <p className="text-xs text-zinc-500 mb-2">by {listing.sellerName}</p>
                            <p className="text-sm text-zinc-400 mb-3">
                              {formatPrice(listing.basePrice)} each - shipping {formatPrice(listing.shippingCost ?? 0)} / unit
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500">Qty</span>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  className="w-16 h-8 bg-zinc-800 border-zinc-700 text-white text-center"
                                  value={line.quantity}
                                  onChange={(event) => {
                                    const quantity = parseInt(event.target.value, 10);
                                    if (!Number.isFinite(quantity)) return;
                                    setLineQuantity(listing.id, quantity);
                                    syncLines(readCart());
                                  }}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => {
                                  removeFromCart(listing.id);
                                  syncLines(readCart());
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="h-fit sticky top-24"
              >
                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm text-zinc-300 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatPrice(shippingTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform fee (10%)</span>
                        <span>{formatPrice(platformFee)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-zinc-700 mb-6">
                      <span>Total</span>
                      <span className="text-orange-400">{formatPrice(grandTotal)}</span>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping address
                      </label>
                      <Textarea
                        rows={4}
                        value={shippingAddress}
                        onChange={(event) => setShippingAddress(event.target.value)}
                        placeholder="Full name, street, city, postcode, country"
                        className="resize-none bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <Button
                      size="lg"
                      className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                      disabled={!rows.length || isCheckingOut}
                      onClick={() => void checkout()}
                    >
                      {isCheckingOut ? (
                        <>
                          <span className="animate-pulse">Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Checkout
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 text-zinc-500 hover:text-red-400"
                      onClick={() => {
                        clearCart();
                        syncLines([]);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

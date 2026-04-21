import { useEffect, useRef, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetListing, useGetUser, getGetListingQueryKey, getGetUserQueryKey } from "@/lib/workspace-api-mock";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/lib/payments-api";
import { getApiErrorMessage, getApiErrorMessageWithSupport } from "@/lib/api-error";
import { useLocalePreferences } from "@/lib/locale-preferences";
import { canSellerShipToCountry, getShippingEstimate } from "@/lib/shipping-profile";
import { Box, ShieldCheck, Upload } from "lucide-react";

const orderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  notes: z.string().optional(),
  material: z.string().min(1, "Material preference required"),
  color: z.string().min(1, "Color preference required"),
  quantity: z.coerce.number().min(1).max(100),
  shippingAddress: z.string().min(10, "Please provide a complete shipping address"),
  proposedUnitPrice: z.coerce.number().min(0).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrderFlow() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const listingId = searchParams.get("listingId");
  const sellerId = searchParams.get("sellerId");

  const { user } = useAuth();
  const { formatPrice, countryCode, fxSource, fxUpdatedAt } = useLocalePreferences();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
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

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: listing?.title || "",
      quantity: 1,
      material: listing?.material || "",
      color: listing?.color || "",
      notes: "",
      shippingAddress: "",
      proposedUnitPrice: 50,
    },
  });

  useEffect(() => {
    if (!listing) return;
    form.reset({
      title: listing.title,
      quantity: 1,
      material: listing.material || "",
      color: listing.color || "",
      notes: "",
      shippingAddress: "",
      proposedUnitPrice: listing.basePrice,
    });
  }, [form, listing]);

  const isCatalogOrder = Boolean(listingId && listing);
  const unitPrice = isCatalogOrder ? listing?.basePrice ?? 0 : Math.max(0, form.watch("proposedUnitPrice") ?? 0);
  const quantity = form.watch("quantity") || 1;
  const subtotal = unitPrice * quantity;
  const shippingEstimate = seller
    ? getShippingEstimate(seller, countryCode, subtotal, isCatalogOrder ? listing?.shippingCost ?? 0 : undefined)
    : { zone: "default", cost: 0 };
  const lineShipping = isCatalogOrder
    ? listing?.shippingCost && listing.shippingCost > 0
      ? listing.shippingCost * quantity
      : shippingEstimate.cost
    : shippingEstimate.cost;
  const platformFee = subtotal * 0.1;
  const total = subtotal + platformFee + lineShipping;

  const onSubmit = async (data: OrderFormValues) => {
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

    if (!isCatalogOrder) {
      const proposedPrice = data.proposedUnitPrice ?? 0;
      if (proposedPrice < 1) {
        toast({
          title: "Invalid price",
          description: "Enter an offered base price of at least $1.",
          variant: "destructive",
        });
        return;
      }
      if (!fileDataUrl) {
        toast({
          title: "File required",
          description: "Upload project files for custom work before checkout.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (!isCatalogOrder) {
        // Custom order: create a request instead of direct checkout
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          (globalThis as any).VITE_SUPABASE_URL || 'https://hegixxfxymvwlcenuewx.supabase.co',
          (globalThis as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4eGZ4eW12d2xjZW51ZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjM2NzQsImV4cCI6MjA5MTQzOTY3NH0.dsnhzsHb9H9WyL20rnKNA6inp6NE8WNE--Q2-JejKMs'
        );

        const { error: insertError } = await supabase
          .from('custom_order_requests')
          .insert({
            buyer_id: user.id,
            seller_id: seller.id,
            title: data.title,
            notes: data.notes || null,
            material: data.material,
            color: data.color,
            quantity: data.quantity,
            file_url: fileDataUrl,
            shipping_address: data.shippingAddress,
            proposed_price: data.proposedUnitPrice ?? unitPrice,
            status: 'pending',
          });

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Request submitted",
          description: "Your custom order request has been sent to the seller. They will review it and provide a quote.",
        });
        setLocation('/dashboard?custom_order=submitted');
      } else {
        // Catalog order: proceed to checkout as before
        const session = await createCheckoutSession({
          shippingAddress: data.shippingAddress,
          successPath: "/dashboard?checkout=success",
          cancelPath: "/order/new?checkout=cancelled",
          items: [
            {
              listingId: listing!.id,
              quantity: data.quantity,
              notes: data.notes || null,
            },
          ],
        });
        window.location.href = session.url;
      }
    } catch (error) {
      toast({
        title: isCatalogOrder ? "Checkout failed" : "Request failed",
        description: getApiErrorMessageWithSupport(error, isCatalogOrder ? "processing your order" : "submitting your request"),
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
      setLocation(query ? `/order/new?${query}` : "/order/new", { replace: true });
    }
  }, [setLocation, toast]);

  if (!listingId && !sellerId) {
    return <div className="text-white p-12 text-center">Invalid order request.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Secure Checkout</h1>
            <p className="text-zinc-400 mt-2">Configure your order, then finish payment in Stripe checkout.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {!listingId && (
                      <div className="p-6 border border-dashed border-primary/40 rounded-xl bg-primary/5 text-center mb-8">
                        <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="text-white font-medium mb-1">Upload project files</h3>
                        <p className="text-sm text-zinc-400 mb-4">STL, OBJ, STEP, 3MF, PDF, and more up to 50MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".stl,.obj,.step,.stp,.3mf,.pdf"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            setUploadedFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFileDataUrl(typeof reader.result === "string" ? reader.result : null);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-primary/50 text-primary hover:bg-primary/20"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Select File
                        </Button>
                        {uploadedFileName && (
                          <p className="text-xs text-emerald-400 mt-3">{uploadedFileName} attached</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-zinc-300">Project Title</FormLabel>
                            <FormControl>
                              <Input className="bg-black/20 border-white/10 text-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!isCatalogOrder && (
                        <FormField
                          control={form.control}
                          name="proposedUnitPrice"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-zinc-300">Your offered base price ($ / unit)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={1}
                                  className="bg-black/20 border-white/10 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="material"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Material Preference</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. PLA, steel, oak, powder coat"
                                className="bg-black/20 border-white/10 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Color</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Matte Black, Transparent"
                                className="bg-black/20 border-white/10 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" className="bg-black/20 border-white/10 text-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea rows={3} className="bg-black/20 border-white/10 text-white resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Infill density, tolerances, orientation requirements..."
                              rows={4}
                              className="bg-black/20 border-white/10 text-white resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 flex justify-end">
                      <NeonButton
                        type="submit"
                        glowColor="primary"
                        className="w-full md:w-auto px-10 py-6 text-lg rounded-xl"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Redirecting..." : "Continue to payment"}
                      </NeonButton>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 sticky top-24">
                <h3 className="font-display font-bold text-xl text-white mb-6">Order Summary</h3>

                {listing && (
                  <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/50 shrink-0">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="w-8 h-8 m-4 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white line-clamp-2">{listing.title}</p>
                      <p className="text-xs text-zinc-400 mt-1">by {seller?.displayName}</p>
                    </div>
                  </div>
                )}

                {!listing && seller && (
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-sm text-zinc-400">Custom job for</p>
                    <p className="font-medium text-white">{seller.shopName || seller.displayName}</p>
                  </div>
                )}

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-zinc-300">
                    <span>Subtotal (x{quantity})</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Platform Fee (10%)</span>
                    <span>{formatPrice(platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Shipping</span>
                    <span>{formatPrice(lineShipping)}</span>
                  </div>
                  {seller ? (
                    <div className="flex justify-between text-zinc-500">
                      <span>Shipping zone</span>
                      <span className="capitalize">{shippingEstimate.zone.replace("_", " ")}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/10 mb-6">
                  <span className="font-medium text-white">Total</span>
                  <span className="text-2xl font-display font-bold text-primary text-glow-primary">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <p>Payment is captured in Stripe and the order is created only after checkout completes.</p>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  Prices convert using {fxSource === "live" ? "live" : "fallback"} FX data{fxUpdatedAt && fxUpdatedAt !== "static" ? ` updated ${fxUpdatedAt}` : ""}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

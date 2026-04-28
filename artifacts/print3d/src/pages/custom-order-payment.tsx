import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/lib/payments-api";
import { getApiErrorMessageWithSupport } from "@/lib/api-error";
import { DollarSign, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const supabaseUrl = (globalThis as any).VITE_SUPABASE_URL || 'https://hegixxfxymvwlcenuewx.supabase.co';
const supabaseAnonKey = (globalThis as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4eGZ4eW12d2xjZW51ZXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjM2NzQsImV4cCI6MjA5MTQzOTY3NH0.dsnhzsHb9H9WyL20rnKNA6inp6NE8WNE--Q2-JejKMs';

export default function CustomOrderPayment() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const requestId = searchParams.get("requestId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!requestId || !user) return;

    fetchRequest();
  }, [requestId, user]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('custom_order_requests')
        .select('*')
        .eq('id', requestId)
        .eq('buyer_id', user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Request not found",
          description: "This custom order request could not be found or you don't have access to it.",
          variant: "destructive",
        });
        setLocation('/dashboard');
        return;
      }

      if (data.status !== 'quoted') {
        toast({
          title: "Invalid request status",
          description: "This request is not ready for payment.",
          variant: "destructive",
        });
        setLocation('/dashboard');
        return;
      }

      setRequest(data);
    } catch (err) {
      console.error('Error fetching request:', err);
      toast({
        title: "Failed to load request",
        description: "Could not load the custom order request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!request) return;

    try {
      setIsSubmitting(true);

      // Update request status to accepted
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error: updateError } = await supabase
        .from('custom_order_requests')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Create checkout session
      const session = await createCheckoutSession({
        shippingAddress: request.shipping_address,
        successPath: "/dashboard?custom_order=paid",
        cancelPath: `/custom-order-payment?requestId=${request.id}&cancelled=true`,
        items: [
          {
            sellerId: request.seller_id,
            title: request.title,
            fileUrl: request.file_url,
            notes: request.notes || null,
            material: request.material,
            color: request.color,
            quantity: request.quantity,
            unitPrice: request.quoted_price,
          },
        ],
      });

      window.location.href = session.url;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment failed",
        description: getApiErrorMessageWithSupport(error, "processing your payment"),
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!request) return;

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from('custom_order_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Quote rejected",
        description: "You have rejected the quote. The request has been cancelled.",
      });
      setLocation('/dashboard');
    } catch (err) {
      console.error('Error rejecting quote:', err);
      toast({
        title: "Failed to reject quote",
        description: "Could not reject the quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white">Request not found</div>
        </main>
      </div>
    );
  }

  const subtotal = request.quoted_price * request.quantity;
  const platformFee = subtotal * 0.1;
  const total = subtotal + platformFee;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Pay for Custom Order</h1>
            <p className="text-zinc-400 mt-2">Review the seller's quote and complete payment for your custom order.</p>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8">
            <div className="space-y-6">
              {/* Request Details */}
              <div className="p-6 bg-white/5 rounded-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">Order Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Title</span>
                    <span className="text-white">{request.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Quantity</span>
                    <span className="text-white">{request.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Material</span>
                    <span className="text-white">{request.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Color</span>
                    <span className="text-white">{request.color}</span>
                  </div>
                  {request.notes && (
                    <div>
                      <span className="text-zinc-400 block mb-1">Notes</span>
                      <p className="text-white">{request.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Details */}
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Seller's Quote</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Quoted price per unit</span>
                    <span className="text-emerald-300 font-semibold">${request.quoted_price.toFixed(2)}</span>
                  </div>
                  {request.quote_message && (
                    <div>
                      <span className="text-zinc-400 block mb-1">Seller's message</span>
                      <p className="text-white">{request.quote_message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-6 bg-white/5 rounded-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">Price Breakdown</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Subtotal ({request.quantity} × ${request.quoted_price.toFixed(2)})</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Platform fee (10%)</span>
                    <span className="text-white">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleRejectQuote}
                  className="flex-1 rounded-xl glass-panel text-white border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                >
                  Reject Quote
                </Button>
                <NeonButton
                  glowColor="primary"
                  onClick={handleAcceptQuote}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl"
                >
                  {isSubmitting ? "Processing..." : "Accept & Pay"}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

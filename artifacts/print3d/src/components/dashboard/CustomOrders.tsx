import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeonButton } from "@/components/ui/neon-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, DollarSign, FileText, MessageSquare, CheckCircle2, XCircle, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";

export default function CustomOrders({ user }: { user: any }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('custom_order_requests')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setError('Custom orders table not found. Please run the database migration.');
        } else {
          setError('Failed to load custom order requests. Please try again.');
        }
        setRequests([]);
        return;
      }

      setRequests(data || []);
    } catch (err) {
      console.error('Error in fetchRequests:', err);
      setError('Failed to load custom order requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = async () => {
    if (!selectedRequest || !quotedPrice) {
      toast({
        title: "Price required",
        description: "Please enter a quoted price.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('custom_order_requests')
        .update({
          quoted_price: parseFloat(quotedPrice),
          quote_message: quoteMessage || null,
          status: 'quoted',
          quoted_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Create notification for buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.buyer_id,
          type: 'custom_order_quote',
          title: 'You received a quote for your custom order',
          body: `A seller has quoted $${parseFloat(quotedPrice).toFixed(2)} for your custom order "${selectedRequest.title}". Click to view and pay.`,
          url: `/custom-order-payment?requestId=${selectedRequest.id}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });

      toast({
        title: "Quote submitted",
        description: "Your quote has been sent to the buyer.",
      });
      setSelectedRequest(null);
      setQuotedPrice("");
      setQuoteMessage("");
      fetchRequests();
    } catch (err) {
      console.error('Error submitting quote:', err);
      toast({
        title: "Failed to submit quote",
        description: "Could not submit your quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('custom_order_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request rejected",
        description: "The custom order request has been rejected.",
      });
      fetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast({
        title: "Failed to reject request",
        description: "Could not reject the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuote = async () => {
    if (!selectedRequest || !quotedPrice) {
      toast({
        title: "Price required",
        description: "Please enter a quoted price.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('custom_order_requests')
        .update({
          quoted_price: parseFloat(quotedPrice),
          quote_message: quoteMessage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Quote updated",
        description: "Your quote has been updated successfully.",
      });
      setSelectedRequest(null);
      setQuotedPrice("");
      setQuoteMessage("");
      setIsEditing(false);
      fetchRequests();
    } catch (err) {
      console.error('Error updating quote:', err);
      toast({
        title: "Failed to update quote",
        description: "Could not update your quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawQuote = async (requestId: string) => {
    if (!confirm("Are you sure you want to withdraw your quote? The buyer will no longer see it.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_order_requests')
        .update({
          status: 'pending',
          quoted_price: null,
          quote_message: null,
          quoted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Quote withdrawn",
        description: "Your quote has been withdrawn successfully.",
      });
      fetchRequests();
    } catch (err) {
      console.error('Error withdrawing quote:', err);
      toast({
        title: "Failed to withdraw quote",
        description: "Could not withdraw your quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (request: any) => {
    setSelectedRequest(request);
    setQuotedPrice(request.quoted_price?.toString() || "");
    setQuoteMessage(request.quote_message || "");
    setIsEditing(true);
  };

  const openQuoteDialog = (request: any) => {
    setSelectedRequest(request);
    setQuotedPrice(request.proposed_price?.toString() || "");
    setQuoteMessage("");
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">Pending</span>;
      case 'quoted':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20">Quoted</span>;
      case 'accepted':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Accepted</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20">Rejected</span>;
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">Paid</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-300 border border-zinc-500/20">{status}</span>;
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading custom order requests...</div>;
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center">
        <FileText className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Requests</h3>
        <p className="text-zinc-400 mb-4">{error}</p>
        <Button onClick={fetchRequests} variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Custom Order Requests</h2>
        <div className="flex gap-2">
          <Link href="/service-marketplace">
            <NeonButton glowColor="primary" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Browse Marketplace
            </NeonButton>
          </Link>
          <Button onClick={fetchRequests} variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5">
            Refresh
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center">
          <FileText className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No custom order requests</h3>
          <p className="text-zinc-400">When buyers request custom work, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass-panel rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{request.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-zinc-400">
                        <Clock className="w-4 h-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                        <span>•</span>
                        <span>Qty: {request.quantity}</span>
                        <span>•</span>
                        <span>{request.material}, {request.color}</span>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-500">Proposed price:</span>
                      <span className="text-white ml-2">${request.proposed_price?.toFixed(2) || "Not specified"}</span>
                    </div>
                    {request.notes && (
                      <div>
                        <span className="text-zinc-500">Notes:</span>
                        <p className="text-white mt-1">{request.notes}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-500">Shipping address:</span>
                      <p className="text-white mt-1">{request.shipping_address}</p>
                    </div>
                    {request.file_url && (
                      <div>
                        <span className="text-zinc-500">Files:</span>
                        <a href={request.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                          View file
                        </a>
                      </div>
                    )}
                  </div>

                  {request.status === 'quoted' && request.quote_message && (
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <span className="text-zinc-500 text-sm">Your quote message:</span>
                      <p className="text-white text-sm mt-1">{request.quote_message}</p>
                    </div>
                  )}

                  {request.status === 'quoted' && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-zinc-500 text-sm">Quoted price:</span>
                      <span className="text-emerald-300 font-semibold ml-2">${request.quoted_price?.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:w-48 shrink-0">
                  {request.status === 'pending' && (
                    <>
                      <NeonButton
                        glowColor="primary"
                        onClick={() => openQuoteDialog(request)}
                        className="rounded-xl"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Quote
                      </NeonButton>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        className="rounded-xl glass-panel text-white border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {request.status === 'quoted' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => openEditDialog(request)}
                        className="rounded-xl glass-panel text-white border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Quote
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleWithdrawQuote(request.id)}
                        className="rounded-xl glass-panel text-white border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote/Edit Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => {
        if (!open) {
          setSelectedRequest(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {isEditing ? "Edit Quote" : "Provide Quote"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              {isEditing
                ? "Update your quoted price and message for this custom order."
                : "Review the request and provide your quoted price for this custom order."}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="font-semibold text-white mb-2">{selectedRequest.title}</h4>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>Qty: {selectedRequest.quantity}</p>
                  <p>Material: {selectedRequest.material}</p>
                  <p>Color: {selectedRequest.color}</p>
                  <p>Buyer's proposed price: ${selectedRequest.proposed_price?.toFixed(2) || "Not specified"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">
                  {isEditing ? "Updated price ($)" : "Your quoted price ($)"}
                </label>
                <Input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="Enter your price"
                  className="bg-black/30 border-white/10 text-white h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Message to buyer (optional)</label>
                <Textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder="Add any notes about your quote, timeline, or requirements..."
                  className="bg-black/30 border-white/10 text-white rounded-xl min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setIsEditing(false);
                  }}
                  className="flex-1 border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <NeonButton
                  glowColor="primary"
                  onClick={isEditing ? handleEditQuote : handleQuote}
                  disabled={isSubmitting || !quotedPrice}
                  className="flex-1 rounded-xl"
                >
                  {isSubmitting
                    ? (isEditing ? "Saving..." : "Submitting...")
                    : (isEditing ? "Save Changes" : "Submit Quote")}
                </NeonButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

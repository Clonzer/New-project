import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { Clock, DollarSign, FileText, CheckCircle2, AlertCircle, Eye, Edit3, Trash2 } from "lucide-react";

export default function BuyerCustomOrders({ user }: { user: any }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this service request? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('custom_order_requests')
        .delete()
        .eq('id', requestId)
        .eq('buyer_id', user.id);

      if (error) throw error;

      toast({
        title: "Request deleted",
        description: "Your service request has been deleted successfully",
      });

      // Refresh the list
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error deleting request",
        description: "Failed to delete the service request. Please try again.",
        variant: "destructive"
      });
    }
  };

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
        .eq('buyer_id', user.id)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">Pending Quote</span>;
      case 'quoted':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">Quote Received</span>;
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
        <h2 className="text-2xl font-bold text-white">My Custom Order Requests</h2>
        <Button onClick={fetchRequests} variant="outline" className="glass-panel text-white border-white/10 hover:bg-white/5">
          Refresh
        </Button>
      </div>

      <div className="mb-6">
        <Link href="/service-marketplace">
          <NeonButton glowColor="primary" className="rounded-xl">
            <FileText className="w-4 h-4 mr-2" />
            Browse Marketplace
          </NeonButton>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center">
          <FileText className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No custom order requests</h3>
          <p className="text-zinc-400 mb-6">Post a service request to the marketplace and receive quotes from makers.</p>
          <Link href="/service-marketplace">
            <NeonButton glowColor="primary" className="rounded-xl">
              <FileText className="w-4 h-4 mr-2" />
              Browse Marketplace
            </NeonButton>
          </Link>
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
                      <span className="text-zinc-500">Your proposed price:</span>
                      <span className="text-white ml-2">${request.proposed_price?.toFixed(2) || "Not specified"}</span>
                    </div>
                    {request.notes && (
                      <div>
                        <span className="text-zinc-500">Your notes:</span>
                        <p className="text-white mt-1">{request.notes}</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'quoted' && (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Quote Received!</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-zinc-500">Seller's quoted price:</span>
                        <span className="text-white font-semibold ml-2">${request.quoted_price?.toFixed(2)}</span>
                      </div>
                      {request.quote_message && (
                        <div className="mt-2">
                          <span className="text-zinc-500 block mb-1">Seller's message:</span>
                          <p className="text-white">{request.quote_message}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-semibold">Order Paid - Being Processed</span>
                      </div>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-semibold">Request Rejected</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:w-48 shrink-0">
                  {request.status === 'quoted' && (
                    <Link href={`/custom-order-payment?requestId=${request.id}`}>
                      <NeonButton glowColor="primary" className="rounded-xl w-full">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pay Quote
                      </NeonButton>
                    </Link>
                  )}
                  {request.status === 'pending' && (
                    <div className="text-sm text-zinc-400 text-center">
                      Waiting for seller to quote
                    </div>
                  )}
                  
                  {/* Action buttons for all statuses */}
                  <Link href={`/service-request/${request.id}`}>
                    <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  
                  {request.status === 'pending' && (
                    <>
                      <Link href={`/edit-service-request/${request.id}`}>
                        <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

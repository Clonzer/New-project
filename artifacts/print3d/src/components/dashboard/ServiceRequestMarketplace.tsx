import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Clock, DollarSign, Package, MapPin, Tag, Quote, X, CheckCircle2, Loader2 } from "lucide-react";

interface ServiceRequest {
  id: string;
  buyer_id: string;
  title: string;
  description: string;
  material: string;
  color: string;
  quantity: number;
  proposed_price: number;
  notes: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'paid';
  created_at: string;
  buyer?: { display_name: string; avatar_url: string; location: string };
  myQuote?: { id: string; price: number; message: string; status: 'pending' | 'accepted' | 'rejected' };
}

export function ServiceRequestMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => { fetchRequests(); }, [user?.id]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch public service requests (where seller_id is null)
      const { data: requestsData, error } = await supabase
        .from('custom_order_requests')
        .select(`
          *,
          buyer:buyer_id(display_name, avatar_url, location)
        `)
        .is('seller_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has already quoted on any of these
      const requestIds = requestsData?.map(r => r.id) || [];
      const { data: quotesData } = await supabase
        .from('service_quotes')
        .select('*')
        .eq('seller_id', user.id)
        .in('request_id', requestIds);

      const quotesMap = new Map(quotesData?.map(q => [q.request_id, q]) || []);

      const enhancedRequests = requestsData?.map(req => ({
        ...req,
        myQuote: quotesMap.get(req.id)
      })) || [];

      setRequests(enhancedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({ title: "Error loading requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchQuery === "" || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.material?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMaterial = selectedMaterial === "all" || req.material === selectedMaterial;
    
    let matchesPrice = true;
    if (priceRange === "under50") matchesPrice = req.proposed_price < 50;
    else if (priceRange === "50to200") matchesPrice = req.proposed_price >= 50 && req.proposed_price <= 200;
    else if (priceRange === "over200") matchesPrice = req.proposed_price > 200;
    
    return matchesSearch && matchesMaterial && matchesPrice;
  });

  const handleSubmitQuote = async () => {
    if (!selectedRequest || !user?.id || !quotePrice) return;
    
    setSubmittingQuote(true);
    try {
      const { error } = await supabase.from('service_quotes').insert({
        request_id: selectedRequest.id,
        seller_id: user.id,
        price: parseFloat(quotePrice),
        message: quoteMessage,
        delivery_days: parseInt(quoteDeliveryDays) || 7,
        status: 'pending'
      });

      if (error) throw error;

      toast({ 
        title: "Quote submitted!", 
        description: "The buyer will be notified of your quote." 
      });
      
      setShowQuoteDialog(false);
      setQuotePrice("");
      setQuoteMessage("");
      setQuoteDeliveryDays("");
      fetchRequests();
    } catch (error) {
      toast({ title: "Failed to submit quote", variant: "destructive" });
    } finally {
      setSubmittingQuote(false);
    }
  };

  const uniqueMaterials = [...new Set(requests.map(r => r.material).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Service Request Marketplace</h2>
          <p className="text-zinc-400">Browse custom job requests and submit quotes</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>{requests.length} open requests</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, material, or description..."
            className="pl-10 bg-black/30 border-white/10 text-white"
          />
        </div>
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
        >
          <option value="all">All Materials</option>
          {uniqueMaterials.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
        >
          <option value="all">Any Price</option>
          <option value="under50">Under $50</option>
          <option value="50to200">$50 - $200</option>
          <option value="over200">Over $200</option>
        </select>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center">
          <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No matching requests</h3>
          <p className="text-zinc-400">Try adjusting your filters or check back later for new requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className={`glass-panel rounded-2xl border p-6 transition-all ${
                request.myQuote 
                  ? 'border-primary/30 bg-primary/5' 
                  : 'border-white/10 hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">
                    {request.buyer?.avatar_url ? (
                      <img src={request.buyer.avatar_url} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-primary">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{request.buyer?.display_name || 'Anonymous Buyer'}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {request.buyer?.location || 'Location unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${request.proposed_price?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-zinc-500">buyer's budget</p>
                </div>
              </div>

              <h3 className="font-semibold text-white mb-2">{request.title}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{request.description || request.notes}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  <Tag className="w-3 h-3 mr-1" />
                  {request.material}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  <Package className="w-3 h-3 mr-1" />
                  Qty: {request.quantity}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(request.created_at).toLocaleDateString()}
                </Badge>
              </div>

              {request.myQuote ? (
                <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-white">You quoted: ${request.myQuote.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-zinc-400">Status: {request.myQuote.status}</p>
                </div>
              ) : (
                <Button 
                  onClick={() => { setSelectedRequest(request); setShowQuoteDialog(true); }}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Quote className="w-4 h-4 mr-2" />
                  Submit Quote
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quote Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Submit Quote</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Quote on: {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Your Price ($)</label>
              <Input
                type="number"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="Enter your price"
                className="bg-black/30 border-white/10 text-white"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Buyer's budget: ${selectedRequest?.proposed_price?.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Delivery Time (days)</label>
              <Input
                type="number"
                value={quoteDeliveryDays}
                onChange={(e) => setQuoteDeliveryDays(e.target.value)}
                placeholder="e.g., 7"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-300 block mb-2">Message to Buyer</label>
              <Textarea
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                placeholder="Describe your approach, experience, or any questions..."
                className="bg-black/30 border-white/10 text-white min-h-[100px]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowQuoteDialog(false)}
                className="flex-1 border-white/10 text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitQuote}
                disabled={submittingQuote || !quotePrice}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {submittingQuote ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-1" />
                    Submit Quote
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Package, 
  FileText, 
  DollarSign, 
  Clock, 
  User, 
  CheckCircle2,
  Box,
  Loader2,
  AlertCircle,
  Star,
  Calendar,
  ExternalLink,
  Download,
  MessageSquare,
  Award
} from "lucide-react";
import { formatPrice } from "@/lib/locale-preferences";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  material: string;
  color: string;
  quantity: number;
  proposedPrice: number;
  notes: string;
  fileUrl: string;
  fileName: string;
  fileType?: string;
  status: "open" | "quoted" | "accepted" | "completed" | "cancelled";
  createdAt: string;
  requesterId: string;
  requesterName?: string;
  requesterAvatar?: string;
}

interface Quote {
  id: string;
  requestId: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  price: number;
  message: string;
  estimatedDays: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  rating?: number;
  completedOrders?: number;
}

export default function ServiceRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRequestAndQuotes();
    }
  }, [id]);

  const loadRequestAndQuotes = async () => {
    setLoading(true);
    try {
      // Load service request
      const { data: requestData, error: requestError } = await supabase
        .from("custom_order_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (requestError) throw requestError;

      // Load requester profile with error handling
      let requesterName = "Unknown";
      let requesterAvatar = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, avatar_url, display_name")
          .eq("id", requestData.buyer_id)
          .maybeSingle();
        
        if (profileData && !profileError) {
          requesterName = profileData.display_name || profileData.username || "Unknown";
          requesterAvatar = profileData.avatar_url;
        }
      } catch (profileErr) {
        console.log("Could not load requester profile:", profileErr);
      }

      const transformedRequest: ServiceRequest = {
        id: requestData.id,
        title: requestData.title,
        description: requestData.description,
        material: requestData.material,
        color: requestData.color,
        quantity: requestData.quantity,
        proposedPrice: requestData.proposed_price,
        notes: requestData.notes,
        fileUrl: requestData.file_url,
        fileName: requestData.file_name,
        fileType: requestData.file_type,
        status: requestData.status,
        createdAt: requestData.created_at,
        requesterId: requestData.buyer_id,
        requesterName,
        requesterAvatar,
      };

      setRequest(transformedRequest);
      if (requestData.file_url) {
        setActiveImage(requestData.file_url);
      }

      // Load quotes - handle missing table gracefully
      let quotesWithProfiles: any[] = [];
      try {
        const { data: quotesData, error: quotesError } = await supabase
          .from("custom_order_quotes")
          .select("*")
          .eq("request_id", id)
          .order("created_at", { ascending: false });

        if (!quotesError && quotesData) {
          // Load seller profiles for quotes
          quotesWithProfiles = await Promise.all(
            quotesData.map(async (quote) => {
              const { data: sellerProfile } = await supabase
                .from("profiles")
                .select("username, avatar_url, rating")
                .eq("id", quote.seller_id)
                .single();

              return {
                id: quote.id,
                requestId: quote.request_id,
                sellerId: quote.seller_id,
                sellerName: sellerProfile?.username || "Unknown Seller",
                sellerAvatar: sellerProfile?.avatar_url,
                price: quote.price,
                message: quote.message,
                estimatedDays: quote.estimated_days,
                status: quote.status,
                createdAt: quote.created_at,
                rating: sellerProfile?.rating || 0,
              };
            })
          );
        }
      } catch (quotesErr) {
        console.warn("Quotes table not available, skipping quotes load:", quotesErr);
      }

      setQuotes(quotesWithProfiles);
    } catch (error) {
      console.error("Error loading request:", error);
      toast({
        title: "Error loading request",
        description: "Failed to load service request details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      // Try to update quote status if table exists
      try {
        await supabase
          .from("custom_order_quotes")
          .update({ status: "accepted" })
          .eq("id", quoteId);
      } catch {
        console.warn("Could not update quote status - table may not exist");
      }

      // Update request status
      await supabase
        .from("custom_order_requests")
        .update({ status: "accepted" })
        .eq("id", id);

      toast({
        title: "Quote accepted!",
        description: "The seller has been notified",
      });

      loadRequestAndQuotes();
    } catch (error) {
      toast({
        title: "Error accepting quote",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "quoted": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "accepted": return "bg-primary/20 text-primary border-primary/30";
      case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-zinc-500/20 text-zinc-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Request Not Found</h2>
              <p className="text-zinc-400 mb-4">This service request doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation("/service-marketplace")}>
                Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === request.requesterId;
  const isSeller = user?.id !== request.requesterId;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => setLocation("/service-marketplace")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      <span className="text-zinc-500 text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-2xl text-white">{request.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(request.proposedPrice)}
                    </p>
                    <p className="text-zinc-500 text-sm">Proposed Budget</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Requester Info */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {request.requesterAvatar ? (
                      <img src={request.requesterAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      request.requesterName?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{request.requesterName}</p>
                    <p className="text-zinc-500 text-sm">Requester</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Description
                  </h3>
                  <p className="text-zinc-400 whitespace-pre-wrap">{request.description}</p>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
                      <Box className="w-3 h-3" />
                      Material
                    </p>
                    <p className="text-white font-medium">{request.material}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-zinc-500 text-xs mb-1">Color</p>
                    <p className="text-white font-medium">{request.color}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Quantity
                    </p>
                    <p className="text-white font-medium">{request.quantity}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Budget
                    </p>
                    <p className="text-white font-medium">{formatPrice(request.proposedPrice)}</p>
                  </div>
                </div>

                {/* Notes */}
                {request.notes && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h3 className="text-primary font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Special Notes
                    </h3>
                    <p className="text-zinc-400">{request.notes}</p>
                  </div>
                )}

                {/* Model Preview - Enhanced for Sellers */}
                {request.fileUrl && (
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Attached File / Model
                      <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">
                        For Review
                      </Badge>
                    </h3>
                    <div className="bg-zinc-900/50 rounded-xl overflow-hidden border border-white/10">
                      {request.fileType?.startsWith('image/') ? (
                        <div className="relative">
                          <img
                            src={request.fileUrl}
                            alt={request.fileName || "Model preview"}
                            className="w-full h-64 object-contain bg-zinc-950"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-black/70 text-white border-white/20 backdrop-blur-sm">
                              Image Preview
                            </Badge>
                          </div>
                        </div>
                      ) : ['.stl', '.obj', '.3mf', '.ply', '.gltf', '.glb'].some(ext => 
                        request.fileName?.toLowerCase().endsWith(ext)) ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-950 p-6">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                            <Package className="w-10 h-10 text-primary" />
                          </div>
                          <p className="text-white font-medium text-center mb-1">3D Model File</p>
                          <p className="text-zinc-400 text-sm text-center mb-3">
                            {request.fileName?.split('.').pop()?.toUpperCase()} format
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center mb-4">
                            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
                              Ready to Print
                            </Badge>
                            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
                              Download Required
                            </Badge>
                          </div>
                          <p className="text-zinc-500 text-xs text-center max-w-xs">
                            Download this file to inspect in your 3D slicer or CAD software for exact dimensions, printability, and material requirements.
                          </p>
                        </div>
                      ) : (
                        <div className="w-full h-48 flex flex-col items-center justify-center bg-zinc-950 p-6">
                          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
                            <FileText className="w-8 h-8 text-zinc-400" />
                          </div>
                          <p className="text-white font-medium mb-1">Reference Document</p>
                          <p className="text-zinc-400 text-sm text-center mb-2">
                            {request.fileName?.split('.').pop()?.toUpperCase() || 'Document'} file
                          </p>
                          <p className="text-zinc-500 text-xs text-center max-w-xs">
                            This file may contain specifications, diagrams, or reference images for the project.
                          </p>
                        </div>
                      )}
                      <div className="p-4 bg-zinc-900/80 border-t border-white/10">
                        <div className="flex flex-col gap-3">
                          {/* File Info Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                {request.fileType?.startsWith('image/') ? (
                                  <Package className="w-5 h-5 text-primary" />
                                ) : ['.stl', '.obj', '.3mf'].some(ext => 
                                  request.fileName?.toLowerCase().endsWith(ext)) ? (
                                  <Package className="w-5 h-5 text-accent" />
                                ) : (
                                  <FileText className="w-5 h-5 text-zinc-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white truncate max-w-[200px] md:max-w-xs">
                                  {request.fileName || "Attachment"}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {request.fileType?.split('/')[1]?.toUpperCase() ||
                                   request.fileName?.split('.').pop()?.toUpperCase() ||
                                   'FILE'} • Click download to inspect
                                </p>
                              </div>
                            </div>
                            <a
                              href={request.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:text-white flex items-center gap-2 transition-colors px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30"
                            >
                              <Download className="w-4 h-4" />
                              Download File
                            </a>
                          </div>
                          
                          {/* Seller Tips */}
                          <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs text-zinc-400 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-zinc-300">Tip for sellers:</strong> Download and review this file before submitting your quote. 
                                Check for printability, required supports, infill settings, and estimated print time to provide an accurate price.
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotes Section */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Quotes ({quotes.length})
                </CardTitle>
                <CardDescription>
                  {isOwner 
                    ? "Review quotes from sellers and choose the best one for your project" 
                    : "View all quotes submitted for this request"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No quotes yet</p>
                    <p className="text-zinc-500 text-sm mt-1">
                      {isOwner 
                        ? "Sellers will submit quotes soon!" 
                        : "Be the first to submit a quote!"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {quotes.map((quote, index) => (
                      <motion.div
                        key={quote.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          quote.status === "accepted" 
                            ? "bg-primary/10 border-primary/50" 
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                              {quote.sellerAvatar ? (
                                <img src={quote.sellerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                quote.sellerName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{quote.sellerName}</p>
                              <div className="flex items-center gap-2 text-sm">
                                {quote.rating > 0 && (
                                  <span className="text-yellow-400 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" />
                                    {quote.rating.toFixed(1)}
                                  </span>
                                )}
                                <span className="text-zinc-500">
                                  {new Date(quote.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{formatPrice(quote.price)}</p>
                            <p className="text-zinc-500 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {quote.estimatedDays} days
                            </p>
                          </div>
                        </div>

                        {quote.message && (
                          <p className="text-zinc-400 mb-4 pl-15">{quote.message}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge className={
                            quote.status === "accepted" 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : quote.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>

                          {isOwner && quote.status === "pending" && request.status === "open" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptQuote(quote.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Accept Quote
                            </Button>
                          )}

                          {isSeller && quote.sellerId === user?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/messages?user=${request.requesterId}`)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message Requester
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="bg-zinc-900/50 border-zinc-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isSeller && request.status === "open" && (
                  <>
                    {/* Quote CTA Card */}
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Submit Your Quote</p>
                          <p className="text-xs text-zinc-400">Compete with other sellers</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 mb-4">
                        Review the attached file and project details, then submit your best price and timeline.
                      </p>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                        onClick={() => setLocation(`/submit-quote/${id}`)}
                      >
                        <DollarSign className="w-5 h-5 mr-2" />
                        Submit Quote Now
                      </Button>
                    </div>
                    
                    {/* Quick Tips */}
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-zinc-400 font-medium mb-2">Before quoting, consider:</p>
                      <ul className="text-xs text-zinc-500 space-y-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          Download & inspect the attached file
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          Estimate print time & material cost
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          Factor in shipping to buyer's location
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          Add your margin for profit
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                {isOwner && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                      onClick={() => setLocation(`/edit-service-request/${id}`)}
                      disabled={request.status !== "open"}
                    >
                      Edit Request
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this request?")) {
                          supabase.from("custom_order_requests").update({ status: "cancelled" }).eq("id", id).then(() => {
                            toast({ title: "Request cancelled" });
                            loadRequestAndQuotes();
                          });
                        }
                      }}
                      disabled={request.status === "completed" || request.status === "cancelled"}
                    >
                      Cancel Request
                    </Button>
                  </>
                )}

                {!isOwner && !isSeller && (
                  <Button 
                    className="w-full"
                    onClick={() => setLocation("/login")}
                  >
                    Login to Quote
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  className="w-full text-zinc-400"
                  onClick={() => setLocation(`/messages?topic=service-request-${id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discuss Request
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">1</span>
                  </div>
                  <p className="text-zinc-400">Review the request details carefully</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">2</span>
                  </div>
                  <p className="text-zinc-400">Submit a competitive quote with timeline</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">3</span>
                  </div>
                  <p className="text-zinc-400">Wait for the requester to accept</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">4</span>
                  </div>
                  <p className="text-zinc-400">Complete the order and get paid!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

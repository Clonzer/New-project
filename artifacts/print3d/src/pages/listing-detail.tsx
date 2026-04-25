import { useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/shared/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, ShoppingCart, MessageSquare, Package, Shield, Truck, Eye, Calendar, Hash, Star, Printer, Store, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/lib/cart-storage";
import { useGetListing, useListListings } from "@/lib/workspace-stub";
import { BuyerPriceDisplay } from "@/components/shared/PricingCalculator";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, error } = useGetListing(id);
  const { data: relatedData } = useListListings({ sellerId: listing?.sellerId, limit: 4 });
  const { user } = useAuth();
  const { toast } = useToast();

  const relatedListings = relatedData?.listings?.filter((l: any) => l.id !== id) || [];

  const handleAddToCart = () => {
    if (!listing) return;
    addToCart(listing.id, 1);
    toast({ title: "Added to cart", description: listing.title });
  };

  const handleRequestJob = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login required", description: "Please login to request a job." });
      return;
    }
    window.location.href = `/messages?userId=${listing.sellerId}&listingId=${listing.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-8 w-2/3 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Listing not found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isServiceListing = listing.listingType === "service";
  const images = listing.images || [];
  const mainImage = images[0] || null;

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900/20 via-black to-cyan-900/20">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-white hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Listings
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Images + Description */}
            <div className="space-y-6">
              {/* Main Image */}
              {mainImage ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 shadow-2xl ring-1 ring-white/10">
                  <img
                    src={mainImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {/* View count badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white">
                    <Eye className="w-4 h-4" />
                    <span>{listing.views?.toLocaleString() || 0} views</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-black/40 flex items-center justify-center shadow-2xl ring-1 ring-white/10">
                  <Package className="w-16 h-16 text-white/20" />
                </div>
              )}
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden bg-black/40 ring-1 ring-white/10 cursor-pointer hover:ring-primary/50 transition-all hover:scale-105">
                      <img
                        src={image}
                        alt={`${listing.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div className="text-sm">
                    <p className="text-zinc-400">Listed</p>
                    <p className="text-white font-medium">{formatDate(listing.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  <div className="text-sm">
                    <p className="text-zinc-400">ID</p>
                    <p className="text-white font-medium">#{listing.id?.toString().slice(-6)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <div className="text-sm">
                    <p className="text-zinc-400">Rating</p>
                    <p className="text-white font-medium">New</p>
                  </div>
                </div>
              </div>

              {/* Description - Now below images */}
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">About this item</h2>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {listing.description || "No description provided."}
                </p>
                
                {/* Material info if available */}
                {listing.material && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Printer className="w-4 h-4 text-primary" />
                      <span className="text-zinc-400">Material:</span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                        {listing.material}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details & Purchase */}
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30 font-medium px-3 py-1">
                  {listing.category}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 leading-tight">{listing.title}</h1>
                <Link href={`/shop/${listing.sellerId}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors text-lg group">
                  <span>by {listing.sellerName}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Price */}
              <div className="space-y-4">
                <BuyerPriceDisplay 
                  basePrice={listing.basePrice || 0}
                  shippingCost={listing.shippingCost || 0}
                  carrier={listing.carrier || "default"}
                />
                
                {/* Shipping Info */}
                {listing.carrier && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Ships via {listing.customCarrier || listing.carrier}</span>
                  </div>
                )}
              </div>

              {/* Production Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-zinc-300">Est. <span className="text-white font-medium">{listing.estimatedDaysMin}-{listing.estimatedDaysMax}</span> days</span>
                </div>
                {listing.stockQuantity !== undefined && listing.trackStock && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300"><span className="font-medium">{listing.stockQuantity}</span> in stock</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isServiceListing && (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40"
                    disabled={listing.stockQuantity === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                )}
                
                {isServiceListing ? (
                  <Button
                    onClick={handleRequestJob}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Request Job
                  </Button>
                ) : (
                  <Link href={`/product-order?listingId=${listing.id}`} className="block">
                    <Button className="w-full py-6 text-lg font-semibold bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300">
                      Order Now
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-colors">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Tracked Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Tags</h2>
              <div className="flex flex-wrap gap-3">
                {listing.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-white/10 text-zinc-300 border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/15 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Products Section */}
          {relatedListings.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white">More from {listing.sellerName}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedListings.map((relatedListing) => (
                  <ListingCard key={relatedListing.id} listing={relatedListing} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products - Same Category */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
                <p className="text-zinc-400 text-sm mt-1">Similar {listing.category} items you might like</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.slice(0, 2).concat(relatedListings.slice(0, 2)).map((relatedListing, index) => (
                <ListingCard key={`rec-${relatedListing.id}-${index}`} listing={relatedListing} />
              ))}
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Recently Viewed</h2>
                <p className="text-zinc-400 text-sm mt-1">Items you've browsed recently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.slice(1, 3).concat(relatedListings.slice(0, 1)).map((relatedListing, index) => (
                <ListingCard key={`recent-${relatedListing.id}-${index}`} listing={relatedListing} />
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Trending Now</h2>
                <p className="text-zinc-400 text-sm mt-1">Popular items this week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.slice(0, 1).concat(relatedListings.slice(2, 4)).map((relatedListing, index) => (
                <ListingCard key={`trending-${relatedListing.id}-${index}`} listing={relatedListing} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

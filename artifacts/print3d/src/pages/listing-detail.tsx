import { useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/shared/ListingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, ShoppingCart, MessageSquare, Package, Shield, Truck } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/lib/cart-storage";
import { useGetListing, useListListings } from "@/lib/workspace-stub";

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
            {/* Images Section */}
            <div className="space-y-4">
              {mainImage ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
                  <img
                    src={mainImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-black/40 flex items-center justify-center">
                  <Package className="w-16 h-16 text-white/20" />
                </div>
              )}
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                      <img
                        src={image}
                        alt={`${listing.title} ${index + 2}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3 bg-primary/20 text-primary border-primary/30">
                  {listing.category}
                </Badge>
                <h1 className="text-4xl font-display font-bold text-white mb-2">{listing.title}</h1>
                <Link href={`/shop/${listing.sellerId}`} className="text-zinc-400 hover:text-primary transition-colors">
                  by {listing.sellerName}
                </Link>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-display font-bold text-primary">
                  ${listing.basePrice?.toFixed(2) || "0.00"}
                </span>
                {listing.shippingCost > 0 && (
                  <span className="text-zinc-400">+ ${listing.shippingCost?.toFixed(2)} shipping</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Est. {listing.estimatedDaysMin}-{listing.estimatedDaysMax} days</span>
                </div>
                {listing.stockQuantity !== undefined && listing.trackStock && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>{listing.stockQuantity} in stock</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {!isServiceListing && (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
                    disabled={listing.stockQuantity === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                )}
                
                {isServiceListing ? (
                  <Button
                    onClick={handleRequestJob}
                    className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Request Job
                  </Button>
                ) : (
                  <Link href={`/order/new?listingId=${listing.id}`} className="block">
                    <Button className="w-full py-6 text-lg bg-white/10 hover:bg-white/20 border border-white/20">
                      Order Now
                    </Button>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span>Tracked Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {listing.description || "No description provided."}
            </p>
          </div>

          {/* Tags Section */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-white/10 text-zinc-300 border-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Products Section */}
          {relatedListings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">More from {listing.sellerName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedListings.map((relatedListing) => (
                  <ListingCard key={relatedListing.id} listing={relatedListing} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

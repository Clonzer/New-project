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
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 shadow-2xl ring-1 ring-white/10">
                  <img
                    src={mainImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-black/40 flex items-center justify-center shadow-2xl ring-1 ring-white/10">
                  <Package className="w-16 h-16 text-white/20" />
                </div>
              )}
              
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
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30 font-medium px-3 py-1">
                  {listing.category}
                </Badge>
                <h1 className="text-5xl font-display font-bold text-white mb-3 leading-tight">{listing.title}</h1>
                <Link href={`/shop/${listing.sellerId}`} className="text-zinc-400 hover:text-primary transition-colors text-lg">
                  by {listing.sellerName}
                </Link>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-display font-bold text-primary">
                  ${listing.basePrice?.toFixed(2) || "0.00"}
                </span>
                {listing.shippingCost > 0 && (
                  <span className="text-zinc-400 text-lg">+ ${listing.shippingCost?.toFixed(2)} shipping</span>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Est. {listing.estimatedDaysMin}-{listing.estimatedDaysMax} days</span>
                </div>
                {listing.stockQuantity !== undefined && listing.trackStock && (
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>{listing.stockQuantity} in stock</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                {!isServiceListing && (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40"
                    disabled={listing.stockQuantity === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                )}
                
                {isServiceListing ? (
                  <Button
                    onClick={handleRequestJob}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40"
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

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-white/5 p-4 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-white/5 p-4 rounded-xl">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Tracked Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-zinc-900/50 rounded-2xl p-8 mb-12 border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6">Description</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
              {listing.description || "No description provided."}
            </p>
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
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">More from {listing.sellerName}</h2>
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

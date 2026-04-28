import { NeonButton } from "@/components/ui/neon-button";
import { ListingCard } from "@/components/shared/ListingCard";
import { Plus, Package, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function Listings({ myListings, handleDeleteListing }) {
  const [, navigate] = useLocation();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">My Catalog Listings</h2>
        <NeonButton glowColor="primary" className="rounded-full px-5" onClick={() => navigate("/create-listing")}>
          <Plus className="w-4 h-4 mr-2" /> Add Listing
        </NeonButton>
      </div>
      {!myListings?.listings.length ? (
        <div className="glass-panel p-16 rounded-3xl text-center">
          <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 mb-4">No listings yet. Add models to your catalog.</p>
          <NeonButton glowColor="primary" onClick={() => navigate("/create-listing")}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Listing
          </NeonButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {myListings.listings.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              isOwner={true}
              onDelete={() => handleDeleteListing(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

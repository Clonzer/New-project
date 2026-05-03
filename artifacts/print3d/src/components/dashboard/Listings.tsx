import { NeonButton } from "@/components/ui/neon-button";
import { ListingCard } from "@/components/shared/ListingCard";
import { Plus, Package, ArrowRight, Lock, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { canCreateListing, getRemainingListings, getPlanLimits } from "@/lib/plan-utils";
import { Link } from "wouter";

export function Listings({ myListings, handleDeleteListing }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const listingCount = myListings?.listings?.length || 0;
  const createCheck = canCreateListing(user, listingCount);
  const remaining = getRemainingListings(user, listingCount);
  const limits = getPlanLimits(user?.planTier);

  const renderAddButton = () => {
    if (createCheck.allowed) {
      return (
        <NeonButton glowColor="primary" className="rounded-full px-5" onClick={() => navigate("/create-listing")}>
          <Plus className="w-4 h-4 mr-2" /> Add Listing
          {remaining > 0 && limits.maxListings !== -1 && (
            <span className="ml-2 text-xs opacity-70">({remaining} left)</span>
          )}
        </NeonButton>
      );
    }

    return (
      <Link href="/pricing">
        <NeonButton glowColor="accent" className="rounded-full px-5">
          <Crown className="w-4 h-4 mr-2" /> Upgrade to Add More
        </NeonButton>
      </Link>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">My Catalog Listings</h2>
          {limits.maxListings !== -1 && (
            <p className="text-xs text-zinc-500 mt-1">
              {listingCount} / {limits.maxListings} listings used on {user?.planTier || 'starter'} plan
            </p>
          )}
        </div>
        {renderAddButton()}
      </div>

      {/* Show limit reached message */}
      {!createCheck.allowed && (
        <div className="glass-panel p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 mb-6">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-white">Listing limit reached</p>
              <p className="text-xs text-zinc-400">
                You've used all {limits.maxListings} listings on your plan. Upgrade to create more.
              </p>
            </div>
            <Link href="/pricing" className="ml-auto">
              <NeonButton glowColor="accent" className="rounded-full text-xs px-4 py-2">
                Upgrade
              </NeonButton>
            </Link>
          </div>
        </div>
      )}

      {!myListings?.listings.length ? (
        <div className="glass-panel p-16 rounded-3xl text-center">
          <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 mb-4">No listings yet. Add models to your catalog.</p>
          {createCheck.allowed ? (
            <NeonButton glowColor="primary" onClick={() => navigate("/create-listing")}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Listing
            </NeonButton>
          ) : (
            <Link href="/pricing">
              <NeonButton glowColor="accent">
                <Crown className="w-4 h-4 mr-2" /> Upgrade to Add Listings
              </NeonButton>
            </Link>
          )}
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

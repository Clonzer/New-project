import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/lib/workspace-api-mock";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, CheckCircle2, Package, Printer as PrinterIcon } from "lucide-react";
import { format } from "date-fns";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: Partial<User> | null;
  statsOverrides?: {
    reviewCount?: number;
    rating?: number;
    totalPrints?: number;
  };
}

export function ProfilePreviewModal({
  isOpen,
  onOpenChange,
  user,
  statsOverrides,
}: ProfilePreviewModalProps) {
  if (!user) return null;

  const displayName = user.displayName || "Anonymous";
  const shopName = user.shopName || displayName;
  const rating = statsOverrides?.rating ?? user.rating ?? 0;
  const reviewCount = statsOverrides?.reviewCount ?? user.reviewCount ?? 0;
  const totalPrints = statsOverrides?.totalPrints ?? user.totalPrints ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black/90 border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Profile Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Profile Header */}
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_rgba(139,92,246,0.3)] shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-4 border-background">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-display font-bold text-white">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow">
                {user.bannerUrl ? (
                  <div className="mb-5 overflow-hidden rounded-lg border border-white/10">
                    <img
                      src={user.bannerUrl}
                      alt={`${shopName} banner`}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ) : null}

                <h1 className="text-4xl font-display font-bold text-white mb-2">{shopName}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                  {user.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary" /> {user.location}
                    </span>
                  ) : null}
                  {user.joinedAt ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-accent" /> Joined {format(new Date(user.joinedAt), "MMM yyyy")}
                    </span>
                  ) : null}
                  {reviewCount > 0 && (
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-white border border-white/10">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {rating.toFixed(1)} ({reviewCount})
                    </span>
                  )}
                  {user.emailVerifiedAt ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      Verified maker
                    </span>
                  ) : null}
                  {user.planTier === "enterprise" ? (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                      Enterprise
                    </span>
                  ) : null}
                </div>

                {user.shopAnnouncement ? (
                  <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white">
                    {user.shopAnnouncement}
                  </div>
                ) : null}

                <p className="text-zinc-300 max-w-2xl text-base leading-relaxed">
                  {user.bio || "Fabrication, additive manufacturing, and custom work - message for details."}
                </p>

                {user.brandStory ? (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
                    {user.brandStory}
                  </p>
                ) : null}

                {user.sellerTags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.sellerTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Seller Badges */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {reviewCount >= 3 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Trusted Seller</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">{totalPrints} Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Website & Contact */}
          {(user.websiteUrl || user.instagramHandle || user.supportEmail) && (
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4">Contact & Links</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                {user.websiteUrl && (
                  <p>
                    <span className="text-zinc-500">Website:</span> {user.websiteUrl}
                  </p>
                )}
                {user.instagramHandle && (
                  <p>
                    <span className="text-zinc-500">Instagram:</span> @{user.instagramHandle}
                  </p>
                )}
                {user.supportEmail && (
                  <p>
                    <span className="text-zinc-500">Support:</span> {user.supportEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shop Mode */}
          {user.shopMode && (
            <div className="glass-panel rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4">Shop Type</h3>
              <p className="text-sm text-zinc-300 capitalize">
                {user.shopMode === "catalog"
                  ? "Catalog only (pre-designed products)"
                  : user.shopMode === "open"
                    ? "Open for custom requests"
                    : "Both catalog and custom requests"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

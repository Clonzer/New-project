import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function VerifyEmailBanner() {
  const { user } = useAuth();

  if (!user || user.emailVerifiedAt) {
    return null;
  }

  const sellerIntent = user.role === "seller" || user.role === "both";

  return (
    <div className="border-b border-amber-400/15 bg-amber-400/10">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 text-sm text-amber-100 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            Verify your email to unlock the full account experience
            {sellerIntent ? ", including selling, listings, equipment, and payouts." : "."}
          </p>
        </div>
        <Link href="/settings" className="font-semibold text-white underline-offset-4 hover:text-amber-50 hover:underline">
          Verify now
        </Link>
      </div>
    </div>
  );
}

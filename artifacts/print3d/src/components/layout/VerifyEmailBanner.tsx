import { Link } from "wouter";
import { ShieldAlert, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Check emailVerifiedAt from Supabase Auth (reliable source) rather than isVerified from DB
  const isActuallyVerified = !!user.emailVerifiedAt;
  
  if (!user || isActuallyVerified || dismissed) {
    return null;
  }

  const sellerIntent = user.role === "seller" || user.role === "both";

  return (
    <div className="fixed top-16 right-4 z-50 w-96 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-100 mb-1">
            Verify your email address
          </p>
          <p className="text-xs text-amber-200 mb-2">
            {sellerIntent 
              ? "Email verification is required to enable selling features and create listings." 
              : "Verify your email to unlock all account features and improve security."}
          </p>
          <Link 
            href="/settings?section=security" 
            className="inline-flex items-center text-xs font-semibold text-amber-100 underline-offset-2 hover:text-white hover:underline"
          >
            Verify now →
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

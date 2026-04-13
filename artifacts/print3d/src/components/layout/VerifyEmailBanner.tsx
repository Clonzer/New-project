import { Link } from "wouter";
import { ShieldAlert, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailVerifiedAt || dismissed) {
    return null;
  }

  const sellerIntent = user.role === "seller" || user.role === "both";

  return (
    <div className="fixed top-16 right-4 z-50 w-80 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="flex-1">
          <p className="text-xs text-amber-100">
            Verify your email to unlock full account features
            {sellerIntent ? " including selling and listings." : "."}
          </p>
          <Link 
            href="/settings?section=security" 
            className="mt-1 inline-block text-xs font-semibold text-amber-200 underline-offset-2 hover:text-amber-50 hover:underline"
          >
            Verify now
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

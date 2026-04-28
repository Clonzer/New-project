import { Link } from "wouter";
import { ShieldAlert, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Load dismissal state from localStorage on mount
  useEffect(() => {
    const dismissedState = localStorage.getItem('verify-email-dismissed');
    if (dismissedState === 'true') {
      setDismissed(true);
    }
  }, []);

  // Save dismissal state to localStorage
  const handleDismiss = () => {
    localStorage.setItem('verify-email-dismissed', 'true');
    setDismissed(true);
  };

  // Check if user is null first, then check emailVerifiedAt
  if (!user || dismissed) {
    return null;
  }
  
  // Check emailVerifiedAt from Supabase Auth (reliable source) rather than isVerified from DB
  const isActuallyVerified = !!user.emailVerifiedAt;
  
  if (isActuallyVerified) {
    return null;
  }

  const sellerIntent = user.role === "seller" || user.role === "both";

  return (
    <div className="fixed top-16 right-4 z-50 w-80 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-amber-100 mb-0.5">
            Verify your email
          </p>
          <p className="text-[10px] text-amber-200 mb-1.5">
            {sellerIntent 
              ? "Required to enable selling features." 
              : "Unlock all account features."}
          </p>
          <Link 
            href="/settings?section=security" 
            className="inline-flex items-center text-[10px] font-semibold text-amber-100 underline-offset-2 hover:text-white hover:underline"
          >
            Verify now →
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-400/60 hover:text-amber-400 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

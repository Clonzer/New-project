import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing verification...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the token_hash from URL query params
        const url = new URL(window.location.href);
        const token_hash = url.searchParams.get("token");
        const type = url.searchParams.get("type");

        if (!token_hash) {
          setStatus("error");
          setMessage("No verification token found in URL.");
          return;
        }

        // Verify the OTP
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type === "verify" ? "email" : "signup",
        });

        if (error) {
          // Try with signup type as fallback
          const { error: fallbackError } = await supabase.auth.verifyOtp({
            token_hash,
            type: "signup",
          });

          if (fallbackError) {
            throw fallbackError;
          }
        }

        setStatus("success");
        setMessage("Email verified successfully!");

        toast({
          title: "Email verified",
          description: "Your email has been verified. You can now use all features.",
        });

        // Redirect to settings after 2 seconds
        setTimeout(() => {
          setLocation("/settings?section=security");
        }, 2000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email. The link may have expired.");
        
        toast({
          title: "Verification failed",
          description: error.message || "The verification link may have expired.",
          variant: "destructive",
        });
      }
    };

    handleCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verifying your email...</h1>
              <p className="text-zinc-400">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-zinc-400">{message}</p>
              <p className="text-sm text-zinc-500 mt-4">Redirecting to settings...</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-zinc-400">{message}</p>
              <button
                onClick={() => setLocation("/settings?section=security")}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Go to Settings
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Shield, 
  Clock,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const type = url.searchParams.get("type");

        if (!token) {
          setStatus("error");
          setMessage("No verification token found in the URL. Please check your email link.");
          return;
        }

        // Verify the email with the token
        const { error, data } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          setStatus("error");
          setMessage(
            error.message.includes("expired") 
              ? "This verification link has expired. Please request a new one below."
              : "Invalid verification link. Please check your email or request a new one."
          );
        } else {
          setStatus("success");
          setMessage("Email verified successfully! Your account is now fully active.");
          
          toast({
            title: "Welcome to Synthix! 🎉",
            description: "Your email has been verified. You now have access to all marketplace features.",
          });

          // Get user email for display
          if (data?.user?.email) {
            setEmail(data.user.email);
          }

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            setLocation("/dashboard");
          }, 3000);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "An unexpected error occurred during verification.");
        
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your email. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleVerification();
  }, [setLocation, toast]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast({
          title: "Failed to Resend",
          description: "We couldn't send a new verification email. Please try again later.",
          variant: "destructive",
        });
      } else {
        setStatus("resend");
        setMessage("A new verification email has been sent. Please check your inbox.");
        
        toast({
          title: "Email Sent",
          description: "Check your inbox for the new verification link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-zinc-800 to-orange-950">
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Verification Status Card */}
          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                {/* Status Icons */}
                <div className="mb-6">
                  {status === "loading" && (
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-primary/10 animate-pulse" />
                    </div>
                  )}
                  
                  {status === "success" && (
                    <div className="relative">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-emerald-400/10 animate-ping" />
                    </div>
                  )}
                  
                  {status === "error" && (
                    <div className="relative">
                      <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-red-400/10" />
                    </div>
                  )}
                  
                  {status === "resend" && (
                    <div className="relative">
                      <Mail className="w-16 h-16 text-blue-400 mx-auto" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-blue-400/10 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {status === "loading" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      Verifying Your Email
                    </h1>
                    <p className="text-zinc-300">
                      Please wait while we confirm your email address...
                    </p>
                  </div>
                )}

                {status === "success" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-emerald-400 mb-2">
                      Email Verified! 🎉
                    </h1>
                    <p className="text-zinc-300 mb-4">
                      {message}
                    </p>
                    {email && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/10 rounded-full text-emerald-300 text-sm">
                        <Shield className="w-4 h-4" />
                        {email}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
                      <Clock className="w-4 h-4" />
                      Redirecting to dashboard...
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-red-400 mb-2">
                      Verification Failed
                    </h1>
                    <p className="text-zinc-300 mb-6">
                      {message}
                    </p>
                    
                    {/* Resend Email Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/50 rounded-lg border border-zinc-600/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="w-5 h-5 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-200">
                            Need a new verification link?
                          </span>
                        </div>
                        <Button
                          onClick={handleResendEmail}
                          disabled={isResending || !email}
                          className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/80 hover:to-violet-500 text-white border-0"
                        >
                          {isResending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Verification Email
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="text-xs text-zinc-500 space-y-1">
                        <p>• Check your spam/junk folder</p>
                        <p>• Make sure the email address is correct</p>
                        <p>• Verification links expire in 24 hours</p>
                      </div>
                    </div>
                  </div>
                )}

                {status === "resend" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-blue-400 mb-2">
                      Email Sent
                    </h1>
                    <p className="text-zinc-300 mb-4">
                      {message}
                    </p>
                    <div className="p-4 bg-blue-400/10 rounded-lg border border-blue-400/30">
                      <div className="flex items-center gap-2 text-blue-300 text-sm">
                        <Mail className="w-4 h-4" />
                        Check your inbox for the new verification link
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                {status !== "loading" && (
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
                    className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    Back to Home
                  </Button>
                )}
                
                {(status === "success" || status === "error") && (
                  <Button
                    onClick={() => setLocation("/settings?section=security")}
                    className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/80 hover:to-violet-500 text-white border-0"
                  >
                    Go to Settings
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

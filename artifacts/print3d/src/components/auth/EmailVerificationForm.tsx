import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { authRequestEmailVerification } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock,
  Shield,
  ArrowRight
} from "lucide-react";

export function EmailVerificationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [isSent, setIsSent] = useState(false);

  const handleSendVerification = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await authRequestEmailVerification(email.trim());
      setIsSent(true);
      
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message || "We couldn't send the verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isSent) {
    return (
      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Email Sent Successfully
          </h3>
          <p className="text-zinc-300 mb-4">
            We've sent a verification link to <strong>{email}</strong>
          </p>
          <div className="p-3 bg-emerald-400/10 rounded-lg border border-emerald-400/30 mb-4">
            <div className="flex items-center gap-2 text-emerald-300 text-sm">
              <Mail className="w-4 h-4" />
              Check your inbox (and spam folder)
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            The link will expire in 24 hours
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-orange-500" />
          Verify Your Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-600/20 to-orange-500/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-zinc-300 mb-2">
            Verify your email to unlock all marketplace features
          </p>
          <p className="text-sm text-zinc-500">
            This helps us keep your account secure and enables seller features
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-zinc-700/50 border-zinc-600 text-white placeholder-zinc-500"
              disabled={isSending}
            />
          </div>

          <Button
            onClick={handleSendVerification}
            disabled={isSending || !email.trim()}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white border-0 h-11"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-zinc-300 border-t-transparent animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Verification Email
              </>
            )}
          </Button>
        </div>

        <div className="p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/50">
          <div className="flex items-start gap-2 text-zinc-400 text-sm">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p>• Verification links expire in 24 hours</p>
              <p>• Check your spam/junk folder if needed</p>
              <p>• Click the link in the email to complete verification</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

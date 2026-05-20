import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";

type StripeAccountStatus = {
  hasAccount: boolean;
  accountId?: string;
  status?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

const resolveApiUrl = () => {
  const rawApiUrl = String(import.meta.env.VITE_API_URL || "/api").trim();
  if (!rawApiUrl) return "/api";
  if (rawApiUrl.startsWith("http://") || rawApiUrl.startsWith("https://")) {
    return rawApiUrl.replace(/\/+$/, "");
  }
  return new URL(rawApiUrl.replace(/\/+$/, ""), window.location.origin).pathname;
};

const buildApiUrl = (path: string) => {
  const apiUrl = resolveApiUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${apiUrl}${normalizedPath}`, window.location.origin).href;
};

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return typeof window !== "undefined"
    ? session?.access_token || localStorage.getItem("authToken") || null
    : session?.access_token || null;
};

const fetchStripeOnboarding = async (path: string, init: RequestInit = {}) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || result?.message || "Failed to load Stripe onboarding status.");
  }

  return result;
};

export function StripeConnectOnboarding() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);

  useEffect(() => {
    if (user) {
      loadAccountStatus();
    }
  }, [user]);

  const loadAccountStatus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchStripeOnboarding("/stripe-connect/onboarding/status");
      setAccountStatus({
        hasAccount: result.hasAccount,
        accountId: result.accountId,
        status: result.status,
        detailsSubmitted: result.detailsSubmitted,
        chargesEnabled: result.chargesEnabled,
        payoutsEnabled: result.payoutsEnabled,
      });
    } catch (error: any) {
      console.error("Error loading account status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const startOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchStripeOnboarding("/stripe-connect/onboarding/start", {
        method: "POST",
      });
      window.location.href = result.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchStripeOnboarding("/stripe-connect/onboarding/refresh", {
        method: "POST",
      });
      window.location.href = result.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshStatus = useCallback(async () => {
    await loadAccountStatus();
    await refreshUser?.();
    toast({
      title: "Status updated",
      description: "Your account status has been refreshed.",
    });
  }, [loadAccountStatus, refreshUser, toast]);

  if (loading && !accountStatus) {
    return (
      <Card className="glass-panel border border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!accountStatus || !accountStatus.hasAccount) {
    return (
      <Card className="glass-panel border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Connect to Stripe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-400">
            Connect your Stripe Express account to start receiving payments for your products.
            You&apos;ll be redirected to Stripe to complete the onboarding process.
          </p>

          <Button
            onClick={startOnboarding}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Start Stripe Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = accountStatus.status === "active";
  const isPending = accountStatus.status === "pending";

  return (
    <Card className="glass-panel border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Stripe Connect Account</CardTitle>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
          >
            {isActive ? "Active" : accountStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Account ID</span>
            <span className="text-white font-medium text-sm">{accountStatus.accountId?.slice(0, 8)}...</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="text-white font-medium capitalize">{accountStatus.status}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Details Submitted</span>
            {accountStatus.detailsSubmitted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Charges Enabled</span>
            {accountStatus.chargesEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Payouts Enabled</span>
            {accountStatus.payoutsEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        {!isActive && (
          <Button
            onClick={refreshOnboarding}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {isPending ? "Complete Onboarding" : "Update Account Information"}
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}

        {isActive && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Your account is ready to receive payments
            </p>
          </div>
        )}

        <Button
          onClick={refreshStatus}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";

export function StripeConnectOnboarding() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadAccountStatus();
    }
  }, [user]);

  const loadAccountStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('stripe_connect_id, stripe_account_status')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error loading account status:', error);
        return;
      }

      if (data) {
        setAccountStatus({
          hasAccount: !!data.stripe_connect_id,
          accountId: data.stripe_connect_id,
          status: data.stripe_account_status,
        });
      }
    } catch (error: any) {
      console.error('Error loading account status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(
        `${apiUrl}/stripe-connect/onboarding/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start onboarding');
      }

      // Redirect to Stripe onboarding
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
  };

  const refreshOnboarding = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(
        `${apiUrl}/stripe-connect/onboarding/refresh`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to refresh onboarding');
      }

      // Redirect to Stripe onboarding
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
  };

  const refreshStatus = async () => {
    await loadAccountStatus();
    await refreshUser?.();
    toast({
      title: "Status updated",
      description: "Your account status has been refreshed.",
    });
  };

  if (loading && !accountStatus) {
    return (
      <Card className="glass-panel border border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // No account exists
  if (!accountStatus || !accountStatus.hasAccount) {
    return (
      <Card className="glass-panel border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Connect to Stripe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-400">
            Connect your Stripe Express account to start receiving payments for your products.
            You'll be redirected to Stripe to complete the onboarding process.
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

  // Account exists
  const isActive = accountStatus.status === 'active';
  const isPending = accountStatus.status === 'pending';
  const isRestricted = accountStatus.status === 'restricted';

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

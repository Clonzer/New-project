import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";

export function StripeConnectOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("us");

  useEffect(() => {
    if (user) {
      loadAccountStatus();
    }
  }, [user]);

  const loadAccountStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stripe_connected_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading account:', error);
      }

      if (data) {
        setAccountData(data);
        setDisplayName(data.display_name || "");
        setContactEmail(data.contact_email || "");
        setCountry(data.country || "us");
      }
    } catch (error) {
      console.error('Error loading account status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-connected-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName,
            contactEmail,
            country,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      toast({
        title: "Account created",
        description: "Your Stripe Connect account has been created successfully.",
      });

      await loadAccountStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-account-link`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account link');
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

  const refreshStatus = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-account-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get account status');
      }

      setAccountData({
        ...accountData,
        status: result.status,
        onboarding_complete: result.onboardingComplete,
        readyToReceivePayments: result.readyToReceivePayments,
        capabilities: result.capabilities,
      });

      toast({
        title: "Status updated",
        description: "Your account status has been refreshed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !accountData) {
    return (
      <Card className="glass-panel border border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!accountData) {
    return (
      <Card className="glass-panel border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Connect to Stripe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-400">
            Connect your Stripe account to start receiving payments for your products.
          </p>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your business name"
                className="bg-zinc-900/50 border-zinc-700"
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-zinc-900/50 border-zinc-700"
              />
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="us"
                className="bg-zinc-900/50 border-zinc-700"
              />
            </div>
          </div>

          <Button
            onClick={createAccount}
            disabled={loading || !displayName || !contactEmail}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Stripe Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Stripe Connect Account</CardTitle>
          <Badge variant={accountData.onboarding_complete ? "default" : "secondary"}>
            {accountData.onboarding_complete ? "Active" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="text-white font-medium">{accountData.status}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Onboarding Complete</span>
            {accountData.onboarding_complete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Ready to Receive Payments</span>
            {accountData.readyToReceivePayments ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        {!accountData.onboarding_complete && (
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
                Complete Onboarding
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
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
            "Refresh Status"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

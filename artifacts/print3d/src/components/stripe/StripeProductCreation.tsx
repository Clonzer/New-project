import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Package, DollarSign } from "lucide-react";

export function StripeProductCreation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("gbp");

  useEffect(() => {
    if (user) {
      loadAccountStatus();
    }
  }, [user]);

  const loadAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe-connect/onboarding/status', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load account status');
      }

      setAccountStatus(result);
    } catch (error: any) {
      console.error('Error loading account status:', error);
    }
  };

  const createProduct = async () => {
    if (!accountStatus?.hasAccount || accountStatus?.status !== 'active') {
      toast({
        title: "Account not ready",
        description: "Please complete Stripe onboarding before creating products",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const priceInCents = Math.round(parseFloat(price) * 100);

      const response = await fetch('/api/stripe-connect/products/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          priceInCents,
          currency,
          accountId: accountStatus.accountId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create product');
      }

      toast({
        title: "Product created",
        description: "Your Stripe product has been created successfully.",
      });

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!accountStatus?.hasAccount || accountStatus?.status !== 'active') {
    return (
      <Card className="glass-panel border border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-zinc-400">
            Complete Stripe onboarding to create products
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Create Stripe Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="3D Model - Custom Design"
              className="bg-zinc-900/50 border-zinc-700"
            />
          </div>
          
          <div>
            <Label htmlFor="productDescription">Description</Label>
            <Textarea
              id="productDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              className="bg-zinc-900/50 border-zinc-700"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="29.99"
                  className="bg-zinc-900/50 border-zinc-700 pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="gbp"
                className="bg-zinc-900/50 border-zinc-700"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={createProduct}
          disabled={loading || !name || !price}
          className="w-full bg-gradient-to-r from-primary to-accent"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

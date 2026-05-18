import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Store, User } from "lucide-react";

interface StripeProduct {
  id: string;
  stripe_product_id: string;
  stripe_price_id: string;
  user_id: string;
  stripe_account_id: string;
  name: string;
  description: string;
  default_price_amount: number;
  currency: string;
  active: boolean;
}

interface StripeAccount {
  id: string;
  user_id: string;
  stripe_account_id: string;
  display_name: string;
  onboarding_complete: boolean;
}

export default function StorefrontPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [accounts, setAccounts] = useState<StripeAccount[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all products
      const { data: productsData, error: productsError } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('active', true);

      if (productsError) {
        console.error('Error loading products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Note: Connected accounts are now managed via the users table and API server
      // The old stripe_connected_accounts table is no longer used
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const buyProduct = async (product: StripeProduct) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase products",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const response = await fetch('/api/payments/checkout-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftIds: [],
          customOrder: {
            productId: product.id,
            quantity: 1,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = result.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getSellerName = (accountId: string) => {
    // Since we removed the old accounts table, we'll just return a placeholder
    // In the future, this should fetch from the users table via the API
    return 'Seller';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            Stripe Storefront
          </h1>
          <p className="text-zinc-400">
            Browse and purchase products from sellers using Stripe Connect
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="glass-panel border border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400 text-lg">No products available yet</p>
              <p className="text-zinc-500 text-sm mt-2">
                Products will appear here once sellers create them
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="glass-panel border border-white/10 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {product.currency.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-400 text-sm line-clamp-2">
                    {product.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <User className="h-4 w-4" />
                    <span>{getSellerName(product.stripe_account_id)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(product.default_price_amount, product.currency)}
                    </div>
                    <Button
                      onClick={() => buyProduct(product)}
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

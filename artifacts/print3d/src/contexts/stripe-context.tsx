import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise, stripeAppearance } from "@/lib/stripe-client";

interface StripeContextType {
  clientSecret: string | null;
  setClientSecret: (secret: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  createPaymentIntent: (amount: number, metadata?: Record<string, string>) => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export function StripeProvider({ children }: { children: ReactNode }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async (amount: number, metadata?: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100), // Convert to cents
          metadata 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Stripe error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: StripeContextType = {
    clientSecret,
    setClientSecret,
    isLoading,
    setIsLoading,
    error,
    setError,
    createPaymentIntent,
  };

  return (
    <StripeContext.Provider value={value}>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
          {children}
        </Elements>
      ) : (
        children
      )}
    </StripeContext.Provider>
  );
}

export function useStripeContext() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error("useStripeContext must be used within a StripeProvider");
  }
  return context;
}

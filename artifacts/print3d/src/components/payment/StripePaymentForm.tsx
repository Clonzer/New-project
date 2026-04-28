import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StripePaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StripePaymentForm({ amount, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong with your payment.",
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast({
        title: "Payment successful!",
        description: `Your payment of $${(amount / 100).toFixed(2)} has been processed.`,
      });
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel rounded-2xl border border-white/10 p-6">
        <PaymentElement 
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export default StripePaymentForm;

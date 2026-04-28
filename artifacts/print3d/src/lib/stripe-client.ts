import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// Stripe appearance configuration
export const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#18181b",
    colorText: "#fafafa",
    colorDanger: "#ef4444",
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
};

// Stripe elements options
export const getStripeElementsOptions = (clientSecret: string) => ({
  clientSecret,
  appearance: stripeAppearance,
});

// Helper to format amount for Stripe (converts dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper to format amount from Stripe (converts cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

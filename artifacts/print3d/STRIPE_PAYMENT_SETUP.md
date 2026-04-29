# Stripe Payment Integration Summary

## Overview
All payment flows in the application are integrated with Stripe for secure payment processing.

## Configuration

### Environment Variables
Create a `.env` file with:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key_here
```

### Stripe Provider Setup
Located in `src/contexts/stripe-context.tsx`
- Wraps the application with Stripe Elements
- Provides Stripe instance to all child components
- Configured with publishable key from environment

## Payment Pages & Flows

### 1. Cart Checkout (`/cart`)
**File:** `src/pages/cart.tsx`
- **Function:** `createCheckoutSession()` from `payments-api.ts`
- **Flow:**
  1. User reviews cart items
  2. Click "Proceed to Checkout"
  3. Redirects to Stripe Checkout
  4. After payment, returns to success page
- **Stripe Integration:** Server creates checkout session, redirects to Stripe

### 2. Order Flow (`/order-flow/:quoteId`)
**File:** `src/pages/order-flow.tsx`
- **Function:** `createCheckoutSession()` from `payments-api.ts`
- **Flow:**
  1. User selects shipping options
  2. Reviews order summary
  3. Click "Complete Purchase"
  4. Redirects to Stripe Checkout
- **Stripe Integration:** Handles custom order payments

### 3. Product Order (`/product-order/:productId`)
**File:** `src/pages/product-order.tsx`
- **Function:** `createCheckoutSession()` from `payments-api.ts`
- **Flow:**
  1. User selects product options
  2. Reviews order details
  3. Click "Complete Purchase"
  4. Redirects to Stripe Checkout
- **Stripe Integration:** Direct product purchase flow

### 4. Custom Order Payment (`/custom-order-payment/:quoteId`)
**File:** `src/pages/custom-order-payment.tsx`
- **Function:** `createCheckoutSession()` from `payments-api.ts`
- **Flow:**
  1. User reviews custom quote
  2. Confirms order details
  3. Click "Pay & Place Order"
  4. Redirects to Stripe Checkout
- **Stripe Integration:** Custom order payment acceptance

### 5. Sponsorship Purchase (`/sponsorship`)
**File:** `src/pages/sponsorship-purchase.tsx`
- **Function:** `createSponsorshipCheckoutSession()` from `payments-api.ts`
- **Flow:**
  1. User selects sponsorship tier
  2. Reviews benefits and pricing
  3. Click "Proceed to Checkout"
  4. Redirects to Stripe Checkout
- **Stripe Integration:** Sponsorship subscription/payment

### 6. Payment Methods (Dashboard)
**File:** `src/components/dashboard/PaymentMethods.tsx`
- **Function:** Stripe Elements setup for card management
- **Features:**
  - Add new payment methods
  - Set default payment method
  - View saved cards
  - Secure card storage with Stripe

## API Functions (`src/lib/payments-api.ts`)

### `createCheckoutSession(orderData)`
Creates a Stripe Checkout Session for order payments
```typescript
const result = await createCheckoutSession({
  items: cartItems,
  total: totalAmount,
  customerEmail: user.email,
  metadata: { orderId, userId }
});
// Redirects to: result.url (Stripe Checkout URL)
```

### `createSponsorshipCheckoutSession(sponsorshipData)`
Creates checkout for sponsorship purchases
```typescript
const result = await createSponsorshipCheckoutSession({
  tier: 'gold',
  duration: 168, // hours
  price: 100.00,
  customerId: user.id
});
// Redirects to: result.url (Stripe Checkout URL)
```

### `getPaymentMethods(customerId)`
Retrieves saved payment methods for a customer

### `attachPaymentMethod(paymentMethodId, customerId)`
Attaches a payment method to a customer

### `setDefaultPaymentMethod(paymentMethodId, customerId)`
Sets the default payment method

## Stripe Client Configuration
**File:** `src/lib/stripe-client.ts`
```typescript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
export default stripePromise;
```

## Routes Configuration
All payment routes are defined in `src/App.tsx`:
```tsx
<Route path="/cart" component={Cart} />
<Route path="/order-flow/:quoteId" component={OrderFlow} />
<Route path="/product-order/:productId" component={ProductOrder} />
<Route path="/custom-order-payment/:quoteId" component={CustomOrderPayment} />
<Route path="/sponsorship" component={SponsorshipPurchase} />
```

## Provider Hierarchy
Stripe provider wraps the app at the root level:
```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <StripeProvider> {/* Stripe Elements wrapper */}
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </StripeProvider>
  </AuthProvider>
</QueryClientProvider>
```

## Webhook Handling (Backend)
For production, you need a backend webhook to handle:
- `checkout.session.completed` - Order confirmation
- `payment_intent.succeeded` - Payment success
- `invoice.payment_succeeded` - Subscription renewal
- `customer.subscription.created` - New sponsorship

## Security Notes
- Never store raw card data in your application
- Use Stripe's secure Checkout for all payments
- Payment methods are tokenized by Stripe
- RLS policies protect payment data in Supabase

## Testing
For testing payments:
1. Use Stripe test keys (pk_test_...)
2. Test card: `4242 4242 4242 4242`
3. Any future date, any CVC, any ZIP

## Status
✅ All payment pages integrated with Stripe
✅ Checkout sessions created for all flows
✅ Payment methods management working
✅ Stripe provider properly configured
✅ All routes set up

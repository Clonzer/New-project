# Synthix Email Templates

This directory contains professional, dark-themed email templates for the Synthix 3D printing marketplace.

## Templates Overview

### 1. `new-quote-email.html`
**Use Case:** Sent to buyers when a seller submits a quote on their custom order request.

**Variables:**
- `{{buyerName}}` - Name of the buyer
- `{{sellerName}}` - Name of the seller who quoted
- `{{sellerInitials}}` - Initials for avatar display
- `{{quotePrice}}` - The quoted price amount
- `{{quoteMessage}}` - Personal message from the seller
- `{{projectTitle}}` - Title of the service request
- `{{material}}` - Material requested
- `{{color}}` - Color requested
- `{{quantity}}` - Quantity requested
- `{{quoteLink}}` - Link to view/accept the quote

**Features:**
- Seller info card with avatar and rating
- Prominent price display with gradient styling
- Quote message highlight box
- Request details summary
- Clear CTA button
- 7-day expiration reminder

---

### 2. `welcome-email.html`
**Use Case:** Sent to new users after they complete registration.

**Variables:**
- `{{userName}}` - Name of the new user
- `{{dashboardLink}}` - Link to user dashboard
- `{{helpLink}}` - Link to help center
- `{{unsubscribeLink}}` - Unsubscribe link
- `{{privacyLink}}` - Privacy policy link

**Features:**
- Warm welcome greeting
- 3-column feature showcase (Browse, Request, Sell)
- Gradient styling matching site theme
- Dashboard CTA button
- Help center link

---

### 3. `order-confirmation.html`
**Use Case:** Sent to buyers after they successfully place an order.

**Variables:**
- `{{buyerName}}` - Name of the buyer
- `{{orderNumber}}` - Unique order number
- `{{orderDate}}` - Date of order
- `{{productName}}` - Name of product ordered
- `{{material}}` - Material of product
- `{{color}}` - Color of product
- `{{sellerName}}` - Name of seller
- `{{subtotal}}` - Order subtotal
- `{{shipping}}` - Shipping cost
- `{{tax}}` - Tax amount
- `{{total}}` - Total order amount
- `{{addressLine1}}` - Shipping address line 1
- `{{addressLine2}}` - Shipping address line 2 (optional)
- `{{city}}` - City
- `{{postcode}}` - Postcode/ZIP
- `{{country}}` - Country
- `{{orderLink}}` - Link to track order

**Features:**
- Success badge with checkmark
- Order summary card with product details
- Price breakdown (subtotal, shipping, tax, total)
- Shipping address display
- Visual order timeline (4 steps)
- Track order CTA button

---

### 4. `quote-accepted.html`
**Use Case:** Sent to sellers when a buyer accepts their quote.

**Variables:**
- `{{sellerName}}` - Name of the seller
- `{{completionPercentage}}` - Progress toward next milestone
- `{{projectTitle}}` - Title of the project
- `{{requestNumber}}` - Service request number
- `{{buyerInitials}}` - Buyer's initials for avatar
- `{{buyerName}}` - Name of the buyer
- `{{material}}` - Material requested
- `{{color}}` - Color requested
- `{{quantity}}` - Quantity requested
- `{{quotePrice}}` - Accepted quote price
- `{{dueDate}}` - Expected completion date
- `{{orderLink}}` - Link to order details

**Features:**
- Celebration messaging with confetti emoji
- Job secured notification box
- Buyer information with avatar
- Project specifications
- Deadline countdown
- Seller pro tips section
- Order details CTA button

---

### 5. `order-shipped.html`
**Use Case:** Sent to buyers when their order is marked as shipped by the seller.

**Variables:**
- `{{buyerName}}` - Name of the buyer
- `{{trackingNumber}}` - Shipping tracking number
- `{{carrierName}}` - Shipping carrier (USPS, UPS, FedEx, etc.)
- `{{productName}}` - Name of the product
- `{{orderNumber}}` - Order number
- `{{sellerName}}` - Name of the seller
- `{{deliveryDate}}` - Estimated delivery date
- `{{deliveryTimeRange}}` - Delivery time window
- `{{trackingLink}}` - Link to track the package

**Features:**
- Large tracking number display
- Carrier badge
- Product and seller information
- Estimated delivery date
- Delivery tips section
- Track package CTA button

---

### 6. `password-reset.html`
**Use Case:** Sent when users request a password reset.

**Variables:**
- `{{userName}}` - Name of the user
- `{{resetLink}}` - Password reset link

**Features:**
- Security-themed design (amber/orange)
- 60-minute expiry notice
- Security tips section
- Reset password CTA button
- Fallback link for email client issues
- "Didn't request this?" reassurance

---

### 7. `review-request.html`
**Use Case:** Sent to buyers a few days after delivery to request a review.

**Variables:**
- `{{buyerName}}` - Name of the buyer
- `{{sellerName}}` - Name of the seller
- `{{daysAgo}}` - How many days since delivery
- `{{productName}}` - Name of the product
- `{{orderNumber}}` - Order number
- `{{deliveryDate}}` - Date of delivery
- `{{sellerInitials}}` - Seller initials for avatar
- `{{sellerRating}}` - Seller's rating
- `{{sellerReviews}}` - Number of seller reviews
- `{{reviewLink}}` - Link to leave a review
- `{{orderLink}}` - Link to view order

**Features:**
- Interactive star rating display
- Product and seller info card
- Impact message explaining why reviews matter
- Leave review CTA with gold gradient
- Secondary view order button

---

### 8. `seller-payout.html`
**Use Case:** Sent to sellers when their earnings are paid out.

**Variables:**
- `{{sellerName}}` - Name of the seller
- `{{payoutAmount}}` - Amount paid out
- `{{totalSales}}` - Total number of sales
- `{{totalEarnings}}` - All-time earnings
- `{{sellerRating}}` - Seller rating
- `{{payoutId}}` - Payout reference ID
- `{{startDate}}` - Payout period start
- `{{endDate}}` - Payout period end
- `{{orderCount}}` - Number of orders in period
- `{{grossSales}}` - Gross sales amount
- `{{feePercentage}}` - Platform fee percentage
- `{{platformFee}}` - Platform fee amount
- `{{paymentMethod}}` - Payment method used
- `{{processedDate}}` - Date payout was processed
- `{{earningsLink}}` - Link to earnings dashboard

**Features:**
- Large payout amount display (green gradient)
- Sales statistics (3-column grid)
- Detailed breakdown card
- Payout summary with fees
- Next steps section
- Earnings dashboard CTA

---

### 9. `email-verification.html`
**Use Case:** Sent to new users to verify their email address.

**Variables:**
- `{{userName}}` - Name of the user
- `{{verificationLink}}` - Email verification link

**Features:**
- Cyan-themed design
- 24-hour expiry notice
- Benefits showcase (3 items with icons)
- Verify email CTA button
- Fallback link
- Security reassurance

---

## Design System

All templates follow the Synthix dark theme:

### Colors
- **Background:** `#0a0a0a` to `#111111` gradient
- **Primary Accent:** `#8b5cf6` (violet/purple)
- **Secondary Accent:** `#06b6d4` (cyan)
- **Success:** `#10b981` (emerald green)
- **Text Primary:** `#ffffff`
- **Text Secondary:** `#e4e4e7`
- **Text Muted:** `#a1a1aa` and `#71717a`

### Typography
- **Font:** Inter (Google Fonts)
- **Headers:** Bold, gradient text effects
- **Body:** 14-15px, comfortable line height (1.6-1.8)

### Components
- **Cards:** `border-radius: 16px`, semi-transparent backgrounds with border
- **Buttons:** Gradient backgrounds, `border-radius: 12px`, shadow effects
- **Badges:** Pill-shaped with gradient backgrounds
- **Icons:** Emoji-based for email client compatibility

### Responsive Design
- Max-width: 600px (optimal for email clients)
- Mobile breakpoints at 600px
- Flexible layouts using flexbox and CSS grid

---

## Implementation Notes

### Using with Supabase/Resend/Email Services
These templates can be used with any email service. Example with Resend:

```javascript
import { Resend } from 'resend';

const resend = new Resend('your_api_key');

await resend.emails.send({
  from: 'Synthix <notifications@synthixgroup.co.uk>',
  to: buyerEmail,
  subject: 'New Quote Received for Your Custom Order',
  html: newQuoteEmailTemplate
    .replace('{{buyerName}}', buyerName)
    .replace('{{sellerName}}', sellerName)
    .replace('{{quotePrice}}', quotePrice)
    // ... replace other variables
});
```

### Testing
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Use Litmus or Email on Acid for comprehensive testing
- Inline CSS is included for maximum compatibility

### Customization
All templates use template variables (e.g., `{{variableName}}`) that should be replaced server-side before sending. The templates are pure HTML/CSS with no JavaScript dependencies.

---

## Future Templates to Consider

1. **Order Delivered** - When order is delivered (with delivery confirmation)
2. **Promotional/Newsletter** - Monthly updates to users about new features
3. **Abandoned Cart** - Reminder for items left in cart
4. **Low Stock Alert** - For sellers when items are running low
5. **Account Security** - Login from new device notifications
6. **Quote Expiring** - Reminder that a quote is about to expire
7. **New Message** - When someone sends a direct message
8. **Seller Onboarding** - Step-by-step guide for new sellers
9. **Payment Failed** - When a payment method needs updating
10. **Subscription Renewal** - For subscription-based features

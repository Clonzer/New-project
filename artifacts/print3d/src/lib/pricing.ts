/**
 * Centralized pricing calculations for consistency across the application
 */

export interface PricingInput {
  basePrice?: number | null;
  price?: number | null;
  base_price?: number | null;
  shippingCost?: number | null;
  shipping_cost?: number | null;
  quantity?: number;
}

/**
 * Platform fee percentage (10%)
 */
export const PLATFORM_FEE_PERCENTAGE = 0.10;

/**
 * Fixed fee amount (for payment processing)
 */
export const FIXED_FEE_AMOUNT = 1.00;

/**
 * Get the base price from various possible field names
 */
export function getBasePrice(input: PricingInput): number {
  return input.basePrice ?? input.price ?? input.base_price ?? 0;
}

/**
 * Get the shipping cost from various possible field names
 */
export function getShippingCost(input: PricingInput): number {
  return input.shippingCost ?? input.shipping_cost ?? 0;
}

/**
 * Calculate the subtotal (base price × quantity)
 */
export function calculateSubtotal(input: PricingInput): number {
  const basePrice = getBasePrice(input);
  const quantity = input.quantity ?? 1;
  return basePrice * quantity;
}

/**
 * Calculate the platform fee (10% of subtotal)
 */
export function calculatePlatformFee(input: PricingInput): number {
  const subtotal = calculateSubtotal(input);
  return subtotal * PLATFORM_FEE_PERCENTAGE;
}

/**
 * Calculate the total price including platform fee and shipping
 */
export function calculateTotal(input: PricingInput): number {
  const subtotal = calculateSubtotal(input);
  const platformFee = calculatePlatformFee(input);
  const shippingCost = getShippingCost(input);
  const quantity = input.quantity ?? 1;
  
  return subtotal + platformFee + (shippingCost * quantity);
}

/**
 * Calculate the price per unit including platform fee (for display)
 * This is what the customer actually pays per item
 */
export function calculatePricePerUnit(input: PricingInput): number {
  const basePrice = getBasePrice(input);
  const platformFee = basePrice * PLATFORM_FEE_PERCENTAGE;
  return basePrice + platformFee;
}

/**
 * Calculate the final price with all fees (for checkout display)
 * Formula: (basePrice × 1.10) + fixed fee
 */
export function calculateFinalPrice(input: PricingInput): number {
  const basePrice = getBasePrice(input);
  const quantity = input.quantity ?? 1;
  const priceWithFee = (basePrice * 1.10) + FIXED_FEE_AMOUNT;
  return priceWithFee * quantity;
}

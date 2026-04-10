// Mock for @workspace/api-client-react to enable building on Render

export type SellerShop = {
  id: string;
  displayName: string;
  username: string;
  shopName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  shopMode: 'catalog' | 'custom' | 'both';
  printerCount: number;
  listingCount: number;
  totalPrints: number;
  reviewCount: number;
};

export type Listing = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  shippingCost: number | null;
  material: string | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  category: string;
  tags: string[] | null;
  sellerId: string;
  sellerName: string;
  orderCount: number;
  stockQuantity?: number;
  trackStock?: boolean;
};

export type CreateUserRequestRole = 'admin' | 'user' | 'seller';

// Empty hooks that return empty data
export function useListSellers(options: { limit?: number }) {
  return {
    data: { sellers: [], total: 0 },
    isLoading: false,
    error: null,
  };
}

export function useListListings(options: { limit?: number }) {
  return {
    data: { listings: [], total: 0 },
    isLoading: false,
    error: null,
  };
}

export function useAuth() {
  return {
    user: null,
    isLoading: false,
    error: null,
  };
}

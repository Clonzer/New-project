// Mock for @workspace/api-client-react to enable building on Render
import { listSellers, listListings } from './supabase-api';

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

export type Equipment = {
  id: string;
  name: string;
  type: string;
  status: string;
};

export type EquipmentGroup = {
  id: string;
  name: string;
  equipment: Equipment[];
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

export type User = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: CreateUserRequestRole;
  createdAt: string;
  updatedAt: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Mock customFetch function
export async function customFetch<T>(
  url: string,
  options?: RequestInit & { skipAuth?: boolean; credentials?: RequestCredentials }
): Promise<T> {
  console.warn(`[MOCK] customFetch called for ${url} - returning empty response`);
  return {} as T;
}

// Hooks that use Supabase API
export function useListSellers(options: { limit?: number }) {
  const { limit = 10 } = options;
  
  // This is a simple synchronous wrapper - in a real app you'd use React Query
  // For now, return empty data and let components fetch directly
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

export function useGetUser(userId: string) {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListPrinters(userId: string) {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function useListReviews(listingId: number) {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function useUpdateUser() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useGetListing(listingId: number) {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useCreatePrinter() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useListUsers() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function getGetListingQueryKey(listingId: number) {
  return ['listing', listingId];
}

export function getGetUserQueryKey(userId: string) {
  return ['user', userId];
}

export function useUpdateListing() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useCreateListing() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useCreateQuoteRequest() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useListEquipment() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function useListEquipmentGroups() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export async function createUser(data: any) {
  console.warn('[MOCK] createUser called - returning empty response');
  return {} as User;
}

export function setStoredAccessToken(token: string | null) {
  console.warn('[MOCK] setStoredAccessToken called - no-op');
}

export function useListOrders() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function useUpdateOrderStatus() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useUpdatePrinter() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useDeletePrinter() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function getListOrdersQueryKey() {
  return ['orders'];
}

export function getListListingsQueryKey() {
  return ['listings'];
}

export function getListPrintersQueryKey() {
  return ['printers'];
}

export function getListReviewsQueryKey() {
  return ['reviews'];
}

export function useCreateEquipmentGroup() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useUpdateEquipmentGroup() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useDeleteEquipmentGroup() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

export function useDeleteListing() {
  return {
    mutateAsync: async () => ({}),
    isPending: false,
  };
}

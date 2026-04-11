// Stub for @workspace/api-client-react compatibility
// This allows the app to run while we migrate to Supabase

import { supabase } from "./supabase";

// Error class for API errors
export class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export type User = {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  name?: string;
  avatar?: string;
  isVerified: boolean;
  stripeConnectAccountId?: string;
  stripeConnectEnabled?: boolean;
  isSponsored?: boolean;
  planTier?: 'none' | 'basic' | 'pro' | 'enterprise';
};

// Storage helpers for auth tokens
export function setStoredAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem('access_token');
}

export async function customFetch<T>(url: string, options?: RequestInit & { skipAuth?: boolean }): Promise<T> {
  // For now, return mock data or use Supabase
  // This is a temporary stub to get the app running
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Export hooks that the old API provided
export function useListings() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

// Base mutation return type with all required properties
type MutationReturn<T = any> = {
  mutate: (vars?: T) => Promise<void>;
  mutateAsync: (vars?: T) => Promise<any>;
  isLoading: boolean;
  isPending: boolean;
  error: null;
};

export function useCreateListing(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateListing(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useDeleteListing(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreatePrinter(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useDeletePrinter(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateUser(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useListUsers() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListListings() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListSellers() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetUser() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetListing() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetCart() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetOrders() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListOrders() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetMessages() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetNotifications() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetPrinters() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListPrinters() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetPortfolio() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetReviews() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListReviews() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetFavorites() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetShop() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

// Mutations
export function useAddToCart(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useRemoveFromCart(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreateOrder(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useSendMessage(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreateReview(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCreateEquipmentGroup(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useDeleteEquipmentGroup(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useListEquipmentGroups() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useUpdateEquipmentGroup(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdatePrinter(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useGetPrinter() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useListSponsoredShops() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useCreateSponsoredShop(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateListingStatus(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdatePrinterStatus(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateOrderStatus(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useCancelOrder(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useMarkOrderShipped(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useMarkOrderDelivered(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useListEquipment() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useGetEquipment() {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

export function useCreateEquipment(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useUpdateEquipment(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export function useDeleteEquipment(): MutationReturn {
  return {
    mutate: async () => {},
    mutateAsync: async () => ({}),
    isLoading: false,
    isPending: false,
    error: null,
  };
}

export type CreateUserRequestRole = 'buyer' | 'seller' | 'both';

// Query key helpers for React Query
export function getGetListingQueryKey(listingId: string | number) {
  return ['listings', listingId];
}

export function getGetUserQueryKey(userId: string | number) {
  return ['users', userId];
}

export function getListListingsQueryKey() {
  return ['listings'];
}

export function getListUsersQueryKey() {
  return ['users'];
}

export function getListOrdersQueryKey() {
  return ['orders'];
}

export function getListPrintersQueryKey() {
  return ['printers'];
}

export function getGetPrinterQueryKey(printerId: string | number) {
  return ['printers', printerId];
}

export function getGetOrdersQueryKey() {
  return ['orders'];
}

export function getListPortfolioQueryKey(userId: string | number) {
  return ['portfolio', userId];
}

export function getListReviewsQueryKey(userId: string | number) {
  return ['reviews', userId];
}

export function getGetCartQueryKey() {
  return ['cart'];
}

export function getGetMessagesQueryKey() {
  return ['messages'];
}

export function getGetNotificationsQueryKey() {
  return ['notifications'];
}

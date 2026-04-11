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

// Mock sellers data
const mockSellers: SellerShop[] = [
  {
    id: '1',
    displayName: 'John Doe',
    username: 'johndoe',
    shopName: 'John\'s 3D Prints',
    avatarUrl: null,
    bio: 'Professional 3D printing service',
    location: 'New York, USA',
    shopMode: 'catalog',
    printerCount: 5,
    listingCount: 25,
    totalPrints: 1500,
    reviewCount: 45,
  },
  {
    id: '2',
    displayName: 'Jane Smith',
    username: 'janesmith',
    shopName: 'Jane\'s Creations',
    avatarUrl: null,
    bio: 'Custom 3D models and prints',
    location: 'London, UK',
    shopMode: 'custom',
    printerCount: 3,
    listingCount: 15,
    totalPrints: 800,
    reviewCount: 32,
  },
  {
    id: '3',
    displayName: 'Bob Wilson',
    username: 'bobwilson',
    shopName: 'Bob\'s Workshop',
    avatarUrl: null,
    bio: 'Industrial 3D printing',
    location: 'Berlin, Germany',
    shopMode: 'both',
    printerCount: 8,
    listingCount: 40,
    totalPrints: 2500,
    reviewCount: 78,
  },
];

// Mock listings data
const mockListings: Listing[] = [
  {
    id: 1,
    title: 'Custom Phone Case',
    description: 'Personalized phone case with your design',
    imageUrl: null,
    basePrice: 25,
    shippingCost: 5,
    material: 'PLA',
    estimatedDaysMin: 2,
    estimatedDaysMax: 5,
    category: 'accessories',
    tags: ['phone', 'case', 'custom'],
    sellerId: '1',
    sellerName: 'John\'s 3D Prints',
    orderCount: 45,
    stockQuantity: 100,
    trackStock: true,
  },
  {
    id: 2,
    title: 'Miniature Figure',
    description: 'Detailed miniature for tabletop gaming',
    imageUrl: null,
    basePrice: 15,
    shippingCost: 3,
    material: 'Resin',
    estimatedDaysMin: 3,
    estimatedDaysMax: 7,
    category: 'figures',
    tags: ['miniature', 'gaming', 'resin'],
    sellerId: '2',
    sellerName: 'Jane\'s Creations',
    orderCount: 32,
    stockQuantity: 50,
    trackStock: true,
  },
  {
    id: 3,
    title: 'Mechanical Part',
    description: 'Custom mechanical component for your project',
    imageUrl: null,
    basePrice: 50,
    shippingCost: 10,
    material: 'ABS',
    estimatedDaysMin: 5,
    estimatedDaysMax: 10,
    category: 'parts',
    tags: ['mechanical', 'industrial', 'custom'],
    sellerId: '3',
    sellerName: 'Bob\'s Workshop',
    orderCount: 78,
    stockQuantity: 25,
    trackStock: true,
  },
];

// Hooks that use mock data (will switch to Supabase when configured)
export function useListSellers(options: { limit?: number }) {
  const { limit = 10 } = options;
  
  return {
    data: { 
      sellers: mockSellers.slice(0, limit), 
      total: mockSellers.length 
    },
    isLoading: false,
    error: null,
  };
}

export function useListListings(options: { limit?: number }) {
  const { limit = 10 } = options;
  
  return {
    data: { 
      listings: mockListings.slice(0, limit), 
      total: mockListings.length 
    },
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

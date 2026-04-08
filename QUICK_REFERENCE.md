# Quick Reference: File Locations & Key Code Sections

## Profile Management

### User Profile Display
- **File**: [artifacts/print3d/src/components/shared/SellerCard.tsx](artifacts/print3d/src/components/shared/SellerCard.tsx)
- **Key Identifiers**: `seller.id`, `seller.shopName`, `seller.displayName`
- **Data Fields**: avatarUrl, location, rating, reviewCount, shopMode, sellerTags, totalPrints, printerCount
- **Navigation**: Click → `/shop/{seller.id}`

### Full Shop Profile Page
- **File**: [artifacts/print3d/src/pages/shop.tsx](artifacts/print3d/src/pages/shop.tsx)
- **Route**: `/shop/:id`
- **API Calls**:
  ```typescript
  useGetUser(shopId)  // Full profile + listings + printers + reviews
  useListPrinters({ userId: shopId })
  useListListings({ sellerId: shopId })
  useListReviews({ revieweeId: shopId })
  ```

### Profile Settings/Editing
- **File**: [artifacts/print3d/src/pages/settings.tsx](artifacts/print3d/src/pages/settings.tsx)
- **Route**: `/settings?section=profile` (sections: profile, storefront, shipping, policies, payment, etc.)
- **API Call**: `useUpdateUser()` mutation
- **Editable Fields**: displayName, shopName, bio, avatarUrl, bannerUrl, shopMode, sellerTags, shipping settings, policies

---

## Posts/Listings Display

### Listing Card Component
- **File**: [artifacts/print3d/src/components/shared/ListingCard.tsx](artifacts/print3d/src/components/shared/ListingCard.tsx)
- **Data Type**: `Listing` from generated API
- **Key Fields**: id, title, basePrice, sellerId, sellerName, category, imageUrl, estimatedDaysMin/Max, tags, orderCount
- **Link to Seller**: `listing.sellerId` → `/shop/{listing.sellerId}`

### Browse All Listings
- **File**: [artifacts/print3d/src/pages/listings.tsx](artifacts/print3d/src/pages/listings.tsx)
- **Route**: `/listings`
- **API Call**: `useListListings({ limit: 50 })`
- **Filters**: Search text, category, max price

### Create/Edit Listing
- **File**: [artifacts/print3d/src/pages/create-listing.tsx](artifacts/print3d/src/pages/create-listing.tsx), [edit-listing.tsx](artifacts/print3d/src/pages/edit-listing.tsx)
- **Routes**: `/create-listing`, `/edit-listing/:id`
- **API Calls**: `useCreateListing()`, `useUpdateListing()`

---

## Shop Discovery & Listing

### Explore/Discovery Hub
- **File**: [artifacts/print3d/src/pages/explore.tsx](artifacts/print3d/src/pages/explore.tsx)
- **Route**: `/explore`
- **Sections**:
  - Featured Shops Carousel (useListSellers)
  - Sponsored Shops
  - Latest Listings (useListListings)
- **Filters**: Search (name/shop/location/tags), location, shop mode (catalog/open), verified-only

### Shop Visibility - Backend Query
- **File**: [artifacts/api-server/src/routes/sellers.ts](artifacts/api-server/src/routes/sellers.ts)
- **Endpoint**: `GET /sellers?limit=20&offset=0`
- **Visibility Logic**:
  - Only shows users with `role IN ('seller', 'both')`
  - Orders by: `rating DESC, reviewCount DESC, totalPrints DESC`
  - Enriches with: printerCount (from printers table), listingCount (from listings table)

### Shop Data Fields for Identification
- **Primary ID**: `id` (integer)
- **Display Names**: `shopName` (official shop name) or `displayName` (fallback)
- **Shop Type**: `shopMode` ('catalog', 'open', 'both')
- **Verification**: `emailVerifiedAt` (null = unverified)
- **Capabilities**: `sellerTags` array (e.g., "FDM 3D Printing", "Custom Jobs", etc.)
- **Quality**: `rating`, `reviewCount`, `totalPrints` (proxy for reliability)

### Shop Comparison Feature
- **File**: [artifacts/print3d/src/lib/shop-compare.ts](artifacts/print3d/src/lib/shop-compare.ts)
- **Route**: `/compare-shops`
- **Functions**: `isComparedShop(id)`, `toggleComparedShop(shop)`
- **Storage**: Persisted in localStorage

---

## Backend API Endpoints

### Get Single Shop Profile
- **Endpoint**: `GET /users/:userId`
- **File**: [artifacts/api-server/src/routes/users.ts](artifacts/api-server/src/routes/users.ts)
- **Returns**: `UserDetail` with:
  - Basic user fields (id, displayName, shopName, bio, avatarUrl, etc.)
  - `printers[]` - Equipment list
  - `listings[]` - First 10 listings
  - `recentReviews[]` - First 5 reviews
  - `portfolio[]` - Portfolio items

### List Sellers/Shops
- **Endpoint**: `GET /sellers?limit=20&offset=0`
- **File**: [artifacts/api-server/src/routes/sellers.ts](artifacts/api-server/src/routes/sellers.ts)
- **Returns**: Array of `SellerShop` objects with enriched counts

### List Listings
- **Endpoint**: `GET /listings?limit=20&offset=0&sellerId={id}&category={cat}`
- **File**: [artifacts/api-server/src/routes/listings.ts](artifacts/api-server/src/routes/listings.ts)
- **Returns**: Array of `Listing` objects (with sellerName joined from users table)

### Create Listing
- **Endpoint**: `POST /listings`
- **File**: [artifacts/api-server/src/routes/listings.ts](artifacts/api-server/src/routes/listings.ts)
- **Required Fields**: sellerId, title, category, tags, basePrice, estimatedDaysMin, estimatedDaysMax
- **Returns**: Created `Listing`

---

## Database Schema

### Users Table
- **File**: [lib/db/src/schema/users.ts](lib/db/src/schema/users.ts)
- **Key Fields**:
  - `id` (PK), `username`, `displayName`, `email`
  - `shopName`, `shopMode` (enum: catalog/open/both)
  - `bio`, `avatarUrl`, `bannerUrl`, `location`
  - `rating`, `reviewCount`, `totalPrints`, `totalOrders`
  - `sellerTags` (text array)
  - 40+ profile fields (shipping, policies, etc.)
  - `emailVerifiedAt` (timestamp, nullable)

### Listings Table
- **File**: [lib/db/src/schema/listings.ts](lib/db/src/schema/listings.ts)
- **Key Fields**:
  - `id` (PK), `sellerId` (FK→users.id), `title`
  - `category`, `tags` (text array), `basePrice`, `shippingCost`
  - `estimatedDaysMin`, `estimatedDaysMax`
  - `imageUrl`, `description`
  - `isActive` (visibility flag)
  - `stockType` (enum: inventory/print_on_demand/digital)
  - `orderCount`, `createdAt`

### Printers Table (Equipment)
- **File**: [lib/db/src/schema/printers.ts](lib/db/src/schema/printers.ts)
- **Key Fields**:
  - `id` (PK), `userId` (FK→users.id)
  - `name`, `technology` (FDM/SLA/SLS/etc.)
  - `brand`, `model`, `materials` (array)
  - `isActive`, `totalJobsCompleted`

---

## Generated API Client

**File**: [lib/api-client-react/src/generated/api.ts](lib/api-client-react/src/generated/api.ts)

All hooks use React Query. Examples:

```typescript
// Get shop profile + related data
const { data: user } = useGetUser(shopId);

// List all sellers with shop info
const { data } = useListSellers({ limit: 50 });

// List listings (optionally filter by seller)
const { data } = useListListings({ sellerId: shopId, limit: 20 });

// Get listings for a shop
const { data: listingsData } = useListListings({ sellerId: shopId });

// Get reviews of a seller
const { data: reviewsData } = useListReviews({ revieweeId: shopId });

// Get equipment of a seller
const { data: printersData } = useListPrinters({ userId: shopId });

// Update user profile
const { mutateAsync: updateUser } = useUpdateUser();
await updateUser({ userId, data: { shopName: "New Name", ... } });

// Create listing
const { mutateAsync: createListing } = useCreateListing();
await createListing({ data: { sellerId, title, ... } });
```

---

## Key Configuration Files

- **API Spec**: [lib/api-spec/openapi.yaml](lib/api-spec/openapi.yaml) - OpenAPI 3.1 definition
- **API Orval Config**: [lib/api-spec/orval.config.ts](lib/api-spec/orval.config.ts) - Generates React Query hooks from spec
- **Shop Tags Options**: [artifacts/print3d/src/lib/shop-tags.ts](artifacts/print3d/src/lib/shop-tags.ts) - Capability tags used in filters and profile
- **Locale Preferences**: [artifacts/print3d/src/lib/locale-preferences.ts](artifacts/print3d/src/lib/locale-preferences.ts) - Currency/language formatting

---

## Role-Based Data Filter

All profile visibility controlled by:
- **User `role` field**: enum(buyer, seller, both)
- **Backend filters** (sellers.ts): Only returns users with role IN ('seller', 'both')
- **Email verification**: `emailVerifiedAt` timestamp (can be null)
- **Shop mode**: Determines if catalog/custom jobs available


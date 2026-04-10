# Codebase Structure: User Profiles, Posts, and Shop Management

## Overview
This 3D Print Marketplace uses a React frontend with TypeScript, consuming generated API clients from an OpenAPI spec. The backend is Express.js with Drizzle ORM connecting to PostgreSQL.

---

## 1. PROFILE CARD & PROFILE PAGE COMPONENTS

### Profile Display Components

**[SellerCard.tsx](artifacts/print3d/src/components/shared/SellerCard.tsx)**
- **Purpose**: Displays seller/shop profile card in grid layouts (Explore page, Featured shops)
- **Data Type**: `SellerShop` (generated from OpenAPI)
- **Key Fields Displayed**:
  - `id` - Unique identifier
  - `displayName` - Seller/maker name
  - `shopName` - Official shop name (nullable, falls back to displayName)
  - `avatarUrl` - Profile picture
  - `bio` - Shop description
  - `location` - Geographic location
  - `rating` - Star rating (0.0-5.0)
  - `reviewCount` - Total reviews
  - `printerCount` - Count of equipment
  - `totalPrints` - Completed orders
  - `shopMode` - "catalog", "open", or "both" (affects available services)
  - `sellerTags` - Array of capability tags (e.g., "FDM 3D Printing", "Custom Jobs")
  
- **Usage**: `onClick()` navigates to `/shop/{seller.id}`
- **State Management**: Tracks comparison state via `isComparedShop()` localStorage

### Full Profile Page

**[Shop Page - shop.tsx](artifacts/print3d/src/pages/shop.tsx) (155+ lines)**
- **Purpose**: Full seller/shop detail page at route `/shop/:id`
- **API Calls**:
  - `useGetUser(shopId)` → Returns `UserDetail`
  - `useListPrinters({ userId: shopId })` → Equipment list
  - `useListListings({ sellerId: shopId })` → Catalog listings
  - `useListReviews({ revieweeId: shopId })` → Seller reviews
  
- **Data Displayed**:
  - Profile header with avatar, banner, shop name
  - Equipment/printers registered by seller
  - Product listings (catalog)
  - Customer reviews and ratings
  - Shop badges and certifications
  - Tabs for different sections

### Profile Settings Page

**[Settings Page - settings.tsx](artifacts/print3d/src/pages/settings.tsx)**
- **Purpose**: User profile management at route `/settings`
- **Sections**:
  1. **Profile** - Display name, bio, location, avatar, banner
  2. **Storefront** - Shop name, shop mode, announcements, brand story, seller tags
  3. **Shipping** - Shipping costs by region, policy, free threshold
  4. **Policies** - Return policy, custom order policy, processing times
  5. **Payments** - Payment method configuration
  6. **Notifications** - Preferences for alerts
  7. **Feedback** - User feedback submission
  8. **Security** - Password, email verification
  
- **Key Form Fields**:
  - `displayName` - Public name
  - `shopName` - Shop identifier
  - `shopMode` - "catalog", "open", or "both"
  - `bio` - Shop description
  - `sellerTags` - Array of tags (custom and preset options from `SHOP_TAG_OPTIONS`)
  - `location` - Geographic location
  - `avatarUrl`, `bannerUrl` - Image URLs
  - Regional shipping costs: `domesticShippingCost`, `europeShippingCost`, `northAmericaShippingCost`, `internationalShippingCost`
  - `defaultShippingCost` - Fallback for custom projects
  - `taxRate`, `processingDaysMin/Max`

- **State Management**: All updates go through `useUpdateUser()` mutation

---

## 2. POSTS DISPLAY & STORAGE (Product Listings)

### Listing Card Component

**[ListingCard.tsx](artifacts/print3d/src/components/shared/ListingCard.tsx)**
- **Purpose**: Displays individual product listing card
- **Data Type**: `Listing` (from generated API)
- **Key Fields**:
  - `id` - Listing ID
  - `title` - Product name
  - `description` - Product description (nullable)
  - `category` - Category (e.g., "Mechanical", "Miniatures", "Functional")
  - `tags` - Array of search tags
  - `basePrice` - Base product price
  - `shippingCost` - Seller-set shipping for this listing
  - `estimatedDaysMin/Max` - Production lead time
  - `imageUrl` - Product image
  - `sellerId` - Reference to seller
  - `sellerName` - Display name of seller (joined from User table)
  - `material` - Material type (e.g., "PLA", "Resin")
  - `color` - Color option
  - `stockQuantity` (optional) - Inventory tracking
  - `trackStock` (optional) - Whether to track inventory
  - `orderCount` - Total orders for this listing
  - `createdAt` - Creation timestamp
  - `isActive` - Published/visibility flag
  - `isPrintOnDemand` - Print-on-demand model indicator
  - `stockType` - "inventory", "print_on_demand", or "digital"

- **Display Features**:
  - Stock indicators (out of stock, low stock badges)
  - Price insights based on market comparison
  - Estimated production time
  - Tags preview
  - "Add to Cart" and view order flow buttons

### Listings Page / Catalog

**[Listings Page - listings.tsx](artifacts/print3d/src/pages/listings.tsx)**
- **Purpose**: Model catalog browse page at route `/listings`
- **API Calls**:
  - `useListListings({ limit: 50 })` → All active listings
  
- **Filtering Options**:
  - Search by title, category, tags
  - Category filter (Mechanical, Miniatures, Cosplay, Functional, Art, Jewelry, Architecture)
  - Price range filter (max price)
  
- **Grid Display**: `ListingCard` components in responsive grid
- **State**: Filters managed in component state (`searchTerm`, `selectedCategory`, `maxPrice`)

### Explore Page (Shops & Featured Listings)

**[Explore Page - explore.tsx](artifacts/print3d/src/pages/explore.tsx)**
- **Purpose**: Main discovery page at route `/explore`
- **Sections**:
  1. **Featured Shops Carousel** - Top sellers
  2. **Sponsored Shops** - Premium featured sellers
  3. **Shop Categories** - Browse by maker type
  4. **Latest Listings** - Recently added products
  
- **Shop Display Components**:
  - Uses `SellerCard` for shop preview
  - Uses `ListingCard` for products
  
- **API Calls**:
  - `useListSellers({ limit: 50 })` → Get sellers
  - `useListListings({ limit: 12 })` → Latest products
  
- **Filtering**:
  - Search by seller name, shop name, location, or tags
  - Location filter
  - Shop mode filter (catalog/open/both)
  - Shop capabilities filter (tags)
  - Verified-only filter

---

## 3. SHOPS PAGE & SHOP LISTING

### Explore/Shop Discovery

**Primary Pages**:
- `[explore.tsx](artifacts/print3d/src/pages/explore.tsx)` - Main shop discovery hub
- `[shop.tsx](artifacts/print3d/src/pages/shop.tsx)` - Individual shop detail view

### Shop Visibility & Query Logic

**Backend: [sellers.ts Route](artifacts/api-server/src/routes/sellers.ts)**

```typescript
router.get("/sellers", async (req, res) => {
  // Query parameters:
  // - limit: Number of results (default: 20)
  // - offset: Pagination offset (default: 0)
  
  // Filtering logic:
  // - Only returns users with role "seller" or "both"
  // - Orders by: rating DESC, reviewCount DESC, totalPrints DESC
  
  // Enrichment:
  // - Joins printers count from printersTable
  // - Joins listings count from listingsTable
  // - Returns: SellerShop object
});
```

**Returned SellerShop Type** (from `ListSellers200`):
```
{
  id: number
  username: string
  displayName: string
  shopName: string | null
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  rating: number | null
  reviewCount: number
  location: string | null
  emailVerifiedAt: string | null (ISO timestamp)
  shopMode: "catalog" | "open" | "both" | null
  sellerTags: string[]
  totalPrints: number
  printerCount: number
  listingCount: number
  joinedAt: string (ISO timestamp)
}
```

### Shop Identification Fields

**Primary Identifier**: `id` (serial integer from users table)

**Display Fields**:
- `shopName` - Official shop name (shown in profile, listings, etc.)
- `displayName` - Maker/person name (fallback if no shopName)

**Shop Capability Indicator**:
- `shopMode` indicates what services are offered:
  - `"catalog"` - Sells pre-designed print files
  - `"open"` - Accepts custom print jobs
  - `"both"` - Both catalog and custom work

**Shop Quality Signals**:
- `rating` - Average rating (float, nullable)
- `reviewCount` - Total reviews received
- `emailVerifiedAt` - Email verification status (null = not verified)
- `totalPrints` - Completed orders count
- `printerCount` - Equipment count
- `sellerTags` - Capability tags (defined in `SHOP_TAG_OPTIONS`)

---

## 4. HOW POSTS RELATE TO USER PROFILES

### Data Relationships

**Listings → Users Link**:
```
listings.sellerId (foreign key) → users.id
```

**Join Path**:
- Listing has `sellerId` → Look up user from users table
- Backend enriches: `sellerName = users.displayName` (see listings.ts)

**Complete Profile View**:
When user visits `/shop/{userId}`:
1. Fetch user profile via `useGetUser(userId)` → `UserDetail`
2. `UserDetail` includes:
   - All basic user fields
   - `printers` array - Equipment registered
   - `listings` array - All listings by this seller (limited to 10 most recent)
   - `recentReviews` array - Latest 5 reviews
   - `portfolio` array - Portfolio items (from portfolioTable)

### Shop Profile to Posts Flow

**In SellerCard Component**:
- Seller data shown (name, rating, location, tags)
- Click "View shop" → Navigate to `/shop/{seller.id}`

**In Shop Page**:
- Fetches `UserDetail` for full profile
- Displays listings section showing all seller's catalog
- Shows equipment and reviews

### Posts/Listings to Shop Link

**In ListingCard Component**:
- Shows `listing.sellerName` (prejoined in API)
- Click seller name → Navigate to `/shop/{listing.sellerId}`

---

## 5. DATABASE SCHEMA

### Users Table
**[Schema File: users.ts](lib/db/src/schema/users.ts)**

```sql
users (
  id: SERIAL PRIMARY KEY
  username: TEXT UNIQUE NOT NULL
  displayName: TEXT NOT NULL
  email: TEXT UNIQUE NOT NULL
  bio: TEXT
  avatarUrl: TEXT
  shopName: TEXT
  shopMode: ENUM('catalog', 'open', 'both')
  bannerUrl: TEXT
  location: TEXT
  // ... 40+ profile fields
  sellerTags: TEXT[] (array)
  rating: REAL (nullable)
  reviewCount: INTEGER
  totalPrints: INTEGER
  totalOrders: INTEGER
  joinedAt: TIMESTAMP
  emailVerifiedAt: TIMESTAMP
)
```

### Listings Table
**[Schema File: listings.ts](lib/db/src/schema/listings.ts)**

```sql
listings (
  id: SERIAL PRIMARY KEY
  sellerId: INTEGER NOT NULL (FK → users.id)
  title: TEXT NOT NULL
  description: TEXT
  category: TEXT NOT NULL
  tags: TEXT[]
  imageUrl: TEXT
  basePrice: REAL NOT NULL
  shippingCost: REAL DEFAULT 0
  estimatedDaysMin: INTEGER NOT NULL
  estimatedDaysMax: INTEGER NOT NULL
  material: TEXT
  color: TEXT
  productType: TEXT DEFAULT '3d_printing'
  equipmentUsed: INTEGER[] (FK array → printers.id)
  equipmentGroups: INTEGER[]
  isPrintOnDemand: BOOLEAN DEFAULT false
  isDigitalProduct: BOOLEAN DEFAULT false
  digitalFiles: TEXT[]
  stockType: ENUM('inventory', 'print_on_demand', 'digital')
  orderCount: INTEGER DEFAULT 0
  isActive: BOOLEAN DEFAULT true
  createdAt: TIMESTAMP
)
```

### Printers Table (Equipment)
**[Schema File: printers.ts](lib/db/src/schema/printers.ts)**

```sql
printers (
  id: SERIAL PRIMARY KEY
  userId: INTEGER NOT NULL (FK → users.id)
  equipmentCategory: ENUM(...)
  name: TEXT NOT NULL
  technology: ENUM('FDM', 'SLA', 'SLS', etc.)
  brand: TEXT NOT NULL
  model: TEXT NOT NULL
  buildVolume: TEXT
  materials: TEXT[]
  layerResolutionMin/Max: REAL
  pricePerHour: REAL
  pricePerGram: REAL
  isActive: BOOLEAN
  totalJobsCompleted: INTEGER
  createdAt: TIMESTAMP
)
```

---

## 6. API CLIENT GENERATION

### Generated API Hooks
**[Generated API File: api.ts](lib/api-client-react/src/generated/api.ts)**

All hooks use React Query for state management:

**Profile Queries**:
- `useGetUser(userId)` - Fetch full user/shop profile and related data
- `useListUsers(params?)` - List all users (filtered by role: buyer/seller/both)
- `useListSellers(params?)` - List seller shops specifically

**Listing Queries**:
- `useListListings(params?)` - List catalog listings (can filter by `sellerId`, `category`)
- `useGetListing(listingId)` - Get single listing detail

**Equipment Queries**:
- `useListPrinters(params?)` - List equipment (filter by `userId`)
- `useGetPrinter(printerId)` - Get single printer detail

**Review Queries**:
- `useListReviews(params?)` - List reviews (can filter by `revieweeId` for seller profile reviews)

### OpenAPI Spec
**[openapi.yaml](lib/api-spec/openapi.yaml)**
- Defines all endpoints, parameters, and response schemas
- Sources: `/users`, `/users/{userId}`, `/sellers`, `/listings`, `/printers`, `/reviews`
- Used by Orval to generate React Query hooks

---

## 7. KEY LOOKUPS & JOINS

### Shop by ID
```typescript
// Frontend
useGetUser(shopId) // Returns UserDetail with all profile + listings + printers

// Backend [users.ts]
GET /users/:userId → enriches with listings, printers, recent reviews, portfolio
```

### Listings by Shop
```typescript
// Frontend
useListListings({ sellerId: shopId })

// Backend [listings.ts]
WHERE sellerId = ? AND isActive = true
ORDER BY orderCount DESC, createdAt DESC
JOIN users.displayName as sellerName
```

### All Sellers (Explore)
```typescript
// Frontend
useListSellers({ limit: 50 })

// Backend [sellers.ts]
WHERE role IN ('seller', 'both')
ORDER BY COALESCE(rating, 0) DESC, reviewCount DESC, totalPrints DESC
ENRICHED with printerCount, listingCount
```

---

## 8. USER INTERFACE FLOW

```
Home / Explore (/explore)
├─ Featured Shops Carousel
│  └─ SellerCard (useListSellers)
│     └─ Click "View shop" → /shop/{id}
├─ Sponsored Shops Section
├─ Browse/Search Shops
│  └─ useListSellers with filters
│     ├─ Search (displayName, shopName, location, tags)
│     ├─ Location filter
│     ├─ Shop mode (catalog/open/custom)
│     └─ Verified-only toggle → emailVerifiedAt check
└─ Latest Listings
   └─ ListingCard (useListListings)
      └─ Click listing → /order/new?listingId={id}
      └─ Click seller name → /shop/{sellerId}

Shop Profile (/shop/{id})
├─ useGetUser(id) → UserDetail
├─ Header: Avatar, Banner, Shop Name, Bio, Location
├─ Equipment Tab
│  └─ useListPrinters({ userId: id })
├─ Listings Tab
│  └─ useListListings({ sellerId: id })
│     └─ Each listing shows priceInsights
└─ Reviews Tab
   └─ useListReviews({ revieweeId: id })

Model Catalog (/listings)
├─ useListListings({ limit: 50 })
├─ Filters: Search, Category, Price
└─ Each ListingCard
   └─ Related seller link → /shop/{sellerId}

Settings (/settings)
└─ useUpdateUser() to modify profile fields
   ├─ Basic profile (displayName, bio, avatar)
   ├─ Shop info (shopName, shopMode, sellerTags)
   ├─ Shipping (shippingCost, regions, policy)
   └─ Other (payment, notifications, security)
```

---

## 9. IMPORTANT UTILITY FILES

**Shop Comparison**: [shop-compare.ts](artifacts/print3d/src/lib/shop-compare.ts)
- LocalStorage persistence for comparing shops
- `isComparedShop(shopId)`, `toggleComparedShop(shop)`

**Shop Tags**: [shop-tags.ts](artifacts/print3d/src/lib/shop-tags.ts)
- Predefined seller capability tags
- Used by Settings page and Explore filters

**Listing Pricing Insights**: [listing-pricing.ts](artifacts/print3d/src/lib/listing-pricing.ts)
- Market price analysis for listings
- `buildListingPriceInsights(listings)`

---

## Summary Table

| Component | File | Purpose | Key Data Fields |
|-----------|------|---------|-----------------|
| **Profile Card** | `SellerCard.tsx` | Shop preview grid card | id, displayName, shopName, rating, printerCount, totalPrints |
| **Shop Page** | `shop.tsx` | Full profile view | useGetUser + listings + printers + reviews |
| **Settings** | `settings.tsx` | Profile editing | All user fields (shop name, bio, tags, shipping, etc.) |
| **Listing Card** | `ListingCard.tsx` | Product card | id, title, basePrice, sellerId, sellerName, category, tags |
| **Listings Page** | `listings.tsx` | Catalog browse | useListListings with filters |
| **Explore Page** | `explore.tsx` | Shop discovery | useListSellers + featured listings |
| **API Sellers Endpoint** | `sellers.ts` | Query shops | Returns SellerShop array, enriched with counts |
| **API Listings Endpoint** | `listings.ts` | Query products | Returns Listing array with seller name joined |
| **API Users Endpoint** | `users.ts` | Query profiles | Returns User or UserDetail with related data |


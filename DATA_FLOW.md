# Data Flow & Relationships

## Shop Discovery Flow

```
User visits /explore
├─ Frontend calls useListSellers({ limit: 50 })
├─ Backend: GET /sellers
│  └─ Query: SELECT * FROM users 
│     WHERE role IN ('seller', 'both')
│     ORDER BY rating DESC, reviewCount DESC, totalPrints DESC
│  └─ Enrichment loop: For each seller:
│     ├─ Get printerCount: COUNT(*) FROM printers WHERE userId = ?
│     └─ Get listingCount: COUNT(*) FROM listings WHERE sellerId = ?
│  └─ Returns: SellerShop[] with enriched data
└─ Frontend renders: SellerCard components
   └─ User clicks "View shop" → navigate to /shop/{seller.id}
```

## Shop Profile Flow

```
User visits /shop/{id}
├─ Frontend calls:
│  ├─ useGetUser(id)
│  │  └─ GET /users/{id}
│  │     └─ Returns: UserDetail with:
│  │        ├─ All user fields (id, displayName, shopName, etc.)
│  │        ├─ printers[] from printers table
│  │        ├─ listings[] (limited to 10) from listings table
│  │        ├─ recentReviews[] (limited to 5)
│  │        └─ portfolio[] from portfolio table
│  │
│  ├─ useListPrinters({ userId: id })
│  │  └─ GET /printers?userId={id}
│  │     └─ SELECT * FROM printers WHERE userId = ?
│  │
│  ├─ useListListings({ sellerId: id })
│  │  └─ GET /listings?sellerId={id}
│  │     └─ SELECT * FROM listings WHERE sellerId = ? AND isActive = true
│  │
│  └─ useListReviews({ revieweeId: id })
│     └─ GET /reviews?revieweeId={id}
│        └─ SELECT * FROM reviews WHERE revieweeId = ?
│
└─ Frontend renders Shop Profile Page with tabs:
   ├─ Equipment (from useListPrinters)
   ├─ Listings (from useListListings + priceInsights)
   ├─ Reviews (from useListReviews)
   └─ Shop Info (from useGetUser)
```

## Listings Browse Flow

```
User visits /listings
├─ Frontend calls useListListings({ limit: 50 })
├─ Backend: GET /listings?limit=50
│  └─ Query: SELECT * FROM listings 
│     WHERE isActive = true
│     ORDER BY orderCount DESC, createdAt DESC
│  └─ Enrichment for each listing:
│     ├─ Get sellerName: SELECT displayName FROM users WHERE id = sellerId
│     └─ Join as listing.sellerName
│  └─ Returns: Listing[] with sellerName
└─ Frontend renders:
   └─ ListingCard for each listing
      ├─ Shows seller name as link → /shop/{listing.sellerId}
      ├─ Shows priceInsights (from listing-pricing.ts utility)
      └─ "Add to Cart" or "Custom Order" buttons
```

## User Profile Edit Flow

```
User visits /settings?section=profile
├─ Current user profile loaded from auth context
├─ Form populated with:
│  ├─ displayName, bio, location, avatarUrl
│  ├─ shopName, shopMode, sellerTags
│  ├─ Shipping: domesticShippingCost, europeShippingCost, etc.
│  ├─ Policies: returnPolicy, customOrderPolicy, processingDays
│  └─ Other: taxRate, supportEmail, websiteUrl, etc.
│
├─ User edits fields
│
└─ User clicks "Save" → useUpdateUser()
   ├─ Frontend calls: PATCH /users/{userId}
   ├─ Backend validates all fields
   ├─ Backend: UPDATE users SET ... WHERE id = ?
   ├─ Returns: Updated User
   └─ Frontend: toast success, refresh auth context
```

## Listing Creation Flow

```
User visits /create-listing
├─ Form with fields:
│  ├─ title: STRING
│  ├─ category: STRING (Mechanical, Miniatures, etc.)
│  ├─ description: TEXT
│  ├─ tags: STRING[] (array of search tags)
│  ├─ imageUrl: STRING (URL or upload)
│  ├─ basePrice: DECIMAL
│  ├─ shippingCost: DECIMAL (seller-set per listing)
│  ├─ estimatedDaysMin/Max: INTEGER
│  ├─ material, color: STRING
│  └─ stockType: ENUM(inventory, print_on_demand, digital)
│
├─ User submits form → useCreateListing()
│  ├─ Frontend calls: POST /listings
│  ├─ Body: { sellerId: currentUser.id, title, basePrice, ... }
│  ├─ Backend validates:
│  │  ├─ Does caller own sellerId?
│  │  ├─ Is title non-empty?
│  │  ├─ Is basePrice > 0?
│  │  ├─ Are estimatedDaysMin/Max valid?
│  │  └─ Is seller email verified? (requireVerifiedSeller middleware)
│  │
│  ├─ Backend: INSERT INTO listings VALUES (...) RETURNING *
│  ├─ Returns: Created Listing
│  └─ Frontend: navigate to /listings or /shop/{userId}
```

## Shop Identification & Lookup

```
SellerShop object structure:
{
  // Primary identifier
  id: number  ← Use this to identify seller uniquely
  
  // Display identifiers
  displayName: string  ← Maker/person name
  shopName: string | null  ← Official shop name (if set)
  
  // Visibility
  emailVerifiedAt: string | null  ← null = not verified
  
  // Capability indicator
  shopMode: "catalog" | "open" | "both" | null
    ├─ "catalog" = sells pre-designed files
    ├─ "open" = accepts custom print orders
    └─ "both" = both services
  
  // Quality signals
  rating: number | null  ← 0-5 star average
  reviewCount: number  ← Total reviews received
  totalPrints: number  ← Completed orders proxy
  
  // Capability details
  sellerTags: string[]  ← From SHOP_TAG_OPTIONS
  bio: string | null  ← Description
  location: string | null  ← Geographic location
  
  // Resource inventory
  printerCount: number  ← Equipment count
  listingCount: number  ← Available products
}

Frontend usage:
- Display shop: Show shopName || displayName
- Navigate to shop: /shop/{id}
- Verify seller: Check emailVerifiedAt !== null
- Check availability: Check shopMode for "catalog" or "open"
```

## Query Filters in Frontend

### Explore Page Filters
```typescript
const filteredSellers = data?.sellers.filter((s) => {
  // Search across multiple fields
  const matchesSearch = 
    displayName.includes(q) ||
    shopName.includes(q) ||
    location.includes(q) ||
    sellerTags.some(tag => tag.includes(q))
  
  // Location exact
  const matchesLocation = !query || location.includes(query)
  
  // Shop mode (what services they offer)
  const matchesMode = selectedMode === "all" || shopMode === selectedMode
  
  // Capability tags
  const matchesTag = selectedTag === "all" || sellerTags.includes(selectedTag)
  
  // Verified filter
  const matchesVerified = !verifiedOnly || !!emailVerifiedAt
  
  return matchesSearch && matchesLocation && matchesMode && matchesTag && matchesVerified
})
```

### Listings Page Filters
```typescript
const filteredListings = data?.listings.filter(l => {
  // Search across title, category, tags
  const matchesSearch = 
    title.includes(q) ||
    category.includes(q) ||
    tags.some(t => t.includes(q))
  
  // Category exact
  const matchesCategory = category === selectedCategory
  
  // Price max
  const matchesPrice = !maxPrice || basePrice <= maxPrice
  
  return matchesSearch && matchesCategory && matchesPrice
})
```

## Backend Sorting/Ordering

### List Sellers (Explore Featured First)
```sql
ORDER BY 
  COALESCE(rating, 0) DESC,    -- Highest rated first
  reviewCount DESC,             -- Then most reviewed
  totalPrints DESC              -- Then most successful
```

### List Listings (Popular First)
```sql
ORDER BY 
  orderCount DESC,              -- Most ordered first
  createdAt DESC                -- Then newest
```

## Data Types (Generated from OpenAPI)

### SellerShop (from /sellers endpoint)
```typescript
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
  emailVerifiedAt: string | null  // ISO 8601 timestamp
  shopMode: "catalog" | "open" | "both" | null
  sellerTags: string[]
  totalPrints: number
  printerCount: number  // Enriched by backend
  listingCount: number  // Enriched by backend (if present)
  joinedAt: string  // ISO 8601 timestamp
}
```

### UserDetail (from /users/{id} endpoint)
```typescript
{
  // Extends User (all fields plus)
  printers: Printer[]
  listings: Listing[]  // max 10
  recentReviews: Review[]  // max 5
  portfolio: PortfolioItem[]
  // Plus all user fields... 40+ total
}
```

### Listing (from /listings endpoint)
```typescript
{
  id: number
  sellerId: number  ← FK key to users.id
  sellerName: string  // Joined from users.displayName
  title: string
  description: string | null
  category: string
  tags: string[]
  imageUrl: string | null
  basePrice: number
  shippingCost: number
  estimatedDaysMin: number
  estimatedDaysMax: number
  material: string | null
  color: string | null
  orderCount: number
  isActive: boolean
  createdAt: string  // ISO 8601
  stockType: "inventory" | "print_on_demand" | "digital"
  isPrintOnDemand: boolean
  isDigitalProduct: boolean
  // ... more fields
}
```

## Storage & Persistence

### LocalStorage (Client-side)
- Shop comparison list: `SHOP_COMPARE_CHANGE_EVENT` listener
- Locale preferences: Currency, language, country format
- Auth token: JWT in httpOnly cookie (secure)

### Database (Server-side)
- All user profile data in `users` table
- All listings in `listings` table
- Equipment in `printers` table
- Reviews & ratings in `reviews` table
- Orders in `orders` table
- Portfolio items in `portfolio` table


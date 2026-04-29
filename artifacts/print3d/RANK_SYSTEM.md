# Rank System Documentation

## Overview
The Synthix Rank System rewards users with XP for completing actions that contribute to the marketplace. As users earn XP, they progress through 7 ranks, unlocking benefits including free sponsorship periods.

## Ranks

| Rank | Name | Min XP | Benefits |
|------|------|--------|----------|
| 1 | Novice Maker 🔰 | 0 | Basic shop features |
| 2 | Apprentice 🌱 | 100 | Priority support, Custom shop banner |
| 3 | Craftsman 🔧 | 500 | Featured in search, Analytics dashboard |
| 4 | Artisan ⚡ | 1,500 | **24h Silver Sponsorship (weekly)** |
| 5 | Master Maker 🏆 | 4,000 | **48h Gold Sponsorship (weekly)**, Verified badge, Commission discounts |
| 6 | Legend 👑 | 10,000 | **72h Premium Sponsorship (weekly)**, Priority listing, Exclusive events |
| 7 | Synthix Icon ⭐ | 25,000 | **Permanent Premium Sponsorship**, Hall of Fame, Direct team access |

## XP Rewards

### Order Actions
- Complete order: **30 XP**
- Ship order: **20 XP**
- Receive first order: **100 XP**

### Reviews
- 5-star review: **50 XP**
- Positive review (4+ stars): **25 XP**

### Custom Orders
- Accept custom request: **15 XP**
- Submit quote: **10 XP**
- Quote accepted: **40 XP**
- Complete custom order: **60 XP**

### Engagement
- Respond to message: **2 XP**
- Contest entry: **75 XP**
- Win contest: **500 XP**
- 2nd place: **250 XP**
- 3rd place: **150 XP**

### Milestones
- First 100 sales: **500 XP**
- First 500 sales: **1,000 XP**
- First 1,000 sales: **2,500 XP**

### Other
- Complete profile: **25 XP**
- Add first listing: **50 XP**
- Add listing: **10 XP**
- Refer seller: **100 XP**
- Refer buyer: **50 XP**

## Database Setup

1. Run the migration in Supabase SQL Editor:
   ```bash
   # File: supabase/migrations/20240429_add_rank_system.sql
   ```

2. Tables created:
   - `user_xp` - Stores total XP and current rank per user
   - `xp_log` - Audit trail of all XP awards
   - `sponsorships` - Tracks sponsorship rewards from rank ups

## Components

### RankBadge
Displays a user's rank with optional progress bar:
```tsx
<RankBadge rankId={3} totalXp={650} showProgress />
```

### RankProgressCard
Full rank details card for dashboard:
```tsx
<RankProgressCard totalXp={650} weeklyXp={45} />
```

### MiniRank
Compact rank indicator for cards:
```tsx
<MiniRank rankId={3} />
```

### UserRankPanel
Full dashboard panel with tabs:
```tsx
<UserRankPanel />
```

## Using XP Awards in Your Code

### Method 1: Using the Hook (Recommended)
```tsx
import { useXpAwards } from "@/hooks/use-xp-awards";

function OrderComponent() {
  const { awardXpForAction } = useXpAwards();
  
  const handleShipOrder = async () => {
    // Ship the order...
    await awardXpForAction("SHIP_ORDER", { orderId: "123" });
  };
}
```

### Method 2: Direct API Call
```tsx
import { awardXp } from "@/lib/xp-tracker";

const result = await awardXp(userId, "COMPLETE_ORDER", { orderId: "123" });

if (result.rankUp) {
  console.log("User ranked up!");
  if (result.sponsorshipReward) {
    console.log(`Sponsored for ${result.sponsorshipReward.duration}h!`);
  }
}
```

## Displaying Rank in Components

SellerCard automatically shows MiniRank when rankId > 1:
```tsx
<SellerCard seller={{ ...sellerData, rankId: 3, totalXp: 650 }} />
```

## Dashboard Integration

The Rank tab is now available in the seller dashboard showing:
- Current rank with progress bar
- XP statistics (total, weekly, monthly)
- All 7 ranks with benefits
- XP history with recent gains
- How to earn more XP

## Automatic XP Integration Points

Add XP awards at these key locations:

1. **Order Flow** (`order-flow.tsx`)
   - Award `COMPLETE_ORDER` when order status changes to "completed"
   - Award `SHIP_ORDER` when shipping label created

2. **Review System** (when review submitted)
   - Award `RECEIVE_5_STAR_REVIEW` or `RECEIVE_POSITIVE_REVIEW` to seller

3. **Custom Orders** (`CustomOrders.tsx`)
   - Award `ACCEPT_CUSTOM_REQUEST` when accepting
   - Award `QUOTE_ACCEPTED` when buyer accepts quote
   - Award `COMPLETE_CUSTOM_ORDER` when marked complete

4. **Contest System** (`contest-detail.tsx`)
   - Award `CONTEST_ENTRY` on entry
   - Award `CONTEST_WIN`, `CONTEST_PLACE_2ND`, `CONTEST_PLACE_3RD` when results announced

5. **Messages** (when seller responds)
   - Award `RESPOND_TO_MESSAGE` (with debounce to prevent spam)

6. **Milestones** (check periodically or on order completion)
   - Award `FIRST_100_SALES`, `FIRST_500_SALES`, `FIRST_1000_SALES`

## Security

- RLS policies ensure users can only see their own XP data
- Rank changes automatically sync to `profiles` table for public display
- XP log provides audit trail

## Future Enhancements

- [ ] Weekly leaderboard
- [ ] Rank-based badges/achievements
- [ ] XP boost events
- [ ] Rank-exclusive features
- [ ] Leaderboard API endpoint

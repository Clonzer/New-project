/**
 * XP Rewards System - Synthix Marketplace
 * 
 * Features:
 * - One-time rewards for milestones
 * - Repeatable rewards with cooldowns
 * - Daily challenges with rotating tasks
 * - Timed events and bonuses
 * - Platform contribution rewards
 */

// XP Reward Categories
export type XpRewardType =
  | "onetime"    // One-time per user
  | "repeatable" // Can be earned multiple times with cooldown
  | "daily"      // Daily challenge
  | "weekly"     // Weekly challenge
  | "monthly"    // Monthly challenge
  | "timed";     // Limited-time event

export interface XpReward {
  id: string;
  name: string;
  description: string;
  xp: number;
  type: XpRewardType;
  cooldownHours?: number; // For repeatable tasks
  maxPerDay?: number;     // Daily limit
  category: "selling" | "listing" | "social" | "platform" | "engagement" | "milestone";
  icon: string;
}

// All XP Rewards
export const XP_REWARDS: XpReward[] = [
  // === SELLING ACTIVITIES ===
  {
    id: "first_sale",
    name: "First Sale",
    description: "Complete your first order",
    xp: 100,
    type: "onetime",
    category: "selling",
    icon: "PartyPopper",
  },
  {
    id: "sale_complete",
    name: "Order Completed",
    description: "Complete an order successfully",
    xp: 25,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 50, // Max 50 sales per day for XP
    category: "selling",
    icon: "PackageCheck",
  },
  {
    id: "quick_delivery",
    name: "Quick Delivery",
    description: "Deliver within 24 hours of order",
    xp: 50,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "selling",
    icon: "Zap",
  },
  {
    id: "five_star_review",
    name: "5-Star Service",
    description: "Receive a 5-star review",
    xp: 75,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "selling",
    icon: "Star",
  },
  {
    id: "repeat_customer",
    name: "Repeat Customer",
    description: "Sell to a customer who bought before",
    xp: 40,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 15,
    category: "selling",
    icon: "Users",
  },
  {
    id: "bulk_order",
    name: "Bulk Order",
    description: "Sell 10+ items in a single order",
    xp: 150,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "selling",
    icon: "Boxes",
  },
  {
    id: "international_sale",
    name: "Global Seller",
    description: "Complete a sale to an international customer",
    xp: 60,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "selling",
    icon: "Globe",
  },
  {
    id: "custom_order_complete",
    name: "Custom Creator",
    description: "Complete a custom order request",
    xp: 80,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "selling",
    icon: "Palette",
  },
  {
    id: "rush_order",
    name: "Speed Merchant",
    description: "Complete an order marked as rush/priority",
    xp: 35,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 15,
    category: "selling",
    icon: "Timer",
  },
  {
    id: "premium_materials",
    name: "Quality Crafter",
    description: "Use premium materials in a completed order",
    xp: 45,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "selling",
    icon: "Gem",
  },

  // === LISTING ACTIVITIES ===
  {
    id: "first_listing",
    name: "First Listing",
    description: "Create your first product listing",
    xp: 50,
    type: "onetime",
    category: "listing",
    icon: "PlusCircle",
  },
  {
    id: "create_listing",
    name: "New Listing",
    description: "Create a new product listing",
    xp: 15,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 30,
    category: "listing",
    icon: "Plus",
  },
  {
    id: "detailed_listing",
    name: "Detailed Listing",
    description: "Create a listing with 5+ images and detailed description",
    xp: 40,
    type: "repeatable",
    cooldownHours: 1,
    maxPerDay: 10,
    category: "listing",
    icon: "FileText",
  },
  {
    id: "category_diversity",
    name: "Category Explorer",
    description: "List in 5+ different categories",
    xp: 100,
    type: "onetime",
    category: "listing",
    icon: "LayoutGrid",
  },
  {
    id: "listing_streak",
    name: "Listing Streak",
    description: "Create a listing 7 days in a row",
    xp: 200,
    type: "onetime",
    category: "listing",
    icon: "Flame",
  },
  {
    id: "featured_listing",
    name: "Featured Creator",
    description: "Get a listing featured by the platform",
    xp: 100,
    type: "onetime",
    category: "listing",
    icon: "Sparkles",
  },
  {
    id: "add_listing_video",
    name: "Video Producer",
    description: "Add a video to a listing",
    xp: 30,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "listing",
    icon: "Video",
  },
  {
    id: "create_bundle",
    name: "Bundle Master",
    description: "Create a bundle deal with 3+ items",
    xp: 40,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "listing",
    icon: "Package",
  },
  {
    id: "price_drop",
    name: "Smart Seller",
    description: "Update listing prices 5+ times in a day",
    xp: 25,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 1,
    category: "listing",
    icon: "TrendingDown",
  },
  {
    id: "restock_alert",
    name: "Restocker",
    description: "Restock a sold-out item",
    xp: 15,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "listing",
    icon: "RefreshCw",
  },
  {
    id: "tag_master",
    name: "Tag Expert",
    description: "Use 10+ relevant tags on a single listing",
    xp: 20,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "listing",
    icon: "Tags",
  },
  {
    id: "listing_variants",
    name: "Variety Vendor",
    description: "Create a listing with 5+ size/color variants",
    xp: 35,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "listing",
    icon: "Layers",
  },
  {
    id: "seo_description",
    name: "SEO Master",
    description: "Write a listing description with 200+ words",
    xp: 25,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "listing",
    icon: "Search",
  },

  // === PLATFORM CONTRIBUTION ===
  {
    id: "bug_report",
    name: "Bug Hunter",
    description: "Report a verified bug",
    xp: 200,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 3,
    category: "platform",
    icon: "Bug",
  },
  {
    id: "feature_suggestion",
    name: "Innovator",
    description: "Suggest a feature that gets implemented",
    xp: 500,
    type: "onetime",
    category: "platform",
    icon: "Lightbulb",
  },
  {
    id: "help_article",
    name: "Community Teacher",
    description: "Write a help article/guide that gets approved",
    xp: 300,
    type: "repeatable",
    cooldownHours: 168, // Weekly
    maxPerDay: 1,
    category: "platform",
    icon: "BookOpen",
  },
  {
    id: "referral",
    name: "Ambassador",
    description: "Refer a new seller who makes 3+ sales",
    xp: 250,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "platform",
    icon: "Share2",
  },
  {
    id: "beta_tester",
    name: "Beta Tester",
    description: "Participate in beta testing and provide feedback",
    xp: 150,
    type: "repeatable",
    cooldownHours: 72,
    maxPerDay: 2,
    category: "platform",
    icon: "TestTube",
  },

  // === SOCIAL ENGAGEMENT ===
  {
    id: "leave_review",
    name: "Helpful Reviewer",
    description: "Leave a detailed review on a purchase",
    xp: 20,
    type: "repeatable",
    cooldownHours: 1,
    maxPerDay: 10,
    category: "social",
    icon: "MessageSquare",
  },
  {
    id: "helpful_review",
    name: "Community Voice",
    description: "Get 10+ helpful votes on your review",
    xp: 100,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 5,
    category: "social",
    icon: "ThumbsUp",
  },
  {
    id: "answer_question",
    name: "Helper",
    description: "Answer another seller's question in forums",
    xp: 35,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "social",
    icon: "HelpCircle",
  },
  {
    id: "profile_complete",
    name: "Profile Perfectionist",
    description: "Complete your profile 100%",
    xp: 100,
    type: "onetime",
    category: "social",
    icon: "UserCheck",
  },
  {
    id: "verified_identity",
    name: "Trusted Member",
    description: "Complete identity verification",
    xp: 150,
    type: "onetime",
    category: "social",
    icon: "ShieldCheck",
  },
  {
    id: "follow_seller",
    name: "Network Builder",
    description: "Follow 5 different sellers",
    xp: 15,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 10,
    category: "social",
    icon: "UserPlus",
  },
  {
    id: "get_followers",
    name: "Rising Star",
    description: "Gain 10 new followers",
    xp: 50,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 1,
    category: "social",
    icon: "Users",
  },
  {
    id: "share_shop",
    name: "Shop Promoter",
    description: "Share your shop on social media",
    xp: 30,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 3,
    category: "social",
    icon: "Share",
  },
  {
    id: "community_post",
    name: "Active Member",
    description: "Post in community forums",
    xp: 15,
    type: "repeatable",
    cooldownHours: 2,
    maxPerDay: 10,
    category: "social",
    icon: "PenTool",
  },
  {
    id: "photo_upload",
    name: "Photographer",
    description: "Upload 10+ high-quality photos to your profile",
    xp: 40,
    type: "onetime",
    category: "social",
    icon: "Camera",
  },
  {
    id: "story_add",
    name: "Storyteller",
    description: "Add brand story to your shop",
    xp: 60,
    type: "onetime",
    category: "social",
    icon: "BookOpen",
  },

  // === ENGAGEMENT ===
  {
    id: "login_streak_7",
    name: "Weekly Streak",
    description: "Login 7 days in a row",
    xp: 100,
    type: "onetime",
    category: "engagement",
    icon: "CalendarCheck",
  },
  {
    id: "login_streak_30",
    name: "Monthly Dedication",
    description: "Login 30 days in a row",
    xp: 500,
    type: "onetime",
    category: "engagement",
    icon: "CalendarDays",
  },
  {
    id: "login_streak_100",
    name: "Century Login",
    description: "Login 100 days in a row",
    xp: 2000,
    type: "onetime",
    category: "engagement",
    icon: "Medal",
  },
  {
    id: "quick_responder",
    name: "Speed Demon",
    description: "Respond to messages within 5 minutes",
    xp: 15,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 30,
    category: "engagement",
    icon: "Clock",
  },
  {
    id: "message_sent",
    name: "Communicator",
    description: "Send a message to another user",
    xp: 5,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 50,
    category: "engagement",
    icon: "Send",
  },
  {
    id: "discover_post",
    name: "Content Creator",
    description: "Create a post on the Discover feed",
    xp: 20,
    type: "repeatable",
    cooldownHours: 2,
    maxPerDay: 10,
    category: "engagement",
    icon: "ImagePlus",
  },
  {
    id: "discover_like",
    name: "Engaged Viewer",
    description: "Like a post on Discover",
    xp: 2,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 100,
    category: "engagement",
    icon: "Heart",
  },
  {
    id: "discover_comment",
    name: "Conversationalist",
    description: "Comment on a Discover post",
    xp: 5,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 30,
    category: "engagement",
    icon: "MessageCircle",
  },
  {
    id: "discover_share",
    name: "Amplifier",
    description: "Share a Discover post",
    xp: 10,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 20,
    category: "engagement",
    icon: "Share2",
  },
  {
    id: "shop_visit",
    name: "Window Shopper",
    description: "Visit 10 different shops in one day",
    xp: 25,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 1,
    category: "engagement",
    icon: "Store",
  },
  {
    id: "listing_view_streak",
    name: "Curious Browser",
    description: "View 50 listings in one day",
    xp: 30,
    type: "repeatable",
    cooldownHours: 24,
    maxPerDay: 1,
    category: "engagement",
    icon: "Eye",
  },
  {
    id: "save_favorite",
    name: "Collector",
    description: "Add an item to favorites",
    xp: 3,
    type: "repeatable",
    cooldownHours: 0,
    maxPerDay: 50,
    category: "engagement",
    icon: "Bookmark",
  },

  // === DAILY CHALLENGES ===
  {
    id: "daily_login",
    name: "Daily Login",
    description: "Log in to the platform today",
    xp: 10,
    type: "daily",
    category: "engagement",
    icon: "LogIn",
  },
  {
    id: "daily_listing",
    name: "Daily Lister",
    description: "Create or update a listing today",
    xp: 15,
    type: "daily",
    category: "listing",
    icon: "Plus",
  },
  {
    id: "daily_message",
    name: "Daily Communicator",
    description: "Send 5 messages to different users",
    xp: 20,
    type: "daily",
    category: "engagement",
    icon: "Send",
  },
  {
    id: "daily_discover",
    name: "Daily Explorer",
    description: "Browse 20 listings on Discover",
    xp: 25,
    type: "daily",
    category: "engagement",
    icon: "Search",
  },
  {
    id: "daily_profile_update",
    name: "Daily Fresh Look",
    description: "Update your profile or shop info",
    xp: 10,
    type: "daily",
    category: "social",
    icon: "User",
  },
  {
    id: "daily_review",
    name: "Daily Critic",
    description: "Leave a review for a purchase",
    xp: 30,
    type: "daily",
    category: "engagement",
    icon: "Star",
  },
  {
    id: "daily_share",
    name: "Daily Amplifier",
    description: "Share 3 listings or posts",
    xp: 15,
    type: "daily",
    category: "engagement",
    icon: "Share",
  },
  {
    id: "daily_favorite",
    name: "Daily Collector",
    description: "Add 5 items to favorites",
    xp: 20,
    type: "daily",
    category: "engagement",
    icon: "Bookmark",
  },
  {
    id: "daily_help",
    name: "Daily Helper",
    description: "Answer a question in community forums",
    xp: 25,
    type: "daily",
    category: "social",
    icon: "HelpCircle",
  },
  {
    id: "daily_sell",
    name: "Daily Seller",
    description: "Make at least 1 sale today",
    xp: 50,
    type: "daily",
    category: "selling",
    icon: "DollarSign",
  },

  // === WEEKLY CHALLENGES ===
  {
    id: "weekly_5_sales",
    name: "Weekly Hustler",
    description: "Complete 5 orders this week",
    xp: 100,
    type: "weekly",
    category: "selling",
    icon: "Target",
  },
  {
    id: "weekly_10_listings",
    name: "Weekly Creator",
    description: "Create 10 new listings this week",
    xp: 150,
    type: "weekly",
    category: "listing",
    icon: "Package",
  },
  {
    id: "weekly_50_messages",
    name: "Weekly Networker",
    description: "Send 50 messages this week",
    xp: 75,
    type: "weekly",
    category: "engagement",
    icon: "MessageSquare",
  },
  {
    id: "weekly_100_views",
    name: "Weekly Browser",
    description: "View 100 different listings this week",
    xp: 60,
    type: "weekly",
    category: "engagement",
    icon: "Eye",
  },
  {
    id: "weekly_5_reviews",
    name: "Weekly Reviewer",
    description: "Leave 5 detailed reviews this week",
    xp: 80,
    type: "weekly",
    category: "engagement",
    icon: "Star",
  },
  {
    id: "weekly_10_shops",
    name: "Weekly Explorer",
    description: "Visit 10 different shops this week",
    xp: 90,
    type: "weekly",
    category: "engagement",
    icon: "Store",
  },
  {
    id: "weekly_20_favorites",
    name: "Weekly Collector",
    description: "Add 20 items to favorites this week",
    xp: 40,
    type: "weekly",
    category: "engagement",
    icon: "Bookmark",
  },
  {
    id: "weekly_5_discover_posts",
    name: "Weekly Influencer",
    description: "Create 5 posts on Discover this week",
    xp: 120,
    type: "weekly",
    category: "engagement",
    icon: "ImagePlus",
  },
  {
    id: "weekly_custom_order",
    name: "Weekly Specialist",
    description: "Complete 1 custom order this week",
    xp: 200,
    type: "weekly",
    category: "selling",
    icon: "Wrench",
  },
  {
    id: "weekly_help_10",
    name: "Weekly Mentor",
    description: "Help 10 community members this week",
    xp: 150,
    type: "weekly",
    category: "social",
    icon: "Users",
  },

  // === MONTHLY CHALLENGES ===
  {
    id: "monthly_20_sales",
    name: "Monthly Performer",
    description: "Complete 20 orders this month",
    xp: 300,
    type: "monthly",
    category: "selling",
    icon: "Target",
  },
  {
    id: "monthly_50_listings",
    name: "Monthly Producer",
    description: "Create 50 new listings this month",
    xp: 400,
    type: "monthly",
    category: "listing",
    icon: "Package",
  },
  {
    id: "monthly_200_messages",
    name: "Monthly Communicator",
    description: "Send 200 messages this month",
    xp: 250,
    type: "monthly",
    category: "engagement",
    icon: "MessageSquare",
  },
  {
    id: "monthly_500_views",
    name: "Monthly Browser",
    description: "View 500 different listings this month",
    xp: 200,
    type: "monthly",
    category: "engagement",
    icon: "Eye",
  },
  {
    id: "monthly_20_reviews",
    name: "Monthly Critic",
    description: "Leave 20 detailed reviews this month",
    xp: 300,
    type: "monthly",
    category: "engagement",
    icon: "Star",
  },
  {
    id: "monthly_50_shops",
    name: "Monthly Explorer",
    description: "Visit 50 different shops this month",
    xp: 350,
    type: "monthly",
    category: "engagement",
    icon: "Store",
  },
  {
    id: "monthly_100_favorites",
    name: "Monthly Collector",
    description: "Add 100 items to favorites this month",
    xp: 150,
    type: "monthly",
    category: "engagement",
    icon: "Bookmark",
  },
  {
    id: "monthly_20_discover_posts",
    name: "Monthly Content Creator",
    description: "Create 20 posts on Discover this month",
    xp: 500,
    type: "monthly",
    category: "engagement",
    icon: "ImagePlus",
  },
  {
    id: "monthly_5_custom_orders",
    name: "Monthly Specialist",
    description: "Complete 5 custom orders this month",
    xp: 600,
    type: "monthly",
    category: "selling",
    icon: "Wrench",
  },
  {
    id: "monthly_1000_sales",
    name: "Monthly High Roller",
    description: "Reach $1,000 in sales this month",
    xp: 1000,
    type: "monthly",
    category: "selling",
    icon: "TrendingUp",
  },
  {
    id: "monthly_help_50",
    name: "Monthly Mentor",
    description: "Help 50 community members this month",
    xp: 500,
    type: "monthly",
    category: "social",
    icon: "Users",
  },
  {
    id: "monthly_perfect_week",
    name: "Monthly Perfect Week",
    description: "Maintain 100% response rate for a week",
    xp: 400,
    type: "monthly",
    category: "selling",
    icon: "CheckCircle",
  },
  {
    id: "monthly_10_new_categories",
    name: "Monthly Diversifier",
    description: "List items in 10 different categories",
    xp: 350,
    type: "monthly",
    category: "listing",
    icon: "Grid3x3",
  },
  {
    id: "monthly_5_star_streak",
    name: "Monthly Excellence",
    description: "Maintain 5-star average for the month",
    xp: 450,
    type: "monthly",
    category: "milestone",
    icon: "Crown",
  },

  // === MILESTONES ===
  {
    id: "first_1k_xp",
    name: "Rising Star",
    description: "Earn 1,000 total XP",
    xp: 0, // Just a milestone marker
    type: "onetime",
    category: "milestone",
    icon: "TrendingUp",
  },
  {
    id: "first_10k_sales",
    name: "10K Club",
    description: "Reach $10,000 in total sales",
    xp: 1000,
    type: "onetime",
    category: "milestone",
    icon: "DollarSign",
  },
  {
    id: "first_100_sales",
    name: "Century Seller",
    description: "Complete 100 orders",
    xp: 500,
    type: "onetime",
    category: "milestone",
    icon: "Award",
  },
  {
    id: "first_10_listings",
    name: "Deca Lister",
    description: "Create 10 listings",
    xp: 100,
    type: "onetime",
    category: "milestone",
    icon: "Layers",
  },
  {
    id: "first_50_listings",
    name: "Mega Lister",
    description: "Create 50 listings",
    xp: 300,
    type: "onetime",
    category: "milestone",
    icon: "Library",
  },
  {
    id: "first_5k_xp",
    name: "XP Veteran",
    description: "Earn 5,000 total XP",
    xp: 0,
    type: "onetime",
    category: "milestone",
    icon: "Medal",
  },
  {
    id: "first_25k_xp",
    name: "XP Master",
    description: "Earn 25,000 total XP",
    xp: 0,
    type: "onetime",
    category: "milestone",
    icon: "Trophy",
  },
  {
    id: "first_1k_reviews",
    name: "Review Champion",
    description: "Receive 1,000 reviews",
    xp: 2000,
    type: "onetime",
    category: "milestone",
    icon: "Star",
  },
  {
    id: "perfect_month",
    name: "Perfect Month",
    description: "Maintain 5-star rating for 30 days straight",
    xp: 500,
    type: "onetime",
    category: "milestone",
    icon: "Crown",
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Join during platform beta",
    xp: 200,
    type: "onetime",
    category: "milestone",
    icon: "Rocket",
  },
  {
    id: "first_custom_order",
    name: "Customizer",
    description: "Complete your first custom order request",
    xp: 100,
    type: "onetime",
    category: "milestone",
    icon: "Paintbrush",
  },
  {
    id: "diverse_seller",
    name: "Jack of All Trades",
    description: "Sell in 10 different categories",
    xp: 400,
    type: "onetime",
    category: "milestone",
    icon: "Grid3x3",
  },
  {
    id: "repeat_buyer_favorite",
    name: "Customer Favorite",
    description: "Have 5 customers make 3+ purchases each",
    xp: 300,
    type: "onetime",
    category: "milestone",
    icon: "Heart",
  },
];

// Daily Challenges - Rotate automatically
export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  xp: number;
  requirement: number;
  taskType: string;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily_listing",
    name: "Daily Creator",
    description: "Create 2 new listings today",
    xp: 50,
    requirement: 2,
    taskType: "create_listing",
  },
  {
    id: "daily_sale",
    name: "Daily Seller",
    description: "Complete 1 sale today",
    xp: 75,
    requirement: 1,
    taskType: "complete_sale",
  },
  {
    id: "daily_response",
    name: "Quick Responder",
    description: "Respond to 5 messages within 10 minutes",
    xp: 60,
    requirement: 5,
    taskType: "quick_response",
  },
  {
    id: "daily_share",
    name: "Social Butterfly",
    description: "Share 3 of your listings on social media",
    xp: 40,
    requirement: 3,
    taskType: "share_listing",
  },
  {
    id: "daily_review",
    name: "Community Reviewer",
    description: "Leave 2 helpful reviews",
    xp: 50,
    requirement: 2,
    taskType: "leave_review",
  },
  {
    id: "daily_deliver",
    name: "Speedy Delivery",
    description: "Deliver 3 orders within 24 hours",
    xp: 90,
    requirement: 3,
    taskType: "quick_delivery",
  },
  {
    id: "daily_update",
    name: "Fresh Stock",
    description: "Update 5 existing listings with new info/images",
    xp: 45,
    requirement: 5,
    taskType: "update_listing",
  },
];

// Weekly Challenges
export const WEEKLY_CHALLENGES: DailyChallenge[] = [
  {
    id: "weekly_sales",
    name: "Sales Champion",
    description: "Complete 10 sales this week",
    xp: 300,
    requirement: 10,
    taskType: "complete_sale",
  },
  {
    id: "weekly_listings",
    name: "Listing Spree",
    description: "Create 15 new listings this week",
    xp: 250,
    requirement: 15,
    taskType: "create_listing",
  },
  {
    id: "weekly_engagement",
    name: "Community Leader",
    description: "Answer 20 community questions",
    xp: 200,
    requirement: 20,
    taskType: "answer_question",
  },
  {
    id: "weekly_revenue",
    name: "Revenue Master",
    description: "Make $500 in sales this week",
    xp: 400,
    requirement: 500,
    taskType: "revenue_target",
  },
];

// Get today's daily challenge (rotates based on day of week + random factor)
export function getTodaysChallenge(): DailyChallenge {
  const dayOfWeek = new Date().getDay();
  const index = dayOfWeek % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

// Get this week's challenge
export function getWeeklyChallenge(): DailyChallenge {
  const weekOfYear = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const index = weekOfYear % WEEKLY_CHALLENGES.length;
  return WEEKLY_CHALLENGES[index];
}

// Calculate XP reward with potential bonuses
export function calculateXpReward(
  rewardId: string,
  currentStreak: number = 0,
  isWeekend: boolean = false
): { baseXp: number; bonusXp: number; totalXp: number; streakMultiplier: number } {
  const reward = XP_REWARDS.find((r) => r.id === rewardId);
  if (!reward) return { baseXp: 0, bonusXp: 0, totalXp: 0, streakMultiplier: 1 };

  let baseXp = reward.xp;
  let bonusXp = 0;
  let streakMultiplier = 1;

  // Streak bonus (up to 2x for 7+ day streaks)
  if (currentStreak >= 7) {
    streakMultiplier = 2.0;
  } else if (currentStreak >= 5) {
    streakMultiplier = 1.5;
  } else if (currentStreak >= 3) {
    streakMultiplier = 1.25;
  }

  // Weekend bonus (20% extra)
  if (isWeekend) {
    bonusXp += Math.round(baseXp * 0.2);
  }

  const totalXp = Math.round(baseXp * streakMultiplier) + bonusXp;

  return { baseXp, bonusXp, totalXp, streakMultiplier };
}

// Check if user can earn XP for a repeatable task
export function canEarnXp(
  rewardId: string,
  lastEarnedAt: Date | null,
  earnedToday: number,
  earnedThisWeek: number = 0
): { canEarn: boolean; reason?: string; cooldownRemaining?: number } {
  const reward = XP_REWARDS.find((r) => r.id === rewardId);
  if (!reward) return { canEarn: false, reason: "Invalid reward" };

  // Check daily limit
  if (reward.maxPerDay && earnedToday >= reward.maxPerDay) {
    return { canEarn: false, reason: `Daily limit reached (${reward.maxPerDay})` };
  }

  // Check cooldown
  if (reward.cooldownHours && lastEarnedAt) {
    const hoursSince = (Date.now() - lastEarnedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince < reward.cooldownHours) {
      const remaining = Math.ceil(reward.cooldownHours - hoursSince);
      return {
        canEarn: false,
        reason: `Cooldown: ${remaining}h remaining`,
        cooldownRemaining: remaining,
      };
    }
  }

  return { canEarn: true };
}

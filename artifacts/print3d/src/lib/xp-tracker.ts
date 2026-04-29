import { supabase } from "@/lib/supabase";
import { XP_REWARDS, XpAction, calculateRank, checkSponsorshipReward } from "./rank-system";

export interface XpLogEntry {
  id: string;
  userId: string;
  action: XpAction;
  xpAmount: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface XpAwardResult {
  success: boolean;
  xpAwarded: number;
  newTotal: number;
  newRank: number;
  rankUp: boolean;
  sponsorshipReward?: { tier: "silver" | "gold" | "premium"; duration: number };
  error?: string;
}

// Award XP to a user
export async function awardXp(
  userId: string,
  action: XpAction,
  metadata?: Record<string, any>
): Promise<XpAwardResult> {
  try {
    const xpAmount = XP_REWARDS[action];
    
    // Get current user XP data
    const { data: currentData, error: fetchError } = await supabase
      .from("user_xp")
      .select("total_xp, current_rank")
      .eq("user_id", userId)
      .single();
    
    if (fetchError) {
      return { success: false, xpAwarded: 0, newTotal: 0, newRank: 1, rankUp: false, error: fetchError.message };
    }
    
    const oldTotal = currentData?.total_xp || 0;
    const oldRank = currentData?.current_rank || 1;
    const newTotal = oldTotal + xpAmount;
    
    // Calculate new rank
    const { currentRank: newRankData } = calculateRank(newTotal);
    const newRank = newRankData.id;
    const rankUp = newRank > oldRank;
    
    // Check for sponsorship reward on rank up
    let sponsorshipReward = null;
    if (rankUp) {
      sponsorshipReward = checkSponsorshipReward(oldRank, newRank);
    }
    
    // Update user XP
    const { error: updateError } = await supabase
      .from("user_xp")
      .upsert({
        user_id: userId,
        total_xp: newTotal,
        current_rank: newRank,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    
    if (updateError) {
      return { success: false, xpAwarded: 0, newTotal: oldTotal, newRank: oldRank, rankUp: false, error: updateError.message };
    }
    
    // Log the XP award
    await supabase.from("xp_log").insert({
      user_id: userId,
      action: action,
      xp_amount: xpAmount,
      description: getXpDescription(action, metadata),
      metadata: metadata || {},
      created_at: new Date().toISOString()
    });
    
    // If rank up with sponsorship reward, activate it
    if (sponsorshipReward) {
      await activateSponsorshipReward(userId, sponsorshipReward);
    }
    
    // If rank 7 (Synthix Icon), activate lifetime pro membership
    if (rankUp && newRank === 7) {
      await activateLifetimeProMembership(userId);
    }
    
    return {
      success: true,
      xpAwarded: xpAmount,
      newTotal,
      newRank,
      rankUp,
      sponsorshipReward: sponsorshipReward || undefined
    };
    
  } catch (error) {
    return { 
      success: false, 
      xpAwarded: 0, 
      newTotal: 0, 
      newRank: 1, 
      rankUp: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// Get human-readable description for XP action
function getXpDescription(action: XpAction, metadata?: Record<string, any>): string {
  const descriptions: Record<XpAction, string> = {
    COMPLETE_PROFILE: "Completed profile setup",
    ADD_FIRST_LISTING: "Added first product listing",
    ADD_LISTING: "Added new product listing",
    UPDATE_SHOP_BANNER: "Updated shop banner",
    RECEIVE_FIRST_ORDER: "Received first order",
    SHIP_ORDER: "Shipped an order",
    COMPLETE_ORDER: "Completed an order",
    RECEIVE_5_STAR_REVIEW: "Received 5-star review",
    RECEIVE_POSITIVE_REVIEW: "Received positive review",
    ACCEPT_CUSTOM_REQUEST: "Accepted custom order request",
    SUBMIT_QUOTE: "Submitted quote for custom order",
    QUOTE_ACCEPTED: "Quote accepted by buyer",
    COMPLETE_CUSTOM_ORDER: "Completed custom order",
    RESPOND_TO_MESSAGE: "Responded to customer message",
    CONTEST_ENTRY: "Entered contest",
    CONTEST_WIN: "Won 1st place in contest",
    CONTEST_PLACE_2ND: "Placed 2nd in contest",
    CONTEST_PLACE_3RD: "Placed 3rd in contest",
    REFER_SELLER: "Referred new seller",
    REFER_BUYER: "Referred new buyer",
    SHARE_ON_SOCIAL: "Shared on social media",
    FIRST_100_SALES: "Milestone: 100 sales",
    FIRST_500_SALES: "Milestone: 500 sales",
    FIRST_1000_SALES: "Milestone: 1000 sales"
  };
  
  let description = descriptions[action] || action;
  
  if (metadata?.orderId) {
    description += ` (Order #${metadata.orderId})`;
  }
  if (metadata?.reviewerName) {
    description += ` from ${metadata.reviewerName}`;
  }
  if (metadata?.contestName) {
    description += ` - ${metadata.contestName}`;
  }
  
  return description;
}

// Activate sponsorship reward
async function activateSponsorshipReward(
  userId: string, 
  reward: { tier: "silver" | "gold" | "premium"; duration: number }
): Promise<void> {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + reward.duration * 60 * 60 * 1000);
  
  await supabase.from("sponsorships").insert({
    user_id: userId,
    tier: reward.tier,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    is_active: true,
    source: "rank_reward"
  });
}

// Activate lifetime pro membership for Synthix Icon rank
async function activateLifetimeProMembership(userId: string): Promise<void> {
  // Set a very far future date (100 years) to represent "lifetime"
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
  
  await supabase.from("sponsorships").insert({
    user_id: userId,
    tier: "premium",
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    is_active: true,
    source: "rank_7_lifetime_pro"
  });
  
  // Also update user profile to mark as lifetime pro
  await supabase.from("profiles").update({
    is_pro_member: true,
    pro_member_since: startDate.toISOString(),
    pro_member_type: "lifetime"
  }).eq("id", userId);
}

// Get user's XP history
export async function getXpHistory(userId: string, limit = 50): Promise<XpLogEntry[]> {
  const { data, error } = await supabase
    .from("xp_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  
  return data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    action: entry.action as XpAction,
    xpAmount: entry.xp_amount,
    description: entry.description,
    metadata: entry.metadata,
    createdAt: entry.created_at
  }));
}

// Get user's current XP stats
export async function getUserXpStats(userId: string): Promise<{
  totalXp: number;
  currentRank: number;
  weeklyXp: number;
  monthlyXp: number;
} | null> {
  const { data, error } = await supabase
    .from("user_xp")
    .select("total_xp, current_rank")
    .eq("user_id", userId)
    .single();
  
  if (error || !data) return null;
  
  // Calculate weekly and monthly XP
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const [{ data: weeklyData }, { data: monthlyData }] = await Promise.all([
    supabase.from("xp_log").select("xp_amount").eq("user_id", userId).gte("created_at", oneWeekAgo),
    supabase.from("xp_log").select("xp_amount").eq("user_id", userId).gte("created_at", oneMonthAgo)
  ]);
  
  const weeklyXp = weeklyData?.reduce((sum, entry) => sum + entry.xp_amount, 0) || 0;
  const monthlyXp = monthlyData?.reduce((sum, entry) => sum + entry.xp_amount, 0) || 0;
  
  return {
    totalXp: data.total_xp,
    currentRank: data.current_rank,
    weeklyXp,
    monthlyXp
  };
}

// Batch award XP (for admin/migration)
export async function batchAwardXp(
  awards: { userId: string; action: XpAction; metadata?: Record<string, any> }[]
): Promise<XpAwardResult[]> {
  const results: XpAwardResult[] = [];
  
  for (const award of awards) {
    const result = await awardXp(award.userId, award.action, award.metadata);
    results.push(result);
  }
  
  return results;
}

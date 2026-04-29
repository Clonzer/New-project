import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { awardXp, XpAwardResult, XpAction } from "@/lib/xp-tracker";
import { useAuth } from "@/hooks/use-auth";

interface UseXpAwardsReturn {
  awardXpForAction: (action: XpAction, metadata?: Record<string, any>) => Promise<XpAwardResult>;
  awardXpSilent: (action: XpAction, metadata?: Record<string, any>) => Promise<XpAwardResult>;
}

export function useXpAwards(): UseXpAwardsReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  const awardXpForAction = useCallback(async (
    action: XpAction,
    metadata?: Record<string, any>
  ): Promise<XpAwardResult> => {
    if (!user?.id) {
      return { success: false, xpAwarded: 0, newTotal: 0, newRank: 1, rankUp: false, error: "Not authenticated" };
    }

    const result = await awardXp(user.id, action, metadata);

    if (result.success) {
      if (result.rankUp && result.sponsorshipReward) {
        toast({
          title: "🎉 Rank Up!",
          description: `Congratulations! You've reached a new rank and earned ${result.sponsorshipReward.duration}h of ${result.sponsorshipReward.tier} sponsorship!`,
          variant: "default",
        });
      } else {
        // Show subtle XP gain toast for significant amounts
        if (result.xpAwarded >= 25) {
          toast({
            title: `+${result.xpAwarded} XP`,
            description: "Keep it up! You're making progress.",
            variant: "default",
          });
        }
      }
    }

    return result;
  }, [user?.id, toast]);

  const awardXpSilent = useCallback(async (
    action: XpAction,
    metadata?: Record<string, any>
  ): Promise<XpAwardResult> => {
    if (!user?.id) {
      return { success: false, xpAwarded: 0, newTotal: 0, newRank: 1, rankUp: false, error: "Not authenticated" };
    }

    return await awardXp(user.id, action, metadata);
  }, [user?.id]);

  return { awardXpForAction, awardXpSilent };
}

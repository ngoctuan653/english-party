import { usePremiumStore, MAX_FREE_SPEAKING_TURNS } from '@/stores/premiumStore';
import type { PremiumTier } from '@/types/payment';

export function useSpeakingQuota() {
  const isPremium = usePremiumStore((state) => state.isUserPremium());
  const premiumInfo = usePremiumStore((state) => state.premiumInfo);
  const dailyQuota = usePremiumStore((state) => state.dailyQuota);
  const canSpeakWithAi = usePremiumStore((state) => state.canSpeakWithAi);
  const consumeSpeakingTurn = usePremiumStore((state) => state.consumeSpeakingTurn);
  const getRemainingTurns = usePremiumStore((state) => state.getRemainingTurns);
  const openUpgradeModal = usePremiumStore((state) => state.openUpgradeModal);

  const totalUsed = dailyQuota.englishTurnsUsed + dailyQuota.chineseTurnsUsed;
  const remaining = getRemainingTurns();

  return {
    isPremium,
    tier: premiumInfo.tier as PremiumTier,
    expiresAt: premiumInfo.expiresAt,
    activatedVia: premiumInfo.activatedVia,
    remainingTurns: remaining,
    turnsUsedToday: totalUsed,
    maxFreeTurns: MAX_FREE_SPEAKING_TURNS,
    canSpeak: canSpeakWithAi(),
    consumeTurn: (language: 'english' | 'chinese') => consumeSpeakingTurn(language),
    openUpgradeModal,
  };
}

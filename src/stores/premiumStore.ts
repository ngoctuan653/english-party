import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DailySpeakingQuota,
  PaymentTransaction,
  PremiumTier,
  UserPremiumInfo,
} from '@/types/payment';

export const MAX_FREE_SPEAKING_TURNS = 3;

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface PremiumState {
  premiumInfo: UserPremiumInfo;
  dailyQuota: DailySpeakingQuota;
  transactions: PaymentTransaction[];
  isUpgradeModalOpen: boolean;
  selectedPlanId: PremiumTier;

  // Actions
  isUserPremium: () => boolean;
  activatePremium: (params: {
    tier: PremiumTier;
    grantDays?: number;
    activatedVia: 'vnpay' | 'sandbox' | 'voucher';
    voucherCode?: string;
    txnRef?: string;
  }) => void;
  deactivatePremium: () => void;
  canSpeakWithAi: (language?: 'english' | 'chinese') => boolean;
  consumeSpeakingTurn: (language: 'english' | 'chinese') => boolean;
  getRemainingTurns: (language?: 'english' | 'chinese') => number;
  openUpgradeModal: (planId?: PremiumTier) => void;
  closeUpgradeModal: () => void;
  addTransaction: (txn: PaymentTransaction) => void;
  syncFromProfile: (profilePremium?: UserPremiumInfo | null) => void;
}

const defaultPremiumInfo: UserPremiumInfo = {
  isPremium: false,
  tier: 'free',
  activatedAt: null,
  expiresAt: null,
  activatedVia: 'sandbox',
};

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      premiumInfo: defaultPremiumInfo,
      dailyQuota: {
        date: getTodayKey(),
        englishTurnsUsed: 0,
        chineseTurnsUsed: 0,
        maxFreeTurns: MAX_FREE_SPEAKING_TURNS,
      },
      transactions: [],
      isUpgradeModalOpen: false,
      selectedPlanId: 'annual',

      isUserPremium: () => {
        const { premiumInfo } = get();
        if (!premiumInfo.isPremium) return false;

        // Lifetime has no expiry
        if (!premiumInfo.expiresAt) return true;

        const now = new Date().getTime();
        const expiry = new Date(premiumInfo.expiresAt).getTime();
        if (now > expiry) {
          // Auto expire
          set({
            premiumInfo: {
              ...premiumInfo,
              isPremium: false,
              tier: 'free',
            },
          });
          return false;
        }

        return true;
      },

      activatePremium: ({ tier, grantDays, activatedVia, voucherCode, txnRef }) => {
        const now = new Date();
        let expiresAt: string | null = null;

        if (tier === 'lifetime') {
          expiresAt = null;
        } else if (grantDays) {
          const exp = new Date(now.getTime() + grantDays * 24 * 60 * 60 * 1000);
          expiresAt = exp.toISOString();
        } else {
          const daysMap: Record<PremiumTier, number> = {
            free: 0,
            monthly: 30,
            quarterly: 90,
            annual: 365,
            lifetime: 0,
          };
          const days = daysMap[tier] || 30;
          const exp = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          expiresAt = exp.toISOString();
        }

        const updated: UserPremiumInfo = {
          isPremium: true,
          tier,
          activatedAt: now.toISOString(),
          expiresAt,
          activatedVia,
          voucherCodeUsed: voucherCode,
          transactionRef: txnRef,
        };

        set({ premiumInfo: updated });
      },

      deactivatePremium: () => {
        set({ premiumInfo: defaultPremiumInfo });
      },

      canSpeakWithAi: () => {
        if (get().isUserPremium()) return true;

        const today = getTodayKey();
        const currentQuota = get().dailyQuota;
        if (currentQuota.date !== today) {
          // Reset quota for new day
          set({
            dailyQuota: {
              date: today,
              englishTurnsUsed: 0,
              chineseTurnsUsed: 0,
              maxFreeTurns: MAX_FREE_SPEAKING_TURNS,
            },
          });
          return true;
        }

        const totalUsed = currentQuota.englishTurnsUsed + currentQuota.chineseTurnsUsed;
        return totalUsed < MAX_FREE_SPEAKING_TURNS;
      },

      consumeSpeakingTurn: (language: 'english' | 'chinese') => {
        if (get().isUserPremium()) return true;

        const today = getTodayKey();
        const { dailyQuota } = get();

        const activeQuota =
          dailyQuota.date === today
            ? dailyQuota
            : {
                date: today,
                englishTurnsUsed: 0,
                chineseTurnsUsed: 0,
                maxFreeTurns: MAX_FREE_SPEAKING_TURNS,
              };

        const totalUsed = activeQuota.englishTurnsUsed + activeQuota.chineseTurnsUsed;
        if (totalUsed >= MAX_FREE_SPEAKING_TURNS) {
          return false;
        }

        const updated = {
          ...activeQuota,
          englishTurnsUsed:
            language === 'english'
              ? activeQuota.englishTurnsUsed + 1
              : activeQuota.englishTurnsUsed,
          chineseTurnsUsed:
            language === 'chinese'
              ? activeQuota.chineseTurnsUsed + 1
              : activeQuota.chineseTurnsUsed,
        };

        set({ dailyQuota: updated });
        return true;
      },

      getRemainingTurns: () => {
        if (get().isUserPremium()) return Infinity;

        const today = getTodayKey();
        const { dailyQuota } = get();
        if (dailyQuota.date !== today) {
          return MAX_FREE_SPEAKING_TURNS;
        }

        const totalUsed = dailyQuota.englishTurnsUsed + dailyQuota.chineseTurnsUsed;
        return Math.max(0, MAX_FREE_SPEAKING_TURNS - totalUsed);
      },

      openUpgradeModal: (planId?: PremiumTier) => {
        set({
          isUpgradeModalOpen: true,
          selectedPlanId: planId || get().selectedPlanId || 'annual',
        });
      },

      closeUpgradeModal: () => {
        set({ isUpgradeModalOpen: false });
      },

      addTransaction: (txn: PaymentTransaction) => {
        set((state) => ({
          transactions: [txn, ...state.transactions].slice(0, 50),
        }));
      },

      syncFromProfile: (profilePremium) => {
        if (!profilePremium) return;
        const current = get().premiumInfo;
        // If profile has more recent VIP status, merge
        if (profilePremium.isPremium) {
          set({ premiumInfo: profilePremium });
        } else if (current.isPremium) {
          // Local has VIP, keep local
        }
      },
    }),
    {
      name: 'ep_premium_store',
      partialize: (state) => ({
        premiumInfo: state.premiumInfo,
        dailyQuota: state.dailyQuota,
        transactions: state.transactions,
      }),
    }
  )
);

export type PremiumTier = 'free' | 'monthly' | 'quarterly' | 'annual' | 'lifetime';

export interface UserPremiumInfo {
  isPremium: boolean;
  tier: PremiumTier;
  activatedAt: string | null;      // ISO string
  expiresAt: string | null;        // ISO string (null if lifetime)
  activatedVia: 'vnpay' | 'sandbox' | 'voucher';
  voucherCodeUsed?: string;
  transactionRef?: string;
}

export interface DailySpeakingQuota {
  date: string;                   // Format: YYYY-MM-DD
  englishTurnsUsed: number;       // Number of English AI conversation turns used today
  chineseTurnsUsed: number;       // Number of Chinese AI conversation turns used today
  maxFreeTurns: number;           // Default: 3 turns/day
}

export interface VoucherCode {
  code: string;                   // E.g. "VIPFREE", "AI2026"
  description: string;
  type: 'free_access' | 'discount_percent' | 'discount_amount';
  grantTier?: PremiumTier;
  grantDays?: number;             // E.g. 30, 90, 365, 9999
  discountValue?: number;         // Percent (e.g. 50) or VNĐ amount
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export interface PaymentPlan {
  id: PremiumTier;
  name: string;
  description: string;
  durationDays: number;
  priceVnd: number;
  originalPriceVnd?: number;
  discountBadge?: string;
  isPopular?: boolean;
  features: string[];
}

export interface PaymentTransaction {
  id: string;                     // Internal transaction ref, e.g. "EP_TXN_1728123456"
  userId?: string;
  userEmail?: string;
  tier: PremiumTier;
  planName: string;
  amount: number;                 // Final amount charged in VNĐ
  originalAmount: number;
  discountAmount: number;
  voucherCode?: string;
  gateway: 'vnpay' | 'sandbox_mock';
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  vnpayTxnRef?: string;
  vnpayTransactionNo?: string;
  vnpayBankCode?: string;
  vnpayResponseCode?: string;
  message?: string;
  createdAt: string;
  completedAt?: string;
}

export interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  paymentUrl: string;
  returnUrl: string;
}

export interface VNPayTestCard {
  bank: string;
  cardNumber: string;
  cardHolder: string;
  issueDate: string;
  otp: string;
}

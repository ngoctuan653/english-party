import type { VoucherCode } from '@/types/payment';

export const SEED_VOUCHERS: VoucherCode[] = [
  {
    code: 'VIPFREE',
    description: 'Kích hoạt VIP Trọn Đời (Lifetime Special) dành cho Reviewer & Admin',
    type: 'free_access',
    grantTier: 'lifetime',
    grantDays: 99999,
    maxUses: 10000,
    usedCount: 0,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2030-12-31T23:59:59Z',
    isActive: true,
  },
  {
    code: 'AI2026',
    description: 'Quà tặng 1 Năm VIP Speaking with AI không giới hạn (365 ngày)',
    type: 'free_access',
    grantTier: 'annual',
    grantDays: 365,
    maxUses: 5000,
    usedCount: 0,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2027-12-31T23:59:59Z',
    isActive: true,
  },
  {
    code: 'SPEAKINGPRO',
    description: 'Trải nghiệm 30 ngày VIP Speaking with AI miễn phí',
    type: 'free_access',
    grantTier: 'monthly',
    grantDays: 30,
    maxUses: 2000,
    usedCount: 0,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2027-12-31T23:59:59Z',
    isActive: true,
  },
  {
    code: 'TIENGTRUNGVIP',
    description: 'Gói ưu đãi 90 ngày VIP Luyện Phản Xạ Tiếng Trung HSK & Tiếng Anh AI',
    type: 'free_access',
    grantTier: 'quarterly',
    grantDays: 90,
    maxUses: 1000,
    usedCount: 0,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2027-12-31T23:59:59Z',
    isActive: true,
  },
  {
    code: 'STUDENT50',
    description: 'Ưu đãi sinh viên giảm 50% tất cả các gói thanh toán VNPay',
    type: 'discount_percent',
    discountValue: 50,
    maxUses: 3000,
    usedCount: 0,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2027-12-31T23:59:59Z',
    isActive: true,
  },
  {
    code: 'SALE30K',
    description: 'Giảm ngay 30.000 VNĐ khi thanh toán bất kỳ gói nào',
    type: 'discount_amount',
    discountValue: 30000,
    maxUses: 1000,
    usedCount: 0,
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2027-12-31T23:59:59Z',
    isActive: true,
  },
];

export interface VoucherValidationResult {
  isValid: boolean;
  message: string;
  voucher?: VoucherCode;
  discountedPrice?: number;
  discountAmount?: number;
  is100PercentFree?: boolean;
}

export function validateVoucherCode(
  rawCode: string,
  basePriceVnd: number = 0
): VoucherValidationResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { isValid: false, message: 'Vui lòng nhập mã voucher.' };
  }

  // Look up in seed vouchers (can also query Firestore in future)
  const voucher = SEED_VOUCHERS.find((v) => v.code === code);
  if (!voucher) {
    return {
      isValid: false,
      message: `Mã "${code}" không tồn tại hoặc đã hết hạn.`,
    };
  }

  if (!voucher.isActive) {
    return {
      isValid: false,
      message: 'Mã voucher này hiện đang tạm khóa.',
    };
  }

  const now = new Date();
  if (new Date(voucher.validFrom) > now || new Date(voucher.validTo) < now) {
    return {
      isValid: false,
      message: 'Mã voucher đã hết thời hạn sử dụng.',
    };
  }

  if (voucher.usedCount >= voucher.maxUses) {
    return {
      isValid: false,
      message: 'Mã voucher đã đạt giới hạn số lượt sử dụng.',
    };
  }

  // Handle 100% Free activation
  if (voucher.type === 'free_access') {
    return {
      isValid: true,
      message: `Áp dụng thành công: ${voucher.description}! Bạn được kích hoạt VIP hoàn toàn miễn phí.`,
      voucher,
      is100PercentFree: true,
      discountedPrice: 0,
      discountAmount: basePriceVnd,
    };
  }

  // Handle % discount
  if (voucher.type === 'discount_percent' && voucher.discountValue) {
    const discount = Math.round((basePriceVnd * voucher.discountValue) / 100);
    const finalPrice = Math.max(0, basePriceVnd - discount);
    return {
      isValid: true,
      message: `Áp dụng thành công: Giảm ${voucher.discountValue}% (${discount.toLocaleString('vi-VN')} đ)!`,
      voucher,
      is100PercentFree: false,
      discountedPrice: finalPrice,
      discountAmount: discount,
    };
  }

  // Handle fixed amount discount
  if (voucher.type === 'discount_amount' && voucher.discountValue) {
    const discount = Math.min(basePriceVnd, voucher.discountValue);
    const finalPrice = Math.max(0, basePriceVnd - discount);
    return {
      isValid: true,
      message: `Áp dụng thành công: Giảm ${discount.toLocaleString('vi-VN')} đ vào tổng thanh toán!`,
      voucher,
      is100PercentFree: finalPrice === 0,
      discountedPrice: finalPrice,
      discountAmount: discount,
    };
  }

  return { isValid: false, message: 'Loại voucher không xác định.' };
}

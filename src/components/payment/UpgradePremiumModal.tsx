import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  Tag,
  CreditCard,
  Zap,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePremiumStore } from '@/stores/premiumStore';
import { PREMIUM_PLANS } from '@/services/payment/plans';
import {
  validateVoucherCode,
  type VoucherValidationResult,
  SEED_VOUCHERS
} from '@/services/payment/voucher';
import {
  createVNPayPaymentUrl,
  VNPAY_TEST_CARDS
} from '@/services/payment/vnpay';
import { simulateSandboxPayment } from '@/services/payment/sandbox';
import type { PremiumTier } from '@/types/payment';

export const UpgradePremiumModal: React.FC = () => {
  const isModalOpen = usePremiumStore((state) => state.isUpgradeModalOpen);
  const selectedPlanId = usePremiumStore((state) => state.selectedPlanId);
  const closeModal = usePremiumStore((state) => state.closeUpgradeModal);
  const activatePremium = usePremiumStore((state) => state.activatePremium);

  const [activePlanId, setActivePlanId] = useState<PremiumTier>(selectedPlanId || 'annual');
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucherResult, setAppliedVoucherResult] = useState<VoucherValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showTestCardInfo, setShowTestCardInfo] = useState(false);

  if (!isModalOpen) return null;

  const currentPlan =
    PREMIUM_PLANS.find((p) => p.id === activePlanId) || PREMIUM_PLANS[2];

  // Calculate final price based on voucher
  const finalPrice = appliedVoucherResult?.discountedPrice !== undefined
    ? appliedVoucherResult.discountedPrice
    : currentPlan.priceVnd;

  const discountAmount = appliedVoucherResult?.discountAmount || 0;

  const handleApplyVoucher = (codeToApply?: string) => {
    const code = codeToApply || voucherInput;
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã voucher!');
      return;
    }

    const result = validateVoucherCode(code, currentPlan.priceVnd);
    if (!result.isValid) {
      toast.error(result.message);
      setAppliedVoucherResult(null);
      return;
    }

    setAppliedVoucherResult(result);
    setVoucherInput(code.toUpperCase());
    toast.success(result.message);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucherResult(null);
    setVoucherInput('');
    toast('Đã gỡ bỏ mã voucher.', { icon: 'ℹ️' });
  };

  // 100% Free Voucher instant activation
  const handleActivateFreeVoucher = () => {
    if (!appliedVoucherResult?.voucher) return;
    const v = appliedVoucherResult.voucher;

    setIsLoading(true);
    setTimeout(() => {
      activatePremium({
        tier: v.grantTier || activePlanId,
        grantDays: v.grantDays || currentPlan.durationDays,
        activatedVia: 'voucher',
        voucherCode: v.code,
        txnRef: `VOUCHER_${Date.now()}`,
      });
      setIsLoading(false);
      toast.success(`🎉 Chúc mừng! Bạn đã kích hoạt thành công gói VIP qua mã "${v.code}"!`);
      closeModal();
    }, 400);
  };

  // VNPay Sandbox redirect
  const handlePayWithVNPay = async () => {
    try {
      setIsLoading(true);
      const orderId = `EP_${Date.now()}`;
      const orderInfo = `Thanh toan goi VIP ${currentPlan.name} EnglishParty`;

      const paymentUrl = await createVNPayPaymentUrl({
        orderId,
        amountVnd: finalPrice,
        orderInfo,
      });

      // Save pending transaction info to store
      usePremiumStore.getState().addTransaction({
        id: orderId,
        tier: currentPlan.id,
        planName: currentPlan.name,
        amount: finalPrice,
        originalAmount: currentPlan.priceVnd,
        discountAmount,
        voucherCode: appliedVoucherResult?.voucher?.code,
        gateway: 'vnpay',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      toast.loading('Đang chuyển hướng sang cổng thanh toán VNPay Sandbox...');
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      toast.error('Không thể tạo liên kết VNPay: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  // Sandbox 1-Click Simulator
  const handleSandboxSimulate = async (scenario: 'success' | 'failure' | 'cancelled') => {
    setIsLoading(true);
    const res = await simulateSandboxPayment({
      plan: currentPlan,
      scenario,
      voucherCode: appliedVoucherResult?.voucher?.code,
      discountAmount,
    });
    setIsLoading(false);

    if (res.isSuccess) {
      toast.success(`🎉 ${res.message}`);
      closeModal();
    } else if (res.status === 'failed') {
      toast.error(res.message);
    } else {
      toast(res.message, { icon: 'ℹ️' });
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`Đã copy ${label}: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-6">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white p-6 sm:p-8">
          <div className="absolute -right-10 -bottom-10 opacity-15 text-white pointer-events-none">
            <Crown className="w-56 h-56" />
          </div>

          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-100 border border-white/20">
              <Crown className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>NÂNG CẤP ĐẶC QUYỀN VIP SPEAKING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Luyện Nói Không Giới Hạn Với Gia Sư AI
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              Mở khóa 100% tính năng đàm thoại nhập vai (Roleplay), phản xạ phòng thi IELTS/CEFR và Tiếng Trung HSK cùng giọng đọc AI tự nhiên 24/7.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Plan Cards Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Chọn gói thời hạn phù hợp với bạn:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PREMIUM_PLANS.map((plan) => {
                const isSelected = activePlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setActivePlanId(plan.id)}
                    className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-400/30'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {plan.discountBadge && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm">
                        {plan.discountBadge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-800">{plan.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-amber-600 fill-amber-100" />
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                            {plan.priceVnd.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">đ</span>
                        </div>
                        {plan.originalPriceVnd && (
                          <div className="text-xs text-slate-400 line-through mt-0.5">
                            {plan.originalPriceVnd.toLocaleString('vi-VN')} đ
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 space-y-1.5">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voucher Section */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-amber-500" />
                <span>Nhập Mã Voucher / Giftcode (Kích hoạt miễn phí hoặc Giảm giá):</span>
              </span>
              {appliedVoucherResult && (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Gỡ bỏ mã
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã: AI2026, VIPFREE, STUDENT50..."
                className="flex-1 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 uppercase font-mono shadow-sm"
              />
              <button
                type="button"
                onClick={() => handleApplyVoucher()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
              >
                Áp dụng
              </button>
            </div>

            {/* Quick Test Voucher Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Gợi ý mã test:</span>
              {SEED_VOUCHERS.slice(0, 4).map((v) => (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => handleApplyVoucher(v.code)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-700 hover:border-amber-400 hover:text-amber-600 transition-all cursor-pointer shadow-2xs"
                  title={v.description}
                >
                  {v.code} {v.type === 'free_access' ? '(Free VIP)' : '(-50%)'}
                </button>
              ))}
            </div>

            {/* Voucher Applied Feedback */}
            {appliedVoucherResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  appliedVoucherResult.is100PercentFree
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">{appliedVoucherResult.message}</span>
                  </div>
                </div>

                {appliedVoucherResult.is100PercentFree && (
                  <button
                    type="button"
                    onClick={handleActivateFreeVoucher}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    Kích Hoạt VIP Ngay (0 đ)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-2">
            <div>
              <span className="text-xs text-slate-400">Tổng thanh toán:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {finalPrice.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-bold text-slate-800">VNĐ</span>
                {discountAmount > 0 && (
                  <span className="text-xs text-rose-500 font-bold">
                    (Tiết kiệm {discountAmount.toLocaleString('vi-VN')} đ)
                  </span>
                )}
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              <span>Gói đăng ký: </span>
              <strong className="text-slate-800 font-semibold">{currentPlan.name}</strong>
            </div>
          </div>

          {/* Payment Gateways Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Chọn phương thức thanh toán / thử nghiệm:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* VNPay Gateway Button */}
              <button
                type="button"
                onClick={handlePayWithVNPay}
                disabled={isLoading}
                className="group relative p-4 rounded-2xl border-2 border-rose-200 bg-gradient-to-r from-rose-50/50 via-white to-blue-50/40 hover:border-rose-400 transition-all text-left flex items-center justify-between shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-1.5 shadow-sm">
                    <span className="font-black text-xs text-rose-600 tracking-tighter">
                      VNPAY
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>Cổng VNPay Sandbox</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-600">
                        Test ATM
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chuyển hướng cổng thanh toán VNPay Sandbox
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </button>

              {/* Sandbox Direct Simulator */}
              <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/30 flex flex-col justify-between space-y-2">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-400" />
                    <span>Sandbox Test Simulator (1-Click)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thử nghiệm nhanh không cần thẻ ngân hàng
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSandboxSimulate('success')}
                    disabled={isLoading}
                    className="flex-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm cursor-pointer text-center"
                  >
                    ✓ Test Thành Công
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSandboxSimulate('failure')}
                    disabled={isLoading}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                    title="Mô phỏng lỗi thanh toán"
                  >
                    ✗ Lỗi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSandboxSimulate('cancelled')}
                    disabled={isLoading}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                    title="Mô phỏng hủy thanh toán"
                  >
                    ↩ Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Test Card Info Drawer */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-2">
            <button
              type="button"
              onClick={() => setShowTestCardInfo(!showTestCardInfo)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span>Xem thông tin thẻ ATM Test của VNPay Sandbox (Bấm để lấy số thẻ)</span>
              </div>
              <span className="text-xs text-amber-600 underline">
                {showTestCardInfo ? 'Thu gọn' : 'Xem chi tiết'}
              </span>
            </button>

            {showTestCardInfo && (
              <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs">
                {VNPAY_TEST_CARDS.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800">{card.bank}</div>
                      <div className="font-mono text-slate-600 font-bold flex items-center gap-2">
                        <span>Số thẻ: {card.cardNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(card.cardNumber, 'Số thẻ')}
                          className="text-amber-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedText === 'Số thẻ' ? 'Đã copy' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Chủ thẻ: <strong>{card.cardHolder}</strong> • Ngày: <strong>{card.issueDate}</strong> • OTP: <strong>{card.otp}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Môi trường thanh toán thử nghiệm Sandbox bảo mật theo chuẩn VNPay.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

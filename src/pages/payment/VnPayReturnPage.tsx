import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Crown,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Home,
  Mic,
  Calendar,
  CreditCard,
  Volume2
} from 'lucide-react';
import { verifyVNPayReturn, type ParsedVNPayReturn } from '@/services/payment/vnpay';
import { usePremiumStore } from '@/stores/premiumStore';
import { PREMIUM_PLANS } from '@/services/payment/plans';

export default function VnPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activatePremium = usePremiumStore((state) => state.activatePremium);
  const addTransaction = usePremiumStore((state) => state.addTransaction);

  const [isVerifying, setIsVerifying] = useState(true);
  const [result, setResult] = useState<ParsedVNPayReturn | null>(null);

  useEffect(() => {
    async function processVNPayReturn() {
      try {
        const parsed = await verifyVNPayReturn(searchParams);
        setResult(parsed);

        if (parsed.isSuccess) {
          // Identify plan from amount or default to annual
          const matchedPlan =
            PREMIUM_PLANS.find((p) => p.priceVnd === parsed.amountVnd) ||
            PREMIUM_PLANS[2];

          // Activate VIP
          activatePremium({
            tier: matchedPlan.id,
            grantDays: matchedPlan.durationDays,
            activatedVia: 'vnpay',
            txnRef: parsed.txnRef,
          });

          // Record completed transaction
          addTransaction({
            id: parsed.txnRef || `VNPAY_${Date.now()}`,
            tier: matchedPlan.id,
            planName: matchedPlan.name,
            amount: parsed.amountVnd,
            originalAmount: matchedPlan.priceVnd,
            discountAmount: 0,
            gateway: 'vnpay',
            status: 'success',
            vnpayTxnRef: parsed.txnRef,
            vnpayTransactionNo: parsed.transactionNo,
            vnpayBankCode: parsed.bankCode,
            vnpayResponseCode: parsed.responseCode,
            message: parsed.message,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Lỗi đối soát VNPay:', err);
      } finally {
        setIsVerifying(false);
      }
    }

    processVNPayReturn();
  }, [searchParams, activatePremium, addTransaction]);

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Đang đối soát kết quả giao dịch VNPay...
          </h2>
          <p className="text-xs text-slate-400">Vui lòng không tắt hoặc tải lại trang.</p>
        </div>
      </div>
    );
  }

  const isSuccess = result?.isSuccess;

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-6">
      {/* Result Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div
          className={`p-6 sm:p-8 text-center text-white relative overflow-hidden ${
            isSuccess
              ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
              : 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800'
          }`}
        >
          <div className="relative z-10 space-y-3">
            <div
              className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-xl ${
                isSuccess ? 'bg-white/20 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-1">
                <span>VNPay Sandbox Gateway</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                {isSuccess ? 'THANH TOÁN THÀNH CÔNG!' : 'GIAO DỊCH KHÔNG THÀNH CÔNG'}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md mx-auto">
                {result?.message}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice / Receipt Details */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/60 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500">Mã đơn hàng (TxnRef):</span>
              <span className="font-mono font-bold text-slate-800">{result?.txnRef}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500">Số tiền thanh toán:</span>
              <span className="font-mono font-black text-slate-900 text-base">
                {result?.amountVnd.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            {result?.transactionNo && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500">Mã giao dịch VNPay:</span>
                <span className="font-mono text-slate-700">{result.transactionNo}</span>
              </div>
            )}

            {result?.bankCode && (
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500">Ngân hàng thanh toán:</span>
                <span className="font-bold text-slate-700">{result.bankCode}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Trạng thái quyền lợi:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                  isSuccess
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {isSuccess ? 'Đã kích hoạt VIP Speaking' : 'Chưa kích hoạt'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {isSuccess ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/speaking"
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm shadow-md shadow-amber-200/50 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Mic className="h-4 w-4" />
                  <span>Vào Luyện Nói Tiếng Anh</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/chinese/speaking"
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md shadow-rose-200/50 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Luyện Nói Tiếng Trung</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/speaking')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Quay lại trang Speaking & Thử lại</span>
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <Link
                to="/"
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium hover:underline"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Về trang chủ EnglishParty</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

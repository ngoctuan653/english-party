import type { PaymentPlan, PaymentTransaction } from '@/types/payment';
import { usePremiumStore } from '@/stores/premiumStore';

export interface SandboxSimulationResult {
  isSuccess: boolean;
  status: 'success' | 'failed' | 'cancelled';
  message: string;
  transaction: PaymentTransaction;
}

export function simulateSandboxPayment(params: {
  plan: PaymentPlan;
  scenario: 'success' | 'failure' | 'cancelled';
  voucherCode?: string;
  discountAmount?: number;
}): Promise<SandboxSimulationResult> {
  return new Promise((resolve) => {
    // Artificial 600ms latency to simulate real network round-trip
    setTimeout(() => {
      const { plan, scenario, voucherCode, discountAmount = 0 } = params;
      const finalAmount = Math.max(0, plan.priceVnd - discountAmount);
      const txnId = `EP_SBX_${Date.now().toString(36).toUpperCase()}`;
      const now = new Date().toISOString();

      const txnStatus: PaymentTransaction['status'] =
        scenario === 'failure' ? 'failed' : scenario;

      const txn: PaymentTransaction = {
        id: txnId,
        tier: plan.id,
        planName: plan.name,
        amount: finalAmount,
        originalAmount: plan.priceVnd,
        discountAmount,
        voucherCode,
        gateway: 'sandbox_mock',
        status: txnStatus,
        createdAt: now,
        completedAt: now,
      };

      if (scenario === 'success') {
        txn.message = 'Thanh toán Sandbox thử nghiệm thành công (1-Click Sim).';

        // Activate VIP in store
        usePremiumStore.getState().activatePremium({
          tier: plan.id,
          grantDays: plan.durationDays,
          activatedVia: 'sandbox',
          voucherCode,
          txnRef: txnId,
        });

        usePremiumStore.getState().addTransaction(txn);

        resolve({
          isSuccess: true,
          status: 'success',
          message: `Kích hoạt thành công gói ${plan.name} qua Sandbox!`,
          transaction: txn,
        });
      } else if (scenario === 'failure') {
        txn.message = 'Mô phỏng lỗi: Thẻ ngân hàng không đủ số dư hoặc bị từ chối.';
        usePremiumStore.getState().addTransaction(txn);

        resolve({
          isSuccess: false,
          status: 'failed',
          message: 'Giao dịch thất bại: Thẻ ngân hàng thử nghiệm bị từ chối.',
          transaction: txn,
        });
      } else {
        txn.message = 'Người dùng đã bấm hủy giao dịch.';
        usePremiumStore.getState().addTransaction(txn);

        resolve({
          isSuccess: false,
          status: 'cancelled',
          message: 'Giao dịch đã được hủy bỏ.',
          transaction: txn,
        });
      }
    }, 600);
  });
}

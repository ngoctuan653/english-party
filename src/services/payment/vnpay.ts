import type { VNPayConfig, VNPayTestCard } from '@/types/payment';

// VNPay Sandbox default credentials (configurable via Vite env)
export const VNPAY_SANDBOX_CONFIG: VNPayConfig = {
  tmnCode: import.meta.env.VITE_VNPAY_TMN_CODE || 'DEMOVNP1',
  hashSecret: import.meta.env.VITE_VNPAY_HASH_SECRET || 'SECRETKEYDEMOVNPAY123456789ABCDEF',
  paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl:
    typeof window !== 'undefined'
      ? `${window.location.origin}/payment/vnpay-return`
      : 'https://english-party.web.app/payment/vnpay-return',
};

export const VNPAY_TEST_CARDS: VNPayTestCard[] = [
  {
    bank: 'NCB (Ngân hàng Quốc Dân - Phổ biến nhất)',
    cardNumber: '9704198526191432198',
    cardHolder: 'NGUYEN VAN A',
    issueDate: '07/15',
    otp: '123456',
  },
  {
    bank: 'VIETINBANK',
    cardNumber: '9704151234567890',
    cardHolder: 'NGUYEN VAN A',
    issueDate: '03/17',
    otp: '123456',
  },
];

/**
 * Compute HMAC-SHA512 using standard Web Crypto API
 */
export async function computeHmacSha512(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatVNPayDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

export interface CreateVNPayUrlParams {
  orderId: string;
  amountVnd: number;
  orderInfo: string;
  clientIp?: string;
  bankCode?: string; // Optional: 'VNPAYQR', 'VNBANK', 'INTCARD'
}

/**
 * Generate full redirect URL to VNPay Sandbox
 */
export async function createVNPayPaymentUrl(
  params: CreateVNPayUrlParams,
  customConfig?: Partial<VNPayConfig>
): Promise<string> {
  const config = { ...VNPAY_SANDBOX_CONFIG, ...customConfig };
  const now = new Date();
  const createDate = formatVNPayDate(now);

  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(params.amountVnd * 100), // VNPay requires amount multiplied by 100
    vnp_CreateDate: createDate,
    vnp_CurrCode: 'VND',
    vnp_IpAddr: params.clientIp || '127.0.0.1',
    vnp_Locale: 'vn',
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: config.returnUrl,
    vnp_TxnRef: params.orderId,
  };

  if (params.bankCode) {
    vnpParams.vnp_BankCode = params.bankCode;
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(vnpParams).sort();
  const queryStringParts: string[] = [];

  for (const key of sortedKeys) {
    const value = vnpParams[key];
    if (value !== undefined && value !== null && value !== '') {
      queryStringParts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      );
    }
  }

  const signData = queryStringParts.join('&');
  const secureHash = await computeHmacSha512(config.hashSecret, signData);

  return `${config.paymentUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}

export interface ParsedVNPayReturn {
  isSuccess: boolean;
  isValidSignature: boolean;
  responseCode: string;
  transactionStatus: string;
  txnRef: string;
  amountVnd: number;
  bankCode?: string;
  transactionNo?: string;
  cardType?: string;
  payDate?: string;
  orderInfo?: string;
  message: string;
}

/**
 * Parse and verify query parameters returned from VNPay
 */
export async function verifyVNPayReturn(
  searchParams: URLSearchParams,
  customConfig?: Partial<VNPayConfig>
): Promise<ParsedVNPayReturn> {
  const config = { ...VNPAY_SANDBOX_CONFIG, ...customConfig };

  const secureHash = searchParams.get('vnp_SecureHash') || '';
  const responseCode = searchParams.get('vnp_ResponseCode') || '';
  const transactionStatus = searchParams.get('vnp_TransactionStatus') || '';
  const txnRef = searchParams.get('vnp_TxnRef') || '';
  const rawAmount = searchParams.get('vnp_Amount') || '0';
  const amountVnd = Math.round(Number(rawAmount) / 100);

  // Extract params to verify hash
  const returnParams: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      returnParams[key] = val;
    }
  });

  const sortedKeys = Object.keys(returnParams).sort();
  const queryStringParts: string[] = [];

  for (const key of sortedKeys) {
    const value = returnParams[key];
    if (value !== undefined && value !== null && value !== '') {
      queryStringParts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      );
    }
  }

  const signData = queryStringParts.join('&');
  const expectedHash = await computeHmacSha512(config.hashSecret, signData);
  const isValidSignature =
    !secureHash || secureHash.toLowerCase() === expectedHash.toLowerCase();

  // VNPay Response Codes:
  // 00: Giao dịch thành công
  // 07: Trừ tiền thành công nhưng nghi vấn
  // 09: Thẻ chưa đăng ký Internet Banking
  // 10: Xác thực OTP không thành công
  // 11: Đã hết hạn chờ thanh toán
  // 12: Thẻ bị khóa
  // 24: Khách hàng hủy giao dịch
  // 51: Tài khoản không đủ số dư
  // 75: Ngân hàng thanh toán đang bảo trì
  const RESPONSE_MESSAGES: Record<string, string> = {
    '00': 'Giao dịch thành công.',
    '07': 'Giao dịch bị nghi ngờ (liên hệ ngân hàng).',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.',
    '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
    '11': 'Đã hết hạn chờ thanh toán.',
    '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
    '24': 'Khách hàng đã hủy giao dịch.',
    '51': 'Tài khoản của bạn không đủ số dư để thực hiện giao dịch.',
    '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
  };

  const isSuccess = responseCode === '00';
  const message =
    RESPONSE_MESSAGES[responseCode] ||
    (isSuccess ? 'Giao dịch thành công.' : 'Giao dịch không thành công.');

  return {
    isSuccess,
    isValidSignature,
    responseCode,
    transactionStatus,
    txnRef,
    amountVnd,
    bankCode: searchParams.get('vnp_BankCode') || undefined,
    transactionNo: searchParams.get('vnp_TransactionNo') || undefined,
    cardType: searchParams.get('vnp_CardType') || undefined,
    payDate: searchParams.get('vnp_PayDate') || undefined,
    orderInfo: searchParams.get('vnp_OrderInfo') || undefined,
    message,
  };
}

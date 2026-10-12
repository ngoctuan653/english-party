import type { PaymentPlan } from '@/types/payment';

export const PREMIUM_PLANS: PaymentPlan[] = [
  {
    id: 'monthly',
    name: 'Gói 1 Tháng (Monthly)',
    description: 'Thích hợp cho học viên ôn luyện thi ngắn hạn hoặc trải nghiệm tính năng VIP',
    durationDays: 30,
    priceVnd: 99000,
    originalPriceVnd: 149000,
    discountBadge: 'Tiết kiệm 33%',
    features: [
      'Không giới hạn lượt hội thoại Speaking with AI (24/7)',
      'Mở khóa 100% tình huống nhập vai nâng cao (CEFR & HSK)',
      'Phân tích ngữ âm đa chiều & đề xuất Collocations',
      'Giọng đọc AI tự nhiên truyền cảm hứng (Gemini TTS)',
      'Hỗ trợ cả phân hệ Tiếng Anh & Tiếng Trung',
    ],
  },
  {
    id: 'quarterly',
    name: 'Gói 3 Tháng (Quarterly)',
    description: 'Lộ trình tối ưu để bứt phá 1 bậc trình độ CEFR hoặc nâng cấp cấp độ HSK',
    durationDays: 90,
    priceVnd: 249000,
    originalPriceVnd: 447000,
    discountBadge: 'Tiết kiệm 44%',
    features: [
      'Bao gồm toàn bộ quyền lợi Gói 1 Tháng',
      'Tiết kiệm hơn 44% so với gia hạn từng tháng',
      'Báo cáo tiến bộ phản xạ & từ vựng định kỳ',
      'Tặng kho tài liệu luyện nói độc quyền 2026',
      'Ưu tiên kết nối server AI độ trễ thấp (< 1s)',
    ],
  },
  {
    id: 'annual',
    name: 'Gói 1 Năm (Annual Pro)',
    description: 'Gói được yêu thích nhất — Đồng hành trọn năm chinh phục IELTS, TOEIC và HSK 4',
    durationDays: 365,
    priceVnd: 699000,
    originalPriceVnd: 1188000,
    discountBadge: 'PHỔ BIẾN NHẤT • Tiết kiệm 50%',
    isPopular: true,
    features: [
      'Bao gồm toàn bộ quyền lợi Gói 3 Tháng',
      'Chỉ ~58.000 VNĐ / tháng (Chi phí một ly trà sữa)',
      'Huy hiệu VIP Vương miện Hoàng kim (Gold Crown) độc quyền',
      'Mở khóa toàn bộ kho đề thi thử HSK Mock & CEFR Mock',
      'Hỗ trợ kỹ thuật ưu tiên 24/7 từ đội ngũ phát triển',
    ],
  },
];

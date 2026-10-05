import type { HSKLevel } from '@/types/chinese';

export interface HskMockQuestion {
  id: string;
  section: 'listening' | 'reading' | 'writing';
  partNumber: number;
  questionNumber: number;
  prompt: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string | number;
  explanationVi: string;
  points: number;
}

export interface HskMockExam {
  id: string;
  hskLevel: HSKLevel;
  title: string;
  titleVi: string;
  totalTimeMinutes: number;
  totalScore: number;
  passingScore: number;
  sections: {
    listening: { questionCount: number; durationMinutes: number; points: number };
    reading: { questionCount: number; durationMinutes: number; points: number };
    writing?: { questionCount: number; durationMinutes: number; points: number };
  };
  questions: HskMockQuestion[];
}

export const HSK_MOCK_EXAMS: HskMockExam[] = [
  {
    id: 'mock_hsk1_01',
    hskLevel: 'hsk1',
    title: 'HSK 1 全真模拟试卷 (一)',
    titleVi: 'Đề thi thử HSK 1 Tiêu chuẩn (Đề số 1)',
    totalTimeMinutes: 40,
    totalScore: 200,
    passingScore: 120,
    sections: {
      listening: { questionCount: 20, durationMinutes: 15, points: 100 },
      reading: { questionCount: 20, durationMinutes: 17, points: 100 }
    },
    questions: [
      // Phần 1: Nghe
      {
        id: 'hsk1_l_1',
        section: 'listening',
        partNumber: 1,
        questionNumber: 1,
        prompt: 'Nghe đoạn ghi âm và chọn hình ảnh / nội dung tương ứng:',
        audioText: '很高兴。',
        options: ['A. Rất vui vẻ (高兴)', 'B. Rất đói (饿)', 'C. Rất mệt (累)'],
        correctAnswer: 0,
        explanationVi: 'Đoạn ghi âm phát âm "很高兴" (Rất vui vẻ).',
        points: 5
      },
      {
        id: 'hsk1_l_2',
        section: 'listening',
        partNumber: 1,
        questionNumber: 2,
        prompt: 'Nghe đoạn ghi âm và chọn câu trả lời đúng:',
        audioText: '他在看书呢。',
        options: ['A. Anh ấy đang ngủ', 'B. Anh ấy đang đọc sách', 'C. Anh ấy đang ăn cơm'],
        correctAnswer: 1,
        explanationVi: 'Đoạn ghi âm: "他在看书呢" (Anh ấy đang đọc sách).',
        points: 5
      },
      // Phần 2: Đọc
      {
        id: 'hsk1_r_1',
        section: 'reading',
        partNumber: 1,
        questionNumber: 21,
        prompt: 'Đọc câu và chọn từ thích hợp điền vào chỗ trống: 我想去商店___一些水果。',
        options: ['A. 买 (mua)', 'B. 卖 (bán)', 'C. 坐 (ngồi)', 'D. 听 (nghe)'],
        correctAnswer: 0,
        explanationVi: 'Đến cửa hàng để mua hoa quả: "买水果".',
        points: 5
      },
      {
        id: 'hsk1_r_2',
        section: 'reading',
        partNumber: 2,
        questionNumber: 22,
        prompt: 'Sắp xếp trật tự từ thành câu hoàn chỉnh: ①汉语 ②学习 ③每天 ④我',
        options: [
          'A. ④ ③ ② ① (我每天学习汉语。)',
          'B. ① ② ③ ④ (汉语学习每天我。)',
          'C. ④ ① ③ ② (我汉语每天学习。)'
        ],
        correctAnswer: 0,
        explanationVi: 'Trật tự câu SVO kèm trạng ngữ thời gian: Chủ ngữ (我) + Thời gian (每天) + Động từ (学习) + Tân ngữ (汉语).',
        points: 5
      }
    ]
  },
  {
    id: 'mock_hsk2_01',
    hskLevel: 'hsk2',
    title: 'HSK 2 全真模拟试卷 (一)',
    titleVi: 'Đề thi thử HSK 2 Tiêu chuẩn (Đề số 1)',
    totalTimeMinutes: 55,
    totalScore: 200,
    passingScore: 120,
    sections: {
      listening: { questionCount: 35, durationMinutes: 25, points: 100 },
      reading: { questionCount: 25, durationMinutes: 22, points: 100 }
    },
    questions: [
      {
        id: 'hsk2_l_1',
        section: 'listening',
        partNumber: 1,
        questionNumber: 1,
        prompt: 'Nghe đoạn hội thoại và chọn đáp án chính xác:',
        audioText: '男：今天晚上我们一起去唱歌吧？ 女：不行啊，明天早上八点我有考试。',
        options: [
          'A. Cô gái đồng ý đi hát',
          'B. Cô gái từ chối vì sáng mai có bài thi',
          'C. Cô gái bị ốm phải đi bệnh viện'
        ],
        correctAnswer: 1,
        explanationVi: 'Cô gái nói: "不行啊，明天早上八点我有考试" (Không được rồi, 8 giờ sáng mai tôi có bài thi).',
        points: 5
      },
      {
        id: 'hsk2_r_1',
        section: 'reading',
        partNumber: 1,
        questionNumber: 36,
        prompt: 'Chọn câu có nghĩa tương đồng hoặc đúng ngữ pháp: 虽然外边很冷，___屋里很暖和。',
        options: ['A. 但是 (nhưng mà)', 'B. 所以 (cho nên)', 'C. 因为 (bởi vì)', 'D. 而且 (hơn nữa)'],
        correctAnswer: 0,
        explanationVi: 'Cặp liên từ biểu thị sự chuyển ngoặt: 虽然...但是... (Mặc dù... nhưng mà...).',
        points: 5
      }
    ]
  }
];

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
  // ==========================================
  // HSK 1 MOCK EXAM
  // ==========================================
  {
    id: 'mock_hsk1_01',
    hskLevel: 'hsk1',
    title: 'HSK 1 全真模拟试卷 (一)',
    titleVi: 'Đề thi thử HSK 1 Tiêu chuẩn (Đề số 1)',
    totalTimeMinutes: 40,
    totalScore: 200,
    passingScore: 120,
    sections: {
      listening: { questionCount: 4, durationMinutes: 15, points: 100 },
      reading: { questionCount: 4, durationMinutes: 17, points: 100 }
    },
    questions: [
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
        points: 25
      },
      {
        id: 'hsk1_l_2',
        section: 'listening',
        partNumber: 1,
        questionNumber: 2,
        prompt: 'Nghe đoạn ghi âm và chọn nghĩa đúng:',
        audioText: '我想喝茶。',
        options: ['A. Tôi muốn uống nước', 'B. Tôi muốn uống trà', 'C. Tôi muốn ăn cơm'],
        correctAnswer: 1,
        explanationVi: 'Đoạn ghi âm: "我想喝茶" nghĩa là Tôi muốn uống trà.',
        points: 25
      },
      {
        id: 'hsk1_l_3',
        section: 'listening',
        partNumber: 2,
        questionNumber: 3,
        prompt: 'Nghe đối thoại và chọn câu trả lời đúng:',
        audioText: 'A: 他是谁？ B: 他是我的汉语老师。',
        options: ['A. Bạn học', 'B. Thầy giáo tiếng Trung', 'C. Bác sĩ'],
        correctAnswer: 1,
        explanationVi: 'B trả lời: "他是我的汉语老师" (Thầy là giáo viên tiếng Trung của tôi).',
        points: 25
      },
      {
        id: 'hsk1_l_4',
        section: 'listening',
        partNumber: 2,
        questionNumber: 4,
        prompt: 'Nghe đoạn ghi âm và xác định thời gian:',
        audioText: '现在下午三点十分。',
        options: ['A. 3:10 chiều', 'B. 3:00 chiều', 'C. 4:10 chiều'],
        correctAnswer: 0,
        explanationVi: 'Audio: "三点十分" là 3 giờ 10 phút.',
        points: 25
      },
      // Phần 2: Đọc
      {
        id: 'hsk1_r_1',
        section: 'reading',
        partNumber: 1,
        questionNumber: 5,
        prompt: 'Chọn từ thích hợp điền vào chỗ trống: 他 ___ 医生。',
        options: ['A. 是', 'B. 有', 'C. 在'],
        correctAnswer: 0,
        explanationVi: 'Biểu thị nghề nghiệp dùng "是" (là).',
        points: 25
      },
      {
        id: 'hsk1_r_2',
        section: 'reading',
        partNumber: 1,
        questionNumber: 6,
        prompt: 'Chọn câu có nghĩa tương ứng với: "今天星期几？"',
        options: ['A. Hôm nay ngày mấy?', 'B. Hôm nay thứ mấy?', 'C. Bây giờ mấy giờ?'],
        correctAnswer: 1,
        explanationVi: '星期几 hỏi thứ mấy trong tuần.',
        points: 25
      },
      {
        id: 'hsk1_r_3',
        section: 'reading',
        partNumber: 2,
        questionNumber: 7,
        prompt: 'Đọc câu sau và chọn đúng/sai: "桌子上有三本书。" (Trên bàn có 3 quyển sách)',
        options: ['A. Đúng', 'B. Sai'],
        correctAnswer: 0,
        explanationVi: '"桌子上" là trên bàn, "三本书" là 3 quyển sách.',
        points: 25
      },
      {
        id: 'hsk1_r_4',
        section: 'reading',
        partNumber: 2,
        questionNumber: 8,
        prompt: 'Chọn câu trả lời phù hợp cho câu hỏi: "你喜欢中国菜吗？"',
        options: ['A. 我不是学生。', 'B. 我很喜欢。', 'C. 我去北京。'],
        correctAnswer: 1,
        explanationVi: 'Hỏi có thích món ăn Trung Quốc không, trả lời "我很喜欢" (Tôi rất thích).',
        points: 25
      }
    ]
  },

  // ==========================================
  // HSK 2 MOCK EXAM
  // ==========================================
  {
    id: 'mock_hsk2_01',
    hskLevel: 'hsk2',
    title: 'HSK 2 全真模拟试卷 (一)',
    titleVi: 'Đề thi thử HSK 2 Tiêu chuẩn (Đề số 1)',
    totalTimeMinutes: 55,
    totalScore: 200,
    passingScore: 120,
    sections: {
      listening: { questionCount: 4, durationMinutes: 25, points: 100 },
      reading: { questionCount: 4, durationMinutes: 22, points: 100 }
    },
    questions: [
      {
        id: 'hsk2_l_1',
        section: 'listening',
        partNumber: 1,
        questionNumber: 1,
        prompt: 'Nghe đoạn ghi âm và chọn nội dung chính xác:',
        audioText: '外面正在下大雨，别出去了。',
        options: ['A. Trời đang mưa to, đừng ra ngoài', 'B. Trời rất nắng, mau ra ngoài', 'C. Trời sắp tuyết rơi'],
        correctAnswer: 0,
        explanationVi: 'Audio: "正在下大雨" (đang mưa to), "别出去了" (đừng ra ngoài).',
        points: 25
      },
      {
        id: 'hsk2_l_2',
        section: 'listening',
        partNumber: 1,
        questionNumber: 2,
        prompt: 'Nghe đoạn hội thoại và chọn phương tiện di chuyển:',
        audioText: 'A: 你怎么去上班？ B: 我每天坐地铁去。',
        options: ['A. Đi xe đạp', 'B. Đi tàu điện ngầm (地铁)', 'C. Đi máy bay'],
        correctAnswer: 1,
        explanationVi: 'B trả lời: "坐地铁去" (đi tàu điện ngầm).',
        points: 25
      },
      {
        id: 'hsk2_l_3',
        section: 'listening',
        partNumber: 2,
        questionNumber: 3,
        prompt: 'Nghe đoạn đối thoại và trả lời câu hỏi: Người nam cảm thấy thế nào?',
        audioText: 'A: 身体好点儿了吗？ B: 吃了药，现在好多了。',
        options: ['A. Đã đỡ hơn nhiều (好多了)', 'B. Càng ngày càng đau', 'C. Vẫn chưa uống thuốc'],
        correctAnswer: 0,
        explanationVi: '"吃了药，现在好多了" biểu thị đã uống thuốc và đỡ hơn nhiều.',
        points: 25
      },
      {
        id: 'hsk2_l_4',
        section: 'listening',
        partNumber: 2,
        questionNumber: 4,
        prompt: 'Nghe đoạn ghi âm và chọn so sánh đúng:',
        audioText: '哥哥比弟弟高五厘米。',
        options: ['A. Anh trai cao hơn em trai 5cm', 'B. Em trai cao hơn anh trai', 'C. Hai anh em cao bằng nhau'],
        correctAnswer: 0,
        explanationVi: 'Câu chữ 比: "哥哥比弟弟高" -> Anh trai cao hơn em trai.',
        points: 25
      },
      // Đọc HSK 2
      {
        id: 'hsk2_r_1',
        section: 'reading',
        partNumber: 1,
        questionNumber: 5,
        prompt: 'Chọn từ điền vào chỗ trống: 虽然很累，___ 他依然很高兴。',
        options: ['A. 但是', 'B. 因为', 'C. 所以'],
        correctAnswer: 0,
        explanationVi: 'Cặp liên từ biểu thị nhượng bộ: 虽然...但是... (Mặc dù... nhưng...)',
        points: 25
      },
      {
        id: 'hsk2_r_2',
        section: 'reading',
        partNumber: 1,
        questionNumber: 6,
        prompt: 'Chọn câu trả lời đúng cho câu hỏi: "请问，去火车站怎么走？"',
        options: ['A. 一直往前走，到十字路口向右拐。', 'B. 火车票八十块钱。', 'C. 火车站很大。'],
        correctAnswer: 0,
        explanationVi: 'Hỏi đường (怎么走), đáp án chỉ phương hướng "一直往前走" (đi thẳng tiếp tục).',
        points: 25
      },
      {
        id: 'hsk2_r_3',
        section: 'reading',
        partNumber: 2,
        questionNumber: 7,
        prompt: 'Điền lượng từ phù hợp: 我买了两 ___ 苹果。',
        options: ['A. 斤', 'B. 本', 'C. 张'],
        correctAnswer: 0,
        explanationVi: 'Táo mua theo cân (斤 - nửa kg). "本" dùng cho sách, "张" dùng cho giấy/vé/bàn.',
        points: 25
      },
      {
        id: 'hsk2_r_4',
        section: 'reading',
        partNumber: 2,
        questionNumber: 8,
        prompt: 'Chọn câu diễn đạt đúng: "Tôi đã từng đến Thượng Hải."',
        options: ['A. 我去过上海。', 'B. 我去上海了。', 'C. 我正去上海呢。'],
        correctAnswer: 0,
        explanationVi: 'Nhấn mạnh từng trải nghiệm trong quá khứ dùng trợ từ "过" (我去过上海).',
        points: 25
      }
    ]
  },

  // ==========================================
  // HSK 3 MOCK EXAM
  // ==========================================
  {
    id: 'mock_hsk3_01',
    hskLevel: 'hsk3',
    title: 'HSK 3 全真模拟试卷 (一)',
    titleVi: 'Đề thi thử HSK 3 Tiêu chuẩn (Đề số 1)',
    totalTimeMinutes: 90,
    totalScore: 200,
    passingScore: 120,
    sections: {
      listening: { questionCount: 4, durationMinutes: 35, points: 100 },
      reading: { questionCount: 4, durationMinutes: 30, points: 100 }
    },
    questions: [
      {
        id: 'hsk3_l_1',
        section: 'listening',
        partNumber: 1,
        questionNumber: 1,
        prompt: 'Nghe đoạn ghi âm câu chữ 把 và chọn hành động đúng:',
        audioText: '请你把护照和机票拿出来。',
        options: ['A. Lấy hộ chiếu và vé máy bay ra', 'B. Cất hành lý lên trên giá', 'C. Kiểm tra lại vali'],
        correctAnswer: 0,
        explanationVi: '"把护照和机票拿出来" là lấy hộ chiếu và vé máy bay ra.',
        points: 25
      },
      {
        id: 'hsk3_l_2',
        section: 'listening',
        partNumber: 1,
        questionNumber: 2,
        prompt: 'Nghe đối thoại và chọn địa điểm diễn ra cuộc nói chuyện:',
        audioText: 'A: 先生，您要点什么菜？ B: 来一个宫保鸡丁和两碗米饭。',
        options: ['A. 在饭馆 (Tại nhà hàng)', 'B. 在图书馆', 'C. 在机场'],
        correctAnswer: 0,
        explanationVi: '"点菜", "宫保鸡丁", "米饭" là ngữ cảnh gọi món tại nhà hàng.',
        points: 25
      },
      {
        id: 'hsk3_l_3',
        section: 'listening',
        partNumber: 2,
        questionNumber: 3,
        prompt: 'Nghe đoạn ghi âm và chọn lý do người phụ nữ không thể đi du lịch:',
        audioText: '除了下周有个重要的会议以外，我还要准备考试。',
        options: ['A. Có cuộc họp quan trọng và phải chuẩn bị thi', 'B. Bị ốm phải nằm viện', 'C. Không có tiền mua vé'],
        correctAnswer: 0,
        explanationVi: 'Audio: "除了下周有个重要的会议以外，我还要准备考试".',
        points: 25
      },
      {
        id: 'hsk3_l_4',
        section: 'listening',
        partNumber: 2,
        questionNumber: 4,
        prompt: 'Nghe đoạn ghi âm và chọn xu hướng thời tiết:',
        audioText: '秋天到了，天气越来越凉快了。',
        options: ['A. Thời tiết ngày càng mát mẻ (越来越凉快)', 'B. Thời tiết càng ngày càng nóng', 'C. Trời liên tục mưa rào'],
        correctAnswer: 0,
        explanationVi: '"越来越凉快" là ngày càng mát mẻ.',
        points: 25
      },
      // Đọc HSK 3
      {
        id: 'hsk3_r_1',
        section: 'reading',
        partNumber: 1,
        questionNumber: 5,
        prompt: 'Chọn câu chữ 把 viết đúng cấu trúc:',
        options: [
          'A. 我把房间打扫干净了。',
          'B. 我把打扫房间干净了。',
          'C. 我房间把打扫了。'
        ],
        correctAnswer: 0,
        explanationVi: 'Cấu trúc câu chữ 把 chuẩn: S + 把 + O + V + Kết quả (我把房间打扫干净了).',
        points: 25
      },
      {
        id: 'hsk3_r_2',
        section: 'reading',
        partNumber: 1,
        questionNumber: 6,
        prompt: 'Điền từ thích hợp vào câu: 我的手机不小心 ___ 弟弟摔坏了。',
        options: ['A. 被', 'B. 把', 'C. 给'],
        correctAnswer: 0,
        explanationVi: 'Câu bị động: Điện thoại bị em trai làm rơi vỡ dùng "被".',
        points: 25
      },
      {
        id: 'hsk3_r_3',
        section: 'reading',
        partNumber: 2,
        questionNumber: 7,
        prompt: 'Đọc đoạn văn ngắn và trả lời câu hỏi: 小李为什么要学汉语？ "小李非常喜欢中国文化，他打算明年去中国留学，所以他每天都努力学汉语。"',
        options: [
          'A. Vì yêu thích văn hóa Trung Quốc và dự định đi du học',
          'B. Vì công ty bắt buộc',
          'C. Vì bố mẹ yêu cầu'
        ],
        correctAnswer: 0,
        explanationVi: 'Đoạn văn ghi rõ: "小李非常喜欢中国文化，他打算明年去中国留学".',
        points: 25
      },
      {
        id: 'hsk3_r_4',
        section: 'reading',
        partNumber: 2,
        questionNumber: 8,
        prompt: 'Chọn từ nối thích hợp: ___ 明天不下雨，我们 ___ 去爬山。',
        options: ['A. 如果...就...', 'B. 虽然...但是...', 'C. 因为...所以...'],
        correctAnswer: 0,
        explanationVi: 'Điều kiện - kết quả giả định: "如果...就..." (Nếu... thì...).',
        points: 25
      }
    ]
  },

  // ==========================================
  // HSK 4 MOCK EXAM
  // ==========================================
  {
    id: 'mock_hsk4_01',
    hskLevel: 'hsk4',
    title: 'HSK 4 全真模拟试卷 (一)',
    titleVi: 'Đề thi thử HSK 4 Tiêu chuẩn (Đề số 1)',
    totalTimeMinutes: 105,
    totalScore: 200,
    passingScore: 120,
    sections: {
      listening: { questionCount: 4, durationMinutes: 40, points: 100 },
      reading: { questionCount: 4, durationMinutes: 35, points: 100 }
    },
    questions: [
      {
        id: 'hsk4_l_1',
        section: 'listening',
        partNumber: 1,
        questionNumber: 1,
        prompt: 'Nghe đoạn ghi âm về môi trường kinh doanh và chọn nhận xét đúng:',
        audioText: '这家公司的产品不仅质量好，而且价格合理，因此深受消费者的欢迎。',
        options: [
          'A. Sản phẩm vừa chất lượng tốt vừa giá cả hợp lý',
          'B. Sản phẩm đắt đỏ khó tiếp cận',
          'C. Công ty sắp phá sản vì cạnh tranh'
        ],
        correctAnswer: 0,
        explanationVi: 'Audio: "不仅质量好，而且价格合理" (không những chất lượng tốt mà giá còn hợp lý).',
        points: 25
      },
      {
        id: 'hsk4_l_2',
        section: 'listening',
        partNumber: 1,
        questionNumber: 2,
        prompt: 'Nghe đoạn phỏng vấn xin việc và chọn thái độ của người quản lý:',
        audioText: 'A: 经理，您觉得我的表现怎么样？ B: 你的专业能力很强，而且有丰富的工作经验，我们非常欢迎你加入团队。',
        options: [
          'A. Đánh giá rất cao và chào đón ứng viên vào công ty',
          'B. Từ chối ứng viên vì thiếu kinh nghiệm',
          'C. Yêu cầu ứng viên về làm thêm bài kiểm tra'
        ],
        correctAnswer: 0,
        explanationVi: '"专业能力很强... 非常欢迎你加入团队" thể hiện thái độ chào đón và đánh giá rất cao.',
        points: 25
      },
      {
        id: 'hsk4_l_3',
        section: 'listening',
        partNumber: 2,
        questionNumber: 3,
        prompt: 'Nghe đoạn ghi âm về công nghệ và chọn ý chính:',
        audioText: '随着互联网技术的发展，远程办公已经成为很多年轻人的新选择。',
        options: [
          'A. Làm việc từ xa (远程办公) trở thành lựa chọn mới của giới trẻ nhờ Internet',
          'B. Giới trẻ không thích dùng máy vi tính nữa',
          'C. Internet gây giảm hiệu suất làm việc'
        ],
        correctAnswer: 0,
        explanationVi: 'Audio nói về xu thế: "随着互联网技术的发展，远程办公已经成为很多年轻人的新选择".',
        points: 25
      },
      {
        id: 'hsk4_l_4',
        section: 'listening',
        partNumber: 2,
        questionNumber: 4,
        prompt: 'Nghe đoạn ghi âm về triết lý sống và chọn kết luận:',
        audioText: '生活中难免会遇到挫折，只要坚持不放弃，就一定会迎来希望。',
        options: [
          'A. Chỉ cần kiên trì không bỏ cuộc thì nhất định sẽ đón nhận hy vọng',
          'B. Gặp khó khăn thì nên từ bỏ sớm để đỡ tốn sức',
          'C. Cuộc sống hoàn toàn không có thất bại'
        ],
        correctAnswer: 0,
        explanationVi: '"只要坚持不放弃，就一定会迎来希望" (chỉ cần kiên trì không từ bỏ thì nhất định sẽ đón hy vọng).',
        points: 25
      },
      // Đọc HSK 4
      {
        id: 'hsk4_r_1',
        section: 'reading',
        partNumber: 1,
        questionNumber: 5,
        prompt: 'Chọn liên từ thích hợp điền vào chỗ trống: ___ 遇到多大的困难，我们 ___ 不能放弃初心。',
        options: ['A. 无论...都...', 'B. 尽管...但是...', 'C. 因为...所以...'],
        correctAnswer: 0,
        explanationVi: '"无论...都..." (Bất kể gặp khó khăn lớn đến đâu, chúng ta đều không được từ bỏ sơ tâm).',
        points: 25
      },
      {
        id: 'hsk4_r_2',
        section: 'reading',
        partNumber: 1,
        questionNumber: 6,
        prompt: 'Điền từ thích hợp vào câu: 这个秘密太重要了，___ 连他最亲近的朋友他 ___ 没有告诉。',
        options: ['A. 连...也/都...', 'B. 越...越...', 'C. 又...又...'],
        correctAnswer: 0,
        explanationVi: 'Cấu trúc nhấn mạnh đối tượng cực đoan: "连...也/都...".',
        points: 25
      },
      {
        id: 'hsk4_r_3',
        section: 'reading',
        partNumber: 2,
        questionNumber: 7,
        prompt: 'Đọc đoạn trích và chọn thông điệp của tác giả: "真正的朋友不是在你成功时围着你的人，而是在你遇到困难时伸出援手的人。"',
        options: [
          'A. Bạn bè thật sự là người giúp đỡ khi ta gặp khó khăn',
          'B. Bạn bè là người chỉ xuất hiện khi vui vẻ tiệc tùng',
          'C. Không nên kết bạn với bất kỳ ai'
        ],
        correctAnswer: 0,
        explanationVi: '"真正的朋友...是在你遇到困难时伸出援手的人".',
        points: 25
      },
      {
        id: 'hsk4_r_4',
        section: 'reading',
        partNumber: 2,
        questionNumber: 8,
        prompt: 'Chọn câu diễn đạt tự nhiên và đúng ngữ pháp nhất:',
        options: [
          'A. 随着社会的进步，人们越来越重视环境保护。',
          'B. 随着社会的进步，人们越来越很重视环境保护。',
          'C. 人们越来越重视环境保护随着社会进步。'
        ],
        correctAnswer: 0,
        explanationVi: 'Câu A chuẩn nhất. Sau "越来越" không dùng "很" (loại B). Cụm "随着..." đứng đầu câu (loại C).',
        points: 25
      }
    ]
  }
];

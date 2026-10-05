import type { ChineseGrammarPattern } from '@/types/chinese';

export const CHINESE_GRAMMAR_PATTERNS: ChineseGrammarPattern[] = [
  // HSK 1
  {
    id: 'gram_shi',
    hskLevel: 'hsk1',
    title: 'Câu chữ 是 (Định nghĩa / Xác nhận thân phận)',
    pattern: 'Chủ ngữ + 是 + Tân ngữ',
    explanationVi: 'Dùng để nối chủ ngữ với danh từ/đại từ nhằm biểu thị thân phận, nghề nghiệp, tính chất hoặc sự quy thuộc. Phủ định dùng "不是".',
    structure: ['Chủ ngữ (S)', '是 (shì)', 'Tân ngữ (N)'],
    vietnameseEquivalent: 'Tương đương với từ "là" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我是越南人。',
        pinyin: 'Wǒ shì Yuènánrén.',
        meaningVi: 'Tôi là người Việt Nam.',
        breakdown: '我 (tôi) + 是 (là) + 越南人 (người Việt Nam)'
      },
      {
        hanzi: '他是我们的汉语老师。',
        pinyin: 'Tā shì wǒmen de Hànyǔ lǎoshī.',
        meaningVi: 'Thầy ấy là giáo viên tiếng Trung của chúng tôi.'
      },
      {
        hanzi: '这不是我的手机。',
        pinyin: 'Zhè bú shì wǒ de shǒujī.',
        meaningVi: 'Đây không phải là điện thoại của tôi.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Chọn từ thích hợp điền vào chỗ trống: 他 ___ 医生。(Anh ấy là bác sĩ)',
        options: ['是', '有', '在', '很'],
        correctAnswer: '是',
        explanationVi: 'Dùng "是" để biểu thị nghề nghiệp của chủ ngữ.'
      }
    ]
  },
  {
    id: 'gram_you',
    hskLevel: 'hsk1',
    title: 'Câu chữ 有 (Biểu thị sự sở hữu hoặc tồn tại)',
    pattern: 'Chủ ngữ + 有 + Tân ngữ',
    explanationVi: 'Dùng để biểu đạt ý nghĩa "có". CHÚ Ý: Phủ định của "有" bắt buộc dùng "没有", tuyệt đối KHÔNG dùng "不有".',
    structure: ['Chủ ngữ (S)', '有 (yǒu) / 没有 (méiyǒu)', 'Tân ngữ (O)'],
    vietnameseEquivalent: 'Tương đương từ "có / không có" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我有一只可爱的猫。',
        pinyin: 'Wǒ yǒu yì zhī kě\'ài de māo.',
        meaningVi: 'Tôi có một con mèo đáng yêu.'
      },
      {
        hanzi: '我今天没有时间。',
        pinyin: 'Wǒ jīntiān méiyǒu shíjiān.',
        meaningVi: 'Hôm nay tôi không có thời gian.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Phủ định của câu "我有钱" (Tôi có tiền) là gì?',
        options: ['我没有钱', '我不有钱', '我不钱', '我没钱是'],
        correctAnswer: '我没有钱',
        explanationVi: 'Phủ định của 有 bắt buộc dùng 没有.'
      }
    ]
  },
  {
    id: 'gram_ma',
    hskLevel: 'hsk1',
    title: 'Câu hỏi nghi vấn với trợ từ 吗',
    pattern: 'Câu khẳng định + 吗？',
    explanationVi: 'Thêm trợ từ ngữ khí "吗" vào cuối câu khẳng định để chuyển thành câu hỏi Có/Không (Yes/No question). Trật tự từ trong câu không đổi.',
    structure: ['Mệnh đề trần thuật', '吗 (ma)？'],
    vietnameseEquivalent: 'Tương đương "...phải không?", "...hả?", "...không?" trong tiếng Việt.',
    examples: [
      {
        hanzi: '你是学生吗？',
        pinyin: 'Nǐ shì xuéshēng ma?',
        meaningVi: 'Bạn là học sinh phải không?'
      },
      {
        hanzi: '你喜欢喝中国茶吗？',
        pinyin: 'Nǐ xǐhuan hē Zhōngguó chá ma?',
        meaningVi: 'Bạn thích uống trà Trung Quốc không?'
      }
    ],
    exercises: [
      {
        type: 'fill_blank',
        question: 'Chuyển câu sau thành câu hỏi: 你好 (Bạn khỏe) → 你好___？',
        correctAnswer: '吗',
        explanationVi: 'Thêm "吗" vào sau "你好" để hỏi thăm sức khỏe: 你好吗 (Bạn có khỏe không?).'
      }
    ]
  },
  {
    id: 'gram_de',
    hskLevel: 'hsk1',
    title: 'Trợ từ kết cấu 的 (Biểu thị sở hữu / Định ngữ)',
    pattern: 'Người sở hữu / Định ngữ + 的 + Danh từ trung tâm',
    explanationVi: 'Dùng để nối thành phần bổ nghĩa (định ngữ) với danh từ trung tâm. Tương tự như \'s trong tiếng Anh.',
    structure: ['Định ngữ', '的 (de)', 'Trung tâm ngữ'],
    vietnameseEquivalent: 'Tương đương từ "của" hoặc cấu trúc đảo ngược định ngữ tiếng Việt.',
    examples: [
      {
        hanzi: '我的汉语书。',
        pinyin: 'Wǒ de Hànyǔ shū.',
        meaningVi: 'Quyển sách tiếng Trung của tôi.'
      },
      {
        hanzi: '漂亮的衣服。',
        pinyin: 'Piàoliang de yīfu.',
        meaningVi: 'Quần áo đẹp.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: '"Bố của tôi" trong tiếng Trung viết là gì?',
        options: ['我的爸爸', '爸爸的我', '我是爸爸', '我有爸爸'],
        correctAnswer: '我的爸爸',
        explanationVi: 'Người sở hữu (我) + 的 + Danh từ (爸爸).'
      }
    ]
  },
  {
    id: 'gram_le',
    hskLevel: 'hsk1',
    title: 'Trợ từ ngữ khí / động thái 了 (Hành động hoàn thành)',
    pattern: 'S + V + 了 + (O)',
    explanationVi: 'Đứng sau động từ biểu thị hành động đã hoàn tất hoặc sự thay đổi của trạng thái mới.',
    structure: ['Chủ ngữ', 'Động từ', '了 (le)', 'Tân ngữ'],
    vietnameseEquivalent: 'Tương đương từ "rồi" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我吃饱了。',
        pinyin: 'Wǒ chī bǎo le.',
        meaningVi: 'Tôi ăn no rồi.'
      },
      {
        hanzi: '他去北京了。',
        pinyin: 'Tā qù Běijīng le.',
        meaningVi: 'Anh ấy đi Bắc Kinh rồi.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Chọn câu diễn tả "Tôi uống thuốc rồi":',
        options: ['我吃药了。', '我吃药过。', '我是吃药。', '我没有吃药。'],
        correctAnswer: '我吃药了。',
        explanationVi: 'Dùng "了" cuối câu biểu thị hành động hoàn thành.'
      }
    ]
  },

  // HSK 2
  {
    id: 'gram_bi',
    hskLevel: 'hsk2',
    title: 'Câu so sánh hơn với chữ 比 (Bi)',
    pattern: 'A + 比 + B + Tính từ',
    explanationVi: 'Dùng để so sánh sự chênh lệch giữa hai đối tượng A và B về một phương diện tính chất.',
    structure: ['Đối tượng A', '比 (bǐ)', 'Đối tượng B', 'Tính từ'],
    vietnameseEquivalent: 'Tương đương: "A ... hơn B".',
    examples: [
      {
        hanzi: '哥哥比我高。',
        pinyin: 'Gēge bǐ wǒ gāo.',
        meaningVi: 'Anh trai cao hơn tôi.'
      },
      {
        hanzi: '今天比昨天冷得多。',
        pinyin: 'Jīntiān bǐ zuótiān lěng de duō.',
        meaningVi: 'Hôm nay lạnh hơn hôm qua rất nhiều.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Dịch câu: "Táo ngọt hơn dưa hấu":',
        options: ['苹果比西瓜甜。', '苹果和西瓜甜。', '苹果是西瓜甜。', '苹果比西瓜很甜。'],
        correctAnswer: '苹果比西瓜甜。',
        explanationVi: 'Cấu trúc A + 比 + B + Adj (Lưu ý: trong câu so sánh chữ 比 không dùng phó từ "很").'
      }
    ]
  },

  // HSK 3
  {
    id: 'gram_ba',
    hskLevel: 'hsk3',
    title: 'Câu chữ 把 (Câu xử lý - Điểm then chốt HSK 3)',
    pattern: 'S + 把 + O + V + Thành phần khác (bổ ngữ / 了)',
    explanationVi: 'Nhấn mạnh sự tác động và xử lý của chủ ngữ lên tân ngữ, làm cho tân ngữ có sự thay đổi vị trí, trạng thái hoặc kết quả.',
    structure: ['Chủ ngữ', '把 (bǎ)', 'Tân ngữ chịu tác động', 'Động từ', 'Kết quả'],
    vietnameseEquivalent: 'Tương đương: "...đem / lấy [vật] làm cho [kết quả]".',
    examples: [
      {
        hanzi: '请你把门关上。',
        pinyin: 'Qǐng nǐ bǎ mén guān shàng.',
        meaningVi: 'Xin bạn hãy đóng cửa lại.'
      },
      {
        hanzi: '我把作业做完了。',
        pinyin: 'Wǒ bǎ zuòyè zuò wán le.',
        meaningVi: 'Tôi đã làm xong bài tập về nhà rồi.'
      },
      {
        hanzi: '他把书放在桌子上。',
        pinyin: 'Tā bǎ shū fàng zài zhuōzi shang.',
        meaningVi: 'Anh ấy đặt quyển sách lên trên bàn.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Câu nào sau đây dùng đúng cấu trúc chữ 把?',
        options: [
          '我把苹果吃了。',
          '我吃了把苹果。',
          '把苹果我吃了。',
          '我吃把苹果了。'
        ],
        correctAnswer: '我把苹果吃了。',
        explanationVi: 'Trật tự chuẩn: S (我) + 把 + O (苹果) + V (吃) + thành phần khác (了).'
      }
    ]
  },
  {
    id: 'gram_bei',
    hskLevel: 'hsk3',
    title: 'Câu bị động với chữ 被 (Bị / Được)',
    pattern: 'Tân ngữ (chịu tác động) + 被 + (Chủ ngữ gây ra) + V + Thành phần khác',
    explanationVi: 'Biểu thị thể bị động, thường mang sắc thái không may mắn hoặc kết quả đã xảy ra.',
    structure: ['Đối tượng chịu tác động', '被 (bèi)', 'Chủ thể gây ra (có thể lược bỏ)', 'V + Bổ ngữ'],
    vietnameseEquivalent: 'Tương đương từ "bị / được" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我的手机被他拿走了。',
        pinyin: 'Wǒ de shǒujī bèi tā ná zǒu le.',
        meaningVi: 'Điện thoại của tôi bị anh ấy lấy đi rồi.'
      },
      {
        hanzi: '蛋糕被弟弟吃了。',
        pinyin: 'Dàngāo bèi dìdi chī le.',
        meaningVi: 'Bánh kem bị em trai ăn mất rồi.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Dịch câu "Cốc nước bị vỡ rồi":',
        options: ['杯子被打破了。', '杯子把打破了。', '杯子是打破了。', '杯子有打破了。'],
        correctAnswer: '杯子被打破了。',
        explanationVi: 'Dùng "被" để chỉ sự việc thụ động.'
      }
    ]
  },
  {
    id: 'gram_yinwei_suoyi',
    hskLevel: 'hsk3',
    title: 'Cặp liên từ: 因为...所以... (Vì...nên...)',
    pattern: '因为 + Nguyên nhân, 所以 + Kết quả',
    explanationVi: 'Biểu thị mối quan hệ nhân quả. Trong giao tiếp khẩu ngữ, có thể lược bớt "因为" hoặc "所以".',
    structure: ['因为 (yīnwèi) + Vế nguyên nhân', '所以 (suǒyǐ) + Vế kết quả'],
    vietnameseEquivalent: 'Tương đương "Vì... cho nên..." trong tiếng Việt.',
    examples: [
      {
        hanzi: '因为昨天下大雨，所以我没去上课。',
        pinyin: 'Yīnwèi zuótiān xià dà yǔ, suǒyǐ wǒ méi qù shàngkè.',
        meaningVi: 'Bởi vì hôm qua trời mưa to, nên tôi không đi học.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Cặp liên từ đi đôi với "因为" là gì?',
        options: ['所以', '但是', '而且', '虽然'],
        correctAnswer: '所以',
        explanationVi: 'Cặp liên từ chuẩn: 因为...所以... (Vì...nên...).'
      }
    ]
  },

  // HSK 4
  {
    id: 'gram_bujin_erqie',
    hskLevel: 'hsk4',
    title: 'Cặp liên từ tăng tiến: 不仅...而且... (Không những...mà còn...)',
    pattern: '不仅 + Điểm mạnh 1, 而且 + Điểm mạnh 2',
    explanationVi: 'Biểu thị mức độ ngữ nghĩa tăng tiến, thường dùng để khen ngợi hoặc bổ sung thông tin vượt trội.',
    structure: ['不仅 (bùjǐn)', '而且 (érqiě)'],
    vietnameseEquivalent: 'Tương đương "Không những... mà còn..." trong tiếng Việt.',
    examples: [
      {
        hanzi: '他不仅长得帅，而且学习非常优秀。',
        pinyin: 'Tā bùjǐn zhǎng de shuài, érqiě xuéxí fēicháng yōuxiù.',
        meaningVi: 'Anh ấy không những đẹp trai, mà học tập còn vô cùng xuất sắc.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Điền từ còn thiếu: 她不仅会说英语，___会说中文。',
        options: ['而且', '因为', '虽然', '所以'],
        correctAnswer: '而且',
        explanationVi: 'Đi đôi với 不仅 là 而且.'
      }
    ]
  }
];

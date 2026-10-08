import type { ChineseGrammarPattern } from '@/types/chinese';

export const CHINESE_GRAMMAR_PATTERNS: ChineseGrammarPattern[] = [
  // ==========================================
  // HSK 1 GRAMMAR PATTERNS
  // ==========================================
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
        question: 'Câu phủ định nào sau đây là CHÍNH XÁC?',
        options: ['我没有电脑。', '我不有电脑。', '我没是电脑。', '我不电脑。'],
        correctAnswer: '我没有电脑。',
        explanationVi: 'Phủ định của "有" là "没有", không dùng "不".'
      }
    ]
  },
  {
    id: 'gram_ma_question',
    hskLevel: 'hsk1',
    title: 'Câu hỏi có / không với trợ từ 吗',
    pattern: 'Câu trần thuật + 吗？',
    explanationVi: 'Được đặt ở cuối câu trần thuật để biến câu đó thành một câu hỏi nghi vấn Đúng/Sai (Yes/No question).',
    structure: ['Mệnh đề trần thuật', '吗 (ma)?'],
    vietnameseEquivalent: 'Tương đương "... phải không?", "... à?", "... hả?".',
    examples: [
      {
        hanzi: '你是学生吗？',
        pinyin: 'Nǐ shì xuésheng ma?',
        meaningVi: 'Bạn là học sinh phải không?'
      },
      {
        hanzi: '明天你来我家吗？',
        pinyin: 'Míngtiān nǐ lái wǒ jiā ma?',
        meaningVi: 'Ngày mai bạn đến nhà tôi không?'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Để hỏi "Bạn thích uống trà không?", ta nói:',
        options: ['你喜欢喝茶吗？', '你喜欢喝茶呢？', '你是喜欢喝茶吗？', '你喝茶有吗？'],
        correctAnswer: '你喜欢喝茶吗？',
        explanationVi: 'Thêm "吗" vào cuối câu trần thuật.'
      }
    ]
  },
  {
    id: 'gram_zai_place',
    hskLevel: 'hsk1',
    title: 'Biểu thị nơi chốn với giới từ 在',
    pattern: 'Chủ ngữ + 在 + Địa điểm + Hành động (V)',
    explanationVi: 'Quy tắc ngữ pháp vàng tiếng Trung: Địa điểm PHẢI ĐỨNG TRƯỚC hành động (khác với tiếng Việt thường nói hành động trước địa điểm).',
    structure: ['Chủ ngữ (S)', '在 (zài) + Nơi chốn', 'Động từ (V)'],
    vietnameseEquivalent: 'Làm việc gì Ở ĐÂU (Tiếng Việt: Ăn cơm ở nhà -> Tiếng Trung: Ở nhà ăn cơm).',
    examples: [
      {
        hanzi: '我在图书馆学习。',
        pinyin: 'Wǒ zài túshūguǎn xuéxí.',
        meaningVi: 'Tôi học tập ở thư viện.',
        breakdown: '我在 (Tôi ở) + 图书馆 (thư viện) + 学习 (học tập)'
      },
      {
        hanzi: '他在北京工作。',
        pinyin: 'Tā zài Běijīng gōngzuò.',
        meaningVi: 'Anh ấy làm việc ở Bắc Kinh.'
      }
    ],
    exercises: [
      {
        type: 'multiple_choice',
        question: 'Dịch sang tiếng Trung: "Chúng tôi ăn cơm ở nhà hàng."',
        options: ['我们在饭馆吃饭。', '我们吃饭在饭馆。', '在饭馆我们是吃饭。', '我们吃在饭馆饭。'],
        correctAnswer: '我们在饭馆吃饭。',
        explanationVi: 'Trong tiếng Trung: Địa điểm (在饭馆) phải đứng trước hành động (吃饭).'
      }
    ]
  },
  {
    id: 'gram_de_possession',
    hskLevel: 'hsk1',
    title: 'Trợ từ kết cấu 的 (Sở hữu & Định ngữ)',
    pattern: 'Định ngữ + 的 + Danh từ trung tâm',
    explanationVi: 'Dùng để nối thành phần bổ nghĩa (định ngữ) với danh từ trung tâm. Biểu thị quan hệ sở hữu hoặc đặc điểm tính chất.',
    structure: ['Thành phần bổ nghĩa', '的 (de)', 'Danh từ chính'],
    vietnameseEquivalent: 'Tương đương từ "của" hoặc cấu trúc đảo ngược định ngữ trong tiếng Việt.',
    examples: [
      {
        hanzi: '这是我的书。',
        pinyin: 'Zhè shì wǒ de shū.',
        meaningVi: 'Đây là sách của tôi.'
      },
      {
        hanzi: '漂亮的花。',
        pinyin: 'Piàoliang de huā.',
        meaningVi: 'Bông hoa đẹp.'
      }
    ]
  },
  {
    id: 'gram_le_aspect',
    hskLevel: 'hsk1',
    title: 'Trợ từ động thái 了 (Hoàn thành hành động)',
    pattern: 'Động từ + 了 (+ Tân ngữ)',
    explanationVi: 'Đặt ngay sau động từ để biểu thị hành động đã xảy ra hoặc hoàn thành. Chú ý: Phủ định dùng "没 + V", và KHÔNG dùng "了" nữa.',
    structure: ['Động từ (V)', '了 (le)', 'Tân ngữ (O)'],
    vietnameseEquivalent: 'Tương đương "đã... rồi" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我吃了晚饭。',
        pinyin: 'Wǒ chī le wǎnfàn.',
        meaningVi: 'Tôi đã ăn cơm tối rồi.'
      },
      {
        hanzi: '他买了一本书。',
        pinyin: 'Tā mǎi le yì běn shū.',
        meaningVi: 'Anh ấy đã mua một quyển sách.'
      }
    ]
  },

  // ==========================================
  // HSK 2 GRAMMAR PATTERNS
  // ==========================================
  {
    id: 'gram_bi_compare',
    hskLevel: 'hsk2',
    title: 'Câu so sánh hơn với chữ 比',
    pattern: 'A + 比 + B + Tính từ (+ Cụm biểu thị mức độ)',
    explanationVi: 'Dùng để so sánh sự chênh lệch giữa hai đối tượng A và B. Tuyệt đối không dùng "很", "非常" sau tính từ trong câu so sánh chữ 比.',
    structure: ['A', '比 (bǐ)', 'B', 'Tính từ', '得多 / 一点儿 (tùy chọn)'],
    vietnameseEquivalent: 'A hơn B cái gì đó (ví dụ: Anh ấy cao hơn tôi).',
    examples: [
      {
        hanzi: '他比我高。',
        pinyin: 'Tā bǐ wǒ gāo.',
        meaningVi: 'Anh ấy cao hơn tôi.',
        breakdown: '他 (A) + 比 + 我 (B) + 高 (tính từ)'
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
        question: 'Câu nào sau đây sai ngữ pháp?',
        options: ['他比我很高。', '他比我高。', '他比我高一点儿。', '他比我高得多。'],
        correctAnswer: '他比我很高。',
        explanationVi: 'Trong câu so sánh chữ 比 không được dùng phó từ mức độ như "很", "非常".'
      }
    ]
  },
  {
    id: 'gram_guo_exp',
    hskLevel: 'hsk2',
    title: 'Trợ từ động thái 过 (Từng trải nghiệm qua)',
    pattern: 'Chủ ngữ + Động từ + 过 + Tân ngữ',
    explanationVi: 'Đặt sau động từ để nhấn mạnh một trải nghiệm đã từng xảy ra trong quá khứ và hiện tại không còn tiếp diễn nữa. Phủ định dùng "没(有) + V + 过".',
    structure: ['S', 'V', '过 (guo)', 'O'],
    vietnameseEquivalent: 'Tương đương "đã từng... qua" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我去过中国。',
        pinyin: 'Wǒ qù guo Zhōngguó.',
        meaningVi: 'Tôi từng đi Trung Quốc rồi.'
      },
      {
        hanzi: '我没吃过北京烤鸭。',
        pinyin: 'Wǒ méi chī guo Běijīng kǎoyā.',
        meaningVi: 'Tôi chưa từng ăn vịt quay Bắc Kinh.'
      }
    ]
  },
  {
    id: 'gram_zhengzai',
    hskLevel: 'hsk2',
    title: 'Phó từ 正在 (Hành động đang diễn ra)',
    pattern: 'Chủ ngữ + 正在 / 正 / 在 + Động từ (+ 呢)',
    explanationVi: 'Biểu thị hành động đang tiến hành tại một thời điểm nhất định.',
    structure: ['S', '正在 (zhèngzài)', 'V', 'O', '呢 (ne)'],
    vietnameseEquivalent: 'Tương đương "đang..." trong tiếng Việt.',
    examples: [
      {
        hanzi: '妈妈正在做饭呢。',
        pinyin: 'Māma zhèngzài zuòfàn ne.',
        meaningVi: 'Mẹ đang nấu cơm đấy.'
      },
      {
        hanzi: '外面正在下雨。',
        pinyin: 'Wàimiàn zhèngzài xiàyǔ.',
        meaningVi: 'Bên ngoài đang mưa.'
      }
    ]
  },
  {
    id: 'gram_kuaiyaole',
    hskLevel: 'hsk2',
    title: 'Kết cấu 快要...了 / 要...了 (Sắp xảy ra)',
    pattern: '快要 / 要 / 就要 + Động từ / Sự việc + 了',
    explanationVi: 'Biểu thị một sự việc sắp sửa xảy ra trong tương lai rất gần. Chú ý: Nếu có trạng ngữ thời gian cụ thể (như 8 giờ, ngày mai), chỉ dùng "就要...了", không dùng "快要...了".',
    structure: ['快要 (kuàiyào)', 'Hành động / Tình huống', '了 (le)'],
    vietnameseEquivalent: 'Tương đương "sắp... rồi".',
    examples: [
      {
        hanzi: '火车快要开了。',
        pinyin: 'Huǒchē kuàiyào kāi le.',
        meaningVi: 'Tàu hỏa sắp chạy rồi.'
      },
      {
        hanzi: '新的一年就要到了。',
        pinyin: 'Xīn de yì nián jiùyào dào le.',
        meaningVi: 'Một năm mới sắp đến rồi.'
      }
    ]
  },
  {
    id: 'gram_bie',
    hskLevel: 'hsk2',
    title: 'Mệnh lệnh khuyên ngăn với 别 / 不要',
    pattern: '别 / 不要 + Động từ (+ Tân ngữ) (+ 了)',
    explanationVi: 'Dùng để can ngăn hoặc đưa ra mệnh lệnh cấm chỉ ai đó làm việc gì.',
    structure: ['别 (bié) / 不要 (búyào)', 'Động từ', 'Tân ngữ'],
    vietnameseEquivalent: 'Tương đương "đừng...", "chớ..." trong tiếng Việt.',
    examples: [
      {
        hanzi: '别担心，一切都会好的。',
        pinyin: 'Bié dānxīn, yíqiè dōu huì hǎo de.',
        meaningVi: 'Đừng lo lắng, mọi chuyện rồi sẽ ổn thôi.'
      },
      {
        hanzi: '上课的时候别玩手机。',
        pinyin: 'Shàngkè de shíhou bié wán shǒujī.',
        meaningVi: 'Trong giờ học đừng bấm điện thoại.'
      }
    ]
  },
  {
    id: 'gram_de_complement',
    hskLevel: 'hsk2',
    title: 'Bổ ngữ trạng thái với chữ 得',
    pattern: 'Động từ + 得 + Tính từ / Cụm tính từ',
    explanationVi: 'Đánh giá hoặc miêu tả kết quả, mức độ hay phương thức của hành động vừa được thực hiện.',
    structure: ['Động từ (V)', '得 (de)', 'Tính từ đánh giá (Adj)'],
    vietnameseEquivalent: 'Tương đương "... đến mức / ... một cách / ... rất" (Ví dụ: Chạy rất nhanh).',
    examples: [
      {
        hanzi: '他说汉语说得很好。',
        pinyin: 'Tā shuō Hànyǔ shuō de hěn hǎo.',
        meaningVi: 'Anh ấy nói tiếng Trung rất tốt.'
      },
      {
        hanzi: '今天我起得很早。',
        pinyin: 'Jīntiān wǒ qǐ de hěn zǎo.',
        meaningVi: 'Hôm nay tôi thức dậy rất sớm.'
      }
    ]
  },

  // ==========================================
  // HSK 3 GRAMMAR PATTERNS
  // ==========================================
  {
    id: 'gram_ba_sentence',
    hskLevel: 'hsk3',
    title: 'Câu chữ 把 (Chủ động xử lý đối tượng)',
    pattern: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác',
    explanationVi: 'Một trong những điểm ngữ pháp quan trọng nhất của tiếng Trung. Dùng để nhấn mạnh sự tác động hoặc làm thay đổi trạng thái, vị trí của tân ngữ. Động từ không được đứng đơn độc mà phải có thành phần khác đi kèm (như 了, 在, 给, bổ ngữ).',
    structure: ['Chủ ngữ (S)', '把 (bǎ)', 'Tân ngữ (O)', 'Động từ (V)', 'Kết quả / Nơi chốn'],
    vietnameseEquivalent: 'Tương đương cấu trúc "đem / lấy [vật gì] làm [thế nào]".',
    examples: [
      {
        hanzi: '请把门关上。',
        pinyin: 'Qǐng bǎ mén guān shàng.',
        meaningVi: 'Xin hãy đóng cửa lại.',
        breakdown: '请 (xin) + 把 + 门 (cửa) + 关上 (đóng lại)'
      },
      {
        hanzi: '我把作业做完了。',
        pinyin: 'Wǒ bǎ zuòyè zuò wán le.',
        meaningVi: 'Tôi đã làm xong bài tập rồi.'
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
        question: 'Chọn câu đúng chuẩn ngữ pháp chữ 把:',
        options: ['我把苹果吃了。', '我把吃了苹果。', '我苹果吃了把。', '把我吃了苹果。'],
        correctAnswer: '我把苹果吃了。',
        explanationVi: 'Cấu trúc: S + 把 + O + V + Thành phần khác.'
      }
    ]
  },
  {
    id: 'gram_bei_sentence',
    hskLevel: 'hsk3',
    title: 'Câu bị động với chữ 被 (Bị / Được)',
    pattern: 'Đối tượng bị tác động + 被 (+ Chủ thể) + Động từ + Thành phần khác',
    explanationVi: 'Dùng khi muốn nhấn mạnh đối tượng tiếp nhận hành động hoặc sự việc xảy ra ngoài ý muốn. Trong khẩu ngữ có thể thay "被" bằng "叫" hoặc "让".',
    structure: ['Đối tượng chịu tác động', '被 (bèi)', 'Tác nhân gây ra (tùy chọn)', 'Động từ', 'Kết quả'],
    vietnameseEquivalent: 'Tương đương "bị / được" trong tiếng Việt.',
    examples: [
      {
        hanzi: '我的自行车被偷了。',
        pinyin: 'Wǒ de zìxíngchē bèi tōu le.',
        meaningVi: 'Xe đạp của tôi bị trộm mất rồi.'
      },
      {
        hanzi: '那个蛋糕被弟弟吃光了。',
        pinyin: 'Nà ge dàngāo bèi dìdi chī guāng le.',
        meaningVi: 'Chiếc bánh kem đó đã bị em trai ăn sạch rồi.'
      }
    ]
  },
  {
    id: 'gram_yuelaiyuede',
    hskLevel: 'hsk3',
    title: 'Kết cấu 越来越... (Ngày càng...)',
    pattern: 'Chủ ngữ + 越来越 + Tính từ / Động từ tâm lý',
    explanationVi: 'Biểu thị mức độ của tính chất hay trạng thái tăng dần theo thời gian. Sau "越来越" TUYỆT ĐỐI không dùng phó từ như "很", "非常".',
    structure: ['S', '越来越 (yuèláiyuè)', 'Tính từ / Cảm xúc'],
    vietnameseEquivalent: 'Tương đương "ngày càng...", "càng ngày càng...".',
    examples: [
      {
        hanzi: '天气越来越冷了。',
        pinyin: 'Tiānqì yuè lái yuè lěng le.',
        meaningVi: 'Thời tiết ngày càng lạnh rồi.'
      },
      {
        hanzi: '他的汉语说得越来越流利。',
        pinyin: 'Tā de Hànyǔ shuō de yuè lái yuè liúlì.',
        meaningVi: 'Tiếng Trung của anh ấy nói ngày càng lưu loát.'
      }
    ]
  },
  {
    id: 'gram_yue_yue',
    hskLevel: 'hsk3',
    title: 'Kết cấu 越...越... (Càng... càng...)',
    pattern: '越 + A + 越 + B',
    explanationVi: 'Biểu thị sự biến đổi của B phụ thuộc vào mức độ của A (nguyên nhân - kết quả).',
    structure: ['越 (yuè) + Điều kiện A', '越 (yuè) + Kết quả B'],
    vietnameseEquivalent: 'Tương đương "càng... thì càng...".',
    examples: [
      {
        hanzi: '雨越下越大。',
        pinyin: 'Yǔ yuè xià yuè dà.',
        meaningVi: 'Mưa càng rơi càng to.'
      },
      {
        hanzi: '这本书我越看越喜欢。',
        pinyin: 'Zhè běn shū wǒ yuè kàn yuè xǐhuan.',
        meaningVi: 'Quyển sách này tôi càng đọc càng thích.'
      }
    ]
  },
  {
    id: 'gram_chule_yiwai',
    hskLevel: 'hsk3',
    title: 'Kết cấu 除了...以外 (Ngoài... ra)',
    pattern: '除了 + A + 以外，(S) + 还/也/都 + B',
    explanationVi: 'Nếu đi với "还 / 也" thì có nghĩa là "ngoài A ra còn có thêm B" (bổ sung). Nếu đi với "都" thì có nghĩa là "trừ A ra thì tất cả đều B" (loại trừ).',
    structure: ['除了 (chúle) + A', '以外 (yǐwài)', '还/也/都 + B'],
    vietnameseEquivalent: 'Ngoài... ra (còn có...) HOẶC Trừ... ra (tất cả đều...).',
    examples: [
      {
        hanzi: '除了英语以外，我还会说汉语。',
        pinyin: 'Chúle Yīngyǔ yǐwài, wǒ hái huì shuō Hànyǔ.',
        meaningVi: 'Ngoài tiếng Anh ra, tôi còn biết nói tiếng Trung.'
      },
      {
        hanzi: '除了小明以外，大家都来了。',
        pinyin: 'Chúle Xiǎomíng yǐwài, dàjiā dōu lái le.',
        meaningVi: 'Trừ Tiểu Minh ra, mọi người đều đã đến đông đủ.'
      }
    ]
  },
  {
    id: 'gram_yibian_yibian',
    hskLevel: 'hsk3',
    title: 'Kết cấu 一边...一边... (Vừa... vừa...)',
    pattern: 'Chủ ngữ + 一边 + Hành động 1 + 一边 + Hành động 2',
    explanationVi: 'Biểu thị hai hành động cùng được tiến hành song song tại cùng một thời điểm.',
    structure: ['一边 (yìbiān) + V1', '一边 (yìbiān) + V2'],
    vietnameseEquivalent: 'Tương đương "vừa... vừa...".',
    examples: [
      {
        hanzi: '他喜欢一边听音乐一边跑步。',
        pinyin: 'Tā xǐhuan yìbiān tīng yīnyuè yìbiān pǎobù.',
        meaningVi: 'Anh ấy thích vừa nghe nhạc vừa chạy bộ.'
      },
      {
        hanzi: '我们一边喝咖啡一边聊天吧。',
        pinyin: 'Wǒmen yìbiān hē kāfēi yìbiān liáotiān ba.',
        meaningVi: 'Chúng mình vừa uống cà phê vừa trò chuyện nhé.'
      }
    ]
  },

  // ==========================================
  // HSK 4 GRAMMAR PATTERNS
  // ==========================================
  {
    id: 'gram_bujin_erqie',
    hskLevel: 'hsk4',
    title: 'Liên từ 不仅...而且... (Không những... mà còn...)',
    pattern: '不仅 + Vế 1, 而且 + Vế 2',
    explanationVi: 'Biểu thị mối quan hệ tăng tiến. Nếu hai vế cùng một chủ ngữ thì chủ ngữ đặt trước "不仅"; nếu khác chủ ngữ thì "不仅" đặt trước chủ ngữ của vế 1.',
    structure: ['不仅 (bùjǐn) + Vế 1', '而且 (érqiě) + Vế 2'],
    vietnameseEquivalent: 'Tương đương "không những / không chỉ... mà còn...".',
    examples: [
      {
        hanzi: '他不仅聪明，而且非常努力。',
        pinyin: 'Tā bùjǐn cōngming, érqiě fēicháng nǔlì.',
        meaningVi: 'Anh ấy không những thông minh, mà còn vô cùng chăm chỉ.'
      },
      {
        hanzi: '不仅我知道这件事，大家都知道了。',
        pinyin: 'Bùjǐn wǒ zhīdào zhè jiàn shì, dàjiā dōu zhīdào le.',
        meaningVi: 'Không chỉ tôi biết chuyện này, mà tất cả mọi người đều đã biết rồi.'
      }
    ]
  },
  {
    id: 'gram_lian_dou',
    hskLevel: 'hsk4',
    title: 'Kết cấu nhấn mạnh 连...都/也... (Ngay cả... cũng...)',
    pattern: '连 + Thành phần nhấn mạnh + 都 / 也 + Vế vị ngữ',
    explanationVi: 'Dùng để nhấn mạnh một trường hợp cực đoan hoặc nổi bật nhằm làm nổi bật tính chất phổ quát của vấn đề.',
    structure: ['连 (lián) + Đối tượng cực đoan', '都 (dōu) / 也 (yě)', 'Vị ngữ'],
    vietnameseEquivalent: 'Tương đương "ngay cả / đến cả... cũng...".',
    examples: [
      {
        hanzi: '这个问题太难了，连老师都不知道答案。',
        pinyin: 'Zhè ge wèntí tài nán le, lián lǎoshī dōu bù zhīdào dá\'àn.',
        meaningVi: 'Câu hỏi này khó quá, ngay cả giáo viên cũng không biết đáp án.'
      },
      {
        hanzi: '他太忙了，连饭都没时间吃。',
        pinyin: 'Tā tài máng le, lián fàn dōu méi shíjiān chī.',
        meaningVi: 'Anh ấy bận quá, ngay cả cơm cũng không có thời gian ăn.'
      }
    ]
  },
  {
    id: 'gram_wulun_dou',
    hskLevel: 'hsk4',
    title: 'Kết cấu 无论 / 不管...都... (Bất kể / Dù cho...)',
    pattern: '无论 / 不管 + Điều kiện bất kỳ + 都 / 也 + Kết quả không đổi',
    explanationVi: 'Biểu thị trong bất kỳ tình huống hay điều kiện nào thì kết quả vẫn không thay đổi. Vế sau "无论" thường phải chứa đại từ nghi vấn (什么, 谁, 怎么) hoặc kết cấu lựa chọn (A 还是 B).',
    structure: ['无论 (wúlùn) + Điều kiện mở', '都 (dōu) / 也 (yě) + Kết quả cố định'],
    vietnameseEquivalent: 'Bất kể / Dù cho... đều...',
    examples: [
      {
        hanzi: '无论遇到什么困难，我们都要坚持下去。',
        pinyin: 'Wúlùn yù dào shénme kùnnan, wǒmen dōu yào jiānchí xiàqù.',
        meaningVi: 'Bất kể gặp phải khó khăn gì, chúng ta đều phải kiên trì tới cùng.'
      },
      {
        hanzi: '不管刮风下雨，他每天都准时去上班。',
        pinyin: 'Bùguǎn guāfēng xiàyǔ, tā měitiān dōu zhǔnshí qù shàngbān.',
        meaningVi: 'Dù gió giông hay mưa rào, mỗi ngày anh ấy đều đi làm đúng giờ.'
      }
    ]
  },
  {
    id: 'gram_jinguang_dan',
    hskLevel: 'hsk4',
    title: 'Liên từ 尽管...但是... (Mặc dù... nhưng...)',
    pattern: '尽管 + Vế nhượng bộ, 但是 / 可是 + Vế chuyển hướng',
    explanationVi: 'Dùng trong câu phức biểu thị sự nhượng bộ, thừa nhận một sự thật ở vế trước rồi chuyển ý ở vế sau.',
    structure: ['尽管 (jǐnguǎn) + Sự thật', '但是 (dànshì) + Kết quả bất ngờ'],
    vietnameseEquivalent: 'Mặc dù / Dẫu cho... nhưng...',
    examples: [
      {
        hanzi: '尽管工作很累，但他依然感到很充实。',
        pinyin: 'Jǐnguǎn gōngzuò hěn lèi, dàn tā yīrán gǎndào hěn chōngshí.',
        meaningVi: 'Mặc dù công việc rất mệt, nhưng anh ấy vẫn cảm thấy rất ý nghĩa và trọn vẹn.'
      }
    ]
  },
  {
    id: 'gram_suizhe',
    hskLevel: 'hsk4',
    title: 'Giới từ 随着 (Cùng với sự phát triển / thay đổi)',
    pattern: '随着 + Danh từ / Cụm từ phát triển, ...',
    explanationVi: 'Đặt ở đầu câu để biểu thị một tình huống biến đổi kéo theo một sự việc hoặc hệ quả khác biến đổi theo.',
    structure: ['随着 (suízhe) + Xu thế biến đổi', 'Mệnh đề hệ quả'],
    vietnameseEquivalent: 'Cùng với... / Đi đôi với sự phát triển của...',
    examples: [
      {
        hanzi: '随着科技的发展，人们的生活越来越方便。',
        pinyin: 'Suízhe kējì de fāzhǎn, rénmen de shēnghuó yuè lái yuè fāngbiàn.',
        meaningVi: 'Cùng với sự phát triển của khoa học công nghệ, cuộc sống của con người ngày càng thuận tiện.'
      }
    ]
  },
  {
    id: 'gram_jiujing',
    hskLevel: 'hsk4',
    title: 'Phó từ 究竟 / 到底 (Rốt cuộc, rốt cục)',
    pattern: '究竟 / 到底 + Câu hỏi nghi vấn',
    explanationVi: 'Dùng trong câu nghi vấn để nhấn mạnh sự truy cứu bản chất sự việc hoặc thể hiện thái độ sốt ruột, muốn biết rõ ngọn ngành.',
    structure: ['究竟 (jiūjìng) / 到底 (dàodǐ)', 'Thành phần nghi vấn'],
    vietnameseEquivalent: 'Rốt cuộc / Cuối cùng thì...',
    examples: [
      {
        hanzi: '你究竟想说什么？',
        pinyin: 'Nǐ jiūjìng xiǎng shuō shénme?',
        meaningVi: 'Rốt cuộc là bạn muốn nói điều gì?'
      },
      {
        hanzi: '会议到底什么时候开始？',
        pinyin: 'Huìyì dàodǐ shénme shíhou kāishǐ?',
        meaningVi: 'Rốt cuộc thì cuộc họp khi nào mới bắt đầu?'
      }
    ]
  },
  {
    id: 'gram_budele',
    hskLevel: 'hsk4',
    title: 'Bổ ngữ mức độ ...得不得了 (Vô cùng, cực kỳ)',
    pattern: 'Tính từ + 得不得了',
    explanationVi: 'Dùng sau tính từ để biểu thị mức độ cực kỳ cao của cảm xúc hoặc trạng thái.',
    structure: ['Tính từ (Adj)', '得不得了 (de bùdéliǎo)'],
    vietnameseEquivalent: '... không thể tả nổi / ... cực kỳ / ... vô cùng.',
    examples: [
      {
        hanzi: '听到这个好消息，他高兴得不得了。',
        pinyin: 'Tīng dào zhè ge hǎo xiāoxi, tā gāoxìng de bùdéliǎo.',
        meaningVi: 'Nghe được tin tốt này, anh ấy vui mừng khôn xiết.'
      }
    ]
  }
];

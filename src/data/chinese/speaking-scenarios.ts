import type { HSKLevel } from '@/types/chinese';

export interface ChineseSpeakingScenario {
  id: string;
  title: string;
  titleVi: string;
  hskLevel: HSKLevel;
  category: 'daily' | 'travel' | 'work' | 'social';
  descriptionVi: string;
  aiRole: string;
  userRole: string;
  situation: string;
  initialAiMessage: {
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  };
  sampleResponses: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
  keyVocabulary: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
}

export const CHINESE_SPEAKING_SCENARIOS: ChineseSpeakingScenario[] = [
  {
    id: 'scen_intro',
    title: '自我介绍 (Self-Introduction)',
    titleVi: 'Làm quen & Tự giới thiệu bản thân',
    hskLevel: 'hsk1',
    category: 'daily',
    descriptionVi: 'Gặp gỡ một người bạn Trung Quốc mới tại trường học hoặc buổi tiệc giao lưu.',
    aiRole: 'Lǐ Míng (Bạn sinh viên Trung Quốc thân thiện)',
    userRole: 'Du học sinh / Người mới học tiếng Trung',
    situation: 'Bạn vừa bước vào lớp học tiếng Trung và ngồi cạnh một bạn học mới.',
    initialAiMessage: {
      hanzi: '你好！很高兴认识你。你叫什么名字？',
      pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ. Nǐ jiào shénme míngzi?',
      meaningVi: 'Chào bạn! Rất vui được quen biết bạn. Bạn tên là gì thế?'
    },
    sampleResponses: [
      {
        hanzi: '你好！我叫阮文南，我是越南人。',
        pinyin: 'Nǐ hǎo! Wǒ jiào Ruǎn Wén Nán, wǒ shì Yuènánrén.',
        meaningVi: 'Chào bạn! Mình tên là Nguyễn Văn Nam, mình là người Việt Nam.'
      },
      {
        hanzi: '我也很高兴认识你。',
        pinyin: 'Wǒ yě hěn gāoxìng rènshi nǐ.',
        meaningVi: 'Mình cũng rất vui được làm quen với bạn.'
      }
    ],
    keyVocabulary: [
      { hanzi: '名字', pinyin: 'míngzi', meaningVi: 'tên' },
      { hanzi: '认识', pinyin: 'rènshi', meaningVi: 'quen biết' },
      { hanzi: '高兴', pinyin: 'gāoxìng', meaningVi: 'vui mừng' },
      { hanzi: '学生', pinyin: 'xuéshēng', meaningVi: 'học sinh' }
    ]
  },
  {
    id: 'scen_cafe',
    title: '在咖啡馆点饮品 (Ordering at a Cafe)',
    titleVi: 'Gọi đồ uống tại quán cà phê',
    hskLevel: 'hsk1',
    category: 'daily',
    descriptionVi: 'Tập gọi đồ uống nóng/lạnh, số lượng và thanh toán tại quầy.',
    aiRole: 'Nhân viên pha chế quán cà phê (店员)',
    userRole: 'Khách hàng',
    situation: 'Bạn bước vào quán cà phê Trung Hoa và tiến lại quầy gọi món.',
    initialAiMessage: {
      hanzi: '你好，欢迎光临！你想喝点儿什么？',
      pinyin: 'Nǐ hǎo, huānyíng guānglín! Nǐ xiǎng hē diǎnr shénme?',
      meaningVi: 'Xin chào, hoan nghênh quý khách! Bạn muốn uống chút gì ạ?'
    },
    sampleResponses: [
      {
        hanzi: '我要一杯冰美式咖啡，谢谢。',
        pinyin: 'Wǒ yào yì bēi bīng měishì kāfēi, xièxie.',
        meaningVi: 'Cho tôi một ly cà phê Americano đá, cảm ơn.'
      },
      {
        hanzi: '多少钱一杯？',
        pinyin: 'Duōshao qián yì bēi?',
        meaningVi: 'Bao nhiêu tiền một ly ạ?'
      }
    ],
    keyVocabulary: [
      { hanzi: '咖啡', pinyin: 'kāfēi', meaningVi: 'cà phê' },
      { hanzi: '杯', pinyin: 'bēi', meaningVi: 'ly, cốc' },
      { hanzi: '热', pinyin: 'rè', meaningVi: 'nóng' },
      { hanzi: '冰', pinyin: 'bīng', meaningVi: 'đá, lạnh' },
      { hanzi: '多少钱', pinyin: 'duōshao qián', meaningVi: 'bao nhiêu tiền' }
    ]
  },
  {
    id: 'scen_directions',
    title: '问路 (Asking for Directions)',
    titleVi: 'Hỏi đường đến ga tàu điện ngầm',
    hskLevel: 'hsk2',
    category: 'travel',
    descriptionVi: 'Hỏi đường người qua đường cách đi đến trạm tàu ngầm gần nhất.',
    aiRole: 'Người dân địa phương tốt bụng (路人)',
    userRole: 'Khách du lịch',
    situation: 'Bạn đang đi bộ ở Bắc Kinh và tìm lối vào ga tàu điện ngầm.',
    initialAiMessage: {
      hanzi: '你好！请问有什么可以帮你的吗？',
      pinyin: 'Nǐ hǎo! Qǐngwèn yǒu shénme kěyǐ bāng nǐ de ma?',
      meaningVi: 'Chào bạn! Xin hỏi có gì tôi có thể giúp được bạn không?'
    },
    sampleResponses: [
      {
        hanzi: '请问，地铁站在哪里？',
        pinyin: 'Qǐngwèn, dìtiězhan zài nǎlǐ?',
        meaningVi: 'Xin hỏi, trạm tàu điện ngầm ở đâu vậy ạ?'
      },
      {
        hanzi: '往前面走，还是往左边走？',
        pinyin: 'Wǎng qiánmiàn zǒu, háishì wǎng zuǒbian zǒu?',
        meaningVi: 'Đi thẳng về phía trước hay rẽ bên trái ạ?'
      }
    ],
    keyVocabulary: [
      { hanzi: '地铁站', pinyin: 'dìtiězhàn', meaningVi: 'trạm tàu điện' },
      { hanzi: '往', pinyin: 'wǎng', meaningVi: 'hướng về' },
      { hanzi: '左 / 右', pinyin: 'zuǒ / yòu', meaningVi: 'trái / phải' },
      { hanzi: '远', pinyin: 'yuǎn', meaningVi: 'xa' },
      { hanzi: '近', pinyin: 'jìn', meaningVi: 'gần' }
    ]
  },
  {
    id: 'scen_shopping',
    title: '买衣服与还价 (Shopping & Bargaining)',
    titleVi: 'Mua sắm quần áo và mặc cả',
    hskLevel: 'hsk2',
    category: 'daily',
    descriptionVi: 'Hỏi giá, thử cỡ áo và xin giảm giá lịch sự tại khu chợ mua sắm.',
    aiRole: 'Chủ tiệm bán quần áo nhiệt tình (老板)',
    userRole: 'Khách mua sắm',
    situation: 'Bạn thích một chiếc áo khoác và muốn hỏi kích cỡ và giá tiền.',
    initialAiMessage: {
      hanzi: '帅哥/美女，来看一下！这件外套很适合你，要试一下吗？',
      pinyin: 'Shuàigē/Měinǚ, lái kàn yíxià! Zhè jiàn wàitào hěn shìhé nǐ, yào shì yíxià ma?',
      meaningVi: 'Bạn ơi ghé xem nhé! Chiếc áo khoác này rất hợp với bạn đấy, có muốn thử không?'
    },
    sampleResponses: [
      {
        hanzi: '这件衣服多少钱？太贵了，能不能便宜一点儿？',
        pinyin: 'Zhè jiàn yīfu duōshao qián? Tài guì le, néng bù néng piányi yìdiǎnr?',
        meaningVi: 'Chiếc áo này bao nhiêu tiền? Đắt quá, có thể rẻ hơn chút được không?'
      },
      {
        hanzi: '有没有大一号的？',
        pinyin: 'Yǒu méiyǒu dà yí hào de?',
        meaningVi: 'Có cỡ lớn hơn một số không?'
      }
    ],
    keyVocabulary: [
      { hanzi: '便宜', pinyin: 'piányi', meaningVi: 'rẻ' },
      { hanzi: '贵', pinyin: 'guì', meaningVi: 'đắt' },
      { hanzi: '试', pinyin: 'shì', meaningVi: 'thử' },
      { hanzi: '穿', pinyin: 'chuān', meaningVi: 'mặc' }
    ]
  },
  {
    id: 'scen_hospital',
    title: '看医生 (Visiting the Doctor)',
    titleVi: 'Đi khám bệnh & Miêu tả triệu chứng',
    hskLevel: 'hsk3',
    category: 'daily',
    descriptionVi: 'Nói với bác sĩ về các triệu chứng sốt, đau đầu, đau bụng và nhận lời khuyên.',
    aiRole: 'Bác sĩ phòng khám (王医生)',
    userRole: 'Bệnh nhân',
    situation: 'Bạn bị ốm nhẹ và đến phòng khám đa khoa để kê đơn thuốc.',
    initialAiMessage: {
      hanzi: '你好，请坐。你哪里不舒服？从什么时候开始的？',
      pinyin: 'Nǐ hǎo, qǐng zuò. Nǐ nǎlǐ bù shūfu? Cóng shénme shíhou kāishǐ de?',
      meaningVi: 'Chào bạn, mời ngồi. Bạn cảm thấy khó chịu ở chỗ nào? Bắt đầu từ khi nào thế?'
    },
    sampleResponses: [
      {
        hanzi: '我从昨天晚上开始头疼，还有点儿发烧。',
        pinyin: 'Wǒ cóng zuótiān wǎnshang kāishǐ tóuténg, hái yǒudiǎnr fāshāo.',
        meaningVi: 'Tôi bị đau đầu từ tối hôm qua, còn hơi sốt nữa.'
      },
      {
        hanzi: '这个药一天吃几次？饭前还是饭后吃？',
        pinyin: 'Zhè ge yào yì tiān chī jǐ cì? Fàn qián háishì fàn hòu chī?',
        meaningVi: 'Thuốc này ngày uống mấy lần? Uống trước hay sau bữa ăn ạ?'
      }
    ],
    keyVocabulary: [
      { hanzi: '舒服', pinyin: 'shūfu', meaningVi: 'dễ chịu, khỏe' },
      { hanzi: '头疼', pinyin: 'tóuténg', meaningVi: 'đau đầu' },
      { hanzi: '发烧', pinyin: 'fāshāo', meaningVi: 'phát sốt' },
      { hanzi: '吃药', pinyin: 'chī yào', meaningVi: 'uống thuốc' }
    ]
  },
  {
    id: 'scen_interview',
    title: '工作面试 (Job Interview)',
    titleVi: 'Phỏng vấn xin việc bằng tiếng Trung',
    hskLevel: 'hsk4',
    category: 'work',
    descriptionVi: 'Trả lời phỏng vấn về kinh nghiệm làm việc, thế mạnh bản thân và lý do ứng tuyển.',
    aiRole: 'Giám đốc nhân sự công ty đa quốc gia (张经理)',
    userRole: 'Ứng viên tìm việc',
    situation: 'Bạn đang tham gia vòng phỏng vấn chuyên môn cho vị trí chuyên viên phát triển.',
    initialAiMessage: {
      hanzi: '你好，请坐。我看过你的简历，你的中文很流利。能先简单介绍一下你的工作经历吗？',
      pinyin: 'Nǐ hǎo, qǐng zuò. Wǒ kàn guò nǐ de jiǎnlì, nǐ de Zhōngwén hěn liúlì. Néng xiān jiǎndān jièshào yíxià nǐ de gōngzuò jīnglì ma?',
      meaningVi: 'Chào bạn, mời ngồi. Tôi đã xem qua hồ sơ của bạn, tiếng Trung của bạn rất lưu loát. Bạn có thể giới thiệu sơ lược về kinh nghiệm làm việc của mình không?'
    },
    sampleResponses: [
      {
        hanzi: '我毕业于河内国家大学，有两年的软件开发经验。',
        pinyin: 'Wǒ bìyè yú Hénèi Guójiā Dàxué, yǒu liǎng nián de ruǎnjiàn kāifā jīngyàn.',
        meaningVi: 'Tôi tốt nghiệp Đại học Quốc gia Hà Nội, có 2 năm kinh nghiệm phát triển phần mềm.'
      },
      {
        hanzi: '我相信我的专业能力和沟通能力能够胜任这份工作。',
        pinyin: 'Wǒ xiāngxìn wǒ de zhuānyè nénglì hé gōutōng nénglì nénggòu shèngrèn zhè fèn gōngzuò.',
        meaningVi: 'Tôi tin rằng năng lực chuyên môn và kỹ năng giao tiếp của mình hoàn toàn đáp ứng được công việc này.'
      }
    ],
    keyVocabulary: [
      { hanzi: '简历', pinyin: 'jiǎnlì', meaningVi: 'sơ yếu lý lịch, CV' },
      { hanzi: '经历', pinyin: 'jīnglì', meaningVi: 'kinh nghiệm, trải nghiệm' },
      { hanzi: '负责', pinyin: 'fùzé', meaningVi: 'phụ trách, chịu trách nhiệm' },
      { hanzi: '能力', pinyin: 'nénglì', meaningVi: 'năng lực' },
      { hanzi: '适合', pinyin: 'shìhé', meaningVi: 'phù hợp' }
    ]
  }
];

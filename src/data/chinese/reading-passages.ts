import type { HSKLevel } from '@/types/chinese';

export interface ChineseReadingPassage {
  id: string;
  title: string;
  titleVi: string;
  hskLevel: HSKLevel;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  content: string; // full Chinese text
  pinyinContent: string;
  translationVi: string;
  sentences: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanationVi: string;
  }>;
  vocabulary: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
}

export const CHINESE_READING_PASSAGES: ChineseReadingPassage[] = [
  {
    id: 'read_hsk1_daily',
    title: '我的每一天 (My Day)',
    titleVi: 'Một ngày của tôi',
    hskLevel: 'hsk1',
    difficulty: 'easy',
    topic: 'Cuộc sống hàng ngày',
    content: '我叫李明。我每天早上七点起床，吃早饭。上午我去学校学习汉语。我喜欢我的汉语老师，她很友好。下午我和朋友一起喝茶，听音乐。晚上我回家看书，十点睡觉。',
    pinyinContent: 'Wǒ jiào Lǐ Míng. Wǒ měitiān zǎoshang qī diǎn qǐchuáng, chī zǎofàn. Shàngwǔ wǒ qù xuéxiào xuéxí Hànyǔ. Wǒ xǐhuan wǒ de Hànyǔ lǎoshī, tā hěn yǒuhǎo. Xiàwǔ wǒ hé péngyou yìqǐ hē chá, tīng yīnyuè. Wǎnshang wǒ huí jiā kàn shū, shí diǎn shuìjiào.',
    translationVi: 'Tôi tên là Lý Minh. Mỗi sáng tôi thức dậy lúc 7 giờ và ăn sáng. Buổi sáng tôi đến trường học tiếng Trung. Tôi rất thích cô giáo tiếng Trung của tôi, cô rất thân thiện. Buổi chiều tôi cùng bạn bè uống trà và nghe nhạc. Buổi tối tôi về nhà đọc sách và đi ngủ lúc 10 giờ.',
    sentences: [
      {
        hanzi: '我叫李明。',
        pinyin: 'Wǒ jiào Lǐ Míng.',
        meaningVi: 'Tôi tên là Lý Minh.'
      },
      {
        hanzi: '我每天早上七点起床，吃早饭。',
        pinyin: 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng, chī zǎofàn.',
        meaningVi: 'Mỗi sáng tôi thức dậy lúc 7 giờ và ăn bữa sáng.'
      },
      {
        hanzi: '上午我去学校学习汉语。',
        pinyin: 'Shàngwǔ wǒ qù xuéxiào xuéxí Hànyǔ.',
        meaningVi: 'Buổi sáng tôi đến trường học tiếng Trung.'
      },
      {
        hanzi: '我喜欢我的汉语老师，她很友好。',
        pinyin: 'Wǒ xǐhuan wǒ de Hànyǔ lǎoshī, tā hěn yǒuhǎo.',
        meaningVi: 'Tôi thích giáo viên tiếng Trung của tôi, cô ấy rất thân thiện.'
      },
      {
        hanzi: '下午我和朋友一起喝茶，听音乐。',
        pinyin: 'Xiàwǔ wǒ hé péngyou yìqǐ hē chá, tīng yīnyuè.',
        meaningVi: 'Buổi chiều tôi cùng bạn bè uống trà, nghe nhạc.'
      },
      {
        hanzi: '晚上我回家看书，十点睡觉。',
        pinyin: 'Wǎnshang wǒ huí jiā kàn shū, shí diǎn shuìjiào.',
        meaningVi: 'Buổi tối tôi về nhà đọc sách, 10 giờ đi ngủ.'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '李明早上几点起床？(Lý Minh thức dậy lúc mấy giờ?)',
        options: ['六点 (6:00)', '七点 (7:00)', '八点 (8:00)', '九点 (9:00)'],
        correctAnswerIndex: 1,
        explanationVi: 'Trong bài có câu: "我每天早上七点起床" (Tôi thức dậy lúc 7 giờ sáng).'
      },
      {
        id: 'q2',
        question: '下午李明做什么？(Buổi chiều Lý Minh làm gì?)',
        options: [
          '去学校学习 (Đi trường học)',
          '去医院看医生 (Đi viện khám)',
          '和朋友喝茶听音乐 (Cùng bạn uống trà nghe nhạc)',
          '睡觉 (Ngủ)'
        ],
        correctAnswerIndex: 2,
        explanationVi: 'Câu văn: "下午我和朋友一起喝茶，听音乐".'
      }
    ],
    vocabulary: [
      { hanzi: '起床', pinyin: 'qǐchuáng', meaningVi: 'thức dậy' },
      { hanzi: '学校', pinyin: 'xuéxiào', meaningVi: 'trường học' },
      { hanzi: '友好', pinyin: 'yǒuhǎo', meaningVi: 'thân thiện' },
      { hanzi: '睡觉', pinyin: 'shuìjiào', meaningVi: 'đi ngủ' }
    ]
  },
  {
    id: 'read_hsk2_market',
    title: '在中国超市买东西 (Shopping in China)',
    titleVi: 'Đi siêu thị tại Trung Quốc',
    hskLevel: 'hsk2',
    difficulty: 'medium',
    topic: 'Mua sắm & Đời sống',
    content: '今天星期六，超市里的人很多。我和妈妈一起去买水果和蔬菜。那里的苹果又大又甜，一斤五块钱。妈妈买了三斤苹果，还买了两瓶牛奶。现在的中国超市很方便，我们用手机扫码就可以付款，不需要带现金。',
    pinyinContent: 'Jīntiān xīngqīliù, chāoshì lǐ de rén hěn duō. Wǒ hé māma yìqǐ qù mǎi shuǐguǒ hé shūcài. Nàlǐ de píngguǒ yòu dà yòu tián, yì jīn wǔ kuài qián. Māma mǎi le sān jīn píngguǒ, hái mǎi le liǎng píng niúnǎi. Xiànzài de Zhōngguó chāoshì hěn fāngbiàn, wǒmen yòng shǒujī sǎomǎ jiù kěyǐ fùkuǎn, bù xūyào dài xiànjīn.',
    translationVi: 'Hôm nay là thứ Bảy, người trong siêu thị rất đông. Tôi cùng mẹ đi mua hoa quả và rau củ. Táo ở đó vừa to vừa ngọt, một cân (nửa kg) 5 tệ. Mẹ tôi mua 3 cân táo, còn mua thêm 2 chai sữa tươi. Siêu thị Trung Quốc hiện nay rất tiện lợi, chúng tôi quét mã bằng điện thoại là có thể thanh toán, không cần mang theo tiền mặt.',
    sentences: [
      {
        hanzi: '今天星期六，超市里的人很多。',
        pinyin: 'Jīntiān xīngqīliù, chāoshì lǐ de rén hěn duō.',
        meaningVi: 'Hôm nay là thứ Bảy, người trong siêu thị rất đông.'
      },
      {
        hanzi: '我和妈妈一起去买水果和蔬菜。',
        pinyin: 'Wǒ hé māma yìqǐ qù mǎi shuǐguǒ hé shūcài.',
        meaningVi: 'Tôi cùng mẹ đi mua hoa quả và rau củ.'
      },
      {
        hanzi: '那里的苹果又大又甜，一斤五块钱。',
        pinyin: 'Nàlǐ de píngguǒ yòu dà yòu tián, yì jīn wǔ kuài qián.',
        meaningVi: 'Táo ở đó vừa to vừa ngọt, một cân (500g) 5 tệ.'
      },
      {
        hanzi: '妈妈买了三斤苹果，还买了两瓶牛奶。',
        pinyin: 'Māma mǎi le sān jīn píngguǒ, hái mǎi le liǎng píng niúnǎi.',
        meaningVi: 'Mẹ mua 3 cân táo, còn mua thêm 2 chai sữa bò.'
      },
      {
        hanzi: '现在的中国超市很方便，我们用手机扫码就可以付款。',
        pinyin: 'Xiànzài de Zhōngguó chāoshì hěn fāngbiàn, wǒmen yòng shǒujī sǎomǎ jiù kěyǐ fùkuǎn.',
        meaningVi: 'Siêu thị Trung Quốc bây giờ rất tiện lợi, chúng tôi dùng điện thoại quét mã là trả tiền được.'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '苹果多少钱一斤？(Táo bao nhiêu tiền một cân?)',
        options: ['三块 (3 tệ)', '四块 (4 tệ)', '五块 (5 tệ)', '六块 (6 tệ)'],
        correctAnswerIndex: 2,
        explanationVi: 'Bài viết nêu rõ: "一斤五块钱" (Một cân 5 tệ).'
      },
      {
        id: 'q2',
        question: '他们怎么付款？(Họ thanh toán bằng cách nào?)',
        options: [
          '用现金 (Dùng tiền mặt)',
          '用手机扫码 (Dùng điện thoại quét mã)',
          '刷信用卡 (Quẹt thẻ tín dụng)',
          '别人帮忙付 (Nhờ người khác trả)'
        ],
        correctAnswerIndex: 1,
        explanationVi: '"用手机扫码就可以付款" (Dùng điện thoại quét mã là thanh toán được).'
      }
    ],
    vocabulary: [
      { hanzi: '超市', pinyin: 'chāoshì', meaningVi: 'siêu thị' },
      { hanzi: '方便', pinyin: 'fāngbiàn', meaningVi: 'tiện lợi' },
      { hanzi: '付款', pinyin: 'fùkuǎn', meaningVi: 'thanh toán tiền' },
      { hanzi: '现金', pinyin: 'xiànjīn', meaningVi: 'tiền mặt' }
    ]
  },
  {
    id: 'read_hsk3_travel',
    title: '乘坐高铁去上海 (High-speed Rail to Shanghai)',
    titleVi: 'Trải nghiệm tàu cao tốc đi Thượng Hải',
    hskLevel: 'hsk3',
    difficulty: 'hard',
    topic: 'Du lịch & Giao thông',
    content: '中国的高铁速度非常快，每小时可以跑三百多公里。以前从北京到上海坐普通火车需要十几个小时，现在乘坐复兴号高铁只需要四个半小时。车厢里不仅干净舒服，而且还有免费的Wi-Fi和充电插座。虽然高铁票比普通火车票贵一些，但是能节约很多宝贵的时间。',
    pinyinContent: 'Zhōngguó de gāotiě sùdù fēicháng kuài, měi xiǎoshí kěyǐ pǎo sān bǎi duō gōnglǐ. Yǐqián cóng Běijīng dào Shànghǎi zuò pǔtōng huǒchē xūyào shí jǐ gè xiǎoshí, xiànzài chéngzuò Fùxīnghào gāotiě zhǐ xūyào sì gè bàn xiǎoshí. Chēxiāng lǐ bùjǐn gānjìng shūfu, érqiě hái yǒu miǎnfèi de Wi-Fi hé chōngdiàn chāzuò. Suīrán gāotiě piào bǐ pǔtōng huǒchē piào guì yìxiē, dànshì néng jiéyuē hěn duō bǎoguì de shíjiān.',
    translationVi: 'Tàu cao tốc Trung Quốc có tốc độ vô cùng nhanh, mỗi giờ có thể chạy hơn 300 km. Trước đây từ Bắc Kinh đến Thượng Hải đi tàu hỏa thông thường mất hơn 10 tiếng, hiện nay ngồi tàu cao tốc Phục Hưng chỉ cần 4 tiếng rưỡi. Toa tàu không những sạch sẽ, thoải mái mà còn có Wi-Fi miễn phí và ổ cắm sạc pin. Mặc dù vé tàu cao tốc đắt hơn vé tàu thường một chút, nhưng tiết kiệm được rất nhiều thời gian quý báu.',
    sentences: [
      {
        hanzi: '中国的高铁速度非常快，每小时可以跑三百多公里。',
        pinyin: 'Zhōngguó de gāotiě sùdù fēicháng kuài, měi xiǎoshí kěyǐ pǎo sān bǎi duō gōnglǐ.',
        meaningVi: 'Tàu cao tốc Trung Quốc tốc độ rất nhanh, mỗi giờ có thể chạy hơn 300 km.'
      },
      {
        hanzi: '现在乘坐复兴号高铁只需要四个半小时。',
        pinyin: 'Xiànzài chéngzuò Fùxīnghào gāotiě zhǐ xūyào sì gè bàn xiǎoshí.',
        meaningVi: 'Hiện nay đi tàu cao tốc Phục Hưng chỉ mất 4 tiếng rưỡi.'
      },
      {
        hanzi: '虽然高铁票比普通火车票贵一些，但是能节约很多宝贵的时间。',
        pinyin: 'Suīrán gāotiě piào bǐ pǔtōng huǒchē piào guì yìxiē, dànshì néng jiéyuē hěn duō bǎoguì de shíjiān.',
        meaningVi: 'Mặc dù vé tàu cao tốc đắt hơn vé tàu thường một chút, nhưng tiết kiệm được rất nhiều thời gian quý báu.'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '从北京到上海坐复兴号高铁需要多长时间？(Từ Bắc Kinh đến Thượng Hải đi tàu Phục Hưng mất bao lâu?)',
        options: ['三个小时 (3 tiếng)', '四个半小时 (4.5 tiếng)', '六个小时 (6 tiếng)', '十个小时 (10 tiếng)'],
        correctAnswerIndex: 1,
        explanationVi: '"现在乘坐复兴号高铁只需要四个半小时" (Chỉ cần 4 tiếng rưỡi).'
      }
    ],
    vocabulary: [
      { hanzi: '高铁', pinyin: 'gāotiě', meaningVi: 'tàu cao tốc' },
      { hanzi: '速度', pinyin: 'sùdù', meaningVi: 'tốc độ' },
      { hanzi: '节约', pinyin: 'jiéyuē', meaningVi: 'tiết kiệm' },
      { hanzi: '宝贵', pinyin: 'bǎoguì', meaningVi: 'quý báu' }
    ]
  }
];

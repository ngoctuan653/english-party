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
  // ==========================================
  // HSK 1 PASSAGES
  // ==========================================
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
        meaningVi: 'Tôi rất thích cô giáo tiếng Trung của tôi, cô ấy rất thân thiện.'
      },
      {
        hanzi: '下午我和朋友一起喝茶，听音乐。',
        pinyin: 'Xiàwǔ wǒ hé péngyou yìqǐ hē chá, tīng yīnyuè.',
        meaningVi: 'Buổi chiều tôi cùng bạn bè uống trà và nghe nhạc.'
      },
      {
        hanzi: '晚上我回家看书，十点睡觉。',
        pinyin: 'Wǎnshang wǒ huí jiā kàn shū, shí diǎn shuìjiào.',
        meaningVi: 'Buổi tối tôi về nhà đọc sách và đi ngủ lúc 10 giờ.'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '李明几点起床？ (Lý Minh thức dậy lúc mấy giờ?)',
        options: ['六点 (6 giờ)', '七点 (7 giờ)', '八点 (8 giờ)'],
        correctAnswerIndex: 1,
        explanationVi: 'Bài đọc nêu rõ: "我每天早上七点起床".'
      },
      {
        id: 'q2',
        question: '下午李明做什么？ (Buổi chiều Lý Minh làm gì?)',
        options: ['学习汉语', '和朋友喝茶听音乐', '去学校'],
        correctAnswerIndex: 1,
        explanationVi: 'Bài đọc nêu: "下午我和朋友一起喝茶，听音乐".'
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
    id: 'read_hsk1_restaurant',
    title: '去中国饭馆 (At Chinese Restaurant)',
    titleVi: 'Đến nhà hàng Trung Hoa',
    hskLevel: 'hsk1',
    difficulty: 'easy',
    topic: 'Ẩm thực & Gọi món',
    content: '今天是星期天。我和我的中国朋友去饭馆吃饭。饭馆里的人很多。我们点了三个菜：米饭、牛肉和西红柿炒鸡蛋。中国菜很好吃，我们都很高兴。',
    pinyinContent: 'Jīntiān shì xīngqītiān. Wǒ hé wǒ de Zhōngguó péngyou qù fànguǎn chīfàn. Fànguǎn lǐ de rén hěn duō. Wǒmen diǎn le sān ge cài: mǐfàn, niúròu hé xīhóngshì chǎo jīdàn. Zhōngguó cài hěn hǎochī, wǒmen dōu hěn gāoxìng.',
    translationVi: 'Hôm nay là Chủ Nhật. Tôi cùng người bạn Trung Quốc đến nhà hàng ăn cơm. Người trong quán rất đông. Chúng tôi gọi ba món: cơm trắng, thịt bò và trứng xào cà chua. Món ăn Trung Quốc rất ngon, chúng tôi đều rất vui.',
    sentences: [
      {
        hanzi: '今天是星期天。',
        pinyin: 'Jīntiān shì xīngqītiān.',
        meaningVi: 'Hôm nay là Chủ Nhật.'
      },
      {
        hanzi: '我和我的中国朋友去饭馆吃饭。',
        pinyin: 'Wǒ hé wǒ de Zhōngguó péngyou qù fànguǎn chīfàn.',
        meaningVi: 'Tôi cùng bạn Trung Quốc đến quán ăn cơm.'
      },
      {
        hanzi: '饭馆里的人很多。',
        pinyin: 'Fànguǎn lǐ de rén hěn duō.',
        meaningVi: 'Người trong quán ăn rất đông.'
      },
      {
        hanzi: '我们点了三个菜：米饭、牛肉和西红柿炒鸡蛋。',
        pinyin: 'Wǒmen diǎn le sān ge cài: mǐfàn, niúròu hé xīhóngshì chǎo jīdàn.',
        meaningVi: 'Chúng tôi gọi ba món: cơm, thịt bò và trứng xào cà chua.'
      },
      {
        hanzi: '中国菜很好吃，我们都很高兴。',
        pinyin: 'Zhōngguó cài hěn hǎochī, wǒmen dōu hěn gāoxìng.',
        meaningVi: 'Món ăn Trung Quốc rất ngon, chúng tôi đều rất vui vẻ.'
      }
    ],
    questions: [
      {
        id: 'q_res_1',
        question: '他们哪天去饭馆？ (Họ đi nhà hàng vào ngày nào?)',
        options: ['星期六 (Thứ Bảy)', '星期天 (Chủ Nhật)', '星期五 (Thứ Sáu)'],
        correctAnswerIndex: 1,
        explanationVi: 'Bài đọc: "今天是星期天" (Hôm nay là Chủ Nhật).'
      }
    ],
    vocabulary: [
      { hanzi: '饭馆', pinyin: 'fànguǎn', meaningVi: 'nhà hàng, quán ăn' },
      { hanzi: '好吃', pinyin: 'hǎochī', meaningVi: 'ngon miệng' },
      { hanzi: '点菜', pinyin: 'diǎncài', meaningVi: 'gọi món' }
    ]
  },

  // ==========================================
  // HSK 2 PASSAGES
  // ==========================================
  {
    id: 'read_hsk2_travel',
    title: '去北京旅游 (A Trip to Beijing)',
    titleVi: 'Chuyến du lịch Bắc Kinh',
    hskLevel: 'hsk2',
    difficulty: 'medium',
    topic: 'Du lịch & Trải nghiệm',
    content: '去年秋天，我和家人坐飞机去北京旅游。北京的天气比我想象的要冷一些，但是风景非常美丽。我们去了故宫和长城。长城很长，爬上去虽然有点儿累，但是看到壮丽的风景，大家觉得非常值得。',
    pinyinContent: 'Qùnián qiūtiān, wǒ hé jiārén zuò fēijī qù Běijīng lǚyóu. Běijīng de tiānqì bǐ wǒ xiǎngxiàng de yào lěng yìxiē, dànshì fēngjǐng fēicháng měilì. Wǒmen qù le Gùgōng hé Chángchéng. Chángchéng hěn cháng, pá shàngqu suīrán yǒudiǎnr lèi, dànshì kàndào zhuànglì de fēngjǐng, dàjiā juéde fēicháng zhídé.',
    translationVi: 'Mùa thu năm ngoái, tôi cùng gia đình đi máy bay đến Bắc Kinh du lịch. Thời tiết ở Bắc Kinh lạnh hơn một chút so với tôi tưởng tượng, nhưng phong cảnh vô cùng tươi đẹp. Chúng tôi đã đến Cố Cung và Vạn Lý Trường Thành. Trường Thành rất dài, leo lên tuy có chút mệt mỏi, nhưng khi nhìn ngắm cảnh tượng hùng vĩ, mọi người đều cảm thấy rất xứng đáng.',
    sentences: [
      {
        hanzi: '去年秋天，我和家人坐飞机去北京旅游。',
        pinyin: 'Qùnián qiūtiān, wǒ hé jiārén zuò fēijī qù Běijīng lǚyóu.',
        meaningVi: 'Mùa thu năm ngoái, tôi và người nhà đi máy bay đến Bắc Kinh du lịch.'
      },
      {
        hanzi: '北京的天气比我想象的要冷一些，但是风景非常美丽。',
        pinyin: 'Běijīng de tiānqì bǐ wǒ xiǎngxiàng de yào lěng yìxiē, dànshì fēngjǐng fēicháng měilì.',
        meaningVi: 'Thời tiết Bắc Kinh lạnh hơn một chút so với tôi tưởng tượng, nhưng phong cảnh rất đẹp.'
      },
      {
        hanzi: '我们去了故宫和长城。',
        pinyin: 'Wǒmen qù le Gùgōng hé Chángchéng.',
        meaningVi: 'Chúng tôi đã đi Cố Cung và Vạn Lý Trường Thành.'
      },
      {
        hanzi: '长城很长，爬上去虽然有点儿累，但是看到壮丽的风景，大家觉得非常值得。',
        pinyin: 'Chángchéng hěn cháng, pá shàngqu suīrán yǒudiǎnr lèi, dànshì kàndào zhuànglì de fēngjǐng, dàjiā juéde fēicháng zhídé.',
        meaningVi: 'Trường Thành rất dài, leo lên dù có chút mệt, nhưng ngắm cảnh hùng vĩ ai cũng thấy rất xứng đáng.'
      }
    ],
    questions: [
      {
        id: 'q_bj_1',
        question: '他们怎么去北京？ (Họ đến Bắc Kinh bằng cách nào?)',
        options: ['坐火车 (Đi tàu hỏa)', '坐飞机 (Đi máy bay)', '开车 (Lái xe hơi)'],
        correctAnswerIndex: 1,
        explanationVi: 'Bài đọc: "我和家人坐飞机去北京旅游".'
      }
    ],
    vocabulary: [
      { hanzi: '旅游', pinyin: 'lǚyóu', meaningVi: 'du lịch' },
      { hanzi: '风景', pinyin: 'fēngjǐng', meaningVi: 'phong cảnh' },
      { hanzi: '值得', pinyin: 'zhídé', meaningVi: 'xứng đáng' }
    ]
  },

  // ==========================================
  // HSK 3 PASSAGES
  // ==========================================
  {
    id: 'read_hsk3_healthy_living',
    title: '健康的生活方式 (Healthy Lifestyle)',
    titleVi: 'Lối sống lành mạnh',
    hskLevel: 'hsk3',
    difficulty: 'medium',
    topic: 'Sức khỏe & Đời sống',
    content: '现代人的生活节奏越来越快，工作压力也越来越大。为了保持身体健康，很多年轻人开始重视运动和饮食。医生建议我们，每天应该坚持锻炼半个小时以上，比如慢跑或者游泳。此外，我们要把早饭吃好，少吃油腻的食物，并且尽量在晚上十一点之前睡觉。只有身体好，我们才能更好地工作和学习。',
    pinyinContent: 'Xiàndàirén de shēnghuó jiézòu yuè lái yuè kuài, gōngzuò yālì yě yuè lái yuè dà. Wèile bǎochí shēntǐ jiànkāng, hěn duō niánqīngrén kāishǐ zhòngshì yùndòng hé yǐnshí. Yīshēng jiànyì wǒmen, měitiān yīnggāi jiānchí duànliàn bàn ge xiǎoshí yǐshàng, bǐrú mànpǎo huòzhě yóuyǒng. Cǐwài, wǒmen yào bǎ zǎofàn chī hǎo, shǎo chī yóunì de shíwù, bìngqiě jǐnliàng zài wǎnshang shíyī diǎn zhīqián shuìjiào. Zhǐyǒu shēntǐ hǎo, wǒmen cái néng gèng hǎo de gōngzuò hé xuéxí.',
    translationVi: 'Nhịp sống của con người hiện đại ngày càng nhanh, áp lực công việc cũng ngày càng lớn. Để duy trì sức khỏe thể chất, nhiều bạn trẻ đã bắt đầu chú trọng đến vận động và ăn uống. Bác sĩ khuyên chúng ta mỗi ngày nên kiên trì rèn luyện trên nửa tiếng đồng hồ, chẳng hạn như chạy bộ chậm hoặc bơi lội. Ngoài ra, chúng ta phải ăn bữa sáng thật tốt, hạn chế ăn đồ nhiều dầu mỡ, và cố gắng đi ngủ trước 11 giờ đêm. Chỉ khi cơ thể khỏe mạnh, chúng ta mới có thể làm việc và học tập tốt hơn.',
    sentences: [
      {
        hanzi: '现代人的生活节奏越来越快，工作压力也越来越大。',
        pinyin: 'Xiàndàirén de shēnghuó jiézòu yuè lái yuè kuài, gōngzuò yālì yě yuè lái yuè dà.',
        meaningVi: 'Nhịp sống của người hiện đại ngày càng nhanh, áp lực công việc cũng ngày một lớn.'
      },
      {
        hanzi: '为了保持身体健康，很多年轻人开始重视运动和饮食。',
        pinyin: 'Wèile bǎochí shēntǐ jiànkāng, hěn duō niánqīngrén kāishǐ zhòngshì yùndòng hé yǐnshí.',
        meaningVi: 'Để duy trì sức khỏe, nhiều bạn trẻ bắt đầu chú trọng rèn luyện thể thao và dinh dưỡng.'
      },
      {
        hanzi: '医生建议我们，每天应该坚持锻炼半个小时以上。',
        pinyin: 'Yīshēng jiànyì wǒmen, měitiān yīnggāi jiānchí duànliàn bàn ge xiǎoshí yǐshàng.',
        meaningVi: 'Bác sĩ khuyên chúng ta mỗi ngày nên kiên trì tập luyện từ nửa tiếng trở lên.'
      }
    ],
    questions: [
      {
        id: 'q_hsk3_1',
        question: '医生建议每天锻炼多长时间？ (Bác sĩ khuyên tập thể dục bao lâu mỗi ngày?)',
        options: ['十分钟 (10 phút)', '半个小时以上 (Hơn nửa tiếng)', '两小时 (2 tiếng)'],
        correctAnswerIndex: 1,
        explanationVi: 'Bài đọc: "坚持锻炼半个小时以上".'
      }
    ],
    vocabulary: [
      { hanzi: '节奏', pinyin: 'jiézòu', meaningVi: 'tiết tấu, nhịp điệu' },
      { hanzi: '压力', pinyin: 'yālì', meaningVi: 'áp lực' },
      { hanzi: '建议', pinyin: 'jiànyì', meaningVi: 'đề xuất, khuyên' },
      { hanzi: '坚持', pinyin: 'jiānchí', meaningVi: 'kiên trì' }
    ]
  },

  // ==========================================
  // HSK 4 PASSAGES
  // ==========================================
  {
    id: 'read_hsk4_environment',
    title: '保护环境，从我做起 (Environmental Protection)',
    titleVi: 'Bảo vệ môi trường, bắt đầu từ chính tôi',
    hskLevel: 'hsk4',
    difficulty: 'hard',
    topic: 'Môi trường & Xã hội',
    content: '随着经济的高速发展，环境污染问题逐渐引起了全社会的关注。塑料垃圾、空气污染以及水资源短缺，正在对我们的日常生活产生深远的影响。很多人以为保护环境是大科学家或者政府的事情，其实不然。对于普通人来说，只要我们从生活中的小事做起，就能为地球贡献一份力量。比如出门尽量乘坐公共交通工具，减少使用一次性塑料袋，离开房间时随手关灯节约用电。不仅如此，我们还可以向身边的亲朋好友宣传环保知识。保护环境，就是保护我们共同的家园。',
    pinyinContent: 'Suízhe jīngjì de gāosù fāzhǎn, huánjìng wūrǎn wèntí zhújiàn yǐnqǐ le quán shèhuì de guānzhù. Sùliào lājī, kōngqì wūrǎn yǐjí shuǐ zīyuán duǎnquē, zhèngzài duì wǒmen de rìcháng shēnghuó chǎnshēng shēnyuǎn de yǐngxiǎng. Hěn duō rén yǐwéi bǎohù huánjìng shì dà kēxuéjiā huòzhě zhèngfǔ de shìqing, qíshí bùrán. Duìyú pǔtōngrén láishuō, zhǐyào wǒmen cóng shēnghuó zhōng de xiǎoshì zuòqǐ, jiù néng wèi dìqiú gòngxiàn yí fèn lìliang. Bǐrú chūmén jǐnliàng chéngzuò gōnggòng jiāotōng gōngjù, jiǎnshǎo shǐyòng yícìxìng sùliàodài, líkāi fángjiān shí suíshǒu guāndēng jiéyuē yòngdiàn. Bùjǐn rúcǐ, wǒmen hái kěyǐ xiàng shēnbiān de qīnpéng hǎoyǒu xuānchuán huánbǎo zhīshi. Bǎohù huánjìng, jiù shì bǎohù wǒmen gòngtóng de jiāyuán.',
    translationVi: 'Cùng với sự phát triển thần tốc của nền kinh tế, vấn đề ô nhiễm môi trường dần dần thu hút sự quan tâm của toàn xã hội. Rác thải nhựa, ô nhiễm không khí cũng như sự khan hiếm nguồn nước đang tạo ra những tác động sâu sắc đến đời sống thường nhật của chúng ta. Nhiều người cho rằng bảo vệ môi trường là trách nhiệm của các nhà khoa học lớn hoặc chính phủ, nhưng thực ra không phải như vậy. Đối với người bình thường, chỉ cần chúng ta bắt đầu từ những việc nhỏ trong cuộc sống là đã có thể đóng góp một phần sức mạnh cho Trái Đất. Chẳng hạn như ra ngoài cố gắng đi phương tiện giao thông công cộng, giảm bớt việc dùng túi nilon dùng một lần, tắt đèn khi rời phòng để tiết kiệm điện. Không chỉ có vậy, chúng ta còn có thể tuyên truyền kiến thức bảo vệ môi trường đến bạn bè và người thân xung quanh. Bảo vệ môi trường chính là bảo vệ mái nhà chung của tất cả chúng ta.',
    sentences: [
      {
        hanzi: '随着经济的高速发展，环境污染问题逐渐引起了全社会的关注。',
        pinyin: 'Suízhe jīngjì de gāosù fāzhǎn, huánjìng wūrǎn wèntí zhújiàn yǐnqǐ le quán shèhuì de guānzhù.',
        meaningVi: 'Cùng với phát triển kinh tế nhanh chóng, ô nhiễm môi trường dần gây chú ý toàn xã hội.'
      },
      {
        hanzi: '对于普通人来说，只要我们从生活中的小事做起，就能为地球贡献一份力量。',
        pinyin: 'Duìyú pǔtōngrén láishuō, zhǐyào wǒmen cóng shēnghuó zhōng de xiǎoshì zuòqǐ, jiù néng wèi dìqiú gòngxiàn yí fèn lìliang.',
        meaningVi: 'Đối với người bình thường, chỉ cần bắt đầu từ việc nhỏ là đã góp sức cho Trái Đất.'
      }
    ],
    questions: [
      {
        id: 'q_hsk4_1',
        question: '普通人可以通过什么方式保护环境？ (Người bình thường bảo vệ môi trường bằng cách nào?)',
        options: [
          'A. 乘坐公共交通、少用塑料袋、随手关灯',
          'B. Đợi các nhà khoa học xử lý',
          'C. Không quan tâm vì việc quá lớn'
        ],
        correctAnswerIndex: 0,
        explanationVi: 'Bài đọc nêu ví dụ: "乘坐公共交通工具，减少使用一次性塑料袋，离开房间时随手关灯".'
      }
    ],
    vocabulary: [
      { hanzi: '逐渐', pinyin: 'zhújiàn', meaningVi: 'dần dần' },
      { hanzi: '污染', pinyin: 'wūrǎn', meaningVi: 'ô nhiễm' },
      { hanzi: '贡献', pinyin: 'gòngxiàn', meaningVi: 'đóng góp, cống hiến' },
      { hanzi: '宣传', pinyin: 'xuānchuán', meaningVi: 'tuyên truyền' }
    ]
  }
];

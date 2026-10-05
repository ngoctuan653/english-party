import type { ChineseVocabWord } from '@/types/chinese';

export const HSK2_VOCAB: ChineseVocabWord[] = [
  // 1. Động từ HSK 2
  {
    id: 'hsk2_dong',
    hanzi: '懂',
    pinyin: 'dǒng',
    meaningVi: 'hiểu, biết',
    meaningEn: 'to understand',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 15,
    radicals: ['忄'],
    examples: [
      { hanzi: '你听懂了吗？', pinyin: 'Nǐ tīng dǒng le ma?', meaningVi: 'Bạn nghe hiểu chưa?' },
      { hanzi: '我懂你的意思。', pinyin: 'Wǒ dǒng nǐ de yìsi.', meaningVi: 'Tôi hiểu ý của bạn.' }
    ]
  },
  {
    id: 'hsk2_wan',
    hanzi: '完',
    pinyin: 'wán',
    meaningVi: 'xong, hết',
    meaningEn: 'to finish, complete',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 7,
    radicals: ['宀'],
    examples: [
      { hanzi: '我做完作业了。', pinyin: 'Wǒ zuò wán zuòyè le.', meaningVi: 'Tôi làm xong bài tập rồi.' }
    ]
  },
  {
    id: 'hsk2_gei',
    hanzi: '给',
    pinyin: 'gěi',
    meaningVi: 'cho, tặng, đưa',
    meaningEn: 'to give',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 9,
    radicals: ['纟'],
    examples: [
      { hanzi: '给你一杯水。', pinyin: 'Gěi nǐ yì bēi shuǐ.', meaningVi: 'Cho bạn một ly nước.' },
      { hanzi: '我想给他打电话。', pinyin: 'Wǒ xiǎng gěi tā dǎ diànhuà.', meaningVi: 'Tôi muốn gọi điện thoại cho anh ấy.' }
    ]
  },
  {
    id: 'hsk2_paobu',
    hanzi: '跑步',
    pinyin: 'pǎobù',
    meaningVi: 'chạy bộ',
    meaningEn: 'to run, jog',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 12,
    radicals: ['足'],
    examples: [
      { hanzi: '我每天早上跑步。', pinyin: 'Wǒ měitiān zǎoshang pǎobù.', meaningVi: 'Mỗi sáng tôi đều chạy bộ.' }
    ]
  },
  {
    id: 'hsk2_youyong',
    hanzi: '游泳',
    pinyin: 'yóuyǒng',
    meaningVi: 'bơi lội',
    meaningEn: 'to swim',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 20,
    radicals: ['氵'],
    examples: [
      { hanzi: '夏天我喜欢去游泳。', pinyin: 'Xiàtiān wǒ xǐhuan qù yóuyǒng.', meaningVi: 'Mùa hè tôi thích đi bơi.' }
    ]
  },
  {
    id: 'hsk2_lvyou',
    hanzi: '旅游',
    pinyin: 'lǚyóu',
    meaningVi: 'du lịch',
    meaningEn: 'to travel',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 22,
    radicals: ['方', '氵'],
    examples: [
      { hanzi: '我们打算去中国旅游。', pinyin: 'Wǒmen dǎsuàn qù Zhōngguó lǚyóu.', meaningVi: 'Chúng tôi dự định đi Trung Quốc du lịch.' }
    ]
  },
  {
    id: 'hsk2_shangban',
    hanzi: '上班',
    pinyin: 'shàngbān',
    meaningVi: 'đi làm, vào ca',
    meaningEn: 'to go to work',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 13,
    radicals: ['一', '王'],
    examples: [
      { hanzi: '他八点去上班。', pinyin: 'Tā bā diǎn qù shàngbān.', meaningVi: 'Anh ấy 8 giờ đi làm.' }
    ]
  },
  {
    id: 'hsk2_bangzhu',
    hanzi: '帮助',
    pinyin: 'bāngzhù',
    meaningVi: 'giúp đỡ',
    meaningEn: 'to help',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 16,
    radicals: ['巾', '力'],
    examples: [
      { hanzi: '谢谢你的帮助！', pinyin: 'Xièxie nǐ de bāngzhù!', meaningVi: 'Cảm ơn sự giúp đỡ của bạn!' }
    ]
  },
  {
    id: 'hsk2_zhunbei',
    hanzi: '准备',
    pinyin: 'zhǔnbèi',
    meaningVi: 'chuẩn bị',
    meaningEn: 'to prepare',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 20,
    radicals: ['冫', '夂'],
    examples: [
      { hanzi: '你准备好考试了吗？', pinyin: 'Nǐ zhǔnbèi hǎo kǎoshì le ma?', meaningVi: 'Bạn chuẩn bị tốt cho bài thi chưa?' }
    ]
  },
  {
    id: 'hsk2_kaishi',
    hanzi: '开始',
    pinyin: 'kāishǐ',
    meaningVi: 'bắt đầu',
    meaningEn: 'to begin, start',
    hskLevel: 'hsk2',
    partOfSpeech: 'verb',
    strokeCount: 12,
    radicals: ['门', '女'],
    examples: [
      { hanzi: '电影什么时候开始？', pinyin: 'Diànyǐng shénme shíhou kāishǐ?', meaningVi: 'Bộ phim khi nào bắt đầu thế?' }
    ]
  },

  // 2. Danh từ HSK 2
  {
    id: 'hsk2_jichang',
    hanzi: '机场',
    pinyin: 'jīchǎng',
    meaningVi: 'sân bay, phi trường',
    meaningEn: 'airport',
    hskLevel: 'hsk2',
    partOfSpeech: 'noun',
    strokeCount: 10,
    radicals: ['木', '土'],
    examples: [
      { hanzi: '我去机场接朋友。', pinyin: 'Wǒ qù jīchǎng jiē péngyou.', meaningVi: 'Tôi đi sân bay đón bạn.' }
    ]
  },
  {
    id: 'hsk2_fangjian',
    hanzi: '房间',
    pinyin: 'fángjiān',
    meaningVi: 'căn phòng',
    meaningEn: 'room',
    hskLevel: 'hsk2',
    partOfSpeech: 'noun',
    strokeCount: 15,
    radicals: ['户', '门'],
    examples: [
      { hanzi: '我的房间很干净。', pinyin: 'Wǒ de fángjiān hěn gānjìng.', meaningVi: 'Phòng của tôi rất sạch sẽ.' }
    ]
  },
  {
    id: 'hsk2_shouji',
    hanzi: '手机',
    pinyin: 'shǒujī',
    meaningVi: 'điện thoại di động',
    meaningEn: 'mobile phone',
    hskLevel: 'hsk2',
    partOfSpeech: 'noun',
    strokeCount: 8,
    radicals: ['手', '木'],
    examples: [
      { hanzi: '我买了一部新手机。', pinyin: 'Wǒ mǎi le yí bù xīn shǒujī.', meaningVi: 'Tôi vừa mua một chiếc điện thoại mới.' }
    ]
  },
  {
    id: 'hsk2_shijian',
    hanzi: '时间',
    pinyin: 'shíjiān',
    meaningVi: 'thời gian',
    meaningEn: 'time',
    hskLevel: 'hsk2',
    partOfSpeech: 'noun',
    strokeCount: 11,
    radicals: ['日', '门'],
    examples: [
      { hanzi: '你明天有时间吗？', pinyin: 'Nǐ míngtiān yǒu shíjiān ma?', meaningVi: 'Ngày mai bạn có thời gian không?' }
    ]
  },
  {
    id: 'hsk2_kaoshi',
    hanzi: '考试',
    pinyin: 'kǎoshì',
    meaningVi: 'kỳ thi, bài thi',
    meaningEn: 'examination, test',
    hskLevel: 'hsk2',
    partOfSpeech: 'noun',
    strokeCount: 12,
    radicals: ['耂', '讠'],
    examples: [
      { hanzi: '祝你考试顺利！', pinyin: 'Zhù nǐ kǎoshì shùnlì!', meaningVi: 'Chúc bạn thi cử thuận lợi!' }
    ]
  },

  // 3. Tính từ HSK 2
  {
    id: 'hsk2_kuai',
    hanzi: '快',
    pinyin: 'kuài',
    meaningVi: 'nhanh, sắp',
    meaningEn: 'fast, quick',
    hskLevel: 'hsk2',
    partOfSpeech: 'adjective',
    strokeCount: 7,
    radicals: ['忄'],
    examples: [
      { hanzi: '高铁速度很快。', pinyin: 'Gāotiě sùdù hěn kuài.', meaningVi: 'Tàu cao tốc chạy rất nhanh.' }
    ]
  },
  {
    id: 'hsk2_man',
    hanzi: '慢',
    pinyin: 'màn',
    meaningVi: 'chậm',
    meaningEn: 'slow',
    hskLevel: 'hsk2',
    partOfSpeech: 'adjective',
    strokeCount: 14,
    radicals: ['忄'],
    examples: [
      { hanzi: '请说慢一点儿。', pinyin: 'Qǐng shuō màn yìdiǎnr.', meaningVi: 'Xin hãy nói chậm một chút.' }
    ]
  },
  {
    id: 'hsk2_pianyi',
    hanzi: '便宜',
    pinyin: 'piányi',
    meaningVi: 'rẻ (giá cả)',
    meaningEn: 'cheap, inexpensive',
    hskLevel: 'hsk2',
    partOfSpeech: 'adjective',
    strokeCount: 17,
    radicals: ['亻', '宀'],
    examples: [
      { hanzi: '这家商店的东西很便宜。', pinyin: 'Zhè jiā shāngdiàn de dōngxi hěn piányi.', meaningVi: 'Đồ của cửa hàng này rất rẻ.' }
    ]
  },
  {
    id: 'hsk2_gui',
    hanzi: '贵',
    pinyin: 'guì',
    meaningVi: 'đắt, quý',
    meaningEn: 'expensive',
    hskLevel: 'hsk2',
    partOfSpeech: 'adjective',
    strokeCount: 9,
    radicals: ['贝'],
    examples: [
      { hanzi: '太贵了，能不能便宜点？', pinyin: 'Tài guì le, néng bù néng piányi diǎnr?', meaningVi: 'Đắt quá, có thể rẻ hơn chút không?' }
    ]
  },
  {
    id: 'hsk2_lei',
    hanzi: '累',
    pinyin: 'lèi',
    meaningVi: 'mệt mỏi',
    meaningEn: 'tired',
    hskLevel: 'hsk2',
    partOfSpeech: 'adjective',
    strokeCount: 11,
    radicals: ['田', '糸'],
    examples: [
      { hanzi: '今天工作很忙，我有点儿累。', pinyin: 'Jīntiān gōngzuò hěn máng, wǒ yǒudiǎnr lèi.', meaningVi: 'Hôm nay công việc rất bận, tôi hơi mệt.' }
    ]
  }
];

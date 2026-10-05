import type { HSKLevel } from '@/types/chinese';

export interface ChineseListeningDialogue {
  id: string;
  title: string;
  titleVi: string;
  hskLevel: HSKLevel;
  situationVi: string;
  turns: Array<{
    speaker: string;
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
}

export const CHINESE_LISTENING_DIALOGUES: ChineseListeningDialogue[] = [
  {
    id: 'listen_hsk1_restaurant',
    title: '在饭馆吃饭 (At the Restaurant)',
    titleVi: 'Hội thoại tại nhà hàng',
    hskLevel: 'hsk1',
    situationVi: 'Hai người bạn cùng nhau đi ăn trưa tại một quán mì truyền thống.',
    turns: [
      {
        speaker: '服务员',
        hanzi: '你好，欢迎光临！两位想吃点什么？',
        pinyin: 'Nǐ hǎo, huānyíng guānglín! Liǎng wèi xiǎng chī diǎnr shénme?',
        meaningVi: 'Xin chào, hoan nghênh quý khách! Hai vị muốn dùng món gì ạ?'
      },
      {
        speaker: '王明',
        hanzi: '我要一碗牛肉面，不要太辣。你呢，小李？',
        pinyin: 'Wǒ yào yì wǎn niúròumiàn, bú yào tài là. Nǐ ne, Xiǎo Lǐ?',
        meaningVi: 'Cho tôi một bát mì bò, đừng cay quá. Còn bạn thì sao, Tiểu Lý?'
      },
      {
        speaker: '小李',
        hanzi: '我吃米饭和鸡蛋西红柿。再给我们两杯冰茶，谢谢。',
        pinyin: 'Wǒ chī mǐfàn hé jīdàn xīhóngshì. Zài gěi wǒmen liǎng bēi bīng chá, xièxie.',
        meaningVi: 'Tôi ăn cơm và món trứng xào cà chua. Cho chúng tôi thêm hai cốc trà đá nữa, cảm ơn.'
      },
      {
        speaker: '服务员',
        hanzi: '好的，请稍等，菜马上就来。',
        pinyin: 'Hǎo de, qǐng shāoděng, cài mǎshàng jiù lái.',
        meaningVi: 'Dạ được, xin vui lòng đợi chút, món sẽ lên ngay ạ.'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '王明想吃什么？(Vương Minh muốn ăn món gì?)',
        options: [
          '米饭 (Cơm)',
          '牛肉面 (Mì bò)',
          '鸡蛋 (Trứng gà)',
          '西红柿 (Cà chua)'
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Trong bài Vương Minh nói: "我要一碗牛肉面" (Tôi muốn một bát mì bò).'
      },
      {
        id: 'q2',
        question: '他们点了什么饮料？(Họ đã gọi đồ uống gì?)',
        options: [
          '两瓶啤酒 (2 chai bia)',
          '两杯热咖啡 (2 ly cà phê nóng)',
          '两杯冰茶 (2 ly trà đá)',
          '两瓶可乐 (2 chai cola)'
        ],
        correctAnswerIndex: 2,
        explanationVi: 'Tiểu Lý nói: "再给我们两杯冰茶" (Cho chúng tôi thêm 2 ly trà đá).'
      }
    ]
  },
  {
    id: 'listen_hsk2_weekend',
    title: '周末的打算 (Weekend Plans)',
    titleVi: 'Kế hoạch cuối tuần',
    hskLevel: 'hsk2',
    situationVi: 'Hai bạn đồng nghiệp nói chuyện về kế hoạch nghỉ ngơi vào cuối tuần.',
    turns: [
      {
        speaker: '张华',
        hanzi: '这个周末你有什么安排吗？去不去看电影？',
        pinyin: 'Zhè ge zhōumò nǐ yǒu shénme ānpái ma? Qù bu qù kàn diànyǐng?',
        meaningVi: 'Cuối tuần này bạn có kế hoạch gì chưa? Có đi xem phim không?'
      },
      {
        speaker: '刘芳',
        hanzi: '我听说明天有雨，所以我打算在家里看书、复习汉语。',
        pinyin: 'Wǒ tīngshuō míngtiān yǒu yǔ, suǒyǐ wǒ dǎsuàn zài jiā lǐ kàn shū, fùxí Hànyǔ.',
        meaningVi: 'Mình nghe nói ngày mai trời mưa, nên mình dự định ở nhà đọc sách, ôn tập tiếng Trung.'
      },
      {
        speaker: '张华',
        hanzi: '下周一有考试吗？你真用功！',
        pinyin: 'Xià zhōuyī yǒu kǎoshì ma? Nǐ zhēn yònggōng!',
        meaningVi: 'Thứ Hai tuần sau có bài thi à? Bạn chăm chỉ thật đấy!'
      },
      {
        speaker: '刘芳',
        hanzi: '对啊，下个月要考 HSK 2，我想拿高分！',
        pinyin: 'Duì a, xià ge yuè yào kǎo HSK 2, wǒ xiǎng ná gāofēn!',
        meaningVi: 'Đúng vậy, tháng sau phải thi HSK 2 rồi, mình muốn đạt điểm cao!'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '刘芳周末为什么打算留在家里？(Tại sao Lưu Phương định ở nhà cuối tuần?)',
        options: [
          '因为她生病了 (Vì cô ấy bị ốm)',
          '因为明天天气不好，有雨 (Vì ngày mai trời mưa)',
          '因为她要加班 (Vì phải tăng ca)',
          '因为朋友来家里 (Vì bạn tới nhà chơi)'
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Lưu Phương nói: "我听说明天有雨，所以我打算在家里看书" (Nghe nói mai trời mưa nên tôi định ở nhà đọc sách).'
      },
      {
        id: 'q2',
        question: '刘芳下个月准备参加什么考试？(Tháng sau Lưu Phương thi gì?)',
        options: ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4'],
        correctAnswerIndex: 1,
        explanationVi: 'Lưu Phương nói: "下个月要考 HSK 2" (Tháng sau thi HSK 2).'
      }
    ]
  }
];

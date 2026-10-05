import type { ChineseVocabWord } from '@/types/chinese';

export const HSK1_VOCAB: ChineseVocabWord[] = [
  // 1. Đại từ (Pronouns)
  {
    id: 'hsk1_wo',
    hanzi: '我',
    pinyin: 'wǒ',
    meaningVi: 'tôi, mình',
    meaningEn: 'I, me',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 7,
    radicals: ['戈'],
    examples: [
      { hanzi: '我是学生。', pinyin: 'Wǒ shì xuésheng.', meaningVi: 'Tôi là học sinh.' },
      { hanzi: '我喜欢喝茶。', pinyin: 'Wǒ xǐhuan hē chá.', meaningVi: 'Tôi thích uống trà.' }
    ]
  },
  {
    id: 'hsk1_ni',
    hanzi: '你',
    pinyin: 'nǐ',
    meaningVi: 'bạn, cậu, anh, chị',
    meaningEn: 'you',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 7,
    radicals: ['亻'],
    examples: [
      { hanzi: '你好！', pinyin: 'Nǐ hǎo!', meaningVi: 'Xin chào bạn!' },
      { hanzi: '你是哪国人？', pinyin: 'Nǐ shì nǎ guó rén?', meaningVi: 'Bạn là người nước nào?' }
    ]
  },
  {
    id: 'hsk1_ta_he',
    hanzi: '他',
    pinyin: 'tā',
    meaningVi: 'anh ấy, cậu ấy',
    meaningEn: 'he, him',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 5,
    radicals: ['亻'],
    examples: [
      { hanzi: '他是我的中国朋友。', pinyin: 'Tā shì wǒ de Zhōngguó péngyou.', meaningVi: 'Anh ấy là người bạn Trung Quốc của tôi.' }
    ]
  },
  {
    id: 'hsk1_ta_she',
    hanzi: '她',
    pinyin: 'tā',
    meaningVi: 'cô ấy, chị ấy',
    meaningEn: 'she, her',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 6,
    radicals: ['女'],
    examples: [
      { hanzi: '她是我们的汉语老师。', pinyin: 'Tā shì wǒmen de Hànyǔ lǎoshī.', meaningVi: 'Cô ấy là giáo viên tiếng Trung của chúng tôi.' }
    ]
  },
  {
    id: 'hsk1_women',
    hanzi: '我们',
    pinyin: 'wǒmen',
    meaningVi: 'chúng tôi, chúng ta',
    meaningEn: 'we, us',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 12,
    radicals: ['亻', '门'],
    examples: [
      { hanzi: '我们都在北京。', pinyin: 'Wǒmen dōu zài Běijīng.', meaningVi: 'Chúng tôi đều ở Bắc Kinh.' }
    ]
  },
  {
    id: 'hsk1_zhe',
    hanzi: '这',
    pinyin: 'zhè',
    meaningVi: 'đây, này',
    meaningEn: 'this',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 7,
    radicals: ['辶'],
    examples: [
      { hanzi: '这是什么？', pinyin: 'Zhè shì shénme?', meaningVi: 'Đây là cái gì?' },
      { hanzi: '这个人是谁？', pinyin: 'Zhè ge rén shì shéi?', meaningVi: 'Người này là ai?' }
    ]
  },
  {
    id: 'hsk1_na',
    hanzi: '那',
    pinyin: 'nà',
    meaningVi: 'đó, kia',
    meaningEn: 'that',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 6,
    radicals: ['阝'],
    examples: [
      { hanzi: '那是我的书。', pinyin: 'Nà shì wǒ de shū.', meaningVi: 'Đó là sách của tôi.' }
    ]
  },
  {
    id: 'hsk1_shei',
    hanzi: '谁',
    pinyin: 'shéi',
    meaningVi: 'ai',
    meaningEn: 'who, whom',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 10,
    radicals: ['讠'],
    examples: [
      { hanzi: '他是谁？', pinyin: 'Tā shì shéi?', meaningVi: 'Anh ấy là ai?' }
    ]
  },
  {
    id: 'hsk1_shenme',
    hanzi: '什么',
    pinyin: 'shénme',
    meaningVi: 'cái gì',
    meaningEn: 'what',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 7,
    radicals: ['亻'],
    examples: [
      { hanzi: '你想吃什么？', pinyin: 'Nǐ xiǎng chī shénme?', meaningVi: 'Bạn muốn ăn cái gì?' }
    ]
  },
  {
    id: 'hsk1_nar',
    hanzi: '哪儿',
    pinyin: 'nǎr',
    meaningVi: 'ở đâu',
    meaningEn: 'where',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 11,
    radicals: ['口'],
    examples: [
      { hanzi: '你在哪儿？', pinyin: 'Nǐ zài nǎr?', meaningVi: 'Bạn ở đâu?' }
    ]
  },
  {
    id: 'hsk1_duoshao',
    hanzi: '多少',
    pinyin: 'duōshao',
    meaningVi: 'bao nhiêu',
    meaningEn: 'how many, how much',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 10,
    radicals: ['夕', '小'],
    examples: [
      { hanzi: '这个多少钱？', pinyin: 'Zhè ge duōshao qián?', meaningVi: 'Cái này bao nhiêu tiền?' }
    ]
  },
  {
    id: 'hsk1_ji',
    hanzi: '几',
    pinyin: 'jǐ',
    meaningVi: 'mấy (thường < 10)',
    meaningEn: 'how many (few)',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 2,
    radicals: ['几'],
    examples: [
      { hanzi: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', meaningVi: 'Bây giờ là mấy giờ?' }
    ]
  },
  {
    id: 'hsk1_zenme',
    hanzi: '怎么',
    pinyin: 'zěnme',
    meaningVi: 'thế nào, làm sao',
    meaningEn: 'how',
    hskLevel: 'hsk1',
    partOfSpeech: 'pronoun',
    strokeCount: 8,
    radicals: ['心'],
    examples: [
      { hanzi: '这个字怎么读？', pinyin: 'Zhè ge zì zěnme dú?', meaningVi: 'Chữ này đọc như thế nào?' }
    ]
  },

  // 2. Chữ số (Numbers)
  {
    id: 'hsk1_yi',
    hanzi: '一',
    pinyin: 'yī',
    meaningVi: 'một (1)',
    meaningEn: 'one',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 1,
    radicals: ['一'],
    examples: [{ hanzi: '一个人。', pinyin: 'Yí gè rén.', meaningVi: 'Một người.' }]
  },
  {
    id: 'hsk1_er',
    hanzi: '二',
    pinyin: 'èr',
    meaningVi: 'hai (2)',
    meaningEn: 'two',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 2,
    radicals: ['一'],
    examples: [{ hanzi: '二月。', pinyin: 'Èr yuè.', meaningVi: 'Tháng Hai.' }]
  },
  {
    id: 'hsk1_san',
    hanzi: '三',
    pinyin: 'sān',
    meaningVi: 'ba (3)',
    meaningEn: 'three',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 3,
    radicals: ['一'],
    examples: [{ hanzi: '三本书。', pinyin: 'Sān běn shū.', meaningVi: 'Ba quyển sách.' }]
  },
  {
    id: 'hsk1_si',
    hanzi: '四',
    pinyin: 'sì',
    meaningVi: 'bốn (4)',
    meaningEn: 'four',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 5,
    radicals: ['囗'],
    examples: [{ hanzi: '四个学生。', pinyin: 'Sì gè xuésheng.', meaningVi: 'Bốn học sinh.' }]
  },
  {
    id: 'hsk1_wu',
    hanzi: '五',
    pinyin: 'wǔ',
    meaningVi: 'năm (5)',
    meaningEn: 'five',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 4,
    radicals: ['二'],
    examples: [{ hanzi: '五点。', pinyin: 'Wǔ diǎn.', meaningVi: 'Năm giờ.' }]
  },
  {
    id: 'hsk1_liu',
    hanzi: '六',
    pinyin: 'liù',
    meaningVi: 'sáu (6)',
    meaningEn: 'six',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 4,
    radicals: ['八'],
    examples: [{ hanzi: '星期六。', pinyin: 'Xīngqīliù.', meaningVi: 'Thứ Bảy.' }]
  },
  {
    id: 'hsk1_qi',
    hanzi: '七',
    pinyin: 'qī',
    meaningVi: 'bảy (7)',
    meaningEn: 'seven',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 2,
    radicals: ['一'],
    examples: [{ hanzi: '七天。', pinyin: 'Qī tiān.', meaningVi: 'Bảy ngày.' }]
  },
  {
    id: 'hsk1_ba_num',
    hanzi: '八',
    pinyin: 'bā',
    meaningVi: 'tám (8)',
    meaningEn: 'eight',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 2,
    radicals: ['八'],
    examples: [{ hanzi: '八月。', pinyin: 'Bā yuè.', meaningVi: 'Tháng Tám.' }]
  },
  {
    id: 'hsk1_jiu',
    hanzi: '九',
    pinyin: 'jiǔ',
    meaningVi: 'chín (9)',
    meaningEn: 'nine',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 2,
    radicals: ['丿'],
    examples: [{ hanzi: '九个苹果。', pinyin: 'Jiǔ gè píngguǒ.', meaningVi: 'Chín quả táo.' }]
  },
  {
    id: 'hsk1_shi_num',
    hanzi: '十',
    pinyin: 'shí',
    meaningVi: 'mười (10)',
    meaningEn: 'ten',
    hskLevel: 'hsk1',
    partOfSpeech: 'number',
    strokeCount: 2,
    radicals: ['十'],
    examples: [{ hanzi: '十分钟。', pinyin: 'Shí fēnzhōng.', meaningVi: 'Mười phút.' }]
  },

  // 3. Danh từ thời gian (Time)
  {
    id: 'hsk1_jintian',
    hanzi: '今天',
    pinyin: 'jīntiān',
    meaningVi: 'hôm nay',
    meaningEn: 'today',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 8,
    radicals: ['人', '大'],
    examples: [
      { hanzi: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', meaningVi: 'Thời tiết hôm nay rất đẹp.' }
    ]
  },
  {
    id: 'hsk1_mingtian',
    hanzi: '明天',
    pinyin: 'míngtiān',
    meaningVi: 'ngày mai',
    meaningEn: 'tomorrow',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 12,
    radicals: ['日', '大'],
    examples: [
      { hanzi: '明天见！', pinyin: 'Míngtiān jiàn!', meaningVi: 'Ngày mai gặp nhé!' }
    ]
  },
  {
    id: 'hsk1_zuotian',
    hanzi: '昨天',
    pinyin: 'zuótiān',
    meaningVi: 'hôm qua',
    meaningEn: 'yesterday',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 13,
    radicals: ['日', '大'],
    examples: [
      { hanzi: '昨天我很忙。', pinyin: 'Zuótiān wǒ hěn máng.', meaningVi: 'Hôm qua tôi rất bận.' }
    ]
  },
  {
    id: 'hsk1_xianzai',
    hanzi: '现在',
    pinyin: 'xiànzài',
    meaningVi: 'bây giờ, hiện tại',
    meaningEn: 'now',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 14,
    radicals: ['王', '土'],
    examples: [
      { hanzi: '现在三点。', pinyin: 'Xiànzài sān diǎn.', meaningVi: 'Bây giờ là 3 giờ.' }
    ]
  },
  {
    id: 'hsk1_nian',
    hanzi: '年',
    pinyin: 'nián',
    meaningVi: 'năm',
    meaningEn: 'year',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 6,
    radicals: ['干'],
    examples: [{ hanzi: '一年。', pinyin: 'Yì nián.', meaningVi: 'Một năm.' }]
  },
  {
    id: 'hsk1_yue',
    hanzi: '月',
    pinyin: 'yuè',
    meaningVi: 'tháng, trăng',
    meaningEn: 'month, moon',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 4,
    radicals: ['月'],
    examples: [{ hanzi: '五月。', pinyin: 'Wǔ yuè.', meaningVi: 'Tháng Năm.' }]
  },
  {
    id: 'hsk1_ri',
    hanzi: '日',
    pinyin: 'rì',
    meaningVi: 'ngày, mặt trời',
    meaningEn: 'day, sun',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 4,
    radicals: ['日'],
    examples: [{ hanzi: '十月一日。', pinyin: 'Shí yuè yī rì.', meaningVi: 'Ngày 1 tháng 10.' }]
  },

  // 4. Con người & Xưng hô
  {
    id: 'hsk1_baba',
    hanzi: '爸爸',
    pinyin: 'bàba',
    meaningVi: 'bố, cha',
    meaningEn: 'father, dad',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 8,
    radicals: ['父'],
    examples: [{ hanzi: '我爸爸是医生。', pinyin: 'Wǒ bàba shì yīshēng.', meaningVi: 'Bố tôi là bác sĩ.' }]
  },
  {
    id: 'hsk1_mama',
    hanzi: '妈妈',
    pinyin: 'māma',
    meaningVi: 'mẹ',
    meaningEn: 'mother, mom',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 6,
    radicals: ['女'],
    examples: [{ hanzi: '妈妈，我爱你。', pinyin: 'Māma, wǒ ài nǐ.', meaningVi: 'Mẹ ơi, con yêu mẹ.' }]
  },
  {
    id: 'hsk1_erzi',
    hanzi: '儿子',
    pinyin: 'érzi',
    meaningVi: 'con trai',
    meaningEn: 'son',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 5,
    radicals: ['儿', '子'],
    examples: [{ hanzi: '他有两个儿子。', pinyin: 'Tā yǒu liǎng gè érzi.', meaningVi: 'Anh ấy có hai người con trai.' }]
  },
  {
    id: 'hsk1_nver',
    hanzi: '女儿',
    pinyin: 'nǚ\'ér',
    meaningVi: 'con gái',
    meaningEn: 'daughter',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 5,
    radicals: ['女', '儿'],
    examples: [{ hanzi: '她女儿很漂亮。', pinyin: 'Tā nǚ\'ér hěn piàoliang.', meaningVi: 'Con gái cô ấy rất xinh đẹp.' }]
  },
  {
    id: 'hsk1_laoshi',
    hanzi: '老师',
    pinyin: 'lǎoshī',
    meaningVi: 'thầy giáo, cô giáo',
    meaningEn: 'teacher',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 12,
    radicals: ['耂', '巾'],
    examples: [{ hanzi: '老师好！', pinyin: 'Lǎoshī hǎo!', meaningVi: 'Chào thầy/cô ạ!' }]
  },
  {
    id: 'hsk1_xuesheng',
    hanzi: '学生',
    pinyin: 'xuésheng',
    meaningVi: 'học sinh, sinh viên',
    meaningEn: 'student',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 13,
    radicals: ['子', '生'],
    examples: [{ hanzi: '我们都是大学生。', pinyin: 'Wǒmen dōu shì dàxuéshēng.', meaningVi: 'Chúng tôi đều là sinh viên đại học.' }]
  },
  {
    id: 'hsk1_pengyou',
    hanzi: '朋友',
    pinyin: 'péngyou',
    meaningVi: 'bạn bè',
    meaningEn: 'friend',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 12,
    radicals: ['月', '又'],
    examples: [{ hanzi: '他是我的好朋友。', pinyin: 'Tā shì wǒ de hǎo péngyou.', meaningVi: 'Anh ấy là người bạn thân của tôi.' }]
  },
  {
    id: 'hsk1_yisheng',
    hanzi: '医生',
    pinyin: 'yīshēng',
    meaningVi: 'bác sĩ',
    meaningEn: 'doctor',
    hskLevel: 'hsk1',
    partOfSpeech: 'noun',
    strokeCount: 12,
    radicals: ['匚', '生'],
    examples: [{ hanzi: '他在医院当医生。', pinyin: 'Tā zài yīyuàn dāng yīshēng.', meaningVi: 'Anh ấy làm bác sĩ ở bệnh viện.' }]
  },

  // 5. Động từ trọng tâm (Core Verbs)
  {
    id: 'hsk1_chi',
    hanzi: '吃',
    pinyin: 'chī',
    meaningVi: 'ăn',
    meaningEn: 'to eat',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 6,
    radicals: ['口'],
    examples: [{ hanzi: '你想吃什么？', pinyin: 'Nǐ xiǎng chī shénme?', meaningVi: 'Bạn muốn ăn cái gì?' }]
  },
  {
    id: 'hsk1_he',
    hanzi: '喝',
    pinyin: 'hē',
    meaningVi: 'uống',
    meaningEn: 'to drink',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 12,
    radicals: ['口'],
    examples: [{ hanzi: '请喝茶。', pinyin: 'Qǐng hē chá.', meaningVi: 'Mời uống trà.' }]
  },
  {
    id: 'hsk1_kan',
    hanzi: '看',
    pinyin: 'kàn',
    meaningVi: 'nhìn, xem, đọc',
    meaningEn: 'to look, see, watch, read',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 9,
    radicals: ['目'],
    examples: [{ hanzi: '看书。', pinyin: 'Kàn shū.', meaningVi: 'Đọc sách.' }]
  },
  {
    id: 'hsk1_ting',
    hanzi: '听',
    pinyin: 'tīng',
    meaningVi: 'nghe',
    meaningEn: 'to listen, hear',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 7,
    radicals: ['口'],
    examples: [{ hanzi: '听音乐。', pinyin: 'Tīng yīnyuè.', meaningVi: 'Nghe nhạc.' }]
  },
  {
    id: 'hsk1_shuo',
    hanzi: '说',
    pinyin: 'shuō',
    meaningVi: 'nói',
    meaningEn: 'to speak, say',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 9,
    radicals: ['讠'],
    examples: [{ hanzi: '你会说汉语吗？', pinyin: 'Nǐ huì shuō Hànyǔ ma?', meaningVi: 'Bạn biết nói tiếng Trung không?' }]
  },
  {
    id: 'hsk1_xie',
    hanzi: '写',
    pinyin: 'xiě',
    meaningVi: 'viết',
    meaningEn: 'to write',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 5,
    radicals: ['冖'],
    examples: [{ hanzi: '写汉字。', pinyin: 'Xiě Hànzì.', meaningVi: 'Viết chữ Hán.' }]
  },
  {
    id: 'hsk1_qu',
    hanzi: '去',
    pinyin: 'qù',
    meaningVi: 'đi',
    meaningEn: 'to go',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 5,
    radicals: ['土'],
    examples: [{ hanzi: '我去商店。', pinyin: 'Wǒ qù shāngdiàn.', meaningVi: 'Tôi đi cửa hàng.' }]
  },
  {
    id: 'hsk1_lai',
    hanzi: '来',
    pinyin: 'lái',
    meaningVi: 'đến, tới',
    meaningEn: 'to come',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 7,
    radicals: ['木'],
    examples: [{ hanzi: '请进，来坐吧。', pinyin: 'Qǐng jìn, lái zuò ba.', meaningVi: 'Mời vào, lại ngồi đi.' }]
  },
  {
    id: 'hsk1_hui',
    hanzi: '回',
    pinyin: 'huí',
    meaningVi: 'về, quay lại',
    meaningEn: 'to return',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 6,
    radicals: ['囗'],
    examples: [{ hanzi: '回家。', pinyin: 'Huí jiā.', meaningVi: 'Về nhà.' }]
  },
  {
    id: 'hsk1_mai',
    hanzi: '买',
    pinyin: 'mǎi',
    meaningVi: 'mua',
    meaningEn: 'to buy',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 6,
    radicals: ['乙'],
    examples: [{ hanzi: '我想买一个苹果。', pinyin: 'Wǒ xiǎng mǎi yí gè píngguǒ.', meaningVi: 'Tôi muốn mua một quả táo.' }]
  },
  {
    id: 'hsk1_zuo',
    hanzi: '做',
    pinyin: 'zuò',
    meaningVi: 'làm, nấu',
    meaningEn: 'to do, make',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 11,
    radicals: ['亻'],
    examples: [{ hanzi: '做饭。', pinyin: 'Zuò fàn.', meaningVi: 'Nấu cơm.' }]
  },
  {
    id: 'hsk1_zuo_sit',
    hanzi: '坐',
    pinyin: 'zuò',
    meaningVi: 'ngồi, đi (tàu, xe)',
    meaningEn: 'to sit, ride',
    hskLevel: 'hsk1',
    partOfSpeech: 'verb',
    strokeCount: 7,
    radicals: ['土'],
    examples: [{ hanzi: '请坐。', pinyin: 'Qǐng zuò.', meaningVi: 'Mời ngồi.' }, { hanzi: '坐飞机。', pinyin: 'Zuò fēijī.', meaningVi: 'Đi máy bay.' }]
  },

  // 6. Tính từ cơ bản (Adjectives)
  {
    id: 'hsk1_hao',
    hanzi: '好',
    pinyin: 'hǎo',
    meaningVi: 'tốt, đẹp, hay',
    meaningEn: 'good',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 6,
    radicals: ['女', '子'],
    examples: [{ hanzi: '很好。', pinyin: 'Hěn hǎo.', meaningVi: 'Rất tốt.' }]
  },
  {
    id: 'hsk1_da',
    hanzi: '大',
    pinyin: 'dà',
    meaningVi: 'to, lớn',
    meaningEn: 'big, large',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 3,
    radicals: ['大'],
    examples: [{ hanzi: '这个苹果很大。', pinyin: 'Zhè ge píngguǒ hěn dà.', meaningVi: 'Quả táo này rất to.' }]
  },
  {
    id: 'hsk1_xiao',
    hanzi: '小',
    pinyin: 'xiǎo',
    meaningVi: 'nhỏ, bé',
    meaningEn: 'small, little',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 3,
    radicals: ['小'],
    examples: [{ hanzi: '猫很小。', pinyin: 'Māo hěn xiǎo.', meaningVi: 'Con mèo rất nhỏ.' }]
  },
  {
    id: 'hsk1_duo',
    hanzi: '多',
    pinyin: 'duō',
    meaningVi: 'nhiều',
    meaningEn: 'many, much',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 6,
    radicals: ['夕'],
    examples: [{ hanzi: '人很多。', pinyin: 'Rén hěn duō.', meaningVi: 'Người rất đông.' }]
  },
  {
    id: 'hsk1_shao',
    hanzi: '少',
    pinyin: 'shǎo',
    meaningVi: 'ít',
    meaningEn: 'few, little',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 4,
    radicals: ['小'],
    examples: [{ hanzi: '书很少。', pinyin: 'Shū hěn shǎo.', meaningVi: 'Sách rất ít.' }]
  },
  {
    id: 'hsk1_leng',
    hanzi: '冷',
    pinyin: 'lěng',
    meaningVi: 'lạnh',
    meaningEn: 'cold',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 7,
    radicals: ['冫'],
    examples: [{ hanzi: '今天很冷。', pinyin: 'Jīntiān hěn lěng.', meaningVi: 'Hôm nay rất lạnh.' }]
  },
  {
    id: 'hsk1_re',
    hanzi: '热',
    pinyin: 'rè',
    meaningVi: 'nóng',
    meaningEn: 'hot',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 10,
    radicals: ['灬'],
    examples: [{ hanzi: '天气很热。', pinyin: 'Tiānqì hěn rè.', meaningVi: 'Thời tiết rất nóng.' }]
  },
  {
    id: 'hsk1_gaoxing',
    hanzi: '高兴',
    pinyin: 'gāoxìng',
    meaningVi: 'vui vẻ, vui mừng',
    meaningEn: 'happy, glad',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 16,
    radicals: ['高', '八'],
    examples: [{ hanzi: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', meaningVi: 'Rất vui được quen bạn.' }]
  },
  {
    id: 'hsk1_piaoliang',
    hanzi: '漂亮',
    pinyin: 'piàoliang',
    meaningVi: 'xinh đẹp, đẹp',
    meaningEn: 'pretty, beautiful',
    hskLevel: 'hsk1',
    partOfSpeech: 'adjective',
    strokeCount: 20,
    radicals: ['氵', '方'],
    examples: [{ hanzi: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', meaningVi: 'Cô ấy rất đẹp.' }]
  }
];

import type { PinyinInitial, PinyinFinal, PinyinSyllable } from '@/types/chinese';

export const PINYIN_INITIALS: PinyinInitial[] = [
  // Âm môi (Labials)
  {
    id: 'b',
    symbol: 'b',
    ipa: '[p]',
    vietnameseEquivalent: 'Gần giống âm "p" nhẹ (không bật hơi) trong tiếng Việt',
    description: 'Hai môi khép lại, luồng hơi phá vỡ lực cản thoát ra, không bật hơi, dây thanh không rung.',
    mouthShape: 'Khép nhẹ hai môi rồi bật ra nhẹ nhàng không tống hơi.',
    audioSample: 'bō',
    group: 'labial',
    groupNameVi: 'Âm môi (hai môi / môi răng)',
    examples: [
      { pinyin: 'bàba', hanzi: '爸爸', meaningVi: 'bố' },
      { pinyin: 'bái', hanzi: '白', meaningVi: 'trắng' },
      { pinyin: 'bāo', hanzi: '包', meaningVi: 'bao, túi' }
    ]
  },
  {
    id: 'p',
    symbol: 'p',
    ipa: '[pʰ]',
    vietnameseEquivalent: 'Âm "p" BẬT HƠI MẠNH (như "ph" nhưng ngậm môi rồi tống hơi)',
    description: 'Vị trí phát âm giống "b" nhưng luồng không khí được tống ra cực mạnh làm lay động tờ giấy trước miệng.',
    mouthShape: 'Môi ngậm chặt, bật tung miệng ra với luồng gió mạnh.',
    audioSample: 'pō',
    group: 'labial',
    groupNameVi: 'Âm môi (hai môi / môi răng)',
    examples: [
      { pinyin: 'píngguǒ', hanzi: '苹果', meaningVi: 'quả táo' },
      { pinyin: 'péngyou', hanzi: '朋友', meaningVi: 'bạn bè' },
      { pinyin: 'pǎo', hanzi: '跑', meaningVi: 'chạy' }
    ]
  },
  {
    id: 'm',
    symbol: 'm',
    ipa: '[m]',
    vietnameseEquivalent: 'Giống hệt âm "m" trong tiếng Việt',
    description: 'Hai môi khép chặt, luồng hơi đi qua khoang mũi, dây thanh rung mạnh.',
    mouthShape: 'Môi mím tự nhiên, âm vang qua mũi.',
    audioSample: 'mō',
    group: 'labial',
    groupNameVi: 'Âm môi (hai môi / môi răng)',
    examples: [
      { pinyin: 'māma', hanzi: '妈妈', meaningVi: 'mẹ' },
      { pinyin: 'mǎi', hanzi: '买', meaningVi: 'mua' },
      { pinyin: 'mén', hanzi: '门', meaningVi: 'cửa' }
    ]
  },
  {
    id: 'f',
    symbol: 'f',
    ipa: '[f]',
    vietnameseEquivalent: 'Giống hệt âm "ph" trong tiếng Việt',
    description: 'Răng trên tiếp xúc nhẹ với môi dưới, luồng hơi ma sát thoát ra qua khe hở.',
    mouthShape: 'Răng trên cắn nhẹ lòng môi dưới rồi thổi hơi.',
    audioSample: 'fō',
    group: 'labial',
    groupNameVi: 'Âm môi (hai môi / môi răng)',
    examples: [
      { pinyin: 'fēi', hanzi: '飞', meaningVi: 'bay' },
      { pinyin: 'fàn', hanzi: '饭', meaningVi: 'cơm' },
      { pinyin: 'fāshāo', hanzi: '发烧', meaningVi: 'sốt' }
    ]
  },

  // Âm đầu lưỡi (Dentals / Alveolars)
  {
    id: 'd',
    symbol: 'd',
    ipa: '[t]',
    vietnameseEquivalent: 'Giống hệt âm "t" trong tiếng Việt (KHÔNG BẬT HƠI)',
    description: 'Đầu lưỡi chạm nướu trên, cản luồng hơi rồi hạ xuống thoát hơi nhẹ, không rung dây thanh.',
    mouthShape: 'Đầu lưỡi áp chân răng trên, bật xuống nhẹ như "t" tiếng Việt.',
    audioSample: 'dē',
    group: 'dental',
    groupNameVi: 'Âm đầu lưỡi (d, t, n, l)',
    examples: [
      { pinyin: 'dà', hanzi: '大', meaningVi: 'to, lớn' },
      { pinyin: 'duì', hanzi: '对', meaningVi: 'đúng' },
      { pinyin: 'dìdi', hanzi: '弟弟', meaningVi: 'em trai' }
    ]
  },
  {
    id: 't',
    symbol: 't',
    ipa: '[tʰ]',
    vietnameseEquivalent: 'Giống âm "th" tiếng Việt nhưng BẬT HƠI CỰC MẠNH',
    description: 'Vị trí giống âm "d" nhưng tích luỹ khí tống bật mạnh ra ngoài.',
    mouthShape: 'Đầu lưỡi chặn chân răng trên, bật mạnh phun luồng hơi.',
    audioSample: 'tē',
    group: 'dental',
    groupNameVi: 'Âm đầu lưỡi (d, t, n, l)',
    examples: [
      { pinyin: 'tā', hanzi: '他', meaningVi: 'anh ấy' },
      { pinyin: 'tiān', hanzi: '天', meaningVi: 'ngày, trời' },
      { pinyin: 'tīng', hanzi: '听', meaningVi: 'nghe' }
    ]
  },
  {
    id: 'n',
    symbol: 'n',
    ipa: '[n]',
    vietnameseEquivalent: 'Giống âm "n" trong tiếng Việt',
    description: 'Đầu lưỡi chạm nướu trên, luồng hơi đi qua khoang mũi, dây thanh rung.',
    mouthShape: 'Đầu lưỡi áp vòm nướu trên, âm mũi.',
    audioSample: 'nē',
    group: 'dental',
    groupNameVi: 'Âm đầu lưỡi (d, t, n, l)',
    examples: [
      { pinyin: 'nǐ', hanzi: '你', meaningVi: 'bạn, cậu' },
      { pinyin: 'nán', hanzi: '男', meaningVi: 'nam, đàn ông' },
      { pinyin: 'nián', hanzi: '年', meaningVi: 'năm' }
    ]
  },
  {
    id: 'l',
    symbol: 'l',
    ipa: '[l]',
    vietnameseEquivalent: 'Giống âm "l" trong tiếng Việt',
    description: 'Đầu lưỡi chạm nướu trên, luồng hơi đi qua hai bên mép lưỡi, dây thanh rung.',
    mouthShape: 'Đầu lưỡi cong chạm hàm trên, hơi thoát hai bên lưỡi.',
    audioSample: 'lē',
    group: 'dental',
    groupNameVi: 'Âm đầu lưỡi (d, t, n, l)',
    examples: [
      { pinyin: 'lǎo', hanzi: '老', meaningVi: 'già, cũ' },
      { pinyin: 'lái', hanzi: '来', meaningVi: 'đến' },
      { pinyin: 'lèi', hanzi: '累', meaningVi: 'mệt' }
    ]
  },

  // Âm cuống lưỡi / gốc lưỡi (Velars)
  {
    id: 'g',
    symbol: 'g',
    ipa: '[k]',
    vietnameseEquivalent: 'Giống âm "c / k" trong tiếng Việt (KHÔNG BẬT HƠI)',
    description: 'Gốc lưỡi chạm ngạc mềm cản luồng hơi, mở ra đột ngột thoát hơi nhẹ, không rung dây thanh.',
    mouthShape: 'Cuống lưỡi nâng lên áp vòm mềm họng rồi nhả ra nhẹ.',
    audioSample: 'gē',
    group: 'velar',
    groupNameVi: 'Âm cuống lưỡi (g, k, h)',
    examples: [
      { pinyin: 'gēge', hanzi: '哥哥', meaningVi: 'anh trai' },
      { pinyin: 'gāo', hanzi: '高', meaningVi: 'cao' },
      { pinyin: 'gōngzuò', hanzi: '工作', meaningVi: 'công việc' }
    ]
  },
  {
    id: 'k',
    symbol: 'k',
    ipa: '[kʰ]',
    vietnameseEquivalent: 'Giống âm "kh" tiếng Việt nhưng BẬT HƠI TỪ CUỐNG HỌNG',
    description: 'Vị trí giống âm "g" nhưng luồng hơi dồn từ cuống họng bật mạnh ra ngoài.',
    mouthShape: 'Cuống lưỡi nén khí họng bật hơi nổ giòn ra ngoài.',
    audioSample: 'kē',
    group: 'velar',
    groupNameVi: 'Âm cuống lưỡi (g, k, h)',
    examples: [
      { pinyin: 'kāfēi', hanzi: '咖啡', meaningVi: 'cà phê' },
      { pinyin: 'kàn', hanzi: '看', meaningVi: 'nhìn, xem' },
      { pinyin: 'kāi', hanzi: '开', meaningVi: 'mở' }
    ]
  },
  {
    id: 'h',
    symbol: 'h',
    ipa: '[x]',
    vietnameseEquivalent: 'Giữa âm "h" và "kh" tiếng Việt, ma sát nhẹ ở cuống họng',
    description: 'Cuống lưỡi nâng gần ngạc mềm tạo khe hẹp, luồng hơi cọ xát đi ra.',
    mouthShape: 'Cuống họng hơi khép nhẹ, đẩy hơi có độ khè nhẹ như "kh" miền Nam.',
    audioSample: 'hē',
    group: 'velar',
    groupNameVi: 'Âm cuống lưỡi (g, k, h)',
    examples: [
      { pinyin: 'hē', hanzi: '喝', meaningVi: 'uống' },
      { pinyin: 'hěn', hanzi: '很', meaningVi: 'rất' },
      { pinyin: 'hǎo', hanzi: '好', meaningVi: 'tốt, hay' }
    ]
  },

  // Âm mặt lưỡi (Palatals) - Đi kèm với i và ü
  {
    id: 'j',
    symbol: 'j',
    ipa: '[tɕ]',
    vietnameseEquivalent: 'Gần giống "chi" trong tiếng Việt (không bật hơi, cười mỉm miệng)',
    description: 'Mặt trước lưỡi dán sát ngạc cứng, mở khe hở nhỏ cho hơi thoát ra, khóe miệng kéo bè sang hai bên.',
    mouthShape: 'Miệng mỉm cười rộng, mặt lưỡi dẹp ép sát vòm trên.',
    audioSample: 'jī',
    group: 'palatal',
    groupNameVi: 'Âm mặt lưỡi (j, q, x)',
    examples: [
      { pinyin: 'jiā', hanzi: '家', meaningVi: 'nhà, gia đình' },
      { pinyin: 'jīntiān', hanzi: '今天', meaningVi: 'hôm nay' },
      { pinyin: 'jiǔ', hanzi: '九', meaningVi: 'chín (9)' }
    ]
  },
  {
    id: 'q',
    symbol: 'q',
    ipa: '[tɕʰ]',
    vietnameseEquivalent: 'Âm "ch" BẬT HƠI CỰC MẠNH (miệng mỉm cười bè ngang)',
    description: 'Vị trí giống "j" nhưng tích hơi và tống hơi cực mạnh qua khe mặt lưỡi.',
    mouthShape: 'Khóe miệng kéo sang hai bên, mặt lưỡi ép ngạc rồi bật hơi gió.',
    audioSample: 'qī',
    group: 'palatal',
    groupNameVi: 'Âm mặt lưỡi (j, q, x)',
    examples: [
      { pinyin: 'qī', hanzi: '七', meaningVi: 'bảy (7)' },
      { pinyin: 'qù', hanzi: '去', meaningVi: 'đi' },
      { pinyin: 'qián', hanzi: '钱', meaningVi: 'tiền' }
    ]
  },
  {
    id: 'x',
    symbol: 'x',
    ipa: '[ɕ]',
    vietnameseEquivalent: 'Giống âm "x" tiếng Việt (miệng bè ngang như đang cười)',
    description: 'Mặt lưỡi tiếp cận ngạc cứng tạo khe hẹp, luồng hơi ma sát thoát ra ngoài.',
    mouthShape: 'Hai mép miệng kéo rộng, thổi gió êm qua mặt lưỡi.',
    audioSample: 'xī',
    group: 'palatal',
    groupNameVi: 'Âm mặt lưỡi (j, q, x)',
    examples: [
      { pinyin: 'xièxie', hanzi: '谢谢', meaningVi: 'cảm ơn' },
      { pinyin: 'xiǎo', hanzi: '小', meaningVi: 'nhỏ' },
      { pinyin: 'xué', hanzi: '学', meaningVi: 'học' }
    ]
  },

  // Âm uốn lưỡi (Retroflexes) - zh, ch, sh, r
  {
    id: 'zh',
    symbol: 'zh',
    ipa: '[ʈʂ]',
    vietnameseEquivalent: 'Âm "tr" tiếng Việt (uốn lưỡi cong lên ngạc cứng, không bật hơi)',
    description: 'Đầu lưỡi uốn cong chạm ngạc cứng cản hơi, hạ nhẹ để hơi ma sát thoát ra. Không bật hơi.',
    mouthShape: 'Đầu lưỡi cong lên trần miệng, môi hơi tròn mở nhẹ.',
    audioSample: 'zhī',
    group: 'retroflex',
    groupNameVi: 'Âm uốn lưỡi cong môi (zh, ch, sh, r)',
    examples: [
      { pinyin: 'Zhōngguó', hanzi: '中国', meaningVi: 'Trung Quốc' },
      { pinyin: 'zhè', hanzi: '这', meaningVi: 'đây, này' },
      { pinyin: 'zhīdao', hanzi: '知道', meaningVi: 'biết' }
    ]
  },
  {
    id: 'ch',
    symbol: 'ch',
    ipa: '[ʈʂʰ]',
    vietnameseEquivalent: 'Âm "tr" UỐN LƯỠI + BẬT HƠI MẠNH GIÓ',
    description: 'Vị trí giống "zh" nhưng tống hơi cực mạnh kèm âm thanh rít gió rõ rệt.',
    mouthShape: 'Đầu lưỡi cong ngạc trên, thổi bật luồng hơi gió mạnh.',
    audioSample: 'chī',
    group: 'retroflex',
    groupNameVi: 'Âm uốn lưỡi cong môi (zh, ch, sh, r)',
    examples: [
      { pinyin: 'chī', hanzi: '吃', meaningVi: 'ăn' },
      { pinyin: 'chá', hanzi: '茶', meaningVi: 'trà' },
      { pinyin: 'chū', hanzi: '出', meaningVi: 'ra ngoài' }
    ]
  },
  {
    id: 'sh',
    symbol: 'sh',
    ipa: '[ʂ]',
    vietnameseEquivalent: 'Âm "s" nặng tiếng Việt (uốn lưỡi cong lên vòm miệng)',
    description: 'Đầu lưỡi uốn cong lại gần ngạc cứng tạo khe hẹp, luồng hơi ma sát thổi ra ngoài.',
    mouthShape: 'Lưỡi cong lên vòm họng trên, luồng hơi thổi qua tạo tiếng rào nhẹ.',
    audioSample: 'shī',
    group: 'retroflex',
    groupNameVi: 'Âm uốn lưỡi cong môi (zh, ch, sh, r)',
    examples: [
      { pinyin: 'shì', hanzi: '是', meaningVi: 'là, vâng' },
      { pinyin: 'shuǐ', hanzi: '水', meaningVi: 'nước' },
      { pinyin: 'shū', hanzi: '书', meaningVi: 'sách' }
    ]
  },
  {
    id: 'r',
    symbol: 'r',
    ipa: '[ʐ]',
    vietnameseEquivalent: 'Giữa âm "r" và "d" tiếng Việt (lưỡi cong, dây thanh rung rõ)',
    description: 'Vị trí giống "sh" nhưng thanh quản rung mạnh phát ra tiếng rung êm.',
    mouthShape: 'Lưỡi uốn cong hàm ếch trên, rung dây thanh.',
    audioSample: 'rī',
    group: 'retroflex',
    groupNameVi: 'Âm uốn lưỡi cong môi (zh, ch, sh, r)',
    examples: [
      { pinyin: 'rén', hanzi: '人', meaningVi: 'người' },
      { pinyin: 'rè', hanzi: '热', meaningVi: 'nóng' },
      { pinyin: 'rì', hanzi: '日', meaningVi: 'ngày, mặt trời' }
    ]
  },

  // Âm đầu lưỡi trước (Alveolar sibilants) - z, c, s
  {
    id: 'z',
    symbol: 'z',
    ipa: '[ts]',
    vietnameseEquivalent: 'Giống âm "ch / tr" nhẹ nhưng đầu lưỡi phẳng chạm mặt sau răng trên',
    description: 'Đầu lưỡi phẳng chạm mặt sau răng trên, không bật hơi.',
    mouthShape: 'Răng khép gần nhau, lưỡi phẳng chạm mặt sau răng cửa.',
    audioSample: 'zī',
    group: 'alveolar',
    groupNameVi: 'Âm đầu lưỡi trước (z, c, s)',
    examples: [
      { pinyin: 'zài', hanzi: '在', meaningVi: 'ở, tại' },
      { pinyin: 'zǎo', hanzi: '早', meaningVi: 'sớm' },
      { pinyin: 'zì', hanzi: '字', meaningVi: 'chữ' }
    ]
  },
  {
    id: 'c',
    symbol: 'c',
    ipa: '[tsʰ]',
    vietnameseEquivalent: 'Âm "x" hoặc "th" BẬT HƠI RÍT QUA KHE RĂNG',
    description: 'Vị trí như âm "z" nhưng bật luồng hơi cực mạnh tạo âm thanh xì gió.',
    mouthShape: 'Đầu lưỡi áp chân răng trên, giật nhẹ tạo luồng hơi rít mạnh.',
    audioSample: 'cī',
    group: 'alveolar',
    groupNameVi: 'Âm đầu lưỡi trước (z, c, s)',
    examples: [
      { pinyin: 'cài', hanzi: '菜', meaningVi: 'món ăn, rau' },
      { pinyin: 'cóng', hanzi: '从', meaningVi: 'từ' },
      { pinyin: 'cuò', hanzi: '错', meaningVi: 'sai' }
    ]
  },
  {
    id: 's',
    symbol: 's',
    ipa: '[s]',
    vietnameseEquivalent: 'Giống hệt âm "x" nhẹ trong tiếng Việt (lưỡi duỗi thẳng)',
    description: 'Đầu lưỡi phẳng đến gần mặt sau răng trên tạo khe hẹp, luồng hơi ma sát thổi ra ngoài.',
    mouthShape: 'Đầu lưỡi thẳng tiếp cận chân răng, thổi hơi xì nhẹ.',
    audioSample: 'sī',
    group: 'alveolar',
    groupNameVi: 'Âm đầu lưỡi trước (z, c, s)',
    examples: [
      { pinyin: 'sān', hanzi: '三', meaningVi: 'ba (3)' },
      { pinyin: 'sì', hanzi: '四', meaningVi: 'bốn (4)' },
      { pinyin: 'suì', hanzi: '岁', meaningVi: 'tuổi' }
    ]
  }
];

export const PINYIN_FINALS: PinyinFinal[] = [
  // Vận mẫu đơn (Simple Finals)
  {
    id: 'a',
    symbol: 'a',
    ipa: '[a]',
    vietnameseEquivalent: 'Giống âm "a" trong tiếng Việt',
    description: 'Miệng mở rộng tự nhiên, lưỡi hạ thấp phẳng, thanh đới rung.',
    category: 'simple',
    categoryNameVi: 'Vận mẫu đơn (6 âm cơ bản)',
    audioSample: 'ā',
    examples: [
      { pinyin: 'bā', hanzi: '八', meaningVi: 'tám (8)' },
      { pinyin: 'māma', hanzi: '妈妈', meaningVi: 'mẹ' }
    ]
  },
  {
    id: 'o',
    symbol: 'o',
    ipa: '[o]',
    vietnameseEquivalent: 'Gần giống âm "ô" hoặc "ua" tròn môi trong tiếng Việt',
    description: 'Môi tròn hé mở, cuống lưỡi nâng cao nhẹ, thanh đới rung.',
    category: 'simple',
    categoryNameVi: 'Vận mẫu đơn (6 âm cơ bản)',
    audioSample: 'ō',
    examples: [
      { pinyin: 'bō', hanzi: '波', meaningVi: 'sóng' },
      { pinyin: 'wǒ', hanzi: '我', meaningVi: 'tôi' }
    ]
  },
  {
    id: 'e',
    symbol: 'e',
    ipa: '[ɤ]',
    vietnameseEquivalent: 'Giữa âm "ơ" và "ưa" trong tiếng Việt',
    description: 'Miệng hé nửa, mép kéo sang hai bên, cuống lưỡi nâng cao, phát âm như "ưa" ngắn.',
    category: 'simple',
    categoryNameVi: 'Vận mẫu đơn (6 âm cơ bản)',
    audioSample: 'ē',
    examples: [
      { pinyin: 'gēge', hanzi: '哥哥', meaningVi: 'anh trai' },
      { pinyin: 'hē', hanzi: '喝', meaningVi: 'uống' }
    ]
  },
  {
    id: 'i',
    symbol: 'i',
    ipa: '[i]',
    vietnameseEquivalent: 'Giống âm "i" trong tiếng Việt (Lưu ý: đọc là "ư" sau zh, ch, sh, r, z, c, s)',
    description: 'Mép miệng kéo rộng sang hai bên, mặt lưỡi dẹt dâng cao áp ngạc trên.',
    category: 'simple',
    categoryNameVi: 'Vận mẫu đơn (6 âm cơ bản)',
    audioSample: 'ī',
    examples: [
      { pinyin: 'qī', hanzi: '七', meaningVi: 'bảy (7)' },
      { pinyin: 'yī', hanzi: '一', meaningVi: 'một (1)' }
    ]
  },
  {
    id: 'u',
    symbol: 'u',
    ipa: '[u]',
    vietnameseEquivalent: 'Giống âm "u" trong tiếng Việt',
    description: 'Môi tròn chu về phía trước tạo lỗ nhỏ, cuống lưỡi nâng cao.',
    category: 'simple',
    categoryNameVi: 'Vận mẫu đơn (6 âm cơ bản)',
    audioSample: 'ū',
    examples: [
      { pinyin: 'wǔ', hanzi: '五', meaningVi: 'năm (5)' },
      { pinyin: 'bù', hanzi: '不', meaningVi: 'không' }
    ]
  },
  {
    id: 'u_umlaut',
    symbol: 'ü',
    ipa: '[y]',
    vietnameseEquivalent: 'Âm "uy" hoặc "u" môi chu tròn nhưng đọc "i"',
    description: 'Khẩu hình miệng chu tròn như "u", nhưng đặt vị trí lưỡi và phát âm thanh "i".',
    category: 'simple',
    categoryNameVi: 'Vận mẫu đơn (6 âm cơ bản)',
    audioSample: 'ǖ',
    examples: [
      { pinyin: 'yǔ', hanzi: '雨', meaningVi: 'mưa' },
      { pinyin: 'nǚ', hanzi: '女', meaningVi: 'nữ, phụ nữ' }
    ]
  },

  // Vận mẫu kép (Compound Finals)
  {
    id: 'ai',
    symbol: 'ai',
    ipa: '[aɪ]',
    vietnameseEquivalent: 'Giống âm "ai" trong tiếng Việt',
    description: 'Bắt đầu từ âm "a" rồi lướt nhanh sang âm "i".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'āi',
    examples: [{ pinyin: 'ài', hanzi: '爱', meaningVi: 'yêu' }]
  },
  {
    id: 'ei',
    symbol: 'ei',
    ipa: '[eɪ]',
    vietnameseEquivalent: 'Giống âm "ây" trong tiếng Việt',
    description: 'Bắt đầu từ âm "e" lướt sang âm "i".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'ēi',
    examples: [{ pinyin: 'bēi', hanzi: '杯', meaningVi: 'cốc, ly' }]
  },
  {
    id: 'ao',
    symbol: 'ao',
    ipa: '[ɑʊ]',
    vietnameseEquivalent: 'Giống âm "ao" trong tiếng Việt',
    description: 'Bắt đầu từ "a" lướt sang "o/u" chu môi.',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'āo',
    examples: [{ pinyin: 'gāo', hanzi: '高', meaningVi: 'cao' }]
  },
  {
    id: 'ou',
    symbol: 'ou',
    ipa: '[oʊ]',
    vietnameseEquivalent: 'Giống âm "âu" trong tiếng Việt',
    description: 'Bắt đầu từ âm "o" lướt sang âm "u".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'ōu',
    examples: [{ pinyin: 'kǒu', hanzi: '口', meaningVi: 'miệng' }]
  },
  {
    id: 'ia',
    symbol: 'ia',
    ipa: '[iɑ]',
    vietnameseEquivalent: 'Giống âm "ia" trong tiếng Việt',
    description: 'Bắt đầu từ "i" mở miệng nhanh sang "a".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'iā',
    examples: [{ pinyin: 'jiā', hanzi: '家', meaningVi: 'nhà' }]
  },
  {
    id: 'ie',
    symbol: 'ie',
    ipa: '[iɛ]',
    vietnameseEquivalent: 'Giống âm "i-ê" trong tiếng Việt',
    description: 'Bắt đầu từ "i" lướt sang âm "ê".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'iē',
    examples: [{ pinyin: 'xiě', hanzi: '写', meaningVi: 'viết' }]
  },
  {
    id: 'iao',
    symbol: 'iao',
    ipa: '[iɑʊ]',
    vietnameseEquivalent: 'Giống âm "i-ao" trong tiếng Việt',
    description: 'Bắt đầu từ "i" lướt qua "a" đến "o".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'iāo',
    examples: [{ pinyin: 'xiǎo', hanzi: '小', meaningVi: 'nhỏ' }]
  },
  {
    id: 'iu',
    symbol: 'iu',
    ipa: '[iəʊ]',
    vietnameseEquivalent: 'Giống âm "yêu" trong tiếng Việt',
    description: 'Thực chất là i + ou, đọc lướt thành "yêu".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'iū',
    examples: [{ pinyin: 'jiǔ', hanzi: '九', meaningVi: 'chín (9)' }]
  },
  {
    id: 'ua',
    symbol: 'ua',
    ipa: '[uɑ]',
    vietnameseEquivalent: 'Giống âm "oa" trong tiếng Việt',
    description: 'Bắt đầu từ "u" tròn môi mở sang "a".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'uā',
    examples: [{ pinyin: 'huā', hanzi: '花', meaningVi: 'hoa' }]
  },
  {
    id: 'uo',
    symbol: 'uo',
    ipa: '[uɔ]',
    vietnameseEquivalent: 'Giống âm "ua / uô" trong tiếng Việt',
    description: 'Bắt đầu từ "u" lướt sang "o".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'uō',
    examples: [{ pinyin: 'suǒ', hanzi: '所', meaningVi: 'nơi' }]
  },
  {
    id: 'uai',
    symbol: 'uai',
    ipa: '[uaɪ]',
    vietnameseEquivalent: 'Giống âm "oai" trong tiếng Việt',
    description: 'Bắt đầu từ "u" lướt sang "ai".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'uāi',
    examples: [{ pinyin: 'kuài', hanzi: '快', meaningVi: 'nhanh, tệ' }]
  },
  {
    id: 'ui',
    symbol: 'ui',
    ipa: '[ueɪ]',
    vietnameseEquivalent: 'Giống âm "uây" trong tiếng Việt (viết tắt của uei)',
    description: 'Bắt đầu từ "u" lướt qua "e" tới "i".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'uī',
    examples: [{ pinyin: 'duì', hanzi: '对', meaningVi: 'đúng' }]
  },
  {
    id: 'ue',
    symbol: 'üe',
    ipa: '[yɛ]',
    vietnameseEquivalent: 'Giống âm "uy-ê" trong tiếng Việt',
    description: 'Bắt đầu từ "ü" chu môi lướt sang "ê".',
    category: 'compound',
    categoryNameVi: 'Vận mẫu kép',
    audioSample: 'üē',
    examples: [{ pinyin: 'yuè', hanzi: '月', meaningVi: 'tháng, trăng' }]
  },

  // Vận mẫu mũi (Nasal Finals)
  {
    id: 'an',
    symbol: 'an',
    ipa: '[an]',
    vietnameseEquivalent: 'Giống âm "an" trong tiếng Việt',
    description: 'Bắt đầu từ "a" kết thúc đầu lưỡi áp chân răng trên làm âm mũi.',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'ān',
    examples: [{ pinyin: 'sān', hanzi: '三', meaningVi: 'ba (3)' }]
  },
  {
    id: 'en',
    symbol: 'en',
    ipa: '[ən]',
    vietnameseEquivalent: 'Giống âm "ân" trong tiếng Việt',
    description: 'Bắt đầu từ "e" kết thúc âm mũi bằng "n".',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'ēn',
    examples: [{ pinyin: 'hěn', hanzi: '很', meaningVi: 'rất' }]
  },
  {
    id: 'ang',
    symbol: 'ang',
    ipa: '[ɑŋ]',
    vietnameseEquivalent: 'Giống âm "ang" trong tiếng Việt',
    description: 'Bắt đầu từ "a" kết thúc bằng âm "ng" cuống họng.',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'āng',
    examples: [{ pinyin: 'cháng', hanzi: '长', meaningVi: 'dài' }]
  },
  {
    id: 'eng',
    symbol: 'eng',
    ipa: '[əŋ]',
    vietnameseEquivalent: 'Giống âm "âng" trong tiếng Việt',
    description: 'Bắt đầu từ "e" kết thúc bằng âm "ng" vang mũi.',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'ēng',
    examples: [{ pinyin: 'péngyou', hanzi: '朋友', meaningVi: 'bạn bè' }]
  },
  {
    id: 'ong',
    symbol: 'ong',
    ipa: '[ʊŋ]',
    vietnameseEquivalent: 'Gần giống âm "ung / ông" trong tiếng Việt',
    description: 'Môi tròn chu lại, cuống lưỡi chặn ngạc mềm âm vang mũi.',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'ōng',
    examples: [{ pinyin: 'Zhōngguó', hanzi: '中国', meaningVi: 'Trung Quốc' }]
  },
  {
    id: 'ian',
    symbol: 'ian',
    ipa: '[iɛn]',
    vietnameseEquivalent: 'Gần giống âm "i-en" trong tiếng Việt (không phải "i-an")',
    description: 'Bắt đầu từ "i" lướt qua "ê" đến "n".',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'iān',
    examples: [{ pinyin: 'tiān', hanzi: '天', meaningVi: 'trời, ngày' }]
  },
  {
    id: 'in',
    symbol: 'in',
    ipa: '[in]',
    vietnameseEquivalent: 'Giống âm "in" trong tiếng Việt',
    description: 'Bắt đầu từ "i" kết thúc ở đầu lưỡi "n".',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'īn',
    examples: [{ pinyin: 'tīng', hanzi: '听', meaningVi: 'nghe' }]
  },
  {
    id: 'iang',
    symbol: 'iang',
    ipa: '[iɑŋ]',
    vietnameseEquivalent: 'Giống âm "i-ang" trong tiếng Việt',
    description: 'Bắt đầu từ "i" lướt sang "ang".',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'iāng',
    examples: [{ pinyin: 'xiǎng', hanzi: '想', meaningVi: 'nghĩ, nhớ' }]
  },
  {
    id: 'ing',
    symbol: 'ing',
    ipa: '[iŋ]',
    vietnameseEquivalent: 'Giống âm "inh" trong tiếng Việt',
    description: 'Bắt đầu từ "i" kết thúc bằng âm cuống họng "ng".',
    category: 'nasal',
    categoryNameVi: 'Vận mẫu mũi',
    audioSample: 'īng',
    examples: [{ pinyin: 'míngzi', hanzi: '名字', meaningVi: 'tên' }]
  },
  {
    id: 'er',
    symbol: 'er',
    ipa: '[ɑɻ]',
    vietnameseEquivalent: 'Giống âm "ơ" uốn cong lưỡi lên vòm họng',
    description: 'Vận mẫu cuộn lưỡi đặc biệt, phát âm "ơ" đồng thời uốn cong đầu lưỡi lên ngạc trên.',
    category: 'special',
    categoryNameVi: 'Vận mẫu cuộn lưỡi đặc biệt',
    audioSample: 'ēr',
    examples: [
      { pinyin: 'èr', hanzi: '二', meaningVi: 'hai (2)' },
      { pinyin: 'érzi', hanzi: '儿子', meaningVi: 'con trai' }
    ]
  }
];

export const CORE_SYLLABLES: PinyinSyllable[] = [
  {
    initial: 'm',
    final: 'a',
    pinyin: 'ma',
    tones: { 1: 'mā', 2: 'má', 3: 'mǎ', 4: 'mà', 5: 'ma' },
    sampleHanzi: {
      1: { hanzi: '妈 (mẹ)', meaningVi: 'mẹ' },
      2: { hanzi: '麻 (gai, tê)', meaningVi: 'gai, tê bì' },
      3: { hanzi: '马 (con ngựa)', meaningVi: 'con ngựa' },
      4: { hanzi: '骂 (mắng)', meaningVi: 'chửi mắng' }
    }
  },
  {
    initial: 'b',
    final: 'a',
    pinyin: 'ba',
    tones: { 1: 'bā', 2: 'bá', 3: 'bǎ', 4: 'bà', 5: 'ba' },
    sampleHanzi: {
      1: { hanzi: '八 (số 8)', meaningVi: 'tám (8)' },
      2: { hanzi: '拔 (nhổ)', meaningVi: 'nhổ' },
      3: { hanzi: '把 (lượng từ)', meaningVi: 'chiếc, cái, nắm' },
      4: { hanzi: '爸 (bố)', meaningVi: 'bố' }
    }
  },
  {
    initial: 't',
    final: 'a',
    pinyin: 'ta',
    tones: { 1: 'tā', 2: 'tá', 3: 'tǎ', 4: 'tà' },
    sampleHanzi: {
      1: { hanzi: '他 / 她 / 它', meaningVi: 'anh ấy / cô ấy / nó' }
    }
  },
  {
    initial: 'h',
    final: 'ao',
    pinyin: 'hao',
    tones: { 1: 'hāo', 2: 'háo', 3: 'hǎo', 4: 'hào' },
    sampleHanzi: {
      3: { hanzi: '好', meaningVi: 'tốt, hay' },
      4: { hanzi: '号', meaningVi: 'số, ngày' }
    }
  },
  {
    initial: 'x',
    final: 'ie',
    pinyin: 'xie',
    tones: { 1: 'xiē', 2: 'xié', 3: 'xiě', 4: 'xiè' },
    sampleHanzi: {
      1: { hanzi: '些', meaningVi: 'một vài' },
      2: { hanzi: '鞋', meaningVi: 'giày' },
      3: { hanzi: '写', meaningVi: 'viết' },
      4: { hanzi: '谢', meaningVi: 'cảm ơn' }
    }
  },
  {
    initial: 'zh',
    final: 'ong',
    pinyin: 'zhong',
    tones: { 1: 'zhōng', 2: 'zhóng', 3: 'zhǒng', 4: 'zhòng' },
    sampleHanzi: {
      1: { hanzi: '中', meaningVi: 'trung, ở giữa' },
      3: { hanzi: '种', meaningVi: 'loại, chủng' },
      4: { hanzi: '重', meaningVi: 'nặng' }
    }
  }
];

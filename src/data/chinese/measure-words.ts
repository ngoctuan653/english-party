export interface ChineseMeasureWord {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  usedFor: string;
  hskLevel: 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4';
  examples: Array<{
    phrase: string;
    pinyin: string;
    meaningVi: string;
  }>;
}

export const CHINESE_MEASURE_WORDS: ChineseMeasureWord[] = [
  {
    id: 'mw_ge',
    hanzi: '个',
    pinyin: 'gè',
    meaningVi: 'cái, con, người (lượng từ thông dụng nhất)',
    usedFor: 'Dùng cho người, quả tròn, các danh từ không có lượng từ riêng chuyên biệt.',
    hskLevel: 'hsk1',
    examples: [
      { phrase: '一个人', pinyin: 'yí gè rén', meaningVi: 'một người' },
      { phrase: '一个苹果', pinyin: 'yí gè píngguǒ', meaningVi: 'một quả táo' },
      { phrase: '一个问题', pinyin: 'yí gè wèntí', meaningVi: 'một câu hỏi / vấn đề' }
    ]
  },
  {
    id: 'mw_ben',
    hanzi: '本',
    pinyin: 'běn',
    meaningVi: 'quyển, cuốn',
    usedFor: 'Dùng cho sách báo, tập vở, tạp chí có gáy đóng thành quyển.',
    hskLevel: 'hsk1',
    examples: [
      { phrase: '一本书', pinyin: 'yì běn shū', meaningVi: 'một quyển sách' },
      { phrase: '两本杂志', pinyin: 'liǎng běn zázhì', meaningVi: 'hai cuốn tạp chí' },
      { phrase: '一本词典', pinyin: 'yì běn cídiǎn', meaningVi: 'một cuốn từ điển' }
    ]
  },
  {
    id: 'mw_bei',
    hanzi: '杯',
    pinyin: 'bēi',
    meaningVi: 'cốc, ly, tách',
    usedFor: 'Dùng cho đồ uống chứa trong cốc, ly, tách.',
    hskLevel: 'hsk1',
    examples: [
      { phrase: '一杯水', pinyin: 'yì bēi shuǐ', meaningVi: 'một cốc nước' },
      { phrase: '一杯咖啡', pinyin: 'yì bēi kāfēi', meaningVi: 'một tách cà phê' },
      { phrase: '一杯茶', pinyin: 'yì bēi chá', meaningVi: 'một tách trà' }
    ]
  },
  {
    id: 'mw_zhi_animal',
    hanzi: '只',
    pinyin: 'zhī',
    meaningVi: 'con, chiếc (trong một đôi)',
    usedFor: 'Dùng cho động vật nhỏ (chim, mèo, chó) hoặc một chiếc trong bộ đôi (tay, mắt, giày).',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一只猫', pinyin: 'yì zhī māo', meaningVi: 'một con mèo' },
      { phrase: '一只鸟', pinyin: 'yì zhī niǎo', meaningVi: 'một con chim' },
      { phrase: '一只手', pinyin: 'yì zhī shǒu', meaningVi: 'một bàn tay' }
    ]
  },
  {
    id: 'mw_zhang',
    hanzi: '张',
    pinyin: 'zhāng',
    meaningVi: 'tờ, tấm, chiếc, cái',
    usedFor: 'Dùng cho các vật có bề mặt phẳng, rộng: giấy, vé, bàn, giường, ảnh, gương mặt.',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一张纸', pinyin: 'yì zhāng zhǐ', meaningVi: 'một tờ giấy' },
      { phrase: '两张票', pinyin: 'liǎng zhāng piào', meaningVi: 'hai tấm vé' },
      { phrase: '一张桌子', pinyin: 'yì zhāng zhuōzi', meaningVi: 'một cái bàn' },
      { phrase: '一张照片', pinyin: 'yì zhāng zhàopiàn', meaningVi: 'một tấm ảnh' }
    ]
  },
  {
    id: 'mw_jian',
    hanzi: '件',
    pinyin: 'jiàn',
    meaningVi: 'chiếc, cái, vụ, việc',
    usedFor: 'Dùng cho quần áo thân trên (áo khoác, sơ mi) hoặc sự việc, hành lý, quà tặng.',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一件衣服', pinyin: 'yí jiàn yīfu', meaningVi: 'một bộ quần áo' },
      { phrase: '一件事', pinyin: 'yí jiàn shì', meaningVi: 'một sự việc' },
      { phrase: '一件礼物', pinyin: 'yí jiàn lǐwù', meaningVi: 'một món quà' }
    ]
  },
  {
    id: 'mw_tiao',
    hanzi: '条',
    pinyin: 'tiáo',
    meaningVi: 'sợi, dải, con, chiếc',
    usedFor: 'Dùng cho vật dài uốn lượn mềm mại: cá, sông, đường đi, quần, khăn choàng, tin nhắn.',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一条鱼', pinyin: 'yì tiáo yú', meaningVi: 'một con cá' },
      { phrase: '一条路', pinyin: 'yì tiáo lù', meaningVi: 'một con đường' },
      { phrase: '一条裤子', pinyin: 'yì tiáo kùzi', meaningVi: 'một chiếc quần' }
    ]
  },
  {
    id: 'mw_shuang',
    hanzi: '双',
    pinyin: 'shuāng',
    meaningVi: 'đôi',
    usedFor: 'Dùng cho đồ vật đi đôi có đôi có cặp: đũa, giày, tất, mắt, tay.',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一双鞋', pinyin: 'yì shuāng xié', meaningVi: 'một đôi giày' },
      { phrase: '一双筷子', pinyin: 'yì shuāng kuàizi', meaningVi: 'một đôi đũa' },
      { phrase: '一双手', pinyin: 'yì shuāng shǒu', meaningVi: 'một đôi bàn tay' }
    ]
  },
  {
    id: 'mw_liang',
    hanzi: '辆',
    pinyin: 'liàng',
    meaningVi: 'chiếc, cỗ (xe)',
    usedFor: 'Dùng cho phương tiện giao thông trên cạn có bánh xe: ô tô, xe đạp, xe máy.',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一辆汽车', pinyin: 'yí liàng qìchē', meaningVi: 'một chiếc ô tô' },
      { phrase: '一辆自行车', pinyin: 'yí liàng zìxíngchē', meaningVi: 'một chiếc xe đạp' }
    ]
  },
  {
    id: 'mw_ping',
    hanzi: '瓶',
    pinyin: 'píng',
    meaningVi: 'chai, lọ, bình',
    usedFor: 'Dùng cho đồ đựng trong chai lọ: nước suối, rượu, bia, sữa chua.',
    hskLevel: 'hsk2',
    examples: [
      { phrase: '一瓶水', pinyin: 'yì píng shuǐ', meaningVi: 'một chai nước' },
      { phrase: '一瓶啤酒', pinyin: 'yì píng píjiǔ', meaningVi: 'một chai bia' }
    ]
  },
  {
    id: 'mw_ba',
    hanzi: '把',
    pinyin: 'bǎ',
    meaningVi: 'cái, chiếc, bó, nắm',
    usedFor: 'Dùng cho đồ vật có cán cầm/nắm: dao, dù/ô, ghế tựa, chìa khóa, quạt.',
    hskLevel: 'hsk3',
    examples: [
      { phrase: '一把伞', pinyin: 'yì bǎ sǎn', meaningVi: 'một chiếc ô / dù' },
      { phrase: '一把椅子', pinyin: 'yì bǎ yǐzi', meaningVi: 'một chiếc ghế tựa' },
      { phrase: '一把钥匙', pinyin: 'yì bǎ yàoshi', meaningVi: 'một chiếc chìa khóa' }
    ]
  },
  {
    id: 'mw_wei',
    hanzi: '位',
    pinyin: 'wèi',
    meaningVi: 'vị (lịch sự)',
    usedFor: 'Dùng xưng hô lịch sự tôn trọng cho người: thầy cô, khách hàng, bác sĩ, chuyên gia.',
    hskLevel: 'hsk3',
    examples: [
      { phrase: '一位老师', pinyin: 'yí wèi lǎoshī', meaningVi: 'một vị thầy giáo' },
      { phrase: '两位客人', pinyin: 'liǎng wèi kèrén', meaningVi: 'hai vị khách' }
    ]
  },
  {
    id: 'mw_zhi_pen',
    hanzi: '支',
    pinyin: 'zhī',
    meaningVi: 'cây, cái, ngọn',
    usedFor: 'Dùng cho đồ vật dài cứng hình trụ: bút, nến, súng, bài hát.',
    hskLevel: 'hsk3',
    examples: [
      { phrase: '一支笔', pinyin: 'yì zhī bǐ', meaningVi: 'một cây bút' },
      { phrase: '一支蜡烛', pinyin: 'yì zhī làzhú', meaningVi: 'một cây nến' }
    ]
  },
  {
    id: 'mw_jia',
    hanzi: '家',
    pinyin: 'jiā',
    meaningVi: 'nhà, cửa hàng, công ty',
    usedFor: 'Dùng cho doanh nghiệp, công ty, nhà hàng, khách sạn, ngân hàng.',
    hskLevel: 'hsk3',
    examples: [
      { phrase: '一家公司', pinyin: 'yì jiā gōngsī', meaningVi: 'một công ty' },
      { phrase: '一家饭馆', pinyin: 'yì jiā fànguǎn', meaningVi: 'một nhà hàng' },
      { phrase: '一家银行', pinyin: 'yì jiā yínháng', meaningVi: 'một ngân hàng' }
    ]
  }
];

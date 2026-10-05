export interface ChineseRadical {
  id: string;
  radical: string;
  variant?: string;
  pinyin: string;
  meaningVi: string;
  strokeCount: number;
  examples: Array<{
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  }>;
}

export const CHINESE_RADICALS: ChineseRadical[] = [
  // 1 Nét
  {
    id: 'rad_1',
    radical: '一',
    pinyin: 'yī',
    meaningVi: 'nhất (số một, vạch ngang)',
    strokeCount: 1,
    examples: [
      { hanzi: '一', pinyin: 'yī', meaningVi: 'một' },
      { hanzi: '三', pinyin: 'sān', meaningVi: 'ba' },
      { hanzi: '下', pinyin: 'xià', meaningVi: 'dưới' }
    ]
  },
  {
    id: 'rad_2',
    radical: '丨',
    pinyin: 'gǔn',
    meaningVi: 'cổn (nét sổ dọc)',
    strokeCount: 1,
    examples: [
      { hanzi: '中', pinyin: 'zhōng', meaningVi: 'trung, ở giữa' },
      { hanzi: '十', pinyin: 'shí', meaningVi: 'mười' }
    ]
  },
  {
    id: 'rad_3',
    radical: '丿',
    pinyin: 'piě',
    meaningVi: 'phiệt (nét phẩy nghiêng trái)',
    strokeCount: 1,
    examples: [
      { hanzi: '八', pinyin: 'bā', meaningVi: 'tám' },
      { hanzi: '人', pinyin: 'rén', meaningVi: 'người' }
    ]
  },
  {
    id: 'rad_4',
    radical: '丶',
    pinyin: 'diǎn',
    meaningVi: 'chủ (nét chấm)',
    strokeCount: 1,
    examples: [
      { hanzi: '太', pinyin: 'tài', meaningVi: 'quá, lắm' },
      { hanzi: '丸', pinyin: 'wán', meaningVi: 'viên, hoàn' }
    ]
  },

  // 2 Nét (Rất quan trọng trong HSK)
  {
    id: 'rad_人',
    radical: '人',
    variant: '亻',
    pinyin: 'rén',
    meaningVi: 'nhân (con người, nhân đứng)',
    strokeCount: 2,
    examples: [
      { hanzi: '你', pinyin: 'nǐ', meaningVi: 'bạn' },
      { hanzi: '他', pinyin: 'tā', meaningVi: 'anh ấy' },
      { hanzi: '们', pinyin: 'men', meaningVi: 'chúng, các (số nhiều)' },
      { hanzi: '休', pinyin: 'xiū', meaningVi: 'nghỉ ngơi (người tựa gốc cây)' }
    ]
  },
  {
    id: 'rad_刀',
    radical: '刀',
    variant: '刂',
    pinyin: 'dāo',
    meaningVi: 'đao (con dao, vũ khí, nét đao đứng)',
    strokeCount: 2,
    examples: [
      { hanzi: '到', pinyin: 'dào', meaningVi: 'đến' },
      { hanzi: '分', pinyin: 'fēn', meaningVi: 'chia, phút' },
      { hanzi: '别', pinyin: 'bié', meaningVi: 'đừng, khác' }
    ]
  },
  {
    id: 'rad_力',
    radical: '力',
    pinyin: 'lì',
    meaningVi: 'lực (sức mạnh, thể lực)',
    strokeCount: 2,
    examples: [
      { hanzi: '男', pinyin: 'nán', meaningVi: 'nam (sức làm ruộng)' },
      { hanzi: '办', pinyin: 'bàn', meaningVi: 'làm, xử lý' },
      { hanzi: '动', pinyin: 'dòng', meaningVi: 'chuyển động' }
    ]
  },
  {
    id: 'rad_十',
    radical: '十',
    pinyin: 'shí',
    meaningVi: 'thập (số mười, hoàn chỉnh)',
    strokeCount: 2,
    examples: [
      { hanzi: '千', pinyin: 'qiān', meaningVi: 'nghìn (1000)' },
      { hanzi: '南', pinyin: 'nán', meaningVi: 'phía nam' }
    ]
  },
  {
    id: 'rad_卜',
    radical: '卜',
    pinyin: 'bǔ',
    meaningVi: 'bói (bói toán, dự đoán)',
    strokeCount: 2,
    examples: [
      { hanzi: '不', pinyin: 'bù', meaningVi: 'không' },
      { hanzi: '占', pinyin: 'zhàn', meaningVi: 'chiếm' }
    ]
  },
  {
    id: 'rad_口',
    radical: '口',
    pinyin: 'kǒu',
    meaningVi: 'khẩu (cái miệng, ăn uống, lời nói)',
    strokeCount: 3,
    examples: [
      { hanzi: '吃', pinyin: 'chī', meaningVi: 'ăn' },
      { hanzi: '喝', pinyin: 'hē', meaningVi: 'uống' },
      { hanzi: '叫', pinyin: 'jiào', meaningVi: 'gọi, tên là' },
      { hanzi: '听', pinyin: 'tīng', meaningVi: 'nghe' }
    ]
  },
  {
    id: 'rad_囗',
    radical: '囗',
    pinyin: 'wéi',
    meaningVi: 'vi (bao quanh, khép kín)',
    strokeCount: 3,
    examples: [
      { hanzi: '国', pinyin: 'guó', meaningVi: 'quốc gia' },
      { hanzi: '四', pinyin: 'sì', meaningVi: 'bốn' },
      { hanzi: '回', pinyin: 'huí', meaningVi: 'về, quay lại' }
    ]
  },
  {
    id: 'rad_女',
    radical: '女',
    pinyin: 'nǚ',
    meaningVi: 'nữ (phụ nữ, con gái)',
    strokeCount: 3,
    examples: [
      { hanzi: '好', pinyin: 'hǎo', meaningVi: 'tốt (nữ + tử)' },
      { hanzi: '妈', pinyin: 'mā', meaningVi: 'mẹ' },
      { hanzi: '她', pinyin: 'tā', meaningVi: 'cô ấy' },
      { hanzi: '妹', pinyin: 'mèi', meaningVi: 'em gái' }
    ]
  },
  {
    id: 'rad_子',
    radical: '子',
    pinyin: 'zǐ',
    meaningVi: 'tử (đứa con, trẻ con)',
    strokeCount: 3,
    examples: [
      { hanzi: '字', pinyin: 'zì', meaningVi: 'chữ' },
      { hanzi: '学', pinyin: 'xué', meaningVi: 'học' },
      { hanzi: '孩', pinyin: 'hái', meaningVi: 'đứa trẻ' }
    ]
  },
  {
    id: 'rad_宀',
    radical: '宀',
    pinyin: 'mián',
    meaningVi: 'miên (mái nhà, nơi cư trú)',
    strokeCount: 3,
    examples: [
      { hanzi: '家', pinyin: 'jiā', meaningVi: 'gia đình, nhà (lợn dưới mái)' },
      { hanzi: '字', pinyin: 'zì', meaningVi: 'chữ' },
      { hanzi: '安', pinyin: 'ān', meaningVi: 'an toàn, yên bình' }
    ]
  },
  {
    id: 'rad_心',
    radical: '心',
    variant: '忄',
    pinyin: 'xīn',
    meaningVi: 'tâm (trái tim, tâm tư, cảm xúc)',
    strokeCount: 4,
    examples: [
      { hanzi: '想', pinyin: 'xiǎng', meaningVi: 'nghĩ, nhớ, muốn' },
      { hanzi: '忙', pinyin: 'máng', meaningVi: 'bận rộn' },
      { hanzi: '快', pinyin: 'kuài', meaningVi: 'nhanh, vui vẻ' }
    ]
  },
  {
    id: 'rad_手',
    radical: '手',
    variant: '扌',
    pinyin: 'shǒu',
    meaningVi: 'thủ (bàn tay, hành động dùng tay)',
    strokeCount: 4,
    examples: [
      { hanzi: '打', pinyin: 'dǎ', meaningVi: 'đánh, chơi (bóng)' },
      { hanzi: '找', pinyin: 'zhǎo', meaningVi: 'tìm kiếm' },
      { hanzi: '拿', pinyin: 'ná', meaningVi: 'cầm, nắm' }
    ]
  },
  {
    id: 'rad_日',
    radical: '日',
    pinyin: 'rì',
    meaningVi: 'nhật (mặt trời, ngày, thời gian)',
    strokeCount: 4,
    examples: [
      { hanzi: '早', pinyin: 'zǎo', meaningVi: 'sớm' },
      { hanzi: '明', pinyin: 'míng', meaningVi: 'sáng sủa, ngày mai (nhật + nguyệt)' },
      { hanzi: '时', pinyin: 'shí', meaningVi: 'thời gian, giờ' }
    ]
  },
  {
    id: 'rad_月',
    radical: '月',
    pinyin: 'yuè',
    meaningVi: 'nguyệt (mặt trăng, tháng, hoặc bộ nhục - cơ thể)',
    strokeCount: 4,
    examples: [
      { hanzi: '朋', pinyin: 'péng', meaningVi: 'bạn (hai vầng trăng)' },
      { hanzi: '明', pinyin: 'míng', meaningVi: 'sáng sủa' },
      { hanzi: '期', pinyin: 'qī', meaningVi: 'thời kỳ' }
    ]
  },
  {
    id: 'rad_木',
    radical: '木',
    pinyin: 'mù',
    meaningVi: 'mộc (cây cối, gỗ)',
    strokeCount: 4,
    examples: [
      { hanzi: '本', pinyin: 'běn', meaningVi: 'gốc, quyển sách' },
      { hanzi: '林', pinyin: 'lín', meaningVi: 'rừng cây' },
      { hanzi: '杯', pinyin: 'bēi', meaningVi: 'cái cốc, ly' }
    ]
  },
  {
    id: 'rad_水',
    radical: '水',
    variant: '氵',
    pinyin: 'shuǐ',
    meaningVi: 'thủy (nước, chất lỏng - ba chấm thủy)',
    strokeCount: 4,
    examples: [
      { hanzi: '没', pinyin: 'méi', meaningVi: 'không có, chưa' },
      { hanzi: '汉', pinyin: 'hàn', meaningVi: 'Hán (sông Hán Thủy)' },
      { hanzi: '洗', pinyin: 'xǐ', meaningVi: 'rửa, giặt' }
    ]
  },
  {
    id: 'rad_火',
    radical: '火',
    variant: '灬',
    pinyin: 'huǒ',
    meaningVi: 'hỏa (lửa, nhiệt độ, nấu nướng)',
    strokeCount: 4,
    examples: [
      { hanzi: '热', pinyin: 'rè', meaningVi: 'nóng' },
      { hanzi: '点', pinyin: 'diǎn', meaningVi: 'điểm, giờ, gọi món' }
    ]
  },
  {
    id: 'rad_言',
    radical: '言',
    variant: '讠',
    pinyin: 'yán',
    meaningVi: 'ngôn (lời nói, ngôn ngữ)',
    strokeCount: 7,
    examples: [
      { hanzi: '语', pinyin: 'yǔ', meaningVi: 'ngôn ngữ' },
      { hanzi: '说', pinyin: 'shuō', meaningVi: 'nói' },
      { hanzi: '话', pinyin: 'huà', meaningVi: 'lời nói' },
      { hanzi: '谢', pinyin: 'xiè', meaningVi: 'cảm ơn' }
    ]
  },
  {
    id: 'rad_辶',
    radical: '辶',
    pinyin: 'chuò',
    meaningVi: 'quai xước (bước đi, chuyển động, đường sá)',
    strokeCount: 3,
    examples: [
      { hanzi: '这', pinyin: 'zhè', meaningVi: 'đây, này' },
      { hanzi: '进', pinyin: 'jìn', meaningVi: 'vào' },
      { hanzi: '过', pinyin: 'guò', meaningVi: 'qua, từng' }
    ]
  },
  {
    id: 'rad_饣',
    radical: '饣',
    pinyin: 'shí',
    meaningVi: 'thực (ăn uống, thực phẩm)',
    strokeCount: 3,
    examples: [
      { hanzi: '饭', pinyin: 'fàn', meaningVi: 'cơm' },
      { hanzi: '馆', pinyin: 'guǎn', meaningVi: 'quán ăn, khách sạn' }
    ]
  }
];

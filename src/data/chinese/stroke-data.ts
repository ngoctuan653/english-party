export interface HanziCharacterStrokeData {
  character: string;
  pinyin: string;
  meaningVi: string;
  strokeCount: number;
  strokes: string[]; // SVG path definition d attributes (1024x1024 coordinate system standard)
  radicals: string[];
}

export const CORE_STROKE_DATA: Record<string, HanziCharacterStrokeData> = {
  '一': {
    character: '一',
    pinyin: 'yī',
    meaningVi: 'một (1)',
    strokeCount: 1,
    radicals: ['一'],
    strokes: [
      'M 150 512 L 874 512' // Nét ngang (Héng)
    ]
  },
  '二': {
    character: '二',
    pinyin: 'èr',
    meaningVi: 'hai (2)',
    strokeCount: 2,
    radicals: ['一'],
    strokes: [
      'M 250 360 L 774 360', // Ngang ngắn trên
      'M 150 660 L 874 660'  // Ngang dài dưới
    ]
  },
  '三': {
    character: '三',
    pinyin: 'sān',
    meaningVi: 'ba (3)',
    strokeCount: 3,
    radicals: ['一'],
    strokes: [
      'M 230 280 L 794 280', // Ngang trên
      'M 290 512 L 734 512', // Ngang giữa ngắn
      'M 150 740 L 874 740'  // Ngang đáy dài
    ]
  },
  '十': {
    character: '十',
    pinyin: 'shí',
    meaningVi: 'mười (10)',
    strokeCount: 2,
    radicals: ['十'],
    strokes: [
      'M 160 512 L 864 512', // Ngang trước
      'M 512 180 L 512 844'  // Sổ sau
    ]
  },
  '人': {
    character: '人',
    pinyin: 'rén',
    meaningVi: 'người',
    strokeCount: 2,
    radicals: ['人'],
    strokes: [
      'M 512 180 Q 420 540 180 840', // Phẩy trước (Piě)
      'M 470 480 Q 640 680 844 840'  // Mác sau (Nà)
    ]
  },
  '大': {
    character: '大',
    pinyin: 'dà',
    meaningVi: 'to, lớn',
    strokeCount: 3,
    radicals: ['大'],
    strokes: [
      'M 180 380 L 844 380',         // Ngang
      'M 512 160 Q 400 580 180 860', // Phẩy
      'M 460 420 Q 650 680 844 860'  // Mác
    ]
  },
  '口': {
    character: '口',
    pinyin: 'kǒu',
    meaningVi: 'miệng',
    strokeCount: 3,
    radicals: ['口'],
    strokes: [
      'M 240 260 L 240 764',         // Sổ trái
      'M 240 260 L 784 260 L 784 764', // Ngang gập (Héng zhé)
      'M 240 764 L 784 764'          // Đóng đáy (Héng)
    ]
  },
  '日': {
    character: '日',
    pinyin: 'rì',
    meaningVi: 'mặt trời, ngày',
    strokeCount: 4,
    radicals: ['日'],
    strokes: [
      'M 260 220 L 260 804',
      'M 260 220 L 764 220 L 764 804',
      'M 260 512 L 764 512',
      'M 260 804 L 764 804'
    ]
  },
  '中': {
    character: '中',
    pinyin: 'zhōng',
    meaningVi: 'trung, ở giữa',
    strokeCount: 4,
    radicals: ['丨'],
    strokes: [
      'M 240 320 L 240 704',
      'M 240 320 L 784 320 L 784 704',
      'M 240 704 L 784 704',
      'M 512 150 L 512 874' // Sổ dài xuyên giữa
    ]
  }
};

export function getCharacterStrokeData(char: string): HanziCharacterStrokeData | null {
  return CORE_STROKE_DATA[char] || null;
}

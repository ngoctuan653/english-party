import type { ToneInfo, ToneSandhiRule, ToneExercise } from '@/types/chinese';

export const CHINESE_TONES: ToneInfo[] = [
  {
    tone: 1,
    name: 'Thanh 1 (Âm Bình)',
    chineseName: '第一声 (阴平)',
    symbol: '¯',
    pitch: '55',
    contourDescription: 'Cao và phẳng đều (5-5)',
    descriptionVi: 'Phát âm ở âm vực cao nhất của giọng, ngân dài đều, không lên không xuống, không ngắt hơi.',
    vietnameseComparison: 'Tương tự như đọc từ không dấu trong tiếng Việt nhưng giữ giọng cao và ngân đều phẳng.',
    color: '#EF4444', // Red
    bgLight: 'rgba(239, 68, 68, 0.1)',
    examples: [
      { pinyin: 'mā', hanzi: '妈', meaningVi: 'mẹ' },
      { pinyin: 'bā', hanzi: '八', meaningVi: 'tám' },
      { pinyin: 'tiān', hanzi: '天', meaningVi: 'trời, ngày' },
      { pinyin: 'shī', hanzi: '书', meaningVi: 'sách' }
    ]
  },
  {
    tone: 2,
    name: 'Thanh 2 (Dương Bình)',
    chineseName: '第二声 (阳平)',
    symbol: 'ˊ',
    pitch: '35',
    contourDescription: 'Vút lên từ trung bình lên cao (3-5)',
    descriptionVi: 'Bắt đầu từ âm vực trung bình rồi vuốt giọng thẳng lên cao như khi ngạc nhiên hỏi: "Hả?", "Gì cơ?".',
    vietnameseComparison: 'Gần giống dấu SẮC trong tiếng Việt nhưng kéo dài hơn và bắt đầu thấp hơn một chút.',
    color: '#F59E0B', // Amber / Orange
    bgLight: 'rgba(245, 158, 11, 0.1)',
    examples: [
      { pinyin: 'má', hanzi: '麻', meaningVi: 'vừng, cây gai' },
      { pinyin: 'rén', hanzi: '人', meaningVi: 'người' },
      { pinyin: 'lái', hanzi: '来', meaningVi: 'đến' },
      { pinyin: 'chá', hanzi: '茶', meaningVi: 'trà' }
    ]
  },
  {
    tone: 3,
    name: 'Thanh 3 (Thượng Thanh)',
    chineseName: '第三声 (上声)',
    symbol: 'ˇ',
    pitch: '214',
    contourDescription: 'Hạ thấp rồi lượn lên (2-1-4)',
    descriptionVi: 'Bắt đầu ở mức thấp vừa (2), hạ xuống đáy cổ họng (1) tạo độ trầm ngắt, sau đó vút ngược lên cao (4).',
    vietnameseComparison: 'Tương tự dấu HỎI kéo dài lượn sóng trong tiếng Việt (hạ trầm rồi hất nhẹ).',
    color: '#10B981', // Emerald / Green
    bgLight: 'rgba(16, 185, 129, 0.1)',
    examples: [
      { pinyin: 'mǎ', hanzi: '马', meaningVi: 'con ngựa' },
      { pinyin: 'nǐ', hanzi: '你', meaningVi: 'bạn, cậu' },
      { pinyin: 'hǎo', hanzi: '好', meaningVi: 'tốt, khỏe' },
      { pinyin: 'wǒ', hanzi: '我', meaningVi: 'tôi' }
    ]
  },
  {
    tone: 4,
    name: 'Thanh 4 (Khứ Thanh)',
    chineseName: '第四声 (去声)',
    symbol: 'ˋ',
    pitch: '51',
    contourDescription: 'Rơi thẳng dứt khoát từ đỉnh xuống đáy (5-1)',
    descriptionVi: 'Bắt đầu từ đỉnh âm vực cao nhất (5) giật rơi mạnh và dứt khoát xuống đáy thấp nhất (1). Tuyệt đối không ngân dài.',
    vietnameseComparison: 'Mạnh mẽ dứt khoát như lệnh bài hoặc dấu HUYỀN / NẶNG dứt khoát, nghe như tiếng quát dứt khoát.',
    color: '#3B82F6', // Blue
    bgLight: 'rgba(59, 130, 246, 0.1)',
    examples: [
      { pinyin: 'mà', hanzi: '骂', meaningVi: 'chửi mắng' },
      { pinyin: 'bàba', hanzi: '爸爸', meaningVi: 'bố' },
      { pinyin: 'shì', hanzi: '是', meaningVi: 'là' },
      { pinyin: 'kàn', hanzi: '看', meaningVi: 'xem, nhìn' }
    ]
  },
  {
    tone: 5,
    name: 'Thanh Nhẹ (Khinh Thanh)',
    chineseName: '轻声 (轻声)',
    symbol: '·',
    pitch: '--',
    contourDescription: 'Ngắn, nhẹ, phụ thuộc vào âm đứng trước',
    descriptionVi: 'Không đánh dấu thanh trong Pinyin. Phát âm cực ngắn, rơi êm và nhẹ tựa hạt sương.',
    vietnameseComparison: 'Phát âm lướt nhẹ, tương tự âm đuôi lướt trong tiếng Việt.',
    color: '#64748B', // Slate
    bgLight: 'rgba(100, 116, 139, 0.1)',
    examples: [
      { pinyin: 'ma', hanzi: '吗', meaningVi: 'trợ từ nghi vấn (...không?)' },
      { pinyin: 'ba', hanzi: '吧', meaningVi: 'trợ từ ngữ khí (...nhé, đi)' },
      { pinyin: 'de', hanzi: '的', meaningVi: 'của, trợ từ kết cấu' },
      { pinyin: 'le', hanzi: '了', meaningVi: 'rồi' }
    ]
  }
];

export const TONE_SANDHI_RULES: ToneSandhiRule[] = [
  {
    id: 'tone3_sandhi',
    title: 'Biến điệu của hai thanh 3 đi liền nhau (3 + 3 → 2 + 3)',
    chineseTitle: '两上声相连变调',
    rule: 'Khi hai âm mang thanh 3 đi liền nhau, âm thứ nhất đọc thành thanh 2, âm thứ hai giữ nguyên thanh 3.',
    explanationVi: 'Trong tiếng Trung, hai âm điệu trầm (2-1-4) nối tiếp nhau sẽ gây khó phát âm và chậm tốc độ. Do đó, người bản xứ tự động biến thanh 3 đầu tiên thành thanh 2 (3-5).',
    examples: [
      {
        originalPinyin: 'nǐ hǎo',
        spokenPinyin: 'ní hǎo',
        hanzi: '你好',
        meaningVi: 'Xin chào',
        note: 'Viết vẫn là nǐ hǎo, nhưng đọc là ní hǎo'
      },
      {
        originalPinyin: 'kě yǐ',
        spokenPinyin: 'ké yǐ',
        hanzi: '可以',
        meaningVi: 'Có thể',
        note: 'Đọc là ké yǐ'
      },
      {
        originalPinyin: 'shǒu biǎo',
        spokenPinyin: 'shóu biǎo',
        hanzi: '手表',
        meaningVi: 'Đồng hồ đeo tay'
      },
      {
        originalPinyin: 'hěn hǎo',
        spokenPinyin: 'hén hǎo',
        hanzi: '很好',
        meaningVi: 'Rất tốt'
      }
    ]
  },
  {
    id: 'bu_sandhi',
    title: 'Biến điệu của chữ 不 (bù)',
    chineseTitle: '“不”的变调',
    rule: 'Chữ 不 (bù) vốn mang thanh 4. Khi đứng trước một âm cũng mang thanh 4, 不 biến thành thanh 2 (bú). Đứng trước thanh 1, 2, 3 giữ nguyên thanh 4.',
    explanationVi: 'Hai thanh 4 đi liền nhau (rơi mạnh liên tục 5-1 + 5-1) gây giật giọng gắt gỏng, nên chữ 不 phía trước được chuyển thành thanh 2 (3-5) để vuốt nhịp êm ái.',
    examples: [
      {
        originalPinyin: 'bù shì',
        spokenPinyin: 'bú shì',
        hanzi: '不是',
        meaningVi: 'Không phải',
        note: 'Đứng trước thanh 4 shì → đọc bú shì'
      },
      {
        originalPinyin: 'bù duì',
        spokenPinyin: 'bú duì',
        hanzi: '不对',
        meaningVi: 'Không đúng',
        note: 'Đứng trước thanh 4 duì → đọc bú duì'
      },
      {
        originalPinyin: 'bù hē (thanh 1)',
        spokenPinyin: 'bù hē',
        hanzi: '不喝',
        meaningVi: 'Không uống',
        note: 'Đứng trước thanh 1 → giữ nguyên bù'
      },
      {
        originalPinyin: 'bù lái (thanh 2)',
        spokenPinyin: 'bù lái',
        hanzi: '不来',
        meaningVi: 'Không đến',
        note: 'Đứng trước thanh 2 → giữ nguyên bù'
      }
    ]
  },
  {
    id: 'yi_sandhi',
    title: 'Biến điệu của chữ 一 (yī)',
    chineseTitle: '“一”的变调',
    rule: 'Chữ 一 (yī) gốc mang thanh 1. Đứng trước thanh 4 biến thành thanh 2 (yí). Đứng trước thanh 1, 2, 3 biến thành thanh 4 (yì). Khi đếm số độc lập giữ nguyên thanh 1.',
    explanationVi: 'Chữ "Nhất" (一) là một trong những từ linh hoạt nhất: Đứng một mình đọc yī, đứng trước thanh 4 đọc yí, đứng trước các thanh còn lại đọc yì.',
    examples: [
      {
        originalPinyin: 'yī dìng',
        spokenPinyin: 'yí dìng',
        hanzi: '一定',
        meaningVi: 'Nhất định, chắc chắn',
        note: 'Trước thanh 4 dìng → đọc yí dìng'
      },
      {
        originalPinyin: 'yī kuài',
        spokenPinyin: 'yí kuài',
        hanzi: '一块',
        meaningVi: 'Cùng nhau / Một tệ',
        note: 'Trước thanh 4 kuài → đọc yí kuài'
      },
      {
        originalPinyin: 'yī tiān',
        spokenPinyin: 'yì tiān',
        hanzi: '一天',
        meaningVi: 'Một ngày',
        note: 'Trước thanh 1 tiān → biến thành thanh 4: yì tiān'
      },
      {
        originalPinyin: 'yī nián',
        spokenPinyin: 'yì nián',
        hanzi: '一年',
        meaningVi: 'Một năm',
        note: 'Trước thanh 2 nián → biến thành thanh 4: yì nián'
      }
    ]
  }
];

export const TONE_EXERCISES: ToneExercise[] = [
  {
    id: 'tone_ex_1',
    type: 'identify_tone',
    question: 'Nghe âm tiết sau và xác định đây là thanh điệu mấy:',
    audioPromptText: 'mā',
    options: [
      { id: '1', text: 'Thanh 1 (mā - Cao phẳng)', isCorrect: true },
      { id: '2', text: 'Thanh 2 (má - Đi lên)', isCorrect: false },
      { id: '3', text: 'Thanh 3 (mǎ - Trầm uốn lượn)', isCorrect: false },
      { id: '4', text: 'Thanh 4 (mà - Dứt khoát đi xuống)', isCorrect: false }
    ],
    explanation: 'mā là thanh 1: âm thanh giữ đều ở cao độ 5-5 và ngân phẳng.',
    difficulty: 'easy'
  },
  {
    id: 'tone_ex_2',
    type: 'identify_tone',
    question: 'Nghe âm tiết sau và xác định đây là thanh điệu mấy:',
    audioPromptText: 'mǎ',
    options: [
      { id: '1', text: 'Thanh 1 (mā)', isCorrect: false },
      { id: '2', text: 'Thanh 2 (má)', isCorrect: false },
      { id: '3', text: 'Thanh 3 (mǎ - Uốn lượn trầm)', isCorrect: true },
      { id: '4', text: 'Thanh 4 (mà)', isCorrect: false }
    ],
    explanation: 'mǎ là thanh 3: âm đi từ trung bình hạ xuống đáy rồi hơi vút lên.',
    difficulty: 'easy'
  },
  {
    id: 'tone_ex_3',
    type: 'identify_tone',
    question: 'Nghe âm tiết sau và chọn đáp án chính xác:',
    audioPromptText: 'kàn',
    options: [
      { id: '1', text: 'Thanh 1 (kān)', isCorrect: false },
      { id: '2', text: 'Thanh 2 (kán)', isCorrect: false },
      { id: '3', text: 'Thanh 3 (kǎn)', isCorrect: false },
      { id: '4', text: 'Thanh 4 (kàn - Rơi dứt khoát)', isCorrect: true }
    ],
    explanation: 'kàn (xem/nhìn) mang thanh 4: âm thanh rơi nhanh từ cao nhất xuống thấp nhất một cách dứt khoát.',
    difficulty: 'easy'
  },
  {
    id: 'tone_ex_4',
    type: 'tone_sandhi',
    question: 'Cụm từ "你好" (nǐ + hǎo: hai thanh 3 đi liền nhau) sẽ được phát âm thực tế như thế nào?',
    audioPromptText: 'ní hǎo',
    options: [
      { id: 'a', text: 'nǐ hǎo (giữ nguyên hai thanh 3)', isCorrect: false },
      { id: 'b', text: 'ní hǎo (âm đầu biến thành thanh 2)', isCorrect: true },
      { id: 'c', text: 'nì hào (cả hai chuyển thành thanh 4)', isCorrect: false },
      { id: 'd', text: 'nī hǎo (âm đầu biến thành thanh 1)', isCorrect: false }
    ],
    explanation: 'Quy tắc biến điệu thanh 3: Khi hai thanh 3 đi cùng nhau, âm thứ nhất biến thành thanh 2 (ní hǎo).',
    difficulty: 'medium'
  },
  {
    id: 'tone_ex_5',
    type: 'tone_sandhi',
    question: 'Trong câu "不是" (bù + shì), chữ 不 (bù - thanh 4) đứng trước chữ 是 (shì - thanh 4) sẽ đọc là gì?',
    audioPromptText: 'bú shì',
    options: [
      { id: 'a', text: 'bù shì (giữ nguyên thanh 4)', isCorrect: false },
      { id: 'b', text: 'bú shì (bù chuyển thành thanh 2: bú)', isCorrect: true },
      { id: 'c', text: 'bū shì (chuyển thành thanh 1: bū)', isCorrect: false },
      { id: 'd', text: 'bǔ shì (chuyển thành thanh 3: bǔ)', isCorrect: false }
    ],
    explanation: 'Quy tắc chữ 不: Đứng trước một thanh 4 khác, chữ 不 (bù) bắt buộc chuyển thành thanh 2 (bú).',
    difficulty: 'medium'
  },
  {
    id: 'tone_ex_6',
    type: 'minimal_pair',
    question: 'Phân biệt cặp từ: Âm nào mang thanh 2 (vút lên như dấu sắc)?',
    audioPromptText: 'má',
    options: [
      { id: '1', text: 'mā (Thanh 1 - Mẹ)', isCorrect: false },
      { id: '2', text: 'má (Thanh 2 - Cây gai/vừng)', isCorrect: true },
      { id: '3', text: 'mà (Thanh 4 - Chửi mắng)', isCorrect: false }
    ],
    explanation: 'má mang thanh 2, âm vút lên tự nhiên từ 3 lên 5.',
    difficulty: 'medium'
  }
];

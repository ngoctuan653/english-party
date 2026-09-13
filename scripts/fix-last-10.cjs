const fs = require('fs');

const { getGeminiApiKey } = require('./get-api-key.cjs');
const key = getGeminiApiKey();
const bankPath = 'src/data/generated/toeic-reading-questions.json';

const targetIds = [
  'toeic_2026_t03_p7_q148',
  'toeic_2026_t04_p7_q156',
  'toeic_2026_t04_p7_q157',
  'toeic_2026_t04_p7_q158',
  'toeic_2026_t04_p7_q159',
  'toeic_2026_t04_p7_q160',
  'toeic_2026_t04_p7_q161',
  'toeic_2026_t04_p7_q162',
  'toeic_2026_t04_p7_q163',
  'toeic_2026_t08_p7_q152'
];

async function fixOneByOne() {
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

  for (const id of targetIds) {
    const q = bank.find((item) => item.id === id);
    if (!q) continue;

    console.log(`Fixing ${id}...`);
    const prompt = `Bạn là giáo viên TOEIC. Viết giải thích cho câu hỏi sau:
Câu hỏi: ${q.question}
Đáp án đúng: ${q.choices[q.correctAnswer]}
Đoạn văn tóm tắt: ${q.context ? q.context.slice(0, 400) : 'None'}

Quy tắc bắt buộc:
1. Dẫn chứng: Trích câu tiếng Anh trong bài.
2. Giải thích: Giải thích chi tiết bằng tiếng Việt 100%.
3. Dịch nghĩa: Dịch câu hỏi và đáp án sang tiếng Việt.
TUYỆT ĐỐI KHÔNG DÙNG TIẾNG TRUNG.

Trả về duy nhất 1 dòng dạng:
Dẫn chứng: "[câu tiếng Anh]" | Giải thích: [tiếng Việt] | Dịch nghĩa: [tiếng Việt]`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        q.explanation = text.replace(/[\u4e00-\u9fa5]/g, '').trim();
        console.log(`  ✓ ${id}: ${q.explanation.slice(0, 80)}...`);
      }
    } catch (e) {
      console.error(`  ✗ ${id}:`, e.message);
    }
  }

  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
  console.log('Done!');
}

fixOneByOne();

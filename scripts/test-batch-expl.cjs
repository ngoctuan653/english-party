const fs = require('fs');

const { getGeminiApiKey } = require('./get-api-key.cjs');
const key = getGeminiApiKey();

const models = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];
let currentModelIndex = 0;

async function testBatch() {
  const bank = JSON.parse(fs.readFileSync('src/data/generated/toeic-reading-questions.json', 'utf8'));
  const targets = bank.filter(q => /[\u4e00-\u9fa5]/.test(q.explanation || '')).slice(0, 3);

  const prompt = `Bạn là chuyên gia luyện thi TOEIC hàng đầu Việt Nam. Hãy viết phần giải thích chi tiết cho từng câu hỏi sau.
QUY TẮC BẮT BUỘC:
1. Dẫn chứng: Trích dẫn chính xác câu văn tiếng Anh trong bài (hoặc trong câu hỏi) làm bằng chứng trực tiếp cho đáp án đúng.
2. Giải thích: Giải thích logic, từ vựng hoặc ngữ pháp chi tiết bằng TIẾNG VIỆT 100%. Nêu rõ vì sao đáp án đúng và vì sao các đáp án khác sai.
3. Dịch nghĩa: Dịch câu hỏi và đáp án đúng (kèm câu dẫn chứng) sang TIẾNG VIỆT.
4. TUYỆT ĐỐI KHÔNG CÓ BẤT KỲ KÝ TỰ TIẾNG TRUNG NÀO.

Trả về JSON array gồm các object có cấu trúc:
[
  {
    "id": "id của câu hỏi",
    "explanation": "Dẫn chứng: \\"[Trích dẫn tiếng Anh]\\\" | Giải thích: [Lời giải thích tiếng Việt] | Dịch nghĩa: [Bản dịch tiếng Việt]"
  }
]

Danh sách câu hỏi:
${JSON.stringify(targets.map(q => ({
  id: q.id,
  context: q.context ? q.context.slice(0, 500) : undefined,
  question: q.question,
  choices: q.choices,
  correctAnswer: q.correctAnswer,
  correctChoiceText: q.choices[q.correctAnswer]
})), null, 2)}
`;

  const model = models[0];
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('Batch result:');
  console.log(text);
}

testBatch();

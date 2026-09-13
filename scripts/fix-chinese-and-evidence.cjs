const fs = require('fs');
const path = require('path');

const { getGeminiApiKey } = require('./get-api-key.cjs');
const key = getGeminiApiKey();
const bankPath = path.resolve(__dirname, '../src/data/generated/toeic-reading-questions.json');

const models = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const chineseRegex = /[\u4e00-\u9fa5]/;
const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

async function callGeminiBatch(questions, workerId) {
  const prompt = `Bạn là chuyên gia luyện thi TOEIC hàng đầu Việt Nam. Hãy viết phần giải thích chi tiết cho từng câu hỏi sau.
QUY TẮC BẮT BUỘC:
1. Dẫn chứng: Trích dẫn chính xác câu văn tiếng Anh trong bài (hoặc cấu trúc/từ vựng tiếng Anh trong câu) làm bằng chứng trực tiếp cho đáp án đúng.
2. Giải thích: Giải thích logic chi tiết bằng TIẾNG VIỆT 100%. Nêu rõ vì sao đáp án đúng và vì sao các đáp án khác sai.
3. Dịch nghĩa: Dịch câu hỏi và đáp án đúng (kèm câu dẫn chứng) sang TIẾNG VIỆT.
4. TUYỆT ĐỐI KHÔNG CÓ BẤT KỲ KÝ TỰ TIẾNG TRUNG NÀO. CHỈ TIẾNG ANH (DẪN CHỨNG) VÀ TIẾNG VIỆT.

Trả về JSON array gồm các object có cấu trúc:
[
  {
    "id": "id của câu hỏi",
    "explanation": "Dẫn chứng: \\"[Trích dẫn tiếng Anh]\\\" | Giải thích: [Lời giải thích tiếng Việt] | Dịch nghĩa: [Bản dịch tiếng Việt]"
  }
]

Danh sách câu hỏi:
${JSON.stringify(
  questions.map((q) => ({
    id: q.id,
    part: q.part,
    context: q.context ? q.context.slice(0, 1000) : undefined,
    question: q.question,
    choices: q.choices,
    correctAnswer: q.correctAnswer,
    correctChoiceText: q.choices[q.correctAnswer],
  })),
  null,
  2
)}
`;

  let modelIdx = workerId % models.length;

  for (let attempt = 0; attempt < 8; attempt++) {
    const model = models[modelIdx];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (res.status === 429 || res.status === 503) {
        modelIdx = (modelIdx + 1) % models.length;
        await sleep(1500);
        continue;
      }

      if (!res.ok) {
        modelIdx = (modelIdx + 1) % models.length;
        await sleep(1200);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        modelIdx = (modelIdx + 1) % models.length;
        await sleep(1000);
        continue;
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        const arr = Object.values(parsed).find((v) => Array.isArray(v));
        if (arr) return arr;
        return [parsed];
      }
    } catch (err) {
      modelIdx = (modelIdx + 1) % models.length;
      await sleep(1200);
    }
  }

  throw new Error('Failed to generate after retries');
}

async function main() {
  console.log('Loading question bank...');
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

  // First, identify all questions with Chinese OR no Vietnamese
  const priorityQuestions = bank.filter((q) => {
    const expl = q.explanation || '';
    return chineseRegex.test(expl) || !vietnameseRegex.test(expl);
  });

  // Sort: Chinese first, then no Vietnamese
  priorityQuestions.sort((a, b) => {
    const aChinese = chineseRegex.test(a.explanation || '');
    const bChinese = chineseRegex.test(b.explanation || '');
    if (aChinese && !bChinese) return -1;
    if (!aChinese && bChinese) return 1;
    return 0;
  });

  console.log(`Priority targets: ${priorityQuestions.length} questions (Chinese: ${priorityQuestions.filter(q => chineseRegex.test(q.explanation || '')).length})`);

  const BATCH_SIZE = 8;
  const batches = [];
  for (let i = 0; i < priorityQuestions.length; i += BATCH_SIZE) {
    batches.push(priorityQuestions.slice(i, i + BATCH_SIZE));
  }

  console.log(`Total batches: ${batches.length}`);

  let activeBatchIdx = 0;
  let successCount = 0;
  const CONCURRENCY = 3;

  async function worker(workerId) {
    while (activeBatchIdx < batches.length) {
      const currentIdx = activeBatchIdx++;
      const batch = batches[currentIdx];
      console.log(`[Worker ${workerId}] Starting batch ${currentIdx + 1}/${batches.length} (${batch.length} Qs)...`);

      try {
        const results = await callGeminiBatch(batch, workerId);
        for (const res of results) {
          if (!res.id || !res.explanation) continue;
          const target = bank.find((q) => q.id === res.id);
          if (target) {
            // Strip any remaining Chinese characters
            target.explanation = res.explanation.replace(/[\u4e00-\u9fa5]/g, '').trim();
            successCount++;
          }
        }
        // Save immediately
        fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
        console.log(`[Worker ${workerId}] ✓ Batch ${currentIdx + 1} completed & saved! Total updated: ${successCount}`);
      } catch (err) {
        console.error(`[Worker ${workerId}] ✗ Batch ${currentIdx + 1} failed:`, err.message);
      }

      await sleep(1000);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));

  // Sanitize all remaining explanations in bank just in case
  let residualCleaned = 0;
  for (const q of bank) {
    if (chineseRegex.test(q.explanation || '')) {
      q.explanation = q.explanation.replace(/[\u4e00-\u9fa5]/g, '').trim();
      residualCleaned++;
    }
  }
  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
  console.log(`ALL DONE! Updated: ${successCount}. Residual cleaned: ${residualCleaned}`);
}

main().catch(console.error);

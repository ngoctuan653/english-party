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
let currentModelIndex = 0;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const chineseRegex = /[\u4e00-\u9fa5]/;
const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

async function callGeminiBatch(questions) {
  const prompt = `Bạn là chuyên gia luyện thi TOEIC hàng đầu Việt Nam. Hãy viết phần giải thích chi tiết cho từng câu hỏi sau.
QUY TẮC BẮT BUỘC:
1. Dẫn chứng: Trích dẫn chính xác câu văn tiếng Anh trong bài (hoặc cấu trúc ngữ pháp/từ vựng tiếng Anh trong câu) làm bằng chứng trực tiếp cho đáp án đúng.
2. Giải thích: Giải thích logic chi tiết bằng TIẾNG VIỆT 100%. Nêu rõ vì sao đáp án đúng và vì sao các đáp án khác sai.
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

  for (let attempt = 0; attempt < 10; attempt++) {
    const model = models[currentModelIndex];
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
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1500);
        continue;
      }

      if (!res.ok) {
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1500);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        currentModelIndex = (currentModelIndex + 1) % models.length;
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
      currentModelIndex = (currentModelIndex + 1) % models.length;
      await sleep(1200);
    }
  }

  throw new Error('Failed to generate after retries');
}

async function main() {
  console.log('Loading question bank...');
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

  const needsFix = bank.filter((q) => {
    const expl = q.explanation || '';
    return chineseRegex.test(expl) || !vietnameseRegex.test(expl) || !expl.toLowerCase().includes('dẫn chứng:');
  });

  console.log(`Total questions needing explanation fix: ${needsFix.length} / ${bank.length}`);

  const BATCH_SIZE = 8;
  const totalBatches = Math.ceil(needsFix.length / BATCH_SIZE);

  let successCount = 0;
  for (let i = 0; i < needsFix.length; i += BATCH_SIZE) {
    const batch = needsFix.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`[Batch ${batchIndex}/${totalBatches}] Processing ${batch.length} questions... (${batch.map((q) => q.id).join(', ')})`);

    try {
      const results = await callGeminiBatch(batch);
      for (const res of results) {
        if (!res.id || !res.explanation) continue;
        const target = bank.find((q) => q.id === res.id);
        if (target) {
          // Extra strip of any accidental Chinese characters
          const cleanExpl = res.explanation.replace(/[\u4e00-\u9fa5]/g, '').trim();
          target.explanation = cleanExpl;
          successCount++;
        }
      }

      // Checkpoint save every batch
      fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
      console.log(`  ✓ Batch ${batchIndex} saved. Total updated so far: ${successCount}`);
    } catch (err) {
      console.error(`  ✗ Batch ${batchIndex} failed:`, err.message);
      // Wait a bit before next attempt
      await sleep(2000);
    }

    // Rate limit throttle
    await sleep(800);
  }

  // Final sanity check: strip ANY remaining Chinese characters from any explanation in the entire bank
  let finalChineseCount = 0;
  for (const q of bank) {
    if (chineseRegex.test(q.explanation || '')) {
      q.explanation = q.explanation.replace(/[\u4e00-\u9fa5]/g, '').trim();
      finalChineseCount++;
    }
  }

  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
  console.log(`Finished! Total explanations updated: ${successCount}. Cleaned residual Chinese: ${finalChineseCount}.`);
}

main().catch(console.error);

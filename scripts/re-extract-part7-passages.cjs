const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const { getGeminiApiKey } = require('./get-api-key.cjs');
const key = getGeminiApiKey();
const bankPath = path.resolve(__dirname, '../src/data/generated/toeic-reading-questions.json');
const backupPath = path.resolve(__dirname, '../src/data/generated/toeic-reading-questions.backup.json');
const pdfPath = 'D:\\READING 2026.pdf';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const models = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];
let currentModelIndex = 0;

async function callGeminiRotating(prompt, base64Pdf) {
  const maxAttempts = models.length * 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const model = models[currentModelIndex];
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'application/pdf', data: base64Pdf } }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (res.status === 429) {
        console.warn(`[${model} 429 Rate Limit] Rotating to next model...`);
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(2000);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[${model} HTTP ${res.status}] ${errText.substring(0, 100)} Rotating...`);
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1500);
        continue;
      }

      const data = await res.json();
      const cand = data.candidates?.[0];
      const text = cand?.content?.parts?.[0]?.text;
      if (!text) {
        console.warn(`[${model} Empty content] Rotating...`);
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1000);
        continue;
      }

      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      console.warn(`[${model} Exception: ${err.message}] Rotating...`);
      currentModelIndex = (currentModelIndex + 1) % models.length;
      await sleep(1500);
    }
  }
  throw new Error('All rotating models exhausted attempts.');
}

async function run() {
  const args = process.argv.slice(2);
  let targetTests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const testFlagIdx = args.indexOf('--test');
  if (testFlagIdx !== -1 && args[testFlagIdx + 1]) {
    const val = args[testFlagIdx + 1];
    if (val !== 'all') {
      targetTests = [parseInt(val, 10)];
    }
  }

  const fromIdx = args.indexOf('--from');
  const toIdx = args.indexOf('--to');
  if (fromIdx !== -1 && toIdx !== -1) {
    const from = parseInt(args[fromIdx + 1], 10);
    const to = parseInt(args[toIdx + 1], 10);
    targetTests = [];
    for (let i = from; i <= to; i++) targetTests.push(i);
  }

  console.log(`Starting Part 7 visual re-extraction for tests:`, targetTests);

  if (!fs.existsSync(bankPath)) {
    console.error('Bank file not found:', bankPath);
    return;
  }

  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  console.log(`Loaded ${bank.length} questions from bank.`);

  // Create backup if not exists
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(bank, null, 2));
    console.log(`Created backup at: ${backupPath}`);
  }

  console.log('Loading PDF...');
  const pdfBytes = fs.readFileSync(pdfPath);
  const masterDoc = await PDFDocument.load(pdfBytes);
  console.log(`PDF loaded. Total pages: ${masterDoc.getPageCount()}`);

  for (const t of targetTests) {
    const testTag = `test-${String(t).padStart(2, '0')}`;
    const base = (t - 1) * 30 + 1;

    console.log(`\n========================================`);
    console.log(`Re-extracting Part 7 for TEST ${t} (${testTag}) - Base page: ${base}`);
    console.log(`========================================`);

    const slices = [
      { name: 'Slice 1 (Q147-160)', pages: [base + 7, base + 8, base + 9, base + 10, base + 11], range: [147, 160] },
      { name: 'Slice 2 (Q161-175)', pages: [base + 12, base + 13, base + 14, base + 15, base + 16], range: [161, 175] },
      { name: 'Slice 3 (Q176-185)', pages: [base + 17, base + 18, base + 19, base + 20, base + 21, base + 22], range: [176, 185] },
      { name: 'Slice 4 (Q186-200)', pages: [base + 23, base + 24, base + 25, base + 26, base + 27], range: [186, 200] },
    ];

    for (const slice of slices) {
      console.log(`\nProcessing ${slice.name} on pages ${slice.pages[0]}..${slice.pages[slice.pages.length - 1]}...`);

      try {
        const subDoc = await PDFDocument.create();
        const copied = await subDoc.copyPages(masterDoc, slice.pages);
        copied.forEach((p) => subDoc.addPage(p));
        const sliceBytes = await subDoc.save();
        const base64Pdf = Buffer.from(sliceBytes).toString('base64');

        const prompt = `Extract all reading comprehension passages from these ${slice.pages.length} PDF pages for TOEIC Part 7 (covering Questions ${slice.range[0]} to ${slice.range[1]}).
CRITICAL RULES FOR VISUAL & STRUCTURED CONTENT:
- NEVER omit tables, forms, surveys, schedules, invoices, menus, or checklists.
- Convert every table, survey, or form into a clean Markdown table with clear column headers.
- Indicate circled, checked, or selected items using (4), (NP), [✓], or ⊙ (e.g. Living room | 5 | (4) | 3 | 2 | 1 | NP).
- Preserve all titles, headers, customer names, dates, addresses, and instructions.
- ONLY include the reading passage material in the "passage" field (do NOT include question text or choices in the "passage" field).
- In "questionNumbers", list all question numbers that refer to this passage (e.g. [147, 148]).

Return a JSON array:
[
  {
    "passageTitle": "...",
    "passage": "Full passage text with all markdown tables and headers",
    "questionNumbers": [147, 148]
  }
]`;

        const passages = await callGeminiRotating(prompt, base64Pdf);
        console.log(`Extracted ${passages.length} passages for ${slice.name}.`);

        let updatedCount = 0;
        for (const p of passages) {
          if (!p.questionNumbers || !Array.isArray(p.questionNumbers)) continue;
          const passageText = p.passage?.trim() || '';
          if (!passageText) continue;

          for (const qNum of p.questionNumbers) {
            const qId = `toeic_2026_t${String(t).padStart(2, '0')}_p7_q${qNum}`;
            const targetQ = bank.find((q) => q.id === qId);
            if (targetQ) {
              targetQ.context = passageText;
              updatedCount++;
            }
          }
        }

        console.log(`Updated context for ${updatedCount} questions in ${slice.name}.`);
        fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
        console.log(`Saved bank to ${bankPath}`);
      } catch (err) {
        console.error(`Error in ${slice.name}:`, err.message);
      }

      await sleep(1500);
    }
  }

  console.log(`\n========================================`);
  console.log(`RE-EXTRACTION FINISHED! Bank updated at: ${bankPath}`);
  console.log(`========================================`);
}

run().catch(console.error);

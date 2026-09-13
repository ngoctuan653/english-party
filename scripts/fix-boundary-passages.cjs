const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const { getGeminiApiKey } = require('./get-api-key.cjs');
const key = getGeminiApiKey();
const bankPath = path.resolve(__dirname, '../src/data/generated/toeic-reading-questions.json');
const pdfPath = 'D:\\READING 2026.pdf';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const models = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];
let currentModelIndex = 0;

async function callGemini(prompt, base64Pdf) {
  const maxAttempts = models.length * 2;
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
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.status === 429 || res.status === 503) {
        console.warn(`[${model} ${res.status}] Rotating to next model...`);
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1500);
        continue;
      }

      if (!res.ok) {
        console.warn(`[${model} HTTP ${res.status}] Rotating...`);
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1500);
        continue;
      }

      const data = await res.json();
      const cand = data.candidates?.[0];
      const text = cand?.content?.parts?.[0]?.text;
      if (!text) {
        currentModelIndex = (currentModelIndex + 1) % models.length;
        await sleep(1000);
        continue;
      }

      return JSON.parse(text);
    } catch (err) {
      console.warn(`[${model} Error: ${err.message}] Rotating...`);
      currentModelIndex = (currentModelIndex + 1) % models.length;
      await sleep(1500);
    }
  }
  throw new Error('All models exhausted.');
}

async function fixAll() {
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  console.log(`Loaded ${bank.length} questions from bank.`);

  // 1. Manually update Test 10 Q158-160 from exact user image
  const test10Letter = `Priscilla Yamaguchi  
Falkenweg 19  
10719 Berlin  

23 March  

Dear Ms. Yamaguchi,

I am writing to you to share the exciting news that Aqua Voyage Cruise Lines will be expanding its fleet next July. As part of our plan, we would welcome the opportunity to form a partnership with you.

You have established a solid reputation regarding your restaurant chain, Saffron Moon. Your commitment to offering your customers across Europe unique and delicious menu items aligns with our vision for providing cruise-ship passengers with distinct restaurant options.

There are several benefits of entering into a partnership with us. Since our cruise excursions attract a diverse group of people, an even more extensive group will become familiar with your restaurant chain. Aqua Voyage Cruise Lines will mention your top-rated chain in our brochures and feature it on our Web site. Through our network of suppliers, we can help negotiate exceptionally low rates for recipe ingredients and restaurant equipment, thereby reducing your expenses.

If you are interested in pursuing this proposition and wish to discuss the details, you can reach me at kbasrawi@aquavoyagecruiselines.de or by phone at 30-23125 032.

Sincerely,  
*Khalid Basrawi*  
Khalid Basrawi, Vice President of Corporate Development  
Aqua Voyage Cruise Lines`;

  ['toeic_2026_t10_p7_q158', 'toeic_2026_t10_p7_q159', 'toeic_2026_t10_p7_q160'].forEach((id) => {
    const q = bank.find((item) => item.id === id);
    if (q) {
      q.context = test10Letter;
      console.log(`Updated ${id} with exact letter text.`);
    }
  });

  // 2. Identify remaining pages to re-extract
  const boundaryTasks = [
    { test: 2, page: 31 + 12, qNums: [158, 159, 160] },
    { test: 3, page: 61 + 12, qNums: [158, 159, 160] },
    { test: 5, page: 121 + 12, qNums: [158, 159, 160] },
    { test: 6, page: 151 + 23, qNums: [186, 187, 188] },
    { test: 7, page: 181 + 12, qNums: [158, 159, 160] },
    { test: 8, page: 211 + 12, qNums: [158, 159, 160] },
    { test: 9, page: 241 + 11, qNums: [159, 160] },
    { test: 9, page: 241 + 16, qNums: [172, 173, 174, 175] },
  ];

  const pdfBytes = fs.readFileSync(pdfPath);
  const masterDoc = await PDFDocument.load(pdfBytes);

  for (const task of boundaryTasks) {
    const testTag = `test-${String(task.test).padStart(2, '0')}`;
    console.log(`\nRe-extracting page ${task.page} for ${testTag} (Q${task.qNums.join(', ')})...`);

    try {
      const subDoc = await PDFDocument.create();
      const copied = await subDoc.copyPages(masterDoc, [task.page]);
      subDoc.addPage(copied[0]);
      const bytes = await subDoc.save();
      const base64 = Buffer.from(bytes).toString('base64');

      const prompt = `Extract the complete reading passage/document from this PDF page for TOEIC Part 7.
CRITICAL RULES FOR COMPLETENESS:
- Extract the ENTIRE document from top to bottom.
- If it is a LETTER or MEMO or EMAIL: include all recipient names, addresses, dates, salutations ("Dear ..."), closing ("Sincerely,", "Best regards,"), signatures, sender names, and job titles. DO NOT OMIT ANY TOP OR BOTTOM PORTION.
- If there is a table or form: convert it into a clean Markdown table with headers and circled options like (4), (NP), [✓].
- ONLY return the reading document text in the "passage" field.

Return JSON:
{
  "passage": "Complete reading document text with all headers, body, and footers/signatures"
}`;

      const res = await callGemini(prompt, base64);
      const fullPassage = res.passage?.trim();
      if (fullPassage && fullPassage.length > 50) {
        task.qNums.forEach((qNum) => {
          const id = `toeic_2026_t${String(task.test).padStart(2, '0')}_p7_q${qNum}`;
          const q = bank.find((item) => item.id === id);
          if (q) {
            q.context = fullPassage;
            console.log(`Updated ${id} with complete document (len: ${fullPassage.length})`);
          } else {
            console.warn(`Could not find question ${id} in bank!`);
          }
        });
      }
    } catch (e) {
      console.error(`Error on test ${task.test} page ${task.page}:`, e.message);
    }
    await sleep(1000);
  }

  fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
  console.log(`\nAll boundary passages updated and saved to ${bankPath}!`);
}

fixAll().catch(console.error);

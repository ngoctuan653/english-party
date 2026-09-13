const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function extractAnswers() {
  const scratchDir = 'C:\\Users\\aduha\\.gemini\\antigravity-ide\\brain\\c820ee93-f8b6-496f-8a43-ec17042501c5\\scratch';
  const endPdfBytes = fs.readFileSync(path.join(scratchDir, 'sample_end.pdf'));
  const doc = await PDFDocument.load(endPdfBytes);
  
  // pages 7, 8, 9 of sample_end (which are 0-indexed: 7, 8, 9 -> pages 8, 9, 10)
  const ansDoc = await PDFDocument.create();
  const pages = await ansDoc.copyPages(doc, [7, 8, 9]);
  pages.forEach(p => ansDoc.addPage(p));
  const ansBytes = await ansDoc.save();
  const base64Pdf = Buffer.from(ansBytes).toString('base64');

  const { getGeminiApiKey } = require('./get-api-key.cjs');
  const key = getGeminiApiKey();
  const prompt = `Extract all answer keys for TEST 1 through TEST 10 from these 3 pages.
Each test contains exactly 100 questions from 101 to 200.
Return a valid JSON object strictly formatted as:
{
  "TEST_1": { "101": "B", "102": "A", ..., "200": "A" },
  "TEST_2": { "101": "C", ... },
  ...
  "TEST_10": { "101": "A", ... }
}`;

  console.log('Sending answer keys to Gemini 3.6 Flash...');
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + key, {
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
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) {
    const parsed = JSON.parse(text);
    fs.writeFileSync(path.join(scratchDir, 'answers_test_1_10.json'), JSON.stringify(parsed, null, 2));
    console.log('Successfully saved answers! Tests found:', Object.keys(parsed));
    for (const t of Object.keys(parsed)) {
      console.log(`${t}: ${Object.keys(parsed[t]).length} answers`);
    }
  } else {
    console.error('Gemini error:', JSON.stringify(data));
  }
}
extractAnswers().catch(console.error);

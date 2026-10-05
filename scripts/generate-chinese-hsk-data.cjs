/**
 * Batch Data Generation Script for Chinese HSK Vocabulary & Grammar using Gemini API
 * Run: node scripts/generate-chinese-hsk-data.cjs --level hsk1 --count 50
 */

const fs = require('fs');
const path = require('path');
const { getGeminiApiKey } = require('./get-api-key.cjs');

const apiKey = getGeminiApiKey();
if (!apiKey) {
  console.error('❌ Error: VITE_GEMINI_API_KEY or GEMINI_API_KEY is not set.');
  process.exit(1);
}

const args = process.argv.slice(2);
const levelArg = args.find((a, i) => args[i - 1] === '--level') || 'hsk1';
const countArg = parseInt(args.find((a, i) => args[i - 1] === '--count') || '30', 10);

console.log(`🚀 Starting batch generation for ${levelArg.toUpperCase()} (${countArg} items)...`);

async function generateBatch() {
  const prompt = `You are a professional Chinese language teacher and linguist.
Generate a JSON array of exactly ${countArg} high-frequency Chinese vocabulary words strictly for ${levelArg.toUpperCase()} according to the official HSK curriculum.
Format the output as a valid JSON array only, without markdown wrapping or text before/after.
Each object must follow this exact schema:
{
  "id": "${levelArg}_<index>",
  "hanzi": "string",
  "pinyin": "string with tone marks like wǒ, hǎo, xuéxí",
  "meaningVi": "clear concise Vietnamese translation",
  "meaningEn": "English definition",
  "hskLevel": "${levelArg}",
  "partOfSpeech": "noun | verb | adjective | pronoun | adverb | preposition | conjunction | particle",
  "strokeCount": number,
  "radicals": ["radical1", "radical2"],
  "examples": [
    {
      "hanzi": "Chinese example sentence using the word",
      "pinyin": "pinyin with tone marks",
      "meaningVi": "Vietnamese translation of the example sentence"
    }
  ]
}

Return ONLY the raw JSON array.`;

  try {
  const models = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash'
  ];

  let parsed = null;

  for (const model of models) {
    try {
      console.log(`📡 Trying model ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`⚠️ Model ${model} returned ${response.status}: ${errText.slice(0, 100)}...`);
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      const cleaned = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✨ Success with model ${model}!`);
        break;
      }
    } catch (err) {
      console.warn(`⚠️ Error with ${model}:`, err.message);
    }
  }

  if (!parsed) {
    console.error('❌ All models failed or busy.');
    return;
  }

    console.log(`✅ Successfully generated ${parsed.length} vocabulary words for ${levelArg}!`);

    const outPath = path.resolve(__dirname, `../src/data/chinese/generated-${levelArg}.json`);
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf-8');
    console.log(`💾 Saved to: ${outPath}`);
  } catch (error) {
    console.error('❌ Generation error:', error);
  }
}

generateBatch();

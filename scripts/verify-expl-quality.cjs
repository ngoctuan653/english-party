const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/generated/toeic-reading-questions.json', 'utf8'));
const chineseRegex = /[\u4e00-\u9fa5]/;
const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

let chinese = 0;
let hasVi = 0;
let hasEvidence = 0;

data.forEach((q) => {
  const expl = q.explanation || '';
  if (chineseRegex.test(expl)) chinese++;
  if (vietnameseRegex.test(expl)) hasVi++;
  if (expl.toLowerCase().includes('dẫn chứng:')) hasEvidence++;
});

console.log('Total questions:', data.length);
console.log('Questions with Chinese characters:', chinese);
console.log('Questions with Vietnamese explanation:', hasVi);
console.log('Questions with explicit "Dẫn chứng:":', hasEvidence);

console.log('\n--- SAMPLE TEST 07 Q148 (From user screenshot) ---');
const q148 = data.find((q) => q.id === 'toeic_2026_t07_p7_q148');
console.log(q148 ? q148.explanation : 'not found');

console.log('\n--- SAMPLE TEST 05 Q147 ---');
const q147 = data.find((q) => q.id === 'toeic_2026_t05_p7_q147');
console.log(q147 ? q147.explanation : 'not found');

console.log('\n--- SAMPLE TEST 09 Q150 ---');
const q150 = data.find((q) => q.id === 'toeic_2026_t09_p7_q150');
console.log(q150 ? q150.explanation : 'not found');

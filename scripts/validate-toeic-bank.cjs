const fs = require('fs');
const path = require('path');

const bankPath = 'e:\\Project\\english-party\\src\\data\\generated\\toeic-reading-questions.json';

function validateBank() {
  if (!fs.existsSync(bankPath)) {
    console.error('toeic-reading-questions.json does not exist!');
    process.exit(1);
  }

  const list = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  console.log(`\n========================================`);
  console.log(`VALIDATING TOEIC READING BANK: ${list.length} questions`);
  console.log(`========================================\n`);

  const idSet = new Set();
  let errors = 0;
  let warnings = 0;

  const testCounts = {};

  list.forEach((q, idx) => {
    // Check ID
    if (!q.id) {
      console.error(`[Row ${idx}] Missing ID!`);
      errors++;
    } else if (idSet.has(q.id)) {
      console.error(`[Row ${idx}] Duplicate ID: ${q.id}`);
      errors++;
    } else {
      idSet.add(q.id);
    }

    // Check test tag
    const testTag = q.tags?.find(t => t.startsWith('test-'));
    if (testTag) {
      testCounts[testTag] = (testCounts[testTag] || 0) + 1;
    }

    // Check choices
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      console.error(`[${q.id}] Choices count is ${q.choices?.length}, expected 4!`);
      errors++;
    } else {
      q.choices.forEach((c, cIdx) => {
        if (!c || !c.trim()) {
          console.error(`[${q.id}] Choice ${cIdx} is empty!`);
          errors++;
        }
        if (/^\([A-D]\)/i.test(c.trim()) || /^[A-D]\.\s/i.test(c.trim())) {
          console.warn(`[${q.id}] Choice ${cIdx} has letter prefix: "${c}"`);
          warnings++;
        }
      });
    }

    // Check correctAnswer
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      console.error(`[${q.id}] Invalid correctAnswer: ${q.correctAnswer}`);
      errors++;
    }

    // Check context for Part 6 and 7
    if ((q.part === 6 || q.part === 7) && (!q.context || !q.context.trim())) {
      console.error(`[${q.id}] Part ${q.part} is missing context passage!`);
      errors++;
    }

    // Check explanation
    if (!q.explanation || !q.explanation.includes('|')) {
      warnings++;
    }
  });

  console.log('Breakdown by test:');
  Object.keys(testCounts).sort().forEach(t => {
    console.log(`  ${t}: ${testCounts[t]} questions`);
  });

  console.log(`\nValidation complete:`);
  console.log(`  Total questions: ${list.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Warnings: ${warnings}`);

  if (errors > 0) {
    console.error('\nFAILED VALIDATION!');
    process.exit(1);
  } else {
    console.log('\nALL CHECKS PASSED!');
  }
}

validateBank();

const fs = require('node:fs');
const path = require('node:path');
const Papa = require('papaparse');

const root = path.resolve(__dirname, '..');
const questions = JSON.parse(
  fs.readFileSync(path.join(root, 'src', 'data', 'generated', 'toeic-questions.json'), 'utf8'),
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(questions.length === 800, `Expected 800 bundled questions, received ${questions.length}.`);
assert(new Set(questions.map((item) => item.id)).size === questions.length, 'Question IDs must be unique.');

for (const part of [5, 6, 7]) {
  const partQuestions = questions.filter((item) => item.part === part && item.type !== 'listening');
  assert(partQuestions.length === 200, `Part ${part} must contain exactly 200 questions.`);
  assert(
    new Set(partQuestions.map((item) => `${item.question}|${item.context ?? ''}`)).size === 200,
    `Part ${part} contains duplicate learning items.`,
  );
}

const listening = questions.filter((item) => item.type === 'listening');
assert(listening.length === 200, 'Listening bank must contain exactly 200 questions.');
assert(listening.filter((item) => item.part === 3).length === 100, 'Listening Part 3 must contain 100 questions.');
assert(listening.filter((item) => item.part === 4).length === 100, 'Listening Part 4 must contain 100 questions.');

questions.forEach((item) => {
  assert(item.question && item.topic && item.explanation, `${item.id} is missing required text.`);
  assert(Array.isArray(item.choices) && item.choices.length === 4, `${item.id} must have four choices.`);
  assert(Number.isInteger(item.correctAnswer) && item.correctAnswer >= 0 && item.correctAnswer <= 3, `${item.id} has an invalid answer.`);
  if (item.part === 6 || item.part === 7) assert(item.context, `${item.id} is missing reading context.`);
  if (item.type === 'listening') assert(item.transcript, `${item.id} is missing a transcript.`);
});

for (const fileName of ['toeic_part5_200.csv', 'toeic_part6_200.csv', 'toeic_part7_200.csv', 'toeic_listening_200.csv']) {
  const result = Papa.parse(fs.readFileSync(path.join(root, fileName), 'utf8'), {
    header: true,
    skipEmptyLines: true,
  });
  assert(result.errors.length === 0, `${fileName} contains CSV parsing errors.`);
  assert(result.data.length === 200, `${fileName} must contain exactly 200 data rows.`);
}

console.log('Learning bank validation passed: 800 questions and 4 import-ready CSV files.');

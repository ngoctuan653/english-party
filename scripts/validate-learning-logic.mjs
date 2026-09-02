import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const {
    calculateReviewSchedule,
    interleaveQuestions,
    isReviewDue,
    ratingFromAnswer,
  } = await server.ssrLoadModule('/src/services/progress.ts');

  const now = Date.UTC(2026, 8, 1, 0, 0, 0);
  const firstGood = calculateReviewSchedule(undefined, 'good', now);
  assert.equal(firstGood.intervalDays, 1);
  assert.equal(firstGood.consecutiveCorrect, 1);
  assert.equal(firstGood.mastery, 25);

  const easy = calculateReviewSchedule(undefined, 'easy', now);
  assert.equal(easy.intervalDays, 4);
  assert.equal(easy.mastery, 40);

  const lapse = calculateReviewSchedule({ ...easy, mastery: 80 }, 'again', now);
  assert.equal(lapse.intervalDays, 0);
  assert.equal(lapse.consecutiveCorrect, 0);
  assert.equal(lapse.lapseCount, 1);
  assert.equal(isReviewDue(lapse, now), false);
  assert.equal(isReviewDue(lapse, now + 10 * 60 * 1000), true);

  assert.equal(ratingFromAnswer({ isCorrect: false, confidence: 'high' }), 'again');
  assert.equal(ratingFromAnswer({ isCorrect: true, confidence: 'low' }), 'hard');
  assert.equal(ratingFromAnswer({ isCorrect: true, confidence: 'high' }), 'easy');

  const interleaved = interleaveQuestions([
    { id: 'a1', topic: 'nouns', part: 5 },
    { id: 'a2', topic: 'nouns', part: 5 },
    { id: 'b1', topic: 'emails', part: 6 },
    { id: 'c1', topic: 'notices', part: 7 },
  ]);
  assert.equal(interleaved.length, 4);
  for (let index = 1; index < interleaved.length; index += 1) {
    assert.notEqual(interleaved[index].topic, interleaved[index - 1].topic);
  }

  console.log('Learning logic validation passed: scheduler, due dates, confidence, and interleaving.');
} finally {
  await server.close();
}

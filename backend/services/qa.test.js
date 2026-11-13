const test = require('node:test');
const assert = require('node:assert/strict');
const { parseVisitDurationMinutes, parseQaRunCounts } = require('./qa');

test('uses a five-minute default QA visit duration', () => {
  assert.equal(parseVisitDurationMinutes(undefined), 5);
});

test('accepts QA visit durations from one through ten minutes', () => {
  assert.equal(parseVisitDurationMinutes('1'), 1);
  assert.equal(parseVisitDurationMinutes(10), 10);
});

test('rejects invalid or excessive QA visit durations', () => {
  for (const value of [0, 11, 1.5, 'NaN']) {
    assert.throws(() => parseVisitDurationMinutes(value), /between 1 and 10/);
  }
});

test('caps QA visits, loops, and total runs', () => {
  assert.deepEqual(parseQaRunCounts(5, 1), { visitCount: 5, loopCount: 1 });
  assert.throws(() => parseQaRunCounts(6, 1), /between 1 and 5 visits/);
  assert.throws(() => parseQaRunCounts(1, 2), /between 1 and 1 loop/);
});

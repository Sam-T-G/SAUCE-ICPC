#!/usr/bin/env node
// ============================================================================
// engine.test.js — unit tests for the learning engine: SRS scheduling,
// strength decay, streak logic, XP/mastery rules, badges.
// Run: node tests/engine.test.js
// ============================================================================
import assert from 'node:assert/strict';

// localStorage shim so store.js works under Node
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};

const srs = await import('../src/srs.js');
const { addDays, todayStr, daysBetween, answerMatches, normalizeOutput } = await import('../src/util.js');
const engine = await import('../src/engine.js');
const { getState, update, resetAll } = await import('../src/store.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

console.log('\n— util —');
test('daysBetween / addDays roundtrip', () => {
  assert.equal(daysBetween('2026-01-01', '2026-01-31'), 30);
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});
test('answerMatches is forgiving', () => {
  assert.ok(answerMatches('  (LL) h ', '(ll)h'));
  assert.ok(answerMatches('cin >> v', '(cin >> v)') === false); // parens differ
  assert.ok(answerMatches('N+K-1 / K'.replace(/\s/g, ''), ['(n+k-1)/k', 'n+k-1 / k']));
});
test('normalizeOutput ignores trailing whitespace', () => {
  assert.equal(normalizeOutput('20\n40\n60  \n'), '20\n40\n60');
});

console.log('\n— SRS scheduling —');
test('new record due tomorrow', () => {
  const r = srs.newRecord('2026-06-01');
  assert.equal(r.due, '2026-06-02');
  assert.equal(r.interval, 1);
});
test('accuracy → quality mapping', () => {
  assert.equal(srs.accuracyToQuality(1.0), 5);
  assert.equal(srs.accuracyToQuality(0.86), 4);
  assert.equal(srs.accuracyToQuality(0.75), 3);
  assert.equal(srs.accuracyToQuality(0.55), 2);
  assert.equal(srs.accuracyToQuality(0.1), 0);
});
test('successful reviews expand intervals', () => {
  let r = srs.newRecord('2026-06-01');
  r = srs.applyReview(r, 5, '2026-06-02');
  const i1 = r.interval;
  r = srs.applyReview(r, 5, r.due);
  const i2 = r.interval;
  r = srs.applyReview(r, 5, r.due);
  assert.ok(i1 >= 2, `first interval grows (${i1})`);
  assert.ok(i2 > i1, 'second interval larger');
  assert.ok(r.interval > i2, 'third interval larger still');
});
test('lapse shrinks interval but not to zero', () => {
  let r = srs.newRecord('2026-06-01');
  for (let i = 0; i < 4; i++) r = srs.applyReview(r, 5, r.due);
  const big = r.interval;
  r = srs.applyReview(r, 1, r.due);
  assert.ok(r.interval < big && r.interval >= 1, `lapse shrinks (${big} → ${r.interval})`);
  assert.equal(r.lapses, 1);
});
test('ease stays within bounds', () => {
  let r = srs.newRecord('2026-06-01');
  for (let i = 0; i < 20; i++) r = srs.applyReview(r, 0, r.due);
  assert.ok(r.ease >= srs.MIN_EASE);
  for (let i = 0; i < 30; i++) r = srs.applyReview(r, 5, r.due);
  assert.ok(r.ease <= 3.2);
  assert.ok(r.interval <= srs.MAX_INTERVAL);
});
test('strength decays exponentially with half-life = interval', () => {
  const r = { ...srs.newRecord('2026-06-01'), interval: 10, last: '2026-06-01' };
  assert.equal(srs.strength(r, '2026-06-01'), 1);
  const half = srs.strength(r, '2026-06-11');
  assert.ok(Math.abs(half - 0.5) < 1e-9, `strength at interval = 0.5 (got ${half})`);
  assert.ok(srs.strength(r, '2026-07-01') < 0.27);
});
test('dueSkills sorts weakest first', () => {
  const recs = {
    a: { ...srs.newRecord('2026-06-01'), interval: 2, due: '2026-06-03', last: '2026-06-01' },
    b: { ...srs.newRecord('2026-05-20'), interval: 3, due: '2026-05-23', last: '2026-05-20' },
    c: { ...srs.newRecord('2026-06-01'), interval: 30, due: '2026-07-01', last: '2026-06-01' },
  };
  const due = srs.dueSkills(recs, '2026-06-05');
  assert.deepEqual(due, ['b', 'a'], `b (long overdue) first, c not due (got ${due})`);
});
test('forecast buckets', () => {
  const recs = {
    a: { due: '2026-06-05', interval: 1, last: '2026-06-04' },
    b: { due: '2026-06-07', interval: 1, last: '2026-06-06' },
    c: { due: '2026-06-01', interval: 1, last: '2026-05-31' },
  };
  const fc = srs.dueForecast(recs, 7, '2026-06-05');
  assert.equal(fc[0], 2); // a due today + c overdue
  assert.equal(fc[2], 1); // b in 2 days
});

console.log('\n— streaks —');
function freshStreak() {
  return { current: 0, best: 0, lastDay: '', freezes: 0, freezeEarnedAt: 0 };
}
test('consecutive days extend streak', () => {
  const st = { streak: freshStreak() };
  engine.bumpStreak(st, '2026-06-01');
  engine.bumpStreak(st, '2026-06-02');
  engine.bumpStreak(st, '2026-06-03');
  assert.equal(st.streak.current, 3);
});
test('same day does not double-count', () => {
  const st = { streak: freshStreak() };
  engine.bumpStreak(st, '2026-06-01');
  const r = engine.bumpStreak(st, '2026-06-01');
  assert.equal(st.streak.current, 1);
  assert.equal(r.extended, false);
});
test('missed day without freeze resets', () => {
  const st = { streak: freshStreak() };
  engine.bumpStreak(st, '2026-06-01');
  engine.bumpStreak(st, '2026-06-03');
  assert.equal(st.streak.current, 1);
});
test('freeze auto-spends to save streak', () => {
  const st = { streak: { ...freshStreak(), freezes: 1 } };
  engine.bumpStreak(st, '2026-06-01');
  engine.bumpStreak(st, '2026-06-03'); // gap of 1 missed day
  assert.equal(st.streak.current, 2, 'streak survives');
  assert.equal(st.streak.freezes, 0, 'freeze consumed');
});
test('freeze earned at 7-day streak, capped at 2', () => {
  const st = { streak: freshStreak() };
  let d = '2026-06-01';
  for (let i = 0; i < 7; i++) { engine.bumpStreak(st, d); d = addDays(d, 1); }
  assert.equal(st.streak.current, 7);
  assert.equal(st.streak.freezes, 1);
  for (let i = 0; i < 14; i++) { engine.bumpStreak(st, d); d = addDays(d, 1); }
  assert.ok(st.streak.freezes <= 2, 'freezes capped');
});

console.log('\n— ranks & progression —');
test('rank thresholds', () => {
  assert.equal(engine.rankFor(0).name, 'Newbie');
  assert.equal(engine.rankFor(900).name, 'Specialist');
  assert.equal(engine.rankFor(899).name, 'Pupil');
  assert.ok(engine.rankFor(900).progress >= 0 && engine.rankFor(900).progress <= 1);
});
test('first skill unlocked, later skills locked initially', () => {
  resetAll();
  const st = getState();
  assert.ok(engine.isSkillUnlocked('cpp-hello', st));
  assert.ok(!engine.isSkillUnlocked('cpp-types', st));
  assert.ok(!engine.isSkillUnlocked('greedy', st));
});
test('leveling a skill unlocks the next', () => {
  resetAll();
  update((st) => { st.mastery['cpp-hello'] = { level: 1, sessions: 1, learned: true, lastLevelDay: todayStr() }; });
  assert.ok(engine.isSkillUnlocked('cpp-types', getState()));
});
test('unit test pass unlocks whole unit', () => {
  resetAll();
  update((st) => { st.unitTests['u03'] = { passed: true, best: 90, at: todayStr() }; });
  assert.ok(engine.isSkillUnlocked('two-pointers', getState()));
});

console.log('\n— grading sessions —');
test('learn session sets mastery 1 and starts SRS', () => {
  resetAll();
  const summary = engine.gradeSession(
    { kind: 'learn', skillId: 'cpp-hello', durationMs: 60000 },
    [
      { skillId: 'cpp-hello', exId: 'a', type: 'mcq', diff: 1, correct: true, eventuallyCorrect: false },
      { skillId: 'cpp-hello', exId: 'b', type: 'tf', diff: 1, correct: true, eventuallyCorrect: false },
    ],
  );
  const st = getState();
  assert.equal(st.mastery['cpp-hello'].level, 1);
  assert.ok(st.srs['cpp-hello'], 'srs record created');
  assert.ok(summary.xp > 0);
  assert.equal(st.streak.current, 1);
});
test('practice at ≥80% raises level; missed exercises land in mistake bank', () => {
  resetAll();
  engine.gradeSession({ kind: 'learn', skillId: 'cpp-hello', durationMs: 1000 },
    [{ skillId: 'cpp-hello', exId: 'a', type: 'mcq', diff: 1, correct: true, eventuallyCorrect: false }]);
  engine.gradeSession({ kind: 'practice', skillId: 'cpp-hello', durationMs: 1000 }, [
    { skillId: 'cpp-hello', exId: 'b', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
    { skillId: 'cpp-hello', exId: 'c', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
    { skillId: 'cpp-hello', exId: 'd', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
    { skillId: 'cpp-hello', exId: 'e', type: 'mcq', diff: 2, correct: false, eventuallyCorrect: true },
  ]);
  const st = getState();
  assert.equal(st.mastery['cpp-hello'].level, 2, 'level 1 → 2 at 80%+ (eventually-correct weighting)');
  assert.deepEqual(st.missed['cpp-hello'], ['e'], 'first-try miss recorded even though cleared in-session');
});
test('clearing a missed exercise removes it from the bank', () => {
  // continues previous state: exId 'e' is in the bank
  engine.gradeSession({ kind: 'mistakes', durationMs: 1000 }, [
    { skillId: 'cpp-hello', exId: 'e', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
  ]);
  assert.ok(!getState().missed['cpp-hello'], 'bank cleared');
});
test('perfect bonus and review multiplier', () => {
  resetAll();
  const base = engine.gradeSession({ kind: 'practice', skillId: 'cpp-hello', durationMs: 1000 }, [
    { skillId: 'cpp-hello', exId: 'a', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
    { skillId: 'cpp-hello', exId: 'b', type: 'mcq', diff: 2, correct: false, eventuallyCorrect: true },
  ]).xp;
  resetAll();
  const perfect = engine.gradeSession({ kind: 'practice', skillId: 'cpp-hello', durationMs: 1000 }, [
    { skillId: 'cpp-hello', exId: 'a', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
    { skillId: 'cpp-hello', exId: 'b', type: 'mcq', diff: 2, correct: true, eventuallyCorrect: false },
  ]).xp;
  assert.ok(perfect > base, `perfect (${perfect}) pays more than partial (${base})`);
});
test('unit test pass grants mastery floor across the unit', () => {
  resetAll();
  const results = Array.from({ length: 10 }, (_, i) => (
    { skillId: 'cpp-hello', exId: 'x' + i, type: 'mcq', diff: 2, correct: i < 9, eventuallyCorrect: false }
  ));
  const summary = engine.gradeSession({ kind: 'unittest', unitId: 'u01', durationMs: 1000 }, results);
  assert.equal(summary.passed, true);
  const st = getState();
  assert.ok(st.unitTests['u01'].passed);
  assert.ok(st.mastery['cpp-strings'].level >= 1, 'whole unit gets level ≥1');
});
test('legendary pass sets level 5 with long interval', () => {
  resetAll();
  engine.gradeSession({ kind: 'learn', skillId: 'cpp-hello', durationMs: 1000 },
    [{ skillId: 'cpp-hello', exId: 'a', type: 'mcq', diff: 1, correct: true, eventuallyCorrect: false }]);
  engine.gradeSession({ kind: 'legendary', skillId: 'cpp-hello', durationMs: 1000, passed: true }, [
    { skillId: 'cpp-hello', exId: 'b', type: 'mcq', diff: 3, correct: true, eventuallyCorrect: false },
  ]);
  const st = getState();
  assert.equal(st.mastery['cpp-hello'].level, 5);
  assert.ok(st.srs['cpp-hello'].interval >= 30, 'legendary slows decay');
});
test('problem marking: assisted schedules cold re-solve', () => {
  resetAll();
  const p = { name: 'Watermelon', platform: 'Codeforces', id: '4A', url: 'https://codeforces.com/problemset/problem/4/A' };
  engine.markProblem(p, { solved: true, assisted: true });
  const st = getState();
  const rec = st.problems['Codeforces:4A'];
  assert.ok(rec.solved && rec.assisted && rec.resolveDue, 'resolve scheduled');
  // not due yet today
  assert.equal(engine.resolveQueue(st, todayStr()).length, 0);
  assert.equal(engine.resolveQueue(st, addDays(todayStr(), 15)).length, 1);
  engine.markResolved('Codeforces:4A');
  assert.equal(engine.resolveQueue(getState(), addDays(todayStr(), 15)).length, 0);
});

console.log(`\n${'='.repeat(40)}\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);

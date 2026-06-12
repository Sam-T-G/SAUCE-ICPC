// ============================================================================
// engine.js — learning engine: session building, grading, XP, mastery,
// streaks, badges. The pedagogy lives here (see docs/PEDAGOGY.md):
//
//  • Sessions ≈ 10 exercises + re-queued mistakes (Duolingo session shape).
//  • Difficulty mix targets ~80% success and rises with mastery level.
//  • 1–2 review exercises from weaker earlier skills are interleaved in.
//  • Mistakes re-queue until answered correctly; lessons end on a win.
//  • Mastery L1→L3 by practice; L3→L4 needs a *different day* (anti-cram
//    spacing gate); L4→L5 needs the Legendary challenge (timed, ≤2 misses).
//  • XP is effort-weighted: harder exercises pay more, grinding mastered
//    skills pays less, reviews pay a bonus.
// ============================================================================
import { UNITS, SKILL_INDEX, SKILL_ORDER, getSkillContent, getManySkillContents } from '../data/curriculum.js';
import { getState, update } from './store.js';
import * as srs from './srs.js';
import { todayStr, addDays, shuffle, sample, clamp } from './util.js';

// ---------------------------------------------------------------------------
// XP / leveling
// ---------------------------------------------------------------------------
export const XP_RULES = {
  base: 10,            // correct on first try
  retry: 5,            // correct after a wrong attempt
  diffBonus: { 1: 0, 2: 2, 3: 5 },
  comboEvery: 3,       // every N first-try-correct in a row...
  comboBonus: 2,       // ...adds this much
  perfectLesson: 20,
  reviewMultiplier: 1.2,   // reviews matter most — pay them better
  grindMultiplier: 0.5,    // practicing an already-mastered (L3+) skill
  legendaryComplete: 40,
  unitTestPass: 60,
};

// Codeforces-flavored ranks for total XP (the audience will get it).
export const RANKS = [
  { at: 0,     name: 'Newbie',            color: '#9aa7bd' },
  { at: 300,   name: 'Pupil',             color: '#3ddc6e' },
  { at: 900,   name: 'Specialist',        color: '#21c0e8' },
  { at: 1800,  name: 'Expert',            color: '#4f7dff' },
  { at: 3200,  name: 'Candidate Master',  color: '#a06bff' },
  { at: 5200,  name: 'Master',            color: '#ffaa00' },
  { at: 8000,  name: 'International Master', color: '#ff7a1a' },
  { at: 12000, name: 'Grandmaster',       color: '#ff4b6e' },
  { at: 18000, name: 'Legendary Grandmaster', color: '#ff5a3c' },
];

export function rankFor(xp) {
  let cur = RANKS[0];
  for (const r of RANKS) if (xp >= r.at) cur = r;
  const next = RANKS[RANKS.indexOf(cur) + 1] ?? null;
  return { ...cur, next, progress: next ? (xp - cur.at) / (next.at - cur.at) : 1 };
}

// ---------------------------------------------------------------------------
// Mastery / unlock logic
// ---------------------------------------------------------------------------
export const MAX_LEVEL = 5; // 0 locked-ish … 3 practiced, 4 spaced, 5 legendary

export function masteryOf(skillId, st = getState()) {
  return st.mastery[skillId] ?? { level: 0, sessions: 0, learned: false, lastLevelDay: '' };
}

export function isSkillUnlocked(skillId, st = getState()) {
  const i = SKILL_ORDER.indexOf(skillId);
  if (i <= 0) return true;
  // unit test pass unlocks the whole unit
  const meta = SKILL_INDEX[skillId];
  if (st.unitTests[meta.unitId]?.passed) return true;
  const prev = SKILL_ORDER[i - 1];
  return masteryOf(prev, st).level >= 1;
}

export function isUnitUnlocked(unitId, st = getState()) {
  const u = UNITS.find((x) => x.id === unitId);
  return u ? isSkillUnlocked(u.skills[0].id, st) : false;
}

/** The "current" skill: first unlocked skill below level 1. */
export function currentSkill(st = getState()) {
  for (const id of SKILL_ORDER) {
    if (masteryOf(id, st).level < 1 && isSkillUnlocked(id, st)) return id;
  }
  // everything ≥1 → next lowest level
  let best = null, bestLv = Infinity;
  for (const id of SKILL_ORDER) {
    const lv = masteryOf(id, st).level;
    if (lv < bestLv && lv < MAX_LEVEL) { best = id; bestLv = lv; }
  }
  return best ?? SKILL_ORDER[SKILL_ORDER.length - 1];
}

export function unitProgress(unitId, st = getState()) {
  const u = UNITS.find((x) => x.id === unitId);
  if (!u) return { done: 0, total: 0, pct: 0 };
  const total = u.skills.length * 3; // levels 1..3 count toward "course done"
  const done = u.skills.reduce((acc, s) => acc + Math.min(3, masteryOf(s.id, st).level), 0);
  return { done, total, pct: total ? done / total : 0 };
}

export function overallProgress(st = getState()) {
  const total = SKILL_ORDER.length * 3;
  const done = SKILL_ORDER.reduce((acc, id) => acc + Math.min(3, masteryOf(id, st).level), 0);
  return { done, total, pct: total ? done / total : 0 };
}

// ---------------------------------------------------------------------------
// Session building
// ---------------------------------------------------------------------------

/** Difficulty mix by mastery level — keeps success near ~80% while ramping. */
function difficultyTarget(level) {
  if (level <= 0) return { 1: 0.55, 2: 0.35, 3: 0.10 };
  if (level === 1) return { 1: 0.40, 2: 0.40, 3: 0.20 };
  if (level === 2) return { 1: 0.25, 2: 0.45, 3: 0.30 };
  return { 1: 0.15, 2: 0.40, 3: 0.45 };
}

function pickByDifficulty(pool, n, mix, rng = Math.random) {
  const by = { 1: [], 2: [], 3: [] };
  for (const ex of pool) by[clamp(ex.diff ?? 2, 1, 3)].push(ex);
  for (const k of [1, 2, 3]) by[k] = shuffle(by[k], rng);
  const want = { 1: Math.round(n * mix[1]), 2: Math.round(n * mix[2]), 3: 0 };
  want[3] = Math.max(0, n - want[1] - want[2]);
  const out = [];
  for (const k of [1, 2, 3]) out.push(...by[k].splice(0, want[k]));
  // backfill if a bucket ran dry
  const rest = shuffle([...by[1], ...by[2], ...by[3]], rng);
  while (out.length < n && rest.length) out.push(rest.shift());
  return shuffle(out, rng);
}

/** Order a session: easy opener, hard in the middle, end on a win. */
function arcOrder(items) {
  const sorted = [...items].sort((a, b) => (a.ex.diff ?? 2) - (b.ex.diff ?? 2));
  if (sorted.length <= 3) return sorted;
  const easyClose = sorted.shift();           // save an easy one for the finale
  const opener = sorted.shift() ?? null;      // and open gently
  const middle = shuffle(sorted);
  return [opener, ...middle, easyClose].filter(Boolean);
}

/**
 * Build a session. kind ∈ 'learn' | 'practice' | 'review' | 'mistakes' |
 * 'legendary' | 'unittest'. Returns { kind, skillId?, unitId?, theory?, items }
 * where items = [{ skillId, ex, isReview }].
 */
export async function buildSession(kind, { skillId, unitId, size } = {}) {
  const st = getState();

  if (kind === 'learn') {
    const content = await getSkillContent(skillId);
    if (!content) throw new Error(`No content for ${skillId}`);
    const intro = pickByDifficulty(content.exercises, Math.min(size ?? 6, content.exercises.length), { 1: 0.7, 2: 0.3, 3: 0 });
    return { kind, skillId, theory: content.theory, items: arcOrder(intro.map((ex) => ({ skillId, ex, isReview: false }))) };
  }

  if (kind === 'practice' || kind === 'legendary') {
    const content = await getSkillContent(skillId);
    if (!content) throw new Error(`No content for ${skillId}`);
    const lv = masteryOf(skillId, st).level;
    const n = size ?? (kind === 'legendary' ? 12 : 10);
    const mix = kind === 'legendary' ? { 1: 0.1, 2: 0.4, 3: 0.5 } : difficultyTarget(lv);
    let items = pickByDifficulty(content.exercises, n, mix).map((ex) => ({ skillId, ex, isReview: false }));

    // Interleave 1–2 review exercises from weaker earlier skills (not in legendary).
    if (kind === 'practice') {
      const weaker = Object.keys(st.srs)
        .filter((id) => id !== skillId && srs.strengthBars(st.srs[id]) <= 2 && SKILL_ORDER.indexOf(id) < SKILL_ORDER.indexOf(skillId))
        .slice(0, 4);
      if (weaker.length) {
        const pickFrom = sample(weaker, Math.min(2, weaker.length));
        const contents = await getManySkillContents(pickFrom);
        for (const id of pickFrom) {
          const exs = contents[id]?.exercises ?? [];
          if (exs.length) items.push({ skillId: id, ex: sample(exs, 1)[0], isReview: true });
        }
      }
    }
    return { kind, skillId, items: arcOrder(items) };
  }

  if (kind === 'review') {
    const due = srs.dueSkills(st.srs);
    const pickIds = due.length ? due.slice(0, 5) : weakestSkills(st, 4);
    if (!pickIds.length) return { kind, items: [] };
    const contents = await getManySkillContents(pickIds);
    const per = Math.max(2, Math.ceil((size ?? 10) / pickIds.length));
    let items = [];
    for (const id of pickIds) {
      const exs = contents[id]?.exercises ?? [];
      const missed = (st.missed[id] ?? []);
      // prefer previously-missed exercises (targeted re-practice)
      const missedExs = exs.filter((e) => missed.includes(e.id));
      const rest = exs.filter((e) => !missed.includes(e.id));
      const chosen = [...sample(missedExs, Math.min(per - 1, missedExs.length)), ...sample(rest, per)].slice(0, per);
      items.push(...chosen.map((ex) => ({ skillId: id, ex, isReview: true })));
    }
    items = shuffle(items).slice(0, size ?? 12); // interleaved by construction
    return { kind, items: arcOrder(items), skillIds: pickIds };
  }

  if (kind === 'mistakes') {
    const ids = Object.keys(st.missed).filter((id) => st.missed[id]?.length);
    if (!ids.length) return { kind, items: [] };
    const contents = await getManySkillContents(ids);
    let items = [];
    for (const id of ids) {
      const exs = (contents[id]?.exercises ?? []).filter((e) => st.missed[id].includes(e.id));
      items.push(...exs.map((ex) => ({ skillId: id, ex, isReview: true })));
    }
    return { kind, items: shuffle(items).slice(0, size ?? 12) };
  }

  if (kind === 'unittest') {
    const unit = UNITS.find((u) => u.id === unitId);
    if (!unit) throw new Error(`No unit ${unitId}`);
    const contents = await getManySkillContents(unit.skills.map((s) => s.id));
    let items = [];
    for (const s of unit.skills) {
      const exs = contents[s.id]?.exercises ?? [];
      items.push(...pickByDifficulty(exs, 3, { 1: 0.2, 2: 0.5, 3: 0.3 }).map((ex) => ({ skillId: s.id, ex, isReview: false })));
    }
    items = shuffle(items).slice(0, Math.min(size ?? 14, items.length));
    return { kind, unitId, items };
  }

  throw new Error(`Unknown session kind ${kind}`);
}

function weakestSkills(st, n) {
  return Object.keys(st.srs)
    .sort((a, b) => srs.strength(st.srs[a]) - srs.strength(st.srs[b]))
    .slice(0, n);
}

// ---------------------------------------------------------------------------
// Grading a finished session → state changes
// ---------------------------------------------------------------------------

/**
 * results: [{ skillId, exId, correct (first try), retried }], plus meta
 * { kind, skillId?, unitId?, perfect, durationMs, comboBest }
 * Returns a summary { xp, leveledUp, newLevel, streakExtended, badges: [] }
 */
export function gradeSession(meta, results) {
  const today = todayStr();
  const summary = { xp: 0, leveled: [], badges: [], streak: null, rankBefore: null, rankAfter: null, passed: undefined };

  update((st) => {
    summary.rankBefore = rankFor(st.xp.total).name;

    // ---- XP ----
    let xp = 0;
    let comboRun = 0, comboBonus = 0;
    for (const r of results) {
      const diff = clamp(r.diff ?? 2, 1, 3);
      if (r.correct) {
        xp += XP_RULES.base + XP_RULES.diffBonus[diff];
        comboRun++;
        if (comboRun % XP_RULES.comboEvery === 0) comboBonus += XP_RULES.comboBonus;
      } else if (r.eventuallyCorrect) {
        xp += XP_RULES.retry;
        comboRun = 0;
      } else {
        comboRun = 0;
      }
    }
    xp += comboBonus;

    const firstTryAcc = results.length ? results.filter((r) => r.correct).length / results.length : 0;
    const perfect = results.length > 0 && results.every((r) => r.correct);
    if (perfect) xp += XP_RULES.perfectLesson;

    if (meta.kind === 'review' || meta.kind === 'mistakes') xp = Math.round(xp * XP_RULES.reviewMultiplier);
    if (meta.kind === 'practice' && masteryOf(meta.skillId, st).level >= 3) xp = Math.round(xp * XP_RULES.grindMultiplier);
    if (meta.kind === 'legendary' && meta.passed) xp += XP_RULES.legendaryComplete;
    if (meta.kind === 'unittest' && meta.passed) xp += XP_RULES.unitTestPass;

    st.xp.total += xp;
    summary.xp = xp;
    summary.rankAfter = rankFor(st.xp.total).name;

    // ---- activity log ----
    const act = (st.activity[today] ??= { xp: 0, ex: 0, ms: 0, sessions: 0 });
    act.xp += xp;
    act.ex += results.length;
    act.ms += meta.durationMs ?? 0;
    act.sessions += 1;
    st.sessionsCount += 1;

    // ---- exercise stats + missed pool ----
    for (const r of results) {
      st.exStats.attempts++;
      if (r.correct) st.exStats.correct++;
      const t = (st.exStats.byType[r.type] ??= { a: 0, c: 0 });
      t.a++;
      if (r.correct) t.c++;

      // Mistake bank: any first-try miss is logged (even if corrected after
      // re-queue — it was a gap minutes ago). Cleared by a first-try success.
      const pool = (st.missed[r.skillId] ??= []);
      if (!r.correct) {
        if (!pool.includes(r.exId)) pool.push(r.exId);
      } else if (pool.includes(r.exId)) {
        st.missed[r.skillId] = pool.filter((x) => x !== r.exId);
      }
      if ((st.missed[r.skillId] ?? []).length === 0) delete st.missed[r.skillId];
    }

    // ---- mastery + SRS ----
    const touchSkill = (skillId, acc) => {
      const q = srs.accuracyToQuality(acc);
      st.srs[skillId] = srs.applyReview(st.srs[skillId], q, today);
    };

    if (meta.kind === 'learn') {
      const m = (st.mastery[meta.skillId] ??= { level: 0, sessions: 0, learned: false, lastLevelDay: '' });
      m.learned = true;
      m.sessions++;
      if (m.level < 1) { m.level = 1; m.lastLevelDay = today; summary.leveled.push({ skillId: meta.skillId, level: 1 }); }
      st.srs[meta.skillId] ??= srs.newRecord(today);
      touchSkill(meta.skillId, Math.max(0.7, firstTryAcc)); // gentle on first contact
    }

    if (meta.kind === 'practice') {
      const m = (st.mastery[meta.skillId] ??= { level: 0, sessions: 0, learned: false, lastLevelDay: '' });
      m.sessions++;
      const acc = sessionAccuracy(results);
      if (acc >= 0.8 && m.level < 4) {
        // L3→L4 requires a different calendar day (spacing gate, anti-cram)
        const gate = m.level === 3 && m.lastLevelDay === today;
        if (!gate && m.level < 4) {
          m.level = Math.min(4, m.level + 1);
          m.lastLevelDay = today;
          summary.leveled.push({ skillId: meta.skillId, level: m.level });
        }
      }
      touchSkill(meta.skillId, acc);
      // interleaved review items refresh their own skills
      reviewBySkill(results, meta.skillId).forEach(([id, acc2]) => touchSkill(id, acc2));
    }

    if (meta.kind === 'legendary' && meta.passed) {
      const m = (st.mastery[meta.skillId] ??= { level: 0, sessions: 0, learned: false, lastLevelDay: '' });
      if (m.level < 5) { m.level = 5; m.lastLevelDay = today; summary.leveled.push({ skillId: meta.skillId, level: 5 }); }
      // Legendary slows forgetting: bake in a long interval
      const rec = st.srs[meta.skillId] ?? srs.newRecord(today);
      st.srs[meta.skillId] = { ...rec, interval: Math.min(srs.MAX_INTERVAL, Math.max(rec.interval * 2, 30)), due: addDays(today, Math.min(srs.MAX_INTERVAL, Math.max(rec.interval * 2, 30))), last: today };
    }

    if (meta.kind === 'review' || meta.kind === 'mistakes') {
      reviewBySkill(results, null).forEach(([id, acc2]) => touchSkill(id, acc2));
    }

    if (meta.kind === 'unittest') {
      const acc = sessionAccuracy(results);
      const passed = acc >= 0.8;
      meta.passed = passed;
      summary.passed = passed;
      const t = (st.unitTests[meta.unitId] ??= { passed: false, best: 0, at: '' });
      t.best = Math.max(t.best, Math.round(acc * 100));
      t.at = today;
      if (passed) {
        t.passed = true;
        // mastery floor of 1 for the whole unit (jump-ahead credit)
        const unit = UNITS.find((u) => u.id === meta.unitId);
        for (const s of unit.skills) {
          const m = (st.mastery[s.id] ??= { level: 0, sessions: 0, learned: false, lastLevelDay: '' });
          if (m.level < 1) { m.level = 1; m.learned = true; m.lastLevelDay = today; }
          st.srs[s.id] ??= srs.newRecord(today);
        }
      }
    }

    // ---- streak ----
    summary.streak = bumpStreak(st, today);

    // ---- badges ----
    summary.badges = evaluateBadges(st, { meta, results, perfect, today });
  });

  return summary;
}

function sessionAccuracy(results) {
  if (!results.length) return 0;
  // first-try correct counts fully; eventually-correct counts 60%
  const score = results.reduce((a, r) => a + (r.correct ? 1 : r.eventuallyCorrect ? 0.6 : 0), 0);
  return score / results.length;
}

function reviewBySkill(results, excludeSkill) {
  const by = {};
  for (const r of results) {
    if (r.skillId === excludeSkill) continue;
    (by[r.skillId] ??= []).push(r);
  }
  return Object.entries(by).map(([id, rs]) => [id, sessionAccuracy(rs)]);
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------
export function bumpStreak(st, today = todayStr()) {
  const s = st.streak;
  if (s.lastDay === today) return { extended: false, current: s.current };

  if (!s.lastDay) {
    s.current = 1;
  } else {
    const gap = Math.round((new Date(today + 'T12:00') - new Date(s.lastDay + 'T12:00')) / 86400000);
    if (gap === 1) s.current += 1;
    else if (gap > 1) {
      const missed = gap - 1;
      if (s.freezes >= missed) { s.freezes -= missed; s.current += 1; } // freezes auto-spend
      else s.current = 1;
    }
  }
  s.lastDay = today;
  s.best = Math.max(s.best, s.current);
  // earn a freeze every 7 days of streak (bank max 2)
  if (s.current > 0 && s.current % 7 === 0 && s.freezeEarnedAt !== s.current) {
    s.freezes = Math.min(2, s.freezes + 1);
    s.freezeEarnedAt = s.current;
  }
  return { extended: true, current: s.current };
}

/** Current effective streak for display (accounts for yesterday). */
export function streakAlive(st = getState(), today = todayStr()) {
  const s = st.streak;
  if (!s.lastDay) return false;
  const gap = Math.round((new Date(today + 'T12:00') - new Date(s.lastDay + 'T12:00')) / 86400000);
  return gap <= 1 || s.freezes >= gap - 1;
}

export function xpToday(st = getState()) {
  return st.activity[todayStr()]?.xp ?? 0;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
export const BADGES = [
  { id: 'first-lesson',  icon: '🐣', name: 'Hello World',    desc: 'Complete your first lesson' },
  { id: 'perfect',       icon: '💎', name: 'Flawless',       desc: 'Finish a session with zero mistakes' },
  { id: 'streak-7',      icon: '🔥', name: 'Week of Fire',   desc: '7-day streak' },
  { id: 'streak-30',     icon: '🌋', name: 'Month of Magma', desc: '30-day streak' },
  { id: 'unit-1',        icon: '🚀', name: 'Liftoff',        desc: 'Finish every skill in C++ Bootcamp' },
  { id: 'ex-100',        icon: '💯', name: 'Centurion',      desc: 'Answer 100 exercises' },
  { id: 'ex-500',        icon: '🏛️', name: 'Gladiator',      desc: 'Answer 500 exercises' },
  { id: 'ex-1000',       icon: '⚡', name: 'Kilowatt',       desc: 'Answer 1000 exercises' },
  { id: 'legend-1',      icon: '👑', name: 'Legendary',      desc: 'Take a skill to Legendary (level 5)' },
  { id: 'legend-5',      icon: '🌟', name: 'Pantheon',       desc: '5 skills at Legendary' },
  { id: 'review-10',     icon: '🧠', name: 'Memory Keeper',  desc: 'Complete 10 review sessions' },
  { id: 'night-owl',     icon: '🦉', name: 'Night Owl',      desc: 'Practice after midnight' },
  { id: 'early-bird',    icon: '🐦', name: 'Early Bird',     desc: 'Practice before 7 am' },
  { id: 'problems-10',   icon: '✅', name: 'Solver',         desc: 'Mark 10 external problems solved' },
  { id: 'problems-50',   icon: '🏆', name: 'Grinder',        desc: 'Mark 50 external problems solved' },
  { id: 'unittest-1',    icon: '🎓', name: 'Test Ace',       desc: 'Pass a unit test' },
  { id: 'halfway',       icon: '⛰️', name: 'Basecamp',       desc: 'Reach 50% course completion' },
  { id: 'all-units',     icon: '🗻', name: 'Summit',         desc: 'Every skill at level 3+' },
  { id: 'comeback',      icon: '🧊', name: 'Ice Breaker',    desc: 'A streak freeze saved your streak' },
  { id: 'rank-expert',   icon: '🔷', name: 'Blue Belt',      desc: 'Reach Expert rank (1800 XP)' },
];

function award(st, list, id) {
  if (!st.badges[id]) {
    st.badges[id] = todayStr();
    const b = BADGES.find((x) => x.id === id);
    if (b) list.push(b);
  }
}

function evaluateBadges(st, { meta, results, perfect }) {
  const out = [];
  if (st.sessionsCount >= 1) award(st, out, 'first-lesson');
  if (perfect && results.length >= 5) award(st, out, 'perfect');
  if (st.streak.current >= 7) award(st, out, 'streak-7');
  if (st.streak.current >= 30) award(st, out, 'streak-30');
  if (st.exStats.attempts >= 100) award(st, out, 'ex-100');
  if (st.exStats.attempts >= 500) award(st, out, 'ex-500');
  if (st.exStats.attempts >= 1000) award(st, out, 'ex-1000');

  const u1 = UNITS[0];
  if (u1.skills.every((s) => (st.mastery[s.id]?.level ?? 0) >= 3)) award(st, out, 'unit-1');

  const legends = SKILL_ORDER.filter((id) => (st.mastery[id]?.level ?? 0) >= 5).length;
  if (legends >= 1) award(st, out, 'legend-1');
  if (legends >= 5) award(st, out, 'legend-5');

  const reviews = Object.values(st.activity).reduce((a, d) => a + (d.sessions ?? 0), 0); // proxy
  if ((meta.kind === 'review' || meta.kind === 'mistakes') && reviews >= 10) award(st, out, 'review-10');

  const h = new Date().getHours();
  if (h < 4) award(st, out, 'night-owl');
  if (h >= 4 && h < 7) award(st, out, 'early-bird');

  const solved = Object.values(st.problems).filter((p) => p.solved).length;
  if (solved >= 10) award(st, out, 'problems-10');
  if (solved >= 50) award(st, out, 'problems-50');

  if (meta.kind === 'unittest' && meta.passed) award(st, out, 'unittest-1');

  if (overallProgress(st).pct >= 0.5) award(st, out, 'halfway');
  if (SKILL_ORDER.every((id) => (st.mastery[id]?.level ?? 0) >= 3)) award(st, out, 'all-units');

  if (rankFor(st.xp.total).at >= 1800) award(st, out, 'rank-expert');
  return out;
}

// ---------------------------------------------------------------------------
// External problems
// ---------------------------------------------------------------------------
export function problemKey(p) {
  return `${p.platform}:${p.id ?? p.name}`;
}

/** Toggle solved; if assisted (editorial), schedule a cold re-solve in 14 days. */
export function markProblem(p, { solved, assisted = false }) {
  update((st) => {
    const key = problemKey(p);
    if (!solved) { delete st.problems[key]; return; }
    st.problems[key] = {
      solved: true,
      at: todayStr(),
      assisted,
      resolveDue: assisted ? addDays(todayStr(), 14) : null,
      resolved: false,
    };
  });
}

export function markResolved(key) {
  update((st) => {
    if (st.problems[key]) { st.problems[key].resolved = true; st.problems[key].resolveDue = null; }
  });
}

/** Problems whose cold re-solve is due (the "mistake bank" for real problems). */
export function resolveQueue(st = getState(), today = todayStr()) {
  return Object.entries(st.problems)
    .filter(([, p]) => p.assisted && !p.resolved && p.resolveDue && p.resolveDue <= today)
    .map(([key, p]) => ({ key, ...p }));
}

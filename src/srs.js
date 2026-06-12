// ============================================================================
// srs.js — spaced-repetition scheduler (SM-2 derived, skill-level)
//
// Pedagogy notes (see docs/PEDAGOGY.md):
//  • Spacing effect: reviews scheduled at expanding intervals (1 → 3 → ×ease).
//  • Retrieval strength decays exponentially; the interval acts as half-life
//    (inspired by Duolingo's half-life regression, Settles & Meeder 2016).
//  • Session accuracy maps to SM-2 quality 0–5; failures shrink the interval
//    instead of resetting to zero (gentler than vanilla SM-2 — lapses in CP
//    usually mean rust, not total loss).
//
// All functions are pure: they take/return plain records so they're testable.
// A review record: { ease, interval, due, reps, lapses, last }
// ============================================================================
import { todayStr, daysBetween, addDays, clamp } from './util.js';

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_INTERVAL = 120; // days — beyond this, a skill is "burned in"

/** Fresh record for a skill first practiced today. */
export function newRecord(today = todayStr()) {
  return { ease: DEFAULT_EASE, interval: 1, due: addDays(today, 1), reps: 1, lapses: 0, last: today };
}

/** Map session accuracy (0..1) to SM-2 quality (0..5). */
export function accuracyToQuality(acc) {
  if (acc >= 0.95) return 5;
  if (acc >= 0.85) return 4;
  if (acc >= 0.70) return 3;
  if (acc >= 0.50) return 2;
  if (acc >= 0.30) return 1;
  return 0;
}

/**
 * Apply a review with given quality (0–5). Returns a NEW record.
 * q >= 3: success → grow interval. q < 3: lapse → shrink (not reset).
 */
export function applyReview(rec, q, today = todayStr()) {
  const r = { ...(rec ?? newRecord(today)) };
  r.reps = (r.reps ?? 0) + 1;
  r.last = today;

  if (q >= 3) {
    // SM-2 ease update
    r.ease = clamp(r.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), MIN_EASE, 3.2);
    if (r.interval <= 1) r.interval = q >= 4 ? 3 : 2;
    else if (r.interval <= 3) r.interval = Math.round(r.interval * (q >= 4 ? 2.4 : 1.8));
    else r.interval = Math.round(r.interval * r.ease * (q === 3 ? 0.85 : 1));
  } else {
    r.lapses = (r.lapses ?? 0) + 1;
    r.ease = clamp(r.ease - 0.2, MIN_EASE, 3.2);
    r.interval = Math.max(1, Math.round(r.interval * 0.4));
  }
  r.interval = clamp(r.interval, 1, MAX_INTERVAL);
  r.due = addDays(today, r.interval);
  return r;
}

/**
 * Retrieval strength in [0,1]: exponential decay with the interval as
 * half-life. 1.0 right after review → 0.5 when due → keeps decaying if late.
 */
export function strength(rec, today = todayStr()) {
  if (!rec?.last) return 0;
  const elapsed = Math.max(0, daysBetween(rec.last, today));
  if (elapsed === 0) return 1;
  return Math.pow(2, -elapsed / Math.max(1, rec.interval));
}

/** Strength bucket for UI: 4=fresh … 0=critical. */
export function strengthBars(rec, today = todayStr()) {
  const s = strength(rec, today);
  if (s >= 0.8) return 4;
  if (s >= 0.6) return 3;
  if (s >= 0.45) return 2;
  if (s >= 0.3) return 1;
  return 0;
}

export function isDue(rec, today = todayStr()) {
  return !!rec && daysBetween(today, rec.due) <= 0;
}

/**
 * Order skills for a review session: most overdue / weakest first.
 * `records` is { skillId: rec }. Returns array of skillIds.
 */
export function dueSkills(records, today = todayStr()) {
  return Object.entries(records ?? {})
    .filter(([, rec]) => isDue(rec, today))
    .sort((a, b) => strength(a[1], today) - strength(b[1], today))
    .map(([id]) => id);
}

/** Skills due within the next `horizon` days (for forecast UI). */
export function dueForecast(records, horizon = 7, today = todayStr()) {
  const out = Array.from({ length: horizon + 1 }, () => 0);
  for (const rec of Object.values(records ?? {})) {
    const d = daysBetween(today, rec.due);
    if (d <= 0) out[0]++;
    else if (d <= horizon) out[d]++;
  }
  return out; // out[0] = due now, out[k] = due in k days
}

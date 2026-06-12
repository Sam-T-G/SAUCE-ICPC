// ============================================================================
// store.js — application state: persistence, subscriptions, import/export
// Single JSON blob in localStorage; debounced writes; versioned migrations.
// ============================================================================
import { todayStr } from './util.js';

const KEY = 'sauce-academy-v1';
export const SCHEMA_VERSION = 1;

export function defaultState() {
  return {
    v: SCHEMA_VERSION,
    profile: {
      name: '',
      emoji: '🌶️',
      createdAt: todayStr(),
      dailyGoal: 50,            // XP per day
      theme: 'dark',
      sound: true,
      pistonUrl: 'https://emkc.org/api/v2/piston/execute',
    },
    onboarded: false,
    xp: { total: 0 },
    streak: { current: 0, best: 0, lastDay: '', freezes: 1, freezeEarnedAt: 0 },
    mastery: {},                // skillId → { level, sessions, learned, lastLevelDay }
    srs: {},                    // skillId → SM-2 record
    missed: {},                 // skillId → [exercise ids] (targeted review pool)
    problems: {},               // problemKey → { solved, at }
    badges: {},                 // badgeId → date earned
    unitTests: {},              // unitId → { passed, best, at }
    activity: {},               // day → { xp, ex, ms }
    exStats: { attempts: 0, correct: 0, byType: {} },
    sessionsCount: 0,
  };
}

let state = null;
const listeners = new Set();
let saveTimer = null;

function migrate(raw) {
  // Future-proofing: bump SCHEMA_VERSION and transform here when shape changes.
  const base = defaultState();
  const merged = { ...base, ...raw };
  // deep-merge the few nested objects we care about
  for (const k of ['profile', 'xp', 'streak', 'exStats']) {
    merged[k] = { ...base[k], ...(raw?.[k] ?? {}) };
  }
  merged.v = SCHEMA_VERSION;
  return merged;
}

export function loadState() {
  if (state) return state;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    state = raw ? migrate(raw) : defaultState();
  } catch {
    console.warn('SAUCE: corrupted save, starting fresh (old value backed up)');
    try { localStorage.setItem(KEY + '-backup', localStorage.getItem(KEY) ?? ''); } catch { /* ignore */ }
    state = defaultState();
  }
  return state;
}

export function getState() { return state ?? loadState(); }

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn('SAUCE: save failed', e); }
  }, 120);
}

/** Mutate state via fn(state); notifies subscribers and persists. */
export function update(fn) {
  fn(getState());
  persist();
  for (const l of listeners) l(state);
  return state;
}

/** Subscribe to state changes; returns unsubscribe. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Force-save immediately (e.g., before export/unload). */
export function flush() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(KEY, JSON.stringify(getState())); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Import / export (team sharing)
// ---------------------------------------------------------------------------

export function exportJSON() {
  flush();
  return JSON.stringify({ app: 'sauce-academy', exportedAt: new Date().toISOString(), state: getState() }, null, 2);
}

/** Validate + load a full progress export. Returns error string or null. */
export function importJSON(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { return 'Not valid JSON.'; }
  const s = parsed?.state ?? parsed;
  if (!s || typeof s !== 'object' || !s.profile || !('xp' in s)) {
    return 'Not a SAUCE Academy export.';
  }
  state = migrate(s);
  flush();
  for (const l of listeners) l(state);
  return null;
}

/** Parse a teammate's export for the Team view without touching our state. */
export function parseTeammate(text) {
  try {
    const parsed = JSON.parse(text);
    const s = parsed?.state ?? parsed;
    if (!s?.profile) return null;
    return migrate(s);
  } catch { return null; }
}

export function resetAll() {
  state = defaultState();
  flush();
  for (const l of listeners) l(state);
}

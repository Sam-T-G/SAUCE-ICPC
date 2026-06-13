# SAUCE Academy — Architecture

A technical reference for the codebase: how the pieces fit, where state lives,
how a lesson flows from tap to graded result, and where to plug in new content
or features. Written for a developer who has cloned the repo and wants to
change something without breaking it.

> **One-sentence model:** a static, zero-build single-page app of plain ES
> modules; a tiny observable store in `localStorage` is the single source of
> truth; a hash router swaps view renderers into one container; the learning
> engine and SRS scheduler are pure functions the views call.

---

## 1. Big picture

```
                          index.html
                  (loads styles, mounts <script type=module src=src/main.js>)
                               │
                               ▼
        ┌──────────────────────────────────────────────────┐
        │  main.js  — boot · hash router · shell · onboarding │
        └──────────────────────────────────────────────────┘
              │ renders one view into #view on each route
              ▼
   ┌───────────────────────── views/ ─────────────────────────┐
   │ path · review · problems · handbook · stats · team · coach │
   │ · settings        (+ lesson.js = full-screen overlay)      │
   └────────────────────────────────────────────────────────────┘
        │ read/derive            │ start sessions / grade
        ▼                        ▼
   ┌─────────┐  pure fns   ┌──────────┐   pure fns   ┌────────┐
   │ store.js │◀──────────▶│ engine.js │─────────────▶│ srs.js │
   │ (state)  │            │ (rules)   │              │ (sched)│
   └─────────┘            └──────────┘               └────────┘
        ▲                        │ builds sessions from
        │ subscribe/update       ▼
        │                 ┌──────────────┐   lazy import()   ┌──────────────┐
        │                 │ curriculum.js │◀────────────────▶│ data/units/* │
        │                 │ (+typein merge)│                  │ data/typein  │
        │                 └──────────────┘                   └──────────────┘
        │
   localStorage ("sauce-academy-v1")  ← persisted JSON blob
```

There is **no framework, no bundler, no build step**. The browser loads
`index.html`, which pulls four stylesheets and one module entrypoint. Every
`.js` file is a native ES module; imports resolve relative paths at runtime.
This is deliberate — the app must run from `file://`, a `python3 -m
http.server`, or GitHub Pages with zero tooling, and a teammate must be able to
read any file top-to-bottom without chasing a transpile chain.

---

## 2. Directory map

| Path | Lines¹ | Responsibility |
|---|---|---|
| `index.html` | 40 | App shell skeleton: sidebar, main container, tabbar, toast host, FX canvas, `<noscript>` fallback, PWA manifest link. |
| `src/main.js` | — | Boot sequence, hash router, sidebar + mobile tabbar rendering, onboarding flow, service-worker registration. |
| `src/store.js` | — | The state object, `localStorage` persistence (debounced), pub/sub, versioned migration, JSON import/export. |
| `src/engine.js` | — | Learning rules: session building, grading, XP/levels/ranks, mastery + unlock logic, streaks, badges, external-problem tracking. **The pedagogy lives here.** |
| `src/srs.js` | — | SM-2-derived spaced-repetition scheduler: interval growth, strength decay, due lists, forecasts. Pure, fully unit-tested. |
| `src/exercises.js` | — | The 11 exercise-widget renderers + a dispatcher. Each returns a uniform controller. |
| `src/highlight.js` | — | Dependency-free C++ syntax highlighter + `codeBlock()` element builder. |
| `src/runner.js` | — | Remote C++ compile/run via the Piston API (queued for rate limits). |
| `src/audio.js` | — | WebAudio synthesizer for feedback sounds (no audio files). |
| `src/fx.js` | — | Visual juice: confetti canvas, floating XP, toasts. |
| `src/util.js` | — | DOM builder (`el`/`mount`), markdown-lite, date math, answer/code/output normalization, SVG ring, clipboard, download. |
| `src/views/*.js` | 1449 | One renderer per tab (8) plus `lesson.js`, the full-screen session player. |
| `data/curriculum.js` | — | `UNITS`/skill **metadata** + derived indexes + the lazy content loader that merges `typein.js` drills into each skill. |
| `data/units/u01..u12.js` | 13519 | Lesson **content**: each exports `SKILLS = { skillId: { theory, exercises, problems } }`. |
| `data/typein.js` | — | Hand-written "type-the-code" drills, merged into skill pools at load. |
| `data/handbook.js` | — | The SAUCE reference sections + the "Which tool?" decision-tree (`WIZARD`). |
| `styles/{tokens,base,components,views}.css` | 1355 | Design system, cascade-ordered: variables → resets/layout → reusable components → view-specific. |
| `tests/*` | 880 | Four test layers (see `docs/TESTING.md`). |
| `docs/*` | — | This file and its siblings. |
| `SAUCE.cpp` | 936 | The original handbook — preserved at the root; `data/handbook.js` is its structured descendant. |

¹ Approximate, from the audit. `data/` totals ~14.9k lines (content-heavy by
design); hand-written engine/UI code (`src/` + `styles/`) is ~3.5k.

---

## 3. The state model (`store.js`)

All durable state is **one JSON object** under the `localStorage` key
`sauce-academy-v1`. Shape (from `defaultState()`):

```js
{
  v: 1,                       // schema version (drives migrate())
  profile: { name, emoji, createdAt, dailyGoal, theme, sound, pistonUrl },
  onboarded: false,
  xp: { total: 0 },
  streak: { current, best, lastDay, freezes, freezeEarnedAt },
  mastery: { [skillId]: { level, sessions, learned, lastLevelDay } },
  srs:     { [skillId]: { ease, interval, due, reps, lapses, last } },
  missed:  { [skillId]: [exerciseId, …] },     // the mistake bank
  problems:{ [platform:id]: { solved, at, assisted, resolveDue, resolved } },
  badges:  { [badgeId]: dateEarned },
  unitTests:{ [unitId]: { passed, best, at } },
  activity:{ [YYYY-MM-DD]: { xp, ex, ms, sessions } },  // heatmap + charts
  exStats: { attempts, correct, byType: { [type]: { a, c } } },
  sessionsCount: 0,
}
```

**Access contract.** Never mutate state directly from a view. The only writer
is:

```js
update((state) => { state.xp.total += 10; });  // mutate, then it persists + notifies
```

`update()` runs the mutator, schedules a debounced write (120 ms), and calls
every subscriber. Reads use `getState()`. `subscribe(fn)` returns an
unsubscribe; `main.js` subscribes once to re-render the nav (streak badge, due
count). `flush()` forces an immediate synchronous write (used before
export/unload).

**Resilience.** A corrupt blob is caught on load, backed up to
`sauce-academy-v1-backup`, and replaced with a fresh default — the app never
white-screens on bad storage. `migrate()` shallow-merges an old blob over the
current default (deep-merging the four nested scalar objects), so adding a new
top-level field is forward-compatible without a version bump; bump
`SCHEMA_VERSION` and add a transform only when reshaping existing data.

**Portability.** `exportJSON()` wraps the state with an envelope;
`importJSON()` validates and replaces; `parseTeammate()` reads someone else's
export **without touching your state** (the Team tab uses this to build the
leaderboard). This is the entire "backend": files in, files out.

---

## 4. Routing & the shell (`main.js`)

- **Router.** `location.hash` (`#/learn`, `#/problems/two-pointers`) is the
  single navigation primitive. `currentRoute()` parses `page` + `args`;
  `route()` looks up the matching `NAV` entry, clears `#view`, and calls that
  view's `render(container, rerender, args)`. `hashchange` re-runs `route()`.
  No history library, no client-side routing framework.
- **The rerender callback.** Every view receives a `rerender` function (just
  `() => route()`). Views call it after an action that changes state (finishing
  a lesson, toggling a problem) to repaint. Views are **idempotent
  re-render-from-state functions** — there is no incremental DOM diffing; a
  view tears down `#view` and rebuilds. This is fast enough because views are
  small and the data is local.
- **Shell.** `renderNav()` paints the same nav model into both the desktop
  `.sidebar` and the mobile `.tabbar`; the active item and live badges (review
  due-count) are derived from state each paint.
- **Onboarding.** If `state.onboarded` is false, `onboard()` runs a 3-step
  wizard (handle → avatar → daily goal) and flips the flag. Otherwise `route()`
  renders the current hash (default `learn`).
- **Service worker.** Registered only on `http(s)` (skipped on `file://`).
  `sw.js` is network-first with a cache fallback for offline practice.

---

## 5. The learning engine (`engine.js`)

The rules layer. Pure-ish: it reads/writes state through `update()` but the
scheduling math is delegated to `srs.js`. Key exports:

**Progression & unlocks**
- `masteryOf`, `isSkillUnlocked`, `isUnitUnlocked`, `currentSkill` — the path's
  gating. A skill unlocks when the previous one reaches level ≥1, or when its
  unit test is passed (jump-ahead). `currentSkill()` is the single "next thing
  to do."
- `unitProgress`, `overallProgress` — completion ratios (levels 1–3 count
  toward "course done"; 4–5 are mastery extras).
- `rankFor(xp)` — maps total XP onto the Codeforces-flavored rank ladder
  (Newbie → Legendary Grandmaster) with progress to next.

**Session building** — `buildSession(kind, opts)` returns
`{ kind, items, … }` where each item is `{ skillId, ex, isReview }`. Kinds:
`learn` (theory + intro exercises), `practice` (difficulty mix scaled to
mastery level + 1–2 interleaved reviews from weaker earlier skills, **topic
tags hidden**), `review` (due skills, weakest-first, mistakes preferred),
`mistakes` (the bank), `legendary` (harder mix, timed), `unittest` (spread
across a whole unit). Difficulty mixes target ~80 % success and the in-session
ordering opens easy / ends on a win (`arcOrder`).

**Grading** — `gradeSession(meta, results)` is the heart. In one `update()` it:
1. computes effort-weighted XP (base + difficulty bonus + combo bonus + perfect
   bonus; ×1.2 for reviews, ×0.5 for grinding an already-mastered skill;
   flat bonuses for legendary/unit-test passes);
2. logs the day's activity, exercise stats, and the **mistake bank** (any
   first-try miss is recorded; a later first-try success clears it);
3. updates **mastery** (learn → L1; practice ≥80 % → up to L4, with the L3→L4
   *different-calendar-day* spacing gate; legendary pass → L5 + a long SRS
   interval) and refreshes each touched skill's **SRS** record;
4. bumps the **streak** (freezes auto-spend across gaps; one earned per 7-day
   run, capped at 2);
5. evaluates **badges**.
   It returns a summary (`{ xp, leveled, badges, streak, rankBefore/After,
   passed }`) the lesson player uses for the celebration screen.

**External problems** — `markProblem` (solo vs editorial-assisted),
`markResolved`, `resolveQueue`. Assisted solves schedule a **cold re-solve 14
days out** — the mistake-bank idea applied to real problems.

`BADGES`, `RANKS`, `XP_RULES` are exported tables; tweak them in one place.

---

## 6. The scheduler (`srs.js`)

A self-contained, side-effect-free SM-2 derivative. A record is
`{ ease, interval, due, reps, lapses, last }`.

- `accuracyToQuality(acc)` maps session accuracy → SM-2 quality 0–5.
- `applyReview(rec, q, today)` grows the interval on success (1 → 2-3 → ×ease)
  and **shrinks rather than resets** on a lapse (CP rust ≠ amnesia); clamps
  ease to [1.3, 3.2] and interval to ≤120 days.
- `strength(rec, today)` = `2^(−elapsed/interval)` — the half-life decay curve
  (1.0 right after review, 0.5 when due). `strengthBars` buckets it for the UI.
- `isDue`, `dueSkills` (weakest-first), `dueForecast` (next-7-days histogram).

Because it is pure, `tests/engine.test.js` exercises it directly with fixed
dates — no mocking.

---

## 7. The exercise widget system (`exercises.js`)

The render contract every type honors:

```js
renderExercise(rootEl, exercise, ctx) → controller
//   ctx.setReady(bool)  ← widget signals when an answer is checkable
//   controller = { check()→{correct, detail?}, lock(), reveal(), focus(),
//                  keypick?(n) }
```

`lesson.js` owns the surrounding chrome (progress bar, feedback bar,
re-queue, celebration) and never needs to know which type it is rendering — it
just calls `check()` and reads `correct`. Adding a type = write one renderer +
add one `case` to the dispatcher + one validator branch + one CONTENT_SPEC row.
The 11 types, in ladder order:

`output` & code-reading `mcq` (trace) → `parsons` / `order` / `bank`
(assemble) → `typein` / `fill` (typed recall) → `code` (write & run) — plus
`tf`, `multi`, `match` as supporting checks. `typein` is the newest rung:
inline text inputs inside highlighted code, whitespace-forgiving but
**case-sensitive** (`codeMatches` in `util.js`).

`code` exercises run the user's C++ through `runner.js` (Piston) against test
cases, or fall back to honest self-check if the judge is unreachable.

---

## 8. Content pipeline (`curriculum.js` → `data/units/*`)

- `curriculum.js` holds only **metadata**: unit/skill ids, titles, icons,
  colors, blurbs, plus derived `SKILL_INDEX`/`SKILL_ORDER` and the unlock
  ordering. It is small and always loaded.
- **Content is lazy.** `loadUnitContent(unitId)` dynamically `import()`s
  `data/units/uXX.js` the first time a unit is needed, caches the promise, and
  **merges the matching `data/typein.js` drills into each skill's exercise
  array**. So `typein` drills live in one curated file but appear in-pool at
  runtime. The validator performs the identical merge so what it checks is what
  ships.
- A unit file exports `SKILLS = { [skillId]: { id, objectives, theory[],
  exercises[], problems[] } }`. The full schema and quality bar are in
  `docs/CONTENT_SPEC.md`; `data/units/u01.js` is the canonical exemplar.

---

## 9. A lesson, end to end

1. **Path** (`views/path.js`) shows the winding node map from
   `mastery`/`srs`/`unlock` state. Tapping a node opens a flyout; "Learn" or
   "Practice" calls `startSession(kind, { skillId }, rerender)`.
2. **`startSession`** (`views/lesson.js`) calls `engine.buildSession()`, then
   mounts a full-screen `.lesson-screen` into `#overlay`.
3. For `learn`, theory cards render first (with `highlight.js` code blocks),
   then exercises. Each exercise is handed to `renderExercise`; the footer
   "Check" button is enabled when `ctx.setReady(true)` fires.
4. On check: `controller.check()` returns correctness. Correct → `sfx.correct`,
   floating XP, advance. Wrong → `sfx.wrong`, the item is **re-queued** (up to
   twice) and an **elaborated explanation** appears. Mistakes must be cleared
   to finish; sessions end on a win.
5. **Finish** → `engine.gradeSession()` runs (XP, mastery, SRS, streak,
   badges), confetti fires, the celebration screen shows the summary, and the
   `rerender` callback repaints the path with the new crown/level.

---

## 10. Styling

Plain CSS, four files loaded in cascade order: `tokens.css` (CSS variables —
the entire palette, type scale, spacing, motion), `base.css` (reset, app-shell
layout, mobile breakpoints), `components.css` (reusable: buttons, cards, pills,
progress, code blocks, modals, toasts), `views.css` (per-view: the path nodes,
lesson player, exercise widgets incl. `typein`). Dark is default; light is a
`:root[data-theme="light"]` token override. `prefers-reduced-motion` disables
animations. No preprocessor.

---

## 11. Extension points (where to add things)

| You want to… | Touch | Then |
|---|---|---|
| Add/fix lesson content | `data/units/uXX.js` | `node tests/validate-content.js uXX` |
| Add a "type-the-code" drill | `data/typein.js` | validator merges + checks it |
| Add an exercise **type** | `exercises.js` (renderer + dispatcher), `validate-content.js` (schema), `CONTENT_SPEC.md`, `widgets.test.mjs` | a `views.css` block |
| Change XP / mastery / streak rules | `engine.js` (`XP_RULES`, mastery fns, `bumpStreak`) | update `engine.test.js` |
| Change the SRS curve | `srs.js` | update `engine.test.js` |
| Add a tab/view | `views/<name>.js` + a `NAV` entry in `main.js` | — |
| Add a badge / rank | `engine.js` (`BADGES` / `RANKS`) | — |
| Add a handbook section / wizard branch | `data/handbook.js` | — |
| Restyle | `styles/tokens.css` first, then components | — |

**Invariants worth not breaking:** views render purely from state and call
`rerender` after writes; the only writer is `update()`; `srs.js` and the
scheduling math stay pure; every exercise carries a teaching `explain`; `code`
solutions must compile and pass (the validator enforces this). See
`docs/TESTING.md` for how each invariant is guarded.

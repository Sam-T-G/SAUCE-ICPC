# SAUCE Academy — Content Authoring Spec

This document defines the exact schema and quality bar for unit content files
(`data/units/uXX.js`). **`data/units/u01.js` is the canonical exemplar — study
it before writing anything.** The validator (`node tests/validate-content.js uXX`)
must pass with zero errors before content ships.

## File shape

```js
export const SKILLS = {
  'skill-id': {
    id: 'skill-id',                 // must match data/curriculum.js
    objectives: ['...', '...'],     // 2-4 measurable goals
    theory: [ /* 4-6 cards */ ],
    exercises: [ /* 10-13 exercises */ ],
    problems: [ /* 3-4 external problems */ ],
  },
  // ...every skill of this unit, exact ids from data/curriculum.js
};
```

## Theory cards (4–6 per skill)

```js
{
  h: 'Card heading',                  // short, concrete
  md: 'Body text…',                   // 50-180 words. Markdown-lite ONLY:
                                      // **bold**, *italic*, `code`, \n for breaks.
                                      // NO headers, NO bullet markdown («•» chars are fine).
  code: '...',                        // optional C++ snippet (see code rules)
  note: 'Trap or pro-tip…',           // optional callout
  noteKind: 'tip' | 'warn' | 'danger' // optional, default tip
}
```

Rules:
- One idea per card. Card 1 = the *why/when* (recognition cues), middle cards =
  the *how* with code, last card = traps/edge cases or complexity summary.
- Code snippets carry **subgoal comments** (`// relax edges`, `// fall back`) —
  research says labeled steps transfer better (Margulieux et al.).
- State complexities explicitly. State recognition cues explicitly
  ("constraints whisper n ≤ 20 → bitmask").

## Exercises (10–13 per skill)

Common fields, all REQUIRED unless noted:

```js
{
  id: 'shortskill-N',     // unique within the skill, e.g. 'greedy-7'
  type: '...',            // one of the 10 types below
  diff: 1 | 2 | 3,        // 1 warmup/trace · 2 core · 3 stretch
  prompt: '...',          // markdown-lite. For tf you may use `statement` instead.
  explain: '...',         // REQUIRED, ≥20 chars. Teach the WHY, not just the what.
                          // This shows after every answer (right or wrong).
  hint: '...',            // optional; include on most diff-3 exercises
  code: '...',            // optional code block shown under the prompt
}
```

### The 10 types

| type | extra fields | notes |
|---|---|---|
| `mcq` | `options: [..2-5 strings]`, `answer: index` | options can be code via ``` blocks or plain text |
| `tf` | `statement`, `answer: true/false` | |
| `multi` | `options`, `answers: [indexes]` | "select all that apply" |
| `fill` | `answer: 'str'` or `['accepted','variants']`, `placeholder?` | comparison is whitespace/case-insensitive |
| `output` | `code`, `answer: 'exact output'` | THE tracing exercise. Multi-line answers use \n |
| `parsons` | `lines: [correct order]`, `distractors?: [wrong lines]` | ≥3 lines, no duplicate lines |
| `order` | `items: [correct order]` | non-code ordering (steps, complexities) |
| `bank` | `code` with `___` slots, `answer: [token per slot]`, `distractors?` | tap-to-fill completion |
| `typein` | `code` with `___` slots, `answer: [per slot: 'str' or ['variants']]` | **type code directly into the blanks**. Whitespace-forgiving, case-SENSITIVE. Keep each blank ≤30 chars and focused (an expression, a condition, a call). The typed-recall rung: harder than bank, gentler than `code`. |
| `match` | `pairs: [[l,r] ×3-6]` | lefts unique, rights unique |
| `code` | `starter`, `tests: [{input, expected} ×2-3]`, `solution` | ≤1 per skill. **solution MUST compile (g++ -std=c++17) and pass its tests — the validator executes it.** Full programs reading stdin/writing stdout. |

### Pedagogy requirements (validator-checked or review-checked)

1. **Ladder**: ≥2 tracing exercises (`output` or code-reading `mcq`) at diff 1–2
   BEFORE heavier production tasks. Sequence within a skill should roughly
   follow trace → assemble (`parsons`/`bank`) → typed recall (`typein`/`fill`)
   → produce (`code`). Aim for ≥1 `typein` per skill where the skill has a
   canonical code idiom worth typing from memory.
2. **Variety**: ≥5 distinct types per skill. Mix keeps sessions alive.
3. **Difficulty spread**: at least two diff-1, four diff-2, two diff-3.
4. **Distractors are diagnoses**: every wrong MCQ option / parsons distractor /
   bank distractor should be a *real mistake a learner makes* (off-by-one, `int`
   overflow, `>=` vs `>`, missing reset between test cases) — never filler.
5. **explain teaches**: name the principle, the trap, or the recognition cue.
   If the learner got it wrong, the explanation alone should fix the
   misconception. 1-3 sentences.
6. **Spot-the-bug exercises** (mcq + code where one line is buggy) are gold —
   include 1-2 per skill.
7. At least one exercise per skill should connect to **constraint reading**
   ("n ≤ 10⁵, which approach survives?") where it makes sense.

## Problems (3–4 per skill)

```js
{ name: 'Exact Problem Name', platform: 'CSES' | 'Codeforces',
  id: '1640' | '4A', rating: 800,            // rating for CF only
  url: 'https://cses.fi/problemset/task/1640', // or https://codeforces.com/problemset/problem/4/A
  difficulty: 'intro' | 'easy' | 'med' | 'hard',
  why: 'One sharp sentence: what this problem trains.' }
```

**Use ONLY problems from the verified pool given in your task brief.** Do not
invent problems, ids, or URLs. Order from easiest to hardest. `difficulty`
mapping guidance: CSES intro section / CF ≤900 → `intro`; CF 1000-1300 or easy
CSES → `easy`; CF 1400-1700 or mid CSES → `med`; CF 1800+ or hard CSES → `hard`.

## C++ code rules (theory + exercises)

- Contest dialect: `#include <bits/stdc++.h>`, `using namespace std;`,
  `using ll = long long;` where useful. 4-space indent, brackets K&R style.
- Inside JS template literals: write C++ `"\n"` as `"\\n"`, escape backticks
  and `${` if they ever appear. Prefer template literals for multi-line code.
- Snippets in theory should be runnable-shaped (or clearly fragmentary).
- `code`-exercise solutions: complete programs, deterministic output, no
  platform-specific headers beyond bits/stdc++.h.

## Voice

Direct, energetic, zero fluff. You're a sharp coach talking to a smart college
student: "This loop is O(n²) — at n = 10⁵ that's 10¹⁰ operations. Dead." Mild
humor welcome, condescension never. Address the reader as *you*. Celebrate
traps as war stories, not shame.

## Workflow for authors

1. Read `data/units/u01.js` end to end.
2. Write your unit file.
3. `node tests/validate-content.js uXX` → fix until **0 errors** (warnings:
   judgment call, aim for 0).
4. Re-read your weakest skill and make its explanations sharper.

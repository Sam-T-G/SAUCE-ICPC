// ============================================================================
// views/coach.js — the training meta-guide: how to use the app, how to
// practice, how to run team training. Advice is sourced (see docs/PEDAGOGY.md
// for full citations).
// ============================================================================
import { el, md } from '../util.js';

const SECTIONS = [
  {
    icon: '🔁', title: 'The weekly loop that works',
    body: [
      ['Daily (15–30 min)', 'One lesson or review session here. **Reviews first** when the Review tab shows a badge — due skills decay fastest. This is the Duolingo-shaped habit layer: small, daily, non-negotiable.'],
      ['2–3× per week (60–120 min)', 'Real problems from the Problems tab at the edge of your ability. Think on paper before touching the keyboard. One genuinely hard problem beats five comfortable ones.'],
      ['Weekly (team)', 'One virtual contest together (Codeforces Div. 2/3, or a past ICPC regional on Kattis), 3 people, **one keyboard**, then a post-mortem: what did we read wrong, what did we switch too late, what bug ate 40 minutes?'],
      ['After every contest', 'Upsolve 1–2 problems just past what you solved (Errichto’s rule: not all of them — the ones within reach). Log assisted solves honestly; the app schedules your cold re-solves.'],
    ],
  },
  {
    icon: '📈', title: 'Picking problem difficulty',
    body: [
      ['The stretch zone', 'Practice problems roughly **+100 to +300 above your Codeforces rating** (community consensus, e.g. CPHub mentors). You should fail sometimes — a ~70–80% success rate is the learning sweet spot; 100% means you’re rehearsing, not training.'],
      ['Errichto’s editorial rule', '*"If you are **stuck** for 20–30 minutes (an hour for harder problems), read the editorial and make sure you understand it."* Key word: stuck. Still generating ideas ≠ stuck.'],
      ['Michael Cao (USACO Guide)', '*"It’s important to **implement every problem** you read the editorial of."* Reading without implementing is how you fool yourself.'],
      ['The self-deception trap (-is-this-fft-)', 'Grinding problems you already know how to solve feels productive and does nothing. Counting solved problems is not the goal; being unable to lie to yourself is. The mistake bank and cold re-solves exist for exactly this.'],
    ],
  },
  {
    icon: '🧠', title: 'Why the app works this way',
    body: [
      ['Spaced repetition', 'Memory decays roughly exponentially (Ebbinghaus). Each successful review extends the interval (SM-2-style scheduling, same family as Anki and Duolingo’s model). Skills crack on the path when they fade — fix them before they rot.'],
      ['Interleaving', 'Mixed review sessions deliberately shuffle topics. In Rohrer & Taylor’s experiments, interleaved practice scored **~3× higher on delayed tests** than blocked practice (63% vs 20%) — because real contests don’t tell you the topic. That’s also why review exercises hide the skill name.'],
      ['Retrieval practice', 'Testing beats re-reading for retention (Roediger & Karpicke 2006). That’s why theory cards are short and exercises are many.'],
      ['Worked examples → fading', 'Lessons move from traces and Parsons problems to typed recall and free code — the completion-problem ladder validated in programming education (van Merriënboer; Ericson’s Parsons research: equal learning in less time).'],
      ['Mastery gates + spacing gates', 'Level 4 requires practicing on a *different day*; level 5 (Legendary) is a timed, no-hints challenge. Cramming one skill to gold in an evening is specifically impossible — by design (Duolingo learned this the hard way).'],
      ['Honest failure', 'A session at 60% with hard exercises teaches more than a perfect easy one (desirable difficulties — Bjork). The XP system pays reviews more and pays grinding mastered skills less.'],
    ],
  },
  {
    icon: '🤝', title: 'Team strategy (the 3-brains-1-keyboard game)',
    body: [
      ['Opening protocol', 'Fastest typist sets up the template + compile script. The other two split the problemset — one reads from the front, one from the back — hunting the easiest problem. Hand it to the typist with a one-line spec.'],
      ['Keyboard discipline', 'The computer is for *typing*, not thinking. Solve on paper. Debug on paper — print your code with debug output and step away. An idle keyboard during a 5-hour contest is burning rate.'],
      ['Penalty math', 'Rank = problems solved; ties by total time = sum of (minutes to first AC) + **20 min per rejected run** on solved problems only. Wrong submits on a problem you eventually solve are expensive; wrong submits on one you never solve are free. Submit boldly at the end, carefully at the start.'],
      ['Scoreboard reading', 'A problem many teams solved is easy — if you haven’t read it yet, someone should. In the frozen last hour, converge: one codes the best pending problem, one shoulder-checks, one writes adversarial tests.'],
      ['The notebook (TRD)', 'ICPC allows **25 single-sided pages** of printed reference. Build yours from the Handbook tab + KACTL-style snippets, and *practice retrieving from it* — a notebook you’ve never used under pressure is decoration. Page numbers top-right, team name top-left.'],
      ['Roles', 'Common splits: coder / math-solver / manager-tester, or three all-rounders owning disjoint topics (graphs vs DP vs geometry/strings). Decide before the contest, not during.'],
    ],
  },
  {
    icon: '🗓️', title: 'A 16-week plan to regionals',
    body: [
      ['Weeks 1–4 — Foundations', 'Units 1–4 here (C++ → STL → patterns → math). Daily lessons + the CSES Introductory set. Everyone reaches “can implement BFS/sort/two-pointers from memory”.'],
      ['Weeks 5–8 — Core', 'Units 5–7 (graphs, DP, trees). First weekly team virtual (Div. 3 → Div. 2). Start the team notebook draft.'],
      ['Weeks 9–12 — Power tools', 'Units 8–10 (range queries, strings, flows). Weekly virtuals become past **regionals**. Track: solved-without-editorial rate per topic.'],
      ['Weeks 13–16 — Contest craft', 'Unit 12 + simulation: full 5-hour sessions, printed notebook only, one machine, real penalty accounting. Upsolve everything as a team. Taper the week before: reviews only, sleep, print three notebook copies.'],
    ],
  },
];

export function renderCoach(root) {
  root.replaceChildren(
    el('h1', {}, '🎓 Coach'),
    el('p', { class: 'muted' }, 'How to train, what the science says, and how not to lie to yourself. Full citations live in ',
      el('a', { href: 'docs/PEDAGOGY.md', target: '_blank' }, 'docs/PEDAGOGY.md'), '.'));

  for (const s of SECTIONS) {
    const card = el('div', { class: 'card mb-2' });
    card.append(el('div', { class: 'card-title' }, el('span', { class: 't-ico' }, s.icon), s.title));
    for (const [h, body] of s.body) {
      card.append(el('div', { style: { marginBottom: '12px' } },
        el('div', { style: { fontWeight: 800, fontSize: 'var(--fs-sm)', marginBottom: '2px' } }, h),
        el('div', { class: 'muted', style: { fontSize: 'var(--fs-sm)' }, html: md(body) })));
    }
    root.append(card);
  }

  root.append(el('div', { class: 'callout tip' },
    el('span', { class: 'co-ico' }, '🌶️'),
    el('span', { html: '<strong>The only metric that matters:</strong> problems you can solve cold, at the contest, under time. Everything in this app — XP, streaks, crowns — is scaffolding for that. If a mechanic ever pulls you away from real solving, ignore the mechanic.' })));
}

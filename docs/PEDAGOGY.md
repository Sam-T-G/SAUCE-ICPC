# The Science Behind SAUCE Academy

Every mechanic in this app traces to a specific finding in learning science or
to documented product research from Duolingo. This document is the receipts:
**principle → evidence → how SAUCE implements it**. Citations were verified
against primary or multiple independent secondary sources; where a popular
number is shakier than its fame suggests, we say so.

---

## 1. Spaced repetition — the Review tab

**Evidence.** Memory decays roughly exponentially (Ebbinghaus, 1885).
Cepeda, Pashler, Vul, Wixted & Rohrer (2006, *Psychological Bulletin* 132(3))
synthesized 839 assessments across 317 experiments: spacing study sessions
reliably beats massing them, and the optimal gap *grows with how long you need
to remember* — their 2008 follow-up (*Psychological Science* 19(11), 1,350+
participants) found optimal gaps of ~20–40% of a 1-week retention interval,
declining to ~5–10% for 1-year retention. The practical algorithm family
(SuperMemo SM-2, Woźniak 1987/1990; Anki) schedules each item at expanding
intervals. Duolingo's half-life regression models recall as
p = 2^(−Δ/h) and its deployment improved daily engagement by ~12% in an
operational experiment on 3.3M learners (Settles & Meeder, ACL 2016).

**In SAUCE.** Every skill you practice gets an SM-2-derived review record
(`src/srs.js`): success expands the interval (1 → 2-3 → ×ease), struggle
shrinks it (gently — rust isn't amnesia). Displayed skill *strength* uses
exactly the half-life decay curve (strength = 2^(−days/interval)). The Review
tab queues skills when they fall due; the path shows a ⚠ when a skill is
fading. Reviews pay **1.2× XP** because they matter more than new content.

## 2. Retrieval practice — exercises, not re-reading

**Evidence.** Testing yourself beats restudying for retention: Roediger &
Karpicke (2006, *Psychological Science* 17(3)) — at one week, repeated
retrieval retained dramatically more than repeated reading (Experiment 2:
61% vs 40% recall). Meta-analyses agree: Rowland (2014, *Psych. Bulletin*,
61 studies) g = 0.50; Adesope, Trevisan & Sundararajan (2017, *RER* 87(3),
272 effects) g = 0.51 vs restudy.

**In SAUCE.** Theory cards are deliberately short (4–6 per skill); the bulk of
every session is *answering things*: ~10 exercises per lesson, review sessions
that are 100% retrieval. "Re-read theory" exists but is never the scheduled
review activity.

## 3. Interleaving — mixed review, hidden topic tags

**Evidence.** Rohrer & Taylor (2007, *Instructional Science* 35(6)): mixing
problem types hurt practice accuracy (60% vs 89%) but **tripled** delayed-test
performance (63% vs 20%). Taylor & Rohrer (2010, *Applied Cognitive
Psychology* 24(6)): interleaving doubled scores a day later (77% vs 38%,
d = 1.21) — because it trains *choosing the right procedure*, not just
executing it. Meta-analysis: Brunmair & Richter (2019, *Psych. Bulletin*
145(11)) overall g = 0.42 (math tasks g = 0.34).

**In SAUCE.** Review sessions interleave exercises from multiple due skills,
shuffled. Practice sessions inject 1–2 review exercises from *earlier, weaker*
skills. Crucially, interleaved review items are labeled only "🔁 review —
which technique is this?" — **the skill name is revealed only after you
answer**, because identifying the technique from the problem is the actual
ICPC skill (contests don't come with topic tags). The UI tells you mixed
practice feels harder on purpose — performance during practice is a bad proxy
for learning (Soderstrom & Bjork 2015).

## 4. The exercise ladder — tracing → Parsons → completion → writing

**Evidence.** Novices who can't *trace* code rarely *write* it: Lopez,
Whalley, Robbins & Lister (2008, ICER) found tracing + explaining skills
accounted for ~46% of variance in code-writing performance, supporting a skill
hierarchy with tracing below writing. **Parsons problems** (Parsons & Haden
2006) — reordering scrambled code — deliver learning equal to writing/fixing
code **in significantly less time** (Ericson, Margulieux & Rick, Koli Calling
2017; Ericson et al. ITiCSE-WGR 2022 systematic review). **Completion
problems** were validated *specifically for programming*: van Merriënboer
(1990, *J. Educational Computing Research*) — students completing/extending
partial programs outperformed those writing from scratch, with lower dropout.
The **worked-example effect** and its **fading** strategy (Sweller & Cooper
1985; Renkl & Atkinson 2003; worked-examples meta-analysis Barbieri et al.
2023, g = 0.48 in math) say: start from studying solutions, remove support
gradually. Subgoal-labeled examples improve transfer (Margulieux, Guzdial &
Catrambone 2012; Morrison, Margulieux, Ericson & Guzdial, SIGCSE 2016 —
subgoal labels helped specifically on Parsons problems).

**In SAUCE.** Ten exercise types implement the ladder:
`output` (predict-the-output tracing) and code-reading MCQs early; `parsons`
(assemble code) and `bank` (tap tokens into blanks — completion problems) in
the middle; `fill` typed recall next; `code` (write a full program, run
against tests) as the capstone. Difficulty mixes shift upward as your mastery
level grows. Reference code in theory cards carries subgoal comments
(`// relax edges`, `// fall back`).

## 5. Elaborated feedback — every answer explains itself

**Evidence.** Feedback is one of the strongest levers in education (Hattie &
Timperley 2007, *RER* 77(1), synthesis of 12 meta-analyses: d ≈ 0.79; a 2020
re-analysis by Wisniewski, Zierer & Hattie puts the overall average at
d ≈ 0.48 with high variance — still large). The *kind* matters enormously: in
computer-based learning, **elaborated feedback ES = 0.49 vs 0.32 for
showing the correct answer vs 0.05 for bare right/wrong** (Van der Kleij,
Feskens & Eggen 2015, *RER* 85(4)). Kluger & DeNisi (1996): over a third of
feedback interventions *hurt* — especially feedback aimed at the self rather
than the task. Shute (2008): immediate feedback wins for procedural skills
like programming.

**In SAUCE.** The `explain` field is **mandatory on every exercise** — the
content validator rejects exercises without a real explanation. Feedback is
immediate, task-focused, and shown whether you were right or wrong (right
answers deserve the *why* too). Wrong answers get a gentle red, an
explanation, and a re-queue — never a punishment (no hearts; mistakes are the
work, not a resource you run out of).

## 6. Mistakes re-queued until cleared — and a persistent mistake bank

**Evidence.** Duolingo re-presents missed exercises at the end of the lesson
until answered correctly, and ends lessons on easier items so sessions finish
on success (documented in their Method whitepaper and design teardowns). At
CP timescales, top coaches converge on the same loop for *problems*: USACO
Guide's practice page quotes Michael Cao — "it's important to implement every
problem you read the editorial of" — and re-solving later, cold, is the test
that you actually learned it.

**In SAUCE.** In-session: misses re-queue (up to twice) until you clear them;
sessions end on a win. Across sessions: every first-try miss lands in your
**mistake bank**, which feeds targeted "Fix mistakes" sessions and gets
preferentially sampled by reviews. For external problems: marking a solve as
"needed the editorial" schedules a **cold re-solve 14 days later** in the
Review tab. Honesty is cheap here — it only changes *your* schedule.

## 7. Mastery learning + anti-cramming gates

**Evidence.** Bloom (1968 "Learning for Mastery"; 1984 "The 2 Sigma Problem",
*Educational Researcher* 13(6)): mastery procedures moved group instruction
≈1σ; meta-analytically, mastery learning shows ≈0.5σ (Kulik, Kulik &
Bangert-Drowns 1990, *RER* 60(2)) — real, if smaller than the legend.
Duolingo's 2022 path redesign exists because its old skill tree let users
grind one easy skill for streaks/XP; the path made review mandatory and
leveled content compulsory (Duolingo research report DRR-24-04; von Ahn
interviews). Their crown→Legendary system proves mastery *under constraints*
(no hints, ≤3 mistakes).

**In SAUCE.** Skills hold levels 0–5. Learning unlocks practice; each ≥80%
practice session raises a level up to 3. **Level 4 requires practicing on a
different calendar day** (a literal spacing gate — you cannot cram a skill to
gold in one evening). **Level 5 is the Legendary challenge**: timed, no hints,
3-mistake budget, and it rewards you with a slowed decay clock (interval ×2).
Unit tests let strong users **test out** (jump ahead) — the pressure valve
that makes a linear path tolerable for non-beginners (mirroring Duolingo's
"jump here?" exams).

## 8. Desirable difficulties & productive failure — hard on purpose

**Evidence.** Conditions that depress practice performance often improve
long-term learning (Bjork 1994; Bjork & Bjork 2011; Soderstrom & Bjork 2015,
*Perspectives on Psych. Science*). Attempting problems *before* instruction
beats instruction-first for conceptual understanding when followed by
consolidation (productive failure: Kapur 2008; Sinha & Kapur 2021 *RER*
meta-analysis, d = 0.36, up to 0.58 with high design fidelity). Caveat from
the same literature: difficulties are desirable **only when the learner can
eventually succeed** — so difficulty must track skill.

**In SAUCE.** Difficulty mixes target roughly 80% success (Duolingo's
documented sweet spot) and ramp with mastery; stretch (diff-3) exercises
appear from the first session. The Coach tab and review screens *tell you*
why harder-feeling practice is the point — surfacing the
learning-vs-performance distinction so the difficulty doesn't read as a bug.
For real problems, the recommended protocol is attempt-first (20–30 minutes
stuck before the editorial — Errichto's rule), which is productive failure in
its natural habitat.

## 9. Habit architecture — streaks, goals, tiny sessions

**Evidence.** Streaks exploit loss aversion and demonstrably drive
engagement: Duolingo reports retention effects from streak mechanics and ran
600+ streak experiments; an independent RCT with ~60,000 students found
streak-highlighting messages increased platform use *and* math achievement
(Cristia, Cueto, Malamud & Aulagnon, NBER WP 34173). Habit formation takes
~66 days median (18–254 range; Lally et al. 2010). Specific, hard goals beat
"do your best" (Locke & Latham 2002). The forgiveness matters as much as the
fire: streak *freezes* protect against the all-or-nothing collapse.
Honest caveats: gamification's measured learning effects are small-to-medium
and design-dependent (Sailer & Homner 2020, g ≈ 0.49 cognitive); fixation on
metrics can displace learning (Mogavi et al., L@S 2022); leaderboards can
demotivate (Hanus & Fox 2015).

**In SAUCE.** Daily streak with auto-spending freezes (earn one per 7-day
streak, bank max 2); configurable daily XP goal; sessions are 3–7 minutes.
The anti-gaming lessons are built in: **XP is effort-weighted** (harder
exercises pay more, reviews pay 1.2×, grinding an already-mastered skill pays
0.5×), there are no public leagues against strangers — the Team tab compares
only your handful of teammates, and the Stats tab leads with mastery and
accuracy, not raw XP. The Coach tab's last word: if a mechanic ever pulls you
away from real solving, ignore the mechanic.

## 10. Deliberate practice — weakness-targeted drills

**Evidence.** Expert performance tracks effortful practice aimed at current
weaknesses with immediate feedback (Ericsson, Krampe & Tesch-Römer 1993,
*Psych. Review* 100(3)). Honest caveat: deliberate practice explains ~12% of
performance variance overall, ~26% for games (Macnamara, Hambrick & Oswald
2014) — necessary, not sufficient. Competitive programming practitioners
converge on the operational version: practice slightly above your level
(+100–300 rating; "you should struggle or barely miss" — Darren Yao, USACO
Guide), time-boxed editorials (Errichto: stuck 20–30 min → read it, then
implement), upsolve 1–2 problems past your contest performance, and beware
self-deception (counting easy ACs as progress — -is-this-fft-, Codeforces).

**In SAUCE.** Stats surfaces your accuracy *by exercise type* sorted weakest
first ("your deliberate-practice menu") and per-unit mastery gaps. Review
sessions auto-target your weakest skills. The Problems tab's difficulty
ordering and the Coach tab encode the +100–300 / editorial-discipline /
upsolving protocol with named sources.

## 11. Cognitive load — one new thing at a time

**Evidence.** Working memory is the bottleneck for novice programmers
(Sweller 1988; CLT-in-computing review: Duran, Zavgorodniaia & Sorva 2022,
*ACM TOCE* 22(4)). Reducing extraneous load (templates, single-screen
layouts, labeled steps) frees capacity for the actual concept.

**In SAUCE.** Each skill introduces one technique. Code exercises ship a
working template (fast I/O, includes) so attention goes to the algorithm.
Statement, code, and feedback live on one screen. Theory cards are single-idea
chunks with the trap called out explicitly.

## 12. ICPC realities — what the curriculum optimizes for

**Evidence.** Per-contest topic distribution at regionals (Halim & Halim,
*Competitive Programming 3*, Asia regionals table): DP 1–3 problems, graphs
1–2, math 1–2, ad-hoc/greedy 1–3, strings ~1, geometry ~1 — corroborated by
ICPC-Eval's tagging of 139 recent ICPC problems (math/DP/search dominate).
Contest mechanics: 3 people, **one computer**, 5 hours, 8–13 problems;
penalty = minutes to first AC + 20 per prior rejected run, unsolved problems
cost nothing; the scoreboard freezes for the last hour; teams may bring a
**25-page single-sided Team Reference Document** (ICPC World Finals rules;
NAC TRD instructions).

**In SAUCE.** The curriculum weights DP (6 skills) and graphs (8 skills
across two units) accordingly; geometry and advanced strings sit late, sized
for regionals. Unit 12 trains the meta-game itself — constraint forensics,
debugging/stress-testing, penalty math, role protocols, notebook discipline —
with the same exercise machinery as the algorithmic units. The Handbook tab
is a TRD starter kit: copy-ready, tested snippet blocks descended from
`SAUCE.cpp`.

---

## The ten design rules (a checklist for contributors)

1. Schedule re-solves, not re-reads — reviews are retrieval.
2. Hide topic tags in mixed practice; technique-recognition *is* the skill.
3. Ladder every concept: trace → assemble → complete → recall → write.
4. One new idea at a time; template everything else.
5. Explanations on every answer, right or wrong — task-focused, never bare ✓/✗.
6. Mistakes re-queue now, persist in the bank, and return cold later.
7. Mastery gates progression; spacing gates mastery; Legendary proves it under constraints.
8. Difficulty targets ~80% success and tells the user why it stings.
9. Reward effort and review, not volume; never punish mistakes.
10. Every metric is a proxy — the real KPI is problems solved cold at the contest.

## Sources

Selected primary sources (full citation details inline above): Cepeda et al.
2006, 2008 · Roediger & Karpicke 2006 · Rowland 2014 · Adesope et al. 2017 ·
Rohrer & Taylor 2007 · Taylor & Rohrer 2010 · Brunmair & Richter 2019 ·
Parsons & Haden 2006 · Ericson et al. 2017, 2022 · van Merriënboer 1990 ·
Sweller & Cooper 1985 · Renkl & Atkinson 2003 · Barbieri et al. 2023 ·
Margulieux et al. 2012 · Morrison et al. 2016 · Hattie & Timperley 2007 ·
Wisniewski et al. 2020 · Van der Kleij et al. 2015 · Kluger & DeNisi 1996 ·
Shute 2008 · Bloom 1968, 1984 · Kulik et al. 1990 · VanLehn 2011 · Bjork 1994 ·
Bjork & Bjork 2011 · Soderstrom & Bjork 2015 · Kapur 2008, 2014 · Sinha &
Kapur 2021 · Ericsson et al. 1993 · Macnamara et al. 2014 · Lopez et al.
2008 · Lister et al. 2004 · Duran et al. 2022 · Settles & Meeder (ACL) 2016 ·
Lally et al. 2010 · Locke & Latham 2002 · Sailer & Homner 2020 · Mogavi et
al. 2022 · Hanus & Fox 2015 · Cristia et al. (NBER 34173) · Duolingo research
reports & blog (path redesign, Birdbrain, Method whitepaper) · Halim & Halim
CP3 · ICPC official rules & TRD instructions · USACO Guide · KACTL.

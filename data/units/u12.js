// ============================================================================
// data/units/u12.js — Unit 12: Contest Craft
// The meta-game: constraint forensics, debugging & stress tests, team
// strategy, contest protocol. Sources: ICPC official rules, contest-wiki,
// Rujia Liu's guide, KACTL, USACO Guide, named CF training blogs.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'constraints': {
    id: 'constraints',
    objectives: [
      'Deduce the intended complexity from n and the time limit',
      'Budget operations and memory before writing a line of code',
      'Read multi-test "sum of n" constraints correctly',
    ],
    theory: [
      {
        h: 'The constraints are a message from the setter',
        md: 'Problem setters choose limits to **admit the intended solution and kill the naive one**. Reading `n ≤ 2·10⁵` isn’t bookkeeping — it’s the setter telling you "n log n, friend". Decode before designing:\n\n`n ≤ 10..12` → n! or 2ⁿ·n² · `n ≤ 20` → 2ⁿ bitmask · `n ≤ 40` → meet-in-the-middle · `n ≤ 500` → n³ · `n ≤ 5000` → n² · `n ≤ 2·10⁵` → n log n · `n ≤ 10⁷` → n · `n ≤ 10¹⁸` → log n / O(1) math / digit DP.',
      },
      {
        h: 'The ops budget',
        md: 'Rule of thumb: C++ does **~10⁸ simple operations per second** (array reads, adds, compares); heavy constants (modulo, cache-hostile access, map operations) cut that by 3–10×. Budget = time limit × 10⁸. Then count YOUR ops:\n\nn² at n = 5000 → 2.5·10⁷ ✓ comfortable. n² at n = 10⁵ → 10¹⁰ ✗ dead — needs a different algorithm class, not micro-optimization.',
        code: `// estimate BEFORE coding:
// n = 2e5, algorithm O(n log n): 2e5 * 18 ≈ 3.6e6  ✓ trivial
// n = 2e5, algorithm O(n sqrt n): 2e5 * 450 ≈ 9e7  ~ tight but ok
// n = 2e5, algorithm O(n^2): 4e10                  ✗ not even close`,
      },
      {
        h: 'Memory forensics',
        md: '256 MB ≈ **6·10⁷ ints** (or 3·10⁷ long longs). So an n×n int matrix dies at n ≈ 8000, and `dp[2·10⁵][2·10⁵]` was never alive. When a 2D DP state is too big: roll one dimension, compress coordinates, or rethink the state. Check memory at design time — MLE wastes a submission just like WA.',
      },
      {
        h: '"Sum of n over all test cases"',
        md: 'Multi-test problems often say: t ≤ 10⁴ AND **the sum of n over all test cases ≤ 2·10⁵**. That sum is the real bound: an O(n) solve per case is O(sum) total — fine. The trap: anything O(maxN) per case regardless of that case’s n (like clearing a global 2·10⁵ array every case) becomes O(t · maxN) = 2·10⁹. Allocate per case, or clear only what you touched.',
        note: 'WA teams read "n ≤ 2·10⁵" and panic; TLE teams miss "t ≤ 10⁴" and clear giant arrays per case. Read every line of the constraints block.',
        noteKind: 'warn',
      },
      {
        h: 'Reverse-reading the output and the story',
        md: 'More signals: answers that can be astronomically large → "mod 10⁹+7" → counting DP/combinatorics. "Output the maximum k such that…" → binary search smell. Two agents moving on a grid → state-space BFS. n ≤ 20 with "subsets" anywhere in the story → bitmask. The statement’s *shape* narrows the toolbox before you’ve consciously thought.',
      },
    ],
    exercises: [
      {
        id: 'cf-1', type: 'match', diff: 1,
        prompt: 'Match the constraint to the intended complexity class.',
        pairs: [
          ['n ≤ 18', '2ⁿ · n bitmask'],
          ['n ≤ 500', 'n³'],
          ['n ≤ 2·10⁵', 'n log n'],
          ['n ≤ 10¹⁸', 'O(log n) / math'],
        ],
        explain: 'The decoder ring. 2¹⁸·18 ≈ 4.7M ✓; 500³ = 1.25·10⁸ ~ ✓; 2·10⁵·18 ≈ 3.6M ✓; and nothing iterates to 10¹⁸ — that bound demands formulas, binary search, or digit reasoning.',
      },
      {
        id: 'cf-2', type: 'fill', diff: 1,
        prompt: 'Time limit 2 seconds, ~10⁸ simple ops/sec. Your algorithm does n² ops at n = 10⁴. Ops needed = 10⁸. Does it fit — `yes` or `no`?',
        answer: ['yes'],
        explain: '10⁴ squared = 10⁸ ops vs a 2·10⁸ budget — fits with 2× headroom (assuming genuinely simple ops). At n = 3·10⁴ it would be 9·10⁸ and you’re gambling. This 10-second arithmetic before coding saves hour-long rewrites.',
      },
      {
        id: 'cf-3', type: 'mcq', diff: 2,
        prompt: 'n ≤ 2·10⁵, q ≤ 2·10⁵ queries, TL 1 s. Your per-query work is O(√n) ≈ 450. Verdict prediction?',
        options: [
          'Fits — ~9·10⁷ ops is inside the budget, though constants matter',
          'TLE — anything except O(log) per query dies',
          'Fits with 100× headroom',
          'Cannot be estimated without the algorithm name',
        ],
        answer: 0,
        explain: '2·10⁵ × 450 = 9·10⁷ — inside 10⁸ but snug: cache behavior and constant factors decide. √n-per-query (sqrt decomposition) is a legitimate design point, not just log n. Estimation is about ORDERS, then constants.',
      },
      {
        id: 'cf-4', type: 'mcq', diff: 2,
        prompt: 'Statement: "t test cases (t ≤ 10⁴); the sum of n over all test cases does not exceed 2·10⁵." Which solution structure is WRONG?',
        options: [
          'Declaring `vector<int> cnt(200001)` freshly zeroed INSIDE each test case loop',
          'An O(n log n) solve per test case',
          'Reading exactly n items per case and processing them',
          'Reusing one global array but resetting only the n entries you used',
        ],
        answer: 0,
        explain: 'Zeroing 2·10⁵ slots × 10⁴ cases = 2·10⁹ writes — TLE from *initialization alone*, while every real solve is tiny. Either allocate sized-to-this-case (vector<int> cnt(n+1)) or undo only what you touched. A legendary multi-test trap.',
        hint: 'The vector constructor zero-fills ALL its elements. How many total?',
      },
      {
        id: 'cf-5', type: 'fill', diff: 2,
        prompt: '256 MB limit. Roughly how many `int` values fit? Answer like `6e7`.',
        answer: ['6e7', '6*10^7', '60000000', '6×10⁷'],
        explain: '256·10⁶ bytes / 4 bytes ≈ 6.4·10⁷ ints (minus overhead). Instant corollaries: int n×n matrix caps near n = 8000; ten arrays of 2·10⁵ long longs are nothing; dp[5000][5000] ints = 10⁸ = dead.',
      },
      {
        id: 'cf-6', type: 'mcq', diff: 2,
        prompt: 'The answer "can be very large, print it modulo 10⁹+7". What is the setter telling you?',
        options: [
          'It’s a counting problem — expect DP or combinatorics, and do arithmetic under the mod from the start',
          'Use unsigned long long and let it wrap',
          'The answer needs big-integer libraries',
          'Print only the last 9 digits with printf',
        ],
        answer: 0,
        explain: 'Mod 10⁹+7 is the universal signature of count-the-ways problems. Design the DP/formula first, then thread % MOD through every + and ×. (And division under mod = modular inverse — unit 4.)',
      },
      {
        id: 'cf-7', type: 'order', diff: 2,
        prompt: 'Order this pre-coding ritual (the 60-second constraint pass).',
        items: [
          'Read n, q, value ranges, and the time limit',
          'Compute the ops budget (TL × ~10⁸)',
          'Shortlist complexity classes that fit the budget',
          'Match a known technique to the shortlist and the story',
          'Sanity-check memory for the planned state',
        ],
        explain: 'Limits → budget → classes → technique → memory. Sixty seconds, every problem, no exceptions — it’s the cheapest insurance in the sport.',
      },
      {
        id: 'cf-8', type: 'mcq', diff: 3,
        prompt: 'n ≤ 40 items, values to 10⁹, "can you pick a subset summing to exactly S?" — 2⁴⁰ ≈ 10¹² is too slow and values kill DP-on-sum. The intended technique?',
        options: [
          'Meet in the middle: enumerate 2²⁰ sums of each half, sort one side, binary-search complements',
          'Greedy by value',
          'Bitmask DP over all 40 items',
          'Randomized restarts until it fits',
        ],
        answer: 0,
        explain: 'n ≤ 40 is the meet-in-the-middle signature: split 20/20, enumerate 2²⁰ ≈ 10⁶ per half, combine with sort + two pointers/binary search ≈ 10⁶ log. The constraint IS the algorithm’s name — that’s constraint forensics paying out.',
        hint: '40 = 20 + 20. What’s 2²⁰?',
      },
      {
        id: 'cf-9', type: 'tf', diff: 1,
        statement: 'If your complexity estimate fits with less than ~2× headroom, constant factors (cache misses, modulo, map vs array) can still decide AC vs TLE.',
        answer: true,
        explain: 'The 10⁸ rule is for SIMPLE ops. unordered_map lookups, %, pointer-chasing trees each cost several-to-dozens of "simple op" equivalents. Inside 2× margin, choose flat arrays, precomputed powers, and cache-friendly loops.',
      },
      {
        id: 'cf-10', type: 'fill', diff: 3,
        prompt: 'TL 1 s. q = 10⁵ queries on an array of n = 10⁵, no updates, each query asks a range MINIMUM. Naive per-query scan is 10⁵ × 10⁵ = 10¹⁰ — dead. Which preprocessing structure answers each query in O(1)? (two words)',
        answer: ['sparse table', 'a sparse table'],
        explain: 'Static data + idempotent op (min) + huge query count = sparse table: O(n log n) build, O(1) query. Recognizing static-vs-dynamic and sum-vs-min is exactly the unit-8 decision table — constraints route you to the row.',
      },
      {
        id: 'cf-11', type: 'mcq', diff: 2,
        prompt: 'Story: "two players take turns; both play optimally; who wins?" with piles and n ≤ 10⁵. Which toolbox does the story’s SHAPE point to — before any deep thought?',
        options: [
          'Game theory: W/L positions, Nim XOR, Grundy numbers',
          'Max flow',
          'String hashing',
          'Convex hull',
        ],
        answer: 0,
        explain: '"Optimal play, who wins" is the game-theory siren — start from terminal positions or hunt for a Nim reduction. Genre recognition from one sentence is trainable, and it’s the first second of every solve.',
      },
    ],
    problems: [
      { name: 'K-th Not Divisible by n', platform: 'Codeforces', id: '1352C', rating: 1200, url: 'https://codeforces.com/problemset/problem/1352/C', difficulty: 'easy', why: 't up to 1000 with k to 10⁹ — the constraints forbid loops and demand a formula. Decode, then derive.' },
      { name: 'Missing Coin Sum', platform: 'CSES', id: '2183', url: 'https://cses.fi/problemset/task/2183', difficulty: 'med', why: 'Looks exponential (subset sums!), constraints say n log n — that gap IS the hint. Find the greedy invariant.' },
      { name: 'Apartments', platform: 'CSES', id: '1084', url: 'https://cses.fi/problemset/task/1084', difficulty: 'easy', why: 'Re-solve it reading ONLY the constraints first: predict the approach before the story.' },
    ],
  },

  // ==========================================================================
  'debugging': {
    id: 'debugging',
    objectives: [
      'Run the bug-hunt ladder instead of staring at code',
      'Name the classic bug families on sight',
      'Stress-test: brute force + random generator + diff loop',
    ],
    theory: [
      {
        h: 'The ladder (in order, no skipping)',
        md: 'When the verdict is WA and your soul says "but it’s right":\n\n1. **Re-read the statement** — half of all WAs are misreading (1-indexed? inclusive? "at most" vs "exactly"?).\n2. **Edge cases by hand**: n=1, n=0, all-equal, all-negative, max values, k > n.\n3. **Trace the samples** on paper against YOUR code, line by line.\n4. **Print intermediate state** at checkpoints.\n5. **Stress test** against a brute force (below).\n\nEscalate only when the cheaper rung fails — most bugs die on rungs 1–2.',
      },
      {
        h: 'The classic bug families',
        md: 'Contest bugs cluster hard. Memorize the lineup:\n\n• **int overflow** (sums, products, a+b in binary search)\n• **off-by-one** (loop bounds, inclusive ranges, 0 vs 1-indexed)\n• **uninitialized / stale state** between test cases\n• **comparator UB**: `<=` in sort comparators can segfault\n• **reading the wrong variable** (n for m — diabolical in geometry)\n• **size_t underflow**: `v.size() - 1` on empty vectors\n• **float equality** where integers were possible\n\nWhen lost, walk this list against your code before random edits.',
      },
      {
        h: 'Stress testing: your personal judge',
        md: 'Three small programs end every "but it passes the samples!" argument:\n\n1. `brute` — obviously-correct slow solution (the unit-3 skill, weaponized)\n2. `gen` — random SMALL tests (n ≤ 6, values ≤ 10): small cases find bugs fastest\n3. a loop: generate → run both → compare → stop on mismatch\n\nThe failing case it prints is usually tiny enough to debug by hand in minutes.',
        code: `// gen.cpp — tiny random tests
#include <bits/stdc++.h>
using namespace std;
int main(int argc, char** argv) {
    mt19937 rng(atoi(argv[1]));            // seed from arg
    int n = rng() % 6 + 1;                 // SMALL n
    printf("%d\\n", n);
    for (int i = 0; i < n; i++)
        printf("%d ", (int)(rng() % 10));  // SMALL values
    puts("");
}

// shell loop:
// for i in $(seq 1 1000); do
//   ./gen $i > in.txt
//   ./sol < in.txt > a.txt;  ./brute < in.txt > b.txt
//   diff a.txt b.txt || { echo "FAILS on:"; cat in.txt; break; }
// done`,
        note: 'Print debug output to **cerr**, not cout — stderr is ignored by judges, so forgotten debug prints can’t turn AC into WA.',
      },
      {
        h: 'Shrinking and reading a failing case',
        md: 'Got a failing input? **Shrink it**: remove elements/lower values while it still fails. A 4-element counterexample reveals its logic; a 200-element one hides it. Then hand-simulate both solutions on the shrunken case — where they diverge is the bug, not where you assumed it was.',
      },
      {
        h: 'Debugging under contest pressure',
        md: 'Solo rules that compound in teams: after ~10 minutes stuck, **print the code and step away from the keyboard** (the machine is your team’s scarcest resource). Explain the code line-by-line to a teammate — rubber-ducking catches what eyes skip. Track your own bug taxonomy across practices: most people have 2–3 signature bugs producing 80% of their WAs. Know yours.',
      },
    ],
    exercises: [
      {
        id: 'dbg-1', type: 'order', diff: 1,
        prompt: 'WA on test 2. Order the debugging ladder.',
        items: [
          'Re-read the statement slowly',
          'Test edge cases: n=1, equal values, maximums',
          'Hand-trace the sample through your code',
          'Add cerr prints at checkpoints',
          'Stress test against a brute force',
        ],
        explain: 'Cheap and likely first: misreading and edge cases solve most WAs in minutes. Stress testing is the heavy artillery — decisive but slower to set up.',
      },
      {
        id: 'dbg-2', type: 'mcq', diff: 2,
        prompt: 'This sort comparator sometimes CRASHES (segfault inside std::sort). Why?',
        code: `sort(v.begin(), v.end(), [](int a, int b) {
    return a <= b;          // ← here
});`,
        options: [
          '`<=` violates strict weak ordering — sort may walk past array bounds (undefined behavior)',
          'Lambdas can’t be used in sort',
          'It should return int, not bool',
          'The vector must be non-empty',
        ],
        answer: 0,
        explain: 'Comparators must answer "is a STRICTLY before b". With `<=`, equal elements answer yes both ways, breaking sort’s internal invariants — real crashes, randomly. Strict `<` only. This bug has eaten thousands of contest hours.',
      },
      {
        id: 'dbg-3', type: 'mcq', diff: 2,
        prompt: 'Passes samples, WA on test 3. The code reads a then b, computes `a * b / 2`. Constraints: a, b ≤ 2·10⁹... wait, ≤ 10⁹ each. Most likely bug family?',
        code: `int a, b;
cin >> a >> b;
cout << a * b / 2 << "\\n";`,
        options: [
          'int overflow: a*b up to 10¹⁸ computed in int',
          'Off-by-one in the division',
          'Uninitialized variables',
          'Wrong output format',
        ],
        answer: 0,
        explain: '10⁹ × 10⁹ = 10¹⁸ — int dies at 2.1·10⁹, even long long is barely enough (max ~9.2·10¹⁸ ✓). Fix: `(long long)a * b / 2`. Samples use small numbers; test 3 doesn’t. Overflow is the #1 "passes samples" killer.',
      },
      {
        id: 'dbg-4', type: 'bank', diff: 2,
        prompt: 'Complete the stress-test shell loop.',
        code: `for i in $(seq 1 1000); do
  ./gen $i > in.txt
  ./sol   < in.txt > a.txt
  ./brute < in.txt > b.txt
  ___ a.txt b.txt || { echo FAIL; cat ___; break; }
done`,
        answer: ['diff', 'in.txt'],
        distractors: ['cmp -l', 'a.txt'],
        explain: '`diff` compares the outputs; on mismatch you want the INPUT that caused it (in.txt) — that’s your counterexample. Printing a.txt alone tells you nothing actionable.',
      },
      {
        id: 'dbg-5', type: 'mcq', diff: 2,
        prompt: 'Why should stress-test generators produce SMALL inputs (n ≤ 6, values ≤ 10) rather than big random ones?',
        options: [
          'Small cases hit edge-case logic constantly and failing cases are hand-debuggable; big random inputs rarely trip corner conditions',
          'Big inputs are slow to generate',
          'diff only works on short files',
          'Judges only use small tests',
        ],
        answer: 0,
        explain: 'With n ≤ 6 you get duplicates, all-equal arrays, single elements every few iterations — exactly where bugs live. And when it fails, you can simulate 6 elements in your head. Big-random catches only overflow/TLE classes.',
      },
      {
        id: 'dbg-6', type: 'tf', diff: 1,
        statement: 'Debug output printed to `cerr` is invisible to the judge, so leaving it in a submission cannot cause WA.',
        answer: true,
        explain: 'Judges compare stdout only. cerr costs some runtime if huge, but never correctness. Habit: ALL debug prints go to cerr (`#define dbg(x) cerr << #x << " = " << x << "\\n"`), so a forgotten one is harmless.',
      },
      {
        id: 'dbg-7', type: 'mcq', diff: 3,
        prompt: 'Multi-test solution: case 1 correct, later cases subtly wrong, and SWAPPING the input order changes which answers are wrong. Which bug family screams loudest?',
        options: [
          'Stale global state leaking between test cases (arrays/flags not reset)',
          'Integer overflow',
          'Comparator UB',
          'Floating-point precision',
        ],
        answer: 0,
        explain: 'Order-dependent wrongness is the fingerprint of leftover state: case k inherits case k−1’s data. Audit every global touched per case — or move state inside solve(). (This was u01’s `cnt` bug, now wearing a trench coat.)',
        hint: 'What changes between "run case A then B" and "run B then A"? Only what persists.',
      },
      {
        id: 'dbg-8', type: 'fill', diff: 2,
        prompt: 'Your failing stress case has n = 137. What do you do BEFORE debugging it? (one word, the technique)',
        answer: ['shrink', 'minimize', 'reduce', 'shrinking'],
        explain: 'Shrink/minimize: delete elements and re-test until it stops failing; the last failing version is your minimal counterexample. Debugging a 5-element case takes minutes; 137 elements takes an evening.',
      },
      {
        id: 'dbg-9', type: 'mcq', diff: 2,
        prompt: 'Spot the bug (it’s subtle and silent):',
        code: `vector<int> v = readInput();      // may be empty
for (int i = 0; i <= (int)v.size() - 1; i++)
    process(v[i]);
int last = v[v.size() - 1];        // ← and here`,
        options: [
          'When v is empty, v.size()−1 underflows to a huge unsigned → v[huge] is undefined behavior (the loop is saved by the int cast; the last line is not)',
          'The loop runs one element too far',
          'process() cannot take ints',
          'Nothing — empty vectors return 0 for v[anything]',
        ],
        answer: 0,
        explain: '`v.size()` is unsigned: 0−1 wraps to ~1.8·10¹⁹ inside the INDEX expression (no cast there). The loop’s `(int)` cast makes the bound −1 → loop safely skips. Same expression, one cast apart, one is UB. Guard: `if (!v.empty())`.',
        hint: 'Compare the two size()−1 expressions: which one has the cast?',
      },
      {
        id: 'dbg-10', type: 'code', diff: 3,
        prompt: 'Write a BRUTE FORCE oracle: read n then n integers; print the maximum subarray sum (any non-empty contiguous run), the O(n²) way. (You’d use this to stress-test a clever O(n) Kadane solution.)',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto &x : a) cin >> x;
    // O(n^2): try every (l, r)

    return 0;
}`,
        tests: [
          { input: '5\n-1 3 -2 5 -3', expected: '6' },
          { input: '3\n-5 -2 -8', expected: '-2' },
          { input: '1\n7', expected: '7' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto &x : a) cin >> x;
    ll best = LLONG_MIN;
    for (int l = 0; l < n; l++) {
        ll sum = 0;
        for (int r = l; r < n; r++) {
            sum += a[r];
            best = max(best, sum);
        }
    }
    cout << best << "\\n";
    return 0;
}`,
        explain: 'The oracle’s only virtue is being too simple to be wrong: every (l, r), running sum, take the max. Note `best = LLONG_MIN` — all-negative arrays (test 2) break the lazy `best = 0` version, in the brute force too. Oracles deserve edge-case care; a wrong oracle "confirms" wrong solutions.',
        hint: 'All-negative input: what must best start as?',
      },
      {
        id: 'dbg-11', type: 'match', diff: 1,
        prompt: 'Match the symptom to the prime suspect.',
        pairs: [
          ['WA only on huge values', 'int overflow'],
          ['random segfault in sort', 'comparator <='],
          ['case order changes answers', 'stale global state'],
          ['crash only when n = 0', 'size_t underflow'],
        ],
        explain: 'Symptom → suspect tables make you fast under pressure: most contest bugs are repeat offenders with documented M.O.s.',
      },
    ],
    problems: [
      { name: 'IQ test', platform: 'Codeforces', id: '25A', rating: 1300, url: 'https://codeforces.com/problemset/problem/25/A', difficulty: 'easy', why: 'A famous WA magnet. Write it, then stress-test it against a second implementation before submitting.' },
      { name: 'Duff and Meat', platform: 'Codeforces', id: '588A', rating: 900, url: 'https://codeforces.com/problemset/problem/588/A', difficulty: 'intro', why: 'Trivial greedy — practice the full ritual anyway: edge cases, overflow audit, then submit.' },
      { name: 'Maximum Subarray Sum', platform: 'CSES', id: '1643', url: 'https://cses.fi/problemset/task/1643', difficulty: 'easy', why: 'Write Kadane, then verify it against your lesson brute force on 1000 random tests. Feel the workflow.' },
    ],
  },

  // ==========================================================================
  'team-strategy': {
    id: 'team-strategy',
    objectives: [
      'Run the standard opening protocol (templates + split reading)',
      'Do penalty arithmetic and make submit/test decisions with it',
      'Build and use a legal 25-page Team Reference Document',
    ],
    theory: [
      {
        h: 'The geometry of ICPC: 3 brains, 1 keyboard, 5 hours',
        md: 'Teams of three share **one computer** for 5 hours and 8–13 problems. Everything follows from that scarcity: *keyboard time is the most expensive resource in the room*. Thinking happens on paper; the machine is for typing nearly-finished code. A team whose keyboard sits idle while three people stare at one screen is losing to a team that parallelizes.',
      },
      {
        h: 'The opening protocol (first 15 minutes)',
        md: 'Standard opening (contest-wiki / Rujia Liu):\n\n• Fastest typist sets up the template, compile script, and test harness.\n• The other two **split the problemset** — one reads from the front, one from the back — hunting the easiest problem.\n• First easy find goes to the typist with a one-line spec ("A is: sort and count distinct").\n• Readers finish ALL statements and classify: easy / doable / decider.\n\nEvery problem gets read in the first hour — statements hide easy problems behind scary stories.',
      },
      {
        h: 'Penalty math (know the formula cold)',
        md: 'Rank = problems solved. Ties: **total time = Σ over SOLVED problems of (minute of first AC + 20 × earlier rejected runs on that problem)**. Unsolved problems cost nothing, no matter how many rejects.\n\nConsequences:\n• Solve easy problems EARLY (their minutes are cheap penalty).\n• A wrong submit on something you’ll eventually solve = +20 — testing is worth ~2 minutes of typing time.\n• A desperate submit on a problem you may never solve is FREE — fire away in the last minutes.',
        code: `// Team A: AC at 40 and at 120 with 2 rejected runs on the second
// penalty = 40 + (120 + 2*20) = 200
// Team B: ACs at 60 and 130, no rejects → 190 → B wins the tie`,
      },
      {
        h: 'Mid-contest discipline',
        md: '• **Write code on paper** before claiming the keyboard; type from paper.\n• **Debug off the machine**: print your code + the failing trace, give the seat away, debug on paper.\n• Watch the scoreboard: a problem with many ACs is easy — if you haven’t read it carefully, someone should, now.\n• Keep a paper log: who owns which problem, submission times, verdicts.\n• Stuck 30+ minutes? Swap the problem to a teammate — fresh eyes beat sunk cost.',
      },
      {
        h: 'The Team Reference Document (TRD)',
        md: 'ICPC allows **up to 25 single-sided pages** (letter/A4) of printed reference: code, formulas, anything — readable without magnification from half a meter; team name top-left, page numbers top-right. The reference standard is KACTL (KTH): tested snippets, dense, indexed.\n\nRules of a good TRD: only **battle-tested** code (an untested snippet is a trap with page numbers), ordered by lookup speed under stress, with one-line "when to use" headers. And **practice retrieving from it** — a notebook first opened at the regional is decoration. The Handbook tab is your TRD seed.',
      },
      {
        h: 'Endgame: the frozen hour',
        md: 'The public scoreboard **freezes for the final hour** — you see pending submissions, not verdicts. Protocol: stop wandering; pick the most winnable pending problem and **converge** — one types, one shoulder-checks against the paper version, one builds adversarial tests. Penalties barely matter now; solves do. Submit anything plausible before the clock dies — unsolved problems are free.',
      },
    ],
    exercises: [
      {
        id: 'ts-1', type: 'fill', diff: 2,
        prompt: 'Penalty arithmetic: ACs at minute 35 and minute 110; the second took 3 rejected runs first; plus one problem you never solved with 5 rejects. Total penalty?',
        answer: ['205'],
        explain: '35 + (110 + 3×20) = 35 + 170 = 205. The unsolved problem’s five rejects cost zero — only solved problems carry penalty. This asymmetry drives endgame strategy.',
        hint: 'Unsolved problems contribute nothing. 20 per reject on solved ones.',
      },
      {
        id: 'ts-2', type: 'mcq', diff: 1,
        prompt: 'Why does the opening protocol have the two non-typists read from OPPOSITE ends of the problemset?',
        options: [
          'Coverage: all statements get eyes quickly, and the easiest problem is found from either end it hides at',
          'It prevents arguments',
          'Problems are sorted by difficulty, so ends differ most',
          'ICPC rules require it',
        ],
        answer: 0,
        explain: 'Problemsets are NOT sorted by difficulty — the gift problem might be H. Splitting front/back halves the time to find it and guarantees every statement is read while the typist preps the environment.',
      },
      {
        id: 'ts-3', type: 'mcq', diff: 2,
        prompt: 'Your solution compiles and passes samples. Teammate: "submit". You haven’t tried any edge cases. The problem is one you’ll likely solve regardless. The penalty-optimal call?',
        options: [
          'Spend ~2 minutes on edge tests first — a rejected run costs 20 penalty minutes on a problem you WILL solve',
          'Submit instantly — time-to-AC matters more than rejects',
          'Never submit until a teammate re-derives the algorithm',
          'Wait for the scoreboard to confirm others solved it',
        ],
        answer: 0,
        explain: 'Expected value: 2 minutes of testing vs 20 minutes of penalty × P(bug). With any nontrivial bug probability, test. Exception: trivial problems early (penalty 20 + resubmit minutes may beat over-testing) — but "passes samples" alone is a coin flip.',
      },
      {
        id: 'ts-4', type: 'tf', diff: 1,
        statement: 'In the last 10 minutes, submitting a half-believed solution to an otherwise-unsolved problem is strategically free.',
        answer: true,
        explain: 'Rejects on never-solved problems carry zero penalty; an unexpected AC wins rank. Frozen-hour etiquette: submit everything plausible. (If it ACs, the +20s it ate become retroactively real — and irrelevant, because you SOLVED it.)',
      },
      {
        id: 'ts-5', type: 'order', diff: 2,
        prompt: 'Order the opening protocol.',
        items: [
          'Typist sets up template + compile/test scripts',
          'Other two split the set and read from both ends',
          'First easy problem is specced to the typist in one line',
          'Readers finish and classify every remaining statement',
          'Team syncs: priority order for the next two hours',
        ],
        explain: 'Machine prep and reading happen in PARALLEL — that’s the entire trick. By minute 15 a good team has one submission out and a map of the contest.',
      },
      {
        id: 'ts-6', type: 'mcq', diff: 2,
        prompt: 'Your code WAs. The fix isn’t obvious. Two teammates have solved problems waiting to be typed. Correct move?',
        options: [
          'Print your code (or copy it to paper), surrender the keyboard, debug away from the machine',
          'Keep the keyboard — you’re "almost done"',
          'All three debug your code together at the screen',
          'Rewrite from scratch immediately',
        ],
        answer: 0,
        explain: '"Almost done" is what every debugging session says before eating 40 keyboard-minutes. Two ready solutions > one maybe-fix. Debugging on paper while others type is the highest-leverage move in team play — and the hardest ego-wise. Decide the rule BEFORE the contest.',
      },
      {
        id: 'ts-7', type: 'match', diff: 1,
        prompt: 'Match the TRD rule to its number.',
        pairs: [
          ['max pages', '25, single-sided'],
          ['readable from', '0.5 meters'],
          ['page numbers', 'top-right corner'],
          ['team name', 'top-left corner'],
        ],
        explain: 'Straight from the ICPC TRD instructions. Inside those constraints, content is free-form — tested code beats theory, and an index beats both.',
      },
      {
        id: 'ts-8', type: 'mcq', diff: 3,
        prompt: '90 minutes left, scoreboard not yet frozen. You: 5 solved. Rival teams: 5–6 solved. Problem G has 40 ACs (you haven’t touched it); your pet problem D has 3 ACs and you’ve sunk 70 minutes into it. The play?',
        options: [
          'Drop D, read G now — 40 ACs means it’s easy and you’re leaving a near-certain solve unread',
          'Finish D — sunk cost means it must be close',
          'Split: continue D solo while two read G',
          'Alternate 10-minute shifts on each',
        ],
        answer: 0,
        explain: 'The scoreboard is an oracle: 40 teams say G is easy; 3 say D is a decider. Option 3 sounds balanced but option 1 with full focus converts faster — though in practice "two on G, one summarizing D for later" is the real-world compromise. The non-negotiable: G must be read NOW. Sunk cost is not a strategy.',
        hint: 'What does 40 ACs vs 3 ACs tell you about expected solve time?',
      },
      {
        id: 'ts-9', type: 'tf', diff: 2,
        statement: 'A TRD snippet you have never compiled is worth including anyway, since 25 pages is a lot of space.',
        answer: false,
        explain: 'An untested snippet is a delayed-action bug: you’ll type it under maximum pressure and discover the typo with 20 minutes left. KACTL’s rule: everything stress-tested. Empty space is safer than landmines.',
      },
      {
        id: 'ts-10', type: 'fill', diff: 2,
        prompt: 'Scoreboard reads: you 4 solved / 380 penalty; rivals 4 solved / 360. You both solve a 5th: yours ACs at minute 250 first try; theirs at 240 with 2 rejects. Final penalties — who wins? Answer `we` or `they`.',
        answer: ['we'],
        explain: 'You: 380 + 250 = 630. They: 360 + 240 + 40 = 640. Their earlier AC lost to their two rejects. Track rivals’ pending runs in the freeze — penalty math decides medals more often than people think.',
      },
    ],
    problems: [
      { name: 'Run a past ICPC regional, full rules', platform: 'Kattis', id: 'open', url: 'https://open.kattis.com/', difficulty: 'med', why: '5 hours, one machine, printed notebook only, real penalty accounting. The protocol only becomes muscle by doing it.' },
      { name: 'Team virtual: any Div. 2 round', platform: 'Codeforces', id: 'contests', url: 'https://codeforces.com/contests', difficulty: 'med', why: 'Weekly cadence beats occasional marathons. Rotate the typist role each week.' },
    ],
  },

  // ==========================================================================
  'contest-sim': {
    id: 'contest-sim',
    objectives: [
      'Run virtual contests with a fixed weekly ritual',
      'Upsolve and post-mortem with discipline (and honesty)',
      'Apply editorial rules that produce learning instead of comfort',
    ],
    theory: [
      {
        h: 'The weekly virtual: the single highest-yield habit',
        md: 'One **virtual contest per week** under honest conditions (real timer, no pausing, team = one machine) trains what drills can’t: time allocation, switching costs, pressure composure, scoreboard reading. Codeforces virtuals, past regionals on Kattis — material is endless. The drills in this app build the muscles; the virtual is the actual sport.',
      },
      {
        h: 'Editorial discipline',
        md: 'The community-converged rules:\n\n• **Errichto’s rule**: stuck 20–30 minutes (an hour for hard problems) with *zero new ideas* → read the editorial. "Stuck" means stuck — still generating ideas isn’t stuck.\n• **Michael Cao’s rule (USACO Guide)**: *implement every problem whose editorial you read*. Reading ≠ learning; the implementation is where it sticks.\n• Read only up to the first idea you were missing, then try to finish alone.\n\nIn this app: mark editorial-assisted solves honestly — the cold re-solve arrives in 14 days to verify the learning was real.',
      },
      {
        h: 'Upsolving: the +1/+2 rule',
        md: 'After every contest, solve **one or two problems past** where you got stuck (Errichto: "not all of them — don’t try something very hard because you likely won’t solve it"). Those problems are personally calibrated: the contest just proved they’re at your frontier. Upsolving is where contests convert into rating; skipping it converts them into vibes.',
      },
      {
        h: 'The post-mortem template',
        md: 'Thirty minutes as a team, same day, per problem attempted:\n\n• minutes to read / to first idea / to working code / lost to bugs\n• verdict history and WHY each reject happened (bug family!)\n• "what would have saved 20 minutes?" — one concrete answer each\n\nPatterns appear by week three: always slow to start? Geometry allergy? One teammate’s bug family dominating? That’s your next month of targeted drills. Track per-topic solved-without-editorial rate — it’s the only honest readiness metric.',
      },
      {
        h: 'Self-deception: the final boss',
        md: 'From -is-this-fft-’s famous essay: the biggest reason practice fails is **lying to yourself** — counting editorial-nodding as solving, grinding easy problems for green checkmarks, virtuals where you "basically had it". The honest definitions:\n\n• Solved = AC without external help.\n• Learned = re-solved cold, weeks later.\n• Ready = solving at-level problems under time pressure, reliably.\n\nEvery mechanic in this app — assisted-solve tracking, cold re-solves, spaced reviews — exists to make the honest path the easy path. The last 10%: don’t cheat the buttons.',
        noteKind: 'warn',
        note: 'If a metric ever pulls you away from real solving, ignore the metric. The contest is the metric.',
      },
    ],
    exercises: [
      {
        id: 'cs-1', type: 'mcq', diff: 1,
        prompt: 'Per the consensus editorial rule, when is it time to read the editorial during practice?',
        options: [
          'After 20–30 minutes genuinely stuck — out of ideas, not just out of patience',
          'After 5 minutes of difficulty',
          'Never; editorials create dependence',
          'Immediately after reading the statement, to save time',
        ],
        answer: 0,
        explain: 'Errichto’s rule, with the keyword *stuck*: "If you aren’t out of ideas, you aren’t stuck." Too early steals the productive struggle; never-reading walls you off from techniques you don’t know exist. 20–30 focused minutes is the calibrated middle.',
      },
      {
        id: 'cs-2', type: 'mcq', diff: 1,
        prompt: 'You read an editorial and the idea clicks completely. What turns this into actual learning?',
        options: [
          'Implement it anyway, full AC, no peeking back',
          'Nod, bookmark it, and move on — comprehension is the point',
          'Copy the official code to your library',
          'Re-read it again tomorrow',
        ],
        answer: 0,
        explain: 'Michael Cao’s rule. "Clicks completely" is the feeling of recognition, not the ability of production — the gap between them is exactly what implementation exposes (and closes). It also feeds the 14-day cold re-solve.',
      },
      {
        id: 'cs-3', type: 'tf', diff: 1,
        statement: 'Pausing a virtual contest to take a break invalidates most of its training value.',
        answer: true,
        explain: 'The scarce resource being trained IS continuous time pressure — allocation, fatigue, composure. A paused virtual is a problemset with extra steps. Schedule virtuals when the full window exists.',
      },
      {
        id: 'cs-4', type: 'order', diff: 2,
        prompt: 'Order the weekly team ritual.',
        items: [
          'Pick the contest (past regional or Div. 2) and block the time',
          'Run it under real conditions — one machine, timer, notebook only',
          'Post-mortem the same day with the template',
          'Upsolve 1–2 problems past your stuck point during the week',
          'Log assisted solves so cold re-solves get scheduled',
        ],
        explain: 'Contest → post-mortem (same day, memories fresh) → upsolving across the week → honest logging closing the loop. The ritual beats motivation; calendars beat intentions.',
      },
      {
        id: 'cs-5', type: 'mcq', diff: 2,
        prompt: 'Which post-contest claim is the self-deception pattern -is-this-fft- warns about?',
        options: [
          '"I basically had E — I just ran out of time" (after reading the editorial and recognizing your half-idea)',
          '"I misread B and lost 25 minutes — adding statement re-reads to the protocol"',
          '"My DP was right but overflowed — auditing accumulator types next time"',
          '"I couldn’t crack C in an hour; the editorial used a technique I now need to drill"',
        ],
        answer: 0,
        explain: 'Recognition masquerading as production: a half-idea plus the editorial FEELS like "basically had it" — but feeling ≠ AC. The other three name specific, checkable failure modes with fixes. Honest post-mortems produce verbs, not vibes.',
      },
      {
        id: 'cs-6', type: 'fill', diff: 2,
        prompt: 'The upsolving rule of thumb: after a contest, solve ___ problems past where you got stuck (numeric range, like `3-4`).',
        answer: ['1-2', '1 or 2', '1-2 problems', 'one or two'],
        explain: 'One or two — they’re frontier-calibrated by the contest itself. Upsolving everything burns out; upsolving nothing wastes the calibration. (Errichto’s phrasing: "just one-two more.")',
      },
      {
        id: 'cs-7', type: 'mcq', diff: 2,
        prompt: 'Your team’s post-mortems for three straight weeks show: fast reads, fast ideas, but ~35 minutes per problem lost to implementation bugs. The right prescription?',
        options: [
          'Targeted implementation drills: timed clean-code reps (this app’s code exercises, typing tested templates), plus stricter paper-before-keyboard',
          'Read more theory — bugs mean missing knowledge',
          'Switch who reads statements',
          'Skip post-mortems; they aren’t helping',
        ],
        answer: 0,
        explain: 'The data names the gap: production, not ideas. Deliberate practice 101 — train the diagnosed weakness, not the comfortable strength. (Inverse data — slow ideas, clean code — prescribes more solving and technique breadth instead.)',
      },
      {
        id: 'cs-8', type: 'tf', diff: 2,
        statement: 'A healthy readiness metric for regionals is your per-topic rate of problems solved WITHOUT editorial help, at target difficulty, over the last month.',
        answer: true,
        explain: 'It’s outcome-shaped (solving), honesty-gated (no help), difficulty-anchored, and recent. Compare with: total problems "done", XP, streak length — all gameable comfort metrics. Dashboard the first, enjoy the second.',
      },
      {
        id: 'cs-9', type: 'match', diff: 1,
        prompt: 'Match the training rule to its source.',
        pairs: [
          ['stuck 20–30 min → editorial', 'Errichto'],
          ['implement every editorial you read', 'Michael Cao (USACO Guide)'],
          ['self-deception is the main enemy', '-is-this-fft-'],
          ['contests train speed, archives train solving', 'Um_nik'],
        ],
        explain: 'The named canon of CP training advice — worth knowing who said what, because their full posts are worth reading when you plateau.',
      },
      {
        id: 'cs-10', type: 'mcq', diff: 3,
        prompt: 'Two weeks to regionals. Your team: strong on units 1–7 material, shaky on flows/strings, zero full simulations done. Best use of the remaining time?',
        options: [
          'Two full 5-hour simulations + upsolving + reviews of strong material; accept the flows/strings gap',
          'Cram flows and strings — close the knowledge gap',
          'Grind 100 easy problems for confidence',
          'Rest for two weeks to avoid burnout',
        ],
        answer: 0,
        explain: 'At T-minus-two-weeks, execution > coverage: regionals award solving 6 problems cleanly, not knowing 12 topics shakily. Flows/strings appear ~1-2 times per set and can be skipped strategically; botched time management costs every problem. Simulate, polish the protocol, keep memories fresh with reviews — and sleep before the real one (taper, don’t cram).',
        hint: 'Which failure mode loses more solves: a missing topic, or a broken protocol?',
      },
    ],
    problems: [
      { name: 'This week’s virtual: pick a past regional', platform: 'Kattis', id: 'open', url: 'https://open.kattis.com/', difficulty: 'med', why: 'The assignment is the ritual itself: run it, post-mortem it, upsolve 1–2, log honestly.' },
      { name: 'Virtual any rated round you missed', platform: 'Codeforces', id: 'contests', url: 'https://codeforces.com/contests', difficulty: 'med', why: 'Solo virtuals between team weeks keep individual speed sharp.' },
    ],
  },
};

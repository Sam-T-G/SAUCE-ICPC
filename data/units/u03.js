// ============================================================================
// data/units/u03.js — Unit 3: Core Patterns
// The seven moves that solve half of every contest: brute force & simulation,
// greedy, two pointers, sliding window, prefix sums, binary search.
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'brute-force': {
    id: 'brute-force',
    objectives: [
      'Decide from the constraints whether complete enumeration fits the ops budget',
      'Simulate a process exactly as stated — including simultaneous updates',
      'Enumerate pairs, candidate answers, and permutations (next_permutation)',
      'Use a brute-force solution as a referee for a cleverer one',
    ],
    theory: [
      {
        h: 'Trying everything is a strategy, not a sin',
        md: 'Small constraints are the statement winking at you: **n ≤ 8** → all n! orderings (8! = 40320). **n ≤ 20** → all 2ⁿ subsets (≈10⁶). **n ≤ 5000** → all n² pairs (2.5·10⁷). Budget: a judge runs roughly **10⁸ simple operations per second**. When complete enumeration fits, it is usually the *intended* solution — fastest to write, hardest to get wrong. So the first question on every problem is not "what is the clever trick?" but "**can I afford to try everything?**"',
        note: 'Tiny n is a feature, not a decoration. Setters pick n ≤ 8 precisely so that n! fits — read constraints as instructions.',
      },
      {
        h: 'All pairs, all candidates',
        md: 'Two enumeration shapes cover most brute force. **All pairs**: nested loops with `j = i + 1` — no self-pairs, no double counting. **All candidate answers**: when the answer is a smallish integer, loop over every candidate and test it — cost is range × check. Both are mindless on purpose: the loop structure carries the correctness, so there is almost nothing to get wrong.',
        code: `// every unordered pair (i, j), i < j
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
        check(a[i], a[j]);

// every candidate answer, smallest first
for (int x = 1; x <= 1000000; x++)
    if (works(x)) { cout << x << "\\n"; break; }`,
      },
      {
        h: 'Simulation: do exactly what the statement says',
        md: 'Some problems want obedience, not insight. Read the process, execute it step by step, print the state. Discipline: **resist doing algebra until the literal simulation works** — a correct slow version is worth more than a fast wrong one. Two classic traps: updates that must happen *simultaneously* (snapshot the state, or skip positions you just modified), and step counts large enough to overflow `int`.',
        code: `// one second of the queue: every BG pair swaps AT ONCE
for (int i = 0; i + 1 < n; i++) {
    if (s[i] == 'B' && s[i + 1] == 'G') {
        swap(s[i], s[i + 1]);
        i++;            // skip — this pair already acted this second
    }
}`,
        note: 'Without the `i++`, one boy swaps his way through several girls in a single "second" — the classic simultaneous-update bug.',
        noteKind: 'warn',
      },
      {
        h: 'next_permutation: orderings on demand',
        md: 'For "best ordering of n things" with n ≤ 10, let the STL enumerate. `next_permutation` rearranges the range into the next lexicographic order and returns `false` after the last one. Start from **sorted ascending**, or you silently skip every ordering before your starting point. Cost: n! iterations times your per-ordering work — 10! ≈ 3.6·10⁶ is comfortable, 12! ≈ 4.8·10⁸ is already a funeral.',
        code: `vector<int> p = {0, 1, 2, 3};   // MUST start sorted
do {
    // evaluate this ordering of the items
} while (next_permutation(p.begin(), p.end()));`,
      },
      {
        h: 'Brute force is also a weapon against bugs',
        md: 'Even when brute force cannot pass, write it anyway — it becomes your **referee**. Generate small random inputs, run the dumb solution and the clever one, and compare outputs until they disagree. The failing input is usually five numbers long: debuggable by eye. This is *stress testing* (full ritual in Unit 12). Brute force also discovers patterns: print the answers for n = 1..8 and stare — formulas (like Two Knights) reveal themselves.',
        note: 'In a team, the calmest member’s brute force can validate the star’s greedy in minutes. Use it.',
      },
    ],
    exercises: [
      {
        id: 'bf-1', type: 'mcq', diff: 1,
        prompt: 'A problem says **n ≤ 8** and asks for the best ordering of n tasks. First thought?',
        options: [
          'Enumerate all 8! = 40320 orderings, score each — done',
          '8! is around 4·10⁷, too slow once each ordering needs a check',
          'Look for a clever greedy — trying everything feels like cheating',
          'n ≤ 8 means the target complexity is O(n²)',
        ],
        answer: 0,
        explain: '8! = 40320 — even with an O(n) check per ordering that is ~3·10⁵ operations, microseconds. Tiny n is the setter *telling you* enumeration is intended. (And 8! ≈ 4·10⁴, not 4·10⁷ — know your factorials.)',
      },
      {
        id: 'bf-2', type: 'output', diff: 1,
        prompt: 'All-pairs counting. What does this print?',
        code: `int main() {
    vector<int> a = {1, 2, 4, 5, 2};
    int cnt = 0;
    for (int i = 0; i < 5; i++)
        for (int j = i + 1; j < 5; j++)
            if (a[i] + a[j] == 6) cnt++;
    cout << cnt << "\\n";
}`,
        answer: '3',
        explain: 'Pairs summing to 6: (1,5), (2,4) and (4,2) — using the 2 at index 1 and the 2 at index 4 as different elements. Equal *values* at different *indices* count separately: 3 pairs.',
      },
      {
        id: 'bf-3', type: 'mcq', diff: 2,
        prompt: '**n ≤ 5000**, time limit 1 second. Your idea is an all-pairs O(n²) scan with O(1) work per pair. Verdict?',
        options: [
          'Fits: 5000² = 2.5·10⁷, comfortably inside ~10⁸ ops/sec',
          'TLE: n² at n = 5000 is 2.5·10⁹',
          'Cannot tell without knowing the memory limit',
          'Only fits if you add fast I/O',
        ],
        answer: 0,
        explain: '5000² = 25,000,000 — a quarter of one second’s budget. The wrong option multiplies by an extra 100: arithmetic slips like that cause both false panic and false confidence. Estimate the op count *before* coding, every time.',
      },
      {
        id: 'bf-4', type: 'output', diff: 2,
        prompt: 'Faithful simulation (note the `i++` inside the if). What does this print?',
        code: `int main() {
    string s = "BGBG";
    int t = 2;
    while (t--) {
        for (int i = 0; i + 1 < (int)s.size(); i++) {
            if (s[i] == 'B' && s[i + 1] == 'G') {
                swap(s[i], s[i + 1]);
                i++;     // this pair already acted this second
            }
        }
    }
    cout << s << "\\n";
}`,
        answer: 'GGBB',
        explain: 'Second 1: BGBG → swap at 0 → GBBG, skip to i=2, swap at 2 → GBGB. Second 2: swap at 1 → GGBB. Each girl moves forward one position per second — exactly what the statement describes, no more.',
        hint: 'Trace one second at a time. After a swap, i jumps past the pair.',
      },
      {
        id: 'bf-5', type: 'mcq', diff: 2,
        prompt: 'This "one second" of the same queue process is buggy. Why?',
        code: `for (int i = 0; i + 1 < n; i++) {
    if (s[i] == 'B' && s[i + 1] == 'G')
        swap(s[i], s[i + 1]);
}`,
        options: [
          'After a swap, the moved boy can swap again at the next i — he teleports several positions in one second',
          'The loop bound should be i < n',
          'swap() does not work on characters of a std::string',
          'It should also swap GB pairs back',
        ],
        answer: 0,
        explain: 'After swapping, s[i+1] is the boy — the next iteration may swap him again, letting him pass multiple girls in one tick. The statement says all swaps happen *simultaneously*; skip the pair (`i++`) or build the next state in a copy.',
        hint: 'Walk "BGG" through this loop. How far does the boy travel in one second?',
      },
      {
        id: 'bf-6', type: 'bank', diff: 2,
        prompt: 'Complete the standard permutation-enumeration skeleton.',
        code: `vector<int> p = {0, 1, 2, 3};
___(p.begin(), p.end());          // start from the smallest ordering
do {
    tryArrangement(p);            // visit one permutation
} while (___(p.begin(), p.end()));`,
        answer: ['sort', 'next_permutation'],
        distractors: ['reverse', 'prev_permutation'],
        explain: '`sort` puts the sequence at the lexicographically first ordering; `next_permutation` then steps through all n! of them and returns false after the last. `reverse`/`prev_permutation` walk the same road backwards — starting from the wrong end.',
      },
      {
        id: 'bf-7', type: 'tf', diff: 1,
        statement: '`next_permutation` visits every permutation only if the sequence starts sorted ascending.',
        answer: true,
        explain: 'It steps lexicographically *forward* from wherever you start. Begin at {2,1,3} and you never see {1,2,3} or {1,3,2}. Sort first — the do-while then covers all n!.',
      },
      {
        id: 'bf-8', type: 'parsons', diff: 2,
        prompt: 'Assemble: find the smallest x in 1..100 with `check(x)` true; print -1 if none pass.',
        lines: [
          'int ans = -1;',
          'for (int x = 1; x <= 100; x++) {',
          '    if (check(x)) {',
          '        ans = x;',
          '        break;',
          '    }',
          '}',
          'cout << ans << "\\n";',
        ],
        distractors: [
          '    else break;',
        ],
        explain: 'Scan candidates in increasing order; the first hit is the smallest, so break immediately. The distractor `else break;` stops at the first *failure* — only valid if check were monotone, which nobody promised.',
      },
      {
        id: 'bf-9', type: 'fill', diff: 2,
        prompt: 'The number every estimate hangs on — a typical judge executes about ___ simple operations per second (order of magnitude).',
        answer: ['10^8', '1e8', '100000000', '10⁸', '100 million'],
        placeholder: '10^?',
        explain: 'Roughly 10⁸ simple ops/sec (10⁹ for the very simplest loops). Every "will brute force pass?" decision is your op count vs this number times the time limit.',
      },
      {
        id: 'bf-10', type: 'multi', diff: 2,
        prompt: 'Which of these situations point at brute force? Select all that apply.',
        options: [
          'n ≤ 8 and the answer depends on an ordering — try all n! permutations',
          'n ≤ 20 and you choose an arbitrary subset — 2²⁰ ≈ 10⁶ candidates',
          'n = 10⁵ and you need the best pair — all pairs is only n²',
          'The answer is an integer in 1..10⁶ and each candidate checks in O(1)',
          'The time limit is 5 seconds, so any solution will pass',
        ],
        answers: [0, 1, 3],
        explain: 'n! at 8 and 2ⁿ at 20 both fit ~10⁶–10⁵ candidates; 10⁶ candidates × O(1) checks fits too. But n² at 10⁵ is 10¹⁰ — dead — and a long time limit only multiplies the budget by 5, it does not repeal it.',
      },
      {
        id: 'bf-11', type: 'code', diff: 3,
        prompt: 'Read `n` and `x`, then n integers (n ≤ 2000). Print the number of pairs (i < j) with `a[i] + a[j] == x`. Complete enumeration is fully intended here.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    vector<int> a(n);
    for (auto &v : a) cin >> v;
    // your code

    return 0;
}`,
        tests: [
          { input: '5 6\n1 2 4 5 2', expected: '3' },
          { input: '2 100\n50 50', expected: '1' },
          { input: '3 10\n1 2 3', expected: '0' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    vector<int> a(n);
    for (auto &v : a) cin >> v;
    long long cnt = 0;
    for (int i = 0; i < n; i++)          // all pairs, i < j:
        for (int j = i + 1; j < n; j++)  // no self-pairs, no double count
            if (a[i] + a[j] == x) cnt++;
    cout << cnt << "\\n";
    return 0;
}`,
        explain: 'The j = i + 1 inner loop visits each unordered pair exactly once: 2000²/2 = 2·10⁶ checks, far inside budget. Starting j at 0 would double-count and pair elements with themselves — the two classic pair-loop bugs.',
        hint: 'Where should j start so (i, j) and (j, i) are never both counted?',
      },
      {
        id: 'bf-12', type: 'mcq', diff: 3,
        prompt: 'Your clever O(n log n) solution gets WA on a hidden test. You also have a dumb-but-correct O(n²) brute force. The professional move?',
        options: [
          'Generate small random inputs, run both solutions, and diff the outputs until they disagree',
          'Resubmit unchanged — judges are sometimes flaky',
          'Rewrite the clever solution from scratch and hope',
          'Add fast I/O and submit again',
        ],
        answer: 0,
        explain: 'That is stress testing: the brute force is the referee, and the first disagreeing input is usually tiny enough to debug by hand. Judges are not flaky, and rewriting blind usually reproduces the same wrong idea. Full workflow lands in Unit 12.',
      },
    ],
    problems: [
      { name: 'Permutations', platform: 'CSES', id: '1070', url: 'https://cses.fi/problemset/task/1070', difficulty: 'intro', why: 'Construct a "beautiful" permutation — brute-force tiny n by hand and the pattern reveals itself.' },
      { name: 'Queue at the School', platform: 'Codeforces', id: '266B', rating: 800, url: 'https://codeforces.com/problemset/problem/266/B', difficulty: 'intro', why: 'Faithful simulation featuring exactly the swap-and-skip trap from this lesson.' },
      { name: 'IQ test', platform: 'Codeforces', id: '25A', rating: 1300, url: 'https://codeforces.com/problemset/problem/25/A', difficulty: 'easy', why: 'A full scan plus parity bookkeeping — rated 1300 mostly because of how many ways there are to misread it.' },
      { name: 'Two Knights', platform: 'CSES', id: '1072', url: 'https://cses.fi/problemset/task/1072', difficulty: 'easy', why: 'Count by complement: all pairs minus attacking pairs — and verify your formula with a tiny brute force.' },
    ],
  },

  // ==========================================================================
  'greedy': {
    id: 'greedy',
    objectives: [
      'State the greedy rule explicitly and ask why it can never lock out the optimum',
      'Apply the adjacent-swap exchange argument to justify (or kill) a sorting rule',
      'Solve interval scheduling with earliest-end-time',
      'Hunt for counterexamples before writing any code',
    ],
    theory: [
      {
        h: 'Commit now, never look back',
        md: 'A greedy algorithm makes the locally best choice at every step and **never revisits it**. No backtracking, no second thoughts — which is why greedy solutions are short and fast, usually one sort plus one sweep. The catch: locally best can be globally terrible. A greedy without a justification is a guess wearing a suit. Two questions decide everything: *what rule am I choosing by?* and *why can that choice never lock me out of the optimum?*',
      },
      {
        h: 'The exchange argument',
        md: 'The standard justification. Take any optimal solution that disagrees with your rule — somewhere it must contain two **adjacent** decisions in the "wrong" order. Swap them. If swapping never makes the solution worse, you can bubble any optimum into greedy order without losing value, so greedy is optimal. Practical recipe for "sort by rule R": take two adjacent items, write down the cost in both orders, and check that R always prefers the cheaper one.',
        code: `// Tasks & Deadlines: reward = deadline - finishTime.
// Adjacent jobs with durations da, db starting at time T:
//   a first: finishes T+da and T+da+db
//   b first: finishes T+db and T+db+da
// Total reward differs by (db - da) → put the SHORTER job first.
sort(dur.begin(), dur.end());   // shortest duration first`,
      },
      {
        h: 'Classic win: earliest end time',
        md: 'Maximum number of non-overlapping movies: always take the compatible movie that **ends first**. Why ends — not starts, not lengths: the earliest-ending movie leaves the most room for everything after it. Exchange flavor: take any optimal schedule and swap its first movie for the earliest-ending one; nothing after it breaks, so the count stays optimal.',
        code: `sort(v.begin(), v.end());            // v[i] = {end, start}
int cnt = 0, lastEnd = 0;
for (auto& [e, s] : v)
    if (s >= lastEnd) {              // compatible with what we kept
        cnt++;
        lastEnd = e;                 // commit, never look back
    }`,
      },
      {
        h: 'Classic fail: greedy coins',
        md: 'Largest-coin-first feels bulletproof — and it does work for {1, 2, 5, 10, …}. Now pay **6** with coins **{1, 3, 4}**: greedy grabs 4, then 1, 1 — three coins. Optimal is 3 + 3 — two. The local choice (grab the biggest) destroyed a better global pairing. Coin change in general needs DP (Unit 6). Moral: a greedy that passes the samples can still be quietly, fatally wrong.',
        note: 'Before coding any greedy, spend two minutes actively trying to kill it with a 2-3 element counterexample. Far cheaper than a WA.',
        noteKind: 'warn',
      },
      {
        h: 'Sort by the thing that constrains you',
        md: 'Many greedies are just "process in sorted order". Fight the **weakest dragon first**: any dragon you can beat now you can still beat later, and wins only make you stronger — choices never get worse. Pair the **lightest person with the heaviest** who fits under the weight cap. Strip factors in the forced order (divide out 3s before doubling 2s). Sorting turns "which choice is safe?" into a one-directional sweep where the safe choice is simply *next*.',
      },
      {
        h: 'The greedy workflow',
        md: '① Say the rule out loud: "sort by deadline"? "by duration"? "by end time"? ② Hunt counterexamples — tiny, 2-3 items, extreme values. ③ Sketch the exchange: adjacent swap never helps → the rule is safe. ④ Only then code: usually `sort` plus one pass, O(n log n). If every rule you propose dies to a counterexample, that is the problem telling you it wants DP or something else entirely — listen to it.',
      },
    ],
    exercises: [
      {
        id: 'gr-1', type: 'mcq', diff: 1,
        prompt: 'What makes an algorithm "greedy"?',
        options: [
          'It makes the locally best choice at each step and never reconsiders it',
          'It tries every possibility and keeps the best',
          'It caches subproblem answers to avoid recomputation',
          'It always sorts the input first',
        ],
        answer: 0,
        explain: 'Commit-and-never-revisit is the definition. Trying everything is brute force; caching subproblems is DP. Sorting is a frequent *ingredient* of greedy, but not what defines it.',
      },
      {
        id: 'gr-2', type: 'output', diff: 1,
        prompt: 'Dragons, greedily. What does this print?',
        code: `int main() {
    // {strength, bonus} of each dragon
    vector<pair<int,int>> d = {{5, 1}, {1, 10}, {3, 2}};
    sort(d.begin(), d.end());      // weakest dragon first
    long long s = 2;
    for (auto& [x, y] : d) {
        if (s > x) s += y;         // win: collect the bonus
        else { cout << "NO\\n"; return 0; }
    }
    cout << s << "\\n";
}`,
        answer: '15',
        explain: 'Sorted dragons: (1,10), (3,2), (5,1). Strength 2 beats 1 → 12, beats 3 → 14, beats 5 → 15. Fighting the weakest first is provably safe: any dragon beatable later is beatable now too, and bonuses only help.',
      },
      {
        id: 'gr-3', type: 'mcq', diff: 2,
        prompt: 'Movie Festival: maximize the number of non-overlapping movies you watch. The winning greedy sorts by…',
        options: [
          'earliest end time',
          'earliest start time',
          'shortest duration',
          'fewest overlaps with other movies',
        ],
        answer: 0,
        explain: 'Earliest end leaves the most room for the future. Earliest start dies to one long early movie ([1,100) blocks everything). Shortest dies to a short movie bridging two others. Fewest-overlaps sounds clever and also fails — and costs O(n²) to even compute.',
      },
      {
        id: 'gr-4', type: 'mcq', diff: 2,
        prompt: 'Coins {1, 3, 4}, amount 6. What does largest-coin-first produce, and what is optimal?',
        options: [
          'Greedy: 4+1+1 = 3 coins; optimal: 3+3 = 2 coins — greedy fails',
          'Greedy: 3+3 = 2 coins; greedy is optimal here',
          'Greedy: 4+1+1 = 3 coins, and 3 coins is optimal',
          'Greedy never terminates on this input',
        ],
        answer: 0,
        explain: 'Greedy grabs 4, leaving 2 to be paid as 1+1. But 3+3 pays 6 in two coins. {1,3,4} is the canonical counterexample system — memorize it as your proof that "obvious" greedies need justification.',
      },
      {
        id: 'gr-5', type: 'tf', diff: 2,
        statement: 'A greedy that produces correct answers on all the provided sample tests is safe to submit.',
        answer: false,
        explain: 'Samples are demonstrations, not proofs — setters rarely put the killer case in them. Safe means: you found an exchange argument, or you spent real effort hunting counterexamples and they all died.',
      },
      {
        id: 'gr-6', type: 'parsons', diff: 2,
        prompt: 'Assemble the Movie Festival core. `v[i] = {end, start}` is already read.',
        lines: [
          'sort(v.begin(), v.end());        // by end time',
          'int cnt = 0, lastEnd = 0;',
          'for (auto& [e, s] : v) {',
          '    if (s >= lastEnd) {',
          '        cnt++;',
          '        lastEnd = e;',
          '    }',
          '}',
          'cout << cnt << "\\n";',
        ],
        distractors: [
          '    if (s > lastEnd) {',
        ],
        explain: 'Sort by end (that is why end is first in the pair), sweep, take whatever is compatible. The distractor `s > lastEnd` rejects a movie starting exactly when the previous ends — but back-to-back is allowed, so it undercounts.',
      },
      {
        id: 'gr-7', type: 'mcq', diff: 2,
        prompt: 'Tasks and Deadlines (CSES 1630): reward = deadline − finish time, maximize total reward, n ≤ 2·10⁵. You sort by **deadline** and get WA. The fix?',
        options: [
          'Sort by duration, shortest first — total reward = Σdeadlines − Σfinish times, and the deadlines term is fixed regardless of order',
          'Sort by deadline descending instead',
          'Sort by deadline − duration',
          'Greedy cannot work here; it needs DP over subsets',
        ],
        answer: 0,
        explain: 'Σ(dᵢ − fᵢ) = Σdᵢ − Σfᵢ, and Σdᵢ does not depend on the order — the deadline is a red herring! Only the sum of finish times matters, and shortest-job-first minimizes it (adjacent swap: putting the shorter job first always reduces the pair’s total). At n = 2·10⁵, sort + sweep is exactly the budget.',
        hint: 'Expand the sum of rewards. Which part actually depends on the order?',
      },
      {
        id: 'gr-8', type: 'fill', diff: 2,
        prompt: 'Complete the exchange-argument template: a sorting rule is optimal if swapping any two ___ elements of the order never improves the result.',
        answer: ['adjacent'],
        placeholder: 'which elements?',
        explain: 'Adjacent. Any ordering can be reached from any other by adjacent swaps (bubble sort!), so if no single adjacent swap ever helps, the sorted order is unbeatable.',
      },
      {
        id: 'gr-9', type: 'output', diff: 2,
        prompt: 'Factor greedy (think "multiply by 2, divide by 6" — each /6 needs a 3 and a 2). What does this print?',
        code: `int main() {
    long long n = 972;
    int c2 = 0, c3 = 0;
    while (n % 2 == 0) { n /= 2; c2++; }
    while (n % 3 == 0) { n /= 3; c3++; }
    if (n != 1 || c2 > c3) cout << -1 << "\\n";
    else cout << (c3 - c2) + c3 << "\\n";  // doublings + divisions
}`,
        answer: '8',
        explain: '972 = 2²·3⁵: c2=2, c3=5, remainder 1. Each ÷6 burns one 2 and one 3, so you need c3 ≥ c2 and (c3−c2) doublings to balance, then c3 divisions: 3 + 5 = 8. Any other prime factor → impossible. Greedy on the factorization, no search needed.',
        hint: 'Factor 972 first: how many 2s, how many 3s?',
      },
      {
        id: 'gr-10', type: 'multi', diff: 2,
        prompt: 'Which claims are TRUE? Select all that apply.',
        options: [
          'Earliest-end-time maximizes the number of non-overlapping intervals',
          'Largest-coin-first is optimal for every coin system',
          'For 0/1 knapsack, greedily grabbing by value/weight ratio is optimal',
          'Pairing the lightest person with the heaviest who fits (weight cap per gondola) minimizes gondolas',
          'Passing all samples is strong evidence a greedy is correct',
        ],
        answers: [0, 3],
        explain: 'Earliest-end and lightest-with-heaviest both survive exchange arguments. Coins {1,3,4} kill claim 2; 0/1 knapsack by ratio dies when a big item blocks two medium ones (fractional knapsack is where ratio wins); and samples prove nothing — see claim 5’s graveyard.',
      },
      {
        id: 'gr-11', type: 'code', diff: 3,
        prompt: 'Movie Festival, for real: read `n`, then n lines `start end`. Print the maximum number of non-overlapping movies (touching endpoints allowed: a movie may start exactly when the previous one ends).',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    // read {end, start}, sort by end, sweep
    // your code

    return 0;
}`,
        tests: [
          { input: '3\n3 5\n4 9\n5 8', expected: '2' },
          { input: '1\n5 6', expected: '1' },
          { input: '4\n1 2\n2 3\n3 4\n1 10', expected: '3' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<pair<int,int>> v(n);            // {end, start} → sort by end
    for (auto& [e, s] : v) cin >> s >> e;  // input is "start end"
    sort(v.begin(), v.end());
    int cnt = 0, lastEnd = 0;
    for (auto& [e, s] : v) {
        if (s >= lastEnd) {                // compatible: take it
            cnt++;
            lastEnd = e;
        }
    }
    cout << cnt << "\\n";
    return 0;
}`,
        explain: 'Store {end, start} so the default pair sort orders by end time, then sweep taking everything compatible. Test 3 is the trap run: back-to-back movies (s == lastEnd) must all count — that is the `>=`.',
        hint: 'Which field goes FIRST in the pair, given that sort compares the first field?',
      },
      {
        id: 'gr-12', type: 'mcq', diff: 3,
        prompt: 'Proposed greedy for Movie Festival: "always watch the SHORTEST remaining compatible movie." Which instance kills it?',
        options: [
          'Movies [1,5), [5,9), [4,6): the short middle movie blocks both long ones — greedy 1, optimal 2',
          'Movies [1,2), [2,3), [3,4): three back-to-back movies',
          'Movies [1,10), [2,3): one inside the other',
          'A single movie [1,4)',
        ],
        answer: 0,
        explain: 'Shortest-first grabs [4,6) (length 2), which overlaps both [1,5) and [5,9) — one movie instead of two. In the other instances shortest-first happens to tie the optimum. Good counterexamples are engineered: make the greedy’s favorite choice block two future wins.',
        hint: 'Build a case where the shortest movie sits across the boundary of two compatible ones.',
      },
    ],
    problems: [
      { name: 'Multiply by 2, divide by 6', platform: 'Codeforces', id: '1374B', rating: 900, url: 'https://codeforces.com/problemset/problem/1374/B', difficulty: 'intro', why: 'Greedy on prime factors: strip the 3s and 2s and prove no other move ever helps.' },
      { name: 'Dragons', platform: 'Codeforces', id: '230A', rating: 1000, url: 'https://codeforces.com/problemset/problem/230/A', difficulty: 'easy', why: 'Sort and fight the weakest first — your first exchange argument in the wild.' },
      { name: 'Movie Festival', platform: 'CSES', id: '1629', url: 'https://cses.fi/problemset/task/1629', difficulty: 'easy', why: 'THE earliest-end-time classic — interval scheduling exactly as proved in this lesson.' },
      { name: 'Tasks and Deadlines', platform: 'CSES', id: '1630', url: 'https://cses.fi/problemset/task/1630', difficulty: 'med', why: 'Sort by shortest duration — the deadline is a red herring, and the exchange argument tells you why.' },
    ],
  },
};

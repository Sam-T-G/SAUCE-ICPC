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

  // ==========================================================================
  'two-pointers': {
    id: 'two-pointers',
    objectives: [
      'Recognize "sorted + pair/segment condition" as a two-pointer invitation',
      'Run the sorted two-sum scan, justifying every pointer move with the discard argument',
      'Bound the work: each pointer only advances, so the whole scan is O(n)',
      'Apply the same-direction variants: merging sorted arrays and in-place dedupe',
    ],
    theory: [
      {
        h: 'Two indices, one direction, O(n)',
        md: 'The pattern: keep two indices into the data and only ever move them **one direction**. Because neither pointer ever backs up, the entire scan costs O(n) — even when an inner while makes it look quadratic. Recognition cues: the array is **sorted** (or you may sort it), and the question is about a **pair** or a contiguous stretch meeting a condition — "two values summing to x", "pair people under a weight cap", "merge these sorted lists". The constraints whisper too: n ≤ 2·10⁵ kills the O(n²) all-pairs scan, and "sorted + pair condition" is your invitation to do better.',
      },
      {
        h: 'Sorted two-sum: squeeze from both ends',
        md: 'Looking for a[l] + a[r] = x in sorted data: start l at the left end, r at the right, compare the sum to x. Too small → `l++`. Too big → `r--`. The license to discard: if the sum is too small, then a[l] paired with its **best possible partner** (a[r], the largest still alive) still failed — a[l] can never be in any answer, drop it forever. Symmetric for a[r] when the sum is too big. Every step permanently kills one element; nothing is ever revisited.',
        code: `sort(a.begin(), a.end());            // the scan only works on sorted data
int l = 0, r = n - 1;
while (l < r) {
    long long s = a[l] + a[r];       // values near 1e9: sum in long long
    if (s == x) { /* pair found */ break; }
    if (s < x) l++;                  // a[l] failed with the BIGGEST partner: dead
    else r--;                        // a[r] failed with the SMALLEST partner: dead
}`,
        note: '`a[l] + a[r]` with values near 10⁹ flirts with INT_MAX. Compute the sum in long long and never think about it again.',
      },
      {
        h: 'Why it is O(n): count total movement',
        md: 'The loop looks innocent, but prove the cost properly: do the accounting per **pointer**, not per iteration. l only increases, r only decreases, and they stop on meeting — total pointer movement ≤ n + n = 2n, so the scan is O(n), and the initial sort (O(n log n)) dominates. This *amortized* accounting — "how far can this thing travel in total?" — is the exact argument that will later certify sliding windows, monotonic stacks, and KMP. Learn it as a reusable proof shape, not a one-off fact.',
      },
      {
        h: 'Pair from both ends: Ferris Wheel',
        md: 'Ferris Wheel (CSES 1090): gondolas hold at most 2 people under weight cap x; minimize gondolas. Sort, then aim pointers at the **lightest** (l) and the **heaviest** (r). If those two fit together, seat them together. If they do not, nobody can share with the heaviest — every other candidate weighs more than the lightest — so the heaviest rides alone. Either way the heaviest is seated: `r--`, count one gondola. Greedy choice, two-pointer engine, exchange-argument soul.',
        code: `sort(w.begin(), w.end());
int l = 0, r = n - 1, gondolas = 0;
while (l <= r) {                     // <= : a lone last rider still needs a seat
    if (l < r && w[l] + w[r] <= x)   // lightest fits with heaviest?
        l++;                         // pair them up
    r--;                             // the heaviest always boards now
    gondolas++;
}`,
      },
      {
        h: 'Same direction: merging two sorted arrays',
        md: 'Both pointers can also march the **same way**. To merge two sorted arrays, compare the fronts, take the smaller, and advance only that pointer; when one array runs dry, drain the other. Each element is taken exactly once: O(n + m). This is the merge step of merge sort — and the same sweep answers "do these sorted lists share an element?" or "how many of b appear in a?". Any time two sorted sequences must be walked together, this is the shape.',
        code: `int i = 0, j = 0;
while (i < n && j < m)                                // take the smaller front
    c.push_back(a[i] <= b[j] ? a[i++] : b[j++]);
while (i < n) c.push_back(a[i++]);                    // drain what is left
while (j < m) c.push_back(b[j++]);`,
      },
      {
        h: 'Read/write pointers — and the traps',
        md: 'In-place dedupe of a sorted array: a slow **write** pointer w marks where the next kept value lands, a fast **read** pointer r scans everything; keep a[r] only when it differs from the last *kept* value a[w−1]. The traps that cost real submissions: forgetting to **sort first**; needing **original indices** after sorting (sort {value, index} pairs — CSES 1640 punishes this); and `l < r` vs `l <= r` — for pairs use `l < r`, or you will pair an element with itself.',
        code: `int w = 0;                            // a[0..w) holds the deduped prefix
for (int r = 0; r < n; r++)
    if (w == 0 || a[r] != a[w - 1])   // first value, or a brand-new one?
        a[w++] = a[r];                // keep it; duplicates fall through
// the first w elements are the sorted distinct values`,
        note: 'Sorting reorders the world. If the output wants positions in the ORIGINAL array, carry indices along: `vector<pair<int,int>>` of {value, index}.',
        noteKind: 'warn',
      },
    ],
    exercises: [
      {
        id: 'tp-1', type: 'output', diff: 1,
        prompt: 'Trace the two-sum scan. What does this print?',
        code: `int main() {
    vector<int> a = {1, 3, 4, 6, 9};   // sorted
    int x = 7, l = 0, r = 4;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == x) { cout << a[l] << " " << a[r] << "\\n"; return 0; }
        if (s < x) l++;
        else r--;
    }
    cout << "none\\n";
}`,
        answer: '1 6',
        explain: 'Step 1: 1 + 9 = 10 > 7 → r--. Step 2: 1 + 6 = 7 → print "1 6". Two comparisons, done — each step permanently discards one end or finishes.',
      },
      {
        id: 'tp-2', type: 'mcq', diff: 1,
        prompt: 'Sorted two-sum scan, and `a[l] + a[r] < x`. Which pointer moves, and why?',
        options: [
          '`l++` — a[r] is the biggest partner a[l] could ever get; even that was too small, so a[l] can never be in an answer',
          '`r--` — shrinking from the right keeps the sum small',
          'Both move — the scan must stay symmetric',
          'Reset r = n - 1 and try the next l',
        ],
        answer: 0,
        explain: 'That is the discard argument: a[l] just failed with its best-case partner, so it is dead forever. Resetting r per l (option 4) is the O(n²) version — *never resetting* is the entire trick.',
      },
      {
        id: 'tp-3', type: 'output', diff: 2,
        prompt: 'Same-direction pointers: merging. What does this print?',
        code: `int main() {
    vector<int> a = {2, 5, 8}, b = {1, 3, 9};
    int i = 0, j = 0;
    while (i < 3 && j < 3) {
        if (a[i] <= b[j]) cout << a[i++] << " ";
        else cout << b[j++] << " ";
    }
    while (i < 3) cout << a[i++] << " ";
    while (j < 3) cout << b[j++] << " ";
}`,
        answer: '1 2 3 5 8 9',
        explain: 'Always emit the smaller front: 1 (from b), 2, then 3, then 5, then 8 — a runs dry — drain b: 9. Each element is touched once: O(n + m), the merge-sort merge.',
      },
      {
        id: 'tp-4', type: 'mcq', diff: 2,
        prompt: 'Why is the whole two-pointer scan O(n) and not O(n²)?',
        options: [
          'Each pointer only ever moves forward — together they take at most 2n steps, so the loop cannot run longer',
          'Because the array is sorted, each comparison costs O(1)',
          'The search space halves every iteration',
          'It is actually O(n log n) because of the comparisons',
        ],
        answer: 0,
        explain: 'Count movement per pointer: l only up, r only down, ≤ 2n moves total. "Halving" is binary search — a different beast. O(1) comparisons are true but say nothing about how many iterations happen.',
      },
      {
        id: 'tp-5', type: 'parsons', diff: 2,
        prompt: 'Assemble: sorted two-sum that prints YES if any pair of **distinct elements** sums to x, else NO. (`a` and `n` are read, `x` given.)',
        lines: [
          'sort(a.begin(), a.end());',
          'int l = 0, r = n - 1;',
          'while (l < r) {',
          '    long long s = a[l] + a[r];',
          '    if (s == x) { cout << "YES\\n"; return 0; }',
          '    if (s < x) l++;',
          '    else r--;',
          '}',
          'cout << "NO\\n";',
        ],
        distractors: [
          'while (l <= r) {',
        ],
        explain: 'Sort, then squeeze from both ends. The distractor `l <= r` lets l == r — adding a[l] to itself and claiming YES from one element used twice. "Two values" means two *positions*: `l < r`.',
      },
      {
        id: 'tp-6', type: 'bank', diff: 2,
        prompt: 'Ferris Wheel: weights sorted ascending in `w`, gondola cap `x`. Complete the pairing sweep.',
        code: `sort(w.begin(), w.end());
int l = 0, r = n - 1, g = 0;
while (l ___ r) {                  // a lone last rider still needs a gondola
    if (l < r && w[l] + w[r] <= x)
        ___;                       // the lightest joins the heaviest
    ___;                           // the heaviest always boards now
    g++;
}`,
        answer: ['<=', 'l++', 'r--'],
        distractors: ['<', 'r++', 'l--'],
        explain: 'The pair test needs `l < r` (two different people), but the LOOP needs `l <= r` — when one rider remains, they still consume a gondola. The heaviest is always seated (`r--`); the lightest tags along only if the cap allows (`l++`).',
      },
      {
        id: 'tp-7', type: 'tf', diff: 1,
        statement: 'The two-sum pointer scan is only valid on sorted data: on an unsorted array, moving a pointer can discard a valid pair.',
        answer: true,
        explain: 'The discard argument leans entirely on order — "a[r] is the largest remaining partner" is meaningless unsorted. That is why the recipe is sort first (O(n log n)), then scan (O(n)).',
      },
      {
        id: 'tp-8', type: 'mcq', diff: 2,
        prompt: 'Sum of Two Values (CSES 1640) wants the **original positions** of the two values. This prints wrong indices. The bug?',
        code: `sort(a.begin(), a.end());
int l = 0, r = n - 1;
while (l < r) {
    long long s = a[l] + a[r];
    if (s == x) { cout << l + 1 << " " << r + 1 << "\\n"; return 0; }
    if (s < x) l++;
    else r--;
}
cout << "IMPOSSIBLE\\n";`,
        options: [
          'l and r index the SORTED array — sorting threw away the original positions. Sort {value, original index} pairs instead',
          'The +1s are wrong: CSES expects 0-indexed positions',
          'It should print r + 1 before l + 1',
          'The IMPOSSIBLE line is unreachable',
        ],
        answer: 0,
        explain: 'After sorting, position l is *where the value lives now*, not where it came from. Store `{a[i], i}` pairs, sort those, and print the carried indices. This exact trap is why 1640 rejects so many first submissions.',
        hint: 'What did sort() do to the relationship between value and position?',
      },
      {
        id: 'tp-9', type: 'fill', diff: 2,
        prompt: 'Two-sum scan, the too-big case — complete the move:\n`if (s > x) ___;`',
        answer: ['r--', '--r', 'r -= 1', 'r = r - 1'],
        placeholder: 'which pointer, which way?',
        explain: 'Too big means a[r] overshot even with a[l], the *smallest* remaining partner — so a[r] can never work: discard it with `r--`. Each branch kills the element whose best case just failed.',
      },
      {
        id: 'tp-10', type: 'mcq', diff: 2,
        prompt: '**n ≤ 2·10⁵**, values up to 10⁹: does any pair sum to x? Which plan survives the ~10⁸ ops budget?',
        options: [
          'Sort (O(n log n)), then the two-pointer scan (O(n)) — a few million operations total',
          'All pairs: n²/2 ≈ 2·10¹⁰ checks — fits in one second',
          'Two pointers directly on the unsorted array, saving the sort',
          'Enumerate orderings with next_permutation and check each',
        ],
        answer: 0,
        explain: 'n² at 2·10⁵ is ~4·10¹⁰ ordered (2·10¹⁰ unordered) — a couple hundred seconds. Skipping the sort breaks the discard argument, so option 3 is *wrong*, not just slow. Sort + scan: ~2·10⁵·18 + 2·10⁵ ops. Easy.',
      },
      {
        id: 'tp-11', type: 'output', diff: 3,
        prompt: 'Read/write pointers, in-place dedupe. What does this print?',
        code: `int main() {
    vector<int> a = {1, 1, 2, 3, 3, 3, 5};
    int w = 0;                          // write position
    for (int r = 0; r < (int)a.size(); r++) {
        if (w == 0 || a[r] != a[w - 1]) {
            a[w] = a[r];
            w++;
        }
    }
    cout << w << ": ";
    for (int i = 0; i < w; i++) cout << a[i] << " ";
}`,
        answer: '4: 1 2 3 5',
        explain: 'w advances only when a[r] differs from the last KEPT value a[w-1]: keep 1, skip 1, keep 2, keep 3, skip 3 3, keep 5 → four distinct values written over the front of the array, garbage left beyond w.',
        hint: 'Track two things per step: what a[w-1] is, and whether w moves.',
      },
      {
        id: 'tp-12', type: 'code', diff: 3,
        prompt: 'Merge two sorted arrays. Read `n m`, then n sorted integers, then m sorted integers. Print all n+m values in sorted order, space-separated, in O(n+m) — no re-sorting.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> a(n), b(m);
    for (auto &v : a) cin >> v;
    for (auto &v : b) cin >> v;
    // your code

    return 0;
}`,
        tests: [
          { input: '3 3\n2 5 8\n1 3 9', expected: '1 2 3 5 8 9' },
          { input: '1 4\n10\n1 2 3 4', expected: '1 2 3 4 10' },
          { input: '2 2\n1 1\n1 1', expected: '1 1 1 1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<long long> a(n), b(m);
    for (auto &v : a) cin >> v;
    for (auto &v : b) cin >> v;
    int i = 0, j = 0;
    while (i < n && j < m) {                  // take the smaller front
        if (a[i] <= b[j]) cout << a[i++] << " ";
        else cout << b[j++] << " ";
    }
    while (i < n) cout << a[i++] << " ";      // drain the leftovers
    while (j < m) cout << b[j++] << " ";
    cout << "\\n";
    return 0;
}`,
        explain: 'Compare fronts, emit the smaller, advance that pointer only — then drain whichever array is left. Test 3 checks ties and duplicates: `<=` keeps the merge stable and every copy survives.',
        hint: 'Exactly one pointer advances per emitted value. What happens when one array empties first?',
      },
    ],
    problems: [
      { name: 'Ferris Wheel', platform: 'CSES', id: '1090', url: 'https://cses.fi/problemset/task/1090', difficulty: 'easy', why: 'Pair lightest with heaviest under the cap — l and r from both ends, and the lone-rider `l <= r` detail.' },
      { name: 'Sum of Two Values', platform: 'CSES', id: '1640', url: 'https://cses.fi/problemset/task/1640', difficulty: 'easy', why: 'The sorted two-sum scan — but the answer wants ORIGINAL indices, so sort {value, index} pairs.' },
      { name: 'Interesting drink', platform: 'Codeforces', id: '706B', rating: 1100, url: 'https://codeforces.com/problemset/problem/706/B', difficulty: 'easy', why: 'Sort prices once, answer each day with upper_bound — or sort the queries too and sweep a second pointer.' },
    ],
  },

  // ==========================================================================
  'sliding-window': {
    id: 'sliding-window',
    objectives: [
      'Maintain a window invariant: admit a[r], then shrink from the left until it holds again',
      'Count valid subarrays with the r − l + 1 trick',
      'Track window contents with a frequency map (distinct values, repeats)',
      'Check monotonicity before sliding — negative values break sum-windows',
    ],
    theory: [
      {
        h: 'A window is an invariant on [l, r]',
        md: 'A sliding window is two same-direction pointers plus a **promise**: the segment [l, r] always satisfies some condition — sum ≤ S, at most k distinct values, no repeated song. The loop has one heartbeat: pull a[r] in; if the promise broke, **evict from the left until it holds again**. Recognition cues: the word **contiguous** (subarray, substring), a condition on the segment’s contents, and n up to 10⁵–10⁶ demanding O(n). If elements may be rearranged, or you pick a non-contiguous subset, there is no window to slide.',
      },
      {
        h: 'The canonical loop: grow right, fix left',
        md: 'Longest subarray with sum ≤ S, all values **positive** (that caveat gets its own card). For each r: add a[r]; while the sum is too big, evict a[l] and advance l; now [l, r] is the biggest valid window ending at r. Every element enters once and leaves at most once — ≤ 2n pointer moves, O(n) total: the same amortized accounting that certified two pointers.',
        code: `int l = 0, best = 0;
long long sum = 0;
for (int r = 0; r < n; r++) {
    sum += a[r];                     // 1) the window grows: a[r] enters
    while (sum > S)                  // 2) invariant broken?
        sum -= a[l++];               //    evict from the left until it holds
    best = max(best, r - l + 1);     // 3) [l, r] is now valid — measure it
}`,
        note: 'Measure the window AFTER the shrink loop — only then does the invariant hold. Scoring a broken window is the quiet way to overcount.',
      },
      {
        h: 'Counting subarrays: the r − l + 1 trick',
        md: 'To **count** valid subarrays instead of finding the longest: after fixing the window at r, every left endpoint in [l, r] gives a valid subarray **ending at r** — that is exactly r − l + 1 of them. Add it and move on. Summing over all r counts each valid subarray exactly once, filed under its right end. This works because validity is monotone in the left endpoint: if [l, r] fits the budget, every shorter suffix [l′, r] fits too.',
        code: `long long cnt = 0, sum = 0;
int l = 0;
for (int r = 0; r < n; r++) {
    sum += a[r];                     // admit a[r]
    while (sum > S) sum -= a[l++];   // restore the invariant
    cnt += r - l + 1;                // subarrays ending at r: [l..r], [l+1..r], ...
}`,
      },
      {
        h: 'Windows with a frequency map',
        md: 'When the invariant is about **contents** — "no repeats", "at most k distinct" — put a frequency map inside the window. Playlist (CSES 1141): when song a[r] enters and its count hits 2, evict from the left until that duplicate is gone. For "at most k distinct", track how many counts are nonzero and shrink while it exceeds k. With a `map` the pass costs O(n log n); `unordered_map` or a plain array brings it back to O(n). Either way: leagues ahead of the O(n²) rescan.',
        code: `map<int,int> cnt;                    // value -> occurrences inside [l, r]
int l = 0, best = 0;
for (int r = 0; r < n; r++) {
    cnt[a[r]]++;                     // song r enters
    while (cnt[a[r]] > 1)            // the newcomer is duplicated?
        cnt[a[l++]]--;               // evict from the left until it is unique
    best = max(best, r - l + 1);
}`,
      },
      {
        h: 'Fixed-size windows slide in O(1)',
        md: 'When the window size k is **given** ("best sum of k consecutive days"), there is nothing to shrink: slide both ends together. After the first window, each step is two operations — the entering element is added, the element k positions back falls off. Watch the eviction index: once a[r] is in, the window is [r−k+1, r], so the leaver was a[r−k]. An off-by-one here silently evicts a survivor and keeps a ghost.',
        code: `long long sum = 0;
for (int i = 0; i < k; i++) sum += a[i];   // the first window: [0, k-1]
long long best = sum;
for (int r = k; r < n; r++) {
    sum += a[r] - a[r - k];                // slide: one in, one out
    best = max(best, sum);
}`,
      },
      {
        h: 'THE caveat: windows need monotonicity',
        md: '"Sum too big → shrink" is only legal because, with positive values, growing the window **always** grows the sum and shrinking always shrinks it. Allow negatives and that dies: extending can *reduce* the sum, so a "broken" window might become valid again later — the shrink loop throws away real answers. Subarray Sums I (positives) is a window; **Subarray Sums II (negatives allowed) is not** — there you count with prefix sums + a hashmap, next skill. Before you slide anything, read the value range as carefully as you read n.',
        note: 'Negative numbers in a sum-window problem are a tripwire. The fix is not a cleverer window — it is a different tool: prefix + hashmap.',
        noteKind: 'danger',
      },
    ],
    exercises: [
      {
        id: 'sw-1', type: 'output', diff: 1,
        prompt: 'Longest window with sum ≤ 7. What does this print?',
        code: `int main() {
    vector<int> a = {2, 1, 4, 3, 2};
    int l = 0, best = 0;
    long long sum = 0;
    for (int r = 0; r < 5; r++) {
        sum += a[r];                    // a[r] enters
        while (sum > 7) sum -= a[l++];  // shrink until valid
        best = max(best, r - l + 1);
    }
    cout << best << "\\n";
}`,
        answer: '3',
        explain: 'The window reaches [0..2] = {2,1,4}, sum 7, length 3. At r = 3 the sum hits 10, so 2 and 1 are evicted (l = 2); no later window beats length 3. Note l never moved backward — that is the O(n) guarantee.',
      },
      {
        id: 'sw-2', type: 'mcq', diff: 1,
        prompt: 'Which phrase in a statement is the strongest "sliding window" signal?',
        options: [
          '"…the longest **contiguous** subarray whose sum is at most S" (all values positive)',
          '"…any two elements whose sum equals x"',
          '"…the best **subset** of elements" (adjacency irrelevant)',
          '"…after rearranging the array arbitrarily…"',
        ],
        answer: 0,
        explain: 'Windows are contiguous ranges with a condition to maintain. Pairs point at two pointers from both ends; subsets and rearrangement destroy contiguity, so there is nothing for a window to slide over.',
      },
      {
        id: 'sw-3', type: 'output', diff: 2,
        prompt: 'Counting version — what does this print?',
        code: `int main() {
    vector<int> a = {1, 2, 3};
    int l = 0;
    long long sum = 0, cnt = 0;
    for (int r = 0; r < 3; r++) {
        sum += a[r];
        while (sum > 5) sum -= a[l++];
        cnt += r - l + 1;          // windows ending at r
    }
    cout << cnt << "\\n";
}`,
        answer: '5',
        explain: 'r=0 adds 1 ({1}); r=1 adds 2 ({2}, {1,2}); r=2: sum 6 > 5 evicts the 1, then adds 2 ({3}, {2,3}). Total 5 subarrays with sum ≤ 5 — each counted once, at its right end.',
        hint: 'After the shrink at r = 2, where is l?',
      },
      {
        id: 'sw-4', type: 'mcq', diff: 2,
        prompt: 'In the counting pattern, after the shrink we do `cnt += r - l + 1`. What exactly does that add?',
        options: [
          'All valid subarrays that END at r — one per left endpoint in [l, r]',
          'All subarrays fully contained in the window [l, r]',
          'The length of the longest valid subarray so far',
          'All subarrays that start at l',
        ],
        answer: 0,
        explain: 'l is the smallest valid left end for this r, and (with positives) every later start also works: r − l + 1 subarrays ending at r. Option 2 would be len·(len+1)/2 and double-counts across iterations — the classic miscount.',
      },
      {
        id: 'sw-5', type: 'parsons', diff: 2,
        prompt: 'Assemble the Playlist core: longest stretch of pairwise-distinct songs (`a`, `n` already read).',
        lines: [
          'map<int,int> cnt;',
          'int l = 0, best = 0;',
          'for (int r = 0; r < n; r++) {',
          '    cnt[a[r]]++;                  // song r enters the window',
          '    while (cnt[a[r]] > 1)         // the newcomer is duplicated?',
          '        cnt[a[l++]]--;            // evict from the left until it is unique',
          '    best = max(best, r - l + 1);',
          '}',
          'cout << best << "\\n";',
        ],
        distractors: [
          '    while (cnt[a[l]] > 1)         // ← watches the wrong end of the window',
        ],
        explain: 'Shrink based on the element you just ADDED — it is the only one that can have become duplicated. The distractor checks the left end’s count, which can sit at 1 while the real duplicate survives inside the window.',
      },
      {
        id: 'sw-6', type: 'tf', diff: 1,
        statement: 'Despite the nested while, a sliding-window pass is O(n): l never moves backward, so the inner loop runs at most n times TOTAL across the whole scan.',
        answer: true,
        explain: 'Amortize: each element enters the window once and leaves at most once — ≤ 2n pointer moves overall. "Nested loop = quadratic" is a reflex worth unlearning here; count total movement instead.',
      },
      {
        id: 'sw-7', type: 'mcq', diff: 3,
        prompt: 'Count subarrays with sum exactly x — but values may be **negative**. Your positive-only window solution gets WA. Why?',
        options: [
          'Growing the window no longer monotonically grows the sum, so "too big → shrink, too small → grow" discards windows that would have become valid',
          'Add a large constant to every element to make them positive, then run the same window — the WA is elsewhere',
          'The shrink loop just needs a second case that also shrinks when the sum is too small',
          'Negative inputs require doubles instead of long long',
        ],
        answer: 0,
        explain: 'Monotonicity is the window’s license, and negatives revoke it. The tempting "shift everything positive" fix fails too: adding C changes a length-L subarray’s sum by C·L — a different target per length. The real tool: prefix sums + hashmap (Subarray Sums II).',
        hint: 'What does the shrink step silently assume about adding one more element?',
      },
      {
        id: 'sw-8', type: 'bank', diff: 2,
        prompt: 'Fixed window of size k: best sum of k consecutive values. Fill the slide.',
        code: `long long sum = 0;
for (int i = 0; i < k; i++) sum += a[i];   // first window: [0, k-1]
long long best = sum;
for (int r = k; r < n; r++) {
    sum += ___;          // the new right element enters
    sum -= ___;          // the stale left element leaves
    best = max(best, sum);
}`,
        answer: ['a[r]', 'a[r - k]'],
        distractors: ['a[r - k + 1]', 'a[l]'],
        explain: 'After a[r] enters, the window must be [r−k+1, r] — so the leaver is a[r−k]. Evicting a[r−k+1] throws out a survivor; and there is no l in this pattern at all, the geometry is fixed by k.',
      },
      {
        id: 'sw-9', type: 'fill', diff: 2,
        prompt: 'Counting valid subarrays: after restoring the invariant at r, add ___ to the count.',
        answer: ['r - l + 1', 'r-l+1', '(r - l + 1)', '(r-l+1)'],
        placeholder: 'how many windows end at r?',
        explain: 'One valid subarray per left endpoint in [l, r], all ending at r. Summed over every r, each valid subarray is counted exactly once — at its right end.',
      },
      {
        id: 'sw-10', type: 'mcq', diff: 2,
        prompt: 'This window never finds the right answer (and on some inputs never finishes). The bug?',
        code: `int l = 0;
long long sum = 0, best = 0;
for (int r = 0; r < n; r++) {
    sum += a[r];
    while (sum > S) sum -= a[l];   // ← look here
    best = max(best, (long long)(r - l + 1));
}`,
        options: [
          'l is never incremented — the same a[l] is subtracted over and over, corrupting sum, while r - l + 1 reports a window that never shrank',
          'The while should be an if — one eviction is always enough',
          'sum must be reset to 0 after each shrink',
          'best must be updated before the while loop',
        ],
        answer: 0,
        explain: 'Evicting is two things: subtract AND advance — `sum -= a[l++];`. As written, sum spirals downward while the window bounds stay put. (The if-version is a different real bug: it can exit with the invariant still broken.)',
      },
      {
        id: 'sw-11', type: 'multi', diff: 2,
        prompt: 'Which statements are TRUE? Select all that apply.',
        options: [
          'All values positive + "longest contiguous subarray with sum ≤ S" → expand/shrink window solves it in O(n)',
          'With negatives in a sum-window, "too big → shrink" can skip valid answers — the invariant is no longer monotone',
          'At n = 2·10⁵, checking all ~2·10¹⁰ subarrays one by one fits the ops budget',
          'A fixed-size window slides in O(1) per step: one element enters, one leaves',
          'Sliding windows also optimize over non-contiguous subsequences',
        ],
        answers: [0, 1, 3],
        explain: 'The window’s two requirements: contiguity and monotonicity. 2·10¹⁰ operations is ~200 seconds — constraints said no. And subsequences have no left/right boundary to slide, so claim 5 collapses.',
      },
      {
        id: 'sw-12', type: 'code', diff: 3,
        prompt: 'Read `n S`, then n **positive** integers. Print the length of the longest contiguous subarray with sum ≤ S (0 if even single elements exceed S).',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long S;
    cin >> n >> S;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    // your code

    return 0;
}`,
        tests: [
          { input: '6 8\n3 1 2 1 5 2', expected: '4' },
          { input: '1 1\n5', expected: '0' },
          { input: '4 100\n10 20 30 40', expected: '4' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long S;
    cin >> n >> S;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int l = 0, best = 0;
    long long sum = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];                       // window grows right
        while (sum > S) sum -= a[l++];     // evict until valid again
        best = max(best, r - l + 1);       // [l, r] now satisfies sum <= S
    }
    cout << best << "\\n";
    return 0;
}`,
        explain: 'The canonical grow/shrink loop. Test 2 is the edge: a lone 5 > 1 forces l past r, the window empties, and r - l + 1 = 0 — which max() handles for free. No special-casing needed if the invariant logic is clean.',
        hint: 'What is r - l + 1 when every element gets evicted, including a[r] itself?',
      },
    ],
    problems: [
      { name: 'Subarray Sums I', platform: 'CSES', id: '1660', url: 'https://cses.fi/problemset/task/1660', difficulty: 'easy', why: 'Count subarrays with sum exactly x on positives — expand, shrink, and count the hits.' },
      { name: 'Books', platform: 'Codeforces', id: '279B', rating: 1400, url: 'https://codeforces.com/problemset/problem/279/B', difficulty: 'med', why: 'Longest window with total reading time ≤ t — the canonical maximize-the-window, dressed in a story.' },
      { name: 'Playlist', platform: 'CSES', id: '1141', url: 'https://cses.fi/problemset/task/1141', difficulty: 'med', why: 'Longest window of distinct songs — frequency map plus shrink-while-the-newcomer-repeats.' },
      { name: 'Subarray Sums II', platform: 'CSES', id: '1661', url: 'https://cses.fi/problemset/task/1661', difficulty: 'med', why: 'Same statement as Sums I but negatives allowed — the window dies and prefix + hashmap takes over. Feel the difference.' },
    ],
  },

  // ==========================================================================
  'prefix-sums': {
    id: 'prefix-sums',
    objectives: [
      'Build p[i+1] = p[i] + a[i] and answer any range sum as p[r+1] − p[l]',
      'Extend to 2D rectangle sums with inclusion–exclusion',
      'Batch range-updates with a difference array and one rebuild pass',
      'Count exact-sum subarrays with prefix + hashmap, negatives included',
    ],
    theory: [
      {
        h: 'Pay once, answer forever',
        md: 'q range-sum queries answered by rescanning cost O(nq) — at n = q = 2·10⁵ that is 4·10¹⁰ operations, dead many times over. Prefix sums pay O(n) **once**: p[i] = sum of the first i values, and any range sum becomes a single subtraction, O(1) per query. Recognition cues: a **static** array (no updates between queries), "sum / count over a range", many queries — or any algorithm of yours that keeps re-summing overlapping segments. This trick hides inside half of all medium problems; reach for it reflexively.',
      },
      {
        h: 'The +1 convention and off-by-ones',
        md: 'Give p one extra slot: p[0] = 0 and p[i+1] = p[i] + a[i], so p[i] is the sum of the first i elements. Then the sum of a[l..r] (0-indexed, inclusive) is **p[r+1] − p[l]**: everything through r, minus everything before l. The empty prefix p[0] = 0 means l = 0 needs no special case. Pick this convention and drill it — mixing it with the 1-indexed flavor (p[r] − p[l−1]) inside one program is the classic prefix bug.',
        code: `vector<long long> p(n + 1, 0);       // p[0] = 0: the empty prefix
for (int i = 0; i < n; i++)
    p[i + 1] = p[i] + a[i];          // p[i+1] = sum of the first i+1 values

// sum of a[l..r], 0-indexed inclusive:
long long s = p[r + 1] - p[l];`,
        note: 'Sums overflow: n = 2·10⁵ values of 10⁹ reach 2·10¹⁴. The prefix array is long long, no exceptions.',
        noteKind: 'warn',
      },
      {
        h: '2D: rectangles by inclusion–exclusion',
        md: 'Same idea on grids: p[i][j] = sum of the i×j rectangle anchored at the top-left corner. Build: take the cell, add the prefix above and the prefix to the left — the region that is above AND left got added twice, so subtract it once. Query mirrors it: take the big prefix, strip above, strip left, then **add back the corner you stripped twice**. Forest Queries (CSES 1652) is this pair of formulas verbatim.',
        code: `// build: p is (n+1) x (m+1), zero row/column up front
p[i + 1][j + 1] = g[i][j]
                + p[i][j + 1]        // everything above
                + p[i + 1][j]        // everything left
                - p[i][j];           // above-AND-left was counted twice

// query rectangle (r1, c1)..(r2, c2), inclusive:
long long s = p[r2 + 1][c2 + 1]
            - p[r1][c2 + 1]          // strip above
            - p[r2 + 1][c1]          // strip left
            + p[r1][c1];             // corner was subtracted twice: add it back`,
      },
      {
        h: 'Difference arrays: many updates, one read',
        md: 'The mirror image of prefix sums. To add v to every element of a[l..r], record only the **edges**: d[l] += v and d[r+1] −= v. After all m updates, one prefix pass over d rebuilds the final array — each +v starts influencing positions at l, and its −v twin cancels it just past r. Cost: O(n + m) instead of O(nm). Allocate d with n+1 slots so the bump at r+1 stays in bounds when r = n−1.',
        code: `vector<long long> d(n + 1, 0);
// each range update [l, r] += v is two edge marks:
d[l] += v;                           // the effect begins at l
d[r + 1] -= v;                       // and is cancelled after r

// after ALL updates, rebuild with one prefix pass:
long long cur = 0;
for (int i = 0; i < n; i++) {
    cur += d[i];                     // running total of active effects
    a[i] += cur;
}`,
      },
      {
        h: 'Prefix + hashmap: exact sums, negatives welcome',
        md: 'Count subarrays summing to exactly k. A subarray (j, i] sums to k exactly when p[i] − p[j] = k — that is, p[j] = p[i] − k. So sweep i while a hashmap remembers **how many times each prefix value has occurred**: at every step add cnt[p − k] to the answer, then record p. Seed cnt[0] = 1 so subarrays starting at index 0 count. No monotonicity required — this is the tool that replaces the sliding window the moment negatives appear.',
        code: `map<long long, long long> cnt;
cnt[0] = 1;                          // the empty prefix
long long p = 0, ans = 0;
for (int i = 0; i < n; i++) {
    p += a[i];                       // prefix ending at i
    ans += cnt[p - k];               // earlier prefixes that complete sum k
    cnt[p]++;                        // publish AFTER counting
}`,
        note: 'Record the current prefix AFTER counting — with k = 0, publishing first would let every prefix pair with itself.',
      },
      {
        h: 'Variants: counts, parity, xor',
        md: 'The trick is not about addition — it works for any accumulated quantity you can "subtract back out". Prefix **counts**: c[i] = how many of the first i elements satisfy a property → "how many evens in [l, r]" in O(1); Ilya and Queries counts matching adjacent pairs exactly this way. Prefix **xor**: x[i+1] = x[i] ^ a[i], and range xor = x[r+1] ^ x[l], since xor is its own inverse. Prefix **parity** classifies subarrays by even/odd sum. Whenever a question is about a range, ask: *what prefix quantity turns this into one subtraction?*',
      },
    ],
    exercises: [
      {
        id: 'ps-1', type: 'output', diff: 1,
        prompt: 'Build and query. What does this print?',
        code: `int main() {
    vector<int> a = {3, 1, 4, 1, 5};
    vector<long long> p(6, 0);
    for (int i = 0; i < 5; i++)
        p[i + 1] = p[i] + a[i];          // sum of the first i+1 values
    cout << p[3] << " " << p[5] - p[2] << "\\n";
}`,
        answer: '8 10',
        explain: 'p = {0, 3, 4, 8, 9, 14}. p[3] = 3+1+4 = 8 (first three values); p[5] − p[2] = 14 − 4 = 10 = a[2]+a[3]+a[4]. One build, then any range is a subtraction.',
      },
      {
        id: 'ps-2', type: 'mcq', diff: 1,
        prompt: 'Convention: `p[0] = 0`, `p[i+1] = p[i] + a[i]`. The sum of `a[l..r]` (0-indexed, **inclusive**) is:',
        options: [
          '`p[r + 1] - p[l]`',
          '`p[r] - p[l]`',
          '`p[r] - p[l - 1]`',
          '`p[r + 1] - p[l + 1]`',
        ],
        answer: 0,
        explain: 'p[r+1] covers a[0..r]; p[l] covers a[0..l-1]; their difference is exactly a[l..r]. Option 2 drops a[r]; option 3 is the 1-indexed formula — fine on its own, fatal when mixed with this convention.',
      },
      {
        id: 'ps-3', type: 'mcq', diff: 2,
        prompt: '**n, q ≤ 2·10⁵**: q sum queries over ranges of a static array. Which plan fits the ops budget?',
        options: [
          'Build prefix sums once (O(n)), answer each query in O(1) — under a million operations total',
          'Loop over the range per query: O(nq) = 4·10¹⁰ — fine within a second',
          'Rebuild the prefix array before every query to keep it fresh',
          'Sort the array first so the ranges become contiguous',
        ],
        answer: 0,
        explain: 'O(nq) is ~400 seconds of work; rebuilding per query is O(nq) wearing a disguise; and sorting destroys positions — range queries are ABOUT positions. "Static array + many range queries" should trigger prefix sums instantly.',
      },
      {
        id: 'ps-4', type: 'output', diff: 2,
        prompt: 'Difference array: three range-adds, then one rebuild. What does this print?',
        code: `int main() {
    vector<long long> d(7, 0);
    d[0] += 1;   d[3] -= 1;     // add 1   to a[0..2]
    d[2] += 10;  d[5] -= 10;    // add 10  to a[2..4]
    d[1] += 100; d[2] -= 100;   // add 100 to a[1..1]
    long long cur = 0;
    for (int i = 0; i < 6; i++) {
        cur += d[i];            // running sum of diffs = final a[i]
        cout << cur << " ";
    }
}`,
        answer: '1 101 11 10 10 0',
        explain: 'Each position accumulates exactly the updates whose range covers it: a[0]=1, a[1]=1+100, a[2]=1+10, a[3]=a[4]=10, a[5]=0. Six edge-marks replaced 3+3+1 = 7 element writes — and the gap only grows with bigger ranges.',
        hint: 'Write out d after the three updates, then prefix-sum it by hand.',
      },
      {
        id: 'ps-5', type: 'bank', diff: 2,
        prompt: '2D query: complete the inclusion–exclusion (rectangle `(r1, c1)..(r2, c2)`, inclusive; `p` is (n+1)×(m+1)).',
        code: `long long s = p[r2 + 1][c2 + 1]
            - p[___][c2 + 1]      // strip everything above the rectangle
            - p[r2 + 1][___]      // strip everything to its left
            + p[___][___];        // that corner came off twice: add it back`,
        answer: ['r1', 'c1', 'r1', 'c1'],
        distractors: ['r1 + 1', 'c1 + 1'],
        explain: 'The strips start at row r1 / column c1 (NOT r1+1/c1+1 — that off-by-one shaves a row and column off every answer). The above-left corner p[r1][c1] is removed by both strips, so it returns once.',
      },
      {
        id: 'ps-6', type: 'parsons', diff: 2,
        prompt: 'Assemble: count subarrays summing to exactly k (negatives allowed). `a`, `n`, `k` are read.',
        lines: [
          'map<long long, long long> cnt;',
          'cnt[0] = 1;                       // the empty prefix: subarrays starting at index 0',
          'long long p = 0, ans = 0;',
          'for (int i = 0; i < n; i++) {',
          '    p += a[i];                    // prefix sum ending at i',
          '    ans += cnt[p - k];            // earlier prefixes pairing to exactly k',
          '    cnt[p]++;                     // publish AFTER counting (k = 0 would self-pair)',
          '}',
          'cout << ans << "\\n";',
        ],
        distractors: [
          'cnt[0] = 0;                       // ← loses every subarray that starts at index 0',
          '    ans += cnt[p + k];            // ← sign flipped: that hunts for sum -k',
        ],
        explain: 'p[j] = p[i] − k is the pairing condition, so look up `p - k`, and seed cnt[0] = 1 or whole-prefix subarrays vanish. Count first, publish second — order is part of the correctness, not style.',
      },
      {
        id: 'ps-7', type: 'tf', diff: 1,
        statement: 'With n = 2·10⁵ and values up to 10⁹, the prefix array must be long long — p[n] can reach 2·10¹⁴.',
        answer: true,
        explain: 'Each element fits an int; their SUM does not. Size the accumulator, not just the elements — the same overflow discipline from the types lesson, now baked into a data structure.',
      },
      {
        id: 'ps-8', type: 'fill', diff: 2,
        prompt: 'Difference array: to add v to `a[l..r]`, write `d[l] += v;` and ___`-= v;`',
        answer: ['d[r+1]', 'd[r + 1]'],
        placeholder: 'd[?]',
        explain: 'The prefix pass carries +v from l onward; the −v at r+1 cancels it just past the range. Allocate d with n+1 slots — when r = n−1 the cancel mark lands at index n, and a size-n array would be out of bounds.',
      },
      {
        id: 'ps-9', type: 'mcq', diff: 2,
        prompt: 'Every query answer comes out a little small. Which line is the bug?',
        code: `vector<long long> p(n + 1, 0);
for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
while (q--) {
    int l, r;                      // 0-indexed, inclusive
    cin >> l >> r;
    cout << p[r] - p[l] << "\\n";   // ← suspicious
}`,
        options: [
          'The query: p[r] − p[l] sums a[l..r-1], silently dropping a[r] — it must be p[r + 1] − p[l]',
          'The build: it should be p[i] = p[i - 1] + a[i]',
          'The query should be p[r] − p[l - 1], which crashes at l = 0',
          'long long is unnecessary and slows it down',
        ],
        answer: 0,
        explain: 'p[r] only covers the first r elements — a[r] is not among them. "Answers consistently one element short" is the signature of this exact off-by-one; check the query formula against the build convention first.',
        hint: 'Under this convention, which elements does p[r] include?',
      },
      {
        id: 'ps-10', type: 'match', diff: 2,
        prompt: 'Match each tool to the job it is built for.',
        pairs: [
          ['1D prefix sums', 'many range-sum queries, static array'],
          ['2D prefix sums', 'rectangle sums in a grid'],
          ['difference array', 'many range-adds, then read the final array once'],
          ['prefix + hashmap', 'count subarrays with sum exactly k'],
          ['prefix xor', 'range xor queries'],
        ],
        explain: 'One family, four specializations: queries after no updates (prefix), updates before any query (difference), exact-sum counting (hashmap), and any invertible operation (xor) — the subtraction just changes costume.',
      },
      {
        id: 'ps-11', type: 'mcq', diff: 3,
        prompt: 'Number of Ways (CF 466C): split the array into three contiguous non-empty parts with equal sums (total = 3T). Why must `ways += firstCuts` run BEFORE `firstCuts++`?',
        code: `long long ways = 0, firstCuts = 0, p = 0;
for (int i = 0; i < n - 1; i++) {      // last index excluded: part 3 must be non-empty
    p += a[i];
    if (p == 2 * T) ways += firstCuts; // second cut here pairs with earlier first cuts
    if (p == T) firstCuts++;           // a possible first cut, after i
}`,
        options: [
          'When T = 0, both conditions hold at the same i — counting first stops a cut from pairing with ITSELF, which would create an empty middle part',
          'Reversing the two ifs makes the loop O(n²)',
          'The order is irrelevant; both versions are correct',
          'It prevents firstCuts from overflowing',
        ],
        answer: 0,
        explain: 'With T = 0, p == T and p == 2T are the same condition. Count-then-publish encodes "the first cut lies strictly before the second" — the same discipline as cnt[p]++ coming last in the hashmap pattern. All-zero arrays are the test that kills the careless version.',
        hint: 'Run a = {0, 0, 0} in your head. Which i satisfies both ifs?',
      },
      {
        id: 'ps-12', type: 'code', diff: 3,
        prompt: 'Read `n x`, then n integers (**negatives allowed**, n ≤ 2·10⁵, |aᵢ| ≤ 10⁹). Print how many contiguous subarrays sum to exactly x. The window is dead here — prefix + hashmap.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long x;
    cin >> n >> x;
    vector<long long> a(n);
    for (auto &v : a) cin >> v;
    // your code

    return 0;
}`,
        tests: [
          { input: '5 7\n2 -1 3 5 -2', expected: '2' },
          { input: '3 0\n1 -1 1', expected: '2' },
          { input: '4 10\n5 5 5 5', expected: '3' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long x;
    cin >> n >> x;
    vector<long long> a(n);
    for (auto &v : a) cin >> v;
    map<long long, long long> cnt;
    cnt[0] = 1;                        // empty prefix: subarrays starting at 0
    long long p = 0, ans = 0;
    for (int i = 0; i < n; i++) {
        p += a[i];                     // prefix sum ending at i
        ans += cnt[p - x];             // earlier prefixes completing sum x
        cnt[p]++;                      // publish only after counting
    }
    cout << ans << "\\n";
    return 0;
}`,
        explain: 'Subarray (j, i] sums to x ⟺ p[j] = p[i] − x, so a map of seen prefix counts answers each i in O(log n). The answer itself needs long long: ~n²/2 subarrays can match. Test 2 (x = 0) is why cnt[p]++ comes after the lookup.',
        hint: 'For each prefix p, how many EARLIER prefixes equal p − x? Keep them in a map as you sweep.',
      },
    ],
    problems: [
      { name: 'Static Range Sum Queries', platform: 'CSES', id: '1646', url: 'https://cses.fi/problemset/task/1646', difficulty: 'intro', why: 'The pure prefix template: build once, answer every query with one subtraction.' },
      { name: 'Ilya and Queries', platform: 'Codeforces', id: '313B', rating: 1100, url: 'https://codeforces.com/problemset/problem/313/B', difficulty: 'easy', why: 'Prefix-count over a derived 0/1 array (does position i match position i+1?) — prefixes beyond plain sums.' },
      { name: 'Forest Queries', platform: 'CSES', id: '1652', url: 'https://cses.fi/problemset/task/1652', difficulty: 'easy', why: '2D prefix sums with inclusion–exclusion, straight from the formula card.' },
      { name: 'Number of Ways', platform: 'Codeforces', id: '466C', rating: 1700, url: 'https://codeforces.com/problemset/problem/466/C', difficulty: 'med', why: 'Split into three equal-sum parts by counting earlier prefix hits — prefix counting at its sharpest.' },
    ],
  },

  // ==========================================================================
  'binary-search': {
    id: 'binary-search',
    objectives: [
      'Write the invariant-driven while (l < r) boundary loop without improvising',
      'Use lower_bound/upper_bound for positions and counts in sorted data',
      'Reframe an optimization as a monotone feasibility check and search the answer space',
      'Pick the mid rounding that matches l = m vs r = m — and dodge the infinite loop',
    ],
    theory: [
      {
        h: 'Halve the world — 60 times is plenty',
        md: 'Binary search is not "find x in a sorted array". It is: **find the boundary of a monotone yes/no predicate**. Sorted lookup is just the special case ok(i) = (a[i] ≥ x). Whenever the answers form F F F F T T T, you can test the middle, keep the half containing the flip, and discard the other — log₂ steps. 2·10⁵ → 18 steps; 10¹⁸ → 60 steps. The craft is rarely the loop itself; it is *spotting the monotone predicate* hiding inside the problem.',
      },
      {
        h: 'One loop to drill: the boundary finder',
        md: 'Commit ONE idiom to muscle memory and stop improvising under pressure. Goal: the smallest index with a[i] ≥ x, searching [0, n] (n meaning "no such index"). Invariant: the answer always stays inside [l, r]. If a[m] ≥ x, then m is a **candidate** — keep it in range with r = m. Otherwise m is too small — discard it with l = m + 1. Both updates strictly shrink the range, so when l == r, that *is* the boundary.',
        code: `int l = 0, r = n;                  // invariant: answer is in [l, r]
while (l < r) {
    int m = l + (r - l) / 2;       // overflow-safe mid (never (l+r)/2)
    if (a[m] >= x) r = m;          // m might BE the answer: keep it
    else l = m + 1;                // m is too small: discard it
}
// here l == r == smallest index with a[i] >= x (or n if none)`,
      },
      {
        h: 'lower_bound, upper_bound, and counting',
        md: 'The STL ships the boundary finder. `lower_bound` returns the first position with value **≥ x**; `upper_bound` the first with value **> x** (iterators — subtract `begin()` for indices). The span between them holds every copy of x, so **count of x = upper − lower**, and **values ≤ x = upper_bound − begin** — that last one answers each query of Interesting drink (706B) in one line. Counting questions on sorted data almost never deserve a handwritten loop.',
        code: `sort(a.begin(), a.end());
int lo = lower_bound(a.begin(), a.end(), x) - a.begin();  // first >= x
int hi = upper_bound(a.begin(), a.end(), x) - a.begin();  // first >  x
int cntX  = hi - lo;             // occurrences of x
int leqX  = hi;                  // how many values are <= x`,
      },
      {
        h: 'Binary search on the ANSWER',
        md: 'The headline technique. When computing the optimum directly is hard but "**could the answer be x?**" is easy, search the answer space. Factory Machines: scheduling optimally feels hard — but in x seconds, machine i makes ⌊x/kᵢ⌋ products, so ok(x) = "Σ⌊x/kᵢ⌋ ≥ t" is one O(n) pass. More time never produces fewer products, so ok is monotone F…F T…T — binary search the first T. Recipe: ① define ok(x) ② argue monotonicity in one sentence ③ run the boundary loop on [lo, hi]. Cost: ~60 × O(check).',
        code: `bool ok(ll x) {                    // can we make t products in x seconds?
    ll made = 0;
    for (ll k : speed) {
        made += x / k;             // this machine contributes floor(x / k)
        if (made >= t) return true; // early exit — also dodges overflow
    }
    return made >= t;
}
// answers look like: F F F F T T T T -> search the first T`,
      },
      {
        h: 'Min-feasible vs max-feasible: flip the rounding',
        md: 'Minimizing (smallest x that works — Factory Machines): keep a feasible m with r = m, discard with l = m + 1, **floor** mid. Maximizing (largest x that still works — capacity problems): keep with l = m, discard with r = m − 1, and the mid must round **up**: m = l + (r − l + 1) / 2. The rule that saves you: whichever pointer gets assigned m *exactly*, round the mid **away** from that pointer — then every iteration provably shrinks the range.',
        code: `// SMALLEST x with ok(x):   F F F T T T
while (l < r) {
    ll m = l + (r - l) / 2;        // floor mid
    if (ok(m)) r = m; else l = m + 1;
}
// LARGEST x with ok(x):    T T T F F F
while (l < r) {
    ll m = l + (r - l + 1) / 2;    // CEILING mid — the flip!
    if (ok(m)) l = m; else r = m - 1;
}`,
      },
      {
        h: 'The infinite-loop trap (and friends)',
        md: 'The classic spin: `l = m` combined with **floor** mid. When r == l + 1, m floors to l; if ok(l) holds, you assign l = l — zero progress, forever. Symptom: a frozen run or TLE with no output. Cure: the ceiling mid (or restructure into the r = m shape). Two more regulars: `(l + r) / 2` overflowing int once l + r passes 2³¹ — write l + (r − l) / 2; and overflow *inside ok* — Σ⌊x/kᵢ⌋ at x ≈ 10¹⁸ explodes past long long unless you early-exit once the sum reaches t.',
        code: `while (l < r) {
    ll m = l + (r - l) / 2;        // floor mid...
    if (ok(m)) l = m;              // ...with l = m: STALLS at r == l + 1
    else r = m - 1;
}`,
        note: 'A binary search that hangs is diagnosable in seconds: print (l, r, m) for three iterations — the stuck pair is immediately visible.',
        noteKind: 'danger',
      },
    ],
    exercises: [
      {
        id: 'bs-1', type: 'output', diff: 1,
        prompt: 'Trace the boundary finder. What does this print?',
        code: `int main() {
    vector<int> a = {2, 4, 4, 7, 9};
    int x = 4, l = 0, r = 5;
    while (l < r) {
        int m = l + (r - l) / 2;
        if (a[m] >= x) r = m;
        else l = m + 1;
    }
    cout << l << "\\n";
}`,
        answer: '1',
        explain: '(l, r): (0,5) → m=2, a[2]=4 ≥ 4 → r=2; (0,2) → m=1, a[1]=4 ≥ 4 → r=1; (0,1) → m=0, a[0]=2 < 4 → l=1. l == r == 1: the FIRST index with a[i] ≥ 4 — that is lower_bound by hand.',
      },
      {
        id: 'bs-2', type: 'mcq', diff: 1,
        prompt: 'Sorted `a = {2, 4, 4, 7}`. As indices, where do `lower_bound(…, 4)` and `upper_bound(…, 4)` point?',
        options: [
          '1 and 3',
          '1 and 2',
          '2 and 3',
          '1 and 1',
        ],
        answer: 0,
        explain: 'lower_bound: first element ≥ 4 → index 1. upper_bound: first element > 4 → the 7 at index 3. Their difference, 3 − 1 = 2, is the count of 4s — the counting idiom in one picture.',
      },
      {
        id: 'bs-3', type: 'output', diff: 2,
        prompt: 'How many prices are affordable? What does this print?',
        code: `int main() {
    vector<int> p = {3, 10, 8, 6, 11};
    sort(p.begin(), p.end());          // 3 6 8 10 11
    long long m = 10;
    cout << (upper_bound(p.begin(), p.end(), m) - p.begin()) << "\\n";
}`,
        answer: '4',
        explain: 'upper_bound(10) points at the first price > 10 — the 11, index 4 — and that index IS the count of prices ≤ 10. Sort once, answer every budget query in O(log n): Interesting drink in miniature.',
      },
      {
        id: 'bs-4', type: 'mcq', diff: 2,
        prompt: 'This searches the LARGEST x in [1, n] with `ok(x)` true (ok is monotone T…TF…F) — and sometimes runs forever. The bug?',
        code: `ll l = 1, r = n;
while (l < r) {
    ll m = l + (r - l) / 2;
    if (ok(m)) l = m;        // keep m: it works
    else r = m - 1;
}`,
        options: [
          'Floor mid with l = m: when r == l + 1 and ok(l) holds, m = l and l = m makes no progress — use the ceiling mid l + (r - l + 1) / 2',
          'l + (r - l) / 2 overflows long long',
          'r = m - 1 discards a value that might be the answer',
          'The condition should be while (l <= r)',
        ],
        answer: 0,
        explain: 'The pointer that receives m exactly must have the mid rounded AWAY from it. Here l = m needs a ceiling mid; the floor pairs with l = m + 1 instead. (And r = m − 1 is fine: ok(m) false means m is not the answer for a max-feasible search.)',
        hint: 'Simulate l = 5, r = 6 with ok(5) true. What is m, and what happens to l?',
      },
      {
        id: 'bs-5', type: 'parsons', diff: 2,
        prompt: 'Assemble: smallest feasible time for Factory Machines (`ok(m)` is written and monotone F…FT…T).',
        lines: [
          'll l = 1, r = (ll)1e18;          // the answer is somewhere in [l, r]',
          'while (l < r) {',
          '    ll m = l + (r - l) / 2;      // floor mid pairs with l = m + 1',
          '    if (ok(m)) r = m;            // m works — it might BE the answer: keep it',
          '    else l = m + 1;              // m fails — the boundary is to the right',
          '}',
          'cout << l << "\\n";              // l == r == smallest feasible time',
        ],
        distractors: [
          '    if (ok(m)) r = m - 1;        // ← discards a possibly-optimal m',
          '    else l = m;                  // ← stalls when m == l: infinite loop',
        ],
        explain: 'Feasible m stays in range (r = m) because the minimum might be m itself; infeasible m is discarded past (l = m + 1). Both distractors are the two canonical ways this loop dies: skipping the optimum, or never moving.',
      },
      {
        id: 'bs-6', type: 'fill', diff: 2,
        prompt: 'l and r are ints near INT_MAX. Complete the overflow-safe midpoint:\n`int m = ___;`',
        answer: ['l + (r - l) / 2', 'l + (r-l)/2', 'l+(r-l)/2'],
        placeholder: 'not (l + r) / 2…',
        explain: '`l + r` can blow past INT_MAX even when both endpoints fit — but the *difference* r − l always fits. Same medicine as the types lesson, now a permanent reflex inside every binary search.',
      },
      {
        id: 'bs-7', type: 'tf', diff: 1,
        statement: 'Binary search on the answer requires ok(x) to be monotone — a single flip from false to true (or true to false) across the search range.',
        answer: true,
        explain: 'Monotonicity is the license to discard half: if feasibility could flicker (T F T), the discarded half might hide answers. Always argue "more time/money/length only helps" in one sentence before you search.',
      },
      {
        id: 'bs-8', type: 'mcq', diff: 2,
        prompt: 'Factory Machines (CSES 1620): machine i makes one product per kᵢ seconds; you need t products. What do you binary search, and with what predicate?',
        options: [
          'Search the time x, with ok(x) = "Σ⌊x / kᵢ⌋ ≥ t" — more time never makes fewer products, so ok is monotone; answer = smallest feasible x',
          'Search how many products each machine should make',
          'Search the array for the fastest machine and let it produce everything',
          'Sort the machines and assign products round-robin, no search needed',
        ],
        answer: 0,
        explain: 'The optimum is hard to construct but trivial to CHECK — the signature of answer-space search. Each ⌊x/kᵢ⌋ is non-decreasing in x, so the sum is too: monotone, searchable, ~60 × O(n).',
      },
      {
        id: 'bs-9', type: 'mcq', diff: 2,
        prompt: 'BS on the answer over a range up to **10¹⁸**; ok(x) is one O(n) pass with n = 2·10⁵. Total cost?',
        options: [
          '~log₂(10¹⁸) ≈ 60 calls of ok → 60 · 2·10⁵ = 1.2·10⁷ operations — comfortable',
          '10¹⁸ candidates must each be tested — hopeless',
          'O(n log n), because the array must be sorted first',
          'Unbounded — binary search is randomized',
        ],
        answer: 0,
        explain: '2⁶⁰ ≈ 10¹⁸: halving tames astronomical ranges because you bisect the range, never enumerate it. And no sort is needed — the *monotonicity of ok* plays the role sortedness plays in array search.',
      },
      {
        id: 'bs-10', type: 'match', diff: 2,
        prompt: 'Match the question to the tool.',
        pairs: [
          ['first index with a[i] ≥ x', 'lower_bound'],
          ['first index with a[i] > x', 'upper_bound'],
          ['how many copies of x', 'upper_bound − lower_bound'],
          ['how many values are < x', 'lower_bound − a.begin()'],
          ['smallest time passing a monotone check', 'binary search on the answer'],
        ],
        explain: 'The two STL boundaries and their differences cover all sorted-array counting; the boundary loop on a predicate covers everything beyond arrays. Five questions, zero handwritten scans.',
      },
      {
        id: 'bs-11', type: 'output', diff: 3,
        prompt: 'Max-feasible with a ceiling mid. What does this print?',
        code: `bool ok(long long x) { return x * x <= 50; }   // T T ... T F F ...

int main() {
    long long l = 1, r = 50;
    while (l < r) {
        long long m = l + (r - l + 1) / 2;   // ceiling mid
        if (ok(m)) l = m;
        else r = m - 1;
    }
    cout << l << "\\n";
}`,
        answer: '7',
        explain: '(l, r): (1,50) m=26 fails → (1,25) m=13 fails → (1,12) m=7: 49 ≤ 50 holds → (7,12) m=10 fails → (7,9) m=8 fails → (7,7). That is ⌊√50⌋ computed by predicate alone — and the ceiling mid is what kept l = m moving.',
        hint: 'The invariant is "ok(l) is always true". Track (l, r, m) per round; ok flips between 7 and 8.',
      },
      {
        id: 'bs-12', type: 'code', diff: 3,
        prompt: 'Factory Machines core: read `n t`, then n machine speeds kᵢ (seconds per product). Print the minimum time to make t products. (n ≤ 2·10⁵, t, kᵢ ≤ 10⁹ — the answer can reach 10¹⁸.)',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    ll n, t;
    cin >> n >> t;
    vector<ll> k(n);
    for (auto &v : k) cin >> v;
    // define ok(x), then binary search the smallest feasible time

    return 0;
}`,
        tests: [
          { input: '3 7\n3 2 5', expected: '8' },
          { input: '1 1\n1', expected: '1' },
          { input: '2 10\n1 1', expected: '5' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    ll n, t;
    cin >> n >> t;
    vector<ll> k(n);
    for (auto &v : k) cin >> v;
    auto ok = [&](ll x) {                 // can we make t products in x seconds?
        ll made = 0;
        for (ll s : k) {
            made += x / s;                // this machine: floor(x / s) products
            if (made >= t) return true;   // early exit — also stops overflow
        }
        return made >= t;
    };
    ll l = 1, r = (ll)1e18;               // worst case: t * max k = 1e18
    while (l < r) {
        ll m = l + (r - l) / 2;
        if (ok(m)) r = m;                 // feasible: try smaller
        else l = m + 1;                   // infeasible: need more time
    }
    cout << l << "\\n";
    return 0;
}`,
        explain: 'Min-feasible shape: floor mid, r = m on success, l = m + 1 on failure. The early exit inside ok is load-bearing — without it, 2·10⁵ machines each adding up to 10¹⁸ would overflow long long mid-sum. Test 1 is the CSES sample: ok(7) makes 6, ok(8) makes 7.',
        hint: 'Check feasibility, do not construct a schedule. And what stops `made` from overflowing when x is huge?',
      },
    ],
    problems: [
      { name: 'K-th Not Divisible by n', platform: 'Codeforces', id: '1352C', rating: 1200, url: 'https://codeforces.com/problemset/problem/1352/C', difficulty: 'easy', why: 'Find the k-th valid number — a gentle first binary search on the answer (or derive the closed form and check it against your search).' },
      { name: 'Factory Machines', platform: 'CSES', id: '1620', url: 'https://cses.fi/problemset/task/1620', difficulty: 'med', why: 'THE answer-space classic: ok(x) = "can we make t products in x seconds?", then min-feasible — mind the overflow inside ok.' },
      { name: 'Array Division', platform: 'CSES', id: '1085', url: 'https://cses.fi/problemset/task/1085', difficulty: 'med', why: 'Minimize the maximum subarray sum: binary search the limit, verify with a greedy "how few pieces fit under it?" check.' },
    ],
  },
};

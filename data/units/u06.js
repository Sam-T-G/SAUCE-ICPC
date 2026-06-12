// ============================================================================
// data/units/u06.js — Unit 6: Dynamic Programming
// The #1 ICPC topic. State in words → transition → base case → order.
// Skills: foundations, grid, knapsack, sequences, intervals, bitmask.
// Exercise ladder per skill: traces → assemble → recall → produce.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'dp-foundations': {
    id: 'dp-foundations',
    objectives: [
      'State the 4-step DP recipe and define any dp state in plain words',
      'Convert between memoized recursion and bottom-up tabulation of the same recurrence',
      'Tell counting DPs (sum over moves) from optimization DPs (min/max over moves) and pick the right base case',
      'Recognize inputs where greedy fails and DP is required',
    ],
    theory: [
      {
        h: 'The same smaller question, over and over',
        md: 'Try to count the ways to roll dice summing to n by recursion: ways(n) calls ways(n−1)…ways(n−6), and those calls re-ask the *same* subquestions thousands of times — exponential blowup. But there are only n distinct questions! **DP = recursion + remembering**: solve each subquestion once, store it, reuse it.\n\nRecognition cues: "count the number of ways…", "minimum number of moves/coins/steps…", and a brute force that branches but keeps meeting the same smaller subproblem. Constraints like n ≤ 10⁶ whisper: one pass over states, constant-ish work each.',
      },
      {
        h: 'The 4-step recipe',
        md: 'Every DP you will ever write:\n\n**1. State — in words.** "dp[i] = the number of ways to reach sum i." If you can’t say it in a sentence, you don’t have a state yet.\n**2. Transition.** How does a state follow from smaller ones? Look at the *last move*: the final die shows k, so dp[i] = Σ dp[i−k] for k = 1..6.\n**3. Base case.** dp[0] = 1 — one way to make sum 0: do nothing.\n**4. Evaluation order.** Compute states so that everything you read already exists — here, i ascending.',
        code: `// Dice Combinations (CSES 1633): ways to roll sum n with dice 1..6
vector<ll> dp(n + 1, 0);
dp[0] = 1;                            // base: one empty way
for (int i = 1; i <= n; i++)          // order: smaller sums first
    for (int k = 1; k <= 6 && k <= i; k++)
        dp[i] = (dp[i] + dp[i - k]) % MOD;   // last die shows k
cout << dp[n] << "\\n";`,
        note: 'Write step 1 as a comment above your dp array, every time. Half of all DP bugs are a transition that contradicts the state’s meaning.',
      },
      {
        h: 'Memoization and tabulation: same recurrence, two engines',
        md: 'You can run a recurrence **top-down** (recursive function + cache) or **bottom-up** (fill an array in dependency order). They compute the *same values*. Memoization is often easier to write (the recursion handles the order for you); tabulation is faster in practice and immune to stack overflow.',
        code: `vector<ll> memo(n + 1, -1);     // -1 = "not computed yet"
ll ways(int s) {
    if (s == 0) return 1;            // base case
    if (s < 0) return 0;             // overshoot: no ways
    if (memo[s] != -1) return memo[s];   // cached? reuse
    ll total = 0;
    for (int k = 1; k <= 6; k++)     // try every last die
        total = (total + ways(s - k)) % MOD;
    return memo[s] = total;          // store, then return
}`,
        note: 'Recursion depth here reaches n. At n = 10⁶ that can overflow the stack — one reason contest C++ leans tabulation.',
        noteKind: 'warn',
      },
      {
        h: 'Counting vs optimizing',
        md: 'Two DP flavors, one structural difference — what you do *over the possible moves*:\n\n**Counting**: dp[i] = **Σ** over moves (how many ways). Base dp[0] = 1 — the empty way exists. Usually mod 10⁹+7.\n**Optimizing**: dp[i] = **min/max** over moves (best cost). Base dp[0] = 0 — empty solution costs nothing — and unreachable states sit at **INF** so they never win a min.',
        code: `// Minimizing Coins (CSES 1634): fewest coins for sum x
const ll INF = 1e18;
vector<ll> dp(x + 1, INF);
dp[0] = 0;                            // 0 coins make sum 0
for (int i = 1; i <= x; i++)
    for (int c : coins)
        if (c <= i && dp[i - c] != INF)        // guard unreachable
            dp[i] = min(dp[i], dp[i - c] + 1); // +1 = this coin
cout << (dp[x] == INF ? -1 : dp[x]) << "\\n";  // -1 if impossible`,
        note: 'Forgetting the INF guard (or printing INF instead of −1) is the classic Minimizing Coins WA. Unreachable must stay unmistakably unreachable.',
        noteKind: 'warn',
      },
      {
        h: 'Why greedy dies and DP doesn’t',
        md: 'Coins {1, 3, 4}, target 6. Greedy grabs the biggest coin: 4, then 1, then 1 — **3 coins**. DP answers **2** (3 + 3). Greedy commits to the locally best move and never reconsiders; DP tries *every* last move and trusts the already-optimal subanswers — `dp[6] = min(dp[5], dp[3], dp[2]) + 1 = dp[3] + 1 = 2`.\n\nGreedy needs a *proof*. DP only needs the recurrence to be correct. When you can’t prove the greedy exchange argument, assume it’s wrong — {1, 3, 4} target 6 is the counterexample to carry around.',
      },
      {
        h: 'Base-case traps, summarized',
        md: 'Three traps cause most foundation-level WAs:\n\n**dp[0] = 1 vs 0.** Counting: 1 (one empty way — without it everything stays 0). Optimizing: 0 cost, others INF.\n**Evaluation order.** Reading a state before it’s written gives garbage that *looks* plausible. Each dp[i−k] must be final when read.\n**Overflow/mod.** Counts explode exponentially — take mod at every addition. Sums of costs may need `long long`.',
        noteKind: 'tip',
        note: 'Complexity is states × transition work. Dice: O(n) states × 6 = O(n). Coins: O(x · n_coins). Say it before you code it.',
      },
    ],
    exercises: [
      {
        id: 'dpf-1', type: 'output', diff: 1,
        prompt: 'Dice Combinations, hand-traced. What does this print?',
        code: `int main() {
    vector<long long> dp(5, 0);
    dp[0] = 1;                       // one empty way
    for (int i = 1; i <= 4; i++)
        for (int k = 1; k <= 6 && k <= i; k++)
            dp[i] += dp[i - k];
    cout << dp[4] << "\\n";
}`,
        answer: '8',
        explain: 'dp[1]=1, dp[2]=dp[1]+dp[0]=2, dp[3]=dp[2]+dp[1]+dp[0]=4, dp[4]=4+2+1+1=8. Each value doubles because every smaller sum contributes — tracing 4-5 cells by hand is how you verify any transition before trusting it.',
      },
      {
        id: 'dpf-2', type: 'mcq', diff: 1,
        prompt: 'In Dice Combinations with `dp[i] = Σ dp[i−k] for k = 1..6`, what does `dp[i]` MEAN?',
        options: [
          'The number of ordered sequences of dice rolls whose values sum to exactly i',
          'The largest sum reachable using i rolls',
          'The minimum number of rolls needed to reach sum i',
          'The number of ways to reach sum i using exactly i rolls',
        ],
        answer: 0,
        explain: 'The state must be stated in words before anything else. "Sum over the last die k of ways to make i−k" only makes sense if dp[i] counts ordered roll sequences reaching exactly sum i. The min-rolls meaning would need `min(...) + 1`, not a sum — meaning and transition must agree.',
      },
      {
        id: 'dpf-3', type: 'mcq', diff: 1,
        prompt: 'Why is the base case `dp[0] = 1` in a counting DP, not 0?',
        options: [
          'There is exactly one way to make sum 0: the empty sequence — and every real way is counted by extending it',
          'Index 0 must be nonzero or you divide by zero',
          'It compensates for an off-by-one in the loop',
          'Convention only — 0 would work too',
        ],
        answer: 0,
        explain: '"One empty way" is the seed every other count grows from: the sequence (3, 3) for sum 6 is counted because it extends the empty way at dp[0]. Set dp[0] = 0 and every dp[i] stays 0 forever — the single most common counting-DP bug.',
      },
      {
        id: 'dpf-10', type: 'order', diff: 1,
        prompt: 'Order the 4-step DP recipe.',
        items: [
          'Define the state — what dp[i] means, in words',
          'Find the transition — express dp[i] via smaller states (look at the last move)',
          'Set the base case — the smallest state answered directly',
          'Pick the evaluation order — every state ready before it is read',
        ],
        explain: 'Words → transition → base → order. The order matters because each step depends on the previous: you can’t write a transition for a state you haven’t defined, and you can’t schedule computation before you know what depends on what.',
      },
      {
        id: 'dpf-4', type: 'output', diff: 2,
        prompt: 'Minimizing Coins with coins {1, 3, 4}. Trace the table to sum 6. Output?',
        code: `int main() {
    vector<int> c = {1, 3, 4};
    vector<int> dp(7, 1e9);
    dp[0] = 0;
    for (int x = 1; x <= 6; x++)
        for (int v : c)
            if (v <= x && dp[x - v] + 1 < dp[x])
                dp[x] = dp[x - v] + 1;
    cout << dp[6] << "\\n";
}`,
        answer: '2',
        explain: 'dp = [0, 1, 2, 1, 1, 2, 2]: dp[6] checks dp[5]+1=3, dp[3]+1=2, dp[2]+1=3 → 2, via 3+3. Note what greedy would do here: 4+1+1 = 3 coins. The DP beat it by trying every last coin.',
        hint: 'Fill dp[1] through dp[6] left to right; for each, try last coin 1, 3, 4.',
      },
      {
        id: 'dpf-5', type: 'mcq', diff: 2,
        prompt: 'Coins {1, 3, 4}, target 6. Greedy takes the largest coin that fits, every time. What happens?',
        options: [
          'Greedy pays 3 coins (4+1+1); the optimum is 2 (3+3) — greedy is simply wrong here',
          'Greedy finds 2 coins like DP, just faster',
          'Greedy fails to terminate',
          'Greedy pays 4 coins (3+1+1+1)',
        ],
        answer: 0,
        explain: 'Taking 4 first strands you with 2 = 1+1. Greedy’s local choice forecloses the global optimum; DP keeps all options alive through the recurrence. (US coin systems happen to be greedy-safe, which is why this trap feels surprising — {1,3,4} is the counterexample to memorize.)',
      },
      {
        id: 'dpf-6', type: 'bank', diff: 2,
        prompt: 'Complete the Minimizing Coins core: base case, then transition.',
        code: `dp[0] = ___;
for (int x = 1; x <= target; x++)
    for (int c : coins)
        if (c <= x && dp[x - c] != INF)
            dp[x] = min(dp[x], ___);`,
        answer: ['0', 'dp[x - c] + 1'],
        distractors: ['1', 'dp[x - c]', 'INF'],
        explain: 'Optimizing DP: zero coins make sum 0, so dp[0] = 0 (the `1` is the counting base sneaking in — wrong flavor!). The transition pays +1 for the coin c being used; without the +1 every dp[x] would stay 0.',
      },
      {
        id: 'dpf-7', type: 'tf', diff: 2,
        statement: 'Memoized recursion and bottom-up tabulation of the same recurrence compute the same values for every state — they differ only in the order (and mechanics) of evaluation.',
        answer: true,
        explain: 'Both are the recurrence; the recursion discovers the dependency order lazily while tabulation hard-codes it. Practical differences are real though: memoization touches only reachable states but risks stack overflow at depth ~10⁶; tabulation is loop-fast and stack-free.',
      },
      {
        id: 'dpf-8', type: 'parsons', diff: 2,
        prompt: 'Assemble the memoized version of Dice Combinations (memo initialized to −1).',
        lines: [
          'll ways(int s) {',
          '    if (s == 0) return 1;          // one empty way',
          '    if (s < 0) return 0;           // overshoot: no ways',
          '    if (memo[s] != -1) return memo[s];',
          '    ll total = 0;',
          '    for (int k = 1; k <= 6; k++) total += ways(s - k);',
          '    return memo[s] = total;',
          '}',
        ],
        distractors: [
          '    if (s == 0) return 0;          // one empty way',
          '    return total;',
        ],
        explain: 'Base cases first (0 → one way, negative → none), cache check before work, store before returning. The distractors are the two killer bugs: base 0 makes every answer 0, and `return total;` without storing makes the "memo" decorative — exponential time again.',
      },
      {
        id: 'dpf-9', type: 'mcq', diff: 2,
        prompt: 'This Dice Combinations solution prints 0 for every n. Which line is the bug?',
        code: `vector<ll> dp(n + 1, 0);
dp[0] = 0;                              // line A
for (int i = 1; i <= n; i++)            // line B
    for (int k = 1; k <= 6; k++)        // line C
        if (i - k >= 0) dp[i] += dp[i - k];   // line D
cout << dp[n] << "\\n";`,
        options: [
          'Line A — the counting base case must be dp[0] = 1, the one empty way',
          'Line B — the loop should start at i = 0',
          'Line C — k should run up to n, not 6',
          'Line D — the guard should be i - k > 0',
        ],
        answer: 0,
        explain: 'With dp[0] = 0 there is no seed: dp[1] sums nothing but zeros, then dp[2], and the zeros cascade to dp[n]. Everything else is correct. When a counting DP outputs 0, check the base case before anything else.',
        hint: 'Where does the very first nonzero value come from?',
      },
      {
        id: 'dpf-11', type: 'fill', diff: 2,
        prompt: 'Dice Combinations transition — the last die shows k, so each way to make the smaller sum extends to sum i:\n`for (int k = 1; k <= 6 && k <= i; k++) dp[i] += ___;`',
        answer: ['dp[i - k]', 'dp[i-k]'],
        placeholder: 'dp[…]',
        explain: 'Condition on the LAST move: if the final die shows k, the rest of the sequence makes sum i−k, and there are dp[i−k] of those. "Look at the last move" turns almost any counting question into a transition.',
      },
      {
        id: 'dpf-12', type: 'mcq', diff: 3,
        prompt: 'Both snippets count coin sums with dp[0] = 1, coins {2, 3}, target 5. What do they compute?',
        code: `// Version 1
for (int i = 1; i <= x; i++)
    for (int c : coins)
        if (c <= i) dp[i] += dp[i - c];

// Version 2
for (int c : coins)
    for (int i = c; i <= x; i++)
        dp[i] += dp[i - c];`,
        options: [
          'V1 counts ordered ways: dp[5] = 2 (2+3 and 3+2). V2 counts unordered: dp[5] = 1 ({2,3} once)',
          'Both compute 2 — loop nesting never changes the result',
          'Both compute 1 — addition is commutative',
          'V1 = 1, V2 = 2 — coins-outer counts each ordering separately',
        ],
        answer: 0,
        explain: 'V1 (sums outer) lets *any* coin be the last move at every sum → orderings count separately: that’s Coin Combinations I. V2 (coins outer) finishes all uses of coin 2 before coin 3 ever appears, so each combination is built in one canonical order → counted once: Coin Combinations II. Same lines, swapped nesting, different problem — the knapsack skill drills this distinction.',
        hint: 'In V2, can a 2 ever be added after a 3?',
      },
      {
        id: 'dpf-13', type: 'code', diff: 3,
        prompt: 'Dice Combinations (CSES 1633, mini): read n (1 ≤ n ≤ 100), print the number of ordered ways to roll dice (faces 1..6) summing to exactly n, modulo 10⁹+7.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n;
    cin >> n;
    const ll MOD = 1000000007;
    // dp[i] = ways to reach sum i (mod MOD)

    return 0;
}`,
        tests: [
          { input: '3', expected: '4' },
          { input: '1', expected: '1' },
          { input: '10', expected: '492' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n;
    cin >> n;
    const ll MOD = 1000000007;
    vector<ll> dp(n + 1, 0);
    dp[0] = 1;                          // one empty way
    for (int i = 1; i <= n; i++)        // smaller sums first
        for (int k = 1; k <= 6 && k <= i; k++)
            dp[i] = (dp[i] + dp[i - k]) % MOD;   // last die = k
    cout << dp[n] << "\\n";
    return 0;
}`,
        explain: 'The recipe verbatim: state "ways to reach sum i", transition over the last die, base dp[0] = 1, ascending order. On the real CSES task n reaches 10⁶ — this same O(6n) loop with the mod at every addition passes comfortably; recursion without a memo would be ~6ⁿ and dead at n = 30.',
        hint: 'n = 3: the 4 ways are 1+1+1, 1+2, 2+1, 3. Does your dp[3] agree?',
      },
    ],
    problems: [
      { name: 'Dice Combinations', platform: 'CSES', id: '1633', url: 'https://cses.fi/problemset/task/1633', difficulty: 'intro', why: 'The canonical counting DP: dp[i] = Σ dp[i−k], base dp[0] = 1.' },
      { name: 'Cut Ribbon', platform: 'Codeforces', id: '189A', rating: 1300, url: 'https://codeforces.com/problemset/problem/189/A', difficulty: 'easy', why: 'Maximize pieces with 3 allowed lengths — an INF-guarded max DP in 20 lines.' },
      { name: 'Minimizing Coins', platform: 'CSES', id: '1634', url: 'https://cses.fi/problemset/task/1634', difficulty: 'easy', why: 'The canonical min DP: INF init, unreachable guard, print −1. Greedy WAs here.' },
      { name: 'Coin Combinations I', platform: 'CSES', id: '1635', url: 'https://cses.fi/problemset/task/1635', difficulty: 'easy', why: 'Ordered ways — Dice Combinations with arbitrary coins. Mind the mod.' },
    ],
  },

  // ==========================================================================
  'dp-grid': {
    id: 'dp-grid',
    objectives: [
      'Define dp[i][j] for path counting/optimization and initialize the first row and column correctly',
      'Zero out blocked cells so obstacles kill exactly the paths through them',
      'Order loops to respect dependencies, and compress to a rolling row when memory demands',
      'Adapt the framework to k-track problems like 2×n take/skip',
    ],
    theory: [
      {
        h: 'A path problem is a table problem',
        md: 'You walk a grid from (0,0) to (n−1,m−1) moving only **right or down**. Every path enters cell (i,j) from the top neighbor or the left neighbor — nothing else. So each cell carries its own subanswer:\n\n**dp[i][j] = number of such paths from (0,0) to (i,j)**, and the transition writes itself: `dp[i][j] = dp[i−1][j] + dp[i][j−1]`.\n\nRecognition cues: "move only right/down", per-cell costs to minimize, n, m ≤ 1000 (an O(nm) = 10⁶ table fits beautifully). Counting the paths by DFS is hopeless — an open 30×30 grid already has ~10¹⁶ paths.',
      },
      {
        h: 'Obstacles: zero is the whole trick',
        md: 'Grid Paths I adds traps: some cells are `*` (blocked). A blocked cell carries **0 paths** — it contributes nothing to its right/down neighbors, so every path through it silently vanishes from the count. No special cases downstream; the zeros do all the work.',
        code: `vector<vector<ll>> dp(n, vector<ll>(n, 0));
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) {
        if (g[i][j] == '*') continue;            // blocked: dp stays 0
        if (i == 0 && j == 0) { dp[i][j] = 1; continue; }   // start
        if (i > 0) dp[i][j] += dp[i - 1][j];     // arrive from above
        if (j > 0) dp[i][j] += dp[i][j - 1];     // arrive from the left
        dp[i][j] %= MOD;                         // counts explode: mod
    }
cout << dp[n - 1][n - 1] << "\\n";`,
        note: 'A blocked start or goal needs no special case — the zeros propagate and the answer is 0 automatically. The `if (i > 0)` guards double as first-row/column handling.',
      },
      {
        h: 'Min/max path sums: same skeleton, different combiner',
        md: 'Swap Σ for min (or max) and the cell cost rides along: **dp[i][j] = cheapest cost to reach (i,j)**. The first row and column have only one parent each — initialize them as running sums (or guard with INF so the missing neighbor never wins the min).',
        code: `dp[0][0] = g[0][0];
for (int j = 1; j < m; j++) dp[0][j] = dp[0][j - 1] + g[0][j];  // only left
for (int i = 1; i < n; i++) dp[i][0] = dp[i - 1][0] + g[i][0];  // only top
for (int i = 1; i < n; i++)
    for (int j = 1; j < m; j++)
        dp[i][j] = g[i][j] + min(dp[i - 1][j], dp[i][j - 1]);`,
        note: 'Forgetting that border cells have one parent — and letting them read garbage or 0 — is the #1 path-sum WA. Initialize the borders explicitly or pad with INF.',
        noteKind: 'warn',
      },
      {
        h: 'Evaluation order and the rolling row',
        md: 'Row-major order (i outer ascending, j inner ascending) works because by the time you compute dp[i][j], the cell above (previous row) and the cell to the left (this row) are final. That dependency view also unlocks the space trick: you only ever read the previous row, so keep **one** row.\n\nIn the 1-D version, before the update `dp[j]` still holds the previous row’s value (= top) and `dp[j−1]` already holds this row’s (= left). That only works sweeping j **left to right**.',
        code: `vector<ll> dp(m, 0);
dp[0] = 1;
for (int i = 0; i < n; i++)
    for (int j = 1; j < m; j++)       // left to right — mandatory
        dp[j] = (dp[j] + dp[j - 1]) % MOD;   // top + left, in place
// memory: O(m) instead of O(nm)`,
      },
      {
        h: 'Tracks instead of cells: 2×n take/skip',
        md: 'Basketball Exercise: a 2×n grid of player heights. Pick at most one player per column, and picks in **adjacent columns must come from different rows**. The state is (column, what happened here): **dp[i][t]** = best total through column i, where t ∈ {skip, took top, took bottom}. Each transition allows exactly the legal predecessors — taking top at column i is fine after a skip or a bottom pick, never after another top:',
        code: `// skip/top/bot = best through previous column
ll nskip = max({skip, top, bot});        // take nobody at column i
ll ntop  = t[i] + max(skip, bot);        // top here → no top at i-1
ll nbot  = b[i] + max(skip, top);        // bottom here → no bottom at i-1
skip = nskip; top = ntop; bot = nbot;
// answer: max({skip, top, bot}) after the last column`,
        note: 'When a "grid" is 2×n or 3×n, the small dimension becomes a handful of states per column — the table is really dp[column][which-track]. Tiny height = state, long width = time.',
      },
    ],
    exercises: [
      {
        id: 'grid-1', type: 'output', diff: 1,
        prompt: 'An open 3×3 grid, paths counted right/down. What does this print?',
        code: `int main() {
    int n = 3;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    dp[0][0] = 1;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            if (i > 0) dp[i][j] += dp[i - 1][j];
            if (j > 0) dp[i][j] += dp[i][j - 1];
        }
    cout << dp[n - 1][n - 1] << "\\n";
}`,
        answer: '6',
        explain: 'The table fills as 1 1 1 / 1 2 3 / 1 3 6 — Pascal’s triangle tilted. Each cell = top + left; borders stay 1 (one straight-line path). 6 = C(4,2): choose which 2 of the 4 moves go down.',
      },
      {
        id: 'grid-2', type: 'mcq', diff: 1,
        prompt: 'A solution uses the transition `dp[i][j] = dp[i−1][j] + dp[i][j−1]` with `dp[0][0] = 1`. What does dp[i][j] MEAN?',
        options: [
          'The number of right/down paths from (0,0) to (i,j)',
          'The number of right/down paths from (i,j) to the bottom-right corner',
          'The number of cells any path to (i,j) visits',
          '1 if (i,j) is reachable from (0,0), else 0',
        ],
        answer: 0,
        explain: 'The transition reads states above and to the left — the past of a forward walk — so the state counts paths *arriving here* from the start. Paths-to-the-goal is also a valid DP, but its transition would read dp[i+1][j] + dp[i][j+1] and its base would sit at the goal. Reachability would use OR, not +. Meaning and transition must match.',
      },
      {
        id: 'grid-3', type: 'fill', diff: 2,
        prompt: 'Grid with the center blocked:\n```\n. . .\n. * .\n. . .\n```\nObstacle cells keep dp = 0; every other cell is top + left, dp[0][0] = 1. After filling the table, what is dp[2][2]?',
        answer: ['2'],
        placeholder: 'number',
        explain: 'Table: 1 1 1 / 1 0 1 / 1 1 2. The blocked center contributes 0 both ways, leaving only the two border-hugging paths (RRDD and DDRR). One zero in the middle erased 4 of the 6 open-grid paths.',
        hint: 'Fill all 9 cells. The * cell is 0 no matter what its neighbors say.',
      },
      {
        id: 'grid-4', type: 'bank', diff: 2,
        prompt: 'Complete the minimum path sum (move right/down, pay each cell’s cost).',
        code: `dp[0][0] = g[0][0];
for (int j = 1; j < m; j++) dp[0][j] = dp[0][j - 1] + g[0][j];
for (int i = 1; i < n; i++) dp[i][0] = ___ + g[i][0];
for (int i = 1; i < n; i++)
    for (int j = 1; j < m; j++)
        dp[i][j] = g[i][j] + min(___, ___);`,
        answer: ['dp[i - 1][0]', 'dp[i - 1][j]', 'dp[i][j - 1]'],
        distractors: ['dp[i - 1][j - 1]', 'dp[i][j + 1]'],
        explain: 'First column cells have a single parent: the cell above. Inner cells take the cheaper of top and left. The diagonal dp[i−1][j−1] is the classic phantom move — no diagonal step exists here; and dp[i][j+1] reads a cell that isn’t computed yet.',
      },
      {
        id: 'grid-5', type: 'mcq', diff: 2,
        prompt: 'Spot the bug in this first-row initialization for Grid Paths (obstacles!):',
        code: `for (int j = 0; j < n; j++)
    dp[0][j] = (g[0][j] == '.') ? 1 : 0;   // first row`,
        options: [
          'An open cell after an obstacle in row 0 still gets 1, but nothing can reach it — propagate instead: dp[0][j] = (open && dp[0][j−1] != 0)',
          'The ternary is inverted — obstacles should get 1',
          'j must start at 1 because dp[0][0] is special',
          'Nothing — obstacles get 0, which is all that matters',
        ],
        answer: 0,
        explain: 'In row 0 the only way in is from the left, so a single `*` cuts off everything after it. `. * .` must give 1, 0, 0 — this code says 1, 0, 1 and overcounts. The unified loop with `if (j > 0) dp[0][j] += dp[0][j-1]` gets this right for free, which is why padding/guards beat hand-rolled border cases.',
        hint: 'Walk row 0 of `. * .` by hand. Can you stand on the third cell?',
      },
      {
        id: 'grid-6', type: 'tf', diff: 2,
        statement: 'In the right/down path DP, dp[i][j] depends only on the current and previous rows, so a rolling 1-row array gives the same answers in O(m) memory.',
        answer: true,
        explain: 'The reads are dp[i−1][j] (previous row) and dp[i][j−1] (current row) — never anything older. Overwrite row by row: before updating dp[j] it holds the top value, and dp[j−1] already holds the left value. n×m = 10⁶ fits anyway, but at 10⁴×10⁴ the rolling row is the difference between 400 MB and 40 KB.',
      },
      {
        id: 'grid-7', type: 'mcq', diff: 3,
        prompt: 'Rolling-row path counting — but it prints wrong answers. Why?',
        code: `vector<ll> dp(m, 0);
dp[0] = 1;
for (int i = 0; i < n; i++)
    for (int j = m - 1; j >= 1; j--)     // right to left
        dp[j] += dp[j - 1];`,
        options: [
          'Sweeping right-to-left reads dp[j−1] before it’s updated — still the PREVIOUS row’s value, so it adds top-left instead of left',
          'j must reach 0 or the first column is never counted',
          'dp[0] must be reset to 1 at the start of every row',
          'll overflows — counts need mod, which also fixes the order',
        ],
        answer: 0,
        explain: 'In-place rolling requires dp[j−1] to already be the *current* row (the left neighbor). Right-to-left leaves it one row stale → you sum top + top-left, a different (wrong) recurrence. Remember this asymmetry: rolling path DP needs left-to-right, while 0/1 knapsack needs right-to-left — in both cases the direction is dictated by *which version* of the neighbor the transition must read.',
        hint: 'When you update dp[5], has dp[4] been touched this row yet? Which row’s value is it?',
      },
      {
        id: 'grid-8', type: 'parsons', diff: 2,
        prompt: 'Assemble the Grid Paths I cell loop (obstacles give 0; counts mod MOD).',
        lines: [
          'for (int i = 0; i < n; i++) {',
          '    for (int j = 0; j < n; j++) {',
          "        if (g[i][j] == '*') { dp[i][j] = 0; continue; }",
          '        if (i == 0 && j == 0) { dp[i][j] = 1; continue; }',
          '        if (i > 0) dp[i][j] += dp[i - 1][j];',
          '        if (j > 0) dp[i][j] += dp[i][j - 1];',
          '        dp[i][j] %= MOD;',
          '    }',
          '}',
        ],
        distractors: [
          '        if (i > 0) dp[i][j] += dp[i + 1][j];',
        ],
        explain: 'Obstacle check first (blocked cells contribute 0), start cell seeded with 1, then top + left with guards that double as border handling, mod last. The distractor reads the row *below* — a state that doesn’t exist yet; if you see += dp[i+1][j] in a top-left-origin DP, the dependency direction is broken.',
      },
      {
        id: 'grid-9', type: 'match', diff: 2,
        prompt: 'Match each grid task to its DP shape.',
        pairs: [
          ['count paths to each cell', 'dp[i][j] = dp[i−1][j] + dp[i][j−1]'],
          ['cheapest route to each cell', 'dp[i][j] = cost + min(top, left)'],
          ['2×n picks, no adjacent columns', 'dp[column][skip / top / bottom]'],
          ['table too big for memory', 'rolling 1-row dp[j], left-to-right'],
        ],
        explain: 'One skeleton, four costumes: change the combiner (Σ vs min), change the state’s second coordinate (cell vs track), or compress a dimension you only read once. Spotting *which* costume a problem wears is most of grid DP.',
      },
      {
        id: 'grid-10', type: 'output', diff: 3,
        prompt: 'Basketball Exercise, miniature: top row {2, 5, 1}, bottom row {4, 1, 3}. At most one pick per column; picks in adjacent columns must come from different rows. Trace the three tracks. Output?',
        code: `int main() {
    vector<long long> t = {2, 5, 1}, b = {4, 1, 3};
    long long skip = 0, top = t[0], bot = b[0];
    for (int i = 1; i < 3; i++) {
        long long nskip = max({skip, top, bot});
        long long ntop = t[i] + max(skip, bot);
        long long nbot = b[i] + max(skip, top);
        skip = nskip; top = ntop; bot = nbot;
    }
    cout << max({skip, top, bot}) << "\\n";
}`,
        answer: '12',
        explain: 'Column 0: (skip, top, bot) = (0, 2, 4). Column 1: skip = 4, top = 5 + max(0, 4) = 9, bot = 1 + max(0, 2) = 3. Column 2: skip = 9, top = 1 + max(4, 3) = 5, bot = 3 + max(4, 9) = 12. The winning team is bottom₀ (4) → top₁ (5) → bottom₂ (3) = 12, alternating rows exactly as the transition demands — `ntop` only ever extends `skip` or `bot`, never the previous `top`.',
        hint: 'Track the triple (skip, top, bot) after each column: (0,2,4) → (4,9,3) → (9,5,12).',
      },
      {
        id: 'grid-11', type: 'mcq', diff: 2,
        prompt: 'Grid Paths I has n ≤ 1000 (a 10⁶-cell grid). Pick the TRUE statement.',
        options: [
          'The DP is O(n²) ≈ 10⁶ cell updates — instant; enumerating paths is hopeless since path counts grow exponentially',
          'Both DP and path enumeration are fine at this size',
          'The DP is O(n³) here because each cell scans its whole row',
          'Path enumeration wins because most paths die early on obstacles',
        ],
        answer: 0,
        explain: 'Each cell is computed once from two neighbors: O(n²) total. The number of paths itself is the killer for enumeration — an open grid has C(2n−2, n−1) paths, astronomical at n = 1000 — and the answer being "a count mod 10⁹+7" is the statement’s way of telling you so. Count via states, never via objects.',
      },
      {
        id: 'grid-12', type: 'code', diff: 3,
        prompt: 'Grid Paths I (CSES 1638, mini): read n, then an n×n grid of `.` (open) and `*` (trap). Print the number of right/down paths from the top-left to the bottom-right corner, mod 10⁹+7.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n;
    cin >> n;
    vector<string> g(n);
    for (auto &row : g) cin >> row;
    const ll MOD = 1000000007;
    // dp[i][j] = paths from (0,0) to (i,j), mod MOD

    return 0;
}`,
        tests: [
          { input: '3\n...\n...\n...', expected: '6' },
          { input: '3\n...\n.*.\n...', expected: '2' },
          { input: '1\n.', expected: '1' },
          { input: '2\n.*\n*.', expected: '0' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n;
    cin >> n;
    vector<string> g(n);
    for (auto &row : g) cin >> row;
    const ll MOD = 1000000007;
    vector<vector<ll>> dp(n, vector<ll>(n, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            if (g[i][j] == '*') continue;        // blocked: stays 0
            if (i == 0 && j == 0) { dp[i][j] = 1; continue; }
            if (i > 0) dp[i][j] += dp[i - 1][j]; // from above
            if (j > 0) dp[i][j] += dp[i][j - 1]; // from the left
            dp[i][j] %= MOD;
        }
    cout << dp[n - 1][n - 1] << "\\n";
    return 0;
}`,
        explain: 'Blocked cells keep dp = 0 and the zeros do the pruning — note test 4, where walls seal the corner and the answer is 0 with no special code. The guards `i > 0` / `j > 0` handle the borders, the start seeds 1, and the mod rides every addition.',
        hint: 'Test 2 is the worked example from earlier: the center * leaves only the two border paths.',
      },
    ],
    problems: [
      { name: 'Grid Paths I', platform: 'CSES', id: '1638', url: 'https://cses.fi/problemset/task/1638', difficulty: 'easy', why: 'Top + left with obstacles zeroing cells — the canonical grid count.' },
      { name: 'Basketball Exercise', platform: 'Codeforces', id: '1195C', rating: 1400, url: 'https://codeforces.com/problemset/problem/1195/C', difficulty: 'med', why: '2×n take/skip tracks: the grid collapses into 3 states per column.' },
      { name: 'Boredom', platform: 'Codeforces', id: '455A', rating: 1500, url: 'https://codeforces.com/problemset/problem/455/A', difficulty: 'med', why: 'Take/skip along the value line — the same adjacent-exclusion transition, no grid in sight.' },
    ],
  },

  // ==========================================================================
  'dp-knapsack': {
    id: 'dp-knapsack',
    objectives: [
      'Implement 0/1 knapsack on a 1-D array with the capacity loop running DOWNWARD — and explain exactly why',
      'Use boolean subset-sum DP for reachability questions (Money Sums)',
      'Choose the loop nesting that counts ordered sequences vs unordered combinations (Coin Combinations I vs II)',
      'Frame O(n·W) as pseudo-polynomial and judge feasibility from the constraints',
    ],
    theory: [
      {
        h: 'The knapsack family',
        md: 'Items with weights (and maybe values), a capacity, and a question: best value? reachable sums? number of ways? All of them run on one state: **dp[w] = answer for total weight/sum exactly w**, processing items one at a time.\n\nRecognition cues: "choose a subset", "total weight at most x", "which sums are possible" — with the capacity around 10⁴–10⁶ and n·W small enough to tabulate. Book Shop is the costume version: price = weight, pages = value, one copy of each book = 0/1.',
      },
      {
        h: '0/1 knapsack: the downward loop, and exactly why',
        md: 'Each item once. Process item (wt, val), updating dp in place:\n\nThe transition `dp[w] = max(dp[w], dp[w − wt] + val)` must read **dp[w − wt] from before this item existed**. Loop w from W *down* to wt and dp[w − wt] is still untouched this round — the without-this-item value. Loop *upward* and dp[w − wt] may already include the item, which then gets added again: you’ve silently built unbounded knapsack.',
        code: `vector<ll> dp(W + 1, 0);             // dp[w] = best value at weight w
for (int i = 0; i < n; i++)
    for (int w = W; w >= wt[i]; w--)         // DOWNWARD: each item once
        dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
cout << dp[W] << "\\n";`,
        note: 'The 2-D picture explains it: dp[i][w] = max(dp[i−1][w], dp[i−1][w−wt]+val) reads the PREVIOUS row. The downward sweep is just the previous row preserved in place.',
      },
      {
        h: 'Unbounded: loop upward on purpose',
        md: 'Unlimited copies? Now you *want* dp[w − wt] to already include the current item — item i stacking on itself is legal. Loop upward and the in-place reuse becomes the feature. Minimizing Coins from the foundations skill is exactly unbounded knapsack with value = −1 coin per use.\n\nOne loop direction, two different problems. Always decide "once or many?" before typing the `for`.',
        code: `// unbounded: each coin usable any number of times
for (int c : coins)
    for (int w = c; w <= W; w++)             // UPWARD: reuse allowed
        dp[w] = min(dp[w], dp[w - c] + 1);`,
        noteKind: 'warn',
        note: 'Downward = 0/1 (each once). Upward = unbounded (reuse). Flip it and you solve a different problem with zero compiler complaints.',
      },
      {
        h: 'Ordered vs unordered: the nesting decides',
        md: 'Counting ways to pay sum x with coins — two answers depending on whether 2+3 and 3+2 differ:\n\n**Coin Combinations I (ordered)**: sums outer, coins inner. At every sum any coin can be the last move, so each ordering counts.\n**Coin Combinations II (unordered)**: coins outer, sums inner. All uses of coin c₁ happen before c₂ is ever considered, so every multiset is built exactly once, in canonical coin order.',
        code: `// Coin Combinations I — ordered sequences
for (int i = 1; i <= x; i++)                 // sums outer
    for (int c : coins)                      // any coin can be the last move
        if (c <= i) dp[i] = (dp[i] + dp[i - c]) % MOD;

// Coin Combinations II — unordered combinations
for (int c : coins)                          // coins outer
    for (int i = c; i <= x; i++)             // canonical coin order
        dp[i] = (dp[i] + dp[i - c]) % MOD;
// both: dp[0] = 1, everything mod 1e9+7`,
        note: 'Submitting the I-nesting to Coin Combinations II is a rite of passage. When a counting answer is exactly k! times too big, your loop order is letting orderings count.',
        noteKind: 'warn',
      },
      {
        h: 'Boolean subset sums and Two Sets II',
        md: 'When the question is just reachability — "which sums can a subset make?" — the dp is boolean: **dp[s] = true if some subset of processed coins sums to exactly s**, dp[0] = true, downward loop (each coin once), `dp[s] = dp[s] || dp[s − c]`. Money Sums prints every true index.\n\nTwo Sets II counts subsets of {1..n} summing to **n(n+1)/4** (half the total): same 0/1 sweep, but += counts mod 10⁹+7. If n(n+1)/2 is odd, halving is impossible — answer 0 before any DP. Each split {A, B} is found twice (as A and as B), so halve the count at the end.',
        code: `vector<char> dp(total + 1, 0);
dp[0] = 1;                                // empty subset makes 0
for (int c : coins)
    for (int s = total; s >= c; s--)      // 0/1: downward
        if (dp[s - c]) dp[s] = 1;
// Money Sums: print all s >= 1 with dp[s]`,
      },
      {
        h: 'Pseudo-polynomial: O(n·W) reads the constraints',
        md: 'Knapsack runs in O(n·W) — polynomial in the *value* of W, but W needs only log₂W input bits, so it’s exponential in input *size*. That’s "pseudo-polynomial": a perfectly real 10⁸-operation algorithm at n = 1000, W = 10⁵ (Book Shop), and a fantasy at W = 10¹⁸.\n\nBudget check before coding: n·W ≲ 10⁸ simple operations → go. Bigger → you need meet-in-the-middle, bitsets, or a different idea entirely.',
        note: 'Subset-sum reachability has a famous turbo: `bitset<MAX> dp; dp[0] = 1; for c: dp |= dp << c;` — the same DP, 64 sums per CPU instruction.',
      },
    ],
    exercises: [
      {
        id: 'knap-1', type: 'output', diff: 1,
        prompt: 'Subset-sum with coins {3, 4}, capacity 7, downward sweep. The code prints dp[0..7] as a bit string. Output?',
        code: `int main() {
    vector<int> coins = {3, 4};
    vector<int> dp(8, 0);
    dp[0] = 1;
    for (int c : coins)
        for (int s = 7; s >= c; s--)
            if (dp[s - c]) dp[s] = 1;
    for (int s = 0; s <= 7; s++) cout << dp[s];
    cout << "\\n";
}`,
        answer: '10011001',
        explain: 'Reachable sums with each coin used at most once: 0 (empty), 3, 4, and 7 (=3+4) → positions 0, 3, 4, 7 set. Note what the downward loop prevented: 3+3 = 6 never appears, because dp[3] was read before coin 3 could have written it this round.',
      },
      {
        id: 'knap-2', type: 'mcq', diff: 1,
        prompt: 'In Money Sums (`dp[s] = dp[s] || dp[s − c]`, dp[0] = true, coins processed one at a time, downward), what does dp[s] MEAN after processing the first i coins?',
        options: [
          'Some subset of the first i coins sums to exactly s',
          'Some subset of the first i coins sums to at most s',
          'All of the first i coins together sum to s',
          'Coin s appears among the first i coins',
        ],
        answer: 0,
        explain: 'Exactly s, subset (not all), of the processed prefix. "At most s" is the subtle wrong meaning — it breaks the transition, because dp[s − c] must certify an exact remainder for dp[s] to certify an exact s. Precision in the state sentence prevents the wrong reads later.',
      },
      {
        id: 'knap-13', type: 'tf', diff: 1,
        statement: 'For subset-sum DP, the base case is dp[0] = true: the empty subset makes sum 0.',
        answer: true,
        explain: 'Same "one empty way" seed as counting DPs. Every reachable sum is certified by a chain back to dp[0] — without it, nothing is ever reachable. (In counting flavor it becomes dp[0] = 1; in min-cost flavor, dp[0] = 0.)',
      },
      {
        id: 'knap-3', type: 'mcq', diff: 2,
        prompt: 'Book Shop (each book once), but the capacity loop runs upward. What does this code actually compute?',
        code: `for (int i = 0; i < n; i++)
    for (int w = price[i]; w <= x; w++)      // upward!
        dp[w] = max(dp[w], dp[w - price[i]] + pages[i]);`,
        options: [
          'The unbounded answer — dp[w − price] may already include book i, so the same book stacks multiple times',
          'The right answer, just slower',
          'Garbage — dp[w − price] is read before it is initialized',
          'A compile error: the loop bounds are inverted',
        ],
        answer: 0,
        explain: 'Upward, dp[w − price[i]] can already contain book i from this same sweep (it was just updated at a smaller w), so buying it "again" is allowed — that is unbounded knapsack, not 0/1. The output is plausible-looking and bigger than the truth: the worst kind of bug. Downward keeps dp[w − price] one item behind.',
        hint: 'When w = 2·price[i], what might dp[w − price[i]] already contain?',
      },
      {
        id: 'knap-4', type: 'bank', diff: 2,
        prompt: 'Complete the 0/1 knapsack sweep for item (wt, val) so the item is used at most once.',
        code: `for (int w = ___; w >= wt; ___)
    dp[w] = max(dp[w], dp[w - wt] + ___);`,
        answer: ['W', 'w--', 'val'],
        distractors: ['wt', 'w++', '1'],
        explain: 'Start at full capacity W and sweep down to wt — each dp[w − wt] read is then guaranteed pre-this-item. The `w++`/starting-at-wt tokens build the upward (unbounded) sweep; the `1` is the coin-counting habit leaking into a value-maximization.',
      },
      {
        id: 'knap-5', type: 'output', diff: 2,
        prompt: 'Coins {2, 3}, target 5, dp[0] = 1, COINS OUTER. What does this print?',
        code: `int main() {
    vector<int> coins = {2, 3};
    vector<long long> dp(6, 0);
    dp[0] = 1;
    for (int c : coins)
        for (int i = c; i <= 5; i++)
            dp[i] += dp[i - c];
    cout << dp[5] << "\\n";
}`,
        answer: '1',
        explain: 'Coin 2 pass: dp = [1,0,1,0,1,0]. Coin 3 pass: dp[3] += dp[0] → 1, dp[4] += dp[1] → 1, dp[5] += dp[2] → 1. Result 1: only the multiset {2,3}, counted once — 3 never precedes 2 because all 2-work finished first. This is the Coin Combinations II nesting.',
      },
      {
        id: 'knap-6', type: 'mcq', diff: 3,
        prompt: 'Coin Combinations II (CSES 1636) asks for the number of DISTINCT UNORDERED multisets of coins summing to x. Which loop structure is correct?',
        options: [
          '```\nfor (int c : coins)\n    for (int i = c; i <= x; i++)\n        dp[i] = (dp[i] + dp[i - c]) % MOD;\n```',
          '```\nfor (int i = 1; i <= x; i++)\n    for (int c : coins)\n        if (c <= i) dp[i] = (dp[i] + dp[i - c]) % MOD;\n```',
          '```\nfor (int c : coins)\n    for (int i = x; i >= c; i--)\n        dp[i] = (dp[i] + dp[i - c]) % MOD;\n```',
          'Any of these — they differ only in performance',
        ],
        answer: 0,
        explain: 'Coins outer + sums inner upward builds every combination in canonical coin order: counted once. Option B (sums outer) counts every *ordering* — that is Coin Combinations I, and its answers are too big. Option C is sneaky: coins outer but DOWNWARD makes it 0/1 — each coin usable at most once, a third, different problem. Nesting picks ordered-vs-unordered; direction picks once-vs-many.',
        hint: 'Two separate dials: which loop is outside, and which way the sum loop runs.',
      },
      {
        id: 'knap-7', type: 'fill', diff: 2,
        prompt: 'Two Sets II splits {1, 2, …, n} into two subsets of equal sum. Each subset must therefore sum to ___ (in terms of n).',
        answer: ['n(n+1)/4', 'n*(n+1)/4', 'n(n+1) / 4', 'n * (n + 1) / 4'],
        placeholder: 'n(…)/…',
        explain: 'The total is n(n+1)/2, and each side takes half: n(n+1)/4. If n(n+1)/2 is odd (n ≡ 1 or 2 mod 4), the target isn’t an integer — answer 0 immediately, no DP needed. Always check feasibility math before building the table.',
      },
      {
        id: 'knap-8', type: 'parsons', diff: 2,
        prompt: 'Assemble Book Shop: n books with prices h[] and pages s[], budget x, maximize pages (each book once).',
        lines: [
          'vector<ll> dp(x + 1, 0);',
          'for (int i = 0; i < n; i++) {',
          '    for (int w = x; w >= h[i]; w--) {',
          '        dp[w] = max(dp[w], dp[w - h[i]] + s[i]);',
          '    }',
          '}',
          'cout << dp[x] << "\\n";',
        ],
        distractors: [
          '    for (int w = h[i]; w <= x; w++) {',
        ],
        explain: 'Items outer, capacity inner and DOWNWARD — each book bought at most once. The distractor is the upward sweep: compiles, runs, and quietly buys the same book repeatedly (unbounded). dp[x] is the answer because dp[w] here means "best pages with budget ≤ w" — weights need not be hit exactly when dp starts all-zero.',
      },
      {
        id: 'knap-9', type: 'mcq', diff: 2,
        prompt: 'In Two Sets II you count subsets summing to n(n+1)/4 and get dp[target] = 2·(true answer). Why exactly double?',
        options: [
          'Every split {A, B} is counted twice — once when the dp picks A, once when it picks B (the complement)',
          'The mod was applied twice per addition',
          'The downward loop visits each subset twice',
          'Off-by-one: dp[0] = 1 leaks an extra empty split',
        ],
        answer: 0,
        explain: 'A subset and its complement both hit the half-sum target and describe the SAME split. Divide by 2 — under mod 10⁹+7 that means multiplying by the modular inverse of 2, or cleaner: force element n into set A by running the dp on items 1..n−1 with target T − n. Symmetric double counting is a pattern worth recognizing everywhere.',
        hint: 'If A sums to T, what does its complement sum to?',
      },
      {
        id: 'knap-10', type: 'mcq', diff: 3,
        prompt: 'Book Shop: n ≤ 1000 books, budget x ≤ 10⁵. Judge the standard dp[w] solution.',
        options: [
          'O(n·x) = 10⁸ single-array updates — fits, because the inner operation is one compare-and-max; O(n·x) memory would NOT fit, which is why the 1-D rolling array matters',
          'O(n·x) = 10⁸ is always too slow; you need O(n log n)',
          'O(n + x) — the loops don’t multiply',
          'O(2ⁿ) — subset choice forces exponential time',
        ],
        answer: 0,
        explain: 'n·x = 10⁸ trivial operations runs around a second — tight but standard for this exact problem. The 2-D table (1000 × 10⁵ ints ≈ 400 MB) is the real killer; the downward 1-D sweep gives the previous row for free in 400 KB. Pseudo-polynomial DPs live and die by these two multiplications — always do them before coding.',
        hint: 'Time = n·x updates. Memory: how big is dp[n][x] vs dp[x]?',
      },
      {
        id: 'knap-11', type: 'code', diff: 3,
        prompt: 'Money Sums (CSES 1745, mini): read n, then n coin values (each usable once). Print the number of DISTINCT positive sums some subset can make.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> c(n);
    for (auto &v : c) cin >> v;
    // dp[s] = can a subset sum to exactly s?

    return 0;
}`,
        tests: [
          { input: '3\n4 2 5', expected: '7' },
          { input: '2\n1 1', expected: '2' },
          { input: '1\n7', expected: '1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> c(n);
    for (auto &v : c) cin >> v;
    int total = accumulate(c.begin(), c.end(), 0);
    vector<char> dp(total + 1, 0);
    dp[0] = 1;                            // empty subset
    for (int v : c)
        for (int s = total; s >= v; s--)  // 0/1: downward
            if (dp[s - v]) dp[s] = 1;
    int cnt = 0;
    for (int s = 1; s <= total; s++) cnt += dp[s];
    cout << cnt << "\\n";
    return 0;
}`,
        explain: 'Boolean 0/1 subset-sum: size the table by the total, seed dp[0], sweep each coin downward, then count true cells from 1 up. Test 2 is the trap: coins {1, 1} make sums {1, 2} — the downward loop correctly allows 1+1 = 2 because the two 1s are *different coins*, while a single coin still can’t double itself.',
        hint: 'Sums for {4, 2, 5}: 2, 4, 5, 6, 7, 9, 11 — seven of them. dp[0] is reachable but not counted (positive sums only).',
      },
      {
        id: 'knap-12', type: 'match', diff: 2,
        prompt: 'Match each knapsack variant to its loop signature.',
        pairs: [
          ['0/1 (each item once)', 'items outer; capacity inner, downward'],
          ['unbounded (unlimited copies)', 'coins outer; capacity inner, upward'],
          ['count ordered sequences', 'sums outer; coins inner'],
          ['count unordered combinations', 'coins outer; sums inner, upward'],
        ],
        explain: 'The whole skill in four rows. Direction (down vs up) decides once-vs-many; nesting (sums-outer vs coins-outer) decides ordered-vs-unordered. Four loop shapes, four different problems — and they all look nearly identical in code.',
      },
    ],
    problems: [
      { name: 'Coin Combinations II', platform: 'CSES', id: '1636', url: 'https://cses.fi/problemset/task/1636', difficulty: 'med', why: 'Unordered counting — the loop-nesting flip in the wild. Compare your I solution line by line.' },
      { name: 'Book Shop', platform: 'CSES', id: '1158', url: 'https://cses.fi/problemset/task/1158', difficulty: 'med', why: 'Pure 0/1 knapsack with (price, pages) — the downward sweep, at real constraints.' },
      { name: 'Money Sums', platform: 'CSES', id: '1745', url: 'https://cses.fi/problemset/task/1745', difficulty: 'med', why: 'Boolean subset-sum reachability; print the whole dp landscape.' },
      { name: 'Two Sets II', platform: 'CSES', id: '1093', url: 'https://cses.fi/problemset/task/1093', difficulty: 'hard', why: 'Partition counting mod 1e9+7: parity check, half-sum target, double-count fix.' },
    ],
  },

  // ==========================================================================
  'dp-sequences': {
    id: 'dp-sequences',
    objectives: [
      'Use the "ends exactly at i" state for LIS in O(n²), and take the final answer as the max over all states',
      'Upgrade LIS to O(n log n) with the tails array, choosing lower_bound (strict) vs upper_bound (non-decreasing)',
      'Build the edit-distance table with correct first row/column and the 4-way transition',
      'Solve min-step DPs over numeric states (Removing Digits)',
    ],
    theory: [
      {
        h: 'Two state shapes: "first i" vs "ends at i"',
        md: 'Sequence DP has two recurring state patterns:\n\n**Prefix**: dp[i] = answer for the first i elements (edit distance, take/skip sums). **Ends-at**: dp[i] = best *whose last element is exactly a[i]* (LIS).\n\nWhy LIS needs ends-at: to extend a subsequence with a[i] you must know its last element — "LIS of the first i elements" forgets it, and the transition dies. When the future depends on *how* the past ended, the ending belongs in the state.',
        note: 'With ends-at states the final answer is **max over all dp[i]** — not dp[n−1]. The best subsequence can end anywhere.',
        noteKind: 'warn',
      },
      {
        h: 'LIS in O(n²)',
        md: '**dp[i] = length of the longest strictly increasing subsequence ending exactly at index i.** The last move: which element a[j] comes right before a[i]? Any j < i with a[j] < a[i].',
        code: `vector<int> dp(n, 1);             // each element alone: length 1
int best = 1;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++)           // try every predecessor
        if (a[j] < a[i])                  // strictly smaller → extends
            dp[i] = max(dp[i], dp[j] + 1);
    best = max(best, dp[i]);              // answer can end anywhere
}`,
      },
      {
        h: 'LIS in O(n log n): the tails array',
        md: 'n = 2·10⁵ kills O(n²). Keep **tails[k] = the smallest possible last element of an increasing subsequence of length k+1**. tails is always sorted, so each new x binary-searches its spot: replace the first tail ≥ x (lower_bound), or extend if x beats them all. The LIS length is tails.size().\n\ntails is *not* an actual LIS — it’s the frontier of best endings, which is all the future needs.',
        code: `vector<int> tails;
for (int x : a) {
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) tails.push_back(x);   // extends the longest
    else *it = x;                                // better (smaller) tail
}
cout << tails.size() << "\\n";       // O(n log n)`,
        note: 'Strictly increasing → `lower_bound`. Non-decreasing allowed (equal elements may chain) → `upper_bound`. One identifier apart.',
      },
      {
        h: 'Edit distance: the full table',
        md: '**dp[i][j] = minimum operations (insert / delete / replace) turning the first i chars of A into the first j chars of B.** Base cases are the empty-string rows: dp[i][0] = i (delete everything), dp[0][j] = j (insert everything). Then:',
        code: `for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (A[i - 1] == B[j - 1])
            dp[i][j] = dp[i - 1][j - 1];          // free match
        else
            dp[i][j] = 1 + min({ dp[i - 1][j - 1],   // replace
                                 dp[i - 1][j],       // delete from A
                                 dp[i][j - 1] });    // insert into A
    }
cout << dp[n][m] << "\\n";        // O(nm) time and table`,
        note: 'Forgetting to fill row 0 / column 0 leaves zeros there, and "abc" → "" suddenly costs 0. Empty-prefix bases are not optional.',
        noteKind: 'warn',
      },
      {
        h: 'Numeric states: Removing Digits',
        md: 'State doesn’t have to be an index. Removing Digits: from n, repeatedly subtract one of n’s own digits; minimize steps to 0. **dp[x] = fewest steps from x to 0**: dp[0] = 0, and dp[x] = 1 + min over digits d of x (d ≥ 1) of dp[x − d]. O(n · 7) — each state looks at its ≤ 7 nonzero digits.\n\nThe lesson generalizes: any "minimum moves" question over a small numeric range is a DP (or equivalently BFS) over values, not positions.',
        code: `vector<int> dp(n + 1, INT_MAX);
dp[0] = 0;
for (int x = 1; x <= n; x++)
    for (int t = x; t > 0; t /= 10) {     // walk x's digits
        int d = t % 10;
        if (d > 0) dp[x] = min(dp[x], dp[x - d] + 1);
    }
cout << dp[n] << "\\n";`,
      },
    ],
    exercises: [
      {
        id: 'seq-1', type: 'output', diff: 1,
        prompt: 'LIS O(n²) on {3, 1, 4, 1, 5}. What does this print?',
        code: `int main() {
    vector<int> a = {3, 1, 4, 1, 5};
    int n = 5;
    vector<int> dp(n, 1);
    int best = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);
        best = max(best, dp[i]);
    }
    cout << best << "\\n";
}`,
        answer: '3',
        explain: 'dp = [1, 1, 2, 1, 3]: 4 extends 3 (or 1), and 5 extends the ...-4 chain → 3, e.g. 3, 4, 5 or 1, 4, 5. Note dp[3] = 1: the second 1 can’t extend the first (strictly increasing). Writing the dp array under the input array is the fastest way to check any sequence DP.',
      },
      {
        id: 'seq-2', type: 'mcq', diff: 1,
        prompt: 'In the O(n²) LIS, what does dp[i] MEAN?',
        options: [
          'The length of the longest increasing subsequence that ends exactly at index i',
          'The length of the longest increasing subsequence within the first i elements',
          'The length of the longest increasing subsequence starting at index i',
          'The number of increasing subsequences ending at index i',
        ],
        answer: 0,
        explain: '"Ends exactly at i" is what makes `if (a[j] < a[i]) dp[i] = dp[j] + 1` legal: dp[j] guarantees its subsequence ends at a[j], so comparing a[j] < a[i] is enough. The "first i elements" meaning (option B) is the classic subtly-wrong state — it doesn’t remember the last element, so you can’t test extendability.',
      },
      {
        id: 'seq-3', type: 'tf', diff: 1,
        statement: 'With the "ends at i" LIS state, the final answer is dp[n−1].',
        answer: false,
        explain: 'dp[n−1] only covers subsequences ending at the LAST element — on {1, 5, 9, 2} it equals 2 (1, 2) while the true LIS is 3 (1, 5, 9). Ends-at states need max over all i as the final read-out. This one slip accounts for a remarkable share of LIS wrong answers.',
      },
      {
        id: 'seq-4', type: 'fill', diff: 2,
        prompt: 'Edit distance base case — turning the first i characters of A into an EMPTY string:\n`dp[i][0] = ___;`',
        answer: ['i'],
        placeholder: 'value',
        explain: 'Erasing an i-character prefix takes exactly i deletions; symmetrically dp[0][j] = j insertions. These borders feed every inner cell — left as zeros, the whole table collapses toward 0 and your distances come out absurdly small.',
      },
      {
        id: 'seq-5', type: 'output', diff: 2,
        prompt: 'Edit distance between A = "abc" and B = "yc". Fill the 4×3 table by hand. Output?',
        code: `int main() {
    string A = "abc", B = "yc";
    int n = 3, m = 2;
    vector<vector<int>> dp(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; i++) dp[i][0] = i;
    for (int j = 0; j <= m; j++) dp[0][j] = j;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (A[i - 1] == B[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
        }
    cout << dp[n][m] << "\\n";
}`,
        answer: '2',
        explain: 'Replace a→y, keep c, delete b: 2 ops. The table’s last row runs 3, 3, 2 — the final cell takes the free-match diagonal because A[2] = B[1] = ’c’, inheriting dp[2][1] = 2. Hand-filling one small edit-distance table cements the transition better than ten readings.',
        hint: 'Row i, column j = prefixes of lengths i and j. Start from the 0-row (0 1 2) and 0-column (0 1 2 3).',
      },
      {
        id: 'seq-6', type: 'bank', diff: 2,
        prompt: 'Complete the edit-distance transition (match, then replace / delete / insert).',
        code: `if (A[i - 1] == B[j - 1])
    dp[i][j] = ___;
else
    dp[i][j] = 1 + min({ ___, dp[i - 1][j], ___ });`,
        answer: ['dp[i - 1][j - 1]', 'dp[i - 1][j - 1]', 'dp[i][j - 1]'],
        distractors: ['dp[i][j]', 'dp[i + 1][j + 1]'],
        explain: 'Match: take the diagonal for free. Otherwise pay 1 and pick the cheapest of replace (diagonal), delete (up), insert (left). Reading dp[i][j] inside its own definition or peeking at dp[i+1][j+1] (a future state) are both dependency violations — the table only ever looks up-and-left.',
      },
      {
        id: 'seq-7', type: 'fill', diff: 2,
        prompt: 'Your tails-based LIS uses `lower_bound` for a STRICTLY increasing answer. To allow equal neighbors (non-decreasing), replace it with ___.',
        answer: ['upper_bound'],
        placeholder: '…_bound',
        explain: 'upper_bound finds the first tail strictly GREATER than x, so an equal tail is left alone and x starts/extends a chain after its twin — equal values may now chain. lower_bound would replace the equal tail instead, forbidding 5 after 5. One identifier flips strict ↔ non-decreasing; check which one the statement wants every single time.',
      },
      {
        id: 'seq-8', type: 'mcq', diff: 3,
        prompt: 'This "strict LIS" prints 3 on the input {5, 5, 5} — the right answer is 1. Which line is the bug?',
        code: `vector<int> tails;
for (int x : a) {
    auto it = upper_bound(tails.begin(), tails.end(), x);   // line A
    if (it == tails.end()) tails.push_back(x);              // line B
    else *it = x;                                           // line C
}
cout << tails.size() << "\\n";`,
        options: [
          'Line A — upper_bound skips past equal tails, so each 5 "extends" the previous 5; strict LIS needs lower_bound',
          'Line B — push_back should insert at the front',
          'Line C — replacing a tail shrinks the answer',
          'Nothing — the LIS of {5, 5, 5} really is 3',
        ],
        answer: 0,
        explain: 'With upper_bound, the second 5 searches for the first tail > 5, finds none, and appends — as if 5 < 5. lower_bound finds the first tail ≥ 5 and overwrites it, keeping length 1. The strict/non-strict mix-up passes most random tests and dies on duplicates: always test your LIS on an all-equal array.',
        hint: 'Trace tails after each 5 under both bounds.',
      },
      {
        id: 'seq-9', type: 'mcq', diff: 2,
        prompt: 'Removing Digits: from 27, subtract one of the current number’s own digits each step. Minimum steps to reach 0?',
        options: ['5', '4', '6', '3'],
        answer: 0,
        explain: '27 →(−7) 20 →(−2) 18 →(−8) 10 →(−1) 9 →(−9) 0: five steps. dp[x] = 1 + min over digits d of dp[x − d] confirms it — and here greedy (always subtract the largest digit) happens to match the DP, but you only know that *because* the DP can check it. The state is the number itself: no indices anywhere.',
        hint: 'Watch what each subtraction does to the tens digit.',
      },
      {
        id: 'seq-10', type: 'parsons', diff: 2,
        prompt: 'Assemble the O(n log n) LIS (strictly increasing).',
        lines: [
          'vector<int> tails;',
          'for (int x : a) {',
          '    auto it = lower_bound(tails.begin(), tails.end(), x);',
          '    if (it == tails.end()) tails.push_back(x);',
          '    else *it = x;',
          '}',
          'cout << tails.size() << "\\n";',
        ],
        distractors: [
          '    auto it = upper_bound(tails.begin(), tails.end(), x);',
          '    else tails.insert(it, x);',
        ],
        explain: 'Binary-search x’s slot, extend if it beats every tail, otherwise overwrite the first tail ≥ x (a smaller tail of the same length can only help the future). The distractors: upper_bound breaks strictness on duplicates, and insert-instead-of-overwrite grows tails on non-extending elements — the length stops meaning anything.',
      },
      {
        id: 'seq-11', type: 'match', diff: 2,
        prompt: 'Match each problem to its state, stated in words.',
        pairs: [
          ['Increasing Subsequence (LIS)', 'dp[i] = best length ending exactly at index i'],
          ['Edit Distance', 'dp[i][j] = min ops between the two prefixes'],
          ['Removing Digits', 'dp[x] = fewest steps from number x to 0'],
          ['Dice Combinations', 'dp[s] = ways to reach sum s'],
        ],
        explain: 'Four state vocabularies: ends-at-index, prefix-pair, numeric value, running sum. Most sequence problems you meet are one of these four wearing a costume — state recognition is pattern matching against a small library.',
      },
      {
        id: 'seq-12', type: 'tf', diff: 2,
        statement: 'Increasing Subsequence (CSES) has n ≤ 2·10⁵, so the O(n²) LIS (~4·10¹⁰ comparisons) is fine within a 1-second limit.',
        answer: false,
        explain: '4·10¹⁰ is about 400 seconds of work — two orders of magnitude over budget; ~10⁸ simple ops per second is the planning number. n ≤ 2·10⁵ is the constraint *telling* you to bring the O(n log n) tails method (~3.5·10⁶ operations). O(n²) LIS is for n ≲ 5000.',
      },
      {
        id: 'seq-13', type: 'code', diff: 3,
        prompt: 'LIS, O(n²) version: read n, then n integers. Print the length of the longest STRICTLY increasing subsequence.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    // dp[i] = LIS length ending exactly at i

    return 0;
}`,
        tests: [
          { input: '8\n7 3 5 3 6 2 9 8', expected: '4' },
          { input: '4\n4 3 2 1', expected: '1' },
          { input: '5\n2 2 2 2 2', expected: '1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    vector<int> dp(n, 1);            // each element alone
    int best = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (a[j] < a[i])         // strict: < not <=
                dp[i] = max(dp[i], dp[j] + 1);
        best = max(best, dp[i]);     // can end anywhere
    }
    cout << best << "\\n";
    return 0;
}`,
        explain: 'Tests 2 and 3 guard the two classic slips: a decreasing array (answer 1 — dp init to 1, not 0) and an all-equal array (answer 1 — `<` not `<=`). The answer is the max over dp, taken inside the loop. For CSES-scale n you’d swap in the tails version, same answer.',
        hint: 'On test 1 the chain 3, 5, 6, 9 (or 3, 5, 6, 8) has length 4. Does your dp find it?',
      },
    ],
    problems: [
      { name: 'Removing Digits', platform: 'CSES', id: '1637', url: 'https://cses.fi/problemset/task/1637', difficulty: 'easy', why: 'Min-steps DP where the state is the number itself — pure 4-step recipe.' },
      { name: 'Increasing Subsequence', platform: 'CSES', id: '1145', url: 'https://cses.fi/problemset/task/1145', difficulty: 'med', why: 'LIS at n = 2·10⁵: the tails + lower_bound method, strictness included.' },
      { name: 'Edit Distance', platform: 'CSES', id: '1639', url: 'https://cses.fi/problemset/task/1639', difficulty: 'med', why: 'The full 2-D prefix table: bases on the borders, 4-way transition inside.' },
    ],
  },

  // ==========================================================================
  'dp-intervals': {
    id: 'dp-intervals',
    objectives: [
      'Set up dp[l][r] states over subarrays/substrings and evaluate them by increasing length',
      'Solve two-player removal games with the score-difference minimax trick',
      'Recognize split-style transitions (try every cut/pairing) and their O(n³) budget',
      'Apply the best-for-current-mover convention in game DP',
    ],
    theory: [
      {
        h: 'When the state is a range',
        md: 'Some processes eat an array from its **ends** (removal games), **split** it into pieces (cutting), or **collapse** matching parts (pair removal). After any such move, what remains is a *contiguous piece* — so the subproblem is an interval:\n\n**dp[l][r] = the answer for the piece a[l..r]**, with O(n²) such states.\n\nRecognition cues: "take from either end", "cut into parts", "remove adjacent pairs / palindromic blocks", and the giveaway constraint **n ≤ 500** — small enough that n² states with O(n) work each (n³ ≈ 10⁸) is the intended budget.',
      },
      {
        h: 'Evaluation order: by increasing length',
        md: 'Every interval transition consumes the ends or splits the middle — it only ever references **strictly shorter** intervals. So compute all length-1 intervals, then length-2, and so on: anything you read is guaranteed finished.\n\n(Looping l downward with r upward also satisfies the dependencies, but length order *is* the dependency order — it never betrays you, and it’s how you should think.)',
        code: `for (int l = 0; l < n; l++) dp[l][l] = a[l];     // length 1: base
for (int len = 2; len <= n; len++)               // shorter first
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        dp[l][r] = /* transition using shorter intervals only */;
    }
// answer: dp[0][n - 1] — the whole array`,
      },
      {
        h: 'Removal Game: minimax via score difference',
        md: 'Two players alternately take a[l] or a[r]; both play optimally; maximize your total. Tracking two scores is clumsy — track their **difference** instead:\n\n**dp[l][r] = (current mover’s total) − (other player’s total), on a[l..r], both optimal.** After I take a[l], my opponent becomes the mover on a[l+1..r], so *their* advantage there is dp[l+1][r] — and mine is a[l] minus that.',
        code: `// dp[l][r] = best score difference for whoever moves now
for (int l = 0; l < n; l++) dp[l][l] = a[l];
for (int len = 2; len <= n; len++)
    for (int l = 0, r = len - 1; r < n; l++, r++)
        dp[l][r] = max(a[l] - dp[l + 1][r],    // take left
                       a[r] - dp[l][r - 1]);   // take right
// first player's actual total: (sum + dp[0][n-1]) / 2`,
        note: 'The convention does the heavy lifting: dp is always *from the current mover’s perspective*, so one table serves both players and the subtraction flips sides automatically. total = (sum + diff) / 2 recovers the score.',
      },
      {
        h: 'Split transitions: Rectangle Cutting',
        md: 'Cut an a×b rectangle into squares with the fewest full-length cuts. Any first cut splits it into two independent rectangles — so try **every horizontal and every vertical cut** and recurse:\n\ndp[a][b] = 0 if a == b (already square), else 1 + min over all dp[i][b] + dp[a−i][b] (horizontal, 1 ≤ i < a) and all dp[a][j] + dp[a][b−j] (vertical, 1 ≤ j < b).\n\nThis "try every split point" shape is the third great interval pattern — it’s also the skeleton of matrix-chain multiplication and many parsing DPs.',
        code: `for (int a = 1; a <= A; a++)
    for (int b = 1; b <= B; b++) {
        if (a == b) { dp[a][b] = 0; continue; }   // square: done
        dp[a][b] = INT_MAX;
        for (int i = 1; i < a; i++)               // horizontal cuts
            dp[a][b] = min(dp[a][b], dp[i][b] + dp[a - i][b] + 1);
        for (int j = 1; j < b; j++)               // vertical cuts
            dp[a][b] = min(dp[a][b], dp[a][j] + dp[a][b - j] + 1);
    }`,
      },
      {
        h: 'Pairing the ends — and the n³ budget',
        md: 'Empty String: repeatedly delete two **adjacent equal** letters; count ways to empty the string. Pair s[l] with some equal s[k]: everything strictly between them must vanish first (dp[l+1][k−1]), the rest follows (dp[k+1][r]) — sum over all valid k, times the ways to interleave the two deletion sequences (a binomial). Zuma is the min-steps cousin: remove palindromic blocks, merging help from equal ends.\n\nBudget arithmetic, always: **n² states × O(n) transition = O(n³)**. n = 500 → ~10⁸: fine with cheap operations. n = 5000 → 10¹¹: dead; interval DP doesn’t scale past low thousands.',
        noteKind: 'tip',
        note: 'Removal Game’s transition is O(1) — that’s n² total, comfortable even at n = 5000. Know which transition class you’re in before trusting n.',
      },
    ],
    exercises: [
      {
        id: 'ivl-1', type: 'mcq', diff: 1,
        prompt: 'In Removal Game with the difference trick, what does dp[l][r] MEAN?',
        options: [
          'The best (current mover’s score − other player’s score) achievable on a[l..r], both playing optimally',
          'The first player’s total score on a[l..r]',
          'The maximum sum collectible from a[l..r]',
          'The larger of a[l] and a[r]',
        ],
        answer: 0,
        explain: 'Two ideas in one state: it’s a *difference* (one number instead of two scores), and it’s for *whoever moves now* (so the same table serves both players). Option B can’t recurse — after one move the "first player" is no longer the mover, and the subproblem changes meaning under you.',
      },
      {
        id: 'ivl-2', type: 'output', diff: 1,
        prompt: 'Removal Game on {4, 7}, difference DP. What does this print?',
        code: `int main() {
    vector<int> a = {4, 7};
    int n = 2;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int l = 0; l < n; l++) dp[l][l] = a[l];
    for (int len = 2; len <= n; len++)
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            dp[l][r] = max(a[l] - dp[l + 1][r], a[r] - dp[l][r - 1]);
        }
    cout << dp[0][1] << "\\n";
}`,
        answer: '3',
        explain: 'dp[0][1] = max(4 − dp[1][1], 7 − dp[0][0]) = max(4 − 7, 7 − 4) = 3: take the 7, concede the 4, lead by 3. Single elements are the base (the mover just takes them). Even a 2-element trace shows the engine: my take minus *their* best difference on the rest.',
      },
      {
        id: 'ivl-13', type: 'order', diff: 1,
        prompt: 'Order the steps of designing an interval DP.',
        items: [
          'Define dp[l][r] in words — the answer for the piece a[l..r]',
          'Answer the length-1 (or empty) intervals directly as the base',
          'Write the transition: ends consumed or middle split, shorter intervals only',
          'Fill the table by increasing interval length',
          'Read the answer at dp[0][n−1]',
        ],
        explain: 'The 4-step recipe specialized to ranges: state, base, transition, order — plus knowing where the final answer lives (the full interval). If your transition ever references an interval of the same length or longer, the state design is wrong, not the loop.',
      },
      {
        id: 'ivl-3', type: 'mcq', diff: 2,
        prompt: 'Why do interval DPs loop `for (len = 2; len <= n; len++)` rather than just any l, r order?',
        options: [
          'Transitions only reference strictly shorter intervals, so length order guarantees every read value is already final',
          'It is the only order that visits each state once',
          'Shorter intervals are cheaper, so it’s a speed optimization',
          'It avoids integer overflow in r = l + len − 1',
        ],
        answer: 0,
        explain: 'Length order IS the dependency order — dp[l+1][r], dp[l][r−1], dp[l][k] + dp[k+1][r] are all shorter than dp[l][r]. It’s not the *only* valid order (l descending with r ascending also works), which is exactly why option B is wrong — but length order is the one that mirrors how you reason, so bugs can’t hide in it.',
      },
      {
        id: 'ivl-4', type: 'bank', diff: 2,
        prompt: 'Complete the Removal Game transition (difference convention).',
        code: `dp[l][r] = max(a[l] - ___, a[r] - ___);`,
        answer: ['dp[l + 1][r]', 'dp[l][r - 1]'],
        distractors: ['dp[l - 1][r]', 'dp[l + 1][r - 1]', 'dp[l][r]'],
        explain: 'Take a[l] → the opponent now moves on a[l+1..r] and extracts dp[l+1][r] of advantage, which subtracts from yours; symmetric on the right. dp[l+1][r−1] (both ends gone at once) describes a different game — only ONE element leaves per move. dp[l−1][r] grows the interval: moves never add elements back.',
      },
      {
        id: 'ivl-5', type: 'output', diff: 3,
        prompt: 'Removal Game on {4, 1, 2, 10}: the code computes the difference table, then prints the FIRST PLAYER’S total. Trace it. Output?',
        code: `int main() {
    vector<int> a = {4, 1, 2, 10};
    int n = 4, sum = 17;
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int l = 0; l < n; l++) dp[l][l] = a[l];
    for (int len = 2; len <= n; len++)
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            dp[l][r] = max(a[l] - dp[l + 1][r], a[r] - dp[l][r - 1]);
        }
    cout << (sum + dp[0][n - 1]) / 2 << "\\n";
}`,
        answer: '12',
        explain: 'Length 2: dp[0][1] = 3, dp[1][2] = 1, dp[2][3] = 8. Length 3: dp[0][2] = max(4 − 1, 2 − 3) = 3; dp[1][3] = max(1 − 8, 10 − 1) = 9. Length 4: dp[0][3] = max(4 − 9, 10 − 3) = 7. First player: (17 + 7) / 2 = 12 — take the 10 (not the 4!), and the difference machinery already priced in the opponent’s revenge. Greedy end-grabbing would reason one move deep; the table reasons all the way down.',
        hint: 'Fill lengths 2, then 3, then 4. dp[0][3] compares 4 − dp[1][3] against 10 − dp[0][2].',
      },
      {
        id: 'ivl-6', type: 'fill', diff: 2,
        prompt: 'Rectangle Cutting base case — an a×a piece needs no further cuts:\n`dp[a][a] = ___;`',
        answer: ['0'],
        placeholder: 'value',
        explain: 'A square is finished: zero cuts. Miss this base and every square pays for a pointless split — the whole table inflates. (And note dp[1][1] = 0 is what terminates every cutting chain, like dp[0] in the 1-D DPs.)',
      },
      {
        id: 'ivl-7', type: 'mcq', diff: 2,
        prompt: 'This Removal Game fill produces garbage. What’s wrong?',
        code: `for (int l = 0; l < n; l++)            // l ascending
    for (int r = l; r < n; r++) {
        if (l == r) { dp[l][r] = a[l]; continue; }
        dp[l][r] = max(a[l] - dp[l + 1][r], a[r] - dp[l][r - 1]);
    }`,
        options: [
          'dp[l + 1][r] is read before row l + 1 is computed — l ascending violates the dependency; loop l downward or by length',
          'dp[l][r − 1] is the uncomputed one — r must run downward',
          'The base case l == r must be a separate loop or it’s skipped',
          'max should be min: the mover minimizes the difference',
        ],
        answer: 0,
        explain: 'With l ascending, dp[l+1][r] is still zero-initialized garbage when read — answers look numeric and are quietly wrong. dp[l][r−1] is fine (same row, already done). Fix: `for (l = n−1; l >= 0; l--)` or the length loop. Evaluation-order bugs are the signature interval-DP failure: the code compiles, runs, and lies.',
        hint: 'When computing dp[0][2], has dp[1][2] been written yet?',
      },
      {
        id: 'ivl-8', type: 'parsons', diff: 2,
        prompt: 'Assemble the Removal Game table fill (length order, difference convention).',
        lines: [
          'for (int l = 0; l < n; l++) dp[l][l] = a[l];',
          'for (int len = 2; len <= n; len++) {',
          '    for (int l = 0; l + len - 1 < n; l++) {',
          '        int r = l + len - 1;',
          '        dp[l][r] = max(a[l] - dp[l + 1][r], a[r] - dp[l][r - 1]);',
          '    }',
          '}',
          'cout << (sum + dp[0][n - 1]) / 2 << "\\n";',
        ],
        distractors: [
          'for (int len = n; len >= 2; len--) {',
          '        dp[l][r] = max(a[l] + dp[l + 1][r], a[r] + dp[l][r - 1]);',
        ],
        explain: 'Base (length 1), then lengths ascending, then convert difference → score. Distractor 1 runs lengths longest-first — every read hits an unfilled shorter interval. Distractor 2 uses + instead of −: that maximizes the *combined* haul as if the opponent were your teammate; the minus sign is where "they play optimally against you" lives.',
      },
      {
        id: 'ivl-9', type: 'mcq', diff: 3,
        prompt: 'Rectangle Cutting: minimum cuts to reduce a×b to squares. Which transition is correct?',
        options: [
          'dp[a][b] = 0 if a == b, else 1 + min over horizontal splits dp[i][b] + dp[a−i][b] (1 ≤ i < a) AND vertical splits dp[a][j] + dp[a][b−j] (1 ≤ j < b)',
          'dp[a][b] = 1 + min over all splits, including when a == b',
          'dp[a][b] = 0 if a == b, else 1 + dp[a/2][b] + dp[a − a/2][b] — always cut in the middle',
          'dp[a][b] = 0 if a == b, else 1 + min over vertical splits only; horizontal follows by symmetry',
        ],
        answer: 0,
        explain: 'Try EVERY cut position in BOTH directions; each cut costs 1 and leaves two independent subrectangles. Option B cuts squares forever (no base). Option C is the greedy middle cut — provably suboptimal on shapes like 3×5. Option D drops half the moves; symmetry helps only if you also normalize dp[a][b] = dp[b][a], which that code doesn’t. "Try all cuts" is brute force made affordable *because* subanswers are shared.',
        hint: 'What should dp[2][3] do? Enumerate its 3 possible first cuts.',
      },
      {
        id: 'ivl-10', type: 'mcq', diff: 2,
        prompt: 'An interval DP has n²/2 states and an O(n) split loop per state (Zuma-style). Constraint check — pick the TRUE statement.',
        options: [
          'n = 500 → roughly 500³/2 ≈ 6·10⁷ operations: comfortably inside a typical limit; n = 5000 → ~6·10¹⁰: hopeless',
          'Both n = 500 and n = 5000 fit — it’s only O(n²) states',
          'Even n = 500 is too slow; interval DP needs n ≤ 50',
          'Time is fine at any n; memory is the only constraint',
        ],
        answer: 0,
        explain: 'States × transition: (n²/2) × n = n³/2. At n = 500 that’s ~6·10⁷ — cruising; at n = 5000, a thousand times more — dead. This is why interval problems advertise n ≤ 500: the constraint is the author whispering "O(n³) intended". Removal Game’s O(1) transition is the exception that stretches to larger n.',
      },
      {
        id: 'ivl-11', type: 'tf', diff: 2,
        statement: 'In the score-difference game DP, dp[l][r] is computed from the perspective of whichever player is about to move — so the SAME table is used for both players, and the subtraction flips sides at every level.',
        answer: true,
        explain: 'This convention is the trick’s entire power: no "whose turn" flag in the state, because the meaning is turn-relative. My value = my take − (their value on the rest). Zero-sum games with alternating optimal play almost always yield to this one-table difference formulation.',
      },
      {
        id: 'ivl-12', type: 'match', diff: 2,
        prompt: 'Match each interval problem to its transition style.',
        pairs: [
          ['Removal Game', 'consume one END; subtract opponent’s difference'],
          ['Rectangle Cutting', 'try every CUT position, both directions, +1'],
          ['Empty String', 'PAIR s[l] with an equal s[k]; multiply the split counts'],
          ['Zuma', 'delete a palindromic block; equal ends merge for free'],
        ],
        explain: 'Three transition families cover interval DP: end-consumption (games), splitting (cutting, parsing), and pairing/merging (string collapse). Classify the move the problem allows, and the transition shape follows — the dp[l][r] state and length-order loop stay identical throughout.',
      },
    ],
    problems: [
      { name: 'Rectangle Cutting', platform: 'CSES', id: '1744', url: 'https://cses.fi/problemset/task/1744', difficulty: 'med', why: 'Try-every-cut DP over (width, height) — the split transition in its purest form.' },
      { name: 'Removal Game', platform: 'CSES', id: '1097', url: 'https://cses.fi/problemset/task/1097', difficulty: 'hard', why: 'The minimax score-difference trick end to end (watch for long long).' },
      { name: 'Empty String', platform: 'CSES', id: '1080', url: 'https://cses.fi/problemset/task/1080', difficulty: 'hard', why: 'Pair the ends, split, count — interval counting with interleaving binomials.' },
      { name: 'Zuma', platform: 'Codeforces', id: '607B', rating: 1900, url: 'https://codeforces.com/problemset/problem/607/B', difficulty: 'hard', why: 'Min-steps palindrome removal: dp[l][r] with equal-ends merging, classic O(n³).' },
    ],
  },

  // ==========================================================================
  'dp-bitmask': {
    id: 'dp-bitmask',
    objectives: [
      'Encode subsets as integers and read dp[mask] as "the answer for exactly this subset"',
      'Implement dp[mask][last] with add-a-node transitions for Hamiltonian-style problems',
      'Use pair states like (min rides, min last weight) when one number can’t rank subsets (Elevator Rides)',
      'Recognize the n ≤ 20 cue and budget 2ⁿ·n vs 2ⁿ·n² before coding',
    ],
    theory: [
      {
        h: 'n ≤ 20: the constraint that says "subsets"',
        md: 'When order/grouping matters and n is tiny, the subproblem is rarely a prefix — it’s a **subset**: "I have handled exactly these items; the best way to do so is dp[mask]." A mask is just an int: bit i set ⇔ item i included, so all 2ⁿ subsets are the integers 0..2ⁿ−1 and `dp` is a plain array.\n\nRecognition cues: **n ≤ 20** (2²⁰ ≈ 10⁶ states), "visit every city", "assign all tasks", "split people into groups". Permutations (n! ≈ 2.4·10¹⁸ at n = 20) are unthinkable; subsets are a million. That gap is the whole point.',
      },
      {
        h: 'Evaluation order comes free',
        md: 'Transitions almost always **add one element**: from `mask` (without i) to `mask | (1 << i)`. Any proper submask of m has a subset of its bits, hence a strictly smaller integer value — so looping `mask` from 0 upward processes every subset before every superset. The dependency order is just `for (int mask = 0; ...)`. No topological thinking required.',
        code: `for (int mask = 0; mask < (1 << n); mask++) {
    for (int i = 0; i < n; i++) {
        if ((mask >> i) & 1) continue;     // i already in the subset
        int next = mask | (1 << i);        // add item i
        // dp[next] improves using dp[mask] — dp[mask] is final already
    }
}`,
        note: 'Membership tests read `(mask >> i) & 1`. Writing the guard backwards (skipping when i is ABSENT) makes next == mask — states feed themselves and the DP silently does nothing.',
        noteKind: 'warn',
      },
      {
        h: 'Elevator Rides: when one number can’t rank subsets',
        md: 'n ≤ 20 people, weights, an elevator of capacity x — minimum rides to move everyone. For a fixed subset, ride count alone is a bad score: two ways to seat the same subset may both use 2 rides, but the one whose **last ride is lighter** accepts the next person more often. So store both:\n\n**dp[mask] = (minimum rides, minimum weight in the last ride among those)** — a lexicographic min. Adding person i either joins the open ride or starts a new one.',
        code: `vector<pair<int,int>> dp(1 << n, {INF, INF});
dp[0] = {1, 0};                            // one empty ride open
for (int mask = 0; mask < (1 << n); mask++)
    for (int i = 0; i < n; i++) {
        if ((mask >> i) & 1) continue;
        auto [rides, wt] = dp[mask];
        if (wt + w[i] <= x) wt += w[i];    // fits in the open ride
        else { rides++; wt = w[i]; }       // start a new ride
        dp[mask | (1 << i)] = min(dp[mask | (1 << i)], make_pair(rides, wt));
    }
cout << dp[(1 << n) - 1].first << "\\n";   // all aboard`,
        note: 'Pair states with lexicographic min appear whenever "ties in the main objective differ in usefulness". Greedy seatings fail here for the usual reason: a locally fuller ride can force an extra ride later.',
      },
      {
        h: 'dp[mask][last]: subsets with an endpoint',
        md: 'Hamiltonian Flights: count routes 0 → n−1 visiting every city once. A subset alone forgets *where you are*, and the next flight depends on it — so the state is **dp[mask][u] = number of routes that visit exactly the cities in mask and currently stand at u**. Add-a-node transition along each edge u → v.\n\nSame skeleton, max flavor: Kefa and Dishes orders n ≤ 18 dishes with pair bonuses — dp[mask][last] = max satisfaction, transition adds the next dish plus bonus[last][next].',
        code: `// dp[mask][u]: routes visiting exactly mask, now standing at u
dp[1][0] = 1;                              // at city 0, only 0 visited
for (int mask = 1; mask < (1 << n); mask++)
    for (int u = 0; u < n; u++) {
        if (!((mask >> u) & 1) || !dp[mask][u]) continue;
        for (int v : adj[u])               // fly u -> v
            if (!((mask >> v) & 1))
                dp[mask | (1 << v)][v] =
                    (dp[mask | (1 << v)][v] + dp[mask][u]) % MOD;
    }
cout << dp[(1 << n) - 1][n - 1] << "\\n";`,
      },
      {
        h: 'Submask enumeration',
        md: 'Sometimes the transition isn’t "add one element" but "split off a whole group" — partition problems. You then need every submask s of m, and there’s a famous idiom for it:\n\n`for (int s = m; s; s = (s - 1) & m)` — subtracting 1 borrows through the low bits, and `& m` snaps the result back inside m: every nonempty submask, descending, no repeats. Summed over all m the total work is **3ⁿ** (each bit is in m∖s, in s, or out) — at n = 20 about 3.5·10⁹: only sometimes affordable. n ≤ 16 (4.3·10⁷) is the comfortable zone.',
        code: `for (int s = m; s; s = (s - 1) & m) {
    // s = one nonempty submask of m
    // e.g. dp[m] = min(dp[m], cost(s) + dp[m ^ s]);  // s as one group
}`,
      },
      {
        h: 'Budgets and traps',
        md: 'Plan with powers of two: dp[mask] with O(n) transitions = **2ⁿ·n** (2·10⁷ at n = 20 — easy); dp[mask][last] with O(n) transitions = **2ⁿ·n²** (4·10⁸ at n = 20 — heavy but intended when the statement says n ≤ 20). Memory: 2²⁰ ints = 4 MB; 2²⁰ × 20 ints = 80 MB — check the limit before declaring.\n\nTraps: `1 << i` is an int — past bit 30 write `1LL << i`; loop bounds `(1 << n)` need parentheses (`<<` binds looser than `<`); and dp[mask][last] should only be read when last ∈ mask — nonsense states must stay unreachable.',
        noteKind: 'danger',
        note: 'If n ≤ 20 appears in a problem about ordering or grouping, your FIRST sketch should be a bitmask state. The constraint is the hint.',
      },
    ],
    exercises: [
      {
        id: 'mask-1', type: 'output', diff: 1,
        prompt: 'mask = 22, which is 10110 in binary. What does this print?',
        code: `int main() {
    int mask = 22;                  // 10110
    for (int i = 0; i < 5; i++)
        if ((mask >> i) & 1) cout << i << " ";
    cout << "\\n";
}`,
        answer: '1 2 4',
        explain: 'Bits are read from position 0 (least significant): 10110 has bits 1, 2, 4 set — the subset {1, 2, 4}. The shift-and-mask test `(mask >> i) & 1` is the membership check you’ll write in every bitmask DP; bit 0 sits at the RIGHT end of the binary string.',
      },
      {
        id: 'mask-2', type: 'mcq', diff: 1,
        prompt: 'A route must visit all n = 18 cities, minimizing cost. Constraint reading: which approach is designed to fit?',
        options: [
          'Bitmask DP over (visited subset, current city): 2¹⁸ · 18² ≈ 8.5·10⁷ — that is what n ≤ 18 is telling you',
          'Try all orderings: 18! ≈ 6.4·10¹⁵ — fine with pruning',
          'Greedy: always fly to the nearest unvisited city',
          'dp[i][j] = best route from i to j — n² states suffice',
        ],
        answer: 0,
        explain: 'n ≤ 18-20 is the bitmask signature: subsets replace permutations, collapsing 18! orderings into 2¹⁸ states × which-city-last. Greedy nearest-neighbor is a heuristic with no guarantee, and n² states can’t remember *which* cities are already visited — the state must carry the subset.',
      },
      {
        id: 'mask-13', type: 'tf', diff: 1,
        statement: 'An int can in principle represent subsets of up to 31 items, but bitmask DP is practical only to about n ≈ 20–24, because time and memory scale with 2ⁿ.',
        answer: true,
        explain: 'The representation is cheap; the 2ⁿ table is not: 2²⁰ ≈ 10⁶ states is easy, 2²⁵ ≈ 3.4·10⁷ is the stretch zone, 2³¹ is fantasy. When n is 25–40, think meet-in-the-middle (split into halves of 2ⁿ/²); beyond that, a different idea entirely.',
      },
      {
        id: 'mask-3', type: 'fill', diff: 2,
        prompt: 'Complete the classic submask enumeration of m:\n`for (int s = m; s; s = ___) { ... }`',
        answer: ['(s - 1) & m', '(s-1)&m', '(s - 1)&m', '(s-1) & m'],
        placeholder: '(… ) & …',
        explain: '`s - 1` flips the lowest set bit to 0 and raises all bits below it; `& m` discards anything outside m. Net effect: the next smaller submask of m. The loop visits every nonempty submask exactly once and stops at 0 — and across all m the total is 3ⁿ, your budget number for partition DPs.',
      },
      {
        id: 'mask-4', type: 'mcq', diff: 2,
        prompt: 'In Hamiltonian Flights, what does dp[mask][u] MEAN?',
        options: [
          'The number of routes that visit exactly the cities in mask and currently stand at city u',
          'The number of routes that visit at least the cities in mask, ending anywhere',
          'The number of routes of length u using airports in mask',
          'The cheapest route through mask ending at u',
        ],
        answer: 0,
        explain: '"Exactly mask, standing at u" — both halves are load-bearing: *exactly* makes the add-a-node transition partition routes cleanly (no double counting), and *standing at u* is what lets an edge u → v extend the route. This is a counting problem, so option D’s min-cost meaning pairs with the wrong combiner.',
      },
      {
        id: 'mask-5', type: 'output', diff: 2,
        prompt: '3 cities, flights 0→1, 0→2, 1→2, 2→1. Routes start at city 0. Trace the dp. Output?',
        code: `int main() {
    bool adj[3][3] = {};
    adj[0][1] = adj[0][2] = adj[1][2] = adj[2][1] = true;
    long long dp[8][3] = {};
    dp[1][0] = 1;                        // at 0, visited {0}
    for (int mask = 1; mask < 8; mask++)
        for (int u = 0; u < 3; u++) {
            if (!dp[mask][u]) continue;
            for (int v = 0; v < 3; v++)
                if (!((mask >> v) & 1) && adj[u][v])
                    dp[mask | (1 << v)][v] += dp[mask][u];
        }
    cout << dp[7][1] << " " << dp[7][2] << "\\n";
}`,
        answer: '1 1',
        explain: 'mask 1 = {0}: 0→1 writes dp[3][1] = 1; 0→2 writes dp[5][2] = 1. mask 3 = {0,1}: 1→2 gives dp[7][2] = 1 (route 0,1,2). mask 5 = {0,2}: 2→1 gives dp[7][1] = 1 (route 0,2,1). Each full-mask entry remembers where its routes END — that’s the [last] dimension earning its memory.',
        hint: 'Process masks 1, 3, 5, 7 in order; only cells already nonzero can push.',
      },
      {
        id: 'mask-6', type: 'bank', diff: 2,
        prompt: 'Complete the add-a-node transition (extend routes at u by the edge u → v).',
        code: `for (int v = 0; v < n; v++) {
    if ((mask >> v) & 1) continue;       // v already visited
    if (adj[u][v])
        dp[mask | ___][v] += dp[___][u];
}`,
        answer: ['(1 << v)', 'mask'],
        distractors: ['(1 << u)', 'mask | (1 << v)', 'v'],
        explain: 'The new state adds v’s bit; the count flows from the state WITHOUT v. Reading dp[mask | (1 << v)][u] (a same-size state) or adding u’s bit (already in mask — a no-op) are the two real-world typos here, and both produce quiet nonsense rather than crashes.',
      },
      {
        id: 'mask-7', type: 'mcq', diff: 2,
        prompt: 'Elevator Rides stores dp[mask] = (min rides, min weight of the last ride). Why isn’t min rides alone enough?',
        options: [
          'Two seatings of the same subset can tie on rides but differ in last-ride weight — the lighter open ride accepts the next person more often, so the tiebreak changes future answers',
          'Ride counts overflow int, weights don’t',
          'The weight is needed only to print the answer',
          'It’s an optimization: one value would still be correct, just slower',
        ],
        answer: 0,
        explain: 'With rides alone, the DP can’t tell which 2-ride seating to keep, and keeping the wrong one (heavier open ride) loses optimal futures — wrong answers, not slowness. Lexicographic (rides, lastWeight) keeps exactly the dominant representative. When one number can’t rank states for the *future*, enrich the value, not the state space.',
        hint: 'Same subset, same ride count — what could still differ that the next person cares about?',
      },
      {
        id: 'mask-8', type: 'mcq', diff: 3,
        prompt: 'This Elevator Rides loop runs and outputs nonsense. Where’s the bug?',
        code: `for (int mask = 0; mask < (1 << n); mask++)
    for (int i = 0; i < n; i++) {
        if (!((mask >> i) & 1)) continue;     // line A
        auto [rides, wt] = dp[mask];
        if (wt + w[i] <= x) wt += w[i];
        else { rides++; wt = w[i]; }
        dp[mask | (1 << i)] = min(dp[mask | (1 << i)], make_pair(rides, wt));   // line B
    }`,
        options: [
          'Line A — the guard is inverted: it keeps only i already IN mask, so mask | (1 << i) == mask and every state just updates itself',
          'Line B — min should be max since rides accumulate',
          'The mask loop must run downward like 0/1 knapsack',
          'Line B — make_pair is invalid inside min',
        ],
        answer: 0,
        explain: 'To ADD person i, i must be absent: the guard should skip when the bit IS set. As written, the "new" state equals the old one — dp never propagates and the full mask keeps its INF init. Inverted membership guards are the signature bitmask typo; when a bitmask DP outputs its initialization values, check the guards first. (And no, masks loop UPWARD — subsets before supersets.)',
        hint: 'With the guard as written, what is mask | (1 << i)?',
      },
      {
        id: 'mask-9', type: 'tf', diff: 2,
        statement: 'Iterating masks in increasing integer order processes every subset before any of its supersets, so add-one-element transitions always read finished states.',
        answer: true,
        explain: 'A proper submask keeps a subset of the bits, so its integer value is strictly smaller — ascending order IS a topological order of the subset lattice. This is why bitmask DP needs no explicit ordering logic: the for-loop over ints does it. (Remove-an-element transitions would want the reverse direction — always check which way yours point.)',
      },
      {
        id: 'mask-10', type: 'mcq', diff: 3,
        prompt: 'Hamiltonian Flights: n ≤ 20 cities. Budget the standard dp[mask][last]. Which statement is right?',
        options: [
          '2²⁰ · 20 states with O(n) outgoing work ≈ 4·10⁸ cheap updates — heavy but intended at n = 20; n = 25 would multiply states by 32 and die',
          '2²⁰ states total, so about 10⁶ operations regardless of the [last] dimension',
          'It is O(n!) — the mask only reorders the permutations',
          'O(2ⁿ + n²) — the terms add, not multiply',
        ],
        answer: 0,
        explain: 'States = 2ⁿ·n ≈ 2·10⁷; each tries up to n extensions → 2ⁿ·n² ≈ 4·10⁸ simple adds, which fits when the inner loop is tight (and the memory, 2²⁰·20 ints = 80 MB, needs a glance at the limit). Budgets multiply: states × transition. The n ≤ 20 in the statement is the author certifying exactly this arithmetic.',
        hint: 'Count states first (2ⁿ · n), then multiply by the work per state.',
      },
      {
        id: 'mask-11', type: 'match', diff: 2,
        prompt: 'Match each tool to what it’s for.',
        pairs: [
          ['dp[mask]', 'best way to handle exactly this subset'],
          ['dp[mask][last]', 'subset handled + where the sequence currently ends'],
          ['for (int s = m; s; s = (s - 1) & m)', 'enumerate every nonempty submask of m'],
          ['__builtin_popcount(mask)', 'how many items the subset contains'],
        ],
        explain: 'The bitmask DP toolbox: plain subset states (Elevator Rides), subset + endpoint (Hamiltonian Flights, Kefa and Dishes), submask loops for partition transitions, popcount for "how many so far" (e.g., whose turn it is, or k-th position bonuses).',
      },
      {
        id: 'mask-12', type: 'parsons', diff: 3,
        prompt: 'Assemble the Elevator Rides update (dp[mask] = (rides, last-ride weight), capacity x).',
        lines: [
          'for (int mask = 0; mask < (1 << n); mask++) {',
          '    for (int i = 0; i < n; i++) {',
          '        if ((mask >> i) & 1) continue;     // i already aboard',
          '        auto [rides, wt] = dp[mask];',
          '        if (wt + w[i] <= x) wt += w[i];    // join the open ride',
          '        else { rides++; wt = w[i]; }       // open a new ride',
          '        dp[mask | (1 << i)] = min(dp[mask | (1 << i)], make_pair(rides, wt));',
          '    }',
          '}',
        ],
        distractors: [
          '        dp[mask] = min(dp[mask], make_pair(rides, wt));',
        ],
        explain: 'Skip people already aboard, unpack the best (rides, weight) for the current subset, seat person i (extend or open a ride), then lexicographic-min into the superset state. The distractor writes the result back into dp[mask] itself — the subset never grows, the full mask never fills, and the answer stays INF.',
        hint: 'The update must move from mask to a strictly LARGER mask.',
      },
    ],
    problems: [
      { name: 'Kefa and Dishes', platform: 'Codeforces', id: '580D', rating: 1800, url: 'https://codeforces.com/problemset/problem/580/D', difficulty: 'hard', why: 'dp[mask][last] with pairwise bonuses — the max-flavor Hamiltonian skeleton at n ≤ 18.' },
      { name: 'Elevator Rides', platform: 'CSES', id: '1653', url: 'https://cses.fi/problemset/task/1653', difficulty: 'hard', why: 'The pair-state classic: (min rides, min last weight) with lexicographic min.' },
      { name: 'Hamiltonian Flights', platform: 'CSES', id: '1690', url: 'https://cses.fi/problemset/task/1690', difficulty: 'hard', why: 'Count Hamiltonian routes with dp[mask][last] — mind the mod and the 2²⁰·20 table.' },
    ],
  },
};

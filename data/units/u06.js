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

  // __MORE_SKILLS__
};

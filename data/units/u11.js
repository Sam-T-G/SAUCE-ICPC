// ============================================================================
// data/units/u11.js — Unit 11: Math II & Geometry
// Probability & EV, game theory (Nim/Grundy), integer geometry, hull & sweep.
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'probability': {
    id: 'probability',
    objectives: [
      'Compute probabilities as favorable/total and multiply independent events',
      'Flip "at least one" questions with the complement trick',
      'Use linearity of expectation with indicator variables — dependence be damned',
      'Build probability DPs with weighted transitions and print clean decimals',
    ],
    theory: [
      {
        h: 'Probability is counting (at first)',
        md: 'When every outcome is equally likely, **P(event) = favorable / total**. One die: P(roll ≥ 5) = 2/6. For **independent** events — outcomes that tell you nothing about each other — joint probability is a product: P(A and B) = P(A)·P(B). Dice, coin flips, robots wandering on their own schedules: multiply away.\n\nRecognition cue: the statement says *uniformly at random* or *independently* — that licenses counting and multiplying.',
        note: 'In C++, `1 / 2 == 0`. The moment probabilities enter the code, write `1.0 / 2` — integer division is the single most common probability bug.',
        noteKind: 'warn',
      },
      {
        h: 'At least one = 1 − none (the complement trick)',
        md: '"At least one", "any", "some" are miserable to compute directly — the ways overlap. Flip it: **P(at least one) = 1 − P(none)**, and for independent events P(none) is a clean product.\n\nThis is the skeleton of **Moving Robots**: a cell is empty iff *every* robot is elsewhere, so P(cell empty) = Π (1 − pᵢ), where pᵢ = P(robot i stands there), each pᵢ coming from its own little DP.',
        code: `// P(no event fires), events independent
double none = 1.0;
for (double p : probs) none *= (1.0 - p);   // all miss
double atLeastOne = 1.0 - none;             // complement`,
      },
      {
        h: 'Expected value, and the linearity superpower',
        md: '**E[X] = Σ value · probability** — the long-run average. One die: (1+2+⋯+6)/6 = 3.5 (never an actual roll; EV is an average, not a prediction).\n\nThe superpower: **E[X + Y] = E[X] + E[Y], always — even when X and Y are dependent.** No independence required, no fine print. Problems whose events look hopelessly entangled often fall instantly to this one identity.',
        note: 'Dependence breaks PRODUCT rules (E[XY] ≠ E[X]E[Y] in general). It never breaks the sum.',
      },
      {
        h: 'Indicator variables: E[count] = Σ P(each)',
        md: 'To compute an expected **count**, define an indicator Xᵢ = 1 if thing i happens, else 0. Then E[Xᵢ] = P(thing i happens), and linearity gives\n\n**E[# things] = Σᵢ P(thingᵢ happens)**\n\nWorked example: hand n hats back to n people in a random order. P(person i gets their own hat) = 1/n, so E[# correct hats] = n · (1/n) = **1** — for every n! The events are wildly dependent (if n−1 hats are right, so is the last) and linearity simply does not care.',
      },
      {
        h: 'The max trick: work with ≤, not =',
        md: 'The maximum of n independent draws is ≤ k iff **every** draw is ≤ k — an AND, hence a product. For n rolls of an m-sided die:\n\n`P(max ≤ k) = (k/m)ⁿ`\n\nConvert back to exact values by differencing: **P(max = k) = P(max ≤ k) − P(max ≤ k−1)**, then E[max] = Σ k · P(max = k). That is the entire solution to *Little Pony and Expected Maximum*. General lesson: cumulative events (≤ k) are often easy products; exact events come from differences.',
        code: `double ev = 0.0;
for (int k = 1; k <= m; k++) {
    double pk = pow((double)k / m, n)        // P(max <= k)
              - pow((double)(k - 1) / m, n); // - P(max <= k-1)
    ev += k * pk;                            // value x probability
}`,
      },
      {
        h: 'Probability DP + printing the answer',
        md: 'When the randomness unfolds in steps, run a DP where **dp[state] = probability of being in that state**; every transition multiplies by its probability, and incoming mass adds up. *Dice Probability*: dp[s] after one more roll gathers dp[s−d]/6 over faces d. Cost: states × transitions.\n\nOutput: judges accept answers within an error like 10⁻⁶ — print with `cout << fixed << setprecision(6)`, or the default format will helpfully emit `1e-05` and get you a WA.',
        code: `vector<double> dp(n + 1, 0.0);
dp[0] = 1.0;                            // start: sum 0, certainty
for (int t = 0; t < k; t++) {           // k rolls
    vector<double> ndp(n + 1, 0.0);
    for (int s = 0; s <= n; s++)
        for (int d = 1; d <= 6; d++)
            if (s + d <= n)
                ndp[s + d] += dp[s] / 6.0;   // weighted transition
    dp = ndp;
}
cout << fixed << setprecision(6) << dp[n] << "\\n";`,
      },
    ],
    exercises: [
      {
        id: 'prob-1', type: 'mcq', diff: 1,
        prompt: 'You roll two fair dice, independently. P(both show a six)?',
        options: ['1/36', '1/3', '11/36', '1/6'],
        answer: 0,
        explain: 'Independent events multiply: (1/6)·(1/6) = 1/36. Adding the chances (1/3) is for mutually exclusive events — "both happen" is the opposite of exclusive. And 11/36 is P(at least one six) = 1 − (5/6)², a different question.',
      },
      {
        id: 'prob-2', type: 'output', diff: 1,
        prompt: 'Probability code, classic first bug. What does this print?',
        code: `int main() {
    cout << fixed << setprecision(3);
    double p = 1 / 4;
    double q = 1.0 / 4;
    cout << p << " " << q << "\\n";
}`,
        answer: '0.000 0.250',
        explain: '`1 / 4` is computed in INTEGER arithmetic — 0 — and only then stored as the double 0.0. `1.0 / 4` divides as doubles: 0.25. Any probability you type as a fraction needs a `.0` somewhere.',
      },
      {
        id: 'prob-3', type: 'fill', diff: 1,
        prompt: 'One fair six-sided die. E[value shown] = ? (as a decimal)',
        answer: ['3.5', '3.50', '7/2'],
        placeholder: 'a number',
        explain: '(1+2+3+4+5+6)/6 = 21/6 = 3.5. Note 3.5 is not a possible roll — expected value is a long-run average, not a forecast of any single outcome.',
      },
      {
        id: 'prob-4', type: 'fill', diff: 1,
        prompt: 'You flip two fair coins. E[number of heads] = ?',
        answer: ['1', '1.0'],
        placeholder: 'a number',
        explain: 'Indicators + linearity: each coin contributes P(heads) = 1/2, so E = 1/2 + 1/2 = 1. The brute-force check agrees: 0·¼ + 1·½ + 2·¼ = 1. For counts, always try indicators before case analysis.',
      },
      {
        id: 'prob-5', type: 'mcq', diff: 2,
        prompt: 'Three independent shots each hit with probability 1/2. P(at least one hit)?',
        options: ['7/8', '3/2', '1/8', '1/2'],
        answer: 0,
        explain: '"At least one" → complement: P(no hits) = (1/2)³ = 1/8, so 1 − 1/8 = 7/8. Adding ½+½+½ = 3/2 exceeds 1 — the moment a "probability" passes 1, you know the events overlap and you need the complement (or inclusion–exclusion).',
      },
      {
        id: 'prob-6', type: 'output', diff: 2,
        prompt: 'A two-coin probability DP — dp[h] = probability of h heads so far. What does it print?',
        code: `int main() {
    cout << fixed << setprecision(2);
    vector<double> dp = {1.0};            // 0 tosses: surely 0 heads
    for (int toss = 0; toss < 2; toss++) {
        vector<double> ndp(dp.size() + 1, 0.0);
        for (int h = 0; h < (int)dp.size(); h++) {
            ndp[h]     += dp[h] * 0.5;    // tails
            ndp[h + 1] += dp[h] * 0.5;    // heads
        }
        dp = ndp;
    }
    cout << dp[1] << "\\n";
}`,
        answer: '0.50',
        explain: 'After one toss dp = {0.5, 0.5}; after two, dp = {0.25, 0.50, 0.25}. dp[1] — exactly one head — is 0.50. Every probability DP is this picture: push each state’s mass through weighted transitions.',
      },
      {
        id: 'prob-7', type: 'tf', diff: 2,
        statement: 'Linearity of expectation, E[X+Y] = E[X] + E[Y], only holds when X and Y are independent.',
        answer: false,
        explain: 'Linearity holds **unconditionally** — that is precisely why it is a superpower. Dependence breaks product identities like E[XY] = E[X]E[Y], never the sum. When a problem’s events look tangled, linearity is the first tool to reach for.',
      },
      {
        id: 'prob-8', type: 'mcq', diff: 2,
        prompt: 'A uniform random bit string of length n. You want E[# adjacent equal pairs] (positions i with s[i] = s[i+1]). The right setup?',
        options: [
          'Σ over the n−1 adjacent positions of P(s[i] = s[i+1]) — giving (n−1)/2',
          'Enumerate all 2ⁿ strings and average their pair counts',
          'First model the dependence between overlapping pairs, then sum',
          '(n−1) · P(all pairs are equal) = (n−1)/2ⁿ⁻¹',
        ],
        answer: 0,
        explain: 'One indicator per adjacent position: P(s[i] = s[i+1]) = 1/2 whatever the neighbors do. Overlapping pairs ARE dependent — and linearity does not care. E[count] = Σ P(eventᵢ) turns an exponential enumeration into one line.',
      },
      {
        id: 'prob-9', type: 'fill', diff: 2,
        prompt: 'n independent draws; let F(k) = P(max ≤ k). Express the exact probability using F:\nP(max = k) = ___',
        answer: ['F(k) - F(k-1)', 'F(k)-F(k-1)'],
        placeholder: 'F(…) …',
        explain: '"Exactly k" = "≤ k" minus "≤ k−1". Cumulative probabilities are the easy ones (max ≤ k is a product over draws); exact values fall out by differencing. This one line is the entire Expected Maximum trick.',
      },
      {
        id: 'prob-10', type: 'bank', diff: 2,
        prompt: 'Dice Probability DP: dp[s] = probability the sum of rolls so far equals s. Complete it.',
        code: `vector<double> dp(n + 1, 0.0);
dp[___] = 1.0;                      // before any roll
for (int t = 0; t < k; t++) {       // k rolls
    vector<double> ndp(n + 1, 0.0);
    for (int s = 0; s <= n; s++)
        for (int d = 1; d <= 6; d++)
            if (s + d <= n)
                ndp[s + d] += dp[s] * ___;
    dp = ndp;
}`,
        answer: ['0', '1.0 / 6'],
        distractors: ['1', '1 / 6'],
        explain: 'Start with sum 0 at probability 1, then each face d moves mass dp[s] → ndp[s+d] weighted by 1.0/6. The distractor `1 / 6` is integer division — zero — and the whole DP silently prints 0.000000. A rite of passage. (O(k·n·6) — trivial for CSES limits.)',
      },
      {
        id: 'prob-11', type: 'match', diff: 2,
        prompt: 'Match each probability situation to its weapon.',
        pairs: [
          ['P(at least one event)', '1 − P(none)'],
          ['expected count of successes', 'sum of indicator probabilities'],
          ['P(max of n draws = k)', 'P(max ≤ k) − P(max ≤ k−1)'],
          ['P(A and B), independent', 'P(A) · P(B)'],
          ['distribution of a running total', 'DP with weighted transitions'],
        ],
        explain: 'Five patterns cover most contest probability: complement for "at least one", indicators + linearity for expected counts, cumulative differences for maxima, products for independent joints, and DP when the randomness unfolds in steps.',
      },
      {
        id: 'prob-12', type: 'mcq', diff: 3,
        prompt: 'k robots walk around independently; you have computed pᵢ = P(robot i ends on cell c) for each robot. P(cell c ends up empty)?',
        options: [
          '(1−p₁)(1−p₂)⋯(1−pₖ)',
          '1 − p₁p₂⋯pₖ',
          '1 − (p₁ + p₂ + ⋯ + pₖ)',
          'max(0, 1 − Σpᵢ)',
        ],
        answer: 0,
        explain: 'Empty means EVERY robot is elsewhere — an AND of independent events, so the complements multiply. `1 − Πpᵢ` is "not all robots here"; `1 − Σpᵢ` double-subtracts overlaps and can even go negative. Moving Robots then finishes with linearity: E[# empty cells] = Σ over cells of this product.',
        hint: 'Empty = robot 1 elsewhere AND robot 2 elsewhere AND … — independent ANDs multiply.',
      },
      {
        id: 'prob-13', type: 'code', diff: 3,
        prompt: 'Expected maximum: a fair m-sided die is rolled n times. Print E[maximum value shown] with exactly 6 decimals.\nInput: `m n`. Use P(max ≤ k) = (k/m)ⁿ.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    // E[max] = sum over k of k * P(max = k)
    //        = sum over k of k * (P(max <= k) - P(max <= k-1))

    return 0;
}`,
        tests: [
          { input: '6 1', expected: '3.500000' },
          { input: '2 2', expected: '1.750000' },
          { input: '1 5', expected: '1.000000' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    double ev = 0.0;
    for (int k = 1; k <= m; k++) {
        // P(max = k) = P(max <= k) - P(max <= k-1)
        double pk = pow((double)k / m, n) - pow((double)(k - 1) / m, n);
        ev += k * pk;                       // value x probability
    }
    cout << fixed << setprecision(6) << ev << "\\n";
    return 0;
}`,
        explain: 'P(max ≤ k) = (k/m)ⁿ because every roll must be ≤ k; difference for P(= k), then Σ k·P. This is Codeforces 453A verbatim — note the cast `(double)k / m` (integer k/m would be 0 for all k < m) and that the O(m) loop is instant even at m = 10⁵, while enumerating mⁿ outcomes was never on the table.',
        hint: 'P(max ≤ k) is a product over all n rolls. Then P(= k) = P(≤ k) − P(≤ k−1).',
      },
    ],
    problems: [
      { name: 'Dice Probability', platform: 'CSES', id: '1725', url: 'https://cses.fi/problemset/task/1725', difficulty: 'med', why: 'The canonical probability DP: weighted 1/6 transitions, answer printed to 6 decimals.' },
      { name: 'Candy Lottery', platform: 'CSES', id: '1727', url: 'https://cses.fi/problemset/task/1727', difficulty: 'med', why: 'Expected maximum of uniform ints — P(max ≤ k) as a product, then difference.' },
      { name: 'Little Pony and Expected Maximum', platform: 'Codeforces', id: '453A', rating: 1600, url: 'https://codeforces.com/problemset/problem/453/A', difficulty: 'med', why: 'The P(max ≤ k)ⁿ trick verbatim, dressed as a pony rolling a die.' },
      { name: 'Moving Robots', platform: 'CSES', id: '1726', url: 'https://cses.fi/problemset/task/1726', difficulty: 'hard', why: 'Per-robot DP + complement product per cell + linearity over cells — three lesson ideas stacked.' },
    ],
  },

  // ==========================================================================
  'game-theory': {
    id: 'game-theory',
    objectives: [
      'Classify positions as winning/losing by backward induction',
      'Apply the Nim XOR rule and explain why it works',
      'Spot twists (misère, ordered piles) that invalidate memorized formulas',
      'Compute Grundy numbers with mex and combine independent games via XOR',
    ],
    theory: [
      {
        h: 'Two players, perfect play: W and L positions',
        md: 'A combinatorial game: positions, moves, players alternate, and under **normal play** whoever cannot move loses. Label every position **W** (player to move wins) or **L** (player to move loses):\n\n• **W** if SOME move leads to an L position — hand your opponent a loss.\n• **L** if there are no moves, or ALL moves lead to W positions — every exit gifts the win away.\n\nThe asymmetry (SOME vs ALL) is the whole theory. "Both players play optimally" in a statement is your cue: stop simulating, start labeling.',
      },
      {
        h: 'Backward induction: build the table',
        md: 'Labels grow from the terminal states upward. Stones game, moves = take 1 or 3:\n\nn: 0 1 2 3 4 5 6 → **L W L W L W L**\n\nn=0: no move, L. n=1: reach 0 (L) → W. n=2: can only reach 1 (W) → L. Here both moves are odd, so every move flips parity — even n is losing. CSES *Stick Game* is exactly this table for an arbitrary move set.',
        code: `vector<char> win(n + 1, 0);              // win[0] = 0 (L)
for (int x = 1; x <= n; x++)
    for (int m : moves)
        if (m <= x && !win[x - m])           // found a losing child
            win[x] = 1;                      // -> x is winning`,
        note: 'O(n · |moves|) — comfortable even at n = 10⁶. Dropping the `!` is THE classic bug: it would mark x winning for handing your opponent a win.',
        noteKind: 'warn',
      },
      {
        h: 'Nim: XOR decides everything',
        md: 'Nim: piles of stones, a move removes any positive number from ONE pile, last stone wins. Theorem: **the player to move wins iff the XOR of the pile sizes is ≠ 0.**\n\nProof intuition, both directions: from a zero-XOR position, any move changes exactly one pile, so the XOR turns nonzero — zero-XOR positions cannot reach zero-XOR. From XOR = x ≠ 0, pick a pile p whose top bit matches x’s top bit; shrinking it to p⊕x (< p) restores XOR 0. The winner pins the loser to zero-XOR forever, down to the empty board.',
        code: `ll x = 0;
for (ll p : piles) x ^= p;                   // pile XOR ("nim-sum")
cout << (x != 0 ? "first" : "second") << "\\n";`,
      },
      {
        h: 'Misère Nim: the all-ones flip',
        md: 'Misère play = taking the last stone **loses** (CSES *Nim Game II*). The surprise: while any pile has ≥ 2 stones, the strategy — and the XOR verdict — is **identical to normal Nim**; the winner simply ends the game by leaving an odd number of 1-piles instead of zero.\n\nThe rule changes only when ALL piles equal 1: moves are forced and parity decides — first player wins iff the number of piles is **even**.\n\nFull rule: some pile ≥ 2 → first wins iff XOR ≠ 0; all piles = 1 → first wins iff the count is even.',
      },
      {
        h: 'Grundy numbers: every game is secretly Nim',
        md: 'Upgrade W/L to a number: **g(state) = mex{ g(next) : next reachable in one move }**, where mex = the smallest non-negative integer missing from the set. Then g = 0 ⇔ losing position. The payoff (Sprague–Grundy theorem): a position made of **independent subgames** has grundy = **XOR of the subgame grundies** — so any collection of impartial games plays like Nim with pile sizes g.\n\nSubtraction game with moves {1, 2}: g(n) = n mod 3. Three independent copies with grundies 1, 2, 3? XOR = 0 → losing.',
        code: `int mex(const set<int>& s) {
    int g = 0;
    while (s.count(g)) g++;     // smallest value not present
    return g;
}`,
      },
      {
        h: 'Twists: read the move rules twice',
        md: 'Game problems love micro-twists that nuke memorized formulas. *Sequential Nim* (CF 1382B): you must take from the **leftmost** nonempty pile — XOR becomes irrelevant! The player who first acts on a pile of size ≥ 2 controls the game (take it all, or leave exactly 1 — they choose who moves next). So only the count of **leading 1-piles** matters: all piles 1 → parity of n; otherwise first player wins iff the number of leading 1s is even.\n\nChecklist before reaching for XOR: free pile choice? last stone wins or loses? subgames truly independent?',
        note: 'Grundy table looks chaotic? Print the first ~100 values and hunt for a period — many take-away games are eventually periodic.',
      },
    ],
    exercises: [
      {
        id: 'game-1', type: 'mcq', diff: 1,
        prompt: 'Normal play (no move available = you lose). A position is **losing** for the player to move exactly when:',
        options: [
          'every available move leads to a winning position — or there are no moves at all',
          'some move leads to a winning position',
          'it has an odd number of stones',
          'every move leads to a losing position',
        ],
        answer: 0,
        explain: 'L means trapped: whatever you do, the opponent receives a W. The definitions are deliberately asymmetric — ONE escape to an L makes you W, but L demands ALL exits be bad (or none exist). Mixing up ALL and SOME breaks every table you will ever build.',
      },
      {
        id: 'game-2', type: 'output', diff: 2,
        prompt: 'Stones with moves {1, 2}. Trace the table builder — what does it print?',
        code: `int main() {
    vector<int> win(7, 0);
    for (int x = 1; x <= 6; x++)
        for (int m : {1, 2})
            if (m <= x && !win[x - m]) win[x] = 1;
    for (int x = 0; x <= 6; x++) cout << (win[x] ? 'W' : 'L');
}`,
        answer: 'LWWLWWL',
        explain: 'n=0 is L; 1 and 2 reach 0 → W; 3 reaches only 1 and 2 (both W) → L. The pattern L W W repeats: with moves {1,2}, multiples of 3 are losing. Seven cells of backward induction prove a theorem.',
      },
      {
        id: 'game-3', type: 'fill', diff: 2,
        prompt: 'Now moves are {1, 3}. Hand-build the W/L table for n = 0..6 and type the seven labels in order, formatted like the {1,2} answer `L W W L W W L`.',
        answer: ['L W L W L W L', 'LWLWLWL'],
        placeholder: 'L/W × 7',
        explain: 'n=0 L; 1 → 0(L) so W; 2 → only 1(W) so L; 3 → 0 or 2, both L, so W; and it repeats. Both moves are odd, so every move flips parity: even = L, odd = W. Tables often reveal a closed form — but the table comes first.',
      },
      {
        id: 'game-4', type: 'fill', diff: 1,
        prompt: 'Nim piles (3, 5, 6). Compute the nim-sum: 3 ⊕ 5 ⊕ 6 = ?',
        answer: ['0'],
        placeholder: 'a number',
        explain: 'In binary: 011 ⊕ 101 = 110, then 110 ⊕ 110 = 000. XOR = 0 means the player to move is losing — the **second** player wins (3,5,6). Drill pile-XOR until it is reflex.',
      },
      {
        id: 'game-5', type: 'mcq', diff: 2,
        prompt: 'Nim, piles (4, 7), you move. Best play?',
        options: [
          'Take 3 from the pile of 7 — leaving (4, 4) with XOR 0, a losing position for your opponent',
          'Take the whole pile of 7 — maximum pressure',
          'You cannot win: 4 + 7 = 11 is odd',
          'Take 1 from the pile of 4 to keep options open',
        ],
        answer: 0,
        explain: '4 ⊕ 7 = 3 ≠ 0, so you win — but only by restoring XOR = 0: shrink 7 to 7⊕3 = 4. Taking the whole 7-pile leaves (4), and your opponent grabs all 4 stones for the win. Stone-total parity is a red herring in Nim; only the XOR speaks.',
      },
      {
        id: 'game-6', type: 'mcq', diff: 2,
        prompt: 'The heart of the Nim proof: why can the winner keep the loser stuck on XOR = 0 forever?',
        options: [
          'A move changes exactly one pile, so from XOR 0 every move makes it nonzero — and from nonzero XOR there is always a move back to 0',
          'XOR 0 means all piles are equal, and equal piles can be mirrored',
          'XOR 0 means the total number of stones is even',
          'From XOR 0 the second player can repeat the first player’s move on another pile',
        ],
        answer: 0,
        explain: 'Changing one pile changes its bits, so the overall XOR cannot stay 0 (zero-XOR can’t reach zero-XOR). Conversely, if XOR = x ≠ 0, the pile holding x’s top bit can shrink to p⊕x, restoring 0. Mirroring (options 2 and 4) only works in the special case of two equal piles.',
      },
      {
        id: 'game-7', type: 'tf', diff: 2,
        statement: 'In misère Nim (taking the last stone LOSES), the normal XOR rule still names the winner as long as at least one pile has ≥ 2 stones.',
        answer: true,
        explain: 'The misère twist only bites in the all-ones endgame: the winner plays normal Nim and, at the end, leaves an ODD number of 1-piles instead of zero. Only when every pile is exactly 1 does the verdict flip to pure parity (first wins iff the count is even). That is Nim Game II in one sentence.',
      },
      {
        id: 'game-8', type: 'mcq', diff: 2,
        prompt: 'Misère Nim (last stone loses), piles (1, 1, 1). Who wins?',
        options: [
          'Second player — all moves are forced, and the first player is stuck taking the fatal third stone',
          'First player — XOR = 1 ⊕ 1 ⊕ 1 = 1 ≠ 0',
          'First player — take two piles at once',
          'Second player — the XOR is 0',
        ],
        answer: 0,
        explain: 'All piles are 1, so every move is forced: stones go P1, P2, P1 — and the first player takes the last stone, losing. Blindly applying XOR ≠ 0 (option 2) is exactly the trap: in the all-ones case first wins iff the pile COUNT is even, and 3 is odd. (Option 3 is illegal; option 4 miscomputes — the XOR is 1.)',
      },
      {
        id: 'game-9', type: 'fill', diff: 2,
        prompt: 'mex (minimum excludant) = the smallest non-negative integer NOT in the set. mex{0, 1, 3} = ?',
        answer: ['2'],
        placeholder: 'a number',
        explain: '0 and 1 are present, 2 is missing — mex = 2 (the 3 is irrelevant once a smaller hole exists). Also worth caching: mex{} = 0, and mex{1, 2, 3} = 0 — a state whose every move has nonzero grundy is itself grundy 0, i.e. losing.',
      },
      {
        id: 'game-10', type: 'mcq', diff: 3,
        prompt: 'A position consists of three INDEPENDENT subgames with Grundy numbers 1, 2, 3. The player to move…',
        options: [
          'loses — 1 ⊕ 2 ⊕ 3 = 0, and grundy 0 means losing',
          'wins — every subgame has nonzero grundy',
          'wins — the grundy total 1 + 2 + 3 = 6 is positive',
          'unknown — grundy numbers cannot be combined across games',
        ],
        answer: 0,
        explain: 'Sprague–Grundy: independent games combine by XOR, exactly like Nim piles of sizes 1, 2, 3 — and 1 ⊕ 2 ⊕ 3 = 0. Nonzero grundies in every part mean nothing; only the XOR of the whole speaks. Adding them (option 3) is the classic mix-up.',
        hint: 'Treat the grundies as Nim piles (1, 2, 3). What is their XOR?',
      },
      {
        id: 'game-11', type: 'mcq', diff: 3,
        prompt: 'Sequential Nim: you must take stones (any positive number) from the **leftmost** nonempty pile. Piles in order: (1, 2). Who wins?',
        options: [
          'Second player — P1 is forced to empty the 1-pile; P2 then takes the whole 2-pile and the last stone',
          'First player — 1 ⊕ 2 = 3 ≠ 0, so the XOR rule says first',
          'First player — take from the 2-pile and leave (1, 1)',
          'Second player — the stone total 3 is odd, and odd totals always lose',
        ],
        answer: 0,
        explain: 'The XOR rule requires FREE pile choice — the ordered-pile constraint kills it (option 3 is simply illegal). Count leading 1-piles: one here (odd), so the opponent gets first crack at the big pile and takes control. Option 4 lands on "second" by luck — its parity "rule" already fails on piles (1, 3). CF 1382B in miniature.',
        hint: 'P1 has exactly one legal first move. Play the game out by hand.',
      },
      {
        id: 'game-12', type: 'parsons', diff: 2,
        prompt: 'Assemble the W/L table builder for a stones game with move set `moves` (the Stick Game core).',
        lines: [
          'vector<char> win(n + 1, 0);',
          'for (int x = 1; x <= n; x++) {',
          '    for (int m : moves) {',
          '        if (m <= x && !win[x - m]) {',
          '            win[x] = 1;',
          '            break;',
          '        }',
          '    }',
          '}',
        ],
        distractors: [
          '        if (m <= x && win[x - m]) {',
        ],
        explain: 'x is winning iff SOME legal move m lands on a losing state — that is `!win[x - m]`. The distractor (no `!`) declares x winning for moving to a WIN, i.e. for gifting your opponent the good square. O(n·|moves|) handles the CSES limit n = 10⁶ easily.',
      },
      {
        id: 'game-13', type: 'bank', diff: 2,
        prompt: 'Grundy numbers of a subtraction game, straight from the definition. Complete it.',
        code: `int g[N];                       // g[0] = 0
for (int x = 1; x < N; x++) {
    set<int> s;
    for (int m : moves)
        if (m <= x) s.insert(___[x - m]);
    int v = 0;
    while (s.count(v)) ___;     // mex: smallest value not reached
    g[x] = v;
}`,
        answer: ['g', 'v++'],
        distractors: ['win', 'v--'],
        explain: 'Collect the grundies of all reachable states, then mex = count up from 0 to the first hole. Inserting `win[...]` (bare W/L bits) throws away information — grundy values above 1 are exactly what let independent games combine by XOR.',
      },
    ],
    problems: [
      { name: 'Stick Game', platform: 'CSES', id: '1729', url: 'https://cses.fi/problemset/task/1729', difficulty: 'easy', why: 'Backward induction verbatim: W/L table for an arbitrary move set, n up to 10⁶.' },
      { name: 'Nim Game I', platform: 'CSES', id: '1730', url: 'https://cses.fi/problemset/task/1730', difficulty: 'easy', why: 'XOR the piles, print the winner — make the rule muscle memory.' },
      { name: 'Sequential Nim', platform: 'Codeforces', id: '1382B', rating: 1100, url: 'https://codeforces.com/problemset/problem/1382/B', difficulty: 'easy', why: 'Ordered piles break the XOR rule — count leading 1-piles and argue control.' },
      { name: 'Nim Game II', platform: 'CSES', id: '1098', url: 'https://cses.fi/problemset/task/1098', difficulty: 'med', why: 'Misère Nim: normal XOR until all piles are 1, then parity flips.' },
    ],
  },

  // ==========================================================================
  'geometry': {
    id: 'geometry',
    objectives: [
      'Compute cross products in long long and read the sign as turn direction',
      'Decide segment intersection with the full casework (proper + touching)',
      'Compute polygon area with the shoelace formula, staying in integers',
      'Test point-in-polygon by ray casting with exact boundary handling',
    ],
    theory: [
      {
        h: 'Integer geometry: stay exact',
        md: 'Contest geometry at this level is **integer geometry**: points are `long long` pairs and every test — turn direction, on-segment, inside-polygon — is exact integer arithmetic. Doubles carry ~10⁻¹⁶ relative fuzz that flips signs *near zero*, which is precisely where the interesting answers live (collinear! touching!).\n\nRule: if the input is integers and the answer is discrete (LEFT/RIGHT, YES/NO, 2×area), using doubles is a self-inflicted wound. No sqrt, no division — compare squared lengths and cross products instead.',
        code: `using ll = long long;
struct P { ll x, y; };          // the entire "library" so far`,
      },
      {
        h: 'Cross product: the turn detector',
        md: 'For points a, b, c, take the cross product of vectors a→b and a→c:\n\n`cross(a,b,c) = (b.x−a.x)·(c.y−a.y) − (b.y−a.y)·(c.x−a.x)`\n\nThe **sign** is the geometry: **> 0** → c is LEFT of the directed line a→b (path a→b→c turns counter-clockwise); **< 0** → RIGHT (clockwise); **= 0** → collinear (TOUCH). Bonus: |cross| = 2 × the area of triangle abc. This one function powers orientation tests, intersection, area, and hulls.',
        code: `ll cross(P a, P b, P c) {                 // (b-a) x (c-a)
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
// > 0: LEFT    < 0: RIGHT    == 0: TOUCH (collinear)`,
        note: 'Budget your 64 bits: |x|, |y| ≤ 10⁹ → differences up to 2·10⁹ → each product up to 4·10¹⁸, and the subtraction can reach ~8·10¹⁸. long long tops out at ~9.2·10¹⁸ — it fits, **barely**, with zero headroom for one more multiplication. `int` is instant overflow.',
        noteKind: 'danger',
      },
      {
        h: 'Segment intersection: the full casework',
        md: 'Segments ab and cd intersect iff **(1) proper crossing**: c and d lie strictly on opposite sides of line ab AND a, b lie strictly on opposite sides of line cd — both straddle tests must pass — **or (2) touching**: some endpoint lies on the other segment. The four `onSeg` checks sweep up every degenerate layout: shared endpoints, T-shapes, collinear overlap.',
        code: `bool onSeg(P p, P a, P b) {               // p exactly on segment ab?
    return cross(a, b, p) == 0            // on the line...
        && min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x)
        && min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);  // ...and in the box
}
int sgn(ll v) { return (v > 0) - (v < 0); }

bool segInter(P a, P b, P c, P d) {
    int d1 = sgn(cross(a, b, c)), d2 = sgn(cross(a, b, d));
    int d3 = sgn(cross(c, d, a)), d4 = sgn(cross(c, d, b));
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;   // proper crossing
    return onSeg(c, a, b) || onSeg(d, a, b)        // touching and
        || onSeg(a, c, d) || onSeg(b, c, d);       // collinear cases
}`,
        note: 'Never multiply two RAW cross products to compare signs — each can be ~8·10¹⁸ and the product needs ~127 bits. Reduce to sgn() first: products of −1/0/1 are safe.',
        noteKind: 'danger',
      },
      {
        h: 'Shoelace: polygon area from crosses',
        md: 'Simple polygon with vertices p₀…pₙ₋₁ in boundary order (either direction):\n\n`2·area = | Σᵢ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ) |`, indices mod n.\n\nEach term is a cross product with the origin — signed slices that cancel outside the polygon. The doubled value is always an **integer**, which is why CSES *Polygon Area* asks for exactly 2×area: nobody has to touch a double. Free extra: the sign of the raw sum before |·| is positive iff the vertices are listed counter-clockwise — an orientation test you get for nothing.',
        code: `ll area2 = 0;
for (int i = 0; i < n; i++) {
    int j = (i + 1) % n;                  // wrap: last edge closes the loop
    area2 += p[i].x * p[j].y - p[j].x * p[i].y;
}
cout << llabs(area2) << "\\n";            // 2 x area, exact integer`,
      },
      {
        h: 'Point in polygon: ray casting',
        md: 'Shoot a ray from the query point q (say towards +x) and count boundary crossings: **odd = inside, even = outside**. Two traps own this algorithm:\n\n1. **Boundary first.** If q lies on any edge (onSeg), answer BOUNDARY before counting anything — a boundary point’s parity is meaningless.\n2. **Vertices on the ray** would be counted by both incident edges. Fix: the half-open rule — count an edge only when exactly one endpoint is strictly above the ray line, `(a.y > q.y) != (b.y > q.y)`. Pass-throughs then flip parity once, grazes flip 0 or 2 times, and horizontal edges drop out automatically.',
        code: `bool in = false;                          // after the BOUNDARY pass
for (int i = 0; i < n; i++) {
    P a = poly[i], b = poly[(i + 1) % n];
    if ((a.y > q.y) != (b.y > q.y)) {     // edge truly spans the ray line
        ll c = cross(a, b, q);
        if (b.y > a.y ? c > 0 : c < 0)    // crossing lies right of q
            in = !in;
    }
}`,
      },
      {
        h: 'The geometry pre-flight checklist',
        md: '• Everything `long long`; reach for cross products before any division or sqrt — most tests need neither.\n• Compare SIGNS via sgn(), never products of raw crosses.\n• Degenerate inputs are the real test set: collinear triples, shared endpoints, vertical segments, the query point ON the boundary, duplicate points.\n• Polygon loops wrap with `(i + 1) % n` — forgetting the closing edge is a silent classic.\n• Constraints whisper: coords ≤ 10⁹ → diffs 2·10⁹ → crosses near 10¹⁸ — budget the 64 bits before you code.',
        note: 'Write cross(), sgn(), onSeg() once, verify them on paper triples, reuse forever. Geometry rewards a tiny battle-tested library more than any other topic.',
      },
    ],
    exercises: [
      {
        id: 'geo-1', type: 'mcq', diff: 1,
        prompt: '`cross(a, b, c) = (b−a) × (c−a)` comes out **positive**. What do you know?',
        options: [
          'c lies to the left of the directed line a→b — the path a→b→c turns counter-clockwise',
          'c lies to the right of the directed line a→b',
          'c is above b in y-coordinate',
          'the triangle abc is degenerate',
        ],
        answer: 0,
        explain: 'Positive cross = left turn / counter-clockwise; negative = right; zero = collinear. Burn in the phrasing "left of the directed line a→b" — it makes point location, hull popping, and intersection tests instant reads.',
      },
      {
        id: 'geo-2', type: 'output', diff: 1,
        prompt: 'Orientation of c against the line a→b, with a=(0,0), b=(2,0), c=(2,3). What does this print?',
        code: `long long cross(long long ax, long long ay, long long bx, long long by) {
    return ax * by - ay * bx;
}
int main() {
    // vectors a->b = (2,0) and a->c = (2,3)
    cout << cross(2, 0, 2, 3) << "\\n";
}`,
        answer: '6',
        explain: '2·3 − 0·2 = 6 > 0: c is left of a→b — a counter-clockwise turn (CSES would print LEFT). The magnitude 6 is simultaneously 2× the triangle’s area. One number, two facts.',
      },
      {
        id: 'geo-3', type: 'fill', diff: 1,
        prompt: 'Point Location by hand: a=(0,0), b=(4,0), c=(1,−2). Relative to the directed line a→b, is c `LEFT`, `RIGHT`, or `TOUCH`? (Compute cross = (b−a)×(c−a).)',
        answer: ['RIGHT'],
        placeholder: 'LEFT / RIGHT / TOUCH',
        explain: 'cross = 4·(−2) − 0·1 = −8 < 0 → RIGHT. Sanity check without algebra: a→b points east, and c sits below the x-axis — south of an eastbound line is its right-hand side.',
      },
      {
        id: 'geo-4', type: 'mcq', diff: 2,
        prompt: 'Constraints: |x|, |y| ≤ 10⁹ and you compute `(b.x−a.x)*(c.y−a.y) − (b.y−a.y)*(c.x−a.x)`. Which type story is correct?',
        options: [
          'long long: differences reach 2·10⁹, each product 4·10¹⁸, the difference ~8·10¹⁸ — under the 9.2·10¹⁸ limit with almost no headroom',
          'int is enough — every coordinate fits in int',
          'even long long overflows — __int128 is mandatory here',
          'double is safer — it never overflows',
        ],
        answer: 0,
        explain: 'Coordinates fit int, but the cross computes on DIFFERENCES (2·10⁹ — already past int) and PRODUCTS (4·10¹⁸ each, difference up to ~8·10¹⁸). long long holds it — barely. Doubles don’t overflow but carry ~16 significant digits: they round exact 10¹⁸-scale values and flip signs near zero. One more multiplication, though, and you DO need __int128.',
      },
      {
        id: 'geo-5', type: 'tf', diff: 2,
        statement: 'If c and d lie on opposite sides of line ab (their cross signs differ), then segments ab and cd must intersect.',
        answer: false,
        explain: 'That is only HALF the straddle test: it proves segment cd crosses the infinite LINE through ab — possibly far beyond the segment part. You also need a and b on opposite sides of line cd. Both tests passing = proper crossing; the touching/collinear cases still need onSeg on top.',
      },
      {
        id: 'geo-6', type: 'bank', diff: 2,
        prompt: 'Complete `onSeg` — the touch detector used by intersection, boundary, and collinear cases.',
        code: `bool onSeg(P p, P a, P b) {        // p exactly on segment ab?
    return cross(a, b, p) == ___
        && min(a.x, b.x) <= p.x && p.x <= ___(a.x, b.x)
        && min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}`,
        answer: ['0', 'max'],
        distractors: ['1', 'min'],
        explain: 'On the segment = on the LINE (cross exactly 0 — integers make "exactly" meaningful) AND inside the bounding box of a and b. Both the x-range and y-range checks are required: the x-check alone silently fails on vertical segments.',
      },
      {
        id: 'geo-7', type: 'output', diff: 2,
        prompt: 'Shoelace on a triangle. What does this print?',
        code: `int main() {
    long long x[3] = {0, 4, 0}, y[3] = {0, 0, 3};
    long long s = 0;
    for (int i = 0; i < 3; i++) {
        int j = (i + 1) % 3;
        s += x[i] * y[j] - x[j] * y[i];
    }
    cout << abs(s) << "\\n";
}`,
        answer: '12',
        explain: 'Terms: 0·0−4·0 = 0, then 4·3−0·0 = 12, then 0·0−0·3 = 0 → sum 12. That is 2× the area of the right triangle with legs 4 and 3 (area 6). Printing 2A keeps everything integer — exactly what CSES Polygon Area asks for.',
      },
      {
        id: 'geo-8', type: 'fill', diff: 2,
        prompt: 'Hand-shoelace: triangle (0,0), (5,0), (0,4). What is **2 × area** (the integer a judge would ask for)?',
        answer: ['20'],
        placeholder: 'an integer',
        explain: 'Right triangle, legs 5 and 4: area 10, so 2·area = 20. Via the formula: (0·0−5·0) + (5·4−0·0) + (0·0−0·4) = 20. A negative raw sum just means the vertices were clockwise — take the absolute value.',
      },
      {
        id: 'geo-9', type: 'mcq', diff: 2,
        prompt: 'Spot the bug in this "proper crossing" test (coordinates up to 10⁹):',
        code: `ll d1 = cross(a, b, c), d2 = cross(a, b, d);
ll d3 = cross(c, d, a), d4 = cross(c, d, b);
if (d1 * d2 < 0 && d3 * d4 < 0) return true;`,
        options: [
          'd1 * d2 multiplies two ~8·10¹⁸ values — silent overflow; reduce each cross to sgn() (−1/0/1) before multiplying',
          'The comparisons should be <= 0 to include touching endpoints',
          'd3 and d4 should also use cross(a, b, …)',
          'No bug — long long holds any product of two crosses',
        ],
        answer: 0,
        explain: 'Each cross can reach ~8·10¹⁸; their product needs ~127 bits, and the wraparound is sign-random garbage. Fix: `sgn(d1) * sgn(d2) < 0`. Option 2 is a different trap: `<= 0` fires when an endpoint is merely collinear with the LINE, even far outside the segment — touching is onSeg’s job, not this test’s.',
      },
      {
        id: 'geo-10', type: 'multi', diff: 2,
        prompt: 'Which layouts does the STRICT straddle test (both cross-sign pairs strictly opposite) miss, making the onSeg cases mandatory? Select all that apply.',
        options: [
          'Segments sharing exactly one endpoint',
          'An endpoint of one segment in the middle of the other (T-shape)',
          'Collinear segments overlapping along a stretch',
          'Parallel segments that never touch',
          'A clean X crossing in general position',
        ],
        answers: [0, 1, 2],
        explain: 'Every contact that involves a zero cross product — shared endpoint, T-touch, collinear overlap — fails the strict test; that is precisely why the four onSeg checks exist. Parallel-apart (correctly no) and the clean X (correctly yes) are already handled.',
      },
      {
        id: 'geo-11', type: 'order', diff: 2,
        prompt: 'Order the steps of a correct point-in-polygon query (CSES Point in Polygon).',
        items: [
          'Check every edge with onSeg — if the point lies on one, answer BOUNDARY and stop',
          'Cast a ray from the point and walk the edges again',
          'Count an edge only when exactly one endpoint is strictly above the ray line',
          'Odd crossing count → INSIDE, even → OUTSIDE',
        ],
        explain: 'Boundary must be settled FIRST — a boundary point’s crossing parity is arbitrary. Then the half-open counting rule kills the vertex-on-ray double count, and parity delivers the verdict.',
      },
      {
        id: 'geo-12', type: 'mcq', diff: 3,
        prompt: 'Your ray casting counts an edge when `min(a.y,b.y) <= q.y && q.y <= max(a.y,b.y)` (plus a side test). On polygons where the ray passes exactly through a vertex, answers are wrong. Why?',
        options: [
          'The vertex lies on BOTH incident edges, so one geometric pass-through is counted twice — parity flips twice and cancels',
          'A ray through a vertex of a simple polygon is geometrically impossible',
          'The y comparisons need an epsilon to be exact',
          'Horizontal edges must be counted twice to compensate',
        ],
        answer: 0,
        explain: 'Inclusive y-ranges assign a ray-vertex to both incident edges: a true crossing flips parity twice = not at all. The half-open rule `(a.y > q.y) != (b.y > q.y)` gives each vertex to one side only — pass-throughs flip once, grazes flip 0 or 2 times. Epsilon-nudging (option 3) trades exact integer geometry for luck.',
        hint: 'How many edges contain that vertex? So how many times does the parity flip?',
      },
      {
        id: 'geo-13', type: 'code', diff: 3,
        prompt: 'Point Location Test (the CSES 2189 core): read six integers `x1 y1 x2 y2 x3 y3` — a line through p1→p2 and a query point p3. Print `LEFT`, `RIGHT`, or `TOUCH`. Coordinates up to 10⁹ in absolute value.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ll x1, y1, x2, y2, x3, y3;
    cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;
    // sign of (p2 - p1) x (p3 - p1) decides

    return 0;
}`,
        tests: [
          { input: '0 0 4 0 2 3', expected: 'LEFT' },
          { input: '0 0 2 2 4 4', expected: 'TOUCH' },
          { input: '-1000000000 -1000000000 1000000000 1000000000 1000000000 -1000000000', expected: 'RIGHT' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ll x1, y1, x2, y2, x3, y3;
    cin >> x1 >> y1 >> x2 >> y2 >> x3 >> y3;
    ll c = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);  // fits ll, barely
    if (c > 0) cout << "LEFT\\n";
    else if (c < 0) cout << "RIGHT\\n";
    else cout << "TOUCH\\n";
    return 0;
}`,
        explain: 'Pure sign-of-cross, no division, no doubles. Test 3 is the assassin: differences hit 2·10⁹ and the cross is −4·10¹⁸ — int dies instantly and double rounding can flip near-zero cases. The real CSES task is exactly this inside a loop over t queries.',
        hint: 'One cross product and three ifs. Where does the overflow danger hide?',
      },
    ],
    problems: [
      { name: 'Point Location Test', platform: 'CSES', id: '2189', url: 'https://cses.fi/problemset/task/2189', difficulty: 'easy', why: 'One cross-product sign per query — and a long long discipline check.' },
      { name: 'Polygon Area', platform: 'CSES', id: '2191', url: 'https://cses.fi/problemset/task/2191', difficulty: 'easy', why: 'Shoelace with 2×area output: integer-exact geometry, zero doubles.' },
      { name: 'Line Segment Intersection', platform: 'CSES', id: '2190', url: 'https://cses.fi/problemset/task/2190', difficulty: 'med', why: 'The full casework: proper straddle plus four onSeg touches, degenerate tests galore.' },
      { name: 'Point in Polygon', platform: 'CSES', id: '2192', url: 'https://cses.fi/problemset/task/2192', difficulty: 'hard', why: 'Ray casting with the half-open vertex rule — and BOUNDARY before anything else.' },
    ],
  },

  // ==========================================================================
  'convex-hull': {
    id: 'convex-hull',
    objectives: [
      'Implement Andrew’s monotone chain and justify its pop condition',
      'Handle degenerate hull inputs: collinear points, duplicates, tiny n',
      'Recognize sweep line problems and design event ordering with correct tie-breaks',
    ],
    theory: [
      {
        h: 'What a hull is, and when you want one',
        md: 'The **convex hull** is the smallest convex polygon containing every point — stretch a rubber band around the nails and let it snap. Recognition cues: "smallest fence/enclosure", "farthest pair of points" (both endpoints are hull vertices), or optimizing any linear function over a point set (the optimum always sits on the hull).\n\nThe output is usually the hull vertices in boundary order, and everything downstream (perimeter, diameter, rotating calipers) assumes that order is correct.',
      },
      {
        h: 'Andrew’s monotone chain',
        md: 'Sort points by x, ties by y. Sweep left→right building the **lower hull**: push each point, and while the last three points make a non-counter-clockwise turn, pop the middle one. Sweep right→left identically for the **upper hull**. Concatenate, dropping each chain’s duplicated endpoint.\n\nCost: the sort is **O(n log n)**; the chain building is **O(n)** amortized, because each point is pushed once and popped at most once per chain. The sort owns the complexity.',
        code: `sort(p.begin(), p.end());                // by (x, then y)
vector<P> h;                             // lower hull
for (P q : p) {
    while (h.size() >= 2 && cross(h[h.size()-2], h.back(), q) <= 0)
        h.pop_back();                    // pop non-CCW turns
    h.push_back(q);
}
// upper hull: same loop over the points in reverse,
// then join the chains minus their duplicated endpoints -> CCW hull`,
      },
      {
        h: 'The pop condition is a design decision',
        md: 'Popping on `cross <= 0` ejects collinear middle points → a **strict** hull: corners only, nothing on edge interiors. Popping on `cross < 0` keeps collinear boundary points. Neither is universally right — **the problem statement decides** which boundary points it wants printed.\n\nDegenerates to test before submitting: n = 1 or 2 (the loops must not crash), ALL points collinear (the strict hull collapses to the two extremes), and duplicate points (sort + dedupe first — duplicated points masquerade as collinear triples and corrupt invariants).',
        note: 'Symptom map: hull has extra points on straight edges → you popped with `<`; hull lost required boundary points → you popped with `<=`. Re-read the statement, flip one character.',
        noteKind: 'warn',
      },
      {
        h: 'Sweep line: sort events, keep an active structure',
        md: 'The hull’s sibling paradigm. Convert the input into **events** sorted along one axis; sweep through them, maintaining a small *active structure* — a counter, a multiset, a tree — that describes "what is alive right now". Max simultaneous guests (*Restaurant Customers*): arrival = +1 event, departure = −1 event, sort, running sum, record the peak.\n\nThe sweep turns a global question ("when do intervals overlap most?") into a local counter update — O(n log n), all of it in the sort.',
        code: `vector<pair<int,int>> ev;                // (time, delta)
for (auto [a, b] : guests) {
    ev.push_back({a, +1});               // walks in
    ev.push_back({b, -1});               // walks out
}
sort(ev.begin(), ev.end());
int cur = 0, best = 0;
for (auto [t, d] : ev) {
    cur += d;                            // active-set size
    best = max(best, cur);               // record the peak
}`,
      },
      {
        h: 'Tie-breaking at equal coordinates',
        md: 'Two events at the SAME coordinate: which goes first? Pure semantics — and a classic, well-hidden bug.\n\n• Closed intervals (a guest leaving at t and one arriving at t are both present): process **+1 before −1**, so the counter peaks correctly.\n• Half-open intervals (the seat frees exactly at t): process **−1 before +1**.\n\nBeware the default: sorting (t, delta) pairs puts (t, −1) before (t, +1) — silently the half-open convention. *Restaurant Customers* guarantees distinct times, so it forgives you; most problems are not so kind. Decide the order consciously and encode it in the sort key.',
        note: 'Symptom of a wrong tie-break: answers off by exactly one, only on tests with coinciding times. Check ties before doubting the whole algorithm.',
        noteKind: 'warn',
      },
    ],
    exercises: [
      {
        id: 'hull-1', type: 'mcq', diff: 1,
        prompt: 'What exactly is the convex hull of a point set?',
        options: [
          'The smallest convex polygon that contains every point of the set',
          'The polygon visiting all the points in sorted order',
          'The largest-area triangle formed by any three points',
          'The axis-aligned bounding box of the points',
        ],
        answer: 0,
        explain: 'Rubber band around the nails: it snaps onto the outermost points and everything else lies inside. Both words carry weight — *smallest* (no slack) and *convex* (no dents). The bounding box is convex but rarely smallest.',
      },
      {
        id: 'hull-2', type: 'output', diff: 1,
        prompt: 'A +1/−1 sweep over sorted (time, delta) events. Output?',
        code: `int main() {
    vector<pair<int,int>> e = {{1,1},{2,1},{3,-1},{4,1},{5,-1},{6,-1}};
    int cur = 0, best = 0;
    for (auto [t, d] : e) {
        cur += d;
        best = max(best, cur);
    }
    cout << best << "\\n";
}`,
        answer: '2',
        explain: 'The counter walks 1, 2, 1, 2, 1, 0 — the peak is 2 (hit twice). One pass over sorted events answers "max simultaneous": this is Restaurant Customers in six events.',
      },
      {
        id: 'hull-3', type: 'mcq', diff: 2,
        prompt: 'The problem demands the strict hull — **no collinear points on hull edges**. Spot the bug.',
        code: `for (P q : p) {
    while (h.size() >= 2 && cross(h[h.size()-2], h.back(), q) < 0)
        h.pop_back();
    h.push_back(q);
}`,
        options: [
          'cross == 0 never pops, so collinear points survive on the edges — a strict hull must pop with <= 0',
          '<= 0 would delete valid corner points, so < 0 is correct',
          'The while should be an if — popping once is enough',
          'h.size() >= 2 should be h.size() >= 3',
        ],
        answer: 0,
        explain: 'cross == 0 means the stack-top point sits exactly on the segment between its neighbors. `< 0` keeps it; `<= 0` pops it. Neither is universally wrong — but for a strict hull, collinear must go. Flip side: when a judge wants ALL boundary points, `<= 0` becomes the bug. Statement first, comparison second.',
      },
      {
        id: 'hull-4', type: 'order', diff: 2,
        prompt: 'Put Andrew’s monotone chain in order.',
        items: [
          'Sort the points by x, breaking ties by y (dedupe while you’re there)',
          'Sweep left to right, popping while the last turn is not CCW — the lower hull',
          'Sweep right to left with the same pop rule — the upper hull',
          'Join the chains, dropping each one’s duplicated endpoint',
        ],
        explain: 'One sort, two mirrored stack sweeps, a stitch. Each point enters and leaves each chain at most once, so the sweeps are O(n) — the O(n log n) sort owns the total.',
      },
      {
        id: 'hull-5', type: 'fill', diff: 2,
        prompt: 'Total time complexity of monotone chain on n points (the standard answer):',
        answer: ['O(n log n)', 'O(nlogn)', 'n log n', 'nlogn'],
        placeholder: 'O(…)',
        explain: 'The sort costs O(n log n); the chain building is amortized O(n) — every point is pushed once and popped at most once per chain. Corollary worth keeping: if the points arrive already sorted, hull construction is genuinely linear.',
      },
      {
        id: 'hull-6', type: 'tf', diff: 2,
        statement: 'If every input point lies on one line, the strict monotone chain (popping on cross <= 0) returns exactly the two extreme points.',
        answer: true,
        explain: 'Every middle point is collinear, so it gets popped — the "hull" degenerates to a segment. Make sure downstream code survives a 2-point hull (and n = 1, and all-duplicates). Degenerate inputs are where hull submissions go to die.',
      },
      {
        id: 'hull-7', type: 'mcq', diff: 2,
        prompt: 'Closed-interval guests: someone leaving at time t and someone arriving at t are BOTH present at t. You build (time, ±1) events, sort, sweep. Correct tie handling?',
        options: [
          'At equal time process +1 before −1 (e.g. sort by (t, −delta)) so the overlap at t is counted',
          'At equal time process −1 before +1 — what the default pair sort already does',
          'Tie order cannot change the maximum',
          'Drop one of the two tied events',
        ],
        answer: 0,
        explain: 'Both guests are present at t, so the counter must rise before it falls. The default pair sort puts (t, −1) ahead of (t, +1) — silently the OPPOSITE (half-open) convention, off by exactly one on tied tests (option 3 is the bug speaking). Tie-break order is part of the algorithm, not a detail.',
      },
      {
        id: 'hull-8', type: 'bank', diff: 2,
        prompt: 'Complete the lower-hull sweep (strict hull).',
        code: `sort(p.begin(), p.end());
vector<P> h;
for (P q : p) {
    while (h.size() >= 2 && cross(h[h.size()-2], h.back(), q) ___ 0)
        h.___();
    h.push_back(q);
}`,
        answer: ['<=', 'pop_back'],
        distractors: ['<', 'push_back'],
        explain: 'Pop while the turn at the stack top is clockwise OR collinear (`<= 0`): that ejects wrong turns and on-edge points alike. `<` is the keep-collinear variant — fine only when the statement wants every boundary point. Pushing instead of popping would just grow the stack forever.',
      },
      {
        id: 'hull-9', type: 'output', diff: 3,
        prompt: 'Trace the lower-hull build — which points survive?',
        code: `struct P { long long x, y; };
long long cross(P a, P b, P c) {
    return (b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x);
}
int main() {
    vector<P> p = {{0,0},{1,1},{2,0},{3,2}};   // already sorted by x
    vector<P> h;
    for (P q : p) {
        while (h.size() >= 2 && cross(h[h.size()-2], h.back(), q) <= 0)
            h.pop_back();
        h.push_back(q);
    }
    for (P a : h) cout << "(" << a.x << "," << a.y << ")";
}`,
        answer: '(0,0)(2,0)(3,2)',
        explain: 'Push (0,0), push (1,1). When (2,0) arrives: cross((0,0),(1,1),(2,0)) = 1·0 − 1·2 = −2 ≤ 0 → pop (1,1), push (2,0). When (3,2) arrives: cross((0,0),(2,0),(3,2)) = 4 > 0 → keep, push. (1,1) floats ABOVE the segment (0,0)–(2,0), so it cannot be on the LOWER hull — the pop is the algorithm working.',
        hint: 'Compute cross((0,0),(1,1),(2,0)) at the moment q = (2,0) arrives.',
      },
      {
        id: 'hull-10', type: 'mcq', diff: 3,
        prompt: 'n = 2·10⁵ points, coordinates up to 10⁹. Which hull plan survives, and why?',
        options: [
          'Monotone chain: O(n log n) sort + amortized O(n) chains — with long long cross products',
          'Gift wrapping: O(nh) is effectively O(n) in practice',
          'Test every point against all triangles: O(n³) but simple to code',
          'Sort points by angle around (0,0) and connect them in that order',
        ],
        answer: 0,
        explain: 'n log n ≈ 2·10⁵ · 18 ≈ 4·10⁶ — instant. Gift wrapping is O(n·h) and h can be n (points on a circle) → 4·10¹⁰, dead. O(n³) is 8·10¹⁵ — heat death. Angular sort around an arbitrary point yields a star-shaped tour of ALL points, not the hull. Constraints picked the algorithm before you wrote a line.',
        hint: 'What is h, the hull size, in the worst case?',
      },
      {
        id: 'hull-11', type: 'parsons', diff: 3,
        prompt: 'Assemble Restaurant Customers: the maximum number of guests present at once (all times distinct).',
        lines: [
          'vector<pair<int,int>> ev;',
          'for (int i = 0; i < n; i++) {',
          '    ev.push_back({arr[i], +1});',
          '    ev.push_back({dep[i], -1});',
          '}',
          'sort(ev.begin(), ev.end());',
          'int cur = 0, best = 0;',
          'for (auto [t, d] : ev)',
          '    best = max(best, cur += d);',
          'cout << best << "\\n";',
        ],
        distractors: [
          '    ev.push_back({dep[i], +1});',
        ],
        explain: 'Each guest is one +1 and one −1 event; the running sum of the sorted events IS the crowd size over time. The distractor makes departures +1 — the counter never falls and the "answer" becomes n. (Times are distinct here; with ties you would choose the delta order consciously.)',
      },
      {
        id: 'hull-12', type: 'match', diff: 2,
        prompt: 'Match each sweep ingredient to its role.',
        pairs: [
          ['guest arrival', '+1 event'],
          ['guest departure', '−1 event'],
          ['sort key', 'event time (mind the ties)'],
          ['running counter', 'guests currently inside'],
          ['answer', 'maximum the counter ever reaches'],
        ],
        explain: 'Sweep anatomy: events sorted along an axis, a tiny active structure (here a single int), and an answer harvested during the pass. Swap the counter for a multiset or a BIT and the same skeleton lifts far heavier problems.',
      },
    ],
    problems: [
      { name: 'Restaurant Customers', platform: 'CSES', id: '1619', url: 'https://cses.fi/problemset/task/1619', difficulty: 'easy', why: 'The canonical +1/−1 event sweep — max concurrent intervals in one sorted pass.' },
      { name: 'Convex Hull', platform: 'CSES', id: '2195', url: 'https://cses.fi/problemset/task/2195', difficulty: 'med', why: 'Monotone chain for real: 2·10⁵ points with collinear and duplicate traps included.' },
    ],
  },
};

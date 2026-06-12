// ============================================================================
// data/units/u02.js — Unit 2: STL & Complexity
// The toolbox (sort, set, map, stack, queue, heap, binary-search helpers)
// and the clock it runs against (Big-O, the 10⁸ rule, constraint forensics).
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'big-o': {
    id: 'big-o',
    objectives: [
      'Estimate operation counts and compare them against the ~10⁸ ops/second budget',
      'Rank the standard complexity classes and count nested/doubling loops',
      'Infer the intended complexity from the constraints before writing any code',
      'Spot hidden costs (flushes, copies, string rebuilds) that TLE correct algorithms',
    ],
    theory: [
      {
        h: 'The clock you’re racing',
        md: 'A judge gives you 1–2 seconds. Contest C++ executes roughly **10⁸ simple operations per second** (comparisons, additions, array reads). So before writing a single line, estimate: *how many operations will my idea perform in the worst case?* Around 10⁸ or below → can pass. 10¹⁰ → dead, and no compiler flag will resurrect it.',
        note: 'Estimate-first is the highest-leverage habit in this unit: it kills doomed approaches before you spend 40 minutes coding them.',
      },
      {
        h: 'Big-O: growth, not nanoseconds',
        md: 'Big-O describes how work **scales** as n grows; constants are dropped (O(2n) = O(n)). The ladder, slowest-growing to fastest-growing — know it cold:\n\nO(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)\n\nAt n = 10⁵: n log n ≈ 1.7·10⁶ operations (comfortable), n² = 10¹⁰ (about 100 seconds — dead). Log factors are nearly free; an extra factor of n is usually fatal.',
      },
      {
        h: 'Reading constraints like the setter',
        md: 'Constraints are a coded message about the intended solution:\n\nn ≤ 20 → O(2ⁿ) brute force / bitmask. n ≤ 500 → O(n³). n ≤ 5000 → O(n²). n ≤ 2·10⁵ → O(n log n) or O(n). n (or k) up to 10⁹ → O(n) won’t even fit — you need O(log) or O(1) math.\n\nSee `n ≤ 2·10⁵`? The setter is whispering *sort, set, or one clever pass* — and promising that your n² loop will not survive.',
        note: 'Constraints whisper. n ≤ 20 screams “try all 2ⁿ subsets”. Read them before reading the story.',
      },
      {
        h: 'Counting loops',
        md: 'Nested **independent** loops multiply. A **dependent** bound (`j = i + 1`) halves the count — the constant drops, the O() doesn’t. A loop variable that **doubles** runs O(log n) times: log₂(10⁶) ≈ 20, log₂(10¹⁸) ≈ 60. Sequential, non-nested loops merely add: O(n + m).',
        code: `for (int i = 0; i < n; i++)          // runs n times
    for (int j = 0; j < n; j++)      // × n           → O(n²)
        ops++;

for (int i = 0; i < n; i++)          // dependent bound:
    for (int j = i + 1; j < n; j++)  // n(n−1)/2 pairs → still O(n²)
        ops++;

for (ll i = 1; i <= n; i *= 2)       // doubling       → O(log n)
    ops++;`,
      },
      {
        h: 'Hidden costs: when correct code still TLEs',
        md: 'Your algorithm’s O() is only part of the bill. Three classics smuggle an extra O(n) — or a brutal constant — into innocent-looking lines:',
        code: `cout << x << endl;            // flushes EVERY line → use "\\n"
void f(vector<int> v) { ... } // by value: copies n elements per CALL
                              // → use const vector<int>&
s = s + c;                    // rebuilds the whole string: O(n) per
                              // append → use s += c`,
        note: 'When a *correct* solution TLEs, audit these before rewriting the algorithm: output flushing, container copies, string building.',
        noteKind: 'warn',
      },
    ],
    exercises: [
      {
        id: 'bigo-1', type: 'output', diff: 1,
        prompt: 'Count with the program. What does it print?',
        code: `int main() {
    int cnt = 0;
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 4; j++)
            cnt++;
    cout << cnt << "\\n";
}`,
        answer: '12',
        explain: 'Independent nested loops multiply: 3 × 4 = 12 executions of the body. Replace 3 and 4 with n and you get the n² shape that dominates this unit.',
      },
      {
        id: 'bigo-2', type: 'output', diff: 2,
        prompt: 'Dependent bounds now. What does it print?',
        code: `int main() {
    int cnt = 0;
    for (int i = 0; i < 5; i++)
        for (int j = i + 1; j < 5; j++)
            cnt++;
    cout << cnt << "\\n";
}`,
        answer: '10',
        explain: 'The inner loop runs 4+3+2+1+0 = 10 times — that’s n(n−1)/2, all unordered pairs of 5 elements. Half the work of n², but still O(n²): the constant changed, the growth didn’t.',
      },
      {
        id: 'bigo-3', type: 'mcq', diff: 1,
        prompt: 'How many times does the body run for n = 1024?',
        code: `for (int i = 1; i < n; i *= 2) {
    // body
}`,
        options: ['10', '1024', '512', '11'],
        answer: 0,
        explain: 'i takes 1, 2, 4, …, 512 — ten values; at 1024 the condition `i < n` fails. Doubling loops run O(log n) times: that “10 for a thousand, 20 for a million” feel is worth memorizing.',
      },
      {
        id: 'bigo-4', type: 'order', diff: 1,
        prompt: 'Order these complexities from **slowest-growing (fastest algorithm)** to fastest-growing.',
        items: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)'],
        explain: 'The canonical ladder. Everything up to O(n log n) handles n = 2·10⁵ easily; O(n²) caps out near n = 5000; O(2ⁿ) needs n ≤ ~20; O(n!) dies past n = 11.',
      },
      {
        id: 'bigo-5', type: 'mcq', diff: 2,
        prompt: 'Time limit 1 second, `n ≤ 2·10⁵`. Which complexity is the setter inviting?',
        options: [
          'O(n log n) — about 3.6·10⁶ operations, comfortable',
          'O(n²) — 4·10¹⁰ operations fit in one second',
          'O(2ⁿ) — n is small enough to enumerate subsets',
          'O(n³) — cube it, the constant is tiny',
        ],
        answer: 0,
        explain: 'Against the ~10⁸ ops/s budget: n log n ≈ 2·10⁵ × 18 ≈ 3.6·10⁶ — easy. n² = 4·10¹⁰ is ~400 seconds. n ≤ 2·10⁵ is the signature of sort / set / single-pass solutions.',
      },
      {
        id: 'bigo-6', type: 'match', diff: 2,
        prompt: 'Match each constraint to the complexity the setter intends.',
        pairs: [
          ['n ≤ 20', 'O(2ⁿ)'],
          ['n ≤ 500', 'O(n³)'],
          ['n ≤ 5000', 'O(n²)'],
          ['n ≤ 2·10⁵', 'O(n log n)'],
          ['n ≤ 10⁸', 'O(n)'],
        ],
        explain: 'The decoder ring: 2²⁰ ≈ 10⁶, 500³ ≈ 1.25·10⁸, 5000² = 2.5·10⁷, 2·10⁵·log ≈ 3.6·10⁶, 10⁸ linear — each lands near the 10⁸ budget. Setters pick constraints to admit exactly the intended class.',
      },
      {
        id: 'bigo-7', type: 'mcq', diff: 2,
        prompt: 'Your algorithm performs ~n² simple operations with n = 10⁵. The limit is 1 second (~10⁸ ops). What happens?',
        options: [
          'TLE — 10¹⁰ operations is roughly 100 seconds of work',
          'AC — 10¹⁰ is close enough to 10⁸',
          'Impossible to say without seeing the code',
          'RE — too many operations crash the program',
        ],
        answer: 0,
        explain: '(10⁵)² = 10¹⁰ ops ÷ 10⁸ ops/s ≈ 100 s — two orders of magnitude over budget. Doing too much work is TLE, never a crash; the estimate needs no code at all, just the loop structure.',
      },
      {
        id: 'bigo-8', type: 'tf', diff: 1,
        statement: 'If algorithm A is O(n²) and algorithm B is O(n log n), then A is slower than B on every input.',
        answer: false,
        explain: 'Big-O is about growth as n explodes — constants and small n can flip the race (insertion sort beats merge sort for tiny arrays). The guarantee is asymptotic: past some n, B wins. For contest estimates at max n, that’s the n that matters.',
      },
      {
        id: 'bigo-9', type: 'mcq', diff: 2,
        prompt: 'Each query just reads one element, yet this TLEs at n = q = 2·10⁵. Why?',
        code: `int valueAt(vector<int> v, int i) {   // called once per query
    return v[i];
}

while (q--) {
    int i; cin >> i;
    cout << valueAt(a, i) << "\\n";
}`,
        options: [
          'The vector is passed by value — every call copies n elements: O(nq) = 4·10¹⁰ total',
          'v[i] is O(log n), so q lookups are too slow',
          'cin cannot keep up with 2·10⁵ queries',
          'The function call itself costs O(n)',
        ],
        answer: 0,
        explain: 'The lookup is O(1), but the missing `&` copies all 2·10⁵ elements per call. Write `const vector<int>& v`. Hidden copies are the #1 way a “fast” solution does 10 000× the work you counted.',
        hint: 'The body is cheap. What happens before the body runs?',
      },
      {
        id: 'bigo-10', type: 'multi', diff: 2,
        prompt: 'Select **all** the operations that secretly cost O(n) — easy to miss when they sit inside a loop.',
        options: [
          '`s = s + c` to append one character to a string of length n',
          'passing a `vector<int>` of n elements by value',
          '`v.erase(v.begin())` on a vector of n elements',
          '`v.push_back(x)`',
          '`v.back()`',
        ],
        answers: [0, 1, 2],
        explain: '`s + c` rebuilds the string, by-value copies the container, and erasing the front shifts every element — each O(n), so in a loop they make O(n²). `push_back` is amortized O(1) and `back()` is O(1).',
      },
      {
        id: 'bigo-11', type: 'fill', diff: 1,
        prompt: 'Complete the complexity: `sort()` on n elements runs in O(___).',
        answer: ['n log n', 'nlogn', 'n*log n', 'n log(n)', 'n*log(n)', 'n·log n', 'n lg n'],
        placeholder: 'n …',
        explain: 'std::sort is introsort: O(n log n) even in the worst case. At n = 2·10⁵ that’s ~3.6·10⁶ operations — which is why “sort it first” fits almost any constraint you’ll meet.',
      },
      {
        id: 'bigo-12', type: 'mcq', diff: 3,
        prompt: 'Constraints: `1 ≤ k ≤ 10⁹`, time limit 1 s. Your loop `for (ll i = 1; i <= k; i++)` provably reaches the right answer. Verdict and fix?',
        options: [
          'TLE — 10⁹ iterations is ~10 seconds; derive the answer with O(1) or O(log k) math instead',
          'AC — 10⁹ simple operations fit comfortably in 1 second',
          'WA — large k changes the answer, not the speed',
          'MLE — a loop that long exhausts memory',
        ],
        answer: 0,
        explain: 'Correct ≠ fast enough: 10⁹ iterations blows the ~10⁸ budget. A value bound like k ≤ 10⁹ is the setter saying “don’t simulate — compute.” (CF 1352C “K-th Not Divisible by n” is exactly this lesson.) Loops use no extra memory, so MLE is off the table.',
        hint: 'Divide 10⁹ iterations by 10⁸ ops/second.',
      },
      {
        id: 'bigo-13', type: 'output', diff: 3,
        prompt: 'A doubling loop *containing* a linear loop. For n = 8, what does this print?',
        code: `int main() {
    int n = 8, ops = 0;
    for (int i = 1; i <= n; i *= 2)
        for (int j = 0; j < i; j++)
            ops++;
    cout << ops << "\\n";
}`,
        answer: '15',
        explain: 'Inner work is 1 + 2 + 4 + 8 = 15 ≈ 2n. A geometric series is dominated by its last term, so this is O(n) — **not** O(n log n). Multiplying “log n iterations × n inner” overcounts; summing the real work is the truth.',
        hint: 'Don’t multiply the loop bounds — add the inner counts for i = 1, 2, 4, 8.',
      },
    ],
    problems: [
      { name: 'Pashmak and Flowers', platform: 'Codeforces', id: '459B', rating: 1200, url: 'https://codeforces.com/problemset/problem/459/B', difficulty: 'easy', why: 'O(n) max/min counting — and the pair count overflows int. Size the output, not just the inputs.' },
      { name: 'K-th Not Divisible by n', platform: 'Codeforces', id: '1352C', rating: 1200, url: 'https://codeforces.com/problemset/problem/1352/C', difficulty: 'easy', why: 'k ≤ 10⁹ kills the simulation loop — the constraints demand O(1) math.' },
      { name: 'Collecting Numbers', platform: 'CSES', id: '2216', url: 'https://cses.fi/problemset/task/2216', difficulty: 'easy', why: 'Simulating rounds is O(n²); one positions-array insight makes it a single O(n) scan.' },
    ],
  },

  // __MORE__
};

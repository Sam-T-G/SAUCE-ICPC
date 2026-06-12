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

  // ==========================================================================
  'stl-sort': {
    id: 'stl-sort',
    objectives: [
      'Sort vectors, strings, and pairs with sort() and reason about its O(n log n) cost',
      'Write custom comparator lambdas that obey strict weak ordering',
      'Sort descending, by computed keys, and by index — without undefined behavior',
    ],
    theory: [
      {
        h: 'sort(): the workhorse',
        md: '`sort(v.begin(), v.end())` arranges any vector (or string, or array) ascending in **O(n log n)** — guaranteed, worst case (GCC uses introsort). Sorting is the great unlocker: medians, greedy sweeps, duplicate detection, and binary search all *start* with “sort it first.” At n = 2·10⁵ a sort costs ~3.6·10⁶ ops — essentially free against the 10⁸ budget.',
        code: `vector<int> v = {31, 4, 15, 9};
sort(v.begin(), v.end());            // {4, 9, 15, 31}
sort(v.rbegin(), v.rend());          // {31, 15, 9, 4} (descending)

string s = "sauce";
sort(s.begin(), s.end());            // "acesu" — strings sort too`,
      },
      {
        h: 'Pairs sort lexicographically',
        md: '`pair<int,int>` compares by `.first`, breaking ties by `.second` — automatically. So “sort by X, ties by Y” is often zero extra code: just *store* (X, Y). The classic trick: keep each value with its original index as `{value, index}`, sort, and you know where everything came from.',
        code: `vector<pair<int,int>> v;             // {value, original index}
for (int i = 0; i < n; i++)
    v.push_back({a[i], i});
sort(v.begin(), v.end());            // by value; equal values by index`,
      },
      {
        h: 'Custom comparators',
        md: 'A comparator is a function answering one question: **must `a` come strictly before `b`?** Pass a lambda as sort’s third argument. Descending order has a shortcut: `greater<int>()`.',
        code: `// descending, two ways
sort(v.begin(), v.end(), greater<int>());
sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

// by length, ties alphabetically
sort(w.begin(), w.end(), [](const string& a, const string& b) {
    if (a.size() != b.size()) return a.size() < b.size();  // primary key
    return a < b;                                          // tiebreak
});`,
      },
      {
        h: 'THE comparator bug: <= breaks everything',
        md: 'A comparator must be a **strict weak ordering** — in particular `comp(x, x)` must be `false`. Write `<=` or `>=` and you break that contract: sort’s internals may read out of bounds and **segfault on large inputs** while passing every small test. This is the most famous self-inflicted RE in competitive programming.',
        code: `sort(v.begin(), v.end(), [](int a, int b) {
    return a <= b;     // ☠ comp(x, x) == true → undefined behavior
});
// correct: return a < b;   (strict!)`,
        note: 'Equal elements must answer “no, neither comes first.” If your comparator ever returns true for equal arguments, it is wrong — even if it “works” today.',
        noteKind: 'danger',
      },
      {
        h: 'stable_sort and sorting indices',
        md: '`sort` gives **no promise** about the order of equal elements; `stable_sort` keeps their original input order (slightly slower, same O(n log n)). And when you need the *positions* sorted rather than the values, sort an index array with a capturing lambda:',
        code: `vector<int> idx(n);
iota(idx.begin(), idx.end(), 0);       // 0, 1, ..., n-1
sort(idx.begin(), idx.end(), [&](int i, int j) {
    return a[i] < a[j];                // compare by the values they point at
});
// idx[0] is the position of the smallest element of a`,
      },
    ],
    exercises: [
      {
        id: 'sort-1', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    vector<int> v = {31, 4, 15, 9};
    sort(v.begin(), v.end());
    cout << v[0] << " " << v[3] << "\\n";
}`,
        answer: '4 31',
        explain: 'After sorting ascending, v = {4, 9, 15, 31}: index 0 holds the minimum, the last index the maximum. Sorted position 0 = min and back() = max is a fact you’ll lean on constantly.',
      },
      {
        id: 'sort-2', type: 'output', diff: 1,
        prompt: 'Pairs use their default order here. Output?',
        code: `int main() {
    vector<pair<int,int>> v = {{2, 5}, {1, 9}, {2, 3}};
    sort(v.begin(), v.end());
    for (auto [a, b] : v) cout << a << b << " ";
}`,
        answer: '19 23 25',
        explain: 'Pairs compare by first, ties by second: {1,9} then {2,3} then {2,5}. Each prints as two digits glued together. Lexicographic pair order is free “sort by X, tie by Y”.',
      },
      {
        id: 'sort-3', type: 'mcq', diff: 1,
        prompt: 'Which call correctly sorts `vector<int> v` in **descending** order?',
        options: [
          '`sort(v.begin(), v.end(), greater<int>());`',
          '`sort(v.end(), v.begin());`',
          '`sort(v.begin(), v.end(), [](int a, int b){ return a >= b; });`',
          '`sort(v.begin(), v.end(), greater<int>);`',
        ],
        answer: 0,
        explain: '`greater<int>()` (note the parentheses — you pass an *instance*) sorts descending. Swapped iterators are UB, `>=` violates strict weak ordering (crash on big inputs), and `greater<int>` without `()` doesn’t compile. Also fine: sort ascending, then `reverse`.',
      },
      {
        id: 'sort-4', type: 'mcq', diff: 2,
        prompt: 'This compiles, passes the samples, then **segfaults** on a large test. Why?',
        code: `sort(v.begin(), v.end(), [](int a, int b) {
    return a <= b;       // looks harmless
});`,
        options: [
          '`<=` violates strict weak ordering — comp(x, x) must be false, so sort may walk out of bounds: undefined behavior',
          'Lambdas can’t be used as comparators; you need a function pointer',
          'It silently sorts descending, which corrupts the vector',
          '`sort` requires the vector to be nearly sorted already',
        ],
        answer: 0,
        explain: 'With `<=`, equal elements each claim to precede the other; sort’s partition step trusts the comparator and can run past the array bounds. Small tests often survive — big ones crash. Comparators use strict `<` or `>`, never `<=`/`>=`.',
        hint: 'What does this comparator say about two EQUAL elements?',
      },
      {
        id: 'sort-5', type: 'bank', diff: 2,
        prompt: 'Sort points by x **ascending**, ties by y **descending**. Fill the comparison operators.',
        code: `sort(v.begin(), v.end(), [](pair<int,int> a, pair<int,int> b) {
    if (a.first != b.first) return a.first ___ b.first;
    return a.second ___ b.second;
});`,
        answer: ['<', '>'],
        distractors: ['<=', '>='],
        explain: 'Primary key ascending → `<`; tiebreak descending → `>`. The `<=`/`>=` tokens are landmines: they break strict weak ordering and invite a segfault. The `!=` guard keeps the two keys cleanly separated.',
      },
      {
        id: 'sort-6', type: 'output', diff: 2,
        prompt: 'Custom comparator trace. Output?',
        code: `int main() {
    vector<string> v = {"kiwi", "fig", "banana"};
    sort(v.begin(), v.end(), [](const string& a, const string& b) {
        return a.size() < b.size();
    });
    cout << v[0] << " " << v[2] << "\\n";
}`,
        answer: 'fig banana',
        explain: 'Sorting by length: fig (3), kiwi (4), banana (6) — so v[0] is "fig" and v[2] is "banana". The comparator completely replaces alphabetical order; only what it mentions matters.',
      },
      {
        id: 'sort-7', type: 'tf', diff: 1,
        statement: '`std::sort` is O(n log n) even in the worst case, so sorting 2·10⁵ elements is far within a 1-second limit.',
        answer: true,
        explain: 'Introsort (quicksort + heapsort fallback) guarantees O(n log n): ~3.6·10⁶ ops at n = 2·10⁵. “Can I afford to sort?” is almost always yes — which is why so many solutions begin with it.',
      },
      {
        id: 'sort-8', type: 'parsons', diff: 2,
        prompt: 'Assemble: sort the **indices** 0..n−1 by the values `a[i]` they point to (smallest value’s index first).',
        lines: [
          'vector<int> idx(n);',
          'iota(idx.begin(), idx.end(), 0);',
          'sort(idx.begin(), idx.end(), [&](int i, int j) {',
          '    return a[i] < a[j];',
          '});',
        ],
        distractors: [
          'sort(idx.begin(), idx.end(), [](int i, int j) {',
          '    return i < j;',
        ],
        explain: 'Fill idx with 0..n−1 (`iota`), then sort it comparing `a[i] < a[j]` — the lambda must capture `[&]` to see `a`. The distractors are real bugs: no capture won’t compile, and `i < j` sorts indices by themselves, changing nothing.',
      },
      {
        id: 'sort-9', type: 'mcq', diff: 2,
        prompt: 'Contestants must be sorted by score descending, but **equal scores must keep their input order**. Which call is guaranteed correct?',
        options: [
          '`stable_sort(v.begin(), v.end(), byScoreDesc);`',
          '`sort(v.begin(), v.end(), byScoreDesc);` — sort never reorders equal elements',
          'Calling `sort` twice with the same comparator',
          '`reverse` the input, then `sort` ascending',
        ],
        answer: 0,
        explain: '`sort` makes NO promise about ties — it may shuffle equal elements freely. `stable_sort` preserves their original order. The other fix: add the index as an explicit tiebreaker in the comparator.',
      },
      {
        id: 'sort-10', type: 'fill', diff: 2,
        prompt: 'Complete the comparator body so the vector sorts **descending**:\n`sort(v.begin(), v.end(), [](int a, int b) { return ___; });`',
        answer: ['a > b', 'a>b', 'b < a', 'b<a'],
        placeholder: 'a … b',
        explain: '“Should a come before b?” — in descending order, yes exactly when `a > b`. Strict `>`, never `>=`: equal elements must not claim to precede each other.',
      },
      {
        id: 'sort-11', type: 'code', diff: 3,
        prompt: 'Read `n`, then `n` words. Print them on one line, space-separated, sorted by **length ascending**, ties broken **alphabetically**.\nExample: `banana fig kiwi date` → `fig date kiwi banana`.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> w(n);
    for (auto &s : w) cin >> s;
    // sort with a custom comparator, then print

    return 0;
}`,
        tests: [
          { input: '4\nbanana fig kiwi date', expected: 'fig date kiwi banana' },
          { input: '3\nbb cc aa', expected: 'aa bb cc' },
          { input: '1\nz', expected: 'z' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> w(n);
    for (auto &s : w) cin >> s;
    sort(w.begin(), w.end(), [](const string& a, const string& b) {
        if (a.size() != b.size()) return a.size() < b.size();  // primary key
        return a < b;                                          // tiebreak
    });
    for (int i = 0; i < n; i++)
        cout << w[i] << (i + 1 < n ? ' ' : '\\n');
    return 0;
}`,
        explain: 'Two-key comparator shape: compare the primary key when it differs, otherwise return the tiebreak. Both comparisons strict (`<`) — and `const string&` avoids copying every word on every comparison.',
        hint: 'if (sizes differ) decide by size; else decide alphabetically. Strict < in both branches.',
      },
      {
        id: 'sort-12', type: 'mcq', diff: 3,
        prompt: 'n = 10⁵ elements, q = 10⁵ queries — and you call `sort` on the whole array **inside** the query loop. Total cost?',
        options: [
          'O(q · n log n) ≈ 1.7·10¹¹ — hopeless; sort once before the loop',
          'O(n log n) — sort detects it’s already sorted and returns instantly',
          'O(q + n log n) — sorts after the first are free',
          'O(n²) — sorting q times costs the same as one quadratic pass',
        ],
        answer: 0,
        explain: 'Costs inside a loop multiply: q × n log n ≈ 10⁵ × 1.7·10⁶ = 1.7·10¹¹. sort has no memory between calls — *you* must hoist it out of the loop. “Cheap operation × huge loop” is the classic self-inflicted TLE.',
        hint: 'sort is O(n log n) every single time you call it.',
      },
    ],
    problems: [
      { name: 'Dragons', platform: 'Codeforces', id: '230A', rating: 1000, url: 'https://codeforces.com/problemset/problem/230/A', difficulty: 'easy', why: 'Sort the dragons by strength, then sweep — sorting unlocks the greedy.' },
      { name: 'Distinct Numbers', platform: 'CSES', id: '1621', url: 'https://cses.fi/problemset/task/1621', difficulty: 'easy', why: 'Sort and count adjacent changes (or throw everything in a set) — pick your weapon.' },
      { name: 'Stick Lengths', platform: 'CSES', id: '1074', url: 'https://cses.fi/problemset/task/1074', difficulty: 'easy', why: 'Sorting reveals the median as the optimal target. Total cost needs long long.' },
    ],
  },

  // ==========================================================================
  'stl-set-map': {
    id: 'stl-set-map',
    objectives: [
      'Choose set, multiset, or map for O(log n) membership, counting, and ordered iteration',
      'Use the map counting idiom cnt[x]++ — and dodge operator[]’s create-on-read trap',
      'Erase exactly one copy from a multiset (and know what erase(value) really does)',
      'Know when unordered_map’s O(1) is a lie on Codeforces',
    ],
    theory: [
      {
        h: 'set: sorted, unique, O(log n)',
        md: 'A `set<T>` keeps **unique** elements in **sorted order** with `insert`, `erase`, `find`, and `count` all in O(log n). Iterating walks the elements in ascending order, `*s.begin()` is the minimum, `*s.rbegin()` the maximum. The moment a problem says “has this value appeared before?”, a set is the answer.',
        code: `set<int> s;
s.insert(5);                 // O(log n)
s.insert(5);                 // duplicate: ignored, still one 5
if (s.count(5)) ...          // membership test: 0 or 1
s.erase(5);                  // gone
int lo = *s.begin();         // smallest (set is sorted)
for (int x : s) ...          // visits in ascending order`,
      },
      {
        h: 'map: a dictionary with sorted keys',
        md: '`map<K,V>` stores key → value pairs, sorted by key, O(log n) per operation. `m[k]` accesses the value for k, and the golden idiom counts anything in one line: `cnt[x]++`. Iteration yields `{key, value}` pairs in key order — structured bindings make it clean.',
        code: `map<string, int> cnt;
for (string w; cin >> w; )
    cnt[w]++;                      // counting idiom: works immediately

for (auto& [word, c] : cnt)        // keys come out sorted
    cout << word << " " << c << "\\n";`,
      },
      {
        h: 'operator[] CREATES missing keys',
        md: 'Why does `cnt[x]++` work on a brand-new key? Because `m[k]` **inserts** `{k, 0}` when k is absent — then hands you the value. Great for counting, terrible for lookups: `if (m[x] > 0)` quietly inserts x with value 0, bloating the map, slowing it, and corrupting any later `m.size()` or iteration.',
        code: `map<int,int> m;
if (m[42] > 0) ...     // ☠ just INSERTED {42, 0} — a "read" that writes
if (m.count(42)) ...   // ✓ pure lookup, map untouched
auto it = m.find(42);  // ✓ iterator, or m.end() if absent`,
        note: 'Reading with `[]` mutates the map. Lookups use `.count()` or `.find()`; only counting/assignment should use `[]`.',
        noteKind: 'warn',
      },
      {
        h: 'multiset and THE erase trap',
        md: '`multiset` is a set that allows **duplicates** — perfect for “bag of values, repeatedly take min/max.” But its most famous trap: `ms.erase(value)` removes **ALL** copies of value. To delete exactly one, erase by *iterator*: `ms.erase(ms.find(value))`.',
        code: `multiset<int> ms = {5, 5, 5, 8};
ms.erase(5);              // ☠ removes ALL the 5s → {8}

multiset<int> t = {5, 5, 5, 8};
t.erase(t.find(5));       // ✓ removes ONE 5 → {5, 5, 8}`,
        note: 'erase(value) → all copies. erase(iterator) → that one element. This single line has ended rated rounds.',
        noteKind: 'danger',
      },
      {
        h: 'unordered_map: fast, fragile, hackable',
        md: '`unordered_map` is a hash table: O(1) *average* per operation, no ordering. The catch: with crafted keys all entries collide and every operation degrades to O(n) — and on **Codeforces, hacking phase exists precisely to feed you such inputs**. In rated rounds prefer `map` (a predictable log factor) or use a custom randomized hash. Off CF, unordered_map on random-ish keys is fine.',
        code: `unordered_map<int,int> fast;   // O(1) avg, O(n) worst, unsorted
map<int,int> safe;             // O(log n) always, sorted keys`,
      },
    ],
    exercises: [
      {
        id: 'set-1', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    set<int> s;
    s.insert(3); s.insert(1); s.insert(3); s.insert(2);
    cout << s.size() << " " << *s.begin() << "\\n";
}`,
        answer: '3 1',
        explain: 'The duplicate 3 is ignored — sets store unique values — so size is 3. Elements live in sorted order, making `*s.begin()` the minimum: 1.',
      },
      {
        id: 'set-2', type: 'output', diff: 1,
        prompt: 'The counting idiom. Output?',
        code: `int main() {
    map<string, int> cnt;
    for (string w : {"a", "b", "a", "a"})
        cnt[w]++;
    cout << cnt["a"] << " " << cnt.size() << "\\n";
}`,
        answer: '3 2',
        explain: '`cnt[w]++` creates each key at 0 on first sight, then increments: a→3, b→1. Two distinct keys → size 2. One line to count anything: the single most-used map pattern.',
      },
      {
        id: 'set-3', type: 'mcq', diff: 2,
        prompt: 'After answering the queries, `seen.size()` mysteriously **grew**. Why?',
        code: `map<string, int> seen;   // filled earlier with known words
while (q--) {
    string w; cin >> w;
    if (seen[w] > 0) cout << "known\\n";
}
cout << seen.size() << "\\n";   // bigger than before?!`,
        options: [
          '`seen[w]` default-inserts {w, 0} for every missing key — reads via operator[] mutate the map',
          'size() includes the queries by specification',
          'Maps grow on every read to stay balanced',
          'The while loop copies the map each iteration',
        ],
        answer: 0,
        explain: 'operator[] must return a reference, so it inserts a zeroed entry for absent keys. Every unknown query word got added. Pure lookups use `seen.count(w)` or `seen.find(w)` — `[]` is for counting and writing.',
        hint: 'What must m[k] do when k is not in the map?',
      },
      {
        id: 'set-4', type: 'mcq', diff: 2,
        prompt: 'What does this print?',
        code: `multiset<int> ms = {5, 5, 5, 8};
ms.erase(5);
cout << ms.size() << "\\n";`,
        options: ['1 — erase(value) removes ALL copies of 5', '3 — it removes a single 5', '0 — erase clears the multiset', 'Compile error — multiset has no erase(value)'],
        answer: 0,
        explain: '`erase(value)` deletes **every** copy: all three 5s vanish, leaving {8}. To remove exactly one, erase an iterator: `ms.erase(ms.find(5))`. Burn this distinction in before it burns you.',
      },
      {
        id: 'set-5', type: 'fill', diff: 2,
        prompt: 'Multiset `ms` holds several copies of `x`. Remove **exactly one** copy:\n`ms.erase(___);`',
        answer: ['ms.find(x)', 'ms.find( x )'],
        placeholder: 'ms.…',
        explain: '`ms.find(x)` returns an iterator to one occurrence; erasing an *iterator* removes only that element. Passing the plain value would wipe every copy.',
      },
      {
        id: 'set-6', type: 'tf', diff: 2,
        statement: 'On Codeforces rated rounds, `unordered_map` can be hacked with crafted keys that collide, degrading each operation to O(n) — so plain `map` is the safer default there.',
        answer: true,
        explain: 'Hash tables are O(1) only on average; adversarial inputs force worst-case O(n) per op, and CF’s hacking phase invites exactly that. `map` costs a predictable log factor; if you need hashing speed, use a randomized custom hash.',
      },
      {
        id: 'set-7', type: 'output', diff: 2,
        prompt: 'What does this print?',
        code: `int main() {
    set<int> s = {4, 1, 7, 1};
    s.erase(4);
    for (int x : s) cout << x << " ";
}`,
        answer: '1 7',
        explain: 'The duplicate 1 collapses on construction → {1, 4, 7}; erasing 4 leaves {1, 7}, iterated in sorted order. Sets are simultaneously a dedupe and a sort.',
      },
      {
        id: 'set-8', type: 'parsons', diff: 2,
        prompt: 'Assemble: print the 1-based position of the **first repeated** value in the input (or -1 if all n values are distinct).',
        lines: [
          'set<int> seen;',
          'int ans = -1;',
          'for (int i = 0; i < n && ans == -1; i++) {',
          '    int x;',
          '    cin >> x;',
          '    if (seen.count(x)) ans = i + 1;',
          '    seen.insert(x);',
          '}',
          'cout << ans << "\\n";',
        ],
        distractors: [
          '    if (seen[x]) ans = i + 1;',
        ],
        explain: 'Check membership **before** inserting the current value, or everything looks repeated. The distractor `seen[x]` is a bug twice over: `set` has no operator[] — that’s a map feature (and a trap even there).',
      },
      {
        id: 'set-9', type: 'mcq', diff: 3,
        prompt: '“Does some pair sum to t?” This reports YES for input `t = 10, a = {5}` — a single element. Which line is the bug?',
        code: `set<ll> seen;
bool found = false;
for (int i = 0; i < n; i++) {
    seen.insert(a[i]);              // line A
    if (seen.count(t - a[i]))       // line B
        found = true;
}`,
        options: [
          'Line A — inserting before the check lets a[i] pair with itself when t = 2·a[i]; insert AFTER checking',
          'Line B — count is O(n) on a set, so this is too slow',
          'seen must be a multiset, otherwise duplicate values break the logic',
          'found should be reset inside the loop',
        ],
        answer: 0,
        explain: 'With 5 already inserted, the check `count(10 − 5)` finds the element itself. Check-then-insert means you only match *earlier* elements — which also handles genuine duplicates correctly (the second 5 finds the first). Order of operations is the whole algorithm here.',
        hint: 'Trace i = 0: what is in `seen` when the check runs?',
      },
      {
        id: 'set-10', type: 'match', diff: 1,
        prompt: 'Match each container to its defining property.',
        pairs: [
          ['set', 'sorted, unique values'],
          ['multiset', 'sorted, duplicates allowed'],
          ['map', 'key → value, sorted by key'],
          ['unordered_map', 'hashed: O(1) average, no order'],
        ],
        explain: 'The ordered three (set/multiset/map) are balanced trees: O(log n) ops, sorted iteration. unordered_map trades the ordering away for average O(1) — with the hack caveat on Codeforces.',
      },
      {
        id: 'set-11', type: 'mcq', diff: 1,
        prompt: 'Which expression is the **smallest** element of a non-empty `set<int> s`?',
        options: ['`*s.begin()`', '`s[0]`', '`s.front()`', '`s.min()`'],
        answer: 0,
        explain: 'Sets iterate in sorted order, so `begin()` points at the minimum — dereference it. There is no indexing and no front() on a set (those are vector/deque APIs), and no min() member exists.',
      },
      {
        id: 'set-12', type: 'code', diff: 3,
        prompt: 'Read `n`, then `n` lowercase words. Print the word that appears **most often**; if several tie, print the alphabetically smallest of them.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    // count with a map, then scan for the best

    return 0;
}`,
        tests: [
          { input: '5\nred blue red green red', expected: 'red' },
          { input: '4\nb a b a', expected: 'a' },
          { input: '1\nsolo', expected: 'solo' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    map<string, int> cnt;
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        cnt[w]++;                        // counting idiom
    }
    string best;
    int bestCnt = 0;
    for (auto& [w, c] : cnt)             // keys arrive in sorted order
        if (c > bestCnt) {               // strict >: first (smallest) key wins ties
            bestCnt = c;
            best = w;
        }
    cout << best << "\\n";
    return 0;
}`,
        explain: 'cnt[w]++ counts; then exploit that map iterates keys in **sorted order**: with a strict `>` the earliest — alphabetically smallest — key wins ties automatically. Using `>=` would hand ties to the alphabetically largest instead.',
        hint: 'Map iteration is alphabetical. Should the comparison be > or >= to keep the FIRST best?',
      },
    ],
    problems: [
      { name: 'Sum of Two Values', platform: 'CSES', id: '1640', url: 'https://cses.fi/problemset/task/1640', difficulty: 'easy', why: 'The complement-lookup idiom: “have I seen t − x?” Mind the element pairing with itself.' },
      { name: 'Playlist', platform: 'CSES', id: '1141', url: 'https://cses.fi/problemset/task/1141', difficulty: 'med', why: 'Set membership over a moving window — insert, detect the repeat, shrink from the left.' },
      { name: 'Restaurant Customers', platform: 'CSES', id: '1619', url: 'https://cses.fi/problemset/task/1619', difficulty: 'med', why: 'Sort arrival/departure events, sweep while tracking occupancy — multiset or ±1 events.' },
    ],
  },

  // ==========================================================================
  'stl-stack-queue': {
    id: 'stl-stack-queue',
    objectives: [
      'Use stack, queue, and deque APIs without the pop-returns-void surprise',
      'Match brackets with a stack — the canonical LIFO pattern',
      'Build min-heaps from priority_queue (which is a MAX-heap by default)',
      'Choose priority_queue vs multiset based on the operations you need',
    ],
    theory: [
      {
        h: 'LIFO and FIFO in one breath',
        md: '`stack` is last-in-first-out: `push`, read `top()`, `pop()`. `queue` is first-in-first-out: `push` at the back, read `front()`, `pop()` from the front. Every operation is O(1). The API trap that bites everyone once: **`pop()` returns void** — read the element first, *then* remove it.',
        code: `stack<int> st;
st.push(7);
int x = st.top();   // read FIRST...
st.pop();           // ...then remove (pop returns void!)

queue<int> q;
q.push(7);
int y = q.front();  // same dance at the front
q.pop();`,
        note: '`int x = st.pop();` does not compile. Read with top()/front(), remove with pop() — two separate steps, always.',
        noteKind: 'warn',
      },
      {
        h: 'Bracket matching: the canonical stack',
        md: 'Walk the string: push every opener; on a closer, the **most recent unmatched opener** must match it — exactly what the stack’s top holds. Fail fast on a closer with an empty stack; at the end, leftovers on the stack mean unclosed openers.',
        code: `bool valid = true;
stack<char> st;
for (char c : s) {
    if (c == '(') st.push(c);              // opener: remember it
    else {
        if (st.empty()) { valid = false; break; }  // closer, nothing open
        st.pop();                          // matched the latest opener
    }
}
if (!st.empty()) valid = false;            // unclosed openers remain`,
      },
      {
        h: 'priority_queue: the heap',
        md: '`priority_queue<int>` always serves its **largest** element: `top()` reads it, `pop()` removes it, `push()` inserts — push/pop are O(log n), top is O(1). Want the *smallest* first? The famously verbose min-heap incantation:',
        code: `priority_queue<int> mx;                            // MAX-heap (default)
priority_queue<int, vector<int>, greater<int>> mn; // MIN-heap

mn.push(5); mn.push(1); mn.push(4);
cout << mn.top();        // 1 — smallest first`,
        note: 'Default = max-heap. Forgetting that — or typing the min-heap template wrong — is the classic “my Dijkstra explores the worst node first” bug.',
        noteKind: 'warn',
      },
      {
        h: 'Heaps of pairs',
        md: 'A `priority_queue<pair<int,int>>` orders by `.first`, ties by `.second` — pair rules again. That makes “process items by priority while carrying a payload” one declaration: store `{key, id}`. With `greater<>` it becomes the (distance, node) min-heap at the heart of Dijkstra — coming in Unit 5.',
        code: `priority_queue<pair<int,int>,
               vector<pair<int,int>>,
               greater<pair<int,int>>> pq;   // min by .first
pq.push({dist, node});                       // smallest dist on top`,
      },
      {
        h: 'deque — and pq vs multiset',
        md: '`deque` gives O(1) `push_front/push_back/pop_front/pop_back` plus indexing — the structure for “take from either end.”\n\nChoosing a priority structure: `priority_queue` does push / top / pop, period — small and fast. `multiset` also gives min *and* max, `find`, and **erase of an arbitrary value** — more power, bigger constant. Need to delete things that aren’t the top? multiset (or lazy deletion).',
        code: `deque<int> d = {2, 3};
d.push_front(1);     // {1, 2, 3}
d.pop_back();        // {1, 2}
cout << d[1];        // 2 — random access works too`,
      },
    ],
    exercises: [
      {
        id: 'sq-1', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    stack<int> st;
    st.push(1); st.push(2); st.push(3);
    st.pop();
    cout << st.top() << " " << st.size() << "\\n";
}`,
        answer: '2 2',
        explain: 'LIFO: pop removes the most recent push (3), exposing 2 at the top with two elements left. The last thing in is the first thing out.',
      },
      {
        id: 'sq-2', type: 'output', diff: 1,
        prompt: 'Same moves, different container. Output?',
        code: `int main() {
    queue<int> q;
    q.push(1); q.push(2); q.push(3);
    q.pop();
    cout << q.front() << " " << q.back() << "\\n";
}`,
        answer: '2 3',
        explain: 'FIFO: pop removes the **oldest** element (1), so the front becomes 2 while the back stays 3. Identical code to sq-1, opposite end — that contrast *is* the lesson.',
      },
      {
        id: 'sq-3', type: 'mcq', diff: 1,
        prompt: 'Why does this line fail to compile?',
        code: `int x = st.pop();   // st is stack<int>`,
        options: [
          '`pop()` returns void — read `st.top()` first, then call `st.pop()`',
          '`pop()` needs the element to remove as an argument',
          'stack elements can only be read through iterators',
          '`x` must be declared `auto` to receive a popped value',
        ],
        answer: 0,
        explain: 'C++ splits the operation: `top()` reads, `pop()` discards and returns nothing. Two lines, always: `int x = st.top(); st.pop();`. (Same for queue’s front/pop.)',
      },
      {
        id: 'sq-4', type: 'output', diff: 2,
        prompt: 'Default priority_queue. What does this print?',
        code: `int main() {
    priority_queue<int> pq;
    pq.push(3); pq.push(7); pq.push(1);
    cout << pq.top() << " ";
    pq.pop();
    cout << pq.top() << "\\n";
}`,
        answer: '7 3',
        explain: '`priority_queue` is a **MAX-heap** by default: top is the largest (7), and after popping it, the next largest (3). If you expected 1, you’ve just met the most common heap bug in the wild.',
      },
      {
        id: 'sq-5', type: 'fill', diff: 2,
        prompt: 'Complete the min-heap declaration:\n`priority_queue<int, ___, greater<int>> pq;`',
        answer: ['vector<int>', 'std::vector<int>'],
        placeholder: '…<int>',
        explain: 'The three template arguments: element type, underlying container (`vector<int>`), comparator (`greater<int>`). All three are required to flip a heap to min-first — memorize the incantation; you’ll type it in every Dijkstra.',
      },
      {
        id: 'sq-6', type: 'parsons', diff: 2,
        prompt: 'Assemble the bracket-matching scan for a string of `(` and `)` (sets `ok` to false on any mismatch).',
        lines: [
          'stack<char> st;',
          'bool ok = true;',
          'for (char c : s) {',
          "    if (c == '(') st.push(c);",
          '    else if (st.empty()) { ok = false; break; }',
          '    else st.pop();',
          '}',
          'if (!st.empty()) ok = false;',
        ],
        distractors: [
          'if (!st.empty()) ok = true;',
        ],
        explain: 'Openers push; closers must find a non-empty stack to pop, else fail. The final check catches unclosed openers like "((" — the distractor inverts it, blessing exactly the broken strings.',
      },
      {
        id: 'sq-7', type: 'output', diff: 2,
        prompt: 'A heap of pairs. What does this print?',
        code: `int main() {
    priority_queue<pair<int,int>> pq;
    pq.push({1, 9}); pq.push({3, 2}); pq.push({2, 5});
    auto [a, b] = pq.top();
    cout << a << " " << b << "\\n";
}`,
        answer: '3 2',
        explain: 'Pairs compare by `.first` (ties by `.second`), and the default heap is max-first → {3, 2} sits on top. Store {priority, payload} and the heap organizes itself.',
      },
      {
        id: 'sq-8', type: 'tf', diff: 2,
        statement: 'Calling `q.front()` or `st.top()` on an **empty** container is undefined behavior — you must check `empty()` first.',
        answer: true,
        explain: 'No exception, no error message — just UB: garbage values or a crash, often only on the judge’s tests. Every front/top in a loop should be guarded by an emptiness check (it’s also step one of bracket matching).',
      },
      {
        id: 'sq-9', type: 'mcq', diff: 2,
        prompt: 'Cards lie in a row; players repeatedly take a card from **either end**. Which container gives O(1) for exactly these moves?',
        options: [
          '`deque` — push/pop at both ends in O(1)',
          '`vector` — `erase(v.begin())` is O(1)',
          '`stack` — one end is enough for two players',
          '`priority_queue` — it always serves the best card',
        ],
        answer: 0,
        explain: 'Both-ends access is the deque’s whole identity. `vector::erase(begin())` shifts every remaining element — O(n) per take, O(n²) total. (Two indices `l`, `r` walking inward work too — a deque in spirit.)',
      },
      {
        id: 'sq-10', type: 'match', diff: 1,
        prompt: 'Match each container to its access pattern.',
        pairs: [
          ['stack', 'take from the top — LIFO'],
          ['queue', 'in at the back, out at the front — FIFO'],
          ['deque', 'push and pop at both ends'],
          ['priority_queue', 'largest element first (by default)'],
        ],
        explain: 'Four shapes of “what comes out next”: most recent (stack), oldest (queue), either end (deque), best (heap). Picking the structure IS picking the algorithm.',
      },
      {
        id: 'sq-11', type: 'mcq', diff: 3,
        prompt: 'You must support three operations, each up to 2·10⁵ times: insert a number, extract the smallest, and **delete one specific value** (not necessarily the smallest). Best fit?',
        options: [
          '`multiset` — `*begin()` for the min, `erase(find(x))` for one copy, all O(log n)',
          '`priority_queue` — its built-in `erase(x)` handles deletions',
          'a sorted `vector`, re-sorted after every insert',
          '`unordered_set` — O(1) and it keeps elements ordered',
        ],
        answer: 0,
        explain: 'priority_queue has NO erase-by-value (the workaround, lazy deletion, defers removals). Re-sorting per insert is O(n log n) each. unordered_set has no order at all. multiset is the pq that can also delete from the middle — its superpower, bought with a bigger constant.',
        hint: 'Which of these structures can even FIND an arbitrary value?',
      },
      {
        id: 'sq-12', type: 'code', diff: 3,
        prompt: 'Read one string of brackets `()[]{}`. Print `YES` if every bracket is matched and properly nested, else `NO`.\nExample: `([]{})` → YES, `([)]` → NO.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    // stack of expected... or of seen openers?

    return 0;
}`,
        tests: [
          { input: '([]{})', expected: 'YES' },
          { input: '([)]', expected: 'NO' },
          { input: '(((', expected: 'NO' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    stack<char> st;
    bool ok = true;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);                      // opener: remember it
        } else {
            char need = (c == ')') ? '(' : (c == ']') ? '[' : '{';
            if (st.empty() || st.top() != need) { ok = false; break; }
            st.pop();                        // matched the latest opener
        }
    }
    if (!st.empty()) ok = false;             // unclosed openers remain
    cout << (ok ? "YES" : "NO") << "\\n";
    return 0;
}`,
        explain: 'Three failure modes, three checks: a closer with an empty stack, a closer whose type doesn’t match the top (catches "([)]"), and leftovers at the end (catches "((("). Most wrong submissions miss exactly one of the three.',
        hint: 'With multiple bracket types, popping isn’t enough — the TOP must be the matching opener.',
      },
      {
        id: 'sq-13', type: 'output', diff: 2,
        prompt: 'Min-heap with duplicates. What does this print?',
        code: `int main() {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : {5, 1, 4, 1}) pq.push(x);
    pq.pop();
    cout << pq.top() << " " << pq.size() << "\\n";
}`,
        answer: '1 3',
        explain: '`greater<int>` flips the heap to min-first: pop removes one 1, and the **other** 1 surfaces — heaps happily hold duplicates. Three elements remain: {1, 4, 5}.',
        hint: 'How many 1s went in? How many came out?',
      },
    ],
    problems: [
      { name: 'Sereja and Dima', platform: 'Codeforces', id: '381A', rating: 800, url: 'https://codeforces.com/problemset/problem/381/A', difficulty: 'intro', why: 'Two players taking from either end — pure deque (or two-index) thinking.' },
      { name: 'Taxi', platform: 'Codeforces', id: '158B', rating: 1100, url: 'https://codeforces.com/problemset/problem/158/B', difficulty: 'easy', why: 'Count group sizes 1–4, then pair them greedily — a tiny counting array beats any fancy container.' },
      { name: 'Concert Tickets', platform: 'CSES', id: '1091', url: 'https://cses.fi/problemset/task/1091', difficulty: 'med', why: 'multiset upper_bound, then erase that ITERATOR — sell one ticket, not all copies. The trap, live.' },
    ],
  },

  // ==========================================================================
  'stl-toolbox': {
    id: 'stl-toolbox',
    objectives: [
      'Locate values and boundaries in sorted vectors with lower_bound / upper_bound',
      'Count, dedupe, and aggregate with one-liners (upper−lower, sort+unique+erase, accumulate)',
      'Use lambdas with count_if / find_if and unpack pairs with structured bindings',
    ],
    theory: [
      {
        h: 'lower_bound / upper_bound',
        md: 'On a **sorted** vector, two binary searches in O(log n):\n\n`lower_bound(v.begin(), v.end(), x)` → iterator to the first element **≥ x**.\n`upper_bound(v.begin(), v.end(), x)` → iterator to the first element **> x**.\n\nBoth return `v.end()` when no such element exists. Subtract `v.begin()` to turn the iterator into an index.',
        code: `vector<int> v = {2, 4, 4, 7, 9};        // must be sorted!
auto it = lower_bound(v.begin(), v.end(), 4);
int idx = it - v.begin();               // 1 — first 4
int j   = upper_bound(v.begin(), v.end(), 4) - v.begin();  // 3 — first >4`,
        note: 'Unsorted input makes both return garbage with full confidence. Sort first — always.',
        noteKind: 'warn',
      },
      {
        h: 'Counting with the bounds',
        md: 'The two bounds bracket every occurrence, so subtraction counts in O(log n):\n\nCopies of x: `upper_bound(x) − lower_bound(x)`.\nValues in [a, b]: `upper_bound(b) − lower_bound(a)`.\n\nSort once for O(n log n), then answer each of q range-count queries in O(log n) — the sorted-array answer to “how many between?”.',
        code: `sort(v.begin(), v.end());                          // once
ll inRange = upper_bound(v.begin(), v.end(), b)    // first > b
           - lower_bound(v.begin(), v.end(), a);   // first ≥ a`,
      },
      {
        h: 'The dedupe idiom',
        md: 'Three moves, one line of intent — remove duplicates from a vector:\n\n1. `sort` brings equal values together.\n2. `unique` shifts unique values forward and returns the new logical end (it does **not** shrink the vector).\n3. `erase` chops off the leftover tail.\n\n`unique` only collapses **adjacent** duplicates — skipping the sort silently fails.',
        code: `sort(v.begin(), v.end());                    // group duplicates
v.erase(unique(v.begin(), v.end()), v.end());// collapse + chop tail
// v is now sorted AND distinct`,
      },
      {
        h: 'accumulate, min_element, max_element',
        md: '`accumulate(v.begin(), v.end(), 0LL)` sums the vector — and the third argument’s **type is the accumulator’s type**. Plain `0` sums 64-bit data in a 32-bit int: overflow, the legendary trap. `min_element` / `max_element` return **iterators**, not values — dereference with `*`, or subtract `v.begin()` for the position.',
        code: `ll total = accumulate(v.begin(), v.end(), 0LL);  // 0LL or bust
int mx  = *max_element(v.begin(), v.end());      // * to get the VALUE
int pos = min_element(v.begin(), v.end()) - v.begin();  // index of min`,
        note: 'accumulate(..., 0) with big values compiles cleanly and returns garbage. The LL suffix is doing all the work.',
        noteKind: 'danger',
      },
      {
        h: 'Lambdas everywhere + structured bindings',
        md: 'The `_if` algorithms take a lambda predicate: `count_if` counts matches, `find_if` returns an iterator to the first match (or end). And C++17 **structured bindings** unpack pairs without `.first/.second` noise — they make map loops readable:',
        code: `int evens = count_if(v.begin(), v.end(),
                     [](int x) { return x % 2 == 0; });

auto [val, idx] = pr;            // unpack a pair<int,int>

for (auto& [word, c] : cnt)      // map iteration, named fields
    cout << word << ": " << c << "\\n";`,
      },
    ],
    exercises: [
      {
        id: 'tb-1', type: 'output', diff: 1,
        prompt: 'The vector is sorted. What does this print?',
        code: `int main() {
    vector<int> v = {2, 4, 4, 7, 9};
    cout << lower_bound(v.begin(), v.end(), 4) - v.begin();
    cout << " ";
    cout << upper_bound(v.begin(), v.end(), 4) - v.begin();
}`,
        answer: '1 3',
        explain: 'lower_bound finds the first element ≥ 4 (index 1); upper_bound the first > 4 (index 3). Subtracting v.begin() converts iterators to indices — and 3 − 1 = 2 counts the 4s for free.',
      },
      {
        id: 'tb-2', type: 'mcq', diff: 1,
        prompt: 'On a sorted vector, what does `lower_bound(v.begin(), v.end(), x)` return?',
        options: [
          'an iterator to the first element ≥ x (or v.end() if none)',
          'an iterator to the first element > x',
          'the index of x, or −1 if x is absent',
          'an iterator to the last element < x',
        ],
        answer: 0,
        explain: 'lower = first **≥**, upper = first **>** — that single character is the whole distinction. It returns an iterator (never −1); convert to an index with `it - v.begin()`, and absent values give the insertion point, not an error.',
      },
      {
        id: 'tb-3', type: 'output', diff: 2,
        prompt: 'The dedupe idiom in action. Output?',
        code: `int main() {
    vector<int> v = {3, 1, 3, 2, 1};
    sort(v.begin(), v.end());
    v.erase(unique(v.begin(), v.end()), v.end());
    cout << v.size();
    for (int x : v) cout << " " << x;
}`,
        answer: '3 1 2 3',
        explain: 'sort → {1,1,2,3,3}; unique collapses adjacent duplicates and erase trims the tail → {1,2,3}. Output: size 3, then the elements. Sorted-and-distinct in two lines.',
      },
      {
        id: 'tb-4', type: 'mcq', diff: 2,
        prompt: 'The “dedupe” failed — v still contains two 1s. What went wrong?',
        code: `vector<int> v = {1, 2, 1};
v.erase(unique(v.begin(), v.end()), v.end());
// v is still {1, 2, 1}`,
        options: [
          '`unique` only collapses **adjacent** duplicates — sort first: sort → unique → erase',
          '`erase` needs a count of elements, not an iterator range',
          '`unique` never modifies anything; only sets can dedupe',
          'The vector is too small for unique to engage',
        ],
        answer: 0,
        explain: 'In {1, 2, 1} no equal elements touch, so unique sees nothing to do. The idiom is a package: **sort**, unique, erase. (unique does modify — it shifts survivors forward and returns the new end; it just can’t see non-adjacent twins.)',
      },
      {
        id: 'tb-5', type: 'fill', diff: 2,
        prompt: 'Count how many times `x` occurs in the **sorted** vector `v`:\n`int k = upper_bound(v.begin(), v.end(), x) - ___;`',
        answer: ['lower_bound(v.begin(), v.end(), x)', 'lower_bound(v.begin(),v.end(),x)'],
        placeholder: 'lower_…',
        explain: 'upper points just past the last x, lower at the first — their distance is the count, in O(log n). Same subtraction with different arguments counts any value range [a, b].',
      },
      {
        id: 'tb-6', type: 'mcq', diff: 2,
        prompt: 'n = 2·10⁵ values, each up to 10⁹. This prints a **negative** “sum”. Why?',
        code: `vector<ll> v(n);
// ... read values ...
ll s = accumulate(v.begin(), v.end(), 0);
cout << s << "\\n";`,
        options: [
          'The literal `0` is an int, so accumulate sums in int and overflows — write `0LL`',
          'accumulate cannot return long long at all',
          'The vector must be sorted before accumulating',
          '`ll s` is too small; the sum needs unsigned',
        ],
        answer: 0,
        explain: 'The third argument dictates the accumulator type: `0` → int → overflow at ~2.1·10⁹, long before the 2·10¹⁴ total. `0LL` fixes it. Assigning to an `ll` afterwards can’t un-overflow anything — the damage is done inside accumulate.',
        hint: 'What is the TYPE of the literal 0?',
      },
      {
        id: 'tb-7', type: 'mcq', diff: 2,
        prompt: 'Why does this line fail to compile?',
        code: `cout << max_element(v.begin(), v.end()) << "\\n";`,
        options: [
          '`max_element` returns an **iterator** — dereference it: `*max_element(...)`',
          '`max_element` requires a comparator argument',
          '`cout` cannot print int values without casting',
          'the vector must be sorted before calling max_element',
        ],
        answer: 0,
        explain: 'min_element/max_element hand back an iterator (a position), not the value. `*it` gets the value; `it - v.begin()` gets the index — the iterator is *more* information, once you remember to unwrap it.',
      },
      {
        id: 'tb-8', type: 'output', diff: 2,
        prompt: 'A lambda predicate. What does this print?',
        code: `int main() {
    vector<int> v = {1, -2, 3, -4, 5};
    int k = count_if(v.begin(), v.end(),
                     [](int x) { return x > 0; });
    cout << k << "\\n";
}`,
        answer: '3',
        explain: 'count_if applies the predicate to each element and counts the trues: 1, 3, 5 → three positives. One line replacing a loop-plus-counter — and the lambda can encode any condition you can write in C++.',
      },
      {
        id: 'tb-9', type: 'bank', diff: 1,
        prompt: 'Unpack the pair with a structured binding so the print works.',
        code: `pair<string,int> pr = {"sauce", 7};
auto [___, ___] = pr;
cout << name << " " << num << "\\n";`,
        answer: ['name', 'num'],
        distractors: ['pr.first', 'auto'],
        explain: '`auto [name, num] = pr;` declares both variables in field order — no `.first/.second` in sight. The bracket slots take fresh names, not expressions like `pr.first`.',
      },
      {
        id: 'tb-10', type: 'parsons', diff: 2,
        prompt: 'Assemble: count how many array values fall in the range **[a, b]**, inclusive (input order arbitrary).',
        lines: [
          'sort(v.begin(), v.end());',
          'auto lo = lower_bound(v.begin(), v.end(), a);',
          'auto hi = upper_bound(v.begin(), v.end(), b);',
          'cout << hi - lo << "\\n";',
        ],
        distractors: [
          'auto hi = lower_bound(v.begin(), v.end(), b);',
        ],
        explain: 'Sort, then bracket: first ≥ a up to first > b. The distractor uses lower_bound for the top end — it stops *at* b instead of after it, silently excluding values equal to b.',
      },
      {
        id: 'tb-11', type: 'code', diff: 3,
        prompt: 'Read `n`, then `n` integers. Then read `q` queries; for each value `x`, print how many array elements are **≤ x** (one answer per line).',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    // sort once, then answer each query in O(log n)

    return 0;
}`,
        tests: [
          { input: '5\n1 3 3 7 9\n3\n3\n0\n8', expected: '3\n0\n4' },
          { input: '1\n5\n2\n5\n4', expected: '1\n0' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());            // sort ONCE, outside the query loop
    int q;
    cin >> q;
    while (q--) {
        int x;
        cin >> x;
        // first element > x sits at exactly the count of elements <= x
        cout << upper_bound(a.begin(), a.end(), x) - a.begin() << "\\n";
    }
    return 0;
}`,
        explain: '“How many ≤ x” is precisely the index of the first element > x — upper_bound minus begin. Sort once (O(n log n)), answer each query in O(log n): the shape that turns 4·10¹⁰ scanning into ~7·10⁶ work.',
        hint: 'Elements ≤ x occupy a prefix of the sorted array. Which bound finds where that prefix ends?',
      },
      {
        id: 'tb-12', type: 'mcq', diff: 3,
        prompt: 'n, q ≤ 2·10⁵, 1-second limit: q queries each ask “how many array values equal x?”. Which plan fits the budget?',
        options: [
          'Sort once; answer each query with upper_bound − lower_bound: O((n + q) log n)',
          'For each query, scan the whole array: O(nq) = 4·10¹⁰',
          'Rebuild a map of counts from scratch for every query',
          'unordered_map with default hashing — guaranteed O(1) worst case per query',
        ],
        answer: 0,
        explain: 'Sort + two binary searches per query ≈ 7·10⁶ ops — trivial. Scanning is 4·10¹⁰ (dead), rebuilding a map per query is even worse, and unordered_map is O(1) *average*, never guaranteed — hackable on CF. A map of counts built ONCE also works; the sorted-array bounds need no extra memory.',
        hint: 'Apply the 10⁸ rule to each option before judging elegance.',
      },
      {
        id: 'tb-13', type: 'tf', diff: 1,
        statement: 'On a sorted vector, `upper_bound(v.begin(), v.end(), x)` returns an iterator to the first element **strictly greater** than x.',
        answer: true,
        explain: 'upper = first **>** x; lower = first **≥** x. When x is absent the two coincide (count zero); when present, they bracket exactly its copies. The ≥/> pair is worth reciting until it’s reflex.',
      },
    ],
    problems: [
      { name: 'Towers', platform: 'CSES', id: '1073', url: 'https://cses.fi/problemset/task/1073', difficulty: 'med', why: 'Greedy with multiset upper_bound: place each cube on the smallest top strictly bigger than it.' },
      { name: 'Sum of Three Values', platform: 'CSES', id: '1641', url: 'https://cses.fi/problemset/task/1641', difficulty: 'med', why: 'Sort, fix one value, then hunt the other two with scans/lookups on the sorted array — indices need care.' },
    ],
  },
};

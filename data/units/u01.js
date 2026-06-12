// ============================================================================
// data/units/u01.js — Unit 1: C++ Bootcamp
// The language layer: I/O, types, control flow, functions, vectors, strings.
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'cpp-hello': {
    id: 'cpp-hello',
    objectives: [
      'Write a complete contest solution skeleton from memory',
      'Read and write values with cin/cout, fast I/O enabled',
      'Understand why endl is slower than "\\n"',
    ],
    theory: [
      {
        h: 'Every solution is the same program',
        md: 'A contest solution is a tiny pipeline: **read input → compute → print output**. No menus, no prompts, no "Please enter n:" — the judge pipes a file into your program and compares your output character-for-character.',
        code: `#include <bits/stdc++.h>   // every STL header at once (GCC)
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;          // reads "3 5" or "3\\n5" the same way
    cout << a + b << "\\n";  // print result + newline
    return 0;
}`,
      },
      {
        h: 'Fast I/O: the two magic lines',
        md: 'With large inputs (10⁵+ numbers), default `cin` is slow because it stays synchronized with C’s `scanf` and flushes `cout` before every read. Two lines fix it — put them at the top of `main` in **every** solution.',
        code: `int main() {
    ios::sync_with_stdio(false);  // unhook from C stdio  → big speedup
    cin.tie(nullptr);             // stop flushing cout before each cin
    ...
}`,
        note: 'Use `"\\n"` instead of `endl`. `endl` forces a flush to the terminal **every line** — on a million lines that alone can TLE.',
        noteKind: 'warn',
      },
      {
        h: 'Reading sequences and unknown-length input',
        md: '`cin >> x` skips whitespace and newlines automatically — you almost never care how the numbers are arranged. To read until the input ends, use the stream itself as a condition.',
        code: `int n;
cin >> n;                       // size first (the usual pattern)
vector<int> a(n);
for (auto &x : a) cin >> x;     // then n values

long long v;
while (cin >> v) { /* until EOF */ }`,
      },
      {
        h: 'Multiple test cases per run',
        md: 'Many problems bundle `t` independent test cases into one input. Read `t`, loop, and be careful that **state from one case never leaks into the next** (re-create your arrays inside the loop).',
        code: `int t;
cin >> t;
while (t--) {
    int n; cin >> n;
    vector<int> a(n);           // fresh every case
    for (auto &x : a) cin >> x;
    // solve this case, print this case's answer
}`,
      },
      {
        h: 'What the judge says back',
        md: 'You’ll meet these verdicts everywhere:\n\n**AC** — accepted. **WA** — wrong answer (output differs). **TLE** — time limit exceeded (too slow). **RE** — runtime error (crash: bad index, overflow trap, stack overflow). **CE** — compile error.\n\nEvery verdict except AC is *information*. WA on test 2 usually means an edge case; TLE means your complexity is wrong (next unit).',
      },
    ],
    exercises: [
      {
        id: 'hello-1', type: 'mcq', diff: 1,
        prompt: 'What does a judge actually do with your program?',
        options: [
          'Pipes a hidden input file to stdin and compares your stdout to the expected output',
          'Reads your code and checks if the logic looks right',
          'Runs it interactively, typing inputs like a human',
          'Compares your code to the official solution code',
        ],
        answer: 0,
        explain: 'Judges are character-comparing robots: input file in, your stdout out, `diff` against the expected file. Style, comments, and variable names are invisible to it.',
      },
      {
        id: 'hello-2', type: 'output', diff: 1,
        prompt: 'What does this program print when the input is `4 7`?',
        code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << "\\n";
}`,
        answer: '28',
        explain: '`cin >> a >> b` reads 4 then 7 (whitespace-separated), and `a * b` is 28. Tracing tiny programs by hand is the #1 skill to build first.',
      },
      {
        id: 'hello-3', type: 'bank', diff: 1,
        prompt: 'Complete the fast-I/O setup.',
        code: `int main() {
    ios::___(false);
    cin.___(nullptr);
}`,
        answer: ['sync_with_stdio', 'tie'],
        distractors: ['flush', 'fast_io'],
        explain: '`ios::sync_with_stdio(false)` unhooks C++ streams from C stdio; `cin.tie(nullptr)` stops cout from flushing before every read. Together: dramatically faster I/O.',
      },
      {
        id: 'hello-4', type: 'tf', diff: 1,
        statement: '`endl` and `"\\n"` print the same character, so they are interchangeable in contests.',
        answer: false,
        explain: 'Both emit a newline, but `endl` **also flushes the output buffer** every time. On 10⁶ lines that flush cost alone can turn AC into TLE. Use `"\\n"`.',
      },
      {
        id: 'hello-5', type: 'parsons', diff: 2,
        prompt: 'Assemble a complete program that reads n, then n integers, and prints their sum.',
        lines: [
          '#include <bits/stdc++.h>',
          'using namespace std;',
          'int main() {',
          '    int n;',
          '    cin >> n;',
          '    long long sum = 0;',
          '    for (int i = 0; i < n; i++) {',
          '        int x;',
          '        cin >> x;',
          '        sum += x;',
          '    }',
          '    cout << sum << "\\n";',
          '}',
        ],
        explain: 'The eternal shape: read size → loop reading values → accumulate → print. `sum` is `long long` because n values of up to 10⁹ overflow an `int` fast.',
      },
      {
        id: 'hello-6', type: 'mcq', diff: 2,
        prompt: 'Your program prints `Sum: 12` but the expected output is `12`. Verdict?',
        options: [
          'WA — wrong answer: output must match exactly',
          'AC — judges ignore labels',
          'CE — invalid output format is a compile issue',
          'TLE — extra printing is slow',
        ],
        answer: 0,
        explain: 'The judge compares text. `Sum: 12` ≠ `12`, so Wrong Answer. Print **exactly** what the output format section asks — nothing more, nothing less.',
      },
      {
        id: 'hello-7', type: 'output', diff: 2,
        prompt: 'Input is:\n```\n3\n10 20 30\n```\nWhat does this print?',
        code: `int main() {
    int t;
    cin >> t;
    while (t--) {
        int x;
        cin >> x;
        cout << x * 2 << "\\n";
    }
}`,
        answer: '20\n40\n60',
        explain: '`while (t--)` runs exactly t=3 times (t becomes 2,1,0). Each iteration reads one number and prints its double on its own line. Newlines matter in your answer!',
      },
      {
        id: 'hello-8', type: 'fill', diff: 2,
        prompt: 'Fill the loop condition that reads numbers **until the input runs out** (EOF):\n`while (___) { ... }`',
        code: `long long v;
while (___) {
    // process v
}`,
        answer: ['cin >> v', '(cin >> v)'],
        placeholder: 'cin …',
        explain: '`cin >> v` returns the stream, which converts to `false` once reading fails (EOF or bad data). The classic read-everything loop: `while (cin >> v)`.',
      },
      {
        id: 'hello-9', type: 'mcq', diff: 2,
        prompt: 'A multi-testcase solution passes case 1 but gives wrong answers for cases 2..t. The most likely bug?',
        code: `int cnt = 0;          // global
void solve() {
    int n; cin >> n;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (x > 0) cnt++;
    }
    cout << cnt << "\\n";
}`,
        options: [
          'cnt is never reset between test cases',
          'n is read incorrectly',
          'The loop should start at i = 1',
          'cout should use endl',
        ],
        answer: 0,
        explain: '`cnt` is global and keeps growing across cases — case 2 starts with case 1’s count. **State leaking between test cases** is one of the most common bugs in all of competitive programming. Reset, or declare inside `solve()`.',
        hint: 'Run case 2 in your head. What is cnt when it starts?',
      },
      {
        id: 'hello-10', type: 'match', diff: 1,
        prompt: 'Match each verdict to its meaning.',
        pairs: [
          ['AC', 'output correct'],
          ['WA', 'output differs'],
          ['TLE', 'too slow'],
          ['RE', 'crashed'],
          ['CE', 'didn’t compile'],
        ],
        explain: 'AC=accepted, WA=wrong answer, TLE=time limit exceeded, RE=runtime error, CE=compile error. Each non-AC verdict tells you *where* to look.',
      },
      {
        id: 'hello-11', type: 'code', diff: 3,
        prompt: 'Write the full program: read `n`, then `n` integers, print the **largest** one.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // your code here

    return 0;
}`,
        tests: [
          { input: '5\n3 9 2 9 1', expected: '9' },
          { input: '1\n-42', expected: '-42' },
          { input: '4\n-5 -2 -8 -1', expected: '-1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int best = INT_MIN;          // works even when all values are negative
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        best = max(best, x);
    }
    cout << best << "\\n";
    return 0;
}`,
        explain: 'Initialize `best` to `INT_MIN` (or the first element) — initializing to `0` silently fails on all-negative input. That’s test 3, and it catches thousands of real submissions.',
        hint: 'What should `best` start as, so that the first comparison always wins?',
      },
      {
        id: 'hello-12', type: 'order', diff: 1,
        prompt: 'Order the lifecycle of solving one problem, start to finish.',
        items: [
          'Read the statement and constraints',
          'Design the approach on paper',
          'Type the code',
          'Test on the sample input',
          'Submit and read the verdict',
        ],
        explain: 'Statement → plan → code → sample test → submit. Skipping "plan on paper" or "test on samples" is how 20-minute problems become 2-hour problems.',
      },
    ],
    problems: [
      { name: 'Weird Algorithm', platform: 'CSES', id: '1068', url: 'https://cses.fi/problemset/task/1068', difficulty: 'intro', why: 'Pure I/O + loop: the Collatz simulation. Mind the long long!' },
      { name: 'Watermelon', platform: 'Codeforces', id: '4A', rating: 800, url: 'https://codeforces.com/problemset/problem/4/A', difficulty: 'intro', why: 'The classic first problem. One condition — and one famous edge case.' },
      { name: 'Way Too Long Words', platform: 'Codeforces', id: '71A', rating: 800, url: 'https://codeforces.com/problemset/problem/71/A', difficulty: 'intro', why: 'Read words, print transformed words. Pure I/O reps.' },
      { name: 'Team', platform: 'Codeforces', id: '231A', rating: 800, url: 'https://codeforces.com/problemset/problem/231/A', difficulty: 'intro', why: 'Read t cases of 3 numbers, count by condition — the multi-case pattern.' },
    ],
  },

  // ==========================================================================
  'cpp-types': {
    id: 'cpp-types',
    objectives: [
      'Choose int vs long long from the constraints, before writing code',
      'Spot overflow in arithmetic expressions',
      'Use integer division/modulo correctly, and know when doubles betray you',
    ],
    theory: [
      {
        h: 'The two integers that matter',
        md: '`int` holds about **±2.1·10⁹** (2³¹−1 = 2147483647). `long long` holds about **±9.2·10¹⁸** (2⁶³−1). That’s the whole decision:\n\nValues or *intermediate results* can exceed 2·10⁹? → `long long`. Contest habit: `using ll = long long;` and use `ll` whenever in doubt.',
        code: `using ll = long long;

int  small = 2'000'000'000;        // near the limit already
ll   big   = 9'000'000'000'000'000'000LL;  // fine`,
      },
      {
        h: 'Overflow hides in the middle of expressions',
        md: 'The trap is rarely the final answer — it’s the **intermediate value**. `a * b` of two ints is computed *as an int* even if you store it in a long long. The multiplication overflows before the assignment happens.',
        code: `int a = 100000, b = 100000;
ll bad  = a * b;          // int*int overflows FIRST → garbage
ll good = (ll)a * b;      // promote one side: 64-bit multiply ✓`,
        note: 'Overflow in C++ is undefined behavior — no error, no warning at runtime, just wrong numbers. `n ≤ 10⁵` with sums/products is the classic setup: 10⁵ × 10⁵ = 10¹⁰ > int.',
        noteKind: 'danger',
      },
      {
        h: 'Integer division and modulo',
        md: '`/` between integers **truncates toward zero**: `7 / 2 == 3`, `-7 / 2 == -3`. `%` gives the remainder with the sign of the dividend: `-7 % 2 == -1`.\n\nCeiling division without doubles: `(a + b - 1) / b` (for positive a, b).',
        code: `int pages = (n + k - 1) / k;   // ceil(n / k), all integers

// parity
if (x % 2 == 0) { /* even */ }`,
      },
      {
        h: 'Doubles: useful, treacherous',
        md: '`double` has ~15-16 significant digits and rounding error. `0.1 + 0.2 != 0.3`. Two rules:\n\n1. If a problem can be solved in integers, **solve it in integers**.\n2. If you must compare doubles, compare with a tolerance: `abs(a - b) < 1e-9`.',
        code: `double x = 0.1 + 0.2;
// x == 0.3 is FALSE (x is 0.30000000000000004)
bool eq = fabs(x - 0.3) < 1e-9;   // ✓`,
      },
      {
        h: 'char, bool, and casting',
        md: '`char` is a small integer: `\'7\' - \'0\' == 7` converts digit characters to values, `\'c\' - \'a\'` gives a letter’s alphabet index. `bool` is 0 or 1 — summing bools counts true things. Cast explicitly with `(ll)x` or `ll(x)` when promoting.',
        code: `char c = '7';
int digit = c - '0';        // 7
int idx   = 'k' - 'a';      // 10 (0-based alphabet position)`,
      },
    ],
    exercises: [
      {
        id: 'types-1', type: 'mcq', diff: 1,
        prompt: 'Constraints say `1 ≤ n ≤ 2·10⁵` and values `1 ≤ aᵢ ≤ 10⁹`. You need the **sum** of all values. The sum variable must be:',
        options: ['long long — the sum reaches 2·10¹⁴', 'int — each value fits in int', 'double — sums need decimals', 'unsigned int — sums are positive'],
        answer: 0,
        explain: 'Worst case: 2·10⁵ × 10⁹ = 2·10¹⁴, way past int’s 2.1·10⁹. Each *element* fits in int, but the *sum* doesn’t — always size the accumulator, not just the elements.',
      },
      {
        id: 'types-2', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    cout << 7 / 2 << " " << 7 % 2 << "\\n";
}`,
        answer: '3 1',
        explain: 'Integer division truncates: 7/2 = 3. Modulo gives the remainder: 7 = 2·3 + **1**. Division and remainder are a package deal: `a == (a/b)*b + a%b`.',
      },
      {
        id: 'types-3', type: 'mcq', diff: 2,
        prompt: 'Which line is the bug?',
        code: `int n = 100000;            // line 1
long long total = n * n;   // line 2
cout << total << "\\n";     // line 3`,
        options: [
          'Line 2 — n * n overflows as int before becoming long long',
          'Line 1 — n is too big for int',
          'Line 3 — cout cannot print long long',
          'No bug — total is a long long, so it’s fine',
        ],
        answer: 0,
        explain: '`n * n` multiplies int×int → int → overflow (10¹⁰ > 2.1·10⁹), and only THEN converts the garbage to long long. Fix: `(ll)n * n`. The target type never rescues an already-overflowed expression.',
        hint: 'When does the conversion to long long happen — before or after the multiply?',
      },
      {
        id: 'types-4', type: 'fill', diff: 2,
        prompt: 'Fix the overflow with a cast — fill in the blank: `ll area = ___ * w;` (where `int h, w` can each be 10⁹)',
        answer: ['(ll)h', '(long long)h', 'll(h)', '(ll) h'],
        placeholder: '(…)h',
        explain: 'Promote **one operand** before the multiply: `(ll)h * w`. The other side is promoted automatically, and the multiplication happens in 64 bits.',
      },
      {
        id: 'types-5', type: 'tf', diff: 1,
        statement: 'In C++, `0.1 + 0.2 == 0.3` evaluates to true.',
        answer: false,
        explain: 'Binary floating point can’t represent 0.1 or 0.2 exactly; the sum is 0.30000000000000004. Compare doubles with a tolerance (`fabs(a-b) < 1e-9`) or avoid doubles entirely.',
      },
      {
        id: 'types-6', type: 'fill', diff: 2,
        prompt: 'Write the integer-only expression for **ceil(n / k)** (n, k positive ints):',
        answer: ['(n+k-1)/k', '(n + k - 1) / k', '(n-1)/k+1', '(n - 1) / k + 1'],
        placeholder: '(n …) / k',
        explain: '`(n + k - 1) / k` rounds up using pure integer math: when n is a multiple of k it adds not-quite-enough to bump the quotient; otherwise it pushes past the boundary. Equivalent: `(n-1)/k + 1`.',
      },
      {
        id: 'types-7', type: 'output', diff: 2,
        prompt: 'What does this print?',
        code: `int main() {
    char c = 'd';
    cout << c - 'a' << "\\n";
}`,
        answer: '3',
        explain: '`char` is an integer underneath. `\'d\' - \'a\'` = 100 − 97 = 3: d is the 4th letter, index 3 from zero. This idiom powers letter-frequency arrays: `cnt[c - \'a\']++`.',
      },
      {
        id: 'types-8', type: 'match', diff: 1,
        prompt: 'Match each situation to the right tool.',
        pairs: [
          ['sum of 10⁵ values ≤ 10⁹', 'long long'],
          ['loop counter to 10⁵', 'int'],
          ['exists / doesn’t exist', 'bool'],
          ['“output 2 decimal places”', 'double'],
          ['single letter of a word', 'char'],
        ],
        explain: 'Sums of many big values overflow int → long long. Counters fit int. Flags are bool, decimal output means double (printf("%.2f") or cout << fixed << setprecision(2)), letters are char.',
      },
      {
        id: 'types-9', type: 'mcq', diff: 3,
        prompt: 'This computes the average of two large positive ints, but sometimes crashes or returns nonsense. Why?',
        code: `int mid = (lo + hi) / 2;   // lo, hi up to 2*10^9 ... wait, int max`,
        options: [
          '`lo + hi` can exceed INT_MAX even when both fit individually',
          'Division by 2 truncates, which is incorrect for midpoints',
          'mid should be unsigned',
          'Nothing is wrong; the bug is elsewhere',
        ],
        answer: 0,
        explain: 'Two values near 2·10⁹ sum to ~4·10⁹ → int overflow. The classic fix you’ll write a thousand times in binary search: `lo + (hi - lo) / 2`. The difference always fits.',
        hint: 'Both fit. Does their sum?',
      },
      {
        id: 'types-10', type: 'bank', diff: 2,
        prompt: 'Complete the digit-extraction loop (sums the digits of n).',
        code: `int digitSum(ll n) {
    int s = 0;
    while (n > 0) {
        s += n ___ 10;
        n ___ 10;
    }
    return s;
}`,
        answer: ['%', '/='],
        distractors: ['/', '%='],
        explain: '`n % 10` peels off the last digit; `n /= 10` drops it. The pair `% 10` then `/= 10` is the universal digit loop.',
      },
      {
        id: 'types-11', type: 'output', diff: 3,
        prompt: 'Tricky: what does this print?',
        code: `int main() {
    int a = -7;
    cout << a / 2 << " " << a % 2 << "\\n";
}`,
        answer: '-3 -1',
        explain: 'C++ truncates toward **zero**: -7/2 = -3 (not -4!). The remainder keeps the dividend’s sign: -7 % 2 = -1. When you need a non-negative mod: `((a % m) + m) % m`.',
        hint: 'Truncation rounds toward zero, not toward minus infinity.',
      },
      {
        id: 'types-12', type: 'tf', diff: 2,
        statement: 'Signed integer overflow in C++ is undefined behavior — the compiler may assume it never happens.',
        answer: true,
        explain: 'UB means anything goes: wrong values, optimized-away checks, crashes that appear only with -O2. This is why overflow bugs are so nasty — the program *looks* fine on small tests.',
      },
    ],
    problems: [
      { name: 'Missing Number', platform: 'CSES', id: '1083', url: 'https://cses.fi/problemset/task/1083', difficulty: 'intro', why: 'Sum formula n(n+1)/2 — instant overflow check for your habits.' },
      { name: 'Theatre Square', platform: 'Codeforces', id: '1A', rating: 1000, url: 'https://codeforces.com/problemset/problem/1/A', difficulty: 'easy', why: 'Ceiling division ×2, and the product overflows int. The original CF problem.' },
      { name: 'Domino piling', platform: 'Codeforces', id: '50A', rating: 800, url: 'https://codeforces.com/problemset/problem/50/A', difficulty: 'intro', why: 'One formula with integer division — prove it to yourself first.' },
      { name: 'Trailing Zeros', platform: 'CSES', id: '1618', url: 'https://cses.fi/problemset/task/1618', difficulty: 'easy', why: 'Count factors of 5 in n! — divisions all the way down.' },
    ],
  },

  // ==========================================================================
  'cpp-control': {
    id: 'cpp-control',
    objectives: [
      'Translate conditions into if/else chains without redundancy',
      'Pick the right loop and bounds (off-by-one immunity)',
      'Use break/continue and loop nesting deliberately',
    ],
    theory: [
      {
        h: 'Conditions: chains and short-circuits',
        md: '`if / else if / else` evaluates top-down and runs **exactly one** branch. `&&` and `||` short-circuit: the right side isn’t evaluated when the left side decides. That’s a feature — use it to guard:',
        code: `// safe: i < n is checked BEFORE a[i] is touched
if (i < n && a[i] > 0) { ... }

// classic chain — order matters
if (score >= 90) grade = 'A';
else if (score >= 80) grade = 'B';
else grade = 'C';`,
      },
      {
        h: 'The contest for-loop',
        md: '`for (int i = 0; i < n; i++)` runs exactly n times, i taking 0..n−1 — matching 0-indexed arrays. Inclusive ranges use `<=`. Counting down: `for (int i = n - 1; i >= 0; i--)`.\n\nOff-by-one errors die when you ask two questions: *first value of i? last value of i?*',
        code: `for (int i = 0; i < n; i++)      // 0, 1, ..., n-1  (n times)
for (int i = 1; i <= n; i++)     // 1, 2, ..., n    (n times)
for (int i = n - 1; i >= 0; i--) // n-1, ..., 0     (reverse)`,
      },
      {
        h: 'while, break, continue',
        md: '`while` loops until the condition fails. `break` exits the **innermost** loop immediately; `continue` skips to the next iteration. Both are normal, idiomatic contest code — clarity beats purity.',
        code: `while (x > 1) {
    if (x % 2 == 0) x /= 2;
    else x = 3 * x + 1;
}

for (int i = 0; i < n; i++) {
    if (a[i] < 0) continue;   // skip negatives
    if (a[i] == target) { pos = i; break; }
}`,
      },
      {
        h: 'Nested loops = pairs, grids, all-combinations',
        md: 'Two nested loops over n elements visit n² combinations — that’s both their power and their cost. The "all ordered pairs" and "all unordered pairs" patterns:',
        code: `// all ordered pairs (i, j), i ≠ j allowed both ways
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) ...

// all unordered pairs i < j  → n(n-1)/2 iterations
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) ...`,
        note: 'Starting the inner loop at `j = i + 1` is how you avoid double-counting pairs and self-pairs. You will write this exact loop hundreds of times.',
      },
      {
        h: 'Loop + flag / loop + best',
        md: 'Two micro-patterns cover most "scan an array" tasks:\n\n**Flag**: start `bool found = false;`, set true inside, check after. **Best-so-far**: start with the first element or a sentinel (`INT_MIN`), update with `max`/`min` inside.',
        code: `bool any = false;
int best = INT_MIN;
for (int i = 0; i < n; i++) {
    if (a[i] == x) any = true;
    best = max(best, a[i]);
}`,
      },
    ],
    exercises: [
      {
        id: 'ctrl-1', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    for (int i = 0; i < 4; i++)
        cout << i * i << " ";
}`,
        answer: '0 1 4 9',
        explain: 'i runs 0,1,2,3 (stops when i < 4 fails). Squares: 0 1 4 9. Note the trailing space — judges usually accept it, but know your output exactly.',
      },
      {
        id: 'ctrl-2', type: 'mcq', diff: 1,
        prompt: 'How many times does this loop body run?',
        code: `for (int i = 1; i <= n; i += 2) { ... }   // n = 10`,
        options: ['5', '10', '4', '6'],
        answer: 0,
        explain: 'i = 1, 3, 5, 7, 9 — five odd values ≤ 10. Step-2 loops over 1..n run ⌈n/2⌉ times.',
      },
      {
        id: 'ctrl-3', type: 'output', diff: 2,
        prompt: 'Trace carefully. Output?',
        code: `int main() {
    int x = 7, steps = 0;
    while (x != 1) {
        if (x % 2 == 0) x /= 2;
        else x = 3 * x + 1;
        steps++;
    }
    cout << steps << "\\n";
}`,
        answer: '16',
        explain: 'Collatz from 7: 7→22→11→34→17→52→26→13→40→20→10→5→16→8→4→2→1. Count the arrows: 16 steps. Slow, careful tracing — this is CSES 1068’s core.',
        hint: 'Write the sequence: odd → 3x+1, even → x/2. Count transitions, not numbers.',
      },
      {
        id: 'ctrl-4', type: 'parsons', diff: 2,
        prompt: 'Assemble: count how many of the n numbers are **strictly greater** than the one before them.',
        lines: [
          'int n, prev, cur, cnt = 0;',
          'cin >> n >> prev;',
          'for (int i = 1; i < n; i++) {',
          '    cin >> cur;',
          '    if (cur > prev) cnt++;',
          '    prev = cur;',
          '}',
          'cout << cnt << "\\n";',
        ],
        distractors: [
          '    if (cur >= prev) cnt++;',
        ],
        explain: 'Read the first value outside the loop, then compare each new value to the previous and slide `prev` forward. The distractor `>=` counts equal neighbors too — read "strictly" carefully.',
      },
      {
        id: 'ctrl-5', type: 'mcq', diff: 2,
        prompt: 'What is the bug?',
        code: `// find whether value x exists in a[0..n-1]
bool found;
for (int i = 0; i < n; i++) {
    if (a[i] == x) found = true;
    else found = false;
}`,
        options: [
          'found is overwritten every iteration — it only reflects the LAST element',
          'The loop bounds are wrong',
          'found should be an int',
          'It should break when found',
        ],
        answer: 0,
        explain: 'The `else found = false;` erases earlier finds: the loop ends with "is the last element x?". Set the flag once (`if (a[i]==x) found = true;`) and never un-set it. (Also: `found` starts uninitialized!)',
      },
      {
        id: 'ctrl-6', type: 'tf', diff: 1,
        statement: 'In nested loops, `break` exits all the loops at once.',
        answer: false,
        explain: '`break` exits only the **innermost** enclosing loop. To exit several levels: set a flag and check it in the outer loop, return from a function, or (pragmatically) use `goto done;` — yes, it’s accepted in contests.',
      },
      {
        id: 'ctrl-7', type: 'fill', diff: 2,
        prompt: 'All **unordered pairs** (i, j) with i < j: complete the inner loop start.\n`for (int i = 0; i < n; i++) for (int j = ___; j < n; j++)`',
        answer: ['i+1', 'i + 1'],
        placeholder: 'j = …',
        explain: 'Starting j at i+1 visits each pair exactly once (and never pairs an element with itself): n(n−1)/2 iterations total.',
      },
      {
        id: 'ctrl-8', type: 'output', diff: 2,
        prompt: 'Output? (Watch the continue.)',
        code: `int main() {
    for (int i = 1; i <= 6; i++) {
        if (i % 2 == 0) continue;
        cout << i;
    }
}`,
        answer: '135',
        explain: '`continue` skips even i before the print. Odd survivors: 1, 3, 5 — printed with no separators: `135`.',
      },
      {
        id: 'ctrl-9', type: 'bank', diff: 2,
        prompt: 'FizzBuzz-style: print "X" if divisible by both 3 and 5, else "F" if by 3, else "B" if by 5, else the number. Complete the conditions **in the right order**.',
        code: `if (n % ___ == 0) cout << "X";
else if (n % ___ == 0) cout << "F";
else if (n % ___ == 0) cout << "B";
else cout << n;`,
        answer: ['15', '3', '5'],
        distractors: ['8'],
        explain: 'The most specific condition (divisible by 15 = both) must come **first** — if `% 3` were checked first, 15 would print "F" and never reach the both-case. Order if-chains from specific to general.',
      },
      {
        id: 'ctrl-10', type: 'code', diff: 3,
        prompt: 'Read n, then n integers. Print the length of the **longest run of equal consecutive values**.\nExample: `1 1 2 2 2 3` → `3`.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    // your code

    return 0;
}`,
        tests: [
          { input: '6\n1 1 2 2 2 3', expected: '3' },
          { input: '1\n5', expected: '1' },
          { input: '5\n7 7 7 7 7', expected: '5' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    int prev = 0, run = 0, best = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (i > 0 && x == prev) run++;
        else run = 1;
        best = max(best, run);
        prev = x;
    }
    cout << best << "\\n";
    return 0;
}`,
        explain: 'Run-length scanning: extend the run when the value repeats, reset to 1 when it changes, track the max. Single pass, O(n) — and watch n=1 (answer is 1, not 0).',
        hint: 'Track: current run length, best so far, previous value. What happens at the first element?',
      },
      {
        id: 'ctrl-11', type: 'mcq', diff: 3,
        prompt: 'This loop is meant to run n times but never ends. Why?',
        code: `for (unsigned int i = n - 1; i >= 0; i--) {
    // process a[i]
}`,
        options: [
          'unsigned can’t go below 0 — after 0 it wraps to a huge number, so i >= 0 is always true',
          'i-- should be --i',
          'It should start at n, not n - 1',
          'The condition should be i > 0',
        ],
        answer: 0,
        explain: '`unsigned >= 0` is **always true**: 0 − 1 wraps to 4294967295. Use a signed `int` for countdown loops (also why mixing `size_t` from `.size()` with subtraction is dangerous: `for (int i = (int)v.size() - 1; i >= 0; i--)`).',
        hint: 'What is 0 − 1 for an unsigned integer?',
      },
    ],
    problems: [
      { name: 'Repetitions', platform: 'CSES', id: '1069', url: 'https://cses.fi/problemset/task/1069', difficulty: 'intro', why: 'Longest run scanning — exactly the pattern from this lesson.' },
      { name: 'Increasing Array', platform: 'CSES', id: '1094', url: 'https://cses.fi/problemset/task/1094', difficulty: 'intro', why: 'One pass, one accumulator, one overflow trap.' },
      { name: 'Next Round', platform: 'Codeforces', id: '158A', rating: 800, url: 'https://codeforces.com/problemset/problem/158/A', difficulty: 'intro', why: 'Loop + compound condition. Read the statement twice.' },
      { name: 'Queue at the School', platform: 'Codeforces', id: '266B', rating: 800, url: 'https://codeforces.com/problemset/problem/266/B', difficulty: 'easy', why: 'Nested loop simulation, careful with in-place swaps.' },
    ],
  },

  // ==========================================================================
  'cpp-functions': {
    id: 'cpp-functions',
    objectives: [
      'Pass big data by reference (and know why)',
      'Decompose solutions into functions without copying bugs',
      'Read and write basic recursion with a base case',
    ],
    theory: [
      {
        h: 'Functions: the solve() pattern',
        md: 'Functions carve a solution into named steps. The most common contest layout puts each test case in `solve()` — locals reset automatically every call, killing the state-leak bug family.',
        code: `void solve() {
    int n;
    cin >> n;            // everything local: fresh per test case
    // ...
    cout << answer << "\\n";
}

int main() {
    int t;
    cin >> t;
    while (t--) solve();
}`,
      },
      {
        h: 'By value vs by reference',
        md: 'Parameters are **copied** by default. Copying an int is free; copying a vector of 10⁶ elements is a performance bug. Pass big things by reference `&` (no copy), and add `const` when you only read:',
        code: `ll sum(const vector<ll>& a) {   // const ref: no copy, read-only
    ll s = 0;
    for (ll x : a) s += x;
    return s;
}

void addOne(vector<ll>& a) {     // non-const ref: modifies caller's vector
    for (ll& x : a) x++;         // note: ll& inside the loop too!
}`,
        note: 'A function that takes `vector<int> v` (no `&`) copies the whole vector **every call**. Inside loops, that alone can TLE.',
        noteKind: 'warn',
      },
      {
        h: 'Recursion = a function that trusts itself',
        md: 'A recursive function handles a **base case** directly and otherwise reduces the problem and calls itself. The leap of faith: assume the recursive call is correct, and make one step of progress.',
        code: `ll fact(int n) {
    if (n <= 1) return 1;        // base case: stops the recursion
    return n * fact(n - 1);      // n * (answer for the smaller problem)
}
// fact(4): 4 * fact(3) = 4 * 3 * fact(2) = 4 * 3 * 2 * fact(1) = 24`,
      },
      {
        h: 'Tracing recursion',
        md: 'Each call gets its **own** copy of parameters and locals, stacked up. `fact(4)` literally creates frames fact(4)→fact(3)→fact(2)→fact(1), then unwinds multiplying. Two failure modes:\n\n• **No/wrong base case** → infinite recursion → stack overflow (RE).\n• **No progress toward it** → same crash.',
        code: `void countdown(int n) {
    if (n == 0) { cout << "go!\\n"; return; }
    cout << n << "\\n";
    countdown(n - 1);            // strictly smaller → terminates
}`,
      },
      {
        h: 'How deep can you go?',
        md: 'Each frame eats stack memory; typical judges allow recursion depth around **10⁵–10⁶** (more if frames are small). A DFS on a path-shaped graph with 10⁶ nodes can overflow — that’s a *real* contest consideration, solved by iterative versions or bigger stack tricks. For now: recursion depth ≈ n must stay ≤ ~10⁵.',
      },
    ],
    exercises: [
      {
        id: 'fn-1', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int twice(int x) { return 2 * x; }

int main() {
    cout << twice(twice(5)) << "\\n";
}`,
        answer: '20',
        explain: 'Inside-out: `twice(5)` = 10, then `twice(10)` = 20. Function composition evaluates innermost first.',
      },
      {
        id: 'fn-2', type: 'output', diff: 1,
        prompt: 'By value vs by reference — what does this print?',
        code: `void byVal(int x)  { x = 100; }
void byRef(int& x) { x = 100; }

int main() {
    int a = 1, b = 1;
    byVal(a);
    byRef(b);
    cout << a << " " << b << "\\n";
}`,
        answer: '1 100',
        explain: '`byVal` changes its private copy — caller’s `a` stays 1. `byRef` receives an alias to `b` itself — the caller sees 100. The `&` is the entire difference.',
      },
      {
        id: 'fn-3', type: 'mcq', diff: 2,
        prompt: 'This solution TLEs on big inputs even though the algorithm is O(n) per call. The cause?',
        code: `int countEven(vector<int> v) {      // called n times in a loop
    int c = 0;
    for (int x : v) c += (x % 2 == 0);
    return c;
}`,
        options: [
          'The vector is passed by value — each call copies all elements',
          '% is slow; use bit tricks',
          'int is too small for the count',
          'Range-for is slower than indexed loops',
        ],
        answer: 0,
        explain: 'Missing `&`: each call duplicates the entire vector — O(n) copying × n calls = O(n²) hidden cost. Write `const vector<int>& v`. This is the most common "my algorithm is right but TLE" bug for beginners.',
      },
      {
        id: 'fn-4', type: 'fill', diff: 2,
        prompt: 'Fix the signature so the vector is NOT copied but CANNOT be modified:\n`ll sum(___ a)`',
        answer: ['const vector<ll>& a', 'const vector<ll> &a', 'const vector<ll>&'],
        placeholder: 'const …',
        explain: '`const vector<ll>&` — reference (no copy) + const (read-only). The default choice for any container parameter you don’t mutate.',
      },
      {
        id: 'fn-5', type: 'output', diff: 2,
        prompt: 'Trace the recursion. Output?',
        code: `int f(int n) {
    if (n == 0) return 0;
    return n + f(n - 1);
}

int main() {
    cout << f(4) << "\\n";
}`,
        answer: '10',
        explain: 'f(4) = 4 + f(3) = 4+3+f(2) = 4+3+2+f(1) = 4+3+2+1+f(0) = 10. A recursive sum of 1..n — the warm-up for every recursion you’ll ever write.',
      },
      {
        id: 'fn-6', type: 'mcq', diff: 2,
        prompt: 'What happens when you call `bad(5)`?',
        code: `int bad(int n) {
    if (n == 0) return 0;
    return n + bad(n + 1);   // ← note the +
}`,
        options: [
          'Runtime error — n grows away from the base case until the stack overflows',
          'Returns 15 eventually',
          'Compile error — recursion needs a loop',
          'Returns 0 immediately',
        ],
        answer: 0,
        explain: 'n goes 5, 6, 7, … — never reaching the base case 0. Each call stacks a frame until the stack overflows → RE. Recursion checklist: ① base case exists ② every call moves toward it.',
      },
      {
        id: 'fn-7', type: 'parsons', diff: 2,
        prompt: 'Assemble a recursive function that prints n, n−1, …, 1, each on its own line.',
        lines: [
          'void countdown(int n) {',
          '    if (n == 0) return;',
          '    cout << n << "\\n";',
          '    countdown(n - 1);',
          '}',
        ],
        distractors: [
          '    countdown(n);',
        ],
        explain: 'Base case first (n==0 → stop), then act, then recurse on a strictly smaller value. The distractor `countdown(n)` makes no progress — infinite recursion.',
      },
      {
        id: 'fn-8', type: 'output', diff: 3,
        prompt: 'Order of prints — trace carefully!',
        code: `void g(int n) {
    if (n == 0) return;
    g(n - 1);
    cout << n << " ";
}

int main() { g(3); }`,
        answer: '1 2 3',
        explain: 'The print happens **after** the recursive call, so the deepest call prints first: g(3) waits for g(2) waits for g(1) waits for g(0)... then unwinds printing 1, 2, 3. Moving one line flips the order — that’s the difference between preorder and postorder you’ll meet in trees.',
        hint: 'Nothing prints on the way down. What prints on the way back up?',
      },
      {
        id: 'fn-9', type: 'tf', diff: 2,
        statement: 'A recursive solution with maximum depth around 10⁶ stack frames risks a stack-overflow runtime error on typical judges.',
        answer: true,
        explain: 'Stacks are megabytes, frames are tens of bytes — ~10⁵–10⁶ depth is the danger zone. Linear recursion on big inputs (or DFS on path-like graphs) should become iterative.',
      },
      {
        id: 'fn-10', type: 'code', diff: 3,
        prompt: 'Implement `power(a, b)` computing aᵇ for 0 ≤ b ≤ 15, small a — **recursively** (base case + smaller subproblem). Read `a b` from input, print the result.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll power(ll a, int b) {
    // base case?
    // recursive step?
}

int main() {
    ll a; int b;
    cin >> a >> b;
    cout << power(a, b) << "\\n";
}`,
        tests: [
          { input: '2 10', expected: '1024' },
          { input: '7 0', expected: '1' },
          { input: '5 3', expected: '125' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

ll power(ll a, int b) {
    if (b == 0) return 1;          // a^0 = 1: the base case
    return a * power(a, b - 1);    // a^b = a * a^(b-1)
}

int main() {
    ll a; int b;
    cin >> a >> b;
    cout << power(a, b) << "\\n";
}`,
        explain: 'a⁰=1 is the base case (catches test 2!), and aᵇ = a·aᵇ⁻¹ reduces toward it. Later you’ll halve the exponent instead (fast power, O(log b)) — same skeleton, smarter step.',
        hint: 'What is a⁰? That’s your base case — test 2 checks exactly this.',
      },
      {
        id: 'fn-11', type: 'match', diff: 2,
        prompt: 'Match the parameter style to its behavior.',
        pairs: [
          ['vector<int> v', 'full copy — caller unaffected'],
          ['vector<int>& v', 'no copy — caller sees changes'],
          ['const vector<int>& v', 'no copy — read-only'],
          ['int x', 'copy, but who cares (tiny)'],
        ],
        explain: 'Copy semantics in one table. Rule of thumb: containers → `const&` by default, `&` when mutating, plain value only for cheap types (int, char, bool, double).',
      },
    ],
    problems: [
      { name: 'Tower of Hanoi', platform: 'CSES', id: '2165', url: 'https://cses.fi/problemset/task/2165', difficulty: 'easy', why: 'THE recursion classic: trust the recursive call, move n−1, move 1, move n−1.' },
      { name: 'Bit++', platform: 'Codeforces', id: '282A', rating: 800, url: 'https://codeforces.com/problemset/problem/282/A', difficulty: 'intro', why: 'Tiny — perfect for practicing the solve()-per-case structure.' },
      { name: 'Beautiful Matrix', platform: 'Codeforces', id: '263A', rating: 800, url: 'https://codeforces.com/problemset/problem/263/A', difficulty: 'intro', why: 'Write a little helper to find the 1 — practice decomposition.' },
    ],
  },

  // ==========================================================================
  'cpp-vectors': {
    id: 'cpp-vectors',
    objectives: [
      'Create, fill, resize, and iterate vectors idiomatically',
      'Avoid out-of-bounds and the .size() unsigned trap',
      'Work with 2D grids (vector of vectors)',
    ],
    theory: [
      {
        h: 'vector: the default container',
        md: '`vector<T>` is a resizable array — your default for *every* sequence. Construction patterns you’ll use daily:',
        code: `vector<int> a;              // empty
vector<int> b(n);           // n zeros
vector<int> c(n, -1);       // n copies of -1
vector<ll>  d = {3, 1, 4};  // literal

a.push_back(42);            // append, amortized O(1)
int last = a.back();        // last element
a.pop_back();               // remove last
int m = a.size();           // element count`,
      },
      {
        h: 'Indexing and the bounds contract',
        md: '`a[i]` is valid for `0 ≤ i < a.size()` — **nothing else**. Out-of-bounds reads/writes are undefined behavior: sometimes a crash, often silent corruption that surfaces three lines later. The judge shows RE or WA; your local run might "work".',
        code: `vector<int> a(n);
a[n] = 5;        // ☠ UB: valid indices are 0..n-1
a.at(n) = 5;     // throws an exception instead (useful when debugging)`,
        note: 'Weird WA that you cannot reproduce? Re-check every index expression first: `i+1`, `i-1`, `2*i+1`…',
        noteKind: 'warn',
      },
      {
        h: 'Iteration: three idioms',
        code: `for (int i = 0; i < (int)a.size(); i++)  // index (cast: see below!)
    cout << a[i];

for (int x : a)        // range-for, copy of each element
    cout << x;

for (int& x : a)       // range-for by reference: can MODIFY
    x *= 2;`,
        md: '`a.size()` returns an **unsigned** type. `a.size() - 1` when the vector is empty wraps to a gigantic number, and `i < a.size()` with signed i triggers warnings. Habit: cast `(int)a.size()` or keep `int n = a.size();` up front.',
      },
      {
        h: '2D grids',
        md: 'A grid is a vector of vectors. Build it sized, then index `g[row][col]`. Reading an n×m grid:',
        code: `int n, m;
cin >> n >> m;
vector<vector<int>> g(n, vector<int>(m));
for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++)
        cin >> g[i][j];`,
        note: 'Rows first, columns second — always `g[row][col]`. Mixing them compiles fine and reads garbage (or crashes) at runtime.',
      },
      {
        h: 'Useful one-liners',
        code: `sort(a.begin(), a.end());                  // ascending
reverse(a.begin(), a.end());
ll total = accumulate(a.begin(), a.end(), 0LL);   // 0LL → sums in long long!
int mx = *max_element(a.begin(), a.end());
fill(a.begin(), a.end(), 0);
a.assign(n, 0);                            // resize + fill`,
        md: 'The `0LL` in `accumulate` sets the accumulator type — passing plain `0` sums big values **in int** and overflows. A legendary gotcha.',
      },
    ],
    exercises: [
      {
        id: 'vec-1', type: 'mcq', diff: 1,
        prompt: 'Which line creates a vector of n elements, all equal to 1?',
        options: ['`vector<int> v(n, 1);`', '`vector<int> v(1, n);`', '`vector<int> v = {n, 1};`', '`vector<int> v[n] = 1;`'],
        answer: 0,
        explain: 'The two-argument constructor is `(count, value)`. Swapping them — `v(1, n)` — gives ONE element with value n. A silent killer in fast typing.',
      },
      {
        id: 'vec-2', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    vector<int> v = {5, 8, 13};
    v.push_back(21);
    cout << v.size() << " " << v.back() << "\\n";
}`,
        answer: '4 21',
        explain: 'push_back grows the size from 3 to 4; `back()` is the newly appended 21.',
      },
      {
        id: 'vec-3', type: 'mcq', diff: 2,
        prompt: 'n can be 0 in this problem. Why does this loop crash (or behave insanely) when n = 0?',
        code: `vector<int> a(n);
for (int i = 0; i <= a.size() - 1; i++) {
    cin >> a[i];
}`,
        options: [
          'a.size() is unsigned: 0 − 1 wraps to a huge number, so the loop runs (and indexes) wildly out of bounds',
          'You can’t create a vector with 0 elements',
          'cin fails on empty vectors',
          'The loop should use ++i instead of i++',
        ],
        answer: 0,
        explain: '`a.size()` is unsigned; `0 - 1` becomes ~4.29 billion, so `i <= huge` runs forever, smashing memory via `a[i]`. Write `i < (int)a.size()` — `<` with a cast — and the empty case is naturally safe.',
        hint: 'Evaluate `a.size() - 1` when size() is 0… in unsigned arithmetic.',
      },
      {
        id: 'vec-4', type: 'bank', diff: 2,
        prompt: 'Read an n×m grid into `g`.',
        code: `vector<vector<int>> g(n, vector<int>(___));
for (int i = 0; i < n; i++)
    for (int j = 0; j < ___; j++)
        cin >> g[___][___];`,
        answer: ['m', 'm', 'i', 'j'],
        distractors: ['n', 'j', 'i'],
        explain: 'n rows, each a vector of m columns; outer loop over rows i, inner over columns j, indexed `g[i][j]`. Rows-then-columns, always.',
      },
      {
        id: 'vec-5', type: 'output', diff: 2,
        prompt: 'What does this print?',
        code: `int main() {
    vector<int> v = {1, 2, 3};
    for (int x : v) x *= 10;       // ← look closely
    for (int x : v) cout << x << " ";
}`,
        answer: '1 2 3',
        explain: '`for (int x : v)` copies each element — multiplying the copy changes nothing. To mutate, take a reference: `for (int& x : v) x *= 10;`. One ampersand, completely different program.',
        hint: 'Is x the element itself, or a copy of it?',
      },
      {
        id: 'vec-6', type: 'fill', diff: 2,
        prompt: 'Sum a vector of large values safely (avoid int overflow inside accumulate):\n`ll s = accumulate(a.begin(), a.end(), ___);`',
        answer: ['0LL', '0ll', '(ll)0', 'll(0)'],
        placeholder: '0…',
        explain: 'The third argument’s **type** is the accumulator’s type. Plain `0` is an int → the sum is computed in int → overflow. `0LL` makes it a long long. Tiny literal, huge consequence.',
      },
      {
        id: 'vec-7', type: 'parsons', diff: 2,
        prompt: 'Assemble: reverse a vector **in place** with two indices (no reverse()).',
        lines: [
          'int l = 0, r = (int)a.size() - 1;',
          'while (l < r) {',
          '    swap(a[l], a[r]);',
          '    l++;',
          '    r--;',
          '}',
        ],
        distractors: [
          'while (l <= r) {',
        ],
        explain: 'Two pointers walking inward, swapping. `l < r` stops correctly for both even and odd lengths (`l <= r` also works here but pointlessly swaps the middle element with itself — and the habit bites in trickier two-pointer code).',
      },
      {
        id: 'vec-8', type: 'mcq', diff: 2,
        prompt: 'Count occurrences of each value 1..100 in the input. Which is the idiomatic setup?',
        options: [
          '`vector<int> cnt(101, 0);` then `cnt[x]++;` per value',
          '`vector<int> cnt(100);` then `cnt[x]++;`',
          '`int cnt[100]; cnt[x]++;`',
          '`vector<int> cnt; cnt[x]++;`',
        ],
        answer: 0,
        explain: 'Size 101 so index 100 is valid (values are 1..100 → indices 1..100). Option 2 overflows on x=100; option 3 is uninitialized garbage; option 4 indexes an empty vector. **Counting arrays** are the first “data structure” of competitive programming.',
      },
      {
        id: 'vec-9', type: 'output', diff: 3,
        prompt: 'Tricky one. Output?',
        code: `int main() {
    vector<int> v;
    for (int i = 1; i <= 3; i++) v.push_back(i * i);
    v.pop_back();
    v.push_back(100);
    cout << v[0] + v.back() << "\\n";
}`,
        answer: '101',
        explain: 'v becomes {1,4,9} → pop → {1,4} → push 100 → {1,4,100}. v[0]+v.back() = 1+100 = 101. Mutation sequences reward careful state tracking — write the vector contents at each step.',
      },
      {
        id: 'vec-10', type: 'code', diff: 3,
        prompt: 'Read n and a vector of n ints. Print the **second largest distinct** value, or `-1` if all values are equal.\nExample: `4 / 3 9 9 5` → `5`.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    // your code

    return 0;
}`,
        tests: [
          { input: '4\n3 9 9 5', expected: '5' },
          { input: '3\n7 7 7', expected: '-1' },
          { input: '5\n1 2 3 4 5', expected: '4' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    int best = a[n - 1];
    for (int i = n - 2; i >= 0; i--) {
        if (a[i] != best) {
            cout << a[i] << "\\n";
            return 0;
        }
    }
    cout << -1 << "\\n";
    return 0;
}`,
        explain: 'Sort, take the max, walk left until a *different* value appears. "Second largest" with duplicates is a classic specification trap — 9 9 5 means the answer is 5, not 9.',
        hint: 'Sort first. Then what does "distinct" change about scanning from the right?',
      },
      {
        id: 'vec-11', type: 'tf', diff: 1,
        statement: '`v.push_back(x)` is amortized O(1), so building a vector of n elements with push_back is O(n) total.',
        answer: true,
        explain: 'The vector doubles capacity on overflow; doubling costs spread out to O(1) per push on average. Building with n push_backs: O(n). (Pre-sizing with `vector<int> v(n)` avoids even those reallocations.)',
      },
    ],
    problems: [
      { name: 'Increasing Array', platform: 'CSES', id: '1094', url: 'https://cses.fi/problemset/task/1094', difficulty: 'intro', why: 'Vector scan + accumulator (and yes, long long).' },
      { name: 'Beautiful Matrix', platform: 'Codeforces', id: '263A', rating: 800, url: 'https://codeforces.com/problemset/problem/263/A', difficulty: 'intro', why: '2D grid reading and index arithmetic.' },
      { name: 'Tram', platform: 'Codeforces', id: '116A', rating: 800, url: 'https://codeforces.com/problemset/problem/116/A', difficulty: 'intro', why: 'Running value + max tracking, the best-so-far pattern.' },
      { name: 'Distinct Numbers', platform: 'CSES', id: '1621', url: 'https://cses.fi/problemset/task/1621', difficulty: 'easy', why: 'Sort a vector, count changes — previews the STL unit.' },
    ],
  },

  // ==========================================================================
  'cpp-strings': {
    id: 'cpp-strings',
    objectives: [
      'Index, slice, build, and compare std::string',
      'Use character classification and case conversion',
      'Recognize when string ops hide an O(n) cost',
    ],
    theory: [
      {
        h: 'std::string basics',
        md: 'A `string` behaves like `vector<char>` with extras. Indexing, size, iteration — all the same muscle memory:',
        code: `string s = "contest";
int n = s.size();        // 7
char first = s[0];       // 'c'
s[0] = 'C';              // mutable!
for (char c : s) ...     // iterate

string t = s + "!";      // concatenation (makes a new string)
s += '?';                // append in place — O(1) amortized`,
        note: '`s = s + c` rebuilds the whole string: O(n). `s += c` appends: O(1). Inside a loop, that’s the difference between O(n) and O(n²).',
        noteKind: 'warn',
      },
      {
        h: 'Slicing and searching',
        code: `string s = "algorithm";
string sub = s.substr(2, 3);     // "gor"  (start index, LENGTH)
size_t pos = s.find("rit");      // 4, or string::npos if absent
if (pos != string::npos) ...     // ALWAYS check npos`,
        md: '`substr(i, len)` takes a **length**, not an end index — the #1 substr mistake. `find` returns `string::npos` (a huge unsigned value) when missing.',
      },
      {
        h: 'Characters: tests and transforms',
        code: `isdigit(c)   islower(c)   isupper(c)   isalpha(c)
tolower(c)   toupper(c)            // return the converted char

int v   = c - '0';                 // digit char → value
char d  = 'a' + k;                 // k-th lowercase letter
int idx = c - 'a';                 // letter → 0..25 (for count arrays)`,
        md: 'Letter-frequency counting — `vector<int> cnt(26); cnt[c - \'a\']++;` — solves an absurd number of problems: anagrams, palindrome rearrangement, "can you build X from Y".',
      },
      {
        h: 'Comparison and sorting',
        md: '`==`, `<`, `>` compare **lexicographically** (dictionary order, by char codes): `"apple" < "banana"`, but watch `"Z" < "a"` (uppercase codes are smaller). Sorting a string sorts its characters — the one-line anagram test:',
        code: `string a = "listen", b = "silent";
sort(a.begin(), a.end());
sort(b.begin(), b.end());
bool anagram = (a == b);     // true`,
      },
      {
        h: 'Building output efficiently',
        md: 'Constructing big outputs? Append to one string (or print directly) — never concatenate with `+` in a loop. Conversions: `to_string(42)`, `stoi("42")`, `stoll("9e18-ish strings")`.',
        code: `string out;
for (int i = 0; i < n; i++) {
    out += to_string(a[i]);
    out += ' ';
}
cout << out << "\\n";`,
      },
    ],
    exercises: [
      {
        id: 'str-1', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    string s = "icpc";
    cout << s.size() << s[1] << "\\n";
}`,
        answer: '4c',
        explain: 'size() is 4; s[1] is the second character, `c` (0-indexed). Printed with no space between: `4c`.',
      },
      {
        id: 'str-2', type: 'mcq', diff: 1,
        prompt: '`string s = "algorithm";` — what is `s.substr(2, 3)`?',
        options: ['"gor"', '"go"', '"lgo"', '"ori"'],
        answer: 0,
        explain: 'substr(start, **length**): 3 characters starting at index 2 → g-o-r. If you expected "lgo" you read it as 1-indexed; if "go" you read the 3 as an end index. Burn this in: (start, length).',
      },
      {
        id: 'str-3', type: 'output', diff: 2,
        prompt: 'What does this print?',
        code: `int main() {
    string s = "ab";
    s += 'c';
    s = s + s;
    cout << s << " " << s.find("ca") << "\\n";
}`,
        answer: 'abcabc 2',
        explain: 's becomes "abc", then doubled: "abcabc". `find("ca")` locates "ca" starting at index 2 (abC-Abc). Trace string mutations one operation at a time.',
      },
      {
        id: 'str-4', type: 'fill', diff: 1,
        prompt: 'Convert the digit character `c` to its numeric value:\n`int v = ___;`',
        answer: ["c - '0'", "c-'0'"],
        placeholder: "c …",
        explain: 'Digit characters are consecutive in ASCII, so subtracting `\'0\'` maps \'0\'..\'9\' to 0..9. (And `c - \'a\'` maps letters to 0..25.)',
      },
      {
        id: 'str-5', type: 'parsons', diff: 2,
        prompt: 'Assemble a palindrome check (two pointers).',
        lines: [
          'bool isPal(const string& s) {',
          '    int l = 0, r = (int)s.size() - 1;',
          '    while (l < r) {',
          '        if (s[l] != s[r]) return false;',
          '        l++; r--;',
          '    }',
          '    return true;',
          '}',
        ],
        distractors: [
          '        if (s[l] != s[r]) return true;',
        ],
        explain: 'Compare outside-in; any mismatch → not a palindrome (return **false** — the distractor inverts it). Reaching the middle without mismatch → palindrome.',
      },
      {
        id: 'str-6', type: 'mcq', diff: 2,
        prompt: 'This loop builds a string of n characters but runs in O(n²). Which line is guilty?',
        code: `string s = "";
for (int i = 0; i < n; i++) {
    s = s + 'a';        // line A
}`,
        options: [
          'Line A — `s + \'a\'` copies the whole string every iteration; use `s += \'a\'`',
          'The loop bound — should be i <= n',
          'string s = "" — empty init is invalid',
          'Nothing — this is O(n)',
        ],
        answer: 0,
        explain: '`s + \'a\'` allocates a NEW string and copies all i characters — total 1+2+…+n = O(n²). `s += \'a\'` appends in place, amortized O(1). Same output, different complexity class.',
      },
      {
        id: 'str-7', type: 'output', diff: 2,
        prompt: 'Letter counting. Output?',
        code: `int main() {
    string s = "abracadabra";
    vector<int> cnt(26, 0);
    for (char c : s) cnt[c - 'a']++;
    cout << cnt['a' - 'a'] << " " << cnt['b' - 'a'] << "\\n";
}`,
        answer: '5 2',
        explain: 'Count array: a appears 5 times in "abracadabra", b twice. `cnt[c - \'a\']++` is the frequency-count idiom — you’ll use it constantly.',
      },
      {
        id: 'str-8', type: 'tf', diff: 2,
        statement: 'In C++, `"Apple" < "apple"` is true.',
        answer: true,
        explain: 'Comparison is by character codes, and uppercase letters (65–90) come before lowercase (97–122). `\'A\'(65) < \'a\'(97)`, so "Apple" sorts first. Normalize case before comparing when the problem says "case-insensitive".',
      },
      {
        id: 'str-9', type: 'match', diff: 1,
        prompt: 'Match the operation to its meaning.',
        pairs: [
          ['s.substr(i, k)', 'k chars starting at i'],
          ['s.find(t)', 'index of t, or npos'],
          ['to_string(x)', 'number → string'],
          ['stoi(s)', 'string → int'],
        ],
        explain: 'The four string conversions/queries you reach for daily. Remember substr takes a length, and find can return npos.',
      },
      {
        id: 'str-10', type: 'code', diff: 3,
        prompt: 'Read one word. Print `YES` if its letters can be rearranged into a palindrome, else `NO`.\n(Hint: count letters — at most ONE may appear an odd number of times.)',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    // your code

    return 0;
}`,
        tests: [
          { input: 'aabb', expected: 'YES' },
          { input: 'abc', expected: 'NO' },
          { input: 'racecar', expected: 'YES' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    vector<int> cnt(26, 0);
    for (char c : s) cnt[c - 'a']++;
    int odd = 0;
    for (int x : cnt) odd += (x % 2);
    cout << (odd <= 1 ? "YES" : "NO") << "\\n";
    return 0;
}`,
        explain: 'A palindrome pairs letters around the center; only the middle character (odd length) can be unpaired. So: count frequencies, count odd counts, allow at most one. Counting beats constructing — a recurring theme.',
        hint: 'Don’t build the palindrome. Count the letters and think about pairs.',
      },
      {
        id: 'str-11', type: 'output', diff: 3,
        prompt: 'What does this print? (`s.find` returns `string::npos` when absent — and npos is huge.)',
        code: `int main() {
    string s = "hello";
    if (s.find("z") == string::npos)
        cout << "absent";
    else
        cout << "found at " << s.find("z");
}`,
        answer: 'absent',
        explain: '"z" isn’t in "hello", so find returns npos and the comparison correctly says absent. The bug to avoid: `if (s.find("z") > 0)` — npos is a huge positive number, so that test "finds" everything.',
      },
    ],
    problems: [
      { name: 'Petya and Strings', platform: 'Codeforces', id: '112A', rating: 800, url: 'https://codeforces.com/problemset/problem/112/A', difficulty: 'intro', why: 'Case-insensitive comparison — normalize then compare.' },
      { name: 'Word Capitalization', platform: 'Codeforces', id: '281A', rating: 800, url: 'https://codeforces.com/problemset/problem/281/A', difficulty: 'intro', why: 'One toupper, but you must not touch the rest.' },
      { name: 'Palindrome Reorder', platform: 'CSES', id: '1755', url: 'https://cses.fi/problemset/task/1755', difficulty: 'easy', why: 'The exercise above, plus actually constructing the palindrome.' },
      { name: 'Helpful Maths', platform: 'Codeforces', id: '339A', rating: 800, url: 'https://codeforces.com/problemset/problem/339/A', difficulty: 'intro', why: 'Parse, sort characters, rebuild the string.' },
    ],
  },
};

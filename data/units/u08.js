// ============================================================================
// data/units/u08.js — Unit 8: Range Queries
// Answer questions about intervals — fast, with updates.
// Fenwick trees (lowbit walks), segment trees (recursion anatomy, identities,
// descent), lazy propagation (tags + pushdown), sparse tables & compression.
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'fenwick': {
    id: 'fenwick',
    objectives: [
      'Implement a 1-indexed Fenwick tree with add / prefix-sum in O(log n)',
      'Trace the two lowbit walks: add climbs i += i&(-i), sum descends i -= i&(-i)',
      'Answer range sums as sum(r) − sum(l−1) and know when a BIT beats a segment tree',
      'Use a BIT as a counter: “how many already-seen values are < x” (inversions)',
    ],
    theory: [
      {
        h: 'When prefix sums stop being enough',
        md: 'A plain prefix array answers range sums in O(1) — until the array **changes**. One point update invalidates O(n) prefix entries, so you’re stuck choosing: O(1) query + O(n) update, or O(n) query + O(1) update. With n, q ≈ 2·10⁵ mixed operations, both choices are ~4·10¹⁰ work. Dead.\n\nThe Fenwick tree (Binary Indexed Tree, **BIT**) does both in **O(log n)**: total ~(n+q)·18 ≈ 7·10⁶ operations. Recognition cue: *“sum queries mixed with point updates”* — the constraints whisper BIT.',
      },
      {
        h: 'lowbit: the whole trick is i & (-i)',
        md: 'In two’s complement, `i & (-i)` isolates the **lowest set bit** of i. A BIT is just an array `bit[1..n]` where `bit[i]` stores the sum of a block of length `lowbit(i)` **ending at i**. Every prefix [1..i] splits into O(log n) such blocks — one per set bit of i.',
        code: `// lowbit(i) = i & (-i)
// i (binary)    lowbit    bit[i] holds the sum of
//  1  (0001)       1      a[1]
//  2  (0010)       2      a[1..2]
//  3  (0011)       1      a[3]
//  4  (0100)       4      a[1..4]
//  6  (0110)       2      a[5..6]
//  8  (1000)       8      a[1..8]
// 12  (1100)       4      a[9..12]`,
        note: 'Prefix [1..13]: 13 = 1101₂ = 8 + 4 + 1, so sum(13) = bit[13] + bit[12] + bit[8]. The binary representation of i *is* the decomposition.',
      },
      {
        h: 'Two walks: add climbs, sum descends',
        md: 'Both operations are the same five lines with the sign flipped. `add` must touch every block that **contains** index i — those live at increasing indices, so it walks **up** with `i += i & (-i)`. `sum` collects disjoint blocks tiling [1..i], peeling one set bit at a time — it walks **down** with `i -= i & (-i)`.',
        code: `int n;                 // BIT over a[1..n]
vector<ll> bit;        // bit.assign(n + 1, 0);

void add(int i, ll v) {            // a[i] += v
    for (; i <= n; i += i & (-i))  // climb: every block covering i
        bit[i] += v;
}
ll sum(int i) {                    // a[1] + ... + a[i]
    ll s = 0;
    for (; i > 0; i -= i & (-i))   // descend: disjoint blocks
        s += bit[i];
    return s;
}`,
      },
      {
        h: '1-indexed, or it breaks. Literally.',
        md: 'Range sums come from two prefixes: `sum(l..r) = sum(r) − sum(l−1)`. Subtraction undoes the overlap — this only works because addition is **invertible**.\n\nAnd the BIT is **1-indexed by contract**: `lowbit(0) = 0`, so `add(0, v)` does `i += 0` forever — an infinite loop, not a wrong answer. If your data is 0-indexed, shift everything by +1 at the door.',
        code: `ll rangeSum(int l, int r) {        // sum of a[l..r], 1-indexed
    return sum(r) - sum(l - 1);    // prefix minus prefix
}`,
        note: 'Index 0 in a BIT = infinite loop (i & (-i) is 0, the walk never moves). The judge shows TLE, you hunt for slow algorithms, and the bug is one missing +1.',
        noteKind: 'danger',
      },
      {
        h: 'BIT vs segment tree',
        md: 'A BIT is ~10 lines, cache-friendly, and has tiny constants — when it applies, use it. The catch: prefix-subtraction needs an **invertible** operation. Sums, XOR, counts: yes. **Min/max: no** — knowing min(1..r) and min(1..l−1) tells you nothing about min(l..r); you can’t “subtract” a minimum.\n\nA segment tree (next skill) is ~4× the code but handles min, max, gcd, anything associative. Rule of thumb: *sums → BIT, everything else → segment tree.*',
      },
      {
        h: 'The counting pattern (inversions & friends)',
        md: 'Killer application: build the BIT over **values**, not positions. Sweep the array left to right; the BIT holds a 0/1 count of every value seen so far. Then `sum(x − 1)` answers *“how many already-seen values are < x”* in O(log n) — that’s inversion counting, and the engine inside CF 459D (Pashmak). Values up to 10⁹? **Coordinate-compress** them to ranks 1..n first (recipe in the sparse-tables skill).',
        code: `// while sweeping j = 1..n over the array:
ll smaller = sum(a[j] - 1);   // seen values strictly below a[j]
add(a[j], 1);                 // now a[j] counts as seen`,
      },
    ],
    exercises: [
      {
        id: 'fen-1', type: 'mcq', diff: 1,
        prompt: 'What is `12 & (-12)`? (12 = 1100₂)',
        options: ['4', '2', '8', '12'],
        answer: 0,
        explain: '`i & (-i)` isolates the lowest set bit. 12 = 1100₂ — the lowest set bit is the 4-bit. So bit[12] covers a block of length 4: a[9..12].',
      },
      {
        id: 'fen-2', type: 'output', diff: 1,
        prompt: 'A BIT over `a[1..16]`. This traces which `bit[]` cells `add(5, x)` touches. Output?',
        code: `int main() {
    int n = 16, i = 5;          // add(5, x): the climbing walk
    while (i <= n) {
        cout << i << " ";
        i += i & (-i);
    }
}`,
        answer: '5 6 8 16',
        explain: 'Climb by lowbit: 5 (+1) → 6 (+2) → 8 (+8) → 16 (+16) → 32, stop. Exactly the blocks containing index 5: a[5], a[5..6], a[1..8], a[1..16]. Update = walk UP.',
      },
      {
        id: 'fen-3', type: 'output', diff: 2,
        prompt: 'Now the query walk: which `bit[]` cells does `sum(13)` read? Output?',
        code: `int main() {
    int i = 13;                 // sum(13): the descending walk
    while (i > 0) {
        cout << i << " ";
        i -= i & (-i);
    }
}`,
        answer: '13 12 8',
        explain: 'Peel the lowest set bit each step: 13 = 1101₂ → 1100₂ (12) → 1000₂ (8) → 0. The blocks a[13..13], a[9..12], a[1..8] tile [1..13] perfectly — one block per set bit of 13.',
      },
      {
        id: 'fen-4', type: 'mcq', diff: 1,
        prompt: 'Which cells does `sum(6)` read, and which array blocks do they cover?',
        options: [
          'bit[6] then bit[4] — blocks a[5..6] and a[1..4]',
          'bit[6], bit[5], …, bit[1] — all six cells',
          'bit[6] then bit[3] — repeated halving',
          'bit[6] only — it already covers a[1..6]',
        ],
        answer: 0,
        explain: '6 = 110₂: peel lowbit 2 → 4, peel lowbit 4 → 0. Two reads, covering a[5..6] + a[1..4] = a[1..6]. The number of reads equals the number of set bits — never n.',
      },
      {
        id: 'fen-5', type: 'fill', diff: 2,
        prompt: 'With prefix queries `sum(i)`, the range sum of `a[l..r]` (1-indexed) is:\n`rangeSum(l, r) = ___`',
        answer: ['sum(r) - sum(l-1)', 'sum(r)-sum(l-1)', 'sum(r) - sum(l - 1)'],
        placeholder: 'sum(…) - sum(…)',
        explain: 'Prefix minus prefix: everything up to r, minus everything strictly before l. Writing `sum(l)` instead of `sum(l-1)` chops off a[l] itself — the classic off-by-one here.',
      },
      {
        id: 'fen-6', type: 'mcq', diff: 2,
        prompt: 'This 0-indexed “BIT” hangs forever the first time `add(0, v)` is called. Why?',
        code: `void add(int i, ll v) {         // i can be 0 here... uh oh
    while (i <= n) {
        bit[i] += v;
        i += i & (-i);
    }
}`,
        options: [
          'lowbit(0) = 0, so i += 0 never advances — infinite loop',
          'bit[0] is out of bounds, so it crashes immediately',
          'The condition should be i < n for 0-indexed arrays',
          'Adding v repeatedly overflows long long',
        ],
        answer: 0,
        explain: '`0 & (-0)` is 0: the walk takes a zero-length step forever. No crash, no wrong answer — just a mysterious TLE. The BIT contract is 1-indexed; shift 0-indexed data by +1.',
        hint: 'Compute i & (-i) when i = 0. How far does the walk move?',
      },
      {
        id: 'fen-7', type: 'bank', diff: 2,
        prompt: 'Fill the walk directions: update climbs, query descends.',
        code: `void add(int i, ll v) {            // point update
    for (; i <= n; i ___ i & (-i)) bit[i] += v;
}
ll sum(int i) {                    // prefix query
    ll s = 0;
    for (; i > 0; i ___ i & (-i)) s += bit[i];
    return s;
}`,
        answer: ['+=', '-='],
        distractors: ['++', '--', '^='],
        explain: 'add walks UP (every block containing i lives at a higher index); sum walks DOWN (peeling set bits until 0). Swap them and nothing crashes — you just get silently wrong sums. The `++`/`--` options are the naive O(n) scan a BIT exists to avoid.',
      },
      {
        id: 'fen-8', type: 'tf', diff: 2,
        statement: 'A Fenwick tree can answer range-minimum queries the same way it answers range sums: min(l..r) = combine of two prefix queries.',
        answer: false,
        explain: 'Range sum works because subtraction *undoes* a prefix: sum(r) − sum(l−1). Min has no inverse — knowing min(1..r) and min(1..l−1) tells you nothing about min(l..r). Non-invertible ops need a segment tree.',
      },
      {
        id: 'fen-9', type: 'parsons', diff: 2,
        prompt: 'Count pairs (i, j) with i < j and a[i] ≤ a[j], values already compressed to 1..n. You have `add(x, 1)` and prefix-count `sum(x)`. Assemble the sweep.',
        lines: [
          'll pairs = 0;',
          'for (int j = 0; j < n; j++) {',
          '    pairs += sum(a[j]);      // already-seen values <= a[j]',
          '    add(a[j], 1);            // NOW mark a[j] as seen',
          '}',
          'cout << pairs << "\\n";',
        ],
        distractors: [
          '    pairs += sum(a[j] - 1);  // strictly smaller only',
        ],
        explain: 'Query **before** add — adding first makes a[j] count itself as “already seen” (+1 per element, every time). The distractor `sum(a[j] - 1)` counts strictly-smaller values and silently drops the equal pairs the prompt asked for. This sweep is the engine of inversion counting and CF 459D.',
      },
      {
        id: 'fen-10', type: 'mcq', diff: 3,
        prompt: 'n ≤ 2·10⁵ values with `1 ≤ aᵢ ≤ 10⁹`, and you need the counting pattern (“how many seen values < x”). A BIT indexed directly by value needs 10⁹ cells. The standard fix?',
        options: [
          'Coordinate-compress: sort + dedupe the values, replace each by its rank 1..n, BIT of size n',
          'Allocate vector<ll>(1e9) anyway — memory is cheap on modern judges',
          'Switch the BIT to long long indices so 10⁹ fits',
          'Sort the array first so the values become small',
        ],
        answer: 0,
        explain: 'Only the *relative order* of values matters for counting comparisons — and at most n distinct values ever appear. Compress 10⁹-sized values to ranks 1..n and the BIT shrinks to n cells. 10⁹ long longs ≈ 8 GB → instant MLE; “long long indices” confuses value range with array size; sorting destroys the i < j sweep order.',
        hint: 'Does the BIT care about the values themselves, or only how they compare?',
      },
      {
        id: 'fen-11', type: 'match', diff: 1,
        prompt: 'Match each BIT piece to what it is.',
        pairs: [
          ['add(i, v)', 'walk up: i += i & (-i)'],
          ['sum(i)', 'walk down: i -= i & (-i)'],
          ['sum of a[l..r]', 'sum(r) − sum(l−1)'],
          ['bit[i] covers', 'the i & (-i) entries ending at i'],
        ],
        explain: 'The whole structure on one card: blocks sized by lowbit, an upward walk to update every covering block, a downward walk to tile a prefix, and subtraction for ranges.',
      },
      {
        id: 'fen-12', type: 'code', diff: 3,
        prompt: 'Dynamic Range Sum (the CSES 1648 shape). First line: `n q`. Then n values `a[1..n]`. Then q operations:\n```\n1 k u   → set a[k] = u\n2 l r   → print sum of a[l..r]\n```\nUse a Fenwick tree. Careful: the update is an **assignment**, but a BIT only knows deltas.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n;
vector<ll> bit;

void add(int i, ll v) {
    // climb and add v
}

ll sum(int i) {
    // descend and collect
    return 0;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    bit.assign(n + 1, 0);
    // read a[1..n], feed the BIT, answer the operations

    return 0;
}`,
        tests: [
          { input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n2 3 3', expected: '15\n16\n10' },
          { input: '3 3\n5 5 5\n2 2 2\n1 1 0\n2 1 3', expected: '5\n10' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n;
vector<ll> bit;

void add(int i, ll v) {            // climb: every block covering i
    for (; i <= n; i += i & (-i)) bit[i] += v;
}

ll sum(int i) {                    // descend: disjoint blocks tile [1..i]
    ll s = 0;
    for (; i > 0; i -= i & (-i)) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    bit.assign(n + 1, 0);
    vector<ll> a(n + 1, 0);        // keep current values: assignment = delta
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        add(i, a[i]);              // build = n point adds
    }
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k; ll u;
            cin >> k >> u;
            add(k, u - a[k]);      // the delta trick: new minus old
            a[k] = u;
        } else {
            int l, r;
            cin >> l >> r;
            cout << sum(r) - sum(l - 1) << "\\n";
        }
    }
    return 0;
}`,
        explain: 'The delta trick: a BIT speaks “+= v”, so an assignment becomes `add(k, new − old)` — which means you must keep a side array of current values. Forgetting it (calling add(k, u) directly) double-counts the old value. Sums in long long: n·10⁹ overflows int instantly.',
        hint: 'To set a[k] = u with only += available: what delta turns the old value into u? You’ll need to remember the old value somewhere.',
      },
    ],
    problems: [
      { name: 'Static Range Sum Queries', platform: 'CSES', id: '1646', url: 'https://cses.fi/problemset/task/1646', difficulty: 'intro', why: 'No updates — notice it! A plain prefix array beats any tree here.' },
      { name: 'Dynamic Range Sum Queries', platform: 'CSES', id: '1648', url: 'https://cses.fi/problemset/task/1648', difficulty: 'easy', why: 'The canonical BIT problem: assignment updates via the delta trick + range sums.' },
      { name: 'Pashmak and Parmida’s problem', platform: 'Codeforces', id: '459D', rating: 1800, url: 'https://codeforces.com/problemset/problem/459/D', difficulty: 'hard', why: 'The counting pattern at full power: precompute occurrence counts, then sweep with a BIT.' },
      { name: 'List Removals', platform: 'CSES', id: '1749', url: 'https://cses.fi/problemset/task/1749', difficulty: 'hard', why: 'BIT of 0/1 “still here” flags — find the k-th remaining element via binary search on prefix counts.' },
    ],
  },

  // ==========================================================================
  'segment-tree': {
    id: 'segment-tree',
    objectives: [
      'Implement build / point update / range query with any associative combine',
      'Trace the three query cases (disjoint, contained, partial) on paper',
      'Pick the correct identity element for sum, min, max, gcd',
      'Use a descent query to find the leftmost position satisfying a predicate',
    ],
    theory: [
      {
        h: 'When the BIT runs out of road',
        md: 'Point updates + range **min**? The BIT’s prefix-subtraction trick dies (min isn’t invertible). The segment tree is the general tool: a binary recursion over intervals where every node stores the answer for its segment. Any **associative** operation works — sum, min, max, gcd, even matrix products.\n\nRecognition cue: *point update + range min/max/gcd*, or any combine you can’t subtract. Cost: build O(n), update and query O(log n). With n, q ≈ 2·10⁵, that’s ~4·10⁶ operations — coasting.',
      },
      {
        h: 'Anatomy: node p owns [l, r]',
        md: 'Store the tree in a flat array: node 1 is the root covering [0, n−1]; node p has children **2p** (left) and **2p+1** (right), splitting at `mid = (l + r) / 2`. Leaves are single elements. Build fills children first, then combines:',
        code: `vector<ll> st;                 // st.assign(4 * n, 0);

void build(int p, int l, int r) {
    if (l == r) { st[p] = a[l]; return; }   // leaf
    int mid = (l + r) / 2;
    build(2*p, l, mid);                     // left half
    build(2*p + 1, mid + 1, r);             // right half
    st[p] = st[2*p] + st[2*p + 1];          // combine (sum tree)
}`,
        note: 'Why size 4n? Unless n is a power of two the tree is ragged, and node indices can reach past 2n. The next power of two ≤ 2n away, doubled again for the leaf level → 4n is always safe. Allocating 2n “to save memory” is a classic out-of-bounds RE.',
        noteKind: 'warn',
      },
      {
        h: 'Query: three cases, in this order',
        md: 'At each node, compare the node’s segment [l, r] with the query [ql, qr]:\n\n**1. Disjoint** → return the identity (contributes nothing). **2. Fully contained** (ql ≤ l and r ≤ qr) → return `st[p]` as-is, no recursion. **3. Partial overlap** → recurse into *both* children and combine.\n\nOnly O(log n) nodes survive case 3 per query — that’s the entire complexity argument.',
        code: `ll query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;          // case 1: disjoint → identity
    if (ql <= l && r <= qr) return st[p];    // case 2: contained → take it
    int mid = (l + r) / 2;                   // case 3: split
    return query(2*p, l, mid, ql, qr)
         + query(2*p + 1, mid + 1, r, ql, qr);
}`,
      },
      {
        h: 'Point update: one path, recompute upward',
        md: 'Updating a[i] only invalidates the nodes whose segment contains i — exactly one root-to-leaf path of O(log n) nodes. Descend to the leaf, then recombine on the way back up:',
        code: `void update(int p, int l, int r, int idx, ll val) {
    if (l == r) { st[p] = val; return; }     // reached the leaf
    int mid = (l + r) / 2;
    if (idx <= mid) update(2*p, l, mid, idx, val);
    else update(2*p + 1, mid + 1, r, idx, val);
    st[p] = st[2*p] + st[2*p + 1];           // recompute on the way up
}`,
      },
      {
        h: 'Identity elements: one line swaps the whole tree',
        md: 'The combine function and its **identity** travel as a pair — the identity is what a disjoint node must return so it can’t affect the result:\n\nsum → `0` · min → `+INF` · max → `−INF` · gcd → `0` (gcd(0, x) = x).\n\nChange `+` to `min` and `0` to `INF` and your sum tree is a min tree. The legendary bug: keeping `return 0;` in the disjoint case of a **min** tree — every query on positive values now answers 0.',
        code: `ll combine(ll x, ll y) { return min(x, y); }
const ll IDENTITY = LLONG_MAX;     // min’s identity — NOT 0!`,
      },
      {
        h: 'Descent queries: leftmost position with a[i] ≥ x',
        md: 'Hotel Queries asks: *the first room with enough capacity*. Binary-searching with a range-max query per step is O(log² n). Better: **descend** the max tree once. At each node, if the **left child’s** max ≥ x, go left (leftmost wins); otherwise go right. If the root’s max < x, no answer exists. One root-to-leaf walk: O(log n).',
        code: `// leftmost index with a[i] >= x, or -1   (max tree)
int descend(int p, int l, int r, ll x) {
    if (st[p] < x) return -1;          // nothing big enough in here
    if (l == r) return l;              // the leaf is the answer
    int mid = (l + r) / 2;
    if (st[2*p] >= x)                  // LEFT first → leftmost result
        return descend(2*p, l, mid, x);
    return descend(2*p + 1, mid + 1, r, x);
}`,
      },
    ],
    exercises: [
      {
        id: 'seg-1', type: 'mcq', diff: 1,
        prompt: 'Root node 1 covers [0, 7] (children of p are 2p and 2p+1, left child takes [l, mid]). Which segment does **node 5** cover?',
        options: ['[2, 3]', '[4, 5]', '[0, 1]', '[4, 7]'],
        answer: 0,
        explain: 'Node 5 = 2·2+1, the right child of node 2. Node 2 covers [0, 3] (left half of the root), so its right child takes [2, 3]. Walking the p → 2p, 2p+1 arithmetic by hand is how the layout sticks.',
      },
      {
        id: 'seg-2', type: 'fill', diff: 1,
        prompt: 'In the flat-array layout, node p’s **left child** is node ___ (the right child is that plus one).',
        answer: ['2p', '2*p', '2 * p', '2 p'],
        placeholder: '…p…',
        explain: 'Children of p live at 2p and 2p+1, parent at p/2 — heap-style indexing. This is why st[] is a flat array and why node 1 (not 0) is the root: node 0 would make 2p collide with itself.',
      },
      {
        id: 'seg-3', type: 'output', diff: 2,
        prompt: 'Build trace on a sum tree over `{5, 2, 4, 1}`. What does this print?',
        code: `vector<int> a = {5, 2, 4, 1};
vector<int> st(8);

void build(int p, int l, int r) {
    if (l == r) { st[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(2*p, l, mid);
    build(2*p + 1, mid + 1, r);
    st[p] = st[2*p] + st[2*p + 1];      // sum tree
}

int main() {
    build(1, 0, 3);
    for (int p = 1; p <= 7; p++) cout << st[p] << " ";
}`,
        answer: '12 7 5 5 2 4 1',
        explain: 'Leaves at nodes 4–7 hold {5, 2, 4, 1}; node 2 = 5+2 = 7, node 3 = 4+1 = 5, root = 12. Reading st[] level by level — root, two halves, four leaves — is the fastest way to debug a real tree.',
      },
      {
        id: 'seg-4', type: 'mcq', diff: 2,
        prompt: 'A query wants [2, 6]. The recursion is at a node covering [4, 7]. Which case fires?',
        options: [
          'Partial overlap — recurse into both children [4, 5] and [6, 7], combine the results',
          'Fully contained — return st[p] without recursing',
          'Disjoint — return the identity',
          'Partial overlap — but recurse only into [4, 5], since 7 > 6',
        ],
        answer: 0,
        explain: '“Contained” means the NODE fits inside the QUERY: ql ≤ l and r ≤ qr. Here 2 ≤ 4 ✓ but 7 ≤ 6 ✗ — so partial, recurse both. The child [6, 7] isn’t skippable: its left half [6, 6] still belongs to the query. Mixing up which interval must contain which is the #1 query bug.',
      },
      {
        id: 'seg-5', type: 'match', diff: 1,
        prompt: 'Match each combine to its identity (what a disjoint node returns).',
        pairs: [
          ['range sum', '0'],
          ['range min', '+INF (e.g. LLONG_MAX)'],
          ['range max', '−INF (e.g. LLONG_MIN)'],
          ['range product', '1'],
        ],
        explain: 'The identity must be invisible: combine(identity, x) = x. 0 absorbs nothing under +, INF loses every min, −INF loses every max, 1 is neutral under ×. Wrong identity = silently wrong answers, only on queries that touch a disjoint branch.',
      },
      {
        id: 'seg-6', type: 'tf', diff: 2,
        statement: 'For a segment tree on n elements, an st[] array of size 2n is always enough.',
        answer: false,
        explain: 'Only when n is a power of two. For ragged n the recursion creates node indices past 2n (the tree behaves like the next power of two, doubled). 4n is the safe bound — and the price of “saving” memory with 2n is an out-of-bounds write that corrupts the tree silently.',
      },
      {
        id: 'seg-7', type: 'fill', diff: 2,
        prompt: 'Tree over 8 leaves, root node 1 covers [0, 7], mid = (l+r)/2, left child takes [l, mid]. You update `a[5]`. List the node numbers whose st[] gets recomputed, **root first**, space-separated.',
        answer: ['1 3 6 13', '1, 3, 6, 13', '1,3,6,13'],
        placeholder: 'root … leaf',
        explain: 'The path: 1 [0,7] → 5 > 3, go right → 3 [4,7] → 5 ≤ 5, go left → 6 [4,5] → 5 > 4, go right → 13 [5,5]. Exactly one root-to-leaf path changes — that’s why a point update is O(log n), four nodes here.',
        hint: 'At each node compute mid and ask: is 5 in the left half [l, mid] or the right?',
      },
      {
        id: 'seg-8', type: 'parsons', diff: 2,
        prompt: 'Assemble the range-sum query with its three cases in canonical order.',
        lines: [
          'll query(int p, int l, int r, int ql, int qr) {',
          '    if (qr < l || r < ql) return 0;           // case 1: disjoint',
          '    if (ql <= l && r <= qr) return st[p];     // case 2: contained',
          '    int mid = (l + r) / 2;                    // case 3: partial',
          '    return query(2*p, l, mid, ql, qr) + query(2*p + 1, mid + 1, r, ql, qr);',
          '}',
        ],
        distractors: [
          '    if (qr < l || r < ql) return st[p];       // case 1: disjoint',
        ],
        explain: 'Disjoint → identity, contained → take st[p] whole, otherwise split and combine. The distractor returns the node’s value for segments *outside* the query — adding random garbage into your sum. Disjoint nodes must contribute the identity, nothing else.',
      },
      {
        id: 'seg-9', type: 'bank', diff: 2,
        prompt: 'Complete the build recursion.',
        code: `void build(int p, int l, int r) {
    if (l == r) { st[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(___, l, mid);
    build(___, mid + 1, r);
    st[p] = st[2*p] + st[2*p + 1];
}`,
        answer: ['2*p', '2*p + 1'],
        distractors: ['p + 1', 'p / 2'],
        explain: 'Children live at 2p and 2p+1 — heap indexing. `p + 1` is the “next node” misconception (that’s a sibling-ish index, not a child); `p / 2` walks to the *parent* and recurses upward forever.',
      },
      {
        id: 'seg-10', type: 'mcq', diff: 3,
        prompt: 'This **min** tree compiles, passes the sample (all queries cover the full array), then WAs on the judge. The bug?',
        code: `ll query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;          // ← suspicious
    if (ql <= l && r <= qr) return st[p];
    int mid = (l + r) / 2;
    return min(query(2*p, l, mid, ql, qr),
               query(2*p + 1, mid + 1, r, ql, qr));
}`,
        options: [
          'Disjoint case returns 0 — min’s identity is +INF, so any partial query on positive values answers ≤ 0',
          'The contained case must also recurse to verify st[p]',
          'mid should be (l + r + 1) / 2 for min trees',
          'min() can’t take two recursive calls as arguments',
        ],
        answer: 0,
        explain: 'A disjoint branch must be invisible: for min that means returning +INF, because min(0, anything-positive) = 0 poisons the result. Full-array queries never hit the disjoint case — which is exactly why the samples passed. Copy-pasting a sum tree and missing the identity is a rite of passage.',
        hint: 'Which queries ever execute the first line? What does 0 do inside a min()?',
      },
      {
        id: 'seg-11', type: 'mcq', diff: 3,
        prompt: 'Max tree over `a = {2, 5, 3, 8, 1, 4, 9, 2}` (0-indexed). Run the descent for “leftmost index with a[i] ≥ 6”. What returns, and what’s the rule?',
        options: [
          'Index 3 — at each node, descend LEFT whenever the left child’s max ≥ x; only otherwise go right',
          'Index 6 — descend toward the larger child’s max, which finds the global maximum 9',
          'Index 3 — but it needs a fresh range-max query per step, costing O(log² n)',
          'Index 1 — the first node in st[] order whose value is ≥ 6',
        ],
        answer: 0,
        explain: 'Left-first is the leftmost guarantee: [0,3]’s max is 8 ≥ 6, so go left; inside, [0,1]’s max is 5 < 6, forced right to [2,3]; there [2,2] = 3 < 6, right again → index 3 (a[3] = 8). One root-to-leaf walk using maxes already stored — O(log n), no extra queries. Chasing the larger child finds the maximum (index 6), not the leftmost qualifier.',
        hint: 'You want the LEFTMOST. Which child do you check first, and when are you allowed to abandon it?',
      },
      {
        id: 'seg-12', type: 'multi', diff: 2,
        prompt: 'n, q ≤ 2·10⁵, point updates + range queries. Which statistics can a plain segment tree maintain, storing one value per node? (Select all.)',
        options: [
          'range sum',
          'range min',
          'range max',
          'range gcd',
          'range median',
          'range average, storing only each node’s average',
        ],
        answers: [0, 1, 2, 3],
        explain: 'The test is: can a parent be computed from its two children’s summaries with an associative combine? Sum/min/max/gcd — yes. A median of medians is not the median, and two averages without their lengths can’t merge (store (sum, count) and it works — but that’s two values, not one).',
      },
      {
        id: 'seg-13', type: 'code', diff: 3,
        prompt: 'Dynamic Range Minimum (the CSES 1649 shape). First line: `n q`. Then `a[1..n]`. Then q operations:\n```\n1 k u   → set a[k] = u\n2 l r   → print min of a[l..r]\n```\nBuild a segment tree with the min combine — and mind the identity.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX;

int n;
vector<ll> a, st;

void build(int p, int l, int r) {
    // leaves take a[l]; parents combine with min
}

void update(int p, int l, int r, int idx, ll val) {
    // descend to the leaf, recompute on the way up
}

ll query(int p, int l, int r, int ql, int qr) {
    // three cases: disjoint / contained / partial
    return INF;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    a.assign(n + 1, 0);
    st.assign(4 * n, 0);
    // read, build, answer

    return 0;
}`,
        tests: [
          { input: '5 4\n3 1 4 1 5\n2 1 5\n2 3 5\n1 4 0\n2 3 5', expected: '1\n1\n0' },
          { input: '2 2\n7 9\n2 2 2\n2 1 2', expected: '9\n7' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = LLONG_MAX;

int n;
vector<ll> a, st;

void build(int p, int l, int r) {
    if (l == r) { st[p] = a[l]; return; }       // leaf
    int mid = (l + r) / 2;
    build(2*p, l, mid);
    build(2*p + 1, mid + 1, r);
    st[p] = min(st[2*p], st[2*p + 1]);          // combine = min
}

void update(int p, int l, int r, int idx, ll val) {
    if (l == r) { st[p] = val; return; }        // the leaf for idx
    int mid = (l + r) / 2;
    if (idx <= mid) update(2*p, l, mid, idx, val);
    else update(2*p + 1, mid + 1, r, idx, val);
    st[p] = min(st[2*p], st[2*p + 1]);          // recompute upward
}

ll query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return INF;           // disjoint → min identity
    if (ql <= l && r <= qr) return st[p];       // contained
    int mid = (l + r) / 2;                      // partial: both sides
    return min(query(2*p, l, mid, ql, qr),
               query(2*p + 1, mid + 1, r, ql, qr));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    a.assign(n + 1, 0);
    st.assign(4 * n, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int k; ll u;
            cin >> k >> u;
            update(1, 1, n, k, u);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r) << "\\n";
        }
    }
    return 0;
}`,
        explain: 'The skeleton is always the same three functions; only the combine (`min`) and the identity (`INF`) define the tree. Returning 0 for disjoint nodes is THE bug to avoid here — it only shows on partial-overlap queries, never on samples that query the whole array.',
        hint: 'Disjoint case: what value loses every min() it enters? It is not 0.',
      },
    ],
    problems: [
      { name: 'Range Xor Queries', platform: 'CSES', id: '1650', url: 'https://cses.fi/problemset/task/1650', difficulty: 'easy', why: 'Spot that it’s static — XOR is invertible, so prefix XOR beats building any tree.' },
      { name: 'Dynamic Range Minimum Queries', platform: 'CSES', id: '1649', url: 'https://cses.fi/problemset/task/1649', difficulty: 'easy', why: 'The reference segment-tree problem: min combine, INF identity, point updates.' },
      { name: 'Xenia and Bit Operations', platform: 'Codeforces', id: '339D', rating: 1700, url: 'https://codeforces.com/problemset/problem/339/D', difficulty: 'med', why: 'One-path updates where the combine alternates OR/XOR by level — the anatomy, weaponized.' },
      { name: 'Hotel Queries', platform: 'CSES', id: '1143', url: 'https://cses.fi/problemset/task/1143', difficulty: 'med', why: 'Max tree + leftmost descent: go left whenever the left child can satisfy the guest.' },
    ],
  },

  // ==========================================================================
  'lazy-segtree': {
    id: 'lazy-segtree',
    objectives: [
      'Explain why naive range updates are too slow and how lazy tags fix them',
      'Implement range-add / range-sum with apply-at-node + pushdown',
      'State the invariant: st[p] is correct once all ancestor tags are applied',
      'Choose BIT-over-difference-array when only point reads are needed',
    ],
    theory: [
      {
        h: 'Range updates: the naive way drowns',
        md: '“Add x to every element of [l, r]” done as point updates costs O(n log n) for one wide update — and with q ≈ 2·10⁵ updates over n ≈ 2·10⁵ elements you’re at ~10¹⁰ before the queries even start. Dead.\n\nThe observation that saves you: a range update covers **O(log n) whole nodes** (the same nodes a query would return in its “contained” case). If we could update a whole node in O(1) and somehow postpone the details… that’s lazy propagation. Recognition cue: *range updates AND range queries together*.',
      },
      {
        h: 'The lazy tag: a promissory note',
        md: '`lazy[p]` stores an update that applies to **every element** of p’s segment but hasn’t been handed to the children yet. For range-add/range-sum, applying “+v” at a node covering len elements is O(1):\n\n`st[p] += v · len` (the node’s own sum is now correct) and `lazy[p] += v` (the children are owed v each).\n\nThe invariant that makes it all sane: **st[p] is the true answer for its segment, assuming every tag on p’s *ancestors* gets applied on the way down.** A node is always honest about itself; its ancestors may hold IOUs.',
        code: `void applyTag(int p, ll v, int len) {
    st[p]   += v * (ll)len;   // this node: paid in full
    lazy[p] += v;             // children: debt recorded
}`,
      },
      {
        h: 'Pushdown: pay the debt before visiting the kids',
        md: 'Whenever the recursion needs to **descend past** a node — in `update` *or* `query` — it must first push the pending tag to both children: apply the tag to each child (st += v·len, lazy += v), then clear `lazy[p]`. Tags merge by addition, so a child can absorb several deferred updates without ever recursing.',
        code: `void pushdown(int p, int l, int r) {
    if (lazy[p] == 0) return;              // nothing pending
    int mid = (l + r) / 2;
    applyTag(2*p,     lazy[p], mid - l + 1);   // left child’s length
    applyTag(2*p + 1, lazy[p], r - mid);       // right child’s length
    lazy[p] = 0;                           // debt paid
}`,
      },
      {
        h: 'Range add, assembled',
        md: 'Same three-case skeleton as a plain query — the contained case now *applies a tag and stops* instead of recursing to leaves. That early stop is the whole speedup: O(log n) per range update.',
        code: `void update(int p, int l, int r, int ql, int qr, ll v) {
    if (qr < l || r < ql) return;              // 1. disjoint: untouched
    if (ql <= l && r <= qr) {                  // 2. contained:
        applyTag(p, v, r - l + 1);             //    O(1) and STOP
        return;
    }
    pushdown(p, l, r);                         // 3. partial: flush tag first!
    int mid = (l + r) / 2;
    update(2*p, l, mid, ql, qr, v);
    update(2*p + 1, mid + 1, r, ql, qr, v);
    st[p] = st[2*p] + st[2*p + 1];             //    recombine honest children
}`,
      },
      {
        h: 'The classic bug: no pushdown on the QUERY path',
        md: 'Queries descend too — and the moment a query steps past a node holding a tag **without pushing it down**, it reads children whose st[] is stale. Symptom: updates “work”, full-array sums are right (the root was honest), but sub-range queries come back wrong. If your lazy tree fails, check the query path first; it’s the pushdown people forget.',
        note: 'Both update AND query must call pushdown(p) before recursing into children. The contained and disjoint cases don’t descend, so they don’t need it — that’s why the bug hides so well.',
        noteKind: 'danger',
      },
      {
        h: 'Range assign, and a cheaper tool for add + point-read',
        md: 'Range **assignment** (“set [l, r] to v”) is the same machinery, but the tag means *overwrite*: `st[p] = v · len`, and a pending assign replaces any older tag. Careful — 0 can be a legitimate assigned value, so “no tag” needs its own flag or sentinel.\n\nAnd when updates are range-add but reads are **single positions** (CSES Range Update Queries), skip the lazy tree: keep a BIT over the **difference array**. Add x to [l, r] = `add(l, +x); add(r+1, −x)`; the value at k = a[k] + prefix-sum(k). Two BIT ops per update, one per read — 15 lines total.',
        code: `// add x to [l, r]:
add(l, x);
add(r + 1, -x);        // r+1 > n is harmless: the walk never starts
// value at position k:
ll value = a[k] + sum(k);`,
      },
    ],
    exercises: [
      {
        id: 'lazy-1', type: 'mcq', diff: 1,
        prompt: 'n = 2·10⁵, q = 2·10⁵ operations: “add x to [l, r]” and “sum of [l, r]”. Why does a plain segment tree (point updates only) fail here?',
        options: [
          'One range update = up to n point updates → O(n log n) per update, ~10¹⁰ total. TLE.',
          'Plain segment trees cannot store sums of updated values',
          'The recursion depth becomes O(n) and overflows the stack',
          'It works fine — sums are invertible, so updates are cheap',
        ],
        answer: 0,
        explain: 'Each “add x to [l, r]” touches up to n leaves at O(log n) each. 2·10⁵ updates × 2·10⁵ leaves is hopeless. Lazy propagation tags whole covered nodes in O(1) and stops — O(log n) per range update. Constraints with *range updates AND range queries* whisper lazy.',
      },
      {
        id: 'lazy-2', type: 'tf', diff: 1,
        statement: '`lazy[p]` stores an update that applies to every element in p’s segment but has not yet been propagated to p’s children.',
        answer: true,
        explain: 'That’s the definition — a promissory note for the subtree below p. st[p] itself is already adjusted (apply-at-node); only the children are still owed the update, and pushdown pays them when someone needs to descend.',
      },
      {
        id: 'lazy-3', type: 'output', diff: 2,
        prompt: 'Apply-at-node arithmetic, by hand. The root covers `a[0..3] = {1, 2, 3, 4}`. We add +5 to the whole range [0, 3]. Output?',
        code: `int main() {
    ll st1 = 10, lazy1 = 0;     // root: sum of {1, 2, 3, 4}
    // range add +5 to [0, 3] — fully covers the root:
    st1   += 5LL * 4;           // apply at node: v * segment length
    lazy1 += 5;                 // defer to children
    cout << st1 << " " << lazy1 << "\\n";
}`,
        answer: '30 5',
        explain: 'Adding 5 to each of 4 elements raises the sum by 5×4 = 20 → 30, and the children are owed +5 each (recorded once in the tag, not 20!). st pays in full immediately; lazy remembers the per-element debt.',
      },
      {
        id: 'lazy-4', type: 'fill', diff: 2,
        prompt: 'A pending add of v = 4 sits on a node covering [3, 7]. When applied at that node, its sum increases by ___ (a number).',
        answer: ['20'],
        placeholder: 'v × length = ?',
        explain: 'Segment length is r − l + 1 = 7 − 3 + 1 = 5 elements, each gaining 4 → the sum grows by 20. Writing r − l (= 4 elements, +16) is the off-by-one that makes lazy sums drift slowly and maddeningly.',
      },
      {
        id: 'lazy-5', type: 'order', diff: 2,
        prompt: 'A range-sum **query** arrives at a node with a pending tag and only partially overlaps it. Order the steps the code must take.',
        items: [
          'Check disjoint: if [l, r] misses the query, return identity 0',
          'Check contained: if [l, r] fits inside the query, return st[p]',
          'Pushdown: apply lazy[p] to both children, clear the tag',
          'Recurse into both children and sum the two results',
        ],
        explain: 'The two non-descending cases come first (they need no pushdown — st[p] is already honest about itself). Only when the recursion must go *below* p does the tag have to be pushed first. Pushdown-before-descend, on the query path too — that ordering is the whole skill.',
      },
      {
        id: 'lazy-6', type: 'mcq', diff: 3,
        prompt: 'Range updates seem fine, full-array sums are right, but sub-range queries return stale values after updates. Where’s the bug?',
        code: `ll query(int p, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return st[p];
    int mid = (l + r) / 2;
    return query(2*p, l, mid, ql, qr)            // ← descends...
         + query(2*p + 1, mid + 1, r, ql, qr);
}`,
        options: [
          'No pushdown before recursing — the query walks past pending tags into children with stale st[]',
          'The disjoint case should return st[p] so no information is lost',
          'mid must be recomputed as (l + r + 1) / 2 on the query path',
          'The two recursive results must also add lazy[p]·(r−l+1)',
        ],
        answer: 0,
        explain: 'THE lazy bug. Update tags a covered node and stops; if a later query descends past that node without pushdown, the children never heard about the update. Full-array sums hide it (the root is honest about itself) — sub-ranges expose it. Insert `pushdown(p, l, r);` before the recursion. Option 4 patches the symptom at one level and double-counts after a real pushdown.',
        hint: 'The contained case is fine. What must happen before the recursion is allowed to go below p?',
      },
      {
        id: 'lazy-7', type: 'bank', diff: 2,
        prompt: 'Complete apply-and-pushdown for range-add / range-sum.',
        code: `void applyTag(int p, ll v, int len) {
    st[p] += v * ___;          // whole segment shifts at once
    lazy[p] += ___;            // children’s debt grows
}
void pushdown(int p, int l, int r) {
    if (lazy[p] == 0) return;
    int mid = (l + r) / 2;
    applyTag(2*p,     lazy[p], mid - l + 1);
    applyTag(2*p + 1, lazy[p], r - mid);
    lazy[p] = ___;             // debt paid
}`,
        answer: ['len', 'v', '0'],
        distractors: ['v * len', '1'],
        explain: 'The sum absorbs v·len (every element shifted), but the tag records just v — it’s a *per-element* debt, and each child will multiply by its own length later. Accumulating `v * len` into lazy is the classic double-multiply bug. After paying both children, the tag resets to the add-identity 0.',
      },
      {
        id: 'lazy-8', type: 'tf', diff: 2,
        statement: 'For range-**assignment** lazies, the value 0 can safely mean “no pending assignment”.',
        answer: false,
        explain: 'Assigning 0 to a range is perfectly legal — your sentinel would silently swallow it. Assignment tags need a separate `bool hasTag[p]` (or an impossible sentinel value outside the input range). Add-tags get away with 0 only because adding 0 happens to be a no-op.',
      },
      {
        id: 'lazy-9', type: 'output', diff: 2,
        prompt: 'The difference-array trick, traced. We add 5 to [1, 3] and 2 to [2, 4] (0-indexed, n = 5), then print each position’s value. Output?',
        code: `int main() {
    int n = 5;
    vector<int> diff(n + 1, 0);
    diff[1] += 5; diff[4] -= 5;     // add 5 to [1, 3]
    diff[2] += 2; diff[5] -= 2;     // add 2 to [2, 4]
    int cur = 0;
    for (int i = 0; i < n; i++) {
        cur += diff[i];             // value = prefix sum of diff
        cout << cur << " ";
    }
}`,
        answer: '0 5 7 7 2',
        explain: 'A range add becomes two point edits: +x where it starts, −x just past where it ends; prefix-summing reconstructs values. Position 4 reads 0+5+2+0−5 = 2 (the first add already expired). Put a BIT over diff[] and both operations go online in O(log n) — that’s CSES Range Update Queries.',
      },
      {
        id: 'lazy-10', type: 'parsons', diff: 3,
        prompt: 'Assemble the body of range-add `update(p, l, r, ql, qr, v)` for a sum tree, in canonical case order.',
        lines: [
          'if (qr < l || r < ql) return;                 // case 1: disjoint',
          'if (ql <= l && r <= qr) {                     // case 2: contained',
          '    st[p] += v * (ll)(r - l + 1);             //   apply to this node',
          '    lazy[p] += v;                             //   defer to children',
          '    return;',
          '}',
          'pushdown(p, l, r);                            // case 3: partial — flush tag',
          'int mid = (l + r) / 2;',
          'update(2*p, l, mid, ql, qr, v);',
          'update(2*p + 1, mid + 1, r, ql, qr, v);',
          'st[p] = st[2*p] + st[2*p + 1];                // recombine honest children',
        ],
        distractors: [
          'if (ql <= l && r <= qr) { st[p] += v; return; }   // contained (??)',
        ],
        explain: 'Contained = apply v·len to st, record v in the tag, and STOP — that early return is the entire O(log n) speedup. The distractor packs two real bugs into one line: it forgets the ×length AND the tag, so children never hear about the update. And pushdown must precede the recursion, never follow it.',
        hint: 'Three cases in the same order as a plain query — but what two things must the contained case do before returning?',
      },
      {
        id: 'lazy-11', type: 'mcq', diff: 2,
        prompt: 'Mid-execution, which invariant does a correct lazy tree maintain for every node p?',
        options: [
          'st[p] equals the true answer for p’s segment, assuming all tags on p’s ANCESTORS are applied on the way down',
          'st[p] always equals the true answer with no adjustments anywhere',
          'lazy[p] is 0 for every node once an operation finishes',
          'st[p] is only guaranteed correct at the leaves',
        ],
        answer: 0,
        explain: 'Apply-at-node keeps every node honest about itself — its own tag is already folded into st[p]; only ancestors may hold IOUs that affect it. This invariant is your debugging compass: if st[root] is wrong, the bug is in apply/recombine; if only deep reads are wrong, a pushdown is missing.',
      },
      {
        id: 'lazy-12', type: 'mcq', diff: 2,
        prompt: 'n, q ≤ 2·10⁵. Operations: “add x to [l, r]” and “print the value at position k” (point read, never a range sum). The *simplest* adequate tool?',
        options: [
          'BIT over a difference array — range add = two point adds, point read = one prefix sum',
          'Full lazy segment tree with pushdown',
          'Plain array — add to each of the r−l+1 cells per update',
          'Rebuild a prefix-sum array after every update',
        ],
        answer: 0,
        explain: 'Point reads only → you never need range aggregation, so the lazy machinery is overkill (it works, but it’s 60 lines vs 15). The plain array is O(n) per update → ~4·10¹⁰; rebuilding prefixes is the same. Matching the *weakest sufficient* structure to the query mix is a contest superpower.',
      },
      {
        id: 'lazy-13', type: 'code', diff: 3,
        prompt: 'Range Update Queries (the CSES 1651 shape) via a BIT over the difference array. First line: `n q`. Then `a[1..n]`. Then q operations:\n```\n1 l r x   → add x to a[l..r]\n2 k       → print the value at position k\n```\nThe BIT is written for you — finish main.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n;
vector<ll> bit;                    // BIT over the DIFFERENCE array

void add(int i, ll v) {
    for (; i <= n; i += i & (-i)) bit[i] += v;
}
ll sum(int i) {
    ll s = 0;
    for (; i > 0; i -= i & (-i)) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    bit.assign(n + 2, 0);
    // read a[1..n]; for each op: range add = two point adds,
    // point read = a[k] + prefix sum of the diffs

    return 0;
}`,
        tests: [
          { input: '5 4\n1 2 3 4 5\n2 3\n1 2 4 10\n2 3\n2 5', expected: '3\n13\n5' },
          { input: '3 3\n0 0 0\n1 1 3 7\n1 2 2 1\n2 2', expected: '8' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n;
vector<ll> bit;                    // BIT over the DIFFERENCE array

void add(int i, ll v) {
    for (; i <= n; i += i & (-i)) bit[i] += v;
}
ll sum(int i) {
    ll s = 0;
    for (; i > 0; i -= i & (-i)) s += bit[i];
    return s;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q;
    cin >> n >> q;
    bit.assign(n + 2, 0);
    vector<ll> a(n + 1, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    while (q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int l, r; ll x;
            cin >> l >> r >> x;
            add(l, x);             // the add starts at l...
            add(r + 1, -x);        // ...and expires after r (r+1 > n: no-op)
        } else {
            int k;
            cin >> k;
            cout << a[k] + sum(k) << "\\n";   // original + accumulated adds
        }
    }
    return 0;
}`,
        explain: 'Value at k = original a[k] + (sum of all adds whose range covers k) = a[k] + prefix(k) over the difference array. The −x at r+1 cancels the add for positions past r; when r = n the walk from n+1 simply never starts, so no guard is needed. Fifteen lines doing a lazy tree’s job — because the reads were points, not ranges.',
        hint: 'Add x on [l, r] = +x at l, −x at r+1, in the BIT. What two pieces combine into the value at k?',
      },
    ],
    problems: [
      { name: 'Range Update Queries', platform: 'CSES', id: '1651', url: 'https://cses.fi/problemset/task/1651', difficulty: 'med', why: 'Range add + point read: a lazy tree works, but the BIT-over-difference trick is the elegant kill.' },
      { name: 'Prefix Sum Queries', platform: 'CSES', id: '2166', url: 'https://cses.fi/problemset/task/2166', difficulty: 'hard', why: 'Lazy range-add while each node maintains (sum, best prefix) — combining the pair is the puzzle.' },
    ],
  },

  // ==========================================================================
  'sparse-misc': {
    id: 'sparse-misc',
    objectives: [
      'Build a sparse table in O(n log n) and answer static RMQ in O(1)',
      'Explain why overlapping halves require an idempotent operation',
      'Coordinate-compress values up to 10⁹ with sort + unique + lower_bound',
      'Pick the right structure from the static/dynamic × sum/min decision table',
    ],
    theory: [
      {
        h: 'Static data, millions of queries',
        md: 'The array **never changes** and the queries are range minimums? A segment tree pays O(log n) per query for update support you’ll never use. The sparse table answers static RMQ in **O(1)** per query after an O(n log n) build.\n\nRecognition cue: the statement (or your reading of it) says *no updates* — immutable array, q up to 10⁶ or glued onto every node of some other algorithm (LCA!). “Static” is the magic word.',
      },
      {
        h: 'jump[k][i]: every power-of-two window',
        md: 'Precompute `jump[k][i]` = min of the 2ᵏ elements starting at i, i.e. a[i .. i+2ᵏ−1]. Level 0 is the array itself; each level doubles the window by gluing two halves from the level below. ~log n levels × n entries = O(n log n) time and memory.',
        code: `// jump[0][i] = a[i]
for (int k = 1; k < LOG; k++)
    for (int i = 0; i + (1 << k) <= n; i++)
        jump[k][i] = min(jump[k-1][i],                    // left half
                         jump[k-1][i + (1 << (k-1))]);    // right half`,
      },
      {
        h: 'The O(1) query: two halves that overlap',
        md: 'For [l, r] of length len, take k = ⌊log₂ len⌋. Two windows of size 2ᵏ — one starting at l, one **ending at r** — together cover [l, r], overlapping in the middle:\n\n`answer = min(jump[k][l], jump[k][r − 2ᵏ + 1])`\n\nThe overlap re-examines some elements. min doesn’t care: **min(x, x) = x** — the operation is *idempotent*. That’s the load-bearing property: min, max, gcd, AND, OR all qualify.',
        code: `int k = 31 - __builtin_clz(r - l + 1);   // floor(log2(len))
int answer = min(jump[k][l], jump[k][r - (1 << k) + 1]);`,
        note: 'Sum is NOT idempotent — the overlap would be counted twice. For static range sums you don’t need any of this: a plain prefix array is already O(1).',
        noteKind: 'warn',
      },
      {
        h: 'Coordinate compression: the recipe',
        md: 'Values up to 10⁹ but only n ≤ 2·10⁵ of them? Indexed structures (BITs, count arrays) need *dense* indices — so replace each value with its **rank**. Four steps, always the same: **collect → sort → unique → lower_bound remap**. Order is preserved, memory drops from 10⁹ to n. Add +1 to ranks when a BIT consumes them (1-indexed!).',
        code: `vector<int> vals = a;                       // 1. collect
sort(vals.begin(), vals.end());             // 2. sort
vals.erase(unique(vals.begin(), vals.end()),
           vals.end());                     // 3. dedupe
for (int& x : a)                            // 4. remap to rank
    x = lower_bound(vals.begin(), vals.end(), x)
        - vals.begin() + 1;                 // +1 → BIT-friendly`,
      },
      {
        h: 'Offline thinking: reorder the queries, not the data',
        md: 'If queries don’t have to be answered immediately, read them **all first**, then process in a smarter order. Two staples:\n\n• Compression with updates (Salary Queries): collect every value that will *ever* exist — initial array AND all update values — before compressing, or later updates fall outside your universe.\n• Sort-and-sweep: sort queries by one parameter, sweep through events, answer each query with a BIT when the sweep reaches it, output in the *original* order.\n\n“Offline” converts a hard online problem into sorting plus a structure you already own.',
      },
      {
        h: 'The decision table',
        md: 'Before writing any tree, classify the problem on two axes — updates? and which operation?\n\nstatic + sum → **prefix array** (O(1), 5 lines)\ndynamic (point) + sum → **Fenwick tree**\ndynamic (point) + min/max → **segment tree**\nstatic + min/max, huge q → **sparse table**\nrange updates + range queries → **lazy segment tree**\n\nReaching for the fanciest structure first costs you 40 lines and a constant factor; the constraints already told you the cheapest tool that works.',
      },
    ],
    exercises: [
      {
        id: 'sp-1', type: 'mcq', diff: 1,
        prompt: 'In a sparse table, which elements does `jump[2][3]` summarize?',
        options: ['a[3..6] — 2² = 4 elements starting at index 3', 'a[3..4] — 2 elements', 'a[3..5] — 3 elements', 'a[0..3] — everything up to index 3'],
        answer: 0,
        explain: 'jump[k][i] covers the 2ᵏ elements a[i .. i+2ᵏ−1]; with k = 2 that’s 4 elements, a[3..6]. Reading k as “k elements” (option 2) is the standard first misreading — the level index is an *exponent*.',
      },
      {
        id: 'sp-2', type: 'output', diff: 1,
        prompt: 'Building level 1 (windows of 2¹ = 2) over `{5, 2, 4, 1, 3}`. Output?',
        code: `int main() {
    vector<int> a = {5, 2, 4, 1, 3};
    int n = a.size();
    vector<int> level1(n - 1);          // jump[1][i], windows of length 2
    for (int i = 0; i + 2 <= n; i++)
        level1[i] = min(a[i], a[i + 1]);
    for (int x : level1) cout << x << " ";
}`,
        answer: '2 2 1 1',
        explain: 'Pairwise mins: min(5,2)=2, min(2,4)=2, min(4,1)=1, min(1,3)=1. Note there are only n−1 windows of length 2 — each level k has n − 2ᵏ + 1 valid starts, which is why the build loop bounds read `i + (1 << k) <= n`.',
      },
      {
        id: 'sp-3', type: 'mcq', diff: 2,
        prompt: 'The O(1) query covers [l, r] with TWO overlapping power-of-two windows. Why is that fine for min but fatal for sum?',
        options: [
          'Overlapped elements get examined twice — min(x, x) = x absorbs the repeat (idempotent), sum counts it twice',
          'Sums overflow long long when windows overlap',
          'min is computed faster than + on modern CPUs',
          'Sum windows can’t be aligned to powers of two',
        ],
        answer: 0,
        explain: 'Idempotency is the load-bearing property: re-seeing an element must change nothing. min, max, gcd, AND, OR qualify; + doesn’t (and neither does XOR — x^x cancels to 0). For static sums you never needed a sparse table anyway: prefix array, O(1), done.',
      },
      {
        id: 'sp-4', type: 'fill', diff: 2,
        prompt: '0-indexed query on [2, 7]: length 6, so k = ⌊log₂ 6⌋ = 2 and windows have size 2² = 4. The first window starts at index 2; the second — the one **ending at r = 7** — starts at index ___ (a number).',
        answer: ['4'],
        placeholder: 'r − 2^k + 1 = ?',
        explain: 'r − 2ᵏ + 1 = 7 − 4 + 1 = 4: the window a[4..7] ends exactly at r. Together [2..5] and [4..7] cover [2..7], overlapping on [4..5] — harmless for idempotent ops. Forgetting the +1 (starting at 3) silently shifts the window and misses a[7].',
      },
      {
        id: 'sp-5', type: 'multi', diff: 2,
        prompt: 'Which operations survive the overlapping-halves query? (Select all that apply.)',
        options: ['min', 'max', 'gcd', 'bitwise OR', 'sum', 'XOR'],
        answers: [0, 1, 2, 3],
        explain: 'The test is idempotency: op(x, x) = x. min/max/gcd/OR pass (gcd(x,x)=x, x|x=x). Sum double-counts the overlap. XOR is the sneaky one — x^x = 0, so overlapped elements *cancel out* instead of repeating. Not idempotent, just differently broken.',
      },
      {
        id: 'sp-6', type: 'tf', diff: 1,
        statement: 'A sparse table can absorb a point update in O(log n), like a segment tree.',
        answer: false,
        explain: 'One changed element appears in O(n) precomputed windows across the levels; fixing them all means rebuilding. Sparse tables are for **immutable** data only — the moment the statement says “update”, the sparse table leaves the table.',
      },
      {
        id: 'sp-7', type: 'bank', diff: 2,
        prompt: 'Complete the sparse-table build: each window glues two half-size windows from the level below.',
        code: `for (int k = 1; k < LOG; k++)
    for (int i = 0; i + (1 << k) <= n; i++)
        jump[k][i] = min(jump[k-1][i],
                         jump[k-1][i + ___]);`,
        answer: ['(1 << (k-1))'],
        distractors: ['(1 << k)', 'k', '2*k - 1'],
        explain: 'The second half starts one *half-window* later: 2ᵏ⁻¹ = (1 << (k-1)). Offsetting by (1 << k) skips a whole window and leaves a gap; offsetting by k confuses the exponent with the length — both build plausible-looking garbage that only wrong answers reveal.',
      },
      {
        id: 'sp-8', type: 'output', diff: 2,
        prompt: 'Coordinate compression, traced. Output?',
        code: `int main() {
    vector<int> a = {100, 7, 100, 50};
    vector<int> vals = a;                                  // collect
    sort(vals.begin(), vals.end());                        // sort
    vals.erase(unique(vals.begin(), vals.end()),
               vals.end());                                // dedupe
    for (int x : a)                                        // remap (1-based)
        cout << (lower_bound(vals.begin(), vals.end(), x)
                 - vals.begin()) + 1 << " ";
}`,
        answer: '3 1 3 2',
        explain: 'Sorted-unique universe: {7, 50, 100} → ranks 1, 2, 3. So 100→3, 7→1, 100→3, 50→2. Equal values share a rank and order is preserved — which is all a comparison-based structure ever needed from the original 10⁹-sized values.',
      },
      {
        id: 'sp-9', type: 'parsons', diff: 2,
        prompt: 'Assemble the compression recipe: collect → sort → unique → remap (1-based ranks for a BIT).',
        lines: [
          'vector<int> vals = a;                                    // collect',
          'sort(vals.begin(), vals.end());                          // sort',
          'vals.erase(unique(vals.begin(), vals.end()), vals.end()); // dedupe',
          'for (int& x : a)',
          '    x = lower_bound(vals.begin(), vals.end(), x) - vals.begin() + 1;',
        ],
        distractors: [
          'vals.erase(unique(vals.begin(), vals.end()));            // dedupe?',
        ],
        explain: 'unique() only *shuffles* duplicates to the back and returns an iterator to the junk — erase(it, end) removes the junk range. The distractor’s one-argument erase deletes exactly ONE element, leaving ghost duplicates that shift every rank after them. Also: lower_bound only works because sort came first.',
      },
      {
        id: 'sp-10', type: 'order', diff: 2,
        prompt: 'Order the offline-query workflow (Salary Queries flavor: values to 10⁹, updates and counting queries).',
        items: [
          'Read and store ALL operations before answering anything',
          'Collect every value that can ever appear: initial array + every update value',
          'Sort + dedupe the collected values into a compressed universe',
          'Replay the operations in order, maintaining a BIT over compressed counts',
          'Print the answers in the original query order',
        ],
        explain: 'Offline = trade immediacy for preprocessing. The step people miss is #2: compress only the initial values and the first update to a brand-new salary falls outside your universe — out-of-range BIT index, instant RE (or worse, silent miscounts).',
      },
      {
        id: 'sp-11', type: 'match', diff: 2,
        prompt: 'The decision table. Match each query mix to the cheapest adequate structure.',
        pairs: [
          ['no updates + range sum', 'prefix sum array'],
          ['point updates + range sum', 'Fenwick tree'],
          ['point updates + range min', 'segment tree'],
          ['no updates + range min, q ≈ 10⁶', 'sparse table'],
          ['range updates + range sum', 'lazy segment tree'],
        ],
        explain: 'Two axes — mutability and operation — pick the tool before you write a line. Static sum never needs a tree; invertible + dynamic = BIT; non-invertible + dynamic = segtree; static + idempotent + huge q = sparse table; range updates = lazy. Burn this table in.',
      },
      {
        id: 'sp-12', type: 'mcq', diff: 3,
        prompt: 'Salary Queries: salaries up to 10⁹, operations “employee k now earns x” and “count salaries in [a, b]”. You’ll compress + keep a BIT of counts. What must go into the compressed universe?',
        options: [
          'Every value that can ever be inserted: all initial salaries AND every update value, collected offline before building',
          'Just the initial salaries — updates reuse the same universe',
          'Just the query bounds a and b, since those are what you look up',
          'Nothing — a BIT indexed directly by salary works fine',
        ],
        answer: 0,
        explain: 'An update to a never-seen salary must land on its own rank, so all update values join the universe — which forces reading the input offline first. Query bounds need no slots of their own: lower_bound/upper_bound against the sorted universe locate them at query time. A raw 10⁹-cell BIT is ~8 GB of MLE.',
        hint: 'After “employee 1 now earns 999999999”, where in the BIT does that count live if 999999999 wasn’t compressed?',
      },
      {
        id: 'sp-13', type: 'code', diff: 3,
        prompt: 'Static Range Min (the CSES 1647 shape) — sparse table, O(1) per query. First line: `n q`. Then `a[0..n-1]`. Then q lines `l r` (**1-based**, inclusive): print min of that range.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    int LOG = 1;
    while ((1 << LOG) <= n) LOG++;
    vector<vector<int>> jump(LOG, vector<int>(n));
    for (int i = 0; i < n; i++) cin >> jump[0][i];
    // build levels 1..LOG-1, then answer each query with
    // two overlapping windows of size 2^k

    return 0;
}`,
        tests: [
          { input: '8 3\n5 2 4 1 3 9 7 6\n1 8\n2 5\n6 8', expected: '1\n1\n6' },
          { input: '4 2\n10 20 30 40\n2 2\n1 4', expected: '20\n10' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    int LOG = 1;
    while ((1 << LOG) <= n) LOG++;
    vector<vector<int>> jump(LOG, vector<int>(n));
    for (int i = 0; i < n; i++) cin >> jump[0][i];
    for (int k = 1; k < LOG; k++)                       // build: glue halves
        for (int i = 0; i + (1 << k) <= n; i++)
            jump[k][i] = min(jump[k-1][i],
                             jump[k-1][i + (1 << (k-1))]);
    while (q--) {
        int l, r;
        cin >> l >> r;
        l--; r--;                                       // to 0-based
        int k = 31 - __builtin_clz(r - l + 1);          // floor(log2(len))
        cout << min(jump[k][l], jump[k][r - (1 << k) + 1]) << "\\n";
    }
    return 0;
}`,
        explain: 'Build O(n log n), then every query is exactly two lookups: the window at l and the window ending at r. The overlap is safe because min is idempotent. Two classic stumbles: forgetting the 1-based → 0-based shift, and computing k from r − l (length minus one) instead of r − l + 1.',
        hint: 'len = r − l + 1, k = floor(log2(len)). The second window must END at r — where does it start?',
      },
    ],
    problems: [
      { name: 'Static Range Minimum Queries', platform: 'CSES', id: '1647', url: 'https://cses.fi/problemset/task/1647', difficulty: 'easy', why: 'Sparse-table reps: build once, answer 2·10⁵ mins in O(1) each.' },
      { name: 'Salary Queries', platform: 'CSES', id: '1144', url: 'https://cses.fi/problemset/task/1144', difficulty: 'hard', why: 'Compression + BIT with updates — collect ALL future values offline before compressing.' },
      { name: 'Pizzeria Queries', platform: 'CSES', id: '2206', url: 'https://cses.fi/problemset/task/2206', difficulty: 'hard', why: 'Split |i − k| into two cases: two min segment trees over p[i]−i and p[i]+i.' },
    ],
  },
};

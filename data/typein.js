// ============================================================================
// data/typein.js — type-the-code exercises, merged into each skill's exercise
// pool at load time (see data/curriculum.js). The typed-recall rung: you get
// the surrounding code and type the load-bearing parts from memory.
// Comparison is whitespace-forgiving but case-sensitive.
// ============================================================================

export const TYPEIN = {
  // ---- u01 ----------------------------------------------------------------
  'cpp-hello': [
    {
      id: 'ti-hello-1', type: 'typein', diff: 2,
      prompt: 'Type the multi-testcase skeleton: read t, then run solve() exactly t times.',
      code: `int t;
cin >> t;
while (___) solve();`,
      answer: [['t--', 't --']],
      explain: '`while (t--)` runs exactly t times: the condition uses the current value, THEN decrements. The contest idiom you’ll type a thousand times — earn it through your fingers.',
    },
  ],
  'cpp-types': [
    {
      id: 'ti-types-1', type: 'typein', diff: 2,
      prompt: 'Type the overflow-safe midpoint (lo and hi can both be near INT_MAX).',
      code: `int mid = lo + ___;`,
      answer: [['(hi - lo) / 2', '(hi-lo)/2']],
      explain: '`lo + (hi − lo) / 2` never forms lo + hi, so it can’t overflow. The naive `(lo + hi) / 2` is the most famous overflow in computing — typing the safe form makes it your default.',
      hint: 'Add HALF THE GAP to lo instead of averaging.',
    },
  ],
  'cpp-control': [
    {
      id: 'ti-ctrl-1', type: 'typein', diff: 2,
      prompt: 'Run-length scan: type the extend and the best-tracking expressions.',
      code: `if (i > 0 && x == prev) ___;
else run = 1;
best = max(___, run);`,
      answer: ['run++', 'best'],
      explain: 'Same value → extend the run; new value → reset to 1; track the max after every step (not just on resets — the longest run might end at the array’s edge).',
    },
  ],
  'cpp-functions': [
    {
      id: 'ti-fn-1', type: 'typein', diff: 2,
      prompt: 'Type the factorial recursion: base case value and the smaller subproblem.',
      code: `ll fact(int n) {
    if (n <= 1) return ___;
    return n * fact(___);
}`,
      answer: ['1', ['n - 1', 'n-1']],
      explain: 'Base case 1 (empty product), recursive step on a strictly smaller n. Every recursion you ever write is this shape with different furniture.',
    },
  ],
  'cpp-vectors': [
    {
      id: 'ti-vec-1', type: 'typein', diff: 2,
      prompt: 'Type the n×m grid construction (n rows, m columns, zero-filled).',
      code: `vector<vector<int>> g(n, ___);`,
      answer: [['vector<int>(m)', 'vector<int>(m, 0)']],
      explain: 'The outer vector holds n copies of an inner `vector<int>(m)`. Mixing up n and m here compiles fine and crashes later — type it until the order is reflex.',
    },
  ],
  'cpp-strings': [
    {
      id: 'ti-str-1', type: 'typein', diff: 2,
      prompt: 'Type the letter-frequency idiom (count lowercase letters into cnt[26]).',
      code: `vector<int> cnt(26, 0);
for (char c : s) cnt[___]++;`,
      answer: [["c - 'a'", "c-'a'"]],
      explain: '`c − \'a\'` maps a..z onto 0..25 — the index of the letter. This one expression powers anagrams, palindrome-rearrangement, and half of all string problems below 1400 rating.',
    },
  ],

  // ---- u02 ----------------------------------------------------------------
  'stl-sort': [
    {
      id: 'ti-sort-1', type: 'typein', diff: 2,
      prompt: 'Type the comparator body for DESCENDING order (and remember: strict!).',
      code: `sort(v.begin(), v.end(), [](int a, int b) {
    return ___;
});`,
      answer: [['a > b', 'b < a']],
      explain: 'Strictly greater = descending. `a >= b` is undefined behavior (strict weak ordering violated) — std::sort may crash. The one-character difference between sorted and segfault.',
    },
  ],
  'stl-set-map': [
    {
      id: 'ti-setmap-1', type: 'typein', diff: 2,
      prompt: 'Erase exactly ONE copy of x from a multiset (not all copies).',
      code: `multiset<int> ms;
// ...
ms.erase(___);`,
      answer: [['ms.find(x)', 'ms.find( x )']],
      explain: '`erase(x)` by value removes EVERY copy; `erase(ms.find(x))` by iterator removes one. Greedy algorithms with multisets (Concert Tickets, Towers) live and die on this distinction.',
    },
  ],
  'stl-stack-queue': [
    {
      id: 'ti-pq-1', type: 'typein', diff: 2,
      prompt: 'Declare a MIN-heap of ints (priority_queue is a max-heap by default).',
      code: `priority_queue<int, vector<int>, ___> pq;`,
      answer: [['greater<int>', 'greater<>']],
      explain: 'The third template argument flips the order: `greater<int>` makes top() the minimum. Forgetting this (and popping maxima in Dijkstra) is a rite of passage — once is enough.',
    },
  ],
  'stl-toolbox': [
    {
      id: 'ti-toolbox-1', type: 'typein', diff: 2,
      prompt: 'Find the index of the first element ≥ x in sorted vector v.',
      code: `auto it = lower_bound(___);
int idx = it - ___;`,
      answer: [['v.begin(), v.end(), x', 'v.begin(),v.end(),x'], ['v.begin()', 'begin(v)']],
      explain: 'lower_bound takes the range and the value; subtracting begin() converts the iterator to an index. `it == v.end()` means nothing is ≥ x — check before dereferencing.',
    },
  ],

  // ---- u03 ----------------------------------------------------------------
  'brute-force': [
    {
      id: 'ti-bf-1', type: 'typein', diff: 2,
      prompt: 'Type the arguments that enumerate ALL permutations of p (p starts sorted).',
      code: `sort(p.begin(), p.end());
do {
    // use this ordering of p
} while (next_permutation(___));`,
      answer: [['p.begin(), p.end()', 'p.begin(),p.end()']],
      explain: 'next_permutation advances to the next lexicographic ordering and returns false after the last — but it only visits ALL n! orderings if you START from the sorted one.',
    },
  ],
  'greedy': [
    {
      id: 'ti-greedy-1', type: 'typein', diff: 2,
      prompt: 'Interval scheduling: sort by END time. Type the comparator’s compared fields (intervals are pair<int,int> = {start, end}).',
      code: `sort(v.begin(), v.end(), [](auto& a, auto& b) {
    return ___ < ___;
});`,
      answer: ['a.second', 'b.second'],
      explain: 'Earliest END first is the provably-optimal greedy for "max non-overlapping intervals" (Movie Festival). Sorting by start instead is the classic wrong greedy — it feels natural and fails.',
    },
  ],
  'two-pointers': [
    {
      id: 'ti-tp-1', type: 'typein', diff: 2,
      prompt: 'Sorted two-sum: type both pointer moves.',
      code: `int l = 0, r = n - 1;
while (l < r) {
    ll s = a[l] + a[r];
    if (s == target) return {l, r};
    if (s < target) ___;
    else ___;
}`,
      answer: [['l++', '++l'], ['r--', '--r']],
      explain: 'Sum too small → only raising the left pointer can help; too big → lower the right. Each pointer moves one direction only, so the whole scan is O(n) after sorting.',
    },
  ],
  'sliding-window': [
    {
      id: 'ti-sw-1', type: 'typein', diff: 2,
      prompt: 'Type the window shrink: restore the invariant sum ≤ S by advancing l.',
      code: `for (int r = 0; r < n; r++) {
    sum += a[r];
    while (sum > S) sum -= a[___];
    best = max(best, r - l + 1);
}`,
      answer: [['l++']],
      explain: 'Subtract the element leaving the window AND advance l in one expression: `a[l++]`. The window [l..r] always satisfies the invariant when the while exits — that’s what makes `r − l + 1` valid.',
    },
  ],
  'prefix-sums': [
    {
      id: 'ti-ps-1', type: 'typein', diff: 2,
      prompt: 'Type the O(1) range-sum lookup for a[l..r] (p[i] = sum of first i elements).',
      code: `ll rangeSum = p[___] - p[___];`,
      answer: [['r + 1', 'r+1'], 'l'],
      explain: 'p[r+1] holds a[0..r], p[l] holds a[0..l−1]; the difference is exactly a[l..r]. The +1 offset exists so the empty prefix has a slot — type it until off-by-ones fear you.',
    },
  ],
  'binary-search': [
    {
      id: 'ti-bs-1', type: 'typein', diff: 2,
      prompt: 'Type both branch updates of the lower-bound loop (first index with a[i] ≥ x).',
      code: `int l = 0, r = n;
while (l < r) {
    int mid = l + (r - l) / 2;
    if (a[mid] < x) ___;
    else ___;
}`,
      answer: [['l = mid + 1', 'l=mid+1'], ['r = mid', 'r=mid']],
      explain: 'Too small → the answer is strictly right of mid (l = mid+1); otherwise mid might BE the answer, so keep it in range (r = mid). The asymmetry is the entire algorithm — and `l = mid` here loops forever.',
    },
  ],

  // ---- u04 ----------------------------------------------------------------
  'bitops': [
    {
      id: 'ti-bits-1', type: 'typein', diff: 2,
      prompt: 'Type the set-bit and clear-bit expressions for bit i of n.',
      code: `n |= ___;     // set bit i
n &= ___;     // clear bit i`,
      answer: [['1 << i', '1<<i', '(1 << i)'], ['~(1 << i)', '~(1<<i)']],
      explain: 'OR with the mask sets; AND with the INVERTED mask clears (every bit stays except i). For i ≥ 31 you’d need `1LL << i` — int shifts overflow silently.',
    },
  ],
  'modular': [
    {
      id: 'ti-mod-1', type: 'typein', diff: 2,
      prompt: 'Type the two update lines at the heart of binary exponentiation.',
      code: `ll r = 1;
a %= MOD;
while (e) {
    if (e & 1) r = ___ % MOD;
    a = ___ % MOD;
    e >>= 1;
}`,
      answer: [['r * a', 'r*a', 'a * r'], ['a * a', 'a*a']],
      explain: 'Use the current bit (multiply the result by the running power), then square the base for the next bit. O(log e) — and both products need long long, which `ll` here provides.',
    },
  ],
  'primes-gcd': [
    {
      id: 'ti-gcd-1', type: 'typein', diff: 2,
      prompt: 'Type Euclid’s recursive step.',
      code: `ll gcd(ll a, ll b) {
    return b ? gcd(___, ___) : a;
}`,
      answer: ['b', ['a % b', 'a%b']],
      explain: 'gcd(a, b) = gcd(b, a mod b) until b hits 0. The remainder at least halves every two steps → O(log min(a,b)). Five seconds to type, immortal.',
    },
  ],
  'combinatorics': [
    {
      id: 'ti-comb-1', type: 'typein', diff: 2,
      prompt: 'Type the final factor of O(1) nCr with precomputed factorials.',
      code: `ll nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * invfact[r] % MOD * ___ % MOD;
}`,
      answer: [['invfact[n - r]', 'invfact[n-r]']],
      explain: 'n! / (r! (n−r)!) under a prime mod = fact[n] · invfact[r] · invfact[n−r], with a % MOD after each multiply so the intermediate stays < MOD² (long long safe).',
    },
  ],
  'backtracking': [
    {
      id: 'ti-bt-1', type: 'typein', diff: 2,
      prompt: 'Subset enumeration: after the include-branch, type the exclude-branch call.',
      code: `void rec(int i, ll sum) {
    if (i == n) { best = min(best, cost(sum)); return; }
    rec(i + 1, sum + a[i]);   // include a[i]
    rec(___, ___);            // exclude a[i]
}`,
      answer: [['i + 1', 'i+1'], 'sum'],
      explain: 'Exclude = move on with the sum unchanged. Two calls per element → 2ⁿ leaves: every subset visited exactly once. (Apple Division is exactly this skeleton.)',
    },
  ],

  // ---- u05 ----------------------------------------------------------------
  'graph-bfs': [
    {
      id: 'ti-bfs-1', type: 'typein', diff: 2,
      prompt: 'Type the unvisited check (dist initialized to −1) and the distance update.',
      code: `while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : g[u]) {
        if (dist[v] == ___) {
            dist[v] = ___;
            q.push(v);
        }
    }
}`,
      answer: ['-1', ['dist[u] + 1', 'dist[u]+1']],
      explain: 'dist doubles as the visited array (−1 = untouched), and each layer is exactly one edge farther. Mark-on-PUSH (here) is what keeps BFS from enqueueing a node twice.',
    },
  ],
  'dfs-components': [
    {
      id: 'ti-comp-1', type: 'typein', diff: 2,
      prompt: 'Count connected components: type the counter and the launch call.',
      code: `int comp = 0;
for (int v = 1; v <= n; v++)
    if (!vis[v]) {
        ___;
        dfs(___);
    }`,
      answer: [['comp++', '++comp'], 'v'],
      explain: 'Each DFS launch flood-fills one whole component, so the number of launches IS the component count. Building Roads = this loop plus connecting the launch points.',
    },
  ],
  'dijkstra': [
    {
      id: 'ti-dij-1', type: 'typein', diff: 2,
      prompt: 'Type Dijkstra’s stale-entry guard — the line that replaces decrease-key.',
      code: `auto [d, u] = pq.top(); pq.pop();
if (d != ___) continue;     // stale: a better path already settled u`,
      answer: [['dist[u]']],
      explain: 'We push duplicates instead of decreasing keys; this guard discards the outdated ones in O(1). Skip it and complexity quietly degrades — correct answers, mysterious TLE.',
    },
  ],
  'toposort': [
    {
      id: 'ti-topo-1', type: 'typein', diff: 2,
      prompt: 'Kahn’s algorithm: type the indegree decrement-and-test.',
      code: `int u = q.front(); q.pop();
order.push_back(u);
for (int v : g[u])
    if (--___ == 0) q.push(v);`,
      answer: [['indeg[v]']],
      explain: 'Processing u "removes" its outgoing edges; any neighbor whose indegree hits zero has all prerequisites done and joins the queue. order.size() < n afterwards = a cycle ate the rest.',
    },
  ],
  'dsu-mst': [
    {
      id: 'ti-dsu-1', type: 'typein', diff: 2,
      prompt: 'Type DSU find with path compression (the assignment is the compression).',
      code: `int find(int x) {
    return p[x] == x ? x : p[x] = ___;
}`,
      answer: [['find(p[x])', 'find(p[ x ])']],
      explain: 'Recurse to the root AND assign it to p[x] on the way back — next time the chain is one hop. With union-by-size this is effectively O(1) amortized. Eleven characters, near-constant time.',
    },
  ],

  // ---- u07 ----------------------------------------------------------------
  'tree-basics': [
    {
      id: 'ti-tb-1', type: 'typein', diff: 2,
      prompt: 'Type the post-order subtree-size accumulation.',
      code: `void dfs(int u, int p) {
    sz[u] = 1;
    for (int v : g[u]) {
        if (v == p) continue;
        dfs(v, u);
        sz[u] += ___;
    }
}`,
      answer: [['sz[v]']],
      explain: 'After dfs(v, u) returns, sz[v] is final — absorb it. Adding sz[v] + 1 double-counts v (it already counted itself). The seed pattern of every tree DP.',
    },
  ],
  'tree-dp': [
    {
      id: 'ti-tdp-1', type: 'typein', diff: 3,
      prompt: 'Type the rerooting shift for sum-of-distances (root moves from u to child v).',
      code: `ans[v] = ans[u] - sz[v] + ___;`,
      answer: [['(n - sz[v])', 'n - sz[v]', 'n-sz[v]']],
      explain: 'sz[v] nodes get one step closer (−sz[v]); the other n − sz[v] get one step farther. Deriving and typing this shift IS Tree Distances II.',
      hint: 'How many nodes got FARTHER when the root crossed the edge?',
    },
  ],
  'lca': [
    {
      id: 'ti-lca-1', type: 'typein', diff: 2,
      prompt: 'Type the binary-lifting table recurrence (jump 2ᵏ = jump 2ᵏ⁻¹ twice).',
      code: `up[v][k] = up[___][k - 1];`,
      answer: [['up[v][k - 1]', 'up[v][k-1]']],
      explain: 'The 2ᵏ-th ancestor is the 2ᵏ⁻¹-th ancestor of the 2ᵏ⁻¹-th ancestor. One line builds the whole O(n log n) table that answers every ancestor/LCA query.',
    },
  ],

  // ---- u08 ----------------------------------------------------------------
  'fenwick': [
    {
      id: 'ti-fen-1', type: 'typein', diff: 2,
      prompt: 'Type both lowbit walks: add climbs up, prefix-query slides down.',
      code: `void add(int i, ll v) {
    for (; i <= n; i += ___) t[i] += v;
}
ll sum(int i) {
    ll s = 0;
    for (; i > 0; i -= ___) s += t[i];
    return s;
}`,
      answer: [['i & (-i)', 'i & -i', 'i&(-i)', 'i&-i'], ['i & (-i)', 'i & -i', 'i&(-i)', 'i&-i']],
      explain: '`i & (−i)` isolates the lowest set bit — the size of the block t[i] governs. Updates visit every block containing i (upward); queries stitch disjoint blocks (downward). 1-indexed, or lowbit(0) = 0 loops forever.',
    },
  ],
  'segment-tree': [
    {
      id: 'ti-seg-1', type: 'typein', diff: 2,
      prompt: 'Type the combine step that repairs a node after updating a child (sum tree).',
      code: `st[p] = st[2 * p] + ___;`,
      answer: [['st[2 * p + 1]', 'st[2*p+1]']],
      explain: 'Children of node p live at 2p and 2p+1; the parent is always their combination. Swap + for min/max/gcd and the whole structure follows — this line IS the segment tree.',
    },
  ],
  'lazy-segtree': [
    {
      id: 'ti-lazy-1', type: 'typein', diff: 3,
      prompt: 'Range-add lazy: applying a pending add to a node covering [l, r]. Type the multiplier.',
      code: `st[p] += lazy[p] * ___;   // node p covers [l, r]`,
      answer: [['(r - l + 1)', 'r - l + 1', 'r-l+1']],
      explain: 'Adding x to every element of a segment raises its SUM by x × length. Forgetting the length factor is the canonical lazy-propagation bug — sums drift and small tests still pass.',
    },
  ],
  'sparse-misc': [
    {
      id: 'ti-sparse-1', type: 'typein', diff: 3,
      prompt: 'Sparse table O(1) range-min: type the start of the second (overlapping) half.',
      code: `int k = LOG[r - l + 1];
int mn = min(jump[k][l], jump[k][___]);`,
      answer: [['r - (1 << k) + 1', 'r-(1<<k)+1']],
      explain: 'Two 2ᵏ-blocks: one starting at l, one ENDING at r. They overlap — harmless for min (idempotent), fatal for sums. This index expression is the whole O(1) trick.',
      hint: 'The second block must END exactly at r. Where does a length-2ᵏ block ending at r start?',
    },
  ],

  // ---- u09 ----------------------------------------------------------------
  'string-hashing': [
    {
      id: 'ti-hashin-1', type: 'typein', diff: 2,
      prompt: 'Type the rolling build step of the prefix hash.',
      code: `h[i + 1] = (h[i] * ___ + ___) % M;`,
      answer: ['P', ['s[i]']],
      explain: 'Shift the existing prefix one base-position left (×P), then add the new character. Multiplying s[i] instead of h[i] builds a different polynomial — and the O(1) substring formula stops working.',
    },
  ],
  'kmp-z': [
    {
      id: 'ti-kmp-1', type: 'typein', diff: 3,
      prompt: 'Type the prefix-function fallback — the most mistyped expression in string algorithms.',
      code: `int j = pi[i - 1];
while (j > 0 && s[i] != s[j])
    j = ___;
if (s[i] == s[j]) j++;
pi[i] = j;`,
      answer: [['pi[j - 1]', 'pi[j-1]']],
      explain: 'j is a LENGTH; the border of that prefix lives at index j−1. `pi[j]` is the famous off-by-one that passes "aaa" tests and corrupts everything else. Your fingers now know better.',
    },
  ],
  'tries': [
    {
      id: 'ti-trie-1', type: 'typein', diff: 2,
      prompt: 'Type the node-creation step of trie insertion.',
      code: `for (char ch : w) {
    int c = ch - 'a';
    if (!nxt[cur][c]) nxt[cur][c] = ___;
    cur = nxt[cur][c];
}`,
      answer: [['trieSz++', 'trieSz ++']],
      explain: 'Post-increment hands out the next fresh node id and bumps the counter in one expression. Global arrays start zeroed, so id 0 stays reserved for the root and "no edge".',
    },
  ],

  // ---- u11 ----------------------------------------------------------------
  'probability': [
    {
      id: 'ti-prob-1', type: 'typein', diff: 1,
      prompt: 'Probability answers want 6 decimal places. Type the output setup.',
      code: `cout << fixed << ___ << answer << "\\n";`,
      answer: [['setprecision(6)', 'setprecision( 6 )']],
      explain: '`fixed << setprecision(6)` prints exactly six decimals (no scientific notation). Without `fixed`, setprecision counts significant digits instead — a silent WA on judges comparing text.',
    },
  ],
  'geometry': [
    {
      id: 'ti-geo-1', type: 'typein', diff: 2,
      prompt: 'Type the second term of the cross product (orientation of c relative to a→b).',
      code: `ll cross = (b.x - a.x) * (c.y - a.y) - ___;`,
      answer: [['(b.y - a.y) * (c.x - a.x)', '(b.y-a.y)*(c.x-a.x)']],
      explain: 'x₁y₂ − y₁x₂ on the vectors a→b and a→c. Positive = left turn, negative = right, zero = collinear. With |coords| ≤ 10⁹ each product reaches 4·10¹⁸ — long long, barely, deliberately.',
    },
  ],
};

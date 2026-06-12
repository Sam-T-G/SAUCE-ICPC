// ============================================================================
// data/handbook.js — the SAUCE reference, structured. Descended directly from
// SAUCE.cpp (kept at repo root); code blocks are copy-paste-ready for the
// 25-page ICPC Team Reference Document.
// ============================================================================

export const HANDBOOK = [
  {
    id: 'template', icon: '🏁', title: 'Contest Template & I/O',
    sub: 'The first 20 seconds of every solution',
    items: [
      {
        h: 'Standard template',
        md: 'Fast I/O matters: `cin/cout` with sync disabled is ~5-10× faster on big inputs. `1\'000\'000\'007` digit separators keep constants readable.',
        code: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ld = long double;
const ll INF = 4e18;
const int MOD = 1'000'000'007;

int main() {
    ios::sync_with_stdio(false);   // unsync C/C++ streams: big speedup
    cin.tie(nullptr);              // don't flush cout before each cin

    int t = 1;
    // cin >> t;                   // uncomment for multi-testcase problems
    while (t--) {
        // solve();
    }
    return 0;
}`,
        note: 'Never mix `scanf/printf` with unsynced `cin/cout`. Output `"\\n"`, not `endl` — `endl` flushes every line.',
      },
      {
        h: 'Reading until EOF / whole lines',
        code: `ll x;
while (cin >> x) { /* process x */ }      // until EOF

string line;
getline(cin >> ws, line);                 // skip leading whitespace, read full line`,
      },
      {
        h: 'Operations-per-second budget',
        md: 'Rule of thumb: ~**10⁸ simple operations/second** (C++). Read constraints, compute the budget, pick the algorithm:\n\n`n ≤ 20` → O(2ⁿ) bitmask/backtracking · `n ≤ 500` → O(n³) · `n ≤ 5000` → O(n²) · `n ≤ 2·10⁵` → O(n log n) · `n ≤ 10⁸` → O(n) or O(n log n) tight · larger → O(log n), O(√n), O(1) math.',
      },
    ],
  },
  {
    id: 'prefix', icon: '➕', title: 'Prefix Sums',
    sub: 'Range sums in O(1) after O(n) prep',
    items: [
      {
        h: '1D prefix sums',
        md: 'Use when: many queries "sum of a[l..r]" on a **static** array.',
        code: `vector<ll> prefix1D(const vector<ll>& a) {
    int n = a.size();
    vector<ll> p(n + 1, 0);            // p[i] = sum of a[0..i-1]
    for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
    return p;
}
ll rangeSum(const vector<ll>& p, int l, int r) {  // sum a[l..r]
    return p[r + 1] - p[l];
}`,
      },
      {
        h: '2D prefix sums (rectangle sums)',
        code: `vector<vector<ll>> prefix2D(const vector<vector<ll>>& a) {
    int n = a.size(), m = a[0].size();
    vector<vector<ll>> ps(n + 1, vector<ll>(m + 1, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            ps[i+1][j+1] = a[i][j] + ps[i][j+1] + ps[i+1][j] - ps[i][j];
    return ps;
}
// sum of rectangle (x1,y1)..(x2,y2) inclusive
ll rectSum(const vector<vector<ll>>& ps, int x1, int y1, int x2, int y2) {
    return ps[x2+1][y2+1] - ps[x1][y2+1] - ps[x2+1][y1] + ps[x1][y1];
}`,
        note: 'Inclusion–exclusion: add back `ps[x1][y1]` because it was subtracted twice.',
      },
      {
        h: 'Difference array (range update, single final read)',
        code: `// add v to a[l..r] lazily, restore with prefix sum at the end
vector<ll> d(n + 1, 0);
d[l] += v; d[r + 1] -= v;
// final: a[i] = d[0] + d[1] + ... + d[i]`,
      },
    ],
  },
  {
    id: 'binsearch', icon: '🎯', title: 'Binary Search',
    sub: 'Sorted arrays and monotonic answers',
    items: [
      {
        h: 'Lower bound (first index with a[i] ≥ x)',
        code: `int lowerBoundIdx(const vector<int>& a, int x) {
    int l = 0, r = a.size();
    while (l < r) {
        int mid = (l + r) / 2;
        if (a[mid] < x) l = mid + 1;
        else r = mid;
    }
    return l;                       // may be a.size() (not found)
}`,
        note: 'STL does this: `lower_bound(a.begin(), a.end(), x) - a.begin()`. `upper_bound` finds first `> x`.',
      },
      {
        h: 'Binary search on the answer',
        md: 'Use when the problem says "minimize x such that condition holds" and feasibility is **monotonic** (once true, stays true). Define `ok(x)`, search the boundary.',
        code: `bool ok(ll x) { /* can we achieve x? */ return true; }

ll binarySearchAnswer(ll lo, ll hi) {   // smallest x with ok(x)
    while (lo < hi) {
        ll mid = lo + (hi - lo) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        note: '`lo + (hi-lo)/2` avoids overflow when lo+hi exceeds the type. For maximize-feasible flip to `mid = lo+(hi-lo+1)/2`, `lo = mid`, `hi = mid-1`.',
      },
    ],
  },
  {
    id: 'numtheory', icon: '🧱', title: 'Number Theory',
    sub: 'modpow, inverse, gcd, sieve, factorization',
    items: [
      {
        h: 'Fast power & modular inverse',
        md: 'Binary exponentiation: O(log e). Inverse via Fermat needs **prime** MOD.',
        code: `ll modpow(ll a, ll e, ll m = MOD) {
    ll r = 1; a %= m;
    while (e) {
        if (e & 1) r = (r * a) % m;   // use current bit
        a = (a * a) % m;              // square base
        e >>= 1;
    }
    return r;
}
ll modinv(ll a, ll m = MOD) { return modpow(a, m - 2, m); }  // Fermat`,
      },
      {
        h: 'GCD / LCM',
        code: `ll gcdll(ll a, ll b) { return b ? gcdll(b, a % b) : a; }
ll lcmll(ll a, ll b) { return a / gcdll(a, b) * b; }   // divide first: overflow`,
      },
      {
        h: 'Sieve of Eratosthenes — primes up to n in O(n log log n)',
        code: `vector<bool> is_prime;
vector<int> primes;
void sieve(int n) {
    is_prime.assign(n + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; (ll)i * i <= n; i++)
        if (is_prime[i])
            for (int j = i * i; j <= n; j += i) is_prime[j] = false;
    for (int i = 2; i <= n; i++)
        if (is_prime[i]) primes.push_back(i);
}`,
      },
      {
        h: 'Trial-division factorization — O(√n)',
        code: `vector<pair<ll,int>> factorize(ll n) {
    vector<pair<ll,int>> f;
    for (ll p = 2; p * p <= n; p++) {
        if (n % p == 0) {
            int cnt = 0;
            while (n % p == 0) { n /= p; cnt++; }
            f.push_back({p, cnt});
        }
    }
    if (n > 1) f.push_back({n, 1});   // leftover prime
    return f;
}`,
      },
      {
        h: 'nCr with precomputed factorials — O(1) per query',
        code: `const int MAXF = 1'000'000;
ll fact[MAXF + 1], invfact[MAXF + 1];
void init_fact() {
    fact[0] = 1;
    for (int i = 1; i <= MAXF; i++) fact[i] = fact[i-1] * i % MOD;
    invfact[MAXF] = modinv(fact[MAXF]);
    for (int i = MAXF; i > 0; i--) invfact[i-1] = invfact[i] * i % MOD;
}
ll nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * invfact[r] % MOD * invfact[n-r] % MOD;
}`,
      },
    ],
  },
  {
    id: 'graphs', icon: '🕸️', title: 'Graph Traversal & Shortest Paths',
    sub: 'BFS, DFS, Dijkstra, 0-1 BFS, toposort',
    items: [
      {
        h: 'BFS — unweighted shortest paths',
        code: `vector<int> bfs(const vector<vector<int>>& g, int s) {
    int n = g.size();
    vector<int> dist(n, INT_MAX);
    queue<int> q;
    dist[s] = 0; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u])
            if (dist[v] == INT_MAX) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
    }
    return dist;
}`,
      },
      {
        h: 'DFS — components, reachability',
        code: `void dfs(int u, vector<int>& vis, const vector<vector<int>>& g) {
    vis[u] = 1;
    for (int v : g[u])
        if (!vis[v]) dfs(v, vis, g);
}`,
        note: 'Deep recursion (n ≈ 10⁵+ on a path) can overflow the stack — convert to an explicit stack if needed.',
      },
      {
        h: 'Dijkstra — non-negative weights, O((V+E) log V)',
        code: `struct EdgeW { int to; ll w; };

vector<ll> dijkstra(const vector<vector<EdgeW>>& g, int s) {
    int n = g.size();
    vector<ll> dist(n, INF);
    priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>> pq;
    dist[s] = 0; pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) continue;        // stale entry: skip
        for (auto& e : g[u]) {
            ll nd = d + e.w;
            if (nd < dist[e.to]) {
                dist[e.to] = nd;
                pq.push({nd, e.to});
            }
        }
    }
    return dist;
}`,
        note: 'The `d != dist[u]` check replaces a decrease-key. **Never** use Dijkstra with negative edges — Bellman-Ford handles those in O(VE).',
      },
      {
        h: '0–1 BFS — edge weights 0 or 1, O(V+E)',
        code: `vector<ll> zeroOneBFS(const vector<vector<EdgeW>>& g, int s) {
    int n = g.size();
    deque<int> dq;
    vector<ll> dist(n, INF);
    dist[s] = 0; dq.push_back(s);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto& e : g[u])
            if (dist[u] + e.w < dist[e.to]) {
                dist[e.to] = dist[u] + e.w;
                if (e.w == 0) dq.push_front(e.to);  // free edge: jump queue
                else dq.push_back(e.to);
            }
    }
    return dist;
}`,
      },
      {
        h: 'Topological sort (Kahn) — DAG ordering + cycle detection',
        code: `vector<int> topoSort(vector<vector<int>>& g) {
    int n = g.size();
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : g[u]) indeg[v]++;
    queue<int> q;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) q.push(i);
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : g[u])
            if (--indeg[v] == 0) q.push(v);
    }
    return order;   // order.size() < n  →  graph has a cycle
}`,
      },
    ],
  },
  {
    id: 'dsu', icon: '🔗', title: 'DSU & MST',
    sub: 'Union-Find and Kruskal',
    items: [
      {
        h: 'Disjoint Set Union — near-O(1) merge/find',
        code: `struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};`,
        note: 'Path compression + union by size. `unite` returning false = already connected (cycle if this was an edge).',
      },
      {
        h: 'Kruskal MST — O(E log E)',
        code: `struct EdgeMST { int u, v; ll w; };

ll kruskal(int n, vector<EdgeMST>& edges) {
    sort(edges.begin(), edges.end(),
         [](auto& a, auto& b) { return a.w < b.w; });
    DSU d(n);
    ll cost = 0;
    int used = 0;
    for (auto& e : edges)
        if (d.unite(e.u, e.v)) { cost += e.w; used++; }
    // used < n-1  →  graph not connected
    return cost;
}`,
      },
    ],
  },
  {
    id: 'dp', icon: '🧩', title: 'DP Classics',
    sub: 'Knapsack and LIS',
    items: [
      {
        h: '0/1 Knapsack — O(n·W), 1D rolling array',
        code: `ll knapsack01(const vector<ll>& wt, const vector<ll>& val, int W) {
    int n = wt.size();
    vector<ll> dp(W + 1, 0);          // dp[w] = best value at capacity w
    for (int i = 0; i < n; i++)
        for (int w = W; w >= wt[i]; w--)        // DOWNWARD: each item once
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[W];
}`,
        note: 'Iterate capacity **downward** for 0/1 (each item once); upward gives unbounded knapsack (reuse allowed). This single direction flip is the most-tested knapsack fact.',
      },
      {
        h: 'LIS in O(n log n)',
        code: `int LIS(const vector<int>& a) {
    vector<int> tail;            // tail[k] = min possible end of LIS of length k+1
    for (int x : a) {
        auto it = lower_bound(tail.begin(), tail.end(), x);
        if (it == tail.end()) tail.push_back(x);
        else *it = x;
    }
    return tail.size();
}`,
        note: '`lower_bound` → strictly increasing. Use `upper_bound` for non-decreasing. `tail` is NOT the LIS itself, only its length.',
      },
    ],
  },
  {
    id: 'segtree', icon: '🌳', title: 'Segment Tree',
    sub: 'Range queries + point updates in O(log n)',
    items: [
      {
        h: 'Sum segment tree',
        md: 'Use when values **change** and you still need fast range queries. Swap `+` for `min`/`max`/`gcd` freely.',
        code: `struct SegTree {
    int n; vector<ll> st;
    SegTree(int n) : n(n), st(4 * n, 0) {}

    void build(const vector<ll>& a, int p, int l, int r) {
        if (l == r) { st[p] = a[l]; return; }
        int m = (l + r) / 2;
        build(a, 2*p, l, m);
        build(a, 2*p+1, m+1, r);
        st[p] = st[2*p] + st[2*p+1];
    }
    void build(const vector<ll>& a) { build(a, 1, 0, n - 1); }

    void update(int idx, ll val, int p, int l, int r) {
        if (l == r) { st[p] = val; return; }
        int m = (l + r) / 2;
        if (idx <= m) update(idx, val, 2*p, l, m);
        else update(idx, val, 2*p+1, m+1, r);
        st[p] = st[2*p] + st[2*p+1];
    }
    void update(int idx, ll val) { update(idx, val, 1, 0, n - 1); }

    ll query(int L, int R, int p, int l, int r) {
        if (R < l || r < L) return 0;            // disjoint: identity
        if (L <= l && r <= R) return st[p];      // fully inside
        int m = (l + r) / 2;
        return query(L, R, 2*p, l, m) + query(L, R, 2*p+1, m+1, r);
    }
    ll query(int L, int R) { return query(L, R, 1, 0, n - 1); }
};`,
        note: 'For min-queries the identity is `INF`, for max `-INF`. Fenwick (BIT) does prefix sums in less code if you only need sums.',
      },
      {
        h: 'Fenwick tree (BIT) — prefix sums, point add',
        code: `struct BIT {
    int n; vector<ll> t;
    BIT(int n) : n(n), t(n + 1, 0) {}
    void add(int i, ll v) {            // 1-indexed
        for (; i <= n; i += i & (-i)) t[i] += v;
    }
    ll sum(int i) {                    // prefix sum [1..i]
        ll s = 0;
        for (; i > 0; i -= i & (-i)) s += t[i];
        return s;
    }
    ll sum(int l, int r) { return sum(r) - sum(l - 1); }
};`,
      },
    ],
  },
  {
    id: 'strings', icon: '🔤', title: 'String Algorithms',
    sub: 'Prefix function & KMP',
    items: [
      {
        h: 'Prefix function (π) — borders in O(n)',
        md: '`pi[i]` = length of the longest proper prefix of `s[0..i]` that is also a suffix. Borders, periods, and matching all fall out of it.',
        code: `vector<int> prefixFunction(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];  // fall back
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    return pi;
}`,
      },
      {
        h: 'KMP search — all occurrences in O(n + m)',
        code: `vector<int> kmpSearch(const string& text, const string& pat) {
    string s = pat + "#" + text;      // '#' must not occur in either
    auto pi = prefixFunction(s);
    int m = pat.size();
    vector<int> res;
    for (int i = m + 1; i < (int)s.size(); i++)
        if (pi[i] == m) res.push_back(i - 2 * m);   // start index in text
    return res;
}`,
        note: 'Smallest period of s = `n - pi[n-1]` (when it divides n). Polynomial hashing is the other workhorse — O(1) substring compare after O(n) prep.',
      },
    ],
  },
  {
    id: 'lca', icon: '🧗', title: 'LCA — Binary Lifting',
    sub: 'k-th ancestor & lowest common ancestor in O(log n)',
    items: [
      {
        h: 'Preprocess + query',
        code: `const int LOG = 20;                  // 2^20 > 10^6 nodes
vector<vector<int>> tree;            // adjacency, size n
int up[200005][LOG];                 // up[v][k] = 2^k-th ancestor
int depth_[200005];

void dfsLCA(int v, int p) {
    up[v][0] = p;
    for (int i = 1; i < LOG; i++)
        up[v][i] = up[v][i-1] < 0 ? -1 : up[up[v][i-1]][i-1];
    for (int to : tree[v])
        if (to != p) {
            depth_[to] = depth_[v] + 1;
            dfsLCA(to, v);
        }
}

int lift(int v, int dist) {          // dist-th ancestor (binary decompose)
    for (int i = 0; i < LOG && v >= 0; i++)
        if (dist & (1 << i)) v = up[v][i];
    return v;
}

int LCA(int a, int b) {
    if (depth_[a] < depth_[b]) swap(a, b);
    a = lift(a, depth_[a] - depth_[b]);   // equalize depths
    if (a == b) return a;
    for (int i = LOG - 1; i >= 0; i--)    // jump together while different
        if (up[a][i] != up[b][i]) { a = up[a][i]; b = up[b][i]; }
    return up[a][0];
}

// distance(u,v) = depth[u] + depth[v] - 2*depth[LCA(u,v)]`,
      },
    ],
  },
  {
    id: 'flow', icon: '🚰', title: 'Max Flow — Dinic',
    sub: 'Flow networks, min cut, bipartite matching',
    items: [
      {
        h: 'Dinic — fast enough for ICPC',
        md: 'Use for: max matching, "max simultaneous tasks", min cut (= max flow). Bipartite matching: source → left (cap 1), right → sink (cap 1), edges cap 1.',
        code: `struct EdgeF { int to; ll cap; int rev; };

struct Dinic {
    int n;
    vector<vector<EdgeF>> g;
    vector<int> level, it;
    Dinic(int n) : n(n), g(n), level(n), it(n) {}

    void addEdge(int u, int v, ll c) {
        g[u].push_back({v, c, (int)g[v].size()});
        g[v].push_back({u, 0, (int)g[u].size() - 1});   // residual
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q; q.push(s); level[s] = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (auto& e : g[u])
                if (e.cap > 0 && level[e.to] < 0) {
                    level[e.to] = level[u] + 1;
                    q.push(e.to);
                }
        }
        return level[t] >= 0;
    }
    ll send(int u, ll f, int t) {
        if (u == t) return f;
        for (int& i = it[u]; i < (int)g[u].size(); i++) {
            auto& e = g[u][i];
            if (e.cap > 0 && level[e.to] == level[u] + 1) {
                ll pushed = send(e.to, min(f, e.cap), t);
                if (pushed) {
                    e.cap -= pushed;
                    g[e.to][e.rev].cap += pushed;
                    return pushed;
                }
            }
        }
        return 0;
    }
    ll maxFlow(int s, int t) {
        ll flow = 0;
        while (bfs(s, t)) {
            fill(it.begin(), it.end(), 0);
            while (ll p = send(s, INF, t)) flow += p;
        }
        return flow;
    }
};`,
      },
    ],
  },
  {
    id: 'geometry', icon: '📐', title: 'Geometry Primitives',
    sub: 'Cross products, orientation, segment intersection',
    items: [
      {
        h: 'Points & cross product',
        md: '`cross(a,b,c) > 0` → c is left of a→b (counter-clockwise turn); `< 0` → right; `= 0` → collinear. Integer coordinates: stay in `long long`, no doubles, no epsilon.',
        code: `struct Point { ll x, y; };
Point operator-(const Point& a, const Point& b) { return {a.x - b.x, a.y - b.y}; }
ll cross(Point a, Point b) { return a.x * b.y - a.y * b.x; }
ll cross(Point a, Point b, Point c) { return cross(b - a, c - a); }`,
      },
      {
        h: 'Segment intersection (proper + touching)',
        code: `bool onSeg(Point a, Point b, Point p) {     // p on segment ab?
    return cross(a, b, p) == 0 &&
           min(a.x,b.x) <= p.x && p.x <= max(a.x,b.x) &&
           min(a.y,b.y) <= p.y && p.y <= max(a.y,b.y);
}
bool segIntersect(Point a, Point b, Point c, Point d) {
    ll c1 = cross(a,b,c), c2 = cross(a,b,d);
    ll c3 = cross(c,d,a), c4 = cross(c,d,b);
    if (((c1>0 && c2<0) || (c1<0 && c2>0)) &&
        ((c3>0 && c4<0) || (c3<0 && c4>0))) return true;   // proper cross
    if (c1 == 0 && onSeg(a,b,c)) return true;              // touching cases
    if (c2 == 0 && onSeg(a,b,d)) return true;
    if (c3 == 0 && onSeg(c,d,a)) return true;
    if (c4 == 0 && onSeg(c,d,b)) return true;
    return false;
}`,
        note: 'Polygon area: sum cross products of consecutive vertices / 2 (shoelace). Convex hull: sort + two half-hulls with cross-product turns (Andrew’s monotone chain).',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// The "Which tool do I use?" wizard — the SAUCE.cpp flowchart, interactive.
// ---------------------------------------------------------------------------
export const WIZARD = {
  q: 'What is the problem fundamentally about?',
  options: [
    {
      label: '📊 **Sums / ranges / rectangles** over an array or grid',
      next: {
        q: 'Does the data change between queries?',
        options: [
          { label: 'No — static data, many queries', result: { icon: '➕', title: 'Prefix sums', md: '1D or 2D prefix sums: O(n) prep, O(1) per query. For static range **min/max**: sparse table.', sectionId: 'prefix' } },
          { label: 'Yes — point updates between queries', result: { icon: '🌳', title: 'Fenwick / segment tree', md: 'Fenwick (BIT) for sums — short code. Segment tree for min/max/gcd or anything fancier. O(log n) per op.', sectionId: 'segtree' } },
          { label: 'Yes — whole RANGES get updated', result: { icon: '😴', title: 'Lazy segment tree', md: 'Range update + range query → segment tree with lazy propagation. Difference array if you only read once at the end.', sectionId: 'segtree' } },
        ],
      },
    },
    {
      label: '🎯 “**Minimize/maximize X** such that condition holds” — answer feels monotonic',
      result: { icon: '🎯', title: 'Binary search on the answer', md: 'Define `ok(x)` (can we do it with x?). If feasibility is monotonic, binary search the boundary. Check: would doubling x keep it feasible? Then it’s monotonic.', sectionId: 'binsearch' },
    },
    {
      label: '🕸️ It’s a **graph** (or can be modeled as one: states + moves)',
      next: {
        q: 'What do you need from the graph?',
        options: [
          { label: 'Shortest path, all edges equal cost', result: { icon: '🌊', title: 'BFS', md: 'Unweighted shortest path = BFS, O(V+E). Grids: cells are nodes, 4-neighbors are edges.', sectionId: 'graphs' } },
          { label: 'Shortest path, weighted (non-negative)', result: { icon: '🛰️', title: 'Dijkstra', md: 'Priority-queue Dijkstra, O((V+E) log V). Weights only 0/1? Use 0-1 BFS with a deque, O(V+E). Negative edges? Bellman-Ford.', sectionId: 'graphs' } },
          { label: 'Connectivity / components / cycles', result: { icon: '🕳️', title: 'DFS or DSU', md: 'Static graph → DFS components. Edges arrive over time ("are u,v connected yet?") → DSU.', sectionId: 'dsu' } },
          { label: 'Order tasks with dependencies', result: { icon: '📋', title: 'Topological sort', md: 'Kahn’s algorithm (BFS on in-degrees). If the order has fewer than n nodes → cycle. DP over the topo order handles "longest path in DAG".', sectionId: 'graphs' } },
          { label: 'Cheapest way to connect everything', result: { icon: '🔗', title: 'MST — Kruskal', md: 'Sort edges, add greedily with DSU skipping cycles. O(E log E).', sectionId: 'dsu' } },
          { label: 'Matching / assignment / max throughput', result: { icon: '🚰', title: 'Max flow — Dinic', md: 'Bipartite matching, min cut, "max simultaneous X" → flow network + Dinic.', sectionId: 'flow' } },
        ],
      },
    },
    {
      label: '🧩 **Count ways / best value** with overlapping subproblems ("how many", "max profit")',
      next: {
        q: 'What does the state look like?',
        options: [
          { label: 'Choose items under a capacity', result: { icon: '🎒', title: 'Knapsack DP', md: '0/1: iterate capacity downward. Unbounded: upward. dp[w] = best using capacity w.', sectionId: 'dp' } },
          { label: 'Longest increasing structure', result: { icon: '📈', title: 'LIS', md: 'O(n log n) with the tails array + lower_bound.', sectionId: 'dp' } },
          { label: 'Position in grid / sequence index', result: { icon: '🗺️', title: 'Classic DP', md: 'dp[i] or dp[i][j] over positions; transitions from neighbors. Write the recurrence before the code.', sectionId: 'dp' } },
          { label: 'A subset of ≤ 20 things', result: { icon: '🎭', title: 'Bitmask DP', md: 'dp[mask][i]: subsets as bits. n ≤ 20 in the constraints is the giveaway. O(2ⁿ·n²) for TSP-likes.', sectionId: 'dp' } },
        ],
      },
    },
    {
      label: '🔤 **Strings**: find/match/compare substrings',
      result: { icon: '🧵', title: 'KMP / hashing', md: 'Pattern occurrences → KMP (prefix function) or Z-function. Compare many substrings → polynomial hashing. Borders/periods → prefix function directly.', sectionId: 'strings' },
    },
    {
      label: '🌲 **Tree** with many distance / ancestor queries',
      result: { icon: '🧗', title: 'LCA via binary lifting', md: 'Preprocess O(n log n), query O(log n). dist(u,v) = depth(u)+depth(v)−2·depth(LCA). k-th ancestor = same table.', sectionId: 'lca' },
    },
    {
      label: '🔢 **Math**: divisibility, primes, counting, mod 1e9+7',
      result: { icon: '🧱', title: 'Number theory toolkit', md: 'Primes up to n → sieve. Factor one number → trial division to √n. Division under mod → modular inverse (modpow). Many nCr queries → factorial precompute.', sectionId: 'numtheory' },
    },
    {
      label: '📐 **Geometry**: points, segments, polygons, turns',
      result: { icon: '📐', title: 'Cross-product primitives', md: 'Orientation and segment intersection cover most geometry at regionals. Stay in integers (long long); avoid doubles until forced.', sectionId: 'geometry' },
    },
    {
      label: '🤷 None of these — small constraints though (n ≤ 20ish)',
      result: { icon: '🔨', title: 'Brute force / backtracking', md: 'n ≤ 20 → 2ⁿ subsets or bitmask DP. n ≤ 10 → permutations (10! ≈ 3.6M). Tiny constraints are the setter telling you to enumerate everything. Estimate ops/sec ≈ 10⁸ and check it fits.', sectionId: 'template' },
    },
  ],
};

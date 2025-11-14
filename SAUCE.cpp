/*******************************************************************************************
      ███████╗ █████╗ ██╗   ██╗ ██████╗███████╗
      ██╔════╝██╔══██╗██║   ██║██╔════╝██╔════╝
      ███████╗███████║██║   ██║██║     █████╗
      ╚════██║██╔══██║██║   ██║██║     ██╔══╝
      ███████║██║  ██║╚██████╔╝╚██████╗███████╗
      ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝

      SAUCE: Samuel's All-Purpose Ultimate Competitive Engine
      (ICPC C++ HANDBOOK — FLOWCHART + CODE + EXPLANATIONS)

      HOW TO USE SAUCE DURING CONTEST
      --------------------------------
      • Treat this as your "standard library + patterns" sheet.
      • Skim the flowchart below → jump to the right section.
      • Copy/paste snippets into your solution and adapt.

********************************************************************************************
 FLOWCHART: WHICH TOOL DO I USE?

 1) Is it about sums / ranges / rectangles over static data?
    → Many queries, array doesn’t change?
       → Use PREFIX SUMS (1D or 2D).
    → Values change and you still need fast range queries?
       → Use SEGMENT TREE.

 2) Problem says "Find minimum X such that condition holds" OR answer seems monotonic?
    → Use BINARY SEARCH ON ANSWER (define ok(x) and search range).

 3) Graph problem?
    • Unweighted shortest path      → BFS
    • Weighted (non-negative) path  → DIJKSTRA
    • Edge weights are 0 / 1        → 0–1 BFS
    • Just exploring / counting     → DFS
    • Need order with dependencies  → TOPO SORT (DAG)
    • Need min-cost to connect all  → MST (KRUSKAL + DSU)
    • Need max matching / flow      → DINIC MAX FLOW

 4) String / pattern matching?
    → Need to find occurrences of pattern in text efficiently?
       → KMP (prefix function).

 5) Tree with a lot of "distance / ancestor" queries?
    → Use LCA (BINARY LIFTING).

 6) DP / counting?
    • Choose subset under capacity  → 0/1 KNAPSACK
    • Longest increasing pattern    → LIS
    • Lots of nCr queries           → nCr with precomputed factorials.

 7) Geometry / intersections / direction of turns?
    → Use orientation + segment intersection helpers.

*******************************************************************************************/

#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using ld = long double;
const ll INF = 4e18;
const int MOD = 1'000'000'007;

/*************************************************
 * 0. BASE UTILITIES — ALWAYS USEFUL EVERYWHERE
 *
 * Why valuable:
 *  - Almost every problem benefits from fast power / inverse.
 *  - GCD is staple for fractions, lcm, and number theory.
 *************************************************/
ll modpow(ll a, ll e, ll m = MOD)
{
    ll r = 1;
    a %= m;
    while (e)
    {
        if (e & 1)
            r = (r * a) % m; // use current bit
        a = (a * a) % m;     // square base
        e >>= 1;
    }
    return r;
}

// Modular inverse when MOD is prime.
// Use for division in modular arithmetic (e.g., nCr mod MOD).
ll modinv(ll a, ll m = MOD)
{
    return modpow(a, m - 2, m); // Fermat's little theorem
}

// Standard euclidean gcd; useful in number theory / fractions.
ll gcdll(ll a, ll b)
{
    return b ? gcdll(b, a % b) : a;
}

/*************************************************
 * 1. PREFIX SUMS — RANGE SUM QUERIES IN O(1)
 *
 * When:
 *  - You have an array or grid and many queries like:
 *      "What is sum on interval [l, r]?" or
 *      "Sum inside this rectangle?"
 *  - Data does NOT change (static array/grid).
 *
 * Why:
 *  - Preprocessing O(n) (or O(n*m)) → each query O(1).
 *  - Very common in ICPC for subarray counts / sums / 2D grids.
 *************************************************/

// 1D Prefix sum — use for many subarray sum queries on a static array.
vector<ll> prefix1D(const vector<ll> &a)
{
    int n = (int)a.size();
    vector<ll> p(n + 1, 0); // p[i] = sum of a[0..i-1]
    for (int i = 0; i < n; i++)
    {
        p[i + 1] = p[i] + a[i];
    }
    return p;
}

// Get sum a[l] + ... + a[r] in O(1).
ll range_sum(const vector<ll> &p, int l, int r)
{
    return p[r + 1] - p[l];
}

// 2D Prefix sum — sum of subrectangles in a matrix.
vector<vector<ll>> prefix2D(const vector<vector<ll>> &a)
{
    int n = (int)a.size();
    int m = (int)a[0].size();
    vector<vector<ll>> ps(n + 1, vector<ll>(m + 1, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            ps[i + 1][j + 1] = a[i][j] + ps[i][j + 1] + ps[i + 1][j] - ps[i][j];
    return ps;
}

// Sum of submatrix with corners (x1,y1) to (x2,y2), inclusive.
ll rectSum(const vector<vector<ll>> &ps, int x1, int y1, int x2, int y2)
{
    return ps[x2 + 1][y2 + 1] - ps[x1][y2 + 1] - ps[x2 + 1][y1] + ps[x1][y1];
}

/*************************************************
 * 2. BINARY SEARCH — SORTED DATA OR "ANSWER" PROBLEMS
 *
 * When:
 *  - Array is sorted and you need to find a boundary (first ≥ x).
 *  - Or "Is X feasible?" is monotonic (once true, stays true or vice versa).
 *
 * Why:
 *  - Avoids brute forcing range [lo..hi].
 *  - Standard for "minimize X such that condition holds".
 *************************************************/

// Classic lower_bound: first index where a[idx] >= x.
// Use when you need to locate position of value in sorted vector.
int lowerBoundIdx(const vector<int> &a, int x)
{
    int l = 0, r = (int)a.size();
    while (l < r)
    {
        int mid = (l + r) / 2;
        if (a[mid] < x)
            l = mid + 1;
        else
            r = mid;
    }
    return l; // possibly == a.size()
}

// Binary search on answer pattern.
// Define ok(x): returns true if x is "good / feasible".
// Use when you want the smallest x such that ok(x) is true.
bool ok(ll x)
{
    // TODO: fill in condition for your problem
    return true;
}
ll binarySearchAnswer(ll lo, ll hi)
{
    while (lo < hi)
    {
        ll mid = (lo + hi) / 2;
        if (ok(mid))
            hi = mid;
        else
            lo = mid + 1;
    }
    return lo;
}

/*************************************************
 * 3. COMBINATORICS (nCr) — MANY COMB / CHOOSE QUERIES
 *
 * When:
 *  - You need binomial coefficients nCr mod MOD for many queries.
 *    e.g., counting paths, subsets, combinatorial DP, etc.
 *
 * Why:
 *  - Precompute factorials + inverse factorials → nCr in O(1).
 *************************************************/
const int MAXF = 1'000'000;
ll fact[MAXF + 1], invfact[MAXF + 1];

void init_fact()
{
    fact[0] = 1;
    for (int i = 1; i <= MAXF; i++)
        fact[i] = fact[i - 1] * i % MOD;

    invfact[MAXF] = modinv(fact[MAXF]);
    for (int i = MAXF; i > 0; i--)
        invfact[i - 1] = invfact[i] * i % MOD;
}

// nCr modulo MOD in O(1) after init_fact().
ll nCr(int n, int r)
{
    if (r < 0 || r > n)
        return 0;
    return fact[n] * invfact[r] % MOD * invfact[n - r] % MOD;
}

/*************************************************
 * 4. SIEVE & PRIME FACTORIZATION — NUMBER THEORY TOOLKIT
 *
 * When:
 *  - You need primes up to N (for any prime-based logic).
 *  - Need to factor numbers into prime powers.
 *
 * Why:
 *  - Sieve gives O(N log log N) prime generation.
 *  - Factorization helps with gcd/lcm, divisor counting, etc.
 *************************************************/
vector<bool> is_prime;
vector<int> primes;

// Sieve up to n — use once at start if you need global primes.
void sieve(int n)
{
    is_prime.assign(n + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; i * i <= n; i++)
    {
        if (is_prime[i])
        {
            for (int j = i * i; j <= n; j += i)
                is_prime[j] = false;
        }
    }
    for (int i = 2; i <= n; i++)
        if (is_prime[i])
            primes.push_back(i);
}

// Naive factorization by trial division up to sqrt(n).
vector<pair<ll, int>> factorize(ll n)
{
    vector<pair<ll, int>> f;
    for (ll p = 2; p * p <= n; p++)
    {
        if (n % p == 0)
        {
            int cnt = 0;
            while (n % p == 0)
            {
                n /= p;
                cnt++;
            }
            f.push_back({p, cnt});
        }
    }
    if (n > 1)
        f.push_back({n, 1});
    return f;
}

/*************************************************
 * 5. GRAPH TRAVERSAL — BFS & DFS
 *
 * When BFS:
 *  - Unweighted graph and you need shortest path (#edges).
 *  - "Minimum number of steps" in grid or adjacency list.
 *
 * When DFS:
 *  - Check connectivity, count components.
 *  - Tree traversals, detect cycles (with a bit of extra logic).
 *************************************************/

// BFS: returns distance array (INT_MAX if unreachable).
vector<int> bfs(const vector<vector<int>> &g, int s)
{
    int n = (int)g.size();
    vector<int> dist(n, INT_MAX);
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        for (int v : g[u])
        {
            if (dist[v] == INT_MAX)
            {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}

// DFS: simple recursive traversal.
void dfsUtil(int u, vector<int> &vis, const vector<vector<int>> &g)
{
    vis[u] = 1;
    for (int v : g[u])
    {
        if (!vis[v])
            dfsUtil(v, vis, g);
    }
}

/*************************************************
 * 6. DIJKSTRA — SHORTEST PATH WITH NON-NEGATIVE WEIGHTS
 *
 * When:
 *  - Weighted graph with non-negative edge weights.
 *  - Need fastest route / minimum cost path from a source.
 *
 * Why:
 *  - O((V + E) log V) and easy to implement.
 *************************************************/
struct EdgeW
{
    int to;
    ll w;
};

vector<ll> dijkstra(const vector<vector<EdgeW>> &g, int s)
{
    int n = (int)g.size();
    vector<ll> dist(n, INF);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq;

    dist[s] = 0;
    pq.push({0, s});
    while (!pq.empty())
    {
        auto [d, u] = pq.top();
        pq.pop();
        if (d != dist[u])
            continue; // skip stale state
        for (auto &e : g[u])
        {
            ll nd = d + e.w;
            if (nd < dist[e.to])
            {
                dist[e.to] = nd;
                pq.push({nd, e.to});
            }
        }
    }
    return dist;
}

/*************************************************
 * 7. 0–1 BFS — GRAPH WITH EDGE WEIGHTS 0 OR 1
 *
 * When:
 *  - Graph edges are only 0 or 1.
 *  - You need shortest path (sum of weights).
 *
 * Why:
 *  - Faster than Dijkstra, O(V + E) using deque.
 *************************************************/
vector<ll> zeroOneBFS(const vector<vector<EdgeW>> &g, int s)
{
    int n = (int)g.size();
    deque<int> dq;
    vector<ll> dist(n, INF);

    dist[s] = 0;
    dq.push_back(s);
    while (!dq.empty())
    {
        int u = dq.front();
        dq.pop_front();
        for (auto &e : g[u])
        {
            int v = e.to;
            ll w = e.w; // must be 0 or 1
            if (dist[u] + w < dist[v])
            {
                dist[v] = dist[u] + w;
                if (w == 0)
                    dq.push_front(v);
                else
                    dq.push_back(v);
            }
        }
    }
    return dist;
}

/*************************************************
 * 8. TOPOLOGICAL SORT — DAG ORDERING
 *
 * When:
 *  - Directed graph with dependency constraints.
 *  - Need an order to process tasks such that prerequisites come first.
 *
 * Why:
 *  - Detects cycles (if not all nodes processed).
 *  - Foundation for DP on DAGs.
 *************************************************/
vector<int> topoSort(vector<vector<int>> &g)
{
    int n = (int)g.size();
    vector<int> indeg(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : g[u])
            indeg[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0)
            q.push(i);

    vector<int> order;
    while (!q.empty())
    {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : g[u])
        {
            if (--indeg[v] == 0)
                q.push(v);
        }
    }
    // if order.size() < n → graph has a cycle
    return order;
}

/*************************************************
 * 9. DISJOINT SET UNION (DSU / UNION-FIND)
 *
 * When:
 *  - Questions about connectivity: "Are x and y in same component?"
 *  - Building MST (Kruskal).
 *  - Grouping / merging sets efficiently.
 *
 * Why:
 *  - Almost O(1) per operation (amortized).
 *************************************************/
struct DSU
{
    vector<int> p, sz;

    DSU(int n) : p(n), sz(n, 1)
    {
        iota(p.begin(), p.end(), 0);
    }
    int find(int x)
    {
        return p[x] == x ? x : p[x] = find(p[x]);
    }
    bool unite(int a, int b)
    {
        a = find(a);
        b = find(b);
        if (a == b)
            return false;
        if (sz[a] < sz[b])
            swap(a, b);
        p[b] = a;
        sz[a] += sz[b];
        return true;
    }
};

/*************************************************
 * 10. MINIMUM SPANNING TREE (KRUSKAL)
 *
 * When:
 *  - You want minimum total edge weight that connects all vertices.
 *  - Network / cable / road building problems with minimal cost.
 *
 * Why:
 *  - O(E log E) + DSU, easy to code and reason about.
 *************************************************/
struct EdgeMST
{
    int u, v;
    ll w;
};

ll kruskal(int n, vector<EdgeMST> &edges)
{
    sort(edges.begin(), edges.end(),
         [](auto &a, auto &b)
         { return a.w < b.w; });
    DSU d(n);
    ll cost = 0;
    for (auto &e : edges)
    {
        if (d.unite(e.u, e.v))
        {
            cost += e.w;
        }
    }
    return cost;
}

/*************************************************
 * 11. DYNAMIC PROGRAMMING SNIPPETS
 *
 * 11a) 0/1 KNAPSACK
 *  - When you have items with weight & value and capacity limit W.
 *  - Each item either taken at most once (0 or 1).
 *
 * 11b) LIS
 *  - When you need the longest increasing subsequence length.
 *  - Often used in sequence / ordering problems.
 *************************************************/

// 0/1 Knapsack: returns best value with capacity W.
ll knapsack01(const vector<ll> &wt, const vector<ll> &val, int W)
{
    int n = (int)wt.size();
    vector<ll> dp(W + 1, 0);
    for (int i = 0; i < n; i++)
    {
        for (int w = W; w >= wt[i]; w--)
        {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}

// LIS length in O(n log n).
int LIS(const vector<int> &a)
{
    vector<int> tail; // tail[k] = min end of LIS length k+1
    for (int x : a)
    {
        auto it = lower_bound(tail.begin(), tail.end(), x);
        if (it == tail.end())
            tail.push_back(x);
        else
            *it = x;
    }
    return (int)tail.size();
}

/*************************************************
 * 12. SLIDING WINDOW / TWO POINTERS
 *
 * When:
 *  - Working with contiguous subarrays / substrings.
 *  - Constraints like "sum ≤ S", "at most K distinct", etc.
 *
 * Why:
 *  - Often turns O(n^2) into O(n).
 *************************************************/

// Example: Maximum length subarray with sum ≤ S (non-negative a[i]).
int maxSubarraySumLimit(const vector<ll> &a, ll S)
{
    ll sum = 0;
    int l = 0, best = 0;
    for (int r = 0; r < (int)a.size(); r++)
    {
        sum += a[r];
        while (sum > S)
        {
            sum -= a[l++];
        }
        best = max(best, r - l + 1);
    }
    return best;
}

/*************************************************
 * 13. STRING ALGORITHMS (KMP / PREFIX FUNCTION)
 *
 * When:
 *  - You need to find occurrences of a pattern in a long text.
 *  - Pattern and text sizes can be up to 10^5–10^6.
 *
 * Why:
 *  - O(n + m) time, avoids O(n*m) naive scanning.
 *************************************************/

// Prefix function π[i]: length of longest proper prefix == suffix for s[0..i].
vector<int> prefixFunction(const string &s)
{
    int n = (int)s.size();
    vector<int> pi(n);
    for (int i = 1; i < n; i++)
    {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j])
            j = pi[j - 1];
        if (s[i] == s[j])
            j++;
        pi[i] = j;
    }
    return pi;
}

// KMP search: returns starting positions of pattern in text.
vector<int> kmpSearch(const string &text, const string &pat)
{
    string s = pat + "#" + text;
    auto pi = prefixFunction(s);
    int m = (int)pat.size();
    vector<int> res;
    for (int i = m + 1; i < (int)s.size(); i++)
    {
        if (pi[i] == m)
        {
            res.push_back(i - 2 * m); // index in original text
        }
    }
    return res;
}

/*************************************************
 * 14. LCA (BINARY LIFTING) — TREE DISTANCES & ANCESTORS
 *
 * When:
 *  - You have a tree and many queries: "what is LCA(u, v)?"
 *  - Need distances or "k-th ancestor" queries.
 *
 * Why:
 *  - Preprocess O(N log N); each LCA query O(log N).
 *************************************************/
const int LOG = 20;
vector<vector<int>> tree; // assign size n in your main
int up[200005][LOG];      // up[v][k] = 2^k-th ancestor of v
int depth_[200005];

void dfsLCA(int v, int p)
{
    up[v][0] = p;
    for (int i = 1; i < LOG; i++)
    {
        if (up[v][i - 1] < 0)
            up[v][i] = -1;
        else
            up[v][i] = up[up[v][i - 1]][i - 1];
    }
    for (int to : tree[v])
        if (to != p)
        {
            depth_[to] = depth_[v] + 1;
            dfsLCA(to, v);
        }
}

// Lift node v up by dist steps.
int lift(int v, int dist)
{
    for (int i = 0; i < LOG; i++)
    {
        if (dist & (1 << i))
        {
            v = up[v][i];
            if (v < 0)
                break;
        }
    }
    return v;
}

int LCA(int a, int b)
{
    if (depth_[a] < depth_[b])
        swap(a, b);
    a = lift(a, depth_[a] - depth_[b]);
    if (a == b)
        return a;
    for (int i = LOG - 1; i >= 0; i--)
    {
        if (up[a][i] != up[b][i])
        {
            a = up[a][i];
            b = up[b][i];
        }
    }
    return up[a][0];
}

/*************************************************
 * 15. GEOMETRY — ORIENTATION & SEGMENT INTERSECTION
 *
 * When:
 *  - You need to check if line segments intersect.
 *  - Determine if three points make a left/right turn.
 *
 * Why:
 *  - Basis of many geometry problems (polygons, visibility, etc.).
 *************************************************/
struct Point
{
    ll x, y;
};
Point operator-(const Point &a, const Point &b)
{
    return {a.x - b.x, a.y - b.y};
}
ll cross(Point a, Point b)
{
    return a.x * b.y - a.y * b.x;
}
ll cross(Point a, Point b, Point c)
{
    return cross(b - a, c - a);
}

bool onSeg(Point a, Point b, Point p)
{
    return cross(a, b, p) == 0 &&
           min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool segIntersect(Point a, Point b, Point c, Point d)
{
    ll c1 = cross(a, b, c);
    ll c2 = cross(a, b, d);
    ll c3 = cross(c, d, a);
    ll c4 = cross(c, d, b);

    if ((c1 > 0 && c2 < 0 || c1 < 0 && c2 > 0) &&
        (c3 > 0 && c4 < 0 || c3 < 0 && c4 > 0))
        return true;
    if (c1 == 0 && onSeg(a, b, c))
        return true;
    if (c2 == 0 && onSeg(a, b, d))
        return true;
    if (c3 == 0 && onSeg(c, d, a))
        return true;
    if (c4 == 0 && onSeg(c, d, b))
        return true;
    return false;
}

/*************************************************
 * 16. SEGMENT TREE — RANGE QUERIES + POINT UPDATES
 *
 * When:
 *  - Need fast range queries (sum/min/max) AND updates to elements.
 *  - Example: "update position i to x, then query sum on [l, r]".
 *
 * Why:
 *  - O(log N) per query and update, supports 10^5+ ops efficiently.
 *************************************************/
struct SegTree
{
    int n;
    vector<ll> st;

    SegTree(int n) : n(n), st(4 * n, 0) {}

    void build(const vector<ll> &a, int p, int l, int r)
    {
        if (l == r)
        {
            st[p] = a[l];
            return;
        }
        int m = (l + r) / 2;
        build(a, p * 2, l, m);
        build(a, p * 2 + 1, m + 1, r);
        st[p] = st[p * 2] + st[p * 2 + 1];
    }

    void build(const vector<ll> &a)
    {
        build(a, 1, 0, n - 1);
    }

    void update(int idx, ll val, int p, int l, int r)
    {
        if (l == r)
        {
            st[p] = val;
            return;
        }
        int m = (l + r) / 2;
        if (idx <= m)
            update(idx, val, p * 2, l, m);
        else
            update(idx, val, p * 2 + 1, m + 1, r);
        st[p] = st[p * 2] + st[p * 2 + 1];
    }

    void update(int idx, ll val)
    {
        update(idx, val, 1, 0, n - 1);
    }

    ll query(int L, int R, int p, int l, int r)
    {
        if (R < l || r < L)
            return 0; // outside
        if (L <= l && r <= R)
            return st[p];
        int m = (l + r) / 2;
        return query(L, R, p * 2, l, m) +
               query(L, R, p * 2 + 1, m + 1, r);
    }

    ll query(int L, int R)
    {
        return query(L, R, 1, 0, n - 1);
    }
};

/*************************************************
 * 17. MAX FLOW — DINIC (FAST MAXIMUM FLOW)
 *
 * When:
 *  - Problems involving assignments, bipartite matching, "max tasks",
 *    "max units that can flow from source to sink" with capacities.
 *
 * Why:
 *  - Very general hammer for network flow. Dinic is fast enough for ICPC.
 *************************************************/
struct EdgeF
{
    int to;
    ll cap;
    int rev;
};

struct Dinic
{
    int n;
    vector<vector<EdgeF>> g;
    vector<int> level, it;

    Dinic(int n) : n(n), g(n), level(n), it(n) {}

    // Add directed edge u -> v with capacity c.
    void addEdge(int u, int v, ll c)
    {
        EdgeF a{v, c, (int)g[v].size()};
        EdgeF b{u, 0, (int)g[u].size()};
        g[u].push_back(a);
        g[v].push_back(b);
    }

    bool bfs(int s, int t)
    {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        q.push(s);
        level[s] = 0;
        while (!q.empty())
        {
            int u = q.front();
            q.pop();
            for (auto &e : g[u])
            {
                if (e.cap > 0 && level[e.to] < 0)
                {
                    level[e.to] = level[u] + 1;
                    q.push(e.to);
                }
            }
        }
        return level[t] >= 0;
    }

    ll send(int u, ll f, int t)
    {
        if (u == t)
            return f;
        for (int &i = it[u]; i < (int)g[u].size(); i++)
        {
            auto &e = g[u][i];
            if (e.cap > 0 && level[e.to] == level[u] + 1)
            {
                ll pushed = send(e.to, min(f, e.cap), t);
                if (pushed)
                {
                    e.cap -= pushed;
                    g[e.to][e.rev].cap += pushed;
                    return pushed;
                }
            }
        }
        return 0;
    }

    ll maxFlow(int s, int t)
    {
        ll flow = 0;
        while (bfs(s, t))
        {
            fill(it.begin(), it.end(), 0);
            while (true)
            {
                ll pushed = send(s, INF, t);
                if (!pushed)
                    break;
                flow += pushed;
            }
        }
        return flow;
    }
};

/*******************************************************************************************
 * END OF SAUCE
 *
 * You can leave main() empty and use this as a reference file,
 * or put quick local tests inside.
 ******************************************************************************************/
int main()
{
    // Use SAUCE as a handbook; normally your contest solutions
    // are separate files with only the pieces you actually need.
    return 0;
}

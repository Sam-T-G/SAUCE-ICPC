// ============================================================================
// data/units/u07.js — Unit 7: Trees
// Traversal & diameter, tree DP & rerooting, LCA via binary lifting.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'tree-basics': {
    id: 'tree-basics',
    objectives: [
      'Root an unrooted tree with DFS and compute subtree sizes and depths',
      'Find the diameter with two BFS/DFS passes and explain why it works',
      'Recognize tree facts: n−1 edges, unique paths, no cycles',
    ],
    theory: [
      {
        h: 'What makes a tree a tree',
        md: 'A tree is a connected graph with **n−1 edges** — equivalently: no cycles, and **exactly one path between any two nodes**. Any two of {connected, n−1 edges, acyclic} imply the third. Contest statements rarely say "tree" outright; they say *"n cities, n−1 roads, all connected"*. That sentence IS the word tree.',
        code: `int n;
cin >> n;
vector<vector<int>> g(n + 1);          // 1-indexed, the contest habit
for (int i = 0; i < n - 1; i++) {      // exactly n-1 edges
    int a, b;
    cin >> a >> b;
    g[a].push_back(b);                 // trees are undirected:
    g[b].push_back(a);                 // store BOTH directions
}`,
      },
      {
        h: 'Rooting a tree: DFS with a parent guard',
        md: 'An unrooted tree becomes rooted the moment you start a DFS at some node (usually 1). Since there are no cycles, you don’t need a `visited` array — **just never walk back into your parent**. Every other neighbor is a child.',
        code: `void dfs(int u, int parent) {
    for (int v : g[u]) {
        if (v == parent) continue;     // the only way "back" — skip it
        depth[v] = depth[u] + 1;       // child is one deeper
        dfs(v, u);                     // v's parent is u
    }
}
// dfs(1, 0) — root at 1, fake parent 0`,
        note: 'A 2·10⁵-node tree can be a single path → recursion depth 2·10⁵. That’s usually fine on judges, but know your stack. (An iterative stack version is the fallback.)',
        noteKind: 'warn',
      },
      {
        h: 'Subtree sizes: the post-order accumulator',
        md: 'The size of u’s subtree = 1 (itself) + sizes of all child subtrees. Compute it **on the way back up** (post-order): children finish before the parent sums them. This little pattern is the seed of all tree DP.',
        code: `int sz[200005];

void dfs(int u, int parent) {
    sz[u] = 1;                         // count yourself
    for (int v : g[u]) {
        if (v == parent) continue;
        dfs(v, u);                     // child computes its size first...
        sz[u] += sz[v];                // ...then we absorb it
    }
}`,
      },
      {
        h: 'Diameter: the two-pass trick',
        md: 'The **diameter** is the longest path in the tree. Magic two-pass algorithm:\n\n1. BFS/DFS from *any* node → find the farthest node `a`.\n2. BFS/DFS from `a` → the farthest distance found is the diameter.\n\nWhy it works (intuition): the farthest node from anywhere must be an **endpoint of some diameter** — a longest path can’t "hide" from you; if it could be extended past `a`, `a` wouldn’t have been farthest.',
        code: `// dist() = BFS returning distance array
auto d1 = bfs(1);
int a = max_element(d1.begin() + 1, d1.end()) - d1.begin();
auto d2 = bfs(a);
int diameter = *max_element(d2.begin() + 1, d2.end());`,
      },
      {
        h: 'Diameter by DP (one DFS)',
        md: 'Alternative: for each node, take the **two deepest child heights** h1 ≥ h2. A path through this node has length h1 + h2; the diameter is the max over all nodes. One DFS, and it generalizes to weighted edges and "max path sum" problems where the two-pass trick gets awkward.',
        code: `int best = 0;
int dfsH(int u, int p) {               // returns height of u's subtree
    int h1 = 0, h2 = 0;                // two largest child heights
    for (int v : g[u]) {
        if (v == p) continue;
        int h = dfsH(v, u) + 1;
        if (h > h1) { h2 = h1; h1 = h; }
        else if (h > h2) h2 = h;
    }
    best = max(best, h1 + h2);         // path bending at u
    return h1;
}`,
      },
    ],
    exercises: [
      {
        id: 'tb-1', type: 'mcq', diff: 1,
        prompt: 'A connected graph has n = 7 nodes and 6 edges. What do you know for certain?',
        options: [
          'It is a tree — connected with n−1 edges means no cycles',
          'It might contain exactly one cycle',
          'It is bipartite only if n is even',
          'Nothing — edge count alone says little',
        ],
        answer: 0,
        explain: 'Connected + n−1 edges ⇒ tree (acyclic, unique paths). Add any edge to a tree and you create exactly one cycle; remove any and it disconnects. This is the most-used graph fact in contests.',
      },
      {
        id: 'tb-2', type: 'fill', diff: 1,
        prompt: 'Tree edges: 1-2, 1-3, 2-4, 2-5. Rooted at 1, what is `sz[2]` (subtree size of node 2)?',
        answer: '3',
        explain: 'Node 2’s subtree contains {2, 4, 5} → size 3. Draw the tree: 1 has children 2 and 3; node 2 has children 4 and 5. Hand-computing sz[] on five-node trees builds the reflex.',
      },
      {
        id: 'tb-3', type: 'mcq', diff: 1,
        prompt: 'In the rooted-tree DFS, why is there no `visited[]` array?',
        code: `void dfs(int u, int parent) {
    for (int v : g[u])
        if (v != parent) dfs(v, u);
}`,
        options: [
          'Trees have no cycles — the only node you could revisit is your parent, and that is excluded',
          'visited[] is implied by the recursion stack',
          'It is a bug; this loops forever',
          'The judge initializes visited automatically',
        ],
        answer: 0,
        explain: 'Acyclicity means the only repeated neighbor is the one you came from. Skipping `parent` is a complete visited-check for trees — cheaper and cleaner. (On general graphs you absolutely still need visited[].)',
      },
      {
        id: 'tb-4', type: 'parsons', diff: 2,
        prompt: 'Assemble the subtree-size DFS (post-order accumulation).',
        lines: [
          'void dfs(int u, int p) {',
          '    sz[u] = 1;',
          '    for (int v : g[u]) {',
          '        if (v == p) continue;',
          '        dfs(v, u);',
          '        sz[u] += sz[v];',
          '    }',
          '}',
        ],
        distractors: [
          '        sz[u] += sz[v] + 1;',
        ],
        explain: 'Initialize with yourself (1), recurse into each child FIRST, then absorb its completed size. The distractor double-counts: sz[v] already includes v itself.',
      },
      {
        id: 'tb-5', type: 'fill', diff: 2,
        prompt: 'Path graph: 1-2, 2-3, 3-4, 4-5. You BFS from node 2 and pick the farthest node, then BFS from there. Which node did the first BFS pick, and what diameter does the second BFS report? Answer as `node diameter`.',
        answer: ['5 4'],
        explain: 'From 2, distances: 1→1, 3→1, 4→2, 5→3 — farthest is 5. From 5, the farthest is 1 at distance 4. The diameter of a 5-node path is 4 edges. Two BFS passes, no DP needed.',
        hint: 'Distances from node 2: who is farthest? Then measure from that endpoint.',
      },
      {
        id: 'tb-6', type: 'tf', diff: 2,
        statement: 'The two-pass diameter trick can start the first BFS from ANY node and still find a true diameter endpoint.',
        answer: true,
        explain: 'That’s the theorem that makes the trick work: the farthest node from an arbitrary start is always an endpoint of some longest path. Start anywhere, find an end, measure from the end.',
      },
      {
        id: 'tb-7', type: 'bank', diff: 2,
        prompt: 'Complete the one-DFS diameter (two largest child heights).',
        code: `int dfsH(int u, int p) {
    int h1 = 0, h2 = 0;
    for (int v : g[u]) {
        if (v == p) continue;
        int h = dfsH(v, u) + ___;
        if (h > h1) { h2 = ___; h1 = h; }
        else if (h > h2) h2 = h;
    }
    best = max(best, h1 + ___);
    return ___;
}`,
        answer: ['1', 'h1', 'h2', 'h1'],
        distractors: ['h2', '0'],
        explain: 'Child height + 1 edge; when a new max arrives, the OLD h1 demotes to h2; the path through u bends with the two best (h1 + h2); and you report your tallest branch (h1) upward.',
      },
      {
        id: 'tb-8', type: 'match', diff: 1,
        prompt: 'Match each tree quantity to how it’s computed.',
        pairs: [
          ['depth[v]', 'depth[u] + 1 at the child'],
          ['sz[u]', '1 + sum of children'],
          ['diameter', 'two BFS passes'],
          ['leaf', 'node with no children'],
        ],
        explain: 'Depth flows DOWN (pre-order), sizes flow UP (post-order), diameter = farthest-from-farthest, and a leaf (in a rooted tree) has no children — degree 1 in the unrooted view.',
      },
      {
        id: 'tb-9', type: 'mcq', diff: 2,
        prompt: 'This tree input loop reads n−1 edges but BFS from node 1 only reaches half the nodes. The bug?',
        code: `for (int i = 0; i < n - 1; i++) {
    int a, b;
    cin >> a >> b;
    g[a].push_back(b);     // ...and that's it
}`,
        options: [
          'Edges are stored one-directional — tree edges must be added both ways',
          'The loop should run n times',
          'Nodes must be 0-indexed',
          'BFS cannot run on trees',
        ],
        answer: 0,
        explain: 'A tree is an undirected graph: `g[b].push_back(a)` is missing, so you can only travel "downward" in input order. Half-reachable graphs after reading edges = check your edge insertion first, always.',
      },
      {
        id: 'tb-10', type: 'fill', diff: 2,
        prompt: 'A tree has n nodes. How many edges does it have? (expression in n)',
        answer: ['n-1', 'n - 1'],
        explain: 'Always exactly n−1. Corollaries everywhere: sum of subtree sizes telescopes, any extra edge creates a cycle, and "n nodes, n edges, connected" means exactly one cycle (a "functional-graph" smell, not a tree).',
      },
      {
        id: 'tb-11', type: 'code', diff: 3,
        prompt: 'Read a tree (n, then n−1 edges). Print the number of **leaves** — nodes with exactly one edge (degree 1). For n = 1, print 1.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    // your code

    return 0;
}`,
        tests: [
          { input: '5\n1 2\n1 3\n2 4\n2 5', expected: '3' },
          { input: '2\n1 2', expected: '2' },
          { input: '1', expected: '1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> deg(n + 1, 0);
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        deg[a]++; deg[b]++;
    }
    if (n == 1) { cout << 1 << "\\n"; return 0; }
    int leaves = 0;
    for (int v = 1; v <= n; v++)
        if (deg[v] == 1) leaves++;
    cout << leaves << "\\n";
    return 0;
}`,
        explain: 'Degrees suffice — no traversal needed. The n=1 edge case (a lone node is its own leaf, degree 0) is exactly the kind of corner that eats a wrong-answer; test 3 checks it.',
        hint: 'You don’t need DFS. What does counting degrees tell you? And what about n = 1?',
      },
      {
        id: 'tb-12', type: 'order', diff: 2,
        prompt: 'Order the steps of the two-pass diameter algorithm.',
        items: [
          'BFS from an arbitrary node',
          'Take the farthest node found — call it a',
          'BFS again, starting from a',
          'The maximum distance in the second BFS is the diameter',
        ],
        explain: 'Arbitrary start → farthest = an endpoint → farthest from the endpoint = the other endpoint. Two linear passes, total O(n).',
      },
    ],
    problems: [
      { name: 'Subordinates', platform: 'CSES', id: '1674', url: 'https://cses.fi/problemset/task/1674', difficulty: 'easy', why: 'Subtree sizes, verbatim — the post-order pattern in the wild.' },
      { name: 'Tree Diameter', platform: 'CSES', id: '1131', url: 'https://cses.fi/problemset/task/1131', difficulty: 'easy', why: 'Two BFS passes or the height DP — implement both, compare.' },
      { name: 'Tree Distances I', platform: 'CSES', id: '1132', url: 'https://cses.fi/problemset/task/1132', difficulty: 'med', why: 'Max distance from EVERY node. Hint: both endpoints of the diameter.' },
    ],
  },

  // ==========================================================================
  'tree-dp': {
    id: 'tree-dp',
    objectives: [
      'Compute DP values over children in post-order',
      'Design two-state DPs on trees (take/skip a node)',
      'Apply the rerooting technique: answers for all roots in O(n)',
    ],
    theory: [
      {
        h: 'Tree DP = DP where the subproblems are subtrees',
        md: 'On arrays, DP states are prefixes. On trees, they’re **subtrees**: `dp[u]` = answer for the subtree rooted at u, combined from children in post-order. Subtree sizes were your first tree DP. The recipe is identical to flat DP: state meaning → transition over children → base case at leaves.',
        code: `// dp[u] = number of nodes in u's subtree (you've met this one)
void dfs(int u, int p) {
    dp[u] = 1;                          // base: the node itself
    for (int v : g[u]) {
        if (v == p) continue;
        dfs(v, u);
        dp[u] += dp[v];                 // combine children
    }
}`,
      },
      {
        h: 'Two-state tree DP: take or skip the node',
        md: 'Many problems need TWO values per node, capturing a constraint. Classic: **maximum matching / independent set** flavors. For tree matching (pair nodes with edges, each node in ≤1 pair):\n\n`dp[u][0]` = best in u’s subtree if u is **unmatched** · `dp[u][1]` = best if u is **matched to a child**.',
        code: `// dp[u][0] = max edges, u not matched; dp[u][1] = u matched with a child
void dfs(int u, int p) {
    dp[u][0] = 0; dp[u][1] = 0;
    int sum = 0;                         // sum of best(child) either way
    for (int v : g[u]) {
        if (v == p) continue;
        dfs(v, u);
        sum += max(dp[v][0], dp[v][1]);
    }
    dp[u][0] = sum;
    for (int v : g[u]) {                 // try matching u with child v
        if (v == p) continue;
        dp[u][1] = max(dp[u][1],
                       sum - max(dp[v][0], dp[v][1]) + dp[v][0] + 1);
    }
}`,
        note: 'The “swap one child’s contribution” trick — subtract the child’s best, add the constrained version — appears constantly in two-state tree DPs.',
      },
      {
        h: 'Rerooting, part 1: the problem',
        md: '“Compute X for every node as root” (e.g., sum of distances to all others — Tree Distances II). Naive: run a DFS from each root → O(n²), dead at n = 2·10⁵. Rerooting answers all n roots in **O(n)** with two passes:\n\nPass 1 (post-order): `down[u]` = answer *within* u’s subtree. Pass 2 (pre-order): combine the parent’s “rest of the tree” into each child.',
      },
      {
        h: 'Rerooting, part 2: the shift formula',
        md: 'For sum-of-distances: when the root moves from u to its child v, every node inside v’s subtree gets **one step closer** (−sz[v]) and every node outside gets **one step farther** (+(n − sz[v])):\n\n`ans[v] = ans[u] − sz[v] + (n − sz[v])`\n\nCompute ans[root] once with DFS #1, then push answers down with DFS #2. Each rerooting problem has its own shift formula — deriving it *is* the problem.',
        code: `void dfs2(int u, int p) {              // pre-order: parent done first
    for (int v : g[u]) {
        if (v == p) continue;
        ans[v] = ans[u] - sz[v] + (n - sz[v]);
        dfs2(v, u);
    }
}`,
      },
      {
        h: 'Recognizing tree DP',
        md: 'Cues: *"maximum/minimum/count … in a tree"* with a per-node choice (color it, match it, keep it), or *"for every node, compute …"* (→ rerooting). Constraints n ≤ 2·10⁵ with a tree ⇒ the intended solution is almost always one or two DFS passes — O(n) or O(n log n).',
      },
    ],
    exercises: [
      {
        id: 'tdp-1', type: 'mcq', diff: 1,
        prompt: 'In tree DP, why must children be processed before their parent?',
        options: [
          'The parent’s value is combined FROM completed child values (post-order dependency)',
          'Recursion always visits children first by definition',
          'It avoids stack overflow',
          'Parents have larger indices',
        ],
        answer: 0,
        explain: 'Same reason flat DP iterates in dependency order: dp[u] consumes dp[child], so children must be final first. Post-order traversal IS the evaluation order of tree DP.',
      },
      {
        id: 'tdp-2', type: 'fill', diff: 1,
        prompt: 'Star tree: center 1 connected to 2, 3, 4 (edges 1-2, 1-3, 1-4). What is the maximum matching size (max edges, no shared nodes)?',
        answer: '1',
        explain: 'Every edge touches the center — pick any one and the center is used up. Max matching = 1. Stars are the standard sanity test for matching logic.',
      },
      {
        id: 'tdp-3', type: 'fill', diff: 2,
        prompt: 'Path of 4 nodes: 1-2, 2-3, 3-4. Maximum matching size?',
        answer: ['2'],
        explain: 'Pair (1,2) and (3,4) — two disjoint edges. Greedy leaf-pairing achieves it: match each leaf with its parent, remove both, repeat. (The DP computes the same thing.)',
      },
      {
        id: 'tdp-4', type: 'mcq', diff: 2,
        prompt: 'For "maximum independent set on a tree" (pick nodes, no two adjacent), what is the right state design?',
        options: [
          'dp[u][0/1] = best in u’s subtree when u is excluded/included',
          'dp[u] = best in u’s subtree (one value suffices)',
          'dp[u][k] = best using exactly k nodes',
          'dp[mask] over all subsets of children',
        ],
        answer: 0,
        explain: 'The adjacency constraint couples u with its children: if u is taken, children can’t be. One value can’t express that choice — two states can: include u (children must be dp[v][0]) or exclude u (children free: max of both).',
        hint: 'What about node u does the parent need to know to make its own choice?',
      },
      {
        id: 'tdp-5', type: 'bank', diff: 2,
        prompt: 'Complete the independent-set transitions.',
        code: `// dp[u][1] = u included, dp[u][0] = u excluded
for (int v : children(u)) {
    dp[u][1] += dp[v][___];
    dp[u][0] += max(dp[v][0], dp[v][___]);
}
dp[u][1] += ___;   // count u itself`,
        answer: ['0', '1', '1'],
        distractors: ['2'],
        explain: 'Including u forbids children (must take dp[v][0]); excluding u leaves children free (max of both states); and the included state counts u itself (+1).',
      },
      {
        id: 'tdp-6', type: 'fill', diff: 2,
        prompt: 'Rerooting shift: n = 6, root answer ans[1] = 8 (sum of distances from node 1), child v has sz[v] = 2. What is ans[v]?',
        answer: '10',
        explain: 'ans[v] = ans[u] − sz[v] + (n − sz[v]) = 8 − 2 + 4 = 10. Two nodes got closer, four got farther. Plug-and-check with tiny numbers before trusting any shift formula.',
        hint: 'ans[v] = ans[u] − sz[v] + (n − sz[v]).',
      },
      {
        id: 'tdp-7', type: 'tf', diff: 2,
        statement: 'Rerooting computes the answer for all n roots in O(n) total, not O(n) per root.',
        answer: true,
        explain: 'That’s its whole reason to exist: one post-order pass for subtree answers + one pre-order pass shifting across each edge once. O(n) total versus O(n²) for n separate traversals.',
      },
      {
        id: 'tdp-8', type: 'parsons', diff: 2,
        prompt: 'Assemble the rerooting pass (pre-order push-down of answers).',
        lines: [
          'void dfs2(int u, int p) {',
          '    for (int v : g[u]) {',
          '        if (v == p) continue;',
          '        ans[v] = ans[u] - sz[v] + (n - sz[v]);',
          '        dfs2(v, u);',
          '    }',
          '}',
        ],
        distractors: [
          '        ans[v] = ans[u] + sz[v] - (n - sz[v]);',
        ],
        explain: 'The child’s subtree (sz[v] nodes) gets CLOSER (subtract), everyone else (n − sz[v]) gets FARTHER (add). The distractor flips the signs — the classic rerooting slip.',
      },
      {
        id: 'tdp-9', type: 'mcq', diff: 3,
        prompt: 'This "max path sum from u downward" DP returns wrong (too large) answers. The bug?',
        code: `int dfs(int u, int p) {           // values can be negative
    int best = 0;
    for (int v : g[u])
        if (v != p) best = max(best, dfs(v, u));
    return val[u] + best;
}`,
        options: [
          'Nothing forces taking a child: best=0 is correct… unless val are all negative and the problem demands a non-empty path — spec-dependent edge case',
          'best should start at -INF in all cases',
          'It recomputes children exponentially',
          'val[u] should be added only for leaves',
        ],
        answer: 0,
        explain: 'Subtle and real: `best = 0` means "stop here if children don’t help" — right when paths may end anywhere, wrong if the problem forces extending or all-negative values must still pick something. Tree DP base cases follow the problem statement, not habit. Read twice.',
        hint: 'When every val is negative, what does this return for a leaf’s parent — and is that a valid path sum?',
      },
      {
        id: 'tdp-10', type: 'match', diff: 2,
        prompt: 'Match the problem to its tree-DP shape.',
        pairs: [
          ['subtree sizes', 'one state, post-order sum'],
          ['max matching', 'two states: matched / not'],
          ['answer for every root', 'rerooting, two passes'],
          ['count nodes at distance k', 'merge child depth counts'],
        ],
        explain: 'Four canonical shapes cover most tree problems at this level. Recognizing WHICH shape applies is most of the solve.',
      },
      {
        id: 'tdp-11', type: 'code', diff: 3,
        prompt: 'Read a tree (n, then n−1 edges `a b`). Print the **maximum independent set size** (most nodes, no two adjacent).',
        starter: `#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<int>> g;
// dp[u][0] = u excluded, dp[u][1] = u included

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    g.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    // your dfs + answer

    return 0;
}`,
        tests: [
          { input: '5\n1 2\n1 3\n2 4\n2 5', expected: '3' },
          { input: '2\n1 2', expected: '1' },
          { input: '4\n1 2\n2 3\n3 4', expected: '2' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<int>> g;
vector<array<int, 2>> dp;

void dfs(int u, int p) {
    dp[u][0] = 0;
    dp[u][1] = 1;                       // include u itself
    for (int v : g[u]) {
        if (v == p) continue;
        dfs(v, u);
        dp[u][0] += max(dp[v][0], dp[v][1]);  // u out: children free
        dp[u][1] += dp[v][0];                 // u in: children out
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    g.assign(n + 1, {});
    dp.assign(n + 1, {0, 0});
    for (int i = 0; i < n - 1; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    dfs(1, 0);
    cout << max(dp[1][0], dp[1][1]) << "\\n";
    return 0;
}`,
        explain: 'Test 1: take leaves {3,4,5} = 3. Test 3 (path of 4): {1,3} or {2,4} = 2. The two-state pattern: include u → children excluded; exclude u → children pick their max. Answer = max of both at the root.',
        hint: 'Two states per node. If u is in the set, what are its children allowed to be?',
      },
    ],
    problems: [
      { name: 'Tree Matching', platform: 'CSES', id: '1130', url: 'https://cses.fi/problemset/task/1130', difficulty: 'med', why: 'The two-state DP from this lesson (or prove the greedy leaf-pairing).' },
      { name: 'Tree Distances II', platform: 'CSES', id: '1133', url: 'https://cses.fi/problemset/task/1133', difficulty: 'hard', why: 'THE rerooting problem — sum of distances for every node.' },
      { name: 'Distance in Tree', platform: 'Codeforces', id: '161D', rating: 1800, url: 'https://codeforces.com/problemset/problem/161/D', difficulty: 'hard', why: 'Count pairs at distance exactly k — merge child depth-counts.' },
      { name: 'Tree with Maximum Cost', platform: 'Codeforces', id: '1092F', rating: 1900, url: 'https://codeforces.com/problemset/problem/1092/F', difficulty: 'hard', why: 'Weighted rerooting: derive the shift formula yourself.' },
    ],
  },

  // ==========================================================================
  'lca': {
    id: 'lca',
    objectives: [
      'Build the binary lifting table up[v][k] and use it for k-th ancestor',
      'Answer LCA queries in O(log n)',
      'Compute tree distances via depth and LCA',
    ],
    theory: [
      {
        h: 'The problem: many ancestor/distance queries',
        md: 'Given a rooted tree and **q ≈ 2·10⁵ queries** like “who is the k-th ancestor of v?” or “what’s the distance between u and v?” — walking up one step at a time is O(n) per query → O(nq) → dead. Binary lifting preprocesses jump tables so every query is O(log n).',
      },
      {
        h: 'Binary lifting: jump in powers of two',
        md: '`up[v][k]` = the 2ᵏ-th ancestor of v. The table builds on itself: *jumping 2ᵏ = jumping 2ᵏ⁻¹ twice*:\n\n`up[v][k] = up[ up[v][k-1] ][k-1]`\n\nWith LOG ≈ 20 levels you cover any jump up to 10⁶. Build: O(n log n) memory and time.',
        code: `const int LOG = 20;
int up[200005][LOG], depth_[200005];

void dfs(int v, int p) {
    up[v][0] = p;                              // 2^0 = direct parent
    for (int k = 1; k < LOG; k++)
        up[v][k] = up[v][k-1] < 0 ? -1
                 : up[ up[v][k-1] ][k-1];      // half-jump twice
    for (int to : g[v])
        if (to != p) {
            depth_[to] = depth_[v] + 1;
            dfs(to, v);
        }
}`,
      },
      {
        h: 'k-th ancestor: binary decomposition',
        md: 'To jump k steps, write k in binary and take the corresponding power-of-two jumps. k = 13 = 1101₂ → jump 8, then 4, then 1. Order doesn’t matter; each set bit is one table lookup.',
        code: `int lift(int v, int k) {
    for (int i = 0; i < LOG && v >= 0; i++)
        if (k & (1 << i))                // bit i set → jump 2^i
            v = up[v][i];
    return v;                            // -1 if we fell off the root
}`,
      },
      {
        h: 'LCA: equalize depths, then jump together',
        md: 'Lowest common ancestor of u and v:\n\n1. Lift the deeper node up so depths match. If they meet — done.\n2. From the **highest** bit down: if `up[u][i] != up[v][i]`, jump BOTH (they’re still below the LCA). When the loop ends, both sit **one step below** the LCA.\n\nWhy high-to-low: greedy from the top never overshoots — equal ancestors might be above the LCA, unequal ones are definitely below it.',
        code: `int lca(int u, int v) {
    if (depth_[u] < depth_[v]) swap(u, v);
    u = lift(u, depth_[u] - depth_[v]);   // step 1: same depth
    if (u == v) return u;
    for (int i = LOG - 1; i >= 0; i--)    // step 2: biggest jumps first
        if (up[u][i] != up[v][i]) {
            u = up[u][i];
            v = up[v][i];
        }
    return up[u][0];                      // one step below → parent is LCA
}`,
      },
      {
        h: 'The payoff: distances (and more)',
        md: 'Once LCA is O(log n), tree distance is free:\n\n`dist(u, v) = depth[u] + depth[v] − 2·depth[lca(u, v)]`\n\nAlso unlocked: "is a an ancestor of b", "the node k steps along the path u→v", path min/max with the same table structure. One preprocessing, a whole query family.',
        note: 'Alternative LCA: Euler tour + sparse-table RMQ gives O(1) queries — more code, same contest mileage. Lifting is the default.',
      },
    ],
    exercises: [
      {
        id: 'lca-1', type: 'fill', diff: 1,
        prompt: 'Complete the table recurrence: `up[v][k] = ___` (in terms of up with k−1).',
        answer: ['up[up[v][k-1]][k-1]', 'up[ up[v][k-1] ][k-1]'],
        placeholder: 'up[…][…]',
        explain: 'A 2ᵏ jump is two 2ᵏ⁻¹ jumps: first hop to the 2ᵏ⁻¹-th ancestor, then hop 2ᵏ⁻¹ again from there. The whole technique is this one line.',
      },
      {
        id: 'lca-2', type: 'fill', diff: 1,
        prompt: 'Node v is at depth 13. You call `lift(v, 5)`. Which powers of two does it jump, and what is the resulting depth? Answer as `jumps depth` e.g. `8+2 3`.',
        answer: ['4+1 8', '1+4 8'],
        explain: '5 = 101₂ = 4 + 1: one jump of 4 and one of 1 (order irrelevant). Depth 13 − 5 = 8. Binary decomposition turns any k into ≤ log k table hits.',
      },
      {
        id: 'lca-3', type: 'mcq', diff: 2,
        prompt: 'Why does the LCA jump loop go from the HIGHEST bit down, not lowest up?',
        options: [
          'Greedy from the top: take a jump only when it provably stays below the LCA; low-to-high can’t know when to stop',
          'It is faster by a constant factor',
          'High bits are more likely to differ',
          'Either direction works identically',
        ],
        answer: 0,
        explain: 'The invariant is "u and v stay strictly below the LCA". A big jump is taken only if the ancestors differ (still below LCA). Trying small jumps first loses track of how much you may still jump. High-to-low greedy = binary search on the jump distance.',
        hint: 'What invariant does `up[u][i] != up[v][i]` preserve?',
      },
      {
        id: 'lca-4', type: 'fill', diff: 2,
        prompt: 'Tree: 1 is root; edges 1-2, 1-3, 2-4, 2-5, 4-6. What is LCA(6, 5)?',
        answer: '2',
        explain: 'Path up from 6: 6→4→2→1; from 5: 5→2→1. Deepest shared ancestor: 2. Always draw five-node trees; your hand is faster than your doubt.',
      },
      {
        id: 'lca-5', type: 'fill', diff: 2,
        prompt: 'Same tree (1-2, 1-3, 2-4, 2-5, 4-6), root 1. Compute dist(6, 3) via the formula depth[u]+depth[v]−2·depth[lca].',
        answer: '4',
        explain: 'depth[6]=3, depth[3]=1, lca(6,3)=1 at depth 0 → 3+1−0 = 4. The path 6-4-2-1-3 indeed has 4 edges. The formula is just "up to the meeting point, then down".',
        hint: 'depth[6]? depth[3]? Where do their root-paths meet?',
      },
      {
        id: 'lca-6', type: 'mcq', diff: 2,
        prompt: 'After the high-to-low jump loop finishes (u and v still differ), what does the function return — and why?',
        code: `for (int i = LOG - 1; i >= 0; i--)
    if (up[u][i] != up[v][i]) { u = up[u][i]; v = up[v][i]; }
return /* ??? */;`,
        options: [
          'up[u][0] — the loop leaves both nodes exactly one edge below the LCA',
          'u — the loop ends on the LCA itself',
          'up[u][LOG-1] — the topmost ancestor',
          'depth_[u] — the LCA’s depth',
        ],
        answer: 0,
        explain: 'The loop takes every jump that keeps them below the LCA — including jumps of size 1. When no jump is takeable, the next step up IS the LCA: `up[u][0]`. Returning `u` here is the classic off-by-one.',
      },
      {
        id: 'lca-7', type: 'parsons', diff: 2,
        prompt: 'Assemble the LCA query (assume lift() and depth_ ready).',
        lines: [
          'int lca(int u, int v) {',
          '    if (depth_[u] < depth_[v]) swap(u, v);',
          '    u = lift(u, depth_[u] - depth_[v]);',
          '    if (u == v) return u;',
          '    for (int i = LOG - 1; i >= 0; i--)',
          '        if (up[u][i] != up[v][i]) { u = up[u][i]; v = up[v][i]; }',
          '    return up[u][0];',
          '}',
        ],
        distractors: [
          '    for (int i = 0; i < LOG; i++)',
        ],
        explain: 'Equalize depths → early exit if already met → descend the bits from the top → parent of where you stopped. The distractor loops low-to-high, which breaks the greedy invariant.',
      },
      {
        id: 'lca-8', type: 'tf', diff: 1,
        statement: 'Binary lifting needs O(n log n) preprocessing and answers each LCA query in O(log n).',
        answer: true,
        explain: 'Table: n nodes × LOG levels. Query: ≤ LOG lifts + ≤ LOG joint jumps. For n, q ≤ 2·10⁵ that’s ~4·10⁶ table cells and ~20 steps per query — comfortable.',
      },
      {
        id: 'lca-9', type: 'match', diff: 2,
        prompt: 'Match the query to its O(log n) recipe.',
        pairs: [
          ['k-th ancestor of v', 'lift(v, k)'],
          ['LCA(u, v)', 'equalize + joint jumps'],
          ['dist(u, v)', 'depths minus 2·depth(lca)'],
          ['is a ancestor of b?', 'lift(b, depth diff) == a'],
        ],
        explain: 'One table, four query types. The ancestor check lifts b to a’s depth and compares — or use Euler-tour intervals (tin/tout) for O(1).',
      },
      {
        id: 'lca-10', type: 'mcq', diff: 3,
        prompt: 'For n = 2·10⁵ nodes, a teammate declares `int up[200005][LOG]` with LOG = 5. Queries randomly return wrong ancestors. Why?',
        options: [
          '2⁵ = 32 max jump: lift() silently fails for k > 31 and deep LCA queries — LOG must satisfy 2^LOG ≥ n (use ~18-20)',
          'The array is too large for the memory limit',
          'LOG must be even',
          'int is the wrong type for node indices',
        ],
        answer: 0,
        explain: 'With LOG=5 you can only express jumps < 32, but chains can be 2·10⁵ long. Bits above the table are silently dropped → wrong node, no crash. Size LOG so 2^LOG exceeds max depth: ⌈log₂(2·10⁵)⌉ = 18; 20 is the round habit.',
        hint: 'What’s the longest possible jump in a 2·10⁵-node path tree, and can 5 bits express it?',
      },
      {
        id: 'lca-11', type: 'bank', diff: 2,
        prompt: 'Complete the distance formula and the ancestor check.',
        code: `int dist(int u, int v) {
    return depth_[u] + depth_[v] - 2 * depth_[___];
}
bool isAncestor(int a, int b) {       // is a an ancestor of b?
    if (depth_[a] > depth_[b]) return false;
    return lift(b, depth_[b] - depth_[___]) == ___;
}`,
        answer: ['lca(u, v)', 'a', 'a'],
        distractors: ['b', 'lca(a, b)'],
        explain: 'Distance counts both root-paths and removes the shared part twice. Ancestor check: lift b up to a’s depth — if you land ON a, a is an ancestor.',
      },
    ],
    problems: [
      { name: 'Company Queries I', platform: 'CSES', id: '1687', url: 'https://cses.fi/problemset/task/1687', difficulty: 'med', why: 'Pure k-th ancestor — the lifting table with nothing else.' },
      { name: 'Company Queries II', platform: 'CSES', id: '1688', url: 'https://cses.fi/problemset/task/1688', difficulty: 'med', why: 'Pure LCA. Build it once, keep it in your notebook.' },
      { name: 'Distance Queries', platform: 'CSES', id: '1135', url: 'https://cses.fi/problemset/task/1135', difficulty: 'med', why: 'The depth + LCA distance formula, q times.' },
      { name: 'A and B and Lecture Rooms', platform: 'Codeforces', id: '519E', rating: 2100, url: 'https://codeforces.com/problemset/problem/519/E', difficulty: 'hard', why: 'Capstone: midpoints of paths + subtree size counting. Everything in this unit at once.' },
    ],
  },
};

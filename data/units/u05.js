// ============================================================================
// data/units/u05.js — Unit 5: Graphs I
// Modeling, BFS, DFS & components, Dijkstra & 0-1 BFS, toposort, DSU & MST.
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'graph-bfs': {
    id: 'graph-bfs',
    objectives: [
      'Model "minimum moves" problems as graphs: nodes are states, edges are single moves',
      'Build adjacency lists — and never forget the reverse edge of an undirected graph',
      'Write BFS with a queue and a dist array, and trust its distance order at O(V+E)',
      'Run BFS on grids with dx/dy arrays and rebuild paths with parent[]',
    ],
    theory: [
      {
        h: 'Nodes are states, edges are moves',
        md: 'A graph is just **things + connections**: cities and roads, grid cells and steps, or sneakier — *numbers* and *button presses*. In CF "Two Buttons" a device shows x; one button doubles it, the other subtracts 1. Every number is a node, every press is an edge, and "minimum presses to reach y" is a shortest path.\n\nRecognition cue: **"minimum number of moves/steps/presses"** where every move costs the same → list the states, list the moves, BFS. You don’t need a picture of a network in the statement to be solving a graph problem.',
      },
      {
        h: 'Adjacency lists (and the reverse-edge ritual)',
        md: 'Store, for each node, a list of its neighbors. Memory O(n + m), iterating a node’s neighbors costs its degree — the only representation that survives n, m = 2·10⁵. Contest convention: nodes are **1-indexed**, so size everything n + 1 and let slot 0 rot.\n\nAn undirected edge is **two** directed edges. Forgetting `adj[b].push_back(a)` is graph bug №1: half the graph silently becomes one-way.',
        code: `int n, m;
cin >> n >> m;
vector<vector<int>> adj(n + 1);     // 1-indexed: waste slot 0, keep sanity
for (int i = 0; i < m; i++) {
    int a, b;
    cin >> a >> b;
    adj[a].push_back(b);
    adj[b].push_back(a);            // undirected: BOTH directions
}`,
        note: 'An adjacency matrix is n² cells — at n = 2·10⁵ that’s 4·10¹⁰ entries. Dead on arrival. Lists or nothing.',
        noteKind: 'warn',
      },
      {
        h: 'BFS: the distance machine',
        md: 'BFS explores in **rings**: the source (distance 0), then everything 1 edge away, then 2… The queue makes that happen — nodes enter in distance order, so the *first* time you touch a node you already have its shortest edge-count. One array does double duty: `dist[v] == -1` means unvisited; anything else is final.\n\nEvery node enters the queue once, every edge is looked at twice (once per endpoint): **O(n + m)**.',
        code: `vector<int> dist(n + 1, -1);    // -1 = not visited yet
queue<int> q;
dist[s] = 0;
q.push(s);                      // seed the frontier
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) {
        if (dist[v] == -1) {    // first touch = shortest
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
}`,
      },
      {
        h: 'Grid BFS: dx/dy and the three gates',
        md: 'A grid is a graph in disguise: cell = node, edges to the 4 side-neighbors. Nobody builds adjacency lists for grids — generate neighbors on the fly with direction arrays and run the exact same BFS with a queue of cells.\n\nEvery candidate neighbor passes three gates: **in bounds → not a wall → not visited**. Skip one and you get RE, wrong answers, or an infinite loop, in that order.',
        code: `int dx[] = {1, -1, 0, 0};
int dy[] = {0, 0, 1, -1};       // four directions, paired by index
// expanding cell (r, c):
for (int d = 0; d < 4; d++) {
    int nr = r + dx[d], nc = c + dy[d];
    if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;  // gate 1: bounds
    if (grid[nr][nc] == '#') continue;                     // gate 2: wall
    if (dist[nr][nc] != -1) continue;                      // gate 3: seen
    dist[nr][nc] = dist[r][c] + 1;
    q.push({nr, nc});
}`,
      },
      {
        h: 'parent[]: from distances to actual routes',
        md: '"Print the route" (Message Route, Labyrinth) needs more than dist. Record **who discovered whom**: when v is first reached from u, set `parent[v] = u`. Afterwards walk backwards from the target — t, parent[t], parent[parent[t]]… — until the source, then reverse.\n\nEach node is discovered exactly once, along some shortest route, so the walk-back IS a shortest path. Total cost: one extra array.',
        code: `vector<int> parent(n + 1, 0);
// inside BFS, when v is first discovered from u:
parent[v] = u;

// after BFS reaches t: walk back, then flip
vector<int> path;
for (int v = t; v != 0; v = parent[v])  // parent[s] stays 0 → loop stops
    path.push_back(v);
reverse(path.begin(), path.end());      // s ... t, in travel order`,
      },
      {
        h: 'Teaser: BFS from many sources at once',
        md: 'Need, for every cell, the distance to the **nearest** of several fires / hospitals / exits? Don’t run one BFS per source. Push *all* sources into the queue at distance 0 before the loop starts — the rings now expand from all of them simultaneously, and each cell is first reached by its closest source.\n\nSame code, same O(n + m), one run. Keep it in your pocket; "distance to nearest X" shows up constantly.',
        code: `for (int s : sources) {     // all fires start burning at once
    dist[s] = 0;
    q.push(s);
}
// ...then the ordinary BFS loop`,
      },
    ],
    exercises: [
      {
        id: 'bfs-1', type: 'mcq', diff: 1,
        prompt: 'A device shows the number x. One button doubles it, the other subtracts 1. You need the minimum presses to reach y (CF "Two Buttons"). What is this problem, really?',
        options: [
          'BFS on a graph where every number is a node and every press is an edge',
          'Greedy: double until you pass y, then subtract down',
          'DP over the digits of x',
          'Binary search on the number of presses',
        ],
        answer: 0,
        explain: 'Each press costs the same, so "minimum presses" = shortest path over number-states. Cap the states (going far above max(x, y) never helps), BFS from x, read dist[y]. The greedy fails: sometimes you must subtract FIRST and then double.',
      },
      {
        id: 'bfs-2', type: 'output', diff: 1,
        prompt: 'Undirected edges go into BOTH lists. What does this print?',
        code: `int main() {
    vector<vector<int>> adj(5);
    auto addEdge = [&](int a, int b) {
        adj[a].push_back(b);
        adj[b].push_back(a);       // undirected: both directions
    };
    addEdge(1, 2); addEdge(1, 3); addEdge(3, 4);
    cout << adj[1].size() << " " << adj[3].size() << " " << adj[4].size() << "\\n";
}`,
        answer: '2 2 1',
        explain: 'Each undirected edge lands in two lists: adj[1] = {2, 3}, adj[3] = {1, 4}, adj[4] = {3}. A node’s list size is its degree, and the lists hold 2m entries total — that’s why BFS scans each edge twice.',
      },
      {
        id: 'bfs-3', type: 'tf', diff: 1,
        statement: 'BFS pops nodes in non-decreasing distance from the source — so the first time a node is discovered, its shortest edge-distance is already known.',
        answer: true,
        explain: 'The queue holds all distance-d nodes before any distance-(d+1) node, so discovery order is distance order. This is exactly why one visit per node suffices — and exactly the guarantee that dies when edges get weights (next skill: Dijkstra).',
      },
      {
        id: 'bfs-4', type: 'output', diff: 2,
        prompt: 'Hand-run the BFS. What does this print?',
        code: `int main() {
    int n = 5;
    vector<vector<int>> adj(n + 1);
    int es[5][2] = {{1, 2}, {1, 3}, {2, 4}, {3, 4}, {4, 5}};
    for (auto& e : es) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    vector<int> dist(n + 1, -1);
    queue<int> q;
    dist[1] = 0;
    q.push(1);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u])
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
    }
    for (int v = 1; v <= n; v++) cout << dist[v] << " ";
}`,
        answer: '0 1 1 2 3',
        explain: 'Rings from node 1: {1} at 0, {2, 3} at 1, {4} at 2 (discovered via 2; the later 3—4 edge finds it already set), {5} at 3. Tracing dist arrays by hand is how you debug every BFS you will ever write.',
        hint: 'Process the queue in order: 1, then 2, 3, then…  Who discovers 4 first?',
      },
      {
        id: 'bfs-5', type: 'mcq', diff: 2,
        prompt: 'The roads are two-way, but this solution reports some reachable cities as unreachable. The bug?',
        code: `for (int i = 0; i < m; i++) {
    int a, b;
    cin >> a >> b;
    adj[a].push_back(b);     // roads are bidirectional...
}`,
        options: [
          'Only a → b is stored — BFS sees a directed graph, and nodes reachable only "against the arrows" report dist −1',
          'push_back overflows after m edges',
          'BFS loops forever on one-way edges',
          'No bug: push_back(b) registers the edge for both endpoints',
        ],
        answer: 0,
        explain: 'Missing `adj[b].push_back(a)`. An adjacency list stores directed arcs; an undirected edge is two of them. The symptom — "WA, some nodes mysteriously unreachable" — should make you grep your edge-reading loop first.',
      },
      {
        id: 'bfs-6', type: 'parsons', diff: 2,
        prompt: 'Assemble the BFS core (dist is pre-filled with −1, s is the source).',
        lines: [
          'queue<int> q;',
          'dist[s] = 0; q.push(s);',
          'while (!q.empty()) {',
          '    int u = q.front(); q.pop();',
          '    for (int v : adj[u]) {',
          '        if (dist[v] == -1) {',
          '            dist[v] = dist[u] + 1; q.push(v);',
          '        }',
          '    }',
          '}',
        ],
        distractors: [
          '    int u = q.back(); q.pop();',
          '        if (dist[v] != -1) {',
        ],
        explain: 'Seed the source, then: pop from the FRONT (q.back() would make it a broken stack and wreck the distance order), and only enter nodes still at −1 — the inverted check would re-visit forever and skip new nodes.',
      },
      {
        id: 'bfs-7', type: 'bank', diff: 2,
        prompt: 'Complete the grid-BFS neighbor loop (n rows, m columns, walls are #).',
        code: `int dx[] = {1, -1, 0, 0};
int dy[] = {0, 0, ___, -1};
for (int d = 0; d < 4; d++) {
    int nr = r + dx[d], nc = c + ___[d];
    if (nr < 0 || nr >= n || nc < 0 || nc >= ___) continue;   // off the grid
    if (grid[nr][nc] == '#' || dist[nr][nc] != ___) continue; // wall or seen
    dist[nr][nc] = dist[r][c] + 1;
    q.push({nr, nc});
}`,
        answer: ['1', 'dy', 'm', '-1'],
        distractors: ['dx', 'n', '0'],
        explain: 'dx/dy must pair up into the four moves (down, up, right, left). Rows are checked against n, columns against m — mixing them passes square tests and explodes on rectangular ones. And unvisited means dist still −1.',
      },
      {
        id: 'bfs-8', type: 'fill', diff: 2,
        prompt: 'dist[] was initialized to −1. Fill the condition that lets BFS enter v exactly once:',
        code: `for (int v : adj[u]) {
    if (___) {
        dist[v] = dist[u] + 1;
        q.push(v);
    }
}`,
        answer: ['dist[v] == -1', 'dist[v]==-1', 'dist[v] < 0'],
        placeholder: 'dist[v] …',
        explain: '`dist[v] == -1` is both the visited check and the guarantee of correctness: the first discovery is the shortest one, so any later path to v deserves to be ignored.',
      },
      {
        id: 'bfs-9', type: 'match', diff: 1,
        prompt: 'Match each BFS ingredient to its job.',
        pairs: [
          ['queue<int>', 'FIFO frontier — keeps nodes in distance order'],
          ['dist[] filled with −1', 'visited marker and answer in one array'],
          ['parent[]', 'breadcrumbs to rebuild the actual path'],
          ['dx[] / dy[]', 'the four grid moves, generated on the fly'],
        ],
        explain: 'The whole BFS toolkit in four parts. Swap the queue for a stack and distances break; forget parent[] and you can say HOW FAR but not WHICH WAY.',
      },
      {
        id: 'bfs-10', type: 'mcq', diff: 2,
        prompt: 'Constraints: n, m ≤ 2·10⁵. Which graph storage survives both the memory and the time limit?',
        options: [
          '`vector<vector<int>> adj(n + 1)` — adjacency list, O(n + m) memory, O(degree) neighbor iteration',
          '`bool adj[200001][200001]` — adjacency matrix with O(1) edge lookup',
          'The raw edge list, scanning all m edges to find each node’s neighbors',
          'A `map<pair<int,int>, bool>` of edges, queried for all n possible neighbors per node',
        ],
        answer: 0,
        explain: 'The matrix is 4·10¹⁰ cells ≈ 40 GB — instant MLE. Edge-list scanning makes BFS O(n·m) = 4·10¹⁰ steps — TLE. The map version adds a log AND an O(n) scan per node. Adjacency lists are the only answer at this scale; read the constraints and they tell you.',
      },
      {
        id: 'bfs-11', type: 'mcq', diff: 2,
        prompt: 'BFS finished and filled parent[] (parent[v] = the node that discovered v). How do you print a shortest path from 1 to n?',
        options: [
          'Start at n, follow parent[] back until you reach 1, then reverse the collected list',
          'Start at 1 and follow parent[] forward until you reach n',
          'Sort all nodes by dist[] and print them in order',
          'Re-run BFS once for every node on the path',
        ],
        answer: 0,
        explain: 'parent[] points backward — toward the source — so the walk must start at the target. There is no "child" pointer to follow forward (a node can discover many children). Collect n, parent[n], … , 1, then reverse. Message Route in a nutshell.',
      },
      {
        id: 'bfs-12', type: 'mcq', diff: 3,
        prompt: 'A grid (n·m up to 10⁶) has k hospital cells. For EVERY free cell you need the distance to the nearest hospital. The intended approach?',
        options: [
          'One BFS that starts with all k hospitals in the queue at distance 0',
          'One BFS per hospital, taking the minimum over the k runs',
          'Dijkstra with a priority queue over all cells',
          'DFS from each free cell until it bumps into a hospital',
        ],
        answer: 0,
        explain: 'Multi-source BFS: seed every hospital at dist 0 and the expanding rings carry "distance to the nearest source" automatically — O(n·m) once. Per-hospital BFS is k times that (dead for large k); Dijkstra works but wastes a log factor on unit weights; DFS doesn’t do distances at all.',
        hint: 'Imagine a fake super-source wired to every hospital with a 0-cost edge. What does BFS from it compute?',
      },
      {
        id: 'bfs-13', type: 'code', diff: 3,
        prompt: 'Read n (nodes) and m (edges), then m undirected edges `a b`. Print the minimum number of edges on a path from node 1 to node n, or `-1` if n is unreachable.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);        // undirected
    }
    // BFS from node 1; print dist to node n, or -1

    return 0;
}`,
        tests: [
          { input: '5 5\n1 2\n1 3\n2 4\n3 4\n4 5', expected: '3' },
          { input: '4 2\n1 2\n3 4', expected: '-1' },
          { input: '2 1\n1 2', expected: '1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);        // undirected
    }
    vector<int> dist(n + 1, -1);    // -1 doubles as "unvisited"
    queue<int> q;
    dist[1] = 0;
    q.push(1);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {    // first touch = shortest
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    cout << dist[n] << "\\n";       // still -1 ⇔ unreachable
    return 0;
}`,
        explain: 'Textbook BFS: init dist to −1, seed the source, expand in rings. The −1 initialization quietly solves the "unreachable" case too — dist[n] is already the required output. Test 2 (disconnected graph) catches anyone who forgot it.',
        hint: 'dist[] doubles as the visited array. What does dist[n] hold if BFS never reaches n?',
      },
    ],
    problems: [
      { name: 'Message Route', platform: 'CSES', id: '1667', url: 'https://cses.fi/problemset/task/1667', difficulty: 'easy', why: 'Plain BFS plus parent[] path printing — the full toolkit on one problem.' },
      { name: 'Counting Rooms', platform: 'CSES', id: '1192', url: 'https://cses.fi/problemset/task/1192', difficulty: 'easy', why: 'Your first grid traversal: dx/dy, the three gates, flood fill.' },
      { name: 'Labyrinth', platform: 'CSES', id: '1193', url: 'https://cses.fi/problemset/task/1193', difficulty: 'med', why: 'Grid BFS + parent[] reconstruction — output the actual move string.' },
      { name: 'Two Buttons', platform: 'Codeforces', id: '520B', rating: 1400, url: 'https://codeforces.com/problemset/problem/520/B', difficulty: 'med', why: 'No map in sight: nodes are numbers, edges are button presses. BFS over states.' },
    ],
  },

  // ==========================================================================
  'dfs-components': {
    id: 'dfs-components',
    objectives: [
      'Write recursive DFS with a visited array — and know when the recursion depth bites',
      'Count connected components in graphs and grids (flood fill)',
      'Detect cycles in undirected graphs with the parent check',
      'Test bipartiteness by 2-coloring',
    ],
    theory: [
      {
        h: 'DFS: dive deep, backtrack, repeat',
        md: 'DFS walks as far as it can, then unwinds — five lines of recursion plus a visited array. Started at v, it reaches **exactly v’s connected component**: the same set of nodes BFS would, in a different order.\n\nDivision of labor: BFS when you need *distances*; DFS when you need *structure* — components, cycles, colorings — because the recursion carries context (where you came from) for free.',
        code: `vector<vector<int>> adj;        // global: the recursion needs them
vector<bool> vis;

void dfs(int u) {
    vis[u] = true;              // u belongs to the current piece
    for (int v : adj[u])
        if (!vis[v]) dfs(v);    // dive into anything new
}`,
      },
      {
        h: 'Counting components',
        md: 'A graph isn’t always one piece. The pattern: loop over **all** nodes; every node that is still unvisited starts a brand-new component — count it, then let dfs swallow the whole piece so none of it is counted again. Still O(n + m) total: each node is visited once, ever.\n\nBuilding Roads (CSES): k components need exactly **k − 1** new edges — pick one representative node per component and chain them.',
        code: `int comps = 0;
for (int v = 1; v <= n; v++) {
    if (!vis[v]) {
        comps++;                // v starts a brand-new component
        dfs(v);                 // swallow all of it
    }
}
// Building Roads: print comps - 1 connecting edges`,
      },
      {
        h: 'Flood fill: components on a grid',
        md: 'Counting Rooms: how many connected regions of floor cells? Same skill, grid edition — **flood fill**. Scan every cell; each unvisited floor cell starts a new room; fill outward (DFS or BFS, both fine) marking the room’s every cell as you go.\n\nCaution: a 1000×1000 open grid can drive grid-DFS recursion ~10⁶ calls deep — when the grid is huge, the BFS version with an explicit queue is the safe twin.',
        code: `void fill(int r, int c) {
    if (r < 0 || r >= n || c < 0 || c >= m) return;   // off the grid
    if (grid[r][c] == '#' || vis[r][c]) return;       // wall or seen
    vis[r][c] = true;
    fill(r + 1, c); fill(r - 1, c);                   // four directions
    fill(r, c + 1); fill(r, c - 1);
}
// rooms = how many times main() calls fill() on an unseen floor cell`,
      },
      {
        h: 'Cycle detection: the parent check',
        md: 'In an undirected graph, DFS reaching an **already-visited neighbor** means a cycle… with one exception: that neighbor might simply be the node you came from — the edge u—par sits in both adjacency lists! Pass the parent down and ignore that one edge. Visited neighbor that is *not* the parent ⇒ genuine cycle.\n\nRound Trip (CSES) is exactly this, plus walking parent[] to print the loop you found.',
        code: `bool hasCycle(int u, int par) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (v == par) continue;        // the edge we arrived on — not a cycle
        if (vis[v]) return true;       // visited and NOT parent → cycle
        if (hasCycle(v, u)) return true;
    }
    return false;
}`,
      },
      {
        h: 'Bipartite check = 2-coloring',
        md: 'Building Teams: split people into two groups so no friendship stays inside a group. Greedy coloring works: paint the start node team 1, all its neighbors team 2, *their* neighbors team 1… If an edge ever connects two same-colored nodes — impossible.\n\nThe deeper truth: a graph is bipartite **iff it has no odd cycle**. Even cycles alternate cleanly around; an odd cycle comes back and contradicts its own first color. (Run the coloring per component — the graph may be in pieces.)',
        code: `// color[]: 0 = unpainted, 1 / 2 = the two teams
bool ok = true;
void paint(int u) {
    for (int v : adj[u]) {
        if (color[v] == 0) {
            color[v] = 3 - color[u];   // 1 ↔ 2: the other team
            paint(v);
        } else if (color[v] == color[u]) {
            ok = false;                // same-team friendship → impossible
        }
    }
}`,
      },
      {
        h: 'The recursion-depth landmine',
        md: 'DFS depth equals the longest chain it follows before backtracking — and test setters know it. A **path graph** of 2·10⁵ nodes drives the recursion 2·10⁵ frames deep; depending on judge and stack size that can overflow → RE on exactly one test while every other test passes.\n\nDefenses: use BFS when either traversal works, or convert the DFS to an explicit `stack<int>`. Grids and 10⁶-node graphs deserve extra suspicion.',
        note: 'RE only on the long-chain / "line" test = stack overflow until proven otherwise.',
        noteKind: 'danger',
      },
    ],
    exercises: [
      {
        id: 'dfs-1', type: 'output', diff: 1,
        prompt: 'Trace the dives and the backtracks. What does this print?',
        code: `vector<vector<int>> adj(6);
vector<bool> vis(6, false);

void dfs(int u) {
    vis[u] = true;
    cout << u << " ";
    for (int v : adj[u])
        if (!vis[v]) dfs(v);
}

int main() {
    adj[1] = {4, 2};
    adj[2] = {1, 3};
    adj[3] = {2};
    adj[4] = {1, 5};
    adj[5] = {4};
    dfs(1);
}`,
        answer: '1 4 5 2 3',
        explain: 'DFS follows list order: from 1 it dives to 4 (first in adj[1]), then deeper to 5, dead-ends, unwinds all the way back to 1, and only then tries 2 → 3. Depth-first means "finish the whole branch before the next sibling".',
        hint: 'adj[1] lists 4 before 2 — and DFS will not return to 1 until 4’s entire branch is exhausted.',
      },
      {
        id: 'dfs-2', type: 'mcq', diff: 1,
        prompt: 'n = 8 nodes, undirected edges: `1-2, 2-3, 4-5, 6-7`. How many connected components?',
        options: ['4', '3', '5', '2'],
        answer: 0,
        explain: '{1,2,3}, {4,5}, {6,7} — and the easy one to forget: node 8, all alone, is a component too. Isolated nodes are the classic off-by-one in component counting; the loop over ALL nodes catches them automatically.',
      },
      {
        id: 'dfs-3', type: 'mcq', diff: 2,
        prompt: 'This undirected cycle detector says EVERY graph with at least one edge has a cycle. Why?',
        code: `bool hasCycle(int u, int par) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (vis[v]) return true;       // ← reports a cycle
        if (hasCycle(v, u)) return true;
    }
    return false;
}`,
        options: [
          'It never skips the parent — the edge you arrived on makes par look like a "visited neighbor", so a single edge already counts as a cycle',
          'vis[u] should be set after the loop, not before',
          'It should return false when vis[v] is true',
          'par is never used, but that’s only a style issue',
        ],
        answer: 0,
        explain: 'Undirected edge u—par lives in BOTH lists, so from u you immediately see vis[par] == true. Add `if (v == par) continue;` before the visited check. Option 4 is the trap: par being unused IS the bug, not a style choice.',
        hint: 'Run it on the two-node graph 1—2. What happens inside dfs(2, 1)?',
      },
      {
        id: 'dfs-4', type: 'parsons', diff: 2,
        prompt: 'Assemble the component counter (dfs marks everything reachable; nodes are 1..n).',
        lines: [
          'int comps = 0;',
          'for (int v = 1; v <= n; v++) {',
          '    if (!vis[v]) {',
          '        comps++; dfs(v);',
          '    }',
          '}',
          'cout << comps << "\\n";',
        ],
        distractors: [
          '    if (vis[v]) {',
          'for (int v = 0; v < n; v++) {',
        ],
        explain: 'Every still-unvisited node is the first sighting of a new component: count it, then dfs paints the rest of that piece. The distractors are the two classic slips: inverting the check, and looping 0..n−1 over a 1-indexed graph (node n never gets counted).',
      },
      {
        id: 'dfs-5', type: 'fill', diff: 2,
        prompt: 'Your DFS counted k components in the road network. The minimum number of NEW roads that makes the country connected is ___.',
        answer: ['k-1', 'k - 1', 'k−1'],
        placeholder: 'k …',
        explain: 'Each new road can merge at most two components into one, so k pieces need k − 1 merges — and chaining one representative per component achieves it. This is Building Roads, and later it returns as "an MST has n − 1 edges".',
      },
      {
        id: 'dfs-6', type: 'output', diff: 2,
        prompt: 'Two-coloring a triangle. What does this print?',
        code: `int main() {
    int n = 3;
    vector<vector<int>> adj(n + 1);
    adj[1] = {2, 3};               // triangle: 1-2, 2-3, 1-3
    adj[2] = {1, 3};
    adj[3] = {1, 2};
    vector<int> color(n + 1, 0);   // 0 = unpainted
    queue<int> q;
    color[1] = 1;
    q.push(1);
    bool ok = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (color[v] == 0) {
                color[v] = 3 - color[u];     // the other team
                q.push(v);
            } else if (color[v] == color[u]) ok = false;
        }
    }
    cout << (ok ? "YES" : "NO") << "\\n";
}`,
        answer: 'NO',
        explain: 'Node 1 gets color 1, so 2 and 3 both get color 2 — but 2 and 3 are themselves friends: conflict, ok = false. A triangle is the smallest odd cycle, and odd cycles are exactly what makes 2-coloring impossible.',
        hint: 'Paint 1, then its neighbors. Now look at the edge between those two neighbors.',
      },
      {
        id: 'dfs-7', type: 'multi', diff: 2,
        prompt: 'Select ALL graphs that can be split into two teams with no edge inside a team (bipartite).',
        options: [
          'A path: 1—2—3—4—5—6',
          'A cycle of length 4',
          'A triangle (cycle of length 3)',
          'A star: one center joined to 8 leaves',
          'A cycle of length 5',
        ],
        answers: [0, 1, 3],
        explain: 'Bipartite ⇔ no odd cycle. Paths and stars are trees — no cycles at all, always 2-colorable. The 4-cycle alternates cleanly; the 3-cycle and 5-cycle wrap around and force a same-color edge.',
      },
      {
        id: 'dfs-8', type: 'tf', diff: 1,
        statement: 'Started from the same node, DFS and BFS visit exactly the same set of nodes — that node’s connected component — just in a different order.',
        answer: true,
        explain: 'Reachability doesn’t care about visit order; both traversals follow every edge out of every reached node. That’s why flood fill and component counting accept either. Order only matters when you need distances — then it must be BFS.',
      },
      {
        id: 'dfs-9', type: 'match', diff: 2,
        prompt: 'Match the task to the technique.',
        pairs: [
          ['count islands in a grid map', 'flood fill'],
          ['split friends into two rival teams', '2-coloring / bipartite check'],
          ['is there a redundant loop of cables?', 'DFS cycle detection with parent check'],
          ['minimum new links to connect everything', 'count components, answer k − 1'],
        ],
        explain: 'Four classic skins of the same traversal. Reading a statement and naming the underlying primitive — before any code — is the actual contest skill this unit trains.',
      },
      {
        id: 'dfs-10', type: 'bank', diff: 2,
        prompt: 'Complete the flood fill (n×m grid, # = wall, dx/dy are the 4 directions).',
        code: `void fill(int r, int c) {
    if (r < 0 || r >= n || c < 0 || c >= m) return;   // off the grid
    if (grid[r][c] == '#' || ___) return;             // wall or already seen
    vis[r][c] = ___;
    for (int d = 0; d < 4; d++)
        fill(r + dx[d], c + ___[d]);
}`,
        answer: ['vis[r][c]', 'true', 'dy'],
        distractors: ['!vis[r][c]', 'false', 'dx'],
        explain: 'Bail out on seen cells (`vis[r][c]`), mark BEFORE recursing (`true` — marking after, or `false`, recurses forever), and columns move by dy while rows move by dx. Each wrong token here is a real infinite-loop or wrong-axis bug.',
      },
      {
        id: 'dfs-11', type: 'mcq', diff: 3,
        prompt: 'Your recursive DFS gets RE on the test where the graph is a single path of 2·10⁵ nodes — every other test passes. Diagnosis and safest fix?',
        options: [
          'Recursion went ~2·10⁵ frames deep and overflowed the stack — switch to BFS or an explicit stack<int>',
          'The adjacency list ran out of heap memory',
          'Path-shaped graphs require Dijkstra instead',
          'vis[] was sized n instead of n + 1',
        ],
        answer: 0,
        explain: 'A path graph is the adversarial worst case: DFS depth = n. Heap memory is fine (2·10⁵ edges is nothing), and a sizing bug would crash on other tests too. "RE only on the chain test" is the textbook stack-overflow signature — re-shape the traversal, don’t re-shape the graph.',
        hint: 'Which test SHAPE maximizes recursion depth?',
      },
      {
        id: 'dfs-12', type: 'code', diff: 3,
        prompt: 'Read n (nodes) and m (edges), then m undirected edges `a b`. Print the number of connected components.',
        starter: `#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> adj;
vector<bool> vis;

void dfs(int u) {
    // mark u, recurse into unvisited neighbors
}

int main() {
    int n, m;
    cin >> n >> m;
    adj.assign(n + 1, {});
    vis.assign(n + 1, false);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    // count the components

    return 0;
}`,
        tests: [
          { input: '5 3\n1 2\n2 3\n4 5', expected: '2' },
          { input: '4 0', expected: '4' },
          { input: '3 3\n1 2\n2 3\n1 3', expected: '1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> adj;
vector<bool> vis;

void dfs(int u) {
    vis[u] = true;
    for (int v : adj[u])
        if (!vis[v]) dfs(v);
}

int main() {
    int n, m;
    cin >> n >> m;
    adj.assign(n + 1, {});
    vis.assign(n + 1, false);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);
        adj[b].push_back(a);
    }
    int comps = 0;
    for (int v = 1; v <= n; v++) {
        if (!vis[v]) {
            comps++;            // first sighting of a new piece
            dfs(v);             // swallow the rest of it
        }
    }
    cout << comps << "\\n";
    return 0;
}`,
        explain: 'The outer loop over ALL nodes is the heart of it: dfs explores one piece, the loop finds the next. Test 2 (m = 0) checks that isolated nodes count as components — the answer is n, not 0.',
        hint: 'No edges at all (test 2): how many components should 4 lonely nodes report?',
      },
    ],
    problems: [
      { name: 'Building Roads', platform: 'CSES', id: '1666', url: 'https://cses.fi/problemset/task/1666', difficulty: 'easy', why: 'Count components, print k − 1 connecting edges — theory card 2, verbatim.' },
      { name: 'Building Teams', platform: 'CSES', id: '1668', url: 'https://cses.fi/problemset/task/1668', difficulty: 'easy', why: '2-coloring per component; an odd cycle means IMPOSSIBLE.' },
      { name: 'Round Trip', platform: 'CSES', id: '1669', url: 'https://cses.fi/problemset/task/1669', difficulty: 'med', why: 'Cycle detection with the parent check — then walk parent[] to print the loop.' },
      { name: 'Kefa and Park', platform: 'Codeforces', id: '580C', rating: 1500, url: 'https://codeforces.com/problemset/problem/580/C', difficulty: 'med', why: 'DFS on a tree carrying consecutive-cat state down the recursion.' },
    ],
  },

  // ==========================================================================
  'dijkstra': {
    id: 'dijkstra',
    objectives: [
      'Implement Dijkstra with a min-heap, the stale-entry skip, and long long distances',
      'Explain why non-negative weights are required — and why visited-on-push is wrong',
      'Replace the heap with a deque when weights are only 0/1 (0-1 BFS)',
      'Solve "one coupon / special move" problems with layered state graphs',
    ],
    theory: [
      {
        h: 'When edges get prices, BFS lies',
        md: 'BFS minimizes edge **count**. With weights, a 3-step detour of total cost 4 beats one road of length 10 — and BFS still picks the single road. Dijkstra fixes it greedily: maintain tentative distances; repeatedly take the **unsettled node with the smallest tentative distance**, declare it final ("settled"), and relax its outgoing edges.\n\nWhy that greedy is safe: with non-negative weights, any path through a farther node can never come back cheaper. That assumption is load-bearing — see the negative-edge card.',
      },
      {
        h: 'The implementation: min-heap + lazy deletion',
        md: 'C++ `priority_queue` can’t decrease a key — so don’t. Push a new (better) entry and let the old one go stale. When you pop (d, u), if d isn’t the current dist[u], a better entry was processed already: `continue`. That single line replaces an entire decrease-key data structure.\n\nEach edge pushes at most once → O(m) heap entries → **O((V+E) log V)**. And distances reach 2·10⁵ × 10⁹ = 2·10¹⁴: `long long`, non-negotiable.',
        code: `using pli = pair<ll, int>;                        // (dist, node) — dist FIRST
vector<ll> dist(n + 1, LLONG_MAX);
priority_queue<pli, vector<pli>, greater<>> pq;   // min-heap
dist[s] = 0;
pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d != dist[u]) continue;                   // stale entry — skip
    for (auto [v, w] : adj[u]) {
        if (d + w < dist[v]) {                    // found something cheaper
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
    }
}`,
        note: 'Pair compares lexicographically — the distance must be the FIRST member or the heap orders by node index.',
      },
      {
        h: 'The visited-on-push bug',
        md: 'The classic wrong Dijkstra is BFS wearing a heap: it marks v visited at **push** time. In BFS that’s correct — first touch is best. With weights it’s fatal: the first push may arrive via an expensive road, and the node is now locked, deaf to the cheaper route discovered later.\n\nCorrect protocol: a node’s distance becomes final only when it’s **popped** (settled). Until then, extra pushes are welcome — the stale-entry skip quietly discards the losers. Want a path too? Set `parent[v] = u` on every successful relax.',
        note: 'Symptom: WA on graphs where the cheaper route has MORE edges. Build exactly that shape to test your Dijkstra.',
        noteKind: 'warn',
      },
      {
        h: 'Why non-negative weights are mandatory',
        md: 'Edges: 1→2 costs 2, 1→3 costs 3, 3→2 costs **−2**. Dijkstra settles node 2 at distance 2 — final, never reconsidered. But the truth is 3 + (−2) = 1 via node 3. The greedy promise — "no farther node can improve you" — broke the moment an edge could *refund* cost.\n\nNegative edges are Bellman-Ford territory (a later unit). For now the rule is absolute: see a negative weight, put Dijkstra down.',
        noteKind: 'danger',
        note: 'Dijkstra with negative edges doesn’t crash — it confidently prints wrong numbers. The worst kind of bug.',
      },
      {
        h: '0-1 BFS: Dijkstra without the log',
        md: 'Weights only 0 and 1? Replace the heap with a deque. When relaxing an edge of weight 0, v is **as close as u** — push it to the *front*, it must be served before anything farther; weight 1 → push to the *back*. The deque never holds more than two distinct distance values and stays sorted, so you pop in distance order like Dijkstra — in **O(V+E)** flat.\n\nRecognition: "free moves vs paid moves" — walk along a conveyor for free, break one wall for 1, flip one switch for 1.',
        code: `deque<int> dq;
vector<int> dist(n + 1, INT_MAX);
dist[s] = 0;
dq.push_front(s);
while (!dq.empty()) {
    int u = dq.front(); dq.pop_front();
    for (auto [v, w] : adj[u]) {            // w is 0 or 1
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            if (w == 0) dq.push_front(v);   // same ring → front
            else        dq.push_back(v);    // one farther → back
        }
    }
}`,
      },
      {
        h: 'Dijkstra on state graphs',
        md: 'Flight Discount (CSES): one coupon halves a single flight. Don’t mutate the algorithm — enrich the **nodes**: a state is (city, coupon used?). Two layers of the same map. Normal flights stay inside a layer; *using the coupon* is the only way to jump layer 0 → layer 1, at half price — and there’s no way back, which encodes "use it at most once" purely in topology.\n\nRun vanilla Dijkstra on the 2n states; the answer is min(dist[n][0], dist[n][1]). Keys, parity, fuel — any small extra fact rides along the same way.',
        code: `// dist[v][used], used ∈ {0, 1}
// edge u → v of weight w generates:
//   (u, 0) → (v, 0)  cost w        // fly normally
//   (u, 0) → (v, 1)  cost w / 2    // burn the coupon HERE
//   (u, 1) → (v, 1)  cost w        // coupon already gone`,
      },
    ],
    exercises: [
      {
        id: 'dij-1', type: 'mcq', diff: 1,
        prompt: 'Roads now have lengths. Why does plain BFS stop giving shortest routes?',
        options: [
          'BFS minimizes the NUMBER of edges — a 2-road detour of total length 3 beats one road of length 10, but BFS still picks the single road',
          'Queues cannot store weighted nodes',
          'BFS only terminates on unweighted graphs',
          'It doesn’t stop working — BFS handles any graph',
        ],
        answer: 0,
        explain: 'BFS’s guarantee is about edge count, not edge cost; the two coincide only when every edge costs the same. The moment weights vary, "fewest hops" and "cheapest" diverge — and you need Dijkstra’s distance-ordered settling instead of the queue’s FIFO order.',
      },
      {
        id: 'dij-2', type: 'output', diff: 1,
        prompt: 'The min-heap that powers Dijkstra. What does this print?',
        code: `int main() {
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({4, 1});
    pq.push({1, 2});
    pq.push({3, 3});
    while (!pq.empty()) {
        cout << pq.top().second << " ";
        pq.pop();
    }
}`,
        answer: '2 3 1',
        explain: 'With `greater<>` the priority_queue becomes a MIN-heap, popping the smallest pair first: (1,2), (3,3), (4,1) — printed by node: 2 3 1. Pairs compare by first member (the distance) — which is exactly why Dijkstra stores (dist, node) and not (node, dist).',
      },
      {
        id: 'dij-3', type: 'mcq', diff: 2,
        prompt: 'Directed graph: `1→2 (w=1), 2→3 (w=1), 1→3 (w=5), 3→4 (w=1)`. After Dijkstra from node 1, what is dist[4]?',
        options: ['3', '6', '5', '2'],
        answer: 0,
        explain: 'The two-hop route 1→2→3 costs 2, undercutting the direct 1→3 of cost 5; then 3→4 adds 1, total 3. If you answered 6 you let the first push of node 3 (the expensive direct edge) become final — which is precisely the visited-on-push bug in human form.',
        hint: 'What is the cheapest way to reach node 3 — direct, or around?',
      },
      {
        id: 'dij-4', type: 'tf', diff: 1,
        statement: 'With up to 2·10⁵ edges of weight up to 10⁹, shortest distances can reach ~2·10¹⁴, so the dist array must be long long.',
        answer: true,
        explain: 'A worst-case path multiplies edge count by max weight: 2·10⁵ × 10⁹ = 2·10¹⁴ ≫ INT_MAX ≈ 2.1·10⁹. An int dist array overflows silently and Dijkstra starts preferring "negative" garbage paths. Size the accumulator, not the inputs.',
      },
      {
        id: 'dij-5', type: 'mcq', diff: 2,
        prompt: 'This "Dijkstra" returns wrong distances on some graphs. The flaw?',
        code: `while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    for (auto [v, w] : adj[u]) {
        if (!vis[v]) {
            vis[v] = true;          // mark when pushing
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
    }
}`,
        options: [
          'A node is locked to the FIRST path that pushes it — but with weights, the first push isn’t always the cheapest route',
          'The pq needs less<> instead of greater<>',
          'dist should be updated after the push, not before',
          'Nothing — marking on push just makes it faster',
        ],
        answer: 0,
        explain: 'Visited-on-push is BFS logic, valid only when all edges cost the same. Correct Dijkstra finalizes a node when it is POPPED; until then better pushes must stay welcome, and `if (d != dist[u]) continue;` discards the stale leftovers.',
        hint: 'Replay dij-3’s graph through this code. What does node 3 get locked to?',
      },
      {
        id: 'dij-6', type: 'fill', diff: 2,
        prompt: 'Lazy deletion: a popped pair (d, u) may be an outdated entry. Fill the guard that skips it:',
        code: `auto [d, u] = pq.top(); pq.pop();
if (___) continue;     // stale — a better entry already handled u`,
        answer: ['d != dist[u]', 'd > dist[u]', 'dist[u] != d', 'dist[u] < d'],
        placeholder: 'd … dist[u]',
        explain: 'If a cheaper route to u was found after this entry was pushed, dist[u] shrank below d — the entry is stale. One comparison replaces the decrease-key operation that priority_queue doesn’t have.',
      },
      {
        id: 'dij-7', type: 'bank', diff: 2,
        prompt: 'Declare Dijkstra’s heap and seed the source.',
        code: `using pli = pair<ll, int>;            // (dist, node): dist first!
priority_queue<pli, vector<pli>, ___> pq;
pq.push({___, src});`,
        answer: ['greater<pli>', '0'],
        distractors: ['less<pli>', 'INF'],
        explain: '`greater<pli>` flips the default max-heap into the min-heap Dijkstra needs — with `less<pli>` you’d settle the FARTHEST node first and everything unravels. The source enters at distance 0, not INF.',
      },
      {
        id: 'dij-8', type: 'parsons', diff: 2,
        prompt: 'Assemble Dijkstra’s main loop (dist[] is INF except dist[s] = 0, which is already pushed).',
        lines: [
          'while (!pq.empty()) {',
          '    auto [d, u] = pq.top(); pq.pop();',
          '    if (d != dist[u]) continue;',
          '    for (auto [v, w] : adj[u]) {',
          '        if (d + w < dist[v]) {',
          '            dist[v] = d + w;',
          '            pq.push({dist[v], v});',
          '        }',
          '    }',
          '}',
        ],
        distractors: [
          '    if (d == dist[u]) continue;',
        ],
        explain: 'Pop → stale check → relax → push. The distractor inverts the stale check, skipping every USEFUL entry and processing only garbage — a one-character difference between Dijkstra and nonsense. Update dist[v] before pushing, so the heap entry carries the new value.',
      },
      {
        id: 'dij-9', type: 'mcq', diff: 2,
        prompt: 'Edges: `1→2 (w=2), 1→3 (w=3), 3→2 (w=−2)`. Dijkstra from node 1 settles node 2 at distance 2 and never looks back. What is the TRUE shortest distance to node 2?',
        options: [
          '1 — via node 3 (3 − 2); the negative edge broke Dijkstra’s settle-once guarantee',
          '2 — Dijkstra is correct here',
          '0 — negative edges always pull distances to zero',
          '−2 — the cheapest edge wins',
        ],
        answer: 0,
        explain: 'Path 1→3→2 costs 3 + (−2) = 1 < 2. Dijkstra’s greedy assumes extending a path never makes it cheaper — a refund edge falsifies that, and node 2 was settled prematurely. Non-negative weights aren’t a style preference; they’re the correctness proof.',
      },
      {
        id: 'dij-10', type: 'match', diff: 2,
        prompt: 'Match the edge weights to the right shortest-path tool.',
        pairs: [
          ['all edges cost 1', 'plain BFS'],
          ['weights are only 0 or 1', '0-1 BFS with a deque'],
          ['non-negative weights', 'Dijkstra with a min-heap'],
          ['negative edges possible', 'Bellman-Ford — Dijkstra breaks'],
        ],
        explain: 'The decision is made by the WEIGHTS, before any code: unit → O(V+E) BFS; binary → O(V+E) deque; non-negative → O((V+E) log V) Dijkstra; negative → heavier machinery. Constraints pick the algorithm for you.',
      },
      {
        id: 'dij-11', type: 'mcq', diff: 2,
        prompt: 'In 0-1 BFS you relax a weight-0 edge from u to v. Where does v go in the deque, and why?',
        options: [
          'push_front — v is exactly as close as u, so it must be served before anything farther',
          'push_back — new nodes always join at the back',
          'Into a separate priority queue for 0-edges',
          'Nowhere — weight-0 edges can be ignored',
        ],
        answer: 0,
        explain: 'The deque’s invariant is "sorted by distance, at most two distinct values". A 0-edge keeps v in u’s ring → front; a 1-edge puts it one ring out → back. Break the rule and nodes are popped out of distance order — same disease as a broken heap.',
      },
      {
        id: 'dij-12', type: 'mcq', diff: 3,
        prompt: 'Flight Discount (CSES): one coupon halves a single flight on your route 1 → n. The clean model?',
        options: [
          'Duplicate the graph into layers (city, coupon unused) and (city, coupon used); discounted flights cross layers one-way; answer = best distance to n in either layer',
          'Run Dijkstra once, then halve the most expensive flight on the shortest path it found',
          'Run Dijkstra m times, each time halving a different single edge',
          'Halve the most expensive flight in the whole graph, then run Dijkstra once',
        ],
        answer: 0,
        explain: 'The layered graph encodes "at most one coupon" in topology — no algorithm changes, just 2n states. Option 2 is the seductive trap: the optimal coupon route is often NOT the un-discounted shortest path. Option 3 is correct but O(m · m log n) — dead at 2·10⁵.',
        hint: 'The coupon is one bit of state. Where does a bit of state live in a graph problem?',
      },
      {
        id: 'dij-13', type: 'code', diff: 3,
        prompt: 'Read n, m, then m DIRECTED edges `a b w` (weights ≥ 0, up to 10⁹). Print the cheapest cost to travel 1 → n, or `-1` if impossible.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});   // directed a -> b
    }
    // Dijkstra from node 1; print dist[n] or -1

    return 0;
}`,
        tests: [
          { input: '4 5\n1 2 1\n2 3 1\n1 3 5\n3 4 1\n1 4 9', expected: '3' },
          { input: '3 1\n2 3 7', expected: '-1' },
          { input: '2 2\n1 2 5\n1 2 3', expected: '3' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,int>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b, w;
        cin >> a >> b >> w;
        adj[a].push_back({b, w});   // directed a -> b
    }
    vector<ll> dist(n + 1, LLONG_MAX);
    priority_queue<pair<ll,int>, vector<pair<ll,int>>, greater<>> pq;
    dist[1] = 0;
    pq.push({0, 1});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d != dist[u]) continue;             // stale entry — skip
        for (auto [v, w] : adj[u]) {
            if (d + w < dist[v]) {              // relax
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    if (dist[n] == LLONG_MAX) cout << -1 << "\\n";
    else cout << dist[n] << "\\n";
    return 0;
}`,
        explain: 'All three signature moves in one program: min-heap of (dist, node), the stale-entry skip, and long long distances. Test 1 has the expensive-direct-edge trap (1→4 for 9 must lose to the 3-hop route); test 3 checks parallel edges don’t confuse the relax.',
        hint: 'Settle on pop, not on push — and let `if (d != dist[u]) continue;` clean up the duplicates.',
      },
    ],
    problems: [
      { name: 'Shortest Routes I', platform: 'CSES', id: '1671', url: 'https://cses.fi/problemset/task/1671', difficulty: 'easy', why: 'Textbook Dijkstra at full constraints. TLE or WA here = visited-on-push or int overflow.' },
      { name: 'Flight Discount', platform: 'CSES', id: '1195', url: 'https://cses.fi/problemset/task/1195', difficulty: 'med', why: 'The layered (city, coupon) state graph from the theory — Dijkstra unchanged.' },
      { name: 'Dijkstra?', platform: 'Codeforces', id: '20C', rating: 1900, url: 'https://codeforces.com/problemset/problem/20/C', difficulty: 'hard', why: 'Dijkstra + parent[] path printing + long long: all three traps in one statement.' },
    ],
  },

  // ==========================================================================
  'toposort': {
    id: 'toposort',
    objectives: [
      'Recognize dependency problems as DAGs and produce an order with Kahn’s algorithm',
      'Detect cycles by counting: order.size() < n ⇒ IMPOSSIBLE',
      'Run DP over the topological order: longest paths and path counting mod 10⁹+7',
    ],
    theory: [
      {
        h: 'DAGs: arrows with no way back',
        md: 'A **DAG** is a directed graph with no cycles. Its superpower: the nodes can be lined up so every edge points left → right — a **topological order**. Process nodes in that order and every prerequisite is already done when you arrive.\n\nRecognition cues: *prerequisite, depends on, must come before, build order* — any statement whose constraints are "A before B" pairs is asking for a toposort, or for proof that the constraints contradict themselves (a cycle).',
      },
      {
        h: 'Kahn’s algorithm: peel the zero-indegree nodes',
        md: '`indeg[v]` counts v’s unfinished prerequisites. Everything at zero is ready — queue it. Pop u, append it to the order, and "complete" it: each edge u→v drops indeg[v] by one, and a node whose **last** prerequisite just finished joins the queue. O(V+E) total.\n\nNeed the lexicographically smallest valid order? Same algorithm, priority_queue instead of queue.',
        code: `vector<int> indeg(n + 1, 0);
for (int i = 0; i < m; i++) {
    int a, b;
    cin >> a >> b;
    adj[a].push_back(b);              // directed: ONE direction only
    indeg[b]++;                       // b gains a prerequisite
}
queue<int> q;
for (int v = 1; v <= n; v++)
    if (indeg[v] == 0) q.push(v);     // ready from the start
vector<int> order;
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) q.push(v);   // last prereq done → ready
}`,
      },
      {
        h: 'Cycle ⇒ the order comes up short',
        md: 'Inside a cycle, every node waits on another node of the cycle — none ever reaches indegree 0, so none ever enters the queue. Kahn doesn’t crash; it just quietly runs out of work early. You detect it by **counting**: fewer than n nodes in the order ⇒ a cycle exists ⇒ Course Schedule prints `IMPOSSIBLE`.\n\nThis is the cleanest directed-cycle detector you’ll ever write — it comes free with the sort.',
        code: `if ((int)order.size() < n) cout << "IMPOSSIBLE\\n";
else for (int u : order) cout << u << " ";`,
      },
      {
        h: 'DP over the topo order: longest path',
        md: 'Longest path is NP-hard in general graphs — on a DAG it’s a single pass. Walk nodes in topological order and relax forward: by the time u is processed, every path into u has already been accounted, so dp[u] is final. Longest Flight Route is exactly this (plus parent[] to print the route).\n\nThe trap: nodes **unreachable from the start** must not relax anyone — guard them, or ghost paths appear out of nowhere.',
        code: `vector<int> dp(n + 1, -1);            // -1 = unreachable from node 1
dp[1] = 0;
for (int u : order)                   // topo order: dp[u] is final here
    if (dp[u] != -1)                  // the guard!
        for (int v : adj[u])
            dp[v] = max(dp[v], dp[u] + 1);`,
      },
      {
        h: 'Counting paths, mod 10⁹+7',
        md: 'Game Routes: how many distinct routes 1 → n? Same single pass: start `ways[1] = 1`, and every edge u→v inherits `ways[v] += ways[u]` as u is processed in topo order.\n\nPath counts grow **exponentially** — a chain of diamonds doubles them at every step — hence the "mod 10⁹+7" in the statement. Apply the mod at *every* addition; overflow does not wait politely for your final answer.',
        code: `const ll MOD = 1e9 + 7;
vector<ll> ways(n + 1, 0);
ways[1] = 1;
for (int u : order)
    for (int v : adj[u])
        ways[v] = (ways[v] + ways[u]) % MOD;   // mod EVERY addition`,
      },
      {
        h: 'Hidden DAGs: Fox and Names',
        md: 'Sometimes you must *build* the graph yourself. Fox and Names: given words supposedly in dictionary order, recover an alphabet that makes it true. Each adjacent pair of words yields at most one constraint — at the **first position where they differ**, the first word’s letter must come earlier: one edge between letters. 26 nodes, toposort, print the order.\n\nThe famous trap: if the second word is a proper **prefix** of the first (`"abc"` listed before `"ab"`), no letter pair can fix it — IMPOSSIBLE before any sorting happens.',
      },
    ],
    exercises: [
      {
        id: 'topo-1', type: 'mcq', diff: 1,
        prompt: '"Course v requires course u first", for m such pairs; output any valid study order. What is this, really?',
        options: [
          'Topological sort of a directed graph — Kahn’s algorithm',
          'Shortest path — BFS from course 1',
          'Sort courses once by how many prerequisites they have',
          'Minimum spanning tree over the prerequisite pairs',
        ],
        answer: 0,
        explain: 'Each pair is a directed edge u→v, and a valid study order is exactly a topological order. The one-shot sort by prerequisite COUNT fails because finishing a course unlocks others gradually — you must re-evaluate readiness as you go, which is precisely what Kahn’s queue does.',
      },
      {
        id: 'topo-2', type: 'output', diff: 1,
        prompt: 'Directed edges this time. What does this print?',
        code: `int main() {
    int indeg[5] = {0, 0, 0, 0, 0};
    int es[4][2] = {{1, 2}, {1, 3}, {2, 4}, {3, 4}};   // a -> b
    for (auto& e : es) indeg[e[1]]++;     // only the head gains
    for (int v = 1; v <= 4; v++) cout << indeg[v] << " ";
}`,
        answer: '0 1 1 2',
        explain: 'Indegree counts INCOMING edges: node 1 has none (it’s a source — Kahn starts there), 2 and 3 each have one, 4 collects two. Note the contrast with undirected graphs: here each edge increments exactly one counter.',
      },
      {
        id: 'topo-3', type: 'mcq', diff: 2,
        prompt: 'DAG edges: `1→3, 2→3, 3→4, 2→5`. Run Kahn’s with a FIFO queue, seeding indegree-0 nodes in increasing order. Which order comes out?',
        options: ['1 2 3 5 4', '1 2 3 4 5', '2 1 3 5 4', '1 3 2 5 4'],
        answer: 0,
        explain: 'Seeds: 1, 2 (both indegree 0). Popping 1 lowers indeg[3] to 1; popping 2 frees BOTH 3 and 5, queued in that order. Then popping 3 frees 4 — but 5 was already waiting in line, so 5 precedes 4. FIFO order matters; "1 2 3 4 5" assumes a sorted queue you don’t have.',
        hint: 'Track the queue contents step by step: [1, 2] → … Who is in line when 4 becomes ready?',
      },
      {
        id: 'topo-4', type: 'tf', diff: 1,
        statement: 'A DAG can have several different valid topological orders.',
        answer: true,
        explain: 'Two nodes with no path between them can appear in either order — e.g. a graph with no edges allows all n! orders. That’s why Course Schedule accepts ANY valid answer, and why your output differing from the sample can still be AC.',
      },
      {
        id: 'topo-5', type: 'parsons', diff: 2,
        prompt: 'Assemble Kahn’s algorithm (indeg[] already counted from the edges).',
        lines: [
          'queue<int> q;',
          'for (int v = 1; v <= n; v++)',
          '    if (indeg[v] == 0) q.push(v);',
          'while (!q.empty()) {',
          '    int u = q.front(); q.pop(); order.push_back(u);',
          '    for (int v : adj[u])',
          '        if (--indeg[v] == 0) q.push(v);',
          '}',
        ],
        distractors: [
          '        if (indeg[v]-- == 0) q.push(v);',
        ],
        explain: 'Seed every indegree-0 node, then pop-append-decrement. The distractor is a one-character landmine: `indeg[v]--` compares BEFORE decrementing, so a node whose count just hit zero is never pushed — Kahn stalls and everything looks like a cycle.',
      },
      {
        id: 'topo-6', type: 'fill', diff: 2,
        prompt: 'Kahn’s loop has finished. Fill the cycle test:',
        code: `if (___) {
    cout << "IMPOSSIBLE\\n";    // the prerequisites contradict themselves
}`,
        answer: ['order.size() < n', '(int)order.size() < n', 'order.size() != n', '(int)order.size() != n'],
        placeholder: 'order.size() …',
        explain: 'Cycle nodes never reach indegree 0, so they’re simply missing from the output — count the order instead of hunting for the cycle. Fewer than n nodes processed ⇔ a cycle exists. Course Schedule is this line plus printing.',
      },
      {
        id: 'topo-7', type: 'mcq', diff: 2,
        prompt: 'This Kahn’s implementation produces wrong orders AND phantom IMPOSSIBLEs. The bug?',
        code: `while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : adj[u]) {
        indeg[v]--;
        if (indeg[v] == 1) q.push(v);   // ← hmm
    }
}`,
        options: [
          'The push condition must be indeg[v] == 0 — a node is ready only when its LAST prerequisite finishes',
          'indeg[v]-- must happen after the push',
          'order.push_back(u) belongs after the for loop',
          'q must be a priority_queue for correctness',
        ],
        answer: 0,
        explain: 'With `== 1`, a node with 2+ prerequisites enters the queue while one is still pending (invalid order), and a node with exactly 1 prerequisite — which drops straight to 0 — never enters at all (looks like a cycle). "Ready" means the counter just became zero, nothing else.',
      },
      {
        id: 'topo-8', type: 'output', diff: 2,
        prompt: 'Path counting along a topo order. The edges are listed so every tail is processed before reuse. Output?',
        code: `int main() {
    // DAG: 1->2, 1->3, 2->3, 2->4, 3->4 — edges in topo order of tails
    long long ways[5] = {0, 1, 0, 0, 0};   // ways[1] = 1
    int es[5][2] = {{1, 2}, {1, 3}, {2, 3}, {2, 4}, {3, 4}};
    for (auto& e : es) ways[e[1]] += ways[e[0]];
    cout << ways[3] << " " << ways[4] << "\\n";
}`,
        answer: '2 3',
        explain: 'Routes to 3: direct, or via 2 → ways[3] = 2. Routes to 4: 1-2-4, 1-2-3-4, 1-3-4 → ways[4] = 1 + 2 = 3 (one from ways[2], two from ways[3]). Each node hands its full count downstream — legal only because the order guarantees the count is final when handed over.',
        hint: 'Process the five edges one by one, updating the ways array as you go.',
      },
      {
        id: 'topo-9', type: 'mcq', diff: 2,
        prompt: 'Why exactly does Kahn’s algorithm never output the nodes of a cycle?',
        options: [
          'Every node in a cycle has an in-cycle predecessor, so its indegree never reaches 0 — it never enters the queue',
          'The queue overflows when it meets a cycle',
          'Cycle nodes have indegree 0 and get filtered at the start',
          'It does output them, just in reverse order',
        ],
        answer: 0,
        explain: 'A cycle is a deadlock of prerequisites: each member waits for another member, forever. Kahn can only peel nodes whose dependencies are fully done — the cycle never qualifies. Hence the elegant detector: count what came out, compare with n.',
      },
      {
        id: 'topo-10', type: 'match', diff: 2,
        prompt: 'Match the problem phrase to the technique.',
        pairs: [
          ['order the courses given prerequisites', 'plain Kahn’s algorithm'],
          ['the prerequisites contradict each other', 'order.size() < n ⇒ IMPOSSIBLE'],
          ['longest chain of flights in a DAG', 'dp[v] = max(dp[v], dp[u] + 1) in topo order'],
          ['count the routes, mod 10⁹+7', 'ways[v] += ways[u] in topo order'],
        ],
        explain: 'One ordering, three payloads: the order itself, a max-DP over it, a count-DP over it. Once nodes are processed prerequisite-first, any "accumulate along edges" computation becomes a single forward pass.',
      },
      {
        id: 'topo-11', type: 'mcq', diff: 3,
        prompt: 'Fox and Names: words are claimed to be in dictionary order under some unknown alphabet. How do you extract constraints from a consecutive pair w₁, w₂?',
        options: [
          'Find the FIRST position where they differ: edge w₁[i] → w₂[i]; if there is none and w₁ is longer, print IMPOSSIBLE immediately',
          'Add edges between all 26×25 letter pairs that ever co-occur',
          'Compare their last letters — endings decide dictionary order',
          'Compare letter frequencies of the two words',
        ],
        answer: 0,
        explain: 'Dictionary order is decided at the first mismatch — everything after it is irrelevant, so one pair gives at most ONE edge. The prefix trap is the killer: `abc` before `ab` can’t be fixed by any alphabet, and no edge encodes that — it needs an explicit check before the toposort.',
        hint: 'How does a real dictionary decide between "car" and "cat"? And between "cars" and "car"?',
      },
      {
        id: 'topo-12', type: 'bank', diff: 2,
        prompt: 'Longest path from node 1 in a DAG (order[] is a topological order). Complete it.',
        code: `vector<int> dp(n + 1, -1);     // -1 = unreachable from node 1
dp[1] = 0;
for (int u : order)
    if (dp[u] != ___)
        for (int v : adj[u])
            dp[v] = max(dp[v], dp[u] + ___);`,
        answer: ['-1', '1'],
        distractors: ['0', 'INF'],
        explain: 'The guard is the famous Longest Flight Route bug: without `dp[u] != -1`, an unreachable node "relaxes" its neighbors to −1 + 1 = 0, conjuring paths that start nowhere. Each edge extends the path by 1 hop.',
      },
      {
        id: 'topo-13', type: 'code', diff: 3,
        prompt: 'Read n, m, then m directed edges `a b` of a DAG. Print the number of distinct paths from node 1 to node n, modulo 10⁹+7.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1e9 + 7;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);     // directed a -> b; the graph is a DAG
        indeg[b]++;
    }
    // Kahn + ways[]: count the paths 1 -> n modulo MOD

    return 0;
}`,
        tests: [
          { input: '4 4\n1 2\n1 3\n2 4\n3 4', expected: '2' },
          { input: '3 2\n1 2\n2 3', expected: '1' },
          { input: '3 1\n2 3', expected: '0' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1e9 + 7;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        adj[a].push_back(b);     // directed a -> b; the graph is a DAG
        indeg[b]++;
    }
    queue<int> q;
    for (int v = 1; v <= n; v++)
        if (indeg[v] == 0) q.push(v);
    vector<ll> ways(n + 1, 0);
    ways[1] = 1;                          // one way to stand at the start
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            ways[v] = (ways[v] + ways[u]) % MOD;   // hand the count downstream
            if (--indeg[v] == 0) q.push(v);
        }
    }
    cout << ways[n] << "\\n";
    return 0;
}`,
        explain: 'Kahn’s order guarantees ways[u] is complete before u passes it on — that’s the whole correctness argument. Test 3 checks the unreachable case: node 1 never feeds node 3, so the count stays 0 with no special-casing needed.',
        hint: 'ways[1] = 1, everything else 0 — then let every processed edge do ways[v] += ways[u] (mod 10⁹+7).',
      },
    ],
    problems: [
      { name: 'Course Schedule', platform: 'CSES', id: '1679', url: 'https://cses.fi/problemset/task/1679', difficulty: 'easy', why: 'Kahn’s verbatim — print the order, or IMPOSSIBLE on a cycle.' },
      { name: 'Longest Flight Route', platform: 'CSES', id: '1680', url: 'https://cses.fi/problemset/task/1680', difficulty: 'med', why: 'Max-DP over the topo order, the unreachable guard, and path printing.' },
      { name: 'Game Routes', platform: 'CSES', id: '1681', url: 'https://cses.fi/problemset/task/1681', difficulty: 'med', why: 'Path counting mod 10⁹+7 — the code exercise at full constraints.' },
      { name: 'Fox And Names', platform: 'Codeforces', id: '510C', rating: 1600, url: 'https://codeforces.com/problemset/problem/510/C', difficulty: 'med', why: 'Build the letter DAG from adjacent words yourself — and dodge the prefix trap.' },
    ],
  },

  // ==========================================================================
  'dsu-mst': {
    id: 'dsu-mst',
    objectives: [
      'Implement DSU with path compression and union by size',
      'Answer connectivity, component-count, and component-size queries in near-O(1)',
      'Build minimum spanning trees with Kruskal and report IMPOSSIBLE when disconnected',
      'Spot MST problems in disguise ("connect everything cheapest", virtual nodes)',
    ],
    theory: [
      {
        h: 'Dynamic connectivity: the problem DSU eats',
        md: 'Edges arrive one at a time, and between arrivals you’re asked: *are a and b connected yet? how many components remain? how big is a’s group?* Re-running BFS per query costs O(q·(V+E)) — dead at 2·10⁵.\n\n**DSU** (Disjoint Set Union, a.k.a. Union-Find) maintains the partition directly, with two operations: `find(x)` — the representative ("root") of x’s set — and `unite(a, b)` — merge two sets. With both optimizations below, each operation is amortized **α(n) ≈ constant** (inverse Ackermann: ≤ 5 for any n that fits in this universe).',
      },
      {
        h: 'parent + size: ten lines, total',
        md: 'Each set is a tree of pointers; roots point at themselves. `find` climbs to the root and — **path compression** — re-points every node it passed directly at the root, flattening the trail for all future queries. `unite` hangs the **smaller** tree under the bigger (**union by size**), keeping trees shallow. It returns whether a merge actually happened — that bool is surprisingly load-bearing.',
        code: `vector<int> parent(n + 1), sz(n + 1, 1);
iota(parent.begin(), parent.end(), 0);   // everyone starts alone

int find(int x) {
    if (parent[x] == x) return x;
    return parent[x] = find(parent[x]);  // path compression: flatten on the way back
}

bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;            // already together
    if (sz[a] < sz[b]) swap(a, b);       // union by size: small under big
    parent[b] = a;
    sz[a] += sz[b];
    return true;
}`,
      },
      {
        h: 'What you can ask it',
        md: 'Same component? `find(a) == find(b)`. **Component count**: start at n, subtract 1 per *successful* unite. **Component size** (News Distribution): read `sz[find(x)]` — never `sz[x]`; the size is maintained only at roots, and non-root entries go stale. **Cycle on insert**: an edge whose endpoints already share a root would close a cycle — that observation is the heart of Kruskal’s.\n\nDSU’s one limitation: it only merges. Edge deletion needs heavier machinery you don’t have yet.',
        note: 'sz[x] at a non-root is a leftover from history. Always route size queries through find().',
        noteKind: 'warn',
      },
      {
        h: 'Kruskal: cheapest edges first',
        md: 'Minimum spanning tree: pick edges connecting all n nodes at minimum total cost. Kruskal: **sort edges by weight**, walk them cheapest-first, `unite` the endpoints — and when unite returns false, the edge would close a cycle inside an already-connected clump: skip it. After n − 1 successful unites, you hold the MST.\n\nWhy the greedy is safe: the cheapest edge crossing any cut ("connected so far" vs "the rest") always belongs to some MST. Sorting dominates the runtime: **O(m log m)**.',
        code: `sort(edges.begin(), edges.end());     // (w, a, b) tuples: weight first
ll cost = 0;
int used = 0;
for (auto [w, a, b] : edges) {
    if (unite(a, b)) {                // different components → take it
        cost += w;
        used++;
    }                                 // same component → cycle edge: skip
}`,
      },
      {
        h: 'IMPOSSIBLE, and smelling MST in a statement',
        md: 'If the graph itself is disconnected, no spanning tree exists — and you learn it from the **count**: fewer than n − 1 successful unites by the end ⇒ Road Reparation prints `IMPOSSIBLE`. (A spanning tree of n nodes has exactly n − 1 edges; that number is worth tattooing somewhere.)\n\nRecognition cues: *"connect all cities/computers at minimum total cost", "cheapest network", "repair roads so everyone can travel"*. Any "make it one component, money matters" statement is an MST until proven otherwise.',
      },
      {
        h: 'The virtual-node trick (Shichikuji)',
        md: 'Shichikuji and Power Grid: every city needs power — **build a station** in it (cost cᵢ) or **wire it** to an already-powered city (edge cost). Stations look like a special rule… until you add a virtual node 0, "the power plant in the sky": building in city i becomes the ordinary edge (0, i) of cost cᵢ. Now *everything* is an edge → Kruskal on n + 1 nodes → done. Multiple stations? That’s just several cities choosing their edge to node 0.\n\nWhen a problem mixes per-NODE costs with per-EDGE costs, try gluing the node costs onto a virtual node.',
      },
    ],
    exercises: [
      {
        id: 'dsu-1', type: 'mcq', diff: 1,
        prompt: 'Edges arrive one by one; between arrivals you must answer "are a and b connected right now?". Which tool answers each query in near-constant amortized time?',
        options: [
          'A DSU: the query is find(a) == find(b)',
          'Re-run BFS from a for every query',
          'An adjacency matrix: check adj[a][b]',
          'Sort all the edges by weight first',
        ],
        answer: 0,
        explain: 'BFS per query multiplies O(V+E) by the query count — dead at 2·10⁵. The matrix answers "is there a DIRECT edge", a different question entirely. DSU maintains the partition itself, so connectivity is two find() calls at α(n) ≈ constant each.',
      },
      {
        id: 'dsu-2', type: 'output', diff: 2,
        prompt: 'Component counting with DSU: comps drops only on a SUCCESSFUL unite. Output?',
        code: `int parent[5], sz[5];

int find(int x) {
    if (parent[x] == x) return x;
    return parent[x] = find(parent[x]);
}

bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a; sz[a] += sz[b];
    return true;
}

int main() {
    int comps = 4;
    for (int v = 1; v <= 4; v++) { parent[v] = v; sz[v] = 1; }
    int qs[4][2] = {{1, 2}, {3, 4}, {2, 3}, {1, 4}};
    for (auto& e : qs) {
        if (unite(e[0], e[1])) comps--;
        cout << comps << " ";
    }
}`,
        answer: '3 2 1 1',
        explain: 'Three merges shrink 4 → 3 → 2 → 1. The fourth call, unite(1, 4), finds both already share root 1 and returns false — comps stays 1. "Each successful unite removes exactly one component" is the counting idiom you’ll reuse constantly.',
        hint: 'By the third union, who is connected to whom? Then what does unite(1, 4) return?',
      },
      {
        id: 'dsu-3', type: 'tf', diff: 1,
        statement: 'Path compression makes every node visited during a find() point directly at the root, flattening the tree for all later queries.',
        answer: true,
        explain: 'The recursive `parent[x] = find(parent[x])` rewires the whole walked path on the way back up. Each find pays once to flatten; thousands of later finds ride the shortcut — that’s where the amortized near-O(1) comes from.',
      },
      {
        id: 'dsu-4', type: 'parsons', diff: 2,
        prompt: 'Assemble find() with path compression.',
        lines: [
          'int find(int x) {',
          '    if (parent[x] == x) return x;',
          '    return parent[x] = find(parent[x]);',
          '}',
        ],
        distractors: [
          '    return find(parent[x]);',
        ],
        explain: 'Root reached → return it; otherwise recurse AND assign — `parent[x] = find(...)` is the compression. The distractor is correct-but-uncompressed: on a long chain, every find stays O(n), and 2·10⁵ operations on a path-shaped union history will TLE.',
      },
      {
        id: 'dsu-5', type: 'bank', diff: 2,
        prompt: 'Complete unite() with union by size.',
        code: `bool unite(int a, int b) {
    a = ___(a); b = find(b);
    if (a == b) return ___;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = ___;
    sz[a] += sz[b];
    return true;
}`,
        answer: ['find', 'false', 'a'],
        distractors: ['parent', 'true', 'b'],
        explain: 'Work with ROOTS (find, not parent — one step up is not the top), report no-op merges with false (Kruskal and component counting depend on it), and after the swap, a is the bigger root, so b hangs under a.',
      },
      {
        id: 'dsu-6', type: 'mcq', diff: 2,
        prompt: 'This connectivity check is wrong. Why?',
        code: `bool same(int a, int b) {
    return parent[a] == parent[b];   // are a and b connected?
}`,
        options: [
          'parent[x] is just one step up the tree — you must compare the ROOTS: find(a) == find(b)',
          'It should compare sz[a] == sz[b]',
          'The && operator is missing',
          'Nothing is wrong — path compression guarantees parent[x] is always the root',
        ],
        answer: 0,
        explain: 'Trees can be more than one level deep, so two connected nodes may have different immediate parents. Option 4 is the seductive lie: compression only flattens paths that some find() actually walked — nodes you haven’t queried since the last merge still point mid-tree.',
      },
      {
        id: 'dsu-7', type: 'mcq', diff: 2,
        prompt: 'Kruskal pops the next-cheapest edge (u, v) and sees find(u) == find(v). What now, and why?',
        options: [
          'Skip the edge — u and v are already connected, so it would only close a cycle',
          'Take it anyway — cheap edges are always worth it',
          'Stop the algorithm — the MST must be finished',
          'Re-sort the remaining edges before continuing',
        ],
        answer: 0,
        explain: 'A tree has no cycles; an edge inside an existing clump adds cost and zero connectivity. Skipping it IS Kruskal’s entire intelligence — and the same root-comparison doubles as cycle detection any time edges are inserted incrementally.',
      },
      {
        id: 'dsu-8', type: 'order', diff: 2,
        prompt: 'Put Kruskal’s algorithm in order.',
        items: [
          'Sort all m edges by weight, cheapest first',
          'Pop the next edge (u, v, w)',
          'If find(u) == find(v), skip it — it would close a cycle',
          'Otherwise unite(u, v) and add w to the total cost',
          'At the end: fewer than n − 1 unites ⇒ print IMPOSSIBLE',
        ],
        explain: 'Sort once, then a single greedy sweep with DSU as the cycle detector, then the connectivity verdict by counting. Steps 2–4 repeat per edge; the sort is the bottleneck at O(m log m).',
      },
      {
        id: 'dsu-9', type: 'mcq', diff: 2,
        prompt: 'News Distribution: print how many users eventually hear news started by user x. This line is subtly wrong:',
        code: `cout << sz[x] << "\\n";`,
        options: [
          'sz is maintained only at roots — it must be sz[find(x)]',
          'It must be sz[x] - 1 to exclude x itself',
          'sz must be long long here',
          'Nothing is wrong — sz[x] is updated for every member on each merge',
        ],
        answer: 0,
        explain: 'Updating every member’s size on each merge would make unions O(n). Instead only the root’s entry is true, and everyone else’s is a fossil from when they WERE a root. Route the lookup through find() — `sz[find(x)]` — and it’s correct forever.',
      },
      {
        id: 'dsu-10', type: 'fill', diff: 2,
        prompt: 'A spanning tree of n connected nodes contains exactly ___ edges.',
        answer: ['n-1', 'n - 1', 'n−1'],
        placeholder: 'n …',
        explain: 'Every tree has one fewer edge than nodes: each edge merges two pieces, and you need exactly n − 1 merges to go from n singletons to one piece. That count powers Kruskal’s stopping rule and its IMPOSSIBLE check alike.',
      },
      {
        id: 'dsu-11', type: 'mcq', diff: 3,
        prompt: 'Bear and Friendship: "every friend of my friend is my friend" must hold. Valid iff every connected component is a CLIQUE. With k nodes and e edges inside a component, the check is:',
        options: [
          'e == k·(k−1)/2, computed in long long',
          'e == k − 1',
          'e ≥ k',
          'k must be even',
        ],
        answer: 0,
        explain: 'A clique on k nodes has every pair connected: k·(k−1)/2 edges. With k up to 1.5·10⁵ that product is ~10¹⁰ — int overflow turns a correct solution into WA, hence the long long. (e == k − 1 would test for a TREE — the opposite extreme.) Tally k and e per DSU root, then compare.',
        hint: 'How many pairs can you form from k members? And does that number fit in an int?',
      },
      {
        id: 'dsu-12', type: 'mcq', diff: 3,
        prompt: 'Shichikuji: every city needs power — build a station in city i for cᵢ, or wire city i to a powered city for the edge cost. How do you make this a plain MST?',
        options: [
          'Add a virtual node 0; building a station in city i becomes the edge (0, i) of cost cᵢ; run Kruskal on the n + 1 nodes',
          'Build one station in the cheapest city, then run Kruskal on the real edges only',
          'Run Dijkstra from the cheapest city',
          'Try every subset of cities as station sites and Kruskal the rest',
        ],
        answer: 0,
        explain: 'The virtual node makes both kinds of cost the same currency: edges. The MST then freely decides how many stations to build — every component that hooks onto node 0 is one station. Option 2’s single-station greedy fails whenever two distant clusters each deserve their own; option 4 is 2ⁿ.',
        hint: 'Can you invent a node such that "build a station" turns into "buy an edge"?',
      },
      {
        id: 'dsu-13', type: 'code', diff: 3,
        prompt: 'Read n, m, then m undirected edges `a b w`. Print the minimum total cost to connect all n nodes, or `IMPOSSIBLE` if it cannot be done.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int n, m;
    cin >> n >> m;
    vector<array<int, 3>> edges(m);            // {w, a, b}: weight first → sort() orders by cost
    for (auto& e : edges) cin >> e[1] >> e[2] >> e[0];
    sort(edges.begin(), edges.end());
    // DSU + Kruskal: total cost, or IMPOSSIBLE if the graph cannot be connected

    return 0;
}`,
        tests: [
          { input: '4 5\n1 2 3\n2 3 1\n3 4 2\n1 4 7\n1 3 5', expected: '6' },
          { input: '3 1\n1 2 4', expected: 'IMPOSSIBLE' },
          { input: '2 2\n1 2 9\n1 2 4', expected: '4' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

vector<int> parent, sz;

int find(int x) {
    if (parent[x] == x) return x;
    return parent[x] = find(parent[x]);    // path compression
}

bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;              // would close a cycle
    if (sz[a] < sz[b]) swap(a, b);         // union by size
    parent[b] = a;
    sz[a] += sz[b];
    return true;
}

int main() {
    int n, m;
    cin >> n >> m;
    vector<array<int, 3>> edges(m);            // {w, a, b}: weight first → sort() orders by cost
    for (auto& e : edges) cin >> e[1] >> e[2] >> e[0];
    sort(edges.begin(), edges.end());
    parent.resize(n + 1);
    iota(parent.begin(), parent.end(), 0);
    sz.assign(n + 1, 1);
    ll cost = 0;
    int used = 0;
    for (auto& e : edges) {
        if (unite(e[1], e[2])) {           // cheapest-first, skip cycle edges
            cost += e[0];
            used++;
        }
    }
    if (used == n - 1) cout << cost << "\\n";
    else cout << "IMPOSSIBLE" << "\\n";
    return 0;
}`,
        explain: 'Road Reparation in miniature: sort by weight, sweep with DSU, count successful unites. Test 1 must reject the cycle edges (costs 5 and 7); test 2 has an unreachable node — used stays at 1 < n − 1, so IMPOSSIBLE. Cost is long long out of habit: real constraints reach 2·10⁵ × 10⁹.',
        hint: 'unite() returning false IS the cycle check. How many true returns must you see for a spanning tree?',
      },
    ],
    problems: [
      { name: 'News Distribution', platform: 'Codeforces', id: '1167C', rating: 1400, url: 'https://codeforces.com/problemset/problem/1167/C', difficulty: 'easy', why: 'Pure DSU with sizes: the answer per user is sz[find(x)].' },
      { name: 'Road Reparation', platform: 'CSES', id: '1675', url: 'https://cses.fi/problemset/task/1675', difficulty: 'easy', why: 'Kruskal verbatim, plus IMPOSSIBLE when fewer than n − 1 edges unite.' },
      { name: 'Bear and Friendship Condition', platform: 'Codeforces', id: '771A', rating: 1500, url: 'https://codeforces.com/problemset/problem/771/A', difficulty: 'med', why: 'Components must be cliques: count nodes AND edges per root — in long long.' },
      { name: 'Shichikuji and Power Grid', platform: 'Codeforces', id: '1245D', rating: 1900, url: 'https://codeforces.com/problemset/problem/1245/D', difficulty: 'hard', why: 'The virtual-node trick: per-city costs become edges to node 0, then plain Kruskal.' },
    ],
  },
};

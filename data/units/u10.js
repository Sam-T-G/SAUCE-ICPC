// ============================================================================
// data/units/u10.js — Unit 10: Graphs II & Flows
// Strong connectivity (Kosaraju, condensation, 2-SAT), bridges & cut vertices
// (tin/low), and max flow (residual graphs, min cut, Dinic, matching).
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'scc': {
    id: 'scc',
    objectives: [
      'Run Kosaraju’s two passes by hand and in code, and explain why reverse finish order works',
      'Use the condensation DAG for per-component questions (one SCC? labels? cheapest node per SCC?)',
      'Translate 2-SAT clauses into implication edges and decide satisfiability via SCCs',
    ],
    theory: [
      {
        h: 'Mutual reachability: what an SCC is',
        md: 'In a **directed** graph, u and v are *strongly connected* when there’s a path u→…→v **and** a path v→…→u. A strongly connected component (SCC) is a **maximal** set of mutually reachable nodes — you can’t add one more node and keep the property. Every node lives in exactly one SCC (mutual reachability is an equivalence relation), and a directed cycle always sits inside a single SCC.\n\nRecognition cues: one-way streets, "can every city reach every other?", implications that might loop back. On undirected graphs none of this is needed — plain connected components already do the job.',
      },
      {
        h: 'Kosaraju: DFS, reverse, DFS',
        md: 'Two passes, both ordinary DFS, total **O(n + m)**:\n\n**Pass 1** — DFS the whole graph G, appending each node to a list when it *finishes* (post-order). **Pass 2** — reverse every edge, then walk the list from latest finisher to earliest; each DFS you start in the reversed graph collects exactly one SCC.',
        code: `vector<vector<int>> g(n + 1), gr(n + 1);   // G and G reversed
vector<int> order, comp(n + 1, -1);
vector<bool> vis(n + 1, false);

void dfs1(int u) {                         // pass 1: finish order on G
    vis[u] = true;
    for (int v : g[u]) if (!vis[v]) dfs1(v);
    order.push_back(u);                    // pushed when u FINISHES
}
void dfs2(int u, int c) {                  // pass 2: one whole SCC on gr
    comp[u] = c;
    for (int v : gr[u]) if (comp[v] == -1) dfs2(v, c);
}
// main:
for (int u = 1; u <= n; u++) if (!vis[u]) dfs1(u);
reverse(order.begin(), order.end());       // latest finisher first
int C = 0;
for (int u : order) if (comp[u] == -1) dfs2(u, C++);`,
      },
      {
        h: 'Why the second pass can’t escape',
        md: 'Finish times hide a theorem: if SCC A has an edge into SCC B, the latest finisher of A finishes *after* the latest finisher of B. So the node with the overall latest finish time sits in a **source** SCC of the contracted graph. Reversing all edges turns that source into a **sink**: a DFS started there can only wander inside its own SCC — every escape route now points the wrong way. Mark that component, take the next unvisited latest-finisher, repeat. Components get peeled off in topological order, one pass-2 DFS tree each.',
        note: 'Both halves matter: *finish* order (not entry order!) in pass 1, and the *reversed* graph in pass 2. Break either and you’ll merge components that aren’t strongly connected.',
        noteKind: 'warn',
      },
      {
        h: 'The condensation is always a DAG',
        md: 'Contract each SCC to one super-node and keep edges between *different* components: that’s the **condensation**. It cannot contain a cycle — a cycle through two super-nodes would make their SCCs mutually reachable, so they’d have been one SCC all along.\n\nWhy you care: hard directed-graph questions become easy DAG questions. "Is the whole graph one SCC?" (Flight Routes Check — or just BFS from node 1 in G and in G reversed). "Label every node’s component" (Planets and Kingdoms). "Secure the cheapest node in every component and count the ways" (Checkposts).',
        code: `// condensation edges: comp[u] -> comp[v] for every crossing edge
for (int u = 1; u <= n; u++)
    for (int v : g[u])
        if (comp[u] != comp[v])
            cg[comp[u]].push_back(comp[v]);   // dedupe if it matters`,
      },
      {
        h: '2-SAT: clauses become implications',
        md: 'Variables x₁…xₙ, every clause an OR of two literals. Build **2n nodes**: x and ¬x for each variable. A clause (a ∨ b) says: *if a fails, b must hold* — and symmetrically. So add **two** directed edges: ¬a→b and ¬b→a. Now logic is reachability, and the magic criterion: the formula is satisfiable **iff no variable shares an SCC with its own negation**. If x and ¬x are mutually reachable, then x forces ¬x and ¬x forces x — a contradiction with no escape.',
        code: `// literal encoding: variable i -> node 2i, ¬variable i -> node 2i+1
// neat trick: node ^ 1 flips a literal
void addClause(int a, bool notA, int b, bool notB) {
    int A = 2 * a + notA, B = 2 * b + notB;
    g[A ^ 1].push_back(B);     // ¬A → B
    g[B ^ 1].push_back(A);     // ¬B → A   (BOTH edges, always)
}`,
      },
      {
        h: 'Reading off an assignment (Giant Pizza)',
        md: 'After Kosaraju (which numbers components in topological order of the condensation), set **x = true iff comp[x] > comp[¬x]** — believe whichever literal’s component sits *later*, more downstream. Downstream is consequence-closed: everything a chosen-true literal implies lies even further downstream, so it got chosen too. Giant Pizza is exactly this with n, m up to 10⁵: 2n implication nodes, Kosaraju, compare comp[x] vs comp[¬x], print the assignment or "IMPOSSIBLE".',
        note: 'Trap: adding only ONE edge per clause. (a ∨ b) needs both ¬a→b and ¬b→a — half a graph gives wrong SCCs and confident nonsense. Also watch recursion depth at 2·10⁵ nodes.',
        noteKind: 'danger',
      },
    ],
    exercises: [
      {
        id: 'scc-1', type: 'mcq', diff: 1,
        prompt: 'Directed edges: 1→2, 2→3, 3→1, 3→4. Which set is the strongly connected component containing node 1?',
        options: [
          '{1, 2, 3} — they sit on a directed cycle; 4 has no path back',
          '{1, 2, 3, 4} — every node is reachable from 1',
          '{1} — SCCs are single nodes unless the whole graph is one cycle',
          '{1, 3} — only nodes with direct edges both ways count',
        ],
        answer: 0,
        explain: 'The cycle 1→2→3→1 makes {1,2,3} mutually reachable. Node 4 is reachable FROM the cycle but has no outgoing edge, so nothing returns — reachability must go both ways. And paths count, not just direct edges: 1 reaches 3 via 2.',
      },
      {
        id: 'scc-2', type: 'output', diff: 1,
        prompt: 'Kosaraju pass 1 on edges 1→2, 2→3, 3→1, 3→4. Each node is printed when its DFS call **finishes**. Output?',
        code: `vector<vector<int>> g = {{}, {2}, {3}, {1, 4}, {}};
bool vis[5];
void dfs(int u) {
    vis[u] = true;
    for (int v : g[u]) if (!vis[v]) dfs(v);
    cout << u << " ";              // print on FINISH
}
int main() {
    for (int u = 1; u <= 4; u++)
        if (!vis[u]) dfs(u);
}`,
        answer: '4 3 2 1',
        explain: 'dfs(1) dives 1→2→3; at 3, node 1 is visited so it descends to 4, which finishes first. Then 3, 2, 1 finish on the way back up. Reverse finish order is 1 2 3 4 — pass 2 starts at 1 and (on the reversed graph) collects exactly the SCC {1,2,3}.',
      },
      {
        id: 'scc-3', type: 'fill', diff: 1,
        prompt: 'Directed edges on 5 nodes: 1→2, 2→1, 2→3, 3→4, 4→3, 4→5. How many SCCs does the graph have?',
        answer: '3',
        explain: '{1,2} (two-cycle), {3,4} (two-cycle), and {5} alone — node 5 has an incoming edge but no way back. Singletons are SCCs too; counting them is the habit that makes condensation diagrams quick to draw.',
      },
      {
        id: 'scc-4', type: 'order', diff: 2,
        prompt: 'Put Kosaraju’s steps in order.',
        items: [
          'Pass 1: DFS on G, pushing each node onto a list when it finishes',
          'Reverse every edge to obtain the reversed graph',
          'Take nodes from the list in reverse finish order (latest finisher first)',
          'Pass 2: DFS each still-unlabeled node in the reversed graph — each DFS tree is one SCC',
        ],
        explain: 'Finish times must exist before you can walk them, and pass 2 must run on the reversed graph — the latest finisher lies in a source SCC, which reversal turns into a sink the DFS can’t escape.',
      },
      {
        id: 'scc-5', type: 'mcq', diff: 2,
        prompt: 'Contract every SCC to a single super-node (the condensation). Why is the result guaranteed to be a DAG?',
        options: [
          'A cycle through two super-nodes would make their SCCs mutually reachable — they’d have been ONE SCC, contradicting maximality',
          'Because DFS visits each node exactly once',
          'It isn’t guaranteed — the condensation keeps any cycles the original graph had',
          'Because the condensation always has fewer edges than nodes',
        ],
        answer: 0,
        explain: 'Maximality is the whole argument: a directed cycle through components A and B gives paths A→B and B→A, so every node of A and B is mutually reachable — one component, not two. That’s why "condense, then solve on the DAG" is always available.',
      },
      {
        id: 'scc-6', type: 'mcq', diff: 2,
        prompt: 'Flight Routes Check (n ≤ 10⁵, m ≤ 2·10⁵): decide whether every city can reach every other city. Which check is correct?',
        options: [
          'BFS from node 1 reaches all nodes in G, AND BFS from node 1 reaches all nodes in G reversed',
          'BFS from node 1 reaches all nodes in G',
          'The graph is connected when you ignore edge directions',
          'Every node has at least one incoming and one outgoing edge',
        ],
        answer: 0,
        explain: 'Reaching everyone in G reversed means *everyone reaches node 1* in G. Then any pair routes a→1→b, so the graph is one SCC. Outgoing reachability alone (option 2) misses nodes that can’t get back; the others are necessary but nowhere near sufficient.',
      },
      {
        id: 'scc-7', type: 'fill', diff: 2,
        prompt: 'Checkposts mini: the SCCs are {1,2}, {3,4,5}, {6} and securing node i costs c = [3, 1, 2, 2, 5, 4] (cᵢ for node i). You must secure one node in **every** SCC at minimum total cost. Answer as `cost ways` — minimum total cost, then the number of cheapest ways (product over SCCs of how many nodes hit the minimum).',
        answer: ['7 2'],
        placeholder: 'cost ways',
        explain: 'Per SCC: min(3,1)=1 one way; min(2,2,5)=2 two ways; min(4)=4 one way. Cost 1+2+4=7, ways 1·2·1=2. Checkposts is exactly this aggregation (mod 10⁹+7) — the SCC labeling does the hard part, then it’s bookkeeping per component.',
      },
      {
        id: 'scc-8', type: 'match', diff: 2,
        prompt: 'Match each 2-SAT clause to the two implication edges it adds.',
        pairs: [
          ['(x ∨ y)', '¬x→y and ¬y→x'],
          ['(x ∨ ¬y)', '¬x→¬y and y→x'],
          ['(¬x ∨ y)', 'x→y and ¬y→¬x'],
          ['(¬x ∨ ¬y)', 'x→¬y and y→¬x'],
        ],
        explain: 'Mechanically: (a ∨ b) becomes ¬a→b and ¬b→a — "if one literal fails, the other must hold". Negate one side, point at the other, then do it the other way around. Both edges, every clause.',
      },
      {
        id: 'scc-9', type: 'tf', diff: 2,
        statement: 'A 2-SAT formula is satisfiable if and only if no variable x ends up in the same SCC as its negation ¬x.',
        answer: true,
        explain: 'x and ¬x in one SCC means x ⇒ ¬x and ¬x ⇒ x — whichever value you pick refutes itself. And when every x is separated from ¬x, picking each literal whose component is later in topological order is always consistent. This single check is the entire satisfiability test.',
      },
      {
        id: 'scc-10', type: 'bank', diff: 2,
        prompt: 'Complete Kosaraju (graph `g`, reversed copy `gr`).',
        code: `void dfs1(int u) {                      // pass 1, on g
    vis[u] = true;
    for (int v : g[u]) if (!vis[v]) dfs1(v);
    order.___(u);                       // record FINISH order
}
void dfs2(int u, int c) {               // pass 2: collects one SCC
    comp[u] = c;
    for (int v : ___[u]) if (comp[v] == -1) dfs2(v, c);
}
int main() {
    for (int u = 1; u <= n; u++) if (!vis[u]) dfs1(u);
    ___(order.begin(), order.end());    // latest finisher first
    int c = 0;
    for (int u : order)
        if (comp[u] == ___) dfs2(u, c++);
}`,
        answer: ['push_back', 'gr', 'reverse', '-1'],
        distractors: ['g', 'sort'],
        explain: 'Push on finish (post-order), run pass 2 on the REVERSED graph `gr`, and reverse the list — don’t sort it, the finish order IS the information. Running dfs2 on `g` instead of `gr` is the classic slip: it happily collects everything reachable, merging SCCs.',
      },
      {
        id: 'scc-11', type: 'mcq', diff: 3,
        prompt: 'This Kosaraju sometimes reports two nodes as one SCC when they aren’t mutually reachable. The bug?',
        code: `void dfs1(int u) {
    vis[u] = true;
    order.push_back(u);            // record the node
    for (int v : g[u]) if (!vis[v]) dfs1(v);
}`,
        options: [
          'order records nodes on ENTRY — Kosaraju needs finish times; move push_back after the neighbor loop',
          'dfs1 must run on the reversed graph, not on g',
          'vis[] has to be reset before every dfs1 call',
          'order must be sorted by node number before pass 2',
        ],
        answer: 0,
        explain: 'Entry order breaks the source-SCC guarantee. Tiny counterexample: edges 1→2, 3→1, 3→2. Entry order from 1 gives [1,2,3]; processing 3 then 2 on the reversed graph lumps {1,2} together — but 1 and 2 are not mutually reachable. Post-order (push after the loop) fixes it.',
        hint: 'When does the node get recorded relative to its descendants finishing?',
      },
      {
        id: 'scc-12', type: 'mcq', diff: 3,
        prompt: 'Clauses: (x ∨ y), (x ∨ ¬y), (¬x ∨ y), (¬x ∨ ¬y). Build the implication graph in your head. Satisfiable?',
        options: [
          'No — chasing the implications puts x and ¬x (and y and ¬y) in the same SCC',
          'Yes — x = true, y = true satisfies all four',
          'Yes — x = false, y = true satisfies all four',
          'Cannot be decided without knowing the clause order',
        ],
        answer: 0,
        explain: 'The four clauses kill all four assignments: (¬x ∨ ¬y) rejects (T,T), (x ∨ ¬y) rejects (F,T), and so on. In graph terms the edges chain x→y (from ¬x∨y), y→x (from x∨¬y), x→¬y, ¬y→x… until x↔¬x. Clause order never matters — the graph is the same set of edges.',
        hint: 'Test the proposed assignments against EVERY clause — (T,T) already fails one.',
      },
      {
        id: 'scc-13', type: 'code', diff: 3,
        prompt: 'Count the SCCs. Input: `n m`, then m directed edges `a b`. Output: the number of strongly connected components (n ≤ 1000).',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1), gr(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        gr[b].push_back(a);        // reversed copy, ready for pass 2
    }
    // your Kosaraju here

    return 0;
}`,
        tests: [
          { input: '4 4\n1 2\n2 1\n2 3\n3 4', expected: '3' },
          { input: '3 3\n1 2\n2 3\n3 1', expected: '1' },
          { input: '5 5\n1 2\n2 3\n3 1\n3 4\n5 4', expected: '3' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1), gr(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        gr[b].push_back(a);
    }
    vector<bool> vis(n + 1, false);
    vector<int> order, comp(n + 1, -1);
    function<void(int)> dfs1 = [&](int u) {
        vis[u] = true;
        for (int v : g[u]) if (!vis[v]) dfs1(v);
        order.push_back(u);                 // finish order
    };
    function<void(int, int)> dfs2 = [&](int u, int c) {
        comp[u] = c;
        for (int v : gr[u]) if (comp[v] == -1) dfs2(v, c);
    };
    for (int u = 1; u <= n; u++) if (!vis[u]) dfs1(u);
    reverse(order.begin(), order.end());    // latest finisher first
    int c = 0;
    for (int u : order) if (comp[u] == -1) dfs2(u, c++);
    cout << c << "\\n";
    return 0;
}`,
        explain: 'Pass 1 on g records finish order; pass 2 walks it backwards on gr, and each dfs2 call labels exactly one component — so counting calls counts SCCs. Swap either ingredient (entry order, or running pass 2 on g) and test 1 merges components.',
        hint: 'Pass 1: push u AFTER the neighbor loop. Pass 2: iterate the reversed order, dfs2 on gr only where comp is still -1.',
      },
    ],
    problems: [
      { name: 'Flight Routes Check', platform: 'CSES', id: '1682', url: 'https://cses.fi/problemset/task/1682', difficulty: 'easy', why: 'Is the whole graph one SCC? Two BFS from node 1 — on G and on G reversed — settle it without full Kosaraju.' },
      { name: 'Planets and Kingdoms', platform: 'CSES', id: '1683', url: 'https://cses.fi/problemset/task/1683', difficulty: 'med', why: 'Full Kosaraju: label every node with its component id and print the labels.' },
      { name: 'Checkposts', platform: 'Codeforces', id: '427C', rating: 1700, url: 'https://codeforces.com/problemset/problem/427/C', difficulty: 'med', why: 'Per-SCC aggregation: min cost in each component × count of minima, answer mod 10⁹+7. Mind the long long.' },
      { name: 'Giant Pizza', platform: 'CSES', id: '1684', url: 'https://cses.fi/problemset/task/1684', difficulty: 'hard', why: 'Full 2-SAT: 2n implication nodes, SCCs, x vs ¬x check, assignment by topological order.' },
    ],
  },
  // ==========================================================================
  'bridges': {
    id: 'bridges',
    objectives: [
      'Compute tin[] and low[] on a DFS tree by hand and in one O(n+m) DFS',
      'Apply the bridge test low[v] > tin[u] and the articulation test low[v] ≥ tin[u] — and explain the one-character difference',
      'Handle the root special case and parallel edges without false positives',
    ],
    theory: [
      {
        h: 'Single points of failure',
        md: 'In an **undirected** graph, a **bridge** is an edge whose removal disconnects its component; an **articulation point** (cut vertex) is a vertex whose removal does the same. They’re the brittle parts of a network: the only road into a region, the server everything routes through.\n\nRecognition cues: "necessary road/city", "how many connections are critical?", "does the network survive one failure?". Naive answer: delete each edge/vertex and re-run DFS — O(m·(n+m)), dead at 10⁵. One clever DFS finds them all in **O(n + m)**.',
      },
      {
        h: 'The DFS tree: tree edges and back edges',
        md: 'DFS a connected undirected graph and every edge becomes one of exactly two kinds: a **tree edge** (led to a new node) or a **back edge** (leads from a node to one of its DFS *ancestors*). Undirected DFS produces no cross edges — when you touch an already-visited node, it is always above you on the current root path.\n\nThat makes cycles visible: each back edge closes one loop. A tree edge u−v is a bridge **unless** some back edge "jumps over" it, connecting v’s subtree to u or higher.',
      },
      {
        h: 'tin and low: how high can the subtree climb?',
        md: '`tin[u]` — the timestamp when DFS first reaches u. `low[u]` — the smallest tin reachable from u’s subtree using tree edges downward plus **at most one back edge**. Children lift their parent (`low[u] = min(low[u], low[v])`), and back edges lift directly (`min(low[u], tin[v])`).',
        code: `int timer = 1;
void dfs(int u, int parentEdge) {
    tin[u] = low[u] = timer++;
    for (auto [v, id] : g[u]) {            // (neighbor, edge id)
        if (id == parentEdge) continue;    // skip the edge we came by
        if (tin[v]) {                      // visited: a back edge
            low[u] = min(low[u], tin[v]);  // climb via ONE back edge
        } else {                           // tree edge
            dfs(v, id);
            low[u] = min(low[u], low[v]);  // child's reach lifts u too
            if (low[v] > tin[u]) { /* u-v is a bridge */ }
        }
    }
}`,
      },
      {
        h: 'The two conditions: > for bridges, ≥ for cut vertices',
        md: 'Tree edge u−v (v the child): **bridge iff low[v] > tin[u]** — nothing in v’s subtree climbs to u or above, so the edge is the only way up. Non-root u: **articulation iff some child v has low[v] ≥ tin[u]** — v’s subtree can’t climb strictly above u, so every route out passes through u.\n\nThe one character is a war story: a back edge landing exactly **on u** creates a cycle through edge u−v (the edge is safe) — but every path from v’s subtree still goes *through the vertex u* (the vertex is not safe).',
        code: `if (low[v] >  tin[u]) bridge(u, v);        // strict: edge test
if (low[v] >= tin[u] && u != root) cut[u] = true;  // vertex test
// the root is special:
if (u == root && dfsChildren >= 2) cut[u] = true;`,
        note: 'Root special case: tin[root] is the minimum, so low[v] ≥ tin[root] holds for EVERY child — the ≥ test would flag every root with a child. The real criterion: the root cuts iff it has ≥2 DFS-tree children (subtrees that only meet at the root).',
        noteKind: 'warn',
      },
      {
        h: 'Trap kit: parallel edges and the back-edge value',
        md: 'Two traps cause most WAs here.\n\n**1. Parallel edges.** Skipping "the parent vertex" (`if (v == p) continue;`) silently ignores a *second* edge between the same pair — but a doubled edge is a cycle, so neither copy is a bridge. Track the **edge id** you arrived by and skip only that id.\n\n**2. Back-edge value.** On a back edge use `tin[v]`, not `low[v]`: low[v] of an unfinished ancestor can already contain reach that travels through the very edge you’re testing, wrongly "saving" it. One DFS, O(n+m), works per component — loop over all start nodes if the graph may be disconnected.',
      },
    ],
    exercises: [
      {
        id: 'br-1', type: 'mcq', diff: 1,
        prompt: 'A tree has n nodes and n−1 edges. How many of its edges are bridges?',
        options: [
          'All n−1 — no cycles means no back edge ever saves an edge',
          'None — trees are connected',
          'Only the edges touching a leaf',
          'Exactly ⌈n/2⌉',
        ],
        answer: 0,
        explain: 'A bridge is exactly an edge on no cycle. Trees are acyclic, so removing ANY edge disconnects them — every edge is a bridge, and every internal (non-leaf) vertex is an articulation point. Cycles are what create redundancy.',
      },
      {
        id: 'br-2', type: 'fill', diff: 1,
        prompt: 'Undirected edges: 1−2, 2−3, 3−1, 3−4. How many bridges?',
        answer: '1',
        explain: 'The triangle 1−2−3 is a cycle: remove any one of its edges and the other two still connect everything. Only 3−4 disconnects node 4 — one bridge. Cycle edges are never bridges.',
      },
      {
        id: 'br-3', type: 'output', diff: 2,
        prompt: 'Discovery times. Undirected edges 1−2, 1−3, 3−4, adjacency lists in the order shown. What does this print?',
        code: `vector<vector<int>> g = {{}, {3, 2}, {1}, {1, 4}, {3}};
int tin[5], timer = 1;
bool vis[5];
void dfs(int u) {
    vis[u] = true;
    tin[u] = timer++;
    for (int v : g[u]) if (!vis[v]) dfs(v);
}
int main() {
    dfs(1);
    for (int u = 1; u <= 4; u++) cout << tin[u] << " ";
}`,
        answer: '1 4 2 3',
        explain: 'DFS from 1 takes g[1] in order: 3 first (tin=2), then 3 descends to 4 (tin=3), and only afterwards does 1 reach 2 (tin=4). tin follows *visit order*, not node numbering — printing tin[1..4] gives 1 4 2 3.',
        hint: 'g[1] = {3, 2}: which neighbor does DFS enter first?',
      },
      {
        id: 'br-4', type: 'fill', diff: 2,
        prompt: 'Undirected edges: 1−2, 2−3, 3−1, 3−4. DFS from 1 visits neighbors in increasing order, so the DFS tree is 1→2→3→4 with tin = [1, 2, 3, 4] and one back edge 3→1. Give `low[4] low[3]` (two numbers).',
        answer: ['4 1'],
        placeholder: 'low4 low3',
        explain: 'Node 4’s subtree has no back edges: low[4] = tin[4] = 4. Node 3 owns the back edge to 1, so low[3] = min(tin[3]=3, tin[1]=1, low[4]=4) = 1 — its subtree climbs all the way to the root. low literally answers "how high can I get without my parent edge?".',
        hint: 'low = min of: own tin, tin of back-edge targets, low of children.',
      },
      {
        id: 'br-5', type: 'mcq', diff: 2,
        prompt: 'Same graph and DFS as above: tin = [1, 2, 3, 4], low = [1, 1, 1, 4], tree edges 1−2, 2−3, 3−4. Which tree edges are bridges?',
        options: [
          'Only 3−4: low[4] = 4 > tin[3] = 3 — nothing in 4’s subtree climbs above 3',
          '3−4 and 2−3',
          'All three tree edges',
          'None — the graph contains a cycle',
        ],
        answer: 0,
        explain: 'Apply low[v] > tin[u] per tree edge: 1−2 fails (low[2]=1 ≤ 1), 2−3 fails (low[3]=1 ≤ 2) — the back edge 3→1 jumps over both. 3−4 passes (4 > 3): a bridge. One cycle doesn’t pardon the whole graph, only the edges it covers.',
      },
      {
        id: 'br-6', type: 'match', diff: 1,
        prompt: 'Match each term to its meaning.',
        pairs: [
          ['bridge', 'edge whose removal splits its component'],
          ['articulation point', 'vertex whose removal splits its component'],
          ['back edge', 'edge from a node up to one of its DFS ancestors'],
          ['tin[u]', 'timestamp when DFS first reaches u'],
          ['low[u]', 'smallest tin reachable from the subtree via ≤1 back edge'],
        ],
        explain: 'The vocabulary of the whole lesson. tin is *when you arrived*; low is *how high you can escape* — bridges and cut vertices fall out of comparing the two.',
      },
      {
        id: 'br-7', type: 'bank', diff: 2,
        prompt: 'Complete the bridge-counting DFS.',
        code: `void dfs(int u, int parentEdge) {
    tin[u] = low[u] = timer++;
    for (auto [v, id] : g[u]) {
        if (id == parentEdge) continue;
        if (tin[v]) {
            low[u] = min(low[u], ___[v]);   // back edge
        } else {
            dfs(v, id);
            low[u] = min(low[u], ___[v]);   // tree edge
            if (low[v] ___ tin[u]) bridgeCount++;
        }
    }
}`,
        answer: ['tin', 'low', '>'],
        distractors: ['>=', '<'],
        explain: 'Back edges contribute tin[v] (one hop up — using low of an unfinished ancestor can smuggle reach through the edge under test); children contribute their full low[v]. And the bridge test is STRICT >: with ≥ you’d also flag edges saved by a back edge landing exactly on u.',
      },
      {
        id: 'br-8', type: 'mcq', diff: 2,
        prompt: 'Tree edge u−v (v the child). A back edge runs from somewhere in v’s subtree to u itself. Why is u−v not a bridge?',
        options: [
          'Removing u−v still leaves a route: down inside v’s subtree to the back edge, then up to u — the edge lies on a cycle',
          'It only escapes bridgehood if the back edge goes strictly ABOVE u',
          'Back edges make the whole component 2-edge-connected',
          'Because DFS would have used the back edge as a tree edge instead',
        ],
        answer: 0,
        explain: 'The back edge closes a cycle through u−v, so the edge has a detour — that’s low[v] = tin[u], and the strict > test correctly stays quiet. Option 2 is the bridge/articulation mix-up: landing exactly on u saves the EDGE but not the VERTEX u (that’s where ≥ applies).',
      },
      {
        id: 'br-9', type: 'mcq', diff: 2,
        prompt: 'This bridge finder reports edges that are NOT bridges (e.g. both edges of a path 1−2−3 plus back edge 3−1... it flags 1−2). The bug?',
        code: `dfs(v, u);
low[u] = min(low[u], low[v]);
if (low[v] >= tin[u])
    bridges.push_back({u, v});`,
        options: [
          'The condition must be low[v] > tin[u] — the ≥ version is the articulation-point test, not the bridge test',
          'low[u] should be min(low[u], tin[v]) after a tree edge',
          'bridges must be recorded before the recursive call',
          'tin[u] should be low[u] on the right-hand side',
        ],
        answer: 0,
        explain: 'low[v] == tin[u] means v’s subtree climbs back exactly to u: a cycle through edge u−v exists, so the edge is safe — but ≥ flags it anyway. One character separates "the edge is critical" (>) from "the vertex is critical" (≥). Spot it in review, not after WA #3.',
        hint: 'What does low[v] EQUAL to tin[u] mean geometrically?',
      },
      {
        id: 'br-10', type: 'tf', diff: 2,
        statement: 'In the DFS-tree articulation test, the root is an articulation point exactly when it has two or more children in the DFS tree — the low/tin comparison is not used for it.',
        answer: true,
        explain: 'tin[root] is the global minimum, so low[v] ≥ tin[root] is true for every child — the ≥ test would flag every root with at least one child. The honest criterion: ≥2 DFS children, i.e. subtrees whose only meeting point is the root. Forgetting this gives false cut vertices on every test with a cycle through node 1.',
      },
      {
        id: 'br-11', type: 'fill', diff: 2,
        prompt: 'Path graph: 1−2−3−4. Which nodes are articulation points? Answer in increasing order, space-separated.',
        answer: ['2 3'],
        placeholder: 'e.g. 1 4',
        explain: 'Removing 2 strands node 1; removing 3 strands node 4. The endpoints cut nothing — removing a leaf leaves the rest connected. General fact: in a tree, every internal vertex is an articulation point, no leaf is.',
      },
      {
        id: 'br-12', type: 'mcq', diff: 3,
        prompt: 'Necessary Roads, but the input may contain TWO roads between the same pair of cities. Your DFS skips the parent by vertex: `if (v == p) continue;`. What goes wrong?',
        options: [
          'Both copies of the parallel edge get skipped, so the cycle they form is invisible — the doubled edge is falsely reported as a bridge',
          'Nothing — parallel edges are impossible in undirected graphs',
          'The DFS recurses forever between the two copies',
          'low[] values become negative',
        ],
        answer: 0,
        explain: 'A doubled edge u−v is a 2-cycle: removing one copy leaves the other, so neither is a bridge. But vertex-based skipping treats the second copy as "the parent" too and ignores it. Fix: store edge ids and skip only the id you arrived by — then the twin acts as a back edge and correctly drags low[v] down to tin[u].',
        hint: 'How many of v’s adjacency entries equal p when the edge is doubled?',
      },
      {
        id: 'br-13', type: 'code', diff: 3,
        prompt: 'Count the bridges. Input: `n m`, then m undirected edges (parallel edges possible!). Output: the number of bridges. n, m ≤ 1000.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,int>>> g(n + 1);   // (neighbor, edge id)
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back({b, i});
        g[b].push_back({a, i});
    }
    // tin/low DFS here — skip by edge id, count low[v] > tin[u]

    return 0;
}`,
        tests: [
          { input: '4 4\n1 2\n2 3\n3 1\n3 4', expected: '1' },
          { input: '5 4\n1 2\n2 3\n3 4\n4 5', expected: '4' },
          { input: '4 5\n1 2\n2 3\n3 1\n3 4\n3 4', expected: '0' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,int>>> g(n + 1);
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        g[a].push_back({b, i});
        g[b].push_back({a, i});
    }
    vector<int> tin(n + 1, 0), low(n + 1, 0);
    int timer = 1, bridges = 0;
    function<void(int, int)> dfs = [&](int u, int pe) {
        tin[u] = low[u] = timer++;
        for (auto [v, id] : g[u]) {
            if (id == pe) continue;            // skip the EDGE, not the vertex
            if (tin[v]) {
                low[u] = min(low[u], tin[v]);  // back edge
            } else {
                dfs(v, id);
                low[u] = min(low[u], low[v]);
                if (low[v] > tin[u]) bridges++;   // strict!
            }
        }
    };
    for (int u = 1; u <= n; u++)
        if (!tin[u]) dfs(u, -1);               // graph may be disconnected
    cout << bridges << "\\n";
    return 0;
}`,
        explain: 'Edge-id skipping is what makes test 3 pass: the doubled road 3−4 is a cycle, zero bridges. Vertex-based parent skipping reports 1 there. The other essentials: strict > (test 1 has a back edge landing on the cycle), and starting DFS from every unvisited node.',
        hint: 'Test 3 has the road 3−4 twice. What must your parent check do with the second copy?',
      },
    ],
    problems: [
      { name: 'Necessary Roads', platform: 'CSES', id: '2076', url: 'https://cses.fi/problemset/task/2076', difficulty: 'med', why: 'Bridges verbatim: low[v] > tin[u] — and the input can hide parallel roads, so skip by edge id.' },
      { name: 'Necessary Cities', platform: 'CSES', id: '2077', url: 'https://cses.fi/problemset/task/2077', difficulty: 'med', why: 'Articulation points: the ≥ test plus the root-needs-two-children special case.' },
    ],
  },
  // __APPEND_FLOWS__
};

// ============================================================================
// curriculum.js — the SAUCE Academy syllabus (metadata only; content lives in
// data/units/uXX.js and is lazy-loaded).
//
// Ordering synthesizes: Competitive Programmer's Handbook (Laaksonen),
// USACO Guide Bronze→Platinum progression, and CSES Problem Set categories.
// A single linear path (Duolingo 2022 redesign rationale): each node is the
// next thing to do; review is scheduled, not optional.
// ============================================================================

export const UNITS = [
  {
    id: 'u01',
    title: 'C++ Bootcamp',
    tagline: 'The language layer: I/O, types, loops, functions — contest dialect.',
    icon: '🚀',
    color: '#58cc02',
    skills: [
      { id: 'cpp-hello',     title: 'Hello, Contest!',      icon: '👋', blurb: 'main(), cin/cout, fast I/O, and the shape of every solution.' },
      { id: 'cpp-types',     title: 'Types & Overflow',     icon: '🧮', blurb: 'int vs long long, overflow traps, doubles, and casting.' },
      { id: 'cpp-control',   title: 'Control Flow',         icon: '🔁', blurb: 'if/else, loops, nested loops, break/continue.' },
      { id: 'cpp-functions', title: 'Functions & Recursion',icon: '🪆', blurb: 'Pass by reference, return values, and first recursion.' },
      { id: 'cpp-vectors',   title: 'Arrays & Vectors',     icon: '📦', blurb: 'vector<int>, indexing, iteration, 2D grids.' },
      { id: 'cpp-strings',   title: 'Strings',              icon: '🔤', blurb: 'std::string, characters, building and slicing text.' },
    ],
  },
  {
    id: 'u02',
    title: 'STL & Complexity',
    tagline: 'Your toolbox — and the clock it runs against.',
    icon: '🧰',
    color: '#21c0e8',
    skills: [
      { id: 'big-o',          title: 'Big-O & Constraints', icon: '⏱️', blurb: 'Read n ≤ 2·10⁵ and know which algorithms can pass.' },
      { id: 'stl-sort',       title: 'Sorting & Comparators', icon: '🗂️', blurb: 'sort(), custom comparators, stable ordering, pairs.' },
      { id: 'stl-set-map',    title: 'Sets & Maps',         icon: '🗺️', blurb: 'set, map, unordered variants — and their costs.' },
      { id: 'stl-stack-queue',title: 'Stacks, Queues & Heaps', icon: '🥞', blurb: 'stack, queue, deque, priority_queue patterns.' },
      { id: 'stl-toolbox',    title: 'STL Power Tools',     icon: '⚡', blurb: 'lower_bound, unique, lambdas, iterators, tricks.' },
    ],
  },
  {
    id: 'u03',
    title: 'Core Patterns',
    tagline: 'The seven moves that solve half of every contest.',
    icon: '🧠',
    color: '#4f7dff',
    skills: [
      { id: 'brute-force',   title: 'Brute Force & Simulation', icon: '🔨', blurb: 'Try everything — correctly, and know when you can.' },
      { id: 'greedy',        title: 'Greedy',               icon: '🤑', blurb: 'Local choices, global optimum — and proving it.' },
      { id: 'two-pointers',  title: 'Two Pointers',         icon: '🤏', blurb: 'Squeeze O(n²) scans into O(n).' },
      { id: 'sliding-window',title: 'Sliding Window',       icon: '🪟', blurb: 'Maintain a moving range and its statistics.' },
      { id: 'prefix-sums',   title: 'Prefix Sums',          icon: '➕', blurb: 'Answer range-sum queries in O(1), 1D and 2D.' },
      { id: 'binary-search', title: 'Binary Search',        icon: '🎯', blurb: 'On arrays — and on the answer itself.' },
    ],
  },
  {
    id: 'u04',
    title: 'Math & Counting',
    tagline: 'Number theory, combinatorics, and exhaustive search.',
    icon: '🔢',
    color: '#a06bff',
    skills: [
      { id: 'bitops',        title: 'Bit Manipulation',     icon: '💡', blurb: 'AND/OR/XOR, shifts, subsets as bitmasks.' },
      { id: 'modular',       title: 'Modular Arithmetic',   icon: '🌀', blurb: 'mod 1e9+7, fast power, modular inverse.' },
      { id: 'primes-gcd',    title: 'Primes & GCD',         icon: '🧱', blurb: 'Sieve, factorization, gcd/lcm, divisors.' },
      { id: 'combinatorics', title: 'Combinatorics',        icon: '🎲', blurb: 'nCr, factorials, stars and bars, pigeonhole.' },
      { id: 'backtracking',  title: 'Backtracking',         icon: '🌿', blurb: 'Generate permutations & subsets, prune dead ends.' },
    ],
  },
  {
    id: 'u05',
    title: 'Graphs I',
    tagline: 'Model anything as nodes and edges, then traverse.',
    icon: '🕸️',
    color: '#00cfa8',
    skills: [
      { id: 'graph-bfs',     title: 'Graphs & BFS',         icon: '🌊', blurb: 'Adjacency lists, grids, shortest unweighted paths.' },
      { id: 'dfs-components',title: 'DFS & Components',     icon: '🕳️', blurb: 'Connectivity, cycle detection, bipartite check.' },
      { id: 'dijkstra',      title: 'Dijkstra & 0-1 BFS',   icon: '🛰️', blurb: 'Weighted shortest paths with a priority queue.' },
      { id: 'toposort',      title: 'Topological Sort',     icon: '📋', blurb: 'Order DAGs, detect cycles, DP over orderings.' },
      { id: 'dsu-mst',       title: 'DSU & MST',            icon: '🔗', blurb: 'Union-Find, then Kruskal’s spanning trees.' },
    ],
  },
  {
    id: 'u06',
    title: 'Dynamic Programming',
    tagline: 'Define the state. Trust the recurrence.',
    icon: '🧩',
    color: '#ffaa00',
    skills: [
      { id: 'dp-foundations',title: 'DP Foundations',       icon: '🪜', blurb: 'States, transitions, memoization vs tabulation.' },
      { id: 'dp-grid',       title: 'Grid & Path DP',       icon: '🗺️', blurb: 'Count and optimize paths through grids.' },
      { id: 'dp-knapsack',   title: 'Knapsack',             icon: '🎒', blurb: '0/1 and unbounded; subset sums; money sums.' },
      { id: 'dp-sequences',  title: 'LIS & Sequence DP',    icon: '📈', blurb: 'Longest increasing subsequence, edit distance.' },
      { id: 'dp-intervals',  title: 'Interval & Game DP',   icon: '✂️', blurb: 'DP over ranges; removal games; optimal play.' },
      { id: 'dp-bitmask',    title: 'Bitmask DP',           icon: '🎭', blurb: 'DP over subsets: TSP, assignment, Hamiltonian paths.' },
    ],
  },
  {
    id: 'u07',
    title: 'Trees',
    tagline: 'n−1 edges, no cycles, infinite tricks.',
    icon: '🌲',
    color: '#b5e61d',
    skills: [
      { id: 'tree-basics',   title: 'Tree Traversal & Diameter', icon: '🌿', blurb: 'Rooting, subtree sizes, two-pass diameter.' },
      { id: 'tree-dp',       title: 'Tree DP',              icon: '🍂', blurb: 'DP over subtrees: matching, distances, rerooting.' },
      { id: 'lca',           title: 'LCA & Binary Lifting', icon: '🧗', blurb: 'k-th ancestor and lowest common ancestor in O(log n).' },
    ],
  },
  {
    id: 'u08',
    title: 'Range Queries',
    tagline: 'Answer questions about intervals — fast, with updates.',
    icon: '📊',
    color: '#ff7a1a',
    skills: [
      { id: 'fenwick',       title: 'Fenwick Tree (BIT)',   icon: '🪙', blurb: 'Prefix sums with point updates in O(log n).' },
      { id: 'segment-tree',  title: 'Segment Tree',         icon: '🌳', blurb: 'Range min/sum/max with point updates.' },
      { id: 'lazy-segtree',  title: 'Lazy Propagation',     icon: '😴', blurb: 'Range updates AND range queries together.' },
      { id: 'sparse-misc',   title: 'Sparse Tables & Friends', icon: '🧊', blurb: 'Static RMQ, coordinate compression, offline tricks.' },
    ],
  },
  {
    id: 'u09',
    title: 'Strings',
    tagline: 'Pattern matching beyond find().',
    icon: '🔤',
    color: '#f062c0',
    skills: [
      { id: 'string-hashing',title: 'String Hashing',       icon: '#️⃣', blurb: 'Polynomial hashes: compare substrings in O(1).' },
      { id: 'kmp-z',         title: 'KMP & Z-Function',     icon: '🧵', blurb: 'Prefix function, borders, periods, matching.' },
      { id: 'tries',         title: 'Tries',                icon: '🌴', blurb: 'Prefix trees for words and XOR problems.' },
    ],
  },
  {
    id: 'u10',
    title: 'Graphs II & Flows',
    tagline: 'Strong connectivity, cut points, and pushing flow.',
    icon: '🌐',
    color: '#ff5a3c',
    skills: [
      { id: 'scc',           title: 'SCC & 2-SAT',          icon: '🌀', blurb: 'Strongly connected components, condensation, 2-SAT.' },
      { id: 'bridges',       title: 'Bridges & Cut Vertices', icon: '🌉', blurb: 'Find the edges and nodes whose removal disconnects.' },
      { id: 'flows',         title: 'Max Flow & Matching',  icon: '🚰', blurb: 'Dinic’s algorithm, min cut, bipartite matching.' },
    ],
  },
  {
    id: 'u11',
    title: 'Math II & Geometry',
    tagline: 'Expected value, winning positions, and cross products.',
    icon: '📐',
    color: '#ff6286',
    skills: [
      { id: 'probability',   title: 'Probability & EV',     icon: '🎰', blurb: 'Expected value, linearity, probability DP.' },
      { id: 'game-theory',   title: 'Game Theory',          icon: '♟️', blurb: 'Nim, Grundy numbers, winning/losing states.' },
      { id: 'geometry',      title: 'Geometry Basics',      icon: '📐', blurb: 'Cross products, orientation, segment intersection.' },
      { id: 'convex-hull',   title: 'Convex Hull & Sweep',  icon: '🥗', blurb: 'Andrew’s monotone chain; sweep line thinking.' },
    ],
  },
  {
    id: 'u12',
    title: 'Contest Craft',
    tagline: 'The meta-game: strategy, debugging, and team play.',
    icon: '🏆',
    color: '#ffc800',
    skills: [
      { id: 'constraints',   title: 'Constraint Forensics', icon: '🔍', blurb: 'Deduce the intended algorithm from n and the time limit.' },
      { id: 'debugging',     title: 'Debugging & Stress Tests', icon: '🐛', blurb: 'Find your bug in minutes, not hours.' },
      { id: 'team-strategy', title: 'Team Strategy',        icon: '🤝', blurb: '3 brains, 1 keyboard: roles, penalties, the notebook.' },
      { id: 'contest-sim',   title: 'Contest Protocol',     icon: '⏰', blurb: 'Virtual contests, upsolving, and reading the scoreboard.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Derived indexes
// ---------------------------------------------------------------------------

/** skillId → { ...skillMeta, unitId, unitColor, index } */
export const SKILL_INDEX = (() => {
  const idx = {};
  for (const u of UNITS) {
    u.skills.forEach((s, i) => {
      idx[s.id] = { ...s, unitId: u.id, unitColor: u.color, unitTitle: u.title, pos: i };
    });
  }
  return idx;
})();

/** Ordered list of every skill id, path order. */
export const SKILL_ORDER = UNITS.flatMap((u) => u.skills.map((s) => s.id));

export function unitOf(skillId) {
  return UNITS.find((u) => u.id === SKILL_INDEX[skillId]?.unitId) ?? null;
}

export function unitById(unitId) {
  return UNITS.find((u) => u.id === unitId) ?? null;
}

// ---------------------------------------------------------------------------
// Lazy content loading (data/units/uXX.js export SKILLS = { skillId: {...} })
// ---------------------------------------------------------------------------
const contentCache = new Map();

export async function loadUnitContent(unitId) {
  if (!contentCache.has(unitId)) {
    const promise = import(`./units/${unitId}.js`).then((m) => m.SKILLS);
    contentCache.set(unitId, promise);
  }
  return contentCache.get(unitId);
}

export async function getSkillContent(skillId) {
  const meta = SKILL_INDEX[skillId];
  if (!meta) return null;
  const skills = await loadUnitContent(meta.unitId);
  return skills[skillId] ?? null;
}

/** Load several skills' content at once (review sessions span units). */
export async function getManySkillContents(skillIds) {
  const out = {};
  await Promise.all(
    [...new Set(skillIds)].map(async (id) => { out[id] = await getSkillContent(id); })
  );
  return out;
}

# SAUCE Academy — Curriculum Reference

12 units · 54 skills. Ordering synthesizes the Competitive Programmer's
Handbook (Laaksonen), the USACO Guide Bronze→Platinum progression, and CSES
Problem Set categories, weighted by ICPC regional topic frequency (DP 1–3
problems per contest, graphs 1–2, math 1–2, strings ~1, geometry ~1 — Halim &
Halim CP3; ICPC-Eval).

Each skill = theory cards + 10–13 interactive exercises + 3–4 curated external
problems (CSES / Codeforces, all IDs verified). Mastery: L1 learn → L2/L3
practice (≥80%) → L4 spaced practice (different day) → L5 Legendary (timed,
no hints, ≤3 mistakes).

## Unit 1 🚀 C++ Bootcamp
| Skill | Covers | Anchor problems |
|---|---|---|
| Hello, Contest! | solution shape, cin/cout, fast I/O, verdicts, multi-testcase | CSES 1068 · CF 4A · CF 71A · CF 231A |
| Types & Overflow | int vs long long, intermediate overflow, int division/mod, doubles, char math | CSES 1083 · CF 1A · CF 50A · CSES 1618 |
| Control Flow | if-chains, loop bounds, break/continue, nested pair loops, flag/best patterns | CSES 1069 · CSES 1094 · CF 158A · CF 266B |
| Functions & Recursion | const ref passing, solve() pattern, base cases, recursion depth | CSES 2165 · CF 282A · CF 263A |
| Arrays & Vectors | construction, bounds, .size() trap, 2D grids, counting arrays | CSES 1094 · CF 263A · CF 116A · CSES 1621 |
| Strings | indexing/substr/find, char classification, frequency counting, building output | CF 112A · CF 281A · CSES 1755 · CF 339A |

## Unit 2 🧰 STL & Complexity
| Skill | Covers |
|---|---|
| Big-O & Constraints | growth classes, 10⁸ ops/sec budget, constraint→complexity table, hidden TLE costs |
| Sorting & Comparators | sort, pairs, comparator lambdas, the `<=` strict-weak-ordering crash |
| Sets & Maps | set/map/multiset/unordered, costs, `operator[]` insertion trap, multiset erase trap |
| Stacks, Queues & Heaps | stack/queue/deque, bracket matching, priority_queue (max by default!) |
| STL Power Tools | lower/upper_bound, sort-unique-erase, accumulate(0LL), iterators, lambdas |

## Unit 3 🧠 Core Patterns
| Skill | Covers |
|---|---|
| Brute Force & Simulation | enumeration budgets, faithful simulation, next_permutation, brute force as debugging oracle |
| Greedy | exchange argument, earliest-end scheduling, counterexample hunting, when greedy fails |
| Two Pointers | sorted two-sum, squeeze, merge, O(n) movement argument |
| Sliding Window | window invariants, expand/shrink, counting subarrays, where windows break (negatives) |
| Prefix Sums | 1D/2D, inclusion-exclusion, difference arrays, prefix+hashmap (sum = k) |
| Binary Search | invariant loops, lower/upper_bound, binary search on the ANSWER, overflow-safe mid |

## Unit 4 🔢 Math & Counting
| Skill | Covers |
|---|---|
| Bit Manipulation | and/or/xor/shifts, bit tests, n&(n−1), popcount, xor properties, masks as sets |
| Modular Arithmetic | mod rules, fast power, Fermat inverse, negative mod, overflow-before-mod |
| Primes & GCD | Euclid, lcm overflow, sieve, factorization, divisor counting |
| Combinatorics | nCr + factorial precompute, stars & bars, multiset permutations, complement, pigeonhole |
| Backtracking | subsets/permutations generation, pruning, n-queens diagonals, 2ⁿ/n! budgets |

## Unit 5 🕸️ Graphs I
| Skill | Covers |
|---|---|
| Graphs & BFS | adjacency lists, grid BFS dx/dy, distance layers, path reconstruction |
| DFS & Components | components, flood fill, cycle detection (parent trick), bipartite coloring |
| Dijkstra & 0-1 BFS | pq + stale-skip, why non-negative, deque trick, visited-on-pop vs push bug |
| Topological Sort | Kahn's, cycle detection, DAG DP (longest path, path counting) |
| DSU & MST | path compression + union by size, dynamic connectivity, Kruskal, IMPOSSIBLE detection |

## Unit 6 🧩 Dynamic Programming
| Skill | Covers |
|---|---|
| DP Foundations | state/transition/base/order recipe, memo vs tab, count vs optimize, why greedy fails |
| Grid & Path DP | obstacle paths, min path sums, rolling rows, 2×n tracks |
| Knapsack | 0/1 downward vs unbounded upward, subset sums, partition counting |
| LIS & Sequence DP | O(n²) and O(n log n) LIS, edit distance, "ends at i" states |
| Interval & Game DP | dp[l][r] by length, minimax with score difference, removal games |
| Bitmask DP | dp[mask], dp[mask][last] Hamiltonian, submask enumeration, n≤20 cue |

## Unit 7 🌲 Trees
| Skill | Covers |
|---|---|
| Tree Traversal & Diameter | rooting, subtree sizes, two-DFS diameter, height DP |
| Tree DP | post-order accumulation, matching, distances, rerooting (in/out decomposition) |
| LCA & Binary Lifting | up[v][k] tables, k-th ancestor, LCA jumps, distance via LCA |

## Unit 8 📊 Range Queries
| Skill | Covers |
|---|---|
| Fenwick Tree (BIT) | lowbit walks, prefix sums + point update, counting patterns, compression |
| Segment Tree | node anatomy, build/update/query cases, identity elements, descent queries |
| Lazy Propagation | deferred range updates, pushdown discipline, range-add range-sum |
| Sparse Tables & Friends | static RMQ O(1), idempotent overlap trick, coordinate compression, offline |

## Unit 9 🔤 Strings
| Skill | Covers |
|---|---|
| String Hashing | polynomial hashes, O(1) substring compare, double hashing vs anti-hash hacks |
| KMP & Z-Function | prefix function, fallback amortization, borders ↔ periods, pattern matching |
| Tries | prefix trees, word counting, trie+DP segmentation, binary tries for XOR |

## Unit 10 🌐 Graphs II & Flows
| Skill | Covers |
|---|---|
| SCC & 2-SAT | Kosaraju, condensation DAG, 2-SAT encoding and assignment |
| Bridges & Cut Vertices | DFS tree, tin/low arrays, > vs ≥ conditions, root special case |
| Max Flow & Matching | residual graphs, augmenting paths, Dinic, min cut, bipartite matching reduction |

## Unit 11 📐 Math II & Geometry
| Skill | Covers |
|---|---|
| Probability & EV | counting probability, linearity of expectation, indicators, probability DP |
| Game Theory | W/L positions, Nim XOR, misère twist, Grundy numbers & mex |
| Geometry Basics | cross product orientation, segment intersection, shoelace, point in polygon |
| Convex Hull & Sweep | monotone chain, collinear handling, sweep-line events |

## Unit 12 🏆 Contest Craft
| Skill | Covers |
|---|---|
| Constraint Forensics | n→complexity deduction, ops/memory budgets, sum-of-n constraints |
| Debugging & Stress Tests | bug taxonomy, the debugging ladder, brute-force oracles + random generators |
| Team Strategy | 1-keyboard economics, opening protocol, penalty math, roles, the 25-page TRD |
| Contest Protocol | virtual contest ritual, upsolving rules, post-mortems, editorial discipline |

## Where to go beyond (post-course)

The course targets a solid regional level. The natural extensions, in rough
order: meet-in-the-middle · Euler tour + segment tree on trees ·
small-to-large merging · HLD · suffix arrays/automata · FFT ·
matrix exponentiation · digit DP · CHT/divide-and-conquer DP optimization ·
persistent structures. The USACO Guide's Platinum/Advanced sections and the
CSES Advanced Techniques section are the recommended continuation — by then
you won't need a path, just a ladder.

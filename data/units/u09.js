// ============================================================================
// data/units/u09.js — Unit 9: Strings
// Polynomial hashing, prefix function & Z-function, tries.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'string-hashing': {
    id: 'string-hashing',
    objectives: [
      'Build prefix hashes and compare any two substrings in O(1)',
      'Explain collisions and when double hashing is required',
      'Recognize problems where hashing replaces heavier string machinery',
    ],
    theory: [
      {
        h: 'The idea: turn strings into numbers',
        md: 'A **polynomial hash** treats a string as digits of a number in base p:\n\n`h(s) = s[0]·pⁿ⁻¹ + s[1]·pⁿ⁻² + … + s[n−1]  (mod M)`\n\nEqual strings → equal hashes, always. Different strings → *almost certainly* different hashes. Suddenly string comparison costs one integer compare.',
        code: `const ll P = 131;                  // base: > alphabet size
const ll M = 1'000'000'007;        // big prime modulus

// prefix hashes: h[i] = hash of s[0..i-1]
vector<ll> h(n + 1, 0), pw(n + 1, 1);
for (int i = 0; i < n; i++) {
    h[i + 1] = (h[i] * P + s[i]) % M;   // append one char
    pw[i + 1] = pw[i] * P % M;          // powers of the base
}`,
      },
      {
        h: 'Substring hash in O(1)',
        md: 'The hash of `s[l..r]` falls out of two prefix hashes — subtract the prefix before l, shifted to align:\n\n`hash(l, r) = h[r+1] − h[l]·p^(r−l+1)  (mod M)`\n\nWith this, *any* two substrings (even of different strings, same base/mod) compare in O(1). That single formula powers everything else.',
        code: `ll get(int l, int r) {                       // hash of s[l..r]
    ll res = (h[r + 1] - h[l] * pw[r - l + 1]) % M;
    return (res + M * M) % M;                // fix the negative
}
// compare: get(a, b) == get(c, d)  →  substrings (probably) equal`,
        note: 'The `% M` of a subtraction can be negative in C++ — re-add the modulus. And `h[l] * pw[...]` multiplies two values < 10⁹: fine in long long, fatal in int.',
        noteKind: 'warn',
      },
      {
        h: 'Collisions: the honest fine print',
        md: 'Different strings CAN share a hash (pigeonhole: 26ⁿ strings, M buckets). With M ≈ 10⁹ and ~10⁵ comparisons you’re usually fine — but on **Codeforces, hacks target fixed bases**. Defenses:\n\n• randomize the base per run, or\n• **double hashing**: two independent (base, mod) pairs; equal only if both agree. Probability of a coordinated collision ≈ 1/M² — game over for hackers.',
        code: `mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
const ll P = uniform_int_distribution<ll>(131, 1'000'000)(rng);`,
      },
      {
        h: 'What hashing buys you',
        md: '• **Pattern matching**: slide a window of |pattern| over the text, compare hashes — O(n + m) expected.\n• **Longest common prefix** of two suffixes: binary search the length, check with hashes — O(log n) per query.\n• **Palindrome checks**: hash the string AND its reverse; s[l..r] is a palindrome iff forward hash = matching reverse hash.\n• Comparing pieces across many strings (concatenate with separators or hash each independently).\n\nIf the problem says "compare substrings many times", hashing is the cheapest hammer.',
      },
    ],
    exercises: [
      {
        id: 'hash-1', type: 'mcq', diff: 1,
        prompt: 'Two strings have EQUAL polynomial hashes. What do you actually know?',
        options: [
          'They are probably equal — different strings can collide, equal strings never differ',
          'They are definitely equal',
          'They have the same length only',
          'Nothing at all',
        ],
        answer: 0,
        explain: 'Hashing is one-directional certainty: equal strings → equal hashes (deterministic), equal hashes → equal strings only with high probability. Engineering the failure probability (mod size, double hashing) is your job.',
      },
      {
        id: 'hash-2', type: 'fill', diff: 1,
        prompt: 'Tiny hash by hand: base p = 10, mod M = 1000, letters as a=1, b=2, c=3. Compute h("abc") = 1·p² + 2·p + 3 mod M.',
        answer: ['123'],
        explain: '1·100 + 2·10 + 3 = 123. With base 10 and digit-letters, the hash IS the decimal number — that’s the whole "strings are numbers in base p" intuition.',
      },
      {
        id: 'hash-3', type: 'bank', diff: 2,
        prompt: 'Complete the substring-hash formula.',
        code: `ll get(int l, int r) {
    ll res = (h[___] - h[___] * pw[___]) % M;
    return (res + M * M) % M;
}`,
        answer: ['r + 1', 'l', 'r - l + 1'],
        distractors: ['r', 'l + 1'],
        explain: 'Prefix ending after r (h[r+1]) minus the prefix before l (h[l]) shifted up by the substring’s length (p^(r−l+1)). Off-by-ones here are THE hashing bug — memorize the trio (r+1, l, r−l+1).',
      },
      {
        id: 'hash-4', type: 'mcq', diff: 2,
        prompt: 'Your hashing solution passes tests but gets hacked on Codeforces. The most likely cause?',
        options: [
          'Fixed, well-known base and modulus — hackers precompute a colliding test case',
          'The mod was too large',
          'long long overflow',
          'The base was a prime',
        ],
        answer: 0,
        explain: 'Anti-hash hacks exploit KNOWN constants (P=31, M=1e9+7 are famous). Randomize the base at runtime or double-hash. In unrated practice it rarely matters; in rated rounds, defend.',
      },
      {
        id: 'hash-5', type: 'output', diff: 2,
        prompt: 'What does this print? (Careful with the subtraction.)',
        code: `int main() {
    long long M = 7;
    long long a = 3, b = 5;
    cout << (a - b) % M << "\\n";
}`,
        answer: '-2',
        explain: 'C++ keeps the dividend’s sign: (3−5) % 7 = −2, not 5. Every hash comparison with subtraction needs the `(x % M + M) % M` fixup — forget it and "equal" substrings mysteriously differ.',
      },
      {
        id: 'hash-6', type: 'mcq', diff: 2,
        prompt: 'How do you check whether s[l..r] is a palindrome in O(1) after preprocessing?',
        options: [
          'Hash s forward and s reversed; compare the substring’s forward hash with the matching window of the reversed string',
          'Compare h[l] with h[r]',
          'Reverse s[l..r] and hash it on the spot',
          'Palindromes need Manacher’s algorithm; hashing cannot do it',
        ],
        answer: 0,
        explain: 'Precompute hashes of s and reverse(s). s[l..r] reversed corresponds to positions (n−1−r .. n−1−l) in the reversed string — two O(1) lookups. Manacher is the specialized tool; hashing is the general one.',
      },
      {
        id: 'hash-7', type: 'tf', diff: 2,
        statement: 'With prefix hashes for two different strings (same base and mod), you can compare a substring of one against a substring of the other in O(1).',
        answer: true,
        explain: 'The substring-hash formula only needs each string’s own prefix table — same (P, M) makes values comparable across strings. This is how "does this piece of A appear in B" checks go fast.',
      },
      {
        id: 'hash-8', type: 'parsons', diff: 2,
        prompt: 'Assemble the prefix-hash construction.',
        lines: [
          'vector<ll> h(n + 1, 0), pw(n + 1, 1);',
          'for (int i = 0; i < n; i++) {',
          '    h[i + 1] = (h[i] * P + s[i]) % M;',
          '    pw[i + 1] = pw[i] * P % M;',
          '}',
        ],
        distractors: [
          '    h[i + 1] = (h[i] + s[i] * P) % M;',
        ],
        explain: 'Each step shifts the whole prefix one base-position left (×P) then adds the new character. The distractor multiplies the CHARACTER instead of the prefix — a hash, but the wrong polynomial (and the substring formula breaks).',
      },
      {
        id: 'hash-9', type: 'fill', diff: 3,
        prompt: 'Pattern matching by hashing: text length n, pattern length m. After O(n) preprocessing, how many window comparisons does the scan make? (expression in n, m)',
        answer: ['n-m+1', 'n - m + 1'],
        explain: 'One O(1) hash compare per alignment: positions 0..n−m → n−m+1 windows. Total O(n + m) expected — same speed class as KMP, far less code, small collision risk.',
        hint: 'How many starting positions can a length-m window have in a length-n text?',
      },
      {
        id: 'hash-10', type: 'match', diff: 1,
        prompt: 'Match the task to the hashing technique.',
        pairs: [
          ['compare two substrings', 'two O(1) hash lookups'],
          ['find pattern in text', 'slide a fixed-length window'],
          ['LCP of two suffixes', 'binary search + hash check'],
          ['survive CF hacks', 'random base / double hash'],
        ],
        explain: 'Four standard moves. If you remember only one thing: substring hash in O(1) makes "compare pieces" problems trivial.',
      },
      {
        id: 'hash-11', type: 'code', diff: 3,
        prompt: 'Read a string s, then q queries `l1 r1 l2 r2` (0-indexed, inclusive). For each, print `YES` if s[l1..r1] equals s[l2..r2], else `NO`. Use prefix hashes (substrings can be long — direct comparison would be O(n) per query).',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll P = 131, M = 1'000'000'007;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int q;
    cin >> s >> q;
    int n = s.size();
    // build h[], pw[], answer queries

    return 0;
}`,
        tests: [
          { input: 'abcabc\n3\n0 2 3 5\n0 1 3 5\n1 1 4 4', expected: 'YES\nNO\nYES' },
          { input: 'aaaa\n2\n0 1 2 3\n0 3 1 3', expected: 'YES\nNO' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll P = 131, M = 1'000'000'007;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int q;
    cin >> s >> q;
    int n = s.size();
    vector<ll> h(n + 1, 0), pw(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h[i + 1] = (h[i] * P + s[i]) % M;
        pw[i + 1] = pw[i] * P % M;
    }
    auto get = [&](int l, int r) {
        ll res = (h[r + 1] - h[l] % M * pw[r - l + 1]) % M;
        return (res % M + M) % M;
    };
    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;
        bool eq = (r1 - l1 == r2 - l2) && get(l1, r1) == get(l2, r2);
        cout << (eq ? "YES" : "NO") << "\\n";
    }
    return 0;
}`,
        explain: 'Build once, answer each query with two lookups — and check the LENGTHS match first (different lengths can never be equal, and skipping the check is a real bug since hashes of different-length strings can collide).',
        hint: 'Two substrings of different lengths can never be equal — check that before comparing hashes.',
      },
    ],
    problems: [
      { name: 'String Matching', platform: 'CSES', id: '1753', url: 'https://cses.fi/problemset/task/1753', difficulty: 'easy', why: 'Pattern in text — solve it with hashing here, with KMP in the next skill, and compare.' },
      { name: 'Longest Palindrome', platform: 'CSES', id: '1111', url: 'https://cses.fi/problemset/task/1111', difficulty: 'hard', why: 'Forward+reverse hashes with binary search per center (or learn Manacher).' },
      { name: 'Palindrome Queries', platform: 'CSES', id: '2420', url: 'https://cses.fi/problemset/task/2420', difficulty: 'hard', why: 'Capstone: hashes living inside a segment tree — updates AND palindrome checks.' },
    ],
  },

  // ==========================================================================
  'kmp-z': {
    id: 'kmp-z',
    objectives: [
      'Compute the prefix function by hand and in code',
      'Use borders ↔ periods duality and KMP matching',
      'Know what the Z-function gives and when to prefer it',
    ],
    theory: [
      {
        h: 'The prefix function (π)',
        md: '`pi[i]` = length of the longest **proper prefix** of `s[0..i]` that is also a **suffix** of it (a *border*). Example, s = `abcabca`:\n\n`a b c a b c a`\n`0 0 0 1 2 3 4` — by index 6, the border is `abca` (length 4).\n\nThis innocuous array encodes self-similarity — matching, borders, periods all fall out of it.',
      },
      {
        h: 'Computing π in O(n): the fallback chain',
        md: 'To extend at position i, try the previous border length j = pi[i−1]; if `s[i] != s[j]`, fall back to the border-of-the-border `j = pi[j−1]`, and so on. Each fallback shrinks j, and j only grows by 1 per step → **amortized O(n)** despite the inner loop.',
        code: `vector<int> prefixFunction(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];               // best border so far
        while (j > 0 && s[i] != s[j])
            j = pi[j - 1];               // fall back to shorter border
        if (s[i] == s[j]) j++;           // extend if it matches
        pi[i] = j;
    }
    return pi;
}`,
        note: 'The fallback is `pi[j-1]`, NOT `pi[j]` — the single most common KMP typo, and it produces subtly wrong tables that pass small tests.',
        noteKind: 'danger',
      },
      {
        h: 'KMP matching: pattern + "#" + text',
        md: 'To find pattern p (length m) in text t: compute π over `p + "#" + t` where `#` appears in neither. Wherever π equals m, a full match ends. The separator caps borders at m so matches can’t bleed across the boundary.',
        code: `vector<int> kmpSearch(const string& text, const string& pat) {
    string s = pat + "#" + text;
    auto pi = prefixFunction(s);
    int m = pat.size();
    vector<int> res;
    for (int i = m + 1; i < (int)s.size(); i++)
        if (pi[i] == m)
            res.push_back(i - 2 * m);    // match start in text
    return res;                          // O(n + m), worst case included
}`,
      },
      {
        h: 'Borders ↔ periods: one fact, two costumes',
        md: 'A string with a border of length b has **period n − b** (it repeats every n−b characters, possibly with a partial last block). So:\n\n• All borders: follow the chain `pi[n−1], pi[pi[n−1]−1], …` (Finding Borders).\n• Smallest period: `n − pi[n−1]` (Finding Periods); it tiles the string exactly when it divides n.\n\nWhen a problem whispers “repeats” or “shifted copy of itself” — it’s asking about π.',
      },
      {
        h: 'The Z-function: the other lens',
        md: '`z[i]` = length of the longest common prefix of `s` and `s[i..]`. Same O(n) power as π, often more direct for "does the prefix reappear here?" questions. Matching works the same way (pattern + "#" + text, look for z = m). Pick whichever maps onto the problem statement with less thinking; you should be able to hand-compute both.',
        code: `// z for "aabxaab": z = [-, 1, 0, 0, 3, 1, 0]
// (z[4] = 3: "aab" matches the prefix "aab")`,
      },
    ],
    exercises: [
      {
        id: 'kmp-1', type: 'fill', diff: 1,
        prompt: 'Compute by hand: for s = `ababab`, what is pi[5] (the last value)?',
        answer: ['4'],
        explain: 'The longest proper border of "ababab" is "abab" (length 4): it’s both a prefix and a suffix. Hand-computing π on 6-character strings is the fastest way to make the definition stick.',
        hint: 'Longest string that is BOTH a proper prefix and a suffix of "ababab".',
      },
      {
        id: 'kmp-2', type: 'fill', diff: 2,
        prompt: 'Write the full prefix function array for s = `aabaaab`, space-separated.',
        answer: ['0 1 0 1 2 2 3'],
        explain: 'a→0, aa→1, aab→0, aaba→1, aabaa→2, aabaaa→2 (falls back: third "a" can’t extend border "aa", so try border-of-border "a", extend → 2), aabaaab→3. The fallback at index 5 is where everyone slips — work it slowly once.',
        hint: 'At index 5 (the third consecutive a), the border "aa" cannot extend with "a"… fall back.',
      },
      {
        id: 'kmp-3', type: 'mcq', diff: 2,
        prompt: 'Spot the bug:',
        code: `for (int i = 1; i < n; i++) {
    int j = pi[i - 1];
    while (j > 0 && s[i] != s[j])
        j = pi[j];                 // ← look here
    if (s[i] == s[j]) j++;
    pi[i] = j;
}`,
        options: [
          'The fallback must be pi[j - 1] — pi[j] reads the border of a LONGER prefix and can loop or wrongly inflate values',
          'The loop should start at i = 0',
          'j++ should be j += 2',
          'No bug; pi[j] is equivalent',
        ],
        answer: 0,
        explain: 'j is a LENGTH; the prefix of that length ends at index j−1, so its border is pi[j−1]. `pi[j]` peeks at one character too many — the classic off-by-one that passes "aaaa" tests and fails everything interesting.',
      },
      {
        id: 'kmp-4', type: 'fill', diff: 2,
        prompt: 's has length 12 and pi[11] = 8. What is its smallest period?',
        answer: ['4'],
        explain: 'Smallest period = n − pi[n−1] = 12 − 8 = 4. And since 4 divides 12, the string is exactly three copies of a 4-character block. Border length and period are two views of the same overlap.',
      },
      {
        id: 'kmp-5', type: 'tf', diff: 2,
        statement: 'In the KMP construction `pat + "#" + text`, the separator can be any character that occurs in neither string.',
        answer: true,
        explain: 'Its only job is to make borders stop at the boundary (π can never exceed m). Any absent character works; `#` is convention. Forget the separator and "matches" can span the seam — garbage results.',
      },
      {
        id: 'kmp-6', type: 'mcq', diff: 2,
        prompt: 'Why is the prefix-function loop O(n) total despite the nested while?',
        options: [
          'j increases by at most 1 per iteration and every fallback strictly decreases it — total decreases can’t exceed total increases (amortized argument)',
          'The while loop runs at most twice by construction',
          'Compilers optimize it to a single loop',
          'It is actually O(n log n) but fast in practice',
        ],
        answer: 0,
        explain: 'Classic amortized accounting: j gains ≤ n in the whole run (one +1 per i), so it can lose ≤ n across ALL fallbacks combined. The same argument pattern shows up in two pointers and monotonic stacks.',
      },
      {
        id: 'kmp-7', type: 'fill', diff: 2,
        prompt: 'Z-function by hand: for s = `aabxaab`, what is z[4]?',
        answer: ['3'],
        explain: 's[4..] = "aab", and the string’s prefix is "aab…" — they share "aab", length 3 (then x ≠ end). z asks one question everywhere: how long does the prefix re-appear starting here?',
      },
      {
        id: 'kmp-8', type: 'parsons', diff: 2,
        prompt: 'Assemble KMP search (find all occurrences of pat in text).',
        lines: [
          'string s = pat + "#" + text;',
          'auto pi = prefixFunction(s);',
          'int m = pat.size();',
          'for (int i = m + 1; i < (int)s.size(); i++)',
          '    if (pi[i] == m)',
          '        res.push_back(i - 2 * m);',
        ],
        distractors: [
          '    if (pi[i] >= m)',
        ],
        explain: 'Concatenate with the separator, compute π once, report positions where the border equals the whole pattern. π can never exceed m here (the "#" guarantees it), so `>= m` is dead logic that signals confusion.',
      },
      {
        id: 'kmp-9', type: 'match', diff: 1,
        prompt: 'Match the question to the tool.',
        pairs: [
          ['all borders of s', 'chain pi[n−1], pi[pi[n−1]−1], …'],
          ['smallest period', 'n − pi[n−1]'],
          ['occurrences of pat', 'π over pat#text'],
          ['prefix reappearing at i', 'z[i]'],
        ],
        explain: 'The π/Z toolbox in one table. Borders chain downward through π; periods are n minus the border; matching is π (or Z) over a concatenation.',
      },
      {
        id: 'kmp-10', type: 'mcq', diff: 3,
        prompt: 'A string s (length n) satisfies: pi[n−1] = b > 0 and n − b divides n. How many times does the period block repeat, and is the tiling exact?',
        options: [
          'Exactly n / (n − b) full copies — the divisibility makes the tiling exact',
          'b copies with a partial block',
          'It repeats but the count cannot be determined',
          'The period is b, so n / b copies',
        ],
        answer: 0,
        explain: 'Period length is n − b. Divisibility means no ragged edge: the string is exactly n/(n−b) concatenated copies. When (n−b) ∤ n the string still has period n−b but ends mid-block ("abcab" has period 3). Finding Periods hinges on exactly this distinction.',
        hint: 'The period LENGTH is n − b, not b.',
      },
      {
        id: 'kmp-11', type: 'code', diff: 3,
        prompt: 'Read a string s. Print the lengths of ALL its borders (proper prefixes that are also suffixes), from longest to shortest, space-separated. Print an empty line if there are none.\nExample: `abacaba` → `3 1`.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    // prefix function, then walk the border chain

    return 0;
}`,
        tests: [
          { input: 'abacaba', expected: '3 1' },
          { input: 'aaaa', expected: '3 2 1' },
          { input: 'abc', expected: '' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    cin >> s;
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) j = pi[j - 1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    vector<int> borders;
    for (int b = pi[n - 1]; b > 0; b = pi[b - 1])
        borders.push_back(b);            // border of a border is a border
    for (int i = 0; i < (int)borders.size(); i++)
        cout << borders[i] << " \\n"[i + 1 == (int)borders.size()];
    if (borders.empty()) cout << "\\n";
    return 0;
}`,
        explain: 'Every border of a border is a border of the whole string — so the chain pi[n−1] → pi[b−1] → … enumerates all of them, longest first. This is CSES Finding Borders, minus the reading comprehension.',
        hint: 'pi[n−1] is the longest. Where do you find the next-longest? (It’s a border OF that border.)',
      },
    ],
    problems: [
      { name: 'Finding Borders', platform: 'CSES', id: '1732', url: 'https://cses.fi/problemset/task/1732', difficulty: 'easy', why: 'The border chain — you just wrote it in the lesson.' },
      { name: 'Finding Periods', platform: 'CSES', id: '1733', url: 'https://cses.fi/problemset/task/1733', difficulty: 'med', why: 'Borders flipped into periods. Mind the non-divisible case.' },
      { name: 'Password', platform: 'Codeforces', id: '126B', rating: 1700, url: 'https://codeforces.com/problemset/problem/126/B', difficulty: 'med', why: 'Border that ALSO appears in the middle — π plus one extra observation.' },
      { name: 'MUH and Cube Walls', platform: 'Codeforces', id: '471D', rating: 1800, url: 'https://codeforces.com/problemset/problem/471/D', difficulty: 'hard', why: 'Beautiful reduction: difference arrays turn a wall-matching problem into KMP.' },
    ],
  },

  // ==========================================================================
  'tries': {
    id: 'tries',
    objectives: [
      'Build a trie with array children and insert/search in O(length)',
      'Use per-node counters for prefix-count queries',
      'Recognize trie+DP and binary-trie XOR patterns',
    ],
    theory: [
      {
        h: 'A tree of prefixes',
        md: 'A **trie** stores a set of words by sharing prefixes: the root is the empty string; each edge adds one character; each path from the root spells a prefix. Insert/search cost **O(word length)** — independent of how many words are stored. `{car, cat, cow}` shares the `c`, then splits.',
      },
      {
        h: 'The flat-array implementation',
        md: 'Contest tries skip pointers: a 2D array `nxt[node][26]` (0 = none), a node counter, and flags/counters per node. Memory: total characters inserted × 26 ints — size it up front.',
        code: `const int MAXN = 1'000'006;          // total chars across all words
int nxt[MAXN][26];                    // 0 = no edge
int cntEnd[MAXN];                     // words ending here
int trieSz = 1;                       // node 0 is the root

void insert(const string& w) {
    int cur = 0;
    for (char ch : w) {
        int c = ch - 'a';
        if (!nxt[cur][c]) nxt[cur][c] = trieSz++;   // create node
        cur = nxt[cur][c];
    }
    cntEnd[cur]++;                    // mark the word's end
}

bool contains(const string& w) {
    int cur = 0;
    for (char ch : w) {
        cur = nxt[cur][ch - 'a'];
        if (!cur) return false;       // edge missing → not present
    }
    return cntEnd[cur] > 0;
}`,
        note: 'Global arrays auto-zero; if you allocate per test case, reset only the nodes you used (memsetting 10⁶×26 per case is its own TLE).',
      },
      {
        h: 'Prefix counting: a counter on every node',
        md: 'Increment `cntPass[cur]` at every node you touch during insert, and "how many words start with prefix p" becomes: walk p, read the counter. Autocomplete, dictionary filters, "count words sharing a prefix" — all the same two lines.',
        code: `// inside insert, after cur = nxt[cur][c]:
cntPass[cur]++;            // one more word passes through here`,
      },
      {
        h: 'Trie + DP: segmenting text by dictionary',
        md: '“How many ways can s be built by concatenating dictionary words?” (Word Combinations). DP over positions: `dp[i]` = ways to build `s[0..i)`. From each i, **walk the trie along s** — every end-marker you pass at depth d contributes `dp[i]` to `dp[i + d]`. The trie turns "try every dictionary word at i" into one downward walk.',
        code: `vector<ll> dp(n + 1, 0);
dp[0] = 1;
for (int i = 0; i < n; i++) {
    if (!dp[i]) continue;
    int cur = 0;
    for (int j = i; j < n; j++) {        // walk the trie along s
        cur = nxt[cur][s[j] - 'a'];
        if (!cur) break;                  // no dictionary word continues
        if (cntEnd[cur])
            dp[j + 1] = (dp[j + 1] + dp[i] * cntEnd[cur]) % MOD;
    }
}`,
      },
      {
        h: 'Binary tries: XOR’s favorite data structure',
        md: 'Store numbers as 30-bit paths (children 0/1). To maximize `x XOR y` over stored y: walk from the top bit, **greedily taking the opposite bit** of x whenever that child exists — opposite bits make XOR’s high bits 1. This pattern (max-XOR pair, XOR-subarray problems) is a recurring mid-level trick; you’ll meet it again past this course.',
      },
    ],
    exercises: [
      {
        id: 'trie-1', type: 'fill', diff: 1,
        prompt: 'Insert `cat`, `car`, `cow` into an empty trie. How many nodes exist afterwards, counting the root?',
        answer: ['7'],
        explain: 'root + c + a (shared by cat/car) + t + r + o + w = 7. Sharing is the whole point: "ca" is stored once for two words. Draw it — tries are best understood by hand once.',
        hint: 'Which prefixes are shared? root→c→a serves both cat and car.',
      },
      {
        id: 'trie-2', type: 'mcq', diff: 1,
        prompt: 'Time to check whether a word of length L is in a trie holding 10⁶ words?',
        options: [
          'O(L) — one step per character, regardless of dictionary size',
          'O(log 10⁶) — binary search over words',
          'O(L · 10⁶) — compare against every word',
          'O(26^L)',
        ],
        answer: 0,
        explain: 'You walk one edge per character; the other 999,999 words never slow you down. That independence from dictionary size is why tries beat sets-of-strings (whose compares cost O(L) each, times log n).',
      },
      {
        id: 'trie-3', type: 'bank', diff: 2,
        prompt: 'Complete trie insertion.',
        code: `void insert(const string& w) {
    int cur = 0;
    for (char ch : w) {
        int c = ch - 'a';
        if (!nxt[cur][c]) nxt[cur][c] = ___;
        cur = ___;
    }
    ___++;
}`,
        answer: ['trieSz++', 'nxt[cur][c]', 'cntEnd[cur]'],
        distractors: ['cur++', 'trieSz'],
        explain: 'Missing edge → mint a fresh node id (trieSz++ returns the old value then bumps); always advance through the edge; mark the END node, not the root. Each blank is a real bug when wrong.',
      },
      {
        id: 'trie-4', type: 'mcq', diff: 2,
        prompt: '`contains("ca")` returns true even though only "cat" and "car" were inserted. The bug?',
        code: `bool contains(const string& w) {
    int cur = 0;
    for (char ch : w) {
        cur = nxt[cur][ch - 'a'];
        if (!cur) return false;
    }
    return true;                    // ← here
}`,
        options: [
          'It returns true for any PREFIX of a stored word — it must check the end-marker: `return cntEnd[cur] > 0;`',
          'The loop is off by one',
          'cur should start at 1',
          'nxt should be checked before moving',
        ],
        answer: 0,
        explain: '"Path exists" only means "is a prefix of something". Word membership requires the end flag. Prefix-query vs word-query confusion is the #1 trie logic error.',
      },
      {
        id: 'trie-5', type: 'fill', diff: 2,
        prompt: 'With per-node pass-counters: after inserting `cat, car, cow, dog`, what does the counter at node `c` hold?',
        answer: ['3'],
        explain: 'Three words pass through c (cat, car, cow); dog takes a different first edge. Walk a prefix, read its counter — that’s "how many words start with this" in O(prefix length).',
      },
      {
        id: 'trie-6', type: 'mcq', diff: 2,
        prompt: 'In the trie+DP segmentation (dp over text positions), what does walking the trie from position i accomplish?',
        options: [
          'It finds ALL dictionary words that begin exactly at i, in one pass, charging dp[i] to each end position',
          'It checks whether the whole remaining text is one dictionary word',
          'It sorts the dictionary lazily',
          'It compresses the text',
        ],
        answer: 0,
        explain: 'Each end-marker passed at depth d = "a dictionary word of length d starts at i" → transition dp[i] → dp[i+d]. Without the trie you’d test every word at every position: O(n · dict). With it: O(n · maxlen).',
      },
      {
        id: 'trie-7', type: 'tf', diff: 2,
        statement: 'A trie holding words with 10⁶ total characters, implemented as `int nxt[10⁶+5][26]`, uses on the order of 100 MB of memory.',
        answer: true,
        explain: '10⁶ × 26 × 4 bytes ≈ 104 MB — right at typical 256 MB limits, over some. Mitigations: smaller node bound (nodes ≤ total chars + 1, often far fewer), short, or map-children for sparse alphabets. Tries are memory-hungry; budget before declaring.',
      },
      {
        id: 'trie-8', type: 'fill', diff: 3,
        prompt: 'Binary trie, 4-bit numbers, stored: {9 (1001), 5 (0101), 12 (1100)}. For x = 6 (0110), which stored y maximizes x XOR y? Answer with y in decimal.',
        answer: ['9'],
        explain: 'Greedy from the top bit of x=0110: want 1xxx → exists (9, 12). Next bit of x is 1, want 0 → 1001 has it (12 = 1100 doesn’t). Then want opposite of 1 → 0 ✓, opposite of 0 → 1 ✓. y = 1001 = 9, giving 0110^1001 = 1111 = 15, the max. Top-down opposite-bit greed — that’s the entire algorithm.',
        hint: 'Walk bits from the highest: at each step prefer the child with the OPPOSITE bit of x.',
      },
      {
        id: 'trie-9', type: 'match', diff: 1,
        prompt: 'Match the problem smell to the trie flavor.',
        pairs: [
          ['autocomplete counts', 'pass-counters per node'],
          ['segment text by dictionary', 'trie + position DP'],
          ['maximize XOR with a set', 'binary trie, opposite-bit walk'],
          ['exact word membership', 'end-markers'],
        ],
        explain: 'Four faces of the same structure. The skeleton (nodes + 26 children) never changes; only what you store per node does.',
      },
      {
        id: 'trie-10', type: 'order', diff: 2,
        prompt: 'Order the steps of answering “how many stored words start with prefix p?”',
        items: [
          'Start at the root',
          'Follow the edge for each character of p',
          'If an edge is missing, answer 0',
          'Otherwise read the pass-counter at the final node',
        ],
        explain: 'Walk and read. O(|p|), no search, no iteration over the dictionary — the counter was maintained during inserts precisely so queries are free.',
      },
      {
        id: 'trie-11', type: 'mcq', diff: 3,
        prompt: 'Word Combinations (CSES): text length n ≤ 5000, dictionary total length ≤ 10⁶. Your trie+DP runs the inner walk from every position. What bounds the total work?',
        options: [
          'O(n²) walk steps worst case (walk from each i can run to the text end) — ~2.5·10⁷, fine; the trie caps it further at the deepest dictionary word',
          'O(n · 10⁶) — text times dictionary size',
          'O(2ⁿ) — all segmentations are enumerated',
          'O(n) — each character is visited once',
        ],
        answer: 0,
        explain: 'From each of n positions the walk advances ≤ min(n − i, deepest word) steps: ≤ n²/2 ≈ 1.25·10⁷ total, comfortably fast. The trie’s job was killing the dictionary factor; the n² text factor stays and the constraints were chosen to allow it. Always re-derive the bound — "uses a trie" isn’t a complexity.',
        hint: 'How far can one downward walk go, and how many walks are there?',
      },
    ],
    problems: [
      { name: 'Word Combinations', platform: 'CSES', id: '1731', url: 'https://cses.fi/problemset/task/1731', difficulty: 'hard', why: 'The trie+DP from this lesson, verbatim — segment the text, count the ways.' },
      { name: 'Little Girl and Maximum XOR', platform: 'Codeforces', id: '276D', rating: 1700, url: 'https://codeforces.com/problemset/problem/276/D', difficulty: 'med', why: 'The XOR warm-up: solvable greedily here, but build the binary-trie instinct.' },
      { name: 'String Matching', platform: 'CSES', id: '1753', url: 'https://cses.fi/problemset/task/1753', difficulty: 'easy', why: 'Third visit: you now own three different weapons for this one problem (hash, KMP, and — for many patterns — tries/Aho thinking).' },
    ],
  },
};

// ============================================================================
// data/units/u04.js — Unit 4: Math & Counting
// Bits, modular arithmetic, primes & gcd, combinatorics, backtracking.
// Exercise ladder per skill: traces → Parsons/banks → typed recall → writing.
// ============================================================================

export const SKILLS = {
  // ==========================================================================
  'bitops': {
    id: 'bitops',
    objectives: [
      'Test, set, clear, and toggle single bits with shift + mask expressions',
      'Use XOR’s self-canceling property for lonely-number and range-XOR tricks',
      'Represent subsets as bitmasks and enumerate all 2ⁿ of them',
      'Dodge the 1 << 31 overflow trap with 1LL',
    ],
    theory: [
      {
        h: 'Numbers are bit arrays',
        md: 'Every `int` is 32 on/off switches; every `long long` is 64. Six operators manipulate them: `a & b` keeps bits set in **both**, `a | b` keeps bits set in **either**, `a ^ b` keeps bits that **differ**, `~a` flips everything, `a << k` slides left (×2ᵏ), `a >> k` slides right (÷2ᵏ, truncating).\n\nRecognition cues: the word *XOR* anywhere in a statement, on/off state to track, n ≤ 20 with "any subset", or arithmetic by powers of two.',
        code: `int a = 12, b = 10;   // 1100 and 1010 in binary
a & b;    // 1000 =  8   (bits in both)
a | b;    // 1110 = 14   (bits in either)
a ^ b;    // 0110 =  6   (bits that differ)
a << 2;   // 110000 = 48 (times 4)
a >> 1;   // 110 = 6     (divide by 2)`,
      },
      {
        h: 'The four moves: test, set, clear, toggle',
        md: 'Everything builds from the mask `1 << i` — the number whose only set bit is bit i. Combine it with the right operator and you can read or rewrite any single bit:',
        code: `bool on = (n >> i) & 1;   // TEST: slide bit i to the bottom, mask it
n |=  1 << i;             // SET bit i to 1   (OR forces on)
n &= ~(1 << i);           // CLEAR bit i to 0 (AND with all-except-i)
n ^=  1 << i;             // TOGGLE bit i     (XOR flips)`,
        note: 'Precedence trap: `==` binds tighter than `&`, so `x & 1 == 0` parses as `x & (1 == 0)` — always 0. Parenthesize: `(x & 1) == 0`.',
        noteKind: 'warn',
      },
      {
        h: 'n & (n − 1): the lowest-set-bit eraser',
        md: 'Subtracting 1 turns the trailing `1000…0` of n into `0111…1`; ANDing with n wipes exactly the lowest set bit. Two famous consequences:\n\n**Power-of-two test** — a power of two has exactly one set bit, so `n > 0 && (n & (n - 1)) == 0`. **Popcount** — erase until zero, counting erasures. In practice use the compiler builtins; they’re a single instruction.',
        code: `int  c1 = __builtin_popcount(x);     // set bits of an int
int  c2 = __builtin_popcountll(x);   // long long version — don't mix them up
bool pw = x > 0 && (x & (x - 1)) == 0;   // exactly one set bit?`,
      },
      {
        h: 'XOR: the self-canceling operator',
        md: '`a ^ a = 0` and `a ^ 0 = a`, and XOR is commutative and associative — so in any XOR pile, **pairs vanish**. XOR a whole array where every value appears twice except one, and the lonely value is all that survives.\n\nSame property gives O(1) range XOR: build prefix XORs like prefix sums, then "subtract" by XORing again.',
        code: `int lonely = 0;
for (int x : a) lonely ^= x;            // pairs cancel: a ^ a = 0

vector<int> px(n + 1, 0);
for (int i = 0; i < n; i++)
    px[i + 1] = px[i] ^ a[i];           // px[i] = XOR of first i values
// XOR of a[l..r] == px[r + 1] ^ px[l]  (the shared prefix cancels)`,
      },
      {
        h: 'A bitmask is a subset',
        md: 'Give n items the bit positions 0..n−1. Any n-bit number now *is* a subset: bit i set ⇔ item i included. All 2ⁿ subsets are just the integers `0 .. (1 << n) - 1` — a plain for-loop enumerates them.\n\nConstraints whisper: **n ≤ 20 → bitmask** (2²⁰ ≈ 10⁶). This representation is also the backbone of bitmask DP later — get fluent now.',
        code: `for (int mask = 0; mask < (1 << n); mask++) {   // every subset
    ll sum = 0;
    for (int i = 0; i < n; i++)
        if ((mask >> i) & 1)        // is item i in this subset?
            sum += a[i];
    // process this subset's sum
}`,
      },
      {
        h: 'The 1 << 31 landmine',
        md: 'The literal `1` is an **int**, so `1 << i` is computed in 32 bits no matter where you store it. For i ≥ 31 that’s overflow (undefined behavior) — masks silently rot. The moment indices can pass 30, write `1LL << i`. Same disease, same cure as `int * int`: the destination type never rescues the expression.',
        code: `ll bad  = 1 << 40;      // ☠ shifted as int: garbage
ll good = 1LL << 40;    // ✓ 64-bit shift`,
        note: 'Shift bugs pass every small test and detonate only on big inputs. When values can reach 2³¹, grep your code for `1 <<`.',
        noteKind: 'danger',
      },
    ],
    exercises: [
      {
        id: 'bit-1', type: 'output', diff: 1,
        prompt: 'Binary warm-up: 12 is `1100`, 10 is `1010`. What does this print?',
        code: `int main() {
    cout << (12 & 10) << " " << (12 | 10) << " " << (12 ^ 10) << "\\n";
}`,
        answer: '8 14 6',
        explain: 'AND keeps bits set in both (1000 = 8), OR merges (1110 = 14), XOR keeps the differing bits (0110 = 6). The parentheses are mandatory: `<<` binds tighter than `&`, `|`, `^`, so `cout << 12 & 10` would parse as `(cout << 12) & 10`.',
      },
      {
        id: 'bit-2', type: 'mcq', diff: 1,
        prompt: 'What does `(n >> 5) & 1` evaluate to?',
        options: [
          '1 if bit 5 of n is set, else 0',
          'The lowest 5 bits of n',
          'n divided by 5',
          '1 if n is divisible by 32',
        ],
        answer: 0,
        explain: '`n >> 5` slides bit 5 down to position 0, then `& 1` erases everything above it — the standard bit test. Related but different: `n & (1 << 5)` yields 0-or-32 (fine in an if, wrong for counting), and "divisible by 32" would check the low five bits are all zero: `(n & 31) == 0`.',
      },
      {
        id: 'bit-3', type: 'output', diff: 1,
        prompt: 'Shifts are arithmetic: 37 is `100101` in binary. Output?',
        code: `int main() {
    cout << (1 << 4) << " " << (37 >> 2) << "\\n";
}`,
        answer: '16 9',
        explain: '`1 << 4` doubles four times: 16. `37 >> 2` drops the two lowest bits: 100101 → 1001 = 9, which is exactly 37 / 4 in integer division. Left shift multiplies by 2ᵏ, right shift divides by 2ᵏ.',
      },
      {
        id: 'bit-4', type: 'match', diff: 2,
        prompt: 'Match each expression to what it does.',
        pairs: [
          ['n | (1 << i)', 'set bit i to 1'],
          ['n & ~(1 << i)', 'clear bit i to 0'],
          ['n ^ (1 << i)', 'toggle bit i'],
          ['(n >> i) & 1', 'read bit i (0 or 1)'],
          ['n & (n - 1)', 'erase the lowest set bit'],
        ],
        explain: 'The five-move toolkit: OR forces a bit on, AND-with-complement forces it off, XOR flips it, shift-then-mask reads it, and n & (n−1) powers popcount loops and the power-of-two test.',
      },
      {
        id: 'bit-5', type: 'output', diff: 2,
        prompt: 'Trace the XOR fold. Output?',
        code: `int main() {
    int a[5] = {4, 9, 6, 9, 4};
    int x = 0;
    for (int i = 0; i < 5; i++) x ^= a[i];
    cout << x << "\\n";
}`,
        answer: '6',
        explain: 'XOR is order-independent and self-canceling: the two 4s annihilate, the two 9s annihilate, leaving 6. You don’t need to grind through 4^9=13, 13^6=11… (though that works too) — pair-spotting is the whole trick.',
      },
      {
        id: 'bit-6', type: 'mcq', diff: 2,
        prompt: 'Which expression correctly tests "n is a power of two"?',
        options: [
          '`n > 0 && (n & (n - 1)) == 0`',
          '`(n & (n - 1)) == 0`',
          '`n % 2 == 0`',
          '`(n & 1) == 1`',
        ],
        answer: 0,
        explain: 'Powers of two have exactly one set bit; erasing the lowest set bit must leave 0. Without `n > 0`, the test wrongly blesses n = 0 (no set bits at all). "Even" is not "power of two" (12), and option 4 merely tests oddness. Equivalent: `__builtin_popcount(n) == 1`.',
      },
      {
        id: 'bit-7', type: 'fill', diff: 2,
        prompt: 'Write the expression that CLEARS bit i of n (forces it to 0, leaving every other bit alone):',
        answer: ['n & ~(1 << i)', 'n & ~(1<<i)', 'n&~(1<<i)', '~(1 << i) & n'],
        placeholder: 'n … (1 << i)',
        explain: '`1 << i` has only bit i on; `~` flips it into all-ones-except-i; AND keeps everything else and zeroes bit i. Beware the tempting wrong neighbors: `n ^ (1 << i)` *toggles* (sets the bit if it was 0!) and `n - (1 << i)` corrupts higher bits when bit i wasn’t set.',
      },
      {
        id: 'bit-8', type: 'bank', diff: 2,
        prompt: 'Complete the subset enumeration: every mask is one subset of the n items.',
        code: `for (int mask = 0; mask < (1 << n); mask++) {
    ll sum = 0;
    for (int i = 0; i < n; i++)
        if ((mask >> ___) & ___) sum += a[___];
    // sum is the total of this subset
}`,
        answer: ['i', '1', 'i'],
        distractors: ['mask', 'n'],
        explain: 'Bit i of mask answers "is item i in this subset?" — shift mask right by i, mask with 1, and if set, include a[i]. 2ⁿ masks × n bits each: the workhorse of n ≤ 20 problems.',
      },
      {
        id: 'bit-9', type: 'mcq', diff: 2,
        prompt: 'k can be up to 60. What’s wrong here?',
        code: `ll mask = 1 << k;    // build the k-th bit mask`,
        options: [
          '`1 << k` happens in 32-bit int — garbage for k ≥ 31. The 1 itself must be wide: `1LL << k`',
          '`(ll)(1 << k)` — cast the result to long long',
          'Nothing: mask is declared ll, so the shift is performed in 64 bits',
          '`1 << k` is fine up to k = 63 because the CPU has 64-bit registers',
        ],
        answer: 0,
        explain: 'The shift is computed at the width of its left operand — `1` is an int, so 32 bits, UB at k ≥ 31. The destination type never rescues an expression (same law as int·int overflow), and `(ll)(1 << k)` casts the already-destroyed value. Spell it `1LL << k`.',
        hint: 'When is the conversion to ll applied — before or after the shift?',
      },
      {
        id: 'bit-10', type: 'tf', diff: 2,
        statement: 'With prefix XORs px[i] = a[0] ^ … ^ a[i−1] precomputed, the XOR of any range a[l..r] is px[r+1] ^ px[l] — O(1) per query, just like range sums from prefix sums.',
        answer: true,
        explain: 'XOR is its own inverse: XORing the two prefixes makes the shared part a[0..l−1] cancel (a ^ a = 0), leaving exactly a[l..r]. Prefix sums subtract; prefix XORs XOR again. Same pattern, different operator.',
      },
      {
        id: 'bit-11', type: 'mcq', diff: 2,
        prompt: 'Constraints: n ≤ 20, values up to 10⁹, "split the items into two groups as evenly as possible". What do the constraints whisper?',
        options: [
          'Brute force every subset: 2²⁰ ≈ 10⁶ masks, ×20 to sum each ≈ 2·10⁷ ops — comfortably fast',
          '2²⁰ masks × 20 ops each = 2·10⁷ — over the limit, this needs DP',
          'n ≤ 20 hints that O(n²) pair checking is intended',
          'Subsets can’t be enumerated: int masks hold at most 16 items',
        ],
        answer: 0,
        explain: 'Plan with ~10⁸ simple ops/sec: 2·10⁷ flies. **n ≤ 20 is the loudest whisper in contests — enumerate subsets as bitmasks.** (You’ll do exactly this in Apple Division, in this unit’s backtracking lesson — where you’ll also see why the sums need long long.)',
      },
      {
        id: 'bit-12', type: 'mcq', diff: 3,
        prompt: 'l = 13 (`01101`), r = 22 (`10110`). Maximize `a ^ b` over l ≤ a ≤ b ≤ r. The maximum is:',
        options: ['31', '27', '22', '16'],
        answer: 0,
        explain: '13 and 22 first differ at bit 4, so the range must contain a boundary pair: a = 01111 = 15 and b = 10000 = 16. Their XOR is 11111 = 31 — once the top bit differs, every lower bit can be made 1. The distractors: 27 is just 13 ^ 22 (endpoints aren’t optimal), 16 takes only the top bit. General answer: 2ᵏ⁺¹ − 1 where k is the highest differing bit of l and r.',
        hint: 'Look for two neighbors in the range shaped 0111… and 1000….',
      },
      {
        id: 'bit-13', type: 'code', diff: 3,
        prompt: 'Read n (odd), then n integers where every value appears exactly twice — except one. Print the lonely value. Aim for O(n) time, O(1) extra memory.',
        starter: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    // every value appears twice, except one — find it
    // your code here

    return 0;
}`,
        tests: [
          { input: '5\n2 3 5 3 2', expected: '5' },
          { input: '1\n42', expected: '42' },
          { input: '7\n9 1 9 4 4 7 7', expected: '1' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    int lonely = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        lonely ^= x;          // pairs cancel: a ^ a = 0, a ^ 0 = a
    }
    cout << lonely << "\\n";
    return 0;
}`,
        explain: 'XOR everything: order doesn’t matter, pairs self-destruct, the singleton survives. No sorting (O(n log n)), no hash map (O(n) memory) — one int of state. This exact trick appears in interviews and contests forever.',
        hint: 'What single operator makes duplicates annihilate each other regardless of position?',
      },
    ],
    problems: [
      { name: 'Raising Bacteria', platform: 'Codeforces', id: '579A', rating: 1000, url: 'https://codeforces.com/problemset/problem/579/A', difficulty: 'easy', why: 'Doubling each night, adding one each morning — the answer is exactly popcount(x).' },
      { name: 'Little Girl and Maximum XOR', platform: 'Codeforces', id: '276D', rating: 1700, url: 'https://codeforces.com/problemset/problem/276/D', difficulty: 'med', why: 'Pure bit reasoning: find the highest bit where l and r differ; everything below becomes ones.' },
      { name: 'Counting Bits', platform: 'CSES', id: '1146', url: 'https://cses.fi/problemset/task/1146', difficulty: 'hard', why: 'Sum popcount(1..n) for n up to 10¹⁶: count each bit column’s repeating pattern instead of looping.' },
    ],
  },

  // ==========================================================================
  'modular': {
    id: 'modular',
    objectives: [
      'Add, subtract, and multiply under a modulus without overflow or negatives',
      'Implement binary exponentiation (modpow) in O(log e)',
      'Replace division with multiplication by a Fermat inverse',
    ],
    theory: [
      {
        h: 'Why 10⁹ + 7?',
        md: 'Counting answers explode: 100! has 158 digits — no integer type holds it. So judges ask for the answer **modulo p = 10⁹+7**: reduce after every operation and every value stays small, while equal answers keep equal remainders (your math is still fully checked).\n\nWhy this exact p: it’s **prime** (Fermat inverses work — see below), it fits in an int, and two residues multiply to at most ~10¹⁸ — inside `long long`. Recognition cue: the sentence *"output the answer modulo 10⁹+7"* means: do all arithmetic in ll, reduce constantly.',
        code: `const ll MOD = 1'000'000'007;   // prime; residue products fit in ll`,
      },
      {
        h: 'The three safe operations',
        md: 'With a and b already reduced into [0, MOD), sums stay below 2·MOD and products below MOD² ≈ 10¹⁸ — both fine **in long long**. The capital crime is letting two ints multiply: the overflow happens before `%` ever runs. Subtraction has its own trap: C++ `%` can return negatives, so shift up by MOD first.',
        code: `ll add = (a + b) % MOD;          // fine: < 2 * MOD before reducing
ll mul = a * b % MOD;            // a, b are ll residues: fits, barely
ll sub = (a - b + MOD) % MOD;    // + MOD first — % won't fix a negative`,
        note: 'Reducing early and often is always safe for + and ×. Overflowing *before* the mod is the bug — `(ll)a * b % MOD` whenever the operands might be int.',
        noteKind: 'warn',
      },
      {
        h: 'modpow: square and conquer',
        md: 'aᵉ one multiply at a time is O(e) — dead for e = 10⁹. Instead, square the base while halving the exponent: the base visits a¹, a², a⁴, a⁸, …, and you multiply into the result exactly the powers where e has a binary 1. e = 13 = 1101₂ → a¹³ = a⁸ · a⁴ · a¹. That’s **O(log e)** — about 60 steps even for e = 10¹⁸.',
        code: `ll modpow(ll a, ll e, ll m) {
    ll r = 1;
    a %= m;                        // a may arrive >= m
    while (e > 0) {
        if (e & 1) r = r * a % m;  // this bit of e is set → fold power in
        a = a * a % m;             // square: a^1, a^2, a^4, a^8, ...
        e >>= 1;                   // next bit of e
    }
    return r;
}`,
      },
      {
        h: 'Division = multiplying by the inverse',
        md: 'There is no `/` in mod world — `(a / b) % m` and `(a % m) / (b % m)` are both garbage. What exists is the **modular inverse**: the value b⁻¹ with b · b⁻¹ ≡ 1 (mod p). Fermat’s little theorem (p prime, b not a multiple of p) says bᵖ⁻¹ ≡ 1, so **b⁻¹ = bᵖ⁻² mod p** — one modpow call, O(log p). "Divide by b" therefore means "multiply by modpow(b, p−2, p)". This is the whole reason setters pick a prime modulus.',
        code: `ll inv = modpow(b, MOD - 2, MOD);    // Fermat: b^(p-2) is 1/b
ll q   = a % MOD * inv % MOD;        // "a / b" under the mod`,
      },
      {
        h: 'The bug museum',
        md: 'Four exhibits cause ~all modular WAs:\n\n① `int * int` before the mod — cast first: `(ll)a * b % MOD`. ② Negative after subtraction — `(a - b + MOD) % MOD`. ③ Reducing an **exponent** mod p — exponents live mod p−1 (Fermat: aᵖ⁻¹ ≡ 1), the trap of CSES *Exponentiation II*. ④ Forgetting `a %= m` when the input itself can exceed the modulus.',
        code: `cout << -7 % 5;            // prints -2: sign follows the dividend
ll fixed_ = ((x % MOD) + MOD) % MOD;   // safe for any sign of x`,
        note: 'WA in a counting problem? Hunt these four in this order — ① is the most common by a mile.',
        noteKind: 'danger',
      },
    ],
    exercises: [
      {
        id: 'mod-1', type: 'mcq', diff: 1,
        prompt: 'A counting problem ends with *"…output the answer modulo 10⁹+7."* Why do setters do this?',
        options: [
          'The true answer can be astronomically large — working mod p keeps every intermediate value inside 64 bits, while equal answers still have equal remainders',
          'You compute the exact giant number first, then take % once at the end',
          'The mod makes algorithms asymptotically faster',
          'It’s a checksum that detects formatting typos in your output',
        ],
        answer: 0,
        explain: 'There is no "exact giant number" to compute — 100! has 158 digits and fits in nothing. Option 2 is precisely the misconception: you must reduce after every add/multiply so values never leave long long range.',
      },
      {
        id: 'mod-2', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    cout << (7 + 9) % 5 << " " << 7 * 9 % 5 << "\\n";
}`,
        answer: '1 3',
        explain: '16 mod 5 = 1, and 63 mod 5 = 3. Note `*` and `%` share precedence and evaluate left-to-right, so `7 * 9 % 5` is `(7 * 9) % 5` — multiply first, then reduce.',
      },
      {
        id: 'mod-3', type: 'output', diff: 1,
        prompt: 'The C++ negative-mod trap, live. Output?',
        code: `int main() {
    cout << (3 - 10) % 5 << " " << ((3 - 10) % 5 + 5) % 5 << "\\n";
}`,
        answer: '-2 3',
        explain: 'C++ `%` keeps the dividend’s sign: −7 % 5 = −2, not 3. Mathematically you want 3 (−7 ≡ 3 mod 5), which is what the `+ 5` then `% 5` repair produces. Every modular subtraction needs this fix.',
      },
      {
        id: 'mod-4', type: 'fill', diff: 2,
        prompt: 'a and b are already reduced into [0, MOD). Fill in the safe modular subtraction:\n`ll d = ___;`',
        answer: ['(a - b + MOD) % MOD', '(a-b+MOD)%MOD', '(a + MOD - b) % MOD', '((a - b) % MOD + MOD) % MOD'],
        placeholder: '(a … b …) % MOD',
        explain: 'Adding MOD before reducing shifts the worst case (a − b = −(MOD−1)) back into non-negative territory; when a ≥ b the final % simply removes the extra MOD. Plain `(a - b) % MOD` hands you a negative the moment b > a.',
      },
      {
        id: 'mod-5', type: 'mcq', diff: 2,
        prompt: 'Both inputs are up to 10⁹. What’s the bug?',
        code: `int a, b;
cin >> a >> b;
int c = (a * b) % MOD;`,
        options: [
          '`a * b` multiplies two ints → overflow long before % runs. Cast first: `(ll)a * b % MOD`',
          'Reduce both first and it’s fine: `((a % MOD) * (b % MOD)) % MOD`',
          '`%` on int is implementation-defined — use bitwise tricks instead',
          'Nothing is wrong: the % keeps c small, so int is enough',
        ],
        answer: 0,
        explain: '10⁹ · 10⁹ = 10¹⁸ while int tops out at 2.1·10⁹ — the product is garbage before % can act. Option 2 doesn’t help: the residues are still ~10⁹ each and their int product still overflows. The multiplication itself must happen in 64 bits.',
        hint: 'In what type is `a * b` computed, regardless of where it’s stored?',
      },
      {
        id: 'mod-6', type: 'parsons', diff: 2,
        prompt: 'Assemble modpow — binary exponentiation under a modulus.',
        lines: [
          'll modpow(ll a, ll e, ll m) {',
          '    ll r = 1;',
          '    a %= m;',
          '    while (e > 0) {',
          '        if (e & 1) r = r * a % m;',
          '        a = a * a % m;',
          '        e >>= 1;',
          '    }',
          '    return r;',
          '}',
        ],
        distractors: [
          '        if (e & 1) r = r * a;',
        ],
        explain: 'Square the base, halve the exponent, and fold the current power into r whenever e’s lowest bit is 1. The distractor drops the `% m` — r overflows within a few iterations, the most common hand-rolled modpow bug.',
      },
      {
        id: 'mod-7', type: 'output', diff: 2,
        prompt: 'This counts modpow’s loop iterations for e = 19. Output?',
        code: `int main() {
    long long e = 19;
    int steps = 0;
    while (e > 0) {
        e >>= 1;
        steps++;
    }
    cout << steps << "\\n";
}`,
        answer: '5',
        explain: '19 → 9 → 4 → 2 → 1 → 0: five halvings, because 19 = 10011₂ has 5 bits. That’s the whole O(log e) story — e = 10¹⁸ would take only ~60 iterations, while a naive O(e) loop would run for 30 years.',
      },
      {
        id: 'mod-8', type: 'tf', diff: 2,
        statement: 'Ignoring overflow, `((a % m) * (b % m)) % m` always equals `(a * b) % m` — reducing early never changes a product’s residue.',
        answer: true,
        explain: 'Remainders respect + and ×: the residues of the parts determine the residue of the whole. That’s why "mod early, mod often" is free — it’s what keeps every value small enough for ll. The one operation this does NOT cover is division, which needs inverses.',
      },
      {
        id: 'mod-9', type: 'mcq', diff: 2,
        prompt: 'A and B are huge counts you’ve been tracking mod p = 10⁹+7, and the true answer is the exact quotient A / B. How do you compute it?',
        options: [
          '`A % p * modpow(B, p - 2, p) % p` — multiply by B’s modular inverse',
          '`(A / B) % p` — divide first, then reduce',
          '`(A % p) / (B % p)` — divide the residues',
          '`modpow(A, B, p)`',
        ],
        answer: 0,
        explain: 'Residues don’t divide: 6/3 = 2, but mod 5 you’d compute 1/3 = 0. Since you only *have* A and B as residues, the true quotient is unrecoverable by `/`. Fermat rescues you: B⁻¹ ≡ Bᵖ⁻² (p prime, B not a multiple of p), so divide = multiply by modpow(B, p−2, p).',
      },
      {
        id: 'mod-10', type: 'bank', diff: 2,
        prompt: 'Precompute all factorials mod MOD (you’ll live off this table in the combinatorics lesson).',
        code: `vector<ll> f(n + 1);
f[0] = 1;
for (int i = 1; i <= n; i++)
    f[i] = f[i - 1] * ___ % ___;`,
        answer: ['i', 'MOD'],
        distractors: ['f[i]', 'n'],
        explain: 'Each factorial extends the previous by the factor i, reduced immediately — so every stored value stays below MOD and the ll multiplication never overflows. One O(n) pass, then any factorial is a lookup.',
      },
      {
        id: 'mod-11', type: 'mcq', diff: 3,
        prompt: 'CSES *Exponentiation II*: compute a^(bᶜ) mod p (p = 10⁹+7 prime; b, c up to 10⁹; a not a multiple of p). Which is correct?',
        options: [
          '`modpow(a, modpow(b, c, p - 1), p)` — exponents reduce mod p − 1',
          '`modpow(a, modpow(b, c, p), p)` — exponents reduce mod p',
          '`modpow(modpow(a, b, p), c, p)` — chain two modpows',
          'Compute bᶜ in long long, then one modpow',
        ],
        answer: 0,
        explain: 'Fermat says aᵖ⁻¹ ≡ 1, so adding p−1 to an exponent changes nothing — exponents live mod p−1, not mod p (option 2 is THE classic WA here). Chaining computes (aᵇ)ᶜ = a^(b·c), a different number entirely. And bᶜ with b, c ≈ 10⁹ has billions of digits — no type holds it.',
        hint: 'aᵖ⁻¹ ≡ 1 means the exponent only matters up to multiples of… what?',
      },
      {
        id: 'mod-12', type: 'code', diff: 3,
        prompt: 'CSES Exponentiation in miniature: first line t, then t lines `a b` (0 ≤ a, b ≤ 10⁹). For each, print aᵇ mod 10⁹+7. (Convention: 0⁰ = 1.)',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1'000'000'007;

ll modpow(ll a, ll e, ll m) {
    // square the base, halve the exponent
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        ll a, b;
        cin >> a >> b;
        cout << modpow(a, b, MOD) << "\\n";
    }
    return 0;
}`,
        tests: [
          { input: '3\n2 10\n5 0\n123456789 987654321', expected: '1024\n1\n652541198' },
          { input: '1\n0 0', expected: '1' },
          { input: '2\n1000000007 2\n3 4', expected: '0\n81' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1'000'000'007;

ll modpow(ll a, ll e, ll m) {
    ll r = 1;
    a %= m;                        // test 3: a can arrive >= m
    while (e > 0) {
        if (e & 1) r = r * a % m;  // fold in powers where e has a 1-bit
        a = a * a % m;             // a^1, a^2, a^4, ...
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        ll a, b;
        cin >> a >> b;
        cout << modpow(a, b, MOD) << "\\n";
    }
    return 0;
}`,
        explain: 'Square-and-multiply: O(log b) per query. The quiet hero is `a %= m` — test 3 feeds a = 10⁹+7 ≥ MOD, and without the reduction the very first `a * a` is (10⁹+7)² ≈ 10¹⁸… fine in ll, but a few unreduced rounds later you’d overflow. Reduce at the door.',
        hint: 'e & 1 tells you whether to multiply into the result; then square a and shift e.',
      },
    ],
    problems: [
      { name: 'Bit Strings', platform: 'CSES', id: '1617', url: 'https://cses.fi/problemset/task/1617', difficulty: 'intro', why: 'n independent on/off choices → 2ⁿ: one modpow call, and the mod-everything habit begins.' },
      { name: 'Exponentiation', platform: 'CSES', id: '1095', url: 'https://cses.fi/problemset/task/1095', difficulty: 'intro', why: 'Raw modpow reps: 2·10⁵ queries with exponents to 10⁹ — O(e) loops die, O(log e) flies.' },
      { name: 'Exponentiation II', platform: 'CSES', id: '1712', url: 'https://cses.fi/problemset/task/1712', difficulty: 'med', why: 'a^(bᶜ): the exponent must be reduced mod p−1, not mod p. Fermat or WA.' },
    ],
  },

  // ==========================================================================
  'primes-gcd': {
    id: 'primes-gcd',
    objectives: [
      'Compute gcd and lcm safely, and explain why Euclid’s algorithm is O(log n)',
      'Factor numbers by trial division to √n and sieve primes up to 10⁷',
      'Count divisors straight from the prime factorization',
    ],
    theory: [
      {
        h: 'Euclid’s gcd: two lines, log time',
        md: 'gcd(a, b) is the largest integer dividing both. Euclid’s insight: **gcd(a, b) = gcd(b, a mod b)**, bottoming out at gcd(g, 0) = g. Why it’s correct: anything dividing a and b also divides a − q·b = a mod b (and vice versa), so each step keeps *exactly the same* set of common divisors while the numbers shrink. Why it’s fast: every two steps the larger value at least halves → **O(log min(a, b))**, under ~90 steps for 64-bit inputs. In code you can also just call `__gcd(a, b)` (or C++17 `gcd`).',
        code: `ll gcd(ll a, ll b) {
    return b == 0 ? a : gcd(b, a % b);   // shrink until the remainder dies
}`,
      },
      {
        h: 'lcm, gcd over arrays, coprimality',
        md: 'lcm(a, b) = a·b / gcd(a, b) — but compute it as **a / g * b**: g divides a, so the division is exact and the intermediate never exceeds the answer. `a * b / g` overflows ll for large a, b even when the lcm itself fits.\n\ngcd folds across arrays starting from 0, because gcd(0, x) = x. The running gcd only ever shrinks — you may stop early if it hits 1. And the word **coprime** in a statement just means gcd = 1.',
        code: `ll g = 0;
for (ll v : a) g = __gcd(g, v);   // gcd of the whole array

ll lcm(ll x, ll y) {
    return x / __gcd(x, y) * y;   // divide FIRST — overflow-safe order
}`,
        note: '`x * y / g` is the bug that passes samples and dies on the max test. Divide first, always.',
        noteKind: 'warn',
      },
      {
        h: 'Trial division: factor to √n',
        md: 'Every composite n has a prime factor ≤ √n (if n = x·y with both > √n, the product would exceed n). So march d = 2, 3, 4, … while d·d ≤ n, stripping every copy of d. Composite d can never fire — its prime pieces were stripped earlier. Whatever survives above 1 afterward is a single prime factor. **O(√n)**: comfortable up to n ≈ 10¹² (10⁶ loop steps).',
        code: `vector<ll> fac;
for (ll d = 2; d * d <= n; d++)
    while (n % d == 0) {
        fac.push_back(d);       // strip one copy of d
        n /= d;
    }
if (n > 1) fac.push_back(n);    // the survivor is prime — DON'T lose it`,
        note: 'Forgetting the last line is the most common factorization bug in existence: factor 14 and get just {2}.',
        noteKind: 'danger',
      },
      {
        h: 'Sieve of Eratosthenes',
        md: 'Need primality for *every* number up to N? Sieve once: walk p upward; if p is still unmarked, it’s prime — cross out p², p²+p, p²+2p, … (smaller multiples were crossed out by smaller primes). Total work N/2 + N/3 + N/5 + … over primes = **O(N log log N)** — effectively linear; N = 10⁷ is comfortable.\n\nRecognition cue: *many* queries about numbers ≤ 10⁶–10⁷ → sieve once, answer in O(1). Variant: store each number’s smallest prime factor instead of a bool, and you can factor any x ≤ N in O(log x) hops.',
        code: `vector<bool> comp(N + 1, false);          // comp[x]: is x composite?
for (int p = 2; p <= N; p++) {
    if (comp[p]) continue;                // p survived → prime
    for (ll q = (ll)p * p; q <= N; q += p)
        comp[q] = true;                   // cross out multiples from p²
}`,
      },
      {
        h: 'Counting divisors',
        md: 'From the factorization n = p₁ᵉ¹ · p₂ᵉ² ⋯: building a divisor means independently picking an exponent 0..eᵢ for each prime → **d(n) = ∏(eᵢ + 1)**. (That’s the multiplication principle smuggled into number theory.) Example: 12 = 2²·3 → 3·2 = 6 divisors.\n\nNo factorization handy? Divisors come in pairs (d, n/d) with one member ≤ √n: loop d to √n, count 2 per hit, and subtract 1 if n is a perfect square (the root pairs with itself).',
      },
      {
        h: 'Harmonic loops: N/1 + N/2 + … ≈ N ln N',
        md: '"For every d, touch all multiples of d up to N" *looks* quadratic but costs N/1 + N/2 + ⋯ + N/N ≈ **N ln N** — about 1.4·10⁷ for N = 10⁶. This pattern builds divisor-count tables and cracks CSES *Common Divisors*: for each candidate g, count how many array values are multiples of g (via a value-frequency table); the largest g with ≥ 2 hits is the maximum pair gcd. You never enumerate pairs — you enumerate **answers** and test each cheaply.',
        code: `for (int d = 1; d <= N; d++)
    for (int m = d; m <= N; m += d)
        cnt[d] += have[m];     // how many input values d divides`,
      },
    ],
    exercises: [
      {
        id: 'pg-1', type: 'output', diff: 1,
        prompt: 'Trace Euclid by hand. Output?',
        code: `int main() {
    int a = 48, b = 18;
    while (b > 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    cout << a << "\\n";
}`,
        answer: '6',
        explain: '(48, 18) → (18, 12) → (12, 6) → (6, 0): print 6. Each step swaps in the remainder, preserving the set of common divisors while shrinking fast — three steps here, ≤ ~90 for any 64-bit pair.',
      },
      {
        id: 'pg-2', type: 'mcq', diff: 1,
        prompt: 'What is gcd(a, 0)?',
        options: [
          'a — every integer divides 0, so the common divisors of a and 0 are exactly a’s divisors',
          '0 — gcd with zero is always zero',
          '1 — zero shares no factors with anything',
          'Undefined — gcd needs two positive arguments',
        ],
        answer: 0,
        explain: 'Every d divides 0 (0 = d·0), so gcd(a, 0) = a. This anchors Euclid’s recursion *and* lets you fold gcd across an array starting from g = 0 — the first element just replaces the 0.',
      },
      {
        id: 'pg-3', type: 'tf', diff: 1,
        statement: 'If n > 1 has no divisor d with 2 ≤ d ≤ √n, then n is prime.',
        answer: true,
        explain: 'A composite n = x·y forces min(x, y) ≤ √n — otherwise the product would exceed n. That single fact is why trial division stops at √n: primality in O(√n), factorization too.',
      },
      {
        id: 'pg-4', type: 'fill', diff: 2,
        prompt: 'g = gcd(a, b) is already computed; a and b can be huge. Fill in the overflow-safe lcm:\n`ll l = ___;`',
        answer: ['a / g * b', '(a / g) * b', 'a/g*b', 'b / g * a'],
        placeholder: 'use a, b, g',
        explain: 'Divide FIRST: a/g is exact (g divides a) and the intermediate stays ≤ the lcm itself. `a * b / g` computes the possibly-astronomical product before dividing — overflow garbage even though the final lcm fits.',
      },
      {
        id: 'pg-5', type: 'mcq', diff: 2,
        prompt: 'This factorization loop has a classic bug. Factoring 14 produces…',
        code: `vector<ll> fac;
for (ll d = 2; d * d <= n; d++)
    while (n % d == 0) {
        fac.push_back(d);
        n /= d;
    }
// (nothing after the loop)`,
        options: [
          '{2} — after stripping 2, n = 7, but 7·7 > 14 ends the loop; the leftover prime needs `if (n > 1) fac.push_back(n);`',
          '{2, 7} — the loop handles everything',
          '{7} — small factors are skipped',
          'An infinite loop — n never reaches 1',
        ],
        answer: 0,
        explain: 'Any prime factor larger than √(original n) survives the loop as the final value of n — it must be appended explicitly. One missing line, thousands of real WAs. Burn it in: *strip to √n, then keep the survivor*.',
        hint: 'Walk it: d = 2 strips 14 → 7. What does the loop condition say when d = 3?',
      },
      {
        id: 'pg-6', type: 'output', diff: 2,
        prompt: 'Counting divisors by pairing. Output?',
        code: `int main() {
    int n = 36, cnt = 0;
    for (int d = 1; d * d <= n; d++) {
        if (n % d == 0) {
            cnt += 2;                  // d and n/d
            if (d * d == n) cnt--;     // the square root pairs with itself
        }
    }
    cout << cnt << "\\n";
}`,
        answer: '9',
        explain: 'Hits: d = 1, 2, 3, 4 each add 2 (pairing with 36, 18, 12, 9), and d = 6 adds 1 since 6·6 = 36. Total 9: {1,2,3,4,6,9,12,18,36}. Cross-check with the formula: 36 = 2²·3² → (2+1)(2+1) = 9. ✓',
      },
      {
        id: 'pg-7', type: 'bank', diff: 2,
        prompt: 'Complete the sieve of Eratosthenes.',
        code: `vector<bool> comp(N + 1, false);
for (int p = 2; p <= N; p++) {
    if (comp[p]) continue;            // p survived → prime
    for (ll q = (ll)p * ___; q <= N; q += ___)
        comp[q] = ___;
}`,
        answer: ['p', 'p', 'true'],
        distractors: ['p + 1', 'false'],
        explain: 'Cross out p², p²+p, p²+2p, … — multiples below p² were already killed by smaller primes. The step is p (jump multiple to multiple), and the mark means "composite". The `(ll)` cast matters: p·p overflows int when N approaches 10⁵²-ish… more precisely, for N near 2¹⁵·2¹⁵ ≈ 10⁹.',
      },
      {
        id: 'pg-8', type: 'mcq', diff: 2,
        prompt: 'n = 2³ · 5² · 7. How many divisors does n have?',
        options: ['24', '6', '12', '9'],
        answer: 0,
        explain: 'Each divisor independently picks an exponent: for 2 one of {0,1,2,3} (4 ways), for 5 one of {0,1,2} (3 ways), for 7 one of {0,1} (2 ways) → 4·3·2 = 24. Multiplying raw exponents (3·2·1 = 6) and forgetting that the lone 7 still doubles the count (12) are the standard slips.',
      },
      {
        id: 'pg-9', type: 'mcq', diff: 2,
        prompt: 'q = 10⁵ queries of "is x prime?" with x ≤ 10⁶. Which plan is the comfortable winner?',
        options: [
          'Sieve composites up to 10⁶ once (~10⁷ ops), then answer each query with one array lookup',
          'Trial-divide each query separately up to √x',
          'For each query, test divisibility by every number below x',
          'Precompute primality of every number 1..10⁶ by trial-dividing each one',
        ],
        answer: 0,
        explain: 'Many queries over a small universe = sieve territory. Per-query trial division is ~10⁵ · 10³ = 10⁸ — coin-flip TLE; option 3 is 10¹¹ and option 4 ~10⁹, both dead. The sieve does less total work than ONE pass of option 4 and answers everything in O(1).',
      },
      {
        id: 'pg-10', type: 'output', diff: 2,
        prompt: 'Folding gcd across an array. Output?',
        code: `int main() {
    vector<int> a = {36, 60, 24, 48};
    int g = 0;
    for (int x : a) g = __gcd(g, x);
    cout << g << "\\n";
}`,
        answer: '12',
        explain: 'gcd(0, 36) = 36, then gcd(36, 60) = 12, then 12 stays through 24 and 48. Starting at 0 works because gcd(0, x) = x; and since the running gcd only shrinks, you could break early if it ever hit 1.',
      },
      {
        id: 'pg-11', type: 'mcq', diff: 3,
        prompt: 'CSES *Common Divisors*: n ≤ 2·10⁵ values, each ≤ 10⁶. Find the maximum gcd over all pairs. Which approach fits the budget?',
        options: [
          'For d = 10⁶ down to 1: count how many array values are multiples of d (value-frequency table + harmonic loop); the first d with ≥ 2 hits is the answer',
          'Compute __gcd for all ~n²/2 pairs and take the max',
          'Sort the array — the answer is the gcd of the two largest values',
          'The answer is the gcd of the entire array',
        ],
        answer: 0,
        explain: 'Flip from "which pair?" to "which answer?": d is achievable iff at least two values are multiples of d, and testing all d via multiples is Σ 10⁶/d ≈ 2·10⁷ ops. All-pairs is 2·10¹⁰ — dead. The largest values needn’t win (gcd(12, 18) = 6 beats gcd(18, 25) = 1), and the whole-array gcd is a *lower* bound, not the pair max.',
        hint: 'Don’t enumerate pairs. Enumerate candidate answers and test each one cheaply.',
      },
      {
        id: 'pg-12', type: 'code', diff: 3,
        prompt: 'Read one integer n (2 ≤ n ≤ 10¹²). Print its prime factorization in nondecreasing order, space-separated, repeating repeated factors.\nExample: `84` → `2 2 3 7`.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ll n;
    cin >> n;
    // trial division to sqrt(n) — and don't lose the leftover prime!
    // your code here

    return 0;
}`,
        tests: [
          { input: '84', expected: '2 2 3 7' },
          { input: '97', expected: '97' },
          { input: '999966000289', expected: '999983 999983' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ll n;
    cin >> n;
    vector<ll> fac;
    for (ll d = 2; d * d <= n; d++)
        while (n % d == 0) {
            fac.push_back(d);        // strip every copy of d
            n /= d;
        }
    if (n > 1) fac.push_back(n);     // the surviving prime > sqrt(original)
    for (int i = 0; i < (int)fac.size(); i++) {
        if (i) cout << ' ';
        cout << fac[i];
    }
    cout << "\\n";
    return 0;
}`,
        explain: 'Test 2 (97 is prime — the loop never fires) and test 3 (999983², so d climbs to 10⁶) both target the war-story bugs: the forgotten leftover prime, and `int d` overflowing in `d * d`. Use ll for d and append the survivor — always.',
        hint: 'Two traps: what type must d be so d*d doesn’t overflow, and what remains in n after the loop?',
      },
    ],
    problems: [
      { name: 'Almost Prime', platform: 'Codeforces', id: '26A', rating: 900, url: 'https://codeforces.com/problemset/problem/26/A', difficulty: 'intro', why: 'Count numbers ≤ 3000 with exactly two distinct prime divisors — a sieve that counts instead of marks.' },
      { name: 'T-primes', platform: 'Codeforces', id: '230B', rating: 1300, url: 'https://codeforces.com/problemset/problem/230/B', difficulty: 'easy', why: 'Exactly three divisors ⇔ square of a prime: sieve to 10⁶, then test each x via its integer square root.' },
      { name: 'Counting Divisors', platform: 'CSES', id: '1713', url: 'https://cses.fi/problemset/task/1713', difficulty: 'easy', why: 'd(x) for 10⁵ queries: pair divisors up to √x, or precompute the whole table with a harmonic sieve.' },
      { name: 'Common Divisors', platform: 'CSES', id: '1081', url: 'https://cses.fi/problemset/task/1081', difficulty: 'med', why: 'Max gcd of any pair — never touch pairs: count multiples of each candidate d with a harmonic loop.' },
    ],
  },

  // ==========================================================================
  'combinatorics': {
    id: 'combinatorics',
    objectives: [
      'Translate counting stories into n!, nCr, stars-and-bars, or multiset formulas',
      'Precompute factorials and inverse factorials for O(1) binomials mod p',
      'Wield complement counting and pigeonhole arguments',
    ],
    theory: [
      {
        h: 'Count choices, not objects',
        md: 'Most counting problems ask "how many objects of this shape exist?" Describe one object as a **sequence of decisions** and multiply the choice counts: 4 mains × 3 drinks × 2 desserts = 24 lunches. Multiply when choices stack; add only for mutually exclusive alternatives.\n\nOrdering n distinct things: n choices, then n−1, then n−2, … → **n!** arrangements. Independent yes/no over n items → **2ⁿ**. Recognition cue: the words *how many ways / strings / arrangements* — start by building one object step by step.',
      },
      {
        h: 'n choose r',
        md: '**C(n, r)** counts size-r subsets of n distinct items — order does NOT matter. Derivation: n·(n−1)⋯(n−r+1) ordered picks, and each subset got counted r! times (once per internal order), so divide: C(n, r) = n! / (r!·(n−r)!).\n\nTwo identities you’ll use weekly: **symmetry** C(n, r) = C(n, n−r) (choosing who’s in = choosing who’s out) and **Pascal** C(n, r) = C(n−1, r−1) + C(n−1, r) (item n is either in the subset or it isn’t).',
      },
      {
        h: 'nCr mod p: the factorial machine',
        md: 'Factorials overflow at 21!, so contests compute C(n, r) mod 10⁹+7 with precomputed factorials and **inverse factorials**: one O(N) pass, one Fermat modpow, one downward pass — then every binomial costs three multiplications.',
        code: `vector<ll> f(N + 1), inv(N + 1);
f[0] = 1;
for (int i = 1; i <= N; i++) f[i] = f[i - 1] * i % MOD;   // factorials
inv[N] = modpow(f[N], MOD - 2, MOD);                      // ONE Fermat call
for (int i = N; i >= 1; i--) inv[i - 1] = inv[i] * i % MOD; // walk down

ll C(int n, int r) {
    if (r < 0 || r > n) return 0;             // the guard that saves you
    return f[n] * inv[r] % MOD * inv[n - r] % MOD;
}`,
        note: 'Keep the `r < 0 || r > n → 0` guard. Formulas like C(n−1, k−1) go out of range on edge inputs constantly.',
      },
      {
        h: 'Stars and bars',
        md: 'Distribute n **identical** items into k **distinct** bins (zeros allowed): write the n items as stars and insert k−1 bars to slice them into k runs — `★★|★||★★★` is one distribution to 4 bins. Every arrangement of n stars and k−1 bars is one outcome, so choose the bar positions among all n+k−1 symbols: **C(n + k − 1, k − 1)**.\n\nCSES *Distributing Apples* is exactly this, verbatim. Want every bin ≥ 1? Pre-deal one item to each bin first: C(n − 1, k − 1).',
      },
      {
        h: 'Repeated letters and complements',
        md: 'Arrangements of a word with repeated letters: take all n! orders, then divide out the indistinguishable internal shuffles of each letter group: **n! / ∏(cnt!)**. AABB → 4!/(2!·2!) = 6 (*Creating Strings II*; under a mod, "divide" = multiply by inverse factorials).\n\n**Complement counting**: "at least one X" is painful head-on but trivial backwards: **total − (none)**. Whenever a direct count would multi-count overlapping cases, count the opposite side and subtract.',
      },
      {
        h: 'Pigeonhole and symmetry',
        md: '**Pigeonhole**: more than k·m objects in m boxes → some box holds more than k. Sounds trivial; wins problems. Classic: any 11 numbers from 1..20 contain two summing to 21 — the ten pairs (1,20), (2,19), …, (10,11) are the boxes. The craft is *inventing the boxes*.\n\n**Symmetry**: count ordered versions, then divide by the overcount factor. Unordered pairs = n(n−1)/2, since each pair was seen twice. If the judge’s expected answer is exactly half (or 1/k!) of yours, you counted ordered objects.',
      },
    ],
    exercises: [
      {
        id: 'comb-1', type: 'mcq', diff: 1,
        prompt: 'A menu has 4 mains, 3 drinks, and 2 desserts. How many different (main, drink, dessert) meals exist?',
        options: ['24', '9', '12', '14'],
        answer: 0,
        explain: 'Independent stacked choices multiply: 4 · 3 · 2 = 24. Adding (4 + 3 + 2 = 9) is the classic mix-up — addition counts *alternatives* (pick a main OR a drink), not combinations.',
      },
      {
        id: 'comb-2', type: 'output', diff: 1,
        prompt: 'What does this print?',
        code: `int main() {
    long long f = 1;
    for (int i = 1; i <= 6; i++) f *= i;
    cout << f << "\\n";
}`,
        answer: '720',
        explain: '6! = 720: the number of ways to order 6 distinct items. Mind the type: 20! ≈ 2.4·10¹⁸ still fits long long, 21! does not — which is exactly why big counting problems work mod 10⁹+7.',
      },
      {
        id: 'comb-3', type: 'mcq', diff: 1,
        prompt: 'How many 2-person teams can you form from 5 people?',
        options: ['10', '20', '25', '7'],
        answer: 0,
        explain: 'C(5, 2) = 10: there are 5·4 = 20 *ordered* picks, and each team was counted twice (AB = BA) → divide by 2!. Dividing by r! is precisely what makes order stop mattering.',
      },
      {
        id: 'comb-4', type: 'tf', diff: 1,
        statement: 'C(20, 17) and C(20, 3) are the same number.',
        answer: true,
        explain: 'Choosing the 17 who play is the same act as choosing the 3 who sit out: C(n, r) = C(n, n−r) — both are 1140. Practical bonus: compute the smaller side when doing it by hand.',
      },
      {
        id: 'comb-5', type: 'multi', diff: 2,
        prompt: 'C(6, 2): select EVERY expression equal to it.',
        options: [
          '15',
          'C(6, 4)',
          '6! / (2! · 4!)',
          '6 · 5',
          'C(5, 1) + C(5, 2)',
        ],
        answers: [0, 1, 2, 4],
        explain: 'C(6, 2) = 15; symmetry gives C(6, 4); the factorial formula is the definition; and Pascal splits on whether item 6 is chosen: C(5, 1) (it is — pick 1 more) + C(5, 2) (it isn’t). The impostor 6·5 = 30 counts *ordered* picks — divide by 2! to repair.',
      },
      {
        id: 'comb-6', type: 'output', diff: 2,
        prompt: 'Pascal’s triangle, bottom-up. Output?',
        code: `int main() {
    int C[5][5] = {};
    for (int n = 0; n <= 4; n++) {
        C[n][0] = 1;
        for (int r = 1; r <= n; r++)
            C[n][r] = C[n - 1][r - 1] + C[n - 1][r];
    }
    cout << C[4][2] << "\\n";
}`,
        answer: '6',
        explain: 'Rows build 1 / 1 1 / 1 2 1 / 1 3 3 1 / 1 4 6 4 1 — C(4, 2) = 6. Pascal’s rule is "the newest item is in or out". This O(n²) table is the right tool when n ≤ ~2000 or when no mod is given; factorials + inverses take over for n = 10⁵+.',
      },
      {
        id: 'comb-7', type: 'fill', diff: 2,
        prompt: 'n identical candies go to k distinct kids (a kid may get zero). Write the count as one binomial:',
        answer: ['C(n + k - 1, k - 1)', 'C(n+k-1, k-1)', 'C(n+k-1,k-1)', 'C(n + k - 1, n)', 'C(n+k-1, n)'],
        placeholder: 'C(… , …)',
        explain: 'Stars and bars: lay out n stars, choose where the k−1 bars sit among the n+k−1 symbols → C(n+k−1, k−1). (Choosing the n star positions instead gives the equal C(n+k−1, n).) Identical items + distinct bins is the trigger for this formula.',
      },
      {
        id: 'comb-8', type: 'mcq', diff: 2,
        prompt: 'f[] holds factorials already reduced mod MOD. What’s wrong with this nCr?',
        code: `ll C(int n, int r) {
    return f[n] / (f[r] * f[n - r]) % MOD;
}`,
        options: [
          'You can’t divide residues — that’s integer division of remainders, not modular division. Multiply by precomputed inverse factorials instead',
          'Store the factorials WITHOUT the mod so the division is exact',
          'Compute in double and round at the end',
          'Nothing: division distributes over mod the same way multiplication does',
        ],
        answer: 0,
        explain: 'Once reduced, the true quotient is unrecoverable with `/`: 6/3 = 2, but mod 5 that’s 1/3 = 0. Unreduced factorials overflow at 21!, and doubles lose exactness near 2⁵³ — both "fixes" are traps. The road is Fermat: multiply by modpow(f[r], MOD−2, MOD), precomputed as inverse factorials.',
      },
      {
        id: 'comb-9', type: 'mcq', diff: 2,
        prompt: 'How many lowercase strings of length 8 contain **at least one** vowel? (5 vowels, 21 consonants.)',
        options: [
          '26⁸ − 21⁸',
          '5 · 26⁷',
          '26⁸ − 5⁸',
          '5 · 21⁷',
        ],
        answer: 0,
        explain: '"At least one" → complement: all strings minus the vowel-free ones (all-consonant = 21⁸). The seductive 5·26⁷ ("place a vowel, fill the rest") counts a string once per vowel it contains — triple-counting three-vowel strings. When direct counting overlaps, count the opposite and subtract.',
      },
      {
        id: 'comb-10', type: 'match', diff: 2,
        prompt: 'Match each counting story to its formula.',
        pairs: [
          ['orderings of n distinct books', 'n!'],
          ['size-r teams from n people', 'C(n, r)'],
          ['n identical coins to k distinct kids', 'C(n + k − 1, k − 1)'],
          ['arrangements of AABBB', '5! / (2! · 3!)'],
          ['binary strings of length n', '2ⁿ'],
        ],
        explain: 'The five core shapes: order matters → n!; choose without order → nCr; identical into distinct → stars and bars; repeated letters → divide internal shuffles; independent yes/no per position → 2ⁿ. Most counting problems are one of these wearing a costume.',
      },
      {
        id: 'comb-11', type: 'order', diff: 2,
        prompt: 'Order the steps of the O(1)-per-query nCr pipeline (mod p, queries up to n = 10⁵).',
        items: [
          'Build f[0..N]: f[i] = f[i−1] · i % MOD',
          'One Fermat call: inv[N] = modpow(f[N], MOD − 2, MOD)',
          'Walk down: inv[i−1] = inv[i] · i % MOD',
          'Answer each query: f[n] · inv[r] % MOD · inv[n−r] % MOD',
        ],
        explain: 'One O(N) pass, ONE modpow, one downward pass — the descending fill converts a single inverse into all of them (inv[i−1] = inv[i]·i works because 1/(i−1)! = i/i!). After that, 10⁵ queries cost three multiplications each.',
      },
      {
        id: 'comb-12', type: 'mcq', diff: 3,
        prompt: 'You pick ANY 11 distinct numbers from 1..20. Which outcome is *guaranteed*?',
        options: [
          'Two of them sum to exactly 21',
          'At least one of them is prime',
          'Two of them are both multiples of 5',
          'Their total is even',
        ],
        answer: 0,
        explain: 'Pigeonhole with invented boxes: the ten pairs (1,20), (2,19), …, (10,11) each sum to 21. Eleven numbers into ten boxes → some box is fully taken. The rest fail by counterexample: 1..20 has 12 non-primes (pick 11 of those), only 4 multiples of 5 (avoidable), and the total’s parity swings freely.',
        hint: 'Build ten boxes such that grabbing two numbers from the same box forces the conclusion.',
      },
      {
        id: 'comb-13', type: 'code', diff: 3,
        prompt: 'Read q, then q lines of `n r` (0 ≤ r ≤ n ≤ 10⁵). Print C(n, r) mod 10⁹+7 for each — precompute factorials and inverse factorials so every query is O(1).',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1'000'000'007;
const int N = 100000;

ll f[N + 1], inv[N + 1];

ll modpow(ll a, ll e, ll m) {
    ll r = 1;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // 1) factorials  2) inv[N] via Fermat  3) walk inv down  4) answer queries

    return 0;
}`,
        tests: [
          { input: '4\n5 2\n7 0\n4 4\n1000 500', expected: '10\n1\n1\n159835829' },
          { input: '3\n1 0\n1 1\n52 5', expected: '1\n1\n2598960' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll MOD = 1'000'000'007;
const int N = 100000;

ll f[N + 1], inv[N + 1];

ll modpow(ll a, ll e, ll m) {
    ll r = 1;
    a %= m;
    while (e > 0) {
        if (e & 1) r = r * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return r;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    f[0] = 1;
    for (int i = 1; i <= N; i++) f[i] = f[i - 1] * i % MOD;   // factorials
    inv[N] = modpow(f[N], MOD - 2, MOD);                      // one Fermat
    for (int i = N; i >= 1; i--) inv[i - 1] = inv[i] * i % MOD; // walk down
    int q;
    cin >> q;
    while (q--) {
        int n, r;
        cin >> n >> r;
        cout << f[n] * inv[r] % MOD * inv[n - r] % MOD << "\\n";
    }
    return 0;
}`,
        explain: 'This is the exact engine behind CSES Binomial Coefficients, Distributing Apples, Creating Strings II, and Bracket Sequences. Note the chained reduction `f[n] * inv[r] % MOD * inv[n-r] % MOD` — reducing between the two multiplications keeps every product under 10¹⁸.',
        hint: 'Precompute once before reading queries. C(n, r) = f[n] · inv[r] · inv[n−r], reducing after each multiply.',
      },
    ],
    problems: [
      { name: 'Binomial Coefficients', platform: 'CSES', id: '1079', url: 'https://cses.fi/problemset/task/1079', difficulty: 'easy', why: 'The factorial + inverse-factorial machine, verbatim: 10⁵ queries of C(n, r) mod 10⁹+7.' },
      { name: 'Distributing Apples', platform: 'CSES', id: '1716', url: 'https://cses.fi/problemset/task/1716', difficulty: 'easy', why: 'Stars and bars in the wild: identical apples, distinct kids — recognize the story, print one binomial.' },
      { name: 'Creating Strings II', platform: 'CSES', id: '1715', url: 'https://cses.fi/problemset/task/1715', difficulty: 'easy', why: 'Multiset permutations: n! divided (via inverse factorials) by every letter count’s factorial.' },
      { name: 'Bracket Sequences I', platform: 'CSES', id: '2064', url: 'https://cses.fi/problemset/task/2064', difficulty: 'med', why: 'Balanced sequences of length 2n = the Catalan number C(2n, n)/(n+1) — your nCr engine plus one inverse.' },
    ],
  },

  // ==========================================================================
  'backtracking': {
    id: 'backtracking',
    objectives: [
      'Generate all subsets and permutations with recursive choice trees',
      'Estimate search size (2ⁿ, n!) from the constraints before writing code',
      'Prune branches with feasibility and bounding arguments',
      'Solve queens-style placement with O(1) conflict arrays',
    ],
    theory: [
      {
        h: 'A recursion tree of choices',
        md: 'Backtracking is DFS over **partial solutions**: at each node, try every legal choice, recurse deeper, then *undo* the choice so the next branch starts from a clean state. Done honestly, it visits every complete solution exactly once — exhaustive search with a skeleton you’ll reuse forever.\n\nRecognition cues: tiny constraints (n ≤ ~20), "count/list all…", or optimization with no greedy/DP structure in sight.',
        code: `void rec(/* state */) {
    if (/* solution complete */) { /* record / count it */ return; }
    for (/* each legal choice */) {
        // apply the choice
        rec(/* deeper */);
        // UNDO the choice — the "back" in backtracking
    }
}`,
      },
      {
        h: 'All subsets: include or exclude',
        md: 'Each element is either in or out: two branches per level, n levels → **2ⁿ leaves**, one per subset. The only discipline: every `push_back` is paired with a `pop_back` after the recursive call returns.',
        code: `int n; vector<int> a, cur;
void rec(int i) {
    if (i == n) { /* cur is one finished subset */ return; }
    rec(i + 1);               // branch 1: exclude a[i]
    cur.push_back(a[i]);      // branch 2: include a[i]
    rec(i + 1);
    cur.pop_back();           // undo — ALWAYS paired with the push
}`,
        note: 'The bitmask loop from this unit’s first lesson enumerates the same 2ⁿ subsets iteratively. Two dialects, one search — use whichever fits the problem’s bookkeeping.',
      },
      {
        h: 'All permutations: used[] or next_permutation',
        md: 'Build the permutation slot by slot; `used[i]` marks which items are already placed. n choices, then n−1, … → **n! leaves**. For strings with repeated letters, the cleanest tool is `next_permutation` on a *sorted* string — it emits each distinct arrangement exactly once (CSES *Creating Strings*).',
        code: `int n; vector<int> perm; vector<bool> used;
void rec() {
    if ((int)perm.size() == n) { /* one permutation */ return; }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;          // already placed
        used[i] = true;  perm.push_back(i);
        rec();
        used[i] = false; perm.pop_back();   // restore both!
    }
}

// duplicates handled free:
sort(s.begin(), s.end());
do { /* use s */ } while (next_permutation(s.begin(), s.end()));`,
      },
      {
        h: 'Prune or perish',
        md: 'The tree is exponential; speed comes from never *entering* hopeless subtrees. Two prune families:\n\n**Feasibility** — the partial solution already breaks a rule → stop. **Bounding** — even a perfect finish can’t beat the best found so far → stop. Both cut only branches that cannot matter, so the answer is unchanged. Order choices to fail fast (try the most constrained option first). Pruning gives no complexity *guarantee* — but in practice it’s the gap between 0.1 s and the heat death of the universe (see Grid Paths).',
      },
      {
        h: 'N-queens: O(1) conflict checks',
        md: 'Place one queen per row — rows can never clash by construction. Square (r, c) is attacked iff its **column**, its ↗ anti-diagonal (constant **r + c**), or its ↘ diagonal (constant **r − c**, shifted by +n to stay non-negative) is occupied. Three boolean arrays make each check O(1):',
        code: `int n = 8;
vector<int> col(n), d1(2 * n), d2(2 * n);
long long ways = 0;
void rec(int r) {
    if (r == n) { ways++; return; }
    for (int c = 0; c < n; c++) {
        if (col[c] || d1[r + c] || d2[r - c + n]) continue;  // attacked
        col[c] = d1[r + c] = d2[r - c + n] = 1;              // place
        rec(r + 1);
        col[c] = d1[r + c] = d2[r - c + n] = 0;              // remove
    }
}`,
      },
      {
        h: 'Reading the budget',
        md: 'Memorize: 2¹⁰ ≈ 10³, **2²⁰ ≈ 10⁶**, 10! ≈ 3.6·10⁶, 13! ≈ 6·10⁹ (dead). So: n ≤ 11 → permutations fit; n ≤ 20-25 → subsets fit; n ≈ 40 → 2ⁿ alone doesn’t, split in half and meet in the middle (a later trick).\n\nThe *Apple Division* special: 20 values up to 10⁹ — a group’s sum reaches 2·10¹⁰, so the sums **must be long long** even though every single input fits int.',
        note: 'Estimate leaves × work-per-leaf BEFORE coding. At ≥ ~10⁸ simple ops with no prune in sight, redesign instead of submitting a prayer.',
        noteKind: 'warn',
      },
    ],
    exercises: [
      {
        id: 'bt-1', type: 'output', diff: 1,
        prompt: 'Count the leaves of the include/exclude tree. Output?',
        code: `int cnt = 0;
void rec(int i, int n) {
    if (i == n) { cnt++; return; }
    rec(i + 1, n);    // exclude item i
    rec(i + 1, n);    // include item i
}

int main() {
    rec(0, 4);
    cout << cnt << "\\n";
}`,
        answer: '16',
        explain: 'Two branches per level, four levels → 2⁴ = 16 leaves, one per subset of 4 items. This doubling is exactly why n ≤ 20-ish is the constraint that licenses subset brute force (2²⁰ ≈ 10⁶).',
      },
      {
        id: 'bt-2', type: 'mcq', diff: 1,
        prompt: 'How many leaves does the full permutation tree over n distinct items have?',
        options: ['n!', '2ⁿ', 'n²', 'nⁿ'],
        answer: 0,
        explain: 'Level k offers n−k remaining choices: n · (n−1) ⋯ 1 = n!. Keep the two trees straight: include/exclude → 2ⁿ subsets; slot-filling without reuse → n! permutations; nⁿ would mean reuse is allowed (sequences, not permutations).',
      },
      {
        id: 'bt-3', type: 'output', diff: 1,
        prompt: 'Each call prints on the way IN and on the way OUT. Output?',
        code: `void rec(int i) {
    if (i == 3) return;
    cout << i;
    rec(i + 1);
    cout << i;
}

int main() { rec(0); }`,
        answer: '012210',
        explain: 'Descend printing 0 1 2, bounce off the base case, unwind printing 2 1 0 — nested like brackets: 0(1(2()2)1)0. That in/out rhythm is apply/undo in every backtracking function; most bugs are a missing "on the way out" step.',
      },
      {
        id: 'bt-4', type: 'output', diff: 2,
        prompt: 'This prints all 3! = 6 permutations of `abc`, one per line, choosing the smallest unused index first. What are the FIRST TWO lines?',
        code: `int n = 3;
string cur;
bool used[3];

void rec() {
    if ((int)cur.size() == n) { cout << cur << "\\n"; return; }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = true;
        cur += char('a' + i);
        rec();
        used[i] = false;
        cur.pop_back();
    }
}

int main() { rec(); }`,
        answer: 'abc\nacb',
        explain: 'DFS dives leftmost: a, then b, then c → `abc`. Backtracking unwinds the *deepest* choice first: c and b pop, the depth-1 loop advances to c, then b fills in → `acb`. Ascending-index choice order makes the output lexicographic for free.',
        hint: 'Which choice gets revised first when the search backs up — the earliest or the latest?',
      },
      {
        id: 'bt-5', type: 'mcq', diff: 2,
        prompt: 'This subset generator is broken. What’s the bug?',
        code: `vector<int> cur;
void rec(int i) {
    if (i == n) { look(cur); return; }
    cur.push_back(a[i]);   // include a[i]
    rec(i + 1);
    rec(i + 1);            // exclude a[i] ... right?
}`,
        options: [
          'No `cur.pop_back()` between the calls — the "exclude" branch runs with a[i] still inside cur',
          'Calling rec twice visits every subset twice — one call is enough',
          'The base case is off by one: it should stop at i == n − 1',
          'push_back before recursing reverses the subset order, which breaks the search',
        ],
        answer: 0,
        explain: 'The backtracking contract: every mutation is undone before the next branch. As written, the second call inherits a[i] — every "subset" downstream is polluted with ghosts. Fix: `cur.pop_back();` between the calls (or pass the state by value and let copies undo for you).',
        hint: 'State of cur at the moment the second rec(i + 1) starts: what’s in it?',
      },
      {
        id: 'bt-6', type: 'parsons', diff: 2,
        prompt: 'Assemble the Apple Division recursion: every weight joins group 1 or group 2 (in that order); at the end, update the best |difference|.',
        lines: [
          'void rec(int i, ll s1, ll s2) {',
          '    if (i == n) {',
          '        best = min(best, abs(s1 - s2));',
          '        return;',
          '    }',
          '    rec(i + 1, s1 + a[i], s2);',
          '    rec(i + 1, s1, s2 + a[i]);',
          '}',
        ],
        distractors: [
          '    rec(i, s1 + a[i], s2);',
        ],
        explain: 'Passing the sums **by value** makes undo automatic — every call owns its own copy, so there’s nothing to restore. The distractor recurses with the same i: no progress toward the base case → infinite recursion → stack overflow. And the sums are ll: 20 weights × 10⁹ = 2·10¹⁰.',
      },
      {
        id: 'bt-7', type: 'fill', diff: 2,
        prompt: 'Squares (r, c) and (r′, c′) share a ↘ diagonal exactly when r − c = r′ − c′, but r − c can be negative. Fill in the standard non-negative array index:\n`d2[___]++;`',
        answer: ['r - c + n', 'r-c+n', 'n + r - c', 'r + n - c'],
        placeholder: 'r … c … n',
        explain: 'r − c spans −(n−1) .. n−1; adding n shifts it into 1 .. 2n−1, safe for an array of size 2n. The ↗ anti-diagonals are even easier: r + c is already non-negative (0 .. 2n−2). Negative diagonal indices are the #1 n-queens runtime error.',
      },
      {
        id: 'bt-8', type: 'mcq', diff: 2,
        prompt: 'In n-queens, why keep `col[]`, `d1[]`, `d2[]` occupancy arrays instead of scanning the board for attacks at every placement?',
        options: [
          'Each placement test drops from O(n) to O(1) — inside an exponential tree, per-node cost is everything',
          'Scanning the board misses diagonal attacks',
          'The arrays shrink the number of leaves in the search tree',
          'It lets two queens safely share a row',
        ],
        answer: 0,
        explain: 'Both methods are *correct* and explore the same tree — the arrays don’t prune anything, they make every node cheaper. Multiply any per-node cost by ~thousands of nodes and constant-factor discipline becomes the difference between instant and sluggish.',
      },
      {
        id: 'bt-9', type: 'tf', diff: 2,
        statement: 'A sound prune — one that only cuts branches provably unable to contain a valid or better solution — can never change the final answer, only the running time.',
        answer: true,
        explain: 'That’s the contract that makes pruning safe. The corollary is the discipline: before adding a prune, *argue* why every cut branch is hopeless. A "prune" that can discard the optimum isn’t an optimization — it’s a wrong answer with good performance.',
      },
      {
        id: 'bt-10', type: 'match', diff: 2,
        prompt: 'Match the constraint to the exhaustive-search plan it whispers.',
        pairs: [
          ['n ≤ 11', 'all n! permutations — ≈ 4·10⁷ worst case'],
          ['n ≤ 20', 'all 2ⁿ subsets — ≈ 10⁶ masks'],
          ['n ≈ 40', '2ⁿ too big whole — split in half, meet in the middle'],
          ['n ≤ 10⁵', 'exhaustive search is dead — find structure instead'],
        ],
        explain: 'Budget table: 11! ≈ 4·10⁷ (borderline but fine), 2²⁰ ≈ 10⁶ (easy), 2⁴⁰ ≈ 10¹² (needs the split-in-half trick you’ll meet later), and large n means greedy/DP/data structures. Read n before designing — the constraint *is* the hint.',
      },
      {
        id: 'bt-11', type: 'mcq', diff: 3,
        prompt: 'CSES *Grid Paths*: a 48-move path must visit every cell of a 7×7 grid. Plain DFS is hopeless. The famous prune fires when…',
        options: [
          'the path hits the border or a visited square head-on while the cells to its left and right are both free — the unvisited region splits, and one side can never be reached',
          'the path moves away from the goal corner — correct paths must always approach the target',
          'more than half the moves are used — the second half is forced by symmetry',
          'the current cell touches any visited cell — revisits are about to happen',
        ],
        answer: 0,
        explain: 'A single continuing path can only fill ONE connected region — slamming head-first into an obstacle with both sides open cuts the free area in two, so no completion exists and the branch dies instantly. This observation (plus halving by first-move symmetry) collapses the search from days to milliseconds. The others are wrong: valid paths snake away from the goal constantly, and "touches a visited cell" prunes legal paths.',
        hint: 'What does hitting a wall head-on do to the connectivity of the cells you still must visit?',
      },
      {
        id: 'bt-12', type: 'code', diff: 3,
        prompt: 'Apple Division in miniature: read n (1 ≤ n ≤ 20), then n weights (each ≤ 10⁹). Split them into two groups and print the minimum possible |sum₁ − sum₂|.',
        starter: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n;
ll a[25], best;

void rec(int i, ll s1, ll s2) {
    // base case: all weights assigned → update best
    // otherwise: try a[i] in group 1, then in group 2
}

int main() {
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    best = LLONG_MAX;
    rec(0, 0, 0);
    cout << best << "\\n";
    return 0;
}`,
        tests: [
          { input: '5\n3 2 7 4 1', expected: '1' },
          { input: '4\n2 2 2 2', expected: '0' },
          { input: '3\n1000000000 1000000000 1000000000', expected: '1000000000' },
        ],
        solution: `#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int n;
ll a[25], best;

void rec(int i, ll s1, ll s2) {
    if (i == n) {                        // every weight assigned
        best = min(best, abs(s1 - s2));
        return;
    }
    rec(i + 1, s1 + a[i], s2);           // a[i] joins group 1
    rec(i + 1, s1, s2 + a[i]);           // a[i] joins group 2
}

int main() {
    cin >> n;
    for (int i = 0; i < n; i++) cin >> a[i];
    best = LLONG_MAX;
    rec(0, 0, 0);
    cout << best << "\\n";
    return 0;
}`,
        explain: 'Each weight has two destinations → 2ⁿ ≤ 2²⁰ ≈ 10⁶ assignments, instant. Test 3 is the war story: one group holds 2·10⁹ — past INT_MAX — so the sums must be ll. By-value parameters give you undo for free; the bitmask loop from the bitops lesson would solve it too.',
        hint: 'State = (index, sum1, sum2). At i == n compare |s1 − s2| with the best. What type do the sums need?',
      },
    ],
    problems: [
      { name: 'Creating Strings', platform: 'CSES', id: '1622', url: 'https://cses.fi/problemset/task/1622', difficulty: 'intro', why: 'All distinct permutations of a word — used[] recursion, or sort + next_permutation.' },
      { name: 'Apple Division', platform: 'CSES', id: '1623', url: 'https://cses.fi/problemset/task/1623', difficulty: 'easy', why: 'n ≤ 20 whispers 2ⁿ: assign each apple a side and track both sums in long long.' },
      { name: 'Chessboard and Queens', platform: 'CSES', id: '1624', url: 'https://cses.fi/problemset/task/1624', difficulty: 'easy', why: '8-queens with reserved squares: place row by row, O(1) column/diagonal conflict arrays.' },
      { name: 'Grid Paths', platform: 'CSES', id: '1625', url: 'https://cses.fi/problemset/task/1625', difficulty: 'hard', why: 'The legendary pruning lab: the dead-end split observation turns an impossible 48-move search into milliseconds.' },
    ],
  },
};

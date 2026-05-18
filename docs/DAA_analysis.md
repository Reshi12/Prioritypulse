# DAA Analysis — Sorting Algorithms in Hospital Triage

> **Related files:** `backend/core/sorting.py`

---

## Table of Contents

1. [Introduction — Why Sorting Matters in Triage](#1-introduction)
2. [Selection Sort — From First Principles](#2-selection-sort)
3. [Merge Sort — From First Principles](#3-merge-sort)
4. [Recurrence Relation for Merge Sort](#4-recurrence-relation-for-merge-sort)
5. [Comprehensive Comparison Table](#5-comprehensive-comparison-table)
6. [Complexity Panel Data](#6-complexity-panel-data)
7. [Triage Context — Algorithm Selection Rationale](#7-triage-context)
8. [Step-by-Step Trace Example](#8-step-by-step-trace-example)

---

## 1. Introduction

An Emergency Room triage queue must always serve the most critical patient next. To do this, the queue must be **sorted by priority score** (0–100, higher = more urgent) every time:

- A new patient arrives
- The simulation clock ticks
- A patient's priority is boosted by the aging mechanism

The choice of sorting algorithm depends on the **current queue size**:

```
queue size ≤ 10  →  Selection Sort   O(n²)       (simple, low constant factor)
queue size > 10  →  Merge Sort       O(n log n)  (scalable for large ER volumes)
```

This threshold is defined in `backend/config.py` as `SORT_LARGE_THRESHOLD = 10`.

---

## 2. Selection Sort

### 2.1 Concept

Selection Sort works by repeatedly **selecting the maximum element** from the unsorted portion of the array and placing it at the front.

In our triage system, "maximum element" means the patient with the **highest priority score**.

### 2.2 Algorithm Pseudocode

```
Given: array A of n patients

For i = 0 to n-1:
  1. Scan A[i..n-1] to find the patient with the highest priority_score
     → call its index max_idx
  2. Swap A[i] with A[max_idx]
  3. Record this step in the trace log

After n passes, A is sorted descending by priority_score.
```

### 2.3 Python Implementation (from `sorting.py`)

```python
def selection_sort(patients: list) -> tuple[list, list]:
    arr = copy.deepcopy(patients)
    n = len(arr)
    steps = []

    for i in range(n):
        max_idx = i
        for j in range(i + 1, n):
            if arr[j].priority_score > arr[max_idx].priority_score:
                max_idx = j
        arr[i], arr[max_idx] = arr[max_idx], arr[i]
        steps.append({
            "pass": i,
            "swapped": [arr[i].patient_id, arr[max_idx].patient_id if max_idx != i else None],
            "queue_snapshot": [p.patient_id for p in arr]
        })

    return arr, steps
```

### 2.4 Time Complexity Derivation — O(n²)

Count the total number of comparisons:

| Pass i | Comparisons in inner loop |
|--------|--------------------------|
| 0      | n − 1                     |
| 1      | n − 2                     |
| 2      | n − 3                     |
| …      | …                         |
| n − 2  | 1                         |
| n − 1  | 0                         |

**Total comparisons = (n−1) + (n−2) + … + 1 + 0**

This is the sum of the first (n−1) natural numbers:

```
Total = n(n−1) / 2 = (n² − n) / 2
```

Dropping lower-order terms and constants:

> **Time Complexity: O(n²)**  — Best, Average, and Worst case are all identical.

Selection Sort has **no early termination**. It always performs exactly `n(n−1)/2` comparisons regardless of input order.

### 2.5 Space Complexity — O(1)

Selection Sort sorts **in-place**. It uses only:
- One loop variable `i`
- One index variable `max_idx`
- One temporary variable for the swap

No auxiliary array is allocated. **Space Complexity: O(1)**.

### 2.6 Stability

Selection Sort is **not stable** by default. If two patients have the same `priority_score`, the algorithm may swap them relative to each other during the selection step, changing their original relative order.

In the triage context, ties are broken arbitrarily (acceptable — clinician decides between equal-severity cases).

---

## 3. Merge Sort

### 3.1 Concept

Merge Sort is a **divide-and-conquer** algorithm. It:
1. **Divides** the array in half recursively until each sub-array has 1 element
2. **Merges** sorted sub-arrays back together in the correct order

A single-element array is trivially sorted — this is the base case.

### 3.2 Algorithm (Plain English)

```
MergeSort(A):
  if len(A) ≤ 1:
    return A          # base case — already sorted

  mid = len(A) / 2
  left  = MergeSort(A[0 .. mid-1])
  right = MergeSort(A[mid .. n-1])
  return Merge(left, right)

Merge(left, right):
  result = []
  while left is not empty AND right is not empty:
    if left[0].priority_score >= right[0].priority_score:
      append left[0] to result; remove from left
    else:
      append right[0] to result; remove from right
  append remaining elements of left or right to result
  return result
```

### 3.3 Python Implementation (from `sorting.py`)

```python
def merge_sort(patients: list) -> tuple[list, list]:
    steps = []

    def _merge(left, right):
        result = []
        while left and right:
            if left[0].priority_score >= right[0].priority_score:
                result.append(left.pop(0))
            else:
                result.append(right.pop(0))
        result += left + right
        steps.append({"merged_ids": [p.patient_id for p in result]})
        return result

    def _sort(arr):
        if len(arr) <= 1:
            return arr
        mid = len(arr) // 2
        left = _sort(arr[:mid])
        right = _sort(arr[mid:])
        return _merge(left, right)

    arr = copy.deepcopy(patients)
    sorted_arr = _sort(arr)
    return sorted_arr, steps
```

### 3.4 Time Complexity Derivation — O(n log n)

See Section 4 for the full recurrence relation proof.

**Summary:** Each level of recursion does O(n) work (the merge step). There are O(log n) levels.

> **Time Complexity: O(n log n)** — Best, Average, and Worst case are all identical.

### 3.5 Space Complexity — O(n)

Merge Sort creates **new sub-arrays** at each merge step. The total auxiliary memory used at any point in time is proportional to n (the full temporary array used during merging).

> **Space Complexity: O(n)**

This is the key trade-off vs Selection Sort: Merge Sort is faster for large n but uses more memory.

### 3.6 Stability

Merge Sort **is stable**. In the `_merge` function, when `left[0].priority_score >= right[0].priority_score`, we always take from the left array first. This preserves the relative order of equal-priority patients.

In a triage context, stability means **first-come, first-served among equal-priority patients** — a clinically fair and desirable property.

---

## 4. Recurrence Relation for Merge Sort

### 4.1 Setting Up the Recurrence

Let `T(n)` = number of basic operations (comparisons) to sort n elements.

**Base case:** `T(1) = 0` (a single element needs no comparisons)

**Recursive case:** Merge Sort:
1. Divides into two halves → calls `T(n/2)` twice
2. Merges them → requires at most `n − 1` comparisons

$$T(n) = 2 \cdot T\left(\frac{n}{2}\right) + n$$

### 4.2 Solving by Expansion (Substitution Method)

Expand the recurrence:

```
T(n) = 2·T(n/2) + n

     = 2·[2·T(n/4) + n/2] + n
     = 4·T(n/4) + n + n
     = 4·T(n/4) + 2n

     = 4·[2·T(n/8) + n/4] + 2n
     = 8·T(n/8) + n + 2n
     = 8·T(n/8) + 3n

     ...

     = 2^k · T(n/2^k) + k·n
```

We stop when `n/2^k = 1`, i.e., `k = log₂(n)`.

```
T(n) = 2^(log₂n) · T(1) + log₂(n) · n
     = n · 0 + n · log₂(n)
     = n · log₂(n)
```

> **T(n) = n log₂(n)  →  Time Complexity: Θ(n log n)**

### 4.3 Master Theorem Confirmation

The recurrence `T(n) = 2·T(n/2) + n` matches the Master Theorem form:

```
T(n) = a·T(n/b) + f(n)
  a = 2  (two subproblems)
  b = 2  (each half the size)
  f(n) = n   →  O(n^1)
```

Compare `f(n) = n` with `n^(log_b(a)) = n^(log_2(2)) = n^1 = n`.

Since `f(n) = Θ(n^(log_b(a)))`, we are in **Case 2** of the Master Theorem:

```
T(n) = Θ(n^(log_b(a)) · log n) = Θ(n · log n)
```

✅ **Confirmed: O(n log n)**

---

## 5. Comprehensive Comparison Table

| Property | Selection Sort | Merge Sort |
|----------|:-------------:|:----------:|
| **Best-case time** | O(n²) | O(n log n) |
| **Average-case time** | O(n²) | O(n log n) |
| **Worst-case time** | O(n²) | O(n log n) |
| **Space complexity** | O(1) | O(n) |
| **Stable?** | ❌ No | ✅ Yes |
| **In-place?** | ✅ Yes | ❌ No |
| **Adaptive?** | ❌ No | ❌ No |
| **Comparisons (n=10)** | 45 | ~34 |
| **Comparisons (n=15)** | 105 | ~59 |
| **Comparisons (n=25)** | 300 | ~116 |
| **Best use case** | n ≤ 10, memory-constrained | n > 10, stability matters |
| **Triage role** | Small ER (≤ 10 patients) | Large ER (> 10 patients) |

### Key Insight

For **small n**, Selection Sort's O(1) space and low constant factor makes it competitive with Merge Sort despite worse Big-O. For **large n**, the n² term in Selection Sort dominates and Merge Sort's n log n becomes strictly superior.

The crossover point in practice (accounting for constant factors) is approximately **n = 10–15**, which is exactly why `SORT_LARGE_THRESHOLD = 10` is used in `config.py`.

---

## 6. Complexity Panel Data

The frontend `ComplexityPanel` component renders a bar chart using these precomputed values:

| n (patients) | n² — Selection Sort ops | n·log₂(n) — Merge Sort ops |
|:------------:|:-----------------------:|:---------------------------:|
| 5            | 25                      | 11.6                        |
| 10           | 100                     | 33.2                        |
| 15           | 225                     | 58.6                        |
| 20           | 400                     | 86.4                        |
| 25           | 625                     | 116.1                       |

> **How to read this:** At n=25, Selection Sort performs 625 comparisons while Merge Sort performs only 116 — a **5.4× reduction**. This gap widens rapidly with scale.

---

## 7. Triage Context — Algorithm Selection Rationale

### Why this matters in an ER

An Emergency Room queue is **dynamically ordered** — every new patient arrival or priority bump triggers a re-sort. The algorithm's performance directly affects:

1. **Responsiveness:** Time from patient arrival to queue re-sort
2. **Scalability:** How the system performs during mass-casualty events
3. **Correctness:** Stable sort ensures first-come-first-served among equally critical patients

### Decision Framework

```
╔══════════════════════════════════════════════════════════════╗
║  Patient arrives or priority changes → trigger re-sort       ║
║                                                              ║
║       count current waiting patients                         ║
║              │                                               ║
║        ┌─────▼─────┐                                         ║
║        │count ≤ 10?│                                         ║
║        └─────┬─────┘                                         ║
║         YES  │  NO                                           ║
║    ┌─────────▼──┐   ┌──────────────┐                         ║
║    │ SELECTION  │   │  MERGE SORT  │                         ║
║    │   SORT     │   │              │                         ║
║    │  O(n²)     │   │  O(n log n)  │                         ║
║    │  O(1) space│   │  O(n) space  │                         ║
║    └────────────┘   └──────────────┘                         ║
╚══════════════════════════════════════════════════════════════╝
```

### Why Selection Sort for small batches

- **Low overhead:** No recursion, no auxiliary arrays, no stack frames
- **Predictable:** Exactly n(n−1)/2 comparisons every time — no surprises
- **Cache-friendly:** Operates entirely in-place on a small contiguous array
- **Educational clarity:** Easy to trace step-by-step for the UI trace log

### Why Merge Sort for large queues

- **Guaranteed O(n log n):** No degenerate cases — Selection Sort would be 25× slower at n=25
- **Stable:** Equal-priority patients maintain arrival-time order (fairness)
- **Scalable:** During a mass-casualty incident with 50+ patients, Merge Sort remains performant while Selection Sort degrades quadratically
- **Divide-and-conquer:** Conceptually maps to how real hospitals triage in parallel (sub-groups assessed independently, then merged)

### Real-world analogy

Think of a busy city ER receiving 20 ambulances during a multi-vehicle crash. Sorting 20 patients by severity using Selection Sort means 190 comparisons; Merge Sort means roughly 86. At 50 patients (mass-casualty): Selection = 1,225 comparisons vs Merge = ~282. The algorithm choice is the difference between real-time responsiveness and perceptible lag.

---

## 8. Step-by-Step Trace Example

### Input: 5 patients (using seed data)

| Patient ID | Name         | Priority Score | Severity |
|------------|--------------|:--------------:|:--------:|
| P001       | Arjun Mehta  | 91.5           | CRITICAL |
| P002       | Priya Sharma | 58.0           | MEDIUM   |
| P003       | Ravi Kumar   | 98.0           | CRITICAL |
| P004       | Sneha Iyer   | 50.0           | MEDIUM   |
| P005       | Vikram Nair  | 73.0           | HIGH     |

Initial array (unsorted): `[P001, P002, P003, P004, P005]`

### Selection Sort Trace (n=5, ≤ 10 → use Selection Sort)

**Pass 0:** Find max in [P001, P002, P003, P004, P005]
- Max = P003 (score 98.0) at index 2
- Swap P003 ↔ P001
- Array: `[P003, P002, P001, P004, P005]`

**Pass 1:** Find max in [P002, P001, P004, P005]
- Max = P001 (score 91.5) at index 2
- Swap P001 ↔ P002
- Array: `[P003, P001, P002, P004, P005]`

**Pass 2:** Find max in [P002, P004, P005]
- Max = P005 (score 73.0) at index 4
- Swap P005 ↔ P002
- Array: `[P003, P001, P005, P004, P002]`

**Pass 3:** Find max in [P004, P002]
- Max = P004 (score 50.0) at index 3
- No swap needed (P004 > P002)
- Array: `[P003, P001, P005, P004, P002]`

**Pass 4:** Only one element remaining — done.

**Final sorted queue (highest priority first):**

| Position | Patient | Priority Score | Action |
|:--------:|---------|:--------------:|--------|
| 1st      | P003    | 98.0           | Treat immediately |
| 2nd      | P001    | 91.5           | Next in line |
| 3rd      | P005    | 73.0           | After P001 |
| 4th      | P004    | 50.0           | Wait |
| 5th      | P002    | 58.0           | Wait |

**Total comparisons: 4 + 3 + 2 + 1 = 10 = n(n−1)/2 = 5×4/2 ✅**

---

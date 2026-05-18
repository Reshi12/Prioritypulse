"""
Sorting algorithms — Selection Sort (O(n²)) and Merge Sort (O(n log n)).
Both return (sorted_list, step_trace) for educational display.
"""

import copy
import time


def selection_sort(patients: list) -> tuple[list, list]:
    """
    Selection Sort — O(n²) time, O(1) space.
    Used for small batches (<=10 patients).
    Returns: (sorted_list_descending_by_priority, step_trace)
    """
    arr = copy.deepcopy(patients)
    n = len(arr)
    steps = []

    for i in range(n):
        max_idx = i
        for j in range(i + 1, n):
            if arr[j].priority_score > arr[max_idx].priority_score:
                max_idx = j
        if max_idx != i:
            arr[i], arr[max_idx] = arr[max_idx], arr[i]
        steps.append({
            "pass": i,
            "selected": arr[i].patient_id,
            "swapped_with": arr[max_idx].patient_id if max_idx != i else None,
            "queue_snapshot": [p.patient_id for p in arr],
        })

    return arr, steps


def merge_sort(patients: list) -> tuple[list, list]:
    """
    Merge Sort — O(n log n) time, O(n) space.
    Used for large queues (>10 patients).
    Returns: (sorted_list_descending_by_priority, step_trace)
    """
    steps = []

    def _merge(left, right):
        result = []
        li, ri = 0, 0
        while li < len(left) and ri < len(right):
            if left[li].priority_score >= right[ri].priority_score:
                result.append(left[li])
                li += 1
            else:
                result.append(right[ri])
                ri += 1
        result += left[li:]
        result += right[ri:]
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


def compare_algorithms(patients: list) -> dict:
    """Run both algorithms on same input, return timing + complexity analysis."""
    # Selection Sort
    t0 = time.perf_counter()
    sel_sorted, sel_steps = selection_sort(patients)
    sel_time = (time.perf_counter() - t0) * 1000

    # Merge Sort
    t0 = time.perf_counter()
    mrg_sorted, mrg_steps = merge_sort(patients)
    mrg_time = (time.perf_counter() - t0) * 1000

    n = len(patients)

    return {
        "input_size": n,
        "selection_sort": {
            "time_ms": round(sel_time, 4),
            "time_complexity": "O(n²)",
            "space_complexity": "O(1)",
            "comparisons": n * (n - 1) // 2,
            "best_for": "Small batches ≤ 10 patients",
            "steps": sel_steps,
            "sorted_order": [p.patient_id for p in sel_sorted],
        },
        "merge_sort": {
            "time_ms": round(mrg_time, 4),
            "time_complexity": "O(n log n)",
            "space_complexity": "O(n)",
            "comparisons": int(n * (n.bit_length() - 1)) if n > 1 else 0,
            "best_for": "Large queues > 10 patients",
            "steps": mrg_steps,
            "sorted_order": [p.patient_id for p in mrg_sorted],
        },
        "winner": "selection_sort" if sel_time < mrg_time else "merge_sort",
        "note": "Selection Sort wins for tiny n due to lower constant factor. Merge Sort wins for n > 10.",
    }

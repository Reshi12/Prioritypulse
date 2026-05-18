"""
OS Scheduling Module.
Each patient = 1 process with: pid, arrival_time, burst_time, priority_score.
Doctors = CPUs (default 1).
These functions run the COMPLETE scheduling and return full results —
used by the /algorithms and /scheduler endpoints for analysis.
"""

import copy
from config import ROUND_ROBIN_QUANTUM


def priority_scheduling(patients: list, num_doctors: int = 1) -> dict:
    """
    Preemptive Priority Scheduling.
    Higher priority_score = treated first.
    Returns gantt chart entries, wait times, turnaround times.
    """
    procs = copy.deepcopy(patients)
    remaining = {p.patient_id: p.burst_time for p in procs}
    clock = 0
    gantt = []
    completed = []
    first_start = {}

    # Determine the simulation end: all patients must arrive and be treated
    max_time = 500  # safety cap

    while len(completed) < len(procs) and clock < max_time:
        # Build ready queue: patients that have arrived and aren't done
        ready = [
            p for p in procs
            if p.arrival_time <= clock
            and remaining[p.patient_id] > 0
            and p.patient_id not in [c.patient_id for c in completed]
        ]

        if not ready:
            clock += 1
            continue

        # Pick highest priority among ready
        current = max(ready, key=lambda p: p.priority_score)

        if current.patient_id not in first_start:
            first_start[current.patient_id] = clock

        gantt.append({
            "patient_id": current.patient_id,
            "doctor_id": 1,
            "start": clock,
            "end": clock + 1,
        })

        remaining[current.patient_id] -= 1
        clock += 1

        if remaining[current.patient_id] == 0:
            current.finish_time = clock
            current.turnaround_time = clock - current.arrival_time
            current.waiting_time = current.turnaround_time - current.burst_time
            current.start_time = first_start[current.patient_id]
            completed.append(current)

    stats = _compute_stats(completed)
    return {
        "gantt": gantt,
        "completed": [_patient_dict(p) for p in completed],
        "stats": stats,
    }


def round_robin_scheduling(
    patients: list,
    num_doctors: int = 1,
    quantum: int = ROUND_ROBIN_QUANTUM,
) -> dict:
    """
    Round Robin Scheduling.
    quantum = time slice per patient per turn (default 5 min).
    """
    procs = copy.deepcopy(patients)
    remaining = {p.patient_id: p.burst_time for p in procs}
    clock = 0
    gantt = []
    completed = []
    first_start = {}
    ready = []
    pending = sorted(procs, key=lambda p: p.arrival_time)

    max_time = 500  # safety cap

    while (pending or ready) and clock < max_time:
        # Move arrived patients to ready queue
        arrived = [p for p in pending if p.arrival_time <= clock]
        for p in arrived:
            ready.append(p)
            pending.remove(p)

        if not ready:
            clock += 1
            continue

        current = ready.pop(0)

        if current.patient_id not in first_start:
            first_start[current.patient_id] = clock

        time_slice = min(quantum, remaining[current.patient_id])
        gantt.append({
            "patient_id": current.patient_id,
            "doctor_id": 1,
            "start": clock,
            "end": clock + time_slice,
        })
        clock += time_slice
        remaining[current.patient_id] -= time_slice

        # Check new arrivals during this slice
        arrived_during = [p for p in pending if p.arrival_time <= clock]
        for p in arrived_during:
            ready.append(p)
            pending.remove(p)

        if remaining[current.patient_id] > 0:
            ready.append(current)
        else:
            current.finish_time = clock
            current.turnaround_time = clock - current.arrival_time
            current.waiting_time = current.turnaround_time - current.burst_time
            current.start_time = first_start[current.patient_id]
            completed.append(current)

    stats = _compute_stats(completed)
    return {
        "gantt": gantt,
        "completed": [_patient_dict(p) for p in completed],
        "stats": stats,
    }


def compare_schedulers(patients: list, num_doctors: int = 1) -> dict:
    """Side-by-side comparison of both scheduling algorithms."""
    ps = priority_scheduling(patients, num_doctors)
    rr = round_robin_scheduling(patients, num_doctors)
    return {
        "priority_scheduling": ps,
        "round_robin": rr,
        "comparison": {
            "priority_avg_wait": ps["stats"].get("avg_waiting_time", 0),
            "rr_avg_wait": rr["stats"].get("avg_waiting_time", 0),
            "priority_avg_tat": ps["stats"].get("avg_turnaround_time", 0),
            "rr_avg_tat": rr["stats"].get("avg_turnaround_time", 0),
        },
    }


def _compute_stats(completed: list) -> dict:
    if not completed:
        return {"avg_waiting_time": 0, "avg_turnaround_time": 0, "throughput": 0}
    avg_wait = sum(p.waiting_time for p in completed) / len(completed)
    avg_tat = sum(p.turnaround_time for p in completed) / len(completed)
    return {
        "avg_waiting_time": round(avg_wait, 2),
        "avg_turnaround_time": round(avg_tat, 2),
        "throughput": len(completed),
    }


def _patient_dict(p) -> dict:
    return {
        "patient_id": p.patient_id,
        "name": p.name,
        "priority_score": p.priority_score,
        "burst_time": p.burst_time,
        "arrival_time": p.arrival_time,
        "start_time": p.start_time,
        "finish_time": p.finish_time,
        "waiting_time": p.waiting_time,
        "turnaround_time": p.turnaround_time,
    }

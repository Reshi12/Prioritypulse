"""
Aging mechanism — prevents starvation of low-priority patients.
For any waiting patient whose cumulative wait time exceeds
AGING_THRESHOLD_MINUTES, their priority score is boosted by AGING_BOOST.
"""

from config import AGING_THRESHOLD_MINUTES, AGING_BOOST


def apply_aging(patients: list, current_clock: int) -> list:
    """
    Boost priority for patients who have been waiting too long.
    Returns the same list (mutated in place) for convenience.
    """
    for patient in patients:
        if patient.status != "waiting":
            continue
        wait_so_far = current_clock - patient.arrival_time
        bumps_due = wait_so_far // AGING_THRESHOLD_MINUTES
        bumps_applied = patient.last_priority_bump

        if bumps_due > bumps_applied:
            boost = (bumps_due - bumps_applied) * AGING_BOOST
            patient.priority_score = min(100.0, patient.priority_score + boost)
            patient.last_priority_bump = bumps_due

    return patients

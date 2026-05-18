"""
Algorithm comparison endpoints.
POST /algorithms/compare       → sort comparison (Selection vs Merge)
GET  /algorithms/schedulers    → scheduling comparison (Priority vs RR)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from core.simulation import SimulationEngine
from core.sorting import compare_algorithms
from core.scheduler import compare_schedulers

router = APIRouter()


class CompareRequest(BaseModel):
    patient_ids: Optional[list[str]] = None   # None = use all patients


@router.post("/compare")
def compare_sorting(req: CompareRequest = CompareRequest()):
    """
    Run Selection Sort and Merge Sort on the same patient list.
    Returns timing, step traces, and complexity analysis.
    """
    engine = SimulationEngine.get()
    if not engine.patients:
        engine.load_seed()

    # Select patients
    if req.patient_ids:
        patients = [p for p in engine.patients if p.patient_id in req.patient_ids]
        if not patients:
            raise HTTPException(status_code=404, detail="No matching patients found")
    else:
        patients = engine.patients

    return compare_algorithms(patients)


@router.get("/schedulers")
def compare_scheduling_algorithms():
    """
    Run Priority Scheduling and Round Robin on the same patient list.
    Returns gantt charts, stats for both.
    """
    engine = SimulationEngine.get()
    if not engine.patients:
        engine.load_seed()
    return compare_schedulers(engine.patients, engine.num_doctors)

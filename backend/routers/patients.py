"""
Patient CRUD endpoints.
GET  /patients          → list all patients (with computed scores)
POST /patients          → add a new patient (auto-computes priority)
GET  /patients/{id}     → single patient detail
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from models.patient import PatientVitals, Symptom
from core.simulation import SimulationEngine
from core.triage import vitals_alerts

router = APIRouter()


class AddPatientRequest(BaseModel):
    patient_id: str
    name: str
    age: int
    vitals: PatientVitals
    arrival_time: int = -1     # -1 means "use current clock"
    burst_time: int = 10


@router.get("")
def list_patients():
    """Return all patients with their computed priority scores."""
    engine = SimulationEngine.get()
    if not engine.patients:
        engine.load_seed()
    return engine.get_patients_list()


@router.get("/{patient_id}")
def get_patient(patient_id: str):
    """Return a single patient by ID, with vitals alerts."""
    engine = SimulationEngine.get()
    patient = engine._get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    data = patient.model_dump()
    data["alerts"] = vitals_alerts(patient.vitals)
    return data


@router.post("")
def add_patient(req: AddPatientRequest):
    """
    Add a new patient mid-simulation (B02).
    Priority score and severity are auto-computed from vitals.
    """
    from models.patient import Patient

    engine = SimulationEngine.get()

    # Check duplicate ID
    if engine._get(req.patient_id):
        raise HTTPException(status_code=409, detail="Patient ID already exists")

    patient = Patient(
        patient_id=req.patient_id,
        name=req.name,
        age=req.age,
        vitals=req.vitals,
        arrival_time=req.arrival_time if req.arrival_time >= 0 else engine.clock,
        burst_time=req.burst_time,
    )
    added = engine.add_patient(patient)
    return added.model_dump()

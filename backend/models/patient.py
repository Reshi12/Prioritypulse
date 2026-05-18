from pydantic import BaseModel
from typing import Optional, Literal
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Symptom(str, Enum):
    CHEST_PAIN = "chest_pain"
    STROKE = "stroke"
    BREATHING = "breathing_difficulty"
    FRACTURE = "fracture"
    FEVER = "fever"
    ABDOMINAL = "abdominal_pain"
    LACERATION = "laceration"
    ALLERGIC = "allergic_reaction"
    HEADACHE = "headache"
    NONE = "none"


class PatientVitals(BaseModel):
    heart_rate: int             # bpm
    systolic_bp: int            # mmHg
    diastolic_bp: int           # mmHg
    oxygen_saturation: float    # %
    temperature: float          # Celsius
    symptoms: list[Symptom]


class Patient(BaseModel):
    patient_id: str
    name: str
    age: int
    vitals: PatientVitals
    arrival_time: int               # simulation minutes since start
    priority_score: float = 0.0
    severity: Severity = Severity.LOW
    burst_time: int = 10            # estimated treatment minutes
    # OS Process fields
    pid: int = 0
    waiting_time: int = 0
    turnaround_time: int = 0
    start_time: Optional[int] = None
    finish_time: Optional[int] = None
    status: Literal["waiting", "in_treatment", "done"] = "waiting"
    # Aging
    last_priority_bump: int = 0
    # RR Queue Ordering
    last_queued_time: int = 0

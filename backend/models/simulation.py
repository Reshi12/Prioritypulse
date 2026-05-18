from pydantic import BaseModel
from models.patient import Patient


class GanttEntry(BaseModel):
    patient_id: str
    doctor_id: int
    start: int
    end: int


class QueueState(BaseModel):
    waiting: list[str] = []
    in_treatment: list[str] = []
    done: list[str] = []


class SchedulerStats(BaseModel):
    avg_waiting_time: float = 0.0
    avg_turnaround_time: float = 0.0
    throughput: int = 0


class SimulationStateResponse(BaseModel):
    """Shape returned by GET /simulation/state and pushed over WS."""
    clock: int = 0
    status: str = "idle"
    num_doctors: int = 1
    scheduler: str = "priority"
    queue: QueueState = QueueState()
    gantt: list[GanttEntry] = []
    stats: SchedulerStats = SchedulerStats()
    aged_patients: list[str] = []
    patients: list[Patient] = []


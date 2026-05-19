"""
Simulation Engine — tick-based clock that drives the entire system.
Supports: start / pause / step / reset, configurable doctors & scheduler,
dynamic patient arrival, aging, and WebSocket broadcast.
"""

import asyncio
from typing import Optional, Callable

from config import ROUND_ROBIN_QUANTUM, NUM_DOCTORS, SORT_LARGE_THRESHOLD
from models.patient import Patient, PatientVitals
from models.simulation import (
    GanttEntry, QueueState, SchedulerStats, SimulationStateResponse,
)
from core.triage import calculate_priority
from core.aging import apply_aging
from utils.file_store import (
    load_seed_patients, save_patients_json, save_simulation_state,
)


class SimulationEngine:
    """Singleton tick-based simulation manager."""

    _instance: Optional["SimulationEngine"] = None

    @classmethod
    def get(cls) -> "SimulationEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.clock: int = 0
        self.status: str = "idle"          # idle | running | paused
        self.scheduler_type: str = "priority"
        self.num_doctors: int = NUM_DOCTORS
        self.patients: list[Patient] = []
        self.gantt: list[GanttEntry] = []
        self.aged_patients: set[str] = set()

        # Internal bookkeeping
        self._remaining: dict[str, int] = {}          # patient_id -> remaining burst
        self._doctor_patient: dict[int, Optional[str]] = {}  # doc_id -> patient_id
        self._rr_used: dict[int, int] = {}            # doc_id -> quantum minutes used
        self._activated: set[str] = set()             # patients that have "arrived"
        self._pid_counter: int = 0

        # Background auto-tick
        self._task: Optional[asyncio.Task] = None
        self._broadcast: Optional[Callable] = None

    # ── public setters ──────────────────────────────────────────────

    def set_broadcast(self, fn: Callable):
        self._broadcast = fn

    # ── patient management ──────────────────────────────────────────

    def load_seed(self):
        """Load patients.json if exists, otherwise fall back to seed_patients.json."""
        from utils.file_store import load_patients_json
        saved = load_patients_json()
        if saved:
            self.patients.clear()
            self._remaining.clear()
            self._pid_counter = 0
            for data in saved:
                vitals = PatientVitals(**data["vitals"])
                score, severity = calculate_priority(vitals, age=data.get("age", 30))
                p = Patient(
                    patient_id=data["patient_id"],
                    name=data["name"],
                    age=data["age"],
                    vitals=vitals,
                    arrival_time=data.get("arrival_time", 0),
                    burst_time=data.get("burst_time", 10),
                    priority_score=score,
                    severity=severity,
                    status=data.get("status", "waiting"),
                    waiting_time=data.get("waiting_time", 0),
                    turnaround_time=data.get("turnaround_time", 0),
                    start_time=data.get("start_time"),
                    finish_time=data.get("finish_time"),
                    last_priority_bump=data.get("last_priority_bump", 0),
                    last_queued_time=data.get("last_queued_time", data.get("arrival_time", 0)),
                    pid=data.get("pid", 0),
                )
                self.patients.append(p)
                self._remaining[p.patient_id] = p.burst_time
                if p.pid > self._pid_counter:
                    self._pid_counter = p.pid
            return

        seed = load_seed_patients()
        self.patients.clear()
        self._remaining.clear()
        self._pid_counter = 0
        for data in seed:
            vitals = PatientVitals(**data["vitals"])
            score, severity = calculate_priority(vitals, age=data.get("age", 30))
            self._pid_counter += 1
            p = Patient(
                patient_id=data["patient_id"],
                name=data["name"],
                age=data["age"],
                vitals=vitals,
                arrival_time=data.get("arrival_time", 0),
                burst_time=data.get("burst_time", 10),
                priority_score=score,
                severity=severity,
                pid=self._pid_counter,
                last_queued_time=data.get("arrival_time", 0),
            )
            self.patients.append(p)
            self._remaining[p.patient_id] = p.burst_time
        self._persist_patients()

    def add_patient(self, patient: Patient) -> Patient:
        """Add a patient dynamically (B02). Auto-computes priority."""
        score, severity = calculate_priority(patient.vitals, age=patient.age)
        patient.priority_score = score
        patient.severity = severity
        self._pid_counter += 1
        patient.pid = self._pid_counter
        if patient.arrival_time < 0:
            patient.arrival_time = self.clock
        patient.last_queued_time = patient.arrival_time
        self.patients.append(patient)
        self._remaining[patient.patient_id] = patient.burst_time
        if patient.arrival_time <= self.clock:
            self._activated.add(patient.patient_id)
        self._persist_patients()
        
        # If broadcast is set, push the state immediately so frontend sees the update
        if self._broadcast:
            asyncio.create_task(self._broadcast(self.get_state().model_dump()))
            
        return patient

    def remove_patient(self, patient_id: str) -> bool:
        """Remove a patient by ID (mid-simulation support). Returns True if found & removed."""
        patient = self._get(patient_id)
        if not patient:
            return False

        # Remove from main list
        self.patients = [p for p in self.patients if p.patient_id != patient_id]

        # Cleanup internal state
        if patient_id in self._remaining:
            del self._remaining[patient_id]
        if patient_id in self._activated:
            self._activated.remove(patient_id)
        if patient_id in self.aged_patients:
            self.aged_patients.remove(patient_id)

        # Free any doctor treating this patient
        for doc_id, p_id in list(self._doctor_patient.items()):
            if p_id == patient_id:
                self._doctor_patient[doc_id] = None
                self._rr_used[doc_id] = 0

        self._persist_patients()
        save_simulation_state(self.get_state().model_dump())

        # Broadcast update immediately
        if self._broadcast:
            asyncio.create_task(self._broadcast(self.get_state().model_dump()))

        return True

    # ── simulation controls ─────────────────────────────────────────

    def start(self, scheduler: str = "priority", num_doctors: int = 0):
        if not self.patients:
            self.load_seed()
        self.scheduler_type = scheduler
        if num_doctors > 0:
            self.num_doctors = min(num_doctors, 5)
        self._init_doctors()
        self.status = "running"
        self._start_auto()

    def pause(self):
        self.status = "paused"
        self._stop_auto()

    def step(self) -> SimulationStateResponse:
        if not self.patients:
            self.load_seed()
        if self.status == "idle":
            self.status = "paused"
            self._init_doctors()
        self._tick()
        return self.get_state()

    def reset(self):
        self._stop_auto()
        self.clock = 0
        self.status = "idle"
        self.gantt.clear()
        self.aged_patients.clear()
        self._remaining.clear()
        self._doctor_patient.clear()
        self._rr_used.clear()
        self._activated.clear()
        for p in self.patients:
            p.status = "waiting"
            p.waiting_time = 0
            p.turnaround_time = 0
            p.start_time = None
            p.finish_time = None
            p.last_priority_bump = 0
            p.last_queued_time = p.arrival_time
            self._remaining[p.patient_id] = p.burst_time
        self._persist_patients()
        save_simulation_state(self.get_state().model_dump())

    # ── state snapshot ──────────────────────────────────────────────

    def get_state(self) -> SimulationStateResponse:
        waiting = [p.patient_id for p in self.patients
                   if p.patient_id in self._activated and p.status == "waiting"]
        in_treatment = [p.patient_id for p in self.patients
                        if p.status == "in_treatment"]
        done = [p.patient_id for p in self.patients if p.status == "done"]

        completed = [p for p in self.patients if p.status == "done"]
        if completed:
            avg_w = sum(p.waiting_time for p in completed) / len(completed)
            avg_t = sum(p.turnaround_time for p in completed) / len(completed)
        else:
            avg_w = avg_t = 0.0

        return SimulationStateResponse(
            clock=self.clock,
            status=self.status,
            num_doctors=self.num_doctors,
            scheduler=self.scheduler_type,
            queue=QueueState(waiting=waiting, in_treatment=in_treatment, done=done),
            gantt=self.gantt.copy(),
            stats=SchedulerStats(
                avg_waiting_time=round(avg_w, 2),
                avg_turnaround_time=round(avg_t, 2),
                throughput=len(completed),
            ),
            aged_patients=list(self.aged_patients),
            patients=self.patients.copy(),
        )

    def get_patients_list(self) -> list[dict]:
        """Return all patients as dicts for the GET /patients endpoint."""
        return [p.model_dump() for p in self.patients]

    # ── tick logic ──────────────────────────────────────────────────

    def _tick(self):
        # Check if simulation is already complete
        all_done = all(p.status == "done" for p in self.patients if p.patient_id in self._activated)
        all_arrived = len(self._activated) == len(self.patients)
        if all_done and all_arrived:
            self.status = "paused"
            self._stop_auto()
            return

        # 1. Activate patients whose arrival_time <= clock
        for p in self.patients:
            if p.patient_id not in self._activated and p.arrival_time <= self.clock:
                self._activated.add(p.patient_id)

        # 2. Apply aging to waiting patients
        waiting_list = [p for p in self.patients if p.status == "waiting" and p.patient_id in self._activated]
        apply_aging(waiting_list, self.clock)
        for p in waiting_list:
            if p.last_priority_bump > 0:
                self.aged_patients.add(p.patient_id)

        # 3. Process each doctor
        for doc_id in range(1, self.num_doctors + 1):
            current_pid = self._doctor_patient.get(doc_id)

            # --- handle current patient ---
            if current_pid:
                current = self._get(current_pid)
                if current and current.status == "in_treatment":
                    # Priority scheduling: check preemption
                    if self.scheduler_type == "priority":
                        available = self._available_waiting()
                        if available:
                            best = available[0]
                            if best.priority_score > current.priority_score:
                                # Preempt
                                current.status = "waiting"
                                self._doctor_patient[doc_id] = None
                                self._assign(doc_id)
                                current_pid = self._doctor_patient.get(doc_id)
                                current = self._get(current_pid) if current_pid else None

                    # Round robin: check quantum
                    elif self.scheduler_type == "round_robin":
                        used = self._rr_used.get(doc_id, 0)
                        if used >= ROUND_ROBIN_QUANTUM and self._remaining.get(current_pid, 0) > 0:
                            current.status = "waiting"
                            current.last_queued_time = self.clock
                            self._doctor_patient[doc_id] = None
                            self._rr_used[doc_id] = 0
                            self._assign(doc_id)
                            current_pid = self._doctor_patient.get(doc_id)
                            current = self._get(current_pid) if current_pid else None

            # --- assign if free ---
            if not self._doctor_patient.get(doc_id):
                self._assign(doc_id)
                current_pid = self._doctor_patient.get(doc_id)
                current = self._get(current_pid) if current_pid else None

            # --- treat for 1 minute ---
            if current_pid and current and current.status == "in_treatment":
                self._remaining[current_pid] = max(0, self._remaining.get(current_pid, 0) - 1)
                
                # Check if we can merge with the previous GanttEntry for this doctor
                last_entry = None
                for entry in reversed(self.gantt):
                    if entry.doctor_id == doc_id:
                        last_entry = entry
                        break
                        
                is_new_quantum = (self.scheduler_type == "round_robin" and self._rr_used.get(doc_id, 0) == 0)
                
                if last_entry and last_entry.patient_id == current_pid and last_entry.end == self.clock and not is_new_quantum:
                    last_entry.end = self.clock + 1
                else:
                    self.gantt.append(GanttEntry(
                        patient_id=current_pid,
                        doctor_id=doc_id,
                        start=self.clock,
                        end=self.clock + 1,
                    ))
                
                self._rr_used[doc_id] = self._rr_used.get(doc_id, 0) + 1

                if self._remaining[current_pid] <= 0:
                    current.status = "done"
                    current.finish_time = self.clock + 1
                    current.turnaround_time = current.finish_time - current.arrival_time
                    current.waiting_time = current.turnaround_time - current.burst_time
                    self._doctor_patient[doc_id] = None
                    self._rr_used[doc_id] = 0

        self.clock += 1
        self._persist_patients()
        save_simulation_state(self.get_state().model_dump())

    # ── helpers ─────────────────────────────────────────────────────

    def _init_doctors(self):
        for d in range(1, self.num_doctors + 1):
            if d not in self._doctor_patient:
                self._doctor_patient[d] = None
                self._rr_used[d] = 0

    def _get(self, patient_id: str) -> Optional[Patient]:
        for p in self.patients:
            if p.patient_id == patient_id:
                return p
        return None

    def _available_waiting(self) -> list[Patient]:
        """Return activated, waiting patients sorted by priority desc."""
        assigned_ids = set(v for v in self._doctor_patient.values() if v)
        avail = [
            p for p in self.patients
            if p.patient_id in self._activated
            and p.status == "waiting"
            and p.patient_id not in assigned_ids
        ]
        avail.sort(key=lambda p: -p.priority_score)
        return avail

    def _assign(self, doc_id: int):
        """Assign the highest-priority (or FIFO for RR) waiting patient to a doctor."""
        available = self._available_waiting()
        if not available:
            return
        if self.scheduler_type == "priority":
            chosen = available[0]
        else:
            # Round robin: FIFO by queue time (FIFO of active ready queue)
            available.sort(key=lambda p: p.last_queued_time)
            chosen = available[0]
        chosen.status = "in_treatment"
        if chosen.start_time is None:
            chosen.start_time = self.clock
        self._doctor_patient[doc_id] = chosen.patient_id
        self._rr_used[doc_id] = 0

    def _persist_patients(self):
        save_patients_json([p.model_dump() for p in self.patients])

    # ── auto-advance (background asyncio task) ──────────────────────

    def _start_auto(self):
        self._stop_auto()
        try:
            loop = asyncio.get_running_loop()
            self._task = loop.create_task(self._auto_loop())
        except RuntimeError:
            pass  # no event loop — manual stepping only

    def _stop_auto(self):
        if self._task and not self._task.done():
            self._task.cancel()
            self._task = None

    async def _auto_loop(self):
        """Advance one tick per second while status is 'running'."""
        try:
            while self.status == "running":
                self._tick()
                if self._broadcast:
                    await self._broadcast(self.get_state().model_dump())
                # Check if all done
                all_arrived = len(self._activated) == len(self.patients)
                all_done = all(
                    p.status == "done"
                    for p in self.patients
                    if p.patient_id in self._activated
                )
                if all_done and all_arrived:
                    self.status = "paused"
                    if self._broadcast:
                        await self._broadcast(self.get_state().model_dump())
                    break
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            pass

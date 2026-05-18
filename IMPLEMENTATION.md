# 🏥 Hospital Triage System — Implementation Guide

> **Stack:** Python 3.11 · FastAPI · React (Vite + Tailwind) · JSON flat-file storage  
> **Team:** 3 developers working in parallel across isolated workstreams  
> **Bonus:** Aging mechanism + dynamic mid-simulation patient arrival  

---

## 📋 Table of Contents

1. [Full Feature List](#1-full-feature-list)
2. [System Architecture](#2-system-architecture)
3. [Repo Structure](#3-repo-structure)
4. [Developer Assignments & Parallel Phases](#4-developer-assignments--parallel-phases)
5. [Phase 0 — Shared Setup (All Devs, Day 1 Morning, ~1 hr)](#5-phase-0--shared-setup)
6. [Phase 1 — Parallel Workstreams (Days 1–3)](#6-phase-1--parallel-workstreams-days-13)
7. [Phase 2 — Integration (Day 4)](#7-phase-2--integration-day-4)
8. [Phase 3 — Polish & Demo Data (Day 5)](#8-phase-3--polish--demo-data-day-5)
9. [API Contract (Single Source of Truth)](#9-api-contract-single-source-of-truth)
10. [Data Models](#10-data-models)
11. [DAA Concepts — Algorithm Specifications](#11-daa-concepts--algorithm-specifications)
12. [OS Concepts — Scheduler Specifications](#12-os-concepts--scheduler-specifications)
13. [Merge-Conflict Prevention Rules](#13-merge-conflict-prevention-rules)
14. [Environment Setup Checklist](#14-environment-setup-checklist)
15. [What You Need to Provide](#15-what-you-need-to-provide)

---

## 1. Full Feature List

### ✅ Core (Required by Assignment)

| # | Feature | Category | Owner |
|---|---------|----------|-------|
| F01 | Priority score calculation from vitals (heart rate, BP, oxygen, symptoms) | Core | Dev 1 |
| F02 | Selection Sort for small batches (≤ 10 patients) | DAA | Dev 1 |
| F03 | Merge Sort for large queues (> 10 patients) | DAA | Dev 1 |
| F04 | Time complexity analysis display (Big-O, actual runtime comparison) | DAA | Dev 1 |
| F05 | Patient modelled as a Process (PID, arrival time, burst time, priority) | OS | Dev 1 |
| F06 | Priority Scheduling (preemptive) | OS | Dev 1 |
| F07 | Round Robin Scheduling (quantum = 5 min) | OS | Dev 1 |
| F08 | Gantt chart data output (start/end per doctor per patient) | OS | Dev 1 |
| F09 | Waiting time per patient | OS | Dev 1 |
| F10 | Turnaround time per patient | OS | Dev 1 |
| F11 | Sample dataset of ≥ 15 patients with varied vitals | Data | Dev 1 |
| F12 | REST API exposing all above via FastAPI | API | Dev 1 |
| F13 | Live queue view (waiting / being treated / done) | Frontend | Dev 2 |
| F14 | Gantt chart visualisation (interactive, per doctor lane) | Frontend | Dev 2 |
| F15 | Algorithm comparison panel (Selection vs Merge, side-by-side) | Frontend | Dev 2 |
| F16 | Complexity analysis panel (Big-O table + runtime bar chart) | Frontend | Dev 2 |

### ✅ Bonus Features

| # | Feature | Category | Owner |
|---|---------|----------|-------|
| B01 | Aging mechanism — priority bumped after configurable wait threshold | OS/Core | Dev 1 |
| B02 | Dynamic patient arrival mid-simulation via POST /patients | API/Core | Dev 1 |
| B03 | Real-time queue re-sort on new arrival (WebSocket push) | API | Dev 1 |
| B04 | Live arrival feed UI (new patient card animates into queue) | Frontend | Dev 2 |

### ✅ Additional Vital Features (Beyond Assignment)

| # | Feature | Notes |
|---|---------|-------|
| V01 | Configurable number of doctors (default 1, max 5) | Runtime param |
| V02 | Simulation clock (tick-based, pauseable) | Step through time |
| V03 | Patient severity colour coding (Critical/High/Medium/Low) | Visual triage |
| V04 | Vitals out-of-range alerts (e.g., SpO2 < 90 = critical flag) | Auto-flag |
| V05 | Per-algorithm step-by-step trace log (sorting steps exportable) | Educational |
| V06 | Scheduling stats summary (avg wait, avg turnaround, throughput) | OS analysis |
| V07 | Export simulation results as JSON | Dev/debug |
| V08 | Persistent simulation state via JSON flat files | Survives restart |
| V09 | CORS-configured FastAPI for local React dev | DX |
| V10 | WebSocket endpoint for live simulation tick broadcast | Real-time UI |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Queue Panel │  │ Gantt Chart  │  │ Algo Analysis │  │
│  │ (live feed) │  │ (per doctor) │  │ (DAA compare) │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                │                  │            │
│  ┌──────▼────────────────▼──────────────────▼────────┐  │
│  │              API Client (axios + WebSocket)        │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP + WS  (localhost:8000)
┌─────────────────────────▼───────────────────────────────┐
│                   FastAPI Backend                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Routers: /patients  /simulation  /algorithms   │    │
│  │           /scheduler  /ws                       │    │
│  └──────┬──────────────────────────────────────────┘    │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐    │
│  │  Core Engine                                    │    │
│  │  ├── triage.py       (priority score calc)      │    │
│  │  ├── sorting.py      (SelectionSort + MergeSort)│    │
│  │  ├── scheduler.py    (Priority + Round Robin)   │    │
│  │  ├── aging.py        (starvation prevention)    │    │
│  │  └── simulation.py   (tick clock, state mgmt)   │    │
│  └──────┬──────────────────────────────────────────┘    │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐    │
│  │  JSON Flat Files (data/)                        │    │
│  │  ├── patients.json                              │    │
│  │  ├── simulation_state.json                      │    │
│  │  └── seed_patients.json  (15 sample patients)   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Repo Structure

```
hospital-triage/
│
├── backend/                        ← Dev 1 owns entire directory
│   ├── venv/                       (gitignored)
│   ├── requirements.txt
│   ├── main.py                     FastAPI app entry point
│   ├── config.py                   Constants (quantum, aging threshold, etc.)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── patient.py              Pydantic models
│   │   └── simulation.py           SimulationState, GanttEntry models
│   ├── core/
│   │   ├── __init__.py
│   │   ├── triage.py               Priority score calculation
│   │   ├── sorting.py              SelectionSort + MergeSort + complexity analysis
│   │   ├── scheduler.py            PriorityScheduler + RoundRobinScheduler
│   │   ├── aging.py                Aging mechanism
│   │   └── simulation.py           Simulation clock and state manager
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── patients.py             GET/POST /patients
│   │   ├── simulation.py           POST /simulation/start|pause|step|reset
│   │   ├── algorithms.py           GET /algorithms/compare
│   │   └── ws.py                   WebSocket /ws/simulation
│   ├── data/
│   │   ├── patients.json           Runtime patient store
│   │   ├── simulation_state.json   Persistent sim state
│   │   └── seed_patients.json      15 sample patients (committed to git)
│   └── utils/
│       ├── __init__.py
│       └── file_store.py           JSON read/write helpers
│
├── frontend/                       ← Dev 2 owns entire directory
│   ├── public/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/
│   │   │   ├── client.js           axios instance (baseURL = localhost:8000)
│   │   │   └── endpoints.js        All API call functions
│   │   ├── hooks/
│   │   │   ├── useSimulation.js    WebSocket consumer + state
│   │   │   └── usePatients.js      Patient CRUD
│   │   ├── components/
│   │   │   ├── QueuePanel/
│   │   │   ├── GanttChart/
│   │   │   ├── AlgoComparison/
│   │   │   ├── ComplexityPanel/
│   │   │   ├── PatientCard/
│   │   │   ├── AddPatientForm/
│   │   │   └── SimControls/
│   │   └── pages/
│   │       └── Dashboard.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/                           ← Dev 3 owns
│   ├── DAA_analysis.md
│   ├── OS_concepts.md
│   └── demo_walkthrough.md
│
├── .gitignore
└── README.md                       ← Dev 3 writes final version
```

> **Zero-conflict guarantee:** Each developer has a completely separate top-level directory. The only shared file is `README.md` — Dev 3 writes it last, in Phase 3, after merge.

---

## 4. Developer Assignments & Parallel Phases

| Developer | Role | Owns | Never touches |
|-----------|------|------|---------------|
| **Dev 1** | Backend Engineer | `backend/` entirely | `frontend/`, `docs/` |
| **Dev 2** | Frontend Engineer | `frontend/` entirely | `backend/`, `docs/` |
| **Dev 3** | Documentation & QA | `docs/`, final `README.md` | `backend/`, `frontend/` |

**Parallel start is possible because:**
- Dev 2 works against the API contract in Section 9 (mock data locally until backend is ready)
- Dev 3 writes documentation from specs in this file (no code dependency)
- Dev 1 builds the backend with no UI dependency

---

## 5. Phase 0 — Shared Setup

**All 3 devs do this simultaneously on Day 1 morning (≈ 1 hour)**

### Step 1 — Create GitHub repo

One person creates the repo. Everyone else forks/clones.

```bash
git clone https://github.com/<your-org>/hospital-triage.git
cd hospital-triage
```

### Step 2 — Create `.gitignore` (one person commits this)

```
# Python
backend/venv/
backend/__pycache__/
backend/**/__pycache__/
backend/*.pyc
backend/data/patients.json
backend/data/simulation_state.json

# Node
frontend/node_modules/
frontend/dist/

# OS
.DS_Store
*.env
```

> ⚠️ `seed_patients.json` is NOT gitignored — commit it. `patients.json` and `simulation_state.json` ARE gitignored (runtime state).

### Step 3 — Create branch strategy

```
main                  ← protected; only merged PRs
├── dev/backend       ← Dev 1 works here
├── dev/frontend      ← Dev 2 works here
└── dev/docs          ← Dev 3 works here
```

```bash
# Dev 1
git checkout -b dev/backend

# Dev 2
git checkout -b dev/frontend

# Dev 3
git checkout -b dev/docs
```

---

## 6. Phase 1 — Parallel Workstreams (Days 1–3)

---

### 🔴 Dev 1 — Backend (Days 1–3)

#### Day 1 Tasks

**Setup venv:**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn[standard] pydantic python-multipart
pip freeze > requirements.txt
```

**`config.py`** — write this first; everything imports from it:
```python
ROUND_ROBIN_QUANTUM = 5          # minutes
AGING_THRESHOLD_MINUTES = 15    # wait time before priority bump
AGING_BOOST = 10                # priority score added per threshold exceeded
NUM_DOCTORS = 1                 # default; overridable via API
SORT_LARGE_THRESHOLD = 10       # use MergeSort above this count
DATA_DIR = "data/"
```

**`models/patient.py`:**
```python
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
    heart_rate: int           # bpm
    systolic_bp: int          # mmHg
    diastolic_bp: int         # mmHg
    oxygen_saturation: float  # %
    temperature: float        # Celsius
    symptoms: list[Symptom]

class Patient(BaseModel):
    patient_id: str
    name: str
    age: int
    vitals: PatientVitals
    arrival_time: int         # simulation minutes since start
    priority_score: float = 0.0
    severity: Severity = Severity.LOW
    burst_time: int = 10      # estimated treatment minutes
    # OS Process fields
    pid: int = 0
    waiting_time: int = 0
    turnaround_time: int = 0
    start_time: Optional[int] = None
    finish_time: Optional[int] = None
    status: Literal["waiting","in_treatment","done"] = "waiting"
    # Aging
    last_priority_bump: int = 0
```

**`core/triage.py`** — Priority score formula:

```python
"""
Priority Score Formula (0–100, higher = more urgent):
  Base = 50
  + heart_rate deviation from 60–100 normal range → up to +20
  + BP deviation from 120/80 → up to +15
  + oxygen drop below 95% → up to +25
  + symptom weights (see SYMPTOM_WEIGHTS)
  Capped at 100, minimum 0
"""

SYMPTOM_WEIGHTS = {
    "stroke": 30,
    "chest_pain": 28,
    "breathing_difficulty": 25,
    "allergic_reaction": 20,
    "abdominal_pain": 12,
    "fracture": 10,
    "fever": 8,
    "laceration": 6,
    "headache": 4,
    "none": 0,
}

def calculate_priority(vitals) -> tuple[float, str]:
    """Returns (priority_score, severity_label)"""
    score = 50.0

    # Heart rate scoring
    hr = vitals.heart_rate
    if hr < 40 or hr > 150:
        score += 20
    elif hr < 60 or hr > 120:
        score += 10
    elif hr < 50 or hr > 100:
        score += 5

    # BP scoring (systolic)
    sbp = vitals.systolic_bp
    if sbp < 80 or sbp > 180:
        score += 15
    elif sbp < 90 or sbp > 160:
        score += 8

    # Oxygen saturation
    spo2 = vitals.oxygen_saturation
    if spo2 < 85:
        score += 25
    elif spo2 < 90:
        score += 18
    elif spo2 < 95:
        score += 8

    # Symptom weights (take highest)
    symptom_score = max(
        (SYMPTOM_WEIGHTS.get(s.value, 0) for s in vitals.symptoms),
        default=0
    )
    score += symptom_score

    score = min(100.0, max(0.0, score))

    if score >= 85:
        severity = "CRITICAL"
    elif score >= 65:
        severity = "HIGH"
    elif score >= 40:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    return round(score, 2), severity
```

#### Day 2 Tasks

**`core/sorting.py`** — Both algorithms + comparison:

```python
import time
import copy

def selection_sort(patients: list) -> tuple[list, list]:
    """
    Selection Sort — O(n²) time, O(1) space
    Used for small batches (≤ SORT_LARGE_THRESHOLD patients)
    Returns: (sorted_list, step_trace)
    """
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


def merge_sort(patients: list) -> tuple[list, list]:
    """
    Merge Sort — O(n log n) time, O(n) space
    Used for large queues (> SORT_LARGE_THRESHOLD patients)
    Returns: (sorted_list, step_trace)
    """
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


def compare_algorithms(patients: list) -> dict:
    """Run both algorithms on same input, return timing + complexity analysis."""
    import time

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
        },
        "merge_sort": {
            "time_ms": round(mrg_time, 4),
            "time_complexity": "O(n log n)",
            "space_complexity": "O(n)",
            "comparisons": int(n * (n.bit_length() - 1)) if n > 1 else 0,
            "best_for": "Large queues > 10 patients",
            "steps": mrg_steps,
        },
        "winner": "selection_sort" if sel_time < mrg_time else "merge_sort",
        "note": "Selection Sort wins for tiny n due to lower constant factor. Merge Sort wins for n > 10."
    }
```

**`core/scheduler.py`** — Both OS schedulers:

```python
"""
OS Scheduling Module
Each patient = 1 process with: pid, arrival_time, burst_time, priority_score
Doctors = CPUs (default 1)
"""
from config import ROUND_ROBIN_QUANTUM
import copy

def priority_scheduling(patients: list, num_doctors: int = 1) -> dict:
    """
    Preemptive Priority Scheduling.
    Higher priority_score = treated first.
    Returns gantt chart entries, wait times, turnaround times.
    """
    queue = sorted(copy.deepcopy(patients), key=lambda p: -p.priority_score)
    clock = 0
    gantt = []
    completed = []
    remaining = {p.patient_id: p.burst_time for p in queue}

    ready = []
    pending = queue.copy()

    while pending or ready:
        # Add all arrived patients to ready queue
        arrived = [p for p in pending if p.arrival_time <= clock]
        for p in arrived:
            ready.append(p)
            pending.remove(p)

        if not ready:
            clock += 1
            continue

        # Pick highest priority
        current = max(ready, key=lambda p: p.priority_score)
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
            ready.remove(current)
            completed.append(current)

    stats = _compute_stats(completed)
    return {"gantt": gantt, "completed": completed, "stats": stats}


def round_robin_scheduling(patients: list, num_doctors: int = 1,
                           quantum: int = ROUND_ROBIN_QUANTUM) -> dict:
    """
    Round Robin Scheduling.
    quantum = time slice per patient per turn (default 5 min).
    """
    queue = sorted(copy.deepcopy(patients), key=lambda p: p.arrival_time)
    remaining = {p.patient_id: p.burst_time for p in queue}
    clock = 0
    gantt = []
    completed = []
    ready = []
    pending = queue.copy()

    while pending or ready:
        arrived = [p for p in pending if p.arrival_time <= clock]
        for p in arrived:
            ready.append(p)
            pending.remove(p)

        if not ready:
            clock += 1
            continue

        current = ready.pop(0)
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
            completed.append(current)

    stats = _compute_stats(completed)
    return {"gantt": gantt, "completed": completed, "stats": stats}


def _compute_stats(completed: list) -> dict:
    if not completed:
        return {}
    avg_wait = sum(p.waiting_time for p in completed) / len(completed)
    avg_tat = sum(p.turnaround_time for p in completed) / len(completed)
    return {
        "avg_waiting_time": round(avg_wait, 2),
        "avg_turnaround_time": round(avg_tat, 2),
        "throughput": len(completed),
    }
```

**`core/aging.py`:**

```python
from config import AGING_THRESHOLD_MINUTES, AGING_BOOST

def apply_aging(patients: list, current_clock: int) -> list:
    """
    For any waiting patient whose wait time exceeds AGING_THRESHOLD_MINUTES,
    boost their priority score by AGING_BOOST.
    Prevents starvation of low-priority patients.
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
            patient._aged = True  # flag for UI highlight

    return patients
```

#### Day 3 Tasks

**`data/seed_patients.json`** — 15 sample patients (committed to git):

```json
[
  {"patient_id":"P001","name":"Arjun Mehta","age":58,"vitals":{"heart_rate":145,"systolic_bp":180,"diastolic_bp":110,"oxygen_saturation":88.0,"temperature":37.2,"symptoms":["chest_pain"]},"arrival_time":0,"burst_time":15},
  {"patient_id":"P002","name":"Priya Sharma","age":34,"vitals":{"heart_rate":72,"systolic_bp":118,"diastolic_bp":78,"oxygen_saturation":98.5,"temperature":38.9,"symptoms":["fever"]},"arrival_time":2,"burst_time":8},
  {"patient_id":"P003","name":"Ravi Kumar","age":67,"vitals":{"heart_rate":40,"systolic_bp":85,"diastolic_bp":55,"oxygen_saturation":82.0,"temperature":36.1,"symptoms":["stroke","breathing_difficulty"]},"arrival_time":1,"burst_time":25},
  {"patient_id":"P004","name":"Sneha Iyer","age":22,"vitals":{"heart_rate":88,"systolic_bp":115,"diastolic_bp":75,"oxygen_saturation":99.0,"temperature":36.8,"symptoms":["laceration"]},"arrival_time":5,"burst_time":6},
  {"patient_id":"P005","name":"Vikram Nair","age":45,"vitals":{"heart_rate":112,"systolic_bp":155,"diastolic_bp":95,"oxygen_saturation":91.0,"temperature":37.5,"symptoms":["breathing_difficulty"]},"arrival_time":3,"burst_time":12},
  {"patient_id":"P006","name":"Ananya Das","age":29,"vitals":{"heart_rate":78,"systolic_bp":122,"diastolic_bp":80,"oxygen_saturation":97.0,"temperature":39.5,"symptoms":["abdominal_pain"]},"arrival_time":4,"burst_time":10},
  {"patient_id":"P007","name":"Suresh Pillai","age":71,"vitals":{"heart_rate":160,"systolic_bp":195,"diastolic_bp":120,"oxygen_saturation":85.0,"temperature":36.5,"symptoms":["chest_pain","breathing_difficulty"]},"arrival_time":0,"burst_time":20},
  {"patient_id":"P008","name":"Kavitha Rao","age":16,"vitals":{"heart_rate":95,"systolic_bp":108,"diastolic_bp":70,"oxygen_saturation":96.0,"temperature":38.1,"symptoms":["allergic_reaction"]},"arrival_time":6,"burst_time":8},
  {"patient_id":"P009","name":"Deepak Menon","age":52,"vitals":{"heart_rate":65,"systolic_bp":130,"diastolic_bp":85,"oxygen_saturation":94.0,"temperature":37.0,"symptoms":["headache"]},"arrival_time":8,"burst_time":7},
  {"patient_id":"P010","name":"Lalitha Bhat","age":63,"vitals":{"heart_rate":50,"systolic_bp":90,"diastolic_bp":60,"oxygen_saturation":89.0,"temperature":36.3,"symptoms":["stroke"]},"arrival_time":2,"burst_time":22},
  {"patient_id":"P011","name":"Manish Gupta","age":38,"vitals":{"heart_rate":82,"systolic_bp":125,"diastolic_bp":82,"oxygen_saturation":98.0,"temperature":37.1,"symptoms":["fracture"]},"arrival_time":10,"burst_time":9},
  {"patient_id":"P012","name":"Sujata Kulkarni","age":44,"vitals":{"heart_rate":105,"systolic_bp":145,"diastolic_bp":92,"oxygen_saturation":93.0,"temperature":38.5,"symptoms":["breathing_difficulty","fever"]},"arrival_time":7,"burst_time":14},
  {"patient_id":"P013","name":"Ajay Tiwari","age":19,"vitals":{"heart_rate":75,"systolic_bp":112,"diastolic_bp":72,"oxygen_saturation":99.5,"temperature":36.9,"symptoms":["laceration","abdominal_pain"]},"arrival_time":12,"burst_time":5},
  {"patient_id":"P014","name":"Rekha Pandey","age":55,"vitals":{"heart_rate":130,"systolic_bp":170,"diastolic_bp":105,"oxygen_saturation":87.0,"temperature":37.8,"symptoms":["chest_pain","allergic_reaction"]},"arrival_time":1,"burst_time":18},
  {"patient_id":"P015","name":"Harish Venkat","age":80,"vitals":{"heart_rate":48,"systolic_bp":80,"diastolic_bp":50,"oxygen_saturation":80.0,"temperature":35.5,"symptoms":["stroke","chest_pain"]},"arrival_time":0,"burst_time":30}
]
```

**`main.py`:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import patients, simulation, algorithms, ws

app = FastAPI(title="Hospital Triage System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
app.include_router(algorithms.router, prefix="/algorithms", tags=["Algorithms"])
app.include_router(ws.router, tags=["WebSocket"])

@app.get("/")
def health():
    return {"status": "ok", "service": "Hospital Triage System"}
```

**Run backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

---

### 🔵 Dev 2 — Frontend (Days 1–3)

#### Day 1 Tasks

**Setup Vite + React:**
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios tailwindcss @tailwindcss/vite recharts lucide-react
```

**`vite.config.js`:**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '') }
    }
  }
})
```

**`src/api/client.js`:**
```js
import axios from 'axios'

export const api = axios.create({ baseURL: 'http://localhost:8000' })

// MOCK MODE — toggle this while backend isn't ready
export const MOCK = true
```

**`src/api/endpoints.js`** — all API calls live here, nowhere else:
```js
import { api, MOCK } from './client'
import { mockPatients, mockSimState, mockAlgoCompare } from './mocks'

export const getPatients = () => MOCK ? Promise.resolve(mockPatients) : api.get('/patients')
export const addPatient  = (data) => MOCK ? Promise.resolve({}) : api.post('/patients', data)
export const startSim    = () => MOCK ? Promise.resolve({}) : api.post('/simulation/start')
export const pauseSim    = () => MOCK ? Promise.resolve({}) : api.post('/simulation/pause')
export const stepSim     = () => MOCK ? Promise.resolve({}) : api.post('/simulation/step')
export const resetSim    = () => MOCK ? Promise.resolve({}) : api.post('/simulation/reset')
export const getSimState = () => MOCK ? Promise.resolve(mockSimState) : api.get('/simulation/state')
export const compareAlgo = (patients) => MOCK ? Promise.resolve(mockAlgoCompare) : api.post('/algorithms/compare', { patients })
```

**Create `src/api/mocks.js`** with hardcoded mock data matching Section 9 shapes. Dev 2 works entirely against these until backend merges.

#### Day 2 Tasks

Build components in this order (each self-contained, no cross-component imports):

**`PatientCard`** — displays one patient with severity colour badge, vitals, score, wait time.

**`QueuePanel`** — three columns: Waiting | In Treatment | Done. Drag from mock data. Animate new arrivals with CSS transition.

**`SimControls`** — Start / Pause / Step / Reset buttons + doctor count slider + clock display.

#### Day 3 Tasks

**`GanttChart`** — Use `recharts` BarChart in horizontal mode. X-axis = time (minutes). Each bar = patient. Colour = severity. One lane per doctor. Show waiting_time and turnaround_time tooltip.

**`AlgoComparison`** — Side-by-side cards: Selection Sort vs Merge Sort. Show Big-O badge, ms elapsed, comparisons count, best-for note.

**`ComplexityPanel`** — Recharts BarChart: X = input size (5, 10, 15, 20, 25), Y = estimated ops. Two series: n² (Selection) vs n log n (Merge). Static calculated data, no API needed.

**`AddPatientForm`** — Form with all vitals fields. Calls `addPatient()`. On success, triggers queue refresh + animation.

---

### 🟢 Dev 3 — Documentation & QA (Days 1–3)

#### Day 1 Tasks

Write `docs/DAA_analysis.md`:
- Explain Selection Sort and Merge Sort from first principles
- Derive O(n²) and O(n log n) with recurrence relation for Merge
- Include comparison table: time complexity, space, stability, best/worst/avg case
- Relate to triage context: why Merge Sort for large ER queues

#### Day 2 Tasks

Write `docs/OS_concepts.md`:
- Define process, PCB, scheduling
- Explain Priority Scheduling: preemption, convoy effect, starvation
- Explain Round Robin: quantum selection trade-offs, context switching overhead
- Define and calculate: waiting time, turnaround time, response time
- Include worked example with 5 patients from the seed dataset

#### Day 3 Tasks

Write `docs/demo_walkthrough.md`:
- Step-by-step guide to run the full system locally
- Screenshots/ASCII representation of expected UI state at each step
- Sample API calls with curl
- Common issues and fixes

---

## 7. Phase 2 — Integration (Day 4)

All devs merge their branches into `main` in this order:

```
Step 1: Dev 1 opens PR: dev/backend → main   (reviewed by Dev 3)
Step 2: Dev 3 opens PR: dev/docs → main      (reviewed by Dev 2)
Step 3: Dev 2 opens PR: dev/frontend → main  (reviewed by Dev 1)
```

**Dev 2 integration checklist:**
- [ ] Set `MOCK = false` in `src/api/client.js`
- [ ] Start backend (`uvicorn main:app --reload`)
- [ ] Start frontend (`npm run dev`)
- [ ] Connect WebSocket in `useSimulation.js`:
```js
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8000/ws/simulation')
  ws.onmessage = (e) => setSimState(JSON.parse(e.data))
  return () => ws.close()
}, [])
```
- [ ] Test all 4 simulation actions (start/pause/step/reset)
- [ ] Test add patient mid-simulation
- [ ] Verify Gantt chart renders real data

---

## 8. Phase 3 — Polish & Demo Data (Day 5)

| Task | Owner |
|------|-------|
| Load seed patients on backend startup if `patients.json` is empty | Dev 1 |
| Add aging visual indicator (pulsing badge on bumped patients) | Dev 2 |
| Write final `README.md` with setup instructions | Dev 3 |
| End-to-end demo run with all 15 patients | All |
| Record demo video / prepare presentation | Dev 3 |

---

## 9. API Contract (Single Source of Truth)

All shapes below are what Dev 2's mock data must match exactly.

### `GET /patients`
```json
[
  {
    "patient_id": "P001",
    "name": "Arjun Mehta",
    "age": 58,
    "vitals": {
      "heart_rate": 145, "systolic_bp": 180, "diastolic_bp": 110,
      "oxygen_saturation": 88.0, "temperature": 37.2,
      "symptoms": ["chest_pain"]
    },
    "arrival_time": 0,
    "priority_score": 91.5,
    "severity": "CRITICAL",
    "burst_time": 15,
    "status": "waiting",
    "waiting_time": 0,
    "turnaround_time": 0
  }
]
```

### `POST /patients`
Request body: same as above minus `priority_score`, `severity`, `pid`, `status`.  
Response: patient object with computed `priority_score` and `severity`.

### `GET /simulation/state`
```json
{
  "clock": 12,
  "status": "running",
  "num_doctors": 1,
  "scheduler": "priority",
  "queue": {
    "waiting": ["P002", "P004"],
    "in_treatment": ["P001"],
    "done": ["P015"]
  },
  "gantt": [
    { "patient_id": "P001", "doctor_id": 1, "start": 0, "end": 5 }
  ],
  "stats": {
    "avg_waiting_time": 3.5,
    "avg_turnaround_time": 18.2,
    "throughput": 1
  },
  "aged_patients": ["P009"]
}
```

### `POST /simulation/start`  `POST /simulation/pause`  `POST /simulation/step`  `POST /simulation/reset`
All return: `{ "ok": true, "clock": <int> }`

### `POST /algorithms/compare`
Request: `{ "patient_ids": ["P001", "P002", ...] }`  
Response: (matches `compare_algorithms()` return value from `sorting.py`)

### `WS /ws/simulation`
Server pushes `simulation/state` JSON on every tick. Same shape as `GET /simulation/state`.

---

## 10. Data Models

### Patient = OS Process mapping

| Patient Field | OS Concept | Notes |
|--------------|------------|-------|
| `patient_id` | Process ID (PID) | Unique identifier |
| `arrival_time` | Arrival Time | When patient enters ER |
| `burst_time` | Burst Time | Estimated treatment duration |
| `priority_score` | Priority | Higher = more urgent |
| `waiting_time` | Waiting Time | Time spent in queue |
| `turnaround_time` | Turnaround Time | arrival → completion |
| `status` | Process State | waiting / running / terminated |

### JSON Flat File Schema

**`data/patients.json`** — array of Patient objects (runtime, gitignored)  
**`data/simulation_state.json`** — SimulationState object (runtime, gitignored)  
**`data/seed_patients.json`** — array of 15 patients without computed fields (committed)  

---

## 11. DAA Concepts — Algorithm Specifications

### When Each Algorithm is Used

```
Patients arrive → count them
        │
        ▼
   count ≤ 10?
   ┌─── YES ──→ Selection Sort  O(n²)   [simple, low overhead]
   └─── NO  ──→ Merge Sort      O(n log n)  [scalable]
```

### Algorithm Comparison Display (Frontend `AlgoComparison` component)

| Property | Selection Sort | Merge Sort |
|----------|---------------|------------|
| Time (Best) | O(n²) | O(n log n) |
| Time (Worst) | O(n²) | O(n log n) |
| Space | O(1) | O(n) |
| Stable | No | Yes |
| In-place | Yes | No |
| Use case | n ≤ 10 | n > 10 |

Both algorithms are run on the **same patient list** and results compared live in the UI.

### Complexity Panel Data (static, precomputed)

| n | n² (Selection) | n log₂n (Merge) |
|---|---------------|----------------|
| 5 | 25 | 11.6 |
| 10 | 100 | 33.2 |
| 15 | 225 | 58.6 |
| 20 | 400 | 86.4 |
| 25 | 625 | 116.1 |

---

## 12. OS Concepts — Scheduler Specifications

### Priority Scheduling (Preemptive)

- At each clock tick, the patient with highest `priority_score` in the ready queue is treated
- If a new higher-priority patient arrives, current patient is preempted
- Starvation risk → mitigated by Aging mechanism

### Round Robin Scheduling

- Quantum = 5 minutes (configurable in `config.py`)
- Each patient gets up to 5 min of treatment per turn
- After quantum expires, patient returns to back of queue if not done
- Fair — every patient gets time regardless of priority

### Gantt Chart Format

```
Doctor 1: [P015|0-5][P001|5-10][P015|10-15][P014|15-18]...
           ^^^^^^     ^^^^^^     ^^^^^^
           patient    time       patient resumes (RR)
```

### Metrics Calculated

```
Waiting Time     = Turnaround Time − Burst Time
Turnaround Time  = Finish Time − Arrival Time
Response Time    = First Start Time − Arrival Time
```

### Aging Mechanism

```
Every simulation tick:
  for each WAITING patient:
    wait_so_far = clock − arrival_time
    if wait_so_far > AGING_THRESHOLD (default 15 min):
      priority_score += AGING_BOOST (default 10)
      mark patient as aged (UI shows pulse indicator)
      cap priority_score at 100
```

---

## 13. Merge-Conflict Prevention Rules

These are **mandatory**. Breaking them causes merge conflicts.

| Rule | What it means |
|------|--------------|
| **R1** | Dev 1 never creates files outside `backend/` | 
| **R2** | Dev 2 never creates files outside `frontend/` |
| **R3** | Dev 3 never creates files outside `docs/` (except final `README.md` in Phase 3) |
| **R4** | `README.md` is written only in Phase 3 by Dev 3, after all other merges |
| **R5** | API contract (Section 9) is frozen after Day 1. Changes require group chat agreement and must be updated in this file first |
| **R6** | `seed_patients.json` is written once by Dev 1 on Day 1 and never modified |
| **R7** | No dev imports from another dev's directory. Frontend uses HTTP/WS only |
| **R8** | Commit messages: prefix with `[BE]`, `[FE]`, or `[DOC]` |
| **R9** | Each dev pushes to their own branch only; never push to another's branch |
| **R10** | PRs in Phase 2 are reviewed by a different dev (not the author) |

---

## 14. Environment Setup Checklist

### Dev 1 (Backend)

```bash
# Prerequisites
python3.11 --version       # must be 3.11.x
node --version             # not needed but harmless

# Setup
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run
uvicorn main:app --reload --port 8000

# Verify
curl http://localhost:8000/
# → {"status":"ok","service":"Hospital Triage System"}
```

### Dev 2 (Frontend)

```bash
# Prerequisites
node --version             # 18+ required
npm --version

# Setup
cd frontend
npm install

# Run (mock mode — no backend needed)
npm run dev
# → http://localhost:5173

# Switch to real backend (Phase 2):
# Edit src/api/client.js → set MOCK = false
```

### Dev 3 (Docs)

```bash
# Install markdown preview (optional)
npm install -g markdownlint-cli

# Lint docs
markdownlint docs/
```

---

## 15. What You Need to Provide

Nothing external is needed — no APIs, no paid services, no credentials.

### ✅ What the team provides themselves

| Item | Source | Who |
|------|--------|-----|
| Python 3.11 | python.org | Dev 1 |
| Node.js 18+ | nodejs.org | Dev 2 |
| GitHub repo (free) | github.com | Any one dev |
| All libraries | pip / npm (free, open source) | Devs 1 & 2 |

### ✅ Libraries used (all free, no API keys)

**Backend (pip):**
```
fastapi
uvicorn[standard]
pydantic
python-multipart
websockets
```

**Frontend (npm):**
```
vite
react
axios
tailwindcss
@tailwindcss/vite
recharts          ← Gantt chart, complexity chart, bar charts
lucide-react      ← icons
```

### ❌ What you do NOT need

- No OpenAI / Anthropic API key
- No database server (JSON flat files only)
- No Docker (local only)
- No cloud account
- No paid tools

---

## Quick Start (After All 3 Devs Have Merged to Main)

```bash
# Terminal 1 — Backend
cd hospital-triage/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd hospital-triage/frontend
npm install
npm run dev

# Open browser → http://localhost:5173
```

---

*Document version: 1.0 | Last updated by: Implementation planning session*  
*All three devs should read this document fully before writing a single line of code.*

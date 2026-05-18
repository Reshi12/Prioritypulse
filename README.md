# Hospital Triage System

> **Stack:** Python 3.11 · FastAPI · React (Vite + Tailwind) · JSON flat-file storage  
> **Team size:** 3 developers  
> **Features:** Priority Scheduling · Round Robin · Selection Sort · Merge Sort · Aging · WebSocket live updates

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Feature List](#feature-list)
3. [System Architecture](#system-architecture)
4. [Quick Start](#quick-start)
5. [API Reference](#api-reference)
6. [Developer Setup](#developer-setup)
7. [Documentation](#documentation)
8. [Team](#team)

---

## Project Overview

The **Hospital Triage System** is a simulation application that models an Emergency Room (ER) queue using core concepts from:

- **Design and Analysis of Algorithms (DAA):** Selection Sort (O(n²)) for small queues, Merge Sort (O(n log n)) for large queues, with live complexity comparison
- **Operating Systems (OS):** Patients modelled as processes with PID, burst time, and priority; scheduled using Preemptive Priority Scheduling and Round Robin (quantum = 5 min)

Patients arrive with vitals (heart rate, blood pressure, oxygen saturation, symptoms). A triage score (0–100) is calculated automatically. The queue is continuously re-sorted so the most critical patient is always treated next.

**Bonus features:** An aging mechanism prevents low-priority patient starvation, and new patients can be added mid-simulation via API or the frontend form.

---

## Feature List

### Core (Required by Assignment)

| # | Feature |
|---|---------|
| F01 | Priority score from vitals (HR, BP, SpO2, symptoms) |
| F02 | Selection Sort for ≤ 10 patients |
| F03 | Merge Sort for > 10 patients |
| F04 | Time complexity analysis (Big-O + runtime comparison) |
| F05 | Patient modelled as OS Process (PID, AT, BT, priority) |
| F06 | Preemptive Priority Scheduling |
| F07 | Round Robin Scheduling (quantum = 5 min) |
| F08 | Gantt chart data output (per doctor lane) |
| F09–F10 | Waiting time and turnaround time per patient |
| F11 | 15 sample patients with varied vitals |
| F12 | REST API via FastAPI |
| F13 | Live queue view (waiting / treating / done) |
| F14 | Interactive Gantt chart (per doctor lane) |
| F15 | Algorithm comparison panel |
| F16 | Complexity analysis panel (Big-O chart) |

### Bonus Features

| # | Feature |
|---|---------|
| B01 | Aging mechanism (priority bumped after 15 min wait) |
| B02 | Dynamic patient arrival mid-simulation |
| B03 | Real-time WebSocket queue push on new arrival |
| B04 | Live arrival animation in frontend |

---

## System Architecture

```
┌───────────────────────────────────────────────────────┐
│               React Frontend (Vite + Tailwind)        │
│  QueuePanel  │  GanttChart  │  AlgoComparison         │
│              │              │  ComplexityPanel        │
│         API Client (axios) + WebSocket                │
└───────────────────┬───────────────────────────────────┘
                    │ HTTP + WS  (localhost:8000)
┌───────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                      │
│  /patients  /simulation  /algorithms  /ws             │
│                                                       │
│  triage.py  sorting.py  scheduler.py  aging.py        │
│                                                       │
│  data/ → patients.json  simulation_state.json         │
│          seed_patients.json (15 patients, committed)  │
└───────────────────────────────────────────────────────┘
```

---

## Quick Start

> Requires: Python 3.11, Node.js 18+

### Terminal 1 — Backend

```bash
cd hospital-triage/backend

# macOS/Linux
python3.11 -m venv venv && source venv/bin/activate

# Windows
python -m venv venv && venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**  
API docs (Swagger): **http://localhost:8000/docs**

### Terminal 2 — Frontend

```bash
cd hospital-triage/frontend
npm install
npm run dev
```

Open browser: **http://localhost:5173**

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients` | List all patients with computed scores |
| `POST` | `/patients` | Add a new patient (computes score automatically) |
| `GET` | `/simulation/state` | Current clock, queue, Gantt, stats |
| `POST` | `/simulation/start` | Begin simulation |
| `POST` | `/simulation/pause` | Pause at current tick |
| `POST` | `/simulation/step` | Advance one tick |
| `POST` | `/simulation/reset` | Reset to initial state |
| `POST` | `/algorithms/compare` | Run both sorts on given patients, return timing + steps |
| `WS` | `/ws/simulation` | Real-time simulation state broadcast (per tick) |

Full API documentation available at `http://localhost:8000/docs` (Swagger UI) when the backend is running.

---

## Developer Setup

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11.x | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

### Environment Variables

No `.env` file required. All config lives in `backend/config.py`:

```python
ROUND_ROBIN_QUANTUM = 5          # minutes per time slice
AGING_THRESHOLD_MINUTES = 15     # wait before priority bump
AGING_BOOST = 10                 # points added per threshold exceeded
NUM_DOCTORS = 1                  # default doctor count (1–5)
SORT_LARGE_THRESHOLD = 10        # use MergeSort above this count
```

### Linting Docs

```bash
npm install -g markdownlint-cli
markdownlint docs/
```

---

## Documentation

All technical documentation is in the `docs/` directory:

| File | Contents |
|------|----------|
| [`docs/DAA_analysis.md`](docs/DAA_analysis.md) | Selection Sort and Merge Sort — derivations, proofs, comparison table, triage rationale |
| [`docs/OS_concepts.md`](docs/OS_concepts.md) | Process model, Priority Scheduling, Round Robin, metrics, worked example with 5 patients |
| [`docs/demo_walkthrough.md`](docs/demo_walkthrough.md) | Step-by-step run guide, expected UI states, curl examples, troubleshooting |

---

*Built as part of a DAA + OS academic project. No external APIs or paid services required.*
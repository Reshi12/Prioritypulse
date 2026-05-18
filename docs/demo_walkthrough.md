# 🚀 Demo Walkthrough — Hospital Triage System

> **Purpose:** Step-by-step guide to run the full system locally, demonstrate all features, and troubleshoot common issues.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Step 1 — Clone and Setup](#2-step-1--clone-and-setup)
3. [Step 2 — Start the Backend](#3-step-2--start-the-backend)
4. [Step 3 — Start the Frontend](#4-step-3--start-the-frontend)
5. [Step 4 — Run a Full Simulation](#5-step-4--run-a-full-simulation)
6. [Step 5 — Add a Patient Mid-Simulation](#6-step-5--add-a-patient-mid-simulation)
7. [Step 6 — Algorithm Comparison](#7-step-6--algorithm-comparison)
8. [Step 7 — Export Results](#8-step-7--export-results)
9. [Sample curl API Calls](#9-sample-curl-api-calls)
10. [Expected UI State at Each Step](#10-expected-ui-state-at-each-step)
11. [Common Issues and Fixes](#11-common-issues-and-fixes)

---

## 1. Prerequisites

Before starting, ensure the following are installed:

| Tool | Required Version | Check Command | Download |
|------|:---------------:|---------------|----------|
| Python | 3.11.x | `python --version` | [python.org](https://python.org) |
| Node.js | 18+ | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | 9+ | `npm --version` | (bundled with Node) |
| Git | any | `git --version` | [git-scm.com](https://git-scm.com) |

> **Windows users:** Use `python` (not `python3`). Use `venv\Scripts\activate` (not `source venv/bin/activate`).

---

## 2. Step 1 — Clone and Setup

```bash
# Clone the repository
git clone https://github.com/<your-org>/hospital-triage.git
cd hospital-triage
```

**Expected directory structure after clone:**
```
hospital-triage/
├── backend/
├── frontend/
├── docs/
├── .gitignore
└── README.md
```

---

## 3. Step 2 — Start the Backend

Open **Terminal 1** and run:

```bash
cd hospital-triage/backend

# Create and activate virtual environment
# macOS/Linux:
python3.11 -m venv venv
source venv/bin/activate

# Windows:
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify it's working:**
```bash
curl http://localhost:8000/
```
Expected response:
```json
{"status": "ok", "service": "Hospital Triage System"}
```

The backend automatically loads `seed_patients.json` (15 sample patients) on first startup if `patients.json` is empty.

---

## 4. Step 3 — Start the Frontend

Open **Terminal 2** and run:

```bash
cd hospital-triage/frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to: **http://localhost:5173**

> **Note:** If the backend is not running, the frontend falls back to mock data automatically (`MOCK = true` in `src/api/client.js`). Switch to `MOCK = false` to use live data.

---

## 5. Step 4 — Run a Full Simulation

### 4.1 Initial State

When you first open the dashboard, you will see:

```
┌─────────────────────────────────────────────────────────────────┐
│  Hospital Triage System          Clock: 00:00    [STOPPED]      │
├───────────────┬────────────────────┬────────────────────────────┤
│   WAITING (15)│  IN TREATMENT (0)  │       DONE (0)             │
│               │                    │                            │
│  🔴 P015 100  │                    │                            │
│  🔴 P007  99  │                    │                            │
│  🔴 P003  98  │                    │                            │
│  🔴 P001  91  │                    │                            │
│  🔴 P014  88  │                    │                            │
│  🟠 P005  73  │                    │                            │
│  ... 10 more  │                    │                            │
└───────────────┴────────────────────┴────────────────────────────┘
```

Patients are colour-coded:
- 🔴 **CRITICAL** — score ≥ 85
- 🟠 **HIGH** — score 65–84
- 🟡 **MEDIUM** — score 40–64
- 🟢 **LOW** — score < 40

### 4.2 Start Simulation

Click **▶ Start** in the SimControls panel.

The simulation clock begins ticking. The queue re-sorts every tick.

```
┌─────────────────────────────────────────────────────────────────┐
│  Hospital Triage System          Clock: 00:05    [RUNNING]      │
├───────────────┬────────────────────┬────────────────────────────┤
│   WAITING (14)│  IN TREATMENT (1)  │       DONE (0)             │
│               │                    │                            │
│  🔴 P007  99  │  🔴 P015 100       │                            │
│  🔴 P003  98  │  ████████░░ 5/30   │                            │
│  🔴 P001  91  │  (25 min remain)   │                            │
│  ...          │                    │                            │
└───────────────┴────────────────────┴────────────────────────────┘
```

### 4.3 Pause / Step

- Click **⏸ Pause** to freeze the simulation at the current tick
- Click **⏭ Step** to advance exactly one clock tick — useful for debugging
- Click **↺ Reset** to return to initial state with all 15 patients

### 4.4 Doctor Count Slider

The `SimControls` panel includes a slider for **number of doctors** (1–5). Increasing to 2 doctors runs two patients simultaneously in parallel Gantt lanes.

---

## 6. Step 5 — Add a Patient Mid-Simulation

### 5.1 Using the Frontend Form

While the simulation is running, click **+ Add Patient** to open the form.

Fill in:

```
Name:              Neha Verma
Age:               41
Heart Rate:        155 bpm          ← abnormal (triggers +20 score)
Systolic BP:       185 mmHg         ← hypertensive crisis (+15)
Diastolic BP:      115 mmHg
Oxygen Saturation: 86%              ← hypoxic (+18)
Temperature:       37.4 °C
Symptoms:          chest_pain       ← weight +28
```

Click **Submit**.

### 5.2 What happens

1. `POST /patients` is called
2. Backend calculates `priority_score` = ~100 (CRITICAL)
3. Patient is inserted into the queue
4. WebSocket pushes updated state to all connected clients
5. The new patient card **animates** into position #1 in the queue (bumping all others down)

### 5.3 Using curl instead

```bash
curl -X POST http://localhost:8000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P016",
    "name": "Neha Verma",
    "age": 41,
    "vitals": {
      "heart_rate": 155,
      "systolic_bp": 185,
      "diastolic_bp": 115,
      "oxygen_saturation": 86.0,
      "temperature": 37.4,
      "symptoms": ["chest_pain"]
    },
    "arrival_time": 12,
    "burst_time": 18
  }'
```

Expected response:
```json
{
  "patient_id": "P016",
  "name": "Neha Verma",
  "priority_score": 100.0,
  "severity": "CRITICAL",
  "status": "waiting",
  ...
}
```

---

## 7. Step 6 — Algorithm Comparison

### 6.1 Navigate to the Algorithm Panel

Click **Algorithm Analysis** in the navigation bar.

### 6.2 What you see

```
┌──────────────────────────┬──────────────────────────┐
│     SELECTION SORT       │       MERGE SORT         │
│                          │                          │
│  Time:    O(n²)          │  Time:    O(n log n)     │
│  Space:   O(1)           │  Space:   O(n)           │
│  Stable:  ❌ No          │  Stable:  ✅ Yes         │
│                          │                          │
│  n = 15 patients         │  n = 15 patients         │
│  Elapsed: 0.0234 ms      │  Elapsed: 0.0089 ms      │
│  Comparisons: 105        │  Comparisons: 59         │
│                          │                          │
│  Best for: n ≤ 10        │  Best for: n > 10        │
│                          │                          │
│  Merge Sort wins at      │  this queue size         │
└──────────────────────────┴──────────────────────────┘
```

### 6.3 Step Trace Log

Below the comparison cards, a collapsible **Step Trace** shows every swap/merge operation performed by each algorithm — useful for educational demonstrations.

### 6.4 Complexity Chart

The **Complexity Panel** tab shows a bar chart:

```
Operations
  700 ┤
  600 ┤          ████ n²
  500 ┤          ████
  400 ┤          ████           ████ n log n
  300 ┤          ████           ████
  200 ┤     ████ ████      ████ ████
  100 ┤████ ████ ████ ████ ████ ████
      └─────────────────────────────
        n=5  n=10 n=15 n=20 n=25
```

---

## 8. Step 7 — Export Results

After the simulation completes (all patients in DONE column):

```bash
# Export current simulation state as JSON
curl http://localhost:8000/simulation/state > simulation_results.json
```

The exported file contains:
- Full Gantt chart data
- Per-patient waiting times and turnaround times
- Algorithm comparison results
- Scheduling stats (avg wait, avg TAT, throughput)

---

## 9. Sample curl API Calls

### Get all patients
```bash
curl http://localhost:8000/patients
```

### Get simulation state
```bash
curl http://localhost:8000/simulation/state
```

### Start simulation
```bash
curl -X POST http://localhost:8000/simulation/start
```

### Pause simulation
```bash
curl -X POST http://localhost:8000/simulation/pause
```

### Step one tick
```bash
curl -X POST http://localhost:8000/simulation/step
```

### Reset simulation
```bash
curl -X POST http://localhost:8000/simulation/reset
```

### Run algorithm comparison
```bash
curl -X POST http://localhost:8000/algorithms/compare \
  -H "Content-Type: application/json" \
  -d '{"patient_ids": ["P001","P002","P003","P004","P005"]}'
```

### WebSocket (using wscat)
```bash
# Install wscat: npm install -g wscat
wscat -c ws://localhost:8000/ws/simulation
```
Each simulation tick pushes a JSON payload matching the `GET /simulation/state` shape.

---

## 10. Expected UI State at Each Step

### State 1 — Initial Load

```
Clock: 00:00  |  Status: STOPPED  |  Doctors: 1
Queue: 15 patients in WAITING, 0 in TREATMENT, 0 DONE
Top patient: P015 (Harish Venkat) — Priority 100 — CRITICAL
```

### State 2 — After clicking Start (Clock ~5)

```
Clock: 00:05  |  Status: RUNNING  |  Doctors: 1
WAITING: 14   |  IN TREATMENT: 1  |  DONE: 0
Treating: P015 — 5/30 min complete — progress bar 17%
```

### State 3 — First patient completes (Clock ~30)

```
Clock: 00:30  |  Status: RUNNING  |  Doctors: 1
WAITING: 13   |  IN TREATMENT: 1  |  DONE: 1
Done: P015 — TAT: 30 min, WT: 0 min
Now treating: P007 (Suresh Pillai) — CRITICAL
```

### State 4 — Mid-simulation, aging triggers (Clock ~60)

```
Clock: 01:00  |  Status: RUNNING
⚡ P002 (Priya Sharma) priority bumped: 58.0 → 68.0 [AGED]
   Amber pulsing badge visible on P002's card
```

### State 5 — Simulation complete (all 15 done)

```
Clock: ~2:15  |  Status: STOPPED (complete)
WAITING: 0    |  IN TREATMENT: 0  |  DONE: 15
Stats:
  Avg Waiting Time:    38.4 min
  Avg Turnaround Time: 55.1 min
  Throughput:          15 patients
```

---

## 11. Common Issues and Fixes

### ❌ Backend won't start — `ModuleNotFoundError: No module named 'fastapi'`

**Cause:** Virtual environment not activated.

**Fix:**
```bash
# macOS/Linux:
source backend/venv/bin/activate

# Windows:
backend\venv\Scripts\activate

pip install -r requirements.txt
```

---

### ❌ Frontend shows "Network Error" or blank queue

**Cause:** Backend is not running, or `MOCK = false` with no backend.

**Fix Option A — Use mock data:**
```js
// src/api/client.js
export const MOCK = true   // ← set this to true
```

**Fix Option B — Start backend first:**
```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

---

### ❌ Port 8000 already in use

```bash
# Find and kill the process on port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

### ❌ Port 5173 already in use

```bash
# Run frontend on a different port
npm run dev -- --port 5174
```

Then update `main.py` CORS to allow `http://localhost:5174`.

---

### ❌ WebSocket not connecting (browser console error)

**Cause:** Backend WebSocket endpoint not reachable, or browser blocks `ws://` on HTTPS.

**Fix:** Ensure you're running on `http://localhost:5173` (not HTTPS) and the backend is on `ws://localhost:8000/ws/simulation`.

Check in browser console: the WebSocket URL should show `ws://localhost:8000/ws/simulation`.

---

### ❌ `patients.json` is empty / seed data not loaded

**Fix:** Delete the empty file and restart the backend — it auto-seeds from `seed_patients.json`:
```bash
rm backend/data/patients.json
# restart uvicorn
```

---

### ❌ Gantt chart is blank after simulation

**Cause:** Simulation was reset before completion, or `MOCK = true` and mock Gantt data is empty.

**Fix:** Reset the simulation, start it, and let at least one patient complete treatment. Check `GET /simulation/state` → `gantt` array is non-empty.

---

### ❌ `markdownlint` errors when linting docs

```bash
# Install markdownlint
npm install -g markdownlint-cli

# Lint and see errors
markdownlint docs/

# Auto-fix where possible
markdownlint --fix docs/
```

Common lint rules to watch:
- MD013: Line length (max 120 chars)
- MD041: First line must be a top-level heading
- MD022: Headings should be surrounded by blank lines

---

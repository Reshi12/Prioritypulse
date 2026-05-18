"""
Hospital Triage System — FastAPI entry point.
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import patients, simulation, algorithms, ws
from core.simulation import SimulationEngine

app = FastAPI(
    title="Hospital Triage System",
    description="Priority-based ER triage with DAA sorting and OS scheduling",
    version="1.0.0",
)

# V09 — CORS configured for local React dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
app.include_router(algorithms.router, prefix="/algorithms", tags=["Algorithms"])
app.include_router(ws.router, tags=["WebSocket"])


@app.on_event("startup")
def startup_load():
    """Load seed patients on startup if none exist (Phase 3 polish task)."""
    engine = SimulationEngine.get()
    if not engine.patients:
        engine.load_seed()


@app.get("/")
def health():
    return {"status": "ok", "service": "Hospital Triage System"}

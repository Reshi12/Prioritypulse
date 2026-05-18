"""
Simulation control endpoints.
POST /simulation/start   → begin auto-advance
POST /simulation/pause   → freeze clock
POST /simulation/step    → advance 1 tick manually
POST /simulation/reset   → reset to initial state
GET  /simulation/state   → current simulation snapshot
GET  /simulation/export  → full export (V07)
"""

from fastapi import APIRouter
from pydantic import BaseModel

from core.simulation import SimulationEngine

router = APIRouter()


class StartRequest(BaseModel):
    scheduler: str = "priority"      # "priority" or "round_robin"
    num_doctors: int = 0             # 0 = keep current


@router.post("/start")
async def start_simulation(req: StartRequest = StartRequest()):
    engine = SimulationEngine.get()
    engine.start(scheduler=req.scheduler, num_doctors=req.num_doctors)
    return {"ok": True, "clock": engine.clock}


@router.post("/pause")
async def pause_simulation():
    engine = SimulationEngine.get()
    engine.pause()
    return {"ok": True, "clock": engine.clock}


@router.post("/step")
async def step_simulation():
    engine = SimulationEngine.get()
    engine.step()
    return {"ok": True, "clock": engine.clock}


@router.post("/reset")
async def reset_simulation():
    engine = SimulationEngine.get()
    engine.reset()
    return {"ok": True, "clock": engine.clock}


@router.get("/state")
async def get_simulation_state():
    engine = SimulationEngine.get()
    return engine.get_state().model_dump()


@router.get("/export")
async def export_results():
    """V07 — Export full simulation results as JSON."""
    engine = SimulationEngine.get()
    state = engine.get_state().model_dump()
    state["patients"] = engine.get_patients_list()
    return state

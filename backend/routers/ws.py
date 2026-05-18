"""
WebSocket endpoint — pushes simulation state on every tick (V10 / B03).
Clients connect to ws://localhost:8000/ws/simulation
"""

import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.simulation import SimulationEngine

router = APIRouter()

# Connected clients
_clients: list[WebSocket] = []


async def broadcast(state: dict):
    """Push simulation state to all connected WebSocket clients."""
    dead = []
    payload = json.dumps(state, default=str)
    for ws in _clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _clients.remove(ws)


@router.websocket("/ws/simulation")
async def simulation_ws(websocket: WebSocket):
    await websocket.accept()
    _clients.append(websocket)

    # Register broadcast callback on the engine
    engine = SimulationEngine.get()
    engine.set_broadcast(broadcast)

    # Send current state immediately on connect
    try:
        state = engine.get_state().model_dump()
        await websocket.send_text(json.dumps(state, default=str))
    except Exception:
        pass

    try:
        while True:
            # Keep connection open; client can send commands too
            data = await websocket.receive_text()
            # Optional: handle client messages (e.g., step command via WS)
            msg = json.loads(data)
            cmd = msg.get("command")
            if cmd == "step":
                engine.step()
                await broadcast(engine.get_state().model_dump())
            elif cmd == "start":
                engine.start(
                    scheduler=msg.get("scheduler", "priority"),
                    num_doctors=msg.get("num_doctors", 0),
                )
            elif cmd == "pause":
                engine.pause()
                await broadcast(engine.get_state().model_dump())
            elif cmd == "reset":
                engine.reset()
                await broadcast(engine.get_state().model_dump())
    except WebSocketDisconnect:
        _clients.remove(websocket)
    except Exception:
        if websocket in _clients:
            _clients.remove(websocket)

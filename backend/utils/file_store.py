"""
JSON flat-file storage helpers.
All runtime data is persisted to backend/data/*.json files.
"""

import json
import os
from config import DATA_DIR


def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def read_json(filename: str) -> list | dict:
    _ensure_data_dir()
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return [] if filename.endswith("patients.json") else {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(filename: str, data) -> None:
    _ensure_data_dir()
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def load_seed_patients() -> list[dict]:
    """Load the committed seed_patients.json (15 sample patients)."""
    path = os.path.join(DATA_DIR, "seed_patients.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_patients_json() -> list[dict]:
    return read_json("patients.json")


def save_patients_json(patients_data: list[dict]) -> None:
    write_json("patients.json", patients_data)


def load_simulation_state() -> dict:
    return read_json("simulation_state.json")


def save_simulation_state(state: dict) -> None:
    write_json("simulation_state.json", state)

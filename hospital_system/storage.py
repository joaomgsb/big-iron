"""Persistence layer for the hospital system."""
from __future__ import annotations

import json
from pathlib import Path
from threading import RLock
from typing import Dict, Iterable, List

from .models import Patient, Professional


class JSONStorage:
    """Thread-safe JSON-backed storage for hospital data."""

    def __init__(self, path: Path) -> None:
        self._path = path
        self._lock = RLock()
        self._path.parent.mkdir(parents=True, exist_ok=True)
        if not self._path.exists():
            self._write({"patients": [], "professionals": []})

    def _read(self) -> Dict[str, object]:
        with self._lock:
            with self._path.open("r", encoding="utf-8") as handle:
                return json.load(handle)

    def _write(self, data: Dict[str, object]) -> None:
        with self._lock:
            tmp_path = self._path.with_suffix(".tmp")
            with tmp_path.open("w", encoding="utf-8") as handle:
                json.dump(data, handle, indent=2, ensure_ascii=False)
            tmp_path.replace(self._path)

    def load_patients(self) -> List[Patient]:
        payload = self._read()
        return [Patient.from_dict(item) for item in payload.get("patients", [])]

    def load_professionals(self) -> List[Professional]:
        payload = self._read()
        return [Professional.from_dict(item) for item in payload.get("professionals", [])]

    def save(self, patients: Iterable[Patient], professionals: Iterable[Professional]) -> None:
        data = {
            "patients": [patient.to_dict() for patient in patients],
            "professionals": [professional.to_dict() for professional in professionals],
        }
        self._write(data)


__all__ = ["JSONStorage"]

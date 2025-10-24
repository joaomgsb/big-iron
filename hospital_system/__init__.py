"""High-level hospital management package."""

from .models import DepartmentType, Patient, Professional, EvolutionNote, Admission
from .services import HospitalService
from .cli import HospitalCLI

__all__ = [
    "DepartmentType",
    "Patient",
    "Professional",
    "EvolutionNote",
    "Admission",
    "HospitalService",
    "HospitalCLI",
]

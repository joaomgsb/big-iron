"""Domain models for the hospital management system."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional


class DepartmentType(str, Enum):
    """Enumeration of supported hospital departments."""

    ICU = "UTI"
    MATERNITY = "Maternidade"
    SURGICAL_CLINIC = "Clínica Cirúrgica"
    MEDICAL_CLINIC = "Clínica Médica"

    @classmethod
    def list(cls) -> List[str]:
        return [dept.value for dept in cls]


@dataclass
class Professional:
    """Information about a hospital professional."""

    professional_id: str
    name: str
    role: str
    departments: List[DepartmentType]

    def to_dict(self) -> Dict[str, object]:
        return {
            "professional_id": self.professional_id,
            "name": self.name,
            "role": self.role,
            "departments": [dept.value for dept in self.departments],
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, object]) -> "Professional":
        return cls(
            professional_id=str(payload["professional_id"]),
            name=str(payload["name"]),
            role=str(payload["role"]),
            departments=[DepartmentType(dept) for dept in payload.get("departments", [])],
        )


@dataclass
class EvolutionNote:
    """Progress note for an admitted patient."""

    note_id: str
    professional_id: str
    content: str
    created_at: datetime
    department: DepartmentType

    def to_dict(self) -> Dict[str, object]:
        return {
            "note_id": self.note_id,
            "professional_id": self.professional_id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "department": self.department.value,
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, object]) -> "EvolutionNote":
        return cls(
            note_id=str(payload["note_id"]),
            professional_id=str(payload["professional_id"]),
            content=str(payload["content"]),
            created_at=datetime.fromisoformat(str(payload["created_at"])),
            department=DepartmentType(payload["department"]),
        )


@dataclass
class Admission:
    """Represents a patient's stay in the hospital."""

    admission_id: str
    patient_id: str
    department: DepartmentType
    bed_number: str
    admitted_at: datetime
    discharged_at: Optional[datetime] = None
    evolution_notes: List[EvolutionNote] = field(default_factory=list)
    professionals: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "admission_id": self.admission_id,
            "patient_id": self.patient_id,
            "department": self.department.value,
            "bed_number": self.bed_number,
            "admitted_at": self.admitted_at.isoformat(),
            "discharged_at": self.discharged_at.isoformat() if self.discharged_at else None,
            "evolution_notes": [note.to_dict() for note in self.evolution_notes],
            "professionals": self.professionals,
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, object]) -> "Admission":
        return cls(
            admission_id=str(payload["admission_id"]),
            patient_id=str(payload["patient_id"]),
            department=DepartmentType(payload["department"]),
            bed_number=str(payload["bed_number"]),
            admitted_at=datetime.fromisoformat(str(payload["admitted_at"])),
            discharged_at=(
                datetime.fromisoformat(str(payload["discharged_at"]))
                if payload.get("discharged_at")
                else None
            ),
            evolution_notes=[EvolutionNote.from_dict(note) for note in payload.get("evolution_notes", [])],
            professionals=[str(pid) for pid in payload.get("professionals", [])],
        )

    def is_active(self) -> bool:
        return self.discharged_at is None


@dataclass
class Patient:
    """Core information about a patient."""

    patient_id: str
    name: str
    birth_date: datetime
    diagnosis: str
    allergies: List[str]
    admissions: List[Admission] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "patient_id": self.patient_id,
            "name": self.name,
            "birth_date": self.birth_date.isoformat(),
            "diagnosis": self.diagnosis,
            "allergies": self.allergies,
            "admissions": [admission.to_dict() for admission in self.admissions],
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, object]) -> "Patient":
        return cls(
            patient_id=str(payload["patient_id"]),
            name=str(payload["name"]),
            birth_date=datetime.fromisoformat(str(payload["birth_date"])),
            diagnosis=str(payload["diagnosis"]),
            allergies=[str(allergy) for allergy in payload.get("allergies", [])],
            admissions=[Admission.from_dict(admission) for admission in payload.get("admissions", [])],
        )

    def get_active_admission(self) -> Optional[Admission]:
        for admission in self.admissions:
            if admission.is_active():
                return admission
        return None

    def add_admission(self, admission: Admission) -> None:
        if self.get_active_admission():
            raise ValueError("Patient already has an active admission")
        self.admissions.append(admission)

    def discharge(self, discharge_time: Optional[datetime] = None) -> None:
        admission = self.get_active_admission()
        if not admission:
            raise ValueError("No active admission to discharge")
        admission.discharged_at = discharge_time or datetime.now()

"""Business logic for the hospital management system."""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional
import uuid

from .models import (
    Admission,
    DepartmentType,
    EvolutionNote,
    Patient,
    Professional,
)
from .storage import JSONStorage


class HospitalService:
    """High-level service to manage hospital operations."""

    def __init__(self, storage_path: Optional[Path] = None) -> None:
        storage_file = storage_path or Path("data/hospital_state.json")
        self._storage = JSONStorage(storage_file)
        self._patients: Dict[str, Patient] = {
            patient.patient_id: patient for patient in self._storage.load_patients()
        }
        self._professionals: Dict[str, Professional] = {
            professional.professional_id: professional
            for professional in self._storage.load_professionals()
        }

    # ------------------------------------------------------------------
    # Professional management
    # ------------------------------------------------------------------
    def register_professional(
        self, name: str, role: str, departments: Iterable[DepartmentType]
    ) -> Professional:
        professional_id = self._generate_id(prefix="PRF")
        professional = Professional(
            professional_id=professional_id,
            name=name,
            role=role,
            departments=list(dict.fromkeys(departments)),
        )
        self._professionals[professional_id] = professional
        self._persist()
        return professional

    def assign_professional_to_admission(
        self, professional_id: str, admission_id: str
    ) -> None:
        admission = self._get_admission_by_id(admission_id)
        if professional_id not in self._professionals:
            raise ValueError(f"Professional '{professional_id}' not found")
        professional = self._professionals[professional_id]
        if admission.department not in professional.departments:
            raise ValueError("Professional not authorized for this department")

        if professional_id not in admission.professionals:
            admission.professionals.append(professional_id)
            self._persist()

    # ------------------------------------------------------------------
    # Patient management
    # ------------------------------------------------------------------
    def register_patient(
        self, name: str, birth_date: datetime, diagnosis: str, allergies: List[str]
    ) -> Patient:
        patient_id = self._generate_id(prefix="PAT")
        patient = Patient(
            patient_id=patient_id,
            name=name,
            birth_date=birth_date,
            diagnosis=diagnosis,
            allergies=allergies,
        )
        self._patients[patient_id] = patient
        self._persist()
        return patient

    def admit_patient(
        self, patient_id: str, department: DepartmentType, bed_number: str
    ) -> Admission:
        patient = self._get_patient(patient_id)
        if patient.get_active_admission():
            raise ValueError("Patient already admitted")

        admission = Admission(
            admission_id=self._generate_id(prefix="ADM"),
            patient_id=patient_id,
            department=department,
            bed_number=bed_number,
            admitted_at=datetime.now(),
        )
        patient.add_admission(admission)
        self._persist()
        return admission

    def transfer_patient(self, admission_id: str, new_department: DepartmentType, bed_number: str) -> None:
        admission = self._get_admission_by_id(admission_id)
        if not admission.is_active():
            raise ValueError("Cannot transfer discharged patient")
        if admission.department == new_department and admission.bed_number == bed_number:
            return
        admission.department = new_department
        admission.bed_number = bed_number
        self._persist()

    def discharge_patient(self, patient_id: str) -> None:
        patient = self._get_patient(patient_id)
        patient.discharge()
        self._persist()

    # ------------------------------------------------------------------
    # Evolutions
    # ------------------------------------------------------------------
    def add_evolution(
        self, admission_id: str, professional_id: str, content: str
    ) -> EvolutionNote:
        admission = self._get_admission_by_id(admission_id)
        if professional_id not in self._professionals:
            raise ValueError(f"Professional '{professional_id}' not found")
        professional = self._professionals[professional_id]
        if admission.department not in professional.departments:
            raise ValueError("Professional not authorized for this department")
        if professional_id not in admission.professionals:
            admission.professionals.append(professional_id)

        note = EvolutionNote(
            note_id=self._generate_id(prefix="EVL"),
            professional_id=professional_id,
            content=content,
            created_at=datetime.now(),
            department=admission.department,
        )
        admission.evolution_notes.append(note)
        self._persist()
        return note

    # ------------------------------------------------------------------
    # Reporting
    # ------------------------------------------------------------------
    def list_patients(self) -> List[Patient]:
        return list(sorted(self._patients.values(), key=lambda patient: patient.name))

    def get_professionals(self) -> Dict[str, Professional]:
        return dict(self._professionals)

    def get_patient_timeline(self, patient_id: str) -> Dict[str, List[EvolutionNote]]:
        patient = self._get_patient(patient_id)
        grouped: Dict[str, List[EvolutionNote]] = defaultdict(list)
        for admission in patient.admissions:
            key = f"{admission.admission_id} ({admission.department.value})"
            grouped[key].extend(sorted(admission.evolution_notes, key=lambda note: note.created_at))
        return dict(grouped)

    def get_department_overview(self) -> Dict[DepartmentType, Dict[str, int]]:
        overview: Dict[DepartmentType, Dict[str, int]] = {
            department: {"patients": 0, "beds": 0}
            for department in DepartmentType
        }
        for patient in self._patients.values():
            for admission in patient.admissions:
                if admission.is_active():
                    overview[admission.department]["patients"] += 1
                    overview[admission.department]["beds"] += 1
        return overview

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _generate_id(self, prefix: str) -> str:
        return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

    def _get_patient(self, patient_id: str) -> Patient:
        try:
            return self._patients[patient_id]
        except KeyError as exc:
            raise ValueError(f"Patient '{patient_id}' not found") from exc

    def _get_admission_by_id(self, admission_id: str) -> Admission:
        for patient in self._patients.values():
            for admission in patient.admissions:
                if admission.admission_id == admission_id:
                    return admission
        raise ValueError(f"Admission '{admission_id}' not found")

    def _persist(self) -> None:
        self._storage.save(self._patients.values(), self._professionals.values())


def format_evolution(note: EvolutionNote, professionals: Dict[str, Professional]) -> str:
    professional = professionals.get(note.professional_id)
    name = professional.name if professional else note.professional_id
    timestamp = note.created_at.strftime("%d/%m/%Y %H:%M")
    return f"[{timestamp}] {name} ({note.department.value}): {note.content}"


def summarize_patient(patient: Patient, professionals: Dict[str, Professional]) -> str:
    lines = [
        f"Paciente: {patient.name} ({patient.patient_id})",
        f"Nascimento: {patient.birth_date.strftime('%d/%m/%Y')}",
        f"Diagnóstico: {patient.diagnosis}",
        f"Alergias: {', '.join(patient.allergies) if patient.allergies else 'Nenhuma'}",
        "Admissões:",
    ]
    for admission in patient.admissions:
        status = "Ativa" if admission.is_active() else "Encerrada"
        lines.append(
            f"  - {admission.admission_id} | {admission.department.value} | Leito {admission.bed_number} | {status}"
        )
        for note in sorted(admission.evolution_notes, key=lambda note: note.created_at):
            lines.append(f"      * {format_evolution(note, professionals)}")
    return "\n".join(lines)


__all__ = [
    "HospitalService",
    "format_evolution",
    "summarize_patient",
]

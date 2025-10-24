"""Command line interface for the hospital system."""
from __future__ import annotations

from datetime import datetime
from textwrap import indent
from typing import Callable, Dict, List, Optional

from .models import DepartmentType, Patient
from .services import HospitalService, summarize_patient


class MenuOption:
    def __init__(self, description: str, handler: Callable[[], None]) -> None:
        self.description = description
        self.handler = handler


class HospitalCLI:
    """Interactive command line interface for hospital management."""

    def __init__(self, service: Optional[HospitalService] = None) -> None:
        self.service = service or HospitalService()
        self._options: Dict[str, MenuOption] = {}
        self._setup_options()

    def _setup_options(self) -> None:
        self._options = {
            "1": MenuOption("Cadastrar profissional", self.cmd_register_professional),
            "2": MenuOption("Cadastrar paciente", self.cmd_register_patient),
            "3": MenuOption("Internar paciente", self.cmd_admit_patient),
            "4": MenuOption("Transferir paciente", self.cmd_transfer_patient),
            "5": MenuOption("Dar alta ao paciente", self.cmd_discharge_patient),
            "6": MenuOption("Vincular profissional à admissão", self.cmd_assign_professional),
            "7": MenuOption("Registrar evolução", self.cmd_add_evolution),
            "8": MenuOption("Listar pacientes", self.cmd_list_patients),
            "9": MenuOption("Resumo do paciente", self.cmd_patient_summary),
            "10": MenuOption("Visão geral dos setores", self.cmd_department_overview),
            "0": MenuOption("Sair", self.cmd_exit),
        }

    # ------------------------------------------------------------------
    # Command loop
    # ------------------------------------------------------------------
    def run(self) -> None:
        while True:
            print("\n=== Sistema de Gestão Hospitalar ===")
            for key, option in self._options.items():
                print(f"{key}. {option.description}")
            choice = input("Selecione uma opção: ").strip()
            option = self._options.get(choice)
            if not option:
                print("Opção inválida. Tente novamente.")
                continue
            try:
                option.handler()
            except Exception as exc:  # noqa: BLE001
                print(f"Erro: {exc}")

    # ------------------------------------------------------------------
    # Command handlers
    # ------------------------------------------------------------------
    def cmd_register_professional(self) -> None:
        print("\n--- Cadastro de Profissional ---")
        name = input("Nome: ").strip()
        role = input("Função: ").strip()
        departments = self._prompt_departments()
        professional = self.service.register_professional(name, role, departments)
        print(f"Profissional cadastrado com ID {professional.professional_id}")

    def cmd_register_patient(self) -> None:
        print("\n--- Cadastro de Paciente ---")
        name = input("Nome: ").strip()
        birth_date = self._prompt_date("Data de nascimento (dd/mm/aaaa): ")
        diagnosis = input("Diagnóstico principal: ").strip()
        allergies_raw = input("Alergias (separe por vírgula): ").strip()
        allergies = [item.strip() for item in allergies_raw.split(",") if item.strip()]
        patient = self.service.register_patient(name, birth_date, diagnosis, allergies)
        print(f"Paciente cadastrado com ID {patient.patient_id}")

    def cmd_admit_patient(self) -> None:
        print("\n--- Internação ---")
        patient_id = input("ID do paciente: ").strip()
        department = self._prompt_department()
        bed_number = input("Número do leito: ").strip()
        admission = self.service.admit_patient(patient_id, department, bed_number)
        print(f"Paciente internado com admissão {admission.admission_id}")

    def cmd_transfer_patient(self) -> None:
        print("\n--- Transferência ---")
        admission_id = input("ID da admissão: ").strip()
        department = self._prompt_department()
        bed_number = input("Novo leito: ").strip()
        self.service.transfer_patient(admission_id, department, bed_number)
        print("Transferência concluída.")

    def cmd_discharge_patient(self) -> None:
        print("\n--- Alta ---")
        patient_id = input("ID do paciente: ").strip()
        self.service.discharge_patient(patient_id)
        print("Paciente recebeu alta.")

    def cmd_add_evolution(self) -> None:
        print("\n--- Evolução ---")
        admission_id = input("ID da admissão: ").strip()
        professional_id = input("ID do profissional: ").strip()
        content = input("Descrição da evolução: ").strip()
        note = self.service.add_evolution(admission_id, professional_id, content)
        print(f"Evolução registrada ({note.note_id})")

    def cmd_assign_professional(self) -> None:
        print("\n--- Vincular Profissional ---")
        admission_id = input("ID da admissão: ").strip()
        professional_id = input("ID do profissional: ").strip()
        self.service.assign_professional_to_admission(professional_id, admission_id)
        print("Profissional vinculado à admissão.")

    def cmd_list_patients(self) -> None:
        print("\n--- Pacientes ---")
        patients = self.service.list_patients()
        if not patients:
            print("Nenhum paciente cadastrado.")
            return
        for patient in patients:
            active = "Sim" if patient.get_active_admission() else "Não"
            print(
                f"- {patient.name} ({patient.patient_id}) | Diagnóstico: {patient.diagnosis} | Internado: {active}"
            )

    def cmd_patient_summary(self) -> None:
        print("\n--- Resumo do Paciente ---")
        patient_id = input("ID do paciente: ").strip()
        patient = self._get_patient(patient_id)
        print(indent(summarize_patient(patient, self.service.get_professionals()), "  "))

    def cmd_department_overview(self) -> None:
        print("\n--- Visão Geral ---")
        overview = self.service.get_department_overview()
        for department, data in overview.items():
            print(f"- {department.value}: {data['patients']} pacientes, {data['beds']} leitos ocupados")

    def cmd_exit(self) -> None:
        print("Saindo do sistema. Até logo!")
        raise SystemExit(0)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _prompt_departments(self) -> List[DepartmentType]:
        options = DepartmentType.list()
        print("Setores disponíveis:")
        for idx, name in enumerate(options, start=1):
            print(f"  {idx}. {name}")
        selected = input("Selecione os setores (ex: 1,3): ").split(",")
        departments: List[DepartmentType] = []
        for item in selected:
            item = item.strip()
            if not item:
                continue
            try:
                index = int(item) - 1
                departments.append(list(DepartmentType)[index])
            except (ValueError, IndexError) as exc:
                raise ValueError(f"Setor inválido: {item}") from exc
        if not departments:
            raise ValueError("É necessário informar ao menos um setor")
        return departments

    def _prompt_department(self) -> DepartmentType:
        departments = self._prompt_departments()
        if len(departments) > 1:
            raise ValueError("Selecione apenas um setor")
        return departments[0]

    def _prompt_date(self, message: str) -> datetime:
        raw = input(message).strip()
        try:
            return datetime.strptime(raw, "%d/%m/%Y")
        except ValueError as exc:
            raise ValueError("Data inválida. Use o formato dd/mm/aaaa.") from exc

    def _get_patient(self, patient_id: str) -> Patient:
        patients = {patient.patient_id: patient for patient in self.service.list_patients()}
        try:
            return patients[patient_id]
        except KeyError as exc:
            raise ValueError(f"Paciente '{patient_id}' não encontrado") from exc


__all__ = ["HospitalCLI"]

"""Executable entry-point for the hospital management system."""
from __future__ import annotations

from .cli import HospitalCLI


def main() -> None:
    """Launch the interactive CLI."""
    HospitalCLI().run()


if __name__ == "__main__":
    main()

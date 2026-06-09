#!/usr/bin/env python3
"""Phase 04: Render phase plans and compact coding-agent packets."""

from __future__ import annotations

import json
from pathlib import Path


PHASE_IDS = [
    "phase-001-contract-lock",
    "phase-002-dashboard-and-plans-read",
    "phase-003-create-workout-plan",
    "phase-004-update-delete-workout-plan",
    "phase-005-exercises",
    "phase-006-workout-logs-history",
    "phase-007-browser-contract-smoke",
]

MAX_AGENT_PACKET_TOKENS = 3000
MAX_PHASE_CONTEXT_TOKENS = 8000


class HandoffPhaseError(Exception):
    pass


def load_phase_input(path: Path) -> dict:
    if not path.exists():
        raise HandoffPhaseError(f"phase input not found: {path}")

    data = json.loads(path.read_text(encoding="utf-8"))
    if "phases" not in data or not isinstance(data["phases"], list):
        raise HandoffPhaseError("phase input missing phases array")
    return data


def validate_phase_input(data: dict) -> None:
    phases = data.get("phases", [])
    ids = [phase.get("id") for phase in phases]

    missing = [phase_id for phase_id in PHASE_IDS if phase_id not in ids]
    if missing:
        raise HandoffPhaseError(f"missing required phases: {missing}")

    lock_index = ids.index("phase-001-contract-lock")
    if lock_index != 0:
        raise HandoffPhaseError("phase-001-contract-lock must be the first phase")

    for phase in phases:
        _validate_phase(phase)


def render_handoff_phases(phase_input_path: Path, out_dir: Path) -> dict:
    data = load_phase_input(phase_input_path)
    validate_phase_input(data)

    phases_dir = out_dir / "phases"
    packets_dir = out_dir / "agent-packets"
    phases_dir.mkdir(parents=True, exist_ok=True)
    packets_dir.mkdir(parents=True, exist_ok=True)

    rendered = []
    for phase in data["phases"]:
        phase_md = render_phase_markdown(phase)
        phase_path = phases_dir / f"{phase['id']}.md"
        phase_path.write_text(phase_md, encoding="utf-8")

        packet_dir = packets_dir / phase["id"]
        packet_dir.mkdir(parents=True, exist_ok=True)
        packet_md = render_agent_packet(phase)
        if count_words(packet_md) > MAX_AGENT_PACKET_TOKENS:
            raise HandoffPhaseError(f"{phase['id']} exceeds agent packet budget")
        packet_path = packet_dir / "TASK.md"
        packet_path.write_text(packet_md, encoding="utf-8")
        (packet_dir / "contract-slice.json").write_text(
            json.dumps({"contractExcerpts": phase["contractExcerpts"]}, indent=2) + "\n",
            encoding="utf-8",
        )
        (packet_dir / "allowed-files.json").write_text(
            json.dumps({"allowedFiles": phase["allowedFiles"], "forbiddenFiles": phase["forbiddenFiles"]}, indent=2)
            + "\n",
            encoding="utf-8",
        )
        (packet_dir / "proof-required.md").write_text(
            phase["proofReportTemplate"] + "\n",
            encoding="utf-8",
        )

        rendered.append(phase["id"])

    return {"phases": rendered, "phaseDir": str(phases_dir), "packetDir": str(packets_dir)}


def render_phase_markdown(phase: dict) -> str:
    _validate_phase(phase)
    lines = [
        f"# {phase['id']}",
        "",
        f"Goal: {phase['goal']}",
        "",
        "## Allowed Files",
        *[f"- `{path}`" for path in phase["allowedFiles"]],
        "",
        "## Forbidden Files",
        *[f"- `{path}`" for path in phase["forbiddenFiles"]],
        "",
        "## Contract Excerpts",
        *[f"- {excerpt}" for excerpt in phase["contractExcerpts"]],
        "",
        "## Tests To Write First",
        *[f"- {item}" for item in phase["testsToWriteFirst"]],
        "",
        "## Implementation Checklist",
        *[f"- {item}" for item in phase["implementationChecklist"]],
        "",
        f"## Pass Condition\n{phase['passCondition']}",
        "",
        f"## Fail Condition\n{phase['failCondition']}",
        "",
        "## Proof Report Template",
        phase["proofReportTemplate"],
        "",
        f"## Max Context Tokens\n{phase['maxContextTokens']}",
    ]
    return "\n".join(lines).strip() + "\n"


def render_agent_packet(phase: dict) -> str:
    _validate_phase(phase)
    packet = [
        f"# {phase['id']}",
        "",
        phase["goal"],
        "",
        "## Allowed Files",
        *[f"- `{path}`" for path in phase["allowedFiles"]],
        "",
        "## Forbidden Files",
        *[f"- `{path}`" for path in phase["forbiddenFiles"]],
        "",
        "## Tests First",
        *[f"- {item}" for item in phase["testsToWriteFirst"]],
        "",
        "## Contract Slice",
        *[f"- {excerpt}" for excerpt in phase["contractExcerpts"]],
        "",
        "## Proof Required",
        phase["proofReportTemplate"],
        "",
        f"## Budget\n- Max tokens: {min(phase['maxContextTokens'], MAX_AGENT_PACKET_TOKENS)}",
    ]
    return "\n".join(packet).strip() + "\n"


def _validate_phase(phase: dict) -> None:
    required = {
        "id",
        "goal",
        "allowedFiles",
        "forbiddenFiles",
        "contractExcerpts",
        "testsToWriteFirst",
        "implementationChecklist",
        "passCondition",
        "failCondition",
        "proofReportTemplate",
        "maxContextTokens",
    }
    missing = required - set(phase.keys())
    if missing:
        raise HandoffPhaseError(f"phase missing fields: {sorted(missing)}")

    if phase["id"] not in PHASE_IDS:
        raise HandoffPhaseError(f"unknown phase id: {phase['id']}")
    if not phase["allowedFiles"]:
        raise HandoffPhaseError(f"{phase['id']} missing allowedFiles")
    if not phase["testsToWriteFirst"]:
        raise HandoffPhaseError(f"{phase['id']} missing testsToWriteFirst")
    if phase["maxContextTokens"] > MAX_PHASE_CONTEXT_TOKENS:
        raise HandoffPhaseError(f"{phase['id']} exceeds maxContextTokens")


def count_words(text: str) -> int:
    return len([token for token in text.split() if token.strip()])

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

from phase_04.handoff_phases import (
    HandoffPhaseError,
    MAX_AGENT_PACKET_TOKENS,
    render_handoff_phases,
    load_phase_input,
)


REPO_ROOT = Path(__file__).resolve().parents[4]
CLI = REPO_ROOT / "additional-modules" / "ui-handoff-contract" / "bin" / "ui-handoff-contract.js"
FIXTURE = REPO_ROOT / "tests" / "fixtures" / "workout-contract-handoff-package"


def run_addon(tmp_path: Path) -> Path:
    out_dir = tmp_path / "contract-out"
    result = subprocess.run(
        ["node", str(CLI), "--package", str(FIXTURE), "--out", str(out_dir)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr or result.stdout
    return out_dir


def test_consumes_generated_phase_input_and_renders_phase_files(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    phase_input = load_phase_input(out_dir / "phase-input.json")

    result = render_handoff_phases(out_dir / "phase-input.json", tmp_path / "rendered")

    assert len(result["phases"]) == 7
    assert phase_input["phases"][0]["id"] == "phase-001-contract-lock"
    for phase_id in result["phases"]:
        assert (tmp_path / "rendered" / "phases" / f"{phase_id}.md").exists()
        assert (tmp_path / "rendered" / "agent-packets" / phase_id / "TASK.md").exists()
        assert (tmp_path / "rendered" / "agent-packets" / phase_id / "contract-slice.json").exists()
        assert (tmp_path / "rendered" / "agent-packets" / phase_id / "allowed-files.json").exists()
        assert (tmp_path / "rendered" / "agent-packets" / phase_id / "proof-required.md").exists()


def test_rejects_phase_missing_tests_first(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    data = json.loads((out_dir / "phase-input.json").read_text(encoding="utf-8"))
    data["phases"][0]["testsToWriteFirst"] = []
    mutated = tmp_path / "mutated.json"
    mutated.write_text(json.dumps(data), encoding="utf-8")

    with pytest.raises(HandoffPhaseError, match="missing testsToWriteFirst"):
        render_handoff_phases(mutated, tmp_path / "rendered")


def test_rejects_phase_missing_allowed_files(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    data = json.loads((out_dir / "phase-input.json").read_text(encoding="utf-8"))
    data["phases"][0]["allowedFiles"] = []
    mutated = tmp_path / "mutated.json"
    mutated.write_text(json.dumps(data), encoding="utf-8")

    with pytest.raises(HandoffPhaseError, match="missing allowedFiles"):
        render_handoff_phases(mutated, tmp_path / "rendered")


def test_rejects_implementation_phase_without_contract_lock(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    data = json.loads((out_dir / "phase-input.json").read_text(encoding="utf-8"))
    data["phases"] = data["phases"][1:]
    data["phases"].append(
        {
            "id": "phase-001-contract-lock",
            "goal": "Late lock",
            "allowedFiles": ["docs/ui-contract.md"],
            "forbiddenFiles": [],
            "contractExcerpts": ["WorkoutPlan"],
            "testsToWriteFirst": ["add test"],
            "implementationChecklist": ["check"],
            "passCondition": "pass",
            "failCondition": "fail",
            "proofReportTemplate": "proof",
            "maxContextTokens": 8000,
        }
    )
    mutated = tmp_path / "mutated.json"
    mutated.write_text(json.dumps(data), encoding="utf-8")

    with pytest.raises(HandoffPhaseError, match="must be the first phase"):
        render_handoff_phases(mutated, tmp_path / "rendered")


def test_rejects_over_budget_context_packet(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    data = json.loads((out_dir / "phase-input.json").read_text(encoding="utf-8"))
    data["phases"][1]["maxContextTokens"] = 12000
    mutated = tmp_path / "mutated.json"
    mutated.write_text(json.dumps(data), encoding="utf-8")

    with pytest.raises(HandoffPhaseError, match="exceeds maxContextTokens"):
        render_handoff_phases(mutated, tmp_path / "rendered")


def test_rejects_over_budget_agent_packet(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    data = json.loads((out_dir / "phase-input.json").read_text(encoding="utf-8"))
    data["phases"][1]["contractExcerpts"] = ["word " * (MAX_AGENT_PACKET_TOKENS + 100)]
    mutated = tmp_path / "mutated.json"
    mutated.write_text(json.dumps(data), encoding="utf-8")

    with pytest.raises(HandoffPhaseError, match="exceeds agent packet budget"):
        render_handoff_phases(mutated, tmp_path / "rendered")


def test_renders_browser_visible_proof_template(tmp_path: Path):
    out_dir = run_addon(tmp_path)
    render_handoff_phases(out_dir / "phase-input.json", tmp_path / "rendered")
    phase_md = (tmp_path / "rendered" / "phases" / "phase-007-browser-contract-smoke.md").read_text(encoding="utf-8")
    assert "Proof Report Template" in phase_md
    assert "browser-visible proof" in phase_md.lower() or "browser-visible" in phase_md.lower()

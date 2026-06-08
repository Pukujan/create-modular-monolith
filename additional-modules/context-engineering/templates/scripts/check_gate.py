#!/usr/bin/env python3
"""check_gate.py — records phase transitions; optional lint when host project supports it.

Usage:
    python scripts/check_gate.py --module <slug>
    python scripts/check_gate.py --module billing --update-state

Rules:
    - If package.json defines `lint:architecture`, runs it before allowing transition.
    - Otherwise records the transition without lint (standalone context-engineering projects).
    - Optionally updates buildplan/agent_state.json with gate result.
    - Exit 0 = gate passed, Exit 1 = gate blocked.

Paths resolve relative to the current working directory (project root).
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

_REPO_ROOT = os.getcwd()


def _resolve(path: str) -> str:
    if os.path.isabs(path):
        return path
    return os.path.join(_REPO_ROOT, path)


def load_state(path: str) -> dict:
    with open(_resolve(path), "r", encoding="utf-8") as f:
        return json.load(f)


def save_state(path: str, state: dict) -> None:
    resolved = _resolve(path)
    tmp = resolved + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, resolved)


def has_architecture_lint(repo_root: str) -> bool:
    pkg_path = os.path.join(repo_root, "package.json")
    if not os.path.isfile(pkg_path):
        return False
    try:
        with open(pkg_path, "r", encoding="utf-8") as f:
            pkg = json.load(f)
    except json.JSONDecodeError:
        return False
    return "lint:architecture" in (pkg.get("scripts") or {})


def run_lint(repo_root: str) -> tuple[int, str]:
    result = subprocess.run(
        ["npm", "run", "lint:architecture"],
        cwd=repo_root,
        capture_output=True,
        text=True,
    )
    return result.returncode, (result.stdout + result.stderr).strip()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Gate check — optional lint + module transition"
    )
    parser.add_argument(
        "--module",
        required=True,
        help="Module or phase slug to transition to",
    )
    parser.add_argument(
        "--state",
        default="buildplan/agent_state.json",
        help="Path to agent_state.json (default: buildplan/agent_state.json)",
    )
    parser.add_argument(
        "--update-state",
        action="store_true",
        help="Update agent_state.json with gate result",
    )
    args = parser.parse_args()

    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
    lint_enabled = has_architecture_lint(_REPO_ROOT)

    print(f"Gate check for module: {args.module}")

    if lint_enabled:
        print("Running lint:architecture ...")
        exit_code, output = run_lint(_REPO_ROOT)
        if exit_code != 0:
            print(f"\n❌ GATE BLOCKED — lint:architecture failed", file=sys.stderr)
            print(f"Output:\n{output}", file=sys.stderr)
            if args.update_state:
                try:
                    state = load_state(args.state)
                    state.setdefault("lint", {})
                    state["lint"]["lastRun"] = now
                    state["lint"]["lastResult"] = output[:500]
                    state["lint"]["lastPass"] = False
                    save_state(args.state, state)
                except FileNotFoundError:
                    print(f"State file not found: {args.state}", file=sys.stderr)
            return 1
        print("✅ lint:architecture clean")
    else:
        print("ℹ️  No lint:architecture in host project — gate records transition only")

    print(f"✅ GATE PASSED — transition to `{args.module}` is allowed.")

    if args.update_state:
        try:
            state = load_state(args.state)
            state.setdefault("lint", {})
            state["lint"]["lastRun"] = now
            state["lint"]["lastResult"] = "passed" if lint_enabled else "skipped_no_lint_script"
            state["lint"]["lastPass"] = True
            state["activeModule"]["slug"] = args.module
            state["activeModule"]["startedAt"] = now
            save_state(args.state, state)
            print(f"Updated: {args.state}")
        except FileNotFoundError:
            print(f"State file not found: {args.state}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

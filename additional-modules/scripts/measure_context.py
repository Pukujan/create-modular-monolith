#!/usr/bin/env python3
"""measure_context.py — hard stop at 30k token budget.

Usage:
    python scripts/measure_context.py --tokens <current_count>
    python scripts/measure_context.py --tokens 18500 --budget buildplan/context_budget.json

Rules:
    - Hard limit: 30000 tokens.
    - Aborts session (exit 1) if budget exceeded.
    - Updates context_budget.json with current usage.

Paths resolve relative to repo root (parent of scripts/).
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _resolve(path: str) -> str:
    if os.path.isabs(path):
        return path
    return os.path.join(_REPO_ROOT, path)


HARD_LIMIT = 30000
WARN_THRESHOLD = 20000


def load_budget(path: str) -> dict:
    with open(_resolve(path), "r", encoding="utf-8") as f:
        return json.load(f)


def save_budget(path: str, budget: dict) -> None:
    resolved = _resolve(path)
    tmp = resolved + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(budget, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, resolved)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Measure context budget — hard stop at 30k tokens"
    )
    parser.add_argument(
        "--tokens",
        type=int,
        required=True,
        help="Current token usage count",
    )
    parser.add_argument(
        "--budget",
        default="buildplan/context_budget.json",
        help="Path to context_budget.json (default: buildplan/context_budget.json)",
    )
    parser.add_argument(
        "--start-session",
        action="store_true",
        help="Record session start timestamp",
    )
    parser.add_argument(
        "--end-session",
        action="store_true",
        help="Record session end and archive to history",
    )
    args = parser.parse_args()

    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")

    try:
        budget = load_budget(args.budget)
    except FileNotFoundError:
        budget = {
            "hardLimit": HARD_LIMIT,
            "currentUsage": 0,
            "remaining": HARD_LIMIT,
            "sessionStart": None,
            "sessionEnd": None,
            "history": [],
        }

    usage = args.tokens
    remaining = budget["hardLimit"] - usage

    if args.start_session:
        budget["sessionStart"] = now
        print(f"Session started: {now}")

    budget["currentUsage"] = usage
    budget["remaining"] = remaining

    if usage >= HARD_LIMIT:
        budget["sessionEnd"] = now
        entry = {
            "endedAt": now,
            "peakUsage": usage,
            "reason": "hard_limit_exceeded",
        }
        budget.setdefault("history", []).append(entry)
        save_budget(args.budget, budget)

        print(f"\n🛑 CONTEXT BUDGET EXCEEDED", file=sys.stderr)
        print(f"Usage:    {usage:,} / {budget['hardLimit']:,} tokens", file=sys.stderr)
        print(f"Exceeded: {usage - budget['hardLimit']:,} tokens", file=sys.stderr)
        print(f"\nACTION REQUIRED:", file=sys.stderr)
        print(f"  1. Archive session to work-log/sessions/", file=sys.stderr)
        print(f"  2. Update agent_state.json with completed tasks", file=sys.stderr)
        print(f"  3. Run: python scripts/render_memory.py", file=sys.stderr)
        print(f"  4. Reset budget: python scripts/measure_context.py --tokens 0 --start-session", file=sys.stderr)
        print(f"  5. Ask user to start a new session", file=sys.stderr)

        return 1

    if args.end_session:
        budget["sessionEnd"] = now
        entry = {
            "endedAt": now,
            "peakUsage": usage,
            "reason": "manual_end",
        }
        budget.setdefault("history", []).append(entry)
        save_budget(args.budget, budget)
        print(f"Session ended: {now}")
        print(f"Peak usage: {usage:,} / {budget['hardLimit']:,} tokens")

    save_budget(args.budget, budget)

    if usage >= WARN_THRESHOLD:
        pct = (usage / budget["hardLimit"]) * 100
        print(f"⚠️  WARNING: {usage:,} / {budget['hardLimit']:,} tokens ({pct:.0f}%)")
        print(f"   Remaining: {remaining:,} tokens")
        print(f"   Consider compacting context soon.")
    else:
        pct = (usage / budget["hardLimit"]) * 100
        print(f"✅ Budget OK: {usage:,} / {budget['hardLimit']:,} tokens ({pct:.0f}%)")
        print(f"   Remaining: {remaining:,} tokens")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

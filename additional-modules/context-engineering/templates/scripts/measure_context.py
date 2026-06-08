#!/usr/bin/env python3
"""measure_context.py — report context budget status, no abort.

Usage:
    python scripts/measure_context.py --tokens <current_count>
    python scripts/measure_context.py --tokens 18500 --budget buildplan/context_budget.json

Rules:
    - Ceiling: 35000 tokens (never aborts, just reports).
    - Warning at 27k: consider compacting.
    - Critical at 31.5k+ (90% of ceiling): compact now.
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


CEILING = 35000
WARN_THRESHOLD = 27000
CRITICAL_THRESHOLD = 31500  # 90% of ceiling


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
        description="Measure context budget — reports status, never aborts"
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
            "hardLimit": CEILING,
            "currentUsage": 0,
            "remaining": CEILING,
            "sessionStart": None,
            "sessionEnd": None,
            "history": [],
        }

    usage = args.tokens
    remaining = max(0, budget["hardLimit"] - usage)

    if args.start_session:
        budget["sessionStart"] = now
        budget["sessionEnd"] = None
        budget["currentUsage"] = 0
        print(f"Session started: {now}")

    budget["currentUsage"] = usage
    budget["remaining"] = remaining

    if args.end_session:
        budget["sessionEnd"] = now
        entry = {
            "endedAt": now,
            "peakUsage": usage,
            "reason": "manual_end",
        }
        budget.setdefault("history", []).append(entry)
        print(f"Session ended: {now}")
        print(f"Peak usage: {usage:,} / {budget['hardLimit']:,} tokens")

    save_budget(args.budget, budget)

    pct = (usage / budget["hardLimit"]) * 100

    if usage >= CRITICAL_THRESHOLD:
        print(f"🔴 CRITICAL: {usage:,} / {budget['hardLimit']:,} tokens ({pct:.0f}%)")
        print(f"   Remaining: {remaining:,} tokens")
        print(f"   Compact context now.")
    elif usage >= WARN_THRESHOLD:
        print(f"🟡 WARNING: {usage:,} / {budget['hardLimit']:,} tokens ({pct:.0f}%)")
        print(f"   Remaining: {remaining:,} tokens")
        print(f"   Consider compacting context soon.")
    else:
        print(f"🟢 OK: {usage:,} / {budget['hardLimit']:,} tokens ({pct:.0f}%)")
        print(f"   Remaining: {remaining:,} tokens")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

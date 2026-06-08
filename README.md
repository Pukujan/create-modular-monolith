# @pukujan/create-modular-monolith

**You hired an AI teammate that types 100x faster than you. Now you need a repo that can keep up.**

You know the feeling. You come back to a project after the weekend, and Cursor has touched forty files. Some of the changes are brilliant. Some of them quietly broke your API conventions. And the "why" for all of it is buried in a chat history you can't find.

This is a scaffolding tool for teams who code with agents daily and are tired of pretending that a vanilla Express + React starter is enough.

## What's new in 2.6.2: 28k budget, OpenCode compaction, phase-builder alignment

Version 2.6.2 aligns the **28k token ceiling** across context-engineering, phase-builder, and OpenCode config — warn-only budgeting (never aborts agents), optional `init --opencode`, and phase-builder defaults/tests updated to match.

**[Read the full mini-modules and context engineering guide →](#mini-modules-and-context-engineering)**

Also in 2.6.x: init re-run on existing scaffolds, `--archive-session` / `--status` flags, and phase-builder copied via `init --phase-builder`.

## What's new in 2.5.0: mini-modules and context engineering

Version 2.5.0 introduces a **parent module / mini-module** architecture with a registry-driven pipeline system, strict boundary enforcement, and a cross-session memory protocol. These are now the default scaffold.

**[Read the full mini-modules and context engineering guide →](#mini-modules-and-context-engineering)**

In short: the scaffold now includes a mini-modules architecture with enforced boundaries (barrel-only sibling imports, lint gates), a JSON registry, and a cross-session memory system so agents survive context window limits.

## The problem nobody warned you about

AI agents are amazing at velocity and terrible at memory.

- **Context dies between sessions.** Yesterday's agent knew why you refactored the auth layer. Today's agent doesn't. It will happily undo that work if you aren't watching.
- **You can't review everything.** A human writes a few files a day. An agent writes dozens. You cannot read every diff deeply. Something *will* slip through.
- **Architecture drifts in silence.** Without guardrails, every agent session invents its own folder structure, error-handling pattern, and testing style. In two weeks your codebase looks like it was designed by twelve different people. Because it was.
- **Handoff is a mess.** You exported a JSON fixture for the agent. It generated three new files. Where are they? Which version of the prompt produced them? Did anyone write down what failed?

You didn't switch to agent-first coding to spend your afternoons playing detective.

## What this actually does

`create-modular-monolith` scaffolds a repo that **remembers the work so you don't have to**.

It is not a framework. It is a set of conventions, scripts, and boundaries that turn your repository into the team's shared memory — for both humans and agents.

- **Modules keep agents bounded.** Each feature lives in its own backend + frontend pair. The agent knows where it is allowed to work.
- **Contracts prevent drift.** Your folder structure, API patterns, and file-exchange rules are written down where agents can read them. Not in a Notion doc. In the repo.
- **Dev logs capture intent.** Before you push, one command generates a human-readable summary (what changed, what failed, what to watch) and a machine-readable audit trail (files touched, test results, API inventory). The next agent starts with context instead of guessing.
- **File exchange makes handoffs traceable.** Every input bundle and every generated output gets a timestamp and a folder. No more "where did I put that fixture?"
- **CI gates catch structural rot.** Linting for architecture, not just syntax. Did someone move a file outside the module boundary? The gate fails before the PR is opened.

The goal is simple: **build fast with AI agents, but make the repo remember the work.**

## Who this is for

- Teams where Cursor, Claude Code, or custom agents commit code daily.
- Solo developers who switch between projects and need their past self (or their past agent) to leave good notes.
- Anyone who has looked at a diff and thought, *"I have no idea if this is correct or if the agent just made it up."*

If you are still writing every line by hand, this is probably overkill.

## Get started

```bash
# Scaffold the project
npm create @pukujan/modular-monolith@latest my-platform

cd my-platform

# Finish context engineering (resolves placeholders, syncs scripts, renders MEMORY.md)
node additional-modules/context-engineering/bin/context-eng.js init --phase-builder --opencode
python3 additional-modules/scripts/measure_context.py --tokens 0 --start-session
python3 additional-modules/scripts/render_memory.py

# Install dependencies
npm install --prefix backend && npm install --prefix frontend

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run the quality gate
npm run test:ci
```

Start developing:

```bash
cd backend && npm run dev
# new terminal
cd frontend && npm run dev
```

Backend runs on `3001`. Frontend runs on `5173`.

## What you get

A working Express + React/Vite starter, plus the infrastructure to survive agent-driven development:

| What | Why it matters |
|---|---|
| **Backend + frontend modules** | Each feature is self-contained. Agents can't accidentally refactor your billing layer while working on search. |
| **Architecture contracts** | Written rules in `docs/architecture/` that agents read. Prevents "I didn't know we did it that way." |
| **File exchange** | `file-exchange/imports/` and `exports/` with timestamps. Know exactly what went in and what came out. |
| **Dev logs + audit trail** | One command before push: `npm run dev-log:pre-push -- --slug my-feature`. Humans get a story. Agents get structured JSON. |
| **Planning gates** | `npm run plan:gate` forces a planning audit log before big refactors. Prevents "I asked the agent to just clean up a little and it rewrote half the app." |
| **Condensed handoffs** | `npm run condense:all` exports a snapshot of your contracts, file tree, and current state. Drop it into the next agent session. |
| **Agent-native setup** | `AGENTS.md`, `.agents/rules`, and `.agents/commands` give your coding agent project-specific instructions from day one. |

Domain logic is yours. The scaffolding just makes sure your agents don't burn your house down while building it.

## Daily workflow

**Starting work:**
```bash
npm run condense:all
# Paste file-exchange/exports/consolidated-contracts.json into your agent context
```

**Adding a feature:**
```bash
npm run new:module -- billing --label "Billing"
# Agent works inside backend/src/modules/billing/ and frontend/src/modules/billing/
```

**Before you push:**
```bash
npm run dev-log:pre-push -- --slug billing-api
# Creates human markdown + agent JSON audit log
npm run test:ci
```

**Planning something big:**
```bash
npm run plan:gate -- --slug auth-refactor
# Forces you to write a plan before the agent starts rewriting core code
```

## The stack

- **Node 20+**
- **Backend:** Express
- **Frontend:** React + Vite
- **Default ports:** 3001 (API), 5173 (UI)
- **License:** MIT

## What's in the box

```
my-platform/
├── AGENTS.md                 ← Required reading for Cursor / agents
├── MEMORY.md                 ← Working memory (regenerated each session)
├── backend/src/
│   ├── core/                 ← Module loader, server
│   ├── modules/_reference/   ← Example health-check module (only domain module)
│   ├── modules/model-condenser/ ← Schema inventory tooling
│   └── shared/               ← Contracts, agent-runtime, artifact paths
├── frontend/src/core/ + modules/_reference/  ← No pre-built product UI
├── additional-modules/
│   ├── docs/architecture/    ← Contracts, guardrails, templates
│   ├── file-exchange/        ← imports/ + exports/ (human ↔ agent handoff)
│   ├── work-log/             ← dev-logs, planning/{folder}/, study-logs/
│   ├── buildplan/            ← Agent state, context budget
│   ├── scripts/              ← render_memory, measure_context, check_gate
│   └── context-engineering/  ← CLI tool and templates
├── local-artifacts.example.json
└── package.json              ← Root scripts (test:ci, condense:all, new:module, …)
```

Read `additional-modules/docs/architecture/CONTRACTS_OVERVIEW.md` and `AGENTS.md` before adding your own domain modules.

## Architecture contracts (the boring-but-important part)

The template ships with 9 starter contracts registered in `docs/architecture/contracts/manifest.json`. These are specs and templates, not running infrastructure:

| Contract | What it covers |
|---|---|
| `repoArtifactLayout` | Canonical roots + optional `local-artifacts.json` |
| `fileExchange` | Dated imports and exports |
| `consolidatedExports` | Output paths for `condense:all` |
| `planningPhase` | Dated planning folders, `plan:gate`, `plan:finalize` |
| `prePushDevLog` | Paired human markdown + agent JSON |
| `apiDocumentationRegistry` | `docs/API.md` registry |
| `documentPersistence` | Uploads + DB pattern (you wire runtime) |
| `moduleAgentStateMachine` | Per-module agent FSM + shared runtime |
| `asyncJobQueue` | BullMQ + Redis pattern (you wire runtime) |

You add domain-specific contracts inside your modules as your project grows.

## Key commands

| Command | Purpose |
|---|---|
| `npm run test:ci` | Run all local CI gates |
| `npm run new:module -- &lt;name&gt;` | Scaffold backend + frontend module |
| `npm run import:file-exchange -- &lt;path&gt;` | Import inbound files into stamped folder |
| `npm run condense:all` | Generate consolidated snapshot for agent handoff |
| `npm run condense-contracts` | Export architecture contract bundle only |
| `npm run dev-log:pre-push -- --slug &lt;topic&gt;` | Create human + agent dev log pair |
| `npm run lint:architecture` | Check architecture boundaries and layers |
| `npm run lint:contracts` | Check registered contract paths |
| `npm run plan:gate` | Planning phase gate (audit log required) |
| `npm run plan:finalize` | Finalize planning artifacts |
| `npm run agent:push` | Create dev logs, commit pair, push (Cursor workflows) |
| `npm run smoke:gates` | Verify planning + push gates |

## Environment variables

| Variable | File | Purpose |
|---|---|---|
| `PORT` | `backend/.env` | API port (default 3001) |
| `DATABASE_URL` | `backend/.env` | Postgres/SQLite when you add persistence |
| `REDIS_URL` | `backend/.env` | BullMQ backend when you implement async jobs |
| `UPLOADS_ROOT` | `backend/.env` | Override upload path |
| `VITE_API_BASE_URL` | `frontend/.env` | Frontend → backend URL |

See `backend/.env.example` and `docs/architecture/REPO_ARTIFACT_LAYOUT.md` after scaffold.

## Mini-modules and context engineering

### Why mini-modules

A single module can quickly grow to hundreds of files. When an AI agent loads a module into context, it exceeds the working token budget — then starts guessing.

Mini-modules split a parent module into small, single-responsibility units. Each mini-module has its own barrel (`index.js`), services, routes, and schema. Agents load only the one they need.

```
backend/src/modules/my-parent-module/          ← parent module
├── agent-alpha/                               ← mini-module
├── agent-beta/                                ← mini-module
├── shared/                                    ← mini-module (infrastructure)
├── middleware/                                ← mini-module (infrastructure)
└── index.js                                   ← parent barrel, registers all
```

### Registry-driven structure

Every mini-module must be declared in `pipeline-agent-mini-modules.registry.json`. The registry is the source of truth. Scripts enforce alignment:

| Script | Enforces |
|---|---|
| `npm run lint:mini-modules` | Barrel-only imports, no deep sibling access |
| `npm run lint:architecture` | Registry ↔ folder ↔ manifest alignment |
| `npm run lint:boundaries` | Module boundary rules, no cross-module imports |

### Context engineering

This scaffold includes a 3-layer memory system for AI agents:

| Layer | File | Purpose |
|---|---|---|
| L1 — Working memory | `MEMORY.md` | Current state, <100 lines, updated every session |
| L2 — Rules | `AGENTS.md` | Architecture rules, boundaries, lint commands |
| L3 — Archive | `additional-modules/work-log/sessions/` | Completed session notes, study logs |

The `work-log/` folder also holds study documents with mermaid diagrams, token budgets, and migration notes.

### OpenCode users (live compaction)

Context-engineering and OpenCode solve different problems:

| System | Scope | Role |
|---|---|---|
| **OpenCode** (`additional-modules/context-engineering/opencode.json`) | Current chat session | Auto-compact before overflow; prune old tool outputs |
| **Context-engineering** (`measure_context.py`, `MEMORY.md`) | Across sessions | Track budget, archive work, restore project state |

They share the same **28k ceiling** (compact around 25.2k at 90%) but use different enforcers. OpenCode never calls `measure_context.py` unless you run it.

```bash
# Writes additional-modules/context-engineering/opencode.json with compaction defaults
node additional-modules/context-engineering/bin/context-eng.js init --opencode
```

Shipped defaults: `compaction.auto`, `prune`, and `reserved: 3472` (compact at ~25.2k before the 28k cap). Set your provider model limit to **28672** context tokens:

```json
{
  "provider": {
    "local-qwen": {
      "models": {
        "qwen": {
          "limit": { "context": 28672, "output": 4096 }
        }
      }
    }
  }
}
```

OpenCode looks for `opencode.json` in the project root by default. Point it at the module config:

```bash
export OPENCODE_CONFIG="$PWD/additional-modules/context-engineering/opencode.json"
# or: ln -sf additional-modules/context-engineering/opencode.json opencode.json
```

Global defaults live in `~/.config/opencode/opencode.jsonc` and apply to all projects; project config overrides them when OpenCode runs in that directory.

**Tip:** Sending a new message while the agent is running shows "interrupted" — that is a manual cancel, not failed compaction. Wait for the turn to finish.

### Installation

This is released directly into `main`. To get the mini-modules version:

```bash
# Latest main (includes mini-modules)
npx @pukujan/modular-monolith@latest my-project

# Or pin the commit
npx @pukujan/modular-monolith@c7ac6fb my-project
```

Scaffolded projects include the full 3-layer memory system, registry scripts, and a clean `_reference` module — add your own domain modules with `npm run new:module`.

**Post-scaffold init (required):**
```bash
cd my-project
node additional-modules/context-engineering/bin/context-eng.js init --phase-builder --opencode
python3 additional-modules/scripts/measure_context.py --tokens 0 --start-session
python3 additional-modules/scripts/render_memory.py
```

## Package vs. product

This npm package is the reusable platform layer. It ships architecture, contracts, and conventions.

For a reference product that stress-tests this architecture with real domain modules, prompts, evals, and case workflows, see the separate product repo.

## Changelog

See [CHANGELOG.md](./additional-modules/docs/CHANGELOG.md) for version history, migration notes, and bug fixes.

## License

MIT — Copyright (c) 2026 Pukujan.

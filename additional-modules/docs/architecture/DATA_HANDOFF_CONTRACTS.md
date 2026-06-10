# Data Handoff Contracts

This document explains where handoff-shaped data lives today, where it should move later, and how agents should treat the boundary between repo files and database-backed state.

## Why this exists

Some repo artifacts are not product source code. They are operational handoff data:

- file-exchange imports and exports
- work-log planning folders
- dev logs
- study docs
- archive / checkpoint evidence

These artifacts help humans and agents coordinate, but they should not become a dumping ground for long-lived business state.

## Current rule

Today, these artifacts live in the repo because the database wiring is not always present yet.

The repo keeps:

- the handoff record
- the timestamps
- the audit trail
- the compact summary

The database, when connected, should keep:

- durable runtime records
- queryable business state
- upload metadata
- parsed or normalized rows

## Existing contracts

- [fileExchange.contract.md](./contracts/fileExchange.contract.md)
- [planningPhase.contract.md](./contracts/planningPhase.contract.md)
- [prePushDevLog.contract.md](./contracts/prePushDevLog.contract.md)
- [documentPersistence.contract.md](./contracts/documentPersistence.contract.md)

## Simple model

```txt
repo handoff artifact
→ extract summary / manifest
→ write durable business state to DB when available
→ keep only the handoff pointer in git
```

## What stays in git

Keep in the repo:

- file-exchange session folders
- planning phase logs and manifests
- dev log summaries
- architecture notes
- agent instructions
- exported handoff manifests and snapshots

## What should move to the database later

Move to DB-backed storage when the app is wired for it:

- runtime uploads
- parsed documents
- module operational state
- structured history that must be queried often

## Handoff shape

Every handoff should have two layers:

1. Human-readable summary
2. Machine-readable manifest

The manifest should identify:

- source files
- destination files
- contract version
- owning module
- whether the payload is repo-only or DB-backed

## Agent rule

Agents should not invent new storage locations for handoff data.

If the artifact is an operational handoff, use the existing repo contract first. If the domain later needs durable state, write a DB contract and keep the repo artifact as the traceable pointer.


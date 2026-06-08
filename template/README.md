# Litigation Prompt Engineering v2

Product monolith for case filing, document ingest, prompts, and agent workflows.

Express + React with architecture contracts, file-exchange, paired dev logs, and CI gates — developed in this repo only ([litigation-prompt-engineering-v2](https://github.com/Pukujan/litigation-prompt-engineering-v2)).

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Express, SQLite (`DATABASE_URL`), modular loaders |
| Frontend | React + Vite |
| Documents | `POST /api/documents/upload` — disk + SQL ([contract](docs/architecture/contracts/documentPersistence.contract.md)) |
| Contracts | 9 registered IDs — [CONTRACTS_OVERVIEW](docs/architecture/CONTRACTS_OVERVIEW.md) |

## Quick start

```bash
npm install --prefix backend && npm install --prefix frontend

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

npm run test:ci
```

Run API + UI:

```bash
cd backend && npm run dev    # http://localhost:3001
cd frontend && npm run dev   # http://localhost:5173
```

Upload a document:

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@./path/to/note.txt"
```

## Docs

| Doc | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Required for Cursor / automation |
| [docs/architecture/CONTRACTS_OVERVIEW.md](docs/architecture/CONTRACTS_OVERVIEW.md) | Contract manifest |
| [docs/documents/API.md](docs/documents/API.md) | Upload + read APIs |
| [docs/API.md](docs/API.md) | Full HTTP registry |

## License

MIT — Copyright (c) 2026 Pukujan. See [LICENSE](LICENSE).

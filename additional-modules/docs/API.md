# API registry (starter)

## Endpoint registry

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| GET | `/api/ai-ops/health` | ai-ops | Module health and config summary |
| GET | `/api/app-shell/health` | app-shell | Module health and config summary |
| GET | `/api/case-management/health` | case-management | Module health and config summary |
| GET | `/api/documents/health` | documents | Module health and config summary |
| GET | `/api/model-condenser/health` | model-condenser | Module health and config summary |
| POST | `/api/model-condenser/condense` | model-condenser | Regenerate consolidated-models.json |
| GET | `/api/model-condenser/consolidated` | model-condenser | Read consolidated schema inventory |

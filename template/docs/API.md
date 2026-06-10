# API registry (starter)

## Endpoint registry

| Method | Path | Module | Description |
|--------|------|--------|-------------|
| GET | `/api/_reference/health` | _reference | Example module health check |
| GET | `/api/model-condenser/health` | model-condenser | Module health and config summary |
| POST | `/api/model-condenser/condense` | model-condenser | Regenerate consolidated-models.json |
| GET | `/api/model-condenser/consolidated` | model-condenser | Read consolidated schema inventory |
| GET | `/api/workout/dashboard-stats` | workout | Read dashboard workout summary |
| GET | `/api/workout/workout-logs` | workout | Read workout logs |
| GET | `/api/workout/workout-plans` | workout | Read workout plans |
| POST | `/api/workout/workout-logs` | workout | Create a workout log |
| POST | `/api/workout/workout-plans` | workout | Create a workout plan |
| POST | `/api/workout/workout-plans/:planId/exercises` | workout | Add an exercise to a workout plan |
| PATCH | `/api/workout/workout-plans/:planId` | workout | Update a workout plan |
| DELETE | `/api/workout/workout-plans/:planId` | workout | Delete a workout plan |
| GET | `/api/workout/workout-plans/:planId/exercises` | workout | Read exercises for a workout plan |

# VibeShield

Hackathon project skeleton with three packages:

- `demo-app/` — restaurant reservation demo (vulnerable vs fixed)
- `extension/` — browser extension (placeholder)
- `ai-service/` — AI analysis service (placeholder)

## demo-app

Minimal Node/Express app that lists tables 1–5 and accepts reservations via `POST /api/reservation` with body `{ "tableId": N }`.

Controlled by `MODE`:

| Mode | Behavior |
|------|----------|
| `vulnerable` (default) | Accepts any `tableId` with no validation |
| `fixed` | Only allows a `tableId` from the server-tracked list shown to the current session; mismatches return **403** |

Reservations are kept in an in-memory array (no database). The frontend records each reservation request on `window.__vibeshield_requests`.

### Run

```bash
cd demo-app
npm install
```

**Vulnerable mode:**

```bash
MODE=vulnerable npm start
# Windows PowerShell: $env:MODE="vulnerable"; npm start
```

**Fixed mode:**

```bash
MODE=fixed npm start
# Windows PowerShell: $env:MODE="fixed"; npm start
```

Then open http://localhost:3000.

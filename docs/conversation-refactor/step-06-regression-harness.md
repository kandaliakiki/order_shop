# Step 6 — Regression harness (repeatable)

## Goal

Make Step 4’s scenarios **one command away** so neither you nor I rely on memory.

Choose **one** approach (A recommended):

- **A.** Shell script: `server/scripts/conversation-regression.ps1` or `.sh` that runs `curl` / `Invoke-WebRequest` in sequence for a fixed `PHONE`.
- **B.** Node script: `server/scripts/conversation-regression.mjs` using `fetch`.
- **C.** `npm run test` with Jest/Vitest calling `ConversationManager.processMessage` with a mocked DB (heavier).

## Deliverable

- Script lives under `order_shop/server/scripts/` (or `order_shop/scripts/` if shared).
- Document in this file: **prerequisites**, **how to run**, **expected output** (last line `OK` or exit 0).
- List of scenarios covered (checkboxes).

### Implementation notes

- Script path: `server/scripts/conversation-regression.ps1`
- Optional npm alias: `cd server && npm run conversation:regression`
- The script is idempotent: it starts with `DELETE /conversation/{phone}` so re-running does not require manual DB cleanup.

### Prerequisites

- API server running with testing routes enabled (`ENABLE_TESTING_INTERFACE=true`)
- MongoDB available for the same `MONGODB_URL`
- Base URL reachable (default `http://127.0.0.1:8080/api/testing`)

### How to run

PowerShell:

```powershell
cd server
powershell -ExecutionPolicy Bypass -File ./scripts/conversation-regression.ps1
```

With existing-orders checks (optional):

```powershell
cd server
powershell -ExecutionPolicy Bypass -File ./scripts/conversation-regression.ps1 `
  -ExistingOrdersPhone "+6287770000099" `
  -StrictExistingOrders
```

Expected output ends with `OK` and exit code `0`.

## Tests (must all pass before Step 7)

| # | Test | How to verify |
|---|------|----------------|
| 6.1 | Fresh run | From repo root or `server`, run the documented command on a machine with Mongo + API up → **exit 0**. |
| 6.2 | Intentional break | Temporarily break a return string in one handler, re-run → harness **fails** (proves it catches regressions). Revert break. |
| 6.3 | Idempotent | Run harness **twice** in a row without manual DB cleanup, or document required `DELETE` step at start of script so second run is still green. |

## Minimum scenario list (check when implemented)

- [x] Health check
- [x] Delete conversation
- [x] `/reset`
- [x] New order minimal path (at least 3 turns)
- [x] New-vs-edit gate when orders exist (if test data available)
- [x] Edit selection + one edit confirm branch

## Rollback

Remove script + package.json script entry if any; core refactor from Steps 1–5 stays.

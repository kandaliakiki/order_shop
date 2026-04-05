# Step 2 — Router shell in `processMessage`

## Goal

Turn `processMessage` into a **short spine**: shared setup (load state, append user message, `/reset`, persist helpers) then an **explicit dispatch** (switch / ordered `if` chain) that calls **named** `private` methods or `private async` methods—even if some bodies are still temporarily “inline” moved verbatim into those methods.

No behaviour change intended.

## Deliverable

- `processMessage` is **under ~200 lines** of orchestration, OR clearly structured into sections with **one dispatch block** that is easy to grep.
- Each major branch has a **stable comment tag** matching `STATE_MAP.md` (e.g. `// CM:dispatch:new_or_edit`).
- `npm` / TypeScript still compiles.

## Tests (must all pass before Step 3)

| # | Test | How to verify |
|---|------|----------------|
| 2.1 | Typecheck | From `order_shop/server`: `npx tsc --noEmit` → exit code 0. |
| 2.2 | Health | `GET /api/testing/health` → `{ "success": true }`. |
| 2.3 | Fresh session greeting / collect | Use dedicated `PHONE`. `DELETE /api/testing/conversation/{encodeURIComponent(PHONE)}` then `POST /api/testing/chat` body `{"phoneNumber":"PHONE","message":"halo","debug":false}` → HTTP 200, non-empty `response`. |
| 2.4 | Reset | Same `PHONE`, send message `"/reset"` → response indicates reset (same wording family as before refactor). |
| 2.5 | No duplicate side effects | Send the same user message twice in a row in a **fresh** session (after delete) and confirm you do not get **double** assistant rows in DB for a single logical turn (spot-check in debug JSON `conversationHistory` length vs expectations). |

### Example API calls (PowerShell)

```powershell
$base = "http://127.0.0.1:8080/api/testing"
$phone = "+6287770000001"
Invoke-WebRequest -Uri "$base/conversation/$([uri]::EscapeDataString($phone))" -Method DELETE
$body = @{ phoneNumber = $phone; message = "halo"; debug = $true } | ConvertTo-Json
Invoke-WebRequest -Uri "$base/chat" -Method POST -Body $body -ContentType "application/json; charset=utf-8"
```

## Rollback

Revert the single commit that introduced the router shell; keep `STATE_MAP.md` from Step 1.

# Conversation manager refactor — step-by-step

This folder splits the refactor into **ordered steps**. Do **not** skip ahead: each step has **pass/fail tests** you and another developer (or this assistant) can run. When every test for a step is **pass**, move to the next file.

## Global prerequisites

- MongoDB running with the same `MONGODB_URL` as `.env.local`.
- Server: `cd server && npm run start` (port **8080** by default).
- Client (for UI): `cd client && npm run dev`, open `http://localhost:3000/test-chat`.
- Testing API enabled: `ENABLE_TESTING_INTERFACE=true` in `server/.env.local`.

## Base URL for API tests

Use **one** of:

- Direct: `http://127.0.0.1:8080/api/testing`
- Via Next rewrite: `http://localhost:3000/api/testing` (only when client dev server is running)

Replace `PHONE` below with a **dedicated** test number (e.g. `+6287770000001`) so you do not collide with real data.

**Canonical conversation ordering** (new + edit, pickup before address, edit items before fulfillment before `edit_confirm_delivery`): [`STATE_MAP.md`](./STATE_MAP.md) and [`WHATSAPP_FLOW.md`](../../WHATSAPP_FLOW.md) (repo root). `ConversationManager` may not match yet — see “Implementation gap” in `STATE_MAP.md`.

## Step index

| Order | File | One-line goal |
|------:|------|----------------|
| 1 | [step-01-state-map.md](./step-01-state-map.md) | Document every conversation branch (the map). |
| 2 | [step-02-router-shell.md](./step-02-router-shell.md) | Thin `processMessage` spine + explicit dispatch. |
| 3 | [step-03-extract-first-handlers.md](./step-03-extract-first-handlers.md) | Move gate + order selection into named functions. |
| 4 | [step-04-extract-remaining-handlers.md](./step-04-extract-remaining-handlers.md) | Move remaining `pendingQuestion` paths out of the giant method. |
| 5 | [step-05-centralize-state-updates.md](./step-05-centralize-state-updates.md) | One obvious place for state mutations / logging. |
| 6 | [step-06-regression-harness.md](./step-06-regression-harness.md) | Repeatable script or checklist run. |
| 7 | [step-07-cleanup-and-machine-decision.md](./step-07-cleanup-and-machine-decision.md) | Remove dead wrappers; decide fate of `lib/conversation/`. |

## Definition of done (whole refactor)

- `conversationManager.service.ts` is navigable: a reader can jump to **one function per major flow**.
- WhatsApp webhook behaviour unchanged (same entrypoint, same user-visible outcomes for the regression list).
- No misleading duplicate managers unless clearly documented.

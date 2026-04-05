# Step 7 — Cleanup & `lib/conversation/` decision

## Goal

1. **Remove misleading duplicates**: e.g. delete `newConversationManager.service.ts` if still present; ensure `TestingChatService` uses `ConversationManager` directly; grep for dead imports.
2. **Decide** what to do with `server/lib/conversation/` (state machine experiment):
   - **Option A — Remove** if unused and untested (reduces confusion).
   - **Option B — Wire behind flag** for experiments only (document flag + risk).
   - **Option C — Full migration** to machine (only if you have harness green and explicit project approval).

Update `REFACTORING_IMPLEMENTATION.md` or add `docs/conversation-refactor/ADR-machine.md` so docs match reality.

## Deliverable

- No file named `newConversationManager.service.ts` unless it has **real** non-delegate logic (default: removed).
- `TESTING_SETUP_PLAN.md` / `TESTING_INTERFACE_PLAN.md` references updated to say **ConversationManager** where appropriate.
- ADR or short decision paragraph: chosen option A/B/C for `lib/conversation/`.

### Implementation notes

- `server/lib/services/newConversationManager.service.ts` removed.
- `server/lib/services/testingChat.service.ts` now uses `ConversationManager` directly.
- Planning docs updated to remove `NewConversationManagerService` references in test-interface setup.

### `lib/conversation/` decision

Chosen: **Option B (keep behind experiment boundary)**.

- `server/lib/conversation/` stays in-repo as an experiment/reference implementation.
- Production and testing entrypoints now use a single live path via `ConversationManager`.
- No runtime wiring to `lib/conversation/` is used by default; future migration must pass the regression harness first.

## Tests (must all pass to close the refactor track)

| # | Test | How to verify |
|---|------|----------------|
| 7.1 | `tsc` | `npx tsc --noEmit` in `server` → 0. |
| 7.2 | Grep | From `order_shop/server`: `rg "newConversationManager|NewConversationManagerService"` → **no matches** (or only in changelog/docs if you keep history). |
| 7.3 | Testing API | Step 6 regression harness → exit 0. |
| 7.4 | WhatsApp path unchanged | `whatsappWebhook.action.ts` still imports **`ConversationManager`** (or the agreed single facade); smoke one real webhook or simulator if you have it. |
| 7.5 | Test chat UI | `http://localhost:3000/test-chat` connect + send + receive + scroll still OK. |

## Rollback

Restore deleted wrapper file from git only if you must hotfix; prefer fixing imports instead.

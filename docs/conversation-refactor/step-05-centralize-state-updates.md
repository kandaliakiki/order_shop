# Step 5 — Centralize state updates (observability)

## Goal

Reduce “mystery mutations” on `state`: introduce a **small, explicit API** used by handlers, e.g.:

- `applyConversationPatch(state, patch)` logging **before/after** in dev, or
- immutable-style “return patch object” merged in one place,

so debugging a bad transition does not require searching the whole file.

This step may be **incremental**: start with the noisiest branches (edit flow, completeness).

## Deliverable

- One documented entry point (name in `STATE_MAP.md` “State updates” section).
- Dev-only logging flag optional (e.g. `DEBUG_CONVERSATION_PATCHES=1`)—do not spam production logs.

## Tests (must all pass before Step 6)

| # | Test | How to verify |
|---|------|----------------|
| 5.1 | `tsc` | `npx tsc --noEmit` → 0. |
| 5.2 | Smoke | Repeat Step 4 tests **4.2** and **4.4** (minimal new order + edit confirm). |
| 5.3 | Patch visibility | With debug flag on (if implemented): one user turn produces **at most one** consolidated log line or structured log object for state transition (document example in this file when done). |
| 5.4 | No double-save regression | Same action does not call `save()` twice in a row with identical state (optional: add temporary counter in dev—remove before merge or guard with flag). |

## Rollback

Revert centralization commit; handlers from Step 4 remain.

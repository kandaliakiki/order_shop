# Step 1 — State & branch map (documentation only)

## Goal

Produce a **single source of truth** that lists how the conversational order flow branches: `pendingQuestion.type`, `orderIntent`, `editMode`, and any other flags that change behaviour—**with pointers into code** (file + approximate line or symbol name after edits).

## Deliverable

Fill in the starter file (already created as a skeleton):

- [`STATE_MAP.md`](./STATE_MAP.md)

It must include:

1. A **table** of every `pendingQuestion.type` value used in `conversationManager.service.ts`, with:
   - short description (what the user was asked),
   - **what user replies** typically do next,
   - **handler location** (`ConversationManager` method name or `processMessage` section comment once renamed).

2. A short **ASCII or bullet flow** for:
   - **New order** (no existing orders),
   - **Existing orders** → new vs edit gate,
   - **Edit path** (selection → items → **`edit_confirm_items`** → **pickup vs delivery** → if delivery **`confirm_previous_address`** → **`edit_confirm_delivery`** / **`edit_change_delivery`**). See `STATE_MAP.md` / `WHATSAPP_FLOW.md` canonical order.

3. Explicit note of **commands** handled outside AI (`/reset`, etc.).

## Tests (must all pass before Step 2)

These are **review + traceability** tests—no code behaviour change required yet.

| # | Test | How to verify |
|---|------|----------------|
| 1.1 | Every `pendingQuestion.type` in the Mongoose schema / TypeScript union appears in the table or is marked deprecated/unused. | Grep `pendingQuestion` / enum in `conversationState.model.ts` and `conversationManager.service.ts`; compare to `STATE_MAP.md`. |
| 1.2 | Each row in the table has a **code anchor**: either `MethodName()` or `processMessage` + unique comment tag you will add in Step 2 (e.g. `// CM: new_or_edit`). | Open `STATE_MAP.md` and `conversationManager.service.ts` side by side. |
| 1.3 | Another person can answer without reading 2000 lines: “User is on edit confirm items—what types can `pendingQuestion.type` be next?” using only `STATE_MAP.md`. | 5-minute read-aloud or written answer. |

## Rollback

Delete or revert `STATE_MAP.md` only; no production code changes in this step.

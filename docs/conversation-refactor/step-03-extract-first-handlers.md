# Step 3 — First handler extractions (high-traffic gates)

## Goal

Move **at minimum** these flows out of the giant `processMessage` body into **dedicated private methods** on `ConversationManager` (names up to you, but stable and grep-friendly):

1. **New vs edit gate** — `pendingQuestion.type === "new_or_edit"` and the logic that **sets** that question when the user has existing orders.
2. **Order selection for edit** — `pendingQuestion.type === "order_selection"` (parse number / order id, set `selectedOrderId`, next prompts).

Behaviour must match pre-step-3 exactly.

## Deliverable

- New private methods (examples, rename as you like): `handleNewOrEditGate`, `askNewOrEditIfNeeded`, `handleOrderSelection`, etc.
- `STATE_MAP.md` updated: the “handler location” column points to these method names.
- No new files required unless you prefer `conversationManager/` subfolder (optional).

## Tests (must all pass before Step 4)

Assume dedicated test `PHONE`. Start clean: `DELETE` conversation before each **scenario block**.

| # | Test | How to verify |
|---|------|----------------|
| 3.1 | `tsc` | `npx tsc --noEmit` in `server` → 0. |
| 3.2 | User **without** open orders (or none returned for that number) | After delete, `POST` `"chiffon 2"` (or your menu item) → bot moves toward product/fulfilment flow **without** asking new vs edit (unless your business rules always ask—then document that in `STATE_MAP.md`). |
| 3.3 | User **with** existing orders | With a `PHONE` that `fetchOrdersByWhatsappNumber` returns orders for: first message after delete should trigger **new vs edit** prompt (same text family as before). |
| 3.4 | **New** path | Reply indicating new order (e.g. phrase your app accepts: `pesan baru`) → `orderIntent` becomes new-order path; follow-up asks for products / continues flow. Check `debug: true` JSON. |
| 3.5 | **Edit** path | Reply `edit` (or accepted synonym) → order list shown; reply with valid selection → `selectedOrderId` set and edit prompts continue. |
| 3.6 | Invalid selection | From order list, send nonsense selection → bot re-prompts or errors **same as before** (no crash, HTTP 200 from testing API). |

### Note on 3.3–3.5

If you cannot seed orders easily, use an existing staging number that already has orders, or temporarily add a test-only seed (remove after)—document whichever you used in a **Testing notes** subsection of this file when you mark the step done.

## Rollback

Revert the extraction commit(s); router shell from Step 2 should remain.

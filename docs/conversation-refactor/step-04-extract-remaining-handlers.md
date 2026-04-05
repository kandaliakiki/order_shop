# Step 4 — Remaining handler extractions

## Goal

Continue until **every** `pendingQuestion.type` branch and the main **collecting / AI / completeness** loop live in **named private methods** (or small collaborator classes), not inside an unreadable `processMessage` sequence.

Suggested groupings (adjust to match your code):

- `missing_field` + follow-up question generation
- `product_clarification`
- `add_or_change` / edit item collection
- `edit_confirm_items`, `edit_confirm_delivery`, `edit_change_delivery`
- `confirm_previous_address`
- `edit_follow_up` if still used

`processMessage` should read like: **setup → dispatch → return**.

## Deliverable

- `STATE_MAP.md`: every row points to a **method name** (not “line 900–1200”).
- Optional: `processMessage` line count target **&lt; 150** (or justify in this file if impossible).

## Tests (must all pass before Step 5)

| # | Test | How to verify |
|---|------|----------------|
| 4.1 | `tsc` | `npx tsc --noEmit` → 0. |
| 4.2 | New order happy path | After `DELETE`, drive a **minimal** new order through test chat until you get a **completed** state or final confirmation message (whatever your app does today)—no server 500. |
| 4.3 | Product clarification | Trigger ambiguity (product name that matches multiple SKUs per your catalogue). Bot lists options; a clarifying reply continues **without** crash. |
| 4.4 | Edit confirm loop | From edit flow, reach `edit_confirm_items`; answer **yes** and **change** paths both behave as before. |
| 4.5 | Edit logistics branch | Reach **`edit_confirm_delivery`** (per **canonical** flow in `WHATSAPP_FLOW.md`: after pickup/delivery and address when delivery). Test **sama** vs **ubah**. If code still shortcuts past fulfillment, document as known gap until fixed. |
| 4.6 | `/reset` mid-flow | During collecting, `/reset` clears and restarts (same behaviour as Step 2). |

Document **exact phrases** you used for 4.2–4.5 in a “Runbook” appendix when closing this step—future you will thank you.

## Rollback

Revert extraction commits; keep Steps 1–3 intact if possible.

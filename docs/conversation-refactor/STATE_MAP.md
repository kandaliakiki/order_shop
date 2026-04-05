# Conversation state map

**Status:** Step 1 — living document (update when behaviour or refactors change).  
**Specification:** Canonical ordering of steps is **authoritative** here and in [`WHATSAPP_FLOW.md`](../../WHATSAPP_FLOW.md).  
**Code reference:** `server/lib/services/conversationManager.service.ts` — may **lag** the spec (see **Implementation gap** below).

**Code anchors:** Handlers live in `ConversationManager.processMessage` unless noted. Line numbers drift; Step 2 adds `// CM:...` dispatch tags.

---

## Canonical order (target behaviour)

### New order

1. Products / quantities → **`product_clarification`** until cart is settled.  
2. **`missing_field` + `fulfillmentType`** — **pickup vs delivery** (before any address step).  
3. **If delivery:** **`deliveryAddress`**; use **`confirm_previous_address`** when a **saved** address is offered (**only after** delivery was chosen).  
4. Remaining **`missingFields`** (date, time, …) → create order.

### Edit order

1. **`order_selection`** → collect edits; **`product_clarification`** as needed.  
2. **`edit_confirm_items`** until user confirms line items.  
3. **`missing_field` + `fulfillmentType`** — **pickup vs delivery** (explicit before logistics question).  
4. **If delivery:** **`confirm_previous_address`** when applicable, else **`deliveryAddress`**.  
5. **`edit_confirm_delivery`** — “tanggal / alamat / jam sama atau ubah?”  
6. **sama** → apply items + finalize; **ubah** → **`edit_change_delivery`** → finalize.

**Hard rule:** **`edit_confirm_delivery` never comes before** pickup vs delivery is set **and** (for delivery) address is resolved per above.

---

## Implementation gap (current `ConversationManager`)

After **`edit_confirm_items`**, the code often transitions **directly** to **`edit_confirm_delivery`**, **skipping** the canonical **fulfillment** and **saved-address** steps. That is **wrong relative to this spec** and should be fixed during refactor. New-order **`checkCompleteness`** / **`generateFollowUpQuestion`** already tends to ask **`fulfillmentType` before** address; edit path is where the mismatch is worst.

---

## Branch flags (non–`pendingQuestion`)

| Flag | Values / when set | Effect |
|------|-------------------|--------|
| `status` | `collecting` (default active), `completed`, `cancelled` | Completed/cancelled conversations are reset to fresh `collecting` on next message (see `processMessage` early block). |
| `orderIntent` | `undefined` → `new_order` \| `edit_order` | Set when user answers **new_or_edit**. While `undefined` and user has open orders, bot may ask new vs edit. |
| `selectedOrderId` | e.g. `O-0501` | Set after valid **order_selection**. |
| `editMode` | **`add_items`** only in current code | Set to `add_items` after order pick. Schema allows `change_items` but **no assignment** in `conversationManager.service.ts`. |
| `missingFields` | Array of field keys | Drives completeness (`checkCompleteness`); first missing field often becomes **`missing_field`** prompt. |

---

## Pickup vs delivery (explicit “state”)

There is **no separate enum value** for “asking pickup or delivery”. In code it is:

- **`pendingQuestion.type === "missing_field"`** with **`pendingQuestion.field === "fulfillmentType"`**

Only **after** `collectedData.fulfillmentType === "delivery"` does the flow require an address / **`confirm_previous_address`**. **Pickup** skips delivery address (may still ask date/time per `missingFields`).

---

## `pendingQuestion.type` reference

Table orders types for **reading**; **canonical edit sequence** after items is: **`edit_confirm_items` → `missing_field`(fulfillment) → `confirm_previous_address`? → `edit_confirm_delivery` → …**

| type | User-facing step (short) | Canonical next / behaviour | Current code notes |
|------|--------------------------|-----------------------------|---------------------|
| `new_or_edit` | “Pesan baru atau edit?” | → `new_order` collect or **`order_selection`**. | `askNewOrEditIfNeeded`, `handleNewOrEditGate` |
| `order_selection` | Numbered order list | → collect edits, **`product_clarification`**, **`edit_confirm_items`**. | `handleOrderSelection` |
| `product_clarification` | Ambiguous products | Until resolved; then edit → **`edit_confirm_items`**, new → completeness. | ~L985–1224 |
| `edit_confirm_items` | Proposed line-items (edit) | More edits → stay. **Ya →** **`fulfillmentType`** then (if delivery) **address / `confirm_previous_address` → `edit_confirm_delivery`**. | **Bug:** often → **`edit_confirm_delivery`** immediately (~L577–608, ~L1328–1352). |
| `missing_field` | One slot (`products`, `quantities`, `deliveryDate`, **`fulfillmentType`**, `deliveryAddress`, `pickupTime`) | **New order:** `fulfillmentType` **before** `deliveryAddress` / **`confirm_previous_address`**. **Edit:** same after items confirmed. | Many sites; ~L1226+ |
| `confirm_previous_address` | “Mau pakai alamat tersimpan?” | **Only after `fulfillmentType === "delivery"`** and saved addr exists. Then continue (new: more fields; **edit: → `edit_confirm_delivery`**). | `generateFollowUpQuestion` ~L1867+; handle ~L363–512 |
| `edit_confirm_delivery` | “Tanggal/alamat/jam sama atau ubah?” | **Only after** steps above in **canonical** flow. **Sama** → persist; **ubah** → **`edit_change_delivery`**. | ~L689–821 |
| `edit_change_delivery` | Free text logistics | Update order + apply item deltas → complete. | ~L881–968 |
| `edit_follow_up` | Narrow follow-up | Rare branch ~L824–878; else stale / unreachable. | ~L824–878 |
| `add_or_change` | — | **Unused** in `ConversationManager`. | Schema only |

---

## Target behaviour — item changes vs fulfilment (product loop)

If the user changes line items after things seemed settled:

1. Return to **`product_clarification`** / item collection until they **explicitly confirm** the cart.  
2. Then **`fulfillmentType`** again if needed, then address/time.

**Current code:** not a universal rule; see **Implementation gap**.

---

## Flow summaries (canonical)

### New order

1. Products → **`product_clarification`** (loop).  
2. **`missing_field`**: **`fulfillmentType`**.  
3. If **delivery:** **`deliveryAddress`** / **`confirm_previous_address`**.  
4. Date, time, … → complete.

### Edit order

1. **`order_selection`** → edits → **`product_clarification`**?  
2. **`edit_confirm_items`** ⇄  
3. **`missing_field` (`fulfillmentType`)**  
4. If **delivery:** **`confirm_previous_address`**?  
5. **`edit_confirm_delivery`** ⇄ **`edit_change_delivery`** → complete.

**ASCII (edit, canonical):**

```
order_selection → collect edits → product_clarification? (loop)
       → edit_confirm_items ⇄
       → missing_field (fulfillmentType)
       → if delivery: confirm_previous_address? / deliveryAddress
       → edit_confirm_delivery → sama → completed
                             → ubah → edit_change_delivery → completed
```

**ASCII (new order — fulfilment + address):**

```
… products OK …
  → missing_field (fulfillmentType)
  → if delivery: deliveryAddress / confirm_previous_address (saved offer)
  → date, pickupTime, … → complete
```

---

## Commands & special messages

| Input | Effect |
|-------|--------|
| `/reset` | Hard reset collecting state, clear pending, history, edit fields. |
| AI `intent === "reset"` | Softer reset (~L1247–1279). |
| Menu phrases | Full product list; in **`order_selection`**, menu + order list again. |

---

## Notes

- **`ambiguousProducts`** + **`product_clarification`**: disambiguation block ~L985+ before generic AI pass.  
- **`add_or_change`** / **`change_items`**: schema only unless wired.

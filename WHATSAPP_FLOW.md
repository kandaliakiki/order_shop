# WhatsApp Conversation Flow (BakeryHub)

This document describes the full WhatsApp ordering flow: conversation states, prompts shown to the user, and where they are implemented in code. All currency is **Indonesian Rupiah (IDR)**.

### Canonical order (specification — target behaviour)

**New order:** collect products (and **`product_clarification`** until settled) → **pickup vs delivery** (`missing_field` / `fulfillmentType`) → **if delivery:** collect address, including **`confirm_previous_address`** when a saved address is offered → date / time / remaining `missingFields` → create order.

**Edit order:** collect item changes → **`edit_confirm_items`** until user confirms line items → **pickup vs delivery** (explicit step, typically `missing_field` / `fulfillmentType` for this session) → **if delivery:** **`confirm_previous_address`** when applicable → **`edit_confirm_delivery`** (“tanggal / alamat / jam sama atau ubah?”) → **sama** (apply items + keep/update logistics per rules) or **ubah** → **`edit_change_delivery`** → done.

**Rule:** **`edit_confirm_delivery` must not appear before** the user has chosen **pickup vs delivery** for this continuation. **`confirm_previous_address` is only after** the user chose **delivery**.

### Implementation note (current code)

`conversationManager.service.ts` **does not fully match** the canonical edit path: after **`edit_confirm_items`**, it often jumps **straight** to **`edit_confirm_delivery`**, skipping an explicit **fulfillment** step and the **saved-address** branch in the intended order. Treat the sections below as **what the product should do**; line references describe **today’s code**, which may still reflect the old ordering until refactored.

---

## 1. Entry & state loading

**File:** `server/lib/services/conversationManager.service.ts` → `processMessage()`

- Incoming message is received; `ConversationState` is loaded for the phone number (or created if first time).
- If no state: create new state with `status: "collecting"`, `missingFields: ["products", "quantities", "deliveryDate", "fulfillmentType", "deliveryAddress", "pickupTime"]`.
- If state exists but `status !== "collecting"` (e.g. completed/cancelled): **hard reset** — clear `collectedData`, `orderIntent`, `pendingQuestion`, etc., and set `status: "collecting"`.

**Code (simplified):**
```ts
let state = await ConversationState.findOne({ phoneNumber });
if (!state) {
  state = await ConversationState.create({
    phoneNumber,
    status: "collecting",
    collectedData: {},
    missingFields: ["products", "quantities", "deliveryDate", "fulfillmentType", "deliveryAddress", "pickupTime"],
    conversationHistory: [],
  });
} else if (state.status !== "collecting") {
  state.status = "collecting";
  state.collectedData = {};
  state.pendingQuestion = undefined;
  state.orderIntent = undefined;
  // ... reset and save
}
```

---

## 2. New order vs edit order (gatekeeper)

**State:** User has existing orders and `orderIntent` is not set.

**Prompt:**
```
Anda sudah punya pesanan. Mau *pesan baru* atau *edit pesanan* yang sudah ada?

Balas: "pesan baru" atau "edit".
```

**Code:** `conversationManager.service.ts` ~line 93  
**Condition:** `hasOrders && state.orderIntent == null && state.pendingQuestion?.type !== "new_or_edit"`  
**State set:** `pendingQuestion.type = "new_or_edit"`

**User reply handling (same file, ~line 106):**
- **"pesan baru"** → `orderIntent = "new_order"`, clear `pendingQuestion`, fall through to normal order flow.
- **"edit"** → `orderIntent = "edit_order"`, build list of orders, set `pendingQuestion.type = "order_selection"`, send order list (see below).

---

## 3. Order selection (edit flow)

**State:** `pendingQuestion.type === "order_selection"`

**Prompt (order list):**
```
Pesanan Anda:

1. *O-0504* – Cheesecake 5, Chiffon 5
2. *O-0503* – ...
...

Pesanan mana yang mau diedit? Balas dengan nomor (1, 2, ...) atau ID pesanan (misal O-0501).
```

**Code:** `conversationManager.service.ts` ~lines 127–131, 181–184  
**Parsing:** User can reply with number (1, 2, …), order ID (e.g. O-0501), or "pertama"/"first".  
**After selection:** `selectedOrderId` set, `editMode = "add_items"`, `missingFields = ["products", "quantities"]`, `collectedData = {}`.

**Next prompt (edit items):**
```
Baik, pesanan *O-0501*. Mau tambah atau ubah apa?

Sebutkan produk dan jumlah (contoh: Chiffon 2, Cheesecake 1), atau item yang mau dihapus (contoh: hapus Cheesecake).
```

---

## 4. Collecting order items (new order or edit)

**State:** `status: "collecting"`, no `pendingQuestion` or `pendingQuestion.type === "missing_field"` with field products/quantities.

- **AI analysis:** `AIService.analyzeWithContext()` in `ai.service.ts` — extracts products, quantities, delivery date, address, fulfillment type, pickup time; in edit context also extracts `productsToRemove`.
- **Ambiguity:** If a term matches multiple products, bot sends a clarification message (list of options) and sets `pendingQuestion.type = "product_clarification"`.
- **Missing fields:** For the first missing field, bot asks using templates or AI `suggestedQuestion`.

**Prompts used (from `generateFollowUpQuestion()` and templates):**

| Missing field     | Prompt (Indonesian) |
|-------------------|---------------------|
| products          | "Produk apa yang ingin Anda pesan? Silakan sebutkan nama produknya." |
| quantities        | "Berapa jumlah [product names] yang Anda inginkan?" |
| deliveryDate      | "Kapan Anda ingin pesanan dikirim? (contoh: besok, 15 Februari, atau tanggal lainnya)" |
| fulfillmentType  | "Apakah pesanan ini mau DIAMBIL di toko (pickup) atau DIKIRIM ke alamat Anda (delivery)? Balas dengan salah satu kata saja: \"pickup\" atau \"delivery\"." |
| deliveryAddress   | "Bisa berikan alamat pengiriman yang lengkap? (termasuk nama jalan, nomor, dan kota)" |
| pickupTime        | "Jam berapa Anda ingin pesanan DIKIRIM?" / "Jam berapa Anda ingin MENGAMBIL pesanan di toko?" (depending on fulfillmentType) |

**Canonical field order:** **`fulfillmentType` (pickup vs delivery) before `deliveryAddress`** and before **`confirm_previous_address`** (saved address is only offered once the user chose delivery).

**Edit mode (products/quantities only):**  
Prompt: `Mau tambah atau ubah apa ke pesanan *O-XXXX*? Sebutkan produk dan jumlah (contoh: Chiffon 2, Cheesecake 1), atau item yang mau dihapus (contoh: hapus Cheesecake).`  
**Code:** `conversationManager.service.ts` ~line 972

---

## 5. Product clarification (ambiguous items)

**State:** `pendingQuestion.type === "product_clarification"`

**Prompt pattern:**
```
Saya melihat beberapa kata yang bisa berarti beberapa produk berbeda. Berikut daftar kemungkinan produknya:

Saat ini pesanan yang sudah kami catat:
- [confirmed items]

Untuk "[term]":
- Product A - Rp ...
- Product B - Rp ...

Mohon sebutkan nama lengkap dari daftar di atas (dan jumlahnya).
Contoh: "Chocolate Chip Cookie 2 pcs, pain au chocolate 1 pcs".
```

**Code:** `conversationManager.service.ts` (ambiguity block and product_clarification handling) — builds list from `ambiguousProducts` and confirmed `collectedData.products`.

---

## 6. Edit flow — confirm items (no DB write yet)

**State:** Edit order, and we have collected products/add/remove; **completeness** for edit is satisfied (products/quantities or only removals).

**Behaviour:** Do **not** call `addItemsToOrder` / `removeItemsFromOrder` yet. Build a **proposed** order (current order + add − remove) and ask for confirmation.

**Prompt (from `buildProposedEditSummary()`):**
```
Pesanan Anda saat ini (*O-0501*):

• Cheesecake: 2 pcs
• Cheese Biscuit: 1 pcs
• Chiffon: 1 pcs

Apakah item pesanan sudah benar? Balas *ya* atau *betul* untuk konfirmasi, atau sebutkan yang mau diubah.
```

**Code:** `conversationManager.service.ts` → `buildProposedEditSummary()`, then set `pendingQuestion.type = "edit_confirm_items"` (two places: after product_clarification and in main “all data complete” block for edit).

---

## 7. Edit — confirm items reply (`edit_confirm_items`)

**State:** `pendingQuestion.type === "edit_confirm_items"`

**If user sends more changes (e.g. "tambah X", "hapus Y"):**  
Re-run AI with edit context, merge into `collectedData`, call `buildProposedEditSummary()` again, send the same “Pesanan Anda saat ini …” message, stay on `edit_confirm_items`.  
**Code:** ~lines 216–228

**If user says "ya" / "betul" / "benar" / "sudah benar" / "ok" (canonical next steps):**

1. **Ask pickup vs delivery** for this edit continuation (`pendingQuestion.type = "missing_field"`, `field = "fulfillmentType"`) — same style of prompt as new order (“ambil di toko atau dikirim?”).
2. **If user chooses delivery:** offer **`confirm_previous_address`** when a saved customer address exists; otherwise ask for **`deliveryAddress`** (`missing_field`).
3. **Then** ask whether **date / address / time** stay the same as the order or should change → **`edit_confirm_delivery`** (section 8).

**Current code (known deviation):** often sets **`edit_confirm_delivery` immediately** after item confirm, **without** the explicit fulfillment + saved-address steps in between. **Code:** ~lines 577–608 region (transition to `edit_confirm_delivery`).

---

## 8. Edit — confirm delivery (`edit_confirm_delivery`)

**State:** `pendingQuestion.type === "edit_confirm_delivery"`  
**Canonical placement:** only **after** **`fulfillmentType`** is set and, for **delivery**, after **address** is resolved (including **`confirm_previous_address`** when used).

**If user says "sama" / "tetap" / "ya":**  
- Call `removeItemsFromOrder(oid, toRemove)` and `addItemsToOrder(oid, toAdd)`.
- Mark conversation completed; send **final customer confirmation** (see section 11).  
**Code:** ~lines 232–268

**If user says "ubah":**  
Prompt:
```
Baik. Sebutkan alamat baru, tanggal pengambilan/pengiriman, atau jam.

Contoh: jam 4 sore, besok, Jl. Merdeka No 1.
```
**State:** `pendingQuestion.type = "edit_change_delivery"`  
**Code:** ~line 276

**If unclear:**  
Prompt: `Balas *sama* (tanggal/alamat/jam tetap) atau *ubah* (mau ubah alamat/tanggal/jam).`

---

## 9. Edit — change delivery details (`edit_change_delivery`)

**State:** `pendingQuestion.type === "edit_change_delivery"`

**Behaviour:** User sends one message with new address/date/time.  
- Parse with `analyzeWithContext()` (delivery fields).  
- Call `updateOrderDeliveryDetails(oid, updates)`.  
- Then call `removeItemsFromOrder` and `addItemsToOrder` with the same edit payload.  
- Send **final customer confirmation** only (no “mau tambah lagi?”).  
**Code:** ~lines 322–361

---

## 10. Reset intent

**State:** Any; detected by AI `analysis.intent === "reset"`.

**Behaviour:** Clear `collectedData`, `orderIntent`, `selectedOrderId`, `editMode`, `pendingQuestion`, and `conversationHistory`; set `status: "collecting"` and default `missingFields`.

**Prompt:**
```
Baik, semua pesanan sebelumnya sudah saya hapus. Jadi, mau pesan apa saja kali ini? Berapa banyak untuk masing-masing kue, dan kapan mau dikirim?
```

**Code:** `conversationManager.service.ts` ~lines 448–481 (reset block), prompt ~line 468.

---

## 11. Final order confirmation (customer-facing)

**When:** New order created (conversational flow) or edit order applied (after “sama” or after “ubah” + delivery update).

**Format (customer only — no admin/stock wording):**  
**File:** `server/lib/services/whatsappMessageFormatter.service.ts` → `formatCustomerOrderConfirmation()`

**Prompt:**
```
✅ Pesanan Anda sudah kami terima.

Order ID: *O-0504*.
📦 Ambil di toko (pickup).   // or 🚚 Dikirim (delivery).
🕐 Waktu: jam 3 sore
📱 Lihat detail pesanan: http://localhost:3000/order/O-0504

Kami akan cek stok dan mengonfirmasi berikutnya bila diperlukan
```

**Used in:**
- `whatsappOrderProcessing.action.ts` when `skipStockCheck === true` (new order from chat).
- `conversationManager.service.ts` when edit is completed (edit_confirm_delivery “sama” branch and edit_change_delivery branch).

---

## 12. State summary table

Order reflects **canonical** flow; **`edit_confirm_delivery`** appears **after** pickup/delivery and (for delivery) address / **`confirm_previous_address`**.

| State / step              | pendingQuestion.type   | Prompt / action |
|---------------------------|-------------------------|------------------|
| Entry                     | —                       | Load or create state; maybe ask new vs edit. |
| New vs edit               | `new_or_edit`           | "Mau pesan baru atau edit?" |
| Choose order (edit)       | `order_selection`      | List orders + "Balas nomor atau ID" |
| Ask edit items            | —                       | "Mau tambah atau ubah apa? Sebutkan produk/jumlah atau hapus …" |
| Collecting (new)          | `missing_field`        | Ask missing fields in completeness order; **fulfillmentType (pickup/delivery) before** delivery address / **`confirm_previous_address`**. |
| Ambiguous products        | `product_clarification`| List options + "Sebutkan nama lengkap dan jumlah" |
| Edit: propose items       | `edit_confirm_items`   | "Pesanan Anda saat ini: … Apakah item sudah benar? Balas ya/betul atau sebutkan yang mau diubah." |
| Edit: confirm items reply | `edit_confirm_items`   | More edits → stay here. **Ya (canonical)** → **pickup vs delivery** → if delivery → **address / `confirm_previous_address`** → then **`edit_confirm_delivery`**. |
| Edit: pickup vs delivery  | `missing_field` (`fulfillmentType`) | Same idea as new order; must occur **before** `edit_confirm_delivery`. |
| Edit: saved address       | `confirm_previous_address` | After user chose **delivery**; then proceed to **`edit_confirm_delivery`**. |
| Edit: confirm logistics   | `edit_confirm_delivery`| "Tanggal/alamat/jam tetap sama atau ubah?" → sama: save & final; ubah: **`edit_change_delivery`**. |
| Edit: change delivery     | `edit_change_delivery` | User sends detail → update delivery + apply item changes → final confirmation. |
| Order saved               | — (status completed)   | Final customer message (order received + ID + pickup/delivery + waktu + link + stok note). |

---

## 13. AI prompt (order analysis)

**File:** `server/lib/services/ai.service.ts` → `analyzeWithContext()`

- Products are listed as: `Nama Produk - Rp <price>` using `toLocaleString("id-ID")`.
- Instructions ask for: products, quantities, deliveryDate, deliveryAddress, fulfillmentType (pickup/delivery), pickupTime; for edit context also `productsToRemove`.
- Intent can be `reset` | `order` | `other`; `reset` triggers the reset flow above.
- Ambiguous product terms must be returned in `ambiguousProducts` (no guessing).

---

## 14. Currency

- **Stored:** Prices in database are numeric (e.g. 21000 for Rp 21.000).
- **Display to customer:** All WhatsApp and customer-facing text use **Rupiah (IDR)** via `formatCustomerOrderConfirmation` and AI prompt product list (`Rp ... toLocaleString("id-ID")`).
- **Client (dashboard/orders):** Use a single formatter (e.g. `formatPrice(amount)`) that displays as **Rp** with `toLocaleString("id-ID")` so the whole app uses Rupiah instead of $.

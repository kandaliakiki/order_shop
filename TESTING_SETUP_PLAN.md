# Testing Interface - Implementation Plan

**Conversation ordering (spec):** After **edit item** confirmation, flow should ask **pickup vs delivery**, then **saved address** (if delivery), then **`edit_confirm_delivery`**. New orders ask **pickup/delivery before** address. See `WHATSAPP_FLOW.md` and `docs/conversation-refactor/STATE_MAP.md`. Current `ConversationManager` may still shortcut the edit path.

## Problem Statement
Current testing interface needs to call the **real conversation logic** but should work with **any mock phone number** without requiring Twilio or real WhatsApp integration.

## Current Status
✅ Backend API endpoints created (`/api/testing/chat`)
✅ React UI created with proper design
❌ API endpoints not properly configured for mock testing
❌ Frontend making incorrect API calls

## Solution Architecture

### Backend (Already Created - Needs Configuration)

**File**: `server/lib/routes/testing.route.ts`
- ✅ `POST /api/testing/chat` - Send message, get real AI response
- ✅ `GET /api/testing/conversation/:phone` - Get conversation state
- ✅ `DELETE /api/testing/conversation/:phone` - Reset conversation

**File**: `server/lib/services/testingChat.service.ts`
- ✅ Uses `ConversationManager` directly (real conversation logic)
- ✅ Creates mock Twilio/message IDs
- ✅ Returns real AI responses

### Frontend (Needs API URL Fix)

**Issue**: Frontend is calling `/api/testing/chat` but backend runs on port 8080, frontend on port 3000

**Solution**: Configure proper API proxy or use full URL

## Implementation Steps

### Step 1: Enable Backend Testing Routes ✅ (Already Done)
- Routes registered in `server/server.ts`
- Enabled via `ENABLE_TESTING_INTERFACE=true` in `.env.local`
- Backend runs on `http://localhost:8080`

### Step 2: Configure Frontend API Calls
**Option A: Proxy in next.config.mjs (Recommended)**
```javascript
// next.config.mjs
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/testing/:path*',
        destination: 'http://localhost:8080/api/testing/:path*',
      },
    ];
  },
};

export default nextConfig;
```

**Option B: Environment Variable**
```env
# client/.env.local
NEXT_PUBLIC_TESTING_API_URL=http://localhost:8080/api/testing
```

Then update frontend to use:
```typescript
const API_URL = process.env.NEXT_PUBLIC_TESTING_API_URL || '/api/testing';
```

### Step 3: Update Frontend to Call Real API

**Revert frontend changes to use real API:**
```typescript
const sendMessage = async () => {
  if (!message.trim() || !isConnected) return;

  addMessage('user', message);
  setMessage('');
  setIsLoading(true);

  try {
    const response = await fetch('/api/testing/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phoneNumber, 
        message, 
        debug: true 
      })
    });

    const data = await response.json();
    
    if (data.success) {
      addMessage('bot', data.response);
      if (data.conversationState) {
        updateDebugInfo(data.conversationState);
      }
    } else {
      addMessage('system', `Error: ${data.error}`);
    }
  } catch (error) {
    addMessage('system', `Send error: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Test Flow

1. **Start Backend**: `cd server && npm run dev` (port 8080)
2. **Start Frontend**: `cd client && npm run dev` (port 3000)
3. **Open**: `http://localhost:3000/test-chat`
4. **Enter any phone**: `+628123456789` (doesn't matter, just for session tracking)
5. **Click Connect**
6. **Send real messages**: "chiffon 2", "delivery", etc.
7. **Get real AI responses** from your conversation logic
8. **See real state changes** in debug panel

## Key Points

### ✅ What Works:
- Real conversation state machine
- Real AI extraction (Gemini/OpenAI)
- Real product detection
- Real flow logic (new order, edit order, etc.)
- Real `/reset` command handling
- Real product modification at any stage

### ✅ What's Mocked:
- Phone number (any value works, just for session ID)
- Twilio message ID (generated as `test_${timestamp}`)
- MongoDB message ID (generated as `test_mongo_${timestamp}`)
- No actual WhatsApp messages sent
- No Twilio costs

### ❌ What's NOT Tested:
- Twilio webhook integration
- WhatsApp message formatting
- Real phone number validation
- Twilio rate limiting

## Testing Scenarios

### Test 1: New Order Flow
```
User: "chiffon 2"
Bot: [Real AI response extracting products]
User: "delivery"
Bot: [Real AI response asking for address]
User: "Jl. Merdeka No. 10"
Bot: [Real AI extracting address]
... continues with real flow
```

### Test 2: Product Modification Mid-Flow
```
User: "chiffon 2"
Bot: "Mau ambil di toko atau dikirim?"
User: "delivery, oh ya tambah brownies 1"
Bot: [Real AI detects product modification]
     [Updates cart, continues asking for address]
```

### Test 3: Reset Command
```
User: "chiffon 2"
Bot: "Mau ambil di toko atau dikirim?"
User: "/reset"
Bot: [Real reset logic from NewOrderCheckState]
     "✅ Conversation reset! Mau pesan baru atau edit yang ada?"
```

## Files to Modify

1. **`client/next.config.mjs`** - Add API proxy
2. **`client/app/(root)/test-chat/page.tsx`** - Revert to real API calls
3. **`client/.env.local`** - Add API URL (if using Option B)

## Success Criteria

✅ Can test full conversation flows
✅ Real AI responses (not mocked)
✅ Real state transitions
✅ Real `/reset` command works
✅ Real product modification works
✅ Debug panel shows real conversation state
✅ No Twilio costs
✅ Any phone number works
✅ Multiple simultaneous test sessions possible

---

**Ready to implement?**
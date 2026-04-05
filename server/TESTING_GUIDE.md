# Order Shop - Testing Interface Quick Guide

## Quick Start

1. **Start Backend Server**: `cd server && npm run dev`
2. **Start Frontend**: `cd client && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000/test-chat`
4. **Enter Phone**: Use any number (e.g., `+62895327367697`)
5. **Click Connect**
6. **Start Chatting!**

**Spec reminder:** Edit flow should go **items → pickup/delivery → address (if delivery) → `edit_confirm_delivery`**; see `WHATSAPP_FLOW.md`. Code may still skip steps until refactored.

## Features

✅ **Test all conversation flows** without Twilio costs
✅ **Debug panel** shows internal state
✅ **Export conversations** for bug reports
✅ **Reset anytime** with `/reset` command
✅ **Multi-user testing** - use different phone numbers

## Common Test Scenarios

### New Order Flow
```
User: chiffon 2
Bot: Mau ambil di toko atau dikirim?
User: delivery
Bot: Alamat pengirimannya mana?
User: Jl. Merdeka No. 10
Bot: Kapan mau dikirim?
User: besok
Bot: Jam berapa?
User: jam 3 sore
Bot: ✅ Pesanan sudah kami terima!
```

### Test /reset Command
```
User: chiffon 2
Bot: Mau ambil di toko atau dikirim?
User: /reset
Bot: ✅ Conversation reset! Mau pesan baru atau edit yang ada?
```

### Product Modification Mid-Flow
```
User: chiffon 2
Bot: Mau ambil di toko atau dikirim?
User: delivery, oh ya tambah brownies 1
Bot: 🛒 Keranjang updated... Alamat pengirimannya mana?
```

## API Endpoints

### Send Message
```bash
POST http://localhost:8080/api/testing/chat
{
  "phoneNumber": "+62895327367697",
  "message": "chiffon 2",
  "debug": true
}
```

### Get Conversation
```bash
GET http://localhost:8080/api/testing/conversation/+62895327367697
```

### Reset Conversation
```bash
DELETE http://localhost:8080/api/testing/conversation/+62895327367697
```

## Configuration

Edit `.env.local`:
```env
NODE_ENV=development
ENABLE_TESTING_INTERFACE=true
TESTING_AUTH_TOKEN=dev-test-token
```

## Troubleshooting

- **Can't connect?** Check server is running and `ENABLE_TESTING_INTERFACE=true`
- **Conversation not persisting?** Verify MongoDB connection
- **Debug not updating?** Check "Show Debug" checkbox

---

**Enjoy testing without Twilio costs! 🎉**

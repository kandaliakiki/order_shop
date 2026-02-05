# Testing WhatsApp Messages

## Method 1: Using Postman (Recommended)

### Step 1: Get Your Twilio Credentials
From your `.env.local`:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886`

### Step 2: Create Postman Request

**Request Type:** `POST`

**URL:**
```
https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
```

Replace `{AccountSid}` with your actual Account SID.

**Example:**
```
https://api.twilio.com/2010-04-01/Accounts/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/Messages.json
```

**Authorization:**
- Type: `Basic Auth`
- Username: Your `TWILIO_ACCOUNT_SID`
- Password: Your `TWILIO_AUTH_TOKEN`

**Body (x-www-form-urlencoded):**
```
From: whatsapp:+14155238886
To: whatsapp:+62895327367697
Body: Test message from Postman
```

### Step 3: Send Request

You should see a response with message SID if successful, or an error if it fails.

---

## Method 2: Using cURL

```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "To=whatsapp:+62895327367697" \
  --data-urlencode "Body=Test message from curl" \
  -u "{AccountSid}:{AuthToken}"
```

Replace:
- `{AccountSid}` with your Account SID
- `{AuthToken}` with your Auth Token

---

## Method 3: Using Twilio Console (Easiest)

1. Go to: **Twilio Console → Messaging → Try it out → Send a WhatsApp message**
2. Enter:
   - **To:** `+62895327367697` (without `whatsapp:` prefix)
   - **Message:** `Test message from console`
3. Click **Send**
4. Check the result immediately

---

## Method 4: Test Endpoint in Your Server

I'll add a test endpoint to your server that you can call via Postman or browser.

**Endpoint:** `POST /api/whatsapp/test`

**Body (JSON):**
```json
{
  "to": "+62895327367697",
  "message": "Test message from API"
}
```

This will use your existing `TwilioService` to send the message.

---

## What to Check

After sending, check:

1. **Twilio Console → Monitor → Logs → Messaging**
   - Find your message
   - Check status (sent, failed, delivered)
   - Look for error codes

2. **Your Phone**
   - Did you receive the message?
   - If not, check the error in Twilio logs

---

## Expected Results

### ✅ Success
- Message status: `sent` or `delivered`
- You receive the message on WhatsApp
- No error codes

### ❌ Failure (Error 63058)
- Message status: `undelivered` or `failed`
- Error: "Business is restricted from messaging users in this country"
- You don't receive the message

If you get error 63058, it confirms the country restriction issue, not a code problem.

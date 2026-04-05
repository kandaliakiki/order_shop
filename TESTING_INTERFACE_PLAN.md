# Order Shop - Chat Testing Interface Implementation Plan

## Document Information
- **Created**: 2026-04-02
- **Purpose**: Enable cost-free testing of WhatsApp conversation flow without Twilio
- **Status**: Ready for Implementation
- **Estimated Time**: 3-4 hours

**Canonical conversation order (product spec):** New orders: **pickup/delivery before** address / `confirm_previous_address`. Edit orders: **`edit_confirm_items` → pickup/delivery → address if delivery → `edit_confirm_delivery`**. `ConversationManager` may not match yet. See `WHATSAPP_FLOW.md`, `docs/conversation-refactor/STATE_MAP.md`.

---

## Executive Summary

This document outlines a comprehensive plan to create a web-based chat testing interface for the Order Shop WhatsApp Bakery POS system. The interface will allow developers to test conversation flows, state transitions, and AI responses without incurring Twilio WhatsApp API costs.

### Key Benefits
- ✅ **Zero Twilio Costs** - Test unlimited conversations for free
- ✅ **Instant Feedback** - No WhatsApp delivery delays
- ✅ **Full Visibility** - See internal conversation state and debug info
- ✅ **Multi-User Testing** - Test multiple phone numbers simultaneously
- ✅ **Safe Environment** - No risk of sending test messages to real customers

---

## Current System Architecture

### Existing Components (To Be Reused)

```
server/lib/
├── conversation/
│   ├── ConversationMachine.ts          # State machine orchestrator
│   ├── context/
│   │   └── ConversationContext.ts      # Conversation state wrapper
│   ├── states/
│   │   ├── NewOrderCheckState.ts       # 11 state handlers
│   │   ├── CollectProductsState.ts
│   │   ├── ClarifyProductsState.ts
│   │   ├── CollectFieldState.ts
│   │   ├── ConfirmAddressState.ts
│   │   ├── EditSelectOrderState.ts
│   │   ├── EditCollectChangesState.ts
│   │   ├── EditConfirmItemsState.ts
│   │   ├── EditConfirmDeliveryState.ts
│   │   ├── EditChangeDeliveryState.ts
│   │   └── CompleteState.ts
│   └── types.ts                        # Type definitions
│
├── services/
│   ├── conversationManager.service.ts     # Main conversation processor
│   └── ai.service.ts                      # AI extraction service
│
└── actions/
    └── whatsappWebhook.action.ts       # Current WhatsApp entry point
```

### Current Flow (Production)

```
WhatsApp Message → Twilio Webhook → whatsappWebhook.action.ts 
→ ConversationManager
→ State Handlers → AI Service → Response
```

### New Flow (Testing)

```
Web Interface → Testing API → ConversationManager
→ AI Service → Response
```

**Key Insight**: The testing interface will reuse 95% of existing code. Only the entry point changes.

---

## Implementation Phases

### Phase 1: Testing API Endpoint (Backend)

**Priority**: HIGH  
**Time**: 30 minutes  
**Files to Create**: 2

#### 1.1 Create Testing Route Handler

**File**: `server/lib/routes/testing.route.ts`

```typescript
import { Router } from 'express';
import { Request, Response } from 'express';
import { TestingChatService } from '../services/testingChat.service';

const router = Router();
const testingService = new TestingChatService();

/**
 * POST /api/testing/chat
 * Send a message and get bot response
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message, debug = false } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber and message are required'
      });
    }
    
    const result = await testingService.processMessage(phoneNumber, message);
    
    const response: any = {
      success: true,
      response: result.whatsappResponse,
      timestamp: new Date().toISOString()
    };
    
    if (debug) {
      response.conversationState = result.debugInfo;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Testing chat error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/testing/conversation/:phoneNumber
 * Get conversation history and state
 */
router.get('/conversation/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    const conversation = await testingService.getConversation(phoneNumber);
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/testing/conversation/:phoneNumber
 * Reset conversation for testing
 */
router.delete('/conversation/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    await testingService.resetConversation(phoneNumber);
    
    res.json({
      success: true,
      message: 'Conversation reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/testing/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

#### 1.2 Create Testing Chat Service

**File**: `server/lib/services/testingChat.service.ts`

```typescript
import { connectToDB } from "../mongoose";
import ConversationState from "../models/conversationState.model";
import { ConversationManager } from "./conversationManager.service";

export interface TestingChatResult {
  success: boolean;
  whatsappResponse: string;
  debugInfo?: {
    currentState: string;
    missingFields: string[];
    products: Array<{ name: string; quantity: number }>;
    collectedData: any;
    conversationHistory: Array<{ role: string; message: string; timestamp: Date }>;
  };
  error?: string;
}

export class TestingChatService {
  private conversationManager: ConversationManager;

  constructor() {
    this.conversationManager = new ConversationManager();
  }

  /**
   * Process a test message and return response
   */
  async processMessage(
    phoneNumber: string,
    message: string,
    includeDebug: boolean = false
  ): Promise<TestingChatResult> {
    try {
      await connectToDB();

      // Process message using existing conversation manager
      const result = await this.conversationManager.processMessage(
        message,
        phoneNumber,
        `test_${Date.now()}`,  // Mock Twilio message ID
        `test_mongo_${Date.now()}`  // Mock MongoDB ID
      );

      const response: TestingChatResult = {
        success: result.success,
        whatsappResponse: result.whatsappResponse
      };

      // Add debug info if requested
      if (includeDebug) {
        const conversation = await ConversationState.findOne({ phoneNumber });
        if (conversation) {
          response.debugInfo = {
            currentState: this.getCurrentState(conversation),
            missingFields: conversation.missingFields,
            products: conversation.collectedData?.products || [],
            collectedData: conversation.collectedData,
            conversationHistory: conversation.conversationHistory
          };
        }
      }

      return response;
    } catch (error) {
      console.error('Testing chat service error:', error);
      return {
        success: false,
        whatsappResponse: "Maaf, terjadi kesalahan saat memproses pesanan.",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get conversation history and state
   */
  async getConversation(phoneNumber: string) {
    await connectToDB();
    
    const conversation = await ConversationState.findOne({ phoneNumber });
    
    if (!conversation) {
      return null;
    }

    return {
      phoneNumber: conversation.phoneNumber,
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.conversationHistory?.length || 0,
      currentState: this.getCurrentState(conversation),
      missingFields: conversation.missingFields,
      products: conversation.collectedData?.products || [],
      conversationHistory: conversation.conversationHistory || []
    };
  }

  /**
   * Reset conversation for testing
   */
  async resetConversation(phoneNumber: string) {
    await connectToDB();
    
    await ConversationState.deleteOne({ phoneNumber });
  }

  /**
   * Extract current state from conversation
   */
  private getCurrentState(conversation: any): string {
    const pendingType = conversation.pendingQuestion?.type;
    
    if (!pendingType) {
      return conversation.collectedData?.products?.length > 0 
        ? 'collect_field' 
        : 'collect_products';
    }

    const stateMap: Record<string, string> = {
      'missing_field': 'collect_field',
      'product_clarification': 'clarify_products',
      'new_or_edit': 'new_order_check',
      'order_selection': 'edit_select_order',
      'add_or_change': 'edit_collect_changes',
      'edit_confirm_items': 'edit_confirm_items',
      'edit_confirm_delivery': 'edit_confirm_delivery',
      'edit_change_delivery': 'edit_change_delivery',
      'confirm_previous_address': 'confirm_address'
    };

    return stateMap[pendingType] || 'unknown';
  }
}
```

#### 1.3 Register Testing Routes

**File**: `server/server.ts` (Modify)

Add after line 82 (after `connectToDB()`):

```typescript
// Testing interface routes (only in development)
if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_TESTING_INTERFACE === 'true') {
  import('./lib/routes/testing.route').then(({ default: testingRoutes }) => {
    app.use('/api/testing', testingRoutes);
    console.log('✅ Testing interface enabled at http://localhost:8080/api/testing');
  });
}
```

---

### Phase 2: Web Chat Interface (Frontend)

**Priority**: HIGH  
**Time**: 1-2 hours  
**Files to Create**: 3

#### 2.1 HTML Structure

**File**: `server/public/test-chat.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shop - Chat Testing Interface</title>
  <link rel="stylesheet" href="test-chat.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1>🧪 Order Shop - Chat Testing</h1>
      <div class="connection-status" id="connectionStatus">
        <span class="status-dot"></span>
        <span class="status-text">Disconnected</span>
      </div>
    </header>

    <!-- Connection Panel -->
    <div class="connection-panel">
      <div class="form-group">
        <label for="phoneNumber">Phone Number (WhatsApp format)</label>
        <input 
          type="text" 
          id="phoneNumber" 
          placeholder="+628123456789" 
          value="+62895327367697"
        />
        <button id="connectBtn" class="btn btn-primary">Connect</button>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="chat-container">
      <div class="chat-messages" id="chatMessages">
        <div class="message system">
          <div class="message-content">
            Connect with a phone number to start testing
          </div>
        </div>
      </div>
      
      <div class="chat-input-area">
        <input 
          type="text" 
          id="messageInput" 
          placeholder="Type a message..." 
          disabled
        />
        <button id="sendBtn" class="btn btn-success" disabled>Send</button>
      </div>
    </div>

    <!-- Debug Panel -->
    <div class="debug-panel" id="debugPanel">
      <div class="debug-header">
        <h3>🔍 Debug Info</h3>
        <button id="toggleDebug" class="btn btn-sm">▼</button>
      </div>
      <div class="debug-content" id="debugContent">
        <div class="debug-section">
          <h4>Current State</h4>
          <pre id="debugState">Not connected</pre>
        </div>
        <div class="debug-section">
          <h4>Missing Fields</h4>
          <pre id="debugMissingFields">-</pre>
        </div>
        <div class="debug-section">
          <h4>Products</h4>
          <pre id="debugProducts">-</pre>
        </div>
        <div class="debug-section">
          <h4>Collected Data</h4>
          <pre id="debugCollectedData">-</pre>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <button id="resetBtn" class="btn btn-warning" disabled>🔄 Reset Conversation</button>
      <button id="clearBtn" class="btn btn-secondary" disabled>🗑️ Clear Chat</button>
      <button id="exportBtn" class="btn btn-info" disabled>📥 Export</button>
      <label class="checkbox-label">
        <input type="checkbox" id="debugToggle" checked />
        Show Debug Info
      </label>
    </div>
  </div>

  <script src="test-chat.js"></script>
</body>
</html>
```

#### 2.2 CSS Styling

**File**: `server/public/test-chat.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  font-size: 14px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4444;
  animation: pulse 2s infinite;
}

.connection-status.connected .status-dot {
  background: #00cc66;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Connection Panel */
.connection-panel {
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.form-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-group label {
  font-weight: 500;
  color: #555;
  min-width: 180px;
}

.form-group input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-success {
  background: #00cc66;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #00b359;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* Chat Container */
.chat-container {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  background: #f8f9fa;
}

.message {
  margin-bottom: 15px;
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message.system {
  justify-content: center;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message.user .message-content {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .message-content {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message.system .message-content {
  background: #e9ecef;
  color: #6c757d;
  font-size: 13px;
  text-align: center;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

/* Chat Input */
.chat-input-area {
  display: flex;
  gap: 10px;
  padding: 15px 30px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.chat-input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.chat-input-area input:focus {
  outline: none;
  border-color: #667eea;
}

/* Debug Panel */
.debug-panel {
  border-top: 1px solid #e0e0e0;
  background: #2d2d2d;
  color: #f8f8f2;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #1e1e1e;
}

.debug-header h3 {
  font-size: 14px;
  font-weight: 600;
}

.debug-content {
  padding: 15px 20px;
  max-height: 300px;
  overflow-y: auto;
}

.debug-content.collapsed {
  display: none;
}

.debug-section {
  margin-bottom: 15px;
}

.debug-section h4 {
  font-size: 12px;
  color: #667eea;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.debug-section pre {
  background: #1e1e1e;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  border-left: 3px solid #667eea;
}

/* Control Panel */
.control-panel {
  display: flex;
  gap: 10px;
  padding: 15px 30px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  align-items: center;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  margin-left: auto;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    border-radius: 0;
  }
  
  .header {
    padding: 15px 20px;
  }
  
  .header h1 {
    font-size: 18px;
  }
  
  .connection-panel,
  .chat-messages,
  .chat-input-area,
  .debug-content,
  .control-panel {
    padding-left: 15px;
    padding-right: 15px;
  }
  
  .form-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-group label {
    min-width: auto;
    margin-bottom: 5px;
  }
  
  .control-panel {
    justify-content: center;
  }
  
  .checkbox-label {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}

/* Loading State */
.loading {
  pointer-events: none;
  opacity: 0.6;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

#### 2.3 JavaScript Logic

**File**: `server/public/test-chat.js`

```javascript
class ChatTestingInterface {
  constructor() {
    this.phoneNumber = '';
    this.isConnected = false;
    this.apiBaseUrl = '/api/testing';
    
    // DOM Elements
    this.elements = {
      phoneNumber: document.getElementById('phoneNumber'),
      connectBtn: document.getElementById('connectBtn'),
      messageInput: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      chatMessages: document.getElementById('chatMessages'),
      debugPanel: document.getElementById('debugPanel'),
      debugContent: document.getElementById('debugContent'),
      toggleDebug: document.getElementById('toggleDebug'),
      debugState: document.getElementById('debugState'),
      debugMissingFields: document.getElementById('debugMissingFields'),
      debugProducts: document.getElementById('debugProducts'),
      debugCollectedData: document.getElementById('debugCollectedData'),
      resetBtn: document.getElementById('resetBtn'),
      clearBtn: document.getElementById('clearBtn'),
      exportBtn: document.getElementById('exportBtn'),
      debugToggle: document.getElementById('debugToggle'),
      connectionStatus: document.getElementById('connectionStatus')
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedPhoneNumber();
  }

  bindEvents() {
    this.elements.connectBtn.addEventListener('click', () => this.connect());
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
    this.elements.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    this.elements.toggleDebug.addEventListener('click', () => this.toggleDebug());
    this.elements.resetBtn.addEventListener('click', () => this.resetConversation());
    this.elements.clearBtn.addEventListener('click', () => this.clearChat());
    this.elements.exportBtn.addEventListener('click', () => this.exportConversation());
    this.elements.debugToggle.addEventListener('change', (e) => {
      this.elements.debugPanel.style.display = e.target.checked ? 'block' : 'none';
    });
  }

  async connect() {
    const phoneNumber = this.elements.phoneNumber.value.trim();
    if (!phoneNumber) {
      this.showMessage('Please enter a phone number', 'system');
      return;
    }

    this.phoneNumber = phoneNumber;
    this.savePhoneNumber();
    
    try {
      this.setLoading(true);
      
      // Check if conversation exists
      const response = await fetch(`${this.apiBaseUrl}/conversation/${phoneNumber}`);
      const data = await response.json();
      
      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.enableControls(true);
      
      // Load existing conversation if any
      if (data.success && data.conversation) {
        this.showMessage(`Connected to ${phoneNumber}`, 'system');
        this.loadConversationHistory(data.conversation);
      } else {
        this.showMessage(`Connected to ${phoneNumber}. Start a new conversation!`, 'system');
      }
      
      this.setLoading(false);
    } catch (error) {
      this.showMessage(`Connection error: ${error.message}`, 'system');
      this.setLoading(false);
    }
  }

  async sendMessage() {
    const message = this.elements.messageInput.value.trim();
    if (!message || !this.isConnected) return;

    // Display user message
    this.showMessage(message, 'user');
    this.elements.messageInput.value = '';
    
    try {
      this.setLoading(true);
      this.disableSend(true);

      const response = await fetch(`${this.apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: this.phoneNumber,
          message: message,
          debug: true
        })
      });

      const data = await response.json();

      if (data.success) {
        // Display bot response
        this.showMessage(data.response, 'bot');
        
        // Update debug info
        if (data.conversationState) {
          this.updateDebugInfo(data.conversationState);
        }
      } else {
        this.showMessage(`Error: ${data.error}`, 'system');
      }

      this.setLoading(false);
      this.disableSend(false);
    } catch (error) {
      this.showMessage(`Send error: ${error.message}`, 'system');
      this.setLoading(false);
      this.disableSend(false);
    }
  }

  async resetConversation() {
    if (!confirm('Reset conversation? This will delete all history.')) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/conversation/${this.phoneNumber}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        this.showMessage('Conversation reset successfully', 'system');
        this.clearChat();
        this.updateDebugInfo({
          currentState: 'collect_products',
          missingFields: ['products', 'quantities', 'deliveryDate', 'fulfillmentType', 'deliveryAddress', 'pickupTime'],
          products: [],
          collectedData: {}
        });
      } else {
        this.showMessage(`Reset error: ${data.error}`, 'system');
      }
    } catch (error) {
      this.showMessage(`Reset error: ${error.message}`, 'system');
    }
  }

  clearChat() {
    this.elements.chatMessages.innerHTML = '';
    this.showMessage('Chat cleared. Start a new conversation!', 'system');
  }

  exportConversation() {
    const messages = Array.from(this.elements.chatMessages.querySelectorAll('.message'))
      .map(msg => ({
        type: msg.classList.contains('user') ? 'user' : 'bot',
        content: msg.querySelector('.message-content').textContent,
        time: msg.querySelector('.message-time')?.textContent
      }));

    const exportData = {
      phoneNumber: this.phoneNumber,
      timestamp: new Date().toISOString(),
      messages: messages
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${this.phoneNumber}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  toggleDebug() {
    this.elements.debugContent.classList.toggle('collapsed');
    this.elements.toggleDebug.textContent = 
      this.elements.debugContent.classList.contains('collapsed') ? '▶' : '▼';
  }

  updateDebugInfo(state) {
    if (!state) return;

    this.elements.debugState.textContent = state.currentState || 'unknown';
    this.elements.debugMissingFields.textContent = 
      state.missingFields?.length > 0 ? state.missingFields.join(', ') : 'None';
    
    this.elements.debugProducts.textContent = 
      state.products?.length > 0 
        ? state.products.map(p => `${p.name} x${p.quantity}`).join('\n')
        : 'No products yet';
    
    this.elements.debugCollectedData.textContent = 
      JSON.stringify(state.collectedData, null, 2);
  }

  updateConnectionStatus(connected) {
    if (connected) {
      this.elements.connectionStatus.classList.add('connected');
      this.elements.connectionStatus.querySelector('.status-text').textContent = 'Connected';
    } else {
      this.elements.connectionStatus.classList.remove('connected');
      this.elements.connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
    }
  }

  enableControls(enabled) {
    this.elements.messageInput.disabled = !enabled;
    this.elements.sendBtn.disabled = !enabled;
    this.elements.resetBtn.disabled = !enabled;
    this.elements.clearBtn.disabled = !enabled;
    this.elements.exportBtn.disabled = !enabled;
  }

  disableSend(disabled) {
    this.elements.sendBtn.disabled = disabled;
    this.elements.messageInput.disabled = disabled;
  }

  setLoading(loading) {
    if (loading) {
      this.elements.chatMessages.classList.add('loading');
    } else {
      this.elements.chatMessages.classList.remove('loading');
    }
  }

  showMessage(text, type = 'bot') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (type === 'user' || type === 'bot') {
      messageDiv.appendChild(contentDiv);
      messageDiv.appendChild(timeDiv);
    } else {
      messageDiv.appendChild(contentDiv);
    }
    
    this.elements.chatMessages.appendChild(messageDiv);
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
  }

  loadConversationHistory(conversation) {
    if (!conversation.conversationHistory || conversation.conversationHistory.length === 0) {
      return;
    }

    conversation.conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        this.showMessage(msg.message, 'user');
      } else if (msg.role === 'assistant') {
        this.showMessage(msg.message, 'bot');
      }
    });

    // Update debug info
    this.updateDebugInfo({
      currentState: conversation.currentState,
      missingFields: conversation.missingFields,
      products: conversation.products,
      collectedData: {}
    });
  }

  savePhoneNumber() {
    localStorage.setItem('test_chat_phone', this.phoneNumber);
  }

  loadSavedPhoneNumber() {
    const saved = localStorage.getItem('test_chat_phone');
    if (saved) {
      this.elements.phoneNumber.value = saved;
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.chatInterface = new ChatTestingInterface();
});
```

---

### Phase 3: Configuration & Security

**Priority**: MEDIUM  
**Time**: 15 minutes  
**Files to Modify**: 2

#### 3.1 Environment Configuration

**File**: `server/.env.local` (Add)

```env
# Testing Interface Configuration
ENABLE_TESTING_INTERFACE=true
NODE_ENV=development
TESTING_AUTH_TOKEN=dev-test-token-change-in-production
```

#### 3.2 Add Basic Authentication (Optional)

**File**: `server/lib/routes/testing.route.ts` (Modify)

Add middleware before routes:

```typescript
// Simple auth middleware
const authMiddleware = (req: Request, res: Response, next: Function) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Testing interface disabled in production'
    });
  }

  const authHeader = req.headers.authorization;
  const expectedToken = process.env.TESTING_AUTH_TOKEN;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  next();
};

// Apply to all routes
router.use(authMiddleware);
```

---

### Phase 4: Testing & Documentation

**Priority**: MEDIUM  
**Time**: 30 minutes

#### 4.1 Test Scenarios

Create test cases for:

1. **New Order Flow**
   - Send products
   - Answer fulfillment type
   - Provide address
   - Provide date and time
   - Confirm order

2. **Edit Order Flow**
   - Select order to edit
   - Add/remove items
   - Confirm changes
   - Modify delivery details

3. **Edge Cases**
   - `/reset` command at various stages
   - Product modifications mid-flow
   - Ambiguous product clarification
   - Invalid inputs

4. **Debug Features**
   - State transitions
   - Missing fields updates
   - Product collection
   - Conversation history

#### 4.2 Usage Documentation

**File**: `server/TESTING_GUIDE.md` (Create)

```markdown
# Order Shop - Testing Interface Guide

## Quick Start

1. Start server: `npm run dev`
2. Open browser: `http://localhost:8080/test-chat.html`
3. Enter phone number (e.g., `+62895327367697`)
4. Click "Connect"
5. Start chatting!

## API Endpoints

### Send Message
```bash
POST http://localhost:8080/api/testing/chat
Content-Type: application/json

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

## Common Test Scenarios

### Scenario 1: New Order
```
User: chiffon 2, cheesecake 1
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

### Scenario 2: Reset Mid-Flow
```
User: chiffon 2
Bot: Mau ambil di toko atau dikirim?
User: /reset
Bot: ✅ Conversation reset! Mau pesan baru atau edit yang ada?
```

### Scenario 3: Product Modification
```
User: chiffon 2
Bot: Mau ambil di toko atau dikirim?
User: delivery, oh ya tambah brownies 1
Bot: 🛒 Keranjang updated... Alamat pengirimannya mana?
```
```

---

## File Structure Summary

```
server/
├── lib/
│   ├── routes/
│   │   └── testing.route.ts              # NEW - API endpoints
│   └── services/
│       └── testingChat.service.ts        # NEW - Business logic
├── public/
│   ├── test-chat.html                    # NEW - Web interface
│   ├── test-chat.css                     # NEW - Styling
│   └── test-chat.js                      # NEW - Frontend logic
├── TESTING_GUIDE.md                      # NEW - Documentation
├── server.ts                             # MODIFY - Register routes
└── .env.local                            # MODIFY - Add config
```

---

## Security Considerations

### ⚠️ IMPORTANT: Production Safety

1. **Disable in Production**
   - Check `NODE_ENV !== 'production'`
   - Use environment variable flag
   - Add authentication middleware

2. **Rate Limiting**
   - Implement request throttling
   - Prevent abuse during testing

3. **Data Isolation**
   - Test conversations use same DB as production
   - Consider separate test database
   - Regular cleanup of test data

4. **Access Control**
   - Simple token-based auth
   - IP whitelisting (optional)
   - Log all testing sessions

---

## Success Criteria

- ✅ Can send messages and receive responses
- ✅ Conversation state persists across messages
- ✅ Debug info shows accurate state
- ✅ `/reset` command works
- ✅ Multiple phone numbers can be tested simultaneously
- ✅ No Twilio costs incurred
- ✅ Interface is intuitive and easy to use
- ✅ All conversation flows can be tested

---

## Troubleshooting

### Common Issues

1. **"Cannot connect to API"**
   - Check server is running
   - Verify `ENABLE_TESTING_INTERFACE=true`
   - Check browser console for errors

2. **"Conversation not persisting"**
   - Verify MongoDB connection
   - Check phone number format consistency
   - Ensure same phone number is used

3. **"Debug info not updating"**
   - Check "Show Debug Info" checkbox
   - Verify API returns debug data
   - Check browser console for errors

4. **"Reset not working"**
   - Check MongoDB permissions
   - Verify phone number matches
   - Check server logs for errors

---

## Next Steps After Implementation

1. **Test All Conversation Flows**
   - New order flow
   - Edit order flow
   - `/reset` at all stages
   - Product modifications

2. **Document Bugs & Issues**
   - Export failing conversations
   - Check debug state
   - Report with conversation JSON

3. **Performance Testing**
   - Test with multiple simultaneous users
   - Monitor response times
   - Check memory usage

4. **Enhance Features** (Optional)
   - Add preset scenarios
   - Conversation comparison
   - Performance metrics
   - AI token usage tracking

---

## Contact & Support

For issues or questions:
- Check `TESTING_GUIDE.md`
- Review conversation debug info
- Export and share conversation JSON
- Check server logs for errors

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-02  
**Status**: Ready for Implementation

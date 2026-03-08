"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRouterService = void 0;
// Customer bot only: no bakesheet, waste, expiry, or stock – ordering and order updates only.
class MessageRouterService {
    constructor() {
        // Bakery agent name - selected: 'BakeBot'
        this.agentName = 'BakeBot';
        this.greetingPatterns = ['hi', 'hello', 'hey', 'menu', 'help'];
        this.agentNameVariations = ['bakebot', 'bake bot', 'bakery bot'];
    }
    // COMMENTED OUT: was routing "delivery" (and other keywords) to /stock, so user reply "Delivery" was ignored in order flow
    // private isStockAdditionMessage(message: string): boolean {
    //   const keywords = ['received', 'stock', 'delivery', 'arrived', 'new stock', 'just got'];
    //   return keywords.some(keyword => message.includes(keyword));
    // }
    /**
     * Check if message is a greeting
     * Only returns true if:
     * 1. Message is 3 words or less
     * 2. AND contains a greeting pattern or agent name as a whole word (not substring)
     */
    isGreeting(message) {
        const normalizedBody = message.toLowerCase().trim();
        const words = normalizedBody.split(/\s+/).filter(w => w.length > 0);
        // Must be 3 words or less
        if (words.length > 3) {
            return false;
        }
        // Match greeting patterns as whole words only (so "chiffon" doesn't match "hi")
        const wordSet = new Set(words);
        const hasGreetingPattern = this.greetingPatterns.some(pattern => wordSet.has(pattern));
        // Agent name can be multi-word; check if normalized body equals or contains it as phrase
        const hasAgentName = this.agentNameVariations.some(name => normalizedBody.includes(name));
        // Must have greeting pattern OR agent name
        return hasGreetingPattern || hasAgentName;
    }
    routeMessage(body, buttonId) {
        const normalizedBody = body.toLowerCase().trim();
        // Note: buttonId parameter kept for future use (button support not implemented yet)
        // if (buttonId) {
        //   return { type: 'button_click', buttonId, shouldCallAI: false };
        // }
        // 1. Check for greetings (strict: 3 words max + must contain greeting/agent name)
        if (this.isGreeting(body)) {
            return { type: 'greeting', shouldCallAI: false };
        }
        // 3. REMOVED: numbered menu 1–4 (bakesheet, waste, expiry, order). Single digits like "2" or "3"
        //    are now treated as order flow (e.g. selecting order #2 or #3 to edit). Customer bot = ordering only.
        // 4. Slash commands: only /order for customer bot. /bakesheet, /waste, /expiry disabled.
        if (body.startsWith('/')) {
            const [command, ...args] = body.slice(1).split(' ');
            const normalizedCommand = command === 'batch' ? 'bakesheet' : command;
            const allowedCommands = ['order'];
            if (allowedCommands.includes(normalizedCommand)) {
                return {
                    type: 'command',
                    command: 'order',
                    args: args.join(' '),
                    shouldCallAI: true
                };
            }
        }
        // 5. COMMENTED OUT: natural-language stock routing – "delivery" was wrongly sent to /stock and broke order flow
        // if (this.isStockAdditionMessage(normalizedBody)) {
        //   return {
        //     type: 'command',
        //     command: 'stock',
        //     args: body,
        //     shouldCallAI: true
        //   };
        // }
        // 6. Default: treat as order (existing behavior - no change)
        // This means if user just sends "chiffon 1 cheesecake 1" without any command,
        // it will be processed as a regular order (current behavior)
        return { type: 'order', shouldCallAI: true };
    }
    getAgentName() {
        return this.agentName;
    }
}
exports.MessageRouterService = MessageRouterService;

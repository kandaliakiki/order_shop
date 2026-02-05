"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRouterService = void 0;
class MessageRouterService {
    constructor() {
        // Bakery agent name - selected: 'BakeBot'
        this.agentName = 'BakeBot';
        this.greetingPatterns = ['hi', 'hello', 'hey', 'menu', 'help'];
        this.agentNameVariations = ['bakebot', 'bake bot', 'bakery bot'];
    }
    isStockAdditionMessage(message) {
        const keywords = ['received', 'stock', 'delivery', 'arrived', 'new stock', 'just got'];
        return keywords.some(keyword => message.includes(keyword));
    }
    /**
     * Check if message is a greeting
     * Only returns true if:
     * 1. Message is 3 words or less
     * 2. AND contains a greeting pattern or agent name
     */
    isGreeting(message) {
        const normalizedBody = message.toLowerCase().trim();
        const words = normalizedBody.split(/\s+/).filter(w => w.length > 0);
        // Must be 3 words or less
        if (words.length > 3) {
            return false;
        }
        // Check if contains greeting pattern
        const hasGreetingPattern = this.greetingPatterns.some(pattern => normalizedBody.includes(pattern));
        // Check if contains agent name
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
        // 3. Check for numbered menu responses (Option C - not selected but code ready)
        if (/^[1-4]$/.test(normalizedBody)) {
            const menuMap = {
                '1': 'bakesheet',
                '2': 'waste',
                '3': 'expiry',
                '4': 'order',
            };
            return {
                type: 'command',
                command: menuMap[normalizedBody],
                args: '',
                shouldCallAI: true,
            };
        }
        // 4. Check for slash commands
        if (body.startsWith('/')) {
            const [command, ...args] = body.slice(1).split(' ');
            // Support both 'bakesheet' (new) and 'batch' (legacy) for backward compatibility
            const normalizedCommand = command === 'batch' ? 'bakesheet' : command;
            if (['order', 'bakesheet', 'waste', 'expiry', 'stock', 'addstock'].includes(normalizedCommand)) {
                const finalCommand = normalizedCommand === 'addstock' ? 'stock' : normalizedCommand;
                return {
                    type: 'command',
                    command: finalCommand,
                    args: args.join(' '),
                    shouldCallAI: true
                };
            }
        }
        // 5. Check for natural language stock addition keywords
        if (this.isStockAdditionMessage(normalizedBody)) {
            return {
                type: 'command',
                command: 'stock',
                args: body,
                shouldCallAI: true
            };
        }
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

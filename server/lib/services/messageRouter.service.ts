export type MessageRoute =
  | { type: 'greeting'; shouldCallAI: false }
  | { type: 'command'; command: 'order' | 'bakesheet' | 'waste' | 'expiry' | 'stock'; args: string; shouldCallAI: true }
  | { type: 'order'; shouldCallAI: true }; // Regular message treated as order

export class MessageRouterService {
  // Bakery agent name - selected: 'BakeBot'
  private agentName = 'BakeBot';
  private greetingPatterns = ['hi', 'hello', 'hey', 'menu', 'help'];
  private agentNameVariations = ['bakebot', 'bake bot', 'bakery bot'];
  
  private isStockAdditionMessage(message: string): boolean {
    const keywords = ['received', 'stock', 'delivery', 'arrived', 'new stock', 'just got'];
    return keywords.some(keyword => message.includes(keyword));
  }
  
  /**
   * Check if message is a greeting
   * Only returns true if:
   * 1. Message is 3 words or less
   * 2. AND contains a greeting pattern or agent name as a whole word (not substring)
   */
  private isGreeting(message: string): boolean {
    const normalizedBody = message.toLowerCase().trim();
    const words = normalizedBody.split(/\s+/).filter(w => w.length > 0);
    
    // Must be 3 words or less
    if (words.length > 3) {
      return false;
    }
    
    // Match greeting patterns as whole words only (so "chiffon" doesn't match "hi")
    const wordSet = new Set(words);
    const hasGreetingPattern = this.greetingPatterns.some(pattern => 
      wordSet.has(pattern)
    );
    
    // Agent name can be multi-word; check if normalized body equals or contains it as phrase
    const hasAgentName = this.agentNameVariations.some(name => 
      normalizedBody.includes(name)
    );
    
    // Must have greeting pattern OR agent name
    return hasGreetingPattern || hasAgentName;
  }
  
  routeMessage(body: string, buttonId?: string): MessageRoute {
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
      const menuMap: Record<string, 'order' | 'bakesheet' | 'waste' | 'expiry'> = {
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
          command: finalCommand as 'order' | 'bakesheet' | 'waste' | 'expiry' | 'stock',
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

  getAgentName(): string {
    return this.agentName;
  }
}

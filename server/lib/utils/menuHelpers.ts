// Bakery agent name - selected: 'BakeBot'
export const AGENT_NAME = 'BakeBot';

// Option A: Text menu with full commands (SELECTED FOR MVP)
export function getGreetingMenu(): string {
  return `🍰 *Welcome to ${AGENT_NAME}!*

What would you like to do?

1️⃣ *Bake Sheet* - Type: /bakesheet [today/tomorrow/date]
2️⃣ *Add Stock* - Type: /stock [quantity] [ingredient]
3️⃣ *Log Waste* - Type: /waste [item] [quantity] [reason]
4️⃣ *Check Expiry* - Type: /expiry [item?]
5️⃣ *Add Order* - Type: /order [your order details]

Or simply send your order without /order! 📝`;
}

// Button click handlers (if using Option B - Twilio Content Templates)
export async function handleButtonClick(
  buttonId: string,
  whatsappNumber: string
): Promise<string> {
  const buttonMap: Record<string, () => Promise<string>> = {
    'cmd_bakesheet': async () => {
      return `📋 *Bake Sheet*\n\nType:\n/bakesheet [today/tomorrow/date]\n\nExample: /bakesheet today\nOr: /bakesheet next 3 days`;
    },
    'cmd_waste': async () => {
      return `🗑️ *Log Waste*\n\nType:\n/waste [item] [quantity] [reason]\n\nExample: /waste 5 croissants burnt`;
    },
    'cmd_expiry': async () => {
      return `📅 *Check Expiry*\n\nType:\n/expiry [item?]\n\nExample: /expiry flour\nOr just /expiry for top 5 expiring items`;
    },
    'cmd_order': async () => {
      return `📝 *Add Order*\n\nType:\n/order [your order details]\n\nExample: /order chiffon 1 cheesecake 1\n\nOr simply send your order without /order!`;
    },
  };
  
  const handler = buttonMap[buttonId];
  if (handler) {
    return await handler();
  }
  
  return '❌ Unknown command. Type "menu" to see options.';
}

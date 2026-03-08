/**
 * Customer bot: only /order is routed here. Bakesheet, waste, expiry, add stock
 * are disabled (see lib/ADMIN_LOGIC_README.md). All order flow uses ConversationManager in webhook.
 */
import { processWhatsAppMessageForOrder } from "./whatsappOrderProcessing.action";

export async function handleCommand(
  _command: "order",
  args: string,
  _whatsappNumber: string,
  _messageId: string
): Promise<string> {
  // Only "order" is used for customer bot; handled via ConversationManager in webhook.
  // Admin commands (bakesheet, waste, expiry, stock) are in adminLogic/ and disabled.
  return '❌ Unknown command. Balas "menu" atau "hi" untuk memesan.';
}

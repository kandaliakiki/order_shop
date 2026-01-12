import { IngredientRequirement } from "./ingredientStockCalculation.service";

export class WhatsAppMessageFormatter {
  /**
   * Format order confirmation message (when all ingredients are sufficient)
   * Customer-friendly message
   */
  formatOrderConfirmationMessage(orderId: string): string {
    return (
      `✅ *Order Confirmed*\n\n` +
      `Your order ${orderId} has been confirmed!\n\n` +
      `All ingredients are available and your order is being processed.\n\n` +
      `We'll notify you once your order is ready.\n\n` +
      `Thank you for your order!`
    );
  }

  /**
   * Format out-of-stock message (when ingredients are insufficient)
   * Customer-friendly message
   */
  formatOutOfStockMessage(
    orderId: string,
    insufficientIngredients: IngredientRequirement[]
  ): string {
    let message = `⚠️ *Order ${orderId} - Stock Alert*\n\n`;
    message += `We've received your order, but some ingredients are currently out of stock:\n\n`;

    for (const ingredient of insufficientIngredients) {
      message += `• *${ingredient.ingredientName}*\n`;
      message += `  Required: ${ingredient.requiredQuantity} ${ingredient.unit}\n`;
      message += `  Available: ${ingredient.currentStock} ${ingredient.unit}\n`;
      message += `  Shortage: *${ingredient.shortage} ${ingredient.unit}*\n\n`;
    }

    message += `Your order has been marked as "Pending" and will be processed once we restock the ingredients.\n\n`;
    message += `We'll notify you once the ingredients are available. Thank you for your understanding!`;

    return message;
  }
}

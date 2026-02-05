"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppMessageFormatter = void 0;
class WhatsAppMessageFormatter {
    /**
     * Format order confirmation message (when all ingredients are sufficient)
     * Message for store owner/bakery manager
     * Includes lot usage details if available
     */
    formatOrderConfirmationMessage(orderId, lotUsageMetadata, frontendBaseUrl) {
        let message = `✅ *New Order Received*\n\n`;
        message += `Order ID: *${orderId}*\n`;
        message += `Status: New Order\n\n`;
        message += `✅ All ingredients are sufficient. Stock has been deducted.\n\n`;
        // Add lot usage details if available
        if (lotUsageMetadata && lotUsageMetadata.lotsUsed.length > 0) {
            message += `*Lots Used (FEFO):*\n\n`;
            // Group lots by ingredient
            const lotsByIngredient = new Map();
            for (const lot of lotUsageMetadata.lotsUsed) {
                if (!lotsByIngredient.has(lot.ingredientName)) {
                    lotsByIngredient.set(lot.ingredientName, []);
                }
                lotsByIngredient.get(lot.ingredientName).push(lot);
            }
            // Format each ingredient's lots
            for (const [ingredientName, lots] of lotsByIngredient.entries()) {
                message += `• *${ingredientName}*\n`;
                for (const lot of lots) {
                    const statusEmoji = lot.status === "fully_used" ? "✓" : "◐";
                    const statusText = lot.status === "fully_used" ? "Fully Used" : "Partially Used";
                    message += `  ${statusEmoji} ${lot.lotNumber}: ${lot.quantityUsed} ${lot.unit} (${statusText})\n`;
                }
                message += `\n`;
            }
        }
        // Add clickable link if frontend URL is provided
        if (frontendBaseUrl) {
            // Remove trailing slash if present
            const baseUrl = frontendBaseUrl.replace(/\/$/, "");
            const orderUrl = `${baseUrl}/order/${orderId}`;
            message += `📱 View full details: ${orderUrl}`;
        }
        else {
            message += `You can view full details in the POS system.`;
        }
        return message;
    }
    /**
     * Format out-of-stock message (when ingredients are insufficient)
     * Message for store owner/bakery manager
     */
    formatOutOfStockMessage(orderId, insufficientIngredients) {
        let message = `⚠️ *Order ${orderId} - Insufficient Stock*\n\n`;
        message += `Order received but marked as *Pending* due to insufficient ingredients:\n\n`;
        for (const ingredient of insufficientIngredients) {
            message += `• *${ingredient.ingredientName}*\n`;
            message += `  Required: ${ingredient.requiredQuantity} ${ingredient.unit}\n`;
            message += `  Available: ${ingredient.currentStock} ${ingredient.unit}\n`;
            message += `  Shortage: *${ingredient.shortage} ${ingredient.unit}*\n\n`;
        }
        message += `⚠️ Stock was NOT deducted. Order status: *Pending*\n\n`;
        message += `Please restock and process the order manually, or it will be processed automatically once stock is available.`;
        return message;
    }
}
exports.WhatsAppMessageFormatter = WhatsAppMessageFormatter;

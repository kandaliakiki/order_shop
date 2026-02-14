import { BakeSheetService } from "../services/bakeSheet.service";
import { WasteLoggingService } from "../services/wasteLogging.service";
import { ExpiryCheckService } from "../services/expiryCheck.service";
// import { StockAdditionService } from "../services/stockAddition.service"; // COMMENTED: /stock disabled to avoid "delivery" etc. breaking order flow
import { processWhatsAppMessageForOrder } from "./whatsappOrderProcessing.action";

export async function handleCommand(
  command: "bakesheet" | "waste" | "expiry",
  args: string,
  whatsappNumber: string,
  messageId: string
): Promise<string> {
  try {
    switch (command) {
      case "bakesheet":
        const bakeSheetService = new BakeSheetService();
        const bakeSheetResult = await bakeSheetService.processBakeSheetCommand(
          args,
          whatsappNumber
        );
        return bakeSheetResult.message;

      case "waste":
        const wasteService = new WasteLoggingService();
        const wasteResult = await wasteService.processWasteCommand(
          args,
          whatsappNumber
        );
        return wasteResult.message;

      case "expiry":
        const expiryService = new ExpiryCheckService();
        const expiryResult = await expiryService.processExpiryCommand(
          args.trim() || undefined
        );
        return expiryResult.message;

      // COMMENTED OUT: /stock was intercepting "Delivery" and other messages; re-enable when needed
      // case "stock":
      //   const stockService = new StockAdditionService();
      //   const stockResult = await stockService.processStockAddition(
      //     args,
      //     whatsappNumber
      //   );
      //   return stockResult.message;

      default:
        return '❌ Unknown command. Type "menu" to see options.';
    }
  } catch (error: any) {
    console.error(`Error handling /${command} command:`, error);
    return `❌ Error processing /${command} command: ${error.message}`;
  }
}

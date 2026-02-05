import { connectToDB } from "../mongoose";
import { generateBakeSheetFromOrders } from "../actions/bakeSheet.action";
import { format, addDays } from "date-fns";

export interface BakeSheetResult {
  success: boolean;
  bakeSheet?: any;
  message: string;
}

export class BakeSheetService {
  async processBakeSheetCommand(
    dateInput: string,
    whatsappNumber: string
  ): Promise<BakeSheetResult> {
    try {
      await connectToDB();

      // 1. Parse date input (simple: "today", "tomorrow", or "YYYY-MM-DD")
      let targetDate: string | undefined;
      if (dateInput) {
        const lower = dateInput.toLowerCase().trim();
        if (lower === "today") {
          targetDate = format(new Date(), "yyyy-MM-dd");
        } else if (lower === "tomorrow") {
          targetDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
        } else {
          // Try to parse as date, or use as-is
          targetDate = dateInput;
        }
      }

      // 2. Generate bake sheet (real-time, no storage)
      const bakeSheet = await generateBakeSheetFromOrders(targetDate, targetDate);

      // 3. Format as WhatsApp message
      const dateDisplay = bakeSheet.dateRange.start === bakeSheet.dateRange.end
        ? bakeSheet.dateRange.start
        : `${bakeSheet.dateRange.start} to ${bakeSheet.dateRange.end}`;
      let message = `📋 *Daily Bake Sheet - ${dateDisplay}*\n\n`;
      message += `*Total Orders:* ${bakeSheet.totalOrders}\n\n`;

      // Products needed
      if (bakeSheet.items.length > 0) {
        message += `*Products Needed:*\n`;
        bakeSheet.items.forEach((item) => {
          message += `• ${item.productName}: ${item.quantity}\n`;
        });
        message += `\n`;
      } else {
        message += `No orders for this date.\n\n`;
      }

      // Stock status
      const insufficient = bakeSheet.stockChecks.filter((s) => !s.sufficient);
      if (insufficient.length === 0) {
        message += `*Stock Status:* ✅ All ingredients sufficient\n`;
      } else {
        message += `*Stock Status:* ⚠️ Insufficient:\n`;
        insufficient.forEach((i) => {
          message += `• ${i.name}: Need ${i.needed} ${i.unit}, Have ${i.available} ${i.unit}\n`;
        });
      }

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      console.error("Error processing bake sheet command:", error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
      };
    }
  }
}

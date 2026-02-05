import { connectToDB } from "../mongoose";
import { generateBakeSheetFromOrders } from "../actions/bakeSheet.action";
import { format } from "date-fns";
import { AIService } from "./ai.service";

export interface BakeSheetResult {
  success: boolean;
  bakeSheet?: any;
  message: string;
}

export class BakeSheetService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async processBakeSheetCommand(
    dateInput: string,
    whatsappNumber: string
  ): Promise<BakeSheetResult> {
    try {
      await connectToDB();

      // 1. Parse date input using AI for complex date ranges
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (dateInput && dateInput.trim()) {
        try {
          // Use AI to parse natural language date ranges
          const parsed = await this.aiService.parseDateRange(dateInput.trim());
          startDate = parsed.dateRange.start;
          endDate = parsed.dateRange.end;
        } catch (error) {
          console.error("AI date parsing failed, trying simple parsing:", error);
          // Fallback to simple parsing
          const lower = dateInput.toLowerCase().trim();
          if (lower === "today") {
            startDate = format(new Date(), "yyyy-MM-dd");
            endDate = startDate;
          } else if (lower === "tomorrow") {
            startDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
            endDate = startDate;
          } else {
            // Try to use as-is (might be YYYY-MM-DD format)
            startDate = dateInput;
            endDate = dateInput;
          }
        }
      } else {
        // Default to today
        startDate = format(new Date(), "yyyy-MM-dd");
        endDate = startDate;
      }

      // 2. Generate bake sheet (real-time, no storage)
      const bakeSheet = await generateBakeSheetFromOrders(startDate, endDate);

      // 3. Format as WhatsApp message with detailed breakdown
      const dateDisplay = bakeSheet.dateRange.start === bakeSheet.dateRange.end
        ? bakeSheet.dateRange.start
        : `${bakeSheet.dateRange.start} to ${bakeSheet.dateRange.end}`;
      let message = `📋 *Daily Bake Sheet - ${dateDisplay}*\n\n`;
      message += `*Total Orders:* ${bakeSheet.totalOrders}\n\n`;

      // If there's a daily breakdown (date range), show it
      if (bakeSheet.dailyBreakdown && bakeSheet.dailyBreakdown.length > 0) {
        message += `*Daily Breakdown:*\n\n`;
        bakeSheet.dailyBreakdown.forEach((day) => {
          message += `📅 *${day.date}* (${day.orders} order${day.orders !== 1 ? 's' : ''})\n`;
          
          // Products for this day
          if (day.items && day.items.length > 0) {
            message += `  *Products:*\n`;
            day.items.forEach((item) => {
              message += `  • ${item.productName}: ${item.quantity}\n`;
            });
          }
          
          // Ingredients for this day
          if (day.ingredientRequirements && day.ingredientRequirements.length > 0) {
            message += `  *Ingredients Needed:*\n`;
            day.ingredientRequirements.forEach((ing) => {
              message += `  • ${ing.ingredientName}: ${ing.quantity} ${ing.unit}\n`;
            });
          }
          message += `\n`;
        });
      } else {
        // Single date or no daily breakdown - show overall summary
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

        // Ingredient requirements - need to fetch ingredient names
        if (bakeSheet.ingredientRequirements && bakeSheet.ingredientRequirements.length > 0) {
          const Ingredient = (await import("../models/ingredient.model")).default;
          message += `*Ingredients Needed:*\n`;
          for (const ing of bakeSheet.ingredientRequirements) {
            const ingredient = await Ingredient.findById(ing.ingredientId).lean() as any;
            const ingredientName = ingredient?.name || 'Unknown';
            message += `• ${ingredientName}: ${ing.quantity} ${ing.unit}\n`;
          }
          message += `\n`;
        }
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

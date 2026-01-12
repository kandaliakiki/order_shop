import { fetchOrderById } from "./order.action";
import { IngredientStockCalculationService } from "../services/ingredientStockCalculation.service";

export async function calculateOrderStockRequirements(orderId: string) {
  const order = await fetchOrderById(orderId);
  const service = new IngredientStockCalculationService();
  return await service.calculateOrderIngredientRequirements(order);
}

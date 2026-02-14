"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/constants";

interface OrderDetail {
  _id: string;
  orderId: string;
  customerName: string;
  phoneNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  pickupDate?: string; // Optional pickup/delivery date
  source?: string;
  whatsappNumber?: string;
  deliveryAddress?: string;
  fulfillmentType?: "pickup" | "delivery";
  pickupTime?: string;
}

interface IngredientRequirement {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  requiredQuantity: number;
  currentStock: number;
  minimumStock: number;
  isSufficient: boolean;
  shortage: number;
}

interface StockCalculationResult {
  orderId: string;
  allIngredientsSufficient: boolean;
  requirements: IngredientRequirement[];
  warnings: string[];
  isHistorical?: boolean;
  calculatedAt?: string;
}

interface LotUsageInfo {
  lotId: string;
  lotNumber: string;
  ingredientId: string;
  ingredientName: string;
  quantityUsed: number;
  unit: string;
  expiryDate: string;
  deductedAt: string;
  status: "fully_used" | "partially_used";
}

interface LotUsageMetadata {
  lotsUsed: LotUsageInfo[];
  deductedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [stockCalculation, setStockCalculation] =
    useState<StockCalculationResult | null>(null);
  const [lotUsage, setLotUsage] = useState<LotUsageMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
    fetchStockCalculation();
    fetchLotUsage();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/order/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockCalculation = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(
        `${backendUrl}/api/order/${orderId}/stock-calculation`
      );
      if (!response.ok) throw new Error("Failed to fetch stock calculation");
      const data = await response.json();
      setStockCalculation(data);
    } catch (error) {
      console.error("Error fetching stock calculation:", error);
    }
  };

  const fetchLotUsage = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/order/${orderId}/lots`);
      if (!response.ok) throw new Error("Failed to fetch lot usage");
      const data = await response.json();
      setLotUsage(data);
    } catch (error) {
      console.error("Error fetching lot usage:", error);
    }
  };

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  if (!order) {
    return <div className="p-5">Order not found</div>;
  }

  return (
    <div className="p-3 md:p-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 mb-4 md:mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="text-sm md:text-base">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl md:text-2xl font-bold dark:text-white">Order Details</h1>
        <Badge variant="outline" className="text-xs md:text-sm">{order.orderId}</Badge>
      </div>

      {/* Stock Warnings */}
      {stockCalculation && !stockCalculation.allIngredientsSufficient && (
        <Alert variant="destructive" className="mb-4 md:mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm md:text-base">Insufficient Stock</AlertTitle>
          <AlertDescription className="text-xs md:text-sm">
            Some ingredients are not available in sufficient quantities:
            <ul className="mt-2 list-disc list-inside space-y-1">
              {stockCalculation.requirements
                .filter((r) => !r.isSufficient)
                .map((r) => (
                  <li key={r.ingredientId}>
                    <strong>{r.ingredientName}</strong>: Need{" "}
                    {r.requiredQuantity} {r.unit}, but only {r.currentStock}{" "}
                    {r.unit} available. Shortage:{" "}
                    <strong>
                      {r.shortage} {r.unit}
                    </strong>
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {stockCalculation && stockCalculation.allIngredientsSufficient && (
        <Alert className="mb-4 md:mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-sm md:text-base text-green-800 dark:text-green-300">
            All Ingredients Available
          </AlertTitle>
          <AlertDescription className="text-xs md:text-sm text-green-700 dark:text-green-400">
            All required ingredients are available in sufficient quantities.
          </AlertDescription>
        </Alert>
      )}

      {/* Historical Data Indicator */}
      {stockCalculation && stockCalculation.isHistorical && (
        <Alert className="mb-4 md:mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertTitle className="text-sm md:text-base text-blue-800 dark:text-blue-300">Historical Stock Data</AlertTitle>
          <AlertDescription className="text-xs md:text-sm text-blue-700 dark:text-blue-400">
            This shows the stock levels at the time the order was created
            {stockCalculation.calculatedAt &&
              ` (${format(
                new Date(stockCalculation.calculatedAt),
                "PPpp"
              )})`}
            . Current stock levels may differ.
          </AlertDescription>
        </Alert>
      )}

      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Name:</strong> {order.customerName}
            </p>
            <p>
              <strong>Phone:</strong> {order.phoneNumber}
            </p>
            <p>
              <strong>Order Date:</strong> {format(new Date(order.createdAt), "PPpp")}
            </p>
            {order.pickupDate && (
              <p>
                <strong>Pickup Date:</strong> {format(new Date(order.pickupDate), "PPP")}
              </p>
            )}
            {order.fulfillmentType && (
              <p>
                <strong>Fulfillment:</strong>{" "}
                {order.fulfillmentType === "pickup" ? "Pickup (ambil di toko)" : "Delivery (dikirim)"}
              </p>
            )}
            {order.pickupTime && (
              <p>
                <strong>Pickup/Delivery Time:</strong> {order.pickupTime}
              </p>
            )}
            {order.deliveryAddress && (
              <p>
                <strong>Delivery Address:</strong> {order.deliveryAddress}
              </p>
            )}
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            {order.source && (
              <p>
                <strong>Source:</strong> {order.source}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-bold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Requirements */}
      {stockCalculation && (
        <Card>
          <CardHeader>
            <CardTitle>Ingredient Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {stockCalculation.warnings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800 mb-2">Warnings:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {stockCalculation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {stockCalculation.requirements.map((req) => (
                <div
                  key={req.ingredientId}
                  className={`p-4 rounded-lg border ${
                    req.isSufficient
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold dark:text-white">{req.ingredientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Required: {req.requiredQuantity} {req.unit}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Available: {req.currentStock} {req.unit}
                      </p>
                    </div>
                    <Badge
                      variant={req.isSufficient ? "default" : "destructive"}
                    >
                      {req.isSufficient
                        ? "Sufficient"
                        : `Shortage: ${req.shortage} ${req.unit}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lots Used */}
      {lotUsage && lotUsage.lotsUsed && lotUsage.lotsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lots Used</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Deducted at: {format(new Date(lotUsage.deductedAt), "PPpp")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lotUsage.lotsUsed.map((lot, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold dark:text-white">{lot.ingredientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Lot: <span className="font-mono">{lot.lotNumber}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Quantity Used: {lot.quantityUsed} {lot.unit}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Expiry: {format(new Date(lot.expiryDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={lot.status === "fully_used" ? "destructive" : "outline"}
                    >
                      {lot.status === "fully_used" ? "Fully Used" : "Partially Used"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

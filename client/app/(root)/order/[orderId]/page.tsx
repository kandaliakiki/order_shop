"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  source?: string;
  whatsappNumber?: string;
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [stockCalculation, setStockCalculation] =
    useState<StockCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
    fetchStockCalculation();
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

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  if (!order) {
    return <div className="p-5">Order not found</div>;
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Badge variant="outline">{order.orderId}</Badge>
      </div>

      {/* Stock Warnings */}
      {stockCalculation && !stockCalculation.allIngredientsSufficient && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Insufficient Stock</AlertTitle>
          <AlertDescription>
            Some ingredients are not available in sufficient quantities:
            <ul className="mt-2 list-disc list-inside">
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
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            All Ingredients Available
          </AlertTitle>
          <AlertDescription className="text-green-700">
            All required ingredients are available in sufficient quantities.
          </AlertDescription>
        </Alert>
      )}

      {/* Historical Data Indicator */}
      {stockCalculation && stockCalculation.isHistorical && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Historical Stock Data</AlertTitle>
          <AlertDescription className="text-blue-700">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            {order.whatsappNumber && (
              <p>
                <strong>WhatsApp:</strong> {order.whatsappNumber}
              </p>
            )}
            <p>
              <strong>Date:</strong> {format(new Date(order.createdAt), "PPpp")}
            </p>
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
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
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
                  ${(item.price * item.quantity).toFixed(2)}
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
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{req.ingredientName}</p>
                      <p className="text-sm text-gray-600">
                        Required: {req.requiredQuantity} {req.unit}
                      </p>
                      <p className="text-sm text-gray-600">
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
    </div>
  );
}

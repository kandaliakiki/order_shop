"use client";

import { useState } from "react";
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Order status types
type OrderStatus = "new" | "processing" | "completed" | "cancelled";

// Order item type
type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

// Order type
type Order = {
  id: string;
  status: OrderStatus;
  timestamp: string;
  items: OrderItem[];
  total: number;
};

export function OrderManagement() {
  // Sample orders data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      status: "new",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Spaghetti Bolognese", price: 12.0, quantity: 1 },
        { name: "Garlic Bread", price: 3.5, quantity: 1 },
        { name: "Caesar Salad", price: 3.5, quantity: 2 },
      ],
      total: 22.5,
    },
    {
      id: "ORD-002",
      status: "new",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Pepperoni Pizza", price: 11.0, quantity: 1 },
        { name: "Mozzarella Sticks", price: 5.0, quantity: 1 },
        { name: "Garden Salad", price: 4.5, quantity: 1 },
      ],
      total: 20.5,
    },
    {
      id: "ORD-003",
      status: "new",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Hawaiian Pizza", price: 13.0, quantity: 1 },
        { name: "Stuffed Mushrooms", price: 5.0, quantity: 1 },
        { name: "Caesar Salad", price: 3.5, quantity: 1 },
      ],
      total: 21.5,
    },
    {
      id: "ORD-004",
      status: "processing",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "BBQ Chicken Pizza", price: 13.0, quantity: 1 },
        { name: "Cheesy Bread", price: 4.0, quantity: 1 },
        { name: "Caprese Salad", price: 5.5, quantity: 1 },
      ],
      total: 22.5,
    },
    {
      id: "ORD-005",
      status: "processing",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Margherita Pizza", price: 10.0, quantity: 1 },
        { name: "Bruschetta", price: 4.5, quantity: 1 },
        { name: "Greek Salad", price: 5.0, quantity: 1 },
      ],
      total: 19.5,
    },
    {
      id: "ORD-006",
      status: "completed",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Lasagna", price: 15.0, quantity: 1 },
        { name: "Garlic Knots", price: 3.0, quantity: 1 },
        { name: "House Salad", price: 4.0, quantity: 1 },
      ],
      total: 22.0,
    },
    {
      id: "ORD-007",
      status: "completed",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Meat Lovers Pizza", price: 14.0, quantity: 1 },
        { name: "Buffalo Wings", price: 6.0, quantity: 1 },
        { name: "Coleslaw", price: 3.0, quantity: 1 },
      ],
      total: 23.0,
    },
    {
      id: "ORD-008",
      status: "cancelled",
      timestamp: "03:49 PM, 07 May, 2025",
      items: [
        { name: "Chicken Alfredo", price: 14.0, quantity: 1 },
        { name: "Breadsticks", price: 2.5, quantity: 1 },
        { name: "Caesar Salad", price: 3.5, quantity: 1 },
      ],
      total: 20.0,
    },
  ]);

  // State for status change confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: OrderStatus;
    newStatus: OrderStatus;
  }>({
    isOpen: false,
    orderId: "",
    currentStatus: "new",
    newStatus: "new",
  });

  // State for filter
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Function to open confirmation dialog
  const openConfirmDialog = (
    orderId: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => {
    setConfirmDialog({
      isOpen: true,
      orderId,
      currentStatus,
      newStatus,
    });
  };

  // Function to close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      isOpen: false,
    });
  };

  // Function to change order status
  const changeOrderStatus = () => {
    const { orderId, newStatus } = confirmDialog;

    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    closeConfirmDialog();
  };

  // Function to get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "new":
        return "bg-sky-100 text-sky-800 hover:bg-sky-200";
      case "processing":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
    }
  };

  // Function to get status display text
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "new":
        return "New Order";
      case "processing":
        return "On Process";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4 mr-1" />;
      case "processing":
        return <ArrowRight className="w-4 h-4 mr-1" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 mr-1" />;
    }
  };

  // Function to get available status transitions
  const getAvailableStatusTransitions = (
    currentStatus: OrderStatus
  ): OrderStatus[] => {
    switch (currentStatus) {
      case "new":
        return ["processing", "cancelled"];
      case "processing":
        return ["completed", "cancelled"];
      case "completed":
        return [];
      case "cancelled":
        return [];
    }
  };

  // Function to get confirmation message
  const getConfirmationMessage = (
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => {
    return `Are you sure you want to change the order status from "${getStatusText(
      currentStatus
    )}" to "${getStatusText(newStatus)}"?`;
  };

  // Filter orders based on selected status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter:{" "}
                {statusFilter === "all"
                  ? "All Orders"
                  : getStatusText(statusFilter)}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Orders
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("new")}>
                <Clock className="w-4 h-4 mr-2" />
                New Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                <ArrowRight className="w-4 h-4 mr-2" />
                On Process
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md overflow-hidden group relative"
          >
            {/* Status Badge */}
            <div className="flex justify-between items-center p-3 border-b">
              <Badge
                className={cn(
                  "flex items-center",
                  getStatusColor(order.status)
                )}
              >
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </Badge>

              {/* Status Change Dropdown - Only visible on hover if status can be changed */}
              {getAvailableStatusTransitions(order.status).length > 0 && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Change Status
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {getAvailableStatusTransitions(order.status).map(
                        (newStatus) => (
                          <DropdownMenuItem
                            key={newStatus}
                            onClick={() =>
                              openConfirmDialog(
                                order.id,
                                order.status,
                                newStatus
                              )
                            }
                            className="flex items-center"
                          >
                            {getStatusIcon(newStatus)}
                            {getStatusText(newStatus)}
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="p-3">
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <Clock className="w-4 h-4 mr-1" />
                {order.timestamp}
              </div>

              <div className="flex justify-between font-semibold mb-3">
                <div>{order.items.length} Items</div>
                <div>${order.total.toFixed(2)}</div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      {item.quantity} {item.name}
                    </div>
                    <div>${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {confirmDialog.isOpen &&
                getConfirmationMessage(
                  confirmDialog.currentStatus,
                  confirmDialog.newStatus
                )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "flex items-center",
                  getStatusColor(confirmDialog.currentStatus)
                )}
              >
                {getStatusIcon(confirmDialog.currentStatus)}
                {getStatusText(confirmDialog.currentStatus)}
              </Badge>
              <ArrowRight className="w-4 h-4" />
              <Badge
                className={cn(
                  "flex items-center",
                  getStatusColor(confirmDialog.newStatus)
                )}
              >
                {getStatusIcon(confirmDialog.newStatus)}
                {getStatusText(confirmDialog.newStatus)}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>
              Cancel
            </Button>
            <Button
              onClick={changeOrderStatus}
              variant={
                confirmDialog.newStatus === "cancelled"
                  ? "destructive"
                  : "default"
              }
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

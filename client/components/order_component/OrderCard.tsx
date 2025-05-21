import { getStatusColor, Order, OrderStatus } from "@/constants";
import Image from "next/image";
import React, { useState } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { DialogDescription, DialogFooter } from "../ui/dialog";
import { DialogTitle } from "../ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { DialogContent } from "../ui/dialog";
import { Dialog } from "../ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  // Format the createdAt date
  const formattedCreatedAtDate = format(
    new Date(order.createdAt),
    "hh:mm a, dd MMM, yyyy"
  );

  const getAvailableStatusTransitions = (
    currentStatus: OrderStatus
  ): OrderStatus[] => {
    switch (currentStatus) {
      case "New Order":
        return ["On Process", "Cancelled"];
      case "On Process":
        return ["Completed", "Cancelled"];
      case "Completed":
        return [];
      case "Cancelled":
        return [];
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "New Order":
        return <Clock className="w-4 h-4 mr-1" />;
      case "On Process":
        return <ArrowRight className="w-4 h-4 mr-1" />;
      case "Completed":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 mr-1" />;
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: OrderStatus;
    newStatus: OrderStatus;
  }>({
    isOpen: false,
    orderId: "",
    currentStatus: "New Order",
    newStatus: "New Order",
  });

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
    onStatusChange(orderId, newStatus);

    closeConfirmDialog();
  };

  const getConfirmationMessage = (
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ) => {
    return `Are you sure you want to change the order status from "${currentStatus}" to "${newStatus}"?`;
  };

  return (
    <div className="p-5 rounded-xl border-2 bg-white border-gray-300 shadow-lg flex flex-col items-start justify-start">
      <div>
        <p className="font-bold">{order.customerName}</p>
        <p className="text-neutral-400">{order.phoneNumber}</p>
      </div>
      <div className="flex justify-between w-full items-center mt-2 group">
        <div
          className={`px-4 font-semibold  py-1 rounded-full flex items-center  ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusIcon(order.status)}
          <p className="text-sm"> {order.status}</p>
        </div>

        {/* Status Change Dropdown - Only visible on hover if status can be changed */}
        {getAvailableStatusTransitions(order.status).length > 0 && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 no-focus  "
                >
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
                          order.orderId,
                          order.status,
                          newStatus
                        )
                      }
                      className="flex items-center"
                    >
                      {getStatusIcon(newStatus)}
                      {newStatus}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
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
                  "flex items-center px-2 py-1",
                  getStatusColor(confirmDialog.currentStatus)
                )}
              >
                {getStatusIcon(confirmDialog.currentStatus)}
                {confirmDialog.currentStatus}
              </Badge>
              <ArrowRight className="w-4 h-4" />
              <Badge
                className={cn(
                  "flex items-center px-2 py-1",
                  getStatusColor(confirmDialog.newStatus)
                )}
              >
                {getStatusIcon(confirmDialog.newStatus)}
                {confirmDialog.newStatus}
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
                confirmDialog.newStatus === "Cancelled"
                  ? "destructive"
                  : "default"
              }
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full border-t border-gray-300 my-3"></div>
      <div className="flex h-2 w-full gap-1 justify items-center my-1">
        <div className="aspect-square flex justify-center items-center">
          <Image
            alt="clock icon"
            src="/assets/clock.svg"
            height={19}
            width={19}
          />
        </div>
        <p className="text-sm text-neutral-400 ">{formattedCreatedAtDate}</p>
      </div>
      <div className="w-full border-t border-gray-300 my-3"></div>
      <div className="w-full flex justify-between">
        <p className="font-semibold">{order.items.length} Items</p>
        <p className="font-bold text-blue-500">
          $
          {order.items
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2)}
        </p>
      </div>
      <div className="w-full flex flex-col gap-2 mt-2 text-sm">
        {order.items.map((item, index) => (
          <div key={index} className="w-full flex justify-between ">
            <p className="text-neutral-400 ">
              {item.quantity} {item.name}
            </p>
            <p className="font-semibold">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;

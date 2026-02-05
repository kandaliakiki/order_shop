import React from "react";
import { WhatsAppMessage } from "./WhatsAppContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Package,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface WhatsAppMessageCardProps {
  message: WhatsAppMessage;
}

const WhatsAppMessageCard = ({ message }: WhatsAppMessageCardProps) => {
  const formatPhoneNumber = (phone: string) => {
    // Remove "whatsapp:" prefix if present
    const cleaned = phone.replace("whatsapp:", "");
    return cleaned;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {message.messageId.substring(0, 12)}...
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatPhoneNumber(message.from)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(message.createdAt), "MMM dd, yyyy HH:mm")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {message.analyzed ? (
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Analyzed
            </Badge>
          ) : (
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
              <XCircle className="h-3 w-3 mr-1" />
              Not Analyzed
            </Badge>
          )}
          {message.orderId && (
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              <Package className="h-3 w-3 mr-1" />
              Order Created
            </Badge>
          )}
        </div>
      </div>

      {/* Message Body */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {message.body}
        </p>
      </div>

      {/* AI Analysis Result (if analyzed) */}
      {message.analyzed && message.analysisResult && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            AI Analysis:
          </p>
          {message.analysisResult.error ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              Error: {message.analysisResult.error}
            </p>
          ) : (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {message.analysisResult.confidence && (
                <p>
                  Confidence:{" "}
                  {(message.analysisResult.confidence * 100).toFixed(0)}%
                </p>
              )}
              {message.analysisResult.extractedData && (
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Data extracted:{" "}
                  {JSON.stringify(
                    message.analysisResult.extractedData,
                    null,
                    2
                  ).substring(0, 100)}
                  ...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Link (if order exists) */}
      {message.orderId && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Link href={`/order/${message.orderId.orderId}`}>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3 w-3 mr-2" />
              View Order: {message.orderId.orderId}
            </Button>
          </Link>
        </div>
      )}

      {/* Placeholder for Phase 3: Manual Re-analyze button */}
      {!message.analyzed && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" className="w-full" disabled>
            Re-analyze (Phase 3)
          </Button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMessageCard;


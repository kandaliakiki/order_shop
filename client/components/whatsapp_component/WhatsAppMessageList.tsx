"use client";

import React from "react";
import { useWhatsApp } from "./WhatsAppContext";
import WhatsAppMessageCard from "./WhatsAppMessageCard";

const WhatsAppMessageList = () => {
  const { filteredMessages } = useWhatsApp();

  if (filteredMessages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No WhatsApp messages found</p>
        <p className="text-sm mt-2">
          Messages will appear here when customers send WhatsApp messages
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid View for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMessages.map((message) => (
          <WhatsAppMessageCard key={message._id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default WhatsAppMessageList;


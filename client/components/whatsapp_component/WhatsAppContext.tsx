import React, { createContext, useContext, useEffect, useState } from "react";

export interface WhatsAppMessage {
  _id: string;
  messageId: string; // Twilio SID
  from: string; // WhatsApp number
  to: string; // Your Twilio number
  body: string; // Message content
  orderId?: {
    _id: string;
    orderId: string;
    customerName: string;
    total: number;
    status: string;
  };
  analyzed: boolean;
  analysisResult?: {
    extractedData?: any;
    confidence?: number;
    error?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WhatsAppContextType {
  messages: WhatsAppMessage[];
  fetchMessages: () => Promise<void>;
  fetchMessageById: (id: string) => Promise<WhatsAppMessage | null>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  filteredMessages: WhatsAppMessage[];
  filterStatus:
    | "all"
    | "analyzed"
    | "not-analyzed"
    | "has-order"
    | "no-order";
  setFilterStatus: React.Dispatch<
    React.SetStateAction<
      "all" | "analyzed" | "not-analyzed" | "has-order" | "no-order"
    >
  >;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(
  undefined
);

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "analyzed" | "not-analyzed" | "has-order" | "no-order"
  >("all");

  const fetchMessages = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/messages`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: WhatsAppMessage[] = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch WhatsApp messages:", error);
    }
  };

  const fetchMessageById = async (
    id: string
  ): Promise<WhatsAppMessage | null> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/message/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const message: WhatsAppMessage = await response.json();
      return message;
    } catch (error) {
      console.error("Failed to fetch message by ID:", error);
      return null;
    }
  };

  // Filter messages based on search text and status
  const filteredMessages = messages.filter((message) => {
    // Search filter
    const matchesSearch =
      message.body.toLowerCase().includes(searchText.toLowerCase()) ||
      message.from.toLowerCase().includes(searchText.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (filterStatus === "analyzed") {
      matchesStatus = message.analyzed === true;
    } else if (filterStatus === "not-analyzed") {
      matchesStatus = message.analyzed === false;
    } else if (filterStatus === "has-order") {
      matchesStatus = !!message.orderId;
    } else if (filterStatus === "no-order") {
      matchesStatus = !message.orderId;
    }

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchMessages(); // Fetch messages on initial load

    // Refresh messages every 30 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <WhatsAppContext.Provider
      value={{
        messages,
        fetchMessages,
        fetchMessageById,
        searchText,
        setSearchText,
        filteredMessages,
        filterStatus,
        setFilterStatus,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  }
  return context;
};


"use client";

import React from "react";
import { WhatsAppProvider } from "@/components/whatsapp_component/WhatsAppContext";
import WhatsAppHeader from "@/components/whatsapp_component/WhatsAppHeader";
import WhatsAppMessageList from "@/components/whatsapp_component/WhatsAppMessageList";
import MobileHeader from "@/components/layout_components/MobileHeader";

const WhatsAppMessagesPage = () => {
  return (
    <WhatsAppProvider>
      <div className="p-3 md:p-5 md:px-4">
        <MobileHeader title="WhatsApp Messages" />
        <div className="flex flex-col gap-3 md:gap-4">
          <WhatsAppHeader />
          <WhatsAppMessageList />
        </div>
      </div>
    </WhatsAppProvider>
  );
};

export default WhatsAppMessagesPage;


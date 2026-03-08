import { Request, Response } from "express";
import { MessageRouterService } from "../services/messageRouter.service";
import { createCommandLog } from "./commandLog.action";
import { createWhatsAppMessage } from "./whatsappMessage.action";
import { ConversationManager } from "../services/conversationManager.service";

/**
 * Process incoming WhatsApp webhook from Twilio
 * Routes messages intelligently before calling AI to reduce costs
 */
export async function processWhatsAppWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Extract message data from Twilio webhook
    const { MessageSid, From, To, Body, ButtonId } = req.body;

    console.log("📱 Received WhatsApp message:", {
      MessageSid,
      From,
      To,
      Body: Body?.substring(0, 100), // Log first 100 chars
      ButtonId, // Will be present if user clicked a button (future feature)
    });

    // Store message in database
    const messageData = {
      messageId: MessageSid,
      from: From,
      to: To,
      body: Body || "",
      analyzed: false,
    };

    const savedMessage = await createWhatsAppMessage(messageData);

    // Route message using MessageRouterService
    const router = new MessageRouterService();
    const route = router.routeMessage(Body || "", ButtonId);

    let responseMessage: string = "";
    let shouldLogCommand = false;
    let commandName = "unknown";
    let aiUsed = false;

    if (route.type === "greeting" || route.type === "order") {
      // Treat greetings the same as regular orders for now - focus on order generation
      shouldLogCommand = true;
      commandName = "order";
      aiUsed = route.shouldCallAI || true; // Orders always use AI

      const conversationManager = new ConversationManager();
      const processResult = await conversationManager.processMessage(
        Body || "",
        From,
        MessageSid,
        savedMessage._id.toString()
      );
      responseMessage = processResult.whatsappResponse || "Message received.";
      console.log("✅ Order processed (conversational flow)");
      console.log("📝 Response message:", {
        hasResponse: !!processResult.whatsappResponse,
        responseLength: processResult.whatsappResponse?.length || 0,
        preview: processResult.whatsappResponse?.substring(0, 100) || "No response",
        shouldCreateOrder: processResult.shouldCreateOrder,
      });
    } else if (route.type === "command") {
      // Customer bot: only /order is routed as command; all go to ConversationManager
      shouldLogCommand = true;
      commandName = route.command;
      aiUsed = route.shouldCallAI || false;

      const orderText = route.args || Body || "";
      const conversationManager = new ConversationManager();
      const processResult = await conversationManager.processMessage(
        orderText,
        From,
        MessageSid,
        savedMessage._id.toString()
      );
      responseMessage = processResult.whatsappResponse || "Order received.";
      console.log(`✅ /order command processed (conversational)`);
    }

    // Log command interaction (for logs page)
    // Include orders (with or without /order prefix) but exclude greetings
    if (shouldLogCommand) {
      try {
        await createCommandLog({
          messageId: savedMessage._id,
          command: commandName,
          input: Body || "",
          output: responseMessage,
          whatsappNumber: From,
          aiUsed: aiUsed,
        });
        console.log(`📝 Logged command: ${commandName} (AI: ${aiUsed})`);
      } catch (logError) {
        console.error("Error logging command:", logError);
        // Don't fail the request if logging fails
      }
    }

    // Escape XML special characters in response message
    const escapeXml = (text: string): string => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const safeMaxChars = 1500; // Twilio WhatsApp limit 1600; stay under for safety
    const escapedMessage = escapeXml(responseMessage);

    let messageXml: string;
    if (responseMessage.length <= safeMaxChars) {
      messageXml = `<Message>${escapedMessage}</Message>`;
    } else {
      const parts: string[] = [];
      let remaining = responseMessage;
      while (remaining.length > 0) {
        let chunk = remaining.substring(0, safeMaxChars);
        const lastNewline = chunk.lastIndexOf("\n");
        if (lastNewline > safeMaxChars * 0.5) {
          chunk = remaining.substring(0, lastNewline + 1);
        }
        parts.push(escapeXml(chunk));
        remaining = remaining.substring(chunk.length);
      }
      messageXml = parts.map((p) => `<Message>${p}</Message>`).join("\n");
    }

    // Log the response being sent
    console.log("📤 Sending WhatsApp response:", {
      to: From,
      messageLength: responseMessage.length,
      preview: responseMessage.substring(0, 100),
    });

    // Respond to Twilio with properly escaped XML (multiple <Message> if over limit)
    res.status(200).type("text/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${messageXml}
</Response>`
    );
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    // Still return 200 to Twilio to avoid retries
    res.status(200).type("text/xml").send("<Response></Response>");
  }
}

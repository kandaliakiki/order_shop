"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWhatsAppWebhook = void 0;
const messageRouter_service_1 = require("../services/messageRouter.service");
const whatsappRouter_action_1 = require("./whatsappRouter.action");
const commandLog_action_1 = require("./commandLog.action");
const whatsappMessage_action_1 = require("./whatsappMessage.action");
const conversationManager_service_1 = require("../services/conversationManager.service");
/**
 * Process incoming WhatsApp webhook from Twilio
 * Routes messages intelligently before calling AI to reduce costs
 */
function processWhatsAppWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Extract message data from Twilio webhook
            const { MessageSid, From, To, Body, ButtonId } = req.body;
            console.log("📱 Received WhatsApp message:", {
                MessageSid,
                From,
                To,
                Body: Body === null || Body === void 0 ? void 0 : Body.substring(0, 100), // Log first 100 chars
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
            const savedMessage = yield (0, whatsappMessage_action_1.createWhatsAppMessage)(messageData);
            // Route message using MessageRouterService
            const router = new messageRouter_service_1.MessageRouterService();
            const route = router.routeMessage(Body || "", ButtonId);
            let responseMessage = "";
            let shouldLogCommand = false;
            let commandName = "unknown";
            let aiUsed = false;
            if (route.type === "greeting" || route.type === "order") {
                // Treat greetings the same as regular orders for now - focus on order generation
                shouldLogCommand = true;
                commandName = "order";
                aiUsed = route.shouldCallAI || true; // Orders always use AI
                const conversationManager = new conversationManager_service_1.ConversationManager();
                const processResult = yield conversationManager.processMessage(Body || "", From, MessageSid, savedMessage._id.toString());
                responseMessage = processResult.whatsappResponse || "Message received.";
                console.log("✅ Order processed (conversational flow)");
                console.log("📝 Response message:", {
                    hasResponse: !!processResult.whatsappResponse,
                    responseLength: ((_a = processResult.whatsappResponse) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    preview: ((_b = processResult.whatsappResponse) === null || _b === void 0 ? void 0 : _b.substring(0, 100)) || "No response",
                    shouldCreateOrder: processResult.shouldCreateOrder,
                });
            }
            else if (route.type === "command") {
                // Commands like /order, /bakesheet, /waste, /expiry
                shouldLogCommand = true;
                commandName = route.command;
                aiUsed = route.shouldCallAI || false;
                if (route.command === "order") {
                    // /order command uses conversational flow
                    const orderText = route.args || Body || "";
                    const conversationManager = new conversationManager_service_1.ConversationManager();
                    const processResult = yield conversationManager.processMessage(orderText, From, MessageSid, savedMessage._id.toString());
                    responseMessage = processResult.whatsappResponse || "Order received.";
                    console.log(`✅ /order command processed (conversational)`);
                }
                else {
                    // Other commands (bakesheet, waste, expiry)
                    responseMessage = yield (0, whatsappRouter_action_1.handleCommand)(route.command, route.args, From, savedMessage._id.toString());
                    console.log(`✅ /${route.command} command processed`);
                }
            }
            // Log command interaction (for logs page)
            // Include orders (with or without /order prefix) but exclude greetings
            if (shouldLogCommand) {
                try {
                    yield (0, commandLog_action_1.createCommandLog)({
                        messageId: savedMessage._id,
                        command: commandName,
                        input: Body || "",
                        output: responseMessage,
                        whatsappNumber: From,
                        aiUsed: aiUsed,
                    });
                    console.log(`📝 Logged command: ${commandName} (AI: ${aiUsed})`);
                }
                catch (logError) {
                    console.error("Error logging command:", logError);
                    // Don't fail the request if logging fails
                }
            }
            // Escape XML special characters in response message
            const escapeXml = (text) => {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&apos;");
            };
            const escapedMessage = escapeXml(responseMessage);
            // Log the response being sent
            console.log("📤 Sending WhatsApp response:", {
                to: From,
                messageLength: responseMessage.length,
                preview: responseMessage.substring(0, 100),
            });
            // Respond to Twilio with properly escaped XML
            res.status(200).type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapedMessage}</Message>
</Response>`);
        }
        catch (error) {
            console.error("Error processing Twilio webhook:", error);
            // Still return 200 to Twilio to avoid retries
            res.status(200).type("text/xml").send("<Response></Response>");
        }
    });
}
exports.processWhatsAppWebhook = processWhatsAppWebhook;

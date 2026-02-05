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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwilioService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.local" });
class TwilioService {
    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "";
        if (!accountSid || !authToken) {
            throw new Error("Twilio credentials not configured");
        }
        this.client = (0, twilio_1.default)(accountSid, authToken);
        console.log("✅ Twilio client initialized");
    }
    /**
     * Verify Twilio webhook signature
     */
    validateWebhookSignature(url, params, signature) {
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!authToken) {
            return false;
        }
        return twilio_1.default.validateRequest(authToken, signature, url, params);
    }
    /**
     * Send WhatsApp message
     */
    sendWhatsAppMessage(to, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = yield this.client.messages.create({
                    from: this.whatsappNumber,
                    to: `whatsapp:${to}`,
                    body: body,
                });
                console.log(`✅ WhatsApp message sent: ${message.sid}`);
                console.log(`   Status: ${message.status}, To: ${message.to}`);
                return message;
            }
            catch (error) {
                console.error("❌ Error sending WhatsApp message:");
                console.error(`   Error Code: ${error.code}`);
                console.error(`   Error Message: ${error.message}`);
                console.error(`   To: ${to}`);
                console.error(`   Full Error:`, error);
                // Re-throw with more context
                const enhancedError = new Error(`Twilio Error ${error.code}: ${error.message}`);
                enhancedError.code = error.code;
                enhancedError.status = error.status;
                enhancedError.moreInfo = error.moreInfo;
                throw enhancedError;
            }
        });
    }
    /**
     * Get Twilio client instance
     */
    getClient() {
        return this.client;
    }
    /**
     * Get WhatsApp number
     */
    getWhatsAppNumber() {
        return this.whatsappNumber;
    }
}
// Singleton instance
let twilioServiceInstance = null;
const getTwilioService = () => {
    if (!twilioServiceInstance) {
        twilioServiceInstance = new TwilioService();
    }
    return twilioServiceInstance;
};
exports.getTwilioService = getTwilioService;
exports.default = TwilioService;

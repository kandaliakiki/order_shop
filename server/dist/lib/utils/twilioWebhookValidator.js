"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTwilioWebhook = void 0;
const twilio_service_1 = require("../services/twilio.service");
/**
 * Validate Twilio webhook request
 * This ensures the request is actually from Twilio
 */
const validateTwilioWebhook = (req) => {
    const signature = req.headers["x-twilio-signature"];
    const url = process.env.TWILIO_WEBHOOK_URL || "";
    if (!signature) {
        console.warn("⚠️ Missing Twilio signature header (x-twilio-signature)");
        return false;
    }
    if (!url) {
        console.warn("⚠️ Missing TWILIO_WEBHOOK_URL environment variable");
        return false;
    }
    // Convert body to URL-encoded string for validation
    // Twilio sends form-encoded data
    const params = {};
    if (req.body) {
        Object.keys(req.body).forEach((key) => {
            params[key] = String(req.body[key]);
        });
    }
    const twilioService = (0, twilio_service_1.getTwilioService)();
    return twilioService.validateWebhookSignature(url, params, signature);
};
exports.validateTwilioWebhook = validateTwilioWebhook;

import { Request } from "express";
import { getTwilioService } from "../services/twilio.service";

/**
 * Validate Twilio webhook request
 * This ensures the request is actually from Twilio
 */
export const validateTwilioWebhook = (req: Request): boolean => {
  const signature = req.headers["x-twilio-signature"] as string;
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
  const params: Record<string, string> = {};
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      params[key] = String(req.body[key]);
    });
  }

  const twilioService = getTwilioService();
  return twilioService.validateWebhookSignature(url, params, signature);
};

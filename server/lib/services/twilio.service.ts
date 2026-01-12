import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

class TwilioService {
  private client: twilio.Twilio;
  private whatsappNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "";

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials not configured");
    }

    this.client = twilio(accountSid, authToken);
    console.log("✅ Twilio client initialized");
  }

  /**
   * Verify Twilio webhook signature
   */
  validateWebhookSignature(
    url: string,
    params: Record<string, string>,
    signature: string
  ): boolean {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      return false;
    }

    return twilio.validateRequest(authToken, signature, url, params);
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsAppMessage(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${to}`,
        body: body,
      });

      console.log(`✅ WhatsApp message sent: ${message.sid}`);
      return message;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      throw error;
    }
  }

  /**
   * Get Twilio client instance
   */
  getClient(): twilio.Twilio {
    return this.client;
  }

  /**
   * Get WhatsApp number
   */
  getWhatsAppNumber(): string {
    return this.whatsappNumber;
  }
}

// Singleton instance
let twilioServiceInstance: TwilioService | null = null;

export const getTwilioService = (): TwilioService => {
  if (!twilioServiceInstance) {
    twilioServiceInstance = new TwilioService();
  }
  return twilioServiceInstance;
};

export default TwilioService;

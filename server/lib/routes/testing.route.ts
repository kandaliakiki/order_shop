import { Router, Request, Response } from "express";
import { TestingChatService } from "../services/testingChat.service";

const router = Router();
const testingService = new TestingChatService();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { phoneNumber, message, debug = false } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: "phoneNumber and message are required",
      });
    }

    const result = await testingService.processMessage(
      phoneNumber,
      message,
      Boolean(debug),
    );

    const payload: Record<string, unknown> = {
      success: result.success,
      response: result.whatsappResponse,
      timestamp: new Date().toISOString(),
    };

    if (debug && result.debugInfo) {
      payload.conversationState = result.debugInfo;
    }

    if (result.error) {
      payload.error = result.error;
    }

    res.json(payload);
  } catch (error) {
    console.error("Testing chat error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/conversation/:phoneNumber", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    const conversation = await testingService.getConversation(phoneNumber);

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete(
  "/conversation/:phoneNumber",
  async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.params;
      await testingService.resetConversation(phoneNumber);

      res.json({
        success: true,
        message: "Conversation reset successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;

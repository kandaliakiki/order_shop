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
const express_1 = require("express");
const testingChat_service_1 = require("../services/testingChat.service");
const router = (0, express_1.Router)();
const testingService = new testingChat_service_1.TestingChatService();
router.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, message, debug = false } = req.body;
        if (!phoneNumber || !message) {
            return res.status(400).json({
                success: false,
                error: "phoneNumber and message are required",
            });
        }
        const result = yield testingService.processMessage(phoneNumber, message, Boolean(debug));
        const payload = {
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
    }
    catch (error) {
        console.error("Testing chat error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));
router.get("/conversation/:phoneNumber", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.params;
        const conversation = yield testingService.getConversation(phoneNumber);
        res.json({
            success: true,
            conversation,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));
router.delete("/conversation/:phoneNumber", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.params;
        yield testingService.resetConversation(phoneNumber);
        res.json({
            success: true,
            message: "Conversation reset successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));
router.get("/health", (_req, res) => {
    res.json({
        success: true,
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;

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
exports.handleCommand = void 0;
function handleCommand(_command, args, _whatsappNumber, _messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only "order" is used for customer bot; handled via ConversationManager in webhook.
        // Admin commands (bakesheet, waste, expiry, stock) are in adminLogic/ and disabled.
        return '❌ Unknown command. Balas "menu" atau "hi" untuk memesan.';
    });
}
exports.handleCommand = handleCommand;

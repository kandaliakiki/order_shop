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
exports.handleButtonClick = exports.getGreetingMenu = exports.AGENT_NAME = void 0;
// Bakery agent name - selected: 'BakeBot'
exports.AGENT_NAME = 'BakeBot';
// Option A: Text menu with full commands (SELECTED FOR MVP)
function getGreetingMenu() {
    return `🍰 *Welcome to ${exports.AGENT_NAME}!*

What would you like to do?

1️⃣ *Bake Sheet* - Type: /bakesheet [today/tomorrow/date]
2️⃣ *Add Stock* - Type: /stock [quantity] [ingredient]
3️⃣ *Log Waste* - Type: /waste [item] [quantity] [reason]
4️⃣ *Check Expiry* - Type: /expiry [item?]
5️⃣ *Add Order* - Type: /order [your order details]

Or simply send your order without /order! 📝`;
}
exports.getGreetingMenu = getGreetingMenu;
// Button click handlers (if using Option B - Twilio Content Templates)
function handleButtonClick(buttonId, whatsappNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const buttonMap = {
            'cmd_bakesheet': () => __awaiter(this, void 0, void 0, function* () {
                return `📋 *Bake Sheet*\n\nType:\n/bakesheet [today/tomorrow/date]\n\nExample: /bakesheet today\nOr: /bakesheet next 3 days`;
            }),
            'cmd_waste': () => __awaiter(this, void 0, void 0, function* () {
                return `🗑️ *Log Waste*\n\nType:\n/waste [item] [quantity] [reason]\n\nExample: /waste 5 croissants burnt`;
            }),
            'cmd_expiry': () => __awaiter(this, void 0, void 0, function* () {
                return `📅 *Check Expiry*\n\nType:\n/expiry [item?]\n\nExample: /expiry flour\nOr just /expiry for top 5 expiring items`;
            }),
            'cmd_order': () => __awaiter(this, void 0, void 0, function* () {
                return `📝 *Add Order*\n\nType:\n/order [your order details]\n\nExample: /order chiffon 1 cheesecake 1\n\nOr simply send your order without /order!`;
            }),
        };
        const handler = buttonMap[buttonId];
        if (handler) {
            return yield handler();
        }
        return '❌ Unknown command. Type "menu" to see options.';
    });
}
exports.handleButtonClick = handleButtonClick;

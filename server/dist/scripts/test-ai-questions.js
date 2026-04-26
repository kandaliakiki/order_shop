"use strict";
/**
 * Quick test to verify AI doesn't ask for phone number or total price
 */
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
const mongoose_1 = require("../lib/mongoose");
const mongoose_2 = require("mongoose");
const conversationState_model_1 = __importDefault(require("../lib/models/conversationState.model"));
const conversationManager_service_1 = require("../lib/services/conversationManager.service");
// Import all models to register them with mongoose
require("../lib/models/product.model");
require("../lib/models/category.model");
require("../lib/models/order.model");
require("../lib/models/ingredient.model");
require("../lib/models/ingredientLot.model");
require("../lib/models/customerDeliveryAddress.model");
function testAINoLongerAsksForPhoneOrTotal() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🧪 Testing AI doesn't ask for phone number or total price...\n");
        yield (0, mongoose_1.connectToDB)();
        const testPhone = `+62895327367697_test_${Date.now()}`;
        const conversationManager = new conversationManager_service_1.ConversationManager();
        // Simulate a conversation flow
        const steps = [
            { input: "/reset", description: "Reset conversation" },
            { input: "pesan baru", description: "Choose new order" },
            { input: "classic sourdough 2", description: "Order item" },
            { input: "pickup", description: "Choose pickup" },
            { input: "jam 3 sore", description: "Specify pickup time" },
        ];
        let allPassed = true;
        for (const step of steps) {
            const result = yield conversationManager.processMessage(step.input, testPhone, `test_${Date.now()}`, new mongoose_2.Types.ObjectId().toString());
            console.log(`📝 ${step.description}`);
            console.log(`   Input: "${step.input}"`);
            console.log(`   Response: "${result.whatsappResponse.substring(0, 150)}..."`);
            // Check for forbidden questions
            const hasPhoneQuestion = /nomor telepon|nomor yang bisa dihubungi/i.test(result.whatsappResponse);
            const hasTotalQuestion = /total (pesanannya|jadi|harga)|berapa ya kak/i.test(result.whatsappResponse);
            if (hasPhoneQuestion) {
                console.log(`   ❌ FAIL: AI asked for phone number!`);
                allPassed = false;
            }
            else if (hasTotalQuestion) {
                console.log(`   ❌ FAIL: AI asked for total price!`);
                allPassed = false;
            }
            else {
                console.log(`   ✅ PASS\n`);
            }
        }
        // Clean up
        yield conversationState_model_1.default.deleteOne({ phoneNumber: testPhone });
        console.log("\n" + "=".repeat(60));
        if (allPassed) {
            console.log("✅ ALL TESTS PASSED! AI no longer asks for phone/total.");
        }
        else {
            console.log("❌ TESTS FAILED! AI still asking forbidden questions.");
        }
        console.log("=".repeat(60));
        process.exit(allPassed ? 0 : 1);
    });
}
testAINoLongerAsksForPhoneOrTotal().catch(console.error);

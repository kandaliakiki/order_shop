/**
 * Quick test to verify AI doesn't ask for phone number or total price
 */

import { connectToDB } from "../lib/mongoose";
import { Types } from "mongoose";
import ConversationState from "../lib/models/conversationState.model";
import { ConversationManager } from "../lib/services/conversationManager.service";

// Import all models to register them with mongoose
import "../lib/models/product.model";
import "../lib/models/category.model";
import "../lib/models/order.model";
import "../lib/models/ingredient.model";
import "../lib/models/ingredientLot.model";
import "../lib/models/customerDeliveryAddress.model";

async function testAINoLongerAsksForPhoneOrTotal() {
  console.log("🧪 Testing AI doesn't ask for phone number or total price...\n");
  
  await connectToDB();
  
  const testPhone = `+62895327367697_test_${Date.now()}`;
  const conversationManager = new ConversationManager();
  
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
    const result = await conversationManager.processMessage(
      step.input,
      testPhone,
      `test_${Date.now()}`,
      new Types.ObjectId().toString(),
    );
    
    console.log(`📝 ${step.description}`);
    console.log(`   Input: "${step.input}"`);
    console.log(`   Response: "${result.whatsappResponse.substring(0, 150)}..."`);
    
    // Check for forbidden questions
    const hasPhoneQuestion = /nomor telepon|nomor yang bisa dihubungi/i.test(result.whatsappResponse);
    const hasTotalQuestion = /total (pesanannya|jadi|harga)|berapa ya kak/i.test(result.whatsappResponse);
    
    if (hasPhoneQuestion) {
      console.log(`   ❌ FAIL: AI asked for phone number!`);
      allPassed = false;
    } else if (hasTotalQuestion) {
      console.log(`   ❌ FAIL: AI asked for total price!`);
      allPassed = false;
    } else {
      console.log(`   ✅ PASS\n`);
    }
  }
  
  // Clean up
  await ConversationState.deleteOne({ phoneNumber: testPhone });
  
  console.log("\n" + "=".repeat(60));
  if (allPassed) {
    console.log("✅ ALL TESTS PASSED! AI no longer asks for phone/total.");
  } else {
    console.log("❌ TESTS FAILED! AI still asking forbidden questions.");
  }
  console.log("=".repeat(60));
  
  process.exit(allPassed ? 0 : 1);
}

testAINoLongerAsksForPhoneOrTotal().catch(console.error);

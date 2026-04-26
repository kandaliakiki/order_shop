/**
 * Test to verify AI correctly extracts fulfillmentType from Indonesian phrases
 * and generates proper questions (not confirmation statements)
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

interface TestStep {
  input: string;
  description: string;
  shouldContain?: string[];
  shouldNotContain?: string[];
}

async function testPickupDeliveryExtraction() {
  console.log("🧪 Testing AI fulfillmentType extraction and question format...\n");
  
  await connectToDB();
  
  const testPhone = `+62895327367697_test_${Date.now()}`;
  const conversationManager = new ConversationManager();
  
  const testScenarios: Array<{ name: string; steps: TestStep[] }> = [
    {
      name: "Pickup Flow - 'di ambil' should extract fulfillmentType: pickup",
      steps: [
        { 
          input: "/reset", 
          description: "Reset conversation",
          shouldContain: ["Conversation reset"],
        },
        { 
          input: "pesan baru", 
          description: "Choose new order",
        },
        { 
          input: "chiffon 2", 
          description: "Order product",
        },
        { 
          input: "di ambil jam 3 sore", 
          description: "Specify pickup time - should NOT ask 'mau dikirim jam berapa'",
          shouldContain: ["ambil", "toko"],
          shouldNotContain: ["dikirim", "delivery", "mau dikirim jam berapa"],
        },
      ],
    },
    {
      name: "Delivery Flow - 'dikirim' should extract fulfillmentType: delivery",
      steps: [
        { 
          input: "/reset", 
          description: "Reset conversation",
        },
        { 
          input: "pesan baru", 
          description: "Choose new order",
        },
        { 
          input: "cheesecake 1", 
          description: "Order product",
        },
        { 
          input: "dikirim jam 10 pagi", 
          description: "Specify delivery time - should ask for address",
          shouldContain: ["Alamat", "pengiriman"],
          shouldNotContain: ["ambil di toko"],
        },
      ],
    },
    {
      name: "Pickup Flow - 'ambil di toko' variation",
      steps: [
        { 
          input: "/reset", 
          description: "Reset conversation",
        },
        { 
          input: "pesan baru", 
          description: "Choose new order",
        },
        { 
          input: "pain au chocolate 2", 
          description: "Order product",
        },
        { 
          input: "ambil di toko besok jam 2 siang", 
          description: "Specify pickup with date and time",
          shouldContain: ["ambil", "toko"],
          shouldNotContain: ["dikirim", "delivery"],
        },
      ],
    },
    {
      name: "AI Should Not Generate Confirmation Statements",
      steps: [
        { 
          input: "/reset", 
          description: "Reset conversation",
        },
        { 
          input: "pesan baru", 
          description: "Choose new order",
        },
        { 
          input: "brioche 1", 
          description: "Order product",
        },
        { 
          input: "delivery", 
          description: "Choose delivery",
        },
        { 
          input: "Jl. Merdeka No. 123", 
          description: "Provide address",
          shouldNotContain: ["pesanannya untuk", "ya", "sudah kami catat ya"],
        },
      ],
    },
  ];
  
  let allPassed = true;
  let totalSteps = 0;
  let passedSteps = 0;
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log("=".repeat(60));
    
    for (const step of scenario.steps) {
      totalSteps++;
      
      const result = await conversationManager.processMessage(
        step.input,
        testPhone,
        `test_${Date.now()}`,
        new Types.ObjectId().toString(),
      );
      
      const failures: string[] = [];
      
      // Check if response contains expected strings
      if (step.shouldContain) {
        for (const expected of step.shouldContain) {
          if (!result.whatsappResponse.toLowerCase().includes(expected.toLowerCase())) {
            failures.push(`Expected to contain "${expected}" but got: "${result.whatsappResponse.substring(0, 100)}..."`);
          }
        }
      }
      
      // Check if response doesn't contain forbidden strings
      if (step.shouldNotContain) {
        for (const forbidden of step.shouldNotContain) {
          if (result.whatsappResponse.toLowerCase().includes(forbidden.toLowerCase())) {
            failures.push(`Should NOT contain "${forbidden}" but got: "${result.whatsappResponse.substring(0, 100)}..."`);
          }
        }
      }
      
      // Check for success
      if (!result.success) {
        failures.push(`Step failed with error: ${result.error}`);
      }
      
      const passed = failures.length === 0;
      if (passed) {
        passedSteps++;
      } else {
        allPassed = false;
      }
      
      console.log(`${passed ? "✅" : "❌"} ${step.description}`);
      if (!passed) {
        console.log(`   Input: "${step.input}"`);
        console.log(`   Response: "${result.whatsappResponse.substring(0, 150)}..."`);
        failures.forEach(f => console.log(`   ❌ ${f}`));
      } else {
        console.log();
      }
    }
    
    // Reset conversation between scenarios
    await ConversationState.deleteOne({ phoneNumber: testPhone });
  }
  
  // Clean up
  await ConversationState.deleteOne({ phoneNumber: testPhone });
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total steps: ${totalSteps}`);
  console.log(`Passed: ${passedSteps}`);
  console.log(`Failed: ${totalSteps - passedSteps}`);
  console.log(`Success rate: ${((passedSteps / totalSteps) * 100).toFixed(1)}%`);
  
  if (!allPassed) {
    console.log("\n❌ Some tests failed. Check the logs above for details.");
    process.exit(1);
  } else {
    console.log("\n✅ All tests passed! AI correctly extracts fulfillmentType and asks proper questions.");
    process.exit(0);
  }
}

testPickupDeliveryExtraction().catch(console.error);

/**
 * Full Order Flow Integration Test
 * 
 * This test replicates the exact user journey:
 * 1. /reset
 * 2. pesan baru
 * 3. Menu request
 * 4. Order products (add, remove, replace)
 * 5. Confirm done
 * 6. Choose delivery/pickup
 * 7. Provide details
 * 8. Get summary
 * 
 * Usage: npx ts-node server/scripts/full-order-flow.test.ts
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

const TEST_PHONE = "+62895327367697";
const TEST_PHONE_UNIQUE = `${TEST_PHONE}_${Date.now()}`;

interface TestResult {
  success: boolean;
  response: string;
  error?: string;
}

class FullOrderFlowTester {
  private manager: ConversationManager;
  private testPhone: string;
  private messageId: number = 0;

  constructor(testPhone: string) {
    this.manager = new ConversationManager();
    this.testPhone = testPhone;
  }

  async reset(): Promise<void> {
    await ConversationState.deleteOne({ phoneNumber: this.testPhone });
    console.log(`✅ Cleaned up conversation for ${this.testPhone}`);
  }

  async sendMessage(message: string): Promise<TestResult> {
    this.messageId++;
    const result = await this.manager.processMessage(
      message,
      this.testPhone,
      `test_${this.messageId}`,
      new Types.ObjectId().toString()
    );

    return {
      success: result.success,
      response: result.whatsappResponse,
      error: result.error,
    };
  }

  assertContains(text: string, expected: string[], description: string): void {
    for (const exp of expected) {
      if (!text.toLowerCase().includes(exp.toLowerCase())) {
        throw new Error(
          `${description}: Expected to contain "${exp}" but got: "${text.substring(0, 200)}..."`
        );
      }
    }
  }

  assertNotContains(text: string, forbidden: string[], description: string): void {
    for (const forb of forbidden) {
      if (text.toLowerCase().includes(forb.toLowerCase())) {
        throw new Error(
          `${description}: Should NOT contain "${forb}" but got: "${text.substring(0, 200)}..."`
        );
      }
    }
  }

  async runFullFlowTest(): Promise<void> {
    await this.reset();

    console.log(`\n📱 Using test phone: ${this.testPhone}`);
    console.log("\n" + "=".repeat(80));
    console.log("🧪 FULL ORDER FLOW INTEGRATION TEST");
    console.log("=".repeat(80));

    // Step 1: /reset
    console.log("\n📝 Step 1: Send /reset");
    let result = await this.sendMessage("/reset");
    console.log("✅ Response:", result.response.substring(0, 150));
    this.assertContains(result.response, ["Conversation reset", "pesan"], "Step 1: /reset");

    // Step 2: "pesan baru" - should ask what to order
    console.log("\n📝 Step 2: Say 'pesan baru'");
    result = await this.sendMessage("pesan baru");
    console.log("✅ Response:", result.response.substring(0, 150));
    // After reset, "pesan baru" should ask what to order
    this.assertContains(result.response, ["pesan"], "Step 2: pesan baru");

    // Step 3: Ask to see menu
    console.log("\n📝 Step 3: Ask to see menu");
    result = await this.sendMessage("boleh lihat ga ya ada apa aja");
    console.log("✅ Response:", result.response.substring(0, 200));
    this.assertContains(result.response, ["menu", "•"], "Step 3: Menu request - should show bullet points");

    // Step 4: Order 2 products
    console.log("\n📝 Step 4: Order first product");
    result = await this.sendMessage("brioche bun 2");
    console.log("✅ Response:", result.response.substring(0, 150));
    this.assertContains(result.response, ["brioche"], "Step 4: Order brioche bun");

    console.log("\n📝 Step 5: Order second product");
    result = await this.sendMessage("cheesecake 1");
    console.log("✅ Response:", result.response.substring(0, 150));
    this.assertContains(result.response, ["cheesecake"], "Step 5: Order cheesecake");

    // Step 5: Add more items
    console.log("\n📝 Step 6: Add more items");
    result = await this.sendMessage("tambah chiffon 1");
    console.log("✅ Response:", result.response.substring(0, 150));
    this.assertContains(result.response, ["chiffon"], "Step 6: Add chiffon");

    // Step 6: Remove an item
    console.log("\n📝 Step 7: Remove an item");
    result = await this.sendMessage("ga jadi cheesecake");
    console.log("✅ Response:", result.response.substring(0, 150));
    // Should confirm removal or ask for confirmation

    // Step 7: Replace quantity
    console.log("\n📝 Step 8: Replace quantity");
    result = await this.sendMessage("brioche bun nya 3 aja");
    console.log("✅ Response:", result.response.substring(0, 150));
    this.assertContains(result.response, ["brioche"], "Step 8: Replace brioche quantity");

    // Step 8: Confirm done
    console.log("\n📝 Step 9: Confirm done");
    result = await this.sendMessage("itu saja");
    console.log("✅ Response:", result.response.substring(0, 150));
    // Should ask for delivery/pickup or confirm items

    // Step 9: Choose delivery
    console.log("\n📝 Step 10: Choose delivery");
    result = await this.sendMessage("delivery");
    console.log("✅ Response:", result.response.substring(0, 150));
    this.assertContains(result.response, ["Alamat"], "Step 10: Delivery - should ask for address");

    // Step 10: Provide address
    console.log("\n📝 Step 11: Provide address");
    result = await this.sendMessage("Jl. Test No. 123, Jakarta");
    console.log("✅ Response:", result.response.substring(0, 150));
    // Should ask for date/time or confirm address

    // Step 11: Provide date and time
    console.log("\n📝 Step 12: Provide date and time");
    result = await this.sendMessage("besok jam 3 sore");
    console.log("✅ Response:", result.response.substring(0, 200));
    // Should show summary with order details, address, date, time, and payment info

    console.log("\n" + "=".repeat(80));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(80));
  }
}

async function main() {
  try {
    await connectToDB();
    console.log("✅ Connected to MongoDB");

    const tester = new FullOrderFlowTester(TEST_PHONE_UNIQUE);
    await tester.runFullFlowTest();

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ TEST FAILED:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

import { connectToDB } from "../lib/mongoose";
import { Types } from "mongoose";
import ConversationState from "../lib/models/conversationState.model";
import { ConversationManager } from "../lib/services/conversationManager.service";

interface TestStep {
  input: string;
  description: string;
  expectedIntent?: string;
  shouldContain?: string[];
  shouldNotContain?: string[];
}

interface TestScenario {
  name: string;
  steps: TestStep[];
}

const testScenarios: TestScenario[] = [
  {
    name: "Basic Order Flow with Menu Request",
    steps: [
      { 
        input: "/reset", 
        description: "Reset conversation",
        shouldContain: ["Conversation reset", "Mau pesan apa"],
      },
      { 
        input: "pesan baru", 
        description: "Choose new order",
        shouldContain: ["Halo", "Selamat datang", "bantu pesan"],
      },
      { 
        input: "mau lihat ada apa aja", 
        description: "Menu request - informal Indonesian",
        shouldContain: ["Ini nih menunya", "Mau pesan apa"],
        shouldNotContain: ["error", "Error"],
      },
      { 
        input: "brioche bun 3", 
        description: "Order first item",
        shouldContain: ["brioche bun"],
      },
      { 
        input: "delivery", 
        description: "Choose delivery",
        shouldContain: ["Alamat", "pengiriman"],
      },
    ],
  },
  {
    name: "Menu Request Variations",
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
        input: "jual apa aja", 
        description: "Menu request - 'what do you sell'",
        shouldContain: ["Ini nih menunya"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Menu Request Variation 2",
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
        input: "ada menu apa", 
        description: "Menu request - 'what menu is there'",
        shouldContain: ["Ini nih menunya"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Menu Request Variation 3",
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
        input: "produk apa saja", 
        description: "Menu request - 'what products'",
        shouldContain: ["Ini nih menunya"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Edit Flow - Change Item",
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
        input: "brioche bun 3", 
        description: "Order first item",
      },
      { 
        input: "delivery", 
        description: "Choose delivery",
      },
    ],
  },
  {
    name: "Pickup Flow - Extract fulfillmentType from 'di ambil'",
    steps: [
      { 
        input: "/reset", 
        description: "Reset conversation",
        shouldContain: ["Conversation reset"],
      },
      { 
        input: "pesan baru", 
        description: "Choose new order",
        shouldContain: ["Halo", "Selamat datang"],
      },
      { 
        input: "chiffon 2", 
        description: "Order product",
        shouldContain: ["chiffon"],
      },
      { 
        input: "di ambil jam 3 sore", 
        description: "Specify pickup time - should extract fulfillmentType: pickup",
        shouldContain: ["ambil", "toko"],
        shouldNotContain: ["dikirim", "delivery", "mau dikirim jam berapa"],
      },
    ],
  },
  {
    name: "Delivery Flow - Extract fulfillmentType from 'dikirim'",
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
        input: "cheesecake 1", 
        description: "Order product",
      },
      { 
        input: "dikirim jam 10 pagi", 
        description: "Specify delivery time - should extract fulfillmentType: delivery",
        shouldContain: ["Alamat", "pengiriman"],
        shouldNotContain: ["ambil di toko"],
      },
    ],
  },
  {
    name: "Pickup Flow Variation - 'ambil di toko'",
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
  // ==================== NEW COLLOQUIALISM TESTS ====================
  {
    name: "Colloquialism - 'pesan baru aja deh coba'",
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
        input: "brioche bun 2", 
        description: "Add item first",
        shouldContain: ["brioche bun"],
      },
      { 
        input: "pesan baru aja deh coba", 
        description: "Reset with colloquial Indonesian",
        shouldContain: ["reset", "mulai", "pesan apa"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Colloquialism - 'brioche bun 3 sm brioche toast 5 deh'",
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
        input: "brioche bun 3 sm brioche toast 5 deh", 
        description: "Multiple items with 'sm' (sama/and) and 'deh' (filler)",
        shouldContain: ["brioche bun", "brioche toast"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Colloquialism - 'iya deh dikirim'",
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
        input: "iya deh dikirim", 
        description: "Delivery with colloquial 'iya deh'",
        shouldContain: ["Alamat", "pengiriman"],
        shouldNotContain: ["ambil di toko"],
      },
    ],
  },
  {
    name: "Colloquialism - 'udah' as confirmation",
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
        description: "Pickup with time",
      },
      { 
        input: "udah", 
        description: "Colloquial 'udah' (done) - should ask for confirmation or proceed",
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Colloquialism - 'ga jadi cheesecake nya'",
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
        input: "chiffon 2 cheesecake 1", 
        description: "Order multiple products",
        shouldContain: ["chiffon", "cheesecake"],
      },
      { 
        input: "ga jadi cheesecake nya", 
        description: "Remove item with colloquial 'ga jadi'",
        shouldContain: ["chiffon"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
  {
    name: "Colloquialism - 'nya 3 aja deh' (replace quantity)",
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
        description: "Order product with qty 2",
        shouldContain: ["chiffon"],
      },
      { 
        input: "chiffon nya 3 aja deh", 
        description: "Replace quantity with colloquial 'nya 3 aja deh'",
        shouldContain: ["chiffon", "3"],
        shouldNotContain: ["error", "Error"],
      },
    ],
  },
];

class ConversationFlowTester {
  private conversationManager: ConversationManager;
  private testPhoneNumber: string;

  constructor(testPhoneNumber: string) {
    this.conversationManager = new ConversationManager();
    this.testPhoneNumber = testPhoneNumber;
  }

  async resetConversation(): Promise<void> {
    await ConversationState.deleteOne({ phoneNumber: this.testPhoneNumber });
    console.log(`✅ Reset conversation for ${this.testPhoneNumber}`);
  }

  async sendMessage(message: string): Promise<{
    success: boolean;
    response: string;
    error?: string;
  }> {
    const ts = Date.now();
    const result = await this.conversationManager.processMessage(
      message,
      this.testPhoneNumber,
      `test_${ts}`,
      new Types.ObjectId().toString(),
    );

    return {
      success: result.success,
      response: result.whatsappResponse,
      error: result.error,
    };
  }

  async runScenario(scenario: TestScenario): Promise<{
    passed: boolean;
    results: Array<{
      step: TestStep;
      passed: boolean;
      response: string;
      error?: string;
      failures?: string[];
    }>;
  }> {
    console.log(`\n📋 Running scenario: ${scenario.name}`);
    console.log("=".repeat(60));

    const results = [];
    let allPassed = true;

    for (const step of scenario.steps) {
      try {
        const result = await this.sendMessage(step.input);
        
        const failures: string[] = [];
        
        // Check if response contains expected strings
        if (step.shouldContain) {
          for (const expected of step.shouldContain) {
            if (!result.response.toLowerCase().includes(expected.toLowerCase())) {
              failures.push(`Expected to contain "${expected}" but got: "${result.response.substring(0, 100)}..."`);
            }
          }
        }

        // Check if response doesn't contain forbidden strings
        if (step.shouldNotContain) {
          for (const forbidden of step.shouldNotContain) {
            if (result.response.toLowerCase().includes(forbidden.toLowerCase())) {
              failures.push(`Should not contain "${forbidden}" but got: "${result.response.substring(0, 100)}..."`);
            }
          }
        }

        // Check for success
        if (!result.success) {
          failures.push(`Step failed with error: ${result.error}`);
        }

        const passed = failures.length === 0;
        if (!passed) {
          allPassed = false;
        }

        results.push({
          step,
          passed,
          response: result.response,
          error: result.error,
          failures,
        });

        console.log(`${passed ? "✅" : "❌"} ${step.description}`);
        if (!passed) {
          console.log(`   Input: "${step.input}"`);
          console.log(`   Response: "${result.response.substring(0, 150)}..."`);
          failures.forEach(f => console.log(`   ❌ ${f}`));
        }

      } catch (error: any) {
        allPassed = false;
        results.push({
          step,
          passed: false,
          response: "",
          error: error.message,
          failures: [`Exception thrown: ${error.message}`],
        });
        console.log(`❌ ${step.description} - EXCEPTION: ${error.message}`);
      }
    }

    console.log(`\n${allPassed ? "✅ Scenario PASSED" : "❌ Scenario FAILED"}: ${scenario.name}`);
    return { passed: allPassed, results };
  }
}

async function runAllTests() {
  console.log("🚀 Starting Indonesian Conversation Flow Tests");
  console.log("=".repeat(60));

  try {
    await connectToDB();
    console.log("✅ Connected to MongoDB");

    const testPhoneNumber = "+62895327367697";
    const tester = new ConversationFlowTester(testPhoneNumber);

    let totalPassed = 0;
    let totalFailed = 0;

    for (const scenario of testScenarios) {
      const result = await tester.runScenario(scenario);
      if (result.passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }

      // Reset conversation between scenarios
      await tester.resetConversation();
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total scenarios: ${testScenarios.length}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success rate: ${((totalPassed / testScenarios.length) * 100).toFixed(1)}%`);

    if (totalFailed > 0) {
      console.log("\n❌ Some tests failed. Check the logs above for details.");
      process.exit(1);
    } else {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    }

  } catch (error: any) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();

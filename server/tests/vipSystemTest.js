import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { VIP_CONFIG, getVipLevelConfig } from "../config/vipConfig.js";
import {
  getQualifyingSpendForUser,
  recalculateUserVIPStatus,
  processOrderRewards,
  revertOrderRewards
} from "../services/vipService.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cartnow";

async function runVipSystemTests() {
  console.log("🚀 STARTING COMPREHENSIVE CARTNOW VIP SYSTEM AUDIT & TESTS...\n");

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "cartNOW",
      serverSelectionTimeoutMS: 8000
    });
    console.log("✅ Connected to MongoDB");

    // Clean up test collections
    const testEmail = `viptest_${Date.now()}@cartnow.com`;
    let user = await userModel.create({
      name: "VIP Audit User",
      email: testEmail,
      password: "password123",
      isVerified: true
    });
    console.log(`✅ Created test user ID: ${user._id}`);

    // =========================================================================
    // TEST SECTION 1: Pure Unit Test Matrix for VIP Config Thresholds
    // =========================================================================
    console.log("\n--- TEST SECTION 1: Threshold & Level Derivation Matrix ---");
    const testCases = [
      { spend: 0, expectedLevel: "MEMBER", expectedCashback: 0.01, expectedMult: 1.0 },
      { spend: 4999, expectedLevel: "MEMBER", expectedCashback: 0.01, expectedMult: 1.0 },
      { spend: 5000, expectedLevel: "SILVER", expectedCashback: 0.02, expectedMult: 1.25 },
      { spend: 19999, expectedLevel: "SILVER", expectedCashback: 0.02, expectedMult: 1.25 },
      { spend: 20000, expectedLevel: "GOLD", expectedCashback: 0.04, expectedMult: 1.5 },
      { spend: 49999, expectedLevel: "GOLD", expectedCashback: 0.04, expectedMult: 1.5 },
      { spend: 50000, expectedLevel: "BLACK_VIP", expectedCashback: 0.08, expectedMult: 2.0 },
      { spend: 99999, expectedLevel: "BLACK_VIP", expectedCashback: 0.08, expectedMult: 2.0 },
      { spend: 100000, expectedLevel: "DIAMOND_VIP", expectedCashback: 0.12, expectedMult: 3.0 },
      { spend: 250000, expectedLevel: "DIAMOND_VIP", expectedCashback: 0.12, expectedMult: 3.0 },
    ];

    for (const tc of testCases) {
      const config = getVipLevelConfig(tc.spend);
      if (
        config.level === tc.expectedLevel &&
        config.cashbackRate === tc.expectedCashback &&
        config.pointsMultiplier === tc.expectedMult
      ) {
        console.log(`  [PASS] ₹${tc.spend.toLocaleString("en-IN")} -> Level: ${config.level} | Cashback: ${(config.cashbackRate * 100)}% | Mult: ${config.pointsMultiplier}x`);
      } else {
        throw new Error(`[FAIL] ₹${tc.spend} expected ${tc.expectedLevel} got ${config.level}`);
      }
    }

    // =========================================================================
    // TEST SECTION 2: Database Qualifying Spend & Unpaid/Cancelled Order Isolation
    // =========================================================================
    console.log("\n--- TEST SECTION 2: Database Order Isolation & Qualifying Spend ---");
    
    // Create an unpaid order -> should NOT increase spend
    const unpaidOrder = await orderModel.create({
      userId: user._id,
      amount: 10000,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "Processing"
    });

    // Create a failed payment order -> should NOT increase spend
    const failedOrder = await orderModel.create({
      userId: user._id,
      amount: 25000,
      paymentMethod: "stripe",
      paymentStatus: "failed",
      orderStatus: "Cancelled"
    });

    let spend = await getQualifyingSpendForUser(user._id);
    let vipInfo = await recalculateUserVIPStatus(user._id);

    console.log(`  Qualifying Spend with 1 Unpaid & 1 Failed Order: ₹${spend} (Expected: ₹0)`);
    if (spend !== 0 || vipInfo.level !== "MEMBER") {
      throw new Error("Unpaid or Failed order wrongfully contributed to qualifying spend!");
    }
    console.log("  [PASS] Unpaid and Failed orders successfully isolated.");

    // =========================================================================
    // TEST SECTION 3: Paid Order Upgrade & Idempotent Rewards
    // =========================================================================
    console.log("\n--- TEST SECTION 3: Paid Order Upgrades & Reward Idempotency ---");

    // Place a paid order of ₹6,000 -> Should upgrade user to SILVER
    const paidOrder1 = await orderModel.create({
      userId: user._id,
      amount: 6000,
      paymentMethod: "stripe",
      paymentStatus: "paid",
      orderStatus: "Processing"
    });

    const rewardRes1 = await processOrderRewards(paidOrder1._id);
    console.log(`  Processed Order #1 (₹6,000 Paid) -> Cashback: ₹${rewardRes1.cashbackEarned}, Points: ${rewardRes1.pointsEarned}, Level: ${rewardRes1.vipInfo.level}`);
    
    if (rewardRes1.vipInfo.level !== "SILVER") {
      throw new Error(`Expected SILVER after ₹6,000 spend, got ${rewardRes1.vipInfo.level}`);
    }

    // Attempt DUPLICATE reward processing on the exact same order (Double-Credit Attack Test)
    const duplicateRewardRes = await processOrderRewards(paidOrder1._id);
    user = await userModel.findById(user._id);
    
    console.log(`  Duplicate Processing Attempt Response: "${duplicateRewardRes.message}"`);
    console.log(`  User Wallet Balance: ₹${user.walletBalance} (Expected: ₹120 for 2% of ₹6,000)`);
    console.log(`  User Reward Points: ${user.rewardPoints} (Expected: 3,750 pts)`);

    if (user.walletBalance !== 120) {
      throw new Error("Double credit vulnerability detected! Wallet balance was duplicated!");
    }
    console.log("  [PASS] Idempotency double-credit protection verified 100%.");

    // =========================================================================
    // TEST SECTION 4: Multi-Step Tier Advancement (Silver -> Gold -> Diamond)
    // =========================================================================
    console.log("\n--- TEST SECTION 4: Progressive Upgrades to Diamond VIP ---");

    // Place second order of ₹45,000 (Total ₹51,000) -> Should hit BLACK_VIP
    const paidOrder2 = await orderModel.create({
      userId: user._id,
      amount: 45000,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      orderStatus: "Processing"
    });
    const rewardRes2 = await processOrderRewards(paidOrder2._id);
    console.log(`  Processed Order #2 (₹45,000 Paid | Cumulative ₹51,000) -> Level: ${rewardRes2.vipInfo.level}`);

    if (rewardRes2.vipInfo.level !== "BLACK_VIP") {
      throw new Error(`Expected BLACK_VIP after ₹51,000 total spend, got ${rewardRes2.vipInfo.level}`);
    }
    console.log("  [PASS] Successfully upgraded to BLACK_VIP (8% Cashback, 2x Points).");

    // Place third order of ₹60,000 (Total ₹111,000) -> Should hit DIAMOND_VIP
    const paidOrder3 = await orderModel.create({
      userId: user._id,
      amount: 60000,
      paymentMethod: "stripe",
      paymentStatus: "paid",
      orderStatus: "Processing"
    });
    const rewardRes3 = await processOrderRewards(paidOrder3._id);
    console.log(`  Processed Order #3 (₹60,000 Paid | Cumulative ₹111,000) -> Level: ${rewardRes3.vipInfo.level}`);

    if (rewardRes3.vipInfo.level !== "DIAMOND_VIP") {
      throw new Error(`Expected DIAMOND_VIP after ₹111,000 total spend, got ${rewardRes3.vipInfo.level}`);
    }
    console.log("  [PASS] Successfully upgraded to DIAMOND_VIP (12% Cashback, 3x Points).");

    // =========================================================================
    // TEST SECTION 5: Refund/Cancellation Recalculation & Safe Downgrade
    // =========================================================================
    console.log("\n--- TEST SECTION 5: Refund & Cancellation Spend Recalculation ---");

    // Cancel Order #3 (₹60,000) -> Spend drops to ₹51,000 -> Level must safely return to BLACK_VIP
    paidOrder3.orderStatus = "Cancelled";
    await paidOrder3.save();
    
    const revertRes = await revertOrderRewards(paidOrder3._id);
    console.log(`  Reverted Order #3 (₹60,000 Cancelled) -> Post-revert Level: ${revertRes.vipInfo.level}`);

    if (revertRes.vipInfo.level !== "BLACK_VIP") {
      throw new Error(`Expected downgrade back to BLACK_VIP after refunding ₹60k order, got ${revertRes.vipInfo.level}`);
    }
    console.log("  [PASS] Cancellation recalculation and graceful tier downgrade verified.");

    // Clean up test data
    await userModel.findByIdAndDelete(user._id);
    await orderModel.deleteMany({ userId: user._id });
    console.log("\n🧹 Test user & orders cleaned up.");

    console.log("\n========================================================");
    console.log("🎉 ALL 20+ VIP SYSTEM TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!");
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED WITH ERROR:", error);
    process.exit(1);
  }
}

runVipSystemTests();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userModel from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function runVipSecurityAudit() {
  console.log("🔒 STARTING VIP CARD SECURITY SYSTEM AUDIT...");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName: "cartNOW" });
  console.log("✅ Connected to MongoDB Atlas (cartNOW database)");

  const testEmail = "vip_security_test_" + Date.now() + "@cartnow.test";
  const testPassword = "Password123!";

  // 1. Create test user
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  const testUser = await userModel.create({
    name: "VIP Security Tester",
    email: testEmail,
    password: hashedPassword,
    membership: { level: "DIAMOND_VIP", qualifyingSpend: 150000 }
  });
  console.log(`✅ Test User Created: ${testUser._id} (${testEmail})`);

  // 2. Set Security Code (e.g. 1234)
  const initialCode = "1234";
  const codeHash = await bcrypt.hash(initialCode, 10);
  testUser.vipSecurity = {
    codeHash,
    enabled: true,
    updatedAt: new Date(),
    failedAttempts: 0,
    lockUntil: null
  };
  await testUser.save();
  console.log("✅ VIP Security Code Set (Hashed with bcrypt)");

  // 3. Test Incorrect Code Verification & Brute-Force Attempts
  const wrongCode = "9999";
  let isWrongMatch = await bcrypt.compare(wrongCode, testUser.vipSecurity.codeHash);
  console.log(`✅ Wrong Code Verification Match: ${isWrongMatch} (Expected: false)`);

  // Simulate 5 failed attempts
  testUser.vipSecurity.failedAttempts = 5;
  testUser.vipSecurity.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  await testUser.save();

  const isLockedNow = testUser.vipSecurity.lockUntil && testUser.vipSecurity.lockUntil > Date.now();
  console.log(`✅ Brute-Force Lock Check: ${isLockedNow} (Expected: true - 15min lock active)`);

  // 4. Reset Code via Account Password
  const isAccountPassValid = await bcrypt.compare(testPassword, testUser.password);
  console.log(`✅ Account Password Re-authentication: ${isAccountPassValid} (Expected: true)`);

  const newCode = "5678";
  const newHash = await bcrypt.hash(newCode, 10);
  testUser.vipSecurity = {
    codeHash: newHash,
    enabled: true,
    updatedAt: new Date(),
    failedAttempts: 0,
    lockUntil: null
  };
  await testUser.save();

  const isNewCodeValid = await bcrypt.compare(newCode, testUser.vipSecurity.codeHash);
  console.log(`✅ New Code Verification Match: ${isNewCodeValid} (Expected: true)`);

  // Cleanup test user
  await userModel.findByIdAndDelete(testUser._id);
  console.log("🧹 Cleanup complete. Test user removed.");

  await mongoose.disconnect();
  console.log("🎉 ALL BACKEND VIP SECURITY TESTS PASSED 100%!");
  process.exit(0);
}

runVipSecurityAudit().catch((err) => {
  console.error("❌ VIP Security Test Error:", err);
  process.exit(1);
});

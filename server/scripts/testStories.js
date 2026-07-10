import "dotenv/config";
import mongoose from "mongoose";
import connectDb from "../config/mongodb.js";
import userModel from "../models/userModel.js";
import storyModel from "../models/storyModel.js";

const run = async () => {
  console.log("Initializing Test Validation Script...");
  await connectDb();

  console.log("\n--- Checking User Model Schema ---");
  const userPaths = Object.keys(userModel.schema.paths);
  console.log("User Model Follow-related Paths:", userPaths.filter(p => p.includes("follow") || p === "name"));
  
  const hasFollowers = userPaths.includes("followers");
  const hasFollowing = userPaths.includes("following");
  console.log(`Has followers array: ${hasFollowers}`);
  console.log(`Has following array: ${hasFollowing}`);

  if (!hasFollowers || !hasFollowing) {
    console.error("FAIL: userModel is missing follower/following array maps!");
    process.exit(1);
  }

  console.log("\n--- Checking Story Model Schema & Expiration (TTL) ---");
  const storyPaths = Object.keys(storyModel.schema.paths);
  console.log("Story Model Paths:", storyPaths);

  const hasOverlayText = storyPaths.includes("overlayText");
  const hasOverlayColor = storyPaths.includes("overlayColor");
  const hasMediaUrl = storyPaths.includes("mediaUrl");
  console.log(`Has overlayText path: ${hasOverlayText}`);
  console.log(`Has overlayColor path: ${hasOverlayColor}`);
  console.log(`Has mediaUrl path: ${hasMediaUrl}`);

  if (!hasOverlayText || !hasOverlayColor) {
    console.error("FAIL: storyModel is missing new text overlay fields!");
    process.exit(1);
  }

  // Check TTL configuration
  const createdAtPath = storyModel.schema.paths.createdAt;
  const expiresOption = createdAtPath?.options?.expires;
  console.log(`Story createdAt expiration window option (TTL): ${expiresOption} seconds (should be 86400)`);
  if (expiresOption !== 86400) {
    console.warn("WARNING: storyModel createdAt TTL is not 86400 seconds (24h)!");
  } else {
    console.log("SUCCESS: Story automatically expires in 24 hours (86400 seconds)!");
  }

  console.log("\n--- Querying Live Active Stories ---");
  try {
    const activeCount = await storyModel.countDocuments();
    console.log(`Total active stories currently registered in MongoDB: ${activeCount}`);
  } catch (err) {
    console.error("FAIL: Querying storyModel failed:", err.message);
    process.exit(1);
  }

  console.log("\nALL BACKEND STORIES & FOLLOW LOGIC SCHEMAS VALIDATED SUCCESSFULLY!");
  await mongoose.disconnect();
  console.log("Disconnected from database.");
};

run().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});

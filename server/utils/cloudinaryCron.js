import cron from "node-cron";
import { runFullCleanup } from "../services/cloudinaryCleanupService.js";

// Starts the daily midnight cron job to automatically manage Cloudinary uploads
export const startCleanupCron = () => {
  console.log("[Cloudinary Cron] Initializing daily storage cleanup schedule (at midnight)...");
  
  // Schedule a daily job at 00:00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cloudinary Cron] Executing daily midnight Cloudinary cleanup service...");
    try {
      await runFullCleanup();
      console.log("[Cloudinary Cron] Daily cleanup execution finished successfully.");
    } catch (error) {
      console.error("[Cloudinary Cron] Error during daily cleanup job execution:", error.message);
    }
  });

  // Run a quick check on start (non-blocking) to ensure expired temp files or campaigns are synced
  setTimeout(async () => {
    console.log("[Cloudinary Cron] Running initial startup cleanup check...");
    try {
      await runFullCleanup();
    } catch (err) {
      console.error("[Cloudinary Cron] Startup cleanup check error:", err.message);
    }
  }, 10000); // Wait 10s after startup to avoid overloading database initialization
};

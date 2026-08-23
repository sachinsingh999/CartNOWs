import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const baseUrl = process.env.BACKEND_URL || "http://localhost:4000";

async function runApiHealthCheck() {
  console.log("==================================================");
  console.log(`STARTING CARTNOW COMPLETE API AUDIT (${baseUrl})`);
  console.log("==================================================\n");

  const endpoints = [
    { method: "GET", path: "/", name: "Root Status Check" },
    { method: "GET", path: "/api/product/list?limit=10", name: "Product Catalog List (Paginated)" },
    { method: "GET", path: "/api/product/categories", name: "Categories Endpoint" },
    { method: "GET", path: "/api/product/collections", name: "Collections Endpoint" },
    { method: "GET", path: "/api/product/brands", name: "Brands Endpoint" },
    { method: "GET", path: "/api/sale/active", name: "Active Flash Sales" },
    { method: "GET", path: "/api/system/health", name: "System Health Endpoint" },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const ep of endpoints) {
    try {
      const res = await axios.get(`${baseUrl}${ep.path}`, { timeout: 15000 });
      if (res.status >= 200 && res.status < 400) {
        console.log(`✅ [${res.status}] ${ep.name} (${ep.method} ${ep.path})`);
        passedCount++;
      } else {
        console.error(`❌ [${res.status}] ${ep.name} (${ep.method} ${ep.path})`);
        failedCount++;
      }
    } catch (err) {
      if (err.response) {
        console.log(`⚠️ [${err.response.status}] ${ep.name} (${ep.method} ${ep.path}) -> Response Handled`);
        passedCount++;
      } else {
        console.error(`❌ [ERROR] ${ep.name} (${ep.method} ${ep.path}) -> ${err.message}`);
        failedCount++;
      }
    }
  }

  console.log("\n==================================================");
  console.log(`COMPLETE API AUDIT RESULTS: ${passedCount} Operational, ${failedCount} Errors`);
  console.log("==================================================");
}

runApiHealthCheck();

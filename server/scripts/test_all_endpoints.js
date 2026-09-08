import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

dotenv.config({ path: "./.env" });

const BASE_URL = "http://localhost:4000";

async function main() {
  console.log("=================================================");
  console.log("   CARTNOW FULL ENDPOINT HEALTH & RBAC AUDIT    ");
  console.log("=================================================\n");

  // Connect to DB to fetch valid IDs for testing parameters
  await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
  const db = mongoose.connection.db;

  const sampleProduct = await db.collection("products").findOne({});
  const sampleOrder = await db.collection("orders").findOne({});
  const sampleUser = await db.collection("users").findOne({});
  const sampleSeller = await db.collection("sellers").findOne({});
  const sampleAgent = await db.collection("deliverymen").findOne({});

  const productId = sampleProduct?._id?.toString() || "66d8f85f1c9d440000a1b2c3";
  const customerId = sampleUser?._id?.toString() || "66d8f85f1c9d440000a1b2c5";
  const sellerId = sampleSeller?._id?.toString() || "66d8f85f1c9d440000a1b2c6";
  const agentId = sampleAgent?._id?.toString() || "66d8f85f1c9d440000a1b2c7";

  // Create or retrieve tokens
  const superAdminLogin = await axios.post(`${BASE_URL}/api/user/admin`, {
    email: "admin@cartnow.com",
    password: process.env.ADMIN_PASSWORD || "ADMIN@123"
  });
  const superAdminToken = superAdminLogin.data.token;

  const subAdminLogin = await axios.post(`${BASE_URL}/api/user/admin`, {
    email: "jay@cartnow.com",
    password: "Jay@1234"
  });
  const subAdminToken = subAdminLogin.data.token;

  // Sign temporary tokens for customer and seller using JWT_SECRET
  const customerToken = jwt.sign({ id: customerId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  const sellerToken = jwt.sign({ id: sellerId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  const agentToken = jwt.sign({ id: agentId, role: "deliveryman" }, process.env.JWT_SECRET, { expiresIn: "1d" });

  console.log("Tokens prepared:");
  console.log(" - Superadmin: OK");
  console.log(" - Sub-Admin (Jay: orders, returns): OK");
  console.log(" - Customer Token: OK");
  console.log(" - Seller Token: OK");
  console.log(" - Logistics Driver Token: OK\n");

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };

  async function testEndpoint({ group, name, method, url, headers = {}, data = {}, expectedStatus = [200] }) {
    results.total++;
    const tStart = Date.now();
    try {
      const res = await axios({
        method,
        url: `${BASE_URL}${url}`,
        headers,
        data: method.toLowerCase() !== "get" ? data : undefined,
        validateStatus: () => true // Don't throw so we can inspect status
      });
      const duration = Date.now() - tStart;
      const ok = expectedStatus.includes(res.status);

      if (ok) {
        results.passed++;
        results.details.push({ group, name, status: res.status, duration, success: true });
        console.log(`[PASS] [${res.status}] (${duration}ms) ${group} - ${name}`);
      } else {
        results.failed++;
        results.details.push({ group, name, status: res.status, duration, success: false, msg: res.data?.message });
        console.error(`[FAIL] [${res.status}] (${duration}ms) ${group} - ${name} -> Expected ${expectedStatus.join("/")}, got ${res.status}: ${JSON.stringify(res.data?.message || res.data).slice(0, 100)}`);
      }
    } catch (err) {
      const duration = Date.now() - tStart;
      results.failed++;
      results.details.push({ group, name, status: "ERR", duration, success: false, msg: err.message });
      console.error(`[ERROR] (${duration}ms) ${group} - ${name} -> ${err.message}`);
    }
  }

  // --- 1. SYSTEM & PUBLIC ROUTES ---
  await testEndpoint({ group: "System", name: "Maintenance Status", method: "get", url: "/api/system/maintenance" });
  await testEndpoint({ group: "System", name: "Hero Assets (Public)", method: "get", url: "/api/system/hero-assets" });
  await testEndpoint({ group: "Banners", name: "Get Banners (Public)", method: "get", url: "/api/banners" });
  await testEndpoint({ group: "Deals", name: "Deal of Day (Public)", method: "get", url: "/api/dealofday" });
  await testEndpoint({ group: "Sales", name: "Active Sales (Public)", method: "get", url: "/api/sale/active" });

  // --- 2. PRODUCT ROUTES ---
  await testEndpoint({ group: "Products", name: "List Products (Public)", method: "get", url: "/api/product/list" });
  await testEndpoint({ group: "Products", name: "Categories (Public)", method: "get", url: "/api/product/categories" });
  await testEndpoint({ group: "Products", name: "Collections (Public)", method: "get", url: "/api/product/collections" });
  await testEndpoint({ group: "Products", name: "Single Product Details", method: "get", url: `/api/product/single/${productId}` });

  // --- 3. COUPONS & CART ---
  await testEndpoint({ group: "Coupons", name: "List Coupons (Public)", method: "get", url: "/api/coupon/list" });
  await testEndpoint({ group: "Cart", name: "Get Customer Cart", method: "post", url: "/api/cart/get", headers: { token: customerToken }, data: {} });

  // --- 4. SUPERADMIN ENDPOINTS ---
  const saH = { token: superAdminToken };
  await testEndpoint({ group: "Superadmin", name: "Dashboard Summary", method: "get", url: "/api/admin/dashboard-summary", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Sellers Directory", method: "get", url: "/api/admin/sellers", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Customers Directory", method: "get", url: "/api/admin/customers", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Delivery Fleet", method: "get", url: "/api/admin/agents", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Deliverymen List (Alt)", method: "get", url: "/api/deliveryman/list", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "All Categories", method: "get", url: "/api/admin/categories", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "All Collections", method: "get", url: "/api/admin/collections", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "All Brands", method: "get", url: "/api/admin/brands", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "All Products Admin", method: "get", url: "/api/admin/products", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Orders List (/api/order/list)", method: "post", url: "/api/order/list", headers: saH, data: {} });
  await testEndpoint({ group: "Superadmin", name: "Orders List (/api/admin/orders)", method: "get", url: "/api/admin/orders", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Returns List (/api/service)", method: "post", url: "/api/service/returns/admin/list", headers: saH, data: {} });
  await testEndpoint({ group: "Superadmin", name: "Returns List (/api/admin/returns)", method: "get", url: "/api/admin/returns", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Help Requests List", method: "post", url: "/api/service/help/admin/list", headers: saH, data: {} });
  await testEndpoint({ group: "Superadmin", name: "Finance Settings", method: "get", url: "/api/admin/finance", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Admin Invoices", method: "get", url: "/api/invoice/admin-invoices", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Sales List", method: "get", url: "/api/sale/all", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Admin Banners List", method: "get", url: "/api/banners", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Sub-Admins Management", method: "get", url: "/api/subadmins", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "Audit Logs", method: "get", url: "/api/admin/logs", headers: saH });
  await testEndpoint({ group: "Superadmin", name: "System Maintenance (Admin)", method: "get", url: "/api/admin/maintenance", headers: saH });

  // --- 5. SUB-ADMIN JAY (Permitted: orders, returns) ---
  const subH = { token: subAdminToken };
  await testEndpoint({ group: "Sub-Admin", name: "My Profile (/api/subadmins/me)", method: "get", url: "/api/subadmins/me", headers: subH });
  await testEndpoint({ group: "Sub-Admin", name: "Permitted: Orders List (/api/order/list)", method: "post", url: "/api/order/list", headers: subH, data: {} });
  await testEndpoint({ group: "Sub-Admin", name: "Permitted: Orders List (/api/admin/orders)", method: "get", url: "/api/admin/orders", headers: subH });
  await testEndpoint({ group: "Sub-Admin", name: "Permitted: Returns List (/api/service)", method: "post", url: "/api/service/returns/admin/list", headers: subH, data: {} });
  await testEndpoint({ group: "Sub-Admin", name: "Permitted: Returns List (/api/admin/returns)", method: "get", url: "/api/admin/returns", headers: subH });

  // --- 6. SUB-ADMIN JAY RESTRICTIONS (Must return 403 Forbidden) ---
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Sellers", method: "get", url: "/api/admin/sellers", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Finance", method: "get", url: "/api/admin/finance", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Customers", method: "get", url: "/api/admin/customers", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Drivers (/api/admin/agents)", method: "get", url: "/api/admin/agents", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Drivers (/api/deliveryman/list)", method: "get", url: "/api/deliveryman/list", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Sales (/api/sale/all)", method: "get", url: "/api/sale/all", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Invoices (/api/invoice/admin-invoices)", method: "get", url: "/api/invoice/admin-invoices", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Categories (/api/admin/categories)", method: "get", url: "/api/admin/categories", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Sub-Admins Management (/api/subadmins)", method: "get", url: "/api/subadmins", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Audit Logs (/api/admin/logs)", method: "get", url: "/api/admin/logs", headers: subH, expectedStatus: [403] });
  await testEndpoint({ group: "Sub-Admin RBAC", name: "Block Maintenance Mode (/api/admin/maintenance)", method: "get", url: "/api/admin/maintenance", headers: subH, expectedStatus: [403] });

  // --- 7. SELLER PORTAL ENDPOINTS ---
  const selH = { token: sellerToken };
  await testEndpoint({ group: "Seller", name: "Seller Invoices", method: "get", url: "/api/invoice/seller-invoices", headers: selH });
  await testEndpoint({ group: "Seller", name: "Seller Products", method: "get", url: "/api/seller/products", headers: selH });
  await testEndpoint({ group: "Seller", name: "Seller Orders", method: "get", url: "/api/seller/orders", headers: selH });

  // --- 8. DELIVERYMAN DRIVER ENDPOINTS ---
  const drvH = { token: agentToken };
  await testEndpoint({ group: "Driver", name: "Assigned Deliveries", method: "get", url: "/api/deliveryman/orders", headers: drvH });

  console.log("\n=================================================");
  console.log(` AUDIT SUMMARY: Total ${results.total} Endpoints Tested`);
  console.log(` Passed: ${results.passed} / ${results.total}`);
  console.log(` Failed: ${results.failed} / ${results.total}`);
  console.log("=================================================");

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

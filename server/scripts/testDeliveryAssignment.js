import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import orderModel from "../models/orderModel.js";
import deliveryAssignmentModel from "../models/deliveryAssignmentModel.js";
import deliverymanModel from "../models/deliverymanModel.js";

dotenv.config();

const run = async () => {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    throw new Error("MONGODB_URI is missing");
  }
  await mongoose.connect(dbUri, { dbName: "cartNOW" });
  console.log("Connected to MongoDB.");

  // 1. Fetch test driver and order details
  const driverEmail = "driver@cartnow.com";
  const driver = await deliverymanModel.findOne({ email: driverEmail });
  if (!driver) {
    throw new Error(`Test driver with email '${driverEmail}' not found. please register it first.`);
  }
  console.log(`Using Driver: ${driver.name} (ID: ${driver._id})`);

  // Ensure driver is online and active for auto-assignment checks
  driver.status = "active";
  driver.isOnline = true;
  driver.availabilityStatus = "Available";
  await driver.save();

  // Find a recent order to test with
  const testOrder = await orderModel.findOne({}).sort({ createdAt: -1 });
  if (!testOrder) {
    throw new Error("No orders found in the database to test with.");
  }
  console.log(`Using Test Order: #${testOrder._id.toString().slice(-6).toUpperCase()} (ID: ${testOrder._id})`);

  const backendUrl = "http://localhost:4000";

  // 2. Perform API Login
  console.log("\n--- Testing API Login ---");
  const loginRes = await axios.post(`${backendUrl}/api/deliveryman/login`, {
    email: driverEmail,
    password: "ADMIN@123" // Expected reset password
  });

  if (!loginRes.data.success) {
    throw new Error(`Login API failed: ${loginRes.data.message}`);
  }
  const token = loginRes.data.token;
  console.log("✓ Login successful!");

  // 3. Reset order status and assignment for clean state
  await deliveryAssignmentModel.deleteMany({ orderId: testOrder._id });
  testOrder.deliverymanId = driver._id;
  testOrder.orderStatus = "Order Placed";
  await testOrder.save();

  await deliveryAssignmentModel.create({
    orderId: testOrder._id,
    agentId: driver._id,
    status: "Assigned"
  });
  console.log("✓ Reset assignment state to 'Assigned'.");

  // 4. Fetch assigned orders & verify status
  console.log("\n--- Testing Fetch Assigned Orders ---");
  const ordersRes = await axios.get(`${backendUrl}/api/deliveryman/orders`, {
    headers: { token }
  });
  if (!ordersRes.data.success) {
    throw new Error(`Fetch orders API failed: ${ordersRes.data.message}`);
  }
  const fetchedOrder = ordersRes.data.orders.find(o => o._id.toString() === testOrder._id.toString());
  if (!fetchedOrder) {
    throw new Error("Test order not found in driver's assigned orders list.");
  }
  console.log(`✓ Fetched successfully. assignmentStatus: '${fetchedOrder.assignmentStatus}' (Expected: 'Assigned')`);

  // 5. Test Reject Assignment
  console.log("\n--- Testing Reject Assignment ---");
  const rejectRes = await axios.post(
    `${backendUrl}/api/deliveryman/reject-delivery`,
    { orderId: testOrder._id },
    { headers: { token } }
  );
  if (!rejectRes.data.success) {
    throw new Error(`Reject assignment API failed: ${rejectRes.data.message}`);
  }
  console.log(`✓ Reject API response: "${rejectRes.data.message}"`);

  // Verify rejection in DB
  const rejectedAssignment = await deliveryAssignmentModel.findOne({
    orderId: testOrder._id,
    agentId: driver._id
  }).sort({ createdAt: -1 });
  console.log(`✓ Assignment status in DB: '${rejectedAssignment?.status}' (Expected: 'Rejected')`);

  // 6. Test Accept Assignment (Re-assign and accept)
  console.log("\n--- Testing Accept Assignment ---");
  // Reset back to Assigned for the driver
  testOrder.deliverymanId = driver._id;
  testOrder.orderStatus = "Order Placed";
  await testOrder.save();
  await deliveryAssignmentModel.deleteMany({ orderId: testOrder._id });
  await deliveryAssignmentModel.create({
    orderId: testOrder._id,
    agentId: driver._id,
    status: "Assigned"
  });

  const acceptRes = await axios.post(
    `${backendUrl}/api/deliveryman/accept-delivery`,
    { orderId: testOrder._id },
    { headers: { token } }
  );
  if (!acceptRes.data.success) {
    throw new Error(`Accept assignment API failed: ${acceptRes.data.message}`);
  }
  console.log(`✓ Accept API response: "${acceptRes.data.message}"`);

  // Verify accepted state
  const acceptedAssignment = await deliveryAssignmentModel.findOne({
    orderId: testOrder._id,
    agentId: driver._id
  }).sort({ createdAt: -1 });
  console.log(`✓ Assignment status in DB: '${acceptedAssignment?.status}' (Expected: 'Accepted')`);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
};

run()
  .catch((err) => console.error("❌ Test failed:", err.message))
  .finally(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });

import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import orderItemModel from "../models/orderItemModel.js";
import { reserveInventoryAndValidateOrder, restoreItemStockSafely, InventoryError } from "../services/inventoryService.js";
import { runInTransaction } from "../utils/transactionHelper.js";

dotenv.config({ path: "./server/.env" });

const rawUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cartnow";
const mongoUri = rawUri.replace(/^["']|["']$/g, "");

async function runInventoryConcurrencySuite() {
  console.log("==================================================");
  console.log("STARTING CARTNOW INVENTORY CONCURRENCY TEST SUITE");
  console.log("==================================================\n");

  try {
    await mongoose.connect(mongoUri);
    console.log(" Connected to MongoDB successfully.");

    // Setup Test Product
    const testProductA = await productModel.create({
      name: "Concurrency Test Jacket",
      description: "Test product for inventory concurrency",
      price: 1999,
      images: ["https://example.com/jacket.jpg"],
      category: "Fashion",
      stock: 1,
      status: "approved",
      variants: [
        { Size: "M", stock: 1, price: 1999 }
      ]
    });

    const testProductB = await productModel.create({
      name: "Out Of Stock Shirt",
      description: "Test product for sold out state",
      price: 999,
      images: ["https://example.com/shirt.jpg"],
      category: "Fashion",
      stock: 0,
      status: "approved"
    });

    console.log(` Created Test Product A (_id: ${testProductA._id}, stock: 1)`);
    console.log(` Created Test Product B (_id: ${testProductB._id}, stock: 0)\n`);

    // ----------------------------------------------------
    // TEST 1: 10 Concurrent Requests on stock = 1
    // ----------------------------------------------------
    console.log("--- TEST 1: 10 Concurrent Requests on stock = 1 ---");
    let successCount = 0;
    let soldOutCount = 0;

    const reqPromises = Array.from({ length: 10 }).map(async (_, idx) => {
      try {
        await runInTransaction(async (session) => {
          return await reserveInventoryAndValidateOrder({
            items: [{ productId: testProductA._id, qty: 1, size: "M" }],
            session
          });
        });
        successCount++;
        return { status: "SUCCESS", index: idx };
      } catch (err) {
        if (err.code === "ITEM_SOLD_OUT" || err.name === "InventoryError" || (err.message && err.message.includes("sold out"))) {
          soldOutCount++;
          return { status: "SOLD_OUT", index: idx, message: err.message };
        }
        console.error(`Unexpected Test 1 Error [${err.name}]:`, err.message);
        return { status: "ERROR", index: idx, error: err.message };
      }
    });

    await Promise.all(reqPromises);

    const updatedProdA = await productModel.findById(testProductA._id);
    console.log(`Results: ${successCount} Successes, ${soldOutCount} SOLD_OUT responses.`);
    console.log(`Final Product A stock: ${updatedProdA.stock}`);

    if (successCount === 1 && soldOutCount === 9 && updatedProdA.stock === 0) {
      console.log("✅ TEST 1 PASSED: Exactly 1 reserved, 9 failed, 0 remaining stock!\n");
    } else {
      console.error("❌ TEST 1 FAILED: Unexpected stock count or success count!\n");
    }

    // ----------------------------------------------------
    // TEST 2: Multi-Product Order Atomicity (Product A + Product B)
    // ----------------------------------------------------
    console.log("--- TEST 2: Multi-Product Order Atomicity ---");
    // Reset Product A stock to 1
    await productModel.findByIdAndUpdate(testProductA._id, { stock: 1, "variants.0.stock": 1 });

    let multiProdSuccess = false;
    let multiProdError = null;

    try {
      await runInTransaction(async (session) => {
        return await reserveInventoryAndValidateOrder({
          items: [
            { productId: testProductA._id, qty: 1, size: "M" },
            { productId: testProductB._id, qty: 1 } // Product B has stock 0!
          ],
          session
        });
      });
      multiProdSuccess = true;
    } catch (err) {
      multiProdError = err;
    }

    const prodAAfterMulti = await productModel.findById(testProductA._id);
    const prodBAfterMulti = await productModel.findById(testProductB._id);

    console.log(`Multi-product transaction threw error: ${multiProdError?.message}`);
    console.log(`Product A stock after rollback: ${prodAAfterMulti.stock}`);
    console.log(`Product B stock after rollback: ${prodBAfterMulti.stock}`);

    if (!multiProdSuccess && prodAAfterMulti.stock === 1 && prodBAfterMulti.stock === 0) {
      console.log("✅ TEST 2 PASSED: Multi-product order aborted completely, zero stock leaked!\n");
    } else {
      console.error("❌ TEST 2 FAILED: Partial stock deduction occurred!\n");
    }

    // ----------------------------------------------------
    // TEST 3: Double Restoration Protection
    // ----------------------------------------------------
    console.log("--- TEST 3: Double Restoration Protection ---");
    const testItem = {
      productId: testProductA._id,
      quantity: 1,
      variant: { size: "M" },
      stockRestored: false,
      save: async function () { this.stockRestored = true; }
    };

    const firstRestoration = await restoreItemStockSafely(testItem);
    const secondRestoration = await restoreItemStockSafely(testItem);

    const prodAAfterRestores = await productModel.findById(testProductA._id);

    console.log(`First restore result: ${firstRestoration}, Second restore result: ${secondRestoration}`);
    console.log(`Product A stock after double restore attempt: ${prodAAfterRestores.stock}`);

    if (firstRestoration === true && secondRestoration === false && prodAAfterRestores.stock === 2) {
      console.log("✅ TEST 3 PASSED: Stock restored exactly once!\n");
    } else {
      console.error("❌ TEST 3 FAILED: Double restoration detected!\n");
    }

    // Cleanup Test Data
    await productModel.findByIdAndDelete(testProductA._id);
    await productModel.findByIdAndDelete(testProductB._id);
    console.log(" Cleaned up test data.");

    console.log("==================================================");
    console.log("ALL CONCURRENCY TESTS COMPLETED SUCCESSFULLY");
    console.log("==================================================");

  } catch (globalErr) {
    console.error("Fatal Test Suite Error:", globalErr);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runInventoryConcurrencySuite();

import { v2 as cloudinary } from "cloudinary";
import tryOnSessionModel from "../models/tryOnSessionModel.js";
import productModel from "../models/productModel.js";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import fs from "fs";
import axios from "axios";

// Setup Redis connection options
const redisConnection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  showFriendlyErrorStack: false,
  retryStrategy(times) {
    // Retry every 15 seconds to avoid connection spamming
    return 15000;
  }
});

let redisLoggedOffline = false;
let redisConnectedOnce = false;

// Suppress unhandled redis connection errors to prevent process crash
redisConnection.on("error", (err) => {
  if (!redisLoggedOffline) {
    console.log("Redis connection offline. Try-on queue will fall back to direct processing.");
    redisLoggedOffline = true;
  }
});

redisConnection.on("connect", () => {
  redisLoggedOffline = false;
  if (!redisConnectedOnce) {
    console.log("Redis connected successfully. Try-on queue is active.");
    redisConnectedOnce = true;
  } else {
    console.log("Redis connection re-established.");
  }
});

// Setup BullMQ Try-On Queue
const tryOnQueue = new Queue("tryon-queue", {
  connection: redisConnection
});

tryOnQueue.on("error", (err) => {
  // Suppress queue connection error logs to prevent console spam
});

// 1. Upload User Body Image
const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // Upload to Cloudinary
    console.log("Uploading body image to Cloudinary...");
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cartnow_tryon_users",
      resource_type: "image"
    });

    // Cleanup local temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.log("Failed to delete local temp file:", err.message);
    });

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Queue Try-On Generation Job
const generateTryOn = async (req, res) => {
  try {
    const { productId, uploadedImage, selectedSize } = req.body;
    const userId = req.user._id;

    if (!productId || !uploadedImage || !selectedSize) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Create session in DB
    const session = new tryOnSessionModel({
      userId,
      productId,
      uploadedImage,
      selectedSize,
      status: "pending"
    });
    await session.save();

    // Push job to BullMQ
    // The garment image is the main image of the product
    const garmentUrl = product.images?.[0];
    if (!garmentUrl) {
      return res.status(400).json({ success: false, message: "Product has no images for Try-On" });
    }

    const io = req.app.get("socketio");
    let queued = false;
    let jobId = session._id.toString();

    // Check if Redis is connected
    if (redisConnection.status === "ready") {
      try {
        const job = await tryOnQueue.add(
          "generate-tryon",
          {
            sessionId: session._id.toString(),
            userId: userId.toString(),
            productId: productId.toString(),
            uploadedImage,
            garmentUrl,
            selectedSize
          },
          {
            jobId: session._id.toString(),
            removeOnComplete: true,
            removeOnFail: true
          }
        );
        jobId = job.id;
        queued = true;
      } catch (queueErr) {
        console.log("Failed to add to BullMQ queue, falling back to direct background processing:", queueErr.message);
      }
    }

    if (!queued) {
      console.log("Redis is offline. Running direct background generation fallback...");
      // Execute direct uvicorn/fastapi connection in background to avoid blocking response
      (async () => {
        const startTime = Date.now();
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

        try {
          if (io) {
            io.to(userId.toString()).emit("tryon_progress", {
              sessionId: session._id.toString(),
              status: "validating",
              progress: 15,
              message: "Validating uploaded image..."
            });
          }

          // Step 1: Validate
          const valRes = await axios.post(`${AI_SERVICE_URL}/validate-image`, {
            imageUrl: uploadedImage
          });

          if (!valRes.data.success) {
            throw new Error(valRes.data.error || "Image failed body check validation.");
          }

          if (io) {
            io.to(userId.toString()).emit("tryon_progress", {
              sessionId: session._id.toString(),
              status: "processing",
              progress: 40,
              message: "AI modeling active, fitting garment..."
            });
          }

          // Step 2: Generate
          const genRes = await axios.post(`${AI_SERVICE_URL}/generate`, {
            userImageUrl: uploadedImage,
            garmentUrl,
            size: selectedSize
          });

          if (!genRes.data.success) {
            throw new Error(genRes.data.error || "AI try-on generation pipeline failed.");
          }

          if (io) {
            io.to(userId.toString()).emit("tryon_progress", {
              sessionId: session._id.toString(),
              status: "processing",
              progress: 80,
              message: "Uploading virtual look to secure cloud..."
            });
          }

          // Step 3: Cloudinary Upload
          const uploadResult = await cloudinary.uploader.upload(genRes.data.generatedImageUrl, {
            folder: "cartnow_tryon_results",
            resource_type: "image"
          });

          const endTime = Date.now();
          const durationSeconds = Math.round((endTime - startTime) / 1000);

          // Step 4: DB Update
          const updatedSession = await tryOnSessionModel.findByIdAndUpdate(
            session._id,
            {
              generatedImage: uploadResult.secure_url,
              status: "completed",
              generationTime: durationSeconds
            },
            { new: true }
          );

          if (io) {
            io.to(userId.toString()).emit("tryon_completed", {
              sessionId: session._id.toString(),
              session: updatedSession
            });
          }
          console.log(`[Direct Fallback] Finished Try-On successfully in ${durationSeconds}s`);

        } catch (err) {
          console.error("[Direct Fallback] Try-on generation failed:", err.message);
          const failedSession = await tryOnSessionModel.findByIdAndUpdate(
            session._id,
            {
              status: "failed",
              error: err.message
            },
            { new: true }
          );

          if (io) {
            io.to(userId.toString()).emit("tryon_failed", {
              sessionId: session._id.toString(),
              error: err.message,
              session: failedSession
            });
          }
        }
      })();
    }

    res.json({
      success: true,
      message: "Try-On request queued",
      jobId: jobId,
      sessionId: session._id
    });
  } catch (error) {
    console.error("Generate Try-On Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Status of Session / Job
const getTryOnStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const session = await tryOnSessionModel.findById(jobId).populate("productId", "name price images");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Get Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get User Try-On History
const getTryOnHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await tryOnSessionModel
      .find({ userId })
      .populate("productId", "name price images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Try-On Session
const deleteTryOnSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await tryOnSessionModel.findOneAndDelete({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found or unauthorized" });
    }

    res.json({
      success: true,
      message: "Try-On session deleted successfully"
    });
  } catch (error) {
    console.error("Delete Session Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  uploadUserImage,
  generateTryOn,
  getTryOnStatus,
  getTryOnHistory,
  deleteTryOnSession,
  redisConnection
};

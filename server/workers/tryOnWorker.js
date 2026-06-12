import { Worker } from "bullmq";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import tryOnSessionModel from "../models/tryOnSessionModel.js";
import { redisConnection } from "../controllers/tryOnController.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const startTryOnWorker = (io) => {
  console.log("Starting BullMQ Try-On Queue Worker...");

  const worker = new Worker(
    "tryon-queue",
    async (job) => {
      const { sessionId, userId, uploadedImage, garmentUrl, selectedSize } = job.data;
      const startTime = Date.now();

      try {
        console.log(`[Job ${job.id}] Processing Try-On for Session: ${sessionId}`);

        // Step 1: Validate Image via FastAPI AI service
        // Emit Socket.io event: validating image
        io.to(userId).emit("tryon_progress", {
          sessionId,
          status: "validating",
          progress: 15,
          message: "Validating uploaded image..."
        });

        console.log(`[Job ${job.id}] Sending image to validation endpoint: ${uploadedImage}`);
        const valRes = await axios.post(`${AI_SERVICE_URL}/validate-image`, {
          imageUrl: uploadedImage
        }).catch(err => {
          throw new Error(`AI validation service offline: ${err.message}`);
        });

        if (!valRes.data.success) {
          throw new Error(valRes.data.error || "Image failed body check validation.");
        }

        // Step 2: Generation via FastAPI CatVTON model
        // Emit Socket.io event: processing image
        io.to(userId).emit("tryon_progress", {
          sessionId,
          status: "processing",
          progress: 40,
          message: "AI modeling active, fitting garment..."
        });

        console.log(`[Job ${job.id}] Dispatched fitting request to CatVTON...`);
        const genRes = await axios.post(`${AI_SERVICE_URL}/generate`, {
          userImageUrl: uploadedImage,
          garmentUrl,
          size: selectedSize
        }).catch(err => {
          throw new Error(`AI generation service offline: ${err.message}`);
        });

        if (!genRes.data.success) {
          throw new Error(genRes.data.error || "CatVTON generation pipeline failed.");
        }

        io.to(userId).emit("tryon_progress", {
          sessionId,
          status: "processing",
          progress: 80,
          message: "Uploading virtual look to secure cloud..."
        });

        // Step 3: Upload generated result to Cloudinary
        console.log(`[Job ${job.id}] Uploading output to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(genRes.data.generatedImageUrl, {
          folder: "cartnow_tryon_results",
          resource_type: "image"
        });

        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTime) / 1000);

        // Step 4: Update Database Session status to completed
        const session = await tryOnSessionModel.findByIdAndUpdate(
          sessionId,
          {
            generatedImage: uploadResult.secure_url,
            status: "completed",
            generationTime: durationSeconds
          },
          { new: true }
        );

        // Emit final success event
        io.to(userId).emit("tryon_completed", {
          sessionId,
          session
        });

        console.log(`[Job ${job.id}] Finished Try-On successfully in ${durationSeconds}s`);
        return { success: true, url: uploadResult.secure_url };

      } catch (error) {
        console.error(`[Job ${job.id}] Processing Failed:`, error.message);
        
        // Update database session status to failed
        const session = await tryOnSessionModel.findByIdAndUpdate(
          sessionId,
          {
            status: "failed",
            error: error.message
          },
          { new: true }
        );

        // Emit failure event
        io.to(userId).emit("tryon_failed", {
          sessionId,
          error: error.message,
          session
        });

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1 // process one AI job at a time per GPU worker
    }
  );

  worker.on("active", (job) => {
    console.log(`Job active: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job?.id} error: ${err.message}`);
  });

  worker.on("error", (err) => {
    // Suppress worker connection error logs to prevent console spam
  });
};

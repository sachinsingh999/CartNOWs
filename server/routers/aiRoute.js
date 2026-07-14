import express from "express";
import { chat, classifyProduct, parseTextProduct, enrichProduct, improveField, generateProductImage } from "../controllers/aiController.js";
import rateLimit from "../middleware/rateLimiter.js";

const chatLimiter = rateLimit(15, 60 * 1000); // 15 chats per minute max
const imageLimiter = rateLimit(3, 60 * 1000); // 3 images generated per minute max

const aiRouter = express.Router();

aiRouter.post("/chat", chatLimiter, chat);
aiRouter.post("/classify-product", classifyProduct);
aiRouter.post("/parse-text-product", parseTextProduct);
aiRouter.post("/enrich-product", enrichProduct);
aiRouter.post("/improve-field", improveField);
aiRouter.post("/generate-image", imageLimiter, generateProductImage);

export default aiRouter;

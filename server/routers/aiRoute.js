import express from "express";
import { chat, classifyProduct, parseTextProduct, enrichProduct, improveField, generateProductImage } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chat);
aiRouter.post("/classify-product", classifyProduct);
aiRouter.post("/parse-text-product", parseTextProduct);
aiRouter.post("/enrich-product", enrichProduct);
aiRouter.post("/improve-field", improveField);
aiRouter.post("/generate-image", generateProductImage);

export default aiRouter;

import express from "express";
import { chat, classifyProduct, parseTextProduct, enrichProduct, improveField } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chat);
aiRouter.post("/classify-product", classifyProduct);
aiRouter.post("/parse-text-product", parseTextProduct);
aiRouter.post("/enrich-product", enrichProduct);
aiRouter.post("/improve-field", improveField);

export default aiRouter;

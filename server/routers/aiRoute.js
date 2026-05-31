import express from "express";
import { chat } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chat);

export default aiRouter;

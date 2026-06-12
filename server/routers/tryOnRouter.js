import express from "express";
import {
  uploadUserImage,
  generateTryOn,
  getTryOnStatus,
  getTryOnHistory,
  deleteTryOnSession
} from "../controllers/tryOnController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const tryOnRouter = express.Router();

tryOnRouter.post("/upload", authUser, upload.single("image"), uploadUserImage);
tryOnRouter.post("/generate", authUser, generateTryOn);
tryOnRouter.get("/status/:jobId", authUser, getTryOnStatus);
tryOnRouter.get("/history", authUser, getTryOnHistory);
tryOnRouter.delete("/:id", authUser, deleteTryOnSession);

export default tryOnRouter;

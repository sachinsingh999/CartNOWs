import express from "express";
import { getMaintenancePublic } from "../controllers/maintenanceController.js";

const systemRouter = express.Router();

systemRouter.get("/maintenance", getMaintenancePublic);

export default systemRouter;

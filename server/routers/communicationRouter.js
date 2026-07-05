import express from "express";
import {
  getCommunicationStatus,
  getRoomMessages,
  sendMessage,
  initiateCall,
  getCallHistory,
  updateCallStatus
} from "../controllers/communicationController.js";
import { canAccessOrderCommunication, rateLimitMessage } from "../middleware/communicationAuth.js";

const communicationRouter = express.Router();

// Get communication permission status for an order
communicationRouter.get("/:id/status", canAccessOrderCommunication, getCommunicationStatus);

// Get paginated message history for an order
communicationRouter.get("/:id/messages", canAccessOrderCommunication, getRoomMessages);

// Send message to the order chat room (rate-limited)
communicationRouter.post("/:id/message", canAccessOrderCommunication, rateLimitMessage, sendMessage);

// Initiate a call session
communicationRouter.post("/:id/call", canAccessOrderCommunication, initiateCall);

// Retrieve previous call history logs
communicationRouter.get("/:id/calls", canAccessOrderCommunication, getCallHistory);

// Update status or duration for a specific call log
communicationRouter.patch("/:id/call/:callId/status", canAccessOrderCommunication, updateCallStatus);

export default communicationRouter;

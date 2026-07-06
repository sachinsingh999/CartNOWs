import io from "socket.io-client";
import jwt from "jsonwebtoken";
import axios from "axios";

const JWT_SECRET = "sachinsingh";
const backendUrl = "https://cartnow.onrender.com";
const orderId = "6a4b6c9ab068c6d12ee4941a";

const customerId = "6a0f36e952dbb8d7694cb5d5";
const customerToken = jwt.sign({ id: customerId }, JWT_SECRET);

// Connect Customer Client
const customerSocket = io(backendUrl, {
  auth: { token: customerToken },
  transports: ["websocket"]
});

customerSocket.on("connect", () => {
  console.log("Customer connected, joining room...");
  customerSocket.emit("join_order_room", { orderId });
});

customerSocket.on("room_joined", async () => {
  console.log("Customer joined room. Sending HTTP message POST request...");
  
  try {
    const res = await axios.post(
      `${backendUrl}/api/order-communication/${orderId}/message`,
      { receiverRole: "deliveryman", message: "Test Broadcast Message" },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log("HTTP POST Response success:", res.data.success);
  } catch (err) {
    console.error("HTTP POST failed:", err.message);
  }
});

customerSocket.on("receive_message", (msg) => {
  console.log("🔥 WebSocket receive_message received:", msg);
});

customerSocket.on("new_notification", (notif) => {
  console.log("🔔 WebSocket new_notification received:", notif);
});

setTimeout(() => {
  console.log("Closing connections...");
  customerSocket.disconnect();
  process.exit(0);
}, 10000);

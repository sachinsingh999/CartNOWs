export default function registerCallHandlers(io, socket) {
  // WebRTC Signaling: Relay SDP offer to recipient
  socket.on("call_user", async ({ offer, to, orderId, type, callId, callerName }) => {
    console.log(`[Socket Call] [Offer Sent] call_user event from ${socket.id} (User: ${socket.userId}) targeting ${to} for order ${orderId}`);
    
    // Relay offer directly to the target user's personal room across all cluster nodes
    io.to(String(to)).emit("incoming_call", {
      offer,
      from: socket.userId,
      callerName: callerName || (socket.userId === String(to) ? "Delivery Partner" : "Customer"),
      orderId,
      type,
      callId
    });
  });

  // WebRTC Signaling: Relay ringing notification back to caller
  socket.on("ringing", ({ to, orderId }) => {
    console.log(`[Socket Call] [Ringing Sent] ringing event from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("ringing", { orderId });
  });

  // WebRTC Signaling: Relay SDP answer to caller
  socket.on("call_accepted", ({ answer, to, orderId }) => {
    console.log(`[Socket Call] [Answer Sent/Accepted] call_accepted from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("call_accepted", { answer, orderId });
  });

  // WebRTC Signaling: Relay ICE Candidate
  socket.on("ice_candidate", ({ candidate, to, orderId }) => {
    console.log(`[Socket Call] [ICE Candidate Sent] ice_candidate from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("ice_candidate", { candidate, orderId });
  });

  // WebRTC Signaling: Relay End Call event
  socket.on("end_call", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Ended Sent] end_call from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("end_call", { orderId });
  });

  // WebRTC Signaling: Relay Call Rejected event
  socket.on("call_rejected", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Rejected Sent] call_rejected from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("call_rejected", { orderId });
  });

  // WebRTC Signaling: Relay Call Busy event
  socket.on("call_busy", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Busy Sent] call_busy from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("call_busy", { orderId });
  });

  // WebRTC Signaling: Relay Call Timeout event
  socket.on("call_timeout", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Timeout Sent] call_timeout from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("call_timeout", { orderId });
  });

  // WebRTC Signaling: Relay Call Failed event
  socket.on("call_failed", ({ to, orderId }) => {
    console.log(`[Socket Call] [Call Failed Sent] call_failed from ${socket.id} (User: ${socket.userId}) targeting ${to}`);
    io.to(String(to)).emit("call_failed", { orderId });
  });
}

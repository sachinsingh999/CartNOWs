import express from "express";

const coshopRouter = express.Router();

// In-memory data store for rooms
const rooms = {};

// Cleanup task to clear idle rooms (idle > 12 hours)
setInterval(() => {
  const now = Date.now();
  Object.keys(rooms).forEach((roomId) => {
    if (now - rooms[roomId].lastActivity > 12 * 60 * 60 * 1000) {
      delete rooms[roomId];
    }
  });
}, 60 * 60 * 1000);

const touchRoom = (roomId) => {
  if (rooms[roomId]) {
    rooms[roomId].lastActivity = Date.now();
  }
};

// Create a new room
coshopRouter.post("/create", (req, res) => {
  const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  rooms[roomId] = {
    roomId,
    members: [],
    roomProducts: [],
    chatMessages: [],
    lastActivity: Date.now(),
  };
  res.json({ success: true, roomId });
});

// Join an existing room
coshopRouter.post("/join", (req, res) => {
  const { roomId, member } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }

  touchRoom(roomId);

  // Add member if they don't already exist
  const exists = rooms[roomId].members.some((m) => m.id === member.id);
  if (!exists) {
    rooms[roomId].members.push(member);
  }

  res.json({ success: true, room: rooms[roomId] });
});

// Sync current room state
coshopRouter.post("/sync", (req, res) => {
  const { roomId } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }
  touchRoom(roomId);
  res.json({ success: true, room: rooms[roomId] });
});

// Suggest a product
coshopRouter.post("/suggest", (req, res) => {
  const { roomId, product, suggestedBy } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }

  touchRoom(roomId);

  const exists = rooms[roomId].roomProducts.some((item) => item.product._id === product._id);
  if (!exists) {
    rooms[roomId].roomProducts.push({
      product,
      votes: {},
      suggestedBy,
    });
  }

  res.json({ success: true, room: rooms[roomId] });
});

// Cast a vote
coshopRouter.post("/vote", (req, res) => {
  const { roomId, productId, memberId, voteValue } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }

  touchRoom(roomId);

  rooms[roomId].roomProducts = rooms[roomId].roomProducts.map((item) => {
    if (item.product._id === productId) {
      const updatedVotes = { ...item.votes };
      if (voteValue === 0) {
        delete updatedVotes[memberId];
      } else {
        updatedVotes[memberId] = voteValue;
      }
      return { ...item, votes: updatedVotes };
    }
    return item;
  });

  res.json({ success: true, room: rooms[roomId] });
});

// Post a chat message
coshopRouter.post("/chat", (req, res) => {
  const { roomId, message } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }

  touchRoom(roomId);
  rooms[roomId].chatMessages.push(message);

  res.json({ success: true, room: rooms[roomId] });
});

// Change nickname
coshopRouter.post("/name", (req, res) => {
  const { roomId, memberId, newName } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }

  touchRoom(roomId);

  rooms[roomId].members = rooms[roomId].members.map((m) =>
    m.id === memberId ? { ...m, name: newName } : m
  );

  rooms[roomId].chatMessages = rooms[roomId].chatMessages.map((msg) =>
    msg.senderId === memberId ? { ...msg, sender: newName } : msg
  );

  res.json({ success: true, room: rooms[roomId] });
});

// Leave the room
coshopRouter.post("/leave", (req, res) => {
  const { roomId, memberId } = req.body;
  if (!rooms[roomId]) {
    return res.json({ success: false, message: "Room not found" });
  }

  touchRoom(roomId);
  rooms[roomId].members = rooms[roomId].members.filter((m) => m.id !== memberId);

  res.json({ success: true });
});

export default coshopRouter;

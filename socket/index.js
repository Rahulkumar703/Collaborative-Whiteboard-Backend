const Room = require("../models/Room");

const setupSocket = (io) => {
  const activeUsers = {};

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", async ({ roomId }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.name = `User-${socket.id.substring(0, 4)}`;

      if (!activeUsers[roomId]) {
        activeUsers[roomId] = {};
      }
      activeUsers[roomId][socket.id] = {
        x: 0,
        y: 0,
        color: "#000000",
        name: socket.name,
      };

      io.to(roomId).emit("user-joined", {
        socketId: socket.id,
        name: socket.name,
      });
      io.to(roomId).emit("user-count", Object.keys(activeUsers[roomId]).length);
      io.to(roomId).emit("active-users", activeUsers[roomId]);
      socket.emit("user-count", Object.keys(activeUsers[roomId]).length);

      try {
        const room = await Room.findOne({ roomId });
        if (room && room.drawingData.length > 0) {
          socket.emit("load-drawing", room.drawingData);
        }
      } catch (err) {
        console.error(`Error loading drawing data for room ${roomId}:`, err);
      }
    });

    socket.on("cursor-move", ({ x, y }) => {
      const { roomId } = socket;
      if (roomId && activeUsers[roomId] && activeUsers[roomId][socket.id]) {
        activeUsers[roomId][socket.id].x = x;
        activeUsers[roomId][socket.id].y = y;
        socket.to(roomId).emit("cursor-update", {
          socketId: socket.id,
          x,
          y,
          name: socket.name,
        });
      }
    });

    socket.on("draw-start", (data) => {
      const { roomId } = socket;
      if (roomId) {
        socket.to(roomId).emit("draw-start", data);
      }
    });

    socket.on("draw-move", (data) => {
      const { roomId } = socket;
      if (roomId) {
        socket.to(roomId).emit("draw-move", data);
      }
    });

    socket.on("draw-end", async (data) => {
      const { roomId } = socket;
      if (roomId) {
        io.to(roomId).emit("draw-end", data);
        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.drawingData.push({ type: "stroke", data });
            room.lastActivity = Date.now();
            await room.save();
            console.log(`Saved stroke to room ${roomId}`);
          }
        } catch (err) {
          console.error("Error saving draw-end:", err);
        }
      }
    });

    socket.on("clear-canvas", async () => {
      const { roomId } = socket;
      if (roomId) {
        io.to(roomId).emit("clear-canvas");
        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.drawingData = [];
            room.lastActivity = Date.now();
            await room.save();
          }
        } catch (err) {
          console.error("Error saving clear-canvas:", err);
        }
      }
    });

    socket.on("disconnect", () => {
      const { roomId } = socket;
      if (roomId && activeUsers[roomId]) {
        delete activeUsers[roomId][socket.id];
        if (Object.keys(activeUsers[roomId]).length === 0) {
          delete activeUsers[roomId];
        }
        io.to(roomId).emit("user-left", socket.id);
        io.to(roomId).emit(
          "user-count",
          Object.keys(activeUsers[roomId] || {}).length
        );
        io.to(roomId).emit("active-users", activeUsers[roomId] || {});
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;

// server/server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const roomRoutes = require("./routes/roomRoutes");
const cron = require("node-cron");
const Room = require("./models/Room");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Whiteboard Server Running");
});
app.use("/api/rooms", roomRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.error(err));

  cron.schedule("0 0 * * *", async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      const result = await Room.deleteMany({
        lastActivity: { $lt: twentyFourHoursAgo },
      });
      console.log(`Cleaned up ${result.deletedCount} old rooms.`);
    } catch (err) {
      console.error("Error cleaning up old rooms:", err);
    }
  });

  console.log(`Server running on port ${PORT}`);
});

const setupSocket = require("./socket");
setupSocket(io);

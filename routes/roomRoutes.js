// server/routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

const generateRoomCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    // 6 characters
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

router.post("/join", async (req, res) => {
  const { roomId: requestedRoomId } = req.body;
  let roomIdToUse = requestedRoomId;

  try {
    let room = await Room.findOne({ roomId: roomIdToUse });

    if (!room) {
      if (!roomIdToUse) {
        roomIdToUse = generateRoomCode();
      }

      room = new Room({
        roomId: roomIdToUse,
        drawingData: [],
      });
      await room.save();
      return res
        .status(201)
        .json({ message: "Room created successfully", room });
    } else {
      room.lastActivity = Date.now(); // Update last activity
      await room.save();
      return res.status(200).json({ message: "Joined existing room", room });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return null;
    }
    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

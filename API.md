# API Documentation

## Base URL

```
http://localhost:5000
```

## REST API Endpoints

### 1. Health Check

**GET** `/`

Returns server status.

**Response:**

```
Whiteboard Server Running
```

**Status Code:** `200`

---

### 2. Join/Create Room

**POST** `/api/rooms/join`

Creates a new room or joins an existing room.

**Request Body:**

```json
{
  "roomId": "ABC123"
}
```

**Parameters:**

- `roomId` (string, optional): 6-character room code. If not provided, a random code will be generated.

**Response Examples:**

**New Room Created:**

```json
{
  "message": "Room created successfully",
  "room": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "roomId": "ABC123",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "lastActivity": "2024-01-01T12:00:00.000Z",
    "drawingData": []
  }
}
```

**Joined Existing Room:**

```json
{
  "message": "Joined existing room",
  "room": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "roomId": "ABC123",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "lastActivity": "2024-01-01T12:00:00.000Z",
    "drawingData": [
      {
        "type": "stroke",
        "data": {
          "points": [
            { "x": 100, "y": 100 },
            { "x": 110, "y": 110 }
          ],
          "color": "#ff0000",
          "brushSize": 2
        },
        "timestamp": "2024-01-01T11:30:00.000Z"
      }
    ]
  }
}
```

**Status Codes:**

- `201` - Room created successfully
- `200` - Joined existing room
- `500` - Server error

---

### 3. Get Room Data

**GET** `/api/rooms/:roomId`

Retrieves room information and drawing data.

**Parameters:**

- `roomId` (string, required): 6-character room code

**Response:**

```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "roomId": "ABC123",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "lastActivity": "2024-01-01T12:00:00.000Z",
  "drawingData": [
    {
      "type": "stroke",
      "data": {
        "points": [
          { "x": 100, "y": 100 },
          { "x": 110, "y": 110 },
          { "x": 120, "y": 120 }
        ],
        "color": "#ff0000",
        "brushSize": 2
      },
      "timestamp": "2024-01-01T11:30:00.000Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Room found
- `404` - Room not found
- `500` - Server error

---

## Socket.IO Events

### Connection

**Connect to Socket.IO:**

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
});
```

---

### Client to Server Events

#### 1. Join Room

**Event:** `join-room`

**Data:**

```json
{
  "roomId": "ABC123"
}
```

**Description:** Join a specific room. The server will:

- Add the user to the room
- Send existing drawing data
- Notify other users about the new participant
- Update user count

---

#### 2. Cursor Movement

**Event:** `cursor-move`

**Data:**

```json
{
  "x": 150,
  "y": 200
}
```

**Description:** Update cursor position for other users to see.

---

#### 3. Start Drawing

**Event:** `draw-start`

**Data:**

```json
{
  "x": 100,
  "y": 100,
  "color": "#ff0000",
  "brushSize": 2
}
```

**Description:** Begin a new drawing stroke.

---

#### 4. Continue Drawing

**Event:** `draw-move`

**Data:**

```json
{
  "x": 110,
  "y": 110
}
```

**Description:** Continue the current drawing stroke.

---

#### 5. End Drawing

**Event:** `draw-end`

**Data:**

```json
{
  "points": [
    { "x": 100, "y": 100 },
    { "x": 110, "y": 110 },
    { "x": 120, "y": 120 }
  ],
  "color": "#ff0000",
  "brushSize": 2
}
```

**Description:** Complete the drawing stroke and save to database.

---

#### 6. Clear Canvas

**Event:** `clear-canvas`

**Data:** `{}`

**Description:** Clear the entire canvas for all users.

---

### Server to Client Events

#### 1. User Joined

**Event:** `user-joined`

**Data:**

```json
{
  "socketId": "socket_123456",
  "name": "User-1234"
}
```

**Description:** Notify when a new user joins the room.

---

#### 2. User Left

**Event:** `user-left`

**Data:**

```json
"socket_123456"
```

**Description:** Notify when a user leaves the room.

---

#### 3. User Count Update

**Event:** `user-count`

**Data:**

```json
3
```

**Description:** Update the number of active users in the room.

---

#### 4. Active Users

**Event:** `active-users`

**Data:**

```json
{
  "socket_123456": {
    "x": 150,
    "y": 200,
    "color": "#ff0000",
    "name": "User-1234"
  },
  "socket_789012": {
    "x": 300,
    "y": 250,
    "color": "#00ff00",
    "name": "User-7890"
  }
}
```

**Description:** List of all active users with their cursor positions and colors.

---

#### 5. Cursor Update

**Event:** `cursor-update`

**Data:**

```json
{
  "socketId": "socket_123456",
  "x": 160,
  "y": 210,
  "name": "User-1234"
}
```

**Description:** Update cursor position for a specific user.

---

#### 6. Drawing Events

**Event:** `draw-start`

**Data:**

```json
{
  "x": 100,
  "y": 100,
  "color": "#ff0000",
  "brushSize": 2
}
```

**Description:** Another user started drawing.

---

**Event:** `draw-move`

**Data:**

```json
{
  "x": 110,
  "y": 110
}
```

**Description:** Another user continued drawing.

---

**Event:** `draw-end`

**Data:**

```json
{
  "points": [
    { "x": 100, "y": 100 },
    { "x": 110, "y": 110 },
    { "x": 120, "y": 120 }
  ],
  "color": "#ff0000",
  "brushSize": 2
}
```

**Description:** Another user finished drawing.

---

#### 7. Clear Canvas

**Event:** `clear-canvas`

**Data:** `{}`

**Description:** Canvas was cleared by another user.

---

#### 8. Load Drawing

**Event:** `load-drawing`

**Data:**

```json
[
  {
    "type": "stroke",
    "data": {
      "points": [
        { "x": 100, "y": 100 },
        { "x": 110, "y": 110 }
      ],
      "color": "#ff0000",
      "brushSize": 2
    },
    "timestamp": "2024-01-01T11:30:00.000Z"
  }
]
```

**Description:** Load existing drawing data when joining a room.

---

## Complete Example

### Frontend Integration

```javascript
import io from "socket.io-client";

class CollaborativePaintClient {
  constructor(serverUrl) {
    this.socket = io(serverUrl);
    this.roomId = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Room events
    this.socket.on("user-joined", (data) => {
      console.log(`${data.name} joined the room`);
    });

    this.socket.on("user-left", (socketId) => {
      console.log(`User ${socketId} left the room`);
    });

    this.socket.on("user-count", (count) => {
      console.log(`Users in room: ${count}`);
    });

    this.socket.on("active-users", (users) => {
      console.log("Active users:", users);
    });

    // Drawing events
    this.socket.on("draw-start", (data) => {
      console.log("Drawing started:", data);
    });

    this.socket.on("draw-move", (data) => {
      console.log("Drawing moved:", data);
    });

    this.socket.on("draw-end", (data) => {
      console.log("Drawing ended:", data);
    });

    this.socket.on("clear-canvas", () => {
      console.log("Canvas cleared");
    });

    this.socket.on("load-drawing", (drawingData) => {
      console.log("Loading drawing:", drawingData);
    });
  }

  async joinRoom(roomId) {
    try {
      // First, join via REST API
      const response = await fetch(`/api/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
      });

      const result = await response.json();

      if (response.ok) {
        this.roomId = result.room.roomId;

        // Then join via Socket.IO
        this.socket.emit("join-room", { roomId: this.roomId });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  }

  startDrawing(x, y, color, brushSize) {
    this.socket.emit("draw-start", { x, y, color, brushSize });
  }

  continueDrawing(x, y) {
    this.socket.emit("draw-move", { x, y });
  }

  endDrawing(points, color, brushSize) {
    this.socket.emit("draw-end", { points, color, brushSize });
  }

  clearCanvas() {
    this.socket.emit("clear-canvas");
  }

  updateCursor(x, y) {
    this.socket.emit("cursor-move", { x, y });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const client = new CollaborativePaintClient("http://localhost:5000");

// Join a room
client.joinRoom("ABC123").then(() => {
  console.log("Joined room successfully");
});

// Drawing example
client.startDrawing(100, 100, "#ff0000", 2);
client.continueDrawing(110, 110);
client.endDrawing(
  [
    { x: 100, y: 100 },
    { x: 110, y: 110 },
  ],
  "#ff0000",
  2
);
```

## Error Handling

### Common Error Responses

**500 Internal Server Error:**

```json
{
  "error": "Server Error"
}
```

**404 Not Found:**

```json
{
  "error": "Room not found"
}
```

### Socket.IO Error Handling

```javascript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});
```

## Rate Limiting

Currently, the API does not implement rate limiting. For production use, consider implementing rate limiting using middleware like `express-rate-limit`.

## CORS Configuration

The server is configured to accept requests from the frontend URL specified in the `FRONTEND_URL` environment variable. For development, this is typically `http://localhost:3000`.

## Data Models

### Room Schema

```javascript
{
  roomId: String,           // 6-character unique room code
  createdAt: Date,          // Room creation timestamp
  lastActivity: Date,       // Last activity timestamp
  drawingData: [            // Array of drawing commands
    {
      type: String,         // "stroke"
      data: Object,         // Drawing data (points, color, brushSize)
      timestamp: Date       // Command timestamp
    }
  ]
}
```

### Drawing Command Schema

```javascript
{
  type: "stroke",           // Type of drawing command
  data: {
    points: [               // Array of coordinate points
      { x: Number, y: Number }
    ],
    color: String,          // Hex color code
    brushSize: Number       // Brush size in pixels
  },
  timestamp: Date           // When the command was created
}
```

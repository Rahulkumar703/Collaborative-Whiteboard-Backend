# Collaborative Paint Backend

A real-time collaborative whiteboard application backend built with Node.js, Express, Socket.IO, and MongoDB.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Architecture Overview](#architecture-overview)
- [Deployment Guide](#deployment-guide)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd collaborative-paint/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/collaborative-paint
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Database Setup**

   Ensure MongoDB is running on your system:

   ```bash
   # Start MongoDB (Linux/Mac)
   sudo systemctl start mongod

   # Or on Windows
   net start MongoDB
   ```

5. **Run the Application**

   **Development mode:**

   ```bash
   npm run dev
   ```

   **Production mode:**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000`

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (not implemented yet)

## API Documentation

### REST Endpoints

#### Base URL: `http://localhost:5000/api`

#### 1. Join/Create Room

**POST** `/rooms/join`

Creates a new room or joins an existing room.

**Request Body:**

```json
{
  "roomId": "ABC123" // Optional: If not provided, a random 6-character code will be generated
}
```

**Response:**

```json
{
  "message": "Room created successfully",
  "room": {
    "roomId": "ABC123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActivity": "2024-01-01T00:00:00.000Z",
    "drawingData": []
  }
}
```

**Status Codes:**

- `201` - Room created successfully
- `200` - Joined existing room
- `500` - Server error

#### 2. Get Room Data

**GET** `/rooms/:roomId`

Retrieves room information and drawing data.

**Response:**

```json
{
  "roomId": "ABC123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastActivity": "2024-01-01T00:00:00.000Z",
  "drawingData": [
    {
      "type": "stroke",
      "data": {
        "points": [...],
        "color": "#000000",
        "brushSize": 2
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Room found
- `404` - Room not found
- `500` - Server error

### Socket.IO Events

#### Client to Server Events

| Event          | Data                                                         | Description             |
| -------------- | ------------------------------------------------------------ | ----------------------- |
| `join-room`    | `{ roomId: string }`                                         | Join a specific room    |
| `cursor-move`  | `{ x: number, y: number }`                                   | Update cursor position  |
| `draw-start`   | `{ x: number, y: number, color: string, brushSize: number }` | Start drawing stroke    |
| `draw-move`    | `{ x: number, y: number }`                                   | Continue drawing stroke |
| `draw-end`     | `{ points: Array, color: string, brushSize: number }`        | End drawing stroke      |
| `clear-canvas` | `{}`                                                         | Clear the entire canvas |

#### Server to Client Events

| Event           | Data                                                         | Description                     |
| --------------- | ------------------------------------------------------------ | ------------------------------- |
| `user-joined`   | `{ socketId: string, name: string }`                         | New user joined the room        |
| `user-left`     | `socketId: string`                                           | User left the room              |
| `user-count`    | `number`                                                     | Updated number of users in room |
| `active-users`  | `{ [socketId]: { x, y, color, name } }`                      | All active users in room        |
| `cursor-update` | `{ socketId: string, x: number, y: number, name: string }`   | User cursor position update     |
| `draw-start`    | `{ x: number, y: number, color: string, brushSize: number }` | Drawing started                 |
| `draw-move`     | `{ x: number, y: number }`                                   | Drawing continued               |
| `draw-end`      | `{ points: Array, color: string, brushSize: number }`        | Drawing ended                   |
| `clear-canvas`  | `{}`                                                         | Canvas cleared                  |
| `load-drawing`  | `Array<DrawingCommand>`                                      | Load existing drawing data      |

### Socket.IO Connection Example

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000");

// Join a room
socket.emit("join-room", { roomId: "ABC123" });

// Listen for user joined
socket.on("user-joined", (data) => {
  console.log(`${data.name} joined the room`);
});

// Start drawing
socket.emit("draw-start", { x: 100, y: 100, color: "#ff0000", brushSize: 2 });

// Continue drawing
socket.emit("draw-move", { x: 110, y: 110 });

// End drawing
socket.emit("draw-end", {
  points: [
    { x: 100, y: 100 },
    { x: 110, y: 110 },
  ],
  color: "#ff0000",
  brushSize: 2,
});
```

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Socket.IO     │
                       │   (Real-time)   │
                       └─────────────────┘
```

### Backend Architecture

#### 1. **Server Layer** (`server.js`)

- Express.js HTTP server
- Socket.IO WebSocket server
- CORS configuration
- Environment variable management
- Database connection setup

#### 2. **API Layer** (`routes/roomRoutes.js`)

- RESTful endpoints for room management
- Room creation and joining logic
- Room data retrieval

#### 3. **Real-time Layer** (`socket/index.js`)

- WebSocket event handling
- Real-time drawing synchronization
- User presence management
- Drawing data persistence

#### 4. **Data Layer** (`models/Room.js`)

- MongoDB schema definitions
- Room and drawing data models
- Data validation and structure

### Data Flow

1. **Room Creation/Joining:**

   ```
   Client → REST API → Database → Response
   ```

2. **Real-time Drawing:**

   ```
   Client A → Socket.IO → Server → Socket.IO → Client B
   ```

3. **Data Persistence:**
   ```
   Drawing Event → Socket.IO → Database Save → Confirmation
   ```

### Key Features

- **Real-time Collaboration:** Multiple users can draw simultaneously
- **Room-based Sessions:** Isolated drawing sessions with unique room codes
- **Data Persistence:** Drawing data is saved to MongoDB
- **User Presence:** Track active users and their cursors
- **Automatic Cleanup:** Old rooms are automatically deleted after 24 hours
- **CORS Support:** Cross-origin requests enabled for frontend integration

## Deployment Guide

### Production Environment Setup

#### 1. **Environment Variables**

Create a production `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri/collaborative-paint
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

#### 2. **MongoDB Setup**

**Option A: MongoDB Atlas (Recommended)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and add to environment variables

**Option B: Self-hosted MongoDB**

```bash
# Install MongoDB on Ubuntu
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 3. **Server Deployment**

**Option A: Traditional VPS (Ubuntu/Debian)**

1. **Server Setup:**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2

   # Install MongoDB
   sudo apt install mongodb
   ```

2. **Application Deployment:**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd collaborative-paint/backend

   # Install dependencies
   npm install --production

   # Start with PM2
   pm2 start server.js --name "collaborative-paint-backend"
   pm2 startup
   pm2 save
   ```

**Option B: Docker Deployment**

1. **Create Dockerfile:**

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .

   EXPOSE 5000

   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml:**

   ```yaml
   version: "3.8"
   services:
     backend:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/collaborative-paint
         - FRONTEND_URL=https://your-frontend-domain.com
       depends_on:
         - mongo

     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db

   volumes:
     mongodb_data:
   ```

3. **Deploy with Docker:**
   ```bash
   docker-compose up -d
   ```

**Option C: Cloud Platforms**

**Heroku:**

```bash
# Install Heroku CLI
npm install -g heroku

# Login and deploy
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set FRONTEND_URL=your-frontend-url
git push heroku main
```

**Railway:**

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

**Render:**

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Configure environment variables

#### 4. **SSL/HTTPS Setup**

**Using Nginx as Reverse Proxy:**

1. **Install Nginx:**

   ```bash
   sudo apt install nginx
   ```

2. **Configure Nginx:**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable HTTPS with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

#### 5. **Monitoring and Logging**

**PM2 Monitoring:**

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs collaborative-paint-backend

# Restart application
pm2 restart collaborative-paint-backend
```

**Health Check Endpoint:**
The application includes a health check at `GET /` that returns "Whiteboard Server Running"

#### 6. **Performance Optimization**

1. **Enable Compression:**

   ```bash
   npm install compression
   ```

2. **Add to server.js:**

   ```javascript
   const compression = require("compression");
   app.use(compression());
   ```

3. **Database Indexing:**
   ```javascript
   // Add to Room model
   RoomSchema.index({ roomId: 1 });
   RoomSchema.index({ lastActivity: 1 });
   ```

#### 7. **Security Considerations**

1. **Environment Variables:** Never commit `.env` files
2. **CORS Configuration:** Restrict origins in production
3. **Rate Limiting:** Implement rate limiting for API endpoints
4. **Input Validation:** Validate all incoming data
5. **HTTPS:** Always use HTTPS in production

### Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection established
- [ ] Application starts successfully
- [ ] Socket.IO connections working
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled
- [ ] Monitoring and logging set up
- [ ] Health checks implemented
- [ ] Backup strategy in place
- [ ] Performance monitoring configured

### Troubleshooting

**Common Issues:**

1. **Socket.IO Connection Failed:**

   - Check CORS configuration
   - Verify frontend URL in environment variables
   - Ensure WebSocket support on server

2. **MongoDB Connection Error:**

   - Verify MongoDB URI
   - Check network connectivity
   - Ensure MongoDB service is running

3. **Port Already in Use:**

   - Change PORT in environment variables
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

4. **Memory Issues:**
   - Monitor with `pm2 monit`
   - Increase Node.js memory limit: `node --max-old-space-size=4096 server.js`

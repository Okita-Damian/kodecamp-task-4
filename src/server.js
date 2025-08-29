require("dotenv").config();
const http = require("http");
const app = require("./index"); // Express app instance
const connection = require("./config/db");
const { Server } = require("socket.io");
const { attachSocket } = require("./middlewares/socketMiddleware");

// Create server
const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Track connected users
const onlineUsers = {};

attachSocket(io, onlineUsers);

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("register", ({ userId }) => {
    if (!userId) return;
    onlineUsers[userId] = socket.id;
    socket.join(userId.toString());
  });

  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });
});

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connection();
    server.listen(port, () => {
      console.log(`🚀🚀 server running on port ${port} ....`);
    });
  } catch (error) {
    console.error("❌ Startup failed", error.message);
    process.exit(1);
  }
};

startServer();

// Export io and onlineUsers so index.js can use them
module.exports = { server, io, onlineUsers };

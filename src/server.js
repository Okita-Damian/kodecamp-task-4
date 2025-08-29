require("dotenv").config();
const http = require("http");
const app = require("./index"); // Express app instance
const connection = require("./config/db");
const { Server } = require("socket.io");
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

app.use((req, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // When user logs in/registers with their ID
  socket.on("register", ({ userId }) => {
    onlineUsers[userId] = socket.id;
    console.log(`🔗 User ${userId} registered with socket ${socket.id}`);
  });

  // On disconnect, remove user
  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Start server after DB connection
const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connection(); // connect to MongoDB
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port} ...`);
    });
  } catch (error) {
    console.error("❌ Startup Failed:", error.message);
    process.exit(1);
  }
};

startServer();

// Export so controllers can use them
module.exports = { server, io, onlineUsers };

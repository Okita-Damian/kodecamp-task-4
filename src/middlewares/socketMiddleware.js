// middlewares/socketMiddleware.js

let ioInstance;
let onlineUsersInstance;

/**
 * Call this function from server.js to inject io and onlineUsers
 */
const attachSocket = (io, onlineUsers) => {
  ioInstance = io;
  onlineUsersInstance = onlineUsers;
};

/**
 * Middleware to attach io and onlineUsers to req
 */
const socketMiddleware = (req, res, next) => {
  req.io = ioInstance;
  req.onlineUsers = onlineUsersInstance;
  next();
};

module.exports = { attachSocket, socketMiddleware };

// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const keyValue = err.keyValue || {};
    const field = Object.keys(keyValue)[0] || "field";
    const fieldValue = keyValue[field] || "unknown";
    message = `Duplicate value for '${field}': '${fieldValue}'. Please use a different value.`;
    statusCode = 400;
  }

  // Handle Mongoose validation errors safely
  if (err.name === "ValidationError") {
    const errors = err.errors || {};
    message = Object.values(errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  //  handle invalid ObjectId (CastError)
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Handle JWT errors (optional if you use JWT auth)
  else if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please log in again.";
    statusCode = 401;
  } else if (err.name === "TokenExpiredError") {
    message = "Your token has expired. Please log in again.";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

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

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // Handle invalid ObjectId (CastError)
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    message = err.details.map((d) => d.message).join(", ");
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    status: "error",
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

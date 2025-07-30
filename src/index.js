const express = require("express");
const app = express();

require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/appError");
const adminRoutes = require("./routes/adminRoutes");

app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);

app.use("/auth", adminRoutes);

// cath invalid routes
app.all("/*splat", (req, res, next) => {
  next(new AppError(`cant't find ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;

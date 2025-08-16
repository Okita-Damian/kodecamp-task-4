const express = require("express");
const app = express();

require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const brandRoutes = require("./routes/brandRoutes");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/appError");

app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/brands", brandRoutes);
app.use("/orders", orderRoutes);

// cath invalid routes
app.all("/*splat", (req, res, next) => {
  next(new AppError(`cant't find ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;

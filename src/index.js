const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const brandRoutes = require("./routes/brandRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/appError");

app.use(cors());
app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/brands", brandRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

// cath invalid routes
app.all("/*splat", (req, res, next) => {
  next(new AppError(`cant't find ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;

// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: [true, "Owner ID is required"],
    },
    cost: {
      type: Number,
      required: [true, "Product cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    productImages: {
      type: [String],
      validate: {
        validator: (arr) => arr.every((url) => typeof url === "string"),
        message: "Product images must be an array of image URLs",
      },
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    stockStatus: {
      type: String,
      enum: ["in-stock", "out-of-stock", "low-stock"],
      default: "in-stock",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

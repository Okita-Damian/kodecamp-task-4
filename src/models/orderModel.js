const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Product = require("../models/productModel");
const AppError = require("../utils/appError");

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  totalCost: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [orderItemSchema],
    shippingStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Auto-calculate item costs before saving
orderSchema.pre("save", async function (next) {
  try {
    for (let item of this.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new AppError("Product not found", 404);
      item.productName = product.productName;
      item.totalCost = item.quantity * product.cost;
    }
    next();
  } catch (err) {
    next(err);
  }
});

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", orderSchema);
